import { STORAGE_KEYS, StorageCompatibilityError, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import { repairAssistantState, type AssistanceSettings } from '../domain/task-assistant.schema';
import { repairTask, taskIndexSchema, type Task, type TaskIndex } from '../domain/task.schema';

export type StorageClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  batch?(operations: StorageBatchOperation[]): Promise<void>;
};

export type TaskStore = {
  readRaw: (key: string) => Promise<string | null>;
  readIndex: () => Promise<TaskIndex>;
  writeIndex: (index: unknown) => Promise<void>;
  readTask: (id: string) => Promise<unknown>;
  writeTask: (id: string, task: unknown) => Promise<void>;
  readRecord: (id: string) => Promise<string | null>;
  readAssistanceSettings: () => Promise<AssistanceSettings>;
  writeAssistanceSettings: (settings: unknown) => Promise<void>;
};

function decodeJson<T>(key: string, value: string | null): T | null {
  if (value === null) return null;
  try {
    return JSON.parse(value) as T;
  } catch (cause) {
    throw new StorageCompatibilityError('INVALID_LEGACY_VALUE', `Invalid JSON in ${key}`, { cause });
  }
}

function unavailable(cause: unknown): StorageCompatibilityError {
  return new StorageCompatibilityError('DATABASE_UNAVAILABLE', 'Legacy storage is unavailable; retry the operation.', { cause });
}

function sanitizeAssistanceSettings(raw: unknown): AssistanceSettings {
  const settings = repairAssistantState({ settings: raw }).settings;
  return { ...settings, schemaVersion: 1 };
}

function parseIndexRecord(record: unknown): Record<string, unknown> {
  if (!record || typeof record !== 'object') return {};
  return record as Record<string, unknown>;
}

function normalizeTaskId(raw: unknown, fallbackId: string) {
  return typeof raw === 'string' && raw.length > 0 ? raw : fallbackId;
}

function normalizeProjectId(raw: unknown): string {
  return typeof raw === 'string' && raw.length > 0 ? raw : 'legacy';
}

function normalizeTaskPayload(raw: unknown, fallbackId: string) {
  const source = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
  const repairedTask = repairTask({
    ...source,
    id: normalizeTaskId(source.id, fallbackId),
  });
  return {
    ...repairedTask,
    projectId: normalizeProjectId(repairedTask.projectId),
  };
}

function normalizeIndex(raw: unknown): TaskIndex {
  if (raw === null) {
    return taskIndexSchema.parse({ tareas: [], registros: [] });
  }

  const candidate = taskIndexSchema.safeParse(raw);
  if (!candidate.success) {
    return taskIndexSchema.parse({ tareas: [], registros: [] });
  }

  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const rawTareas = Array.isArray(source.tareas) ? source.tareas : [];
  const rawRecords = Array.isArray(source.registros) ? source.registros : [];
  const tareas = candidate.data.tareas.map((task, index) => {
    const sourceTask = parseIndexRecord(rawTareas[index]);
    const hasExplicitProject = typeof sourceTask.projectId === 'string' && sourceTask.projectId.length > 0;
    if (hasExplicitProject) return task;
    const { projectId: _omit, ...transportTask } = task as Record<string, unknown> as { projectId?: string };
    return transportTask;
  });
  const registros = candidate.data.registros.map((record, index) => {
    const sourceRecord = parseIndexRecord(rawRecords[index]);
    const hasExplicitProject = typeof sourceRecord.projectId === 'string' && sourceRecord.projectId.length > 0;
    if (hasExplicitProject) return record;
    const { projectId: _omit, ...transportRecord } = record as Record<string, unknown> as { projectId?: string };
    return transportRecord;
  });

  return {
    ...candidate.data,
    tareas,
    registros,
  } as TaskIndex;
}

function mapStorageFailure(cause: unknown): StorageCompatibilityError {
  return unavailable(cause);
}

export function createTaskStore(storage: StorageClient): TaskStore {
  return {
    async readRaw(key) {
      try {
        return await storage.get(key);
      } catch (cause) {
        throw mapStorageFailure(cause);
      }
    },
    async readIndex() {
      const value = await this.readRaw(STORAGE_KEYS.index);
      return normalizeIndex(value === null ? null : decodeJson(STORAGE_KEYS.index, value));
    },
    async writeIndex(index) {
      const normalized = normalizeIndex(index);
      try {
        await storage.set(STORAGE_KEYS.index, JSON.stringify(normalized));
      } catch (cause) {
        throw unavailable(cause);
      }
    },
    async readTask(id) {
      const key = STORAGE_KEYS.task(id);
      const parsed = decodeJson<Task>(key, await this.readRaw(key));
      return parsed === null ? null : normalizeTaskPayload(parsed, id);
    },
    async writeTask(id, task) {
      try {
        const sanitized = normalizeTaskPayload(task, id);
        const serialized = JSON.stringify(sanitized);
        await storage.set(STORAGE_KEYS.task(id), serialized);
      } catch (cause) {
        throw unavailable(cause);
      }
    },
    async readRecord(id) { return this.readRaw(STORAGE_KEYS.record(id)); },
    async readAssistanceSettings() {
      const value = await this.readRaw(STORAGE_KEYS.assistanceSettings);
      const parsed = decodeJson<unknown>(STORAGE_KEYS.assistanceSettings, value);
      return sanitizeAssistanceSettings(parsed);
    },
    async writeAssistanceSettings(settings) {
      try {
        const sanitized = sanitizeAssistanceSettings(settings);
        const serialized = JSON.stringify(sanitized);
        await storage.set(STORAGE_KEYS.assistanceSettings, serialized);
      } catch (cause) {
        throw unavailable(cause);
      }
    },
  };
}
