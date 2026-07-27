<script setup lang="ts">
import { useTaskIndex } from '~/app/features/tasks/composables/useTaskIndex';

const { activeTasks, error: indexError, refresh: refreshIndex } = useTaskIndex();

await refreshIndex();

const firstActiveTask = activeTasks.value[0];
if (firstActiveTask) {
  await navigateTo(`/tasks/${encodeURIComponent(firstActiveTask.id)}`, { replace: true });
}
</script>

<template>
  <main>
    <h1>Bitácora</h1>
    <template v-if="indexError">
      <p role="alert">{{ indexError }}</p>
    </template>
    <template v-else>
      <p v-if="activeTasks.length === 0">Todavía no hay tareas activas. Crea la primera para comenzar.</p>
      <NuxtLink to="/tasks/new">Nueva tarea</NuxtLink>
    </template>
  </main>
</template>
