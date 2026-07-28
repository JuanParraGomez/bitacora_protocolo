# Tasks: Workspace conversacional de soluciones repetibles

**Input**: Design documents from `/specs/006-conversational-task-workspace/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Mandatory. Every behavioral block starts with complete tests and an observed expected red result before production implementation.

**Organization**: Tasks are grouped by user story. US1 is the core problem-to-method workflow; US2–US5 remain independently demonstrable after the shared foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it owns different files and has no incomplete dependency.
- **[Story]**: Maps to US1–US5 in spec.md.
- Every task includes exact file paths.

## Phase 1: Setup and test harness

**Purpose**: Establish traceability and isolated fixtures before behavior changes.

- [x] T001 Extend the 006 requirement-to-test mapping in `tests/TEST-MATRIX.md` with FR-001–FR-039, SC-001–SC-012 and the owning test file for each automated criterion
- [x] T002 [P] Add reusable project, method-version, iteration and automation-candidate builders in `tests/fixtures/tasks/conversational-workspace-task.ts`
- [x] T003 [P] Add isolated two-project, legacy-project, repeatable-v1 and material-v2 fixture definitions in `scripts/create-legacy-fixtures.mjs` and document them in `tests/fixtures/legacy/manifest.json`
- [x] T004 Create one append-only red/green evidence ledger with command, expected red cause, green result and human-only SC-002/SC-003/SC-010 boundaries in `specs/006-conversational-task-workspace/implementation-evidence.md`

---

## Phase 2: Foundational storage, schemas and migration

**Purpose**: Provide atomic multi-key writes, project identity and additive task repair required by every story.

**CRITICAL**: No user story implementation begins until T005–T018 are green.

### Tests first

- [x] T005 [P] Write happy, empty, oversized, duplicate-key, exact ID charset/length, historical-ID, forbidden-key and repository-failure atomicity tests for `POST /api/storage/batch` in `tests/contract/storage-batch.contract.test.ts`, run them, and record the expected red result
- [x] T006 [P] Write ProjectCollection and Project schema tests for empty, legacy, archived, duplicate, invalid recent-task and repaired active-project cases in `app/features/tasks/domain/project.schema.test.ts`, run them, and record red
- [x] T007 [P] Extend task schema tests for schemaVersion 2, projectId defaults, stage additions, exact diagnostic preservation of unknown/invalid fields, recursive case-insensitive/NFKC secret-key redaction including nested password/authorization/cookie/privateKey/clientSecret cases, and idempotent repair in `app/features/tasks/domain/task-assistant.schema.test.ts`, run them, and record red
- [x] T008 [P] Extend historical fixture coverage for empty, interrupted, malformed, custom prompts, assistant secrets and pre-assistant tasks in `tests/migration/compatibility-store.test.ts`, run it, and record red
- [x] T009 [P] Write project-store tests for synthesized legacy, create, rename, archive, recent-task repair and storage failure recovery in `app/features/tasks/services/project-store.test.ts`, run them, and record red
- [x] T010 Extend persistence tests for atomic create, move, complete, delete and interrupted batch rollback in `tests/integration/task-persistence.test.ts`, run them, and record red

### Minimal implementation

- [x] T011 Implement bounded batch operation contracts, exact `^[A-Za-z0-9][A-Za-z0-9._:@-]{0,199}$` suffix validation and closed key allowlist in `shared/contracts/storage.ts` and `shared/schemas/storage.ts`
- [x] T012 Implement transactional batch execution and all-or-nothing errors in `server/repositories/kv-store.repository.ts` and `server/api/storage/batch.post.ts`
- [x] T013 Implement ProjectCollection, reserved `legacy` project and repair rules in `app/features/tasks/domain/project.schema.ts`
- [x] T014 Extend task, index, f1–f4 and iteration schemas with additive 006 fields, MigrationEnvelope preservation/redaction and idempotent schemaVersion 2 repair in `app/features/tasks/domain/task.schema.ts`
- [x] T015 Implement project persistence and legacy synthesis over `bitacora:projects` in `app/features/tasks/services/project-store.ts`
- [x] T016 Integrate batch writes and projectId denormalization without removing existing single-key methods in `app/features/tasks/services/task-store.ts`
- [x] T017 Migrate completion and deletion multi-key operations to the batch contract in `app/features/tasks/services/task-completion.ts` and `app/features/tasks/services/task-deletion.ts`
- [x] T018 Run the focused Phase 2 suites from `specs/006-conversational-task-workspace/quickstart.md`, correct only Phase 2 defects, and append green evidence in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: Existing fixtures remain readable; project/task/index changes are atomic and project-aware.

---

## Phase 3: User Story 1 - Convertir un problema en un método repetible (Priority: P1) MVP

**Goal**: Produce an outcome-based workflow, immutable method versions, evidence-derived maturity and an automation map.

**Independent Test**: Create a task from free text, complete the four outcome stages, record two successful executions of one method version and obtain a repeatable method plus automation candidates.

### Tests first

- [x] T019 [P] [US1] Write MethodVersion, SolutionStep, EvidenceReference and AutomationOpportunity schema tests covering required nextAdjustment, explicit no-exception review, valid, empty, cross-version, duplicate and unsafe-content cases in `app/features/tasks/domain/method-evidence.schema.test.ts`, run them, and record red
- [x] T020 [P] [US1] Extend gate tests for every FR-020–FR-025 minimum, contradictions, stale edits, one successful run, two same-version runs and material-version reset in `app/features/tasks/domain/task-rules.test.ts`, run them, and record red
- [x] T021 [P] [US1] Extend assistant evaluation tests for `legacy-v1`, `outcome-v2`, response revision and methodVersionId freshness in `app/features/tasks/domain/task-assistant-rules.test.ts`, run them, and record red
- [x] T022 [P] [US1] Add contract tests for stage labels, required deliverables and exactly one current outcome in `tests/contract/task-workflow.contract.test.ts`, run them, and record red
- [ ] T023 [US1] Add an end-to-end red scenario for problem → decomposition → iteration → consolidated method in `tests/e2e/conversational-workspace.spec.ts`

### Implementation

- [x] T024 [US1] Implement method, evidence, maturity and automation candidate schemas in `app/features/tasks/domain/method-evidence.schema.ts`
- [x] T025 [US1] Implement outcome-v2 stage gates, immutable method-version transitions and derived maturity in `app/features/tasks/domain/task-rules.ts`
- [x] T026 [US1] Implement outcome-v2 revisions and evaluation compatibility without treating legacy acceptance as current in `app/features/tasks/domain/task-assistant.schema.ts` and `app/features/tasks/domain/task-assistant-rules.ts`
- [x] T027 [US1] Replace phase-facing labels and question catalog with Entender, Descomponer, Ejecutar e Iterar, and Consolidar y Automatizar in `app/features/tasks/domain/phase-instructions.ts`
- [x] T028 [US1] Extend the four existing stage forms with the minimum fields from FR-020–FR-025 in `app/features/tasks/components/OrientationPhase.vue`, `app/features/tasks/components/GuidancePhase.vue`, `app/features/tasks/components/ExecutionPhase.vue` and `app/features/tasks/components/ReviewPhase.vue`
- [x] T029 [US1] Implement stage deliverable, missing-field, contradiction, gate and method-maturity presentation in `app/features/tasks/components/StructuredStageSummary.vue`
- [x] T030 [US1] Recompose stage progression around outcome-v2 gates and preserve later legacy data in `app/features/tasks/components/GuidedPhaseForm.vue`
- [x] T031 [US1] Enforce task completion independent from derived method maturity and preserve version history in `app/features/tasks/services/task-completion.ts`
- [x] T032 [US1] Run US1 domain, contract, integration and focused Playwright suites, fix US1 regressions, and append the green checkpoint in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: US1 independently turns a problem into a consolidated method with honest evidence status.

---

## Phase 4: User Story 2 - Responder conversando y confirmar de forma simple (Priority: P2)

**Goal**: Let chat and direct form editing produce the same confirmed structured data without autoapplying assistant output.

**Independent Test**: Complete one stage through chat, one through direct editing and one mixed; accept, edit, reject and conflict proposals while confirmed human edits prevail.

### Tests first

- [x] T033 [P] [US2] Add request/response tests for project/task/phase/method identity, one primary question, no repeated confirmed question, closed field paths, malformed output and retry in `app/features/tasks/services/mock-workspace-assistant.test.ts`, run them, and record red
- [x] T034 [P] [US2] Extend proposal-rule tests for pending-by-default, accept, edit, reject, duplicate decision, stale revision, wrong project/task/phase and wrong method version in `app/features/tasks/domain/task-assistant-rules.test.ts`, run them, and record red
- [x] T035 [P] [US2] Add Playwright red scenarios for proposal cards and chat/form equivalence in `tests/e2e/conversational-workspace.spec.ts`
- [x] T036 [US2] Extend persistence tests so pending/applied/rejected/conflict proposals survive reopen without changing confirmed fields in `tests/integration/task-persistence.test.ts`, run them, and record red

### Implementation

- [x] T037 [US2] Extend the assistant turn schema with primaryQuestion, contradictions and explicit proposal decisions in `app/features/tasks/domain/task-assistant.schema.ts`
- [x] T038 [US2] Change update rules from autoapply to idempotent accept/edit/reject with current-revision checks in `app/features/tasks/domain/task-assistant-rules.ts`
- [x] T039 [US2] Make the deterministic assistant ask one gap-driven question and return safe pending proposals in `app/features/tasks/services/mock-workspace-assistant.ts`
- [x] T040 [US2] Render proposal value, previous value and Accept/Edit/Discard actions without automatic mutation in `app/features/tasks/components/TaskChat.vue`
- [x] T041 [US2] Show only question-related fields, proposals and contradictions and hide the summary box when useless in `app/features/tasks/components/StructuredStageSummary.vue`
- [x] T042 [US2] Orchestrate proposal decisions, dirty/save events and late-response conflicts in `app/features/tasks/components/TaskWorkspace.vue`
- [x] T043 [US2] Run US2 focused unit, persistence and Playwright suites and append green evidence in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: Chat is optional guidance, direct editing remains complete, and no model response silently overwrites the person.

---

## Phase 5: User Story 3 - Mantener el contexto al navegar (Priority: P3)

**Goal**: Provide persistent projects/tasks navigation and restore each task's exact working context.

**Independent Test**: Switch between two projects and tasks, create another, return and recover messages, draft, stage, expanded summary and last visible message.

### Tests first

- [x] T044 [P] [US3] Write project-aware grouping tests for active, paused, completed, archived, empty and legacy tasks in `app/features/tasks/composables/useTaskIndex.test.ts`, run them, and record red
- [x] T045 [P] [US3] Write workspace-state tests for project/task selection, draft, summary state, last-visible-message ID and late response isolation in `app/features/tasks/composables/useWorkspaceState.test.ts`, run them, and record red
- [x] T046 [P] [US3] Add Playwright red scenarios for create/rename projects, rename/search tasks, two-project navigation, project empty state, two-action task recovery and keyboard order in `tests/e2e/conversational-workspace.spec.ts`
- [x] T047 [US3] Extend atomic move-task persistence tests, including failure rollback and stale recentTaskId repair, in `app/features/tasks/services/project-store.test.ts`, run them, and record red

### Implementation

- [x] T048 [US3] Implement project-aware task grouping and operational states in `app/features/tasks/composables/useTaskIndex.ts`
- [x] T049 [US3] Implement per-task draft, summary and message-anchor restoration in `app/features/tasks/composables/useWorkspaceState.ts`
- [x] T050 [US3] Replace decorative phase rows with collapsible projects, create/rename project controls, rename/search task controls, useful summaries and complete keyboard order in `app/features/tasks/components/DashboardSidebar.vue`
- [x] T051 [P] [US3] Implement compact project/task/stage identity and mobile navigation triggers in `app/features/tasks/components/WorkspaceHeader.vue`
- [x] T052 [US3] Recompose `TaskWorkspace` as sidebar plus one conversation surface with no permanent third panel in `app/features/tasks/components/TaskWorkspace.vue`
- [x] T053 [US3] Load active project/recent task and persist project changes at the page composition root in `pages/tasks/[id].vue`
- [x] T054 [US3] Make `pages/index.vue` select the latest project/task or render the first-project-and-task empty state without a detached page
- [x] T055 [US3] Run US3 unit, persistence and Playwright suites at desktop, tablet, 320 px and 200% zoom and append green evidence in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: Project/task navigation behaves like a modern chat history and restores context by identifiers.

---

## Phase 6: User Story 4 - Usar ventanas contextuales sin interrumpir el trabajo (Priority: P4)

**Goal**: Use the correct modal, slideover and notice behavior while preserving the shell and unsaved work.

**Independent Test**: Open/close New task, Library and Settings from a dirty task, trigger success/error notices, use Back/Forward and verify context/focus preservation.

### Tests first

- [ ] T056 [P] [US4] Add isolated red component tests for TaskIntakeForm validation/emission in `app/features/tasks/components/TaskIntakeForm.test.ts` and Playwright red scenarios for New task project requirement, name-or-problem alternatives, length boundaries, invalid input, unsaved close protection, focus trap/restore and successful composer focus in `tests/e2e/workspace-overlays.spec.ts`
- [ ] T057 [P] [US4] Add Playwright red scenarios for modeless desktop Library, full-width mobile Library, query/deep-link compatibility and Back/Forward in `tests/e2e/workspace-overlays.spec.ts`
- [ ] T058 [P] [US4] Add Playwright red scenarios for Settings context preservation/focus lifecycle and nonmodal success/error notices, maximum three, dismiss/retry and no focus movement in `tests/e2e/workspace-overlays.spec.ts`

### Implementation

- [ ] T059 [US4] Refactor `TaskIntakeForm` to emit validated data without navigation or persistence in `app/features/tasks/components/TaskIntakeForm.vue`
- [ ] T060 [US4] Implement project-aware New task modal, dirty confirmation and focus lifecycle in `app/features/tasks/components/NewTaskModal.vue`
- [ ] T061 [US4] Implement notice queue, live-region semantics and bounded visible notices in `app/features/tasks/components/NoticeRegion.vue` and `app/features/tasks/composables/useWorkspaceNotices.ts`
- [ ] T062 [US4] Implement modeless desktop/full-width mobile Library composition in `app/features/library/components/LibrarySlideover.vue`
- [ ] T063 [US4] Coordinate exactly one active overlay and query history in `app/features/tasks/composables/useWorkspaceState.ts` and `pages/tasks/[id].vue`
- [ ] T064 [US4] Preserve `/tasks/new`, `/library` and `/library/[id]` as shell-deep-link entry points in `pages/tasks/new.vue`, `pages/library/index.vue` and `pages/library/[id].vue`
- [ ] T065 [US4] Align Settings with the common dialog/focus contract without changing provider persistence in `app/features/tasks/components/AssistantSettingsModal.vue`
- [ ] T066 [US4] Run the complete overlay Playwright file with keyboard, mobile viewport and dirty-state cases and append green evidence in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: Auxiliary actions no longer replace the workspace; only real decisions block the background.

---

## Phase 7: User Story 5 - Reutilizar conocimiento y oportunidades de automatización (Priority: P5)

**Goal**: Search and link project-scoped methods/tools/learnings and expose evidence-based automation candidates without overwriting task data.

**Independent Test**: Save a completed method, find it from another project/task, link it as a reference, and inspect hypothesis/candidate evidence without copying confirmed fields.

### Tests first

- [ ] T067 [P] [US5] Write library record schema tests for method, tool, learning, automation candidate, project origin, missing source and inert content in `app/features/library/domain/library-record.schema.test.ts`, run them, and record red
- [ ] T068 [P] [US5] Write library-store tests for search, type/project filters, source preservation, missing record and reference-only linking in `app/features/library/services/library-store.test.ts`, run them, and record red
- [ ] T069 [P] [US5] Add Playwright red scenarios for search, list/detail, link without overwrite, empty/error recovery and automation evidence labels in `tests/e2e/workspace-library.spec.ts`

### Implementation

- [ ] T070 [US5] Extend library records with resource kind, projectId, source task/method and automation evidence in `app/features/library/domain/library-record.schema.ts`
- [ ] T071 [US5] Implement project/type search and idempotent reference linking without task-field mutation in `app/features/library/services/library-store.ts`
- [ ] T072 [US5] Adapt Library list and detail to selection events, filters and source/evidence presentation in `app/features/library/components/LibraryList.vue` and `app/features/library/components/LibraryRecordView.vue`
- [ ] T073 [US5] Wire LibrarySlideover search, detail and Link actions to the active task at the page root in `app/features/library/components/LibrarySlideover.vue` and `pages/tasks/[id].vue`
- [ ] T074 [US5] Generate reusable method, tool, learning and candidate records from consolidated task data in `app/features/tasks/services/task-completion.ts`
- [ ] T075 [US5] Render manual/assistable/automatable classifications and hypothesis/candidate-with-evidence labels in `app/features/tasks/components/ReviewPhase.vue`
- [ ] T076 [US5] Run US5 library unit, integration and Playwright suites and append green evidence in `specs/006-conversational-task-workspace/implementation-evidence.md`

**Checkpoint**: Knowledge is reusable and automation claims remain explicitly evidence-bounded.

---

## Phase 8: Polish and cross-cutting verification

**Purpose**: Prove compatibility, safety, accessibility, architecture freshness and complete documentation.

- [ ] T077 [P] Expand fixture generation with schemaVersion 2 round-trip, two successful same-version runs and material-version reset in `scripts/create-legacy-fixtures.mjs` and `tests/fixtures/legacy/manifest.json`
- [ ] T078 [P] Add security regressions for inert HTML, prompt injection, unsafe links, forbidden batch keys and secret-like assistant settings in `tests/e2e/conversational-workspace.spec.ts` and `tests/migration/compatibility-store.test.ts`
- [ ] T079 [P] Add accessibility regressions for landmarks, keyboard order, dialog focus, modeless Library, live regions, reduced motion and 200% zoom in `tests/e2e/workspace-overlays.spec.ts`
- [ ] T080 Run all historical Nuxt and legacy workflow suites, update only expectations intentionally superseded by 006, and document preserved deep links in `tests/e2e/nuxt-task-workflows.spec.ts`, `tests/e2e/legacy-phase-workflows.spec.ts` and `tests/e2e/legacy-task-workflows.spec.ts`
- [ ] T081 Update capability ownership, new batch contract, project key, migration checkpoints and deferred automation/provider criteria in `app/features/README.md`, `docs/architecture/README.md` and `docs/architecture/migration-checkpoints.md`
- [ ] T082 Update generated structure evidence and its regression expectation via `scripts/generate-structure.mjs`, `docs/architecture/structure.md` and `tests/integration/structure-snapshot.test.ts`
- [ ] T083 Refresh the allowlisted Graphify code graph and verify it is current using `scripts/graphify-workflow.mjs` and `graphify-out/`
- [ ] T084 Run every focused command and migration checkpoint from `specs/006-conversational-task-workspace/quickstart.md` and record actual outcomes in that file
- [ ] T085 Run `npm run verify` and `npm run verify:e2e`, correct regressions within 006 scope, and record final automated evidence in `specs/006-conversational-task-workspace/quickstart.md`
- [ ] T086 Conduct the human study required by SC-002, SC-003 and SC-010 with at least 10 participants and record method, raw outcomes and pass/fail without substituting automated evidence in `specs/006-conversational-task-workspace/usability-results.md`

---

## Dependencies and execution order

### Phase dependencies

- **Phase 1**: starts immediately.
- **Phase 2**: depends on test builders from Phase 1 and blocks every user story.
- **US1**: starts after Phase 2 and is the MVP.
- **US2**: starts after Phase 2 for assistant-domain work; T041–T043 depend on US1 T029–T030 and then remain independently demonstrable on one stage.
- **US3**: starts after Phase 2; can proceed in parallel with US1/US2 using the legacy default project.
- **US4**: T056–T062 and T065 start after Phase 2; T063–T066 depend on US3 T049 and page composition.
- **US5**: T067–T072 start after Phase 2; T073 depends on US4 T062–T064, and T074–T076 depend on US1 plus that Library integration.
- **Phase 8**: depends on all selected stories; T086 remains human-only.

### User story dependency graph

```text
Setup -> Foundation -> US1 -> US2 ───────┐
                    └-> US3 -> US4       ├-> Polish
                         US1 + US4 -> US5┘
```

### Within each story

- Test tasks must run and fail for the expected missing behavior before implementation.
- Schemas and pure rules precede stores.
- Stores precede page orchestration.
- Components precede end-to-end green checkpoints.
- A story checkpoint must be green before its implementation is marked complete.

## Parallel opportunities

- T002, T003 and T004 can run in parallel.
- T005–T010 own separate test files and can run in parallel.
- T019–T022 can run in parallel before US1 implementation.
- T033–T035 can run in parallel before US2 implementation.
- T044–T046 can run in parallel before US3 implementation.
- T056–T058 can run in parallel before overlay implementation.
- T067–T069 can run in parallel before US5 implementation.
- T077–T079 can run in parallel after story completion.
- After Phase 2, US1, US3, assistant-domain US2 and overlay primitives from US4 can be assigned separately; integration tasks follow the explicit dependency graph.

## Parallel examples

### User Story 1

```text
Agent A: T019 then T024 in method-evidence files.
Agent B: T020 then T025 in task-rules files.
Agent C: T021 then T026 in assistant domain files.
Agent D: T022 then T027 in workflow contract/instructions.
```

### User Story 3

```text
Agent A: T044 then T048 in useTaskIndex files.
Agent B: T045 then T049 in useWorkspaceState files.
Agent C: T046 then T050–T052 in workspace UI files after contracts stabilize.
```

### User Story 4

```text
Agent A: T056 then T059–T060 for New task.
Agent B: T057 then T062–T064 for Library/deep links.
Agent C: T058 then T061 for notices.
```

## Implementation strategy

### MVP first

1. Complete Phase 1.
2. Complete Phase 2 and prove legacy compatibility.
3. Complete US1.
4. Stop and validate the full problem-to-method journey independently.
5. Do not claim repeatability unless two successful executions reference the same method version.

### Incremental delivery

1. Foundation: atomic storage and additive migration.
2. US1: honest end-to-end solution artifact.
3. US2: simpler chat/form interaction.
4. US3: modern project/task navigation.
5. US4: non-destructive overlays.
6. US5: reusable library and automation evidence.
7. Polish: aggregate and human validation.

## Notes

- `[P]` means distinct write ownership, not permission to skip dependencies.
- Never edit production before the corresponding red task.
- Existing prompts remain inert and preserved.
- Existing `/legacy`, `/tasks/new` and `/library/*` entry points remain available.
- Automated suites cannot complete T086.
- Commit and push each authorized logical block on `codex/006-conversational-task-workspace`, never directly to `main`.
