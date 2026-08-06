# Tasks: Adaptación responsive del workspace

**Input**: Design documents from `/specs/015-responsive-workspace/`

**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/visual-acceptance.md`, `quickstart.md`

**Tests**: Mandatory strict TDD. Every behavior block records a valid red before product changes.

## Phase 1: Setup and authority

- [x] T001 Verify clean isolated branch/worktree, exact base and frontend-only boundary in `specs/015-responsive-workspace/implementation-evidence.md`.
- [x] T002 [P] Verify IMG-UX-03/04 manifest, Specs 010–014 ownership and baseline separation in `specs/015-responsive-workspace/plan.md`.
- [x] T003 [P] Document canonical breakpoint inclusivity and current task-local pane persistence in `specs/015-responsive-workspace/plan.md` and `data-model.md`.
- [x] T004 Record current baseline hashes and Graphify/source authority without versioning generated query noise in `specs/015-responsive-workspace/implementation-evidence.md`.

**Checkpoint**: authority, lineage and visual gates are explicit.

---

## Phase 2: Capa A foundation — breakpoints, persistence and pane controller

**Purpose**: lock the existing state authority and missing controller behavior before layout changes.

- [x] T005 [P] [US2] Add boundary/invalid-input and CSS-contract tests for the unique breakpoints in `app/features/tasks/components/workspace-shell-presentation.test.ts`. **Refs: FR-001, IMG-UX-03, IMG-UX-04**
- [x] T006 [P] [US2] Add storage reopen, cross-task isolation and invalid pane tests in `app/features/tasks/composables/useWorkspaceState.test.ts`. **Refs: FR-008, IMG-UX-04**
- [x] T007 [US2] Add tests for icons, pending dot 0/positive, mounted inactive pane and focus after click/keyboard selection in `app/features/tasks/components/WorkspacePaneTabs.test.ts`. **Refs: FR-005–FR-007, IMG-UX-04**
- [x] T008 Run T005–T007 focused; record expected red only for missing 015 behavior in `specs/015-responsive-workspace/implementation-evidence.md`.
- [x] T009 [US2] Implement the smallest pane-controller/presentation change in `WorkspacePaneTabs.vue` and `workspace-shell-presentation.ts`; do not duplicate persistence.
- [x] T010 Run focused green plus `useWorkspaceState.test.ts` regression and synchronize tasks/evidence immediately.

**Checkpoint**: selector/state behavior is green independently of shell styling.

---

## Phase 3: User Story 1 — tablet structural layout (Priority: P1)

**Goal**: drawer closed, compact header and two independently scrolling regions at 1024×768.

**Independent Test**: component tests resolve tablet, expose hamburger/overflow and preserve adjacent stage/agent regions with one primary maximum. **Refs: IMG-UX-03**

- [x] T011 [P] [US1] Add header tests for compact breadcrumb, chip/context, overflow actions and accessible names in `app/features/tasks/components/WorkspaceHeader.test.ts`. **Refs: FR-002, FR-004, IMG-UX-03**
- [x] T012 [US1] Add TaskWorkspace tests for tablet drawer default/focus, adjacent regions, pending propagation and primary-action maximum in `app/features/tasks/components/TaskWorkspace.test.ts`. **Refs: FR-002, FR-003, FR-006, FR-010, IMG-UX-03**
- [x] T013 [US1] Run T011–T012 and record valid red in `implementation-evidence.md`.
- [x] T014 [US1] Implement compact header/overflow in `WorkspaceHeader.vue`, reusing existing emitted actions.
- [x] T015 [US1] Implement tablet region ownership and independent overflow in `TaskWorkspace.vue` and owning agent styles without changing chat behavior.
- [x] T016 [US1] Run focused green and regress existing `WorkspaceHeader`, `TaskWorkspace`, `AgentPanel` and shell tests; synchronize evidence.

**Checkpoint**: IMG-UX-03 structural behavior passes Capa A.

---

## Phase 4: User Story 2 — mobile single plane (Priority: P1)

**Goal**: exact context line, safe pane switching, complete fields/footer and task-local restoration.

**Independent Test**: fill stage + agent draft, switch both ways and change tasks; values, pane and logical focus survive. **Refs: IMG-UX-04**

- [x] T017 [US2] Add TaskWorkspace tests for exact context line, pending dot aggregation, pane events, draft/field preservation and focus in `TaskWorkspace.test.ts`. **Refs: FR-005–FR-008, IMG-UX-04**
- [x] T018 [P] [US2] Add GuidedPhaseForm responsive contract tests for full field/counter presence, centered save text and single full-width primary semantics in `GuidedPhaseForm.test.ts`. **Refs: FR-009, FR-010, IMG-UX-04**
- [x] T019 [US2] Run T017–T018 and record valid red in `implementation-evidence.md`.
- [x] T020 [US2] Recompose mobile context/panes minimally in `TaskWorkspace.vue` and `WorkspaceHeader.vue`, preserving 012–014 DOM/data behavior.
- [x] T021 [US2] Adjust only responsive owner styles in `GuidedPhaseForm.vue`/`WorkspacePaneTabs.vue` so fields precede nonessential meta and footer meets IMG-UX-04.
- [x] T022 [US2] Run focused green plus all phase component regressions and synchronize evidence.

**Checkpoint**: IMG-UX-04 behavior passes Capa A at component level.

---

## Phase 5: User Story 3 — 320 px, zoom and accessibility (Priority: P2)

**Goal**: no lost content, overflow or overlap under narrow/reflow conditions.

- [x] T023 [US3] Add Playwright responsive journey tests for 1024 tablet, 390 stage/agent, 320 field/list completeness, pane persistence/draft and primary maximum in `tests/e2e/stage-agent-workspace.spec.ts`. **Refs: FR-003, FR-007–FR-011, IMG-UX-03, IMG-UX-04**
- [x] T024 [US3] Add visual contract assertions/snapshots for IMG-UX-03 tablet agent and IMG-UX-04 mobile stage/agent at 390 and 320 in `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`. **Refs: FR-011–FR-013, IMG-UX-03, IMG-UX-04**
- [x] T025 [P] [US3] Extend geometry helpers/tests for document/pane horizontal overflow, region overlap, independent scroll and 200% zoom in `tests/e2e/helpers/visual-geometry.ts` and `.test.ts`.
- [x] T026 [US3] Add axe contrast checks for both panes and record exact scenario/viewports in the visual spec.
- [x] T027 Run T023–T026 with one explicit server/base URL and `--workers=1`; record valid contract red without snapshot update.
- [x] T028 Implement only the responsive CSS/attributes required by T027 in owning frontend components; do not weaken tests or update baselines.
- [x] T029 Re-run functional/visual contract to green, then helper regressions; synchronize evidence.

**Checkpoint**: Capa B contract green; visual acceptance remains pending.

---

## Phase 6: Capa C and human visual gate

- [x] T030 Capture candidate ACTUAL images for IMG-UX-03/04 into `specs/015-responsive-workspace/evidence/actual/` without changing baselines; verify baseline hashes.
- [x] T031 Complete ACTUAL vs IMG-UX-03/04 comparison in `evidence/visual-comparison.md` across hierarchy, content, geometry, interaction, responsive and accessibility.
- [ ] T032 Request explicit human review; keep `HUMAN_DECISION_REQUIRED` until approved.
- [ ] T033 Only after T032 approval, update the selected baselines and rerun the same selection idempotently.

---

## Phase 7: Regression, review and publication

- [x] T034 Run Capa A, `npm run typecheck`, affected E2E/visual contracts and `npm run verify`; record exact counts/exit codes.
- [x] T035 Run `git diff --check`, `graphify update .` and graph/structure verification; exclude Graphify caches, SQLite and unrelated evidence from staging.
- [x] T036 Launch independent patch review; resolve actionable findings through a new test-first cycle and record verdict.
- [x] T037 Audit status, stage explicit 015/frontend/test paths, run `git diff --cached --check`, commit and push only `origin/codex/015-responsive-workspace`; record SHA/upstream.

## Dependencies and execution order

- Phase 1 blocks all edits.
- Phase 2 controller/state foundation blocks tablet/mobile integration.
- Tablet and mobile share owners and run sequentially: Phase 3 then Phase 4.
- Capa B depends on Capa A green; Capa C depends on contract green.
- Baseline update depends on explicit human approval; publication may report that gate pending but cannot claim visual approval.
- Within every block: tests → expected red → evidence → minimum implementation → green/regression → ledger sync.

## Task summary

- Total: 37 tasks.
- US1 tablet: 6 story tasks plus shared gates.
- US2 mobile/state: 12 story tasks plus shared gates.
- US3 narrow/zoom/a11y: 7 story tasks plus shared gates.
- Human-only gate: T032; baseline update protected by T033.
