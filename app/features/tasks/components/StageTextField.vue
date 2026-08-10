<script setup lang="ts">
import { computed } from 'vue';
import type { EvaluationDisplayIssue } from './workspace-presentation';

const props = withDefaults(defineProps<{
  id: string;
  label: string;
  modelValue?: string | null;
  icon?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  describedBy?: string;
  focusTarget?: string;
  issues?: EvaluationDisplayIssue[];
}>(), {
  modelValue: '',
  icon: 'field',
  as: 'textarea',
  rows: 3,
  describedBy: undefined,
  focusTarget: undefined,
  issues: () => [],
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const value = computed(() => String(props.modelValue ?? ''));
const count = computed(() => `${value.value.length}/500`);
function normalizeIssueId(value: string): string {
  return value.replace(/\./g, '-').replace(/[^A-Za-z0-9_-]/g, '-');
}
const inlineIssues = computed(() => props.issues
  .map((issue, index) => ({
    ...issue,
    id: `stage-inline-issue-${normalizeIssueId(issue.field ?? props.id)}-${index + 1}`,
  }))
  .filter((issue) => issue.message.trim().length > 0));
const effectiveDescribedBy = computed(() => [
  props.describedBy,
  ...inlineIssues.value.map((issue) => issue.id),
].filter(Boolean).join(' ') || undefined);

function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="stage-text-field" :class="{ 'stage-text-field--has-issues': inlineIssues.length > 0 }" data-stage-text-field>
    <label :for="id" class="stage-text-field__label">
      <svg class="stage-text-field__icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 4.5v3.8l2.2 1.3" />
      </svg>
      <span>{{ label }}</span>
    </label>
    <textarea
      v-if="as === 'textarea'"
      :id="id"
      :value="value"
      :rows="rows"
      :aria-describedby="effectiveDescribedBy"
      :aria-invalid="inlineIssues.length ? 'true' : undefined"
      :data-focus-target="focusTarget"
      @input="updateValue"
    />
    <input
      v-else
      :id="id"
      :value="value"
      :aria-describedby="effectiveDescribedBy"
      :aria-invalid="inlineIssues.length ? 'true' : undefined"
      :data-focus-target="focusTarget"
      @input="updateValue"
    />
    <p
      v-for="issue in inlineIssues"
      :id="issue.id"
      :key="issue.id"
      data-testid="stage-inline-issue"
      class="stage-text-field__issue"
      role="alert"
    >
      {{ issue.message }}
    </p>
    <span class="stage-text-field__count" :data-character-count="id">{{ count }}</span>
  </div>
</template>

<style scoped>
.stage-text-field {
  position: relative;
  display: grid;
  gap: 0.35rem;
  border: 0;
  padding: 0;
}

.stage-text-field__label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #26362b;
  font-weight: 600;
}

.stage-text-field__icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.25;
}

.stage-text-field textarea,
.stage-text-field input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.stage-text-field__count {
  position: absolute;
  right: 0.8rem;
  bottom: 0.55rem;
  color: #526158;
  font-size: 0.72rem;
  line-height: 1.2;
  pointer-events: none;
}

.stage-text-field--has-issues .stage-text-field__count {
  position: static;
  justify-self: end;
}

.stage-text-field__issue {
  margin: 0;
  color: #8b1e2d;
  font-size: .8rem;
  font-weight: 650;
  line-height: 1.35;
}
</style>
