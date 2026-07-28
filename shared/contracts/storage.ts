export const STORAGE_KEYS = {
  index: 'bitacora:index',
  projects: 'bitacora:projects',
  task: (id: string) => `bitacora:t:${id}`,
  record: (id: string) => `bitacora:r:${id}`,
  assistanceSettings: 'bitacora:assistant-settings',
} as const;

export const BATCH_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@-]{0,199}$/;
export const BATCH_MAX_OPERATIONS = 50;

export type StorageBatchOperationType = 'set' | 'delete';

export type StorageBatchOperation = {
  type: StorageBatchOperationType;
  key: string;
  value?: unknown;
};

export type StorageBatchPayload = {
  operations: StorageBatchOperation[];
};

export const BATCH_ALLOWED_EXACT_KEYS = [
  STORAGE_KEYS.index,
  STORAGE_KEYS.projects,
  STORAGE_KEYS.assistanceSettings,
] as const;

export function isBatchAllowedKey(key: string): boolean {
  if (BATCH_ALLOWED_EXACT_KEYS.includes(key as (typeof BATCH_ALLOWED_EXACT_KEYS)[number])) return true;

  const taskMatch = key.startsWith('bitacora:t:');
  const recordMatch = key.startsWith('bitacora:r:');
  if (!taskMatch && !recordMatch) return false;

  const suffix = taskMatch ? key.slice('bitacora:t:'.length) : key.slice('bitacora:r:'.length);
  return BATCH_KEY_PATTERN.test(suffix);
}

export type StorageErrorCode = 'INVALID_BODY' | 'DATABASE_UNAVAILABLE' | 'INVALID_LEGACY_VALUE';

export class StorageCompatibilityError extends Error {
  constructor(public readonly code: StorageErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageCompatibilityError';
  }
}
