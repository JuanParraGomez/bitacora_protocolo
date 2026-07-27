# Tasks: Espacio de trabajo guiado por IA

**Input**: Design documents from `/specs/005-workspace-ai-guiado/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/assistant-adapter.md`, `contracts/task-workspace-ui.md`, `quickstart.md`

**Tests**: Mandatory and test-first. Every dependency, domain, persistence and interface change starts with complete happy-path, boundary, invalid-input, failure/recovery and regression tests; the focused test must fail for the expected missing behavior before production code is written.

**Organization**: Tasks are grouped by user story so each increment can be implemented, validated and committed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it edits different files and has no dependency on incomplete work
- **[Story]**: User story from `spec.md`
- Every task names its exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce Nuxt UI through a verified dependency and shell change before feature behavior.

- [x] T001 Write a configuration contract covering the Nuxt UI module, global stylesheet, `UApp` root and absence of AI SDK/Vueform in `tests/contract/nuxt-ui-setup.test.ts`.
- [x] T002 Run `tests/contract/nuxt-ui-setup.test.ts` and record the expected missing-module/root failure in `specs/005-workspace-ai-guiado/quickstart.md`.
- [x] T003 Install Nuxt UI 4.10 and Tailwind CSS 4.3 with lockfile updates in `package.json` and `package-lock.json`, register the module and stylesheet in `nuxt.config.ts`, add tokens/imports in `app/assets/css/main.css` and `app.config.ts`, and wrap the application in `UApp` in `app.vue`.
- [x] T004 Run `tests/contract/nuxt-ui-setup.test.ts`, `npm run typecheck` and `npm run build` until green, documenting any compatibility correction in `specs/005-workspace-ai-guiado/quickstart.md`.

**Checkpoint**: Nuxt UI builds inside the existing single runtime without provider or form-engine dependencies.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the repairable assistant model, phase revisions, trusted instructions and persistence contracts used by every story.

**⚠️ CRITICAL**: No user story implementation begins until this phase is green.

- [ ] T005 [P] Write complete red schema tests for messages, typed field updates, evaluations, settings, invalid cross-task/cross-phase data and repair of tasks without assistant state in `app/features/tasks/domain/task-assistant.schema.test.ts`.
- [ ] T006 [P] Write complete red rule tests for canonical phase snapshots, stable revisions, prompt exclusion, stale evaluations, gate-plus-evaluation continuation and response conflicts in `app/features/tasks/domain/task-assistant-rules.test.ts`.
- [ ] T007 [P] Write red compatibility and round-trip tests for assistant state, preserved legacy prompts, malformed assistant data and settings without secrets in `tests/integration/task-persistence.test.ts` and `tests/migration/compatibility-store.test.ts`.
- [ ] T008 Run the tests from T005–T007 and confirm they fail for missing assistant schemas, rules and persistence behavior before editing production files in `specs/005-workspace-ai-guiado/quickstart.md`.
- [ ] T009 Implement closed schemas and repairable defaults for `AssistantMessage`, `FormUpdate`, `PhaseEvaluation`, `AssistantState` and `AssistanceSettings` in `app/features/tasks/domain/task-assistant.schema.ts`.
- [ ] T010 Extend `Task` with repaired assistant state while preserving every legacy prompt and existing phase field in `app/features/tasks/domain/task.schema.ts`.
- [ ] T011 [P] Normalize the trusted Socratic, phase-specific and AAR criteria from the legacy source into immutable application-owned entries in `app/features/tasks/domain/phase-instructions.ts`.
- [ ] T012 Implement phase snapshots, stable revisions, typed update validation, current-evaluation selection, conflict detection and the combined continuation rule in `app/features/tasks/domain/task-assistant-rules.ts`.
- [ ] T013 Integrate the combined continuation rule without weakening existing deterministic gates or finalization behavior in `app/features/tasks/domain/task-rules.ts`.
- [ ] T014 Extend task persistence mapping for assistant state and safe defaults without adding settings, credentials or assistant-specific server endpoints in `app/features/tasks/services/task-store.ts`.
- [ ] T015 Run `app/features/tasks/domain/task-assistant.schema.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts`, `tests/integration/task-persistence.test.ts`, `tests/migration/compatibility-store.test.ts`, `app/features/tasks/domain/task-rules.test.ts` and `app/features/tasks/services/task-store.test.ts` until green.

**Checkpoint**: Legacy and new tasks share a safe model; evaluations can be proven current before enabling continuation.

---

## Phase 3: User Story 1 - Trabajar en un dashboard de tres paneles (Priority: P1) 🎯 MVP

**Goal**: Present active/completed tasks, chat placeholder and the current phase form in a responsive, keyboard-accessible dashboard.

**Independent Test**: Open an existing task, identify and traverse all three named regions, change active task, reach New Task, and open the same content at 320 px without losing access.

### Tests for User Story 1 ⚠️

- [ ] T016 [US1] Write failing Playwright scenarios for the three desktop regions, active/completed task groups, active task state, New Task, empty index, safe task switching and keyboard order in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T017 [US1] Extend the red scenarios with 320 px, 200% zoom, dashboard sidebar toggle, questionnaire slideover, focus restoration and no lost form state in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T018 [US1] Run the US1 Playwright scenarios and confirm the expected failure is the absent dashboard rather than fixture or storage setup in `specs/005-workspace-ai-guiado/quickstart.md`.

### Implementation for User Story 1

- [ ] T019 [P] [US1] Extract safe loading, grouping, selection and refresh of `index.tareas` and `index.registros` into `app/features/tasks/composables/useTaskIndex.ts`.
- [ ] T020 [P] [US1] Implement the project label, Activas/Completadas groups, active task semantics, empty state, New Task and sidebar footer slots in `app/features/tasks/components/DashboardSidebar.vue`.
- [ ] T021 [P] [US1] Create a single-source responsive phase container with desktop panel and mobile slideover triggers in `app/features/tasks/components/GuidedPhaseForm.vue`.
- [ ] T022 [US1] Recompose navigation, central placeholder and current phase form with `UDashboardGroup`, `UDashboardSidebar` and two `UDashboardPanel` regions in `app/features/tasks/components/TaskWorkspace.vue`.
- [ ] T023 [US1] Make the task page load the index, guard pending saves during task changes and host the full-height dashboard in `pages/tasks/[id].vue`.
- [ ] T024 [US1] Route the home page to the safe active-task or empty-dashboard entry and keep task creation reachable in `pages/index.vue` and `pages/tasks/new.vue`.
- [ ] T025 [US1] Remove the duplicated horizontal task navigation while retaining library, reference and legacy access where appropriate in `app/components/shared/AppNavigation.vue` and `app.vue`.
- [ ] T026 [US1] Run `tests/e2e/guided-workspace.spec.ts` and `tests/e2e/nuxt-task-workflows.spec.ts`, then run the typecheck/build scripts defined in `package.json` until green.

**Checkpoint**: The dashboard shell and task navigation are a releasable frontend slice even before conversational behavior.

---

## Phase 4: User Story 2 - Nutrir el formulario mediante conversación (Priority: P2)

**Goal**: Allow deterministic chat turns and safe, visible updates to all existing fields of the active phase without rendering editable prompts.

**Independent Test**: Send and retry messages in each phase, apply only expected typed updates, edit them manually, switch contexts safely and reopen with the same history.

### Tests for User Story 2 ⚠️

- [ ] T027 [P] [US2] Write red adapter tests for workspace label, the latest five same-phase evaluations, successful turns, suggestions, allowed updates per phase, empty/long/instruction-like input, delay, malformed output, unavailability and retry deduplication in `app/features/tasks/services/mock-workspace-assistant.test.ts`.
- [ ] T028 [P] [US2] Write red domain tests for applying, rejecting and conflicting field updates when task, phase or base revision changes in `app/features/tasks/domain/task-assistant-rules.test.ts`.
- [ ] T029 [US2] Write red Playwright scenarios for initial message, suggestions, sending/error/retry states, typed form updates, direct-edit precedence, task/phase isolation and persisted history in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T030 [US2] Replace prompt-visible expectations with red assertions for complete guided forms and absence of editable prompt controls across all four phases in `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T031 [US2] Run the tests from T027–T030 and confirm missing chat/update behavior and still-rendered prompts are the expected red reasons in `specs/005-workspace-ai-guiado/quickstart.md`.

### Implementation for User Story 2

- [ ] T032 [P] [US2] Implement deterministic `send()` fixtures with workspace label, bounded same-phase evaluation history and schema validation for success, delay, malformed, unavailable and late-response cases in `app/features/tasks/services/mock-workspace-assistant.ts`.
- [ ] T033 [P] [US2] Implement accessible messages, suggestions, composer, submit state, retry and update feedback with `UChatMessages`, `UChatPrompt` and `UChatPromptSubmit` in `app/features/tasks/components/TaskChat.vue`.
- [ ] T034 [US2] Connect chat requests, guarded update application, persistence and context cancellation to the single task source of truth in `app/features/tasks/components/TaskWorkspace.vue`.
- [ ] T035 [US2] Expose every persisted functional field while removing `PromptBox` imports/renders from `app/features/tasks/components/OrientationPhase.vue`, `app/features/tasks/components/GuidancePhase.vue`, `app/features/tasks/components/ExecutionPhase.vue` and `app/features/tasks/components/ReviewPhase.vue`.
- [ ] T036 [US2] Keep legacy `prompt*` values untouched through edits, saves and reloads while persisting assistant messages and update states in `pages/tasks/[id].vue`.
- [ ] T037 [US2] Run `app/features/tasks/services/mock-workspace-assistant.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts`, `tests/integration/task-persistence.test.ts`, `tests/e2e/guided-workspace.spec.ts` and `tests/e2e/nuxt-task-workflows.spec.ts` until green.

**Checkpoint**: A person can complete every phase through chat or direct form editing without seeing or manipulating a prompt.

---

## Phase 5: User Story 3 - Evaluar e iterar hasta poder continuar (Priority: P3)

**Goal**: Produce versioned weaknesses and recommendations, invalidate stale acceptance and allow advancement only after a current acceptable evaluation.

**Independent Test**: Evaluate incomplete answers, correct them, reevaluate successfully, edit again to make acceptance stale, and finish the four-phase flow only after fresh acceptance.

### Tests for User Story 3 ⚠️

- [ ] T038 [P] [US3] Write red adapter tests for gate-derived weaknesses, trusted phase criteria, stable results, malformed evaluation, delay, error and prohibition of acceptance with an open gate in `app/features/tasks/services/mock-workspace-assistant.test.ts`.
- [ ] T039 [P] [US3] Write red rule regressions for latest evaluation selection, stale derivation, repeated iterations, phase isolation and combined continuation across phases 1–4 in `app/features/tasks/domain/task-assistant-rules.test.ts` and `app/features/tasks/domain/task-rules.test.ts`.
- [ ] T040 [US3] Write red Playwright scenarios for Evaluate, needs-work feedback, corrections by chat/form, reevaluation, stale acceptance, recoverable failure, Continue and phase-4 completion in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T041 [US3] Run T038–T040 and confirm they fail because evaluation feedback and the combined gate are not yet connected in `specs/005-workspace-ai-guiado/quickstart.md`.

### Implementation for User Story 3

- [ ] T042 [P] [US3] Implement deterministic `evaluate()` from gate reasons and trusted instruction keys with strict response validation in `app/features/tasks/services/mock-workspace-assistant.ts`.
- [ ] T043 [P] [US3] Implement accessible pending, needs-work, acceptable, error, stale and history states in `app/features/tasks/components/EvaluationFeedback.vue`.
- [ ] T044 [US3] Add phase progress, Evaluate, retry, Back and revision-aware Continue controls to `app/features/tasks/components/GuidedPhaseForm.vue`.
- [ ] T045 [US3] Connect evaluation requests, outdated-response rejection, persistence and chat/form iteration history in `app/features/tasks/components/TaskWorkspace.vue`.
- [ ] T046 [US3] Enforce the combined current-evaluation gate while preserving save failure recovery and final record creation in `pages/tasks/[id].vue`.
- [ ] T047 [US3] Run `app/features/tasks/services/mock-workspace-assistant.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts`, `app/features/tasks/domain/task-rules.test.ts`, `tests/integration/task-persistence.test.ts`, `tests/migration/compatibility-store.test.ts` and `tests/e2e/guided-workspace.spec.ts` until green.

**Checkpoint**: The complete evaluate-correct-continue loop works deterministically without a live provider.

---

## Phase 6: User Story 4 - Elegir el modo de asistencia (Priority: P4)

**Goal**: Persist a non-secret Codex or DeepSeek preference through an accessible settings modal.

**Independent Test**: Open Settings from any task, select either mode, save, close, reopen and reload while observing the same deferred selection and no credential fields.

### Tests for User Story 4 ⚠️

- [ ] T048 [P] [US4] Write red persistence tests for default, Codex, DeepSeek, malformed settings repair and rejection of secret-like fields in `app/features/tasks/services/task-store.test.ts`.
- [ ] T049 [US4] Write red Playwright scenarios for opening/closing Settings, focus restoration, exact radio options, deferred explanation, persistence after reload and absence of credential controls in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T050 [US4] Run T048–T049 and confirm the expected missing settings behavior before implementation in `specs/005-workspace-ai-guiado/quickstart.md`.

### Implementation for User Story 4

- [ ] T051 [P] [US4] Implement validated read/write of the non-secret assistance preference in `app/features/tasks/services/task-store.ts`.
- [ ] T052 [P] [US4] Implement the labeled modal, Codex/DeepSeek radio group, deferred status text, save feedback and focus-safe close in `app/features/tasks/components/AssistantSettingsModal.vue`.
- [ ] T053 [US4] Connect the sidebar Settings action and persisted preference without changing mock adapter behavior in `app/features/tasks/components/DashboardSidebar.vue` and `app/features/tasks/components/TaskWorkspace.vue`.
- [ ] T054 [US4] Run `app/features/tasks/services/task-store.test.ts` and `tests/e2e/guided-workspace.spec.ts`, then run the typecheck/build scripts defined in `package.json` until green.

**Checkpoint**: Provider choice is visible and durable but cannot collect or use credentials.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete accessibility, compatibility, architecture evidence and aggregate verification across all stories.

- [ ] T055 [P] Add red accessibility assertions for named landmarks, visible labels, aria-live states, modal/slideover focus, keyboard-only completion and non-color status cues in `tests/e2e/guided-workspace.spec.ts`.
- [ ] T056 [P] Add red security regressions for HTML/instruction-like message content, malformed updates and user-edited legacy prompts remaining inert in `app/features/tasks/domain/task-assistant-rules.test.ts` and `tests/e2e/guided-workspace.spec.ts`.
- [ ] T057 [P] Add red migration fixtures for every historical task shape and verify assistant defaults without data loss in `scripts/create-legacy-fixtures.mjs` and `tests/migration/compatibility-store.test.ts`.
- [ ] T058 Correct presentation, semantics, focus, sanitization and compatibility issues exposed by T055–T057 in `app/assets/css/main.css`, `app/features/tasks/components/TaskChat.vue`, `app/features/tasks/components/GuidedPhaseForm.vue` and `app/features/tasks/domain/task-assistant-rules.ts`.
- [ ] T059 Update capability ownership, deferred real-provider removal criteria and workspace component structure in `app/features/README.md`, `docs/architecture/README.md` and `docs/architecture/migration-checkpoints.md`.
- [ ] T060 Run and document the manual desktop, 320 px, 200% zoom, keyboard, modal, slideover and historical-chat checks in `specs/005-workspace-ai-guiado/quickstart.md`.
- [ ] T061 Run `npm run verify`, resolve every reported failure before proceeding and record the final green command in `specs/005-workspace-ai-guiado/quickstart.md`.
- [ ] T062 Run `npm run verify:e2e` and correct browser regressions in `tests/e2e/guided-workspace.spec.ts` and `tests/e2e/nuxt-task-workflows.spec.ts`.
- [ ] T063 Run `npm run structure:check` and `npm run graph:check`, confirm the expected stale-or-missing architecture evidence result before regeneration, and record the outcome in `specs/005-workspace-ai-guiado/quickstart.md`.
- [ ] T064 Regenerate the committed structure snapshot with `npm run structure` in `docs/architecture/STRUCTURE.md`.
- [ ] T065 Refresh the committed Graphify evidence with `npm run graph:update` in `.graphify/`.
- [ ] T066 Run `npm run structure:check` and `npm run graph:check` until green and record the final architecture evidence verification in `specs/005-workspace-ai-guiado/quickstart.md`.
- [ ] T067 Conduct the guided usability study with 10 participants, verify at least 9 identify chat, form and continuation state correctly, and record method, anonymized outcomes and follow-ups in `specs/005-workspace-ai-guiado/usability-results.md`.

**Checkpoint**: All focused and aggregate checks are green, the responsive experience matches the approved structure and no provider is required.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately and must finish before component work.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational and establishes the dashboard shell.
- **US2 (Phase 4)**: Depends on Foundational and integrates visually with US1; its adapter/domain work can begin independently.
- **US3 (Phase 5)**: Depends on US2 conversation/form integration and the Foundational revision rules.
- **US4 (Phase 6)**: Depends on US1 sidebar; its persistence and modal can otherwise proceed independently.
- **Polish (Phase 7)**: Depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: No story dependency after Foundational; independently delivers navigation and three-region workspace.
- **US2 (P2)**: Adapter and form completeness are independent after Foundational; final UI composition uses the US1 shell.
- **US3 (P3)**: Requires the US2 chat/form iteration surfaces and Foundational evaluation model.
- **US4 (P4)**: Persistence/modal are independent after Foundational; sidebar wiring uses US1.

### Within Each User Story

- Write all complete tests first.
- Run them and confirm the expected red reason.
- Implement schemas/rules before services, services before components and components before page orchestration.
- Run focused plus affected regression suites until green.
- Commit and push each logical block on `codex/005-workspace-ai-guiado`.

### Parallel Opportunities

- T005–T007 cover different foundational test files.
- T019–T021 implement independent US1 units after red tests.
- T027–T028 and T032–T033 separate adapter/domain and presentation work.
- T038–T039 and T042–T043 separate evaluation rules and feedback UI.
- T048–T049 and T051–T052 separate settings persistence and modal behavior.
- T055–T057 cover accessibility, security and migration evidence independently.
- T067 can be prepared independently after the complete guided flow is available.

---

## Parallel Example: User Story 2

```text
Task: T027 adapter success/failure tests in app/features/tasks/services/mock-workspace-assistant.test.ts
Task: T028 guarded update tests in app/features/tasks/domain/task-assistant-rules.test.ts

After red confirmation:

Task: T032 deterministic adapter in app/features/tasks/services/mock-workspace-assistant.ts
Task: T033 chat presentation in app/features/tasks/components/TaskChat.vue
```

## Parallel Example: User Story 4

```text
Task: T048 settings persistence tests in app/features/tasks/services/task-store.test.ts
Task: T049 settings browser flow in tests/e2e/guided-workspace.spec.ts

After red confirmation:

Task: T051 settings persistence in app/features/tasks/services/task-store.ts
Task: T052 settings modal in app/features/tasks/components/AssistantSettingsModal.vue
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational.
2. Complete US1.
3. Stop and validate the three-region dashboard independently.
4. Demo navigation, task grouping, new task and responsive panels before adding chat behavior.

### Incremental Delivery

1. **US1**: Dashboard and task navigation.
2. **US2**: Deterministic chat and complete four-phase forms without visible prompts.
3. **US3**: Evaluation loop and guarded continuation.
4. **US4**: Persisted provider preference.
5. **Polish**: Accessibility, compatibility, architecture and aggregate verification.

### Commit Boundaries

- Dependency/shell setup.
- Assistant model and compatibility foundation.
- One commit per completed user story or smaller green block.
- Cross-cutting verification and evidence.

## Notes

- Do not install AI SDK, Vueform, LangGraph or a provider client in this feature.
- Do not read, request, store or display real credentials.
- Do not delete `PromptBox.vue` or persisted `prompt*` data; remove only their rendering from the four phases.
- Treat user-edited prompt data as untrusted legacy content.
- Keep one reactive task source of truth across desktop panel and mobile slideover.
- A task is never accepted solely because the simulated evaluator says so; the deterministic gate and current response revision are mandatory.
