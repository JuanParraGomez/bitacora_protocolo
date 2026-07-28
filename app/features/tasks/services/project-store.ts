import { STORAGE_KEYS, StorageCompatibilityError, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import {
  LEGACY_PROJECT_ID,
  repairProjectCollection,
  type Project,
  type ProjectCollection,
} from '../domain/project.schema';

type StorageClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  batch?(operations: StorageBatchOperation[]): Promise<void>;
};

export type ProjectStore = {
  readProjects: (taskProjectIds?: Set<string>) => Promise<ProjectCollection>;
  writeProjects: (collection: ProjectCollection, taskProjectIds?: Set<string>) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  renameProject: (id: string, name: string) => Promise<Project | null>;
  archiveProject: (id: string) => Promise<ProjectCollection>;
  setProjectActiveTask: (projectId: string, taskId: string | null) => Promise<ProjectCollection>;
  moveTask: (taskId: string, destinationProjectId: string) => Promise<MoveTaskResult>;
  ensureLegacyProject: (taskProjectIds?: Set<string>) => Promise<ProjectCollection>;
};

export type MoveTaskResult = {
  task: Record<string, unknown>;
  index: {
    tareas: Array<Record<string, unknown>>;
    registros: Array<Record<string, unknown>>;
  };
  projects: ProjectCollection;
};

function mapStorageFailure(cause: unknown): StorageCompatibilityError {
  return new StorageCompatibilityError('DATABASE_UNAVAILABLE', 'Legacy storage is unavailable; retry the operation.', { cause });
}

function invalidStoredValue(key: string, cause?: unknown): StorageCompatibilityError {
  return new StorageCompatibilityError('INVALID_LEGACY_VALUE', `Invalid JSON in ${key}`, cause ? { cause } : undefined);
}

function sanitizeTaskProjectIds(projectIds: Iterable<string>): Set<string> {
  const next = new Set<string>();
  for (const taskId of projectIds) {
    if (taskId) next.add(taskId);
  }
  return next;
}

function recentTaskIds(collection: ProjectCollection): Set<string> {
  return new Set(
    collection.projects
      .map((project) => project.lastActiveTaskId)
      .filter((taskId): taskId is string => Boolean(taskId)),
  );
}

function storedRecentTaskIds(raw: string | null): Set<string> {
  if (!raw) return new Set<string>();
  try {
    const candidate = JSON.parse(raw) as { projects?: unknown };
    if (!Array.isArray(candidate.projects)) return new Set<string>();
    return new Set(
      candidate.projects
        .map((project) => (
          project && typeof project === 'object'
            ? (project as { lastActiveTaskId?: unknown }).lastActiveTaskId
            : null))
        .filter((taskId): taskId is string => typeof taskId === 'string' && taskId.length > 0),
    );
  } catch {
    return new Set<string>();
  }
}

function parseMoveTask(raw: string | null, taskId: string): Record<string, unknown> {
  if (!raw) throw new Error(`Task ${taskId} does not exist.`);
  try {
    const task = JSON.parse(raw) as unknown;
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      throw invalidStoredValue(STORAGE_KEYS.task(taskId));
    }
    const storedId = (task as { id?: unknown }).id;
    if (typeof storedId === 'string' && storedId.length > 0 && storedId !== taskId) {
      throw new Error(`Task ${taskId} does not match its stored id.`);
    }
    return task as Record<string, unknown>;
  } catch (cause) {
    if (cause instanceof StorageCompatibilityError
      || (cause instanceof Error && cause.message.startsWith('Task '))) {
      throw cause;
    }
    throw invalidStoredValue(STORAGE_KEYS.task(taskId), cause);
  }
}

function parseMoveIndex(raw: string | null): MoveTaskResult['index'] {
  if (!raw) throw invalidStoredValue(STORAGE_KEYS.index);
  try {
    const index = JSON.parse(raw) as { tareas?: unknown; registros?: unknown };
    if (!index || !Array.isArray(index.tareas) || !Array.isArray(index.registros)) {
      throw invalidStoredValue(STORAGE_KEYS.index);
    }
    return {
      tareas: index.tareas.filter((entry): entry is Record<string, unknown> =>
        Boolean(entry && typeof entry === 'object' && !Array.isArray(entry))),
      registros: index.registros.filter((entry): entry is Record<string, unknown> =>
        Boolean(entry && typeof entry === 'object' && !Array.isArray(entry))),
    };
  } catch (cause) {
    if (cause instanceof StorageCompatibilityError) throw cause;
    throw invalidStoredValue(STORAGE_KEYS.index, cause);
  }
}

function normalizeProjectId(projectId: unknown): string {
  return typeof projectId === 'string' && projectId.trim().length > 0
    ? projectId.trim()
    : LEGACY_PROJECT_ID;
}

export function createProjectStore(storage: StorageClient): ProjectStore {
  async function readRaw(key: string): Promise<string | null> {
    try {
      return await storage.get(key);
    } catch (cause) {
      throw mapStorageFailure(cause);
    }
  }

  async function writeRaw(key: string, value: string): Promise<void> {
    try {
      await storage.set(key, value);
    } catch (cause) {
      throw mapStorageFailure(cause);
    }
  }

  function parseRawCollection(raw: string | null, taskProjectIds: Set<string>): ProjectCollection {
    if (!raw) return repairProjectCollection({}, taskProjectIds);
    try {
      return repairProjectCollection(JSON.parse(raw), taskProjectIds);
    } catch {
      return repairProjectCollection({}, taskProjectIds);
    }
  }

  async function readProjects(taskProjectIds: Set<string> = new Set<string>()): Promise<ProjectCollection> {
    const raw = await readRaw(STORAGE_KEYS.projects);
    return parseRawCollection(raw, taskProjectIds);
  }

  async function readProjectsPreservingRecent(): Promise<ProjectCollection> {
    const raw = await readRaw(STORAGE_KEYS.projects);
    return parseRawCollection(raw, storedRecentTaskIds(raw));
  }

  async function writeProjects(collection: ProjectCollection, taskProjectIds: Set<string> = new Set<string>()): Promise<void> {
    const repaired = repairProjectCollection(collection, taskProjectIds);
    await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
  }

  function getUniqueId(): string {
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function nowTimestamp(): number {
    return Date.now();
  }

  async function ensureLegacyProject(taskProjectIds: Set<string> = new Set<string>()): Promise<ProjectCollection> {
    const raw = await readRaw(STORAGE_KEYS.projects);
    const validTaskIds = taskProjectIds.size > 0 ? taskProjectIds : storedRecentTaskIds(raw);
    const repaired = parseRawCollection(raw, validTaskIds);
    await writeProjects(repaired, validTaskIds);
    return repaired;
  }

  return {
    async readProjects(taskProjectIds) {
      const uniqueIds = sanitizeTaskProjectIds(taskProjectIds ?? []);
      return readProjects(uniqueIds);
    },

    async writeProjects(collection, taskProjectIds) {
      const uniqueIds = sanitizeTaskProjectIds(taskProjectIds ?? []);
      await writeProjects(collection, uniqueIds);
    },

    async createProject(project) {
      const current = await readProjectsPreservingRecent();
      const now = nowTimestamp();
      const id = getUniqueId();
      const created: Project = {
        id,
        name: typeof project.name === 'string' && project.name.length > 0 ? project.name : 'Proyecto sin nombre',
        description: typeof project.description === 'string' ? project.description : '',
        status: project.status === 'archived' ? 'archived' : 'active',
        lastActiveTaskId: typeof project.lastActiveTaskId === 'string' && project.lastActiveTaskId.length > 0 ? project.lastActiveTaskId : null,
        createdAt: now,
        updatedAt: now,
      };
      const next: ProjectCollection = {
        ...current,
        projects: [...current.projects, created],
        activeProjectId: id,
      };
      const repaired = repairProjectCollection(next, recentTaskIds(next));
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return created;
    },

    async renameProject(id, name) {
      const current = await readProjectsPreservingRecent();
      const index = current.projects.findIndex((project) => project.id === id);
      if (index < 0) {
        return null;
      }
      current.projects[index] = { ...current.projects[index], name, updatedAt: nowTimestamp() } as Project;
      await writeProjects(current, recentTaskIds(current));
      return current.projects[index] ?? null;
    },

    async archiveProject(id) {
      const current = await readProjectsPreservingRecent();
      const next: ProjectCollection = {
        ...current,
        projects: current.projects.map((project) => (
          project.id === id
            ? { ...project, status: 'archived', updatedAt: nowTimestamp() } as Project
            : project
        )),
      };
      const repaired = repairProjectCollection(next, recentTaskIds(next));
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return repaired;
    },

    async setProjectActiveTask(projectId, taskId) {
      const current = await readProjectsPreservingRecent();
      const next: ProjectCollection = {
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectId
            ? { ...project, lastActiveTaskId: taskId, updatedAt: nowTimestamp() }
            : project),
      };
      const repaired = repairProjectCollection(next, recentTaskIds(next));
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return repaired;
    },

    async moveTask(taskId, destinationProjectId) {
      const normalizedTaskId = taskId.trim();
      const normalizedDestinationId = destinationProjectId.trim();
      if (!normalizedTaskId) throw new Error('Task id is required.');
      if (!normalizedDestinationId) throw new Error('Destination project id is required.');
      if (!storage.batch) {
        throw mapStorageFailure(new Error('Atomic batch storage is required to move a task.'));
      }

      const [taskRaw, indexRaw, projectsRaw] = await Promise.all([
        readRaw(STORAGE_KEYS.task(normalizedTaskId)),
        readRaw(STORAGE_KEYS.index),
        readRaw(STORAGE_KEYS.projects),
      ]);
      const task = parseMoveTask(taskRaw, normalizedTaskId);
      const index = parseMoveIndex(indexRaw);
      const taskEntryIndex = index.tareas.findIndex((entry) => entry.id === normalizedTaskId);
      if (taskEntryIndex < 0) throw new Error(`Task ${normalizedTaskId} is missing from the index.`);

      const allTaskIds = new Set(
        index.tareas
          .map((entry) => entry.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      );
      const projects = parseRawCollection(projectsRaw, allTaskIds);
      const destination = projects.projects.find((project) => project.id === normalizedDestinationId);
      if (!destination) throw new Error(`Destination project ${normalizedDestinationId} does not exist.`);
      if (destination.status === 'archived') {
        throw new Error(`Destination project ${normalizedDestinationId} is archived.`);
      }

      const sourceProjectId = normalizeProjectId(task.projectId);
      if (sourceProjectId === normalizedDestinationId) {
        return { task, index, projects };
      }

      const nextTask = { ...task, id: normalizedTaskId, projectId: normalizedDestinationId };
      const nextIndex: MoveTaskResult['index'] = {
        tareas: index.tareas.map((entry, entryIndex) =>
          entryIndex === taskEntryIndex
            ? { ...entry, projectId: normalizedDestinationId }
            : entry),
        registros: index.registros.map((entry) => ({ ...entry })),
      };
      const taskIdsByProject = new Map<string, Set<string>>();
      for (const entry of nextIndex.tareas) {
        if (typeof entry.id !== 'string' || entry.id.length === 0) continue;
        const entryProjectId = normalizeProjectId(entry.projectId);
        const projectTaskIds = taskIdsByProject.get(entryProjectId) ?? new Set<string>();
        projectTaskIds.add(entry.id);
        taskIdsByProject.set(entryProjectId, projectTaskIds);
      }

      const now = nowTimestamp();
      const nextProjects: ProjectCollection = {
        ...projects,
        projects: projects.projects.map((project) => {
          const belongsToProject = project.lastActiveTaskId
            ? taskIdsByProject.get(project.id)?.has(project.lastActiveTaskId) === true
            : true;
          const lastActiveTaskId = project.id === normalizedDestinationId
            ? normalizedTaskId
            : (belongsToProject ? project.lastActiveTaskId : null);
          const activityChanged = lastActiveTaskId !== project.lastActiveTaskId
            || project.id === sourceProjectId
            || project.id === normalizedDestinationId;
          return {
            ...project,
            lastActiveTaskId,
            updatedAt: activityChanged ? Math.max(project.createdAt, now) : project.updatedAt,
          };
        }),
      };
      const repairedProjects = repairProjectCollection(nextProjects, new Set(
        nextIndex.tareas
          .map((entry) => entry.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ));

      try {
        await storage.batch([
          { type: 'set', key: STORAGE_KEYS.task(normalizedTaskId), value: JSON.stringify(nextTask) },
          { type: 'set', key: STORAGE_KEYS.index, value: JSON.stringify(nextIndex) },
          { type: 'set', key: STORAGE_KEYS.projects, value: JSON.stringify(repairedProjects) },
        ]);
      } catch (cause) {
        throw mapStorageFailure(cause);
      }

      return {
        task: nextTask,
        index: nextIndex,
        projects: repairedProjects,
      };
    },

    async ensureLegacyProject(taskProjectIds) {
      return ensureLegacyProject(sanitizeTaskProjectIds(taskProjectIds ?? []));
    },
  };
}
