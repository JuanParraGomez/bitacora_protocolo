<script setup lang="ts">
import type { Task } from '../domain/task.schema';
import { reactive, toRaw } from 'vue';

const props = withDefaults(defineProps<{ task: Task; saveTask?: () => Promise<boolean> }>(), {
  saveTask: undefined,
});
const task = reactive(toRaw(props.task));
const emit = defineEmits<{ save: []; dirty: [] }>();
</script>

<template>
  <section aria-labelledby="phase-one-title" class="phase-workspace">
    <h3 id="phase-one-title">Fase 1 · Orientación</h3>
    <div class="phase-workspace__content">
      <div class="phase-workspace__form">
        <label for="lineage-source">Origen del linaje</label>
        <input
          id="lineage-source"
          v-model="task.f1.linaje[0]!.origen"
          data-focus-target="form"
        />
        <label for="lineage-result">Resultado del linaje</label>
        <input id="lineage-result" v-model="task.f1.linaje[0]!.resultado" />
        <label><input id="mapping-confirmed" v-model="task.f1.checkMapeo" type="checkbox" /> Confirmar mapeo</label>
        <fieldset aria-labelledby="problem-analysis-title">
          <legend id="problem-analysis-title">Protocolo analítico del problema</legend>
          <label for="problem-detected">Problema detectado</label>
          <textarea id="problem-detected" v-model="task.f1.analisisProblema.problemaDetectado" rows="3" />
          <label for="problem-evidence">Evidencia</label>
          <textarea id="problem-evidence" v-model="task.f1.analisisProblema.evidencia" rows="3" />
          <label for="problem-analysis">Análisis</label>
          <textarea id="problem-analysis" v-model="task.f1.analisisProblema.analisis" rows="3" />
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
