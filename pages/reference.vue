<script setup lang="ts">
import ReferenceContent from '~/app/features/reference/components/ReferenceContent.vue';

useHead({
  title: 'Referencia',
});
</script>

<template>
  <main class="reference-page">
    <h1>Referencia</h1>
    <ReferenceContent />
  </main>
</template>

<style scoped>
.reference-page {
  width: min(100% - 2rem, 56rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 5vw, 4rem) 0 4rem;
}

.reference-page h1 {
  margin: 0;
  color: #101812;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  letter-spacing: -.04em;
  line-height: 1.05;
}
</style>
