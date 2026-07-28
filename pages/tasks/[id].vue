<script setup lang="ts">
import { canAdvanceWithAssistant, advanceTask, repairTask } from '~/app/features/tasks/domain/task-rules';
import type { Task } from '~/app/features/tasks/domain/task.schema';
import { STORAGE_KEYS } from '~/shared/contracts/storage';
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';
import { completeTask } from '~/app/features/tasks/services/task-completion';
import SaveStatus from '~/app/components/shared/SaveStatus.vue';
import TaskWorkspace from '~/app/features/tasks/components/TaskWorkspace.vue';

const route = useRoute();
const id = computed(() => String(route.params.id));
const task = ref<Task | null>(null);
const error = ref('');
const saveError = ref('');
const saved = ref(false);
const hydrated = ref(false);
const pendingSave = ref<Promise<boolean> | null>(null);
const { index, activeTasks, completedItems, refresh: refreshIndex, error: indexError } = useTaskIndex();
let activeLoad = 0;

function waitForPendingSave() {
  return pendingSave.value ?? Promise.resolve(true);
}

function snapshot(taskToSave: Task): Task {
  return JSON.parse(JSON.stringify(taskToSave)) as Task;
}

function upsertTaskSummary(nextTask: Task) {
    const summary = {
      id: nextTask.id,
      nombre: nextTask.nombre,
      fase: nextTask.fase,
      estado: nextTask.estado,
      tipo: nextTask.tipo,
      projectId: nextTask.projectId,
    };
  const next = { ...index.value };
  const existing = next.tareas.findIndex((candidate) => candidate.id === nextTask.id);
  if (existing >= 0) {
    next.tareas[existing] = summary;
  } else {
    next.tareas.unshift(summary);
  }
  return next;
}

async function loadIndex() {
  await refreshIndex();
}

async function load(taskId: string) {
  const request = ++activeLoad;
  error.value = '';
  saveError.value = '';
  await waitForPendingSave();

  if (!id.value || id.value !== taskId) return;

  const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(STORAGE_KEYS.task(taskId))}`).catch(() => ({ value: null }));
  if (request !== activeLoad || id.value !== taskId) return;

  if (!response.value) {
    task.value = null;
    error.value = 'No encontré esta tarea.';
    return;
  }

  try {
    task.value = repairTask(JSON.parse(response.value));
  } catch {
    task.value = null;
    error.value = 'La tarea guardada no es válida.';
    return;
  }

  await loadIndex();
}

async function save(nextTask?: Task): Promise<boolean> {
  if (!task.value) return false;
  if (nextTask) task.value = nextTask;

  const snapshotTask = snapshot(task.value);
  const action = (async () => {
    try {
      await $fetch(`/api/storage/${encodeURIComponent(STORAGE_KEYS.task(snapshotTask.id))}`, {
        method: 'PUT',
        body: { value: JSON.stringify(snapshotTask) },
      });
      const next = upsertTaskSummary(snapshotTask);
      index.value = next;
      await $fetch(`/api/storage/${encodeURIComponent(STORAGE_KEYS.index)}`, {
        method: 'PUT',
        body: { value: JSON.stringify(next) },
      });
      await refreshIndex();
      saveError.value = '';
      saved.value = true;
      return true;
    } catch {
      saveError.value = 'No se pudo guardar. Reintenta.';
      return false;
    }
  })();

  pendingSave.value = action;
  const result = await action;
  if (pendingSave.value === action) {
    pendingSave.value = null;
  }
  return result;
}

async function completeCurrentTask(nextTask: Task) {
  const storage = {
    async get(key: string) {
      const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(key)}`).catch(() => ({ value: null }));
      return response.value;
    },
    async set(key: string, value: string) {
      await $fetch(`/api/storage/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: { value },
      });
    },
    async delete(key: string) {
      await $fetch(`/api/storage/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      }).catch(() => {});
    },
    async batch(operations: Array<{ type: 'set' | 'delete'; key: string; value?: string }>) {
      await $fetch('/api/storage/batch', {
        method: 'POST',
        body: { operations },
      });
    },
  };

  const nextIndex = await completeTask(storage, {
    ...nextTask,
    estado: 'completada',
    projectId: nextTask.projectId || 'legacy',
  });
  index.value = nextIndex;
  await refreshIndex();
}

async function advance() {
  if (!task.value) return;
  if (!canContinue.value) return;
  const nextTask = advanceTask(task.value);
  const baseline = snapshot(task.value);
  task.value = nextTask;
  if (!await save()) {
    task.value = baseline;
    return;
  }

  if (task.value.estado === 'completada') {
    await completeCurrentTask(task.value);
  }
}

async function retreat() {
  if (!task.value || task.value.fase <= 1) return;
  const nextTask = { ...task.value, fase: (task.value.fase - 1) as Task['fase'] };
  const baseline = snapshot(task.value);
  task.value = nextTask;
  if (!await save()) {
    task.value = baseline;
  }
}

function markDirty(nextTask?: Task) {
  if (nextTask) task.value = nextTask;
  saved.value = false;
}

function saveFromWorkspace(nextTask?: Task): void {
  if (nextTask) task.value = nextTask;
  void save();
}

const currentErrors = computed(() => {
  if (!task.value) return [];
  return canAdvanceWithAssistant(task.value).reasons;
});
const canContinue = computed(() => task.value ? canAdvanceWithAssistant(task.value).allowed : false);

watch(id, (next) => {
  void load(next);
});

await load(id.value);

onMounted(() => {
  hydrated.value = true;
});
</script>

<template>
  <main v-if="task" class="task-page" :data-hydrated="hydrated ? 'true' : 'false'">
    <template v-if="hydrated">
      <TaskWorkspace
        :task="task"
        :active-tasks="index.tareas"
        :completed-items="index.registros"
        :save-task="save"
        @save="saveFromWorkspace"
        @dirty="markDirty"
        @request-back="retreat"
        @request-continue="advance"
      />
      <section class="task-page__status" aria-label="Estado de la tarea">
        <p>Fase {{ task.fase }} · {{ task.estado }}</p>
        <SaveStatus :status="saveError ? 'error' : saved ? 'saved' : 'idle'" :message="saveError" />
        <p v-if="currentErrors.length" role="alert">{{ currentErrors.join(' ') }}</p>
        <button type="button" :disabled="!canContinue" @click="advance">Avanzar</button>
      </section>
    </template>
    <p v-else class="task-workspace__loading">Cargando interfaz...</p>
  </main>
  <p v-else-if="error || indexError" role="alert">{{ error || indexError }}</p>
  <p v-else>Cargando…</p>
</template>

<style scoped>
.task-page {
  position: relative;
  display: block !important;
  height: 100vh;
  overflow: clip;
  gap: 0 !important;
}

.task-page__status {
  position: fixed;
  right: .7rem;
  bottom: .7rem;
  left: .7rem;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: .75rem;
  min-height: 3rem;
  padding: 0;
  color: #526058;
  font-size: .82rem;
  pointer-events: none;
}

.task-page__status p {
  margin: 0;
}

.task-page__status [role='alert'] {
  max-width: 42rem;
  pointer-events: none;
}

.task-page__status [role='status'] {
  pointer-events: none;
}

.task-page__status button {
  border-color: #007a4d;
  color: #fff;
  background: #007a4d;
  pointer-events: auto;
}

.task-page__status button:disabled {
  pointer-events: none;
}

@media (max-width: 767px) {
  .task-page__status {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
