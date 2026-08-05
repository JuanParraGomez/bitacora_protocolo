<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  id: string;
  label: string;
  modelValue?: string | null;
  icon?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  describedBy?: string;
  focusTarget?: string;
}>(), {
  modelValue: '',
  icon: 'field',
  as: 'textarea',
  rows: 3,
  describedBy: undefined,
  focusTarget: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const value = computed(() => String(props.modelValue ?? ''));
const count = computed(() => `${value.value.length}/500`);

function updateValue(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="stage-text-field" data-stage-text-field>
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
      :aria-describedby="describedBy"
      :data-focus-target="focusTarget"
      @input="updateValue"
    />
    <input
      v-else
      :id="id"
      :value="value"
      :aria-describedby="describedBy"
      :data-focus-target="focusTarget"
      @input="updateValue"
    />
    <span class="stage-text-field__count" :data-character-count="id">{{ count }}</span>
  </div>
</template>

<style scoped>
.stage-text-field {
  display: grid;
  gap: 0.35rem;
}

.stage-text-field__label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #26362b;
  font-weight: 650;
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
  justify-self: end;
  color: #526158;
  font-size: 0.75rem;
  line-height: 1.2;
}
</style>
