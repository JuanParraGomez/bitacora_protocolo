<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../domain/task.schema';
import type { PhaseEvaluation } from '../domain/task-assistant.schema';
import { phaseInstructions } from '../domain/phase-instructions';

const props = withDefaults(defineProps<{
  task: Task;
  evaluation?: PhaseEvaluation | null;
  isStaleEvaluation?: boolean;
  canContinue?: boolean;
}>(), {
  evaluation: null,
  isStaleEvaluation: false,
  canContinue: false,
});

const phase = computed(() => props.task.fase);
const phaseLabel = computed(() => phaseInstructions[phase.value as keyof typeof phaseInstructions]?.[0]?.title ?? `Fase ${phase.value}`);
const currentMessages = computed(() => props.task.assistant.messages
  .filter((message) => message.taskId === props.task.id && message.phase === phase.value && message.role === 'assistant')
  .slice()
  .sort((left, right) => left.createdAt - right.createdAt));
const primaryQuestion = computed(() => [...currentMessages.value]
  .reverse()
  .find((message) => message.primaryQuestion)?.primaryQuestion ?? null);
const proposals = computed(() => currentMessages.value
  .flatMap((message) => message.updates)
  .filter((proposal) => proposal.status === 'proposed' || proposal.status === 'conflict'));
const contradictions = computed(() => currentMessages.value.flatMap((message) => message.contradictions));
const isUseful = computed(() => Boolean(primaryQuestion.value) || proposals.value.length > 0 || contradictions.value.length > 0);

function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    'f1.analisisProblema.problemaDetectado': 'Problema detectado',
    'f1.analisisProblema.evidencia': 'Evidencia',
    'f1.analisisProblema.analisis': 'Análisis',
    'f1.analisisProblema.decision': 'Decisión',
    'f1.resultadoDeseado': 'Resultado deseado',
    'f1.alcance': 'Alcance',
    'f1.restricciones': 'Restricciones',
    'f1.actores': 'Actores',
    'f1.criterioExito': 'Criterio de éxito',
    'f2.decision': 'Decisión',
    'f2.alcance': 'Alcance',
    'f2.noObjetivos': 'No objetivos',
    'f2.pasos': 'Pasos',
    'f3.notas': 'Notas de iteración',
    'f4.cambio': 'Cambio consolidado',
    'f4.titulo': 'Título del método',
  };
  return labels[field] ?? field;
}

function valueText(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Sin valor confirmado';
  return typeof value === 'string' ? value : JSON.stringify(value);
}
</script>

<template>
  <section v-if="isUseful" class="structured-stage-summary" aria-label="Resumen estructurado">
    <header>
      <h3>Resumen de etapa · {{ phaseLabel }}</h3>
      <p class="structured-stage-summary__status structured-stage-summary__status--warn">Revisión contextual</p>
    </header>

    <section v-if="primaryQuestion" class="structured-stage-summary__block">
      <h4>Pregunta vigente</h4>
      <p>{{ primaryQuestion }}</p>
    </section>

    <section v-if="proposals.length" class="structured-stage-summary__block">
      <h4>Campos relacionados</h4>
      <ul>
        <li v-for="proposal in proposals" :key="proposal.id">
          <strong>{{ fieldLabel(proposal.field) }}</strong>:
          {{ valueText(proposal.previousValue) }} → {{ valueText(proposal.value) }}
          <span v-if="proposal.status === 'conflict'">(conflicto)</span>
        </li>
      </ul>
    </section>

    <section v-if="contradictions.length" class="structured-stage-summary__block">
      <h4>Contradicciones</h4>
      <ul>
        <li v-for="item in contradictions" :key="item.id">{{ item.message }}</li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.structured-stage-summary {
  display: grid;
  gap: 0.7rem;
  margin: 0;
  border: 1px solid #dce3de;
  border-radius: .65rem;
  background: #fbfdfb;
  padding: 0.9rem;
}

.structured-stage-summary header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.structured-stage-summary h3,
.structured-stage-summary h4 {
  margin: 0;
}

.structured-stage-summary h3 {
  font-size: .95rem;
}

.structured-stage-summary h4 {
  margin-bottom: 0.2rem;
  font-size: .86rem;
  color: #151d18;
}

.structured-stage-summary__status {
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: 0.14rem 0.42rem;
  font-size: 0.7rem;
  font-weight: 650;
  white-space: nowrap;
}

.structured-stage-summary__status--ok {
  color: #047857;
}

.structured-stage-summary__status--warn {
  color: #9a5b00;
}

.structured-stage-summary__block {
  display: grid;
  gap: 0.35rem;
}

.structured-stage-summary__notice {
  margin: 0;
  color: #4b5750;
  font-size: .82rem;
}

.structured-stage-summary__meta {
  color: #4b5750;
  font-size: .82rem;
}

.structured-stage-summary ul {
  margin: 0.1rem 0 0;
  padding-left: 1rem;
  color: #4b5750;
  font-size: .82rem;
}
</style>
