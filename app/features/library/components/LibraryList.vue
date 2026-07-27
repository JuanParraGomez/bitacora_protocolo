<script setup lang="ts">
import type { LibraryRecordSummary } from '../domain/library-record.schema';
defineProps<{ records: LibraryRecordSummary[] }>();
</script>

<template>
  <section aria-labelledby="library-list-title">
    <h2 id="library-list-title">Registros permanentes</h2>
    <p v-if="!records.length">Todavía no hay registros.</p>
    <ul v-else>
      <li v-for="record in records" :key="record.id">
        <NuxtLink :to="`/library/${encodeURIComponent(record.id)}`">{{ record.titulo }}</NuxtLink>
        <span v-if="record.tarea"> · {{ record.tarea }}</span>
      </li>
    </ul>
  </section>
</template>
