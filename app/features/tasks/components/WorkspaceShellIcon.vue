<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 18 });
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="props.name === 'tasks'"><path d="M4 5h16M4 12h16M4 19h10" /><path d="M7 5v0M7 12v0M7 19v0" /></template>
    <template v-else-if="props.name === 'library'"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></template>
    <template v-else-if="props.name === 'references'"><path d="m12 3 7 4v10l-7 4-7-4V7z" /><path d="m5 7 7 4 7-4M12 11v10" /></template>
    <template v-else-if="props.name === 'settings'"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.1h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H6.4v-2.6h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.1H15v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1z" /></template>
    <template v-else-if="props.name === 'search'"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></template>
    <template v-else-if="props.name === 'folder'"><path d="M3.5 6.5h6l2 2H20.5v10h-17z" /></template>
    <template v-else-if="props.name === 'chevron'"><path d="m9 6 6 6-6 6" /></template>
    <template v-else-if="props.name === 'more'"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></template>
    <template v-else><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></template>
  </svg>
</template>
