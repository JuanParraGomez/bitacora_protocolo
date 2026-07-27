<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AssistantMessage } from '../domain/task-assistant.schema';

type ChatSendStatus = 'ready' | 'submitted' | 'streaming' | 'error';
type ChatUpdate = {
  field: string;
  sourceMessageId: string;
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
}>(), {
  sendStatus: 'ready',
  suggestions: () => [],
  disabled: false,
  errorMessage: '',
  workspaceLabel: 'este espacio',
});

const emit = defineEmits<{
  send: [text: string];
  retry: [messageId: string];
}>();

const draft = ref('');

const sortedMessages = computed<ChatMessage[]>(() => {
  return [...props.messages]
    .slice()
    .sort((left, right) => left.createdAt - right.createdAt)
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
  return typeof update.value === 'string' ? update.value.slice(0, 80) : String(update.value);
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
</script>

<template>
  <section class="task-chat" aria-label="Chat de asistencia">
    <h3 class="task-chat__title">Asistente del workspace</h3>
    <p role="status" aria-live="polite" class="sr-only">{{ ariaStatus }}</p>

    <UChatMessages :messages="sortedMessages" :status="props.sendStatus" class="task-chat__messages">
      <template #content="{ message }">
        <article :class="['task-chat__bubble', message.role === 'user' ? 'task-chat__bubble--user' : 'task-chat__bubble--assistant']">
          <span v-if="message.role === 'assistant'" class="task-chat__avatar" aria-hidden="true">✦</span>
          <div class="task-chat__bubble-content">
            <p class="task-chat__message-body">{{ extractText(message) }}</p>
            <small>{{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</small>
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
          <li v-for="update in (message as ChatMessage).updates" :key="updateKey(message as ChatMessage, update as ChatUpdate)">
            <strong>{{ updateStatusLabel(update) }}</strong>
            {{ (update as ChatUpdate).field }}:
            <span>{{ updateValueText(update as ChatUpdate) }}</span>
          </li>
        </ul>
      </template>
    </UChatMessages>

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

    <label id="task-chat-composer-label" class="task-chat__composer-label" for="task-chat-composer-input">Escribe tu mensaje</label>

    <UChatPrompt
      id="task-chat-composer-input"
      v-model="draft"
      class="task-chat__composer"
      data-focus-target="chat"
      as="form"
      aria-labelledby="task-chat-composer-label"
      :disabled="props.disabled"
      :placeholder="`Escribe un mensaje para ${props.workspaceLabel}`"
      :loading="props.sendStatus === 'submitted' || props.sendStatus === 'streaming'"
      @submit="onSendSubmit"
    >
      <template #footer>
        <UChatPromptSubmit
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
  display: block;
  margin-left: auto;
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

.task-chat__bubble small {
  display: block;
  margin-top: .35rem;
  color: #7a847e;
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
  margin-top: 0.5rem;
  padding-left: 1rem;
  list-style: disc;
  font-size: 0.85rem;
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
