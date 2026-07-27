import { mkdtempSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { KvStoreRepository } from '../../server/repositories/kv-store.repository';

const fixtureDatabases = ['bitacora', 'empty', 'interrupted', 'malformed'].map((name) =>
  path.join(process.cwd(), 'tests/fixtures/legacy', `${name}.sqlite`),
);

const fixtureName = (fixturePath: string) => path.basename(fixturePath).replace('.sqlite', '');

describe('compatibility store migration', () => {
  it('reads fixture databases and keeps legacy rows queryable', async () => {
    const { inspectLegacyDatabase } = await import('../../scripts/migration-service.mjs');

    await Promise.all(fixtureDatabases.map(async (fixture) => {
      const rows = inspectLegacyDatabase(fixture);
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.every(row => typeof row.key === 'string')).toBe(true);
      expect(rows.every(row => typeof row.value === 'string')).toBe(true);
      if (fixtureName(fixture) !== 'empty') {
        expect(rows.some(row => row.key === 'bitacora:index')).toBe(true);
      }
    }));
  });

  it('preserves malformed legacy JSON as-is and keeps compatibility checks non-destructive', async () => {
    const { inspectLegacyDatabase, assertNonDestructiveMigration } = await import('../../scripts/migration-service.mjs');
    const fixture = path.join(process.cwd(), 'tests/fixtures/legacy/malformed.sqlite');
    const rows = inspectLegacyDatabase(fixture);
    const clone = rows.map((row) => ({ ...row }));
    expect(rows[0].json).toBeNull();
    expect(() => assertNonDestructiveMigration(rows, clone)).not.toThrow();
  });

  it('preserves assistant-shaped payloads in legacy snapshots', async () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'bitacora-compat-'));
    const dbPath = path.join(tempDir, 'legacy-with-assistant.sqlite');
    const db = new Database(dbPath);
    db.exec('CREATE TABLE kv_store (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    const insert = db.prepare('INSERT INTO kv_store (key, value) VALUES (?, ?)');

    const legacyTask = {
      id: 'compat-task',
      nombre: 'Compat',
      directiva: 'Compatibilidad',
      fase: 2,
      estado: 'activa',
      tipo: 'protocolo',
      created: 1_720_000_000_000,
      f1: { promptOrientacion: 'Prompt legado', promptOrientacionPersonalizado: true },
      assistant: {
        schemaVersion: 99,
        messages: [{ id: 'm-1', taskId: 'compat-task', phase: 1, role: 'assistant', parts: [{ type: 'text', text: 'legacy assistant' }], status: 'sent', createdAt: 1, updates: [] }],
        evaluations: [],
        settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 99, secret: 'do-not-migrate' },
      },
    };
    insert.run('bitacora:t:compat-task', JSON.stringify(legacyTask));
    insert.run('bitacora:index', JSON.stringify({ tareas: [{ id: 'compat-task', nombre: 'Compat', fase: 2, estado: 'activa', tipo: 'protocolo' }], registros: [] }));
    db.close();

    const { inspectLegacyDatabase, assertNonDestructiveMigration } = await import('../../scripts/migration-service.mjs');
    const rows = inspectLegacyDatabase(dbPath);

    const taskRow = rows.find((entry: { key: string; value: string }) => entry.key === 'bitacora:t:compat-task');
    expect(taskRow).toBeDefined();
    expect(taskRow?.value).toContain('schemaVersion');
    expect(taskRow?.value).toContain('do-not-migrate');

    const roundtrip = rows.map((row) => ({ ...row }));
    expect(assertNonDestructiveMigration(rows, roundtrip)).toBe(true);
  });

  it('upserts, timestamps, deletes, and commits compatible legacy values transactionally', () => {
    const dataDir = mkdtempSync(path.join(tmpdir(), 'bitacora-repository-'));
    const repository = new KvStoreRepository({ dataDir });
    try {
      repository.set('bitacora:index', '{"tareas":[]}');
      const first = repository.get('bitacora:index');
      expect(first?.value).toBe('{"tareas":[]}');
      expect(first?.updatedAt).toBeTruthy();
      repository.transaction(() => repository.set('bitacora:index', '{"tareas":[1]}'));
      expect(repository.get('bitacora:index')?.value).toContain('[1]');
      repository.delete('bitacora:index');
      expect(repository.get('bitacora:index')).toBeNull();
    } finally { repository.close(); }
  });
});
