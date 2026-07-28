import { describe, expect, it } from 'vitest';
import { deleteTask } from './task-deletion';

describe('task deletion service', () => {
  it('requires explicit confirmation and never deletes the permanent record', async () => {
    const values = new Map([['bitacora:t:one', '{}'], ['bitacora:r:one', '# record']]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async () => {}, delete: async (key: string) => { values.delete(key); } };
    await expect(deleteTask(storage, 'one')).rejects.toThrow(/confirm/i);
    await deleteTask(storage, 'one', { confirm: true });
    expect(values.has('bitacora:t:one')).toBe(false);
    expect(values.get('bitacora:r:one')).toBe('# record');
  });

  it('removes only the active entry from index and tolerates malformed index', async () => {
    const values = new Map([['bitacora:index', '{malformed'], ['bitacora:t:one', '{}'], ['bitacora:r:one', '# record']]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete(key: string) { values.delete(key); },
      async batch(operations: Array<{ key: string }>) {
        for (const operation of operations) {
          if (operation.key === 'bitacora:t:one') values.delete(operation.key);
          if (operation.key === 'bitacora:index') values.set(operation.key, JSON.stringify({ tareas: [], registros: [] }));
        }
      },
    };
    await deleteTask(storage, 'one', { confirm: true });
    expect(values.has('bitacora:t:one')).toBe(false);
    expect(values.get('bitacora:r:one')).toBe('# record');
  });
});
