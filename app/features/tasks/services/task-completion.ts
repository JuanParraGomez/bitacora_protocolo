import { STORAGE_KEYS, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import { buildMarkdown } from '../domain/task-rules';
import { repairTask, taskIndexSchema, type Task, type TaskIndex } from '../domain/task.schema';

export type LegacyStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  batch?(operations: StorageBatchOperation[]): Promise<void>;
};

const FALLBACK_INDEX: TaskIndex = { tareas: [], registros: [] };

function normalizeProjectId(raw: unknown): string {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : 'legacy';
}

function parseIndex(raw: string | null): TaskIndex {
  if (!raw) return FALLBACK_INDEX;
  try {
    const parsed = JSON.parse(raw);
    const repaired = taskIndexSchema.safeParse(parsed);
    if (repaired.success) return repaired.data;
  } catch { /* preserve */ }

  return FALLBACK_INDEX;
}

function normalizeMethodVersions(task: Task): Task['methodVersions'] {
  return task.methodVersions.map((version) => ({ ...version }));
}

function normalizeTask(task: Task): Task {
  const methodVersions = normalizeMethodVersions(task);
  const repaired = repairTask({
    ...task,
    estado: 'completada',
    projectId: normalizeProjectId((task as { projectId?: unknown }).projectId),
  });
  return {
    ...repaired,
    projectId: normalizeProjectId(repaired.projectId),
    methodVersions,
  };
}

function buildNextIndex(task: Task, current: TaskIndex): TaskIndex {
  const projectId = normalizeProjectId((task as { projectId?: unknown }).projectId);
  const tareas = current.tareas.filter((item) => item.id !== task.id);
  const registros = [{
    id: task.id,
    titulo: task.f4.titulo || task.nombre,
    tareaId: task.id,
    taskId: task.id,
    projectId,
  }, ...current.registros.filter((record) => record.id !== task.id)];

  return {
    ...current,
    tareas,
    registros,
  };
}

async function runBatch(storage: LegacyStorage, operations: StorageBatchOperation[]): Promise<void> {
  if (storage.batch) {
    await storage.batch(operations);
    return;
  }

  for (const operation of operations) {
    if (operation.type === 'set') {
      await storage.set(operation.key, typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value ?? null));
      continue;
    }

    await storage.delete(operation.key);
  }
}

export async function completeTask(storage: LegacyStorage, task: Task): Promise<TaskIndex> {
  const normalizedTask = normalizeTask(task);
  const indexRaw = await storage.get(STORAGE_KEYS.index);
  const currentIndex = parseIndex(indexRaw);
  const nextIndex = buildNextIndex(normalizedTask, currentIndex);
  const serializedTask = JSON.stringify(normalizedTask);
  const recordMarkdown = buildMarkdown(normalizedTask);

  await runBatch(storage, [
    { type: 'set', key: STORAGE_KEYS.record(task.id), value: recordMarkdown },
    { type: 'set', key: STORAGE_KEYS.task(task.id), value: serializedTask },
    { type: 'set', key: STORAGE_KEYS.index, value: JSON.stringify(nextIndex) },
  ]);

  return nextIndex;
}
