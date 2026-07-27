<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { PhaseEvaluation } from '../domain/task-assistant.schema';

type EvaluationStatus = 'idle' | 'evaluating' | 'acceptable' | 'needs-work' | 'error' | 'stale';

const props = withDefaults(defineProps<{
  latestEvaluation?: PhaseEvaluation | null;
  isEvaluating: boolean;
  isStale: boolean;
  canContinue: boolean;
  transportError?: string;
  evaluations?: PhaseEvaluation[];
}>(), {
  latestEvaluation: null,
  isEvaluating: false,
  isStale: false,
  canContinue: false,
  transportError: '',
  evaluations: () => [],
});

const emit = defineEmits<{
  retryEvaluation: [];
}>();

const status = computed<EvaluationStatus>(() => {
  if (props.isEvaluating) return 'evaluating';
  if (props.isStale && props.latestEvaluation) return 'stale';
  if (props.latestEvaluation) return props.latestEvaluation.status;
  return 'idle';
});

const statusTitle = computed(() => {
  const label = {
    idle: 'Sin evaluación',
    evaluating: 'Evaluando...',
    acceptable: 'Evaluación aceptable',
    'needs-work': 'Evaluación requiere ajustes',
    error: 'Evaluación con error',
    stale: 'Evaluación obsoleta',
  } as const;
  return label[status.value];
});

const statusClass = computed(() => {
  const classes = {
    idle: 'evaluation-feedback__status--idle',
    evaluating: 'evaluation-feedback__status--pending',
    acceptable: 'evaluation-feedback__status--ok',
    'needs-work': 'evaluation-feedback__status--warn',
    error: 'evaluation-feedback__status--error',
    stale: 'evaluation-feedback__status--warn',
  } as const;
  return classes[status.value];
});

const hasRetryAction = computed(() => {
  return !props.isEvaluating && props.transportError.length > 0;
});

const hasEvaluationHistory = computed(() => props.evaluations.length > 1);
const sortedEvaluationHistory = computed(() => [...props.evaluations].sort((left, right) => right.createdAt - left.createdAt));

function onRetry() {
  emit('retryEvaluation');
}
</script>

<template>
  <section class="evaluation-feedback" aria-labelledby="evaluation-feedback-title">
    <header>
      <h4 id="evaluation-feedback-title" class="evaluation-feedback__title">Evaluación del asistente</h4>
      <p :class="['evaluation-feedback__status', statusClass]">{{ statusTitle }}</p>
    </header>

    <p role="status" aria-live="polite" class="evaluation-feedback__sr-only">{{ statusTitle }}</p>

    <template v-if="props.isEvaluating">
      <p>Generando evaluación con el estado actual de la fase.</p>
    </template>

    <template v-else-if="props.transportError">
      <p class="evaluation-feedback__message">{{ props.transportError }}</p>
      <button v-if="hasRetryAction" type="button" @click="onRetry">Reintentar</button>
    </template>

    <template v-else-if="status === 'needs-work' && props.latestEvaluation">
      <h5>Debilidades</h5>
      <ul>
        <li v-for="weakness in props.latestEvaluation!.weaknesses" :key="`w-${weakness}`">{{ weakness }}</li>
      </ul>
      <h5>Recomendaciones</h5>
      <ul>
        <li v-for="recommendation in props.latestEvaluation!.recommendations" :key="`r-${recommendation}`">{{ recommendation }}</li>
      </ul>
    </template>

    <template v-else-if="status === 'error' && props.latestEvaluation">
      <h5>Debilidades</h5>
      <ul>
        <li v-for="weakness in props.latestEvaluation!.weaknesses" :key="`w-${weakness}`">{{ weakness }}</li>
      </ul>
      <h5>Recomendaciones</h5>
      <ul>
        <li v-for="recommendation in props.latestEvaluation!.recommendations" :key="`r-${recommendation}`">{{ recommendation }}</li>
      </ul>
    </template>

    <template v-else-if="status === 'stale'">
      <p class="evaluation-feedback__message">Evaluación anterior válida para otra versión. Evalúa nuevamente los cambios actuales.</p>
    </template>

    <template v-else-if="status === 'acceptable'">
      <p>
        Estado vigente y apto para continuar.
        <template v-if="props.canContinue"> Puedes avanzar.</template>
        <template v-else> Actualiza la evaluación si algo cambió.</template>
      </p>
    </template>

    <template v-else>
      <p class="evaluation-feedback__message">Aún no se ha realizado ninguna evaluación.</p>
    </template>

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
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: .75rem;
}

.evaluation-feedback__title {
  margin: 0;
  font-size: .88rem;
  font-weight: 760;
}

.evaluation-feedback__status {
  margin: 0;
  border: 1px solid currentColor;
  border-radius: 999px;
  padding: .14rem .42rem;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.evaluation-feedback__status--ok {
  color: #007a4d;
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
</style>
