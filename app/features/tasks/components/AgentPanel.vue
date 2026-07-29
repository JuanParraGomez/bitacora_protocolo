<script setup lang="ts">
import { useId } from 'vue';
import type { AssistantMessage, ProposalDecision } from '../domain/task-assistant.schema';
import TaskChat from './TaskChat.vue';

const props = withDefaults(defineProps<{
  messages: AssistantMessage[];
  suggestions?: string[];
  sendStatus?: 'ready' | 'submitted' | 'streaming' | 'error';
  disabled?: boolean;
  errorMessage?: string;
  workspaceLabel?: string;
  draft?: string;
  restoreMessageId?: string | null;
  expanded?: boolean;
}>(), {
  suggestions: () => [],
  sendStatus: 'ready',
  disabled: false,
  errorMessage: '',
  workspaceLabel: 'este espacio',
  draft: undefined,
  restoreMessageId: null,
  expanded: true,
});

const emit = defineEmits<{
  toggle: [];
  send: [text: string];
  retry: [messageId: string];
  proposalDecision: [decision: ProposalDecision];
  updateDraft: [draft: string];
  visibleMessage: [messageId: string | null];
}>();

const contentId = useId();
</script>

<template>
  <aside class="agent-panel" role="region" aria-label="Panel del agente">
    <header class="agent-panel__rail">
      <div class="agent-panel__identity">
        <p class="agent-panel__eyebrow">Agente</p>
        <h2>Panel estructural</h2>
        <p class="agent-panel__state">{{ props.expanded ? 'Abierto' : 'Contraído' }}</p>
      </div>
      <button
        type="button"
        class="agent-panel__toggle"
        :aria-expanded="props.expanded"
        :aria-controls="contentId"
        @click="emit('toggle')"
      >
        {{ props.expanded ? 'Contraer agente' : 'Expandir agente' }}
      </button>
    </header>

    <div
      :id="contentId"
      class="agent-panel__content"
      :data-expanded="props.expanded ? 'true' : 'false'"
    >
      <TaskChat
        v-show="props.expanded"
        :messages="props.messages"
        :suggestions="props.suggestions"
        :send-status="props.sendStatus"
        :disabled="props.disabled"
        :error-message="props.errorMessage"
        :workspace-label="props.workspaceLabel"
        :draft="props.draft"
        :restore-message-id="props.restoreMessageId"
        @send="emit('send', $event)"
        @retry="emit('retry', $event)"
        @proposal-decision="emit('proposalDecision', $event)"
        @update-draft="emit('updateDraft', $event)"
        @visible-message="emit('visibleMessage', $event)"
      />
      <p v-if="!props.expanded" class="agent-panel__collapsed-copy">
        El agente permanece disponible sin cubrir la etapa.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.agent-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  border: 1px solid #d7ddd8;
  border-radius: .9rem;
  background: #fff;
}

.agent-panel__rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .85rem;
  padding: .85rem .95rem;
  border-bottom: 1px solid #dce3de;
  background: linear-gradient(180deg, #f8fbf9, #fff);
}

.agent-panel__identity h2,
.agent-panel__identity p {
  margin: 0;
}

.agent-panel__eyebrow {
  color: #08724c;
  font-size: .72rem;
  font-weight: 780;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.agent-panel__identity h2 {
  color: #15221a;
  font-size: .98rem;
  font-weight: 770;
}

.agent-panel__state {
  color: #5d6962;
  font-size: .8rem;
}

.agent-panel__toggle {
  min-height: 2.4rem;
  border: 1px solid #c8d7cf;
  border-radius: .6rem;
  padding: 0 .8rem;
  color: #173026;
  background: #fff;
}

.agent-panel__content {
  min-height: 0;
}

.agent-panel__content :deep(.task-chat) {
  height: 100%;
}

.agent-panel__collapsed-copy {
  margin: 0;
  padding: 1rem .95rem 1.1rem;
  color: #5d6962;
  font-size: .86rem;
}
</style>
