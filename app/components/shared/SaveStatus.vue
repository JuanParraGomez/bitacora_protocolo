<script setup lang="ts">
defineProps<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>();
</script>

<template>
  <p role="status" :data-state="status">
    <span v-if="status === 'saving'">Guardando…</span>
    <span v-else-if="status === 'saved'">Guardado ✓</span>
    <span v-else-if="status === 'error'">{{ message || 'No se pudo guardar. Reintenta.' }}</span>
  </p>
</template>
