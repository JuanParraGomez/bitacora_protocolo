<script setup lang="ts">
import { deriveCriterionImprovements } from '../domain/task-rules';
import type { Task } from '../domain/task.schema';
import { reactive, toRaw, watch } from 'vue';

const props = withDefaults(defineProps<{ task: Task; saveTask?: () => Promise<boolean> }>(), {
  saveTask: undefined,
});
const task = reactive(toRaw(props.task));
const emit = defineEmits<{ save: []; dirty: [] }>();

function syncImprovements() {
  const current = new Map(task.f4.mejorasCriterios.map(item => [item.criterioId, item]));
  task.f4.mejorasCriterios = deriveCriterionImprovements(task).map(item => current.get(item.criterioId) || item);
}

watch(() => task.f2.criterios.map(criterion => criterion.id), syncImprovements, { immediate: true });
</script>

<template>
  <section aria-labelledby="phase-four-title" class="phase-workspace">
    <h3 id="phase-four-title">Fase 4 · Revisión</h3>
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <div v-for="(review, index) in task.f4.aar" :key="index">
          <label>Observado {{ index + 1 }} <input v-model="review.observado" /></label>
          <label>Causa {{ index + 1 }} <input v-model="review.causa" /></label>
          <label><input v-model="review.mia" type="checkbox" /> Fue una suposición propia</label>
        </div>
        <label>Cambio procedimental <textarea v-model="task.f4.cambio" /></label>
        <label>Título <input v-model="task.f4.titulo" /></label>
        <fieldset aria-labelledby="improvements-title">
          <legend id="improvements-title">Criterios revisados y mejoras</legend>
          <p v-if="!task.f2.criterios.length">No hay criterios aplicables todavía.</p>
          <div v-for="(improvement, index) in task.f4.mejorasCriterios" :key="improvement.criterioId">
            <label :for="`improvement-check-${index}`"><input :id="`improvement-check-${index}`" v-model="improvement.confirmado" type="checkbox" /> Criterio {{ improvement.criterioId }} revisado</label>
            <label :for="`improvement-note-${index}`">Mejora {{ index + 1 }}</label>
            <textarea :id="`improvement-note-${index}`" v-model="improvement.mejora" />
          </div>
          <button type="button" @click="task.f4.aar.push({ pred: '', observado: '', causa: '', mia: false })">Añadir confrontación</button>
        </fieldset>
      </div>
    </div>
  </section>
</template>
