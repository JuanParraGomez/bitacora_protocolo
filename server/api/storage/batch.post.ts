import { createError, defineEventHandler, readBody } from 'h3';

import {
  BATCH_MAX_OPERATIONS,
  isBatchAllowedKey,
  type StorageBatchOperation,
  type StorageBatchPayload,
} from '../../../shared/contracts/storage';
import { storageBatchSchema } from '../../../shared/schemas/storage';
import { createKvStoreRepository } from '../../repositories/kv-store.repository';

type StorageBatchRepository = {
  executeBatch(operations: StorageBatchOperation[]): void | Promise<void>;
  close?: () => void;
};

export async function runStorageBatch(
  body: unknown,
  createRepository: () => StorageBatchRepository = createKvStoreRepository,
): Promise<{ ok: true; applied: number }> {
  const parsed = storageBatchSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Request body must be a valid storage batch.' });
  }

  const requestedOperations = (parsed.data as StorageBatchPayload).operations;
  if (requestedOperations.length > BATCH_MAX_OPERATIONS || requestedOperations.length === 0) {
    throw createError({ statusCode: 400, statusMessage: `batch operations must be between 1 and ${BATCH_MAX_OPERATIONS}.` });
  }

  const keys = requestedOperations.map((operation) => operation.key);
  const uniqueKeys = new Set(keys);
  if (uniqueKeys.size !== keys.length) {
    throw createError({ statusCode: 400, statusMessage: 'Duplicate keys are not allowed in one batch.' });
  }

  for (const key of keys) {
    if (!isBatchAllowedKey(key)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid storage key.' });
    }
  }

  const operations: StorageBatchOperation[] = requestedOperations.map((operation) => ({
    ...operation,
    value: operation.type === 'set'
      ? (typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value))
      : undefined,
  }));

  const repository = createRepository();
  try {
    repository.executeBatch(operations);
    return { ok: true as const, applied: operations.length };
  } catch (cause) {
    throw createError({ statusCode: 500, statusMessage: 'The storage batch operation failed atomically.', cause });
  } finally {
    repository.close?.();
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return runStorageBatch(body);
});
