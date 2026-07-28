# Tasks: Correcciones UX/UI del workspace

**Input**: Design documents from `/specs/007-fix-workspace-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/workspace-ux.md, quickstart.md

**Tests**: TDD obligatorio. Cada prueba se escribe y ejecuta en rojo antes de editar produccion; despues se ejecutan la prueba enfocada, la suite afectada y los gates agregados.

**Organization**: Las tareas se agrupan por historia para entregar incrementos independientes y mantener trazabilidad UX-001–UX-017.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque usa archivos distintos y no depende de una tarea incompleta.
- **[Story]**: Historia de usuario correspondiente.
- Cada tarea incluye rutas exactas.

## Phase 1: Setup

**Purpose**: Preparar evidencia y utilidades de prueba sin cambiar comportamiento.

- [ ] T001 Crear la matriz de ejecucion y registro de rojo/verde en `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T002 [P] Crear helpers de seed, viewports y deteccion de overflow/solape en `tests/e2e/helpers/workspace-ux.ts`
- [ ] T003 [P] Crear el esqueleto de trazabilidad UX-001–UX-017 en `tests/e2e/workspace-ux-audit.spec.ts`

---

## Phase 2: Foundational

**Purpose**: Establecer contratos compartidos para creacion, presentacion y avisos.

**CRITICAL**: Esta fase debe completarse antes de implementar las historias modernas US1, US2, US3 y US5. US4 es una excepcion aislada porque solo modifica y prueba el flujo heredado.

- [ ] T004 Escribir pruebas unitarias de estados `idle`, `invalid`, `submitting`, `succeeded` y `failed` en `app/features/tasks/components/TaskIntakeForm.test.ts`
- [ ] T005 Ejecutar T004 y registrar el fallo rojo esperado en `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T006 Implementar el bloqueo de envio repetido y la conservacion de datos tras fallo en `app/features/tasks/components/TaskIntakeForm.vue` y `app/features/tasks/components/task-intake.ts`
- [ ] T007 Ejecutar las pruebas enfocadas de intake y registrar el verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: El contrato de intake es estable y puede ser reutilizado por todas las entradas.

---

## Phase 3: User Story 1 - Crear la primera tarea sin bloqueos (Priority: P1) MVP

**Goal**: Unificar `Crear primera tarea`, `Nueva tarea` y `/tasks/new` en una creacion funcional, responsive e idempotente.

**Independent Test**: Desde un proyecto sin tareas, crear exactamente una tarea por puntero y teclado en escritorio y movil, y recuperar el formulario tras un fallo.

### Tests for User Story 1

- [ ] T008 [P] [US1] Escribir escenarios E2E para cero proyectos, proyecto vacio, proyecto preseleccionado, proyecto archivado durante el formulario, conservacion de datos, validacion, cierre sucio, recarga y envio repetido en `tests/e2e/workspace-ux-audit.spec.ts`
- [ ] T009 [P] [US1] Extender pruebas de overlay para clipping, foco, Escape y 390 x 844 en `tests/e2e/workspace-overlays.spec.ts`
- [ ] T010 [US1] Ejecutar T008–T009 y registrar los fallos rojos UX-001, UX-004 y UX-007 en `specs/007-fix-workspace-ux/implementation-evidence.md`

### Implementation for User Story 1

- [ ] T011 [US1] Extraer una unica operacion de creacion reutilizable en `app/features/tasks/components/NewTaskModal.vue` y `app/features/tasks/components/task-intake.ts`
- [ ] T012 [US1] Conectar `Crear primera tarea` y acciones `Nueva tarea` al formulario compartido en `pages/index.vue` y `app/features/tasks/components/DashboardSidebar.vue`
- [ ] T013 [US1] Convertir la carga directa de nueva tarea en un flujo funcional sin placeholder en `pages/tasks/new.vue`
- [ ] T014 [US1] Ajustar geometria, cierre y campos del formulario movil en `app/features/tasks/components/NewTaskModal.vue`
- [ ] T015 [US1] Ejecutar pruebas de intake, T008–T009 y regresion de creacion en `tests/e2e/nuxt-task-workflows.spec.ts`; registrar verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: La primera tarea puede crearse desde cualquier entrada sin pantalla muerta ni duplicados.

---

## Phase 4: User Story 2 - Operar el workspace sin capas que bloqueen controles (Priority: P1)

**Goal**: Garantizar que chat, formulario, evaluacion, avance, listas y renombrado sean utilizables sin intercepcion.

**Independent Test**: Con contenido largo y varias tareas, activar todos los controles por puntero y teclado y verificar que el elemento superior en cada punto sea el control esperado.

### Tests for User Story 2

- [ ] T016 [P] [US2] Escribir pruebas de click target para `Evaluar`, `Continuar`, `Avanzar`, enviar, crear y renombrar en `tests/e2e/workspace-ux-audit.spec.ts`
- [ ] T017 [P] [US2] Escribir pruebas de lista larga, footer, renombrado y nombres de 160 caracteres en `tests/e2e/guided-workspace.spec.ts`
- [ ] T018 [US2] Ejecutar T016–T017 y registrar los fallos rojos UX-002, UX-008 y UX-010 en `specs/007-fix-workspace-ux/implementation-evidence.md`

### Implementation for User Story 2

- [ ] T019 [US2] Definir filas estables y scroll independiente del shell en `app/features/tasks/components/TaskWorkspace.vue`
- [ ] T020 [US2] Separar lista desplazable, footer y formularios inline en `app/features/tasks/components/DashboardSidebar.vue`
- [ ] T021 [US2] Eliminar capas que interceptan chat, evaluacion y avance en `pages/tasks/[id].vue` y `app/features/tasks/components/TaskChat.vue`
- [ ] T022 [US2] Ejecutar T016–T017 y las regresiones de workspace en `tests/e2e/conversational-workspace.spec.ts`; registrar verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: Todo control visible del workspace recibe interaccion o explica por que esta deshabilitado.

---

## Phase 5: User Story 3 - Navegar con claridad en escritorio, tablet y movil (Priority: P1)

**Goal**: Separar sidebar y contenido en movil y hacer consistentes colapso, biblioteca, ajustes y destinos globales.

**Independent Test**: Recorrer home, tarea, biblioteca y ajustes en 1440 x 900, 1024 x 768, 390 x 844, 320 px y zoom 200%, sin solapes ni callejones.

### Tests for User Story 3

- [ ] T023 [P] [US3] Escribir pruebas de drawer cerrado inicial, Escape, seleccion, retorno de foco, overflow a 320 px y restauracion de nueva tarea/ajustes tras recarga y atras/adelante en `tests/e2e/workspace-ux-audit.spec.ts`
- [ ] T024 [P] [US3] Escribir pruebas de transiciones expandida, contraida y drawer en `app/features/tasks/composables/useWorkspaceState.test.ts`
- [ ] T025 [P] [US3] Extender biblioteca global/contextual, atras/adelante y estados vacios en `tests/e2e/workspace-library.spec.ts`
- [ ] T026 [P] [US3] Extender consistencia de biblioteca y ajustes por rol/nombre en `tests/e2e/workspace-overlays.spec.ts`
- [ ] T027 [US3] Ejecutar T023–T026 y registrar los fallos rojos UX-003, UX-005, UX-006, UX-009 y UX-017 en `specs/007-fix-workspace-ux/implementation-evidence.md`

### Implementation for User Story 3

- [ ] T028 [US3] Implementar estados de navegacion desktop/movil y retorno de foco en `app/features/tasks/composables/useWorkspaceState.ts`
- [ ] T029 [US3] Implementar drawer movil y colapso desktop en `app/features/tasks/components/DashboardSidebar.vue`, `app/features/tasks/components/WorkspaceHeader.vue` y `app/features/tasks/components/TaskWorkspace.vue`
- [ ] T030 [US3] Conectar biblioteca y ajustes de forma consistente en `pages/index.vue` y `pages/tasks/[id].vue`
- [ ] T031 [US3] Convertir `/library` en una entrada accionable que reutiliza la biblioteca existente en `pages/library/index.vue` y `app/features/library/components/LibrarySlideover.vue`
- [ ] T032 [US3] Ejecutar T023–T026 en todos los viewports objetivo y registrar verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: Navegacion, contenido y overlays permanecen diferenciados y recuperables en todos los viewports.

---

## Phase 6: User Story 4 - Comprender y corregir entradas invalidas (Priority: P2)

**Goal**: Hacer explicita la opcionalidad de la directiva y evitar filas vacias duplicadas en legado.

**Independent Test**: Crear una tarea solo con nombre y comprobar el texto opcional; intentar agregar repetidamente una fila vacia y luego completarla o eliminarla.

### Tests for User Story 4

- [ ] T033 [US4] Escribir escenarios de directiva opcional, nombre requerido, foco de error, fila vacia y eliminacion en `tests/e2e/legacy-task-workflows.spec.ts`
- [ ] T034 [US4] Ejecutar T033 y registrar los fallos rojos UX-011 y UX-012 en `specs/007-fix-workspace-ux/implementation-evidence.md`

### Implementation for User Story 4

- [ ] T035 [US4] Etiquetar `Directiva cruda` como opcional y asociar validacion/foco del nombre en `bitacora-protocolo-analitico (2).html`
- [ ] T036 [US4] Bloquear filas vacias duplicadas y añadir eliminacion de fila en `bitacora-protocolo-analitico (2).html`
- [ ] T037 [US4] Ejecutar T033 y la regresion de fases en `tests/e2e/legacy-phase-workflows.spec.ts`; registrar verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: El legado comunica requisitos y no acumula estructuras vacias accidentalmente.

---

## Phase 7: User Story 5 - Recibir feedback accesible, localizado y no duplicado (Priority: P2)

**Goal**: Mostrar un aviso por operacion y completar titulos, 404 y nombres accesibles en espanol.

**Independent Test**: Guardar una vez, inspeccionar los avisos, recorrer rutas y operar chat/controles iconograficos con teclado y roles accesibles.

### Tests for User Story 5

- [ ] T038 [P] [US5] Escribir pruebas de deduplicacion por operacion, limite, cierre y reintento en `app/features/tasks/composables/useWorkspaceNotices.test.ts`
- [ ] T039 [P] [US5] Escribir escenarios E2E de un solo `Guardado`, roles `status`/`alert`, navegacion y region de contexto identificadas, `main` unico, titulos, 404 localizado, foco visible y nombres accesibles en `tests/e2e/workspace-ux-audit.spec.ts`
- [ ] T040 [US5] Ejecutar T038–T039 y registrar los fallos rojos UX-013, UX-014, UX-015 y UX-016 en `specs/007-fix-workspace-ux/implementation-evidence.md`

### Implementation for User Story 5

- [ ] T041 [US5] Deduplicar avisos por operacion sin ocultar errores distintos en `app/features/tasks/composables/useWorkspaceNotices.ts` y `app/features/tasks/components/NoticeRegion.vue`
- [ ] T042 [US5] Emitir una sola identidad de guardado por operacion en `pages/tasks/[id].vue`
- [ ] T043 [P] [US5] Localizar la ruta inexistente y ofrecer retorno al workspace en `error.vue`
- [ ] T044 [P] [US5] Definir titulos contextuales y landmarks con navegacion, region de contexto y `main` unico en `app.vue`, `pages/index.vue`, `pages/library/index.vue`, `pages/reference.vue` y `pages/tasks/[id].vue`
- [ ] T045 [P] [US5] Localizar nombre accesible, tooltip y foco del envio en `app/features/tasks/components/TaskChat.vue`
- [ ] T046 [US5] Ejecutar T038–T039 y regresiones de overlays/chat; registrar verde en `specs/007-fix-workspace-ux/implementation-evidence.md`

**Checkpoint**: Feedback, rutas y controles auditados son unicos, localizados y operables con tecnologia de asistencia.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar trazabilidad, responsive, arquitectura y verificacion agregada.

- [ ] T047 [P] Capturar evidencia posterior en 1440 x 900, 1024 x 768, 390 x 844, 320 px y zoom 200% dentro de `specs/007-fix-workspace-ux/evidence/`
- [ ] T048 [P] Revisar textos, estados vacios, foco visible, contraste y nombres largos contra `specs/007-fix-workspace-ux/contracts/workspace-ux.md`
- [ ] T049 Ejecutar `npm run verify` y registrar comando, resultado y alcance en `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T050 Ejecutar `TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e` contra un unico servidor actual y registrar resultado en `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T051 Actualizar estructura y Graphify y registrar checks de frescura en `docs/architecture/structure.md` y `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T052 Ejecutar revision independiente del patch y documentar hallazgos resueltos o riesgos aceptados en `specs/007-fix-workspace-ux/implementation-evidence.md`
- [ ] T053 Ejecutar con cinco participantes el protocolo de creacion y recuperacion, registrar exito sin ayuda y conclusiones en `specs/007-fix-workspace-ux/usability-study.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias.
- **Foundational (Phase 2)**: Depende de Setup y bloquea US1, US2, US3 y US5; US4 queda exceptuada por aislamiento.
- **US1 (Phase 3)**: Primer incremento y MVP; habilita creacion desde proyecto vacio.
- **US2 (Phase 4)**: Puede iniciar tras Foundational, pero su E2E completo se beneficia del seed de US1.
- **US3 (Phase 5)**: Puede iniciar tras Foundational; integra navegacion con entradas de US1.
- **US4 (Phase 6)**: Independiente despues de Setup porque solo toca legado.
- **US5 (Phase 7)**: Puede iniciar tras Foundational; T042 integra el guardado del workspace.
- **Polish (Phase 8)**: Depende de las historias incluidas en la entrega.

### User Story Dependencies

- **US1**: Sin dependencia funcional de otras historias.
- **US2**: Sin dependencia funcional; usa tareas sembradas.
- **US3**: Sin dependencia funcional; debe preservar el contrato de creacion de US1.
- **US4**: Independiente del workspace moderno.
- **US5**: Independiente salvo la identidad de guardado que se valida sobre el workspace.

### Within Each User Story

- Escribir todas las pruebas de la historia.
- Ejecutarlas y confirmar el rojo por comportamiento ausente.
- Implementar el cambio minimo en el orden indicado.
- Ejecutar pruebas enfocadas y regresiones afectadas.
- Marcar cada tarea solo despues de obtener evidencia verificable.
- Hacer commit y push del bloque completado sin incluir cambios ajenos.

## Parallel Opportunities

- T002 y T003 pueden ejecutarse en paralelo.
- T008 y T009 pueden ejecutarse en paralelo.
- T016 y T017 pueden ejecutarse en paralelo.
- T023–T026 pueden ejecutarse en paralelo.
- US4 puede desarrollarse en paralelo con US1–US3 porque su archivo y suites son independientes.
- T038 y T039 pueden ejecutarse en paralelo.
- T043–T045 pueden ejecutarse en paralelo despues del rojo de US5.
- T047 y T048 pueden ejecutarse en paralelo antes de gates agregados.

## Parallel Example: User Story 3

```text
Task T023: drawer, foco y overflow en tests/e2e/workspace-ux-audit.spec.ts
Task T024: estados de navegacion en app/features/tasks/composables/useWorkspaceState.test.ts
Task T025: biblioteca global/contextual en tests/e2e/workspace-library.spec.ts
Task T026: consistencia de overlays en tests/e2e/workspace-overlays.spec.ts
```

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. Completar US1.
3. Detenerse y demostrar primera tarea desde proyecto vacio en desktop y movil.
4. Continuar con operabilidad y navegacion P1.

### Incremental Delivery

1. US1 elimina el bloqueo de entrada.
2. US2 garantiza que el workspace existente sea operable.
3. US3 completa responsive y navegacion.
4. US4 corrige ambiguedades del legado sin tocar datos.
5. US5 cierra feedback, localizacion y accesibilidad.
6. Polish valida el conjunto en un solo checkout y servidor.

## Notes

- Las capturas de auditoria no se sobrescriben.
- Los cambios existentes del worktree deben preservarse y revisarse antes de cada edicion.
- Una prueba enfocada verde no sustituye `npm run verify` ni `npm run verify:e2e`.
- Si una correccion ya existe en el worktree, la prueba debe demostrar el estado inicial real; no se inventa un rojo ni se marca la tarea sin evidencia.
