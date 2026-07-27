import { probeDatabase } from '../utils/database';

export default defineEventHandler((event) => {
  const storage = probeDatabase();
  setResponseStatus(event, storage ? 200 : 503);
  return { ok: storage, storage: storage ? 'available' : 'unavailable' };
});
