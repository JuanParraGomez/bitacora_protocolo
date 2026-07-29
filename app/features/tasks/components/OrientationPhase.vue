<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { computed, reactive, toRaw } from 'vue';

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

const actorRows = computed({
  get: () => task.f1.actores.join('\n'),
  set: (next) => {
    task.f1.actores = normalizeTextLines(next);
  },
});
</script>

<template>
  <section aria-labelledby="phase-one-title" class="phase-workspace">
    <h3 id="phase-one-title">Fase 1 · Entender el problema</h3>
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <fieldset aria-labelledby="phase-one-priority-title">
          <legend id="phase-one-priority-title">Síntesis operativa</legend>
          <label for="problem-detected">Problema detectado</label>
          <textarea id="problem-detected" v-model="task.f1.analisisProblema.problemaDetectado" rows="3" />
          <label for="problem-evidence">Evidencia</label>
          <textarea id="problem-evidence" v-model="task.f1.analisisProblema.evidencia" rows="3" />
          <label for="problem-analysis">Análisis</label>
          <textarea id="problem-analysis" v-model="task.f1.analisisProblema.analisis" rows="3" />
        </fieldset>
        <label for="desired-result">Resultado deseado</label>
        <textarea id="desired-result" v-model="task.f1.resultadoDeseado" rows="2" />
        <label for="success-criteria">Criterio de éxito</label>
        <textarea id="success-criteria" v-model="task.f1.criterioExito" rows="2" />

        <fieldset aria-labelledby="context-and-confirmation-title">
          <legend id="context-and-confirmation-title">Contexto y confirmación</legend>
          <label for="lineage-source">Origen del linaje</label>
          <input
            id="lineage-source"
            v-model="task.f1.linaje[0]!.origen"
            data-focus-target="form"
          />
          <label for="lineage-result">Resultado del linaje</label>
          <input id="lineage-result" v-model="task.f1.linaje[0]!.resultado" />
          <label><input id="mapping-confirmed" v-model="task.f1.checkMapeo" type="checkbox" /> Confirmar mapeo</label>
          <label><input id="mapping-accepted" v-model="task.f1.confirmacion" type="checkbox" /> Confirmación final</label>
          <label for="phase-one-doubts">Dudas</label>
          <textarea id="phase-one-doubts" v-model="task.f1.dudas" rows="2" />
          <label for="problem-scope">Alcance</label>
          <textarea id="problem-scope" v-model="task.f1.alcance" rows="3" />
          <label for="problem-constraints">Restricciones</label>
          <textarea id="problem-constraints" v-model="task.f1.restricciones" rows="2" />
          <label for="problem-actors">Actores involucrados (uno por línea)</label>
          <textarea id="problem-actors" v-model="actorRows" rows="3" />
          <label for="problem-decision">Decisión sobre el problema</label>
          <select id="problem-decision" v-model="task.f1.analisisProblema.decision">
            <option value="pendiente">Pendiente</option>
            <option value="mantener">Mantener</option>
            <option value="reformular">Reformular</option>
          </select>
          <label for="problem-justification">Justificación</label>
          <textarea id="problem-justification" v-model="task.f1.analisisProblema.justificacion" rows="3" />
          <label for="current-problem">Formulación vigente</label>
          <textarea id="current-problem" v-model="task.f1.analisisProblema.problemaVigente" rows="3" />
        </fieldset>
      </div>
    </div>
  </section>
</template>
