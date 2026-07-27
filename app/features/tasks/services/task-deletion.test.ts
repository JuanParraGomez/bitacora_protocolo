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
});
