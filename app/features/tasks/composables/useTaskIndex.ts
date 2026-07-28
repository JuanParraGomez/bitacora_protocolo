import { computed, ref } from 'vue';
import { z } from 'zod';
import { STORAGE_KEYS } from '~/shared/contracts/storage';
import type { Project, ProjectCollection } from '../domain/project.schema';
import type { TaskIndex } from '../domain/task.schema';

const ACTIVE_STATE = 'activa';
const PAUSED_STATE = 'pausada';
const COMPLETED_STATE = 'completada';
const LEGACY_PROJECT_ID = 'legacy';
const LEGACY_PROJECT_NAME = 'Tareas anteriores';

const normalizedProjectIdSchema = z.string().transform((value) => value.trim() || LEGACY_PROJECT_ID).default(LEGACY_PROJECT_ID);

const taskSummarySchema = z.object({
  id: z.string().min(1),
  nombre: z.string().default(''),
  fase: z.number().int().min(1).max(4).default(1),
  estado: z.string().transform((value) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === COMPLETED_STATE) return COMPLETED_STATE;
    if (normalized === PAUSED_STATE) return PAUSED_STATE;
    return ACTIVE_STATE;
  }).default(ACTIVE_STATE),
  tipo: z.string().default('general'),
  projectId: normalizedProjectIdSchema,
});

const recordSummarySchema = z.object({
  id: z.string().min(1),
  titulo: z.string().default(''),
  tareaId: z.string().default(''),
  taskId: z.string().default(''),
  projectId: normalizedProjectIdSchema,
});

const projectSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120).default('Proyecto sin nombre'),
  description: z.string().max(1000).default(''),
  status: z.enum(['active', 'archived']).default('active'),
  lastActiveTaskId: z.string().nullable().default(null),
  createdAt: z.number().int().nonnegative().default(0),
  updatedAt: z.number().int().nonnegative().default(0),
});

const fallbackTaskIndex: TaskIndex = {
  tareas: [],
  registros: [],
};

function createLegacyProject(): Project {
  return {
    id: LEGACY_PROJECT_ID,
    name: LEGACY_PROJECT_NAME,
    description: 'Tareas migradas sin proyecto explícito',
    status: 'active',
    lastActiveTaskId: null,
    createdAt: 0,
    updatedAt: 0,
  };
}

function fallbackProjectCollection(): ProjectCollection {
  return {
    schemaVersion: 1,
    projects: [createLegacyProject()],
    activeProjectId: LEGACY_PROJECT_ID,
  };
}

function dedupeById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const next: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  return next;
}

function parseTaskSummary(entry: unknown) {
  const parsed = taskSummarySchema.safeParse(entry);
  return parsed.success ? parsed.data : null;
}

function parseRecordSummary(entry: unknown) {
  const parsed = recordSummarySchema.safeParse(entry);
  return parsed.success ? parsed.data : null;
}

function isRecordLike(value: unknown): value is { id: string; titulo?: string; tareaId?: string; taskId?: string; projectId?: string } {
  return Boolean(value && typeof value === 'object' && 'id' in value);
}

function parseTaskIndex(raw: string | null | undefined): TaskIndex {
  if (!raw) return fallbackTaskIndex;

  try {
    const rawParsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!rawParsed || typeof rawParsed !== 'object') return fallbackTaskIndex;

    const tareas = Array.isArray(rawParsed.tareas) ? rawParsed.tareas : [];
    const parsedTareas = dedupeById(tareas.map(parseTaskSummary).filter((task): task is NonNullable<ReturnType<typeof parseTaskSummary>> => Boolean(task)));

    const registros = Array.isArray(rawParsed.registros) ? rawParsed.registros : [];
    const parsedRegistros = dedupeById(
      registros
        .filter(isRecordLike)
        .map((item) => parseRecordSummary({
          id: item.id,
          titulo: item.titulo ?? '',
          tareaId: item.tareaId ?? item.taskId ?? item.id,
          taskId: item.taskId ?? item.tareaId ?? item.id,
          projectId: item.projectId ?? 'legacy',
        }))
        .filter((record): record is NonNullable<ReturnType<typeof parseRecordSummary>> => Boolean(record)),
    );

    return {
      tareas: parsedTareas,
      registros: parsedRegistros,
    };
  } catch {
    return fallbackTaskIndex;
  }
}

function parseProjectCollection(raw: string | null | undefined): ProjectCollection {
  if (!raw) return fallbackProjectCollection();

  try {
    const source = JSON.parse(raw) as Record<string, unknown> | null;
    if (!source || typeof source !== 'object' || !Array.isArray(source.projects)) {
      return fallbackProjectCollection();
    }

    const projects = dedupeById(
      source.projects
        .map((candidate) => projectSummarySchema.safeParse(candidate))
        .filter((result) => result.success)
        .map((result) => result.data),
    );
    if (projects.length === 0) return fallbackProjectCollection();

    const requestedActiveId = typeof source.activeProjectId === 'string' ? source.activeProjectId : null;
    const requestedActive = projects.find((project) => project.id === requestedActiveId && project.status === 'active');
    const activeProjectId = requestedActive?.id
      ?? projects.find((project) => project.status === 'active')?.id
      ?? projects[0]?.id
      ?? LEGACY_PROJECT_ID;

    return {
      schemaVersion: 1,
      projects,
      activeProjectId,
    };
  } catch {
    return fallbackProjectCollection();
  }
}

function alignIndexToProjects(
  parsedIndex: TaskIndex,
  parsedCollection: ProjectCollection,
): { index: TaskIndex; projectCollection: ProjectCollection } {
  const projectIds = new Set(parsedCollection.projects.map((project) => project.id));
  const canonicalProjectId = (projectId: string) => projectIds.has(projectId) ? projectId : LEGACY_PROJECT_ID;
  const index: TaskIndex = {
    tareas: parsedIndex.tareas.map((task) => ({
      ...task,
      projectId: canonicalProjectId(task.projectId),
    })),
    registros: parsedIndex.registros.map((record) => ({
      ...record,
      projectId: canonicalProjectId(record.projectId),
    })),
  };

  const needsLegacy = parsedCollection.projects.length === 0
    || index.tareas.some((task) => task.projectId === LEGACY_PROJECT_ID)
    || index.registros.some((record) => record.projectId === LEGACY_PROJECT_ID);
  const hasLegacy = parsedCollection.projects.some((project) => project.id === LEGACY_PROJECT_ID);
  const projects = needsLegacy && !hasLegacy
    ? [...parsedCollection.projects, createLegacyProject()]
    : parsedCollection.projects;
  const activeProjectId = projects.some((project) =>
    project.id === parsedCollection.activeProjectId && project.status === 'active')
    ? parsedCollection.activeProjectId
    : (projects.find((project) => project.status === 'active')?.id ?? projects[0]?.id ?? LEGACY_PROJECT_ID);

  return {
    index,
    projectCollection: {
      schemaVersion: 1,
      projects,
      activeProjectId,
    },
  };
}

function isMissingStorageKey(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') return false;
  const candidate = cause as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };
  return candidate.status === 404
    || candidate.statusCode === 404
    || candidate.response?.status === 404;
}

async function readStorageValue(key: string): Promise<{ value: string | null }> {
  try {
    return await $fetch<{ value: string | null }>(
      `/api/storage/${encodeURIComponent(key)}`,
    );
  } catch (cause) {
    if (isMissingStorageKey(cause)) return { value: null };
    throw cause;
  }
}

export type TaskProjectGroup = {
  project: Project;
  activeTasks: TaskIndex['tareas'];
  pausedTasks: TaskIndex['tareas'];
  completedTasks: TaskIndex['tareas'];
  completedItems: TaskIndex['registros'];
  isEmpty: boolean;
};

export function useTaskIndex() {
  const index = ref<TaskIndex>({ tareas: [], registros: [] });
  const projectCollection = ref<ProjectCollection>(fallbackProjectCollection());
  const loading = ref(false);
  const error = ref('');
  const projects = computed(() => projectCollection.value.projects);
  const activeProjectId = computed(() => projectCollection.value.activeProjectId);
  const safeTasks = computed(() => index.value.tareas);
  const activeTasks = computed(() => safeTasks.value.filter((task) => task.estado === ACTIVE_STATE));
  const pausedTasks = computed(() => safeTasks.value.filter((task) => task.estado === PAUSED_STATE));
  const completedItems = computed(() => index.value.registros.map((item) => item));
  const completedTasks = computed(() => index.value.tareas.filter((task) => task.estado === COMPLETED_STATE));
  const hasActiveTasks = computed(() => activeTasks.value.length > 0);
  const hasCompleted = computed(() => completedItems.value.length > 0 || completedTasks.value.length > 0);
  const projectGroups = computed<TaskProjectGroup[]>(() => projects.value.map((project) => {
    const groupedActiveTasks = activeTasks.value.filter((task) => task.projectId === project.id);
    const groupedPausedTasks = pausedTasks.value.filter((task) => task.projectId === project.id);
    const groupedCompletedTasks = completedTasks.value.filter((task) => task.projectId === project.id);
    const groupedCompletedItems = completedItems.value.filter((item) => item.projectId === project.id);
    return {
      project,
      activeTasks: groupedActiveTasks,
      pausedTasks: groupedPausedTasks,
      completedTasks: groupedCompletedTasks,
      completedItems: groupedCompletedItems,
      isEmpty: groupedActiveTasks.length === 0
        && groupedPausedTasks.length === 0
        && groupedCompletedTasks.length === 0
        && groupedCompletedItems.length === 0,
    };
  }));
  const activeProjectGroups = computed(() =>
    projectGroups.value.filter((group) => group.project.status === 'active'));
  const archivedProjectGroups = computed(() =>
    projectGroups.value.filter((group) => group.project.status === 'archived'));

  async function refresh() {
    loading.value = true;
    error.value = '';
    try {
      const [indexResponse, projectsResponse] = await Promise.all([
        readStorageValue(STORAGE_KEYS.index),
        readStorageValue(STORAGE_KEYS.projects),
      ]);
      const next = alignIndexToProjects(
        parseTaskIndex(indexResponse.value),
        parseProjectCollection(projectsResponse.value),
      );
      index.value = next.index;
      projectCollection.value = next.projectCollection;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'No se pudo cargar el índice.';
    } finally {
      loading.value = false;
    }
  }

  return {
    index,
    projectCollection,
    projects,
    activeProjectId,
    safeTasks,
    activeTasks,
    pausedTasks,
    completedItems,
    completedTasks,
    projectGroups,
    activeProjectGroups,
    archivedProjectGroups,
    hasActiveTasks,
    hasCompleted,
    loading,
    error,
    refresh,
  };
}
