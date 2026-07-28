import { describe, expect, it } from 'vitest';

import { StorageCompatibilityError } from '../../../../shared/contracts/storage';
import { createProjectStore } from './project-store';

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
});
