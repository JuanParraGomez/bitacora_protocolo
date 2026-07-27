<script setup lang="ts">
import { createBlankTask } from '../domain/task-rules';
import { taskIndexSchema } from '../domain/task.schema';
import { STORAGE_KEYS } from '~/shared/contracts/storage';
const emit = defineEmits<{ created: [id: string] }>();
const name = ref('');
const directive = ref('');
const error = ref('');
const route = useRoute();

const templateId = String(route.query.template || '');
if (templateId) {
  const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(`bitacora:t:${templateId}`)}`).catch(() => ({ value: null }));
  if (response.value) {
    try {
      const template = JSON.parse(response.value) as { nombre?: string; directiva?: string };
      name.value = template.nombre || '';
      directive.value = template.directiva || '';
    } catch { /* malformed templates remain unavailable rather than breaking intake */ }
  }
}

async function submit() {
  error.value = '';
  if (!name.value.trim()) { error.value = 'El nombre es obligatorio.'; return; }
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const task = { ...createBlankTask(name.value.trim(), directive.value.trim()), id };
  const current = await $fetch<{ value: unknown } | null>('/api/storage/bitacora%3Aindex').catch(() => null);
  let index: { tareas: unknown[]; registros: unknown[] } = { tareas: [], registros: [] };
  if (current?.value) {
    try {
      const parsed = taskIndexSchema.safeParse(JSON.parse(String(current.value)));
      if (parsed.success) index = { tareas: parsed.data.tareas, registros: parsed.data.registros };
    } catch { index = { tareas: [], registros: [] }; }
  }
  index.tareas.unshift(task);
  await $fetch('/api/storage/bitacora%3Aindex', { method: 'PUT', body: { value: JSON.stringify(index) } });
  await $fetch(`/api/storage/${encodeURIComponent(STORAGE_KEYS.task(id))}`, { method: 'PUT', body: { value: JSON.stringify(task) } });
  await navigateTo(`/tasks/${encodeURIComponent(id)}`);
  emit('created', id);
}
</script>

<template>
  <form @submit.prevent="submit">
    <label for="task-name">Nombre</label>
  <input id="task-name" v-model="name" />
    <label for="task-directive">Directiva</label>
    <textarea id="task-directive" v-model="directive" />
    <p v-if="error" role="alert">{{ error }}</p>
    <button type="submit">Crear tarea</button>
  </form>
</template>
