<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  projectName: string;
  taskName: string;
  phase: number;
  phaseTitle: string;
  compactNavigation?: boolean;
  sidebarCollapsed?: boolean;
}>(), {
  compactNavigation: false,
  sidebarCollapsed: false,
});

const emit = defineEmits<{
  openNavigation: [];
  expandSidebar: [];
  openNewTask: [];
  openLibrary: [];
  openSettings: [event: Event];
}>();

const navigationButton = ref<HTMLButtonElement | null>(null);

function focusNavigation() {
  navigationButton.value?.focus();
}

defineExpose({ focusNavigation });
</script>

<template>
  <header class="workspace-header" role="region" aria-label="Contexto del workspace">
    <button
      v-if="props.compactNavigation"
      ref="navigationButton"
      type="button"
      class="workspace-header__navigation"
      aria-label="Abrir navegación"
      data-focus-target="sidebar-toggle"
      @click="emit('openNavigation')"
    >
      ☰
    </button>
    <button
      v-else-if="props.sidebarCollapsed"
      ref="navigationButton"
      type="button"
      class="workspace-header__navigation"
      aria-label="Expandir navegación"
      @click="emit('expandSidebar')"
    >
      ›
    </button>

    <div class="workspace-header__identity">
      <p class="workspace-header__project">{{ props.projectName }}</p>
      <h1>{{ props.taskName || 'Tarea' }}</h1>
    </div>

    <div class="workspace-header__stage">
      <strong>Etapa {{ props.phase }} de 4</strong>
      <span>{{ props.phaseTitle }}</span>
    </div>

    <div class="workspace-header__actions">
      <button type="button" @click="emit('openNewTask')">Nueva tarea</button>
      <button type="button" @click="emit('openLibrary')">Biblioteca</button>
      <button type="button" @click="emit('openSettings', $event)">Ajustes</button>
    </div>
  </header>
</template>

<style scoped>
.workspace-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: .85rem;
  min-width: 0;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dce3de;
  background: rgba(255, 255, 255, .94);
}

.workspace-header__navigation {
  display: grid;
  place-items: center;
  min-width: 2.5rem;
  min-height: 2.5rem;
  border: 1px solid #a8c9b9;
  border-radius: .6rem;
  color: #075237;
  background: #f4fcf8;
}

.workspace-header__identity {
  min-width: 0;
}

.workspace-header__identity h1,
.workspace-header__project {
  margin: 0;
}

.workspace-header__identity h1 {
  overflow: hidden;
  color: #101812;
  font-size: 1.22rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-header__project {
  overflow: hidden;
  color: #08724c;
  font-size: .72rem;
  font-weight: 780;
  letter-spacing: .04em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.workspace-header__stage {
  display: grid;
  justify-items: end;
  color: #4e5c54;
  font-size: .72rem;
}

.workspace-header__actions {
  display: flex;
  justify-content: flex-end;
  gap: .55rem;
}

.workspace-header__actions button {
  border: 1px solid #cfe0d7;
  border-radius: .6rem;
  padding: .55rem .75rem;
  color: #173026;
  background: #fff;
}

.workspace-header__stage strong {
  color: #1e2a23;
}

@media (max-width: 767px) {
  .workspace-header {
    grid-template-columns: auto minmax(0, 1fr);
    gap: .65rem;
    padding: max(.75rem, env(safe-area-inset-top)) .8rem .75rem;
  }

  .workspace-header__stage {
    grid-column: 2;
    justify-items: start;
  }

  .workspace-header__actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
