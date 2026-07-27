import { STORAGE_KEYS } from '../../../../shared/contracts/storage';
import { buildMarkdown } from '../domain/task-rules';
import type { Task, TaskIndex } from '../domain/task.schema';

export type LegacyStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

export async function completeTask(storage: LegacyStorage, task: Task): Promise<TaskIndex> {
  await storage.set(STORAGE_KEYS.record(task.id), buildMarkdown({ ...task, estado: 'completada' }));
  let index: TaskIndex = { tareas: [], registros: [] };
  const raw = await storage.get(STORAGE_KEYS.index);
  if (raw) {
    try { index = JSON.parse(raw) as TaskIndex; } catch { /* preserve the malformed source; write a safe index only after record */ }
  }
  const registros = Array.isArray(index.registros) ? index.registros : [];
  const next: TaskIndex = {
    ...index,
    tareas: (Array.isArray(index.tareas) ? index.tareas : []).filter(item => item.id !== task.id),
    registros: [{ id: task.id, titulo: task.f4.titulo || task.nombre, tareaId: task.id }, ...registros.filter(record => record.id !== task.id)],
  };
  await storage.set(STORAGE_KEYS.index, JSON.stringify(next));
  return next;
}
