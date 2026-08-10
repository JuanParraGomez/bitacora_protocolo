<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import type { WorkspaceProjectGroup } from './DashboardSidebar.vue';
import TaskIntakeForm from './TaskIntakeForm.vue';
import {
  buildTaskIntakeCreatePlan,
  type TaskIntakeSubmission,
  type TaskIntakeSubmissionState,
} from './task-intake';
import { STORAGE_KEYS } from '~/shared/contracts/storage';

const props = withDefaults(defineProps<{
  open: boolean;
  projectGroups: WorkspaceProjectGroup[];
  selectedProjectId?: string;
}>(), {
  selectedProjectId: '',
});

const emit = defineEmits<{
  'update:open': [boolean];
  created: [payload: { projectId: string; taskId: string }];
}>();

const projectId = ref('');
const dirty = ref(false);
const saving = ref(false);
const submissionState = ref<TaskIntakeSubmissionState>('idle');
const error = ref('');
const openerRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);

const activeProjects = computed(() => props.projectGroups.filter((group) => group.project.status === 'active'));

function resetForm() {
  projectId.value = props.selectedProjectId || activeProjects.value[0]?.project.id || '';
  dirty.value = false;
  error.value = '';
}

function syncProjectSelection() {
  const selected = props.selectedProjectId ? activeProjects.value.find((group) => group.project.id === props.selectedProjectId) : null;
  const nextProjectId = selected?.project.id || activeProjects.value[0]?.project.id || '';
  if (projectId.value === nextProjectId) return;
  projectId.value = nextProjectId;
  if (nextProjectId && props.open) {
    error.value = '';
  }
}

watch(() => props.open, async (next) => {
  if (!next) return;
  resetForm();
  submissionState.value = 'idle';
  openerRef.value = typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  await nextTick();
  closeButtonRef.value?.focus();
}, { immediate: true });

watch(() => props.selectedProjectId, () => {
  if (!props.open) return;
  syncProjectSelection();
});

watch(() => activeProjects.value.length, () => {
  if (!props.open) return;
  syncProjectSelection();
});

function close(force = false) {
  if (!force && dirty.value && typeof window !== 'undefined') {
    const confirmed = window.confirm('Hay cambios sin guardar. ¿Quieres cerrar esta ventana?');
    if (!confirmed) return;
  }
  emit('update:open', false);
  nextTick(() => openerRef.value?.focus());
}

async function submit(payload: TaskIntakeSubmission) {
  if (!projectId.value) {
    error.value = 'Selecciona un proyecto antes de crear la tarea.';
    submissionState.value = 'invalid';
    return;
  }

  saving.value = true;
  submissionState.value = 'submitting';
  error.value = '';
  try {
    const indexResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(STORAGE_KEYS.index)}`).catch(() => ({ value: null }));
    const projectsResponse = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(STORAGE_KEYS.projects)}`).catch(() => ({ value: null }));
    const plan = buildTaskIntakeCreatePlan({
      payload: payload,
      preferredProjectId: projectId.value,
      indexValue: indexResponse.value,
      projectsValue: projectsResponse.value,
      now: Date.now(),
    });
    if (plan.resolvedProjectId !== projectId.value) {
      projectId.value = plan.resolvedProjectId;
      error.value = 'El proyecto seleccionado cambió y se asignó uno activo.';
    }

    await $fetch('/api/storage/batch', {
      method: 'POST',
      body: {
        operations: [
          {
            type: 'set',
            key: STORAGE_KEYS.task(plan.task.id),
            value: JSON.stringify(plan.task),
          },
          {
            type: 'set',
            key: STORAGE_KEYS.index,
            value: JSON.stringify(plan.index),
          },
          {
            type: 'set',
            key: STORAGE_KEYS.projects,
            value: JSON.stringify(plan.projects),
          },
        ],
      },
    });

    dirty.value = false;
    submissionState.value = 'succeeded';
    emit('created', { projectId: plan.resolvedProjectId, taskId: plan.task.id });
    await navigateTo(`/tasks/${encodeURIComponent(plan.task.id)}`);
  } catch {
    error.value = 'No se pudo crear la tarea. Reintenta.';
    submissionState.value = 'failed';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="new-task-modal" role="presentation" @keydown.esc.prevent="close()">
      <button
        type="button"
        class="new-task-modal__backdrop"
        aria-label="Cerrar nueva tarea"
        tabindex="-1"
        @click="close()"
      />
      <section
        class="new-task-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
      >
        <header class="new-task-modal__header">
          <div>
            <p>Nueva conversación</p>
            <h2 id="new-task-title">Crear tarea</h2>
          </div>
          <button
            ref="closeButtonRef"
            type="button"
            class="new-task-modal__close"
            aria-label="Cerrar nueva tarea"
            @click="close()"
          >
            ×
          </button>
        </header>

        <label for="new-task-project">Proyecto</label>
        <select
          id="new-task-project"
          v-model="projectId"
          class="new-task-modal__select"
          @change="dirty = true"
        >
          <option value="" disabled>Selecciona un proyecto</option>
          <option
            v-for="group in activeProjects"
            :key="group.project.id"
            :value="group.project.id"
          >
            {{ group.project.name }}
          </option>
        </select>

        <TaskIntakeForm
          :disabled="saving"
          :submission-state="submissionState"
          @dirty="dirty = true"
          @submit="submit"
        />

        <p v-if="error" role="alert" class="new-task-modal__error">{{ error }}</p>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.new-task-modal {
  position: fixed;
  inset: 0;
  z-index: 85;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.new-task-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(9, 22, 15, .3);
  backdrop-filter: blur(5px);
}

.new-task-modal__dialog {
  position: relative;
  display: grid;
  gap: .9rem;
  width: min(38rem, 100%);
  max-height: min(90dvh, 46rem);
  overflow: auto;
  border: 1px solid #e3e8e4;
  border-radius: .9rem;
  padding: 1.4rem;
  background: #fff;
  box-shadow: 0 28px 70px rgba(0, 47, 28, .22);
}

.new-task-modal__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.new-task-modal__header p,
.new-task-modal__header h2,
.new-task-modal__error {
  margin: 0;
}

.new-task-modal__header p {
  color: #067b46;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.new-task-modal__header h2 {
  margin-top: .2rem;
  color: #101812;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -.01em;
}

.new-task-modal__dialog > label {
  color: #334139;
  font-size: .85rem;
  font-weight: 600;
}

.new-task-modal__select,
.new-task-modal :deep(input),
.new-task-modal :deep(textarea) {
  width: 100%;
  border: 1px solid #dfe6e1;
  border-radius: .6rem;
  padding: .68rem .8rem;
  background: #fff;
  color: #173026;
  font: inherit;
}

.new-task-modal__select:focus,
.new-task-modal :deep(input:focus),
.new-task-modal :deep(textarea:focus) {
  border-color: #047d47;
  outline: 2px solid rgba(4, 125, 71, .22);
  outline-offset: 1px;
}

.new-task-modal__close {
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid #e3e8e4;
  border-radius: 999px;
  background: #fff;
  color: #5a6a61;
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
}

.new-task-modal__close:hover {
  background: #f1f4f2;
  color: #173026;
}

.new-task-modal__error {
  color: #8e2f2f;
  font-size: .85rem;
}

@media (max-width: 767px) {
  .new-task-modal__dialog {
    width: 100%;
    min-height: calc(100dvh - 1rem);
    max-height: 100dvh;
    border-radius: 0 0 0.9rem 0.9rem;
    padding: 1rem;
    transform: translateY(0);
    justify-self: stretch;
    margin: 0;
  }
}
</style>
