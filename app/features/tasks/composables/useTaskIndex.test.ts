import { afterEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '../../../../shared/contracts/storage';
import { useTaskIndex } from './useTaskIndex';

vi.mock('~/shared/contracts/storage', () => ({
  STORAGE_KEYS: {
    index: 'bitacora:index',
    projects: 'bitacora:projects',
  },
}));

type StorageResponse = { value: string | null };

function storageUrl(key: string) {
  return `/api/storage/${encodeURIComponent(key)}`;
}

function project(
  id: string,
  overrides: Partial<{
    name: string;
    description: string;
    status: 'active' | 'archived';
    lastActiveTaskId: string | null;
    createdAt: number;
    updatedAt: number;
  }> = {},
) {
  return {
    id,
    name: overrides.name ?? id,
    description: overrides.description ?? '',
    status: overrides.status ?? 'active',
    lastActiveTaskId: overrides.lastActiveTaskId ?? null,
    createdAt: overrides.createdAt ?? 1,
    updatedAt: overrides.updatedAt ?? 1,
  };
}

function stubStorage(values: Record<string, unknown>) {
  const fetchMock = vi.fn(async (url: string): Promise<StorageResponse> => {
    const entry = Object.entries(values).find(([key]) => storageUrl(key) === url);
    return { value: entry ? JSON.stringify(entry[1]) : null };
  });
  vi.stubGlobal('$fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTaskIndex project-aware grouping', () => {
  it('groups active, paused and completed tasks under their canonical projects', async () => {
    const fetchMock = stubStorage({
      [STORAGE_KEYS.projects]: {
        schemaVersion: 1,
        activeProjectId: 'p-one',
        projects: [
          project('p-one', { name: 'Proyecto uno', lastActiveTaskId: 'active-one' }),
          project('p-two', { name: 'Proyecto dos', lastActiveTaskId: 'paused-two' }),
        ],
      },
      [STORAGE_KEYS.index]: {
        tareas: [
          { id: 'active-one', nombre: 'Activa uno', fase: 1, estado: 'activa', tipo: 'general', projectId: 'p-one' },
          { id: 'paused-one', nombre: 'Pausada uno', fase: 2, estado: 'pausada', tipo: 'general', projectId: 'p-one' },
          { id: 'done-one', nombre: 'Completa uno', fase: 4, estado: 'completada', tipo: 'general', projectId: 'p-one' },
          { id: 'paused-two', nombre: 'Pausada dos', fase: 3, estado: 'pausada', tipo: 'general', projectId: 'p-two' },
        ],
        registros: [
          { id: 'record-one', titulo: 'Registro uno', tareaId: 'record-one', taskId: 'record-one', projectId: 'p-one' },
        ],
      },
    });

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();

    expect(fetchMock).toHaveBeenCalledWith(storageUrl(STORAGE_KEYS.index));
    expect(fetchMock).toHaveBeenCalledWith(storageUrl(STORAGE_KEYS.projects));
    expect(taskIndex.projectGroups.value.map((group) => group.project.id)).toEqual(['p-one', 'p-two']);
    expect(taskIndex.projectGroups.value[0]).toMatchObject({
      project: { id: 'p-one', name: 'Proyecto uno', status: 'active' },
      activeTasks: [{ id: 'active-one' }],
      pausedTasks: [{ id: 'paused-one' }],
      completedTasks: [{ id: 'done-one' }],
      completedItems: [{ id: 'record-one' }],
      isEmpty: false,
    });
    expect(taskIndex.projectGroups.value[1]).toMatchObject({
      project: { id: 'p-two' },
      activeTasks: [],
      pausedTasks: [{ id: 'paused-two' }],
      completedTasks: [],
      completedItems: [],
      isEmpty: false,
    });
  });

  it('keeps archived and empty projects visible without leaking tasks across groups', async () => {
    stubStorage({
      [STORAGE_KEYS.projects]: {
        schemaVersion: 1,
        activeProjectId: 'empty',
        projects: [
          project('empty', { name: 'Vacío' }),
          project('archived', { name: 'Archivado', status: 'archived', lastActiveTaskId: 'archived-task' }),
        ],
      },
      [STORAGE_KEYS.index]: {
        tareas: [
          { id: 'archived-task', nombre: 'Conservar', fase: 2, estado: 'activa', tipo: 'general', projectId: 'archived' },
        ],
        registros: [],
      },
    });

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();

    expect(taskIndex.projectGroups.value).toHaveLength(2);
    expect(taskIndex.projectGroups.value.find((group) => group.project.id === 'empty')).toMatchObject({
      activeTasks: [],
      pausedTasks: [],
      completedTasks: [],
      completedItems: [],
      isEmpty: true,
    });
    expect(taskIndex.projectGroups.value.find((group) => group.project.id === 'archived')).toMatchObject({
      project: { status: 'archived' },
      activeTasks: [{ id: 'archived-task' }],
      isEmpty: false,
    });
    expect(taskIndex.activeProjectGroups.value.map((group) => group.project.id)).toEqual(['empty']);
    expect(taskIndex.archivedProjectGroups.value.map((group) => group.project.id)).toEqual(['archived']);
  });

  it('puts legacy tasks and records without projectId in the synthetic legacy project', async () => {
    stubStorage({
      [STORAGE_KEYS.projects]: {
        schemaVersion: 1,
        activeProjectId: 'p-one',
        projects: [project('p-one', { name: 'Proyecto uno' })],
      },
      [STORAGE_KEYS.index]: {
        tareas: [
          { id: 'legacy-active', nombre: 'Anterior', fase: 1, estado: 'activa', tipo: 'protocolo' },
          { id: 'legacy-paused', nombre: 'Anterior pausada', fase: 2, estado: 'pausada', tipo: 'protocolo', projectId: '' },
        ],
        registros: [
          { id: 'legacy-record', titulo: 'Registro anterior', tareaId: 'legacy-record' },
        ],
      },
    });

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();

    const legacy = taskIndex.projectGroups.value.find((group) => group.project.id === 'legacy');
    expect(legacy).toMatchObject({
      project: { id: 'legacy', name: 'Tareas anteriores', status: 'active' },
      activeTasks: [{ id: 'legacy-active', projectId: 'legacy' }],
      pausedTasks: [{ id: 'legacy-paused', projectId: 'legacy' }],
      completedItems: [{ id: 'legacy-record', projectId: 'legacy' }],
      isEmpty: false,
    });
  });

  it('returns one empty legacy group for missing or malformed storage payloads', async () => {
    const fetchMock = vi.fn(async (url: string): Promise<StorageResponse> => ({
      value: url === storageUrl(STORAGE_KEYS.index) ? '{broken-index' : '{broken-projects',
    }));
    vi.stubGlobal('$fetch', fetchMock);

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();

    expect(taskIndex.projectGroups.value).toHaveLength(1);
    expect(taskIndex.projectGroups.value[0]).toMatchObject({
      project: { id: 'legacy', name: 'Tareas anteriores' },
      activeTasks: [],
      pausedTasks: [],
      completedTasks: [],
      completedItems: [],
      isEmpty: true,
    });
    expect(taskIndex.error.value).toBe('');
  });

  it('normalizes invalid task state, removes duplicate ids and isolates unknown projects in legacy', async () => {
    stubStorage({
      [STORAGE_KEYS.projects]: {
        schemaVersion: 1,
        activeProjectId: 'known',
        projects: [project('known')],
      },
      [STORAGE_KEYS.index]: {
        tareas: [
          { id: 'invalid-state', nombre: 'Normalizada', fase: 1, estado: 'desconocida', tipo: 'general', projectId: 'known' },
          { id: 'invalid-phase', nombre: 'Descartada', fase: 99, estado: 'activa', tipo: 'general', projectId: 'known' },
          { id: 'duplicate', nombre: 'Primera', fase: 1, estado: 'activa', tipo: 'general', projectId: 'known' },
          { id: 'duplicate', nombre: 'Segunda', fase: 1, estado: 'pausada', tipo: 'general', projectId: 'known' },
          { id: 'orphan', nombre: 'Huérfana', fase: 1, estado: 'activa', tipo: 'general', projectId: 'missing-project' },
          { id: '', nombre: 'Inválida', fase: 1, estado: 'activa', tipo: 'general', projectId: 'known' },
        ],
        registros: [],
      },
    });

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();

    const known = taskIndex.projectGroups.value.find((group) => group.project.id === 'known');
    const legacy = taskIndex.projectGroups.value.find((group) => group.project.id === 'legacy');
    expect(known?.activeTasks.map((task) => task.id)).toEqual(['invalid-state', 'duplicate']);
    expect(known?.pausedTasks).toEqual([]);
    expect(legacy?.activeTasks.map((task) => task.id)).toEqual(['orphan']);
    expect(taskIndex.safeTasks.value.some((task) => task.id === 'invalid-phase')).toBe(false);
  });

  it('preserves the last good grouping after a request failure and recovers on retry', async () => {
    let mode: 'initial' | 'failure' | 'recovered' = 'initial';
    const fetchMock = vi.fn(async (url: string): Promise<StorageResponse> => {
      if (mode === 'failure') throw new Error('storage offline');

      const projectId = mode === 'initial' ? 'before' : 'after';
      if (url === storageUrl(STORAGE_KEYS.projects)) {
        return {
          value: JSON.stringify({
            schemaVersion: 1,
            activeProjectId: projectId,
            projects: [project(projectId)],
          }),
        };
      }
      return {
        value: JSON.stringify({
          tareas: [{ id: `task-${projectId}`, nombre: projectId, fase: 1, estado: 'activa', tipo: 'general', projectId }],
          registros: [],
        }),
      };
    });
    vi.stubGlobal('$fetch', fetchMock);

    const taskIndex = useTaskIndex();
    await taskIndex.refresh();
    expect(taskIndex.projectGroups.value.map((group) => group.project.id)).toEqual(['before']);

    mode = 'failure';
    await taskIndex.refresh();
    expect(taskIndex.projectGroups.value.map((group) => group.project.id)).toEqual(['before']);
    expect(taskIndex.error.value).toMatch(/storage offline/i);
    expect(taskIndex.loading.value).toBe(false);

    mode = 'recovered';
    await taskIndex.refresh();
    expect(taskIndex.projectGroups.value.map((group) => group.project.id)).toEqual(['after']);
    expect(taskIndex.error.value).toBe('');
  });
});
