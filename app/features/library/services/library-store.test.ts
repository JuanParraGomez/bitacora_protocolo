import { describe, expect, it } from 'vitest';
import { createLibraryStore, sanitizeDownloadName } from './library-store';

describe('library service', () => {
  it('returns an empty list when the index has no records', async () => {
    const storage = { get: async () => '{"registros":[]}', set: async () => {}, delete: async () => {} };
    expect(await createLibraryStore(storage).list()).toEqual([]);
  });

  it('handles a missing record without throwing a server error', async () => {
    const storage = { get: async () => null, set: async () => {}, delete: async () => {} };
    expect(await createLibraryStore(storage).read('missing')).toBeNull();
  });

  it('sanitizes download names and reuses a record as a new task template', async () => {
    const values = new Map([
      ['bitacora:index', '{"registros":[{"id":"r1","titulo":"../../Mi registro: final","taskId":"t1"}]}'],
      ['bitacora:r:r1', '# Registro'],
      ['bitacora:t:t1', '{"id":"t1","nombre":"Base","directiva":"Hazlo"}'],
    ]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async () => {}, delete: async () => {} };
    const store = createLibraryStore(storage);
    expect(sanitizeDownloadName('../../Mi registro: final')).toBe('mi-registro-final.md');
    expect((await store.read('r1'))?.markdown).toBe('# Registro');
    expect((await store.reuseTemplate('r1'))?.nombre).toBe('Base');
  });
});
