<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { computed, reactive, toRaw, watch } from 'vue';
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

function normalizeTextLines(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

const subproblemRows = computed({
  get: () => task.f2.subproblemas.join('\n'),
  set: (next) => {
    task.f2.subproblemas = normalizeTextLines(next);
  },
});

const openQuestionRows = computed({
  get: () => task.f2.preguntasAbiertas.join('\n'),
  set: (next) => {
    task.f2.preguntasAbiertas = normalizeTextLines(next);
  },
});

const riskRows = computed({
  get: () => task.f2.riesgos.join('\n'),
  set: (next) => {
    task.f2.riesgos = normalizeTextLines(next);
  },
});

function addCriterion() {
  task.f2.criterios.push({ id: `criterion-${Date.now().toString(36)}`, texto: '', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' });
  emit('dirty');
}

function describedBy(field: string): string | undefined {
  return props.fieldIssueIds[field] || undefined;
}

watch(() => task.f2, () => {
  emit('dirty');
}, { deep: true });
</script>

<template>
  <section aria-labelledby="phase-two-title" class="phase-workspace">
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <p>Propósito: convertir el análisis en una guía accionable.</p>
        <p>Beneficios: hace explícitos los criterios y permite priorizar el trabajo.</p>
        <p>Utilidad: conecta la formulación vigente con la ejecución y la revisión.</p>
        <StageTextField id="phase-two-decision" v-model="task.f2.decision" label="Decisión" icon="decision" as="input" :described-by="describedBy('f2.decision')" />
        <StageTextField id="phase-two-scope" v-model="task.f2.alcance" label="Alcance" icon="scope" :described-by="describedBy('f2.alcance')" />
        <StageTextField id="phase-two-non-goals" v-model="task.f2.noObjetivos" label="No-objetivos" icon="constraints" :described-by="describedBy('f2.alcance')" />
        <StageTextField id="phase-two-steps" v-model="task.f2.pasos" label="Pasos" icon="steps" :described-by="describedBy('f2.pasos')" />
        <StageTextField id="phase-two-dependencies" v-model="task.f2.guia" label="Dependencias y orden entre pasos" icon="dependencies" :rows="2" />
        <StageTextField id="phase-two-subproblems" v-model="subproblemRows" label="Subproblemas" icon="subproblems" :rows="3" :described-by="describedBy('f2.subproblemas')" />
        <StageTextField id="phase-two-open-questions" v-model="openQuestionRows" label="Preguntas abiertas" icon="questions" :rows="3" :described-by="describedBy('f2.preguntasAbiertas')" />
        <StageTextField id="phase-two-risks" v-model="riskRows" label="Riesgos detectados" icon="risks" :rows="3" :described-by="describedBy('f2.riesgos')" />
        <fieldset id="phase-two-predictions" :aria-describedby="describedBy('f2.predicciones')"><legend>Predicciones</legend>
          <div v-for="(prediction, index) in task.f2.predicciones" :key="index">
            <StageTextField :id="`prediction-text-${index}`" v-model="prediction.texto" :label="`Predicción ${index + 1}`" icon="prediction" as="input" />
            <StageTextField :id="`prediction-threshold-${index}`" v-model="prediction.umbral" :label="`Umbral ${index + 1}`" icon="threshold" as="input" />
          </div>
        </fieldset>
        <fieldset aria-labelledby="criteria-title">
          <legend id="criteria-title">Criterios revisados</legend>
          <article v-for="(criterion, index) in task.f2.criterios" :key="criterion.id || index">
            <StageTextField :id="`criterion-text-${index}`" v-model="criterion.texto" :label="`Criterio ${index + 1}`" icon="criterion" as="input" />
            <StageTextField :id="`criterion-comment-${index}`" v-model="criterion.comentario" :label="`Comentario revisado ${index + 1}`" icon="comment" />
            <label :for="`criterion-priority-${index}`">Prioridad {{ index + 1 }}</label>
            <select :id="`criterion-priority-${index}`" v-model="criterion.prioridad"><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select>
            <label :for="`criterion-status-${index}`">Estado {{ index + 1 }}</label>
            <select :id="`criterion-status-${index}`" v-model="criterion.estado"><option value="pendiente">Pendiente</option><option value="en-progreso">En progreso</option><option value="resuelto">Resuelto</option><option value="descartado">Descartado</option></select>
        <label :for="`criterion-impact-${index}`">Impacto {{ index + 1 }}</label>
            <select :id="`criterion-impact-${index}`" v-model="criterion.impacto"><option value="alto">Alto</option><option value="medio">Medio</option><option value="bajo">Bajo</option></select>
          </article>
          <button type="button" @click="addCriterion">Añadir criterio</button>
        </fieldset>
      </div>
    </div>
  </section>
</template>
