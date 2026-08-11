<script setup lang="ts">
import type { LibraryRecordSummary } from '../domain/library-record.schema';
defineProps<{
  records: LibraryRecordSummary[];
  selectedRecordId?: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();

function labelForRecordKind(kind: LibraryRecordSummary['resourceKind']): string {
  switch (kind) {
    case 'method':
      return 'Metodo';
    case 'tool':
      return 'Herramienta';
    case 'automation-candidate':
      return 'Automatizacion';
    default:
      return 'Aprendizaje';
  }
}
</script>

<template>
  <section aria-labelledby="library-list-title">
    <h2 id="library-list-title">Registros permanentes</h2>
    <p v-if="!records.length">Todavía no hay registros.</p>
    <ul v-else class="library-list">
      <li v-for="record in records" :key="record.id">
        <button
          type="button"
          class="library-list__item"
          :class="{ 'library-list__item--selected': selectedRecordId === record.id }"
          @click="emit('select', record.id)"
        >
          <strong>{{ record.titulo }}</strong>
          <span>{{ labelForRecordKind(record.resourceKind) }}</span>
          <span v-if="record.tarea"> · {{ record.tarea }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.library-list {
  display: grid;
  gap: .5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.library-list__item {
  display: grid;
  gap: .2rem;
  width: 100%;
  text-align: left;
  border: 1px solid #e3e8e4;
  border-radius: .8rem;
  padding: .7rem .8rem;
  background: #fff;
  color: #173026;
  font: inherit;
  cursor: pointer;
}

.library-list__item:hover {
  background: #f7faf8;
}

.library-list__item strong {
  font-weight: 600;
}

.library-list__item--selected {
  border-color: #065535;
  background: #eaf1eb;
}

.library-list__item span {
  color: #536057;
  font-size: .88rem;
}
</style>
