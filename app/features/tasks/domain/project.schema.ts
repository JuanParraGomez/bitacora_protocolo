import { z } from 'zod';

export const LEGACY_PROJECT_ID = 'legacy';

export const projectStatusSchema = z.enum(['active', 'archived']);
export const projectIdSchema = z.string().min(1);
export const projectDescriptionSchema = z.string().max(1000);

export const projectSchema = z.object({
  id: projectIdSchema,
  name: z.string().min(1).max(120).default('Proyecto sin nombre'),
  description: projectDescriptionSchema.default(''),
  status: projectStatusSchema.default('active'),
  lastActiveTaskId: z.string().nullable().default(null),
  createdAt: z.number().int().nonnegative().default(() => Date.now()),
  updatedAt: z.number().int().nonnegative().default(() => Date.now()),
});

export const projectCollectionSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  projects: z.array(projectSchema).default([]),
  activeProjectId: z.string().nullable().default(null),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectCollection = z.infer<typeof projectCollectionSchema>;

export function createLegacyProject(overrides: Partial<Project> = {}): Project {
  return {
    id: LEGACY_PROJECT_ID,
    name: 'Tareas heredadas',
    description: 'Workspace migrado sin proyecto explícito',
    status: 'active',
    lastActiveTaskId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function sanitizeTasksByProjectIds(collection: ProjectCollection, taskProjectIds: Set<string>): ProjectCollection {
  const dedupedProjects: Project[] = [];

  for (const project of collection.projects) {
    if (dedupedProjects.some((existing) => existing.id === project.id)) {
      continue;
    }

    const createdAt = Number.isFinite(project.createdAt) ? project.createdAt : Date.now();
    const safeProject: Project = {
      ...project,
      id: String(project.id || ''),
      name: project.name || 'Proyecto sin nombre',
      description: project.description || '',
      status: project.status === 'archived' ? 'archived' : 'active',
      createdAt,
      updatedAt: Math.max(createdAt, Number.isFinite(project.updatedAt) ? project.updatedAt : createdAt),
      lastActiveTaskId: project.lastActiveTaskId && taskProjectIds.has(project.lastActiveTaskId) ? project.lastActiveTaskId : null,
    };

    dedupedProjects.push(safeProject);
  }

  const hasLegacy = dedupedProjects.some((project) => project.id === LEGACY_PROJECT_ID);
  const nextProjects = hasLegacy ? dedupedProjects : [createLegacyProject(), ...dedupedProjects];
  const firstActiveProjectIdFromStorage = dedupedProjects.find((project) => project.status === 'active')?.id;
  const activeProjectId =
    nextProjects.some((project) => project.id === collection.activeProjectId && project.status === 'active')
      ? collection.activeProjectId
      : (firstActiveProjectIdFromStorage ?? nextProjects[0]?.id ?? LEGACY_PROJECT_ID);

  return {
    schemaVersion: 1,
    projects: nextProjects,
    activeProjectId,
  };
}

function normalizeProjectCandidate(project: unknown): Project {
  const source = (project && typeof project === 'object') ? project as Record<string, unknown> : {};
  const id = typeof source.id === 'string' && source.id.length > 0 ? source.id : LEGACY_PROJECT_ID;
  const rawName = typeof source.name === 'string' ? source.name : '';
  const name = rawName.length > 0 ? rawName : 'Proyecto sin nombre';
  const rawDescription = typeof source.description === 'string' ? source.description : '';
  const description = rawDescription.length <= 1000 ? rawDescription : rawDescription.slice(0, 1000);
  const status = source.status === 'archived' ? 'archived' : 'active';
  const lastActiveTaskId = typeof source.lastActiveTaskId === 'string' && source.lastActiveTaskId.length > 0 ? source.lastActiveTaskId : null;
  const rawCreatedAt = typeof source.createdAt === 'number' ? source.createdAt : Date.now();
  const createdAt = Number.isFinite(rawCreatedAt) && rawCreatedAt >= 0 ? rawCreatedAt : Date.now();
  const rawUpdatedAt = typeof source.updatedAt === 'number' ? source.updatedAt : createdAt;
  const updatedAt = Number.isFinite(rawUpdatedAt) && rawUpdatedAt >= 0 ? Math.max(createdAt, rawUpdatedAt) : createdAt;

  return {
    id,
    name,
    description,
    status,
    lastActiveTaskId,
    createdAt,
    updatedAt,
  };
}

export function repairProjectCollection(input: unknown, taskProjectIds = new Set<string>()): ProjectCollection {
  const candidate = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const rawProjects = Array.isArray(candidate.projects) ? candidate.projects : [];
  const normalizedCollection: ProjectCollection = {
    schemaVersion: 1,
    projects: rawProjects.map(normalizeProjectCandidate),
    activeProjectId: typeof candidate.activeProjectId === 'string' && candidate.activeProjectId.length > 0 ? candidate.activeProjectId : null,
  };

  return sanitizeTasksByProjectIds(normalizedCollection, taskProjectIds);
}
