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

function normalizeTextLines(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function joinTextLines(value: string[]): string {
  return value.map((entry) => entry.trim()).filter((entry) => entry.length > 0).join('\n');
}

function getIterationEvidence(iteration: Task['f3']['iteraciones'][number]): string {
  return joinTextLines((iteration.evidence || []).map((entry) => entry.value));
}

function onIterationEvidenceInput(index: number, value: string) {
  const iteration = task.f3.iteraciones[index];
  if (!iteration) return;

  const entries = normalizeTextLines(value);
  iteration.evidence = entries.map((entry, offset) => {
    const current = iteration.evidence?.[offset];
    return {
      id: current?.id || `evidence-${Date.now().toString(36)}-${offset}`,
      kind: 'note',
      label: `Evidencia ${offset + 1}`,
      value: entry,
    };
  });
}

function getApplicableConditionRows(index: number): string {
  return joinTextLines(task.f3.iteraciones[index]?.applicableConditions || []);
}

function setApplicableConditions(index: number, value: string) {
  const iteration = task.f3.iteraciones[index];
  if (!iteration) return;
  iteration.applicableConditions = normalizeTextLines(value);
}

function getSuccessCriteriaRows(iteration: Task['f3']['iteraciones'][number]): string {
  return joinTextLines((iteration.successCriteriaResults || []).map((entry) => `${entry.criterion}:${entry.passed ? 'ok' : 'pendiente'}`));
}

function setSuccessCriteriaRows(index: number, value: string) {
  const iteration = task.f3.iteraciones[index];
  if (!iteration) return;
  iteration.successCriteriaResults = normalizeTextLines(value)
    .map((entry) => {
      const [criterion, status] = entry.split(':');
      return {
        criterion: (criterion ?? '').trim(),
        passed: (status ?? '').trim().toLowerCase() === 'ok',
      };
    })
    .filter((entry) => entry.criterion.length > 0);
}

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
          <label :for="`iteration-objective-${index}`">Objetivo de la iteración</label>
          <textarea :id="`iteration-objective-${index}`" v-model="iteration.objective" rows="2" />
          <label :for="`iteration-action-${index}`">Acción aplicada</label>
          <textarea :id="`iteration-action-${index}`" v-model="iteration.action" rows="2" />
          <label :for="`iteration-tool-${index}`">Herramienta usada</label>
          <input :id="`iteration-tool-${index}`" v-model="iteration.tool" />
          <label :for="`iteration-input-${index}`">Entrada utilizada</label>
          <textarea :id="`iteration-input-${index}`" v-model="iteration.input" rows="2" />
          <label :for="`iteration-result-output-${index}`">Resultado de la acción</label>
          <textarea :id="`iteration-result-output-${index}`" v-model="iteration.result" rows="2" />
          <label :for="`iteration-evidence-${index}`">Evidencia observada (una por línea)</label>
          <textarea
            :id="`iteration-evidence-${index}`"
            :value="getIterationEvidence(iteration)"
            rows="3"
            @input="(event) => onIterationEvidenceInput(index, (event.target as HTMLTextAreaElement).value)"
          />
          <label :for="`iteration-learning-${index}`">Aprendizaje</label>
          <textarea :id="`iteration-learning-${index}`" v-model="iteration.learning" rows="2" />
          <label :for="`iteration-next-adjustment-${index}`">Siguiente ajuste</label>
          <textarea :id="`iteration-next-adjustment-${index}`" v-model="iteration.nextAdjustment" rows="2" />
          <label :for="`iteration-applicable-${index}`">Condiciones aplicables</label>
          <textarea
            :id="`iteration-applicable-${index}`"
            :value="getApplicableConditionRows(index)"
            rows="2"
            @input="(event) => setApplicableConditions(index, (event.target as HTMLTextAreaElement).value)"
          />
          <label><input v-model="iteration.success" type="checkbox" /> Iteración exitosa</label>
          <label :for="`iteration-criteria-${index}`">Criterios de éxito (criterio:ok)</label>
          <textarea
            :id="`iteration-criteria-${index}`"
            :value="getSuccessCriteriaRows(iteration)"
            rows="2"
            @input="(event) => setSuccessCriteriaRows(index, (event.target as HTMLTextAreaElement).value)"
          />
          <label :for="`iteration-version-${index}`">Versión de método aplicada</label>
          <input :id="`iteration-version-${index}`" v-model="iteration.methodVersionId" />
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
