# Implementation Plan: Bitácora de iteraciones guiada

**Branch**: `codex/003-mejorar-bitacora-iteraciones` | **Date**: 2026-07-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-mejorar-bitacora-iteraciones/spec.md`

## Summary

Enriquecer la tarea compatible de la bitácora con un análisis explícito del problema, criterios etiquetados, iteraciones completas y prompts guardables. El enfoque conserva el agregado de tarea y las cuatro fases existentes: amplía el modelo reparable, concentra las reglas y la composición de prompts en el dominio de `tasks`, y mejora los componentes de fase sin añadir servicios externos ni cambiar el contrato HTTP de almacenamiento.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5 y Node.js 22.19+ LTS

**Primary Dependencies**: Nuxt 4.5, Vue 3.5, Zod 4.4; sin dependencias nuevas previstas

**Storage**: SQLite existente a través de `kv_store`; se mantienen las claves `bitacora:t:<id>` y el índice compatible

**Testing**: Vitest 4.1 para dominio e integración; Playwright 1.62 para regresiones de interfaz, desplazamiento y persistencia

**Target Platform**: Navegadores modernos mediante aplicación web Nuxt; desarrollo macOS/Linux y despliegue Linux en un único contenedor

**Project Type**: Aplicación web full-stack de monolito modular

**Performance Goals**: Añadir una iteración mantiene el contexto visible y deja el campo editable disponible en menos de un segundo en una tarea de 20 iteraciones; el estado de guardado directo aparece en menos de un segundo en condiciones locales normales

**Constraints**: Compatibilidad con tareas previas, ninguna clave existente se elimina, sin proveedor de IA ni servicio adicional, contenido de usuario no ejecutable, y el flujo obligatorio es pruebas rojas antes de producción

**Scale/Scope**: Una tarea con cuatro fases, criterios e iteraciones editables; cambios limitados a la capacidad `tasks`, sus pruebas y documentación de esta funcionalidad

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-design: PASS**

- **Test-first delivery**: PASS. Cada historia incluye pruebas completas antes de cambiar el modelo, reglas o componentes; se exige confirmar la falla inicial.
- **Data safety and compatibility**: PASS. La reparación de tareas añade valores por defecto y conserva claves, datos heredados y el registro exportado.
- **Feature ownership and boundaries**: PASS. El cambio reside en `app/features/tasks`; los contratos compartidos no cambian.
- **Operational simplicity**: PASS. No incorpora proveedor, cola, caché, base adicional ni segundo runtime.
- **Fresh architecture evidence**: PASS. Si cambia la estructura de imports aceptada, se actualiza y verifica Graphify según el comando estándar.

**Post-design: PASS**. `research.md`, `data-model.md`, `contracts/task-workspace-ui.md` y `quickstart.md` mantienen las mismas decisiones y no crean excepciones constitucionales.

## Project Structure

### Documentation (this feature)

```text
specs/003-mejorar-bitacora-iteraciones/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
```text
app/
├── components/shared/
└── features/tasks/
    ├── components/
    │   ├── OrientationPhase.vue
    │   ├── GuidancePhase.vue
    │   ├── ExecutionPhase.vue
    │   ├── ReviewPhase.vue
    │   └── TaskWorkspace.vue
    ├── domain/
    │   ├── task.schema.ts
    │   ├── task-rules.ts
    │   └── task-rules.test.ts
    └── services/

pages/tasks/
└── [id].vue

tests/
├── integration/
└── e2e/
```

**Structure Decision**: Mantener el agregado, validación, reglas de transición y composición de prompts en `app/features/tasks/domain`; los componentes de fase representan y editan esos datos; `pages/tasks/[id].vue` conserva la responsabilidad de carga, persistencia y estado de guardado; Playwright valida los comportamientos del navegador. No se añade una frontera de servicio.

## Design Decisions

### Datos y compatibilidad

- Extender los esquemas con análisis de problema, criterios identificables, iteraciones identificables y seguimiento de mejoras por referencia.
- Usar reparación de esquema para dar valores seguros a tareas almacenadas antes del cambio y preservar los datos conocidos. La orientación heredada queda `pendiente`; una tarea heredada en fases 2–4 recibe una decisión de compatibilidad `mantener` y una formulación vigente derivada para no bloquear su progreso.
- Resolver el resumen de criterios final desde los criterios fuente por identificador; guardar únicamente los campos de seguimiento de mejora.

### Reglas y prompts

- Centralizar las reglas de análisis, los valores permitidos de etiquetas y las funciones de composición de prompt en el dominio `tasks`.
- Aplicar la formulación vigente del problema como fuente de guía, ejecución y revisión.
- Incluir explícitamente todos los criterios vigentes y sus comentarios revisados en el prompt de etapa que corresponda. Un prompt editado de forma manual se conserva hasta que la persona ordena regenerarlo.
- Extender la representación Markdown para registrar información relevante sin introducir HTML ejecutable.

### Interacción y guardado

- Sustituir el acceso indexado a una sola iteración por tarjetas iterables con control para añadir otra.
- Tras insertar, conservar la posición de lectura y hacer accesible la tarjeta nueva usando una referencia estable y foco/visibilidad controlados.
- Reutilizar el flujo existente de guardado de la tarea para las cajitas de prompt, exponiendo una acción y estado local accesibles.

### Pruebas y verificación

- Dominio: reparación heredada, decisiones analíticas, etiquetas, criterios, composición de prompts, referencias de iteración y Markdown seguro.
- Integración: cargar, guardar y recuperar una tarea enriquecida y validar sus restricciones de fase.
- Navegador: recorrido analítico, etiquetas, inserción sin reinicio de desplazamiento, resumen final, guardado desde cajitas y regeneración del prompt.
- Ejecutar el test rojo enfocado, después las suites afectadas y finalmente `npm run verify` y `npm run verify:e2e`.
