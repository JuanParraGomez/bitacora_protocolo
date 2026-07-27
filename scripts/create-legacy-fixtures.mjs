import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const root = path.resolve(process.cwd(), 'tests/fixtures/legacy');
fs.mkdirSync(root, { recursive: true });

function create(name, rows = []) {
  const file = path.join(root, name);
  fs.rmSync(file, { force: true });
  const db = new Database(file);
  db.exec('CREATE TABLE kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const insert = db.prepare('INSERT INTO kv_store (key, value) VALUES (?, ?)');
  for (const [key, value] of rows) insert.run(key, value);
  db.close();
}

create('bitacora.sqlite', [['bitacora:index', JSON.stringify({ tareas: [], registros: [] })]]);
create('empty.sqlite');
create('malformed.sqlite', [['bitacora:index', '{not-json']]);
create('interrupted.sqlite', [['bitacora:index', JSON.stringify({ tareas: [], registros: [] })]]);
create('historical-pre-assistant.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-pre-assistant', nombre: 'Legacy sin asistente', fase: 1, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-pre-assistant', JSON.stringify({
    id: 'legacy-pre-assistant', nombre: 'Legacy sin asistente', directiva: 'Conservar datos', fase: 1, estado: 'activa', tipo: 'protocolo',
    f1: { linaje: [{ origen: 'brief', resultado: 'mapa' }], promptOrientacion: 'Prompt legacy', promptOrientacionPersonalizado: true },
  })],
]);
create('historical-custom-prompts.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-prompts', nombre: 'Legacy prompts', fase: 4, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-prompts', JSON.stringify({
    id: 'legacy-prompts', nombre: 'Legacy prompts', directiva: 'Prompts editados', fase: 4, estado: 'activa', tipo: 'protocolo',
    f1: { promptOrientacion: 'Orientación manual', promptOrientacionPersonalizado: true },
    f2: { promptGuia: 'Guía manual', promptGuiaPersonalizado: true },
    f3: { promptEjecucion: 'Ejecución manual', promptEjecucionPersonalizado: true },
    f4: { promptAar: 'AAR manual', promptAarPersonalizado: true, aar: [{ pred: 'P', observado: 'O', causa: 'C', mia: true }] },
  })],
]);
create('historical-assistant-secrets.sqlite', [
  ['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-secret-assistant', nombre: 'Legacy secretos', fase: 2, estado: 'activa', tipo: 'protocolo' }], registros: [] })],
  ['bitacora:t:legacy-secret-assistant', JSON.stringify({
    id: 'legacy-secret-assistant', nombre: 'Legacy secretos', directiva: 'Limpiar asistente', fase: 2, estado: 'activa', tipo: 'protocolo',
    assistant: { schemaVersion: 99, messages: [], evaluations: [], settings: { mode: 'deepseek', connectionStatus: 'deferred', schemaVersion: 99, apiKey: 'never-commit', token: 'never-token' } },
  })],
]);
