# Implementation Plan: Adaptación responsive del workspace

**Branch**: `codex/015-responsive-workspace` | **Date**: 2026-08-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/015-responsive-workspace/spec.md`

## Summary

Adaptar solo la presentación frontend del workspace: tablet conserva lienzo y
agente en dos regiones con scroll autónomo y navegación en drawer; móvil usa un
único plano con selector persistente, campos completos y foco seguro. La
implementación reutiliza `useWorkspaceState`, la proyección de acciones y la
infraestructura visual 010 sin modificar backend, dominio ni contenidos 012–014.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5, Nuxt 4.2

**Primary Dependencies**: Vue Test Utils, Vitest, Playwright, `@axe-core/playwright`

**Storage**: estado frontend existente `bitacora:workspace-view-state`; sin cambios de schema/backend

**Testing**: Vitest Capa A; Playwright funcional/visual Capa B; comparación documental Capa C

**Target Platform**: navegadores modernos en 1024×768, 390×844 y 320×667; zoom 200%

**Project Type**: aplicación web Nuxt modular

**Performance Goals**: alternancia inmediata sin remount ni nueva solicitud de red

**Constraints**: frontend-only; una primaria máxima; cero overflow horizontal/solapes; gate humano para baselines

**Scale/Scope**: header, shell responsive, selector de panes, estilos propietarios y suites/evidencia asociadas

## Constitution Check

- **Test-first delivery — PASS**: cada bloque de comportamiento empieza con rojo válido y registra comando/causa.
- **Data safety — PASS**: se reutiliza estado persistido; no hay migraciones ni escrituras de backend nuevas.
- **Feature boundaries — PASS**: solo presentación/wiring frontend 015; 012–014 permanecen autoridades de contenido.
- **Operational simplicity — PASS**: no se añaden runtime, servicio ni dependencia.
- **Fresh evidence — PASS**: se actualizan Graphify/estructura solo al cierre y se excluyen generados del commit.

Post-design: **PASS**, sin excepciones constitucionales.

## Research Decisions

1. **Breakpoints**: mantener `desktop >=1025`, `tablet 768–1024`, `mobile <=767` desde `workspace-shell-presentation.ts`; evita una segunda clasificación contradictoria.
2. **Conservación de panes**: mantener ambos slots montados con `v-show` + `inert`; evita perder formulario/borrador y conserva accesibilidad del pane inactivo.
3. **Foco**: restaurar el tab seleccionado como ancla lógica al alternar; las rutas explícitas hacia recomendaciones enfocan el agente existente.
4. **Pendientes**: derivar un único booleano de propuestas + correcciones; no persistir estado duplicado.
5. **Primaria**: máximo una `[data-primary-action="true"]` visible; el chat no introduce otra primaria del flujo.
6. **Visuales**: modo contractual antes de evidencia; ACTUAL separada de baseline y aprobación humana obligatoria.

## Visual Traceability Matrix

| Ref | Region/state | Component owner | Viewport | Automated proof | Risk |
|---|---|---|---|---|---|
| IMG-UX-03 | drawer cerrado, header compacto | `WorkspaceHeader.vue`, `TaskWorkspace.vue` | 1024×768 | Vitest + geometry + screenshot | duplicar navegación |
| IMG-UX-03 | lienzo/agente lado a lado | `TaskWorkspace.vue`, `AgentPanel.vue` | 1024×768 | scroll positions + overlap | scroll compartido |
| IMG-UX-04 | contexto y selector móvil | `WorkspaceHeader.vue`, `WorkspacePaneTabs.vue` | 390×844, 320×667 | component/E2E/axe | meta empuja campos |
| IMG-UX-04 | campos/footer completos | `GuidedPhaseForm.vue`, phase owners | 390×844, 320×667 | field counts + overflow | pérdida 012 |
| IMG-UX-03/04 | zoom 200%, una primaria | shell + visual helpers | todos | geometry + count + axe | solapes/reflow |

## Breakpoint Contract

`workspace-shell-presentation.ts` es la única fuente de clasificación de modo:

- desktop: ancho `>=1025px`
- tablet: ancho `768px–1024px`
- mobile: ancho `<=767px`
- inválido/no finito: mobile seguro

Las media queries CSS MUST usar exactamente `1024/767/768/1025` según el lado
inclusivo correspondiente y una prueba contractual mantiene la paridad.

## TDD Strategy

1. Capa A: añadir casos completos a presentation/components/state; ejecutar rojo enfocado y registrar causa esperada.
2. Implementar el mínimo por bloque propietario; reejecutar verde y regresión afectada.
3. Capa B: añadir primero escenarios Playwright contractuales IMG-UX-03/04 para geometría, scroll, 320 px, zoom y axe; ejecutar sin actualizar snapshots.
4. Implementar estilos mínimos; repetir Capa B serial con un único `TEST_BASE_URL`.
5. Capa C: capturar ACTUAL en evidence, comparar y dejar aprobación humana pendiente; no actualizar baseline sin decisión explícita.

## Project Structure

```text
app/features/tasks/components/
├── TaskWorkspace.vue
├── TaskWorkspace.test.ts
├── WorkspaceHeader.vue
├── WorkspaceHeader.test.ts
├── WorkspacePaneTabs.vue
├── WorkspacePaneTabs.test.ts
├── GuidedPhaseForm.vue
├── workspace-shell-presentation.ts
└── workspace-shell-presentation.test.ts
app/features/tasks/composables/
└── useWorkspaceState.test.ts
tests/e2e/
├── stage-agent-workspace.spec.ts
├── helpers/workspace-ux.ts
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

**Structure Decision**: reutilizar propietarios frontend existentes y ampliar
solo sus pruebas; no crear composable/store nuevo para estado ya disponible.
