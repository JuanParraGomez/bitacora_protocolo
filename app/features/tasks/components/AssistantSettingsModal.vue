<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { AssistanceSettings } from '../domain/task-assistant.schema';

const props = defineProps<{
  open: boolean;
  settings: AssistanceSettings;
  saving?: boolean;
  saved?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  'update:open': [boolean];
  save: [AssistanceSettings];
}>();

const selectedMode = ref<AssistanceSettings['mode']>(props.settings.mode);
const dialogRef = ref<HTMLElement | null>(null);
const closeButtonRef = ref<HTMLButtonElement | null>(null);

const statusText = computed(() => props.errorMessage || (props.saved ? 'Preferencia guardada.' : 'La conexión real está diferida para este MVP.'));

function onDocumentKeydown(event: KeyboardEvent) {
  if (!props.open || event.key !== 'Escape') return;
  event.preventDefault();
  close();
}

watch(() => props.open, (next) => {
  if (next) {
    selectedMode.value = props.settings.mode;
    document.addEventListener('keydown', onDocumentKeydown);
    nextTick(() => closeButtonRef.value?.focus());
  } else {
    document.removeEventListener('keydown', onDocumentKeydown);
  }
});

watch(() => props.settings.mode, (next) => {
  if (!props.open) selectedMode.value = next;
});

function close() {
  emit('update:open', false);
}

function save() {
  emit('save', {
    mode: selectedMode.value,
    connectionStatus: 'deferred',
    schemaVersion: 1,
  });
}

function getFocusableElements() {
  if (!dialogRef.value) return [];
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hasAttribute('aria-hidden') && element.offsetParent !== null);
}

function trapFocus(event: KeyboardEvent) {
  const focusable = getFocusableElements();
  if (focusable.length === 0) return;
  const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const nextIndex = event.shiftKey
    ? activeIndex <= 0 ? focusable.length - 1 : activeIndex - 1
    : activeIndex === focusable.length - 1 ? 0 : activeIndex + 1;
  focusable[nextIndex]?.focus();
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onDocumentKeydown);
});

</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="assistant-settings" role="presentation" @keydown.esc.prevent="close">
      <button type="button" class="assistant-settings__backdrop" aria-label="Cerrar ajustes" tabindex="-1" @click="close" />
      <section
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-settings-title"
        aria-describedby="assistant-settings-status"
        class="assistant-settings__dialog"
        @keydown.esc.stop.prevent="close"
        @keydown.tab.prevent="trapFocus"
      >
        <header class="assistant-settings__header">
          <div>
            <p>Modo de asistencia</p>
            <h2 id="assistant-settings-title">Ajustes de asistencia</h2>
          </div>
          <button ref="closeButtonRef" type="button" class="assistant-settings__close" aria-label="Cerrar ajustes" @click="close">×</button>
        </header>

        <fieldset class="assistant-settings__options">
          <legend>Elige cómo preparar este espacio</legend>
          <label :class="{ 'assistant-settings__option': true, 'assistant-settings__option--active': selectedMode === 'codex' }">
            <input v-model="selectedMode" type="radio" name="assistance-mode" value="codex">
            <span>
              <strong>Conectarse a Codex</strong>
              <small>Prepara el flujo para asistencia Codex cuando exista la integración segura.</small>
            </span>
          </label>
          <label :class="{ 'assistant-settings__option': true, 'assistant-settings__option--active': selectedMode === 'deepseek' }">
            <input v-model="selectedMode" type="radio" name="assistance-mode" value="deepseek">
            <span>
              <strong>Usar DeepSeek API</strong>
              <small>Guarda solo la preferencia visual; no pide datos de conexión.</small>
            </span>
          </label>
        </fieldset>

        <p id="assistant-settings-status" class="assistant-settings__status" aria-live="polite">{{ statusText }}</p>

        <footer class="assistant-settings__actions">
          <button type="button" class="assistant-settings__secondary" @click="close">Cancelar</button>
          <button type="button" class="assistant-settings__primary" :disabled="saving" @click="save">
            {{ saving ? 'Guardando...' : 'Guardar ajustes' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.assistant-settings {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.assistant-settings__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(9, 22, 15, .28);
  backdrop-filter: blur(5px);
}

.assistant-settings__dialog {
  position: relative;
  display: grid;
  gap: 1.1rem;
  width: min(35rem, 100%);
  border: 1px solid #cfded4;
  border-radius: 1rem;
  padding: 1.35rem;
  color: #15211a;
  background: linear-gradient(145deg, #ffffff 0%, #f5fbf7 100%);
  box-shadow: 0 28px 80px rgba(0, 47, 28, .22);
}

.assistant-settings__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.assistant-settings__header p,
.assistant-settings__option small,
.assistant-settings__status {
  margin: 0;
  color: #59665e;
  font-size: .86rem;
}

.assistant-settings__header h2 {
  margin: .15rem 0 0;
  color: #07150e;
  font-size: 1.45rem;
}

.assistant-settings__close {
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid #d7e4db;
  border-radius: 999px;
  color: #003f27;
  background: #fff;
  font-size: 1.4rem;
  line-height: 1;
}

.assistant-settings__options {
  display: grid;
  gap: .75rem;
  margin: 0;
  border: 0;
  padding: 0;
}

.assistant-settings__options legend {
  margin-bottom: .25rem;
  color: #27342d;
  font-weight: 750;
}

.assistant-settings__option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: .8rem;
  align-items: start;
  border: 1px solid #d5e3da;
  border-radius: .8rem;
  padding: .9rem;
  background: #fff;
}

.assistant-settings__option--active {
  border-color: #007a4d;
  background: #edf8f2;
  box-shadow: inset 0 0 0 1px rgba(0, 122, 77, .15);
}

.assistant-settings__option input {
  margin-top: .2rem;
  accent-color: #007a4d;
}

.assistant-settings__option span {
  display: grid;
  gap: .25rem;
}

.assistant-settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: .65rem;
}

.assistant-settings__secondary,
.assistant-settings__primary {
  border: 1px solid #cfded4;
  border-radius: .55rem;
  padding: .7rem .95rem;
  font-weight: 750;
}

.assistant-settings__secondary {
  color: #2b3830;
  background: #fff;
}

.assistant-settings__primary {
  border-color: #007a4d;
  color: #fff;
  background: linear-gradient(135deg, #007a4d 0%, #00925d 100%);
}

.assistant-settings__primary:disabled {
  opacity: .65;
}
</style>
