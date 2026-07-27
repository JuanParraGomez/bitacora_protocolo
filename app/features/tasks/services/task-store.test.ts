import { describe, expect, it } from 'vitest';
import { StorageCompatibilityError } from '../../../../shared/contracts/storage';

describe('task persistence service', () => {
  it.each(['bitacora:index', 'bitacora:t:abc', 'bitacora:r:abc'])('supports legacy key %s', async (key) => {
    const { createTaskStore } = await import('./task-store');
    const values = new Map<string, string>();
    const storage = { get: async (k: string) => values.get(k) ?? null, set: async (k: string, v: string) => { values.set(k, v); }, delete: async (k: string) => { values.delete(k); } };
    const store = createTaskStore(storage);
    if (key.endsWith(':index')) await store.writeIndex({ tareas: [] });
    else if (key.includes(':t:')) await store.writeTask('abc', { id: 'abc' });
    else await storage.set(key, '# registro');
    expect(values.has(key)).toBe(true);
  });

  it('preserves malformed legacy strings for diagnosis', async () => {
    const { createTaskStore } = await import('./task-store');
    const storage = { get: async () => '{bad', set: async () => {}, delete: async () => {} };
    const store = createTaskStore(storage);
    await expect(store.readIndex()).rejects.toMatchObject({ code: 'INVALID_LEGACY_VALUE' });
    expect(await store.readRaw('bitacora:index')).toBe('{bad');
  });

  it('maps storage failures to retryable errors', async () => {
    const { createTaskStore } = await import('./task-store');
    const storage = { get: async () => { throw new Error('offline'); }, set: async () => { throw new Error('offline'); }, delete: async () => {} };
    const store = createTaskStore(storage);
    await expect(store.readIndex()).rejects.toBeInstanceOf(StorageCompatibilityError);
    await expect(store.writeIndex({})).rejects.toMatchObject({ code: 'DATABASE_UNAVAILABLE' });
  });

  it('reads a default deferred Codex assistance preference when no global settings exist', async () => {
    const { createTaskStore } = await import('./task-store');
    const values = new Map<string, string>();
    const storage = { get: async (k: string) => values.get(k) ?? null, set: async (k: string, v: string) => { values.set(k, v); }, delete: async (k: string) => { values.delete(k); } };
    const store = createTaskStore(storage);

    await expect(store.readAssistanceSettings()).resolves.toEqual({
      mode: 'codex',
      connectionStatus: 'deferred',
      schemaVersion: 1,
    });
  });

  it.each(['codex', 'deepseek'] as const)('persists the %s assistance preference globally without credentials', async (mode) => {
    const { createTaskStore } = await import('./task-store');
    const { STORAGE_KEYS } = await import('../../../../shared/contracts/storage');
    const values = new Map<string, string>();
    const storage = { get: async (k: string) => values.get(k) ?? null, set: async (k: string, v: string) => { values.set(k, v); }, delete: async (k: string) => { values.delete(k); } };
    const store = createTaskStore(storage);

    await store.writeAssistanceSettings({ mode, connectionStatus: 'deferred', schemaVersion: 1 });

    expect(values.has(STORAGE_KEYS.assistanceSettings)).toBe(true);
    await expect(store.readAssistanceSettings()).resolves.toEqual({
      mode,
      connectionStatus: 'deferred',
      schemaVersion: 1,
    });
  });

  it('repairs malformed global assistance settings back to the safe deferred default', async () => {
    const { createTaskStore } = await import('./task-store');
    const { STORAGE_KEYS } = await import('../../../../shared/contracts/storage');
    const values = new Map<string, string>([
      [STORAGE_KEYS.assistanceSettings, JSON.stringify({ mode: 'azure', connectionStatus: 'online', schemaVersion: 99 })],
    ]);
    const storage = { get: async (k: string) => values.get(k) ?? null, set: async (k: string, v: string) => { values.set(k, v); }, delete: async (k: string) => { values.delete(k); } };
    const store = createTaskStore(storage);

    await expect(store.readAssistanceSettings()).resolves.toEqual({
      mode: 'codex',
      connectionStatus: 'deferred',
      schemaVersion: 1,
    });
  });

  it('rejects secret-like fields when writing the global assistance preference', async () => {
    const { createTaskStore } = await import('./task-store');
    const { STORAGE_KEYS } = await import('../../../../shared/contracts/storage');
    const values = new Map<string, string>();
    const storage = { get: async (k: string) => values.get(k) ?? null, set: async (k: string, v: string) => { values.set(k, v); }, delete: async (k: string) => { values.delete(k); } };
    const store = createTaskStore(storage);

    await store.writeAssistanceSettings({
      mode: 'deepseek',
      connectionStatus: 'deferred',
      schemaVersion: 1,
      apiKey: 'do-not-store',
      token: 'also-secret',
    });

    const raw = values.get(STORAGE_KEYS.assistanceSettings) || '';
    expect(raw).not.toContain('do-not-store');
    expect(raw).not.toContain('also-secret');
    expect(JSON.parse(raw)).toEqual({ mode: 'deepseek', connectionStatus: 'deferred', schemaVersion: 1 });
  });
});
