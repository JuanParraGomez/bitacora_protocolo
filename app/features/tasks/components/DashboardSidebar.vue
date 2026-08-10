<script lang="ts">
import type { Project } from '../domain/project.schema';
import type { TaskIndex } from '../domain/task.schema';

export type WorkspaceProjectGroup = {
  project: Project;
  activeTasks: TaskIndex['tareas'];
  pausedTasks: TaskIndex['tareas'];
  completedTasks: TaskIndex['tareas'];
  completedItems: TaskIndex['registros'];
  isEmpty: boolean;
};
</script>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import WorkspaceShellIcon from './WorkspaceShellIcon.vue';

const props = withDefaults(defineProps<{
  projectGroups: WorkspaceProjectGroup[];
  selectedProjectId?: string;
  selectedTaskId?: string;
  expandedProjectIds?: string[];
  searchQuery?: string;
  collapsed?: boolean;
  libraryHref?: string | null;
  settingsDisabled?: boolean;
  settingsUnavailableReason?: string;
  userName?: string;
  userEmail?: string;
}>(), {
  selectedProjectId: '',
  selectedTaskId: '',
  expandedProjectIds: () => [],
  searchQuery: undefined,
  collapsed: false,
  libraryHref: null,
  settingsDisabled: false,
  settingsUnavailableReason: 'Abre una tarea para usar Ajustes.',
  userName: 'Juan Parra',
  userEmail: 'juan@rappinc.com',
});

const emit = defineEmits<{
  openSettings: [Event];
  openNewTask: [projectId: string];
  openLibrary: [];
  createProject: [name: string];
  renameProject: [payload: { projectId: string; name: string }];
  renameTask: [payload: { taskId: string; name: string }];
  selectProject: [projectId: string];
  selectTask: [payload: { projectId: string; taskId: string }];
  toggleProject: [payload: { projectId: string; expanded: boolean }];
  searchTasks: [query: string];
  updateCollapsed: [collapsed: boolean];
}>();

const createProjectOpen = ref(false);
const createProjectName = ref('');
const localSearch = ref('');
const projectRename = reactive<Record<string, string>>({});
const projectRenameOpen = reactive<Record<string, boolean>>({});
const taskRename = reactive<Record<string, string>>({});
const taskRenameOpen = reactive<Record<string, boolean>>({});

watch(() => props.searchQuery, (next) => {
  if (typeof next === 'string') localSearch.value = next;
}, { immediate: true });

const effectiveSearch = computed(() => props.searchQuery ?? localSearch.value);
const normalizedSearch = computed(() => effectiveSearch.value.trim().toLocaleLowerCase('es'));
const activeGroups = computed(() => props.projectGroups.filter((group) => group.project.status === 'active'));
const archivedGroups = computed(() => props.projectGroups.filter((group) => group.project.status === 'archived'));

function taskStateLabel(state: string): string {
  if (state === 'pausada') return 'Pausada';
  if (state === 'completada') return 'Completada';
  return 'Activa';
}

function projectTasks(group: WorkspaceProjectGroup) {
  const tasks = [...group.activeTasks, ...group.pausedTasks, ...group.completedTasks];
  if (!normalizedSearch.value) return tasks;
  return tasks.filter((task) => (
    task.nombre.toLocaleLowerCase('es').includes(normalizedSearch.value)
    || task.id.toLocaleLowerCase('es').includes(normalizedSearch.value)
  ));
}

function isExpanded(group: WorkspaceProjectGroup): boolean {
  if (normalizedSearch.value && projectTasks(group).length > 0) return true;
  return props.expandedProjectIds.includes(group.project.id)
    || group.project.id === props.selectedProjectId;
}

function updateSearch(value: string) {
  localSearch.value = value;
  emit('searchTasks', value);
}

function submitProject() {
  const name = createProjectName.value.trim();
  if (!name) return;
  emit('createProject', name);
  createProjectName.value = '';
  createProjectOpen.value = false;
}

function startProjectRename(group: WorkspaceProjectGroup) {
  projectRename[group.project.id] = group.project.name;
  projectRenameOpen[group.project.id] = true;
}

function submitProjectRename(group: WorkspaceProjectGroup) {
  const name = (projectRename[group.project.id] ?? '').trim();
  if (!name) return;
  emit('renameProject', { projectId: group.project.id, name });
  projectRenameOpen[group.project.id] = false;
}

function startTaskRename(task: TaskIndex['tareas'][number]) {
  taskRename[task.id] = task.nombre || task.id;
  taskRenameOpen[task.id] = true;
}

function submitTaskRename(task: TaskIndex['tareas'][number]) {
  const name = (taskRename[task.id] ?? '').trim();
  if (!name) return;
  emit('renameTask', { taskId: task.id, name });
  taskRenameOpen[task.id] = false;
}

function selectProject(group: WorkspaceProjectGroup) {
  emit('selectProject', group.project.id);
  emit('toggleProject', {
    projectId: group.project.id,
    expanded: !isExpanded(group),
  });
}
</script>

<template>
  <aside class="task-sidebar" role="navigation" aria-label="Navegación de tareas">
    <header class="task-sidebar__brand">
      <div>
        <NuxtLink to="/" class="task-sidebar__brand-link">Nexus</NuxtLink>
        <p>Espacio de trabajo</p>
      </div>
      <button
        type="button"
        class="task-sidebar__collapse"
        aria-label="Contraer navegación"
        @click="emit('updateCollapsed', true)"
      >
        ‹
      </button>
    </header>

    <nav class="task-sidebar__primary" aria-label="Navegación primaria" data-shell-region="navigation">
      <NuxtLink to="/" class="task-sidebar__primary-link" aria-label="Tareas" aria-current="page">
        <WorkspaceShellIcon name="tasks" />
        <span>Tareas</span>
      </NuxtLink>
      <button type="button" class="task-sidebar__primary-link task-sidebar__primary-link--button" @click="emit('openNewTask', selectedProjectId || 'legacy')">
        <span aria-hidden="true">＋</span><span>Nueva tarea</span>
      </button>
    </nav>

    <nav class="task-sidebar__secondary" aria-label="Navegación secundaria">
      <NuxtLink v-if="props.libraryHref" :to="props.libraryHref" class="task-sidebar__primary-link" aria-label="Biblioteca">
        <WorkspaceShellIcon name="library" /><span>Biblioteca</span>
      </NuxtLink>
      <button v-else type="button" class="task-sidebar__primary-link" aria-label="Biblioteca" @click="emit('openLibrary')"><WorkspaceShellIcon name="library" /><span>Biblioteca</span></button>
      <NuxtLink to="/reference" class="task-sidebar__primary-link" aria-label="Referencias"><WorkspaceShellIcon name="references" /><span>Referencias</span></NuxtLink>
      <button
        type="button"
        class="task-sidebar__primary-link"
        aria-label="Ajustes"
        :disabled="props.settingsDisabled"
        :title="props.settingsDisabled ? props.settingsUnavailableReason : undefined"
        :aria-describedby="props.settingsDisabled ? 'task-sidebar-settings-unavailable' : undefined"
        @click="emit('openSettings', $event)"
      >
        <WorkspaceShellIcon name="settings" /><span>Ajustes</span>
      </button>
    </nav>

    <section class="task-sidebar__tools" aria-label="Herramientas de proyectos" data-shell-region="search">
      <button
        type="button"
        class="task-sidebar__create-project"
        @click="createProjectOpen = !createProjectOpen"
      >
        Crear proyecto
      </button>
      <form v-if="createProjectOpen" class="task-sidebar__inline-form" @submit.prevent="submitProject">
        <label for="new-project-name">Nombre del proyecto</label>
        <input id="new-project-name" v-model="createProjectName" maxlength="120" required>
        <div>
          <button type="button" @click="createProjectOpen = false">Cancelar</button>
          <button type="submit">Guardar proyecto</button>
        </div>
      </form>

      <label class="task-sidebar__search-label sr-only" for="task-search">Buscar tareas o proyectos…</label>
      <div class="task-sidebar__search-field" data-search-field>
        <WorkspaceShellIcon name="search" data-search-icon />
        <input id="task-search" type="search" aria-label="Buscar tareas" :value="effectiveSearch" placeholder="Buscar tareas o proyectos…" @input="updateSearch(($event.target as HTMLInputElement).value)">
        <kbd>⌘K</kbd>
      </div>
    </section>

    <div class="task-sidebar__projects" data-shell-region="projects">
      <section
        v-for="group in activeGroups"
        :key="group.project.id"
        class="task-sidebar__project"
        :class="{ 'task-sidebar__project--active': group.project.id === selectedProjectId }"
      >
        <header class="task-sidebar__project-header">
          <button
            type="button"
            class="task-sidebar__project-toggle"
            :aria-label="group.project.name"
            :aria-expanded="isExpanded(group)"
            :aria-controls="`project-tasks-${group.project.id}`"
            @click="selectProject(group)"
          >
            {{ group.project.name }}
          </button>
          <button
            type="button"
            class="task-sidebar__icon-action"
            :aria-label="`Renombrar ${group.project.name}`"
            @click="startProjectRename(group)"
          >
            ✎
          </button>
        </header>
        <p v-if="group.project.description" class="task-sidebar__project-description">
          {{ group.project.description }}
        </p>

        <form
          v-if="projectRenameOpen[group.project.id]"
          class="task-sidebar__inline-form"
          @submit.prevent="submitProjectRename(group)"
        >
          <label :for="`rename-project-${group.project.id}`">Nuevo nombre del proyecto</label>
          <input
            :id="`rename-project-${group.project.id}`"
            v-model="projectRename[group.project.id]"
            maxlength="120"
            required
          >
          <div>
            <button type="button" @click="projectRenameOpen[group.project.id] = false">Cancelar</button>
            <button type="submit">Guardar nombre de proyecto</button>
          </div>
        </form>

        <div
          v-show="isExpanded(group)"
          :id="`project-tasks-${group.project.id}`"
          class="task-sidebar__project-content"
        >
          <p v-if="group.isEmpty" role="status">Este proyecto todavía no tiene tareas.</p>
          <p v-else-if="projectTasks(group).length === 0" role="status">
            No hay tareas que coincidan con la búsqueda.
          </p>
          <ul v-else class="task-sidebar__task-list">
            <li v-for="task in projectTasks(group)" :key="task.id">
              <div class="task-sidebar__task-row">
                <NuxtLink
                  :to="`/tasks/${encodeURIComponent(task.id)}`"
                  :aria-label="task.nombre || task.id"
                  :aria-current="task.id === selectedTaskId ? 'page' : undefined"
                  :class="{ 'task-sidebar__task-link': true, 'task-sidebar__task-link--active': task.id === selectedTaskId }"
                  @click.prevent="emit('selectTask', { projectId: group.project.id, taskId: task.id })"
                >
                  <span>{{ task.nombre || task.id }}</span>
                  <small>{{ taskStateLabel(task.estado) }} · Etapa {{ task.fase }} de 4</small>
                </NuxtLink>
                <button
                  type="button"
                  class="task-sidebar__icon-action"
                  :aria-label="`Renombrar ${task.nombre || task.id}`"
                  @click="startTaskRename(task)"
                >
                  ✎
                </button>
              </div>
              <form
                v-if="taskRenameOpen[task.id]"
                class="task-sidebar__inline-form"
                @submit.prevent="submitTaskRename(task)"
              >
                <label :for="`rename-task-${task.id}`">Nuevo nombre de la tarea</label>
                <input :id="`rename-task-${task.id}`" v-model="taskRename[task.id]" maxlength="160" required>
                <div>
                  <button type="button" @click="taskRenameOpen[task.id] = false">Cancelar</button>
                  <button type="submit">Guardar nombre de tarea</button>
                </div>
              </form>
            </li>
          </ul>

          <details v-if="group.completedItems.length" class="task-sidebar__records">
            <summary>Resultados guardados ({{ group.completedItems.length }})</summary>
            <ul>
              <li v-for="record in group.completedItems" :key="record.id">
                <NuxtLink :to="`/tasks/${encodeURIComponent(record.tareaId || record.id)}`">
                  {{ record.titulo || record.id }}
                </NuxtLink>
              </li>
            </ul>
          </details>
        </div>
      </section>

      <details v-if="archivedGroups.length" class="task-sidebar__archived">
        <summary>Proyectos archivados ({{ archivedGroups.length }})</summary>
        <ul>
          <li v-for="group in archivedGroups" :key="group.project.id">
            <button type="button" @click="emit('selectProject', group.project.id)">
              {{ group.project.name }}
            </button>
          </li>
        </ul>
      </details>
    </div>

    <footer class="task-sidebar__footer" data-shell-region="user-footer">
      <div class="task-sidebar__user">
        <span class="task-sidebar__avatar" aria-hidden="true">JP</span>
        <span><strong data-shell-user-name>{{ props.userName }}</strong><small>{{ props.userEmail }}</small></span>
      </div>
      <p v-if="props.settingsDisabled" id="task-sidebar-settings-unavailable" class="task-sidebar__availability" role="status">
        {{ props.settingsUnavailableReason }}
      </p>
      <slot />
    </footer>
  </aside>
</template>

<style scoped>
.task-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
  padding: 1rem;
  color: #152019;
  background: #f8faf8;
}

.task-sidebar__brand,
.task-sidebar__project-header,
.task-sidebar__task-row,
.task-sidebar__inline-form div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
}

.task-sidebar__brand p,
.task-sidebar__project-description,
.task-sidebar__project-content > p {
  margin: .2rem 0 0;
  color: #68736c;
  font-size: .78rem;
}

.task-sidebar__brand-link {
  color: #063e28;
  font-size: 1.45rem;
  font-weight: 850;
  text-decoration: none;
}

.task-sidebar__collapse,
.task-sidebar__icon-action {
  display: grid;
  place-items: center;
  min-width: 2.25rem;
  min-height: 2.25rem;
  border: 1px solid #d2dcd5;
  border-radius: .55rem;
  background: #fff;
}

.task-sidebar__primary {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.task-sidebar__secondary {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}

.task-sidebar__primary-link {
  display: flex;
  align-items: center;
  gap: .65rem;
  min-height: 2.35rem;
  border-radius: .55rem;
  padding: .4rem .55rem;
  color: #34433a;
  font-size: .78rem;
  text-decoration: none;
}

.task-sidebar__primary-link:hover,
.task-sidebar__primary-link:focus-visible,
.task-sidebar__primary-link[aria-current="page"] {
  color: #075237;
  background: #e7f5ee;
}

.task-sidebar__primary-link--button {
  border: 0;
  padding: 0;
  background: transparent;
}

.task-sidebar__tools,
.task-sidebar__inline-form {
  display: grid;
  gap: .5rem;
}

.task-sidebar__tools {
  padding-block: .75rem;
  border-block: 1px solid #e0e6e2;
  padding-bottom: 1rem;
}

.task-sidebar__tools label,
.task-sidebar__inline-form label {
  color: #34433a;
  font-size: .76rem;
  font-weight: 720;
}

.task-sidebar__search-label.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.task-sidebar__search-field {
  display: flex;
  align-items: center;
  gap: .45rem;
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid #cbd7d0;
  border-radius: .55rem;
  padding: 0 .65rem;
  background: #fff;
}

.task-sidebar__search-field:focus-within {
  border-color: #9bc6b2;
}

.task-sidebar__search-field input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: auto;
  border: 0;
  padding: .55rem 0;
  background: transparent;
  outline: none;
}

.task-sidebar__search-field kbd {
  margin-left: auto;
  border: 1px solid #cbd7d0;
  border-radius: .3rem;
  padding: .12rem .3rem;
  color: #526058;
  background: #fff;
  font-size: .68rem;
}

.task-sidebar__tools input,
.task-sidebar__inline-form input {
  width: 100%;
  min-height: 2.5rem;
  border: 1px solid #cbd7d0;
  border-radius: .55rem;
  padding: .55rem .65rem;
  background: #fff;
}

.task-sidebar__create-project {
  min-height: 2.5rem;
  border: 1px solid #9bc6b2;
  border-radius: .55rem;
  color: #06472e;
  font-weight: 760;
  background: #f4fcf8;
}

.task-sidebar__projects {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-top: .25rem;
}

.task-sidebar__project {
  padding: .65rem 0;
  border-bottom: 1px solid #e0e6e2;
}

.task-sidebar__project--active {
  border-left: 3px solid #087a50;
  padding-left: .55rem;
}

.task-sidebar__project-toggle {
  flex: 1;
  min-width: 0;
  border: 0;
  padding: .4rem 0;
  overflow: hidden;
  color: #19261e;
  font-weight: 790;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
}

.task-sidebar__project-toggle::before {
  margin-right: .45rem;
  content: "›";
}

.task-sidebar__project-toggle[aria-expanded="true"]::before {
  content: "⌄";
}

.task-sidebar__project-content {
  display: grid;
  gap: .55rem;
  padding-top: .5rem;
}

.task-sidebar__task-list,
.task-sidebar__records ul,
.task-sidebar__archived ul {
  display: grid;
  gap: .35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.task-sidebar__task-row {
  align-items: stretch;
}

.task-sidebar__task-link {
  display: grid;
  flex: 1;
  gap: .15rem;
  min-width: 0;
  border-radius: .5rem;
  padding: .5rem .6rem;
  color: #243129;
  text-decoration: none;
}

.task-sidebar__task-link span {
  overflow: hidden;
  font-size: .83rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-sidebar__task-link small {
  color: #526058;
  font-size: .68rem;
}

.task-sidebar__task-link--active {
  color: #053c27;
  background: #e7f5ee;
}

.task-sidebar__inline-form {
  margin-top: .4rem;
  border: 1px solid #d8e1db;
  border-radius: .6rem;
  padding: .65rem;
  background: #fff;
}

.task-sidebar__inline-form button {
  min-height: 2.25rem;
  border-radius: .45rem;
}

.task-sidebar__records summary,
.task-sidebar__archived summary {
  padding: .45rem 0;
  color: #526058;
  font-size: .75rem;
  cursor: pointer;
}

.task-sidebar__footer {
  display: grid;
  gap: .55rem;
  padding-top: .75rem;
  border-top: 1px solid #e0e6e2;
}

.task-sidebar__user {
  display: flex;
  align-items: center;
  gap: .6rem;
  min-width: 0;
}

.task-sidebar__avatar {
  display: grid;
  flex: 0 0 2rem;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: 50%;
  color: #075237;
  background: #cfe9da;
  font-size: .68rem;
  font-weight: 800;
}

.task-sidebar__user span:last-child {
  display: grid;
  min-width: 0;
}

.task-sidebar__user strong,
.task-sidebar__user small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-sidebar__user strong { font-size: .78rem; }
.task-sidebar__user small { color: #68736c; font-size: .68rem; }

.task-sidebar__footer a {
  color: #526058;
  font-size: .78rem;
}

.task-sidebar__availability {
  margin: 0;
  color: #66736c;
  font-size: .72rem;
}

@media (max-width: 1023px) {
  .task-sidebar {
    min-height: 100dvh;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .task-sidebar__collapse {
    display: none;
  }
}
</style>
