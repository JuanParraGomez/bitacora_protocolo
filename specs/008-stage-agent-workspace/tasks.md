# Tasks: Lienzo por etapas con agente IA

**Input**: Documentos de diseño en
`/specs/008-stage-agent-workspace/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/visual-acceptance.md`, `quickstart.md`

**Tests**: Obligatorios por la constitución. Cada cambio de comportamiento
empieza con pruebas completas, se ejecuta en rojo por la ausencia esperada, se
implementa con el cambio mínimo y solo después se ejecutan verde y regresiones.

**Evidence**: Cada tarea completada requiere una entrada separada en
`specs/008-stage-agent-workspace/implementation-evidence.md` con ID, AC/FR/IMG,
archivos, comando exacto, fecha/hora, exit code, rojo esperado y causa cuando
corresponda, verde, regresiones, alcance no verificado, diff/commit si existe y
estado `VERIFICADO`. `PARCIAL`, `BLOQUEADO` y `NO VERIFICADO` mantienen la
casilla abierta.

**Visual contract**: Solo son canónicas las seis rutas exactas declaradas en
`docs/ux-ui/mockups/rediseño-agente/manifest.md`; ningún glob puede seleccionar
borradores reemplazados.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo porque usa archivos distintos y no
  depende de otra tarea abierta.
- **[US#]**: historia de usuario a la que pertenece.
- Cada descripción incluye ruta exacta, referencias `AC-*`, `FR-*`,
  `IMG-UX-*` y ancla de evidencia.

---

## Phase 1: Setup — evidencia, fixtures y contrato visual

**Purpose**: Preparar evidencia reproducible, datos deterministas y validación
de las referencias aprobadas sin cambiar todavía el comportamiento del
workspace.

- [X] T001 Crear la plantilla de evidencia por tarea, con campos obligatorios y estados permitidos, en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-001–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T001`
- [X] T002 [P] Crear fixtures deterministas para fases 1–4, textos largos, borrador sucio, evaluación vigente/desfasada/fallida, propuestas, tarea completada, fuentes parciales y registros duplicados en `tests/fixtures/tasks/stage-agent-workspace.ts`. Refs: AC-003–AC-005, AC-009–AC-018, AC-020–AC-021, FR-008–FR-020, FR-024, FR-031, FR-035–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T002`
- [X] T003 [P] Escribir primero pruebas del validador que acepten exactamente las seis rutas canónicas, sus IDs/resoluciones y rechacen ausencia, sustitución o glob en `scripts/verify-workspace-visual-contract.test.mjs`; ejecutarlas y registrar rojo por script ausente. Refs: AC-001–AC-022, FR-001, FR-032–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T003`
- [X] T004 Implementar el cambio mínimo que satisfaga T003 leyendo `docs/ux-ui/mockups/rediseño-agente/manifest.md` desde `scripts/verify-workspace-visual-contract.mjs`, sin aceptar borradores reemplazados. Refs: AC-001–AC-022, FR-001, FR-032–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T004`
- [X] T005 Ejecutar verde de `scripts/verify-workspace-visual-contract.test.mjs` y `scripts/verify-workspace-visual-contract.mjs`, y registrar entradas separadas `VERIFICADO` para T001–T005 en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-001, FR-032–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T005`

**Checkpoint**: Las referencias y fixtures son deterministas; aún no cambia la
interfaz.

---

## Phase 2: Foundation — proyecciones puras y continuidad

**Purpose**: Establecer una sola derivación de presentación y persistir solo
estado visual compatible. Esta fase bloquea todas las historias.

### Tests first

- [ ] T006 [P] Escribir pruebas de tabla para los seis estados de acción, gates rechazados, evaluación desfasada/fallida, issues por campo y las reglas exactas de fallback/deduplicación del resumen en `app/features/tasks/components/workspace-presentation.test.ts`. Refs: AC-011–AC-020, FR-010–FR-018, FR-024–FR-025, FR-036–FR-037, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T006`
- [ ] T007 [P] Escribir pruebas de estado válido, legacy, corrupto, defaults, aislamiento por tarea, agente abierto/cerrado y plano móvil activo en `app/features/tasks/composables/useWorkspaceState.test.ts`. Refs: AC-006, AC-008, AC-010, FR-003, FR-007, FR-009, FR-020, FR-031, IMG-UX-02–IMG-UX-04. Evidence: `implementation-evidence.md#T007`
- [ ] T008 Ejecutar T006–T007 y confirmar rojo por funciones/mapas aún ausentes, sin modificar producción, registrando comandos y causas en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-006, AC-008, AC-010–AC-020, FR-003, FR-007, FR-009–FR-020, FR-024–FR-025, FR-031, FR-036–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T008`

### Minimal implementation

- [ ] T009 Implementar `resolveContextualPrimaryAction`, `resolveEvaluationDisplay` y `projectCompletionSummary` como funciones puras y sin efectos en `app/features/tasks/components/workspace-presentation.ts`. Refs: AC-011–AC-020, FR-010–FR-018, FR-024–FR-025, FR-036–FR-037, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T009`
- [ ] T010 Añadir mapas opcionales `agentPanelByTask` y `mobilePaneByTask`, defaults seguros, reparación legacy e aislamiento por tarea dentro de la clave existente en `app/features/tasks/composables/useWorkspaceState.ts`. Refs: AC-006, AC-008, AC-010, FR-003, FR-007, FR-009, FR-020, FR-031, IMG-UX-02–IMG-UX-04. Evidence: `implementation-evidence.md#T010`
- [ ] T011 Ejecutar verde de `workspace-presentation.test.ts` y `useWorkspaceState.test.ts`, más regresiones de `task-rules.test.ts`, `task-assistant-rules.test.ts` y `task-completion.test.ts`, corrigiendo solo defectos de Foundation. Refs: AC-006, AC-008, AC-010–AC-020, FR-003, FR-007, FR-009–FR-020, FR-024–FR-025, FR-031, FR-036–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T011`
- [ ] T012 Registrar entradas separadas `VERIFICADO` para T006–T012 y el alcance aún no verificado en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-006, AC-008, AC-010–AC-020, FR-003, FR-007, FR-009–FR-020, FR-024–FR-025, FR-031, FR-036–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T012`

**Checkpoint**: Acción, evaluación, resumen y continuidad visual tienen una
fuente determinista y pruebas verdes.

---

## Phase 3: User Story 1 — etapa como foco principal (Priority: P1) MVP

**Goal**: Convertir la etapa actual en el lienzo principal, preservar todos los
controles de captura y usar guardado manual uniforme.

**Independent Test**: Abrir fixtures de las cuatro fases con agente contraído y
verificar contenido, progreso, edición y guardado en 1440 × 900, 1024 × 768,
390 × 844, 320 px y zoom 200 %.

### Tests first

- [ ] T013 [P] [US1] Escribir pruebas de componente para los cinco campos prioritarios de fase 1, `Contexto y confirmación`, todos los controles de captura de fases 2–4, dirty/manual-save, éxito, error y reintento en `app/features/tasks/components/GuidedPhaseForm.test.ts`. Refs: AC-001, AC-003–AC-005, AC-021, FR-002, FR-008, FR-013–FR-015, FR-022, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T013`
- [ ] T014 [P] [US1] Escribir escenarios E2E rojos de contenido completo por fase, layout stage-first, scroll, 320 px, los cuatro viewports y zoom 200 % en `tests/e2e/stage-agent-workspace.spec.ts`. Refs: AC-001–AC-005, AC-021, FR-002, FR-005–FR-008, FR-013–FR-015, FR-022, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T014`
- [ ] T015 [US1] Ejecutar T013–T014 contra un único servidor inspeccionado y registrar rojo por jerarquía, grouping, guardado y responsive ausentes antes de editar producción. Refs: AC-001–AC-005, AC-021, FR-002, FR-005–FR-008, FR-013–FR-015, FR-022, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T015`

### Minimal implementation

- [ ] T016 [P] [US1] Añadir IDs estables, etiquetas, `aria-describedby` y el grouping de fase 1 sin omitir campos, y preservar controles equivalentes de fases 2–4 en `app/features/tasks/components/OrientationPhase.vue`, `app/features/tasks/components/GuidancePhase.vue`, `app/features/tasks/components/ExecutionPhase.vue` y `app/features/tasks/components/ReviewPhase.vue`. Refs: AC-003–AC-004, AC-021, FR-008, FR-027–FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T016`
- [ ] T017 [US1] Reorganizar progreso, contenido, estado dirty y `Guardar borrador` manual común dentro del canvas en `app/features/tasks/components/GuidedPhaseForm.vue`, retirando el autosave específico de fase 2 pero conservando las escrituras transaccionales de evaluación/propuestas/avance/finalización. Refs: AC-001, AC-003–AC-005, AC-021, FR-002, FR-010, FR-012–FR-015, FR-022–FR-023, FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T017`
- [ ] T018 [US1] Crear el rail contraído accesible y la región estructural base en `app/features/tasks/components/AgentPanel.vue`, con nombre, estado y control de expansión sin superponer el canvas. Refs: AC-001, FR-003–FR-005, FR-027–FR-030, IMG-UX-01. Evidence: `implementation-evidence.md#T018`
- [ ] T019 [US1] Reordenar `app/features/tasks/components/TaskWorkspace.vue` para que una única instancia de `GuidedPhaseForm` sea el contenido principal y el rail de T018 ocupe una región adyacente, sin cambiar reglas de negocio. Refs: AC-001–AC-004, AC-021, FR-002–FR-005, FR-008–FR-009, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T019`
- [ ] T020 [US1] Ejecutar verde de T013–T014 en 1440 × 900, 1024 × 768, 390 × 844, 320 px y zoom 200 %, más regresiones de `GuidedPhaseForm.test.ts` y `guided-workspace.spec.ts`. Refs: AC-001–AC-005, AC-021, FR-002–FR-005, FR-008–FR-009, FR-013–FR-015, FR-022, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T020`
- [ ] T021 [US1] Registrar entradas separadas `VERIFICADO` para T013–T021 y el ledger de campos por fase/breakpoint en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-005, AC-021, FR-002–FR-005, FR-008–FR-009, FR-013–FR-015, FR-022, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T021`

**Checkpoint**: La etapa es usable de forma independiente con el agente
contraído y todos los controles de contenido preservados.

---

## Phase 4: User Story 2 — agente estructural y continuidad (Priority: P1)

**Goal**: Abrir el agente como región estructural, alternar planos en móvil y
conservar chat, formulario, foco y navegación sin duplicados.

**Independent Test**: Enviar y reintentar un mensaje, resolver una propuesta,
alternar/contraer el agente, cambiar breakpoint y comprobar que todo el estado
permanece ligado a la tarea correcta.

### Tests first

- [ ] T022 [P] [US2] Escribir pruebas de componente para rail/panel, `aria-expanded`, Escape, retorno de foco, scroll y estado ocupado en `app/features/tasks/components/AgentPanel.test.ts`. Refs: AC-006–AC-007, AC-010, FR-003–FR-005, FR-020, FR-027–FR-029, IMG-UX-02, IMG-UX-03. Evidence: `implementation-evidence.md#T022`
- [ ] T023 [P] [US2] Escribir pruebas de tabs con teclado, plano único, `inert`, instancia montada y aislamiento por tarea en `app/features/tasks/components/WorkspacePaneTabs.test.ts`. Refs: AC-008, FR-007–FR-009, FR-027–FR-030, IMG-UX-04. Evidence: `implementation-evidence.md#T023`
- [ ] T024 [P] [US2] Ampliar pruebas de conversación/propuestas para borrador, reintento, respuesta tardía, aceptar/editar/descartar y cambio de contexto en `app/features/tasks/components/TaskChat.test.ts` y `app/features/tasks/components/TaskWorkspace.test.ts`. Refs: AC-007, AC-009–AC-010, FR-009, FR-018–FR-020, FR-031, IMG-UX-02, IMG-UX-03. Evidence: `implementation-evidence.md#T024`
- [ ] T025 [US2] Añadir escenarios E2E rojos desktop/tablet/mobile para agente abierto, tabs, scroll independiente, navegación única y continuidad en `tests/e2e/stage-agent-workspace.spec.ts`; ejecutar T022–T025 y registrar las ausencias esperadas. Refs: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-027–FR-031, IMG-UX-02–IMG-UX-04. Evidence: `implementation-evidence.md#T025`

### Minimal implementation

- [ ] T026 [US2] Completar `app/features/tasks/components/AgentPanel.vue` con columna abierta, rail contraído, estado accesible, foco y slots que delegan conversación sin poseer su lógica. Refs: AC-002, AC-006–AC-007, AC-010, FR-003–FR-006, FR-020, FR-027–FR-030, IMG-UX-02, IMG-UX-03. Evidence: `implementation-evidence.md#T026`
- [ ] T027 [P] [US2] Implementar tabs accesibles `Etapa`/`Agente` y semántica de plano inactivo en `app/features/tasks/components/WorkspacePaneTabs.vue`. Refs: AC-008, FR-007–FR-009, FR-027–FR-030, IMG-UX-04. Evidence: `implementation-evidence.md#T027`
- [ ] T028 [US2] Integrar agente, tabs y mapas persistidos manteniendo una única instancia de formulario/chat en `app/features/tasks/components/TaskWorkspace.vue`, con breakpoint desktop ≥1200, tablet 768–1199 y móvil <768. Refs: AC-002, AC-006–AC-010, FR-004–FR-009, FR-018–FR-020, FR-030–FR-031, IMG-UX-02–IMG-UX-04. Evidence: `implementation-evidence.md#T028`
- [ ] T029 [US2] Adaptar `app/features/tasks/components/TaskChat.vue` a su región estructural sin alterar contrato de mensaje/propuesta, preservando compositor, borrador y reintento. Refs: AC-007, AC-009–AC-010, FR-009, FR-018–FR-020, FR-027–FR-030, IMG-UX-02, IMG-UX-03. Evidence: `implementation-evidence.md#T029`
- [ ] T030 [US2] Consolidar `Nueva tarea` en navegación primaria y `Biblioteca`, `Referencias`, `Ajustes` en navegación secundaria, una vez cada uno, en `app/features/tasks/components/DashboardSidebar.vue` y `app/features/tasks/components/WorkspaceHeader.vue`. Refs: AC-022, FR-021, FR-026, FR-027–FR-030, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T030`
- [ ] T031 [US2] Ejecutar verde de T022–T025 y regresiones `conversational-workspace.spec.ts`, `workspace-overlays.spec.ts` y `useWorkspaceState.test.ts` en desktop/tablet/mobile. Refs: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-026–FR-031, IMG-UX-02–IMG-UX-04. Evidence: `implementation-evidence.md#T031`
- [ ] T032 [US2] Registrar entradas separadas `VERIFICADO` para T022–T032 y el ledger de navegación por breakpoint en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-026–FR-031, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T032`

**Checkpoint**: El agente ayuda sin cubrir ni desmontar el trabajo, y cada
destino persistente tiene una sola ubicación.

---

## Phase 5: User Story 3 — acción contextual y bloqueos (Priority: P1)

**Goal**: Mostrar una sola acción primaria derivada del estado real, explicar
bloqueos junto a los campos y eliminar controles duplicados.

**Independent Test**: Recorrer los seis estados de acción, evaluación
desfasada, fallo recuperable y gate rechazado; ningún camino puede avanzar sin
la autorización existente.

### Tests first

- [ ] T033 [P] [US3] Escribir pruebas de componente para issues inline, asociación campo/error, resumen global y recuperación en `app/features/tasks/components/StageFieldIssues.test.ts` y `app/features/tasks/components/EvaluationFeedback.test.ts`. Refs: AC-013–AC-014, FR-015–FR-018, FR-027–FR-029, IMG-UX-05. Evidence: `implementation-evidence.md#T033`
- [ ] T034 [P] [US3] Ampliar `app/features/tasks/components/GuidedPhaseForm.test.ts` con los seis estados, una sola primaria, busy deshabilitado, razones de bloqueo y handlers exactos. Refs: AC-011–AC-016, FR-010–FR-018, FR-023, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T034`
- [ ] T035 [US3] Añadir E2E rojo para evaluar, impedir doble solicitud, reevaluar, continuar, finalizar, reintentar sin pérdida y ausencia de barra `Avanzar` en `tests/e2e/stage-agent-workspace.spec.ts`; ejecutar T033–T035 y registrar rojo esperado. Refs: AC-011–AC-016, FR-010–FR-018, FR-022–FR-023, FR-031, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T035`

### Minimal implementation

- [ ] T036 [P] [US3] Implementar mensajes por control con `aria-describedby`, orden estable y resumen accesible en `app/features/tasks/components/StageFieldIssues.vue`. Refs: AC-013–AC-014, FR-015–FR-018, FR-027–FR-029, IMG-UX-05. Evidence: `implementation-evidence.md#T036`
- [ ] T037 [US3] Convertir `app/features/tasks/components/EvaluationFeedback.vue` en presentación de resultado/causas sin botón primario propio y con recuperación delegada. Refs: AC-013–AC-014, FR-010, FR-015–FR-018, FR-023, IMG-UX-05. Evidence: `implementation-evidence.md#T037`
- [ ] T038 [US3] Integrar el resolver puro y una única acción contextual al final del canvas en `app/features/tasks/components/GuidedPhaseForm.vue`, manteniendo `Guardar borrador` secundaria. Refs: AC-011–AC-016, FR-010–FR-018, FR-022–FR-023, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T038`
- [ ] T039 [US3] Orquestar evaluación, reevaluación, continuación y finalización desde `app/features/tasks/components/TaskWorkspace.vue` reutilizando `performEvaluation`, `requestContinue` y `canAdvanceWithAssistant`, sin segunda fuente de gate. Refs: AC-011–AC-016, FR-010–FR-018, FR-031, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T039`
- [ ] T040 [US3] Eliminar la región `.task-page__status` y su `Avanzar` duplicado, dejando persistencia y autorización intactas, en `pages/tasks/[id].vue`. Refs: AC-016, FR-021–FR-023, FR-031, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T040`
- [ ] T041 [US3] Ejecutar verde de T033–T035 y regresiones de `task-rules.test.ts`, `task-assistant-rules.test.ts`, evaluación, persistencia y avance E2E. Refs: AC-011–AC-016, FR-010–FR-018, FR-022–FR-023, FR-031, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T041`
- [ ] T042 [US3] Registrar entradas separadas `VERIFICADO` para T033–T042 y el ledger completo de estados/handlers/gates en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-011–AC-016, FR-010–FR-018, FR-022–FR-023, FR-031, IMG-UX-01, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T042`

**Checkpoint**: Cada estado tiene exactamente una acción primaria y ningún
bloqueo puede evadir las reglas existentes.

---

## Phase 6: User Story 4 — resumen completado (Priority: P2)

**Goal**: Proyectar un cierre 4/4 de solo lectura, determinista e idempotente,
con retorno claro a tareas.

**Independent Test**: Completar una tarea, comprobar fuentes completas y
parciales, recargar su URL y volver a `/` sin nuevas escrituras ni registros.

### Tests first

- [ ] T043 [P] [US4] Escribir pruebas de componente para progreso 4/4, todos los fallbacks, `No registrado`, orden/deduplicación de registros, única primaria y cero emisiones de escritura en `app/features/tasks/components/TaskCompletionSummary.test.ts`. Refs: AC-017–AC-020, FR-024–FR-026, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T043`
- [ ] T044 [US4] Añadir E2E rojo para finalizar una vez, mostrar resumen, recargar sin duplicados y volver a `/` en `tests/e2e/stage-agent-workspace.spec.ts`. Refs: AC-016–AC-020, FR-011, FR-024–FR-026, FR-031, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T044`
- [ ] T045 [US4] Ejecutar T043–T044 y registrar rojo por resumen/guard completado ausentes antes de editar producción. Refs: AC-016–AC-020, FR-011, FR-024–FR-026, FR-031, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T045`

### Minimal implementation

- [ ] T046 [US4] Implementar la vista 4/4 de solo lectura y `Volver a tareas` en `app/features/tasks/components/TaskCompletionSummary.vue`, consumiendo únicamente `projectCompletionSummary`. Refs: AC-017–AC-019, FR-024–FR-026, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T046`
- [ ] T047 [US4] Renderizar el resumen para tareas completadas, pasar registros existentes y evitar reejecutar finalización/guardado en `app/features/tasks/components/TaskWorkspace.vue` y `pages/tasks/[id].vue`. Refs: AC-016–AC-020, FR-011, FR-024–FR-026, FR-031, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T047`
- [ ] T048 [US4] Ejecutar verde de T043–T044 y regresiones de `task-completion.test.ts`, almacenamiento, rutas/deep links y flujos completados existentes. Refs: AC-016–AC-020, FR-011, FR-024–FR-026, FR-031, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T048`
- [ ] T049 [US4] Registrar entradas separadas `VERIFICADO` para T043–T049, incluyendo conteos de escrituras/registros antes y después de recarga, en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-016–AC-020, FR-011, FR-024–FR-026, FR-031, FR-036–FR-037, IMG-UX-06. Evidence: `implementation-evidence.md#T049`

**Checkpoint**: Una tarea completada se puede leer y abandonar sin mutarla.

---

## Phase 7: Evidencia visual, accesibilidad y cierre

**Purpose**: Probar los seis contratos visuales, compatibilidad, seguridad y
calidad agregada. Las capturas no sustituyen los asserts funcionales.

- [ ] T050 Ejecutar el validador canónico y registrar rutas, IDs y resoluciones aprobadas desde `docs/ux-ui/mockups/rediseño-agente/manifest.md` en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-001, FR-032–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T050`
- [ ] T051 [P] Capturar desktop etapa/agente contraído y agente activo como `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-01.png` y `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-02.png` tras pasar asserts funcionales. Refs: AC-001, AC-006–AC-007, AC-011, AC-022, FR-002–FR-005, FR-010–FR-012, FR-021–FR-023, FR-032–FR-034, IMG-UX-01, IMG-UX-02. Evidence: `implementation-evidence.md#T051`
- [ ] T052 [P] Capturar tablet y móvil como `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-03.png` y `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-04.png` tras pasar asserts de contenido/continuidad. Refs: AC-002–AC-004, AC-008, AC-021–AC-022, FR-006–FR-009, FR-021, FR-030, FR-032–FR-035, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T052`
- [ ] T053 [P] Capturar bloqueo y resumen como `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-05.png` y `specs/008-stage-agent-workspace/evidence/actual/ACTUAL-IMG-UX-06.png` tras pasar asserts de gate/idempotencia. Refs: AC-013–AC-020, AC-022, FR-015–FR-018, FR-024–FR-026, FR-032–FR-037, IMG-UX-05, IMG-UX-06. Evidence: `implementation-evidence.md#T053`
- [ ] T054 Comparar los seis pares referencia/actual y clasificar geometría, jerarquía, contenido, interacción y responsive como aprobada, pendiente o defecto con responsable en `specs/008-stage-agent-workspace/evidence/visual-comparison.md`. Refs: AC-001–AC-022, FR-032–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T054`
- [ ] T055 Ejecutar teclado, foco, Escape/retorno, nombres accesibles, `inert`, zoom 200 % y medición de contraste 4.5:1/3:1; documentar resultados por selector y viewport en `specs/008-stage-agent-workspace/evidence/accessibility.md`. Refs: AC-001–AC-022, FR-015, FR-020, FR-027–FR-030, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T055`
- [ ] T056 Verificar el ledger de todos los datos y controles de captura de fases 1–4 en 1440 × 900, 1024 × 768, 390 × 844 y 320 px, documentándolo en `specs/008-stage-agent-workspace/evidence/phase-controls.md`. Refs: AC-003–AC-005, AC-021, FR-008, FR-013–FR-015, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04. Evidence: `implementation-evidence.md#T056`
- [ ] T057 Ejecutar las suites focalizadas enumeradas en `specs/008-stage-agent-workspace/quickstart.md` y registrar comando/resultado real por suite en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-001–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T057`
- [ ] T058 Ejecutar `npm run verify`, corregir solo regresiones dentro de 008 y registrar resultado agregado y alcance no cubierto en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-002–FR-031, FR-035–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T058`
- [ ] T059 Inspeccionar que exista un único servidor actual, ejecutar `TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e` y registrar HTML/branch/puerto y resultado en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-002–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T059`
- [ ] T060 Ejecutar `npm run structure:check` y `npm run graph:check`; si cambian relaciones permitidas, actualizar solo evidencia arquitectónica generada mediante el workflow del proyecto y registrarla en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-031, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T060`
- [ ] T061 Verificar regresión explícita de `/legacy`, `/`, `/tasks/:id`, `/tasks/new`, `/library`, `/library/:id`, Referencias y Ajustes en `tests/e2e/nuxt-task-workflows.spec.ts`, `tests/e2e/legacy-phase-workflows.spec.ts` y `tests/e2e/workspace-overlays.spec.ts`. Refs: AC-019, AC-022, FR-021, FR-025–FR-026, FR-031, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T061`
- [ ] T062 Realizar el protocolo con cinco adultos familiarizados con web y nuevos en el producto, registrar tiempos, ayuda y éxito individual sin sustituir evidencia automatizada en `specs/008-stage-agent-workspace/evidence/usability-study.md`, y mantener abierto si no se ejecuta. Refs: AC-003, AC-008, AC-013, AC-019, FR-027–FR-030, IMG-UX-04–IMG-UX-06. Evidence: `implementation-evidence.md#T062`
- [ ] T063 Lanzar una revisión independiente del patch completo, resolver hallazgos P0/P1 dentro del alcance y registrar hallazgos/riesgos aceptados en `specs/008-stage-agent-workspace/evidence/independent-review.md`. Refs: AC-001–AC-022, FR-001–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T063`
- [ ] T064 Revisar el diff para excluir `.env*`, credenciales, bases de datos, caches, temporales y borradores visuales reemplazados; registrar los paths inspeccionados en `specs/008-stage-agent-workspace/evidence/safety-review.md`. Refs: AC-001–AC-022, FR-001, FR-031–FR-034, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T064`
- [ ] T065 Consolidar una entrada final por cada T001–T065, dejar abiertas las tareas no `VERIFICADO` y resumir AC/FR/IMG pendientes en `specs/008-stage-agent-workspace/implementation-evidence.md`. Refs: AC-001–AC-022, FR-001–FR-037, IMG-UX-01–IMG-UX-06. Evidence: `implementation-evidence.md#T065`

---

## Dependencies and execution order

### Phase dependencies

- **Phase 1** inicia de inmediato.
- **Phase 2** depende de Phase 1 y bloquea todas las historias.
- **US1** depende de Foundation y entrega el MVP stage-first.
- **US2** depende del rail/layout de US1 para integrar agente y tabs.
- **US3** depende del resolver de Foundation y del canvas de US1; puede
  desarrollar T033/T036 en paralelo con US2, pero T038–T041 requieren US1.
- **US4** depende del resolver de Foundation y la acción `finish` de US3.
- **Phase 7** depende de todas las historias seleccionadas. T062 es
  exclusivamente humana y permanece abierta si el estudio no ocurre.

### User story dependency graph

```text
Setup -> Foundation -> US1 -> US2 ───────────┐
                         └-> US3 -> US4      ├-> Phase 7
```

### Within each behavior block

- Escribir happy path, límites, entrada inválida, fallo/recuperación y
  regresiones relevantes antes de producción.
- Ejecutar el test nuevo y confirmar el rojo por comportamiento ausente.
- Implementar el cambio mínimo.
- Ejecutar verde focalizado y regresiones afectadas.
- Registrar evidencia individual `VERIFICADO` antes de marcar una casilla.
- Una evidencia `PARCIAL`, `BLOQUEADO` o `NO VERIFICADO` deja la tarea abierta.

### Parallel opportunities

- T002 y T003 usan archivos distintos.
- T006 y T007 son pruebas independientes.
- T013 y T014 pueden escribirse en paralelo.
- T016 puede avanzar en los cuatro componentes de fase mientras T018 trabaja
  sobre el rail, después del rojo de T015.
- T022–T024 pueden escribirse en paralelo.
- T026 y T027 modifican componentes distintos, después del rojo de T025.
- T033 y T034 pueden escribirse en paralelo.
- T036 puede implementarse en paralelo con preparación no integradora de US2.
- T051–T053 capturan estados distintos después de los gates funcionales.

---

## Implementation strategy

### MVP first

1. Completar Setup.
2. Completar Foundation.
3. Completar US1.
4. Detenerse y validar US1 en los cuatro viewports y zoom.
5. No presentar US1 como cierre visual completo hasta integrar US2–US4.

### Incremental delivery

1. Setup + Foundation → contratos y continuidad listos.
2. US1 → etapa usable y guardado uniforme.
3. US2 → agente estructural y navegación sin duplicados.
4. US3 → acción contextual y bloqueos seguros.
5. US4 → cierre 4/4 idempotente.
6. Phase 7 → evidencia visual, accesibilidad, regresiones y revisión.

### Stop conditions

- Un test nuevo que no falla por el comportamiento ausente no autoriza
  implementación.
- Un gate existente que deba cambiar requiere volver a especificación; no se
  ajusta silenciosamente desde UI.
- Una referencia visual ausente o no canónica bloquea solo su captura, no
  autoriza usar un borrador.
- Ninguna tarea se marca completa por código o captura sin evidencia
  `VERIFICADO`.
