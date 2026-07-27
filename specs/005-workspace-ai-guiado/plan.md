# Implementation Plan: Espacio de trabajo guiado por IA

**Branch**: `codex/005-workspace-ai-guiado` | **Date**: 2026-07-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-workspace-ai-guiado/spec.md`

## Summary

Reemplazar el shell lineal y la pareja formulario/prompt por un dashboard de tres regiones: navegación de tareas, chat contextual y formulario guiado. La entrega reutiliza las cuatro fases y su almacenamiento, oculta los prompts heredados, añade conversación y evaluación versionadas dentro de cada tarea, y usa un adaptador determinista sin red para validar toda la experiencia antes de integrar proveedores o un grafo de agentes.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5 y Node.js 22.19+ LTS

**Primary Dependencies**: Nuxt 4.5, Zod 4.4, Nuxt UI 4.10 y Tailwind CSS 4.3; sin AI SDK, Vueform, LangGraph ni cliente de proveedor en este MVP

**Storage**: SQLite existente mediante `kv_store`; se conserva `bitacora:t:<id>` para tarea, conversación y evaluaciones, `bitacora:index` para navegación y una preferencia global sin secretos para el modo de asistencia

**Testing**: Vitest 4.1 para dominio, adaptador y persistencia; Playwright 1.62 para dashboard, chat, formulario, modal, responsive y accesibilidad

**Target Platform**: Navegadores modernos mediante la aplicación web Nuxt, con despliegue Linux en un único runtime Nitro

**Project Type**: Aplicación web full-stack de monolito modular

**Performance Goals**: Los cambios locales de formulario y los estados simulados del asistente se reflejan en la misma interacción perceptible; cambiar de tarea o panel no bloquea la interfaz; el historial de prueba mantiene desplazamiento fluido

**Constraints**: Pruebas rojas antes de producción, compatibilidad de tareas existentes, prompts heredados inertes, una sola fuente de verdad por tarea, respuestas tardías sin sobreescritura, contenido no ejecutable, sin credenciales, red de IA ni segundo runtime

**Scale/Scope**: Una capacidad `tasks`, cuatro formularios de fase, un dashboard, un hilo y un historial de evaluaciones por tarea, dos preferencias visuales de proveedor y el volumen local actual de la bitácora

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design: PASS**

- **Test-first delivery**: PASS. Cada cambio de dominio, persistencia, dependencia e interfaz comienza con pruebas completas que deben fallar por el comportamiento ausente.
- **Data safety and compatibility**: PASS. La tarea se amplía con valores reparables; los campos `prompt*` se conservan como datos legacy inertes y no se destruyen claves existentes.
- **Feature ownership and boundaries**: PASS. `tasks` conserva reglas, estado, adaptador y componentes del flujo; los cambios compartidos se limitan al shell y contratos estables.
- **Operational simplicity**: PASS. Nuxt UI es una dependencia de presentación; el flujo principal sigue en un único runtime y no requiere proveedor, cola, caché ni base adicional.
- **Fresh architecture evidence**: PASS. El cierre exige actualizar y verificar la estructura y el grafo, además de documentar el puerto diferido de asistencia.

**Post-design: PASS**

- El adaptador simulado permanece dentro de `tasks`, no usa red y se puede retirar cuando un adaptador real satisfaga el mismo contrato.
- El modelo versionado evita aceptar respuestas desactualizadas sin crear servicios ni almacenamiento paralelos.
- Los contratos de interfaz conservan la navegación por teclado y la recuperación de errores como condiciones verificables.
- No se requiere excepción constitucional.

## Project Structure

### Documentation (this feature)

```text
specs/005-workspace-ai-guiado/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── usability-results.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── assistant-adapter.md
│   └── task-workspace-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app.vue
app.config.ts
nuxt.config.ts
app/
├── assets/css/main.css
├── components/shared/
│   └── AppNavigation.vue
└── features/tasks/
    ├── components/
    │   ├── AssistantSettingsModal.vue
    │   ├── DashboardSidebar.vue
    │   ├── EvaluationFeedback.vue
    │   ├── GuidedPhaseForm.vue
    │   ├── TaskChat.vue
    │   ├── TaskWorkspace.vue
    │   ├── OrientationPhase.vue
    │   ├── GuidancePhase.vue
    │   ├── ExecutionPhase.vue
    │   └── ReviewPhase.vue
    ├── composables/
    │   └── useTaskIndex.ts
    ├── domain/
    │   ├── phase-instructions.ts
    │   ├── task-assistant.schema.ts
    │   ├── task-assistant-rules.ts
    │   ├── task-rules.ts
    │   └── task.schema.ts
    └── services/
        ├── mock-workspace-assistant.ts
        └── task-store.ts

pages/
├── index.vue
└── tasks/
    ├── [id].vue
    └── new.vue

tests/
├── e2e/nuxt-task-workflows.spec.ts
├── integration/task-persistence.test.ts
└── migration/compatibility-store.test.ts
```

**Structure Decision**: Mantener la capacidad dentro de `tasks` evita una dependencia privada entre features y conserva una sola fuente de verdad. `TaskWorkspace` compone el dashboard; los componentes separan navegación, chat, formulario, evaluación y ajustes. Los contratos y reglas del asistente son puros y el adaptador simulado queda sustituible. `pages/tasks/[id].vue` continúa como orquestador de carga, guardado, avance y finalización.

## Complexity Tracking

No hay violaciones constitucionales que requieran justificación.
