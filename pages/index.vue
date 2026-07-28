<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';
import DashboardSidebar from '~/app/features/tasks/components/DashboardSidebar.vue';
import WorkspaceHeader from '~/app/features/tasks/components/WorkspaceHeader.vue';
import { createProjectStore } from '~/app/features/tasks/services/project-store';
import { STORAGE_KEYS, type StorageBatchOperation } from '~/shared/contracts/storage';

const {
  projectCollection,
  projectGroups,
  activeProjectId,
  error: indexError,
  refresh: refreshIndex,
} = useTaskIndex();
const searchQuery = ref('');
const selectedProjectId = ref('');
const saveError = ref('');

await refreshIndex();

function tasksForProject(projectId: string) {
  const group = projectGroups.value.find((candidate) => candidate.project.id === projectId);
  if (!group) return [];
  return [...group.activeTasks, ...group.pausedTasks, ...group.completedTasks];
}

function recentTaskForProject(projectId: string) {
  const project = projectCollection.value.projects.find((candidate) => candidate.id === projectId);
  const tasks = tasksForProject(projectId);
  return tasks.find((task) => task.id === project?.lastActiveTaskId) ?? tasks[0] ?? null;
}

const initialProjectId = activeProjectId.value
  ?? projectCollection.value.projects.find((project) => project.status === 'active')?.id
  ?? projectCollection.value.projects[0]?.id
  ?? '';
selectedProjectId.value = initialProjectId;

const initialTask = recentTaskForProject(initialProjectId);
if (initialTask) {
  await navigateTo(`/tasks/${encodeURIComponent(initialTask.id)}`, { replace: true });
}

function openNewTask(projectId: string) {
  const target = projectId || initialProjectId;
  void navigateTo(target ? `/tasks/new?projectId=${encodeURIComponent(target)}` : '/tasks/new');
}

const activeProject = computed(() => (
  projectCollection.value.projects.find((project) => project.id === selectedProjectId.value)
  ?? projectCollection.value.projects.find((project) => project.status === 'active')
  ?? projectCollection.value.projects[0]
  ?? null
));
const expandedProjectIds = computed(() => activeProject.value ? [activeProject.value.id] : []);
const newTaskTarget = computed(() => (
  activeProject.value
    ? `/tasks/new?projectId=${encodeURIComponent(activeProject.value.id)}`
    : '/tasks/new'
));

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

async function persistActiveProject(projectId: string) {
  const next = {
    ...projectCollection.value,
    activeProjectId: projectId,
  };
  await storageClient.set(STORAGE_KEYS.projects, JSON.stringify(next));
  projectCollection.value = next;
}

async function selectTask(payload: { projectId: string; taskId: string }) {
  try {
    await persistActiveProject(payload.projectId);
    saveError.value = '';
    await navigateTo(`/tasks/${encodeURIComponent(payload.taskId)}`);
  } catch {
    saveError.value = 'No se pudo cambiar de tarea. Reintenta.';
  }
}

async function selectProject(projectId: string) {
  const project = projectCollection.value.projects.find((candidate) => candidate.id === projectId);
  if (!project || project.status === 'archived') return;
  const task = recentTaskForProject(projectId);
  try {
    await persistActiveProject(projectId);
    selectedProjectId.value = projectId;
    saveError.value = '';
    if (task) {
      await navigateTo(`/tasks/${encodeURIComponent(task.id)}`);
    }
  } catch {
    saveError.value = 'No se pudo cambiar de proyecto. Reintenta.';
  }
}

async function createProject(name: string) {
  try {
    const created = await projectStore.createProject({
      name,
      description: '',
      status: 'active',
      lastActiveTaskId: null,
    });
    await refreshIndex();
    selectedProjectId.value = created.id;
    saveError.value = '';
  } catch {
    saveError.value = 'No se pudo crear el proyecto. Reintenta.';
  }
}

async function renameProject(payload: { projectId: string; name: string }) {
  try {
    const renamed = await projectStore.renameProject(payload.projectId, payload.name);
    if (!renamed) throw new Error('missing project');
    await refreshIndex();
    selectedProjectId.value = payload.projectId;
    saveError.value = '';
  } catch {
    saveError.value = 'No se pudo renombrar el proyecto. Reintenta.';
  }
}
</script>

<template>
  <div class="workspace-shell">
    <aside class="workspace-sidebar-frame">
      <DashboardSidebar
        :project-groups="projectGroups"
        :selected-project-id="activeProject?.id"
        :expanded-project-ids="expandedProjectIds"
        :search-query="searchQuery"
        @create-project="createProject"
        @open-new-task="openNewTask"
        @rename-project="renameProject"
        @select-project="selectProject"
        @select-task="selectTask"
        @search-tasks="searchQuery = $event"
      />
    </aside>

    <main class="workspace-panel">
      <WorkspaceHeader
        :project-name="activeProject?.name ?? 'Primer proyecto'"
        task-name="Sin tarea seleccionada"
        :phase="1"
        phase-title="Crea la primera tarea"
      />

      <section class="workspace-empty" aria-labelledby="workspace-empty-title">
        <p v-if="indexError" role="alert">{{ indexError }}</p>
        <p v-else-if="saveError" role="alert">{{ saveError }}</p>
        <template v-else>
          <p class="workspace-empty__eyebrow">Espacio listo</p>
          <h2 id="workspace-empty-title">
            {{ activeProject ? 'Este proyecto todavía no tiene tareas.' : 'Crea tu primer proyecto.' }}
          </h2>
          <p>
            {{
              activeProject
                ? 'Inicia una conversación para definir el resultado que quieres alcanzar.'
                : 'Organiza tu trabajo persistente antes de abrir la primera conversación.'
            }}
          </p>
          <NuxtLink :to="newTaskTarget" class="workspace-empty__action">
            Crear primera tarea
          </NuxtLink>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.workspace-shell {
  display: grid;
  grid-template-columns: minmax(16rem, 19rem) minmax(0, 1fr);
  min-width: 0;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: .7rem;
  color: #171d19;
  background:
    linear-gradient(90deg, rgba(0, 122, 77, .035), transparent 32%),
    #f4f7f3;
}

.workspace-sidebar-frame {
  min-width: 0;
  min-height: 0;
}

.workspace-sidebar-frame :deep(aside.task-sidebar) {
  height: 100%;
  min-height: 0;
  overflow: auto;
  border: 1px solid #d7ddd8;
  border-right: 0;
  border-radius: .95rem 0 0 .95rem;
}

.workspace-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #d7ddd8;
  border-radius: 0 .95rem .95rem 0;
  background: rgba(255, 255, 255, .9);
}

.workspace-empty {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: .65rem;
  width: min(100%, 42rem);
  margin-inline: auto;
  padding: clamp(1.5rem, 7vw, 5rem);
}

.workspace-empty h2,
.workspace-empty p {
  margin: 0;
}

.workspace-empty__eyebrow {
  color: #08724c;
  font-size: .78rem;
  font-weight: 780;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.workspace-empty__action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-top: .5rem;
  padding: .65rem 1rem;
  border-radius: .65rem;
  color: #fff;
  font-weight: 760;
  text-decoration: none;
  background: #007a4d;
}

@media (max-width: 767px) {
  .workspace-shell {
    display: block;
    height: auto;
    min-height: 100dvh;
    overflow: visible;
    padding: 0;
  }

  .workspace-sidebar-frame {
    max-height: 45dvh;
    overflow: auto;
  }

  .workspace-sidebar-frame :deep(aside.task-sidebar),
  .workspace-panel {
    border-radius: 0;
  }

  .workspace-empty {
    min-height: 50dvh;
  }
}
</style>
