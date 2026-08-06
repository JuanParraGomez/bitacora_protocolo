<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { computed, reactive, toRaw, watch } from 'vue';
import StageTextField from './StageTextField.vue';
import type { EvaluationDisplayIssue } from './workspace-presentation';

const props = withDefaults(defineProps<{
  task: Task;
  saveTask?: () => Promise<boolean>;
  fieldIssueIds?: Record<string, string>;
  fieldIssues?: Record<string, EvaluationDisplayIssue[]>;
}>(), {
  saveTask: undefined,
  fieldIssueIds: () => ({}),
  fieldIssues: () => ({}),
});
const task = reactive(toRaw(props.task));
const emit = defineEmits<{ save: []; dirty: [] }>();

function normalizeTextLines(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

const actorRows = computed({
  get: () => task.f1.actores.join('\n'),
  set: (next) => {
    task.f1.actores = normalizeTextLines(next);
  },
});

function describedBy(field: string): string | undefined {
  return props.fieldIssueIds[field] || undefined;
}

function issuesFor(field: string): EvaluationDisplayIssue[] {
  return props.fieldIssues[field] || [];
}

watch(() => task.f1, () => emit('dirty'), { deep: true });
</script>

<template>
  <section aria-label="Entender el problema" class="phase-workspace">
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <fieldset aria-labelledby="phase-one-priority-title">
          <legend id="phase-one-priority-title" class="sr-only">Campos prioritarios</legend>
          <StageTextField id="problem-detected" v-model="task.f1.analisisProblema.problemaDetectado" label="Problema detectado" icon="problem" :rows="3" :described-by="describedBy('f1.analisisProblema')" :issues="issuesFor('f1.analisisProblema')" />
          <StageTextField id="problem-evidence" v-model="task.f1.analisisProblema.evidencia" label="Evidencia" icon="evidence" :rows="3" :described-by="describedBy('f1.analisisProblema')" :issues="issuesFor('f1.analisisProblema')" />
          <StageTextField id="problem-analysis" v-model="task.f1.analisisProblema.analisis" label="Análisis" icon="analysis" :rows="3" :described-by="describedBy('f1.analisisProblema')" :issues="issuesFor('f1.analisisProblema.analisis')" />
        </fieldset>
        <StageTextField id="desired-result" v-model="task.f1.resultadoDeseado" label="Resultado deseado" icon="result" :rows="2" :described-by="describedBy('f1.resultadoDeseado')" :issues="issuesFor('f1.resultadoDeseado')" />
        <StageTextField id="success-criteria" v-model="task.f1.criterioExito" label="Criterio de éxito" icon="success" :rows="2" :described-by="describedBy('f1.criterioExito')" :issues="issuesFor('f1.criterioExito')" />

        <fieldset aria-labelledby="context-and-confirmation-title">
          <legend id="context-and-confirmation-title">Contexto y confirmación</legend>
          <StageTextField id="lineage-source" v-model="task.f1.linaje[0]!.origen" label="Origen del linaje" icon="lineage" as="input" :described-by="describedBy('f1.linaje')" :issues="issuesFor('f1.linaje')" focus-target="form" />
          <StageTextField id="lineage-result" v-model="task.f1.linaje[0]!.resultado" label="Resultado del linaje" icon="lineage" as="input" :described-by="describedBy('f1.linaje')" :issues="issuesFor('f1.linaje')" />
          <label><input id="mapping-confirmed" v-model="task.f1.checkMapeo" type="checkbox" :aria-describedby="describedBy('f1.checkMapeo')" /> Confirmar mapeo</label>
          <label><input id="mapping-accepted" v-model="task.f1.confirmacion" type="checkbox" /> Confirmación final</label>
          <StageTextField id="phase-one-doubts" v-model="task.f1.dudas" label="Dudas" icon="doubts" :rows="2" />
          <StageTextField id="problem-scope" v-model="task.f1.alcance" label="Alcance" icon="scope" :rows="3" :described-by="describedBy('f1.alcance')" :issues="issuesFor('f1.alcance')" />
          <StageTextField id="problem-constraints" v-model="task.f1.restricciones" label="Restricciones" icon="constraints" :rows="2" :described-by="describedBy('f1.restricciones')" :issues="issuesFor('f1.restricciones')" />
          <StageTextField id="problem-actors" v-model="actorRows" label="Actores involucrados (uno por línea)" icon="actors" :rows="3" :described-by="describedBy('f1.actores')" :issues="issuesFor('f1.actores')" />
          <label for="problem-decision">Decisión sobre el problema</label>
          <select id="problem-decision" v-model="task.f1.analisisProblema.decision" :aria-describedby="describedBy('f1.analisisProblema.decision')">
            <option value="pendiente">Pendiente</option>
            <option value="mantener">Mantener</option>
            <option value="reformular">Reformular</option>
          </select>
          <StageTextField id="problem-justification" v-model="task.f1.analisisProblema.justificacion" label="Justificación" icon="justification" :rows="3" :described-by="describedBy('f1.analisisProblema.justificacion')" :issues="issuesFor('f1.analisisProblema.justificacion')" />
          <StageTextField id="current-problem" v-model="task.f1.analisisProblema.problemaVigente" label="Formulación vigente" icon="current" :rows="3" :described-by="describedBy('f1.analisisProblema.justificacion')" :issues="issuesFor('f1.analisisProblema.justificacion')" />
        </fieldset>
      </div>
    </div>
  </section>
</template>
