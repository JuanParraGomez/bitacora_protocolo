<script setup lang="ts">
import {
  createTaskIntakeSubmissionMachine,
  transitionTaskIntakeSubmissionState,
  TASK_DIRECTIVE_MAX_LENGTH,
  TASK_NAME_MAX_LENGTH,
  type TaskIntakeSubmissionState,
  type TaskIntakeSubmission,
  validateTaskIntake,
} from './task-intake';

const props = withDefaults(defineProps<{
  disabled?: boolean;
  submissionState?: TaskIntakeSubmissionState;
}>(), {
  disabled: false,
  submissionState: 'idle',
});

const emit = defineEmits<{
  submit: [payload: TaskIntakeSubmission];
  dirty: [];
}>();
const name = ref('');
const directive = ref('');
const error = ref('');
const route = useRoute();
const submission = ref(createTaskIntakeSubmissionMachine());

const templateId = String(route.query.template || '');
if (templateId) {
  const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(`bitacora:t:${templateId}`)}`).catch(() => ({ value: null }));
  if (response.value) {
    try {
      const template = JSON.parse(response.value) as { nombre?: string; directiva?: string };
      name.value = template.nombre || '';
      directive.value = template.directiva || '';
    } catch {
      // Malformed templates remain unavailable rather than breaking intake.
    }
  }
}

watch([name, directive], () => {
  submission.value = transitionTaskIntakeSubmissionState(submission.value, 'input');
  emit('dirty');
});

watch(() => props.submissionState, (nextState) => {
  if (!nextState || nextState === submission.value.state) {
    return;
  }

  if (nextState === 'submitting') {
    return;
  }

  if (nextState === 'succeeded') {
    submission.value = transitionTaskIntakeSubmissionState(submission.value, 'success');
    return;
  }

  if (nextState === 'failed') {
    submission.value = transitionTaskIntakeSubmissionState(submission.value, 'failure');
    return;
  }

  if (nextState === 'invalid') {
    submission.value = transitionTaskIntakeSubmissionState(submission.value, 'invalid');
    return;
  }

  if (nextState === 'idle') {
    submission.value = transitionTaskIntakeSubmissionState(submission.value, 'input');
  }
});

function submit() {
  error.value = '';
  submission.value = transitionTaskIntakeSubmissionState(submission.value, 'attempt');
  if (submission.value.state !== 'submitting') {
    return;
  }

  const result = validateTaskIntake({
    name: name.value,
    directive: directive.value,
    templateTaskId: templateId || null,
  });
  if (!result.ok) {
    error.value = result.error;
    submission.value = transitionTaskIntakeSubmissionState(submission.value, 'invalid');
    return;
  }

  emit('submit', result.value);
}
</script>

<template>
  <form @submit.prevent="submit">
    <label for="task-name">Nombre</label>
    <input id="task-name" v-model="name" :maxlength="TASK_NAME_MAX_LENGTH" :disabled="props.disabled" />
    <label for="task-directive">Directiva</label>
    <textarea id="task-directive" v-model="directive" :maxlength="TASK_DIRECTIVE_MAX_LENGTH" :disabled="props.disabled" />
    <p v-if="error" role="alert">{{ error }}</p>
    <button
      type="submit"
      :disabled="props.disabled || submission.state === 'submitting'"
    >
      Crear tarea
    </button>
  </form>
</template>
