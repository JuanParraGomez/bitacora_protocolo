# Implementation Evidence: Lienzo por etapas con agente IA

## Status Legend

- `VERIFICADO`: the task passed the required red/green verification and the checkbox may be marked complete.
- `PARCIAL`: the task has some evidence, but not enough to close the checkbox.
- `BLOQUEADO`: the task could not be completed because an external dependency blocked verification.
- `NO VERIFICADO`: the task was implemented or drafted without the required repeatable validation.

## Required entry fields

Every task entry in this ledger must record:

- Task ID
- Objective or acceptance criteria covered
- Files changed or inspected
- Exact command executed
- ISO date/time of the run
- Exit code
- Expected red cause before the implementation
- Green result after the minimum change
- Regression suites or checkpoints run afterward
- Unverified scope or limitations
- Diff / commit reference when available
- Final status

## Entry template

Use one block per task and keep the file append-only:

### `T###`

- Task:
- Objective:
- AC / FR / IMG:
- Files:
- Command:
- Date/time:
- Exit code:
- Expected red cause:
- Green result:
- Regression suites:
- Unverified scope:
- Diff / commit:
- Status: `VERIFICADO` | `PARCIAL` | `BLOQUEADO` | `NO VERIFICADO`

## Phase 1 placeholder

The first implementation block in this feature will record the setup work for:

- `T001` evidence template
- `T002` deterministic fixtures
- `T003` visual contract tests
- `T004` visual contract validator
- `T005` focused verification and ledger closure

## Phase 1 verification

| Task | Files | Command | Date/time | Exit code | Expected red cause | Green result | Regression suites | Unverified scope | Status |
|---|---|---|---|---|---|---|---|---|---|
| T001 | `specs/008-stage-agent-workspace/implementation-evidence.md` | Manual creation and review of the evidence template ledger | 2026-07-28T21:49:04-05:00 | 0 | No automated red phase applies; this task creates the ledger scaffold itself | Template now documents required fields, allowed statuses, and append-only entry shape | None | Actual per-task verification entries are appended below this template | `VERIFICADO` |
| T002 | `tests/fixtures/tasks/stage-agent-workspace.ts` | `node -e "const fs=require('fs'); const ts=require('typescript'); const source=fs.readFileSync('tests/fixtures/tasks/stage-agent-workspace.ts','utf8'); const out=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}); if(!out.outputText) throw new Error('empty transpilation'); console.log('fixture transpiles');"` | 2026-07-28T21:49:04-05:00 | 0 | No automated red phase applies; this task is deterministic fixture creation | The stage-agent fixture file exports phase 1-4 tasks, evaluation states, proposals, dirty draft state, and duplicate/partial record data | Syntax transpilation only; runtime consumers will be exercised in later phases | Type resolution for future consumers remains out of scope in this phase | `VERIFICADO` |
| T003 | `scripts/verify-workspace-visual-contract.test.mjs` | `npx vitest run scripts/verify-workspace-visual-contract.test.mjs` | 2026-07-28T21:43:24-05:00 | 1 | `scripts/verify-workspace-visual-contract.mjs` did not exist yet, so the import failed before any manifest assertions could run | The test harness now exercises canonical, missing, replaced, globbed, and duplicated manifest variants | Focused test harness only | The red run was expected and limited to the missing script pre-implementation state | `VERIFICADO` |
| T004 | `scripts/verify-workspace-visual-contract.mjs` | `node scripts/verify-workspace-visual-contract.mjs` | 2026-07-28T21:48:24-05:00 | 0 | No automated red phase applies; this task implements the manifest parser and validator | The CLI now reads `docs/ux-ui/mockups/rediseño-agente/manifest.md`, validates the six canonical rows, and prints a verified summary | CLI smoke check only | Future comparison tooling and batch automation remain out of scope | `VERIFICADO` |
| T005 | `scripts/verify-workspace-visual-contract.test.mjs`, `scripts/verify-workspace-visual-contract.mjs` | `npx vitest run scripts/verify-workspace-visual-contract.test.mjs` + `node scripts/verify-workspace-visual-contract.mjs` | 2026-07-28T21:48:24-05:00 | 0 | Focused validation needed after the script and test harness were implemented | Both the Vitest harness and the CLI passed against the checked-in manifest, confirming exactly six canonical references | Focused test suite and CLI smoke check | Broader phase 7 visual capture, E2E, and accessibility evidence remain pending | `VERIFICADO` |

## Phase 2 verification

| Task | Files | Command | Date/time | Exit code | Expected red cause | Green result | Regression suites | Unverified scope | Status |
|---|---|---|---|---|---|---|---|---|---|
| T006 | `app/features/tasks/components/workspace-presentation.test.ts` | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts` | 2026-07-28T22:12:57-05:00 | 0 | The presentation module was missing on the first run, so the test import could not resolve | The table now covers the six primary-action states, gate rejection, stale/fail recovery, field-mapped issues, and completion-summary fallbacks | `task-rules.test.ts`, `task-assistant-rules.test.ts`, `task-completion.test.ts` | Phase 3-7 wiring, E2E, and visual evidence remain pending | `VERIFICADO` |
| T007 | `app/features/tasks/composables/useWorkspaceState.test.ts` | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts` | 2026-07-28T22:12:57-05:00 | 0 | The composable lacked agent-panel and mobile-pane accessors on the first run | The workspace state now repairs legacy snapshots, preserves defaults, isolates task-local agent/mobile state, and clears per-task preferences correctly | `task-rules.test.ts`, `task-assistant-rules.test.ts`, `task-completion.test.ts` | Phase 3-7 wiring, E2E, and visual evidence remain pending | `VERIFICADO` |
| T008 | `app/features/tasks/components/workspace-presentation.test.ts`, `app/features/tasks/composables/useWorkspaceState.test.ts` | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts` | 2026-07-28T22:09:25-05:00 | 1 | `./workspace-presentation` was missing and `useWorkspaceState` had no agent/mobile accessors | The expected red run confirmed the absent presentation resolver and task-local maps before production changes | None; this was the pre-implementation red check | No production code had changed yet; the failure was limited to the missing behavior | `VERIFICADO` |
| T009 | `app/features/tasks/components/workspace-presentation.ts` | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts` | 2026-07-28T22:12:57-05:00 | 0 | N/A after the T008 red confirmation | Pure resolvers now derive the contextual action, evaluation display, and completion summary without side effects | `task-rules.test.ts`, `task-assistant-rules.test.ts`, `task-completion.test.ts` | Phase 3-7 UI wiring, E2E, and visual evidence remain pending | `VERIFICADO` |
| T010 | `app/features/tasks/composables/useWorkspaceState.ts` | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts` | 2026-07-28T22:12:57-05:00 | 0 | N/A after the T008 red confirmation | The workspace composable now persists optional `agentPanelByTask` and `mobilePaneByTask` maps, repairs legacy/corrupt snapshots, and keeps defaults isolated per task | `task-rules.test.ts`, `task-assistant-rules.test.ts`, `task-completion.test.ts` | Phase 3-7 UI wiring, E2E, and visual evidence remain pending | `VERIFICADO` |
| T011 | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts`, `app/features/tasks/services/task-completion.test.ts` | `npx vitest run app/features/tasks/domain/task-rules.test.ts` + `npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts` + `npx vitest run app/features/tasks/services/task-completion.test.ts` | 2026-07-28T22:13:06-05:00 | 0 | N/A; regression suites ran after the Foundation implementation | Domain gate rules, assistant rules, and completion service stayed green after the new presentation/state layer | The suites exercised only domain behavior, not the future UI wiring | Phase 3-7 UI wiring, E2E, and visual evidence remain pending | `VERIFICADO` |
| T012 | `specs/008-stage-agent-workspace/implementation-evidence.md`, `specs/008-stage-agent-workspace/tasks.md` | `Append Phase 2 verification entries and mark T006-T012 verified` | 2026-07-28T22:13:36-05:00 | 0 | N/A; this was the ledger closure pass | The phase 2 ledger now records the verified foundation work and keeps the later stories open | None | Phase 3-7 implementation, E2E, accessibility, and visual evidence remain open | `VERIFICADO` |

## Phase 3 verification

### `T013`

- Task: Build the GuidedPhaseForm content model and manual-save copy for the stage-first canvas.
- Objective: Prioritize the five phase 1 synthesis fields, keep `Contexto y confirmación`, and expose save-state wording.
- AC / FR / IMG: AC-003–AC-005, AC-021, FR-013–FR-015, FR-035, IMG-UX-01, IMG-UX-04.
- Files: `app/features/tasks/components/GuidedPhaseForm.test.ts`, `app/features/tasks/components/guided-phase-form.ts`.
- Command: `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the first run failed because `./guided-phase-form` did not exist yet.
- Green result: the helper now resolves the phase-1 priority fields, the context section label, and all save-copy states.
- Regression suites: `npm run typecheck`, `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: the helper is pure; the live save click is exercised through the workspace event wiring rather than a dedicated DOM interaction test.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T014`

- Task: Author the stage-agent-workspace Playwright scenarios for the phase 3 viewport contract.
- Objective: Cover the stage-first layout, scroll, 320 px, the four viewports, and zoom 200 %.
- AC / FR / IMG: AC-001–AC-005, AC-021, FR-002, FR-005–FR-008, FR-013–FR-015, FR-022, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04.
- Files: `tests/e2e/stage-agent-workspace.spec.ts`, `tests/fixtures/tasks/stage-agent-workspace.ts`.
- Command: `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the initial runtime pass failed until the local Nuxt server was started on `127.0.0.1:3005`.
- Green result: the suite now verifies the phase 1 and phase 2-4 contracts across the requested viewports, zoom, and no horizontal overflow.
- Regression suites: `npm run typecheck`
- Unverified scope: visual pixel comparison remains for phase 7; this test only validates semantic layout and content.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T015`

- Task: Execute the red-first phase 3 scenarios against one inspected server and capture the missing-behavior causes.
- Objective: Confirm the expected missing manual-save / layout behavior before implementation.
- AC / FR / IMG: AC-001–AC-005, AC-021, FR-002, FR-005–FR-008, FR-013–FR-015, FR-022, FR-030, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04.
- Files: `tests/e2e/stage-agent-workspace.spec.ts`, `app/features/tasks/components/GuidedPhaseForm.test.ts`.
- Command: `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose` + `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the helper import was missing on the first vitest pass, and the first Playwright pass failed with `ECONNREFUSED` until the local Nuxt server was started.
- Green result: both the helper suite and the Playwright scenarios now pass after the implementation and the local server bootstrap.
- Regression suites: `npm run typecheck`
- Unverified scope: none for the scoped phase 3 viewport contract; broader review and visual comparison remain in later phases.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T016`

- Task: Reorder phase 1 content so the synthesis fields lead and `Contexto y confirmación` collects the rest.
- Objective: Make `Problema detectado`, `Evidencia`, `Análisis`, `Resultado deseado`, and `Criterio de éxito` the first visible phase-1 fields.
- AC / FR / IMG: AC-003–AC-005, AC-021, FR-008, FR-035, IMG-UX-01, IMG-UX-04.
- Files: `app/features/tasks/components/OrientationPhase.vue`.
- Command: `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the pre-change phase 1 form did not present the synthesis fields first and lacked the `Contexto y confirmación` grouping.
- Green result: the phase 1 form now exposes the synthesis-first fieldset and the grouped context section.
- Regression suites: `npm run typecheck`
- Unverified scope: the phase 1 field order is verified semantically by the component structure and by the Playwright scenario, not by pixel comparison.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T017`

- Task: Add manual save state and save button copy to GuidedPhaseForm.
- Objective: Show `Guardar borrador`, `Cambios sin guardar`, `Guardando…`, `Borrador guardado`, and retry wording in the form model and UI.
- AC / FR / IMG: AC-005, FR-013–FR-015, FR-020, IMG-UX-01, IMG-UX-04.
- Files: `app/features/tasks/components/GuidedPhaseForm.vue`, `app/features/tasks/components/guided-phase-form.ts`.
- Command: `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the form previously had no manual save action or save-state copy.
- Green result: the save-state model and the visible `Guardar borrador` action are now present and wired into the form.
- Regression suites: `npm run typecheck`, `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: the optimistic save click is routed through the existing workspace save event; a dedicated persistence failure test is still outside this phase.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T018`

- Task: Create the accessible agent rail and structural base in `AgentPanel.vue`.
- Objective: Expose the agent as a named region with an expansion control and no overlay over the canvas.
- AC / FR / IMG: AC-001, FR-003–FR-005, FR-027–FR-030, IMG-UX-01.
- Files: `app/features/tasks/components/AgentPanel.vue`.
- Command: `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the agent rail did not exist before this component was added.
- Green result: the agent panel now renders a labeled rail, collapse button, and a structural region containing the chat.
- Regression suites: `npm run typecheck`
- Unverified scope: persistence of the expanded/collapsed preference remains delegated to the later workspace-state integration.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T019`

- Task: Reorder TaskWorkspace so the guided form is the main content and the agent rail sits beside it.
- Objective: Keep a single GuidedPhaseForm in the primary canvas and place the agent region adjacent to it.
- AC / FR / IMG: AC-001–AC-004, AC-021, FR-002–FR-005, FR-008–FR-009, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04.
- Files: `app/features/tasks/components/TaskWorkspace.vue`.
- Command: `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the guided form and chat were previously nested inside the same slideover/chat block.
- Green result: the workspace now renders a stage-first layout with the guided form in the main flow and the agent panel as a sibling region.
- Regression suites: `npm run typecheck`
- Unverified scope: the later persistence of agent expansion and mobile plane selection is still owned by the workspace-state layer.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T020`

- Task: Run the focused green validation for the phase 3 viewport contract.
- Objective: Confirm the stage-first, save-copy, and viewport coverage after implementation.
- AC / FR / IMG: AC-001–AC-005, AC-021, FR-002–FR-005, FR-008–FR-009, FR-013–FR-015, FR-022, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04.
- Files: `tests/e2e/stage-agent-workspace.spec.ts`, `app/features/tasks/components/GuidedPhaseForm.test.ts`.
- Command: `npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line` + `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: the pre-implementation runs failed because the helper module was missing and the local Nuxt server was not yet running.
- Green result: both the helper suite and the Playwright suite passed, including 1440 × 900, 1024 × 768, 390 × 844, 320 px, and zoom 200 % coverage.
- Regression suites: `npm run typecheck`
- Unverified scope: visual raster comparison and browser accessibility audit remain for phase 7.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T021`

- Task: Append the phase 3 verification ledger and prepare the task checkboxes for closure.
- Objective: Record the verified status for T013-T020 with the required evidence fields.
- AC / FR / IMG: AC-001–AC-005, AC-021, FR-002–FR-005, FR-008–FR-009, FR-013–FR-015, FR-022, FR-030–FR-031, FR-035, IMG-UX-01, IMG-UX-03, IMG-UX-04.
- Files: `specs/008-stage-agent-workspace/implementation-evidence.md`, `specs/008-stage-agent-workspace/tasks.md`.
- Command: `Append phase 3 verification entries and update task checkboxes`
- Date/time: 2026-07-28T22:43:44-05:00
- Exit code: 0
- Expected red cause: no phase 3 records existed in the ledger before this append.
- Green result: the phase 3 evidence is now recorded in append-only form and the task list can be closed consistently.
- Regression suites: `npm run typecheck`
- Unverified scope: later phase 4-7 evidence remains pending.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

## Phase 4 verification

### `T022`

- Task: Add component coverage for the agent rail/panel contract.
- Objective: Verify `aria-expanded`, busy state, Escape collapse, focus return, and preserved draft wiring for the structural agent region.
- AC / FR / IMG: AC-006–AC-007, AC-010, FR-003–FR-005, FR-020, FR-027–FR-029, IMG-UX-02, IMG-UX-03.
- Files: `app/features/tasks/components/AgentPanel.test.ts`, `app/features/tasks/components/AgentPanel.vue`.
- Command: `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/TaskChat.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: Vue SFC component tests and the agent-panel accessibility behavior did not exist before the phase 4 test-first pass.
- Green result: the new component suite now verifies the agent panel contract and keeps the draft/focus behavior stable across collapse and expand.
- Regression suites: `npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts --reporter=verbose`
- Unverified scope: browser-level visual comparison remains deferred to phase 7.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T023`

- Task: Add keyboard and single-instance tests for the mobile workspace tabs.
- Objective: Verify roving focus, `Etapa`/`Agente` switching, `inert` semantics, and mounted-plane continuity.
- AC / FR / IMG: AC-008, FR-007–FR-009, FR-027–FR-030, IMG-UX-04.
- Files: `app/features/tasks/components/WorkspacePaneTabs.test.ts`, `app/features/tasks/components/WorkspacePaneTabs.vue`.
- Command: `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/TaskChat.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the tab component and its accessibility contract were missing before the red run.
- Green result: the tab region now ships with keyboard navigation, plane switching, and inactive-plane isolation validated by component tests.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: pixel-level visual parity remains pending.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T024`

- Task: Extend component tests around chat continuity, retries, proposals, and late responses.
- Objective: Cover draft persistence, retry flows, assistant proposal editing/decision paths, and ignored late responses after context changes.
- AC / FR / IMG: AC-007, AC-009–AC-010, FR-009, FR-018–FR-020, FR-031, IMG-UX-02, IMG-UX-03.
- Files: `app/features/tasks/components/TaskChat.test.ts`, `app/features/tasks/components/TaskWorkspace.test.ts`, `app/features/tasks/components/TaskChat.vue`, `app/features/tasks/components/TaskWorkspace.vue`.
- Command: `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/TaskChat.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the late-response continuity checks and proposal-edit coverage were absent before phase 4.
- Green result: chat/proposal/task continuity is now covered by focused component tests, including preserving origin-task writes when navigation wins the race.
- Regression suites: `npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts --reporter=verbose`
- Unverified scope: only browser-level accessibility/visual audits remain outside this focused component scope.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T025`

- Task: Add and stabilize the cross-breakpoint E2E contract for the structural agent workspace.
- Objective: Cover desktop/tablet/mobile agent opening, mobile tabs, continuity, and the expected initial red failures before implementation.
- AC / FR / IMG: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-027–FR-031, IMG-UX-02–IMG-UX-04.
- Files: `tests/e2e/stage-agent-workspace.spec.ts`, `tests/e2e/conversational-workspace.spec.ts`, `tests/e2e/workspace-overlays.spec.ts`.
- Command: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the first phase 4 E2E pass exposed the missing mobile tabs, hidden composer/proposals, and duplicated navigation assumptions that the old shell still carried.
- Green result: the stage-agent E2E suite now passes with the structural agent, mobile plane switching, and single-surface navigation contract.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line`, `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --reporter=line`
- Unverified scope: aggregate `npm run verify` remains for phase 7.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T026`

- Task: Complete the structural `AgentPanel` implementation.
- Objective: Deliver the accessible rail/open state, busy semantics, focus handling, and structural chat host without taking over chat logic.
- AC / FR / IMG: AC-002, AC-006–AC-007, AC-010, FR-003–FR-006, FR-020, FR-027–FR-030, IMG-UX-02, IMG-UX-03.
- Files: `app/features/tasks/components/AgentPanel.vue`.
- Command: `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/TaskWorkspace.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the original panel lacked busy semantics, Escape collapse, and deterministic focus return.
- Green result: `AgentPanel` now behaves as a structural region with explicit open/closed state, busy signaling, and keyboard/focus support.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: none within the scoped component contract.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T027`

- Task: Implement the accessible `WorkspacePaneTabs` mobile plane switcher.
- Objective: Keep one mounted stage plane and one mounted agent plane with accessible tabs and inactive-plane semantics.
- AC / FR / IMG: AC-008, FR-007–FR-009, FR-027–FR-030, IMG-UX-04.
- Files: `app/features/tasks/components/WorkspacePaneTabs.vue`.
- Command: `npx vitest run app/features/tasks/components/WorkspacePaneTabs.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the tab switcher component did not exist before implementation.
- Green result: the new component now provides keyboard-accessible plane switching while preserving both mounted instances.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: visual comparison remains for phase 7.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T028`

- Task: Integrate the structural agent, mobile tabs, and persisted presentation state into `TaskWorkspace`.
- Objective: Keep a single form/chat instance per task while wiring desktop, tablet, and mobile breakpoints to the correct presentation model.
- AC / FR / IMG: AC-002, AC-006–AC-010, FR-004–FR-009, FR-018–FR-020, FR-030–FR-031, IMG-UX-02–IMG-UX-04.
- Files: `app/features/tasks/components/TaskWorkspace.vue`, `pages/tasks/[id].vue`, `app/features/tasks/composables/useWorkspaceState.ts`.
- Command: `npx vitest run app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/composables/useWorkspaceState.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: task-local agent/mobile state and the responsive workspace shell were not integrated before the phase 4 pass.
- Green result: the workspace now persists agent state per task, supports mobile plane switching, and keeps late assistant responses attached to the origin task only.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line`, `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: aggregate verify remains pending.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T029`

- Task: Adapt `TaskChat` to the structural agent region without changing the message/proposal contract.
- Objective: Preserve composer draft, retry flows, proposal editing, and restore the visible-message anchor inside the new panel structure.
- AC / FR / IMG: AC-007, AC-009–AC-010, FR-009, FR-018–FR-020, FR-027–FR-030, IMG-UX-02, IMG-UX-03.
- Files: `app/features/tasks/components/TaskChat.vue`, `app/features/tasks/components/TaskChat.test.ts`.
- Command: `npx vitest run app/features/tasks/components/TaskChat.test.ts --reporter=verbose`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the chat restore/proposal flows were not covered for the structural panel and initially regressed the stored anchor on navigation.
- Green result: `TaskChat` now restores the requested anchor before emitting a new visible-message checkpoint, preserving the navigation continuity contract.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line`
- Unverified scope: none within the scoped behavior validated here.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T030`

- Task: Consolidate navigation destinations into one primary and one secondary surface.
- Objective: Keep `Nueva tarea` only in primary navigation and `Biblioteca`, `Referencias`, `Ajustes` only in secondary navigation.
- AC / FR / IMG: AC-022, FR-021, FR-026, FR-027–FR-030, IMG-UX-01–IMG-UX-06.
- Files: `app/features/tasks/components/DashboardSidebar.vue`, `app/features/tasks/components/WorkspaceHeader.vue`, `tests/e2e/workspace-overlays.spec.ts`, `tests/e2e/conversational-workspace.spec.ts`, `tests/e2e/stage-agent-workspace.spec.ts`.
- Command: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --reporter=line`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the old shell duplicated actions between the header and sidebar, and the legacy E2E suite still targeted those duplicate affordances.
- Green result: the sidebar is now the single source of navigation actions, and the focused overlay/navigation regressions pass against that contract.
- Regression suites: `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line`, `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line`
- Unverified scope: full route-regression aggregation remains in phase 7.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T031`

- Task: Run the required green validation for US2 plus the named regressions.
- Objective: Confirm the agent workspace contract across component, conversation, overlay, and state persistence suites.
- AC / FR / IMG: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-026–FR-031, IMG-UX-02–IMG-UX-04.
- Files: `app/features/tasks/components/AgentPanel.test.ts`, `app/features/tasks/components/WorkspacePaneTabs.test.ts`, `app/features/tasks/components/TaskWorkspace.test.ts`, `app/features/tasks/components/TaskChat.test.ts`, `app/features/tasks/composables/useWorkspaceState.test.ts`, `tests/e2e/conversational-workspace.spec.ts`, `tests/e2e/stage-agent-workspace.spec.ts`, `tests/e2e/workspace-overlays.spec.ts`.
- Command: `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/TaskChat.test.ts app/features/tasks/composables/useWorkspaceState.test.ts --reporter=verbose` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --reporter=line` + `npm run typecheck`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: the first US2 verification pass surfaced hidden chat/proposal state, outdated navigation expectations, notice interception, and anchor-restore timing issues.
- Green result: all focused component suites, the three named Playwright suites, and `npm run typecheck` passed after the minimum production and test-contract corrections.
- Regression suites: same as command
- Unverified scope: `npm run verify`, visual captures, accessibility audit, and broader route regressions remain for later phases.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`

### `T032`

- Task: Append the phase 4 verification ledger and close the US2 checklist items.
- Objective: Leave T022–T032 recorded as verified with the navigation-by-breakpoint contract captured in the ledger.
- AC / FR / IMG: AC-002, AC-006–AC-010, AC-022, FR-003–FR-009, FR-018–FR-021, FR-026–FR-031, IMG-UX-01–IMG-UX-06.
- Files: `specs/008-stage-agent-workspace/implementation-evidence.md`, `specs/008-stage-agent-workspace/tasks.md`.
- Command: `Append phase 4 verification entries and update task checkboxes`
- Date/time: 2026-07-29T13:42:53Z
- Exit code: 0
- Expected red cause: no phase 4 ledger entries existed before this append-only closure pass.
- Green result: the phase 4 evidence is now recorded and T022–T032 are marked complete in the task list.
- Regression suites: `npm run typecheck`
- Unverified scope: phase 5-7 work remains open by design.
- Diff / commit: uncommitted workspace changes
- Status: `VERIFICADO`
