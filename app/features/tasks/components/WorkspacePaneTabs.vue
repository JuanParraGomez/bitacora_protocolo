<script setup lang="ts">
import { computed, ref, useId } from 'vue';

type WorkspacePane = 'stage' | 'agent';

const props = withDefaults(defineProps<{
  modelValue: WorkspacePane;
  stageLabel?: string;
  agentLabel?: string;
  agentPending?: boolean;
}>(), {
  stageLabel: 'Etapa',
  agentLabel: 'Agente',
  agentPending: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: WorkspacePane];
}>();

const stageTabId = useId();
const agentTabId = useId();
const stagePanelId = useId();
const agentPanelId = useId();
const stageTab = ref<HTMLButtonElement | null>(null);
const agentTab = ref<HTMLButtonElement | null>(null);

const orderedTabs = computed(() => [
  { key: 'stage' as const, ref: stageTab, id: stageTabId, panelId: stagePanelId, label: props.stageLabel },
  { key: 'agent' as const, ref: agentTab, id: agentTabId, panelId: agentPanelId, label: props.agentLabel },
]);

function focusTab(key: WorkspacePane) {
  const target = orderedTabs.value.find((tab) => tab.key === key);
  target?.ref.value?.focus({ preventScroll: true });
}

function selectPane(key: WorkspacePane) {
  focusTab(key);
  emit('update:modelValue', key);
}

function onTabKeydown(event: KeyboardEvent, key: WorkspacePane) {
  const currentIndex = orderedTabs.value.findIndex((tab) => tab.key === key);
  if (currentIndex < 0) return;

  if (event.key === 'ArrowRight') {
    event.preventDefault();
    const next = orderedTabs.value[(currentIndex + 1) % orderedTabs.value.length];
    if (next) focusTab(next.key);
    return;
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    const next = orderedTabs.value[(currentIndex - 1 + orderedTabs.value.length) % orderedTabs.value.length];
    if (next) focusTab(next.key);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    focusTab('stage');
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    focusTab('agent');
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectPane(key);
  }
}
</script>

<template>
  <div class="workspace-pane-tabs">
    <div class="workspace-pane-tabs__tablist" role="tablist" aria-label="Planos del workspace">
      <button
        :id="stageTabId"
        ref="stageTab"
        type="button"
        class="workspace-pane-tabs__tab"
        role="tab"
        :aria-selected="props.modelValue === 'stage' ? 'true' : 'false'"
        :aria-controls="stagePanelId"
        :tabindex="props.modelValue === 'stage' ? 0 : -1"
        @click="selectPane('stage')"
        @keydown="onTabKeydown($event, 'stage')"
      >
        <svg data-pane-icon="stage" class="workspace-pane-tabs__icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 4.5h10M5 10h10M5 15.5h6" />
        </svg>
        <span>{{ props.stageLabel }}</span>
      </button>
      <button
        :id="agentTabId"
        ref="agentTab"
        type="button"
        class="workspace-pane-tabs__tab"
        role="tab"
        :aria-selected="props.modelValue === 'agent' ? 'true' : 'false'"
        :aria-controls="agentPanelId"
        :tabindex="props.modelValue === 'agent' ? 0 : -1"
        @click="selectPane('agent')"
        @keydown="onTabKeydown($event, 'agent')"
      >
        <svg data-pane-icon="agent" class="workspace-pane-tabs__icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 5.5h12v8H9l-3.5 2v-2H4zM7 9.5h.01M10 9.5h.01M13 9.5h.01" />
        </svg>
        <span>{{ props.agentLabel }}</span>
        <span v-if="props.agentPending" data-agent-pending class="workspace-pane-tabs__pending">
          <span class="workspace-pane-tabs__sr-only">con pendientes</span>
        </span>
      </button>
    </div>

    <div
      :id="stagePanelId"
      data-pane="stage"
      class="workspace-pane-tabs__panel"
      role="tabpanel"
      :aria-labelledby="stageTabId"
      :aria-hidden="props.modelValue === 'stage' ? 'false' : 'true'"
      :inert="props.modelValue === 'stage' ? undefined : true"
      v-show="props.modelValue === 'stage'"
    >
      <slot name="stage" />
    </div>

    <div
      :id="agentPanelId"
      data-pane="agent"
      class="workspace-pane-tabs__panel"
      role="tabpanel"
      :aria-labelledby="agentTabId"
      :aria-hidden="props.modelValue === 'agent' ? 'false' : 'true'"
      :inert="props.modelValue === 'agent' ? undefined : true"
      v-show="props.modelValue === 'agent'"
    >
      <slot name="agent" />
    </div>
  </div>
</template>

<style scoped>
.workspace-pane-tabs {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: .75rem;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.workspace-pane-tabs__tablist {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .2rem;
  align-items: center;
  padding: .2rem;
  border: 1px solid #cad6cf;
  border-radius: .75rem;
  background: #edf3ef;
}

.workspace-pane-tabs__tab {
  position: relative;
  display: inline-flex;
  gap: .45rem;
  align-items: center;
  justify-content: center;
  min-height: 2.45rem;
  padding: 0 .95rem;
  border: 0;
  border-radius: .58rem;
  color: #173026;
  background: transparent;
}

.workspace-pane-tabs__tab[aria-selected='true'] {
  border-color: #0c7e53;
  color: #fff;
  background: #0c7e53;
}

.workspace-pane-tabs__tab[aria-selected='true']:hover:not(:disabled),
.workspace-pane-tabs__tab[aria-selected='true']:focus-visible {
  border-color: #0c7e53;
  color: #fff;
  background: #0c7e53;
}

.workspace-pane-tabs__icon {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.workspace-pane-tabs__pending {
  width: .45rem;
  height: .45rem;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: #f4a340;
}

.workspace-pane-tabs__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.workspace-pane-tabs__panel {
  grid-row: 2;
  grid-column: 1;
  min-width: 0;
  min-height: 0;
}

@media (max-width: 767px) {
  .workspace-pane-tabs__tab {
    flex-wrap: wrap;
    align-content: center;
    min-width: 0;
    padding-inline: .4rem;
  }

  .workspace-pane-tabs__tab > span:not(.workspace-pane-tabs__sr-only) {
    min-width: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
    line-height: 1.1;
  }
}
</style>
