import { describe, expect, it } from 'vitest';
import { createBlankTask } from '../domain/task-rules';
import { completeTask } from './task-completion';

describe('task completion service', () => {
  it('writes a permanent Markdown record and preserves existing records', async () => {
    const values = new Map<string, string>([['bitacora:index', '{"tareas":[],"registros":[{"id":"old","titulo":"Old"}]}']]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); }, delete: async (key: string) => { values.delete(key); } };
    const task = createBlankTask('Nueva', 'Directiva');
    const result = await completeTask(storage, task);
    expect(values.get(`bitacora:r:${task.id}`)).toContain('# ');
    expect(result.registros).toHaveLength(2);
    expect(result.registros[1]?.id).toBe('old');
  });

  it('removes the completed task from active tasks while preserving its record index', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'done', nombre: 'Done' }], registros: [] })]]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); }, delete: async (key: string) => { values.delete(key); } };
    const task = { ...createBlankTask('Done', 'Directiva'), id: 'done' };
    const index = await completeTask(storage, task);
    expect(index.tareas.some(item => item.id === task.id)).toBe(false);
    expect(index.registros[0]?.id).toBe(task.id);
  });
});
