<script setup lang="ts">
const route = useRoute();
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
      record: String(route.params.id),
    },
  }, { replace: true });
}
</script>

<template>
  <main class="library-record-page">
    <h1>Biblioteca</h1>
    <p>Abre una tarea del workspace para revisar este registro en contexto.</p>
  </main>
</template>

<style scoped>
.library-record-page {
  width: min(100% - 2rem, 56rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 4rem) 0 4rem;
}

.library-record-page h1 {
  margin: 0;
  color: #101812;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  letter-spacing: -.04em;
  line-height: 1.05;
}

.library-record-page p {
  margin: .8rem 0 0;
  color: #4e5b54;
  line-height: 1.6;
}
</style>
