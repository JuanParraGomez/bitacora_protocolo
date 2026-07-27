import fs from 'node:fs';
import Database from 'better-sqlite3';

export function inspectLegacyDatabase(databasePath) {
  if (!fs.existsSync(databasePath)) throw new Error('Legacy database is missing');
  const db = new Database(databasePath, { readonly: true });
  const rows = db.prepare('SELECT key, value, updated_at AS updatedAt FROM kv_store ORDER BY key').all();
  db.close();
  return rows.map((row) => ({ ...row, json: safeJson(row.value) }));
}

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

export function assertNonDestructiveMigration(before, after) {
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Migration changed legacy values');
  return true;
}
