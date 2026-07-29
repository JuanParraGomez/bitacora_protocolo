import { repairProjectCollection, type ProjectCollection } from '../domain/project.schema';
import { LEGACY_PROJECT_ID } from '../domain/project.schema';
import { taskIndexSchema, type TaskIndex } from '../domain/task.schema';
import { createBlankTask } from '../domain/task-rules';

export type TaskIntakeSubmission = {
  name: string;
  directive: string;
  templateTaskId: string | null;
};

export type TaskIntakeSubmissionState = 'idle' | 'invalid' | 'submitting' | 'succeeded' | 'failed';

export type TaskIntakeSubmissionEvent =
  | 'attempt'
  | 'invalid'
  | 'input'
  | 'success'
  | 'failure';

export interface TaskIntakeSubmissionMachine {
  state: TaskIntakeSubmissionState;
  operationId: string | null;
}

export function createTaskIntakeOperationId(): string {
  const fallback = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const randomId = (() => {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    return fallback;
  })();
  return `intake-${randomId}`;
}

export function createTaskIntakeSubmissionMachine(): TaskIntakeSubmissionMachine {
  return {
    state: 'idle',
    operationId: null,
  };
}

export function isSubmissionBlocked(state: TaskIntakeSubmissionMachine): boolean {
  return state.state === 'submitting';
}

export function transitionTaskIntakeSubmissionState(
  state: TaskIntakeSubmissionMachine,
  event: TaskIntakeSubmissionEvent,
): TaskIntakeSubmissionMachine {
  if (event === 'attempt' && isSubmissionBlocked(state)) {
    return state;
  }

  if (event === 'input' && state.state === 'submitting') {
    return state;
  }

  if (event === 'input') {
    return {
      state: state.state === 'failed' || state.state === 'invalid' || state.state === 'succeeded'
        ? 'idle'
        : state.state,
      operationId: state.state === 'submitting' ? state.operationId : null,
    };
  }

  if (event === 'attempt') {
    return {
      state: 'submitting',
      operationId: state.operationId ?? createTaskIntakeOperationId(),
    };
  }

  if (event === 'success') {
    return {
      ...state,
      state: 'succeeded',
    };
  }

  if (event === 'failure') {
    return {
      ...state,
      state: 'failed',
    };
  }

  if (event === 'invalid') {
    return {
      ...state,
      state: 'invalid',
    };
  }

  return state;
}

export const TASK_NAME_MAX_LENGTH = 120;
export const TASK_DIRECTIVE_MAX_LENGTH = 4000;

export function normalizeTaskIntake(input: {
  name: string;
  directive: string;
  templateTaskId?: string | null;
}): TaskIntakeSubmission {
  return {
    name: input.name.trim(),
    directive: input.directive.trim(),
    templateTaskId: input.templateTaskId?.trim() || null,
  };
}

export function validateTaskIntake(input: {
  name: string;
  directive: string;
  templateTaskId?: string | null;
}) {
  const normalized = normalizeTaskIntake(input);
  if (!normalized.name && !normalized.directive) {
    return {
      ok: false as const,
      error: 'Escribe un nombre o describe el problema inicial.',
    };
  }
  if (normalized.name.length > TASK_NAME_MAX_LENGTH) {
    return {
      ok: false as const,
      error: `El nombre no puede superar ${TASK_NAME_MAX_LENGTH} caracteres.`,
    };
  }
  if (normalized.directive.length > TASK_DIRECTIVE_MAX_LENGTH) {
    return {
      ok: false as const,
      error: `La descripción no puede superar ${TASK_DIRECTIVE_MAX_LENGTH} caracteres.`,
    };
  }
  return {
    ok: true as const,
    value: {
      ...normalized,
      name: normalized.name || normalized.directive.slice(0, TASK_NAME_MAX_LENGTH),
    },
  };
}

const DEFAULT_TASK_INDEX: TaskIndex = {
  tareas: [],
  registros: [],
};

export interface TaskIntakeCreateInput {
  payload: TaskIntakeSubmission;
  preferredProjectId: string;
  indexValue: string | null;
  projectsValue: string | null;
  now?: number;
}

export interface TaskIntakeCreatePlan {
  task: ReturnType<typeof createBlankTask>;
  index: TaskIndex;
  projects: ProjectCollection;
  resolvedProjectId: string;
  preferredProjectId: string;
}

export function parseTaskIntakeIndex(raw: string | null | undefined): TaskIndex {
  if (!raw) {
    return DEFAULT_TASK_INDEX;
  }
  try {
    const parsed = taskIndexSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    return DEFAULT_TASK_INDEX;
  }
  return DEFAULT_TASK_INDEX;
}

export function parseTaskIntakeProjectCollection(
  raw: string | null | undefined,
  taskProjectIds: Set<string> = new Set(),
): ProjectCollection {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : {};
    return repairProjectCollection(parsed, taskProjectIds);
  } catch {
    return repairProjectCollection({}, taskProjectIds);
  }
}

export function resolveActiveProjectId(
  projects: ProjectCollection,
  preferredProjectId: string,
): string {
  const activeProjects = projects.projects.filter((project) => (
    project.status === 'active' && project.id !== LEGACY_PROJECT_ID
  ));
  if (activeProjects.length === 0) return '';
  const requested = activeProjects.find((project) => project.id === preferredProjectId);
  return requested?.id || activeProjects[0]?.id || '';
}

export function buildTaskIntakeCreatePlan(input: TaskIntakeCreateInput): TaskIntakeCreatePlan {
  const now = input.now ?? Date.now();
  const index = parseTaskIntakeIndex(input.indexValue);
  const taskProjectIds = new Set(index.tareas.map((task) => task.id));
  const projects = parseTaskIntakeProjectCollection(input.projectsValue, taskProjectIds);
  const resolvedProjectId = resolveActiveProjectId(projects, input.preferredProjectId);
  if (!resolvedProjectId) {
    throw new Error('No hay un proyecto activo para crear la tarea.');
  }

  const task = createBlankTask(
    input.payload.name,
    input.payload.directive || '',
    'general',
    input.payload.templateTaskId ?? null,
  );
  task.projectId = resolvedProjectId;
  const nextIndex = {
    ...index,
    tareas: [
      {
        id: task.id,
        nombre: task.nombre,
        fase: task.fase,
        estado: task.estado,
        tipo: task.tipo,
        projectId: task.projectId,
      },
      ...index.tareas,
    ],
  };
  const nextProjects = {
    ...projects,
    activeProjectId: resolvedProjectId,
    projects: projects.projects.map((project) => (
      project.id === resolvedProjectId
        ? { ...project, lastActiveTaskId: task.id, updatedAt: Math.max(project.createdAt, now) }
        : project
    )),
  };

  return {
    task,
    index: nextIndex,
    projects: nextProjects,
    resolvedProjectId,
    preferredProjectId: input.preferredProjectId,
  };
}
