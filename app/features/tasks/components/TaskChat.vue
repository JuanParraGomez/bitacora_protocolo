<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type ComponentPublicInstance } from 'vue';
import { formUpdateSchema, type AssistantMessage, type ProposalDecision } from '../domain/task-assistant.schema';

type ChatSendStatus = 'ready' | 'submitted' | 'streaming' | 'error';
type ChatUpdate = {
  field: string;
  sourceMessageId: string;
  id: string;
  baseRevision: string;
  previousValue?: unknown;
  value: unknown;
  status: 'applied' | 'rejected' | 'conflict' | 'proposed';
};
type ChatMessage = Omit<AssistantMessage, 'updates'> & {
  updates: ChatUpdate[];
  actions?: Array<{
    label?: string;
    icon?: string;
    onClick?: (event: MouseEvent, message: AssistantMessage) => void;
  }>;
};

const props = withDefaults(defineProps<{
  messages: AssistantMessage[];
  suggestions?: string[];
  sendStatus?: ChatSendStatus;
  disabled?: boolean;
  errorMessage?: string;
  workspaceLabel?: string;
  draft?: string;
  restoreMessageId?: string | null;
}>(), {
  sendStatus: 'ready',
  suggestions: () => [],
  disabled: false,
  errorMessage: '',
  workspaceLabel: 'este espacio',
  draft: undefined,
  restoreMessageId: null,
});

const emit = defineEmits<{
  send: [text: string];
  retry: [messageId: string];
  proposalDecision: [decision: ProposalDecision];
  updateDraft: [draft: string];
  visibleMessage: [messageId: string | null];
}>();

const internalDraft = ref('');
const messagesRoot = ref<HTMLElement | ComponentPublicInstance | null>(null);
const proposalEdits = reactive<Record<string, string>>({});
const proposalEditErrors = reactive<Record<string, string>>({});
let visibleMessageFrame = 0;
let restoreMessageFrame = 0;
let restoreMessageTimer = 0;
const isRestoringAnchor = ref(false);

const draft = computed({
  get: () => props.draft ?? internalDraft.value,
  set: (value: string) => {
    internalDraft.value = value;
    emit('updateDraft', value);
  },
});

const sortedMessages = computed<ChatMessage[]>(() => {
  return [...props.messages]
    .slice()
    .map((message, index) => ({ message, index }))
    .sort((left, right) => left.message.createdAt - right.message.createdAt || left.index - right.index)
    .map(({ message }) => message)
    .map((message) => ({
      ...message,
      updates: (message.updates as ChatUpdate[] | undefined)?.map((update) => update) ?? [],
      actions: message.role === 'user' && message.status === 'error'
        ? [{
            label: 'Reintentar',
            icon: 'i-lucide-rotate-cw',
            onClick: () => emit('retry', message.id),
          }]
        : [],
    }));
});

const isReady = computed(() => props.sendStatus === 'ready' && !props.disabled);
const visibleSuggestions = computed(() => props.suggestions.slice(0, 3));
const latestFailedMessage = computed(() => [...sortedMessages.value]
  .reverse()
  .find((message) => message.role === 'user' && message.status === 'error'));

const ariaStatus = computed(() => {
  if (props.sendStatus === 'submitted' || props.sendStatus === 'streaming') return 'Enviando mensaje.';
  if (props.sendStatus === 'error') return props.errorMessage || 'No se pudo enviar. Reintenta.';
  if (!sortedMessages.value.length) return 'Sin mensajes aún.';
  return 'Mensajes listos.';
});

function extractText(message: AssistantMessage): string {
  return (message.parts ?? []).map((part: { type: string; text?: string }) => part.type === 'text' ? part.text ?? '' : '').join(' ').trim() || '';
}

function updateStatusLabel(update: ChatUpdate): string {
  if (update.status === 'applied') return 'Aplicado';
  if (update.status === 'conflict') return 'Conflicto';
  if (update.status === 'rejected') return 'Rechazado';
  return 'Propuesta';
}

function updateKey(message: ChatMessage, update: ChatUpdate): string {
  return `${message.id}-${update.field}-${update.sourceMessageId}`;
}

function updateValueText(update: ChatUpdate): string {
  return typeof update.value === 'string' ? update.value : String(update.value);
}

function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    'f1.analisisProblema.problemaDetectado': 'Problema detectado',
    'f1.analisisProblema.evidencia': 'Evidencia',
    'f1.analisisProblema.analisis': 'Análisis',
    'f1.analisisProblema.decision': 'Decisión',
    'f1.analisisProblema.justificacion': 'Justificación',
    'f1.analisisProblema.problemaVigente': 'Formulación vigente',
    'f1.resultadoDeseado': 'Resultado deseado',
    'f1.alcance': 'Alcance',
    'f1.restricciones': 'Restricciones',
    'f1.actores': 'Actores',
    'f1.criterioExito': 'Criterio de éxito',
    'f2.decision': 'Decisión',
    'f2.alcance': 'Alcance',
    'f2.noObjetivos': 'No objetivos',
    'f2.pasos': 'Pasos',
    'f2.guia': 'Guía',
    'f2.criterios': 'Criterios',
    'f3.notas': 'Notas de iteración',
    'f4.cambio': 'Cambio consolidado',
    'f4.titulo': 'Título del método',
  };
  return labels[field] ?? field;
}

function previousValueText(update: ChatUpdate): string {
  if (update.previousValue === undefined || update.previousValue === null || update.previousValue === '') {
    return 'Sin valor confirmado';
  }
  if (typeof update.previousValue === 'string') return update.previousValue;
  return JSON.stringify(update.previousValue);
}

function proposalEditValue(update: ChatUpdate): string {
  if (!(update.id in proposalEdits)) {
    proposalEdits[update.id] = typeof update.value === 'string' ? update.value : JSON.stringify(update.value);
  }
  return proposalEdits[update.id] ?? '';
}

function setProposalEdit(update: ChatUpdate, value: string) {
  proposalEdits[update.id] = value;
  delete proposalEditErrors[update.id];
}

function parseProposalEditValue(update: ChatUpdate): unknown {
  const raw = proposalEditValue(update);
  if (typeof update.value === 'string') return raw;

  if (typeof update.value === 'boolean') {
    if (raw.trim() === 'true') return true;
    if (raw.trim() === 'false') return false;
    throw new Error('Escribe true o false.');
  }

  if (typeof update.value === 'number') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
    throw new Error('Escribe un número válido.');
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error('Escribe un valor JSON válido.');
  }
}

function decide(update: ChatUpdate, action: ProposalDecision['action']) {
  if (action === 'edit') {
    let value: unknown;
    try {
      value = parseProposalEditValue(update);
      const validation = formUpdateSchema.safeParse({ ...update, value });
      if (!validation.success) {
        throw new Error('El valor no coincide con el formato del campo.');
      }
      delete proposalEditErrors[update.id];
    } catch (cause) {
      proposalEditErrors[update.id] = cause instanceof Error ? cause.message : 'Revisa el valor editado.';
      return;
    }
    emit('proposalDecision', {
      action,
      proposalId: update.id,
      value,
      baseRevision: update.baseRevision,
    });
    return;
  }
  emit('proposalDecision', {
    action,
    proposalId: update.id,
    baseRevision: update.baseRevision,
  });
}

function onSendSubmit(event?: Event) {
  event?.preventDefault();
  const value = draft.value.trim();
  if (!value || !isReady.value) return;
  emit('send', value);
  draft.value = '';
}

function onSuggestionClick(value: string) {
  draft.value = value;
  onSendSubmit();
}

function retryLatest() {
  if (latestFailedMessage.value) {
    emit('retry', latestFailedMessage.value.id);
  }
}

function messageViewport(): HTMLElement | null {
  const candidate = messagesRoot.value;
  if (!candidate) return null;
  if (candidate instanceof HTMLElement) return candidate;
  return candidate.$el instanceof HTMLElement ? candidate.$el : null;
}

function restoreMessageAnchor() {
  if (!props.restoreMessageId || typeof window === 'undefined') return;
  isRestoringAnchor.value = true;
  void nextTick(() => {
    window.cancelAnimationFrame(restoreMessageFrame);
    window.clearTimeout(restoreMessageTimer);
    const scrollToAnchor = () => {
      const viewport = messageViewport();
      const target = viewport?.querySelector<HTMLElement>(
        `[data-message-id="${CSS.escape(props.restoreMessageId ?? '')}"]`,
      );
      target?.scrollIntoView({ block: 'center', behavior: 'auto' });
    };
    restoreMessageFrame = window.requestAnimationFrame(() => {
      restoreMessageFrame = window.requestAnimationFrame(() => {
        scrollToAnchor();
        restoreMessageTimer = window.setTimeout(() => {
          scrollToAnchor();
          isRestoringAnchor.value = false;
          reportLastVisibleMessage();
        }, 150);
      });
    });
  });
}

function reportLastVisibleMessage() {
  if (typeof window === 'undefined') return;
  if (isRestoringAnchor.value) return;
  window.cancelAnimationFrame(visibleMessageFrame);
  visibleMessageFrame = window.requestAnimationFrame(() => {
    const viewport = messageViewport();
    if (!viewport) return;
    const viewportRect = viewport.getBoundingClientRect();
    const messages = [...viewport.querySelectorAll<HTMLElement>('[data-message-id]')];
    const visible = messages
      .filter((message) => {
        const rect = message.getBoundingClientRect();
        return rect.bottom > viewportRect.top && rect.top < viewportRect.bottom;
      });
    const visibleMessageId = visible.at(-1)?.dataset.messageId;
    if (visibleMessageId) {
      emit('visibleMessage', visibleMessageId);
    } else if (messages.length === 0) {
      emit('visibleMessage', null);
    }
  });
}

watch(
  () => [props.restoreMessageId, props.messages.length],
  restoreMessageAnchor,
);

onMounted(() => {
  restoreMessageAnchor();
  reportLastVisibleMessage();
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.cancelAnimationFrame(visibleMessageFrame);
  window.cancelAnimationFrame(restoreMessageFrame);
  window.clearTimeout(restoreMessageTimer);
});
</script>

<template>
  <section class="task-chat" aria-label="Chat de asistencia">
    <h3 class="task-chat__title">Asistente del workspace</h3>
    <p role="status" aria-live="polite" class="sr-only">{{ ariaStatus }}</p>

    <UChatMessages
      ref="messagesRoot"
      :messages="sortedMessages"
      :status="props.sendStatus"
      class="task-chat__messages"
      @scroll.passive="reportLastVisibleMessage"
    >
      <template #content="{ message }">
        <article
          v-if="extractText(message)"
          :class="['task-chat__bubble', message.role === 'user' ? 'task-chat__bubble--user' : 'task-chat__bubble--assistant']"
          :data-message-id="message.id"
        >
          <span class="task-chat__avatar" data-message-avatar aria-hidden="true">{{ message.role === 'assistant' ? '✦' : 'Tú' }}</span>
          <div class="task-chat__bubble-content">
            <div class="task-chat__message-heading">
              <strong>{{ message.role === 'assistant' ? 'Agente IA' : 'Tú' }}</strong>
              <time :datetime="new Date(message.createdAt).toISOString()">{{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</time>
            </div>
            <p class="task-chat__message-body">{{ extractText(message) }}</p>
            <p v-if="message.primaryQuestion" class="task-chat__primary-question">{{ message.primaryQuestion }}</p>
          </div>
        </article>
        <p
          v-if="message.role === 'user' && message.status === 'sending'"
          class="task-chat__message-meta"
        >
          Enviando...
        </p>
        <p
          v-if="message.role === 'user' && message.status === 'error'"
          class="task-chat__message-meta task-chat__message-meta--error"
        >
          Error al enviar.
        </p>

        <ul v-if="message.role === 'assistant' && (message as ChatMessage).updates?.length" class="task-chat__updates">
          <li
            v-for="update in (message as ChatMessage).updates"
            :key="updateKey(message as ChatMessage, update as ChatUpdate)"
            role="group"
            :aria-label="`Propuesta para ${fieldLabel((update as ChatUpdate).field)}`"
            class="task-chat__proposal"
          >
            <header>
              <strong>Propuesta para {{ fieldLabel((update as ChatUpdate).field) }}</strong>
              <span>{{ updateStatusLabel(update as ChatUpdate) }}</span>
            </header>
            <p>Valor anterior: {{ previousValueText(update as ChatUpdate) }}</p>
            <p>Valor propuesto: {{ updateValueText(update as ChatUpdate) }}</p>
            <template v-if="(update as ChatUpdate).status === 'proposed'">
              <label :for="`proposal-edit-${(update as ChatUpdate).id}`">
                Editar propuesta para {{ fieldLabel((update as ChatUpdate).field) }}
              </label>
              <input
                :id="`proposal-edit-${(update as ChatUpdate).id}`"
                :value="proposalEditValue(update as ChatUpdate)"
                :aria-invalid="proposalEditErrors[(update as ChatUpdate).id] ? 'true' : undefined"
                :aria-describedby="proposalEditErrors[(update as ChatUpdate).id] ? `proposal-error-${(update as ChatUpdate).id}` : undefined"
                @input="setProposalEdit(update as ChatUpdate, ($event.target as HTMLInputElement).value)"
              >
              <p
                v-if="proposalEditErrors[(update as ChatUpdate).id]"
                :id="`proposal-error-${(update as ChatUpdate).id}`"
                role="alert"
                class="task-chat__proposal-error"
              >
                {{ proposalEditErrors[(update as ChatUpdate).id] }}
              </p>
              <div class="task-chat__proposal-actions">
                <button type="button" aria-label="Aceptar propuesta" @click="decide(update as ChatUpdate, 'accept')">Aceptar</button>
                <button type="button" aria-label="Editar propuesta" @click="decide(update as ChatUpdate, 'edit')">Editar</button>
                <button type="button" aria-label="Descartar propuesta" @click="decide(update as ChatUpdate, 'reject')">Descartar</button>
              </div>
            </template>
          </li>
        </ul>
        <ul v-if="message.role === 'assistant' && message.contradictions?.length" class="task-chat__contradictions">
          <li v-for="item in message.contradictions" :key="item.id">{{ item.message }}</li>
        </ul>
      </template>
    </UChatMessages>

    <div v-if="$slots.default" class="task-chat__inline-content">
      <slot />
    </div>

    <div v-if="visibleSuggestions.length" class="task-chat__suggestions" role="list" aria-label="Sugerencias rápidas">
      <button
        v-for="suggestion in visibleSuggestions"
        :key="suggestion"
        type="button"
        class="task-chat__suggestion"
        @click="() => onSuggestionClick(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <label id="task-chat-composer-label" class="task-chat__composer-label" for="task-chat-composer-input">Escribe al agente…</label>

    <UChatPrompt
      id="task-chat-composer-input"
      v-model="draft"
      class="task-chat__composer"
      data-focus-target="chat"
      as="form"
      aria-labelledby="task-chat-composer-label"
      :disabled="props.disabled"
      placeholder="Escribe al agente…"
      :loading="props.sendStatus === 'submitted' || props.sendStatus === 'streaming'"
      @submit="onSendSubmit"
    >
      <template #footer>
        <button type="button" data-testid="attach-file" aria-disabled="true" disabled title="Los adjuntos estarán disponibles próximamente">Adjuntar</button>
        <UChatPromptSubmit
          aria-label="Enviar mensaje"
          :status="props.sendStatus"
          :disabled="props.disabled || props.sendStatus !== 'ready' || !draft.trim()"
          @reload="retryLatest"
        />
      </template>
    </UChatPrompt>
  </section>
</template>

<style scoped>
.task-chat {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  height: 100%;
}

.task-chat__title {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.task-chat__messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 1.4rem 1.55rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .72), rgba(250, 252, 250, .86)),
    radial-gradient(circle at 30% 0%, rgba(0, 122, 77, .06), transparent 34%);
}

.task-chat__bubble {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: .75rem;
  width: min(78%, 34rem);
  margin: 0 0 1rem;
}

.task-chat__bubble--user {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-left: auto;
}

.task-chat__bubble--user .task-chat__avatar {
  grid-column: 2;
  grid-row: 1;
}

.task-chat__bubble--user .task-chat__bubble-content {
  grid-column: 1;
  grid-row: 1;
}

.task-chat__avatar {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #fff;
  background: radial-gradient(circle at 30% 20%, #1bb47a, #006c45 70%);
  box-shadow: 0 10px 24px rgba(0, 95, 62, .18);
}

.task-chat__bubble-content {
  border: 1px solid #dce2de;
  border-radius: .85rem;
  padding: .82rem 1rem;
  color: #1d241f;
  background: #fff;
  box-shadow: 0 12px 30px rgba(30, 40, 34, .035);
}

.task-chat__bubble--user .task-chat__bubble-content {
  border-color: #9bc9b5;
  background: #edf8f3;
}

.task-chat__message-body {
  margin: 0;
  white-space: pre-wrap;
}

.task-chat__message-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: .75rem;
  margin-bottom: .35rem;
  color: #25332b;
  font-size: .78rem;
}

.task-chat__message-heading time {
  color: #526058;
  font-size: .72rem;
  font-weight: 500;
}

.task-chat__primary-question {
  margin: .65rem 0 0;
  font-weight: 650;
}

.task-chat__bubble small {
  display: block;
  margin-top: .35rem;
  color: #526058;
  font-size: .74rem;
}

.task-chat__message-meta {
  margin: -.7rem 0 1rem 2.8rem;
  font-size: 0.75rem;
}

.task-chat__message-meta--error {
  color: #b91c1c;
}

.task-chat__updates {
  display: grid;
  gap: .6rem;
  margin: .5rem 0 1rem 2.75rem;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.task-chat__proposal {
  display: grid;
  gap: .45rem;
  border: 1px solid #cfd9d3;
  border-radius: .7rem;
  padding: .8rem;
  background: #fff;
}

.task-chat__proposal header,
.task-chat__proposal-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .45rem;
}

.task-chat__proposal p,
.task-chat__proposal label {
  margin: 0;
}

.task-chat__proposal input {
  width: 100%;
  border: 1px solid #b9c6be;
  border-radius: .4rem;
  padding: .55rem .65rem;
}

.task-chat__proposal-actions button {
  flex: 1 1 7rem;
  min-height: 2.25rem;
}

.task-chat__contradictions {
  margin: .5rem 0 1rem 2.75rem;
  color: #9a3412;
}

.task-chat__suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: .95rem 1.25rem 1.1rem;
  border-top: 1px solid #dde3de;
  background: #fff;
}

.task-chat__inline-content {
  display: grid;
  flex: 0 1 auto;
  gap: .75rem;
  max-height: min(46dvh, 34rem);
  overflow: auto;
  padding: .8rem 1.25rem;
  border-top: 1px solid #dde3de;
  background: #fff;
}

.task-chat__suggestions::before {
  flex-basis: 100%;
  color: #1f2924;
  content: "Sugerencias para continuar";
  font-size: .8rem;
  text-align: center;
}

.task-chat__suggestion {
  min-width: 10rem;
  border: 1px solid #006c45;
  border-radius: .45rem;
  padding: .65rem .85rem;
  color: #173126;
  font-size: 0.78rem;
  background: #fbfffd;
  box-shadow: 0 8px 18px rgba(0, 95, 62, .07);
}

.task-chat__composer {
  margin: 0;
  padding: .9rem 1.35rem 1.05rem;
  border-top: 1px solid #dde3de;
  background: #fff;
}

.task-chat__composer :deep([data-testid='attach-file']) {
  min-height: 2.25rem;
  border: 1px solid #cbd7d0;
  border-radius: .45rem;
  padding: 0 .7rem;
  color: #64736a;
  background: #f4f7f5;
}

.task-chat__composer-label {
  display: block;
  padding: .75rem 1.35rem 0;
  color: #304038;
  font-size: .82rem;
  font-weight: 720;
  background: #fff;
}

.task-chat__composer :deep(form) {
  width: 100%;
}

.task-chat__composer :deep(textarea) {
  min-height: 4.2rem;
  border-radius: .85rem;
  background: #fff;
}

@media (max-width: 767px) {
  .task-chat__messages {
    padding: 1rem;
  }

  .task-chat__bubble {
    width: 100%;
  }

  .task-chat__suggestion {
    min-width: min(100%, 12rem);
  }
}
</style>
