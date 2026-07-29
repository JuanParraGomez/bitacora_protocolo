<script setup lang="ts">
import type { WorkspaceNotice } from '../composables/useWorkspaceNotices';

defineProps<{
  notices: WorkspaceNotice[];
}>();

const emit = defineEmits<{
  dismiss: [id: string];
  retry: [id: string];
}>();
</script>

<template>
  <section
    v-if="notices.length"
    class="notice-region"
    aria-label="Avisos del workspace"
  >
    <article
      v-for="notice in notices"
      :key="notice.id"
      class="notice-region__item"
      :class="`notice-region__item--${notice.tone}`"
      :role="notice.urgent ? 'alert' : 'status'"
      :aria-live="notice.urgent ? 'assertive' : 'polite'"
      aria-atomic="true"
    >
      <div class="notice-region__copy">
        <strong>{{ notice.title }}</strong>
        <p>{{ notice.message }}</p>
      </div>
      <div class="notice-region__actions">
        <button
          v-if="notice.onRetry"
          type="button"
          class="notice-region__button"
          @click="emit('retry', notice.id)"
        >
          {{ notice.retryLabel || 'Reintentar' }}
        </button>
        <button
          type="button"
          class="notice-region__button notice-region__button--ghost"
          @click="emit('dismiss', notice.id)"
        >
          Cerrar
        </button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.notice-region {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  right: max(1rem, env(safe-area-inset-right));
  z-index: 95;
  display: grid;
  gap: .7rem;
  width: min(24rem, calc(100vw - 2rem));
}

.notice-region__item {
  display: grid;
  gap: .7rem;
  padding: .9rem 1rem;
  border: 1px solid #d7ddd8;
  border-radius: .85rem;
  box-shadow: 0 18px 48px rgba(9, 22, 15, .16);
  background: rgba(255, 255, 255, .96);
}

.notice-region__item--success {
  border-color: #8bc8a9;
}

.notice-region__item--error {
  border-color: #dfa3a3;
}

.notice-region__copy strong,
.notice-region__copy p {
  margin: 0;
}

.notice-region__copy p {
  color: #4f5c55;
  font-size: .9rem;
}

.notice-region__actions {
  display: flex;
  justify-content: flex-end;
  gap: .55rem;
}

.notice-region__button {
  border: 1px solid #0a7a4d;
  border-radius: .55rem;
  padding: .5rem .8rem;
  color: #fff;
  background: #0a7a4d;
}

.notice-region__button--ghost {
  border-color: #cad8d0;
  color: #26342b;
  background: #fff;
}

@media (max-width: 767px) {
  .notice-region {
    left: max(.75rem, env(safe-area-inset-left));
    right: max(.75rem, env(safe-area-inset-right));
    width: auto;
  }
}
</style>
