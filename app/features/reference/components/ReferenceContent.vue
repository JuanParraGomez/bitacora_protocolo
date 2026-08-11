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

<style scoped>
section {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

h2 {
  margin: 0;
  color: #044128;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
}

article {
  display: grid;
  gap: .45rem;
  border: 1px solid #e3e8e4;
  border-radius: .9rem;
  padding: 1.1rem 1.2rem;
  background: #fff;
}

article h3 {
  margin: 0;
  color: #101812;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -.01em;
}

article p {
  margin: 0;
  color: #4e5b54;
  line-height: 1.55;
}

article ul {
  display: grid;
  gap: .3rem;
  margin: .25rem 0 0;
  padding-left: 1.1rem;
  color: #334139;
  line-height: 1.55;
}
</style>
