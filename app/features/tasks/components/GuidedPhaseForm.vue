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
import { resolveContextualPrimaryAction, resolveEvaluationDisplay, type ContextualPrimaryAction, type EvaluationDisplay } from './workspace-presentation';

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
});
const emit = defineEmits<{
  save: [Task];
  dirty: [Task];
  requestEvaluate: [];
	  requestEvaluationRetry: [];
	  requestBack: [];
	  requestContinue: [];
	  requestReturn: [];
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
const fieldIdMap = {
  'f1.linaje': 'lineage-source',
  'f1.checkMapeo': 'mapping-confirmed',
  'f1.analisisProblema.decision': 'problem-decision',
  'f1.analisisProblema': 'problem-detected',
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
  activeEvaluationDisplay.value.issues.forEach((issue) => {
    if (!issue.field) return;
    const id = `stage-issue-${issue.field.replace(/\./g, '-').replace(/[^A-Za-z0-9_-]/g, '-')}`;
    result[issue.field] = result[issue.field] ? `${result[issue.field]} ${id}` : id;
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
      <section class="guided-phase-form__save-state" role="status" aria-live="polite">
        <p v-if="props.isStaleEvaluation" class="guided-phase-form__evaluation-status">Cambios sin evaluar</p>
        <p class="guided-phase-form__save-status">{{ saveCopy.statusLabel }}</p>
        <p class="guided-phase-form__save-helper">{{ saveCopy.helperLabel }}</p>
      </section>
    </header>

    <EvaluationFeedback
      :display="activeEvaluationDisplay"
      :evaluations="props.evaluationHistory"
    />
    <StageFieldIssues
      :issues="activeEvaluationDisplay.issues"
      :field-id-map="fieldIdMap"
    />

    <OrientationPhase
      v-if="phase === 1"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <GuidancePhase
      v-else-if="phase === 2"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ExecutionPhase
      v-else-if="phase === 3"
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />
    <ReviewPhase
      v-else
      :task="props.task"
      :save-task="props.saveTask"
      :field-issue-ids="fieldIssueIds"
      @save="onSavePayload"
      @dirty="onDirtyPayload"
    />

    <footer class="guided-phase-form__controls" data-stage-footer>
      <button type="button" class="guided-phase-form__save-button" :disabled="saveState === 'saving'" @click="onSaveDraft">
        {{ saveCopy.actionLabel }}
      </button>
      <button
        type="button"
        class="guided-phase-form__primary-action"
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
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 100%;
  overflow: visible;
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
  grid-template-columns: auto minmax(0, 1fr);
  gap: .5rem;
  align-items: center;
  padding: 1rem 1.45rem 1.35rem;
  border-top: 1px solid #dde3de;
}

.guided-phase-form__controls button {
  min-height: 2.6rem;
  border-radius: .42rem;
  white-space: nowrap;
}

.guided-phase-form__controls .guided-phase-form__primary-action {
  min-height: 3.05rem;
  border-color: #007a4d;
  color: #fff;
  background: #007a4d;
  box-shadow: 0 13px 28px rgba(0, 95, 62, .18);
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

  .guided-phase-form__controls {
    grid-template-columns: minmax(0, 1fr);
    padding-inline: 1rem;
  }

  .guided-phase-form__save-button {
    justify-self: center;
  }
}
</style>
