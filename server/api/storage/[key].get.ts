import { createError, getRouterParam } from 'h3';
import { createKvStoreRepository } from '../../repositories/kv-store.repository';

export default defineEventHandler((event) => {
  const key = getRouterParam(event, 'key');
  if (!key) throw createError({ statusCode: 400, statusMessage: 'key is required' });
  const repository = createKvStoreRepository();
  try {
    const row = repository.get(key);
    if (!row) {
      setResponseStatus(event, 404);
      return { value: null };
    }
    return { value: row.value };
  } finally {
    repository.close();
  }
});
