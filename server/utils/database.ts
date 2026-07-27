import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type DatabaseOptions = {
  dataDir?: string;
  dbPath?: string;
};

export function resolveDatabasePath(options: DatabaseOptions = {}): string {
  const dataDir = options.dataDir || process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  return options.dbPath || process.env.DB_PATH || path.join(dataDir, 'bitacora.sqlite');
}

export function openDatabase(options: DatabaseOptions = {}): Database.Database {
  const dbPath = resolveDatabasePath(options);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS kv_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

export function probeDatabase(options: DatabaseOptions = {}): boolean {
  try {
    const db = openDatabase(options);
    db.prepare('SELECT 1').get();
    db.close();
    return true;
  } catch {
    return false;
  }
}
