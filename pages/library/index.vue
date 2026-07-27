<script setup lang="ts">
import LibraryList from '~/app/features/library/components/LibraryList.vue';
import { createLibraryStore } from '~/app/features/library/services/library-store';
import type { LibraryStorage } from '~/app/features/library/services/library-store';

const storage: LibraryStorage = { get: key => $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(key)}`).then(result => result.value).catch(() => null), set: async () => {}, delete: async () => {} };
const records = await createLibraryStore(storage).list();
</script>

<template>
  <main><h1>Biblioteca</h1><LibraryList :records="records" /></main>
</template>
