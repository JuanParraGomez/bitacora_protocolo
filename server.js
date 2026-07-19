import express from 'express';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dbPath = process.env.DB_PATH || path.join(dataDir, 'bitacora.sqlite');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const getValue = db.prepare('SELECT value FROM kv_store WHERE key = ?');
const setValue = db.prepare(`
  INSERT INTO kv_store (key, value, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP
`);
const deleteValue = db.prepare('DELETE FROM kv_store WHERE key = ?');

app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'bitacora-protocolo-analitico (2).html'
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/storage/:key', (req, res) => {
  const row = getValue.get(req.params.key);
  if (!row) return res.status(404).json({ value: null });
  res.json({ value: row.value });
});

app.put('/api/storage/:key', (req, res) => {
  if (typeof req.body?.value !== 'string') {
    return res.status(400).json({ error: 'value must be a string' });
  }
  setValue.run(req.params.key, req.body.value);
  res.json({ ok: true });
});

app.delete('/api/storage/:key', (req, res) => {
  deleteValue.run(req.params.key);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Bitacora running on http://0.0.0.0:${port}`);
});
