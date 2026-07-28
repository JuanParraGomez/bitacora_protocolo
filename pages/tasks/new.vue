<script setup lang="ts">
import NewTaskModal from '~/app/features/tasks/components/NewTaskModal.vue';
import { LEGACY_PROJECT_ID } from '~/app/features/tasks/domain/project.schema';
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';

const route = useRoute();

const {
  projectGroups,
  refresh,
  error: indexError,
} = useTaskIndex();

await refresh();

const preferredProjectId = computed(() => String(route.query.projectId || ''));

const selectedProjectId = computed(() => {
  if (preferredProjectId.value) {
    const requested = projectGroups.value.find((group) => group.project.id === preferredProjectId.value);
    if (requested) return requested.project.id;
  }

  const activeProject = projectGroups.value.find((group) => group.project.id !== LEGACY_PROJECT_ID
    && group.project.status === 'active');
  return activeProject?.project.id || '';
});

const hasActiveProject = computed(() => projectGroups.value.some((group) => (
  group.project.id !== LEGACY_PROJECT_ID && group.project.status === 'active'
)));

async function closeNewTask() {
  await navigateTo('/');
}
</script>

<template>
  <main class="tasks-new-page" data-hydrated="true">
    <p v-if="indexError" role="alert">{{ indexError }}</p>
    <section v-else-if="!hasActiveProject" class="tasks-new-page__empty-state">
      <p role="status">Aun no hay proyectos activos para crear una tarea.</p>
      <NuxtLink to="/">Ir al workspace para crear un proyecto</NuxtLink>
    </section>
    <NewTaskModal
      v-else
      :open="true"
      :project-groups="projectGroups"
      :selected-project-id="selectedProjectId"
      @update:open="closeNewTask"
    />
  </main>
</template>

<style scoped>
.tasks-new-page {
  position: relative;
  min-height: calc(100dvh - 1rem);
}

.tasks-new-page__empty-state {
  display: grid;
  gap: .75rem;
  width: min(48rem, 100%);
  margin: 0 auto;
  padding: 1.25rem;
}

.tasks-new-page__empty-state a {
  color: #005f3a;
  text-decoration: none;
}

.tasks-new-page__empty-state a:hover {
  text-decoration: underline;
}
</style>
