import { STORAGE_KEYS, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import { taskIndexSchema } from '../domain/task.schema';

export type LegacyStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  batch?(operations: StorageBatchOperation[]): Promise<void>;
};

const FALLBACK_INDEX = { tareas: [], registros: [] };

type TaskIndex = {
  tareas: Array<{ id: string }>;
  registros: Array<{ id: string; titulo?: string; tareaId?: string; projectId?: string }>;
};

function parseIndex(raw: string | null): TaskIndex {
  if (!raw) return { ...FALLBACK_INDEX };
  try {
    const parsed = JSON.parse(raw);
    const repaired = taskIndexSchema.safeParse(parsed);
    if (repaired.success) return repaired.data;
  } catch {
    /* ignore and fallback */
  }
  return { ...FALLBACK_INDEX };
}

function buildNextIndex(taskId: string, current: TaskIndex): TaskIndex {
  return {
    ...current,
    tareas: current.tareas.filter((item) => item.id !== taskId),
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

export async function deleteTask(storage: LegacyStorage, id: string, options: { confirm?: boolean } = {}): Promise<void> {
  if (!options.confirm) throw new Error('Deletion requires explicit confirmation');

  const indexRaw = await storage.get(STORAGE_KEYS.index);
  const currentIndex = parseIndex(indexRaw);
  const nextIndex = buildNextIndex(id, currentIndex);

  await runBatch(storage, [
    { type: 'delete', key: STORAGE_KEYS.task(id) },
    { type: 'set', key: STORAGE_KEYS.index, value: JSON.stringify(nextIndex) },
  ]);
}
