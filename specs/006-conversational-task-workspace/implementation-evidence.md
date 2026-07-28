# Implementation Evidence: Workspace conversacional de soluciones repetibles

## Phase 1: Setup and test harness

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T001 | Traceability | Append-only docs update | Mapping missing for FR-001...FR-039 and SC-001...SC-012 | `tests/TEST-MATRIX.md` now includes all requirements with owning test files | ✅ COMPLETE |
| T002 | Setup | `cat` / manual fixture generation | Missing reusable fixture builders in `tests/fixtures/tasks/conversational-workspace-task.ts` | Added project/method-version/iteration/automation candidate builders with deterministic defaults | ✅ COMPLETE |
| T003 | Setup | Manual fixture definition and manifest update | Missing fixture families for two-project, legacy-project, repeatable-v1, material-v2 | Added four legacy-oriented fixture definitions and `tests/fixtures/legacy/manifest.json` entries | ✅ COMPLETE |
| T004 | Setup | `specs/006.../implementation-evidence.md` ledger append-only | Missing phase-ledger format for red/green + manual-only boundaries | Evidence ledger created with first four phase entries, including human-only criteria rows | ✅ COMPLETE |

## Human-only criteria

| Criterion | Owner | Status |
|---|---|---|
| SC-002 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |
| SC-003 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |
| SC-010 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |

## Phase 2: Foundational storage, schemas and migration (in progress)

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T005 | Contract | `npx vitest run tests/contract/storage-batch.contract.test.ts` | `storage-batch` contract lacked repository-failure atomic rollback coverage | Added `runStorageBatch` repository-failure coverage with expected 500 and no partial state mutation in `tests/contract/storage-batch.contract.test.ts` | ⏳ PENDING |

## Phase 3: User Story 1 - Convertir un problema en método repetible

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T032 | Verification | `npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts app/features/tasks/domain/task-rules.test.ts app/features/tasks/services/mock-workspace-assistant.test.ts app/features/tasks/services/task-completion.test.ts tests/contract/task-workflow.contract.test.ts tests/integration/task-persistence.test.ts` + `npx playwright test tests/e2e/guided-workspace.spec.ts` | US1 suites fallaban en validaciones de salida por fase (campos obligatorios y continuidad de fase 4) | Ajustado `tests/e2e/guided-workspace.spec.ts` para estado vigente de fase 2 y `pages/tasks/[id].vue` para que el estado de tarea no bloquee acciones con `pointer-events` | ✅ COMPLETE |

## Phase 4: User Story 2 - Responder conversando y confirmar de forma simple

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T033 | Unit / adapter contract | `npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts` | 3 fallos: faltaban identidad completa, `primaryQuestion` y retry secuencial determinista | 18/18 pasan; turno y propuestas conservan contexto, pregunta única, rutas cerradas y retry idempotente | ✅ COMPLETE |
| T034 | Unit / proposal rules | `npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts` | 9 fallos: autoaplicación sin decisión, sin `pending`, decisiones/contexto ignorados | 29/29 pasan; pending, accept, edit, reject, duplicados, stale y conflictos de identidad/versionado | ✅ COMPLETE |
| T035 | Playwright | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts` | 1 fallo: no existía tarjeta accesible ni acciones de propuesta | 2/2 pasan; resumen vacío oculto y flujo chat/formulario/mixto confirmado sin sobrescritura | ✅ COMPLETE |
| T036 | Integration / persistence | `npx vitest run tests/integration/task-persistence.test.ts` | 1 fallo: el mensaje con contexto, contradicciones y estados de propuesta se descartaba al reabrir | 8/8 pasan; `proposed`, `applied`, `rejected` y `conflict` sobreviven sin alterar el dato humano | ✅ COMPLETE |
| T037 | Schema | `npm run typecheck` + persistence focused | El contrato no modelaba pregunta, contradicción, contexto ni decisión | Schema de turno, contradicción, decisión y propuesta contextual tipado y persistible | ✅ COMPLETE |
| T038 | Domain | Unit rules focused | Las actualizaciones válidas se aplicaban automáticamente | Decisiones explícitas idempotentes con revisión y contexto actuales; compatibilidad legacy conservada | ✅ COMPLETE |
| T039 | Service | Unit adapter focused | El adaptador devolvía sugerencias/updates sin pregunta ni identidad completa | Pregunta guiada por vacío, propuestas pending seguras y IDs deterministas | ✅ COMPLETE |
| T040–T042 | UI / orchestration | Conversational + guided Playwright | Chat sin decisiones; resumen permanente; workspace autoaplicaba | Tarjetas con valor anterior/propuesto, Accept/Edit/Discard, resumen contextual y guardado explícito | ✅ COMPLETE |
| T043 | Focused checkpoint | `npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts app/features/tasks/domain/task-assistant-rules.test.ts tests/integration/task-persistence.test.ts` + conversational/guided Playwright + `npm run typecheck` | N/A after observed task-level reds | 55/55 Vitest, 2/2 US2 Playwright, 7/7 guided regression and typecheck pass | ✅ COMPLETE |

Known out-of-phase baseline: `app/features/tasks/domain/task-assistant.schema.test.ts`
has one existing index-repair failure (`record.taskId` repairs to `""` instead of the
expected legacy task ID). It is outside T033–T043 and is not counted as US2 green
evidence.

### Phase 4 independent-review corrections

| Scope | Red evidence | Green result | Status |
|---|---|---|---|
| Outcome-v2 revisions, closed paths and no-autoapply fallback | `task-assistant-rules.test.ts`: 19 expected failures (9 revision, 9 closed-path, 1 implicit autoapply) | 47/47 pass; every 006 field invalidates its phase revision and every public path leaves proposals pending until an explicit decision | ✅ COMPLETE |
| Gap-driven chat equivalence | `mock-workspace-assistant.test.ts`: 4 representative natural-answer failures, followed by 2 minimum-output gaps | 24/24 pass; typed proposals cover new phase fields, arrays, predictions, iterations and procedural change without repeating confirmed fields | ✅ COMPLETE |
| Typed proposal editing | Playwright typed-array case failed first because the UI emitted JSON as text, then rejected invalid JSON without feedback | 3/3 conversational Playwright cases pass; invalid JSON is announced and valid array edits preserve the schema type | ✅ COMPLETE |
| Affected schema regression | `task-assistant.schema.test.ts`: 14/15 because empty canonical `taskId` masked legacy `tareaId` | 15/15 pass after preferring the non-empty legacy identifier | ✅ COMPLETE |
| Final checkpoint | Focused reviewer run plus guided selector regression | 79/79 focused Vitest, 15/15 affected schema, 3/3 US2 Playwright, 7/7 guided regression, `npm run typecheck` and `npm run build` pass | ✅ COMPLETE |

The earlier “known out-of-phase baseline” note records the state observed before
the independent-review correction; it is superseded by the green schema row above.

## Phase 5: User Story 3 - Mantener el contexto al navegar

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T045 / T049 | Unit / workspace state | `npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts` | El módulo `useWorkspaceState.ts` no existía y Vitest falló al importarlo | 12/12 pasan; selección, borrador, resumen, ancla por ID, reparación, reset y aislamiento por generación quedan cubiertos | ✅ COMPLETE |
