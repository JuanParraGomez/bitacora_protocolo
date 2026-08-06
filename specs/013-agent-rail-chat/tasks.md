# Tasks: Agente como rail contraíble con chat

**Input**: Design documents from `/specs/013-agent-rail-chat/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md),
[visual-acceptance.md](contracts/visual-acceptance.md), [quickstart.md](quickstart.md)

**Tests**: obligatorios y test-first. Cada bloque productivo depende de un rojo
válido por comportamiento 013 ausente; fallos de import, fixture, servidor o
storage no cuentan. Registrar comando, conteo, exit code y causa/veredicto en
`implementation-evidence.md` inmediatamente después de ejecutar evidencia.

**Organization**: tareas agrupadas por historia. `[P]` significa archivos
independientes después de satisfacer dependencias; no autoriza saltarse el orden
TDD ni ejecutar varias tareas Spec Kit en un mismo hilo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizable sin compartir archivos ni depender de cambio pendiente.
- **[USn]**: historia de usuario trazada a `spec.md`.
- Cada tarea nombra paths, AC/FR y referencias visuales exactas.

---

## Phase 1: Setup y gates de procedencia

**Purpose**: obtener autorización de implementación, aislar la rama y preservar
la infraestructura/baselines antes de pruebas o producto.

- [X] T001 Obtener orden explícita de implementación y registrarla con fecha/alcance en `specs/013-agent-rail-chat/implementation-evidence.md`; hasta recibirla, detener en `HUMAN_DECISION_REQUIRED` sin tocar producto ni marcar T002+ (Refs: todas AC/FR; IMG-UX-01/02/03)
- [X] T002 Verificar rama `codex/013-agent-rail-chat`, upstream homónimo, ascendencia desde `codex/012-stage-canvas-form` y presencia versionada de specs 010–012; registrar comandos/commits en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Dependencies; FR-019–FR-022)
- [X] T003 [P] Inventariar y hashear las 24 baselines bajo `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/`, registrando plataforma y manifiesto previo en `specs/013-agent-rail-chat/implementation-evidence.md` sin ejecutar update (Refs: SC-008–SC-009)
- [X] T004 [P] Crear `specs/013-agent-rail-chat/evidence/visual-comparison.md` y `specs/013-agent-rail-chat/evidence/actual/.gitkeep` con ocho ACTUAL IMG-UX-01/02 × cuatro viewports, seis dimensiones, clasificación, severidad, owner y decisión humana vacíos (Refs: FR-020, FR-022; IMG-UX-01/02/03)
- [X] T005 [P] Registrar en `specs/013-agent-rail-chat/implementation-evidence.md` el inventario de fixtures/selectores existentes y las exclusiones explícitas de backend, dominio, pipeline, adjuntos, spec 014 y spec 015 (Refs: FR-018–FR-019)
- [X] T006 Revisar `git status` y staged/untracked scope; documentar en `specs/013-agent-rail-chat/implementation-evidence.md` la exclusión de SQLite, `graphify-out/`, caches, resultados temporales y cambios ajenos antes de iniciar Capa A (Refs: Constitution II/V)

**Checkpoint**: autorización, rama, procedencia y baselines intactas.

---

## Phase 2: Foundational — fixtures, medición y baseline funcional

**Purpose**: preparar datos deterministas y helpers de medición antes de escribir
pruebas de historias, sin cambiar producto.

- [X] T007 [P] Escribir tests de ancho máximo/porcentaje, contención y cambio independiente de scroll en `tests/e2e/helpers/visual-geometry.test.ts`, confirmando rojo por helpers ausentes (Refs: AC-001, AC-019–AC-020; FR-001, FR-015; IMG-UX-01/03)
- [X] T008 Implementar el cambio mínimo de medición reutilizable en `tests/e2e/helpers/visual-geometry.ts` y llevar T007 a verde, sin incluir selectores de producto en el helper puro (Refs: FR-001, FR-015; depende de T007)
- [X] T009 [P] Añadir fixtures deterministas aditivos para ambos roles, empate de hora, texto vacío, propuestas 0/1/N, valor largo, edición inválida, error/reintento y conversación larga en `tests/fixtures/tasks/stage-agent-workspace.ts` (Refs: AC-005, AC-008–AC-020; FR-008–FR-015)
- [X] T010 [P] Escribir tests RED en `tests/e2e/helpers/visual-capture.test.ts` para modos `contract|evidence|baseline`, root 013, máscaras/opciones deterministas y ocho rutas canónicas, demostrando que `contract/evidence` no actualizan baselines (Refs: FR-020, FR-022; IMG-UX-01/02)
- [X] T011 Implementar los modos y opciones mínimas en `tests/e2e/helpers/visual-capture.ts`, llevar T007–T010 a verde y registrar comando/conteo/exit code en `specs/013-agent-rail-chat/implementation-evidence.md`; no ejecutar Playwright ni snapshots (Refs: Validation Capa B; depende de T010)
- [X] T012 Ejecutar y registrar la baseline previa de `AgentPanel.test.ts`, `TaskChat.test.ts`, `TaskWorkspace.test.ts`, `useWorkspaceState.test.ts` y `task-assistant-rules.test.ts` en `specs/013-agent-rail-chat/implementation-evidence.md`, distinguiendo deuda previa de trabajo 013 (Refs: Constitution I; FR-005, FR-011, FR-014)

**Checkpoint**: fixtures y medición listos; cero cambio de producto.

---

## Phase 3: User Story 1 — Recuperar el lienzo con rail (Priority: P1) 🎯 MVP

**Goal**: estado default contraído, rail ≤7rem/12 %, identidad/chevron/badge y
preferencia aislada por tarea, sin placeholder ni columna residual.

**Independent Test**: abrir tareas A/B con preferencias y pendientes distintos;
medir rail, alternar, recargar y confirmar lienzo liberado, badge exacto y móvil intacto.

### Tests RED para User Story 1

- [X] T013 [P] [US1] Añadir en `app/features/tasks/components/AgentPanel.test.ts` rail contraído, `Agente IA`, sparkle, `Expandir agente IA`, aria-expanded/controls, ausencia de placeholder/content tabulable y badge 0/1/N/dos dígitos (Refs: AC-001–AC-005; FR-001–FR-004, FR-012, FR-016; IMG-UX-01/05)
- [X] T014 [P] [US1] Añadir en `app/features/tasks/components/TaskWorkspace.test.ts` default contraído incluso con fase 1/mensajes/draft, payload task-local de toggle y conteo filtrado por task+phase+`proposed`; completar regresión de aislamiento/corrupción/reset en `app/features/tasks/composables/useWorkspaceState.test.ts` solo si falta (Refs: AC-004–AC-005; FR-005, FR-012)
- [X] T015 [US1] Añadir en `tests/e2e/stage-agent-workspace.spec.ts` flujo A/B/reload y en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` selectores/mediciones RED para `data-agent-state=collapsed`, ≤7rem/12 %, cero placeholder, lienzo↔rail, badge y una primaria solo en ≥768; en móvil IMG-UX-01 valida pane Etapa/tabs/overflow sin exigir rail (Refs: AC-001–AC-005; FR-001–FR-005, FR-012, FR-017–FR-018, FR-021; IMG-UX-01)
- [X] T016 [US1] Ejecutar T013–T015 antes de producto, confirmar rojo exclusivamente por rail/default/badge 013 ausentes y registrar comando, conteo, exit code y causas en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Validation Capa A/B)

### Implementación mínima para User Story 1

- [X] T017 [US1] Recomponer el estado contraído en `app/features/tasks/components/AgentPanel.vue`: `data-agent-state`, marca/sparkle/chevron, nombres exactos, badge accesible, contenido montado pero oculto fuera de layout/tab order y eliminación de placeholder (Refs: FR-001–FR-004, FR-012, FR-016; depende de T016; IMG-UX-01/05)
- [X] T018 [US1] Actualizar `app/features/tasks/components/TaskWorkspace.vue` para retirar apertura heurística, usar preferencia/default existentes, derivar pendientes de `phaseMessages`, pasar el conteo y aplicar grid rail ≤7rem/12 % en ≥768 sin tocar tabs móviles (Refs: FR-003, FR-005, FR-012, FR-017–FR-019; depende de T016; IMG-UX-01)
- [X] T019 [US1] Ejecutar T013–T014 más regresiones de `useWorkspaceState` y corregir solo producto 013 hasta verde; registrar evidencia real en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-001–SC-002, SC-005)
- [X] T020 [US1] Ejecutar T015 serial contra un único `TEST_BASE_URL`, exigir rail/lienzo/badge/persistencia verdes en desktop/tablet y continuidad Etapa/tabs/overflow en móvil, registrando resultado en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-001–SC-002, SC-005, SC-008)

**Checkpoint**: MVP — rail compacto y estado por tarea; chat expandido aún conserva presentación previa.

---

## Phase 4: User Story 2 — Conversar en columna estructural (Priority: P1)

**Goal**: header normativo, mensajes de ambos roles con identidad/hora/avatar,
orden estable y contexto preservado al contraer.

**Independent Test**: expandir una tarea con conversación de ambos roles,
empate de hora y mensaje vacío; verificar columna, orden, identidad, foco y conservación.

### Tests RED para User Story 2

- [X] T021 [P] [US2] Ampliar `app/features/tasks/components/AgentPanel.test.ts` con header expandido exacto, `Contraer agente IA`, región busy, Escape/retorno de foco y contenido conservado tras contraer/expandir (Refs: AC-006–AC-007, AC-010; FR-006–FR-007, FR-016; IMG-UX-02)
- [X] T022 [P] [US2] Ampliar `app/features/tasks/components/TaskChat.test.ts` con agent/user avatar+nombre+hora, user alineado a derecha, orden cronológico estable en empate, distinción no solo por color y ausencia de burbuja vacía (Refs: AC-008–AC-009; FR-008–FR-009, FR-016; IMG-UX-02)
- [X] T023 [US2] Añadir en `app/features/tasks/components/TaskWorkspace.test.ts`, `tests/e2e/stage-agent-workspace.spec.ts` y `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` columna hermana no overlay en ≥768, conversación/estado/draft/ancla y una primaria; sembrar `mobilePaneByTask=agent` para IMG-UX-02 en ≤767 y validar su pane Agente sin exigir dos columnas (Refs: AC-006–AC-011; FR-006–FR-009, FR-017–FR-018, FR-021; IMG-UX-02)
- [X] T024 [US2] Ejecutar T021–T023 antes de producto, confirmar rojo por header/mensajes/columna 013 ausentes y registrar evidencia en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Validation Capa A/B)

### Implementación mínima para User Story 2

- [X] T025 [US2] Implementar header expandido y estilos de columna/foco en `app/features/tasks/components/AgentPanel.vue`, preservando forwarding, busy, Escape y `v-show` del chat (Refs: FR-006–FR-007, FR-016; depende de T024; IMG-UX-02)
- [X] T026 [US2] Actualizar presentación en `app/features/tasks/components/TaskChat.vue` para identidad/avatar/hora de ambos roles, alineación user, desempate estable y filtrado de burbujas vacías, sin cambiar `AssistantMessage` (Refs: FR-008–FR-009; depende de T024; IMG-UX-02)
- [X] T027 [US2] Ajustar grid expandido y estados observables en `app/features/tasks/components/TaskWorkspace.vue` para columna contigua en ≥768 y acciones chat secundarias, sin cambiar envío/decisiones (Refs: FR-006, FR-017–FR-019, FR-021; depende de T024; IMG-UX-02)
- [X] T028 [US2] Ejecutar T021–T023 y regresiones US1 hasta verde, confirmando conversación/contexto/foco/primaria única; registrar conteos y exit codes en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-002–SC-003, SC-008)

**Checkpoint**: rail y columna conversacional funcionan sin propuestas rediseñadas.

---

## Phase 5: User Story 3 — Resolver propuestas dentro del chat (Priority: P1)

**Goal**: tarjeta completa y exactamente tres decisiones; valor inválido queda
pendiente y cada decisión actualiza el badge mediante el pipeline existente.

**Independent Test**: ejecutar accept/edit válido/edit inválido/reject sobre
fixtures resembrados y comprobar campo, estado, alerta, badge e idempotencia.

### Tests RED para User Story 3

- [X] T029 [P] [US3] Ampliar `app/features/tasks/components/TaskChat.test.ts` con título `Propuesta para <campo>`, valor largo completo, exactamente tres acciones, accept/edit/reject tipados, edit inválido sin emit con alerta/valor conservado y wrap sin overflow (Refs: AC-012–AC-016; FR-010–FR-011, FR-016; IMG-UX-02)
- [X] T030 [P] [US3] Ampliar `app/features/tasks/components/TaskWorkspace.test.ts` con wiring a `handleProposalDecision`, badge N→N-1→0, filtro de resueltas/otra fase, conflicto vigente, reject no muta y tarea completada read-only (Refs: AC-013–AC-016; FR-011–FR-012, FR-019; IMG-UX-02/05)
- [X] T031 [US3] Añadir en `tests/e2e/stage-agent-workspace.spec.ts` flujos independientes accept/edit válido/edit inválido/reject y en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` tarjeta/acciones secundarias/badge/valor completo sin solape (Refs: AC-012–AC-016; FR-010–FR-012, FR-017, FR-021; IMG-UX-02)
- [X] T032 [US3] Ejecutar T029–T031 antes de producto, confirmar rojo por contrato visual/validación 013 ausente y registrar causa exacta en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Validation Capa A/B)

### Implementación mínima para User Story 3

- [X] T033 [US3] Actualizar `app/features/tasks/components/TaskChat.vue` para título normativo, valor completo con wrap y exactamente tres acciones secundarias, sin alterar los payloads de decisión existentes (Refs: FR-010–FR-011, FR-016; depende de T032; IMG-UX-02)
- [X] T034 [US3] Añadir en `app/features/tasks/components/TaskChat.vue` validación de edición con `formUpdateSchema` antes de emitir, conservando draft/error y propuesta pendiente ante valor inválido; no modificar `TaskWorkspace.vue` ni rules para acomodar el caso (Refs: FR-011–FR-012, FR-019; depende de T033; IMG-UX-02/05)
- [X] T035 [US3] Ejecutar T029–T030 junto con `app/features/tasks/domain/task-assistant-rules.test.ts`, exigir verde para accept/edit/reject/contexto/revisión/idempotencia y registrar evidencia sin modificar dominio (Refs: SC-004–SC-005)
- [X] T036 [US3] Ejecutar T031 serial con storage resembrado por decisión, corregir solo integración frontend 013 y registrar verde/badge/campo/alerta en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-004–SC-005, SC-008)

**Checkpoint**: propuestas controladas por decisión humana y badge derivado exacto.

---

## Phase 6: User Story 4 — Compositor y scroll independiente (Priority: P2)

**Goal**: compositor normativo dentro del agente, adjunto deshabilitado explicado,
envío/reintento intactos y scroll independiente a 1024×768.

**Independent Test**: enviar/contraer/reintentar y desplazar conversaciones/lienzo
largos por separado en tablet; comprobar móvil heredado y cero solapes.

### Tests RED para User Story 4

- [X] T037 [P] [US4] Ampliar `app/features/tasks/components/TaskChat.test.ts` con placeholder exacto, `Enviar`, adjunto disabled+descripción, orden de foco, texto vacío/whitespace, submitted/streaming/error/retry y borrador conservado (Refs: AC-017–AC-018; FR-013–FR-014, FR-016; IMG-UX-02/03)
- [X] T038 [P] [US4] Añadir en `tests/e2e/stage-agent-workspace.spec.ts` conversación/lienzo largos a 1024×768, scrollTop independiente en ambos sentidos, compositor/último mensaje alcanzables, contraer durante envío y regresión tabs ≤767 (Refs: AC-017–AC-020; FR-013–FR-019; IMG-UX-03)
- [X] T039 [US4] Ampliar `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` para consumir `VISUAL_RUN_MODE`: `contract` omite snapshot, `evidence` captura ACTUAL enmascarado y `baseline` conserva `toHaveScreenshot`; añadir contención/overflow/axe/teclado/foco para IMG-UX-01 stage móvil e IMG-UX-02 agent móvil, y contratos completos en ≥768 (Refs: FR-013–FR-018, FR-020–FR-022; IMG-UX-01/02/03)
- [X] T040 [US4] Ejecutar T037–T039 antes de producto, confirmar rojo por compositor/scroll/accesibilidad 013 ausentes y registrar comando, conteo y causa en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Validation Capa A/B)

### Implementación mínima para User Story 4

- [X] T041 [US4] Actualizar compositor en `app/features/tasks/components/TaskChat.vue`: `Escribe al agente…`, adjunto visible disabled con explicación, `Enviar` secundario y estados empty/send/retry existentes intactos (Refs: FR-013–FR-014, FR-016; depende de T040; IMG-UX-02/03)
- [X] T042 [US4] Ajustar alturas, `min-height:0`, overflow y breakpoint 768–1024 en `app/features/tasks/components/AgentPanel.vue` y `app/features/tasks/components/TaskWorkspace.vue` para dos columnas/scroll independiente; mantener ≤767 sin cambios estructurales (Refs: FR-015, FR-017–FR-019; depende de T040; IMG-UX-03)
- [X] T043 [US4] Ejecutar T037 y regresiones `TaskChat`/`AgentPanel`/`TaskWorkspace` hasta verde, comprobando borrador, envío, retry, foco y adjunto sin eventos; registrar evidencia (Refs: SC-006)
- [X] T044 [US4] Ejecutar T038–T039 serial sin update de snapshots; exigir comportamiento, geometría y axe verdes antes de aceptar cualquier pixel diff y registrar resultado en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-006–SC-008)

**Checkpoint**: las cuatro historias están funcionales; baselines aún no se aceptan.

---

## Phase 7: Capa B visual y Capa C documental

**Purpose**: producir candidatas controladas y obtener decisión humana antes de
versionar baselines.

- [X] T045 Ejecutar `tests/e2e/stage-agent-workspace.spec.ts` completo con `--workers=1` inmediatamente antes de visual y registrar verde/siembra limpia en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: todas AC; FR-005–FR-019)
- [X] T046 Ejecutar `VISUAL_RUN_MODE=contract npm run test:visual -- --grep "IMG-UX-01|IMG-UX-02" --workers=1 --reporter=line`; exigir que los ocho estados completen DOM, ancho condicional, scroll, geometría, primaria, overflow y axe sin invocar snapshots, y registrar conteos en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-008)
- [X] T047 Con autorización explícita de captura, ejecutar modo `evidence` del `specs/013-agent-rail-chat/quickstart.md` con root 013 y `--grep`; exigir ocho ACTUAL/máscaras/hashes y confirmar mediante `git diff` que ninguna baseline cambió (Refs: FR-020, FR-022; IMG-UX-01/02)
- [X] T048 Completar las seis dimensiones, clasificación, severidad y owner para las ocho filas y comparación tablet IMG-UX-03 en `specs/013-agent-rail-chat/evidence/visual-comparison.md`, dejando decisión humana explícitamente pendiente (Refs: FR-020, FR-022; IMG-UX-01/02/03)
- [X] T049 **HUMAN_DECISION_REQUIRED** Revisar las ocho candidatas y comparación C completa, registrar aprobación explícita o defectos en `specs/013-agent-rail-chat/evidence/visual-comparison.md` y no avanzar con silencio/inferencia (Refs: FR-020, FR-022; SC-009)
- [X] T050 Tras aprobación T049 y cero defectos, ejecutar `npm run test:visual:update -- --grep "IMG-UX-01|IMG-UX-02"`, revisar/versionar el diff de baselines y repetir sin update hasta verde idempotente; registrar hashes en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: FR-022; SC-008–SC-009)
- [X] T051 Sembrar por separado `VISUAL_SEED_DEFECT`, `VISUAL_SEED_GEOMETRY_DEFECT` y `AXE_SEED_INVALID_RULE`, confirmar fallo del gate correcto, retirar cada siembra y repetir verde en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` (Refs: Validation Capa B)
- [X] T052 Ejecutar `npm run test:visual` completo sin update para detectar diffs colaterales IMG-UX-03/05, documentarlos en `specs/013-agent-rail-chat/implementation-evidence.md` y detener en una decisión humana adicional antes de actualizar cualquiera; si no hay diffs, registrar verde global (Refs: Dependencies; SC-009)

**Checkpoint**: Capa B/C solo cierran con decisión humana y verde idempotente.

---

## Phase 8: Polish, verificación agregada y publicación

**Purpose**: cerrar evidencia real, revisión y publicación sin mezclar el worktree.

- [X] T053 [P] Ejecutar Vitest enfocado de `AgentPanel`, `TaskChat`, `TaskWorkspace`, `useWorkspaceState`, rules y helpers; registrar comando, total y exit code en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: Validation Capa A)
- [X] T054 [P] Ejecutar `npm run typecheck` y `npm run verify:e2e` serial contra el servidor explícito; registrar conteos/exit code y alcance no verificado en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: FR-016–FR-019)
- [X] T055 Ejecutar `npm run test:visual` completo y `npm run verify`; separar fallos 013, deuda previa y contaminación de fixtures, y registrar veredicto exacto en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: SC-008–SC-009)
- [X] T056 Ejecutar `graphify update .` y `npm run graph:check`, revisar impacto AgentPanel↔TaskChat↔TaskWorkspace↔useWorkspaceState y mantener `graphify-out/` fuera del staging (Refs: Constitution V)
- [X] T057 Lanzar revisión independiente del patch completo 013; resolver P0/P1 con nuevo ciclo test rojo→cambio mínimo→verde y documentar P2/P3 en `specs/013-agent-rail-chat/implementation-evidence.md` (Refs: todas FR/SC)
- [X] T058 Validar `specs/013-agent-rail-chat/quickstart.md` de principio a fin y ejecutar `git diff --check`; sincronizar `tasks.md`/`implementation-evidence.md` solo con tareas realmente verificadas (Refs: Validation Contract)
- [X] T059 Inspeccionar staged diff y secretos/ruido, registrar el inventario final en `specs/013-agent-rail-chat/implementation-evidence.md` y stagear únicamente frontend/tests/docs/baselines 013 explícitamente aprobados, excluyendo cambios ajenos, caches, SQLite y resultados temporales (Refs: workflow Git; FR-019, FR-022)
- [ ] T060 Crear commit descriptivo y hacer push solo a `origin/codex/013-agent-rail-chat`; reportar commit/upstream y no abrir/mergear a `main` sin autorización separada (Refs: workflow Git)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 es gate humano y bloquea toda implementación.
- **Foundational (Phase 2)**: depende de Setup y bloquea historias.
- **US1 (Phase 3)**: entrega el MVP rail/default/badge.
- **US2 (Phase 4)**: depende de US1 porque comparte `AgentPanel`/grid.
- **US3 (Phase 5)**: depende de US1/US2 para tarjeta dentro de columna final.
- **US4 (Phase 6)**: depende de US2/US3 para medir compositor/propuesta finales.
- **Capa B/C (Phase 7)**: depende de US1–US4; T049 bloquea cualquier update/aceptación.
- **Closure (Phase 8)**: depende de capas A/B/C y decisión humana.

### User Story Dependencies

- **US1 (P1)**: independiente tras foundation; MVP demostrable.
- **US2 (P1)**: integra sobre el estado/grid de US1, pero sus mensajes se prueban aislados.
- **US3 (P1)**: necesita la columna US2; decisiones siguen verificables por fixture aislado.
- **US4 (P2)**: necesita markup final de mensajes/propuestas para scroll/contención.

### Within Each User Story

1. Escribir happy, boundary, invalid, failure/recovery y regresiones aplicables.
2. Ejecutar y confirmar rojo por comportamiento ausente.
3. Implementar el cambio productivo mínimo.
4. Ejecutar prueba nueva y suite afectada hasta verde.
5. Registrar evidencia antes de marcar cada tarea.

## Parallel Opportunities

- T003–T005 son lecturas/documentos independientes tras T001–T002.
- T007, T009 y T010 usan archivos distintos; T011 integra helpers.
- T013–T014, T021–T022 y T029–T030 pueden escribirse en paralelo; sus tareas de
  integración reúnen el rojo antes de producto.
- T037 y T038 son unit/E2E independientes; T039 integra visual.
- T053–T054 pueden correr en paralelo solo si no comparten servidor/storage;
  E2E y visual deben permanecer seriales con un único servidor.

## Parallel Example: User Story 1

```text
Task T013: escribir contrato unitario de AgentPanel rail/badge.
Task T014: escribir contrato TaskWorkspace/useWorkspaceState por tarea.
Luego T015 integra E2E/visual y T016 reúne el rojo antes de T017–T018.
```

## Parallel Example: User Story 3

```text
Task T029: escribir pruebas de tarjeta/edición en TaskChat.
Task T030: escribir pruebas de handler/badge en TaskWorkspace.
Luego T031 integra navegador y T032 confirma rojo antes de producto.
```

## Implementation Strategy

### MVP First

1. Completar Setup + Foundational.
2. Completar US1 con rojo y verde.
3. Detener y demostrar rail/default/persistencia/badge sin implementar chat nuevo.

### Incremental Delivery

1. US1: rail y estado por tarea.
2. US2: columna y mensajes.
3. US3: propuestas y decisiones.
4. US4: compositor y scroll.
5. Capa B/C + gate humano.
6. Verificación agregada, revisión y publicación.

## Notes

- Ninguna tarea se marca por edición sola.
- `HUMAN_DECISION_REQUIRED` no se satisface con captura o suite verde.
- No modificar schema/rules salvo que una prueba demuestre un defecto de alcance;
  en ese caso detener y revalidar la spec antes de ampliar.
- Mockups son referencias; baselines requieren aprobación/versionado.
- Una tarea Spec Kit por hilo durante implementación.
