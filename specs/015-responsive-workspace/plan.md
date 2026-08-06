# Implementation Plan: Adaptación responsive del workspace

**Branch**: `codex/015-responsive-workspace` | **Date**: 2026-08-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/015-responsive-workspace/spec.md`

## Summary

Adaptar exclusivamente la presentación frontend del workspace. Tablet conserva
lienzo y agente como regiones paralelas con scroll autónomo y navegación bajo
drawer; móvil usa un único plano con selector Etapa/Agente, estado persistente
por tarea, campos completos y foco lógico. Se reutilizan `useWorkspaceState`,
los propietarios visuales 011–014 y la infraestructura Playwright 010, sin
cambiar dominio, almacenamiento, backend ni contenido funcional previo.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Vue 3.5.40, Nuxt 4.5.0

**Primary Dependencies**: Vue Test Utils, Vitest 4.1, Playwright 1.62, `@axe-core/playwright` 4.12

**Storage**: estado frontend existente `bitacora:workspace-view-state`; sin migración ni cambios de schema

**Testing**: Vitest para Capa A; Playwright funcional/visual para Capa B; comparación documental y gate humano para Capa C

**Target Platform**: navegadores modernos en 1024×768, 390×844 y 320×667; reflow a zoom 200% en tablet y ambos panes móviles

**Project Type**: aplicación web Nuxt modular

**Performance Goals**: alternancia Etapa/Agente inmediata, sin remount destructivo ni solicitudes de red adicionales

**Constraints**: frontend-only; cero pérdida de contenido/overflow/solapes; máximo una primaria visible; baselines protegidas por aprobación humana

**Scale/Scope**: header, shell responsive, drawer, selector de panes, formulario/chat como consumidores visuales y suites/evidencia IMG-UX-03/04

## Constitution Check

### Pre-design gate

- **I. Test-first delivery — PASS**: cada cambio de comportamiento comienza con Vitest o Playwright rojo por la carencia solicitada; después se aplica el mínimo cambio propietario y se ejecuta regresión.
- **II. Data safety and compatibility — PASS**: se conserva `mobilePaneByTask` y el formato de almacenamiento; no hay migraciones, SQLite ni backend en alcance.
- **III. Feature ownership and boundaries — PASS**: los cambios permanecen en componentes/composables de tasks y pruebas asociadas; Specs 012–014 siguen siendo autoridades de contenido, chat y recuperación.
- **IV. Operational simplicity — PASS**: no se añade runtime, servicio, cola, cache, base de datos ni dependencia de producción.
- **V. Fresh architecture evidence — PASS**: estructura y Graphify se verifican al cierre, excluyendo caches generadas del commit.

### Post-design gate

**PASS**, sin excepciones constitucionales ni incógnitas pendientes.

## Research Decisions

1. **Breakpoints únicos**: `desktop >=1025`, `tablet 768–1024`, `mobile <=767`, derivados exclusivamente de `WORKSPACE_SHELL_BREAKPOINTS`; valores inválidos caen en móvil seguro.
2. **Ciclo de vida móvil**: ambos panes permanecen montados mediante `v-show`/`inert`; evita perder campos y borrador y retira el pane inactivo del foco/interacción.
3. **Persistencia**: `useWorkspaceState.mobilePaneByTask` sigue siendo la única autoridad; no se introduce un store paralelo.
4. **Foco**: el tab seleccionado es el ancla lógica al alternar; los accesos explícitos al agente conservan el foco conversacional existente.
5. **Pendientes**: un único dot accesible se deriva de propuestas o correcciones pendientes; no se persiste una proyección visual duplicada.
6. **Scroll tablet**: el grid usa columnas `minmax(0, …)` y cada región posee su overflow; esto preserva scroll independiente y reflow a 200%.
7. **Primaria**: se admite de cero a una `[data-primary-action="true"]` visible; el envío del chat no se reclasifica como primaria de etapa.
8. **Visuales**: primero contrato sin actualizar snapshots, luego capturas ACTUAL; mockups, candidatos y baselines aprobadas permanecen separados.

## Visual Traceability Matrix

| Ref | Region/state | Component owner | Viewport | Automated proof | Principal risk |
|---|---|---|---|---|---|
| IMG-UX-03 | drawer cerrado, header compacto | `WorkspaceHeader.vue`, `TaskWorkspace.vue` | 1024×768 | Vitest + E2E + geometry | navegación duplicada |
| IMG-UX-03 | lienzo/agente paralelos | `TaskWorkspace.vue`, `AgentPanel.vue`, `TaskChat.vue` | 1024×768, zoom 200% | posiciones de scroll + no-overlap | scroll compartido o ancho intrínseco |
| IMG-UX-04 | contexto y selector móvil | `WorkspaceHeader.vue`, `WorkspacePaneTabs.vue` | 390×844, 320×667 | component/E2E/axe | meta desplaza campos |
| IMG-UX-04 | campos/footer completos | `GuidedPhaseForm.vue`, propietarios de fase | 390×844, 320×667 | conteos, flujo, footer y overflow | pérdida del contrato 012 |
| IMG-UX-04 | draft/pane por tarea | `TaskWorkspace.vue`, `useWorkspaceState.ts` | 390×844 | alternancia entre dos tareas | contaminación global |
| IMG-UX-03/04 | zoom y contraste | shell + helpers visuales | 1024, 390, 320 | geometry + axe + acciones esenciales | clipping/solapes |

## Breakpoint Contract

`app/features/tasks/components/workspace-shell-presentation.ts` es la única
fuente de clasificación:

- desktop: ancho `>=1025px`
- tablet: ancho `768px–1024px`
- mobile: ancho `<=767px`
- inválido/no finito: mobile seguro

Las media queries CSS usan los mismos límites inclusivos. No se introduce otro
breakpoint de viewport; el reflow a zoom se resuelve con tracks flexibles,
`min-width: 0` y wrap de controles.

## TDD and Verification Strategy

1. **Capa A**: añadir primero casos normales, límites 767/768/1024/1025, entradas inválidas, persistencia por tarea, foco, pending dot y máximo de primarias; registrar rojo válido.
2. Implementar el cambio mínimo en el propietario visual; reejecutar la prueba focal y las regresiones de componentes/composable.
3. **Capa B**: añadir primero recorridos Playwright IMG-UX-03/04 para drawer, dos scrolls, draft/pane por tarea, 320 px, zoom 200%, no-overlap y axe; ejecutar con un solo `TEST_BASE_URL` y `--workers=1`.
4. Corregir únicamente estilos/atributos responsables; repetir contratos sin `--update-snapshots`.
5. **Capa C**: capturar ACTUAL en el directorio de evidencia, verificar hashes de baselines y documentar ACTUAL vs referencia.
6. Ejecutar Vitest afectado, E2E completo, visual contractual, typecheck, estructura, Graphify, build y revisión independiente.
7. Mantener `HUMAN_DECISION_REQUIRED`; actualizar baselines solo tras aprobación explícita y rerun idempotente.

## Project Structure

```text
app/features/tasks/components/
├── AgentPanel.vue
├── GuidedPhaseForm.vue
├── TaskChat.vue
├── TaskWorkspace.vue
├── TaskWorkspace.test.ts
├── WorkspaceHeader.vue
├── WorkspaceHeader.test.ts
├── WorkspacePaneTabs.vue
├── WorkspacePaneTabs.test.ts
├── workspace-shell-presentation.ts
└── workspace-shell-presentation.test.ts
app/features/tasks/composables/
├── useWorkspaceState.ts
└── useWorkspaceState.test.ts
tests/e2e/
├── stage-agent-workspace.spec.ts
├── helpers/
│   ├── visual-geometry.ts
│   └── workspace-ux.ts
└── visual/stage-agent-workspace.visual.spec.ts
specs/015-responsive-workspace/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/visual-acceptance.md
├── tasks.md
├── implementation-evidence.md
└── evidence/visual-comparison.md
```

**Structure Decision**: ampliar propietarios frontend y pruebas existentes. No
crear un composable/store nuevo ni modificar `server/`, `shared/`, dominio o
persistencia.

## Complexity Tracking

No hay violaciones constitucionales que justificar.
