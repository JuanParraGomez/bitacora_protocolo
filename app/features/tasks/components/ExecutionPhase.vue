<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { addIteration } from '../domain/task-rules';
import { nextTick, reactive, ref, toRaw } from 'vue';

const props = withDefaults(defineProps<{ task: Task; saveTask?: () => Promise<boolean> }>(), {
  saveTask: undefined,
});
const task = reactive(toRaw(props.task));
const emit = defineEmits<{ save: []; dirty: [] }>();
const iterationRefs = ref<HTMLElement[]>([]);

function appendIteration() {
  const next = addIteration(task);
  const created = next.f3.iteraciones.at(-1);
  if (created) task.f3.iteraciones.push(created);
  emit('dirty');
  nextTick(() => {
  const element = iterationRefs.value.at(-1);
  (element?.querySelector('input, textarea') as HTMLElement | null)?.focus({ preventScroll: true });
  element?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}

</script>

<template>
  <section aria-labelledby="phase-three-title" class="phase-workspace">
    <h3 id="phase-three-title">Fase 3 · Ejecución</h3>
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <div v-for="(iteration, index) in task.f3.iteraciones" :key="iteration.id || index" :ref="element => { if (element) iterationRefs[index] = element as HTMLElement }" :aria-label="`Iteración ${index + 1}`">
          <h4>Iteración {{ index + 1 }}</h4>
          <label :for="`iteration-attempt-${index}`">Qué hice {{ index + 1 }}</label>
          <input :id="`iteration-attempt-${index}`" v-model="iteration.intento" />
          <label :for="`iteration-result-${index}`">Qué pasó {{ index + 1 }}</label>
          <textarea :id="`iteration-result-${index}`" v-model="iteration.resultado" />
          <label :for="`iteration-adjustment-${index}`">Qué ajusté {{ index + 1 }}</label>
          <textarea :id="`iteration-adjustment-${index}`" v-model="iteration.ajuste" />
          <fieldset><legend>Criterios considerados</legend>
            <label v-for="criterion in task.f2.criterios" :key="criterion.id"><input v-model="iteration.criterioIds" type="checkbox" :value="criterion.id" /> {{ criterion.texto || criterion.id }}</label>
          </fieldset>
        </div>
        <button type="button" @click="appendIteration">Añadir iteración</button>
        <label><input v-model="task.f3.checkCompila" type="checkbox" /> Confirma que compila</label>
        <label><input v-model="task.f3.checkAuditado" type="checkbox" /> Confirma que fue auditado</label>
      </div>
    </div>
  </section>
</template>
