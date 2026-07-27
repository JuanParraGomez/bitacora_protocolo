import { createError, getRouterParam, setResponseStatus } from 'h3';
import { createKvStoreRepository } from '../../repositories/kv-store.repository';

export default defineEventHandler((event) => {
  const key = getRouterParam(event, 'key');
  if (!key) throw createError({ statusCode: 400, statusMessage: 'key is required' });
  const repository = createKvStoreRepository();
  try {
    repository.delete(key);
    setResponseStatus(event, 204);
    return null;
  } finally {
    repository.close();
  }
});
