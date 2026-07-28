import { describe, expect, it } from 'vitest';
import { runStorageBatch } from '../../server/api/storage/batch.post';

const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

function request(path: string, init?: RequestInit) {
  return fetch(`${base}${path}`, init);
}

function randomToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readValue(key: string) {
  const response = await request(`/api/storage/${encodeURIComponent(key)}`);
  if (response.status === 404) return null;
  return await response.json() as { value: string | null };
}

async function deleteValue(key: string) {
  const response = await request(`/api/storage/${encodeURIComponent(key)}`, { method: 'DELETE' });
  return response.status;
}

describe('storage batch API contract', () => {
  it('writes and deletes keys atomically on happy path', async () => {
    const taskKey = `bitacora:t:${randomToken()}`;
    const recordKey = `bitacora:r:${randomToken()}`;
    const indexKey = 'bitacora:index';

    await deleteValue(taskKey);
    await deleteValue(recordKey);
    await deleteValue(indexKey);

    const response = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operations: [
          { type: 'set', key: indexKey, value: { tareas: [], registros: [] } },
          { type: 'set', key: taskKey, value: { id: taskKey.split(':').at(-1), fase: 1, nombre: 'Batch', directiva: 'prueba', estado: 'activa', tipo: 'protocolo' } },
          { type: 'set', key: recordKey, value: '# done' },
        ],
      }),
    });
    const payload = await response.json() as { ok: boolean; applied?: number };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.applied).toBe(3);

    await expect(readValue(taskKey)).resolves.toMatchObject({ value: expect.any(String) });
    await expect(readValue(recordKey)).resolves.toMatchObject({ value: '# done' });
    await expect(readValue(indexKey)).resolves.toMatchObject({ value: '{"tareas":[],"registros":[]}' });

    await deleteValue(taskKey);
    await deleteValue(recordKey);
    await deleteValue(indexKey);
  });

  it('accepts empty suffix, max suffix and all allowed punctuation', async () => {
    const response = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operations: [
          { type: 'set', key: 'bitacora:t:a', value: 1 },
          { type: 'set', key: `bitacora:t:${'x'.repeat(200)}`, value: 2 },
          { type: 'set', key: 'bitacora:t:a_b.:-@c', value: 3 },
        ],
      }),
    });
    expect(response.status).toBe(200);
    const payload = await response.json() as { ok: boolean; applied?: number };
    expect(payload.ok).toBe(true);
    expect(payload.applied).toBe(3);
  });

  it('rejects malformed payload: missing/empty and oversized batches', async () => {
    const missing = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(missing.status).toBe(400);

    const empty = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operations: [] }),
    });
    expect(empty.status).toBe(400);

    const oversized = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operations: Array.from({ length: 51 }, (_, index) => ({
          type: 'set',
          key: `bitacora:t:oversize-${index}`,
          value: index,
        })),
      }),
    });
    expect(oversized.status).toBe(400);
  });

  it('rejects duplicate keys in the same batch', async () => {
    const response = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operations: [
          { type: 'set', key: 'bitacora:t:dup', value: 1 },
          { type: 'set', key: 'bitacora:t:dup', value: 2 },
        ],
      }),
    });
    expect(response.status).toBe(400);
  });

  it('rejects forbidden keys and malformed suffixes', async () => {
    const checks = [
      'bitacora:settings',
      'bitacora:t:',
      'bitacora:r:',
      'bitacora:t:.leading',
      'bitacora:t:has space',
      'bitacora:t:slash/char',
      'bitacora:r:unicode-😀',
      'bitacora:r:control-\u0001',
    ];

    await Promise.all(checks.map(async (key) => {
      const response = await request('/api/storage/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ operations: [{ type: 'set', key, value: 1 }] }),
      });
      expect(response.status).toBe(400);
    }));
  });

  it('does not apply partial writes when the whole request is rejected', async () => {
    const existing = `bitacora:r:${randomToken()}`;
    await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operations: [{ type: 'set', key: existing, value: 'before' }] }),
    });

    const before = await readValue(existing);
    expect(before?.value).toBe('before');

    const response = await request('/api/storage/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operations: [
          { type: 'set', key: existing, value: 'before' },
          { type: 'delete', key: existing, value: undefined },
          { type: 'set', key: 'bitacora:r:dup', value: 'candidate' },
          { type: 'set', key: 'bitacora:r:dup', value: 'candidate-2' },
        ],
      }),
    });

    expect(response.status).toBe(400);
    await expect(readValue(existing)).resolves.toMatchObject({ value: 'before' });
    await expect(readValue('bitacora:r:dup')).resolves.toBeNull();
  });

  it('returns 500 when the repository execution fails and preserves prior state', async () => {
    const snapshot = new Map<string, string>([
      ['bitacora:index', '{"tareas":[]}'],
      ['bitacora:t:locked', '{"id":"locked"}'],
      ['bitacora:r:kept', 'before'],
    ]);
    const repository = {
      executeBatch: (operations: Array<{ type: string; key: string; value?: unknown }>) => {
        const staged = new Map(snapshot);
        for (const operation of operations) {
          if (operation.type === 'set') {
            staged.set(
              operation.key,
              typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value),
            );
            continue;
          }
          staged.delete(operation.key);
        }
        throw new Error('repository unavailable');
      },
      close: () => {},
    };

    await expect(runStorageBatch({
      operations: [
        { type: 'set', key: 'bitacora:index', value: { tareas: [], registros: [] } },
        { type: 'set', key: `bitacora:t:${randomToken()}`, value: { id: 'next' } },
        { type: 'set', key: `bitacora:r:${randomToken()}`, value: 'tmp' },
        { type: 'delete', key: 'bitacora:r:kept' },
      ],
    }, () => repository)).rejects.toMatchObject({ statusCode: 500 });

    expect(snapshot.get('bitacora:index')).toBe('{"tareas":[]}');
    expect(snapshot.get('bitacora:t:locked')).toBe('{"id":"locked"}');
    expect(snapshot.get('bitacora:r:kept')).toBe('before');
  });
});
