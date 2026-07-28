<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { computed, reactive, toRaw, watch } from 'vue';

const props = withDefaults(defineProps<{ task: Task; saveTask?: () => Promise<boolean> }>(), {
  saveTask: undefined,
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

watch(() => task.f2, () => {
  emit('dirty');
  emit('save');
}, { deep: true });
</script>

<template>
  <section aria-labelledby="phase-two-title" class="phase-workspace">
    <h3 id="phase-two-title">Fase 2 · Descomponer el camino</h3>
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <p>Propósito: convertir el análisis en una guía accionable.</p>
        <p>Beneficios: hace explícitos los criterios y permite priorizar el trabajo.</p>
        <p>Utilidad: conecta la formulación vigente con la ejecución y la revisión.</p>
        <label>Decisión <input v-model="task.f2.decision" /></label>
        <label>Alcance <textarea v-model="task.f2.alcance" /></label>
        <label>No-objetivos <textarea v-model="task.f2.noObjetivos" /></label>
        <label>Pasos <textarea v-model="task.f2.pasos" /></label>
        <label>Dependencias y orden entre pasos <textarea v-model="task.f2.guia" rows="2" /></label>
        <label>Subproblemas <textarea v-model="subproblemRows" rows="3" /></label>
        <label>Preguntas abiertas <textarea v-model="openQuestionRows" rows="3" /></label>
        <label>Riesgos detectados <textarea v-model="riskRows" rows="3" /></label>
        <fieldset><legend>Predicciones</legend>
          <div v-for="(prediction, index) in task.f2.predicciones" :key="index">
            <label>Predicción {{ index + 1 }} <input v-model="prediction.texto" /></label>
            <label>Umbral {{ index + 1 }} <input v-model="prediction.umbral" /></label>
          </div>
        </fieldset>
        <fieldset aria-labelledby="criteria-title">
          <legend id="criteria-title">Criterios revisados</legend>
          <article v-for="(criterion, index) in task.f2.criterios" :key="criterion.id || index">
            <label :for="`criterion-text-${index}`">Criterio {{ index + 1 }}</label>
            <input :id="`criterion-text-${index}`" v-model="criterion.texto" />
            <label :for="`criterion-comment-${index}`">Comentario revisado {{ index + 1 }}</label>
            <textarea :id="`criterion-comment-${index}`" v-model="criterion.comentario" />
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
