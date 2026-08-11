<template>
  <nav aria-label="Navegación principal" class="app-navigation">
    <NuxtLink class="app-navigation__brand" to="/">Bitácora</NuxtLink>
    <div class="app-navigation__links">
      <NuxtLink class="app-navigation__link" to="/library">Biblioteca</NuxtLink>
      <NuxtLink class="app-navigation__link" to="/reference">Referencia</NuxtLink>
      <NuxtLink class="app-navigation__link" to="/legacy">Rollback legado</NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.app-navigation { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.app-navigation__brand { color: #101812; font-size: 1.05rem; font-weight: 700; letter-spacing: -.03em; text-decoration: none; }
.app-navigation__links { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .35rem; }
.app-navigation__link { padding: .45rem .7rem; border-radius: .55rem; color: #5a6a61; font-size: .84rem; font-weight: 500; text-decoration: none; }
.app-navigation__link:hover, .app-navigation__link.router-link-active { color: #065535; background: #eaf1eb; font-weight: 600; }
@media (max-width: 640px) { .app-navigation { align-items: flex-start; flex-direction: column; } .app-navigation__links { justify-content: flex-start; } }
</style>
