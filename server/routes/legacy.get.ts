import fs from 'node:fs';
import path from 'node:path';
import { sendStream } from 'h3';

function legacyFile() {
  return path.resolve(process.cwd(), 'bitacora-protocolo-analitico (2).html');
}

export default defineEventHandler((event) => {
  const file = legacyFile();
  if (!fs.existsSync(file)) {
    throw createError({ statusCode: 404, statusMessage: 'Legacy application is unavailable' });
  }
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8');
  return sendStream(event, fs.createReadStream(file));
});
