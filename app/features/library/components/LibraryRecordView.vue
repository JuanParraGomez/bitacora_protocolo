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

<style scoped>
article {
  display: grid;
  gap: .55rem;
  align-content: start;
}

article h1 {
  margin: 0;
  color: #101812;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -.01em;
}

article p {
  margin: 0;
  color: #4e5b54;
  font-size: .88rem;
  line-height: 1.5;
}

article p strong {
  color: #334139;
  font-weight: 600;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  margin-top: .35rem;
}

.toolbar a,
.toolbar button {
  display: inline-flex;
  align-items: center;
  min-height: 2.4rem;
  padding: .55rem .95rem;
  border: 1px solid #dfe6e1;
  border-radius: .55rem;
  background: #fff;
  color: #334139;
  font: inherit;
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.toolbar a:hover,
.toolbar button:hover {
  background: #f1f4f2;
}

.toolbar button {
  border-color: #047d47;
  background: #047d47;
  color: #fff;
}

.toolbar button:hover {
  background: #067b46;
}

textarea {
  min-height: 14rem;
  border: 1px solid #dfe6e1;
  border-radius: .8rem;
  padding: .9rem;
  resize: vertical;
  background: #fff;
  color: #173026;
  font: inherit;
  font-size: .88rem;
  line-height: 1.55;
}
</style>
