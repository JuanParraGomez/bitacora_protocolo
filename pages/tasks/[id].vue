<script setup lang="ts">
import { canAdvanceWithAssistant, advanceTask, repairTask } from '~/app/features/tasks/domain/task-rules';
import type { Task } from '~/app/features/tasks/domain/task.schema';
import type { ProjectCollection } from '~/app/features/tasks/domain/project.schema';
import { STORAGE_KEYS, type StorageBatchOperation } from '~/shared/contracts/storage';
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';
import { useWorkspaceState, type WorkspaceSummaryState } from '~/app/features/tasks/composables/useWorkspaceState';
import { useWorkspaceNotices } from '~/app/features/tasks/composables/useWorkspaceNotices';
import { completeTask } from '~/app/features/tasks/services/task-completion';
import { createProjectStore } from '~/app/features/tasks/services/project-store';
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
const searchQuery = ref('');
const sidebarCollapsed = ref(false);
const composerDraft = ref('');
const summaryState = ref<WorkspaceSummaryState>('hidden');
const lastVisibleMessageId = ref<string | null>(null);
const workspaceState = shallowRef<ReturnType<typeof useWorkspaceState> | null>(null);
const noticesApi = useWorkspaceNotices();
const {
  index,
  projectCollection,
  projectGroups,
  activeTasks,
  completedItems,
  refresh: refreshIndex,
  error: indexError,
} = useTaskIndex();
let activeLoad = 0;

const storageClient = {
  async get(key: string) {
    const response = await $fetch<{ value: string | null }>(
      `/api/storage/${encodeURIComponent(key)}`,
    );
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
    });
  },
  async batch(operations: StorageBatchOperation[]) {
    await $fetch('/api/storage/batch', {
      method: 'POST',
      body: { operations },
    });
  },
};
const projectStore = createProjectStore(storageClient);

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
  const next = {
    tareas: [...index.value.tareas],
    registros: [...index.value.registros],
  };
  const existing = next.tareas.findIndex((candidate) => candidate.id === nextTask.id);
  if (existing >= 0) {
    next.tareas[existing] = summary;
  } else {
    next.tareas.unshift(summary);
  }
  return next;
}

function taskIdsForGroup(group: (typeof projectGroups.value)[number]): string[] {
  return [...new Set([
    ...group.activeTasks,
    ...group.pausedTasks,
    ...group.completedTasks,
  ].map((candidate) => candidate.id))];
}

function projectIdForTask(taskId: string, fallback = 'legacy'): string {
  const owner = projectGroups.value.find((group) => taskIdsForGroup(group).includes(taskId));
  return owner?.project.id ?? fallback;
}

function restorePresentation(taskId: string) {
  composerDraft.value = workspaceState.value?.draftFor(taskId) ?? '';
  summaryState.value = workspaceState.value?.summaryStateFor(taskId) ?? 'hidden';
  lastVisibleMessageId.value = workspaceState.value?.lastVisibleMessageFor(taskId) ?? null;
}

function rebuildWorkspaceState() {
  if (!import.meta.client) return;
  workspaceState.value = useWorkspaceState({
    storage: window.localStorage,
    contexts: projectGroups.value.map((group) => ({
      projectId: group.project.id,
      taskIds: taskIdsForGroup(group),
    })),
  });
  if (task.value) {
    const projectId = projectIdForTask(task.value.id, task.value.projectId || 'legacy');
    workspaceState.value.selectTask(projectId, task.value.id);
    workspaceState.value.setProjectExpanded(projectId, true);
    syncOverlayFromRoute();
    restorePresentation(task.value.id);
  }
}

function syncOverlayFromRoute() {
  const overlay = typeof route.query.overlay === 'string' ? route.query.overlay : null;
  const recordId = typeof route.query.record === 'string' ? route.query.record : null;
  const projectId = typeof route.query.projectId === 'string'
    ? route.query.projectId
    : (workspaceState.value?.activeProjectId.value ?? task.value?.projectId ?? null);
  if (overlay === 'new-task' || overlay === 'library' || overlay === 'settings') {
    workspaceState.value?.setActiveOverlay(overlay, {
      projectId,
      recordId,
    });
    return;
  }
  workspaceState.value?.closeOverlay();
}

async function updateOverlayRoute(
  overlay: 'new-task' | 'library' | 'settings' | null,
  options: { projectId?: string | null; recordId?: string | null } = {},
) {
  const nextQuery = {
    ...route.query,
  } as Record<string, string>;
  delete nextQuery.overlay;
  delete nextQuery.record;
  if (overlay) {
    nextQuery.overlay = overlay;
    if (options.recordId) nextQuery.record = options.recordId;
    if (options.projectId) nextQuery.projectId = options.projectId;
  } else {
    delete nextQuery.projectId;
  }
  await navigateTo({
    path: `/tasks/${encodeURIComponent(id.value)}`,
    query: nextQuery,
  });
}

function nextProjectCollection(
  projectId: string,
  taskId: string | null,
  activateProject = true,
): ProjectCollection {
  const now = Date.now();
  return {
    ...projectCollection.value,
    activeProjectId: activateProject
      ? projectId
      : projectCollection.value.activeProjectId,
    projects: projectCollection.value.projects.map((project) => (
      project.id === projectId && taskId
        ? { ...project, lastActiveTaskId: taskId, updatedAt: Math.max(project.createdAt, now) }
        : project
    )),
  };
}

async function persistWorkspaceSelection(projectId: string, taskId: string | null) {
  const next = nextProjectCollection(projectId, taskId);
  await storageClient.set(STORAGE_KEYS.projects, JSON.stringify(next));
  projectCollection.value = next;
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
  if (import.meta.client) {
    rebuildWorkspaceState();
  }
}

async function save(nextTask?: Task): Promise<boolean> {
  if (!task.value) return false;
  const priorSave = pendingSave.value;
  const isDetached = Boolean(nextTask && nextTask.id !== task.value.id);
  if (nextTask && !isDetached) task.value = nextTask;

  const snapshotTask = snapshot(nextTask ?? task.value);
  const action = (async () => {
    if (priorSave) await priorSave;
    try {
      const next = upsertTaskSummary(snapshotTask);
      const canonicalProjectId = projectIdForTask(snapshotTask.id, snapshotTask.projectId || 'legacy');
      const nextProjects = nextProjectCollection(
        canonicalProjectId,
        snapshotTask.id,
        !isDetached,
      );
      await storageClient.batch([
        {
          type: 'set',
          key: STORAGE_KEYS.task(snapshotTask.id),
          value: JSON.stringify(snapshotTask),
        },
        {
          type: 'set',
          key: STORAGE_KEYS.index,
          value: JSON.stringify(next),
        },
        {
          type: 'set',
          key: STORAGE_KEYS.projects,
          value: JSON.stringify(nextProjects),
        },
      ]);
      index.value = next;
      projectCollection.value = nextProjects;
      await refreshIndex();
      rebuildWorkspaceState();
      saveError.value = '';
      noticesApi.pushNotice({
        title: 'Guardado',
        message: 'La tarea se actualizó sin salir del workspace.',
        tone: 'success',
      });
      if (!isDetached) saved.value = true;
      return true;
    } catch {
      saveError.value = 'No se pudo guardar. Reintenta.';
      noticesApi.pushNotice({
        title: 'No se pudo guardar',
        message: 'El cambio quedó en memoria. Puedes reintentar desde el workspace.',
        tone: 'error',
        urgent: true,
        onRetry: () => { void save(snapshotTask); },
      });
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
  const nextIndex = await completeTask(storageClient, {
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
  void save(nextTask);
}

async function createProject(name: string) {
  let created: Awaited<ReturnType<typeof projectStore.createProject>>;
  try {
    created = await projectStore.createProject({
      name,
      description: '',
      status: 'active',
      lastActiveTaskId: null,
    });
  } catch {
    saveError.value = 'No se pudo crear el proyecto. Reintenta.';
    return;
  }

  try {
    await refreshIndex();
    rebuildWorkspaceState();
    workspaceState.value?.selectProject(created.id);
    workspaceState.value?.setProjectExpanded(created.id, true);
    saveError.value = '';
  } catch {
    saveError.value = 'El proyecto se creó, pero no pudo actualizarse. Recarga el workspace.';
  }
}

async function renameProject(payload: { projectId: string; name: string }) {
  try {
    const renamed = await projectStore.renameProject(payload.projectId, payload.name);
    if (!renamed) throw new Error('missing project');
    await refreshIndex();
    rebuildWorkspaceState();
    workspaceState.value?.selectProject(payload.projectId);
    saveError.value = '';
  } catch {
    saveError.value = 'No se pudo renombrar el proyecto. Reintenta.';
  }
}

async function renameTask(payload: { taskId: string; name: string }) {
  try {
    const response = await storageClient.get(STORAGE_KEYS.task(payload.taskId));
    if (!response) throw new Error('missing task');
    const renamed = {
      ...repairTask(JSON.parse(response)),
      nombre: payload.name,
    };
    const nextIndex = {
      tareas: index.value.tareas.map((candidate) => (
        candidate.id === payload.taskId ? { ...candidate, nombre: payload.name } : candidate
      )),
      registros: [...index.value.registros],
    };
    await storageClient.batch([
      {
        type: 'set',
        key: STORAGE_KEYS.task(payload.taskId),
        value: JSON.stringify(renamed),
      },
      {
        type: 'set',
        key: STORAGE_KEYS.index,
        value: JSON.stringify(nextIndex),
      },
    ]);
    if (task.value?.id === payload.taskId) task.value = renamed;
    index.value = nextIndex;
    await refreshIndex();
    rebuildWorkspaceState();
    saveError.value = '';
  } catch {
    saveError.value = 'No se pudo renombrar la tarea. Reintenta.';
  }
}

async function selectProject(projectId: string) {
  const group = projectGroups.value.find((candidate) => candidate.project.id === projectId);
  if (!group || group.project.status === 'archived') return;
  const taskIds = taskIdsForGroup(group);
  const recentTaskId = group.project.lastActiveTaskId;
  const targetTaskId = recentTaskId && taskIds.includes(recentTaskId)
    ? recentTaskId
    : taskIds[0] ?? null;
  try {
    await persistWorkspaceSelection(projectId, targetTaskId);
    workspaceState.value?.selectProject(projectId);
    workspaceState.value?.setProjectExpanded(projectId, true);
    if (targetTaskId) {
      workspaceState.value?.selectTask(projectId, targetTaskId);
    }
    saveError.value = '';
    if (targetTaskId && targetTaskId !== id.value) {
      await navigateTo(`/tasks/${encodeURIComponent(targetTaskId)}`);
    }
  } catch {
    saveError.value = 'No se pudo cambiar de proyecto. Reintenta.';
  }
}

async function selectTask(payload: { projectId: string; taskId: string }) {
  try {
    await persistWorkspaceSelection(payload.projectId, payload.taskId);
    workspaceState.value?.selectTask(payload.projectId, payload.taskId);
    saveError.value = '';
    if (payload.taskId !== id.value) {
      await navigateTo(`/tasks/${encodeURIComponent(payload.taskId)}`);
    }
  } catch {
    saveError.value = 'No se pudo cambiar de tarea. Reintenta.';
  }
}

function toggleProject(payload: { projectId: string; expanded: boolean }) {
  workspaceState.value?.setProjectExpanded(payload.projectId, payload.expanded);
}

function updateDraft(payload: { taskId: string; draft: string }) {
  if (payload.taskId === task.value?.id) composerDraft.value = payload.draft;
  workspaceState.value?.setDraft(payload.taskId, payload.draft);
}

function updateSummaryState(payload: { taskId: string; state: Exclude<WorkspaceSummaryState, 'hidden'> }) {
  if (payload.taskId === task.value?.id) summaryState.value = payload.state;
  workspaceState.value?.setSummaryState(payload.taskId, payload.state);
}

function updateLastVisibleMessage(payload: { taskId: string; messageId: string | null }) {
  if (payload.taskId === task.value?.id) lastVisibleMessageId.value = payload.messageId;
  workspaceState.value?.setLastVisibleMessage(payload.taskId, payload.messageId);
}

function requestOverlay(payload: {
  overlay: 'new-task' | 'library' | 'settings' | null;
  projectId?: string | null;
  recordId?: string | null;
}) {
  void updateOverlayRoute(payload.overlay, payload);
}

function handleLibraryRecordLinked(payload: {
  recordId: string;
  title: string;
  status: 'linked' | 'already-linked' | 'error';
  reason?: 'record-missing' | 'task-missing' | 'task-invalid' | 'write-failed';
  task?: Record<string, unknown> | null;
}) {
  if (payload.task && task.value) {
    Object.assign(task.value, repairTask(payload.task));
  }

  if (payload.status === 'error') {
    noticesApi.pushNotice({
      title: 'No se pudo vincular la referencia',
      message: payload.reason === 'record-missing'
        ? 'El registro ya no esta disponible en la biblioteca.'
        : 'La referencia no pudo persistirse en la tarea activa.',
      tone: 'error',
      urgent: true,
    });
    return;
  }

  noticesApi.pushNotice({
    title: payload.status === 'linked' ? 'Referencia vinculada' : 'Referencia ya vinculada',
    message: payload.status === 'linked'
      ? `${payload.title} quedo disponible como referencia revisable.`
      : `${payload.title} ya estaba vinculada a esta tarea.`,
    tone: 'success',
  });
}

const currentErrors = computed(() => {
  if (!task.value) return [];
  return canAdvanceWithAssistant(task.value).reasons;
});
const canContinue = computed(() => task.value ? canAdvanceWithAssistant(task.value).allowed : false);
const activeWorkspaceProjectId = computed(() => (
  workspaceState.value?.activeProjectId.value
  ?? projectCollection.value.activeProjectId
  ?? task.value?.projectId
  ?? 'legacy'
));
const activeProjectName = computed(() => (
  projectGroups.value.find((group) => group.project.id === activeWorkspaceProjectId.value)?.project.name
  ?? 'Tareas anteriores'
));
const expandedProjectIds = computed(() => (
  workspaceState.value?.expandedProjectIds.value ?? []
));

watch(id, (next) => {
  void load(next);
});
watch(() => route.query.overlay, () => {
  syncOverlayFromRoute();
});
watch(() => route.query.record, () => {
  syncOverlayFromRoute();
});
watch(() => route.query.projectId, () => {
  syncOverlayFromRoute();
});

await load(id.value);

onMounted(() => {
  rebuildWorkspaceState();
  hydrated.value = true;
});
</script>

<template>
  <main v-if="task" class="task-page" :data-hydrated="hydrated ? 'true' : 'false'">
    <template v-if="hydrated">
      <TaskWorkspace
        :task="task"
        :project-groups="projectGroups"
        :active-project-id="activeWorkspaceProjectId"
        :project-name="activeProjectName"
        :expanded-project-ids="expandedProjectIds"
        :search-query="searchQuery"
        :sidebar-collapsed="sidebarCollapsed"
        :composer-draft="composerDraft"
        :summary-state="summaryState"
        :last-visible-message-id="lastVisibleMessageId"
        :active-tasks="index.tareas"
        :completed-items="index.registros"
        :save-task="save"
        :active-overlay="workspaceState?.activeOverlay.value"
        :overlay-record-id="workspaceState?.overlayRecordId.value"
        :overlay-project-id="workspaceState?.overlayProjectId.value"
        :notices="noticesApi.notices.value"
        @save="saveFromWorkspace"
        @dirty="markDirty"
        @request-back="retreat"
        @request-continue="advance"
        @create-project="createProject"
        @rename-project="renameProject"
        @rename-task="renameTask"
        @select-project="selectProject"
        @select-task="selectTask"
        @toggle-project="toggleProject"
        @search-tasks="searchQuery = $event"
        @update-sidebar-collapsed="sidebarCollapsed = $event"
        @update-draft="updateDraft"
        @update-summary-state="updateSummaryState"
        @update-last-visible-message="updateLastVisibleMessage"
        @request-overlay="requestOverlay"
        @dismiss-notice="noticesApi.dismissNotice"
        @retry-notice="noticesApi.retryNotice"
        @library-record-linked="handleLibraryRecordLinked"
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
  display: grid !important;
  grid-template-rows: minmax(0, 1fr) auto;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  gap: 0 !important;
}

.task-page :deep(.workspace-shell),
.task-page :deep(.workspace-section) {
  height: 100%;
  max-height: 100%;
}

.task-page__status {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: .75rem;
  min-height: 3rem;
  max-height: 35dvh;
  overflow: auto;
  padding: .4rem .7rem;
  border-top: 1px solid #d7ddd8;
  color: #526058;
  font-size: .82rem;
  background: #f8faf8;
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
