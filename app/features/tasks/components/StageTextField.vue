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

const ICON_PATHS: Record<string, string> = {
  problem: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  evidence: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  analysis: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  result: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  success: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  criterion: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  criteria: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  lineage: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  doubts: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  questions: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  scope: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
  constraints: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  actors: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  justification: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  current: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  decision: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  risks: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  steps: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  subproblems: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  prediction: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  threshold: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  objective: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  learning: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  connections: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  change: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  dependencies: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  action: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  improvement: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  pattern: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  observed: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  input: '<polyline points="15 3 21 3 21 9"/><line x1="21" y1="3" x2="9" y2="15"/><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>',
  adjustment: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  conditions: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  title: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
  version: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  cause: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  field: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
};
const iconMarkup = computed(() => ICON_PATHS[props.icon] ?? ICON_PATHS.field);

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
      <svg class="stage-text-field__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" v-html="iconMarkup" />
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
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
  fill: none;
  color: #4f5c55;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
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
