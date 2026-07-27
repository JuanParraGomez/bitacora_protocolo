import { STORAGE_KEYS, StorageCompatibilityError } from '../../../../shared/contracts/storage';
import type { Task } from '../domain/task.schema';
import { repairTask } from '../domain/task.schema';
import { repairAssistantState } from '../domain/task-assistant.schema';

export type StorageClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
};

export type TaskStore = {
  readRaw: (key: string) => Promise<string | null>;
  readIndex: () => Promise<unknown>;
  writeIndex: (index: unknown) => Promise<void>;
  readTask: (id: string) => Promise<unknown>;
  writeTask: (id: string, task: unknown) => Promise<void>;
  readRecord: (id: string) => Promise<string | null>;
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

export function createTaskStore(storage: StorageClient): TaskStore {
  const sanitizeTask = (raw: unknown, fallbackId: string) => {
    const payload = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
    const repairedAssistant = repairAssistantState(payload.assistant);
    return repairTask({ ...payload, id: (payload as Record<string, unknown>).id || fallbackId, assistant: repairedAssistant });
  };

  return {
    async readRaw(key) {
      try { return await storage.get(key); } catch (cause) { throw unavailable(cause); }
    },
    async readIndex() { const value = await this.readRaw(STORAGE_KEYS.index); return decodeJson(STORAGE_KEYS.index, value); },
    async writeIndex(index) {
      try { await storage.set(STORAGE_KEYS.index, JSON.stringify(index)); } catch (cause) { throw unavailable(cause); }
    },
    async readTask(id) {
      const key = STORAGE_KEYS.task(id);
      const parsed = decodeJson<Task>(key, await this.readRaw(key));
      return parsed === null ? null : sanitizeTask(parsed, id);
    },
    async writeTask(id, task) {
      try {
        const sanitized = sanitizeTask(task, id);
        await storage.set(STORAGE_KEYS.task(id), JSON.stringify(sanitized));
      } catch (cause) { throw unavailable(cause); }
    },
    async readRecord(id) { return this.readRaw(STORAGE_KEYS.record(id)); },
  };
}
