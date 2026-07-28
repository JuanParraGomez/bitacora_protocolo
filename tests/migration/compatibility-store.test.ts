import { mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';
import { tmpdir } from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { KvStoreRepository } from '../../server/repositories/kv-store.repository';
import { repairTask } from '../../app/features/tasks/domain/task.schema';
import { deriveMethodMaturity } from '../../app/features/tasks/domain/task-rules';

const fixtureDatabases = ['bitacora', 'empty', 'interrupted', 'malformed', 'historical-pre-assistant', 'historical-custom-prompts', 'historical-assistant-secrets', 'two-projects', 'legacy-project', 'repeatable-v1', 'material-v2'].map((name) =>
  path.join(process.cwd(), 'tests/fixtures/legacy', `${name}.sqlite`),
);

const fixtureName = (fixturePath: string) => path.basename(fixturePath).replace('.sqlite', '');

describe('compatibility store migration', () => {
  beforeAll(() => {
    execFileSync(process.execPath, ['scripts/create-legacy-fixtures.mjs'], { cwd: process.cwd(), stdio: 'pipe' });
  });

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

  it('keeps empty and interrupted fixtures queryable while repairing missing keys', async () => {
    const { inspectLegacyDatabase } = await import('../../scripts/migration-service.mjs');
    const empty = await import('../../scripts/migration-service.mjs').then((module) => module.inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/empty.sqlite')));
    const interrupted = await import('../../scripts/migration-service.mjs').then((module) => module.inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/interrupted.sqlite')));

    expect(empty).toEqual(expect.any(Array));
    expect(empty.every((entry: { key: string }) => typeof entry.key === 'string')).toBe(true);
    expect(interrupted).toEqual(expect.any(Array));

    const malformedRows = inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/malformed.sqlite'));
    expect(malformedRows.find((entry: { key: string }) => entry.key === 'bitacora:index')?.value).toBe('{not-json');
  });

  it('repaints legacy pre-assistant tasks with schema-compatible assistant defaults', async () => {
    const { inspectLegacyDatabase } = await import('../../scripts/migration-service.mjs');
    const rows = inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/historical-pre-assistant.sqlite'));
    const taskRow = rows.find((entry: { key: string }) => entry.key === 'bitacora:t:legacy-pre-assistant');
    expect(taskRow).toBeDefined();

    const task = JSON.parse(taskRow?.value ?? '{}');
    const repaired = repairTask(task);
    expect(repaired.assistant).toMatchObject({
      schemaVersion: 1,
      messages: [],
      evaluations: [],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    });
  });

  it('repairs every historical task shape with assistant defaults and no data loss', async () => {
    const { inspectLegacyDatabase } = await import('../../scripts/migration-service.mjs');
    const historicalFixtures = fixtureDatabases.filter((fixture) => fixtureName(fixture).startsWith('historical-'));

    for (const fixture of historicalFixtures) {
      const rows = inspectLegacyDatabase(fixture);
      const taskRows = rows.filter((entry: { key: string }) => entry.key.startsWith('bitacora:t:'));
      expect(taskRows.length, fixtureName(fixture)).toBeGreaterThan(0);

      for (const row of taskRows) {
        const original = JSON.parse(row.value);
        const repaired = repairTask(original);
        expect(repaired.assistant).toMatchObject({
          schemaVersion: 1,
          messages: [],
          evaluations: [],
          settings: { connectionStatus: 'deferred', schemaVersion: 1 },
        });
        expect(JSON.stringify(repaired)).not.toContain('never-commit');
        expect(JSON.stringify(repaired)).not.toContain('never-token');
        if (original.f1?.promptOrientacion) expect(repaired.f1.promptOrientacion).toBe(original.f1.promptOrientacion);
        if (original.f2?.promptGuia) expect(repaired.f2.promptGuia).toBe(original.f2.promptGuia);
        if (original.f3?.promptEjecucion) expect(repaired.f3.promptEjecucion).toBe(original.f3.promptEjecucion);
        if (original.f4?.promptAar) expect(repaired.f4.promptAar).toBe(original.f4.promptAar);
      }
    }
  });

  it('round-trips schemaVersion 2 fixtures and preserves method maturity boundaries', async () => {
    const { inspectLegacyDatabase } = await import('../../scripts/migration-service.mjs');
    const fixtures = ['repeatable-v1', 'material-v2'] as const;

    for (const name of fixtures) {
      const rows = inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy', `${name}.sqlite`));
      const taskRow = rows.find((entry: { key: string }) => entry.key.startsWith('bitacora:t:'));
      expect(taskRow, name).toBeDefined();

      const parsed = JSON.parse(taskRow?.value ?? '{}');
      const repaired = repairTask(parsed);
      expect(repaired.schemaVersion, name).toBe(2);
      expect(repaired.projectId, name).toBe('legacy');
      expect(repairTask(repaired)).toEqual(repaired);
    }

    const repeatableRows = inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/repeatable-v1.sqlite'));
    const repeatableTask = repairTask(JSON.parse(
      repeatableRows.find((entry: { key: string }) => entry.key === 'bitacora:t:repeatable-v1-task')?.value ?? '{}',
    ));
    expect(deriveMethodMaturity(repeatableTask)).toBe('repeatable-method');

    const materialRows = inspectLegacyDatabase(path.join(process.cwd(), 'tests/fixtures/legacy/material-v2.sqlite'));
    const materialTask = repairTask(JSON.parse(
      materialRows.find((entry: { key: string }) => entry.key === 'bitacora:t:material-v2-task')?.value ?? '{}',
    ));
    expect(deriveMethodMaturity(materialTask)).toBe('documented-once');
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
