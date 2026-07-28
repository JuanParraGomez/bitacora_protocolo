import { STORAGE_KEYS, StorageCompatibilityError, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import {
  LEGACY_PROJECT_ID,
  createLegacyProject,
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
  ensureLegacyProject: (taskProjectIds?: Set<string>) => Promise<ProjectCollection>;
};

function mapStorageFailure(cause: unknown): StorageCompatibilityError {
  return new StorageCompatibilityError('DATABASE_UNAVAILABLE', 'Legacy storage is unavailable; retry the operation.', { cause });
}

function sanitizeTaskProjectIds(projectIds: Iterable<string>): Set<string> {
  const next = new Set<string>();
  for (const taskId of projectIds) {
    if (taskId) next.add(taskId);
  }
  return next;
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
    const repaired = await readProjects(taskProjectIds);
    await writeProjects(repaired, taskProjectIds);
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
      const current = await ensureLegacyProject();
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
      const repaired = repairProjectCollection(next, new Set(current.projects.map((item) => item.id)));
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return created;
    },

    async renameProject(id, name) {
      const current = await ensureLegacyProject();
      const index = current.projects.findIndex((project) => project.id === id);
      if (index < 0) {
        return null;
      }
      current.projects[index] = { ...current.projects[index], name, updatedAt: nowTimestamp() } as Project;
      await writeProjects(current);
      return current.projects[index] ?? null;
    },

    async archiveProject(id) {
      const current = await readProjects();
      const next: ProjectCollection = {
        ...current,
        projects: current.projects.map((project) => (
          project.id === id
            ? { ...project, status: 'archived', updatedAt: nowTimestamp() } as Project
            : project
        )),
      };
      const repaired = repairProjectCollection(next);
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return repaired;
    },

    async setProjectActiveTask(projectId, taskId) {
      const current = await readProjects();
      const next: ProjectCollection = {
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectId
            ? { ...project, lastActiveTaskId: taskId, updatedAt: nowTimestamp() }
            : project),
      };
      const taskRefs = taskId ? new Set([taskId]) : new Set<string>();
      const repaired = repairProjectCollection(next, taskRefs);
      await writeRaw(STORAGE_KEYS.projects, JSON.stringify(repaired));
      return repaired;
    },

    async ensureLegacyProject(taskProjectIds) {
      return ensureLegacyProject(sanitizeTaskProjectIds(taskProjectIds ?? []));
    },
  };
}
