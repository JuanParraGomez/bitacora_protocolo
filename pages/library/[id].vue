<script setup lang="ts">
import LibraryRecordView from '~/app/features/library/components/LibraryRecordView.vue';
import { createLibraryStore, type LibraryStorage } from '~/app/features/library/services/library-store';
import type { LibraryRecord } from '~/app/features/library/domain/library-record.schema';

const route = useRoute();
const storage: LibraryStorage = { get: key => $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(key)}`).then(result => result.value).catch(() => null), set: async () => {}, delete: async () => {} };
const record = ref<LibraryRecord | null>(await createLibraryStore(storage).read(String(route.params.id)));
</script>

<template>
  <main v-if="record"><LibraryRecordView :record="record" /></main>
  <main v-else><h1>Registro no encontrado</h1><p>El registro no está disponible.</p></main>
</template>
