<script setup lang="ts">
import { computed } from 'vue';
import type { TaskIndex } from '../domain/task.schema';

defineEmits<{
  openSettings: [Event];
}>();

const phases = [
  { phase: 1, label: 'Orientación' },
  { phase: 2, label: 'Rastreo' },
  { phase: 3, label: 'Qué hice' },
  { phase: 4, label: 'Final del proyecto' },
] as const;

const props = withDefaults(
  defineProps<{
    activeTasks: TaskIndex['tareas'];
  completedItems: TaskIndex['registros'];
  selectedTaskId?: string;
  projectName?: string;
  }>(),
  {
    selectedTaskId: '',
    projectName: 'Proyecto',
  },
);

const hasActiveTasks = computed(() => props.activeTasks.length > 0);
const completedList = computed(() => props.completedItems);
const hasCompleted = computed(() => completedList.value.length > 0);
const selectedTaskLabel = computed(() => `Tarea activa: ${props.activeTasks.find((task) => task.id === props.selectedTaskId)?.nombre || 'Sin nombre'}`);
const selectedTask = computed(() => props.activeTasks.find((task) => task.id === props.selectedTaskId));
</script>

<template>
  <aside class="task-sidebar" role="navigation" aria-label="Navegación de tareas">
    <div class="task-sidebar__brand">
      <NuxtLink to="/" class="task-sidebar__brand-link">Nexus</NuxtLink>
      <p>{{ projectName }}</p>
    </div>

    <nav class="task-sidebar__primary" aria-label="Accesos principales">
      <NuxtLink to="/" class="task-sidebar__primary-link">
        <span aria-hidden="true">□</span>
        Tareas
      </NuxtLink>
      <NuxtLink to="/library" class="task-sidebar__primary-link" tabindex="-1">
        <span aria-hidden="true">▱</span>
        Biblioteca
      </NuxtLink>
      <NuxtLink to="/reference" class="task-sidebar__primary-link" tabindex="-1">
        <span aria-hidden="true">⌑</span>
        Referencias
      </NuxtLink>
    </nav>

    <NuxtLink to="/tasks/new" class="task-sidebar__new-task" tabindex="-1">
      <span aria-hidden="true">+</span>
      Nueva tarea
    </NuxtLink>

    <section class="task-sidebar__group">
      <h3>Proyecto</h3>
      <div class="task-sidebar__phase-map" aria-label="Progreso por fases">
        <details
          v-for="phaseItem in phases"
          :key="phaseItem.phase"
          :open="selectedTask?.fase === phaseItem.phase"
          :class="{ 'task-sidebar__phase': true, 'task-sidebar__phase--active': selectedTask?.fase === phaseItem.phase }"
        >
          <summary>
            <span aria-hidden="true">⌄</span>
            Fase {{ phaseItem.phase }} · {{ phaseItem.label }}
            <small v-if="selectedTask?.fase === phaseItem.phase">En ejecución</small>
          </summary>
          <ol>
            <li v-for="step in 3" :key="step" :class="{ 'task-sidebar__dot-row': true, 'task-sidebar__dot-row--done': selectedTask && selectedTask.fase > phaseItem.phase, 'task-sidebar__dot-row--current': selectedTask?.fase === phaseItem.phase && step === 1 }">
              <span aria-hidden="true"></span>
              <i aria-hidden="true"></i>
            </li>
          </ol>
        </details>
      </div>
    </section>

    <section class="task-sidebar__group task-sidebar__task-group">
      <h3>Activas</h3>
      <p v-if="!hasActiveTasks" role="status">No hay tareas activas</p>
      <ul v-else>
        <li v-for="task in props.activeTasks" :key="task.id">
          <NuxtLink
            :to="`/tasks/${encodeURIComponent(task.id)}`"
            :aria-current="task.id === selectedTaskId ? 'page' : undefined"
            :tabindex="task.id === selectedTaskId ? 0 : -1"
            :class="{ 'task-sidebar__task-link': true, 'task-sidebar__task-link--active': task.id === selectedTaskId }"
          >
            <span>{{ task.nombre || task.id }}</span>
            <span v-if="task.id === selectedTaskId" class="task-sidebar__active-indicator" aria-hidden="true">· activa</span>
            <span class="sr-only" v-if="task.id === selectedTaskId">{{ selectedTaskLabel }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="task-sidebar__group">
      <h3>Completadas</h3>
      <p v-if="!hasCompleted" role="status">No hay tareas completadas</p>
      <ul v-else>
        <li v-for="record in completedList" :key="record.id">
          <NuxtLink
            :to="`/tasks/${encodeURIComponent(record.tareaId || record.id)}`"
            tabindex="-1"
          >
            {{ record.titulo || record.id }}
          </NuxtLink>
        </li>
      </ul>
    </section>

    <footer class="task-sidebar__footer">
      <button type="button" class="task-sidebar__settings" data-focus-target="settings" @click="$emit('openSettings', $event)">Ajustes</button>
      <a href="/legacy" tabindex="-1">Aprendizajes guardados</a>
      <slot />
    </footer>
  </aside>
</template>

<style scoped>
.task-sidebar {
  display: grid;
  grid-template-rows: auto auto auto auto 1fr auto;
  gap: 1.1rem;
  min-height: 100%;
  padding: 1.35rem 1.25rem;
  color: #161f1a;
  background: linear-gradient(180deg, #fbfcfa 0%, #f7faf7 100%);
}

.task-sidebar__brand {
  display: grid;
  gap: .25rem;
}

.task-sidebar__brand-link {
  color: #003f27;
  font-size: 1.75rem;
  font-weight: 850;
  line-height: 1;
  text-decoration: none;
}

.task-sidebar__brand p,
.task-sidebar__group p {
  margin: 0;
  color: #69746d;
  font-size: .82rem;
}

.task-sidebar__primary,
.task-sidebar__group,
.task-sidebar__footer {
  display: grid;
  gap: .55rem;
}

.task-sidebar__primary-link,
.task-sidebar__new-task,
.task-sidebar__task-link,
.task-sidebar__settings,
.task-sidebar__footer a,
.task-sidebar__group a {
  display: flex;
  align-items: center;
  gap: .65rem;
  min-height: 2.35rem;
  color: #1f2924;
  text-decoration: none;
}

.task-sidebar__settings {
  width: 100%;
  border: 1px solid #c7d8ce;
  border-radius: .5rem;
  padding: .35rem .5rem;
  color: #003f27;
  font-weight: 750;
  background: #f7fffb;
}

.task-sidebar__primary-link span,
.task-sidebar__new-task span {
  display: grid;
  place-items: center;
  width: 1.1rem;
  color: #005f3e;
  font-size: 1.1rem;
}

.task-sidebar__new-task {
  justify-content: center;
  border: 1px solid #005f3e;
  border-radius: .45rem;
  color: #003f27;
  font-weight: 700;
  background: #f7fffb;
}

.task-sidebar__group {
  padding-top: .8rem;
  border-top: 1px solid #dfe5df;
}

.task-sidebar__group h3 {
  margin: 0;
  color: #4f5b54;
  font-size: .9rem;
  font-weight: 650;
}

.task-sidebar__phase-map,
.task-sidebar__group ul {
  display: grid;
  gap: .3rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.task-sidebar__phase {
  border: 1px solid transparent;
  border-radius: .45rem;
  padding: .35rem .4rem;
}

.task-sidebar__phase--active {
  border-color: #cddbd2;
  border-left: 4px solid #007a4d;
  background: #fbfefd;
  box-shadow: 0 12px 28px rgba(0, 63, 39, .06);
}

.task-sidebar__phase summary {
  display: flex;
  align-items: center;
  gap: .45rem;
  color: #1e2822;
  font-size: .86rem;
  font-weight: 700;
  cursor: default;
  list-style: none;
}

.task-sidebar__phase summary::-webkit-details-marker {
  display: none;
}

.task-sidebar__phase small {
  margin-left: auto;
  border: 1px solid #9ac7b2;
  border-radius: .35rem;
  padding: .1rem .35rem;
  color: #005f3e;
  font-size: .68rem;
  font-weight: 700;
}

.task-sidebar__phase ol {
  display: grid;
  gap: .42rem;
  margin: .55rem 0 .25rem 1.45rem;
  padding: 0;
  list-style: none;
}

.task-sidebar__dot-row {
  display: grid;
  grid-template-columns: 1rem minmax(3rem, 5rem);
  align-items: center;
  gap: .55rem;
}

.task-sidebar__dot-row span {
  width: .52rem;
  height: .52rem;
  border: 1px solid #9fa8a1;
  border-radius: 999px;
  background: #fff;
}

.task-sidebar__dot-row i {
  display: block;
  height: .25rem;
  border-radius: 999px;
  background: #c4c8ca;
}

.task-sidebar__dot-row--done span,
.task-sidebar__dot-row--current span {
  border-color: #007a4d;
  background: #007a4d;
}

.task-sidebar__dot-row--done i,
.task-sidebar__dot-row--current i {
  background: #7aa692;
}

.task-sidebar__task-group {
  align-self: start;
}

.task-sidebar__task-link {
  border-radius: .45rem;
  padding: .35rem .5rem;
  font-size: .86rem;
  font-weight: 650;
}

.task-sidebar__task-link--active {
  color: #003f27;
  background: #edf8f2;
}

.task-sidebar__active-indicator {
  margin-left: auto;
  color: #007a4d;
  font-size: .75rem;
}

.task-sidebar__footer {
  padding-top: 1rem;
  border-top: 1px solid #dfe5df;
}

.task-sidebar__footer a {
  color: #46514b;
  font-size: .84rem;
}
</style>
