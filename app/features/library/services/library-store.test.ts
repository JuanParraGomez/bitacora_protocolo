import { describe, expect, it } from 'vitest';
import { createLibraryStore, sanitizeDownloadName } from './library-store';

describe('library service', () => {
  it('returns an empty list when the index has no records', async () => {
    const storage = { get: async () => '{"registros":[]}', set: async () => {}, delete: async () => {} };
    expect(await createLibraryStore(storage).list()).toEqual([]);
  });

  it('handles a missing record without throwing a server error', async () => {
    const storage = { get: async () => null, set: async () => {}, delete: async () => {} };
    expect(await createLibraryStore(storage).read('missing')).toBeNull();
  });

  it('sanitizes download names and reuses a record as a new task template', async () => {
    const values = new Map([
      ['bitacora:index', '{"registros":[{"id":"r1","titulo":"../../Mi registro: final","taskId":"t1","projectId":"project-a","resourceKind":"method","sourceTaskId":"t1","sourceMethodVersionId":"method-v1"},{"id":"r2","titulo":"Checklist operativo","taskId":"t2","projectId":"project-b","resourceKind":"tool","sourceTaskId":"t2"},{"id":"r3","titulo":"Clasificar tickets","taskId":"t3","projectId":"project-a","resourceKind":"automation-candidate","sourceTaskId":"t3","sourceMethodVersionId":"method-v2"}]}'],
      ['bitacora:r:r1', '# Registro'],
      ['bitacora:t:t1', '{"id":"t1","nombre":"Base","directiva":"Hazlo"}'],
    ]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async () => {}, delete: async () => {} };
    const store = createLibraryStore(storage);
    expect(sanitizeDownloadName('../../Mi registro: final')).toBe('mi-registro-final.md');
    expect((await store.read('r1'))?.markdown).toBe('# Registro');
    expect((await store.reuseTemplate('r1'))?.nombre).toBe('Base');
    expect(await store.list({
      query: 'clasificar',
      projectId: 'project-a',
      resourceKinds: ['automation-candidate'],
    })).toEqual([
      expect.objectContaining({
        id: 'r3',
        projectId: 'project-a',
        resourceKind: 'automation-candidate',
        sourceMethodVersionId: 'method-v2',
      }),
    ]);
  });

  it('returns null for missing records and preserves source metadata when reading summaries', async () => {
    const values = new Map([
      ['bitacora:index', '{"registros":[{"id":"r1","titulo":"Metodo fuente","taskId":"task-source","projectId":"project-a","resourceKind":"method","sourceTaskId":"task-source","sourceMethodVersionId":"method-v3"}]}'],
      ['bitacora:r:r1', '# Metodo fuente'],
    ]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async () => {}, delete: async () => {} };
    const store = createLibraryStore(storage);

    expect(await store.read('missing')).toBeNull();
    await expect(store.read('r1')).resolves.toEqual(expect.objectContaining({
      id: 'r1',
      projectId: 'project-a',
      resourceKind: 'method',
      sourceTaskId: 'task-source',
      sourceMethodVersionId: 'method-v3',
      markdown: '# Metodo fuente',
    }));
  });

  it('links a library record as a reference without overwriting confirmed task fields and stays idempotent', async () => {
    const task = {
      id: 'task-target',
      nombre: 'Resolver onboarding',
      projectId: 'project-b',
      f1: { resultadoDeseado: 'Reducir errores' },
    };
    const values = new Map<string, string>([
      ['bitacora:index', '{"registros":[{"id":"r1","titulo":"Metodo fuente","taskId":"task-source","projectId":"project-a","resourceKind":"method","sourceTaskId":"task-source","sourceMethodVersionId":"method-v1"}]}'],
      ['bitacora:r:r1', '# Metodo fuente'],
      ['bitacora:t:task-target', JSON.stringify(task)],
    ]);
    const storage = {
      get: async (key: string) => values.get(key) ?? null,
      set: async (key: string, value: string) => { values.set(key, value); },
      delete: async () => {},
    };
    const store = createLibraryStore(storage);

    await expect(store.linkRecordToTask('task-target', 'r1')).resolves.toEqual(expect.objectContaining({
      status: 'linked',
      referenceId: 'library-ref:r1',
      task: expect.objectContaining({
        libraryReferences: [
          expect.objectContaining({
            id: 'library-ref:r1',
            recordId: 'r1',
          }),
        ],
      }),
    }));
    await expect(store.linkRecordToTask('task-target', 'r1')).resolves.toEqual(expect.objectContaining({
      status: 'already-linked',
      referenceId: 'library-ref:r1',
    }));

    const persisted = JSON.parse(values.get('bitacora:t:task-target') ?? '{}') as {
      nombre?: string;
      f1?: { resultadoDeseado?: string };
      libraryReferences?: Array<Record<string, unknown>>;
    };
    expect(persisted.nombre).toBe('Resolver onboarding');
    expect(persisted.f1?.resultadoDeseado).toBe('Reducir errores');
    expect(persisted.libraryReferences).toEqual([
      expect.objectContaining({
        id: 'library-ref:r1',
        recordId: 'r1',
        title: 'Metodo fuente',
        resourceKind: 'method',
        sourceTaskId: 'task-source',
        sourceMethodVersionId: 'method-v1',
      }),
    ]);
  });

  it('reports link errors explicitly when the record or task cannot be persisted', async () => {
    const values = new Map<string, string>([
      ['bitacora:index', '{"registros":[{"id":"r1","titulo":"Metodo fuente","taskId":"task-source","projectId":"project-a","resourceKind":"method","sourceTaskId":"task-source","sourceMethodVersionId":"method-v1"}]}'],
    ]);
    const storage = {
      get: async (key: string) => values.get(key) ?? null,
      set: async () => { throw new Error('write failed'); },
      delete: async () => {},
    };
    const store = createLibraryStore(storage);

    await expect(store.linkRecordToTask('task-target', 'missing')).resolves.toEqual({
      status: 'error',
      reason: 'record-missing',
      referenceId: null,
      task: null,
    });
    await expect(store.linkRecordToTask('task-target', 'r1')).resolves.toEqual({
      status: 'error',
      reason: 'task-missing',
      referenceId: null,
      task: null,
    });
  });
});
