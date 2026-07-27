<script setup lang="ts">
import AppNavigation from '~/app/components/shared/AppNavigation.vue';
</script>

<template>
  <UApp>
    <div class="app-shell app-shell--minimal">
      <header class="app-header">
        <AppNavigation />
      </header>
      <NuxtPage />
    </div>
  </UApp>
</template>

<style>
:root {
  color: #172033;
  background: #f5f7fb;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-synthesis: none;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}

* { box-sizing: border-box; }
body { min-width: 320px; margin: 0; background: #f5f7fb; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

.app-shell--minimal {
  width: min(100% - 2rem, 1180px);
  margin: 0 auto;
  padding: 1rem 0 4rem;
}

.app-header {
  margin-bottom: 2.5rem;
  padding: .35rem 0 1rem;
  border-bottom: 1px solid #e5e9f2;
}

 .app-shell--minimal main { display: grid; gap: 1.25rem; }
.app-shell--minimal main > h1 { max-width: 44rem; margin: 0; color: #111827; font-size: clamp(2rem, 5vw, 3.25rem); letter-spacing: -.055em; line-height: 1.05; }
.app-shell--minimal form { display: grid; gap: .85rem; max-width: 42rem; }
.app-shell--minimal label { display: grid; gap: .4rem; color: #526078; font-size: .84rem; font-weight: 650; letter-spacing: .01em; }
.app-shell--minimal input:not([type='checkbox']), .app-shell--minimal select, .app-shell--minimal textarea {
  width: 100%;
  min-height: 2.7rem;
  padding: .7rem .8rem;
  border: 1px solid #d9dfeb;
  border-radius: .8rem;
  outline: none;
  color: #172033;
  background: rgba(255, 255, 255, .9);
  transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
}
textarea { min-height: 7rem; resize: vertical; }
.app-shell--minimal input:not([type='checkbox']):focus, .app-shell--minimal select:focus, .app-shell--minimal textarea:focus { border-color: #7c6cf2; box-shadow: 0 0 0 4px rgba(124, 108, 242, .14); background: #fff; }
.app-shell--minimal label:has(> input[type='checkbox']) { display: flex; align-items: center; gap: .55rem; }
.app-shell--minimal input[type='checkbox'] { width: 1rem; min-height: 1rem; margin: 0; accent-color: #6d5ce7; }
.app-shell--minimal button { border: 1px solid #d9dfeb; border-radius: .7rem; padding: .65rem .9rem; color: #26314a; background: #fff; font-weight: 700; }
.app-shell--minimal button:hover:not(:disabled) { border-color: #b6acef; background: #f8f7ff; }
.app-shell--minimal button:disabled { cursor: not-allowed; opacity: .55; }
.app-shell--minimal [role='alert'] { padding: .85rem 1rem; border: 1px solid #fecaca; border-radius: .8rem; color: #991b1b; background: #fff1f2; }

.phase-workspace { margin-top: 1.25rem; padding: clamp(1rem, 2vw, 1.5rem); border: 1px solid #e3e7f0; border-radius: 1.25rem; background: rgba(255, 255, 255, .78); box-shadow: 0 16px 45px rgba(30, 41, 59, .06); }
.phase-workspace h3 { margin: 0 0 1.25rem; color: #111827; font-size: 1.15rem; letter-spacing: -.02em; }
.phase-workspace__content { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(20rem, .85fr); gap: clamp(1rem, 3vw, 2rem); align-items: start; }
.phase-workspace__form, .phase-workspace__prompt { min-width: 0; }
.phase-workspace__form { display: grid; gap: 1rem; }
.phase-workspace__form > fieldset, .phase-workspace__form > div { padding: 1rem; border: 1px solid #e8ebf2; border-radius: 1rem; background: #fff; }
.app-shell--minimal fieldset { min-width: 0; border: 1px solid #e1e6ef; border-radius: .9rem; }
.app-shell--minimal legend { padding: 0 .35rem; color: #66738c; font-size: .8rem; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; }
.workspace-header { display: grid; gap: .65rem; }
.workspace-header > h2 { margin: 0; color: #111827; font-size: 1.35rem; letter-spacing: -.03em; }
.workspace-header > label { max-width: 48rem; }

.prompt-box--surface { position: sticky; top: 1rem; display: grid; gap: .85rem; padding: 1.1rem; border: 1px solid #dfe3f0; border-radius: 1rem; background: linear-gradient(145deg, #fbfaff, #f5f7ff); box-shadow: 0 12px 35px rgba(79, 70, 229, .08); }
.prompt-box--surface legend { color: #6759c7; }
.prompt-box--surface textarea { min-height: 18rem; border-color: #d7d2fb; background: rgba(255, 255, 255, .82); font-family: "SFMono-Regular", Consolas, monospace; font-size: .82rem; line-height: 1.6; }
.prompt-box--surface > label { color: #6a6790; }
.prompt-box--surface > div { display: flex; flex-wrap: wrap; gap: .6rem; }
.prompt-box--surface > div button { flex: 1 1 9rem; }
.prompt-box--surface > div button:last-child { border-color: #6d5ce7; color: #fff; background: #6d5ce7; }

@media (max-width: 920px) {
  .phase-workspace__content { display: block; grid-template-columns: 1fr; }
  .prompt-box--surface { position: static; }
}
@media (max-width: 560px) {
  .app-shell--minimal { width: min(100% - 1rem, 1180px); padding-top: .5rem; }
  .app-header { margin-bottom: 1.5rem; }
  .phase-workspace { padding: .85rem; border-radius: 1rem; }
}
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto; transition-duration: .01ms !important; } }
</style>
