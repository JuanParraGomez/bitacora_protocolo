<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    statusMessage?: string;
  };
}>();

const isNotFound = computed(() => props.error?.statusCode === 404);

useHead({
  title: 'Página no encontrada · Bitácora Protocolo',
});
</script>

<template>
  <main class="error-page">
    <p class="error-page__eyebrow">Bitácora Protocolo</p>
    <h1>{{ isNotFound ? 'No encontramos esta ruta' : 'Algo salió mal' }}</h1>
    <p v-if="isNotFound">
      La dirección que abriste no existe. Vuelve al workspace para continuar.
    </p>
    <p v-else>
      {{ props.error.statusMessage || 'Hubo un problema inesperado. Vuelve al workspace para continuar.' }}
    </p>
    <NuxtLink to="/" class="error-page__action">
      Volver al workspace
    </NuxtLink>
  </main>
</template>

<style scoped>
.error-page {
  width: min(100% - 2rem, 40rem);
  margin: 0 auto;
  padding: clamp(2rem, 8vw, 5rem) 0 4rem;
  display: grid;
  gap: 1rem;
}

.error-page__eyebrow {
  margin: 0;
  color: #08724c;
  font-size: .78rem;
  font-weight: 780;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.error-page h1 {
  margin: 0;
  color: #101812;
  font-size: clamp(2rem, 5vw, 3rem);
  letter-spacing: -.05em;
  line-height: 1.05;
}

.error-page p {
  margin: 0;
  color: #4e5b54;
  line-height: 1.6;
}

.error-page__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  width: fit-content;
  padding: .65rem 1rem;
  border-radius: .75rem;
  color: #fff;
  font-weight: 750;
  text-decoration: none;
  background: #007a4d;
}
</style>
