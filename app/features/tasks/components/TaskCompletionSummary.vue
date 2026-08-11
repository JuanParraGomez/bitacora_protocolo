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
      <ol class="task-completion-summary__steps" aria-hidden="true">
        <li v-for="step in 4" :key="step">✓</li>
      </ol>
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
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.task-completion-summary__steps {
  display: flex;
  gap: 2.6rem;
  margin: 0 0 .4rem;
  padding: 0;
  list-style: none;
}

.task-completion-summary__steps li {
  position: relative;
  display: grid;
  width: 1.45rem;
  height: 1.45rem;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  background: #044128;
  font-size: .78rem;
  font-weight: 600;
}

.task-completion-summary__steps li + li::before {
  position: absolute;
  right: calc(100% + .35rem);
  top: 50%;
  width: 1.9rem;
  height: .14rem;
  border-radius: 999px;
  background: #044128;
  content: "";
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
  color: #0d1f16;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -.01em;
}

.task-completion-summary__heading p {
  margin: 0;
  border: 1px solid #dfe6e1;
  border-radius: 999px;
  padding: .3rem .7rem;
  background: #fff;
  color: #1e2a23;
  font-size: .8rem;
  font-weight: 500;
}

.task-completion-summary__intro {
  max-width: 58rem;
  margin: 0;
  color: #68736c;
  font-size: .9rem;
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
  border: 1px solid #e6eae7;
  border-radius: .75rem;
  padding: .95rem 1rem;
  background: #fff;
}

.task-completion-summary__fact dt,
.task-completion-summary__records h4 {
  margin: 0;
  color: #242d27;
  font-size: .9rem;
  font-weight: 600;
  text-transform: none;
}

.task-completion-summary__fact dd {
  margin: 0;
  color: #3d4842;
  font-size: .9rem;
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
  border-radius: .55rem;
  padding: .7rem 1.15rem;
  background: #065535;
  color: #fff;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
}

.task-completion-summary__primary::before {
  margin-right: .4rem;
  content: "←";
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
