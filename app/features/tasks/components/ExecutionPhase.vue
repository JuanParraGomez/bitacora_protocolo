<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { addIteration } from '../domain/task-rules';
import { nextTick, reactive, ref, toRaw, watch } from 'vue';
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

function describedBy(field: string): string | undefined {
  return props.fieldIssueIds[field] || undefined;
}

watch(() => task.f3, () => emit('dirty'), { deep: true });

</script>

<template>
  <section aria-labelledby="phase-three-title" class="phase-workspace">
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <div v-for="(iteration, index) in task.f3.iteraciones" :key="iteration.id || index" :ref="element => { if (element) iterationRefs[index] = element as HTMLElement }" :aria-label="`Iteración ${index + 1}`">
          <h4>Iteración {{ index + 1 }}</h4>
          <StageTextField :id="`iteration-attempt-${index}`" v-model="iteration.intento" :label="`Qué hice ${index + 1}`" icon="action" as="input" :described-by="index === 0 ? describedBy('f3.iteraciones') : undefined" />
          <StageTextField :id="`iteration-result-${index}`" v-model="iteration.resultado" :label="`Qué pasó ${index + 1}`" icon="result" :described-by="index === 0 ? describedBy('f3.iteraciones') : undefined" />
          <StageTextField :id="`iteration-adjustment-${index}`" v-model="iteration.ajuste" :label="`Qué ajusté ${index + 1}`" icon="adjustment" :described-by="index === 0 ? describedBy('f3.iteraciones') : undefined" />
          <StageTextField :id="`iteration-objective-${index}`" v-model="iteration.objective" label="Objetivo de la iteración" icon="objective" :rows="2" />
          <StageTextField :id="`iteration-action-${index}`" v-model="iteration.action" label="Acción aplicada" icon="action" :rows="2" />
          <StageTextField :id="`iteration-tool-${index}`" v-model="iteration.tool" label="Herramienta usada" icon="tool" as="input" />
          <StageTextField :id="`iteration-input-${index}`" v-model="iteration.input" label="Entrada utilizada" icon="input" :rows="2" />
          <StageTextField :id="`iteration-result-output-${index}`" v-model="iteration.result" label="Resultado de la acción" icon="result" :rows="2" />
          <StageTextField :id="`iteration-evidence-${index}`" :model-value="getIterationEvidence(iteration)" label="Evidencia observada (una por línea)" icon="evidence" :rows="3" @update:model-value="value => onIterationEvidenceInput(index, value)" />
          <StageTextField :id="`iteration-learning-${index}`" v-model="iteration.learning" label="Aprendizaje" icon="learning" :rows="2" />
          <StageTextField :id="`iteration-next-adjustment-${index}`" v-model="iteration.nextAdjustment" label="Siguiente ajuste" icon="adjustment" :rows="2" />
          <StageTextField :id="`iteration-applicable-${index}`" :model-value="getApplicableConditionRows(index)" label="Condiciones aplicables" icon="conditions" :rows="2" @update:model-value="value => setApplicableConditions(index, value)" />
          <label><input v-model="iteration.success" type="checkbox" /> Iteración exitosa</label>
          <StageTextField :id="`iteration-criteria-${index}`" :model-value="getSuccessCriteriaRows(iteration)" label="Criterios de éxito (criterio:ok)" icon="criteria" :rows="2" @update:model-value="value => setSuccessCriteriaRows(index, value)" />
          <StageTextField :id="`iteration-version-${index}`" v-model="iteration.methodVersionId" label="Versión de método aplicada" icon="version" as="input" />
          <fieldset><legend>Criterios considerados</legend>
            <label v-for="criterion in task.f2.criterios" :key="criterion.id"><input v-model="iteration.criterioIds" type="checkbox" :value="criterion.id" /> {{ criterion.texto || criterion.id }}</label>
          </fieldset>
        </div>
        <button type="button" @click="appendIteration">Añadir iteración</button>
        <label><input id="phase-three-compiles" v-model="task.f3.checkCompila" type="checkbox" :aria-describedby="describedBy('f3.checkCompila')" /> Confirma que compila</label>
        <label><input id="phase-three-audited" v-model="task.f3.checkAuditado" type="checkbox" :aria-describedby="describedBy('f3.checkAuditado')" /> Confirma que fue auditado</label>
      </div>
    </div>
  </section>
</template>
