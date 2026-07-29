<script setup lang="ts">
import { computed } from 'vue';
import type { EvaluationDisplayIssue } from './workspace-presentation';

const props = withDefaults(defineProps<{
  issues: EvaluationDisplayIssue[];
  fieldIdMap?: Record<string, string>;
}>(), {
  fieldIdMap: () => ({}),
});

function normalizeIssueId(value: string): string {
  return value.replace(/\./g, '-').replace(/[^A-Za-z0-9_-]/g, '-');
}

const dedupedIssues = computed(() => {
  const seen = new Set<string>();
  return props.issues
    .map((issue, index) => ({
      ...issue,
      originalIndex: index,
      message: issue.message.trim(),
    }))
    .filter((issue) => {
      if (!issue.message) return false;
      const key = `${issue.field ?? ''}::${issue.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
});

const renderedIssues = computed(() => dedupedIssues.value.map((issue, index) => ({
  ...issue,
  id: issue.field
    ? `stage-issue-${normalizeIssueId(issue.field)}`
    : `stage-issue-general-${index + 1}`,
  controlId: issue.field ? props.fieldIdMap[issue.field] ?? null : null,
})));

const issueDescriptionIds = computed(() => renderedIssues.value.map((issue) => issue.id).join(' '));
</script>

<template>
  <section
    v-if="renderedIssues.length"
    class="stage-field-issues"
    aria-labelledby="stage-field-issues-title"
  >
    <h4 id="stage-field-issues-title">Bloqueos de la etapa</h4>
    <p
      data-testid="stage-field-issues-summary"
      class="stage-field-issues__summary"
      :aria-describedby="issueDescriptionIds"
    >
      La evaluación requiere ajustes antes de continuar.
    </p>
    <ul class="stage-field-issues__list">
      <li
        v-for="issue in renderedIssues"
        :id="issue.id"
        :key="issue.id"
        data-testid="stage-field-issue"
        :data-field="issue.field ?? 'general'"
        :data-control-id="issue.controlId ?? undefined"
      >
        {{ issue.message }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stage-field-issues {
  display: grid;
  gap: .5rem;
  border: 1px solid #d9a441;
  border-radius: .45rem;
  padding: .85rem;
  background: #fff8e8;
}

.stage-field-issues h4,
.stage-field-issues__summary {
  margin: 0;
}

.stage-field-issues h4 {
  color: #151d18;
  font-size: .9rem;
  font-weight: 760;
}

.stage-field-issues__summary {
  color: #5f4300;
  font-size: .84rem;
}

.stage-field-issues__list {
  display: grid;
  gap: .35rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #503700;
  font-size: .82rem;
}
</style>
