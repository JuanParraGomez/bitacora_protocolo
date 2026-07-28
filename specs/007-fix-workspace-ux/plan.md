# Implementation Plan: Correcciones UX/UI del workspace

**Branch**: `codex/007-fix-workspace-ux` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-fix-workspace-ux/spec.md`

## Summary

Cerrar los 17 hallazgos de la auditoria mediante un unico contrato de creacion de tareas, un shell responsive con regiones no superpuestas, navegacion y overlays consistentes, validacion explicita en legado y feedback accesible sin duplicados. La implementacion reutiliza las fronteras actuales `tasks`, `library` y `reference`, mantiene SQLite y los esquemas existentes, y concentra la regresion observable en pruebas Playwright y pruebas de componentes/composables escritas antes de cada correccion.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5 y Node.js 22.19+ LTS; HTML/CSS/JavaScript heredado en `bitacora-protocolo-analitico (2).html`

**Primary Dependencies**: Nuxt 4.5, Nuxt UI 4.10, Zod 4.4 y Tailwind CSS 4.3; sin dependencias nuevas

**Storage**: SQLite existente mediante `kv_store`; no cambia el contrato ni el esquema persistido

**Testing**: Vitest 4.1 para componentes, composables y reglas; Playwright 1.62 para rutas, interaccion, responsive, teclado, foco y regresion visual

**Target Platform**: Navegadores modernos sobre la aplicacion Nuxt; viewports CSS 1440 x 900, 1024 x 768, 390 x 844 y ancho minimo de 320 px

**Project Type**: Aplicacion web full-stack de monolito modular con una pagina heredada preservada

**Performance Goals**: Feedback perceptible en la misma interaccion; apertura de overlays sin desmontar la tarea; una sola notificacion por operacion; sin saltos de layout al abrir controles

**Constraints**: TDD obligatorio; ningun control visible interceptado; teclado, foco, Escape, zoom 200% y 320 px; compatibilidad de datos; no modificar reglas de evaluacion o avance; no añadir dependencias ni runtime

**Scale/Scope**: Home, workspace de tarea, nueva tarea, biblioteca, referencia, error 404 y flujo heredado; 17 hallazgos, cinco historias y tres viewports principales

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design: PASS**

- **Test-first delivery**: PASS. Cada historia empieza por pruebas de comportamiento normal, limite, entrada invalida, recuperacion y regresion; se registra el fallo rojo antes de editar produccion.
- **Data safety and compatibility**: PASS. No cambia el modelo persistido; `Directiva cruda` permanece opcional y `/legacy` se conserva.
- **Feature ownership and boundaries**: PASS. `tasks` conserva shell, creacion, avisos y ajustes; `library` conserva su overlay; las paginas solo componen.
- **Operational simplicity**: PASS. No se incorporan dependencias, servicios, base de datos, runtime o proveedor.
- **Fresh architecture evidence**: PASS. El cierre exige estructura, Graphify y evidencia de pruebas actualizadas.

**Post-design: PASS**

- El contrato UI unifica las entradas sin introducir un workflow paralelo.
- Los estados de drawer, overlay, formulario y avisos son presentacionales; no requieren nuevas claves persistidas.
- La ruta global de biblioteca y la biblioteca contextual comparten contenido, pero mantienen responsabilidades de navegacion separadas.
- La pagina heredada recibe cambios locales de contenido y validacion sin alterar su formato de datos.
- No se requiere excepcion constitucional.

## Project Structure

### Documentation (this feature)

```text
specs/007-fix-workspace-ux/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── workspace-ux.md
└── tasks.md
```

### Source Code (repository root)

```text
app.vue
error.vue
app/
└── features/
    ├── library/
    │   └── components/
    │       └── LibrarySlideover.vue
    └── tasks/
        ├── components/
        │   ├── DashboardSidebar.vue
        │   ├── NewTaskModal.vue
        │   ├── NoticeRegion.vue
        │   ├── TaskChat.vue
        │   ├── TaskIntakeForm.vue
        │   ├── TaskWorkspace.vue
        │   └── WorkspaceHeader.vue
        └── composables/
            ├── useWorkspaceNotices.ts
            └── useWorkspaceState.ts
pages/
├── index.vue
├── library/
│   └── index.vue
├── reference.vue
└── tasks/
    ├── [id].vue
    └── new.vue
bitacora-protocolo-analitico (2).html
tests/
└── e2e/
    ├── legacy-task-workflows.spec.ts
    ├── nuxt-task-workflows.spec.ts
    ├── workspace-library.spec.ts
    ├── workspace-overlays.spec.ts
    └── workspace-ux-audit.spec.ts
```

**Structure Decision**: Mantener el shell y sus estados dentro de `tasks`; reutilizar `LibrarySlideover` desde las paginas de composicion; tratar `pages/tasks/new.vue` como entrada funcional al mismo contrato de creacion; añadir `error.vue` como limite global localizado. El HTML heredado se corrige localmente y se valida desde su suite E2E existente. Las pruebas nuevas de la auditoria viven en un archivo dedicado para conservar trazabilidad UX-001–UX-017, mientras las regresiones especificas permanecen junto a las suites de overlays, biblioteca y legado.

## Complexity Tracking

No hay violaciones constitucionales que requieran justificacion.
