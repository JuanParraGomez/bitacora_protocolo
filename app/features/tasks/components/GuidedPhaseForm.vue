<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Task } from '../domain/task.schema';
import type { PhaseEvaluation, TaskPhase } from '../domain/task-assistant.schema';
import { phaseInstructions } from '../domain/phase-instructions';
import ExecutionPhase from './ExecutionPhase.vue';
import GuidancePhase from './GuidancePhase.vue';
import EvaluationFeedback from './EvaluationFeedback.vue';
import OrientationPhase from './OrientationPhase.vue';
import ReviewPhase from './ReviewPhase.vue';
import StageFieldIssues from './StageFieldIssues.vue';
import { buildGuidedPhaseFormModel, resolveGuidedPhaseSaveCopy, type GuidedPhaseSaveState } from './guided-phase-form';
import { resolveContextualPrimaryAction, resolveEvaluationDisplay, resolveEvaluationRecovery, type ContextualPrimaryAction, type EvaluationDisplay, type EvaluationDisplayIssue } from './workspace-presentation';

const props = withDefaults(defineProps<{
  task: Task;
  saveTask?: () => Promise<boolean>;
  evaluation?: PhaseEvaluation | null;
  isEvaluating?: boolean;
  isStaleEvaluation?: boolean;
  canContinue?: boolean;
  evaluationError?: string;
  evaluationHistory?: PhaseEvaluation[];
  primaryAction?: ContextualPrimaryAction | null;
  evaluationDisplay?: EvaluationDisplay | null;
  compactPresentation?: boolean;
}>(), {
  saveTask: undefined,
  evaluation: null,
  isEvaluating: false,
  isStaleEvaluation: false,
  canContinue: false,
  evaluationError: '',
  evaluationHistory: () => [],
  primaryAction: null,
  evaluationDisplay: null,
  compactPresentation: false,
});
const emit = defineEmits<{
  save: [Task];
  dirty: [Task];
  requestEvaluate: [];
	  requestEvaluationRetry: [];
	  requestBack: [];
	  requestContinue: [];
  requestReturn: [];
	  requestAgentRecommendations: [];
	}>();

const phase = computed(() => props.task.fase);
const saveState = ref<GuidedPhaseSaveState>('idle');
const saveError = ref('');
const currentPhaseInstruction = computed(() => phaseInstructions[phase.value as keyof typeof phaseInstructions]?.[0]);
const phaseModel = computed(() => buildGuidedPhaseFormModel(props.task, saveState.value, saveError.value));
const phaseLabel = computed(() => phaseModel.value.phaseLabel ?? currentPhaseInstruction.value?.title ?? `Fase ${phase.value}`);
const saveCopy = computed(() => resolveGuidedPhaseSaveCopy(saveState.value, saveError.value));
const fallbackGateResult = computed(() => ({
  allowed: props.canContinue,
  reasons: props.canContinue ? [] : ['La fase requiere una evaluación vigente y aceptable del asistente para continuar.'],
}));
const activePrimaryAction = computed(() => props.primaryAction ?? resolveContextualPrimaryAction({
  phase: props.task.fase as TaskPhase,
  taskState: props.task.estado === 'completada' ? 'completed' : 'active',
  evaluation: props.evaluation,
  isEvaluating: props.isEvaluating,
  isStaleEvaluation: props.isStaleEvaluation,
  gateResult: fallbackGateResult.value,
  transportError: props.evaluationError,
}));
const activeEvaluationDisplay = computed(() => props.evaluationDisplay ?? resolveEvaluationDisplay({
  phase: props.task.fase as TaskPhase,
  latestEvaluation: props.evaluation,
  isEvaluating: props.isEvaluating,
  isStaleEvaluation: props.isStaleEvaluation,
  transportError: props.evaluationError,
  gateResult: fallbackGateResult.value,
}));
const activeRecovery = computed(() => resolveEvaluationRecovery({
  phase: props.task.fase as TaskPhase,
  latestEvaluation: props.evaluation,
  isEvaluating: props.isEvaluating,
  isStaleEvaluation: props.isStaleEvaluation,
  transportError: props.evaluationError,
  gateResult: fallbackGateResult.value,
}));
const correctionIssues = computed<EvaluationDisplayIssue[]>(() => activeRecovery.value.corrections);
const fieldIdMap = {
  'f1.linaje': 'lineage-source',
  'f1.checkMapeo': 'mapping-confirmed',
  'f1.analisisProblema.decision': 'problem-decision',
  'f1.analisisProblema': 'problem-detected',
  'f1.analisisProblema.analisis': 'problem-analysis',
  'f1.analisisProblema.justificacion': 'problem-justification',
  'f1.resultadoDeseado': 'desired-result',
  'f1.alcance': 'problem-scope',
  'f1.restricciones': 'problem-constraints',
  'f1.actores': 'problem-actors',
  'f1.criterioExito': 'success-criteria',
  'f2.decision': 'phase-two-decision',
  'f2.alcance': 'phase-two-scope',
  'f2.pasos': 'phase-two-steps',
  'f2.subproblemas': 'phase-two-subproblems',
  'f2.preguntasAbiertas': 'phase-two-open-questions',
  'f2.riesgos': 'phase-two-risks',
  'f2.predicciones': 'phase-two-predictions',
  'f3.iteraciones': 'iteration-attempt-0',
  'f3.checkCompila': 'phase-three-compiles',
  'f3.checkAuditado': 'phase-three-audited',
  'f4.aar': 'phase-four-observed-0',
  'f4.conexiones': 'phase-four-connections',
  'f4.cambio': 'phase-four-change',
  'f4.titulo': 'phase-four-title-input',
} as const;
const fieldIssueIds = computed(() => {
  const result: Record<string, string> = {};
  correctionIssues.value.forEach((issue, index) => {
    if (!issue.field) return;
    const id = `stage-issue-${issue.field.replace(/\./g, '-').replace(/[^A-Za-z0-9_-]/g, '-')}-${index + 1}`;
    result[issue.field] = result[issue.field] ? `${result[issue.field]} ${id}` : id;
  });
  return result;
});
const fieldIssues = computed(() => {
  const result: Record<string, EvaluationDisplayIssue[]> = {};
  correctionIssues.value.forEach((issue) => {
    if (!issue.field) return;
    result[issue.field] = [...(result[issue.field] || []), issue];
  });
  return result;
});

const progressSteps = computed(() => [1, 2, 3, 4].map((step) => ({
  step,
  current: step === phase.value,
  complete: step < phase.value,
})));

function onDirtyPayload() {
  saveState.value = 'dirty';
  saveError.value = '';
  emit('dirty', props.task);
}

function onSavePayload() {
  saveState.value = 'saved';
  saveError.value = '';
  emit('save', props.task);
}

async function onSaveDraft() {
  saveState.value = 'saving';
  saveError.value = '';
  if (!props.saveTask) {
    emit('save', props.task);
    saveState.value = 'saved';
    return;
  }

  try {
    const saved = await props.saveTask();
    if (saved) {
      saveState.value = 'saved';
      return;
    }
  } catch {
    // The visible save state below is the recovery path.
  }

  saveState.value = 'error';
  saveError.value = 'No se pudo guardar el borrador.';
}

function onBack() {
  emit('requestBack');
}

function onPrimaryAction() {
  if (activePrimaryAction.value.disabled) return;
  if (activePrimaryAction.value.kind === 'evaluate' || activePrimaryAction.value.kind === 'reevaluate') {
    emit('requestEvaluate');
    return;
  }
  if (activePrimaryAction.value.kind === 'continue' || activePrimaryAction.value.kind === 'finish') {
    emit('requestContinue');
    return;
  }
  if (activePrimaryAction.value.kind === 'return') {
    emit('requestReturn');
  }
}

watch(() => [props.task.id, props.task.fase], () => {
  saveState.value = 'idle';
  saveError.value = '';
});
</script>

<template>
  <div
    aria-labelledby="guided-form-title"
    class="guided-phase-form"
    :class="{ 'guided-phase-form--compact': props.compactPresentation }"
  >
    <header class="guided-phase-form__header">
      <div>
        <h3 id="guided-form-title">{{ phaseLabel }}</h3>
        <p class="guided-phase-form__meta">Fase {{ phase }} de 4</p>
      </div>
      <p v-if="props.isStaleEvaluation" class="guided-phase-form__evaluation-status">Cambios sin evaluar</p>
      <ol class="guided-phase-form__progress" aria-label="Progreso de fases">
        <li
          v-for="item in progressSteps"
          :key="item.step"
          :class="{ 'guided-phase-form__progress-step': true, 'guided-phase-form__progress-step--complete': item.complete, 'guided-phase-form__progress-step--current': item.current }"
        >
          <span aria-hidden="true">{{ item.complete ? '✓' : item.step }}</span>
          <span class="guided-phase-form__sr">{{ item.complete ? `Fase ${item.step} completada` : item.current ? `Fase ${item.step} actual` : `Fase ${item.step}` }}</span>
        </li>
      </ol>
      <p class="guided-phase-form__current-step" role="status" aria-live="polite">Paso actual: Fase {{ phase }}</p>
      <section class="guided-phase-form__save-state" role="status" aria-live="polite">
        <p class="guided-phase-form__save-status">{{ saveCopy.statusLabel }}</p>
        <p class="guided-phase-form__save-helper">{{ saveCopy.helperLabel }}</p>
      </section>
    </header>

    <EvaluationFeedback
      :display="activeEvaluationDisplay"
      :evaluations="props.evaluationHistory"
    />
    <StageFieldIssues
      :issues="correctionIssues"
      :field-id-map="fieldIdMap"
      @request-agent-recommendations="emit('requestAgentRecommendations')"
    />

    <OrientationPhase
      v-if="phase === 1"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      :field-issues="fieldIssues"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <GuidancePhase
      v-else-if="phase === 2"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      :field-issues="fieldIssues"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ExecutionPhase
      v-else-if="phase === 3"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      :field-issues="fieldIssues"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ReviewPhase
      v-else
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      :field-issues="fieldIssues"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />

    <footer class="guided-phase-form__controls" data-stage-footer>
      <button
        type="button"
        class="guided-phase-form__save-button"
        data-secondary-action="true"
        :disabled="saveState === 'saving'"
        @click="onSaveDraft"
      >
        {{ saveCopy.actionLabel }}
      </button>
      <button
        type="button"
        class="guided-phase-form__primary-action"
        :class="`guided-phase-form__primary-action--${activePrimaryAction.kind}`"
        data-focus-target="form"
        data-primary-action="true"
        :disabled="activePrimaryAction.disabled"
        :title="activePrimaryAction.reason ?? undefined"
        @click="onPrimaryAction"
      >
        {{ activePrimaryAction.label }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.guided-phase-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 100%;
  overflow: visible;
  background: #fff;
  box-sizing: border-box;
}

.guided-phase-form__header {
  position: relative;
  display: grid;
  gap: .9rem;
  padding: 1.5rem 1.6rem 1.1rem;
}

.guided-phase-form__header h3 {
  margin: 0;
  color: #0d1f16;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -.01em;
  line-height: 1.2;
}

.guided-phase-form__meta {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.guided-phase-form__evaluation-status {
  position: absolute;
  top: 1.55rem;
  right: 1.6rem;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  margin: 0;
  border: 1px solid #f3e3c8;
  border-radius: 999px;
  padding: .32rem .75rem;
  color: #7a5a1e;
  background: #fef9f0;
  font-size: .78rem;
  font-weight: 500;
}

.guided-phase-form__evaluation-status::before {
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: #f7900a;
  content: "";
}

.guided-phase-form__progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .35rem;
  width: 100%;
  max-width: 30rem;
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
  background: #065535;
}

.guided-phase-form__progress-step span {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 1.45rem;
  height: 1.45rem;
  border: 1px solid #d5dcd7;
  border-radius: 999px;
  color: #8a948d;
  background: #fff;
  font-size: .78rem;
  font-weight: 500;
}

.guided-phase-form__progress-step--complete span,
.guided-phase-form__progress-step--current span {
  border-color: #044128;
  color: #fff;
  background: #044128;
}

.guided-phase-form__progress-step--current span {
  outline: 3px solid #e8f5ee;
}

.guided-phase-form__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.guided-phase-form__current-step {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.guided-phase-form__save-state {
  position: absolute;
  width: 1px;
  height: 1px;
  min-width: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.guided-phase-form__save-state p {
  overflow-wrap: anywhere;
}

.guided-phase-form__controls {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 1rem;
  align-items: center;
  min-width: 0;
  margin-top: auto;
  padding: 1rem 1.6rem 1.4rem;
}

.guided-phase-form__controls button {
  min-height: 2.6rem;
  border-radius: .55rem;
  white-space: nowrap;
}

.guided-phase-form__save-button {
  border: 0;
  padding: 0 .25rem;
  color: #3a644c;
  font-size: .88rem;
  font-weight: 500;
  background: transparent;
}

.guided-phase-form__save-button:hover,
.guided-phase-form__save-button:focus-visible {
  color: #1f5138;
  text-decoration: underline;
  text-underline-offset: .2rem;
}

.guided-phase-form__controls .guided-phase-form__primary-action {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  min-height: 2.7rem;
  border-color: #065535;
  padding: 0 1.2rem;
  color: #fff;
  font-size: .9rem;
  font-weight: 600;
  background: #065535;
  box-shadow: none;
}

.guided-phase-form__primary-icon {
  font-weight: 700;
}

.guided-phase-form__primary-action--evaluate::before,
.guided-phase-form__primary-action--reevaluate::before {
  content: "✓";
  font-weight: 700;
}

.guided-phase-form__primary-action--return::before {
  content: "←";
}

.guided-phase-form__controls button:last-child:disabled {
  color: #405047;
  border-color: #d8ded9;
  background: #edf1ee;
  box-shadow: none;
}

.guided-phase-form__primary-action:disabled {
  color: #405047;
  border-color: #d8ded9;
  background: #edf1ee;
}

.guided-phase-form > :deep(.evaluation-feedback) {
  margin: 1rem 1.45rem 0;
}

.guided-phase-form > :deep(.stage-field-issues) {
  margin: 1rem 1.45rem 0;
}

.guided-phase-form > :deep(.phase-workspace) {
  flex: 1 1 auto;
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

.guided-phase-form :deep(.phase-workspace__form > p) {
  margin: 0;
  color: #4c5851;
  font-size: .86rem;
}

.guided-phase-form :deep(label:not(.stage-text-field__label)) {
  display: grid;
  gap: .42rem;
  margin: .15rem 0;
  color: #242d27;
  font-size: .88rem;
  font-weight: 600;
}

.guided-phase-form :deep(label:has(> input[type='checkbox'])) {
  display: flex;
  align-items: center;
}

.guided-phase-form :deep(input:not([type='checkbox'])),
.guided-phase-form :deep(select),
.guided-phase-form :deep(textarea) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 2.5rem;
  padding: .68rem .8rem;
  border: 1px solid #dfe6e1;
  border-radius: .6rem;
  background: #fff;
}

.guided-phase-form :deep(textarea) {
  height: 3.9rem;
  min-height: 3.9rem;
  padding-bottom: 1.7rem;
  resize: vertical;
}

.guided-phase-form :deep(fieldset) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  width: 100%;
  min-width: 0;
  min-inline-size: 0;
  margin: 0;
  padding: 0;
  border-width: 0;
  border-radius: 0;
}

.guided-phase-form :deep(legend) {
  padding: 0;
  color: #0d1f16;
  font-size: .95rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

@media (min-width: 768px) and (max-width: 1024px) {
  .guided-phase-form {
    height: auto;
  }

  .guided-phase-form > :deep(.phase-workspace) {
    flex: 0 0 auto;
    overflow: visible;
  }
}

@media (max-width: 767px) {
  .guided-phase-form {
    grid-template-rows: none;
    grid-auto-rows: auto;
    height: auto;
    max-height: none;
  }

  .guided-phase-form__header,
  .guided-phase-form > :deep(.phase-workspace) {
    padding-inline: .85rem;
  }

  .guided-phase-form__controls {
    flex-direction: column;
    align-items: stretch;
    width: auto;
    max-width: none;
    padding-inline: 1rem;
    box-sizing: border-box;
  }

  .guided-phase-form__controls button {
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .guided-phase-form__save-button {
    align-self: center;
  }

  .guided-phase-form__controls .guided-phase-form__primary-action {
    justify-content: center;
    width: 100%;
  }

  .guided-phase-form--compact > :deep(.evaluation-feedback),
  .guided-phase-form--compact > :deep(.stage-field-issues) {
    order: 5;
  }

  .guided-phase-form--compact > :deep(.phase-workspace) {
    order: 10;
    min-height: auto;
    overflow: visible;
  }

  .guided-phase-form--compact .guided-phase-form__header {
    order: 0;
    padding-block: 1rem .75rem;
  }

  .guided-phase-form--compact .guided-phase-form__header h3 {
    font-size: 1.3rem;
  }

  .guided-phase-form--compact .guided-phase-form__controls {
    order: 30;
  }

  .guided-phase-form--compact .guided-phase-form__save-button {
    border: 0;
    color: #176448;
    background: transparent;
  }

  .guided-phase-form--compact .guided-phase-form__primary-action {
    width: 100%;
  }
}
</style>
