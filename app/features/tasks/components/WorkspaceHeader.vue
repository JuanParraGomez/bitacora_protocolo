<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  projectName: string;
  taskName: string;
  phase: number;
  phaseTitle: string;
  compactNavigation?: boolean;
  mobileContext?: boolean;
  sidebarCollapsed?: boolean;
  settingsDisabled?: boolean;
  settingsUnavailableReason?: string;
}>(), {
  compactNavigation: false,
  mobileContext: false,
  sidebarCollapsed: false,
  settingsDisabled: false,
  settingsUnavailableReason: 'Abre una tarea para usar Ajustes.',
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
  <header
    class="workspace-header"
    :class="{ 'workspace-header--compact': props.compactNavigation }"
    role="region"
    aria-label="Contexto del workspace"
  >
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

    <div v-if="props.compactNavigation" class="workspace-header__mobile-logo" data-mobile-logo aria-label="Nexus">Nexus</div>

    <div class="workspace-header__identity">
      <nav aria-label="Breadcrumb" class="workspace-header__breadcrumb">
        <span>{{ props.projectName }}</span><span aria-hidden="true">/</span><strong>{{ props.taskName || 'Tarea' }}</strong>
      </nav>
      <h1>{{ props.taskName || 'Tarea' }}</h1>
    </div>

    <p v-if="props.mobileContext" data-mobile-context class="workspace-header__mobile-context">
      Etapa {{ props.phase }} de 4 · {{ props.phaseTitle }}
    </p>

    <div v-else class="workspace-header__stage">
      <strong data-stage-chip>Etapa {{ props.phase }} de 4</strong>
      <span data-phase-title>{{ props.phaseTitle }}</span>
    </div>

    <details v-if="props.compactNavigation" class="workspace-header__overflow">
      <summary
        data-workspace-overflow
        aria-label="Más opciones del workspace"
        title="Más opciones"
      >⋮</summary>
      <div class="workspace-header__overflow-menu" aria-label="Opciones del workspace">
        <button type="button" data-overflow-action="new-task" @click="emit('openNewTask')">Nueva tarea</button>
        <button type="button" data-overflow-action="library" @click="emit('openLibrary')">Biblioteca</button>
        <button type="button" data-overflow-action="settings" @click="emit('openSettings', $event)">Ajustes</button>
      </div>
    </details>
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

.workspace-header--compact {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
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

.workspace-header__breadcrumb {
  display: flex;
  align-items: center;
  gap: .4rem;
  min-width: 0;
  color: #68736c;
  font-size: .76rem;
}

.workspace-header__breadcrumb span,
.workspace-header__breadcrumb strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-header__breadcrumb strong { color: #19261e; }

.workspace-header__mobile-logo {
  display: none;
  color: #075237;
  font-weight: 850;
}

.workspace-header__identity h1 {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.workspace-header__project {
  overflow: hidden;
  color: #08724c;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .04em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.workspace-header__stage {
  display: flex;
  align-items: center;
  gap: .6rem;
  color: #68736c;
  font-size: .78rem;
}

.workspace-header__stage strong {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  border: 1px solid #dfe6e1;
  border-radius: 999px;
  padding: .3rem .7rem;
  color: #1e2a23;
  font-weight: 500;
  background: #fff;
}

.workspace-header__stage strong::before {
  width: .5rem;
  height: .5rem;
  border-radius: 50%;
  background: #5ba882;
  content: "";
}

.workspace-header__mobile-context {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin: 0;
  color: #405149;
  font-size: .78rem;
  font-weight: 500;
}

.workspace-header__mobile-context::before {
  width: .5rem;
  height: .5rem;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #044128;
  content: "";
}

.workspace-header__overflow {
  position: relative;
  justify-self: end;
}

.workspace-header__overflow summary {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid #c8d7cf;
  border-radius: .6rem;
  color: #173026;
  background: #fff;
  cursor: pointer;
  font-size: 1.35rem;
  list-style: none;
}

.workspace-header__overflow summary::-webkit-details-marker { display: none; }

.workspace-header__overflow-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + .4rem);
  right: 0;
  display: grid;
  min-width: 10rem;
  padding: .35rem;
  border: 1px solid #e3e8e4;
  border-radius: .65rem;
  background: #fff;
  box-shadow: 0 12px 30px rgba(17, 34, 24, .15);
}

.workspace-header__overflow-menu button {
  min-height: 2.4rem;
  border: 0;
  border-radius: .45rem;
  padding: 0 .7rem;
  color: #173026;
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.workspace-header__overflow-menu button:hover,
.workspace-header__overflow-menu button:focus-visible { background: #eaf1eb; }

@media (max-width: 767px) {
  .workspace-header {
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    gap: .65rem;
    padding: max(.75rem, env(safe-area-inset-top)) .8rem .75rem;
  }

  .workspace-header__mobile-logo { display: block; }

  .workspace-header__identity { grid-column: 3; }

  .workspace-header__identity h1 { display: none; }

  .workspace-header__mobile-context {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-inline: .15rem;
  }
}
</style>
