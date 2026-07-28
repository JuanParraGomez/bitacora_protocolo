# Implementation Plan: Workspace conversacional de soluciones repetibles

**Branch**: `codex/006-conversational-task-workspace` | **Date**: 2026-07-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-conversational-task-workspace/spec.md`

## Summary

Transformar el dashboard de tres paneles en un shell persistente centrado en la conversación, con proyectos y tareas navegables, resumen estructurado plegable y overlays que no desmontan el contexto. La entrega amplía de forma aditiva las cuatro estructuras `f1`–`f4`, conserva datos 003/005, introduce versiones inmutables de método y evidencia derivada, y usa una escritura batch transaccional para mantener consistentes tarea, proyecto, índice y registro.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5 y Node.js 22.19+ LTS

**Primary Dependencies**: Nuxt 4.5, Nuxt UI 4.10, Zod 4.4 y Tailwind CSS 4.3; sin dependencias nuevas de IA, formularios, estado global o persistencia

**Storage**: SQLite existente mediante la tabla `kv_store`; se conservan `bitacora:index`, `bitacora:t:<id>`, `bitacora:r:<id>` y preferencias, y se añade `bitacora:projects`

**Testing**: Vitest 4.1 para dominio, persistencia, contratos y migración; Playwright 1.62 para recorridos, overlays, responsive, teclado y continuidad visual

**Target Platform**: Navegadores modernos sobre aplicación Nuxt desplegada en Linux mediante un único runtime Nitro

**Project Type**: Aplicación web full-stack de monolito modular

**Performance Goals**: Cambios locales perceptibles en la misma interacción; overlays sin navegación de página; restauración sin volver a cargar conversaciones disponibles; máximo tres avisos simultáneos

**Constraints**: TDD obligatorio; migración aditiva e idempotente; ninguna reescritura masiva al iniciar; proyectos, tareas e índice consistentes; contenido inerte; teclado, zoom 200% y 320 px; sin proveedor, credenciales, segunda base ni segundo runtime

**Scale/Scope**: Uso local actual, decenas o cientos de tareas y recursos, múltiples proyectos, cuatro etapas por tarea, historial de mensajes/evaluaciones, varias versiones de método e iteraciones por versión

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design: PASS**

- **Test-first delivery**: PASS. Cada comportamiento se divide en prueba roja, implementación mínima, suite afectada y verificación agregada.
- **Data safety and compatibility**: PASS. Las claves y campos existentes permanecen; la reparación es perezosa, pura, idempotente y cubierta con fixtures históricos.
- **Feature ownership and boundaries**: PASS. `tasks` conserva proyectos, workflow, conversación y shell; `library` conserva sus recursos; la página actúa como raíz de composición sin importaciones privadas entre features.
- **Operational simplicity**: PASS. La escritura batch usa el repositorio y la base existentes; no añade runtime, cola, caché ni servicio.
- **Fresh architecture evidence**: PASS. El cierre actualiza estructura y Graphify, documenta los contratos y ejecuta sus checks de frescura.

**Post-design: PASS**

- `bitacora:projects` añade metadatos pequeños sin cambiar la tabla ni reemplazar `bitacora:index`.
- `f1`–`f4` siguen siendo la fuente de verdad y reciben extensiones reparables; no existe un workflow paralelo.
- El nivel de evidencia se deriva de iteraciones y versión del método, evitando booleanos contradictorios.
- Los overlays se componen en la raíz de página; `tasks` y `library` no importan internamente uno del otro.
- La API batch es una extensión del contrato actual y ejecuta todas las operaciones en una transacción.
- No se requiere excepción constitucional.

## Project Structure

### Documentation (this feature)

```text
specs/006-conversational-task-workspace/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── implementation-evidence.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── assistant-turn.md
│   ├── storage-batch.md
│   ├── task-workflow.md
│   └── workspace-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app.vue
app/
├── features/
│   ├── library/
│   │   ├── components/
│   │   │   └── LibrarySlideover.vue
│   │   ├── domain/
│   │   │   └── library-record.schema.ts
│   │   └── services/
│   │       └── library-store.ts
│   └── tasks/
│       ├── components/
│       │   ├── DashboardSidebar.vue
│       │   ├── GuidedPhaseForm.vue
│       │   ├── NewTaskModal.vue
│       │   ├── NoticeRegion.vue
│       │   ├── StructuredStageSummary.vue
│       │   ├── TaskChat.vue
│       │   ├── TaskWorkspace.vue
│       │   └── WorkspaceHeader.vue
│       ├── composables/
│       │   ├── useTaskIndex.ts
│       │   └── useWorkspaceState.ts
│       ├── domain/
│       │   ├── method-evidence.schema.ts
│       │   ├── phase-instructions.ts
│       │   ├── project.schema.ts
│       │   ├── task-assistant-rules.ts
│       │   ├── task-assistant.schema.ts
│       │   ├── task-rules.ts
│       │   └── task.schema.ts
│       └── services/
│           ├── project-store.ts
│           ├── task-completion.ts
│           ├── task-deletion.ts
│           └── task-store.ts
pages/
├── index.vue
├── library/
│   ├── index.vue
│   └── [id].vue
└── tasks/
    ├── [id].vue
    └── new.vue
server/
├── api/storage/
│   └── batch.post.ts
└── repositories/
    └── kv-store.repository.ts
shared/
├── contracts/storage.ts
└── schemas/storage.ts
tests/
├── contract/
├── e2e/
├── integration/
├── migration/
└── fixtures/
```

**Structure Decision**: Mantener proyectos y workflow dentro de `tasks` porque su pertenencia y ciclo de vida dependen de la tarea. `library` conserva sus componentes y store; `pages/tasks/[id].vue` compone el slideover mediante props y eventos. Los contratos de almacenamiento batch permanecen en `shared`, único límite realmente transversal.

## Complexity Tracking

No hay violaciones constitucionales que requieran justificación.
