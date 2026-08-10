<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
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
  pendingProposals?: number;
  pendingCorrections?: number;
  collapsible?: boolean;
}>(), {
  suggestions: () => [],
  sendStatus: 'ready',
  disabled: false,
  errorMessage: '',
  workspaceLabel: 'este espacio',
  draft: undefined,
  restoreMessageId: null,
  expanded: true,
  pendingProposals: 0,
  pendingCorrections: 0,
  collapsible: true,
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
const toggleButton = ref<HTMLButtonElement | null>(null);
const contentRegion = ref<HTMLElement | null>(null);
const isBusy = computed(() => props.sendStatus === 'submitted' || props.sendStatus === 'streaming');

async function focusConversation() {
  await nextTick();
  contentRegion.value?.focus({ preventScroll: true });
}

defineExpose({ focusConversation });

function onContentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !props.expanded || !props.collapsible) return;
  event.preventDefault();
  emit('toggle');
  void nextTick(() => {
    toggleButton.value?.focus();
  });
}

watch(() => props.expanded, async (next, previous) => {
  if (previous && !next) {
    await nextTick();
    toggleButton.value?.focus();
  }
});
</script>

<template>
  <aside
    class="agent-panel"
    :data-agent-state="props.expanded ? 'expanded' : 'collapsed'"
    role="region"
    aria-label="Panel del agente"
    :aria-busy="isBusy ? 'true' : 'false'"
  >
    <header class="agent-panel__rail">
      <span class="agent-panel__collapsed-label" aria-hidden="true">Agente IA</span>
      <div class="agent-panel__identity">
        <span class="agent-panel__sparkle" :class="{ 'agent-panel__sparkle--done': props.disabled }" data-agent-icon="sparkle" aria-hidden="true">{{ props.disabled ? '✓' : '✦' }}</span>
        <div class="agent-panel__identity-copy">
          <p class="agent-panel__eyebrow">Agente IA</p>
          <h2>Agente IA</h2>
          <p class="agent-panel__state">{{ props.expanded ? 'Listo para orientar esta etapa' : 'Expandir para conversar' }}</p>
        </div>
      </div>
      <button
        v-if="props.collapsible"
        ref="toggleButton"
        type="button"
        class="agent-panel__toggle"
        :aria-expanded="props.expanded"
        :aria-controls="contentId"
        :aria-label="props.expanded ? 'Contraer agente IA' : 'Expandir agente IA'"
        @click="emit('toggle')"
      >
        <span :data-agent-chevron="props.expanded ? 'collapse' : 'expand'" aria-hidden="true">{{ props.expanded ? '‹' : '›' }}</span>
        <span class="agent-panel__toggle-label">{{ props.expanded ? 'Contraer agente' : 'Expandir agente' }}</span>
      </button>
      <span v-if="!props.expanded && props.pendingProposals > 0" data-agent-pending-badge :aria-label="`${props.pendingProposals} propuestas pendientes`">{{ props.pendingProposals }}</span>
      <span
        v-if="props.pendingCorrections > 0"
        data-agent-correction-badge
        :aria-label="`${props.pendingCorrections} correcciones pendientes`"
      >{{ props.pendingCorrections }}</span>
    </header>

    <div
      ref="contentRegion"
      :id="contentId"
      class="agent-panel__content"
      :data-expanded="props.expanded ? 'true' : 'false'"
      data-agent-panel-content
      :tabindex="props.expanded ? 0 : -1"
      :aria-hidden="props.expanded ? 'false' : 'true'"
      @keydown="onContentKeydown"
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
    </div>
  </aside>
</template>

<style scoped>
.agent-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  border: 1px solid #d7ddd8;
  border-radius: .9rem;
  background: #fff;
}

.agent-panel[data-agent-state='collapsed'] {
  width: min(7rem, 12%);
  min-width: 4.25rem;
  border-radius: .75rem;
}

.agent-panel__rail {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .85rem;
  padding: .9rem 1rem;
  border-bottom: 1px solid #e6eae7;
  background: #fff;
}

.agent-panel__identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: .6rem;
}

.agent-panel__sparkle {
  display: grid;
  width: 1.6rem;
  height: 1.6rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  color: #7c5cd6;
  background: transparent;
  font-size: 1.15rem;
}

.agent-panel__sparkle--done {
  border-radius: 50%;
  color: #fff;
  background: #067b46;
  font-size: .95rem;
}

.agent-panel__identity-copy {
  min-width: 0;
}

.agent-panel__collapsed-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__collapsed-label {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  clip-path: none;
  color: #6b7670;
  font-size: .72rem;
  font-weight: 500;
  white-space: nowrap;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__identity-copy,
.agent-panel[data-agent-state='collapsed'] .agent-panel__toggle-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__rail {
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
  padding: .8rem .4rem;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__sparkle {
  position: relative;
  width: 1.9rem;
  height: 1.9rem;
  font-size: 1.3rem;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__sparkle::after {
  position: absolute;
  right: -.1rem;
  bottom: -.1rem;
  width: .55rem;
  height: .55rem;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #16a34a;
  content: "";
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__sparkle--done::after {
  content: none;
}

.agent-panel[data-agent-state='collapsed'] .agent-panel__toggle {
  position: static;
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  min-height: 2.1rem;
  padding: 0;
  place-items: center;
  border: 1px solid #dfe6e1;
  border-radius: .55rem;
  background: #fff;
}

[data-agent-pending-badge] {
  position: absolute;
  top: .25rem;
  right: .25rem;
  display: grid;
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 .2rem;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  background: #b42318;
  font-size: .68rem;
  font-weight: 800;
}

[data-agent-correction-badge] {
  position: absolute;
  top: .25rem;
  right: 2rem;
  display: grid;
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 .2rem;
  place-items: center;
  border-radius: 999px;
  color: #fff;
  background: #b42318;
  font-size: .68rem;
  font-weight: 800;
}

.agent-panel__identity h2,
.agent-panel__identity p {
  margin: 0;
}

.agent-panel__eyebrow {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.agent-panel__identity h2 {
  color: #0d1f16;
  font-size: 1rem;
  font-weight: 600;
}

.agent-panel__state {
  color: #68736c;
  font-size: .78rem;
  font-weight: 400;
}

.agent-panel__toggle {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  min-height: 2.2rem;
  border: 0;
  border-radius: .5rem;
  padding: 0 .5rem;
  color: #4a5a50;
  background: transparent;
}

.agent-panel__toggle:hover,
.agent-panel__toggle:focus-visible {
  color: #1f5138;
  background: #eaf1eb;
}

.agent-panel__toggle-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.agent-panel__content {
  min-width: 0;
  min-height: 0;
}

.agent-panel__content :deep(.task-chat) {
  width: 100%;
  max-width: 100%;
  height: 100%;
}

</style>
