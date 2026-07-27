# Tasks: Formularios y prompts sincronizados por fase

**Input**: Design documents from `/specs/004-prompts-por-fase/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/task-phase-workspace-ui.md`, `quickstart.md`

**Tests**: Obligatorios. Cada cambio de comportamiento sigue: prueba completa primero, ejecución roja confirmada, implementación mínima, pruebas enfocadas y verificaciones agregadas verdes.

**Organization**: Las tareas se agrupan por historia de usuario; cada historia puede verificarse de forma independiente tras las tareas fundacionales.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede avanzar en paralelo una vez se cumplan sus dependencias y no comparte archivo.
- **[Story]**: Historia de usuario a la que aporta la tarea.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar el contrato visual y preparar las pruebas de regresión que guían la entrega.

- [ ] T001 Revisar y conservar el contrato de dos áreas, orden de teclado, apilamiento y estados de prompt en `specs/004-prompts-por-fase/contracts/task-phase-workspace-ui.md`.
- [ ] T002 [P] Añadir selectores o utilidades de prueba estables para las áreas de formulario y prompt en `app/features/tasks/components/PromptBox.vue` y los componentes de fase, sin modificar aún la lógica de producto.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extender el modelo y la composición para que todas las fases tengan un prompt reparable y comprobable antes de editar la interfaz.

**⚠️ CRITICAL**: Ninguna historia de interfaz comienza antes de completar esta fase.

- [ ] T003 Escribir pruebas rojas de valores por defecto, reparación heredada y composición de las cuatro etapas (completa, vacía y con caracteres especiales), incluida la selección de campos propia de guía, ejecución y revisión, en `app/features/tasks/domain/task-rules.test.ts`.
- [ ] T004 [P] Escribir prueba roja de persistencia de `f1.promptOrientacion` y su marca de personalización, incluyendo una recuperación tras fallo de almacenamiento, en `tests/integration/task-persistence.test.ts`.
- [ ] T005 Ejecutar las pruebas nuevas de `app/features/tasks/domain/task-rules.test.ts` y `tests/integration/task-persistence.test.ts` y registrar que fallan por los campos/composición aún ausentes.
- [ ] T006 Añadir `promptOrientacion` y `promptOrientacionPersonalizado`, con valores por defecto reparables que preserven tareas heredadas, en `app/features/tasks/domain/task.schema.ts`.
- [ ] T007 Ampliar la composición pura de prompts con la etapa `orientation` y la selección explícita de campos por etapa en `app/features/tasks/domain/task-rules.ts`.
- [ ] T008 Ejecutar las pruebas de T003 y T004 hasta que queden verdes y verificar que la composición no permite contenido ejecutable en `app/features/tasks/domain/task-rules.test.ts` y `tests/integration/task-persistence.test.ts`.

**Checkpoint**: Las cuatro fases tienen contrato de datos y composición de prompt; las tareas heredadas se reparan con seguridad.

---

## Phase 3: User Story 1 - Trabajar con formulario y prompt en una misma vista (Priority: P1) 🎯 MVP

**Goal**: Mostrar formulario y prompt asociados en dos áreas accesibles de cada fase, con disposición responsive.

**Independent Test**: Abrir una tarea por fase, verificar las áreas y cambiar a una vista de 320 px para comprobar el apilamiento y la navegación con teclado.

### Tests for User Story 1

- [ ] T009 [US1] Escribir pruebas Playwright rojas para las cuatro fases: áreas de formulario/prompt, etiquetas, botones y orden de tabulación en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T010 [US1] Ampliar las pruebas Playwright con viewport de 320 px y zoom/documento equivalente para confirmar que el prompt queda después del formulario y todos los controles son alcanzables en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T011 [US1] Ejecutar las pruebas T009–T010 y confirmar su fallo por falta de área de orientación y de diseño de dos columnas.

### Implementation for User Story 1

- [ ] T012 [US1] Reutilizar `PromptBox` en orientación, conectar sus acciones `save` y `dirty`, y organizar formulario/prompt como áreas semánticas en `app/features/tasks/components/OrientationPhase.vue` y `app/features/tasks/components/TaskWorkspace.vue`.
- [ ] T013 [P] [US1] Reorganizar formulario y `PromptBox` de guía en el contenedor de áreas compartido, conservando sus etiquetas y controles, en `app/features/tasks/components/GuidancePhase.vue`.
- [ ] T014 [P] [US1] Reorganizar formulario y `PromptBox` de ejecución en el contenedor de áreas compartido, conservando iteraciones y foco, en `app/features/tasks/components/ExecutionPhase.vue`.
- [ ] T015 [P] [US1] Reorganizar formulario y `PromptBox` de revisión en el contenedor de áreas compartido, conservando mejoras y confrontaciones, en `app/features/tasks/components/ReviewPhase.vue`.
- [ ] T016 [US1] Implementar estilos responsivos reutilizables de dos columnas/apilamiento y ampliar el ancho útil del espacio principal sin afectar otros flujos en `app/app.vue`.
- [ ] T017 [US1] Ejecutar las pruebas de T009–T010 hasta que queden verdes y realizar la verificación manual de teclado indicada en `specs/004-prompts-por-fase/quickstart.md`.

**Checkpoint**: Una persona puede ver y operar formulario y prompt en las cuatro fases, en escritorio y en vista estrecha.

---

## Phase 4: User Story 2 - Completar el prompt con los datos vigentes (Priority: P2)

**Goal**: Mantener actualizado el prompt de cada fase mientras sea automático, sin sobrescribir ediciones manuales.

**Independent Test**: Modificar un campo representativo en cada fase, comprobar el prompt asociado; editarlo manualmente, cambiar la fuente, confirmar que no cambia; regenerar y confirmar que vuelve a sincronizar.

### Tests for User Story 2

- [ ] T018 [US2] Añadir pruebas rojas de sincronización de cada etapa tras cambiar campos fuente, verificando que el prompt automático se actualiza y no mezcla datos de otra fase, en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T019 [US2] Añadir pruebas Playwright rojas de protección de edición manual, regeneración y estado accesible para orientación, guía, ejecución y revisión en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T020 [US2] Ejecutar las pruebas T018–T019 y confirmar que fallan por la ausencia de sincronización automática y de protección de edición manual.

### Implementation for User Story 2

- [ ] T021 [US2] Implementar la sincronización acotada de orientación: observar solo sus campos fuente y actualizar `promptOrientacion` únicamente cuando no sea personalizado en `app/features/tasks/components/OrientationPhase.vue`.
- [ ] T022 [P] [US2] Implementar la sincronización acotada de guía con preservación de edición manual y regeneración explícita en `app/features/tasks/components/GuidancePhase.vue`.
- [ ] T023 [P] [US2] Implementar la sincronización acotada de ejecución con preservación de edición manual y regeneración explícita en `app/features/tasks/components/ExecutionPhase.vue`.
- [ ] T024 [P] [US2] Implementar la sincronización acotada de revisión con preservación de edición manual y regeneración explícita en `app/features/tasks/components/ReviewPhase.vue`.
- [ ] T025 [US2] Mostrar una indicación accesible del estado personalizado y de la regeneración disponible, sin duplicar las acciones existentes, en `app/features/tasks/components/PromptBox.vue`.
- [ ] T026 [US2] Ejecutar las pruebas T018–T019 hasta que queden verdes, comprobando explícitamente que el observador no provoca ciclos de actualización ni sobrescribe prompts personalizados.

**Checkpoint**: Cada prompt automático refleja solo su formulario vigente; una edición manual queda protegida hasta regenerarla.

---

## Phase 5: User Story 3 - Conservar prompts por fase al guardar y reabrir (Priority: P3)

**Goal**: Mantener el texto y el modo automático/personalizado de las cuatro fases con el guardado actual, incluidas tareas heredadas y recuperaciones de fallo.

**Independent Test**: Guardar una tarea de cada fase con combinaciones de prompt automático y manual, recargarla y validar texto, marca y actualización posterior.

### Tests for User Story 3

- [ ] T027 [US3] Añadir pruebas de integración rojas para la persistencia de los cuatro prompts y sus marcas, incluida la recuperación de un error de almacenamiento, en `tests/integration/task-persistence.test.ts`.
- [ ] T028 [US3] Añadir pruebas Playwright rojas para guardar desde cada cajita, recibir un error real, reintentar, recargar, conservar texto manual y reparar una tarea heredada sin prompt de orientación en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T029 [US3] Ejecutar las pruebas T027–T028 y confirmar el fallo específico que permanezca tras las fases anteriores.

### Implementation for User Story 3

- [ ] T030 [US3] Propagar el resultado asíncrono de guardar y reintentar desde las cuatro fases hasta `PromptBox`, para que la cajita muestre éxito solo después de persistir y muestre un error recuperable real, en `app/features/tasks/components/PromptBox.vue`, `app/features/tasks/components/OrientationPhase.vue`, `app/features/tasks/components/GuidancePhase.vue`, `app/features/tasks/components/ExecutionPhase.vue`, `app/features/tasks/components/ReviewPhase.vue`, `app/features/tasks/components/TaskWorkspace.vue` y `pages/tasks/[id].vue`.
- [ ] T031 [US3] Corregir la persistencia o reparación mínima que revelen las pruebas sin crear nuevas claves de almacenamiento en `app/features/tasks/domain/task.schema.ts` y `app/features/tasks/services/task-store.ts`.
- [ ] T032 [US3] Ejecutar las pruebas T027–T028 hasta que queden verdes y repetir la verificación de compatibilidad de `specs/004-prompts-por-fase/quickstart.md`.

**Checkpoint**: Guardar, recargar y recuperar una tarea conserva todos los prompts y sus decisiones de sincronización.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar la entrega completa y preservar evidencia de calidad.

- [ ] T033 [P] Revisar textos, etiquetas, estados de error y contraste de las cuatro cajitas en `app/features/tasks/components/PromptBox.vue` y los componentes de fase.
- [ ] T034 [P] Actualizar la evidencia de arquitectura si cambian imports o estructura aceptada usando los comandos del repositorio y los documentos relevantes en `docs/`.
- [ ] T035 Ejecutar `npm run verify` y resolver cualquier regresión en los archivos afectados.
- [ ] T036 Ejecutar `npm run verify:e2e` y resolver cualquier regresión de navegador en `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T037 Revisar el cambio completo con un revisor independiente antes de solicitar el cierre.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: comienza de inmediato.
- **Foundational (Phase 2)**: depende de T001–T002 y bloquea las historias de interfaz.
- **US1 (Phase 3)**: depende de T008; entrega el MVP visual y accesible.
- **US2 (Phase 4)**: depende de T017 y de la composición de T008.
- **US3 (Phase 5)**: depende de T026; completa persistencia y recuperación.
- **Polish (Phase 6)**: depende de las tres historias seleccionadas.

### User Story Dependencies

- **US1 (P1)**: puede verificarse con prompts estáticos/composición existente tras la base de dominio.
- **US2 (P2)**: requiere las áreas de US1 para validar el comportamiento de interacción completo.
- **US3 (P3)**: requiere la sincronización de US2 y comprueba su durabilidad.

### Parallel Opportunities

- T004 puede avanzar en paralelo con T003.
- T013–T015 pueden desarrollarse en paralelo tras el contrato de base.
- T022–T024 pueden desarrollarse en paralelo tras las pruebas rojas de US2.
- T033 y T034 pueden avanzar en paralelo antes de las verificaciones agregadas.

## Parallel Example: User Story 2

```text
Después de T020, pueden realizarse en paralelo:

- T022 en GuidancePhase.vue
- T023 en ExecutionPhase.vue
- T024 en ReviewPhase.vue
```

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Completar US1 y validar las cuatro fases en escritorio y móvil.
3. Detenerse y validar el flujo visual antes de sincronizar contenido.

### Incremental Delivery

1. Base de datos reparable y composición de orientación.
2. Diseño de dos áreas en todas las fases.
3. Sincronización automática y protección de edición manual.
4. Persistencia, recuperación y verificación agregada.
