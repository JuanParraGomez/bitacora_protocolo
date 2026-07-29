<script setup lang="ts">
import { computed } from 'vue';
import type { Task, TaskIndex } from '../domain/task.schema';
import { projectCompletionSummary } from './workspace-presentation';

const props = withDefaults(defineProps<{
  task: Task;
  records?: TaskIndex['registros'];
}>(), {
  records: () => [],
});

defineEmits<{
  requestReturn: [];
}>();

const summary = computed(() => projectCompletionSummary(props.task, props.records));

const recordKindLabels: Record<TaskIndex['registros'][number]['resourceKind'], string> = {
  method: 'Método',
  tool: 'Herramienta',
  learning: 'Aprendizaje',
  'automation-candidate': 'Automatización',
};

function recordTitle(record: TaskIndex['registros'][number]): string {
  const legacyTitle = (record as TaskIndex['registros'][number] & { title?: string }).title;
  return record.titulo || legacyTitle || record.id;
}
</script>

<template>
  <section class="task-completion-summary" aria-label="Resumen completado">
    <header class="task-completion-summary__header">
      <p class="task-completion-summary__eyebrow">Tarea completada</p>
      <div class="task-completion-summary__heading">
        <h3>Resumen del cierre</h3>
        <p data-testid="completion-progress">{{ summary.progress }}</p>
      </div>
      <p class="task-completion-summary__intro">
        Lectura final de resultado, aprendizajes, evidencia y registros ya persistidos.
      </p>
    </header>

    <dl class="task-completion-summary__facts">
      <div class="task-completion-summary__fact">
        <dt>Resultado final</dt>
        <dd>
          <span v-if="summary.finalOutcome !== 'No registrado'">{{ summary.finalOutcome }}</span>
          <span v-else data-testid="completion-empty">No registrado</span>
        </dd>
      </div>
      <div class="task-completion-summary__fact">
        <dt>Aprendizaje</dt>
        <dd>
          <ul v-if="summary.keyLearning.length > 0">
            <li v-for="learning in summary.keyLearning" :key="learning">{{ learning }}</li>
          </ul>
          <span v-else data-testid="completion-empty">No registrado</span>
        </dd>
      </div>
      <div class="task-completion-summary__fact">
        <dt>Evidencia</dt>
        <dd>
          <ul v-if="summary.evidence.length > 0">
            <li v-for="evidence in summary.evidence" :key="evidence">{{ evidence }}</li>
          </ul>
          <span v-else data-testid="completion-empty">No registrado</span>
        </dd>
      </div>
      <div class="task-completion-summary__fact">
        <dt>Decisión</dt>
        <dd>
          <span v-if="summary.decision !== 'No registrado'">{{ summary.decision }}</span>
          <span v-else data-testid="completion-empty">No registrado</span>
        </dd>
      </div>
    </dl>

    <section class="task-completion-summary__records" aria-labelledby="completion-records-title">
      <h4 id="completion-records-title">Registros generados</h4>
      <ul v-if="summary.records.length > 0">
        <li
          v-for="record in summary.records"
          :key="record.id"
          class="task-completion-summary__record"
          data-testid="completion-record"
          :data-record-id="record.id"
        >
          <strong>{{ recordTitle(record) }}</strong>
          <span>{{ recordKindLabels[record.resourceKind] }}</span>
        </li>
      </ul>
      <p v-else data-testid="completion-empty">No registrado</p>
    </section>

    <footer class="task-completion-summary__actions">
      <button
        type="button"
        class="task-completion-summary__primary"
        data-primary-action="true"
        @click="$emit('requestReturn')"
      >
        Volver a tareas
      </button>
    </footer>
  </section>
</template>

<style scoped>
.task-completion-summary {
  display: grid;
  gap: 1.1rem;
  align-content: start;
  min-height: 100%;
  padding: 1.35rem 1.45rem;
  color: #171d19;
}

.task-completion-summary__header {
  display: grid;
  gap: .45rem;
}

.task-completion-summary__eyebrow {
  margin: 0;
  color: #4d6358;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.task-completion-summary__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: .75rem;
}

.task-completion-summary__heading h3 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.85rem);
}

.task-completion-summary__heading p {
  margin: 0;
  border: 1px solid #b7c7bd;
  border-radius: .55rem;
  padding: .3rem .65rem;
  background: #edf5ef;
  color: #194831;
  font-weight: 800;
}

.task-completion-summary__intro {
  max-width: 58rem;
  margin: 0;
  color: #4d5c54;
}

.task-completion-summary__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .85rem;
  margin: 0;
}

.task-completion-summary__fact,
.task-completion-summary__records {
  display: grid;
  gap: .45rem;
  min-width: 0;
  border: 1px solid #dce3de;
  border-radius: .65rem;
  padding: .9rem;
  background: #fbfdfb;
}

.task-completion-summary__fact dt,
.task-completion-summary__records h4 {
  margin: 0;
  color: #42534a;
  font-size: .82rem;
  font-weight: 800;
  text-transform: uppercase;
}

.task-completion-summary__fact dd {
  margin: 0;
  color: #202721;
  line-height: 1.5;
}

.task-completion-summary__fact ul,
.task-completion-summary__records ul {
  display: grid;
  gap: .4rem;
  margin: 0;
  padding-left: 1.1rem;
}

.task-completion-summary__record {
  padding-left: .1rem;
}

.task-completion-summary__record strong {
  display: block;
  color: #202721;
}

.task-completion-summary__record span {
  color: #52645a;
  font-size: .9rem;
}

.task-completion-summary__actions {
  display: flex;
  justify-content: flex-end;
}

.task-completion-summary__primary {
  border: 0;
  border-radius: .6rem;
  padding: .75rem 1rem;
  background: #1b6f4a;
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.task-completion-summary__primary:focus-visible {
  outline: 3px solid #8bd6b0;
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .task-completion-summary {
    padding: 1rem;
  }

  .task-completion-summary__facts {
    grid-template-columns: 1fr;
  }

  .task-completion-summary__actions {
    justify-content: stretch;
  }

  .task-completion-summary__primary {
    width: 100%;
  }
}
</style>
