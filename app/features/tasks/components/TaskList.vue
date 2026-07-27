<script setup lang="ts">
import type { TaskIndex } from '../domain/task.schema';
defineProps<{ index: TaskIndex }>();
</script>

<template>
  <section aria-labelledby="task-list-title">
    <h2 id="task-list-title">Tareas activas</h2>
    <p v-if="!index.tareas.length">Todavía no hay tareas. Crea la primera para comenzar.</p>
    <ul v-else>
      <li v-for="task in index.tareas" :key="task.id">
        <NuxtLink :to="`/tasks/${encodeURIComponent(task.id)}`">{{ task.nombre }}</NuxtLink>
        <span> · fase {{ task.fase }} · {{ task.estado }}</span>
      </li>
    </ul>
  </section>
</template>
