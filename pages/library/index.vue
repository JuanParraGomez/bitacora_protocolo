<script setup lang="ts">
const projectsResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent('bitacora:projects')}`).catch(() => ({ value: null }));
const indexResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent('bitacora:index')}`).catch(() => ({ value: null }));
const projects = projectsResponse.value ? JSON.parse(projectsResponse.value) as {
  activeProjectId?: string | null;
} : { activeProjectId: null };
const index = indexResponse.value ? JSON.parse(indexResponse.value) as {
  tareas?: Array<{ id: string; projectId?: string; estado?: string }>;
} : { tareas: [] };
const fallbackTask = (index.tareas || []).find((task) => task.projectId === projects.activeProjectId && task.estado !== 'completada')
  || (index.tareas || []).find((task) => task.estado !== 'completada')
  || (index.tareas || [])[0]
  || null;

if (fallbackTask?.id) {
  await navigateTo({
    path: `/tasks/${encodeURIComponent(fallbackTask.id)}`,
    query: {
      overlay: 'library',
    },
  }, { replace: true });
}
</script>

<template>
  <main><h1>Biblioteca</h1><p>Abre una tarea del workspace para consultar la biblioteca como overlay.</p></main>
</template>
