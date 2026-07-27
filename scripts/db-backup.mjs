import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function checksum(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

export async function backupDatabase(sourcePath, destinationDir) {
  if (!fs.existsSync(sourcePath)) throw new Error(`Database not found: ${sourcePath}`);
  fs.mkdirSync(destinationDir, { recursive: true });
  const destination = path.join(destinationDir, path.basename(sourcePath));
  const source = new Database(sourcePath, { readonly: true });
  await source.backup(destination);
  source.close();
  const db = new Database(destination, { readonly: true });
  const rowCount = db.prepare('SELECT COUNT(*) AS count FROM kv_store').get().count;
  const keys = db.prepare('SELECT key, value FROM kv_store ORDER BY key').all();
  db.close();
  const manifest = {
    source: sourcePath,
    destination,
    rowCount,
    keyChecksum: crypto.createHash('sha256').update(JSON.stringify(keys)).digest('hex'),
    fileChecksum: checksum(destination),
  };
  fs.writeFileSync(`${destination}.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const source = process.env.DB_PATH || path.resolve(process.cwd(), 'data/bitacora.sqlite');
  const destination = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');
  console.log(JSON.stringify(await backupDatabase(source, destination), null, 2));
}
