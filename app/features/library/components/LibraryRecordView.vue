<script setup lang="ts">
import { sanitizeDownloadName } from '../services/library-store';
import type { LibraryRecord } from '../domain/library-record.schema';
const props = defineProps<{ record: LibraryRecord }>();
const emit = defineEmits<{
  link: [id: string];
}>();
const filename = computed(() => sanitizeDownloadName(props.record.titulo));

const resourceKindLabel = computed(() => {
  switch (props.record.resourceKind) {
    case 'method':
      return 'Metodo';
    case 'tool':
      return 'Herramienta';
    case 'automation-candidate':
      return 'Automatizacion';
    default:
      return 'Aprendizaje';
  }
});

const automationEvidenceLabel = computed(() => {
  if (!props.record.automationEvidence) return null;
  return props.record.automationEvidence.status === 'candidate-with-evidence'
    ? 'Candidato con evidencia'
    : 'Hipotesis';
});
</script>

<template>
  <article>
    <h1>{{ record.titulo }}</h1>
    <p><strong>Tipo:</strong> {{ resourceKindLabel }}</p>
    <p><strong>Proyecto:</strong> {{ record.projectId }}</p>
    <p><strong>Tarea origen:</strong> {{ record.sourceTaskId }}</p>
    <p v-if="record.sourceMethodVersionId"><strong>Version de metodo:</strong> {{ record.sourceMethodVersionId }}</p>
    <p v-if="automationEvidenceLabel"><strong>Evidencia:</strong> {{ automationEvidenceLabel }}</p>
    <div class="toolbar">
      <a :download="filename" :href="`data:text/markdown;charset=utf-8,${encodeURIComponent(record.markdown)}`">Descargar Markdown</a>
      <NuxtLink :to="`/tasks/new?template=${encodeURIComponent(record.taskId)}`">Usar como plantilla</NuxtLink>
      <button type="button" @click="emit('link', record.id)">Vincular a esta tarea</button>
    </div>
    <textarea aria-label="Markdown del registro" readonly :value="record.markdown" />
  </article>
</template>
