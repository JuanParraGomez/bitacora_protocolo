import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { checksum } from './db-backup.mjs';

export function verifyBackup(databasePath, manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (checksum(databasePath) !== manifest.fileChecksum) {
    throw new Error('Backup checksum mismatch');
  }
  const db = new Database(databasePath, { readonly: true });
  const rowCount = db.prepare('SELECT COUNT(*) AS count FROM kv_store').get().count;
  db.close();
  if (rowCount !== manifest.rowCount) throw new Error('Backup row count mismatch');
  return { ok: true, rowCount };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const databasePath = process.argv[2];
  const manifestPath = process.argv[3] || `${databasePath}.manifest.json`;
  console.log(JSON.stringify(verifyBackup(databasePath, manifestPath)));
}
