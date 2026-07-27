<script setup lang="ts">
type PromptSaveState = 'idle' | 'saving' | 'saved' | 'error';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    promptId: string;
    saveState?: PromptSaveState;
  }>(),
  {
    saveState: 'idle',
  },
);

const emit = defineEmits<{ 'update:modelValue': [value: string]; save: []; regenerate: [] }>();

const statusText = computed(() => {
  if (props.saveState === 'saving') return 'Guardando prompt…';
  if (props.saveState === 'saved') return 'Prompt guardado.';
  if (props.saveState === 'error') return 'No se pudo guardar el prompt; reintenta.';
  return '';
});

function save() {
  emit('save');
}

function regenerate() {
  emit('regenerate');
}

function onPromptInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <fieldset class="prompt-box prompt-box--surface">
    <legend>{{ label }}</legend>
    <label :for="promptId">{{ label }} editable</label>
        <textarea :id="promptId" :value="props.modelValue" rows="8" @input="onPromptInput">{{ props.modelValue }}</textarea>
    <div>
      <button type="button" :aria-label="`Regenerar ${label}`" @click="regenerate">Regenerar</button>
      <button type="button" :aria-label="`Guardar ${label}`" :disabled="props.saveState === 'saving'" @click="save">
        Guardar prompt
      </button>
    </div>
    <p role="status" aria-live="polite">{{ statusText }}</p>
  </fieldset>
</template>
