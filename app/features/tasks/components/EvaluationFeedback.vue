<script setup lang="ts">
import { computed } from 'vue';
import type { PhaseEvaluation, TaskPhase } from '../domain/task-assistant.schema';
import { resolveEvaluationDisplay, type EvaluationDisplay } from './workspace-presentation';

const props = withDefaults(defineProps<{
  display?: EvaluationDisplay | null;
  latestEvaluation?: PhaseEvaluation | null;
  isEvaluating?: boolean;
  isStale?: boolean;
  canContinue?: boolean;
  transportError?: string;
  evaluations?: PhaseEvaluation[];
}>(), {
  display: null,
  latestEvaluation: null,
  isEvaluating: false,
  isStale: false,
  canContinue: false,
  transportError: '',
  evaluations: () => [],
});

const hasEvaluationHistory = computed(() => props.evaluations.length > 1);
const sortedEvaluationHistory = computed(() => [...props.evaluations].sort((left, right) => right.createdAt - left.createdAt));
const effectiveDisplay = computed<EvaluationDisplay>(() => props.display ?? resolveEvaluationDisplay({
  phase: (props.latestEvaluation?.phase ?? 1) as TaskPhase,
  latestEvaluation: props.latestEvaluation,
  isEvaluating: props.isEvaluating,
  isStaleEvaluation: props.isStale,
  transportError: props.transportError,
  gateResult: { allowed: props.canContinue, reasons: [] },
}));

const effectiveStatusTitle = computed(() => {
  const label = {
    none: 'Sin evaluación',
    evaluating: 'Evaluando...',
    acceptable: 'Evaluación aceptable',
    blocked: 'Evaluación requiere ajustes',
    'transport-error': 'Evaluación con error',
    stale: 'Evaluación obsoleta',
  } as const;
  return label[effectiveDisplay.value.status];
});

const effectiveStatusClass = computed(() => {
  const classes = {
    none: 'evaluation-feedback__status--idle',
    evaluating: 'evaluation-feedback__status--pending',
    acceptable: 'evaluation-feedback__status--ok',
    blocked: 'evaluation-feedback__status--warn',
    'transport-error': 'evaluation-feedback__status--error',
    stale: 'evaluation-feedback__status--warn',
  } as const;
  return classes[effectiveDisplay.value.status];
});
</script>

<template>
  <section class="evaluation-feedback" aria-labelledby="evaluation-feedback-title" aria-live="polite">
    <header>
      <h4 id="evaluation-feedback-title" class="evaluation-feedback__title">Evaluación del asistente</h4>
      <p :class="['evaluation-feedback__status', effectiveStatusClass]">{{ effectiveStatusTitle }}</p>
    </header>

    <p role="status" class="evaluation-feedback__sr-only">{{ effectiveStatusTitle }}</p>
    <p class="evaluation-feedback__message">{{ effectiveDisplay.announcement }}</p>
    <p v-if="effectiveDisplay.recovery" class="evaluation-feedback__recovery">Usa la acción principal para reintentar.</p>

    <details v-if="hasEvaluationHistory" class="evaluation-feedback__history">
      <summary>Historial de evaluaciones ({{ sortedEvaluationHistory.length }})</summary>
      <ul>
        <li v-for="entry in sortedEvaluationHistory" :key="entry.id">
          {{ new Date(entry.createdAt).toLocaleString() }} · {{ entry.status }}
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.evaluation-feedback {
  display: grid;
  gap: 0.6rem;
  border: 1px solid #dce3de;
  border-radius: .65rem;
  padding: .85rem;
  background: #fbfdfb;
}

.evaluation-feedback header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: .75rem;
}

.evaluation-feedback__title {
  margin: 0;
  font-size: .88rem;
  font-weight: 600;
}

.evaluation-feedback__status {
  margin: 0;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: .14rem .42rem;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
}

.evaluation-feedback__status--ok {
  color: #065535;
}

.evaluation-feedback__status--warn {
  color: #9a5b00;
}

.evaluation-feedback__status--error,
.evaluation-feedback__status--pending {
  color: #b91c1c;
}

.evaluation-feedback__status--idle {
  color: #374151;
}

.evaluation-feedback__message {
  margin: 0;
  color: #4b5750;
  font-size: .84rem;
}

.evaluation-feedback__recovery {
  margin: -.25rem 0 0;
  color: #5f4300;
  font-size: .82rem;
}

.evaluation-feedback__issue-list {
  display: grid;
  gap: .25rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #4b5750;
  font-size: .82rem;
}

.evaluation-feedback__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.evaluation-feedback h5 {
  margin: .35rem 0 0;
  color: #151d18;
  font-size: .84rem;
}

.evaluation-feedback ul {
  margin: 0.1rem 0 0;
  padding-left: 1rem;
  color: #4b5750;
  font-size: .82rem;
}

.evaluation-feedback li {
  margin: 0;
}

.evaluation-feedback p:not(.evaluation-feedback__status):not(.evaluation-feedback__sr-only) {
  margin: 0;
  color: #4b5750;
  font-size: .84rem;
}

@media (max-width: 767px) {
  .evaluation-feedback header {
    grid-template-columns: minmax(0, 1fr);
  }

  .evaluation-feedback__status {
    justify-self: start;
    max-width: 100%;
  }
}
</style>
