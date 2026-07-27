<script setup lang="ts">
import { REFERENCE_SECTIONS } from '../domain/reference-content';
</script>

<template>
  <section aria-labelledby="reference-content-title">
    <h2 id="reference-content-title">Guía de referencia</h2>
    <article v-for="section in REFERENCE_SECTIONS" :id="section.id" :key="section.id">
      <h3>{{ section.heading }}</h3>
      <p>{{ section.summary }}</p>
      <ul><li v-for="point in section.points" :key="point">{{ point }}</li></ul>
    </article>
  </section>
</template>
