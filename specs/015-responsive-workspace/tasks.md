# Tasks: Adaptación responsive del workspace

**Input**: Design documents from `/specs/015-responsive-workspace/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/visual-acceptance.md`, `quickstart.md`

**Tests**: Obligatorios y test-first. Cada bloque de comportamiento registra un
rojo válido antes de tocar producción, seguido por verde focal y regresión.

**Organization**: Las tareas se agrupan por historia para que tablet, móvil y
reflow puedan validarse como incrementos independientes. **Refs: IMG-UX-03, IMG-UX-04**

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizable porque usa archivos distintos y no depende de trabajo incompleto.
- **[US1]**: tablet con dos regiones autónomas.
- **[US2]**: móvil Etapa/Agente sin pérdida de trabajo.
- **[US3]**: 320 px, zoom 200% y accesibilidad.

---

## Phase 1: Setup and authority

**Purpose**: fijar rama, autoridad visual, límites frontend y evidencia inicial.

- [ ] T001 Verificar rama `codex/015-responsive-workspace`, upstream, worktree y exclusión de backend en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T002 [P] Verificar trazabilidad IMG-UX-03/04 y ownership de Specs 010–014 en `docs/ux-ui/mockups/rediseño-agente/manifest.md` y `specs/015-responsive-workspace/plan.md`
- [ ] T003 [P] Registrar hashes de baselines IMG-UX-03/04 y estado `HUMAN_DECISION_REQUIRED` en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T004 [P] Confirmar versiones Nuxt/Vue/Vitest/Playwright y comandos de verificación en `specs/015-responsive-workspace/quickstart.md`

**Checkpoint**: autoridad, alcance y separación ACTUAL/baseline son reproducibles.

---

## Phase 2: Foundational responsive contracts

**Purpose**: bloquear breakpoints, persistencia y semántica compartida antes de componer historias.

- [ ] T005 [P] Añadir pruebas límite 767/768/1024/1025, ancho inválido y paridad CSS en `app/features/tasks/components/workspace-shell-presentation.test.ts`
- [ ] T006 [P] Añadir pruebas de apertura, persistencia, aislamiento entre tareas y valor inválido de pane en `app/features/tasks/composables/useWorkspaceState.test.ts`
- [ ] T007 Ejecutar T005–T006 en rojo y registrar comando, conteo y causa esperada en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T008 Implementar únicamente la corrección de clasificación/persistencia necesaria en `app/features/tasks/components/workspace-shell-presentation.ts` y `app/features/tasks/composables/useWorkspaceState.ts`
- [ ] T009 Reejecutar verde focal y regresión de estado; sincronizar T005–T008 en `specs/015-responsive-workspace/tasks.md` y `specs/015-responsive-workspace/implementation-evidence.md`

**Checkpoint**: los tres modos y el pane por tarea tienen una sola autoridad verde.

---

## Phase 3: User Story 1 — Tablet con regiones autónomas (Priority: P1) 🎯 MVP

**Goal**: drawer cerrado, header compacto y lienzo/agente paralelos con scroll independiente a 1024×768. **Refs: IMG-UX-03**

**Independent Test**: abrir una tarea extensa a 1024×768, confirmar drawer cerrado,
hamburguesa/overflow, mover cada scroll sin alterar el otro y contar como máximo
una primaria visible.

### Tests for User Story 1 — write and run red first

- [ ] T010 [P] [US1] Añadir pruebas de breadcrumb, chip, overflow, acciones y nombres accesibles en `app/features/tasks/components/WorkspaceHeader.test.ts`
- [ ] T011 [P] [US1] Añadir pruebas de drawer cerrado, abrir/cerrar/Escape, retorno de foco, preferencia desktop intacta, regiones adyacentes y máximo de primarias en `app/features/tasks/components/TaskWorkspace.test.ts`
- [ ] T012 [P] [US1] Añadir prueba E2E de scroll bidireccional con movimiento/estabilidad simétricos en `tests/e2e/stage-agent-workspace.spec.ts`
- [ ] T013 [US1] Ejecutar T010–T012 en rojo y registrar fallos esperados IMG-UX-03 en `specs/015-responsive-workspace/implementation-evidence.md`

### Implementation for User Story 1

- [ ] T014 [US1] Implementar header compacto, breadcrumb, chip y menú overflow reutilizando destinos existentes en `app/features/tasks/components/WorkspaceHeader.vue`
- [ ] T015 [US1] Implementar drawer tablet cerrado, foco de apertura/cierre/Escape y layout paralelo en `app/features/tasks/components/TaskWorkspace.vue`
- [ ] T016 [US1] Confinar ancho y overflow del rail/contenido del agente en `app/features/tasks/components/AgentPanel.vue` y `app/features/tasks/components/TaskChat.vue`
- [ ] T017 [US1] Reejecutar verde de header/workspace/agente y el recorrido 1024×768; registrar conteos en `specs/015-responsive-workspace/implementation-evidence.md`

**Checkpoint**: US1 funciona y se prueba independientemente contra IMG-UX-03.

---

## Phase 4: User Story 2 — Móvil sin pérdida de trabajo (Priority: P1)

**Goal**: un solo plano, contexto exacto, selector Etapa/Agente y estado/draft/foco conservados por tarea. **Refs: IMG-UX-04**

**Independent Test**: en 390×844 editar formulario y composer, alternar panes,
visitar dos tareas con panes distintos, recargar y recuperar valores/foco sin modal.

### Tests for User Story 2 — write and run red first

- [ ] T018 [P] [US2] Añadir pruebas de iconos, selección teclado/click, `inert`, foco lógico y pending dot 0/positivo en `app/features/tasks/components/WorkspacePaneTabs.test.ts`
- [ ] T019 [P] [US2] Añadir pruebas de línea exacta de contexto, agregación de pendientes y wiring de panes en `app/features/tasks/components/TaskWorkspace.test.ts`
- [ ] T020 [P] [US2] Añadir pruebas de campos/contadores, guardar centrado y primaria full-width en `app/features/tasks/components/GuidedPhaseForm.test.ts`
- [ ] T021 [US2] Añadir recorrido con dos tareas que verifique drafts/foco durante alternancia en sesión y, tras reload, solo pane por tarea y valores con persistencia ya contractual en `tests/e2e/stage-agent-workspace.spec.ts`
- [ ] T022 [US2] Ejecutar T018–T021 en rojo y registrar causas IMG-UX-04 en `specs/015-responsive-workspace/implementation-evidence.md`

### Implementation for User Story 2

- [ ] T023 [US2] Implementar selector segmentado con iconos, dot accesible, panes montados y foco sin scroll en `app/features/tasks/components/WorkspacePaneTabs.vue`
- [ ] T024 [US2] Integrar contexto móvil, pane persistido y pendientes derivados sin store nuevo en `app/features/tasks/components/TaskWorkspace.vue`
- [ ] T025 [US2] Ocultar el control de colapso redundante solo en el caller móvil manteniendo Agente expandido en `app/features/tasks/components/AgentPanel.vue`
- [ ] T026 [US2] Reordenar presentación móvil para campos primero, guardar textual centrado y primaria full-width en `app/features/tasks/components/GuidedPhaseForm.vue`
- [ ] T027 [US2] Reejecutar verde de panes/workspace/form/agente y recorrido 390×844; registrar conteos en `specs/015-responsive-workspace/implementation-evidence.md`

**Checkpoint**: US2 conserva formulario, composer, pane y foco por tarea contra IMG-UX-04.

---

## Phase 5: User Story 3 — 320 px, zoom y accesibilidad (Priority: P2)

**Goal**: conservar todos los datos y controles sin overflow ni solapes en 320 px y zoom 200%. **Refs: IMG-UX-03, IMG-UX-04**

**Independent Test**: recorrer Etapa/Agente a 320×667 y zoom 200% en 1024, 390 y
320; footer, composer, tabs y regiones permanecen alcanzables, no solapados y con
contraste automatizable.

### Tests for User Story 3 — write and run red first

- [ ] T028 [P] [US3] Añadir helpers/pruebas de ancho de viewport, containment, overlap y primarias en `tests/e2e/helpers/visual-geometry.ts` y `tests/e2e/helpers/visual-geometry.test.ts`
- [ ] T029 [US3] Añadir assertions 320 px de cero overflow y contenido completo en `tests/e2e/stage-agent-workspace.spec.ts`
- [ ] T030 [US3] Añadir contratos IMG-UX-03/04 para 1024, 390 y 320, ambos panes y zoom 200% en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`
- [ ] T031 [US3] Añadir axe-core de contraste para Etapa y Agente en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`
- [ ] T032 [US3] Ejecutar T028–T031 sin actualizar snapshots y registrar rojos de geometría/contraste en `specs/015-responsive-workspace/implementation-evidence.md`

### Implementation for User Story 3

- [ ] T033 [US3] Eliminar mínimos intrínsecos del formulario/footer mediante tracks flexibles y wrap en `app/features/tasks/components/GuidedPhaseForm.vue`
- [ ] T034 [US3] Confinar grid, contenido y composer del agente para reflow en `app/features/tasks/components/AgentPanel.vue` y `app/features/tasks/components/TaskChat.vue`
- [ ] T035 [US3] Permitir wrap sin pérdida ni intercepción de tabs móviles en `app/features/tasks/components/WorkspacePaneTabs.vue`
- [ ] T036 [US3] Ajustar la columna tablet sin crear otro breakpoint de viewport en `app/features/tasks/components/TaskWorkspace.vue`
- [ ] T037 [US3] Reejecutar helpers, E2E y visual contractual a verde con `--workers=1`; registrar axe/zoom/overflow en `specs/015-responsive-workspace/implementation-evidence.md`

**Checkpoint**: US3 cumple invariantes de 320 px, zoom y contraste en ambos panes.

---

## Phase 6: Evidence, regression and protected visual gate

**Purpose**: cerrar evidencia automatizada sin convertir candidatos en baselines aprobadas.

- [ ] T038 Capturar IMG-UX-03 tablet e IMG-UX-04 mobile/mobile-narrow Etapa/Agente en `specs/015-responsive-workspace/evidence/actual/`
- [ ] T039 Comparar jerarquía, contenido visible, geometría, interacción, reflow y accesibilidad en `specs/015-responsive-workspace/evidence/visual-comparison.md`
- [ ] T040 Verificar que hashes de baselines permanecen intactos y registrar `HUMAN_DECISION_REQUIRED` en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T041 Ejecutar Vitest afectado, E2E completo, visual contractual, typecheck, estructura, Graphify y build según `specs/015-responsive-workspace/quickstart.md`
- [ ] T042 Ejecutar `git diff --check`, excluir caches Graphify/SQLite y documentar el audit en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T043 Lanzar revisión independiente del patch y resolver hallazgos accionables mediante otro ciclo test-first en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T044 Solicitar aprobación humana explícita de los candidatos y mantener T045 bloqueada en `specs/015-responsive-workspace/evidence/visual-comparison.md`
- [ ] T045 Actualizar baselines seleccionadas solo después de T044 y registrar rerun idempotente en `specs/015-responsive-workspace/implementation-evidence.md`
- [ ] T046 Registrar SHA/upstream y publicar únicamente `origin/codex/015-responsive-workspace`, permitiendo `HUMAN_DECISION_REQUIRED` sin actualizar baselines, en `specs/015-responsive-workspace/implementation-evidence.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** no tiene dependencias.
- **Phase 2** depende de Phase 1 y bloquea todas las historias.
- **US1 y US2** comparten propietarios; ejecutar secuencialmente US1 → US2 para evitar conflictos, aunque sus pruebas independientes pueden prepararse en paralelo.
- **US3** depende de la composición de US1/US2.
- **Phase 6** depende de las tres historias verdes.
- **T045** depende estrictamente de aprobación humana T044; una suite verde no sustituye ese gate.
- **T046** depende de T042–T043, no de T044–T045; publicar la rama puede dejar el gate humano pendiente y no implica aprobar baselines.

### User story completion order

```text
Setup -> Foundation -> US1 tablet -> US2 mobile -> US3 reflow/a11y -> Evidence -> Human gate
```

### Within every story

1. Escribir pruebas completas.
2. Ejecutar y confirmar rojo por comportamiento faltante, no por harness.
3. Aplicar el cambio mínimo en el propietario.
4. Ejecutar verde focal y regresión afectada.
5. Sincronizar inmediatamente `tasks.md` e `implementation-evidence.md`.

## Parallel Opportunities

- T002–T004 pueden ejecutarse en paralelo.
- T005 y T006 pueden prepararse en paralelo.
- T010–T012 usan archivos distintos y pueden escribirse en paralelo antes del rojo US1.
- T018–T020 pueden escribirse en paralelo; T021 integra su comportamiento.
- T028 puede prepararse en paralelo con el diseño inicial de T029–T031.
- T038 y la preparación documental de T039 pueden comenzar juntas después de T037.

## Parallel Example: User Story 2

```text
Task T018: WorkspacePaneTabs component contract
Task T019: TaskWorkspace mobile wiring contract
Task T020: GuidedPhaseForm mobile footer contract
```

Después de esos tres tests, T021 integra el recorrido real y T022 consolida el rojo.

## Implementation Strategy

### MVP first

1. Completar Setup y Foundation.
2. Entregar US1 tablet como primer incremento verificable IMG-UX-03.
3. Detenerse y validar drawer, regiones, scroll y primaria antes de móvil.

### Incremental delivery

1. US1: estructura tablet.
2. US2: ciclo móvil y estado por tarea.
3. US3: estrecho, zoom y axe.
4. Capa C: candidatos y comparación.
5. Gate humano: aprobación o rechazo; solo entonces baseline.

## Task Summary

- **Total**: 46 tareas.
- **Setup/Foundation**: 9.
- **US1**: 8.
- **US2**: 10.
- **US3**: 10.
- **Evidence/closure**: 9.
- **Suggested MVP**: Phase 1 + Phase 2 + US1.
- **Human-only**: T044; T045 permanece protegida hasta aprobación explícita.
