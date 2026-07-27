import { createError, getRouterParam, readBody } from 'h3';
import { storageValueSchema } from '../../../shared/schemas/storage';
import { createKvStoreRepository } from '../../repositories/kv-store.repository';

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');
  const parsed = storageValueSchema.safeParse(await readBody(event));
  if (!key || !parsed.success) throw createError({ statusCode: 400, statusMessage: 'value must be a string' });
  const repository = createKvStoreRepository();
  try {
    repository.set(key, parsed.data.value);
    return { ok: true as const };
  } finally {
    repository.close();
  }
});
