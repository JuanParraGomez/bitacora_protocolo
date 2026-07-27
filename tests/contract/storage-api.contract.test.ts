import { describe, expect, it } from 'vitest';

const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

async function request(path: string, init?: RequestInit) {
  return fetch(`${base}${path}`, init);
}

describe('storage API contract', () => {
  it('reports healthy storage', async () => {
    const response = await request('/api/health');
    expect([200, 503]).toContain(response.status);
    expect(await response.json()).toHaveProperty('ok');
  });

  it('returns null for an absent encoded key', async () => {
    const response = await request('/api/storage/test%2Fmissing');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ value: null });
  });

  it('writes and reads a string value', async () => {
    const key = `test:tdd:${Date.now()}`;
    const put = await request(`/api/storage/${encodeURIComponent(key)}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: '{"ok":true}' }),
    });
    expect(put.status).toBe(200);
    const get = await request(`/api/storage/${encodeURIComponent(key)}`);
    expect(await get.json()).toEqual({ value: '{"ok":true}' });
    const del = await request(`/api/storage/${encodeURIComponent(key)}`, { method: 'DELETE' });
    expect(del.status).toBe(204);
  });

  it.each([{}, { value: 1 }, { value: null }])('rejects malformed body %j', async (body) => {
    const response = await request('/api/storage/tdd-invalid', {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    expect(response.status).toBe(400);
  });
});
