<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';
import DashboardSidebar from '~/app/features/tasks/components/DashboardSidebar.vue';
import WorkspaceHeader from '~/app/features/tasks/components/WorkspaceHeader.vue';
import { createProjectStore } from '~/app/features/tasks/services/project-store';
import { STORAGE_KEYS, type StorageBatchOperation } from '~/shared/contracts/storage';

useHead({
  title: 'Workspace',
});

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
const sidebarCollapsed = ref(false);
const sidebarOpen = ref(false);
const isCompact = ref(false);
const isMobile = ref(false);
const workspaceHeaderRef = ref<InstanceType<typeof WorkspaceHeader> | null>(null);
const sidebarDrawerRef = ref<HTMLElement | null>(null);
const sidebarCloseButtonRef = ref<HTMLButtonElement | null>(null);
const settingsUnavailableReason = 'Abre una tarea para usar Ajustes.';
let compactMediaQuery: MediaQueryList | null = null;
let mobileMediaQuery: MediaQueryList | null = null;

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

function updateResponsiveMode() {
  isCompact.value = compactMediaQuery ? compactMediaQuery.matches : false;
  isMobile.value = mobileMediaQuery ? mobileMediaQuery.matches : false;
  if (!isCompact.value) {
    sidebarOpen.value = false;
  }
}

function focusSidebarToggle() {
  workspaceHeaderRef.value?.focusNavigation();
}

function updateSidebarCollapsed(collapsed: boolean) {
  sidebarCollapsed.value = collapsed;
}

async function onSelectTask(payload: { projectId: string; taskId: string }) {
  try {
    await persistActiveProject(payload.projectId);
    saveError.value = '';
    await navigateTo(`/tasks/${encodeURIComponent(payload.taskId)}`);
    if (isCompact.value) await closeNavigation();
  } catch {
    saveError.value = 'No se pudo cambiar de tarea. Reintenta.';
  }
}

async function onSelectProject(projectId: string) {
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
    if (isCompact.value) await closeNavigation();
  } catch {
    saveError.value = 'No se pudo cambiar de proyecto. Reintenta.';
  }
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    void closeNavigation();
    return;
  }
  if (event.key !== 'Tab') return;

  const drawer = sidebarDrawerRef.value;
  if (!drawer) return;
  const controls = Array.from(drawer.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'summary',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '))).filter((element) => element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!drawer.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

async function openNavigation() {
  sidebarOpen.value = true;
  await nextTick();
  sidebarCloseButtonRef.value?.focus();
}

async function closeNavigation() {
  sidebarOpen.value = false;
  await nextTick();
  if (isCompact.value) {
    focusSidebarToggle();
  }
}

async function openLibrary() {
  await navigateTo('/library');
}

onMounted(() => {
  compactMediaQuery = window.matchMedia('(max-width: 1023px)');
  mobileMediaQuery = window.matchMedia('(max-width: 767px)');
  compactMediaQuery.addEventListener('change', updateResponsiveMode);
  mobileMediaQuery.addEventListener('change', updateResponsiveMode);
  updateResponsiveMode();
});

onBeforeUnmount(() => {
  compactMediaQuery?.removeEventListener('change', updateResponsiveMode);
  mobileMediaQuery?.removeEventListener('change', updateResponsiveMode);
});

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
  <div class="workspace-shell" :class="{ 'workspace-shell--sidebar-collapsed': sidebarCollapsed || isCompact }">
    <aside v-if="!isCompact && !sidebarCollapsed" class="workspace-sidebar-frame">
      <DashboardSidebar
        :project-groups="projectGroups"
        :selected-project-id="activeProject?.id"
        :expanded-project-ids="expandedProjectIds"
        :search-query="searchQuery"
        :collapsed="sidebarCollapsed"
        library-href="/library"
        :settings-disabled="true"
        :settings-unavailable-reason="settingsUnavailableReason"
        @create-project="createProject"
        @open-new-task="openNewTask"
        @open-library="openLibrary"
        @rename-project="renameProject"
        @select-project="onSelectProject"
        @select-task="onSelectTask"
        @search-tasks="searchQuery = $event"
        @update-collapsed="updateSidebarCollapsed"
      />
    </aside>

    <div
      v-if="isCompact && sidebarOpen"
      ref="sidebarDrawerRef"
      class="workspace-navigation-drawer"
      :class="{ 'workspace-navigation-drawer--mobile': isMobile }"
      role="dialog"
      aria-label="Navegación del workspace"
      :aria-modal="isMobile ? 'true' : 'false'"
      @keydown="onSidebarKeydown"
    >
      <button
        ref="sidebarCloseButtonRef"
        type="button"
        class="workspace-navigation-drawer__close"
        aria-label="Cerrar navegación"
        @click="closeNavigation"
      >
        ×
      </button>
      <div class="workspace-navigation-drawer__content">
        <DashboardSidebar
          :project-groups="projectGroups"
          :selected-project-id="activeProject?.id"
          :expanded-project-ids="expandedProjectIds"
          :search-query="searchQuery"
          :collapsed="sidebarCollapsed"
          library-href="/library"
          :settings-disabled="true"
          :settings-unavailable-reason="settingsUnavailableReason"
          @create-project="createProject"
          @open-new-task="openNewTask"
          @open-library="openLibrary"
          @rename-project="renameProject"
          @select-project="onSelectProject"
          @select-task="onSelectTask"
          @search-tasks="searchQuery = $event"
          @update-collapsed="updateSidebarCollapsed"
        />
      </div>
    </div>

    <main class="workspace-panel">
      <WorkspaceHeader
        ref="workspaceHeaderRef"
        :project-name="activeProject?.name ?? 'Primer proyecto'"
        task-name="Sin tarea seleccionada"
        :phase="1"
        phase-title="Crea la primera tarea"
        :compact-navigation="isCompact"
        :sidebar-collapsed="sidebarCollapsed"
        :settings-disabled="true"
        :settings-unavailable-reason="settingsUnavailableReason"
        @open-navigation="openNavigation"
        @expand-sidebar="updateSidebarCollapsed(false)"
        @open-new-task="openNewTask(selectedProjectId || initialProjectId)"
        @open-library="openLibrary"
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

.workspace-shell--sidebar-collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.workspace-sidebar-frame {
  min-width: 0;
  min-height: 0;
  height: 100%;
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

.workspace-shell--sidebar-collapsed .workspace-panel {
  border-radius: .95rem;
}

.workspace-navigation-drawer {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: min(22rem, 86vw);
  border-right: 1px solid #ccd8d0;
  background: #f8faf8;
  box-shadow: 24px 0 60px rgba(17, 34, 24, .18);
}

.workspace-navigation-drawer--mobile {
  width: min(100%, 24rem);
}

.workspace-navigation-drawer__close {
  position: absolute;
  z-index: 2;
  top: max(.65rem, env(safe-area-inset-top));
  right: .65rem;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #cbd7d0;
  border-radius: .6rem;
  background: #fff;
}

.workspace-navigation-drawer__content {
  height: 100dvh;
  overflow: auto;
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
    grid-template-columns: 1fr;
    height: 100dvh;
    min-height: 0;
    overflow: hidden;
    padding: 0;
  }

  .workspace-sidebar-frame {
    display: none;
  }

  .workspace-panel {
    border-radius: 0;
  }

  .workspace-shell--sidebar-collapsed .workspace-panel {
    border-radius: 0;
  }

  .workspace-empty {
    min-height: 50dvh;
  }
}
</style>
