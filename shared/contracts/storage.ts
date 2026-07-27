export const STORAGE_KEYS = {
  index: 'bitacora:index',
  task: (id: string) => `bitacora:t:${id}`,
  record: (id: string) => `bitacora:r:${id}`,
  assistanceSettings: 'bitacora:assistant-settings',
} as const;

export type StorageErrorCode = 'INVALID_BODY' | 'DATABASE_UNAVAILABLE' | 'INVALID_LEGACY_VALUE';

export class StorageCompatibilityError extends Error {
  constructor(public readonly code: StorageErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'StorageCompatibilityError';
  }
}
