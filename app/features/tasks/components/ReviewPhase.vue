<script setup lang="ts">
import { computed } from 'vue';
import { currentMethodVersion, deriveCriterionImprovements, deriveMethodMaturity } from '../domain/task-rules';
import type { Task } from '../domain/task.schema';
import { reactive, toRaw, watch } from 'vue';
import StageTextField from './StageTextField.vue';

const props = withDefaults(defineProps<{
  task: Task;
  saveTask?: () => Promise<boolean>;
  fieldIssueIds?: Record<string, string>;
}>(), {
  saveTask: undefined,
  fieldIssueIds: () => ({}),
});
const task = reactive(toRaw(props.task));
const emit = defineEmits<{ save: []; dirty: [] }>();
const activeMethodVersion = computed(() => currentMethodVersion(task));
const methodMaturity = computed(() => deriveMethodMaturity(task));
const activeOpportunities = computed(() => {
  if (!activeMethodVersion.value) return [];
  return task.automationOpportunities.filter((opportunity) => opportunity.methodVersionId === activeMethodVersion.value!.id);
});
function describedBy(field: string): string | undefined {
  return props.fieldIssueIds[field] || undefined;
}
function automationEvidenceLabel(opportunity: Task['automationOpportunities'][number]) {
  return opportunity.occurrenceIterationIds.length >= 2
    ? 'Candidato con evidencia'
    : 'Hipotesis';
}
const methodSummary = computed(() => {
  const version = activeMethodVersion.value;
  if (!version) {
    return {
      preconditions: ['Sin método activo registrado.'],
      steps: ['Sin pasos registrados.'],
      tools: ['Sin herramientas registradas.'],
      inputs: ['Sin entradas registradas.'],
      outputs: ['Sin salidas registradas.'],
      controls: ['Sin controles registrados.'],
      exceptions: ['Sin excepciones registradas.'],
    };
  }
  return {
    preconditions: version.preconditions.length ? version.preconditions : ['Sin precondiciones registradas.'],
    steps: version.steps.length
      ? version.steps.map((step, index) => `${index + 1}. ${step.title || `Paso ${index + 1}`}: ${step.objective || step.output || 'Sin objetivo detallado'}`)
      : ['Sin pasos registrados.'],
    tools: version.tools.length ? version.tools : ['Sin herramientas registradas.'],
    inputs: version.inputs.length ? version.inputs : ['Sin entradas registradas.'],
    outputs: version.outputs.length ? version.outputs : ['Sin salidas registradas.'],
    controls: version.controls.length ? version.controls : ['Sin controles registrados.'],
    exceptions: version.exceptions.length ? version.exceptions : ['Sin excepciones registradas.'],
    classification: version.changeKind,
    exceptionsReviewed: version.exceptionsReviewed ? 'Revisadas' : 'Sin revisar',
  };
});

function syncImprovements() {
  const current = new Map(task.f4.mejorasCriterios.map(item => [item.criterioId, item]));
  task.f4.mejorasCriterios = deriveCriterionImprovements(task).map(item => current.get(item.criterioId) || item);
}

watch(() => task.f2.criterios.map(criterion => criterion.id), syncImprovements, { immediate: true });
watch(() => task.f4, () => emit('dirty'), { deep: true });
</script>

<template>
  <section aria-labelledby="phase-four-title" class="phase-workspace">
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <div v-for="(review, index) in task.f4.aar" :key="index">
          <StageTextField :id="`phase-four-observed-${index}`" v-model="review.observado" :label="`Observado ${index + 1}`" icon="observed" as="input" :described-by="index === 0 ? describedBy('f4.aar') : undefined" />
          <StageTextField :id="`phase-four-cause-${index}`" v-model="review.causa" :label="`Causa ${index + 1}`" icon="cause" as="input" :described-by="index === 0 ? describedBy('f4.aar') : undefined" />
        <label><input v-model="review.mia" type="checkbox" /> Fue una suposición propia</label>
      </div>
      <StageTextField id="phase-four-title-input" v-model="task.f4.titulo" label="Título de consolidación" icon="title" as="input" :described-by="describedBy('f4.titulo')" />
      <StageTextField id="phase-four-change" v-model="task.f4.cambio" label="Cambio procedimental" icon="change" :described-by="describedBy('f4.cambio')" />
      <StageTextField id="phase-four-pattern" v-model="task.f4.patron" label="Patrón operativo" icon="pattern" />
      <StageTextField id="phase-four-connections" v-model="task.f4.conexiones" label="Conexiones y límites" icon="connections" :described-by="describedBy('f4.conexiones')" />

      <section class="phase-workspace__method-summary">
        <h4>Método consolidado y madurez</h4>
        <p>Madurez: <strong>{{ methodMaturity }}</strong></p>
        <p>Versión activa: <strong>{{ activeMethodVersion?.id || 'No definida' }}</strong> · Tipo: <strong>{{ methodSummary.classification }}</strong></p>
        <label>Precondiciones</label>
        <ul>
          <li v-for="(item, index) in methodSummary.preconditions" :key="`method-precondition-${index}`">{{ item }}</li>
        </ul>
        <label>Pasos</label>
        <ul>
          <li v-for="(item, index) in methodSummary.steps" :key="`method-step-${index}`">{{ item }}</li>
        </ul>
        <label>Herramientas</label>
        <ul>
          <li v-for="(item, index) in methodSummary.tools" :key="`method-tool-${index}`">{{ item }}</li>
        </ul>
        <label>Entradas</label>
        <ul>
          <li v-for="(item, index) in methodSummary.inputs" :key="`method-input-${index}`">{{ item }}</li>
        </ul>
        <label>Salidas</label>
        <ul>
          <li v-for="(item, index) in methodSummary.outputs" :key="`method-output-${index}`">{{ item }}</li>
        </ul>
        <label>Controles humanos</label>
        <ul>
          <li v-for="(item, index) in methodSummary.controls" :key="`method-control-${index}`">{{ item }}</li>
        </ul>
        <label>Excepciones</label>
        <p>{{ methodSummary.exceptionsReviewed }}</p>
        <ul>
          <li v-for="(item, index) in methodSummary.exceptions" :key="`method-exception-${index}`">{{ item }}</li>
        </ul>
      </section>

      <section class="phase-workspace__opportunities">
        <h4>Oportunidades de automatización (FR-024/FR-025)</h4>
        <p v-if="!activeOpportunities.length">No hay oportunidades para esta versión de método.</p>
        <article v-for="(opportunity, index) in activeOpportunities" :key="opportunity.id" class="phase-workspace__opportunity">
          <h5>Oportunidad {{ index + 1 }}</h5>
          <p><strong>Clasificación:</strong> {{ opportunity.classification }}</p>
          <p><strong>Evidencia:</strong> {{ automationEvidenceLabel(opportunity) }}</p>
          <ul>
            <li><strong>Frecuencia:</strong> {{ opportunity.frequency || 'Sin frecuencia registrada' }}</li>
            <li><strong>Estabilidad:</strong> {{ opportunity.stability || 'Sin estabilidad registrada' }}</li>
            <li><strong>Riesgo:</strong> {{ opportunity.risk || 'Sin riesgo registrado' }}</li>
            <li><strong>Juicio humano:</strong> {{ opportunity.humanJudgment || 'Sin juicio registrado' }}</li>
            <li><strong>Disparador:</strong> {{ opportunity.trigger || 'Sin disparador' }}</li>
            <li><strong>Entradas:</strong> {{ opportunity.inputs.length ? opportunity.inputs.join(', ') : 'Sin entradas registradas' }}</li>
            <li><strong>Transformación:</strong> {{ opportunity.transformation || 'Sin transformación registrada' }}</li>
            <li><strong>Salida:</strong> {{ opportunity.output || 'Sin salida registrada' }}</li>
            <li><strong>Herramienta candidata:</strong> {{ opportunity.candidateTool || 'Sin herramienta propuesta' }}</li>
            <li><strong>Errores previsibles:</strong> {{ opportunity.expectedFailures.length ? opportunity.expectedFailures.join(', ') : 'Sin fallos esperados' }}</li>
            <li><strong>Punto de supervisión humana:</strong> {{ opportunity.humanCheckpoint || 'Sin punto de supervisión' }}</li>
          </ul>
        </article>
      </section>

      <fieldset aria-labelledby="improvements-title">
        <legend id="improvements-title">Criterios revisados y mejoras</legend>
        <p v-if="!task.f2.criterios.length">No hay criterios aplicables todavía.</p>
          <div v-for="(improvement, index) in task.f4.mejorasCriterios" :key="improvement.criterioId">
            <label :for="`improvement-check-${index}`"><input :id="`improvement-check-${index}`" v-model="improvement.confirmado" type="checkbox" /> Criterio {{ improvement.criterioId }} revisado</label>
            <StageTextField :id="`improvement-note-${index}`" v-model="improvement.mejora" :label="`Mejora ${index + 1}`" icon="improvement" />
          </div>
          <button type="button" @click="task.f4.aar.push({ pred: '', observado: '', causa: '', mia: false })">Añadir confrontación</button>
        </fieldset>
      </div>
    </div>
  </section>
</template>
