import path from 'node:path';
import Database from 'better-sqlite3';

export function checkDatabase(databasePath = process.env.DB_PATH || path.resolve(process.cwd(), 'data/bitacora.sqlite')) {
  const db = new Database(databasePath, { readonly: true });
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'kv_store'").get();
  const rows = table ? db.prepare('SELECT COUNT(*) AS count FROM kv_store').get().count : 0;
  db.close();
  if (!table) throw new Error('kv_store table is missing');
  return { ok: true, rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(checkDatabase()));
}
