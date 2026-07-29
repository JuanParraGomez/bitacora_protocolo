<script setup lang="ts">
import { computed, ref, useId } from 'vue';

type WorkspacePane = 'stage' | 'agent';

const props = withDefaults(defineProps<{
  modelValue: WorkspacePane;
  stageLabel?: string;
  agentLabel?: string;
}>(), {
  stageLabel: 'Etapa',
  agentLabel: 'Agente',
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
  target?.ref.value?.focus();
}

function selectPane(key: WorkspacePane) {
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
        {{ props.stageLabel }}
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
        {{ props.agentLabel }}
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
  gap: .75rem;
  min-width: 0;
  min-height: 0;
}

.workspace-pane-tabs__tablist {
  display: inline-grid;
  grid-auto-flow: column;
  gap: .45rem;
  align-items: center;
}

.workspace-pane-tabs__tab {
  min-height: 2.45rem;
  padding: 0 .95rem;
  border: 1px solid #cad6cf;
  border-radius: 999px;
  color: #173026;
  background: #fff;
}

.workspace-pane-tabs__tab[aria-selected='true'] {
  border-color: #0c7e53;
  color: #fff;
  background: #0c7e53;
}

.workspace-pane-tabs__panel {
  min-width: 0;
  min-height: 0;
}
</style>
