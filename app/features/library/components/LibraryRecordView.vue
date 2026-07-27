<script setup lang="ts">
import { sanitizeDownloadName } from '../services/library-store';
import type { LibraryRecord } from '../domain/library-record.schema';
const props = defineProps<{ record: LibraryRecord }>();
const filename = computed(() => sanitizeDownloadName(props.record.titulo));
</script>

<template>
  <article>
    <h1>{{ record.titulo }}</h1>
    <div class="toolbar">
      <a :download="filename" :href="`data:text/markdown;charset=utf-8,${encodeURIComponent(record.markdown)}`">Descargar Markdown</a>
      <NuxtLink :to="`/tasks/new?template=${encodeURIComponent(record.taskId)}`">Usar como plantilla</NuxtLink>
    </div>
    <textarea aria-label="Markdown del registro" readonly :value="record.markdown" />
  </article>
</template>
