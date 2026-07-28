import { describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS, StorageCompatibilityError, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import { createProjectStore } from './project-store';

type StoredValues = Map<string, string>;

function persistedProject(id: string, overrides: Partial<{
  name: string;
  status: 'active' | 'archived';
  lastActiveTaskId: string | null;
  createdAt: number;
  updatedAt: number;
}> = {}) {
  return {
    id,
    name: overrides.name ?? id,
    description: '',
    status: overrides.status ?? 'active',
    lastActiveTaskId: overrides.lastActiveTaskId ?? null,
    createdAt: overrides.createdAt ?? 1,
    updatedAt: overrides.updatedAt ?? 1,
  };
}

function atomicStorage(values: StoredValues, options: { failNextBatch?: boolean } = {}) {
  let failNextBatch = options.failNextBatch ?? false;
  const set = vi.fn(async (key: string, value: string) => {
    values.set(key, value);
  });
  const deleteValue = vi.fn(async (key: string) => {
    values.delete(key);
  });
  const batch = vi.fn(async (operations: StorageBatchOperation[]) => {
    const staged = new Map(values);
    for (const operation of operations) {
      if (operation.type === 'set') {
        staged.set(operation.key, typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value));
      }
      if (operation.type === 'delete') staged.delete(operation.key);
    }
    if (failNextBatch) {
      failNextBatch = false;
      throw new Error('batch failed before commit');
    }
    values.clear();
    for (const [key, value] of staged) values.set(key, value);
  });

  return {
    storage: {
      async get(key: string) { return values.get(key) ?? null; },
      set,
      delete: deleteValue,
      batch,
    },
    set,
    deleteValue,
    batch,
  };
}

describe('project store', () => {
  it('synthesizes legacy projects when collection is missing', async () => {
    const values = new Map<string, string>();
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    const collection = await store.ensureLegacyProject();
    expect(collection.projects.some((project) => project.id === 'legacy')).toBe(true);
    expect(collection.activeProjectId).toBe('legacy');
  });

  it('creates and persists a new project', async () => {
    const values = new Map<string, string>();
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    const collection = await store.ensureLegacyProject();
    await store.createProject({ name: 'Proyecto nuevo', description: 'desc', status: 'active', lastActiveTaskId: null });
    expect(collection.projects.length).toBeGreaterThan(0);
    expect(values.size).toBeGreaterThan(0);
  });

  it('renames an existing project without breaking invariants', async () => {
    const values = new Map<string, string>();
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    await store.ensureLegacyProject();
    const renamed = await store.renameProject('legacy', 'Nuevo nombre');
    expect(renamed.name).toBe('Nuevo nombre');
  });

  it('archives a project and leaves it in collection', async () => {
    const values = new Map<string, string>();
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    await store.ensureLegacyProject();
    const result = await store.archiveProject('legacy');
    expect(result.projects.find((project) => project.id === 'legacy')?.status).toBe('archived');
  });

  it('repairs invalid active task references in legacy when task ids are unavailable', async () => {
    const values = new Map<string, string>([
      ['bitacora:projects', JSON.stringify({
        schemaVersion: 1,
        activeProjectId: 'p1',
        projects: [
          { id: 'p1', name: 'P1', description: '', status: 'active', lastActiveTaskId: 'missing-task', createdAt: 1, updatedAt: 2 },
        ],
      })],
    ]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    const collection = await store.readProjects(new Set(['existing-task']));
    expect(collection.projects[0].lastActiveTaskId).toBeNull();
  });

  it('maps storage failures to compatibility errors', async () => {
    const storage = {
      async get() { throw new Error('offline'); },
      async set() { throw new Error('offline'); },
      async delete() { throw new Error('offline'); },
    };
    const store = createProjectStore(storage);
    await expect(store.readProjects()).rejects.toBeInstanceOf(StorageCompatibilityError);
    await expect(store.writeProjects({ schemaVersion: 1, projects: [], activeProjectId: null })).rejects.toBeInstanceOf(StorageCompatibilityError);
  });

  it('sets an active task id only for valid project ids', async () => {
    const values = new Map<string, string>([
      ['bitacora:projects', JSON.stringify({
        schemaVersion: 1,
        activeProjectId: 'missing',
        projects: [
          { id: 'legacy', name: 'Legacy', description: '', status: 'active', lastActiveTaskId: 'old', createdAt: 1, updatedAt: 2 },
        ],
      })],
    ]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    const collection = await store.setProjectActiveTask('legacy', 'new-task');
    expect(collection.projects[0]?.lastActiveTaskId).toBe('new-task');
  });

  it('renames and archives existing project without disturbing active project', async () => {
    const values = new Map<string, string>([
      ['bitacora:projects', JSON.stringify({
        schemaVersion: 1,
        activeProjectId: 'p1',
        projects: [
          { id: 'p1', name: 'Proyecto', description: '', status: 'active', lastActiveTaskId: null, createdAt: 1, updatedAt: 2 },
          { id: 'p2', name: 'Para archivar', description: '', status: 'active', lastActiveTaskId: null, createdAt: 3, updatedAt: 4 },
        ],
      })],
    ]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const store = createProjectStore(storage);
    const renamed = await store.renameProject('p1', 'Proyecto principal');
    const archived = await store.archiveProject('p2');
    expect(renamed?.name).toBe('Proyecto principal');
    expect(archived.projects.find((project) => project.id === 'p2')?.status).toBe('archived');
    expect(archived.activeProjectId).toBe('p1');
  });

  describe('atomic task movement', () => {
    it('moves the task, index membership and both project activity references in one batch', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('move-me'), JSON.stringify({
          id: 'move-me',
          nombre: 'Mover',
          projectId: 'source',
          preserved: { note: 'do not discard task fields' },
        })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [
            { id: 'move-me', nombre: 'Mover', fase: 2, estado: 'pausada', tipo: 'general', projectId: 'source' },
            { id: 'source-other', nombre: 'Otra', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' },
            { id: 'destination-old', nombre: 'Destino', fase: 3, estado: 'activa', tipo: 'general', projectId: 'destination' },
          ],
          registros: [
            { id: 'record-source', titulo: 'Registro', tareaId: 'record-source', taskId: 'record-source', projectId: 'source' },
          ],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [
            persistedProject('source', { lastActiveTaskId: 'move-me' }),
            persistedProject('destination', { lastActiveTaskId: 'destination-old' }),
          ],
        })],
      ]);
      const harness = atomicStorage(values);
      const store = createProjectStore(harness.storage);

      await store.moveTask('move-me', 'destination');

      expect(harness.batch).toHaveBeenCalledTimes(1);
      const operations = harness.batch.mock.calls[0]?.[0] ?? [];
      expect(operations).toHaveLength(3);
      expect(operations.map((operation) => operation.key)).toEqual([
        STORAGE_KEYS.task('move-me'),
        STORAGE_KEYS.index,
        STORAGE_KEYS.projects,
      ]);
      expect(new Set(operations.map((operation) => operation.key)).size).toBe(3);
      expect(harness.set).not.toHaveBeenCalled();
      expect(harness.deleteValue).not.toHaveBeenCalled();

      const movedTask = JSON.parse(values.get(STORAGE_KEYS.task('move-me')) ?? '{}');
      const movedIndex = JSON.parse(values.get(STORAGE_KEYS.index) ?? '{}');
      const movedProjects = JSON.parse(values.get(STORAGE_KEYS.projects) ?? '{}');
      expect(movedTask).toMatchObject({
        id: 'move-me',
        projectId: 'destination',
        preserved: { note: 'do not discard task fields' },
      });
      expect(movedIndex.tareas.find((task: { id: string }) => task.id === 'move-me')).toMatchObject({
        id: 'move-me',
        estado: 'pausada',
        projectId: 'destination',
      });
      expect(movedIndex.tareas.find((task: { id: string }) => task.id === 'source-other')).toMatchObject({
        projectId: 'source',
      });
      expect(movedIndex.registros).toEqual([
        expect.objectContaining({ id: 'record-source', projectId: 'source' }),
      ]);
      expect(movedProjects.projects.find((item: { id: string }) => item.id === 'source')?.lastActiveTaskId).toBeNull();
      expect(movedProjects.projects.find((item: { id: string }) => item.id === 'destination')?.lastActiveTaskId).toBe('move-me');
    });

    it('rolls back all three keys when batch fails and succeeds on a later retry', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('recoverable'), JSON.stringify({ id: 'recoverable', nombre: 'Recuperable', projectId: 'source' })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [{ id: 'recoverable', nombre: 'Recuperable', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' }],
          registros: [],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [
            persistedProject('source', { lastActiveTaskId: 'recoverable' }),
            persistedProject('destination'),
          ],
        })],
      ]);
      const beforeFailure = new Map(values);
      const harness = atomicStorage(values, { failNextBatch: true });
      const store = createProjectStore(harness.storage);

      await expect(store.moveTask('recoverable', 'destination')).rejects.toBeInstanceOf(StorageCompatibilityError);
      expect(values).toEqual(beforeFailure);
      expect(harness.set).not.toHaveBeenCalled();
      expect(harness.deleteValue).not.toHaveBeenCalled();

      await expect(store.moveTask('recoverable', 'destination')).resolves.toBeDefined();
      expect(JSON.parse(values.get(STORAGE_KEYS.task('recoverable')) ?? '{}')).toMatchObject({
        id: 'recoverable',
        projectId: 'destination',
      });
      expect(harness.batch).toHaveBeenCalledTimes(2);
    });

    it('repairs lastActiveTaskId by project membership rather than global task existence', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('moving'), JSON.stringify({ id: 'moving', nombre: 'Mover', projectId: 'source' })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [
            { id: 'moving', nombre: 'Mover', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' },
            { id: 'source-task', nombre: 'Origen', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' },
            { id: 'destination-task', nombre: 'Destino', fase: 1, estado: 'activa', tipo: 'general', projectId: 'destination' },
          ],
          registros: [],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [
            persistedProject('source', { lastActiveTaskId: 'destination-task' }),
            persistedProject('destination', { lastActiveTaskId: 'source-task' }),
            persistedProject('unrelated', { lastActiveTaskId: 'destination-task' }),
          ],
        })],
      ]);
      const harness = atomicStorage(values);
      const store = createProjectStore(harness.storage);

      await store.moveTask('moving', 'destination');

      const collection = JSON.parse(values.get(STORAGE_KEYS.projects) ?? '{}') as {
        projects: Array<{ id: string; lastActiveTaskId: string | null }>;
      };
      expect(collection.projects.find((item) => item.id === 'source')?.lastActiveTaskId).toBeNull();
      expect(collection.projects.find((item) => item.id === 'destination')?.lastActiveTaskId).toBe('moving');
      expect(collection.projects.find((item) => item.id === 'unrelated')?.lastActiveTaskId).toBeNull();
    });

    it('rejects missing tasks and missing or archived destinations without mutating storage', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('existing'), JSON.stringify({ id: 'existing', nombre: 'Existente', projectId: 'source' })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [{ id: 'existing', nombre: 'Existente', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' }],
          registros: [],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [
            persistedProject('source', { lastActiveTaskId: 'existing' }),
            persistedProject('archived', { status: 'archived' }),
          ],
        })],
      ]);
      const initial = new Map(values);
      const harness = atomicStorage(values);
      const store = createProjectStore(harness.storage);

      await expect(store.moveTask('', 'source')).rejects.toThrow();
      await expect(store.moveTask('missing', 'source')).rejects.toThrow();
      await expect(store.moveTask('existing', '')).rejects.toThrow();
      await expect(store.moveTask('existing', 'missing-project')).rejects.toThrow();
      await expect(store.moveTask('existing', 'archived')).rejects.toThrow();

      expect(values).toEqual(initial);
      expect(harness.batch).not.toHaveBeenCalled();
      expect(harness.set).not.toHaveBeenCalled();
      expect(harness.deleteValue).not.toHaveBeenCalled();
    });

    it('treats moving to the current project as an idempotent no-op', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('same'), JSON.stringify({ id: 'same', nombre: 'Misma', projectId: 'source' })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [{ id: 'same', nombre: 'Misma', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' }],
          registros: [],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [persistedProject('source', { lastActiveTaskId: 'same' })],
        })],
      ]);
      const initial = new Map(values);
      const harness = atomicStorage(values);
      const store = createProjectStore(harness.storage);

      await expect(store.moveTask('same', 'source')).resolves.toBeDefined();

      expect(values).toEqual(initial);
      expect(harness.batch).not.toHaveBeenCalled();
      expect(harness.set).not.toHaveBeenCalled();
    });

    it('refuses a multi-key move when atomic batch support is unavailable', async () => {
      const values = new Map<string, string>([
        [STORAGE_KEYS.task('requires-batch'), JSON.stringify({ id: 'requires-batch', nombre: 'Atómica', projectId: 'source' })],
        [STORAGE_KEYS.index, JSON.stringify({
          tareas: [{ id: 'requires-batch', nombre: 'Atómica', fase: 1, estado: 'activa', tipo: 'general', projectId: 'source' }],
          registros: [],
        })],
        [STORAGE_KEYS.projects, JSON.stringify({
          schemaVersion: 1,
          activeProjectId: 'source',
          projects: [persistedProject('source'), persistedProject('destination')],
        })],
      ]);
      const initial = new Map(values);
      const set = vi.fn(async (key: string, value: string) => values.set(key, value));
      const store = createProjectStore({
        async get(key: string) { return values.get(key) ?? null; },
        set,
        async delete(key: string) { values.delete(key); },
      });

      await expect(store.moveTask('requires-batch', 'destination')).rejects.toBeInstanceOf(StorageCompatibilityError);
      expect(values).toEqual(initial);
      expect(set).not.toHaveBeenCalled();
    });
  });
});
