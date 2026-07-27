import { computed, ref } from 'vue';
import { z } from 'zod';
import { STORAGE_KEYS } from '~/shared/contracts/storage';
import type { TaskIndex } from '../domain/task.schema';

const ACTIVE_STATE = 'activa';
const COMPLETED_STATE = 'completada';

const taskSummarySchema = z.object({
  id: z.string().min(1),
  nombre: z.string().default(''),
  fase: z.number().int().min(1).max(4).default(1),
  estado: z.string().transform((value) => {
    const normalized = value.trim().toLowerCase();
    return normalized === COMPLETED_STATE ? COMPLETED_STATE : ACTIVE_STATE;
  }).default(ACTIVE_STATE),
  tipo: z.string().default('general'),
});

const recordSummarySchema = z.object({
  id: z.string().min(1),
  titulo: z.string().default(''),
  tareaId: z.string().optional(),
});

const fallbackTaskIndex: TaskIndex = {
  tareas: [],
  registros: [],
};

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

function isRecordLike(value: unknown): value is { id: string; titulo?: string; tareaId?: string } {
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
          tareaId: item.tareaId,
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

export function useTaskIndex() {
  const index = ref<TaskIndex>({ tareas: [], registros: [] });
  const loading = ref(false);
  const error = ref('');
  const safeTasks = computed(() => index.value.tareas);
  const activeTasks = computed(() => safeTasks.value.filter((task) => task.estado === ACTIVE_STATE));
  const completedItems = computed(() => index.value.registros.map((item) => item));
  const completedTasks = computed(() => index.value.tareas.filter((task) => task.estado === COMPLETED_STATE));
  const hasActiveTasks = computed(() => activeTasks.value.length > 0);
  const hasCompleted = computed(() => completedItems.value.length > 0 || completedTasks.value.length > 0);

  async function refresh() {
    loading.value = true;
    error.value = '';
    try {
      const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(STORAGE_KEYS.index)}`).catch(() => ({ value: null }));
      index.value = parseTaskIndex(response.value);
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'No se pudo cargar el índice.';
    } finally {
      loading.value = false;
    }
  }

  return {
    index,
    safeTasks,
    activeTasks,
    completedItems,
    completedTasks,
    hasActiveTasks,
    hasCompleted,
    loading,
    error,
    refresh,
  };
}
