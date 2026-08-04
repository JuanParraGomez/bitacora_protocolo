---

description: "Task list for workspace shell and navigation (spec 011)"
---

# Tasks: Shell y navegación del workspace

**Input**: Design documents from `/specs/011-workspace-shell/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/visual-acceptance.md`, `quickstart.md`, spec 010 aprobada/versionada.

**Tests**: OBLIGATORIOS y test-first. Cada comportamiento registra rojo esperado
antes de código, verde enfocado, regresión y alcance no verificado.

**Evidence**: `.codex-autopilot/evidence/` y `.codex-autopilot/reports/` durante
ejecución. Solo una entrada individual `verified` con comando/procedimiento,
fecha, exit code, rojo, verde, regresión, diff y AC permite marcar una tarea
`[x]`. La sincronización a `implementation-evidence.md` y
`evidence/visual-comparison.md` es una tarea humana post-autopilot.

**Scope boundary**: frontend shell solamente. Prohibido cambiar `server/`,
`shared/`, esquemas, persistencia, rutas o contenido de specs 012/013/014/016.

## Phase 1: Setup and external prerequisite

**Purpose**: asegurar que el contrato visual es ejecutable y que la evidencia
no mezcla el trabajo no versionado de otra feature.

- [x] T001 Tarea humana: aprobar explícitamente la spec 011 y seleccionar/autorizar la revisión exacta y operación Git de spec 010 que podrá integrarse; mantener abierta y devolver `HUMAN_DECISION_REQUIRED` mientras `spec.md` siga `Draft` o no exista autorización. Refs: FR-017, AC-008, IMG-UX-01…06
- [x] T002 Tras T001, integrar únicamente la revisión Git autorizada de spec 010 en `codex/011-workspace-shell` y verificar que aporta `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`, helpers `tests/e2e/helpers/visual-*.ts`, 24 snapshots, `@axe-core/playwright` y scripts `test:visual*`; no copiar trabajo no versionado. Refs: FR-017, AC-008, IMG-UX-01…06
- [ ] T003 Inicializar checkpoint 011 en `.codex-autopilot/state.json`, inventariar/hashear las 24 baselines aprobadas de `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/`, confirmar cuatro viewports y registrar que mockups y baselines son distintos. Refs: FR-015, FR-017, AC-005, AC-008, IMG-UX-01…06

**Checkpoint**: no iniciar pruebas ni código 011 hasta T001–T003 verificadas.

---

## Phase 2: Foundational test-first contracts

**Purpose**: crear todos los rojos observables antes de cambiar producción.

- [x] T004 [P] Capa A ROJA: crear `app/features/tasks/components/DashboardSidebar.test.ts` con orden de regiones, iconos/control con nombre accesible, activo, buscador/⌘K, carpetas/tareas, footer, ausencia de duplicados, proyecto vacío, búsqueda sin hits, create/rename válido e inválido; ejecutar Vitest y registrar fallo por contrato 011 ausente. Refs: FR-001…FR-007, AC-001, AC-003, IMG-UX-01/02/05/06
- [x] T005 [P] Capa A ROJA: crear `app/features/tasks/components/WorkspaceHeader.test.ts` con breadcrumb proyecto/tarea, chip Etapa 1 y 4 de 4, subtítulo, nombres largos, hamburger+logo compactos y nombres accesibles; ejecutar Vitest y registrar rojo esperado. Refs: FR-008…FR-010, FR-012, AC-002, AC-004, IMG-UX-01/02/04/05/06
- [x] T006 [P] Capa A ROJA: crear `app/features/tasks/components/workspace-shell-presentation.test.ts` para límites 1025/1024 y 768/767, valores inválidos y modos desktop/tablet/mobile; registrar rojo esperado por helper inexistente. Refs: FR-011…FR-013, AC-004, IMG-UX-03/04
- [ ] T007 Capa funcional ROJA: ampliar primero `tests/e2e/conversational-workspace.spec.ts` y `tests/e2e/workspace-ux-audit.spec.ts` con shell 011, destinos únicos, footer, drawer cerrado a 1024×768 y header móvil a 390×844; ejecutar serial y registrar fallos esperados sin tocar producción. Refs: FR-003…FR-013, AC-001…AC-004, IMG-UX-03/04
- [ ] T008 Capa B ROJA: ampliar primero `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` con aserciones de regiones/orden/nombres del shell, destinos únicos y contraste estricto normal/hover/activo para IMG-UX-01/02/05/06 × 4 viewports; ejecutar contra baselines aprobadas y registrar fallos atribuibles al shell anterior. Refs: FR-001…FR-017, AC-003, AC-005, AC-006, IMG-UX-01/02/05/06

**Checkpoint**: grupo TDD compuesto `PHASE_AWAITING_TDD_GREEN`; los rojos de
T004–T008 permanecen abiertos hasta completar US1–US3.

---

## Phase 3: User Story 1 — Navegar tareas sin duplicados (Priority: P1) 🎯 MVP

**Goal**: sidebar desktop con jerarquía del mockup, datos/acciones existentes y
una aparición por destino.

**Independent Test**: `DashboardSidebar.test.ts` verde y regresión funcional de
búsqueda/create/rename/select/rutas verde, sin depender del nuevo header.

- [x] T009 [P] [US1] Crear `app/features/tasks/components/WorkspaceShellIcon.vue` con conjunto SVG cerrado para Tareas, Biblioteca, Referencias, Ajustes, Buscar, Carpeta, Chevron, Más y usuario; heredar `currentColor`, ocultar SVG decorativo al árbol accesible y cubrirlo desde `DashboardSidebar.test.ts`. Refs: FR-002, FR-004, AC-001, IMG-UX-01/02/05/06
- [x] T010 [US1] Reestructurar `app/features/tasks/components/DashboardSidebar.vue` en marca → navegación vertical → búsqueda “Buscar tareas o proyectos…” + ⌘K → PROYECTOS como carpetas/tareas anidadas → footer de identidad, manteniendo props/emits y búsqueda actual. Refs: FR-001…FR-006, AC-001, IMG-UX-01/02/05/06
- [x] T011 [US1] Ajustar en `app/features/tasks/components/DashboardSidebar.vue` estados active/hover/focus, acciones compactas create/rename, proyecto vacío/sin hits y conteo DOM para que Nueva tarea, Biblioteca y Ajustes aparezcan una vez; no usar jerarquía primaria para utilidades. Refs: FR-005, FR-007, FR-014, AC-003, IMG-UX-01/02/05/06
- [ ] T012 [US1] Ejecutar y reparar hasta verde `DashboardSidebar.test.ts`, `tests/e2e/conversational-workspace.spec.ts` (búsqueda/create/rename/select) y regresiones `useTaskIndex`/`useWorkspaceState`; registrar conteos, exit codes y alcance en `.codex-autopilot/evidence/phase-us1.json`. Refs: FR-003…FR-007, FR-016, AC-001, AC-003

**Checkpoint**: US1 independiente y verde; T004/T007 parcialmente satisfechas.

---

## Phase 4: User Story 2 — Entender el contexto de la tarea (Priority: P1)

**Goal**: header con breadcrumb, chip verde y subtítulo sin destinos duplicados.

**Independent Test**: `WorkspaceHeader.test.ts` verde para fases 1/4 y contexto
largo; E2E presenta proyecto/tarea correctos sin cambiar ruta ni progreso.

- [x] T013 [US2] Reestructurar `app/features/tasks/components/WorkspaceHeader.vue` con breadcrumb semántico `proyecto / tarea`, chip verde `Etapa N de 4` y subtítulo de fase, conservando props, emisiones, `focusNavigation()` y `data-focus-target`. Refs: FR-008…FR-010, AC-002, IMG-UX-01/02/05/06
- [x] T014 [US2] Implementar en `app/features/tasks/components/WorkspaceHeader.vue` la variante compacta con hamburguesa, logo Nexus y breadcrumb, sin duplicar navegación; resolver truncado/wrap de nombres largos y contraste de chip/foco. Refs: FR-012, FR-013, AC-002, AC-004, IMG-UX-03/04
- [ ] T015 [US2] Ejecutar y reparar hasta verde `WorkspaceHeader.test.ts`, pruebas de integración de `TaskWorkspace.test.ts` y escenarios E2E de fase 1/4; registrar en `.codex-autopilot/evidence/phase-us2.json` que número/título provienen de datos existentes. Refs: FR-008…FR-010, FR-016, AC-002

**Checkpoint**: US2 independiente y verde; T005 satisfecha.

---

## Phase 5: User Story 3 — Navegar en tablet y móvil (Priority: P2)

**Goal**: 1024 usa drawer cerrado y 390/320 usan header compacto con foco seguro.

**Independent Test**: helper verde en límites y Playwright serial demuestra
drawer cerrado inicialmente, hamburguesa, Escape/Tab/selección y cero overflow.

- [x] T016 [US3] Implementar `app/features/tasks/components/workspace-shell-presentation.ts` con breakpoints inclusivos desktop >1024, tablet 768–1024, mobile ≤767 y constantes de media query, hasta verde T006. Refs: FR-011…FR-013, AC-004, IMG-UX-03/04
- [x] T017 [US3] Sustituir límites duplicados de JS/CSS en `app/features/tasks/components/TaskWorkspace.vue` por el contrato compartido e incluir exactamente 1024px en modo compacto, conservando drawer, `inert`, trap de foco y eventos. Refs: FR-011, FR-013, FR-016, AC-004, IMG-UX-03
- [x] T018 [US3] Alinear `pages/index.vue` con el mismo contrato responsive sin mover persistencia, `lastActiveTaskId`, create/rename ni navegación; conservar una sola instancia visible del sidebar. Refs: FR-011…FR-013, FR-016, AC-004, IMG-UX-03/04
- [ ] T019 [US3] Ejecutar y reparar hasta verde `workspace-shell-presentation.test.ts`, `workspace-ux-audit.spec.ts`, drawer de `conversational-workspace.spec.ts` y `workspace-overlays.spec.ts` en serie; registrar foco, Escape/Tab y viewports en `.codex-autopilot/evidence/phase-us3.json`. Refs: FR-011…FR-013, AC-004, IMG-UX-03/04

**Checkpoint**: US3 verde; T006/T007 satisfechas y todos los rojos Capa A deben cerrar.

---

## Phase 6: Visual, accessibility and evidence closure

**Purpose**: cerrar el grupo TDD Capa B sin confundir baseline y mockup.

- [ ] T020 Ejecutar `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual` tras US1–US3; exigir subgates de semántica/geometría/destinos/primaria/contraste verdes y resultado global rojo exclusivamente por diffs de snapshots esperados contra baselines anteriores. Refs: FR-014, FR-015, AC-003, AC-005, AC-006, IMG-UX-01/02/05/06
- [ ] T021 Generar snapshots candidatos solo con `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update`, guardar ACTUAL de IMG-UX-01/02/05/06 × 4 viewports en `.codex-autopilot/evidence/actual/` y demostrar que mockups no fueron usados como baselines. Refs: FR-015, FR-017, AC-005, AC-008
- [ ] T022 Revisar humanamente y aprobar/rechazar el diff de las 16 baselines candidatas; mantener la tarea abierta y el cierre bloqueado hasta decisión explícita del usuario. Refs: FR-017, AC-008, IMG-UX-01/02/05/06
- [ ] T023 Tras T022 aprobada, repetir `npm run test:visual` verde idempotente y ejecutar defectos sembrados de snapshot/geometría/contraste para demostrar fallo por escenario/viewport; revertir cada defecto y registrar exit codes. Refs: FR-014, FR-017, AC-005, AC-006, AC-008
- [ ] T024 Crear `.codex-autopilot/reports/visual-comparison.md` con ACTUAL vs IMG-UX-01/02/05/06 por navegación/header, clasificación aprobada/pendiente/defecto y enlaces a los 16 artefactos operativos. Refs: FR-015, AC-007, IMG-UX-01/02/05/06

**Checkpoint**: T008 y Capa B solo cierran con T022 aprobada y T023 verde.

---

## Phase 7: Polish & cross-cutting verification

- [ ] T025 Ejecutar Capa A/regresión enfocada completa: Vitest de sidebar/header/helper/TaskWorkspace/useTaskIndex/useWorkspaceState y registrar conteo + exit code en `.codex-autopilot/evidence/phase-final.json`. Refs: AC-001…AC-004
- [ ] T026 Ejecutar serialmente `npm run typecheck`, `npm run verify:e2e` y `npm run test:visual`; registrar conteos, exit codes, fallos preexistentes vs nuevos y no marcar si queda una regresión 011. Refs: FR-016, FR-017, AC-005, AC-006, AC-008
- [ ] T027 Ejecutar `npm run verify`, registrar cada subgate y aislar cualquier ruido generado de estructura/Graphify antes de atribuirlo a 011. Refs: FR-016, AC-001…AC-008
- [ ] T028 Realizar revisión independiente del patch, corregir P0/P1 con TDD y registrar hallazgos/resolución o riesgo aceptado en `.codex-autopilot/reports/final-review.md`. Refs: AC-001…AC-008
- [ ] T029 Auditar diff sensible: cero `.env`, secretos, SQLite, caches, temporales o artefactos ajenos; confirmar que no cambian `server/`, `shared/`, rutas, modelos ni persistencia. Refs: FR-016
- [ ] T030 Ejecutar `graphify update .`, verificar `git diff --check`, sincronizar inmediatamente cada tarea VERIFICADA en este `tasks.md` y redactar `.codex-autopilot/reports/final.md` con tareas humanas/pendientes explícitas. Refs: AC-001…AC-008
- [ ] T031 Tarea humana post-autopilot: con autorización explícita, sanear y sincronizar `.codex-autopilot/evidence/` y `.codex-autopilot/reports/visual-comparison.md` hacia `specs/011-workspace-shell/implementation-evidence.md`, `specs/011-workspace-shell/evidence/actual/` y `specs/011-workspace-shell/evidence/visual-comparison.md`; verificar que solo cambia evidencia prevista. Refs: AC-001…AC-008, IMG-UX-01/02/05/06

---

## Dependencies & Execution Order

- Phase 1 bloquea todo. T001 es aprobación humana; T002 es la única operación
  Git permitida y requiere esa autorización exacta.
- T004, T005 y T006 pueden escribirse en paralelo; las corridas Playwright T007
  y T008 son seriales por SQLite/servidor/snapshots compartidos.
- US1 y US2 son incrementos P1 independientes tras los rojos; US3 depende del
  contrato de header/sidebar pero no de su estilo exacto.
- Phase 6 depende de US1–US3. T022 es humana y bloquea T023/cierre.
- Phase 7 depende de todas las tareas automatizables y de T022 para afirmar
  cierre visual. T031 permanece humana y bloquea el cierre documental total.

## Parallel Opportunities

- T004 ∥ T005 ∥ T006: archivos de test distintos.
- T009 puede prepararse en archivo propio mientras T013 trabaja en header, pero
  nunca con dos escritores simultáneos en el mismo checkout.
- Revisión de contrato y diff sensible pueden investigar en paralelo al final;
  las pruebas E2E/visuales permanecen seriales.

## Implementation Strategy

1. Satisfacer spec 010 y crear evidencia.
2. Escribir todos los rojos Capa A/funcional/visual.
3. Entregar US1 como MVP de navegación.
4. Entregar US2 de contexto.
5. Entregar US3 responsive.
6. Obtener aprobación humana de baselines y completar Capa B/C.
7. Ejecutar gates agregados, revisión y sincronización del ledger.

## Format Validation

Todas las tareas usan `- [ ] Txxx`, `[P]` solo cuando archivos/estado no se
comparten y `[USn]` únicamente en fases de historias. Cada tarea tiene ruta o
comando concreto y referencias FR/AC/IMG aplicables.
