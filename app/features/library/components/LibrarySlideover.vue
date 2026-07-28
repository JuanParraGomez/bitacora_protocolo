<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LibraryRecord, LibraryRecordSummary } from '../domain/library-record.schema';
import { createLibraryStore, type LibraryStorage } from '../services/library-store';
import LibraryList from './LibraryList.vue';
import LibraryRecordView from './LibraryRecordView.vue';

const props = defineProps<{
  open: boolean;
  taskId: string;
  projectId?: string | null;
  recordId?: string | null;
  mobile?: boolean;
}>();

const emit = defineEmits<{
  'update:open': [boolean];
  openRecord: [id: string];
  recordLinked: [payload: {
    recordId: string;
    title: string;
    status: 'linked' | 'already-linked' | 'error';
    reason?: 'record-missing' | 'task-missing' | 'task-invalid' | 'write-failed';
    task?: Record<string, unknown> | null;
  }];
}>();

const records = ref<LibraryRecordSummary[]>([]);
const record = ref<LibraryRecord | null>(null);
const search = ref('');
const selectedKind = ref<'all' | LibraryRecordSummary['resourceKind']>('all');
const selectedProjectScope = ref<'all' | 'current'>('all');
const error = ref('');

const storage: LibraryStorage = {
  get: (key) => $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(key)}`).then((result) => result.value).catch(() => null),
  set: async (key, value) => {
    await $fetch(`/api/storage/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: { value },
    });
  },
  delete: async () => {},
};
const store = createLibraryStore(storage);

const filteredRecords = computed(() => {
  return records.value.filter((item) => {
    const query = search.value.trim().toLocaleLowerCase('es');
    const matchesQuery = !query || item.titulo.toLocaleLowerCase('es').includes(query);
    const matchesKind = selectedKind.value === 'all' || item.resourceKind === selectedKind.value;
    const matchesProject = selectedProjectScope.value === 'all'
      || !props.projectId
      || item.projectId === props.projectId;
    return matchesQuery && matchesKind && matchesProject;
  });
});

async function load() {
  try {
    records.value = await store.list();
    record.value = props.recordId ? await store.read(props.recordId) : null;
    error.value = '';
  } catch {
    error.value = 'No se pudo cargar la biblioteca.';
  }
}

watch(() => [props.open, props.recordId] as const, ([open]) => {
  if (open) void load();
}, { immediate: true });

function close() {
  emit('update:open', false);
}

async function openRecord(recordId: string) {
  record.value = await store.read(recordId);
  emit('openRecord', recordId);
}

function workspaceTemplateLink(templateId: string) {
  return `/tasks/${encodeURIComponent(props.taskId)}?overlay=new-task&template=${encodeURIComponent(templateId)}`;
}

async function linkRecord(recordId: string) {
  const result = await store.linkRecordToTask(props.taskId, recordId);
  if (!record.value) return;
  emit('recordLinked', {
    recordId,
    title: record.value.titulo,
    status: result.status,
    reason: result.status === 'error' ? result.reason : undefined,
    task: result.status === 'error' ? null : result.task,
  });
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="library-slideover"
      :class="{ 'library-slideover--mobile': mobile }"
      role="presentation"
    >
      <button
        v-if="mobile"
        type="button"
        class="library-slideover__backdrop"
        aria-label="Cerrar biblioteca"
        tabindex="-1"
        @click="close"
      />
      <section
        class="library-slideover__panel"
        role="dialog"
        :aria-modal="mobile ? 'true' : 'false'"
        aria-labelledby="library-slideover-title"
      >
        <header class="library-slideover__header">
          <div>
            <p>Conocimiento reutilizable</p>
            <h2 id="library-slideover-title">Biblioteca</h2>
          </div>
          <button type="button" class="library-slideover__close" aria-label="Cerrar biblioteca" @click="close">
            ×
          </button>
        </header>

        <label for="library-search">Buscar registros</label>
        <input
          id="library-search"
          v-model="search"
          type="search"
          placeholder="Titulo del registro"
        >

        <p v-if="error" role="alert">{{ error }}</p>

        <div class="library-slideover__filters">
          <button type="button" :class="{ 'library-slideover__filter--active': selectedKind === 'all' }" @click="selectedKind = 'all'">Todos</button>
          <button type="button" :class="{ 'library-slideover__filter--active': selectedKind === 'method' }" @click="selectedKind = 'method'">Metodos</button>
          <button type="button" :class="{ 'library-slideover__filter--active': selectedKind === 'tool' }" @click="selectedKind = 'tool'">Herramientas</button>
          <button type="button" :class="{ 'library-slideover__filter--active': selectedKind === 'learning' }" @click="selectedKind = 'learning'">Aprendizajes</button>
          <button type="button" :class="{ 'library-slideover__filter--active': selectedKind === 'automation-candidate' }" @click="selectedKind = 'automation-candidate'">Automatizacion</button>
        </div>

        <div class="library-slideover__filters">
          <button type="button" :class="{ 'library-slideover__filter--active': selectedProjectScope === 'all' }" @click="selectedProjectScope = 'all'">Todos los proyectos</button>
          <button type="button" :class="{ 'library-slideover__filter--active': selectedProjectScope === 'current' }" @click="selectedProjectScope = 'current'">Proyecto actual</button>
        </div>

        <div class="library-slideover__layout">
          <section aria-labelledby="library-results-title">
            <h3 id="library-results-title">Registros</h3>
            <p v-if="!filteredRecords.length">No hay resultados disponibles.</p>
            <LibraryList
              v-else
              :records="filteredRecords"
              :selected-record-id="record?.id ?? props.recordId ?? null"
              @select="openRecord"
            />
          </section>

          <LibraryRecordView
            v-if="record"
            class="library-slideover__detail"
            :record="record"
            @link="linkRecord"
          />
          <p v-else class="library-slideover__placeholder">
            Selecciona un registro para revisar el detalle sin salir del workspace.
          </p>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.library-slideover {
  position: fixed;
  inset: 0;
  z-index: 82;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.library-slideover--mobile {
  pointer-events: auto;
}

.library-slideover__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(9, 22, 15, .22);
}

.library-slideover__panel {
  position: relative;
  pointer-events: auto;
  display: grid;
  gap: .8rem;
  width: min(40rem, calc(100vw - 2rem));
  height: calc(100dvh - 1.4rem);
  margin: .7rem .7rem .7rem 0;
  border: 1px solid #d6ddd8;
  border-radius: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, .98);
  box-shadow: 0 22px 60px rgba(9, 22, 15, .14);
}

.library-slideover--mobile .library-slideover__panel {
  width: 100%;
  height: 100dvh;
  margin: 0;
  border-radius: 0;
}

.library-slideover__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.library-slideover__header p,
.library-slideover__header h2,
.library-slideover__placeholder {
  margin: 0;
}

.library-slideover__layout {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  gap: 1rem;
  min-height: 0;
}

.library-slideover__filters {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
}

.library-slideover__filters button,
.library-slideover__toolbar :deep(button) {
  border: 1px solid #d7e4db;
  border-radius: 999px;
  padding: .45rem .75rem;
  background: #fff;
}

.library-slideover__filter--active {
  border-color: #007a4d;
  background: #f2fbf6;
}

.library-slideover__detail {
  display: grid;
  gap: .7rem;
}

.library-slideover__detail textarea {
  min-height: 18rem;
  border: 1px solid #d0d9d4;
  border-radius: .8rem;
  padding: .9rem;
  resize: vertical;
  background: #f7faf8;
}

.library-slideover__toolbar {
  display: flex;
  gap: .9rem;
}

.library-slideover__close {
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid #d7e4db;
  border-radius: 999px;
  background: #fff;
}

@media (max-width: 767px) {
  .library-slideover__layout {
    grid-template-columns: 1fr;
  }
}
</style>
