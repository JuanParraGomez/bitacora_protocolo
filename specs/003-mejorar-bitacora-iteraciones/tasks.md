---
description: "Task list for guided iteration journal"
---

# Tasks: Bitácora de iteraciones guiada

**Input**: Design documents from `/specs/003-mejorar-bitacora-iteraciones/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/task-workspace-ui.md](contracts/task-workspace-ui.md), [quickstart.md](quickstart.md)

**Tests**: Obligatorios. Cada bloque de comportamiento debe escribir primero la prueba completa (camino feliz, límites, entrada inválida, fallo/recuperación y regresión), ejecutarla y confirmar el rojo por ausencia del comportamiento antes de crear código de producción.

**Organization**: Las tareas se agrupan por historia para permitir entregas y pruebas independientes. No modificar producción de una historia hasta que sus tareas de prueba estén rojas por la razón esperada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo una vez satisfechas sus dependencias, porque toca archivos distintos.
- **[Story]**: Historia que recibe el valor de la tarea.
- Cada tarea identifica la ruta concreta que debe cambiar o crear.

## Phase 1: Setup and test harness

**Purpose**: Establecer los casos de regresión y la forma de ejecutar el trabajo sin alterar producción.

- [X] T001 Documentar los datos de prueba de tareas heredadas y enriquecidas en `specs/003-mejorar-bitacora-iteraciones/quickstart.md` y verificar que cubren datos vacíos, caracteres especiales y fallo de guardado.
- [X] T002 [P] Añadir fixture reutilizable de tarea de cuatro fases en `tests/fixtures/tasks/guided-iteration-task.ts` para dominio, integración y navegador.
- [X] T003 [P] Extender los helpers de almacenamiento de prueba en `tests/e2e/nuxt-task-workflows.spec.ts` para crear y recuperar una tarea enriquecida sin compartir estado con otros escenarios.

---

## Phase 2: Foundational domain and persistence compatibility

**Purpose**: Definir datos reparables y composición de dominio que bloquean las historias de interfaz.

**⚠️ CRITICAL**: Ejecutar y confirmar el rojo de T004–T006 antes de implementar T007–T009. Ninguna historia de interfaz empieza antes de este punto.

- [X] T004 Escribir pruebas rojas de reparación de tareas heredadas: `pendiente` en orientación y decisión de compatibilidad que preserva fase, progreso y problema/directiva vigente en fases 2–4; incluir valores por defecto y rechazo/normalización de etiquetas inválidas en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T005 [P] Escribir pruebas rojas de persistencia de una tarea enriquecida y de recuperación tras fallo del almacenamiento en `tests/integration/task-persistence.test.ts`.
- [X] T006 Escribir pruebas rojas de composición segura de Markdown para análisis, criterios, iteraciones y mejoras en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T007 Implementar esquemas, tipos, valores iniciales y reparación compatible para análisis, criterios, iteraciones identificables y mejoras en `app/features/tasks/domain/task.schema.ts`.
- [X] T008 Implementar reglas de validación de análisis, etiquetas, referencias y exportación Markdown escapada en `app/features/tasks/domain/task-rules.ts`.
- [X] T009 Adaptar lectura/escritura de la tarea enriquecida y mapeo de errores recuperables en `app/features/tasks/services/task-store.ts`.
- [X] T010 Ejecutar `vitest run app/features/tasks/domain/task-rules.test.ts tests/integration/task-persistence.test.ts` y corregir solo el mínimo código de T007–T009 hasta verde.

**Checkpoint**: Las tareas antiguas abren de forma segura y el agregado enriquecido se puede guardar, recuperar y exportar sin perder datos.

---

## Phase 3: User Story 1 - Analizar y encuadrar el problema (Priority: P1) 🎯 MVP

**Goal**: Registrar el problema, evidencia y análisis por fases; decidir de manera explícita entre mantener o reformular, y usar la formulación vigente en el flujo posterior.

**Independent Test**: Crear una tarea, documentar evidencia, reformular el problema, guardar, recargar y comprobar que la formulación vigente y la justificación persisten y condicionan el avance a guía.

### Tests for User Story 1 — write and run red first

- [X] T011 [P] [US1] Escribir prueba roja de reglas de avance para problema, evidencia, decisión, justificación y formulación vigente en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T012 [P] [US1] Escribir escenario Playwright rojo para completar orientación con mantener y reformular, incluyendo mensajes de validación accesibles, en `tests/e2e/nuxt-task-workflows.spec.ts`.

### Implementation for User Story 1

- [X] T013 [US1] Implementar los campos y la presentación por fases del protocolo analítico en `app/features/tasks/components/OrientationPhase.vue`.
- [X] T014 [US1] Integrar las validaciones del protocolo analítico en las puertas de orientación de `app/features/tasks/domain/task-rules.ts`.
- [X] T015 [US1] Asegurar el guardado/autoguardado y la restauración del análisis desde el espacio de trabajo en `app/features/tasks/components/TaskWorkspace.vue` y `pages/tasks/[id].vue`.
- [X] T016 [US1] Ejecutar las pruebas T011–T012 y la suite afectada con `vitest run app/features/tasks/domain/task-rules.test.ts && playwright test tests/e2e/nuxt-task-workflows.spec.ts`; mantenerlas verdes antes de continuar.

**Checkpoint**: La orientación entrega una formulación vigente y trazable del problema sin romper tareas previas.

---

## Phase 4: User Story 2 - Crear una guía con criterios priorizados (Priority: P2)

**Goal**: Convertir el análisis en una guía que explica su propósito, beneficios y utilidad, y permite administrar criterios y sus etiquetas.

**Independent Test**: Con una formulación vigente, añadir tres criterios de etiquetas distintas, guardar, recargar y comprobar que la guía conserva texto, comentario, prioridad, estado e impacto.

### Tests for User Story 2 — write and run red first

- [X] T017 [P] [US2] Escribir pruebas rojas para crear, actualizar, validar y conservar criterios etiquetados en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T018 [P] [US2] Escribir escenario Playwright rojo para explicación de guía, etiquetas accesibles y persistencia tras recarga en `tests/e2e/nuxt-task-workflows.spec.ts`.

### Implementation for User Story 2

- [X] T019 [US2] Implementar la colección editable de criterios y sus valores permitidos en `app/features/tasks/domain/task-rules.ts`.
- [X] T020 [US2] Mostrar propósito, beneficios, utilidad y los controles accesibles de criterio/etiqueta en `app/features/tasks/components/GuidancePhase.vue`.
- [X] T021 [US2] Conectar los cambios de la guía al estado de cambios y guardado de tarea en `app/features/tasks/components/TaskWorkspace.vue`.
- [X] T022 [US2] Ejecutar las pruebas T017–T018 y las suites de dominio/navegador afectadas antes de marcar la historia como completada.

**Checkpoint**: La guía se entiende como continuación del análisis y sus criterios se pueden priorizar y recuperar de forma independiente.

---

## Phase 5: User Story 3 - Ejecutar y conservar iteraciones completas (Priority: P3)

**Goal**: Registrar múltiples iteraciones sin reiniciar el desplazamiento y ofrecer al final un seguimiento de mejora por criterio.

**Independent Test**: Con el navegador desplazado en ejecución, agregar dos iteraciones, editar sus datos y criterios aplicables, recargar, y confirmar que el resumen final refleja los criterios con casilla y mejora.

### Tests for User Story 3 — write and run red first

- [X] T023 [P] [US3] Escribir pruebas rojas de inserción, identidad y referencias válidas/inválidas de iteraciones en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T024 [US3] Escribir pruebas rojas de seguimiento derivado de criterios, casilla y nota de mejora sin duplicar el criterio fuente en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T025 [P] [US3] Escribir escenario Playwright rojo que desplaza la vista, añade iteraciones, verifica que no vuelve al inicio y confirma foco/visibilidad de la tarjeta nueva en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [X] T026 [US3] Escribir escenario Playwright rojo para los criterios duplicados al final, sus casillas y mejoras persistidas, y una prueba de integración roja de fallo de guardado/reintento que conserva los cambios visibles de iteración en `tests/e2e/nuxt-task-workflows.spec.ts` y `tests/integration/task-persistence.test.ts`.

### Implementation for User Story 3

- [X] T027 [US3] Implementar operaciones de añadir iteración, vincular criterios y resolver el resumen de mejoras desde criterios vigentes en `app/features/tasks/domain/task-rules.ts`.
- [X] T028 [US3] Reemplazar el acceso fijo a la primera iteración por tarjetas editables, controles de añadido y anclas estables en `app/features/tasks/components/ExecutionPhase.vue`.
- [X] T029 [US3] Implementar conservación de posición, foco/visibilidad controlada y respeto a movimiento reducido después de insertar una iteración en `app/features/tasks/components/ExecutionPhase.vue`.
- [X] T030 [US3] Mostrar el resumen final de criterios con casilla y espacio de mejora en `app/features/tasks/components/ReviewPhase.vue`.
- [X] T031 [US3] Propagar cambios de iteración y mejora al guardado de tarea en `app/features/tasks/components/TaskWorkspace.vue` y `pages/tasks/[id].vue`.
- [X] T032 [US3] Ejecutar T023–T026 y las suites de dominio, integración y navegador afectadas hasta que estén verdes.

**Checkpoint**: Las iteraciones se conservan sin pérdida de contexto y la revisión ofrece seguimiento individual de los criterios fuente.

---

## Phase 6: User Story 4 - Usar y guardar prompts completos (Priority: P4)

**Goal**: Componer prompts íntegros de cada fase y guardarlos directamente desde sus cajitas con feedback recuperable.

**Independent Test**: Rellenar análisis, criterios/comentarios e iteraciones, validar cada prompt, cambiarlo y guardarlo desde su propia cajita; al recargar, los tres prompts y datos siguen presentes.

### Tests for User Story 4 — write and run red first

- [X] T033 [P] [US4] Escribir pruebas rojas para composición de prompts de guía, ejecución y revisión que incluyan todos los criterios/comentarios aplicables, escapen texto no confiable y conserven una edición manual hasta regeneración explícita en `app/features/tasks/domain/task-rules.test.ts`.
- [X] T034 [P] [US4] Escribir pruebas rojas de persistencia de prompts editados y recuperación de un fallo de almacenamiento en `tests/integration/task-persistence.test.ts`.
- [X] T035 [P] [US4] Escribir escenario Playwright rojo para guardar desde cada cajita, anunciar éxito/error y recuperar los prompts tras recarga en `tests/e2e/nuxt-task-workflows.spec.ts`.

### Implementation for User Story 4

- [X] T036 [US4] Implementar compositores y estado de sincronización de prompt por etapa con problema vigente, criterios, comentarios, iteraciones y revisión pertinentes en `app/features/tasks/domain/task-rules.ts`.
- [X] T037 [US4] Crear un control reutilizable de cajita de prompt editable, regeneración explícita, acción de guardado directo y región de estado en `app/features/tasks/components/PromptBox.vue`.
- [X] T038 [US4] Integrar la cajita y su prompt compuesto en la guía en `app/features/tasks/components/GuidancePhase.vue`.
- [X] T039 [P] [US4] Integrar la cajita y su prompt compuesto en ejecución en `app/features/tasks/components/ExecutionPhase.vue`.
- [X] T040 [P] [US4] Integrar la cajita y su prompt compuesto en revisión en `app/features/tasks/components/ReviewPhase.vue`.
- [X] T041 [US4] Exponer un manejador único de guardado directo y errores recuperables para cajitas en `app/features/tasks/components/TaskWorkspace.vue` y `pages/tasks/[id].vue`.
- [X] T042 [US4] Ejecutar T033–T035 y las suites de dominio, integración y navegador afectadas hasta que estén verdes.

**Checkpoint**: Cada prompt incluye la información revisada pertinente y se guarda desde su propio contexto sin intervención adicional.

---

## Phase 7: Polish and cross-cutting verification

**Purpose**: Completar evidencia, accesibilidad, documentación y verificación integral.

- [X] T043 Revisar la evidencia de accesibilidad, orden de foco, estados de guardado y movimiento reducido ya creada en T012, T018, T025, T026 y T035 frente a `specs/003-mejorar-bitacora-iteraciones/contracts/task-workspace-ui.md`; registrar solo brechas de documentación en `specs/003-mejorar-bitacora-iteraciones/quickstart.md`.
- [X] T044 Verificar que la cobertura de exportación segura creada en T006 incluye análisis, criterios, iteraciones y mejoras, y documentar el resultado en `specs/003-mejorar-bitacora-iteraciones/quickstart.md`.
- [ ] T045 Ejecutar tres recorridos manuales completos de `specs/003-mejorar-bitacora-iteraciones/quickstart.md`: medir clasificación de cinco criterios (objetivo: menos de 5 minutos) y, con 20 iteraciones, medir inserción y feedback de guardado (objetivo: menos de 1 segundo); registrar resultados y cualquier variación en ese mismo archivo.
- [X] T046 Ejecutar `npm run verify` y corregir todos los fallos relacionados con la funcionalidad.
- [X] T047 Ejecutar `npm run verify:e2e` y corregir todos los fallos relacionados con la funcionalidad.
- [X] T048 Actualizar la evidencia de estructura si los imports aceptados cambian, mediante `npm run graph:update` y `npm run graph:check`.

## Dependencies and execution order

### Phase dependencies

- **Setup (Phase 1)**: inicia inmediatamente.
- **Foundational (Phase 2)**: depende de T001–T003 y bloquea todas las historias.
- **US1 (Phase 3)**: depende de T010; es el MVP y desbloquea datos de guía coherentes.
- **US2 (Phase 4)**: depende de T016; aporta criterios que consumen US3 y US4.
- **US3 (Phase 5)**: depende de T022; usa criterios ya estables.
- **US4 (Phase 6)**: depende de T022 y T032, para incluir información completa de todas las etapas.
- **Polish (Phase 7)**: depende de las historias deseadas completas.

### User story dependencies

- **US1 (P1)**: independiente después de la base; no depende de UI posterior.
- **US2 (P2)**: usa la formulación vigente de US1.
- **US3 (P3)**: usa el criterio estructurado de US2.
- **US4 (P4)**: compone la información de US1–US3 y por ello se implementa después de ellas.

### Parallel opportunities

- T002 y T003 pueden realizarse en paralelo.
- T004–T006 se ejecutan en orden dentro del mismo archivo de pruebas de dominio, salvo T005, que puede prepararse en paralelo en la capa de integración.
- Dentro de cada historia, todas las tareas marcadas `[P]` son paralelizables solo después de que la base de sus fixtures/contratos esté disponible.
- T038, T039 y T040 pueden repartirse una vez existe `PromptBox.vue` y T036 está verde; cada una toca un componente de fase distinto.

## Implementation strategy

### MVP first (US1 only)

1. Completar Setup y Foundation, confirmando primero el rojo de pruebas.
2. Completar US1 y ejecutar sus pruebas de dominio y navegador.
3. Detenerse para validar que una persona puede analizar y reformular un problema sin afectar tareas heredadas.

### Incremental delivery

1. US1 entrega el protocolo analítico explícito.
2. US2 convierte ese resultado en criterios utilizables y priorizados.
3. US3 registra la ejecución continua y el aprendizaje por criterio.
4. US4 convierte el registro completo en prompts confiables y guardables.
5. La fase final prueba regresiones, accesibilidad y los comandos agregados.

## Notes

- No saltar el paso de ejecutar las pruebas rojas: es una condición de aceptación de cada historia.
- No crear servicios, almacenamiento ni contratos HTTP nuevos para esta funcionalidad.
- `T046`, `T047` y `T048` son obligatorias antes de declarar la implementación terminada.
