<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../domain/task.schema';
import type { PhaseEvaluation } from '../domain/task-assistant.schema';
import { phaseInstructions } from '../domain/phase-instructions';
import ExecutionPhase from './ExecutionPhase.vue';
import GuidancePhase from './GuidancePhase.vue';
import EvaluationFeedback from './EvaluationFeedback.vue';
import OrientationPhase from './OrientationPhase.vue';
import ReviewPhase from './ReviewPhase.vue';
import StructuredStageSummary from './StructuredStageSummary.vue';

const props = withDefaults(defineProps<{
  task: Task;
  saveTask?: () => Promise<boolean>;
  evaluation?: PhaseEvaluation | null;
  isEvaluating?: boolean;
  isStaleEvaluation?: boolean;
  canContinue?: boolean;
  evaluationError?: string;
  evaluationHistory?: PhaseEvaluation[];
}>(), {
  saveTask: undefined,
  evaluation: null,
  isEvaluating: false,
  isStaleEvaluation: false,
  canContinue: false,
  evaluationError: '',
  evaluationHistory: () => [],
});
const emit = defineEmits<{
  save: [Task];
  dirty: [Task];
  requestEvaluate: [];
  requestEvaluationRetry: [];
  requestBack: [];
  requestContinue: [];
}>();

const phase = computed(() => props.task.fase);
const currentPhaseInstruction = computed(() => phaseInstructions[phase.value as keyof typeof phaseInstructions]?.[0]);
const phaseLabel = computed(() => currentPhaseInstruction.value?.title ?? `Fase ${phase.value}`);
const canGoBack = computed(() => props.task.fase > 1);
const canContinue = computed(() => props.canContinue && !props.isStaleEvaluation && !!props.evaluation && props.evaluation.status === 'acceptable');
const continueMessage = computed(() => {
  if (!props.evaluation) return 'Requiere evaluar para continuar.';
  if (props.isStaleEvaluation) return 'La evaluación está desfasada; vuelve a evaluar.';
  if (props.evaluation.status !== 'acceptable') return 'Corrige y re-evalúa antes de continuar.';
  if (props.evaluation.gateVersion !== 'outcome-v2') return 'Actualiza a outcome-v2 para habilitar el avance.';
  return 'Puedes avanzar a la siguiente etapa.';
});

const progressSteps = computed(() => [1, 2, 3, 4].map((step) => ({
  step,
  current: step === phase.value,
  complete: step < phase.value,
})));

function onDirtyPayload() {
  emit('dirty', props.task);
}

function onSavePayload() {
  emit('save', props.task);
}

function onEvaluate() {
  emit('requestEvaluate');
}

function onRetryEvaluation() {
  emit('requestEvaluationRetry');
}

function onBack() {
  emit('requestBack');
}

function onContinue() {
  emit('requestContinue');
}
</script>

<template>
  <div aria-labelledby="guided-form-title" class="guided-phase-form">
    <header class="guided-phase-form__header">
      <div>
        <h3 id="guided-form-title">{{ phaseLabel }}</h3>
        <p class="guided-phase-form__meta">Fase {{ phase }} de 4</p>
      </div>
      <ol class="guided-phase-form__progress" aria-label="Progreso de fases">
        <li
          v-for="item in progressSteps"
          :key="item.step"
          :class="{ 'guided-phase-form__progress-step': true, 'guided-phase-form__progress-step--complete': item.complete, 'guided-phase-form__progress-step--current': item.current }"
        >
          <span>{{ item.step }}</span>
        </li>
      </ol>
      <p class="guided-phase-form__current-step" role="status" aria-live="polite">Paso actual: Fase {{ phase }}</p>
      <p class="guided-phase-form__continue-message">{{ continueMessage }}</p>
      <div class="guided-phase-form__controls">
        <button v-if="canGoBack" type="button" @click="onBack">Atrás</button>
        <button
          type="button"
          data-focus-target="form"
          :disabled="props.isEvaluating"
          @click="onEvaluate"
        >
          {{ props.isEvaluating ? 'Evaluando…' : 'Evaluar' }}
        </button>
        <button v-if="props.evaluationError" type="button" @click="onRetryEvaluation">Reintentar</button>
        <button type="button" :disabled="!canContinue" :title="continueMessage" @click="onContinue">Continuar</button>
      </div>
    </header>

    <StructuredStageSummary
      :task="props.task"
      :evaluation="props.evaluation"
      :is-stale-evaluation="props.isStaleEvaluation"
      :can-continue="props.canContinue"
    />

    <EvaluationFeedback
      :latest-evaluation="props.evaluation"
      :is-evaluating="props.isEvaluating"
      :is-stale="props.isStaleEvaluation"
      :can-continue="canContinue"
      :transport-error="props.evaluationError"
      :evaluations="props.evaluationHistory"
      @retry-evaluation="onRetryEvaluation"
    />

    <OrientationPhase
      v-if="phase === 1"
      :task="props.task"
      :save-task="props.saveTask"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <GuidancePhase
      v-else-if="phase === 2"
      :task="props.task"
      :save-task="props.saveTask"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ExecutionPhase
      v-else-if="phase === 3"
      :task="props.task"
      :save-task="props.saveTask"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ReviewPhase
      v-else
      :task="props.task"
      :save-task="props.saveTask"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
  </div>
</template>

<style scoped>
.guided-phase-form {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 100%;
  overflow: hidden;
  background: #fff;
}

.guided-phase-form__header {
  display: grid;
  gap: 1rem;
  padding: 1.35rem 1.45rem 1rem;
  border-bottom: 1px solid #dde3de;
}

.guided-phase-form__header h3 {
  margin: 0;
  color: #101612;
  font-size: 1.12rem;
  font-weight: 780;
  line-height: 1.2;
}

.guided-phase-form__meta {
  margin: .2rem 0 0;
  color: #59645d;
  font-size: .8rem;
}

.guided-phase-form__progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.guided-phase-form__progress-step {
  position: relative;
  display: grid;
  place-items: center;
}

.guided-phase-form__progress-step::before {
  position: absolute;
  right: calc(50% + .5rem);
  left: calc(-50% + .5rem);
  height: .16rem;
  border-radius: 999px;
  background: #d9dedb;
  content: "";
}

.guided-phase-form__progress-step:first-child::before {
  display: none;
}

.guided-phase-form__progress-step--complete::before,
.guided-phase-form__progress-step--current::before {
  background: #007a4d;
}

.guided-phase-form__progress-step span {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: .95rem;
  height: .95rem;
  border: 1px solid #cfd6d1;
  border-radius: 999px;
  color: transparent;
  background: #d9dedb;
}

.guided-phase-form__progress-step--complete span,
.guided-phase-form__progress-step--current span {
  border-color: #007a4d;
  background: #007a4d;
}

.guided-phase-form__progress-step--current span {
  outline: 3px solid #e8f5ee;
}

.guided-phase-form__current-step {
  margin: -.35rem 0 0;
  color: #005f3e;
  font-size: .8rem;
  font-weight: 760;
}

.guided-phase-form__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .5rem;
}

.guided-phase-form__controls button {
  min-height: 2.6rem;
  border-radius: .42rem;
  white-space: nowrap;
}

.guided-phase-form__controls button:last-child {
  grid-column: 1 / -1;
  min-height: 3.05rem;
  border-color: #007a4d;
  color: #fff;
  background: linear-gradient(180deg, #078752, #006f47);
  box-shadow: 0 13px 28px rgba(0, 95, 62, .18);
}

.guided-phase-form__controls button:last-child:disabled {
  color: #67736b;
  border-color: #d8ded9;
  background: #edf1ee;
  box-shadow: none;
}

.guided-phase-form > :deep(.evaluation-feedback) {
  margin: 1rem 1.45rem 0;
}

.guided-phase-form > :deep(.phase-workspace) {
  min-height: 0;
  margin: 0;
  padding: 1rem 1.45rem 1.45rem;
  overflow: auto;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.guided-phase-form > :deep(.phase-workspace h3) {
  margin-bottom: 1rem;
  color: #101612;
  font-size: 1rem;
  letter-spacing: 0;
}

.guided-phase-form :deep(.phase-workspace__content) {
  display: block;
  width: 100%;
  min-width: 0;
}

.guided-phase-form :deep(.phase-workspace__form) {
  display: grid;
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.guided-phase-form > :deep(.phase-workspace__form > p) {
  margin: 0;
  color: #4c5851;
  font-size: .86rem;
}

.guided-phase-form > :deep(label) {
  display: grid;
  gap: .42rem;
  margin: .15rem 0;
  color: #242d27;
  font-size: .86rem;
  font-weight: 680;
}

.guided-phase-form > :deep(label:has(> input[type='checkbox'])) {
  display: flex;
  align-items: center;
}

.guided-phase-form > :deep(input:not([type='checkbox'])),
.guided-phase-form > :deep(select),
.guided-phase-form > :deep(textarea) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 2.65rem;
  padding: .68rem .75rem;
  border-radius: .48rem;
  border-color: #d4dbd6;
  background: #fff;
}

.guided-phase-form > :deep(textarea) {
  min-height: 5.8rem;
  resize: vertical;
}

.guided-phase-form > :deep(fieldset) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: .85rem;
  width: 100%;
  min-width: 0;
  min-inline-size: 0;
  margin: 0;
  padding: 1rem 0 0;
  border-width: 1px 0 0;
  border-color: #dde3de;
  border-radius: 0;
}

.guided-phase-form > :deep(legend) {
  padding: 0;
  color: #101612;
  font-size: .95rem;
  font-weight: 780;
  letter-spacing: 0;
  text-transform: none;
}

@media (max-width: 767px) {
  .guided-phase-form {
    max-height: 100vh;
  }

  .guided-phase-form__header,
  .guided-phase-form > :deep(.phase-workspace) {
    padding-inline: 1rem;
  }
}
</style>
