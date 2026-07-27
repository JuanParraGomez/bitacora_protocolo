# Implementation Plan: Formularios y prompts sincronizados por fase

**Branch**: `codex/004-prompts-por-fase` | **Date**: 2026-07-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-prompts-por-fase/spec.md`

## Summary

Presentar cada fase de la bitácora como un espacio de dos áreas: el formulario y su prompt. La entrega añade un prompt a orientación, reutiliza la cajita de prompt existente y sincroniza automáticamente cada prompt generado con los datos de su formulario hasta que una edición manual lo marque como personalizado. La composición y reparación permanecen en el dominio `tasks`; los componentes conservan la responsabilidad de mostrar, editar y guardar.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5 y Node.js 22.19+ LTS

**Primary Dependencies**: Nuxt 4.5, Vue 3.5, Zod 4.4; sin dependencias nuevas

**Storage**: SQLite existente a través de `kv_store`; se conservan las claves actuales de tarea e índice

**Testing**: Vitest 4.1 para dominio y persistencia; Playwright 1.62 para el flujo de navegador, diseño responsive y accesibilidad

**Target Platform**: Navegadores modernos mediante aplicación web Nuxt; desarrollo macOS/Linux y despliegue Linux en un único contenedor

**Project Type**: Aplicación web full-stack de monolito modular

**Performance Goals**: Al editar un campo, el prompt de la fase queda actualizado dentro del mismo ciclo de interacción perceptible; las cuatro fases mantienen controles editables en vistas estrechas

**Constraints**: Compatibilidad de tareas existentes, sin claves ni servicios nuevos, contenido de usuario no ejecutable, prompts manuales no se sobrescriben y pruebas rojas antes de producción

**Scale/Scope**: Una capacidad `tasks`, cuatro componentes de fase, composición de prompts, esquema reparable y pruebas/documentación asociadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design: PASS**

- **Test-first delivery**: PASS. Las tareas exigen crear y ejecutar pruebas rojas para dominio, persistencia e interfaz antes de producción.
- **Data safety and compatibility**: PASS. Solo se añaden valores por defecto reparables; no se eliminan claves ni datos.
- **Feature ownership and boundaries**: PASS. El cambio se limita a `app/features/tasks`, sus pruebas y su documentación.
- **Operational simplicity**: PASS. No crea proveedor, cola, caché, base ni runtime adicional.
- **Fresh architecture evidence**: PASS. No introduce fronteras ni imports nuevos entre capacidades; se verifica la estructura existente al cierre.

**Post-design: PASS**. `research.md`, `data-model.md`, el contrato de interfaz y `quickstart.md` conservan las mismas decisiones y no requieren una excepción.

## Project Structure

### Documentation (this feature)

```text
specs/004-prompts-por-fase/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/task-phase-workspace-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── app.vue
└── features/tasks/
    ├── components/
    │   ├── OrientationPhase.vue
    │   ├── GuidancePhase.vue
    │   ├── ExecutionPhase.vue
    │   ├── ReviewPhase.vue
    │   ├── PromptBox.vue
    │   └── TaskWorkspace.vue
    └── domain/
        ├── task.schema.ts
        ├── task-rules.ts
        └── task-rules.test.ts

tests/
├── integration/task-persistence.test.ts
└── e2e/nuxt-task-workflows.spec.ts
```

**Structure Decision**: Mantener las reglas de composición y reparación en `domain`, el estado de guardado en el flujo actual de tarea, y la presentación/reactividad local en cada componente de fase. Un estilo reutilizable de área de fase evita repetir la disposición responsive sin crear una nueva frontera de servicio.

## Complexity Tracking

No hay violaciones constitucionales que justifiquen seguimiento adicional.
