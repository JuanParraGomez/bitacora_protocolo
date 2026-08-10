<script setup lang="ts">
useHead({
  title: 'Biblioteca',
});

const projectsResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent('bitacora:projects')}`).catch(() => ({ value: null }));
const indexResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent('bitacora:index')}`).catch(() => ({ value: null }));

const projects = projectsResponse.value ? JSON.parse(projectsResponse.value) as {
  activeProjectId?: string | null;
} : { activeProjectId: null };

const index = indexResponse.value ? JSON.parse(indexResponse.value) as {
  tareas?: Array<{
    id: string;
    projectId?: string;
    nombre?: string;
    estado?: string;
  }>;
} : { tareas: [] };

const availableTasks = (index.tareas || []).filter((task) => task.estado !== 'completada');
const preferredTask = availableTasks.find((task) => task.projectId === projects.activeProjectId) ?? availableTasks[0] ?? null;
const emptyState = !preferredTask;
const preferredTaskLink = preferredTask
  ? `/tasks/${encodeURIComponent(preferredTask.id)}?overlay=library`
  : null;
</script>

<template>
  <main class="library-page">
    <p class="library-page__eyebrow">Entrada global</p>
    <h1>Biblioteca</h1>

    <p v-if="preferredTask" class="library-page__lede">
      Abre una tarea disponible para consultar la biblioteca como overlay sin perder el contexto del workspace.
    </p>
    <p v-else class="library-page__lede">
      No hay tareas disponibles todavía. Vuelve al workspace o crea una tarea para empezar a reutilizar conocimiento.
    </p>

    <div class="library-page__actions">
      <NuxtLink to="/" class="library-page__action">
        Volver al workspace
      </NuxtLink>
      <NuxtLink v-if="preferredTaskLink" :to="preferredTaskLink" class="library-page__action library-page__action--primary">
        Abrir {{ preferredTask?.nombre || 'tarea disponible' }}
      </NuxtLink>
      <NuxtLink v-else to="/tasks/new" class="library-page__action library-page__action--primary">
        Crear primera tarea
      </NuxtLink>
    </div>

    <section v-if="preferredTask" class="library-page__summary" aria-labelledby="library-page-summary-title">
      <h2 id="library-page-summary-title">Tarea recomendada</h2>
      <p>
        {{ preferredTask.nombre || preferredTask.id }}
      </p>
    </section>

    <section v-else class="library-page__empty" aria-labelledby="library-page-empty-title">
      <h2 id="library-page-empty-title">Todavía no hay tareas para consultar</h2>
      <p>
        Usa la acción principal para crear la primera tarea y regresar aquí con contenido útil.
      </p>
    </section>
  </main>
</template>

<style scoped>
.library-page {
  width: min(100% - 2rem, 56rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 4rem) 0 4rem;
}

.library-page__eyebrow {
  margin: 0 0 .45rem;
  color: #067b46;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.library-page h1 {
  margin: 0;
  color: #101812;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  letter-spacing: -.04em;
  line-height: 1.05;
}

.library-page__lede,
.library-page__summary p,
.library-page__empty p {
  margin: .8rem 0 0;
  color: #4e5b54;
  line-height: 1.6;
}

.library-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin-top: 1.5rem;
}

.library-page__action {
  display: inline-flex;
  align-items: center;
  min-height: 2.4rem;
  padding: .6rem 1rem;
  border: 1px solid #dfe6e1;
  border-radius: .55rem;
  color: #334139;
  font-weight: 600;
  text-decoration: none;
  background: #fff;
}

.library-page__action:hover {
  background: #f1f4f2;
}

.library-page__action--primary {
  border-color: #047d47;
  color: #fff;
  background: #047d47;
}

.library-page__action--primary:hover {
  background: #067b46;
}

.library-page__summary,
.library-page__empty {
  margin-top: 1.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid #e3e8e4;
  border-radius: .9rem;
  background: #fff;
}

.library-page__summary h2,
.library-page__empty h2 {
  margin: 0;
  color: #152019;
  font-size: 1rem;
  font-weight: 600;
}
</style>
