# Tasks: Evolution-Ready Project Foundation

**Input**: Design documents from `/specs/001-evolution-ready-foundation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md`

**Tests**: Mandatory and test-first. The first phase defines the complete behavior suite before production work starts. Every subsequent implementation task names the tests it must make pass and requires correction until they are green.

## Non-negotiable Test-First Rule

For **every** implementation task below:

1. Confirm its referenced tests already exist and cover normal, boundary, invalid-input, failure/recovery, and regression cases.
2. Run the referenced test before modifying production code; it must be red for the expected missing-behavior reason.
3. Make the smallest implementation change.
4. Re-run the referenced test and affected suite; fix code or tests until they pass.
5. Do not check off the task until its tests and the aggregate verification remain green.

## Format: `[ID] [P?] [Story] Description`

- **[P]** marks work that can be performed in parallel after its prerequisites.
- **[USn]** maps implementation and verification work to a user story.
- Every task names its exact file path and its required proof of correctness.

## Phase 1: Complete Test Specification First (Red Suite)

**Purpose**: Write the full automated specification for all planned behavior before creating the Nuxt implementation. These tests are expected to be red until their corresponding implementation work is complete.

- [X] T001 Create the test-first traceability matrix covering every task, requirement, primary flow, edge case, and regression in `tests/TEST-MATRIX.md`.
- [X] T002 [P] Write browser characterization tests for task creation, save/reopen, deletion, completion, and Markdown download in `tests/e2e/legacy-task-workflows.spec.ts`.
- [X] T003 [P] Write browser characterization tests for phase gates, invalid/missing phase data, prompts, library access, and template reuse in `tests/e2e/legacy-phase-workflows.spec.ts`.
- [X] T004 [P] Write complete storage API contract tests for encoded keys, absent keys, valid writes, malformed bodies, deletes, unavailable storage, and health status in `tests/contract/storage-api.contract.test.ts`.
- [X] T005 [P] Write database migration and recovery tests for empty, valid, malformed, interrupted, backup, restore, and checksum-mismatch databases in `tests/migration/compatibility-store.test.ts`.
- [X] T006 [P] Write task domain tests for shape repair, defaults, all phase-gate boundaries, allowed/blocked transitions, completion, and Markdown generation in `app/features/tasks/domain/task-rules.test.ts`.
- [X] T007 [P] Write task persistence tests for all supported legacy key namespaces, invalid JSON, concurrent update handling, and error mapping in `app/features/tasks/services/task-store.test.ts`.
- [X] T008 [P] Write library tests for empty lists, missing records, completed-record browsing, safe download filenames, and template reuse in `app/features/library/services/library-store.test.ts`.
- [X] T009 [P] Write reference-content rendering and accessibility tests in `app/features/reference/tests/reference-content.test.ts`.
- [X] T010 [P] Write clean-install, missing-config, existing-database, command failure, and successful command-surface tests in `tests/integration/project-commands.test.ts`.
- [X] T011 [P] Write project-structure tests for excluded directories, cycles, forbidden imports, deterministic output, stale snapshots, and schema violations in `tests/integration/structure-snapshot.test.ts`.
- [X] T012 [P] Write optional-provider tests for disabled configuration, timeout, malformed provider response, unavailable provider, and core-workflow isolation in `tests/integration/optional-provider-isolation.test.ts`.
- [X] T013 [P] Write technology-decision tests requiring benefit, owner, cost, failure isolation, and removal path fields in `tests/integration/technology-decision.test.ts`.
- [X] T014 Configure the red test runner and run all tests, recording their expected initial failures in `tests/RED-BASELINE.md` and `vitest.config.ts`.

**Checkpoint**: All planned behavior has a test specification before production implementation. Failures are documented and attributable to absent target behavior, not syntax or missing test setup.

---

## Phase 2: Setup (Shared Infrastructure)

**Purpose**: Make the pre-written suite executable and establish the target runtime. Each task must turn the named setup tests green without weakening assertions.

- [X] T015 Pin Node 22.19+ and install Nuxt, Vue, TypeScript, test, validation, and architecture dependencies in `.nvmrc` and `package.json`; make the runner bootstrap checks in `tests/integration/project-commands.test.ts` pass.
- [X] T016 Create Nuxt runtime, TypeScript, test, and environment configuration in `nuxt.config.ts`, `tsconfig.json`, `.env.example`, and `tests/setup.ts`; make configuration cases in `tests/integration/project-commands.test.ts` pass.
- [X] T017 Create the feature-first target directories and ownership documentation in `app/features/README.md`, `server/README.md`, `shared/README.md`, and `tests/README.md`; make traceability assertions in `tests/TEST-MATRIX.md` pass.
- [X] T018 Update the pinned runtime, production command, data volume, and health-check wiring in `Dockerfile` and `docker-compose.yml`; make container build and configuration checks pass.
- [X] T019 Create representative valid, empty, malformed, and interrupted legacy database fixtures in `tests/fixtures/legacy/bitacora.sqlite`, `tests/fixtures/legacy/empty.sqlite`, `tests/fixtures/legacy/malformed.sqlite`, and `tests/fixtures/legacy/manifest.json`; make fixture cases in `tests/migration/compatibility-store.test.ts` pass.
- [X] T020 Add separate red/green test commands and a non-skippable aggregate test entry point in `package.json`; make command success/failure cases in `tests/integration/project-commands.test.ts` pass.

---

## Phase 3: Foundational Compatibility (Blocking Prerequisites)

**Purpose**: Preserve data and HTTP behavior before any visual feature migration. All tests for this phase were written in T004–T007 and T014.

- [X] T021 Implement database path resolution, SQLite lifecycle, WAL, and availability checks in `server/utils/database.ts`; make availability and unavailable-storage cases in `tests/contract/storage-api.contract.test.ts` pass.
- [X] T022 [P] Implement storage key, value, and compatibility-error schemas in `shared/schemas/storage.ts`, `shared/contracts/storage.ts`, and `shared/types/storage.ts`; make invalid-key and malformed-value cases in `tests/contract/storage-api.contract.test.ts` pass.
- [X] T023 Implement get, upsert, delete, timestamp, transaction, and legacy-preservation behavior in `server/repositories/kv-store.repository.ts`; make persistence and malformed-record cases in `tests/migration/compatibility-store.test.ts` and `app/features/tasks/services/task-store.test.ts` pass.
- [X] T024 [P] Implement backup manifest, restore verification, checksum comparison, and non-destructive database checks in `scripts/db-backup.mjs`, `scripts/db-restore-check.mjs`, and `scripts/db-check.mjs`; make all recovery cases in `tests/migration/compatibility-store.test.ts` pass.
- [X] T025 Implement health status behavior in `server/api/health.get.ts`; make success and 503 cases in `tests/contract/storage-api.contract.test.ts` pass.
- [X] T026 Implement GET, PUT, and DELETE compatibility endpoints in `server/api/storage/[key].get.ts`, `server/api/storage/[key].put.ts`, and `server/api/storage/[key].delete.ts`; make all OpenAPI response cases in `tests/contract/storage-api.contract.test.ts` pass.
- [X] T027 Preserve the current UI through a temporary legacy route and static fallback in `server/routes/legacy.get.ts` and `public/legacy/bitacora-protocolo.html`; make baseline browser tests in `tests/e2e/legacy-task-workflows.spec.ts` and `tests/e2e/legacy-phase-workflows.spec.ts` pass unchanged.
- [X] T028 Add `db:check`, `db:backup`, `migration:verify`, `test:unit`, `test:contract`, `test:integration`, and `test:migration` scripts in `package.json`; make every command path in `tests/integration/project-commands.test.ts` pass.

**Checkpoint**: The red compatibility, recovery, and browser-baseline suites are green against a Nuxt runtime while the existing records and legacy UI remain available.

---

## Phase 4: User Story 1 - Preserve the Existing Product During Migration (Priority: P1) 🎯 MVP

**Goal**: Replace the primary task workflow with Nuxt pages while preserving all legacy data and behavior.

**Independent Test**: Run the T002–T007 suites against the legacy fixture; create, save, reopen, progress, complete, delete, and recover tasks entirely through Nuxt with no unexpected key/value changes.

- [X] T029 [US1] Implement legacy-compatible task, index, phase, prediction, iteration, and review schemas in `app/features/tasks/domain/task.schema.ts`; make all schema cases in `app/features/tasks/domain/task-rules.test.ts` pass.
- [X] T030 [US1] Implement shape repair, defaults, prompt builders, gates, transitions, and Markdown rendering in `app/features/tasks/domain/task-rules.ts`; make all rule and boundary cases in `app/features/tasks/domain/task-rules.test.ts` pass.
- [X] T031 [US1] Implement typed legacy-key index, task, and completed-record persistence in `app/features/tasks/services/task-store.ts`; make all namespace, invalid-JSON, and concurrent-update cases in `app/features/tasks/services/task-store.test.ts` pass.
- [X] T032 [US1] Create the application layout, navigation, save state, and recoverable error presentation in `app/app.vue`, `app/components/shared/AppNavigation.vue`, and `app/components/shared/SaveStatus.vue`; make navigation and save-feedback cases in `tests/e2e/legacy-task-workflows.spec.ts` pass.
- [X] T033 [US1] Implement the active-task dashboard and empty-state behavior in `pages/index.vue` and `app/features/tasks/components/TaskList.vue`; make task-list and empty-index cases in `tests/e2e/legacy-task-workflows.spec.ts` pass.
- [X] T034 [US1] Implement task intake, valid creation, missing-name errors, and template-prefill behavior in `pages/tasks/new.vue` and `app/features/tasks/components/TaskIntakeForm.vue`; make creation and invalid-input cases in `tests/e2e/legacy-task-workflows.spec.ts` and `tests/e2e/legacy-phase-workflows.spec.ts` pass.
- [X] T035 [US1] Implement task load, autosave debounce, retry-safe failure feedback, and phase progression in `pages/tasks/[id].vue` and `app/features/tasks/components/TaskWorkspace.vue`; make save/reopen, unavailable-storage, and transition cases in `tests/e2e/legacy-task-workflows.spec.ts` pass.
- [X] T036 [US1] Implement all phase controls and edge-case validation in `app/features/tasks/components/OrientationPhase.vue`, `app/features/tasks/components/GuidancePhase.vue`, `app/features/tasks/components/ExecutionPhase.vue`, and `app/features/tasks/components/ReviewPhase.vue`; make all gate-boundary cases in `tests/e2e/legacy-phase-workflows.spec.ts` pass.
- [X] T037 [US1] Implement completion and guarded deletion services in `app/features/tasks/services/task-completion.ts` and `app/features/tasks/services/task-deletion.ts`; make completion, record-preservation, and deletion cases in `tests/e2e/legacy-task-workflows.spec.ts` pass.
- [X] T038 [US1] Run the full US1 regression and migration suite, correct every failure without changing expected legacy behavior, and record evidence in `tests/US1-GREEN.md`.

**Checkpoint**: US1 is releasable when every task, phase, recovery, and storage-contract test is green and the legacy fallback is still available for rollback.

---

## Phase 5: User Story 2 - Add Capabilities Without Restructuring the Whole Project (Priority: P2)

**Goal**: Move library and reference behavior into feature-owned modules and enforce boundaries for future capabilities.

**Independent Test**: Complete a task, browse/download/reuse its record, render reference guidance, and add the example capability without any task-workflow regression or forbidden import.

- [X] T039 [US2] Implement library-record schema and legacy Markdown retrieval in `app/features/library/domain/library-record.schema.ts` and `app/features/library/services/library-store.ts`; make empty, missing, browse, download-name, and reuse cases in `app/features/library/services/library-store.test.ts` pass.
- [X] T040 [US2] Move reference constants and presentation-neutral content into `app/features/reference/domain/reference-content.ts`; make rendering and accessibility cases in `app/features/reference/tests/reference-content.test.ts` pass.
- [X] T041 [US2] Implement library list, record view, safe Markdown download, and template reuse in `pages/library/index.vue`, `pages/library/[id].vue`, `app/features/library/components/LibraryList.vue`, and `app/features/library/components/LibraryRecordView.vue`; make all library browser cases in `app/features/library/services/library-store.test.ts` and `tests/e2e/legacy-phase-workflows.spec.ts` pass.
- [X] T042 [US2] Implement reference page and feature component in `pages/reference.vue` and `app/features/reference/components/ReferenceContent.vue`; make all reference rendering cases in `app/features/reference/tests/reference-content.test.ts` pass.
- [X] T043 [US2] Add forbidden-import and cycle rules in `.dependency-cruiser.cjs`; make all boundary, server-import, and cycle cases in `tests/integration/structure-snapshot.test.ts` pass.
- [X] T044 [US2] Add an independently removable sample capability and ownership instructions in `app/features/example-capability/README.md` and `app/features/README.md`; make traceability checks in `tests/TEST-MATRIX.md` pass.
- [X] T045 [US2] Remove normal-user navigation to the fallback only after all library, reference, task, and phase tests are green by updating `server/routes/legacy.get.ts` and `app/components/shared/AppNavigation.vue`; re-run `tests/e2e/legacy-task-workflows.spec.ts` and `tests/e2e/legacy-phase-workflows.spec.ts` to confirm rollback access remains intact.
- [X] T046 [US2] Run the US2, US1, and feature-boundary suites, correct all failures, and record evidence in `tests/US2-GREEN.md`.

**Checkpoint**: Tasks, library, and reference are independently owned modules; forbidden dependencies fail verification; the existing user flows remain green.

---

## Phase 6: User Story 3 - Operate the Project Through Simple, Repeatable Commands (Priority: P3)

**Goal**: Make setup, verification, release preparation, backup, and architecture documentation repeatable from a clean checkout.

**Independent Test**: Execute the command scenarios already defined in T010–T011 from a clean checkout and verify that existing data is preserved.

- [X] T047 [US3] Implement deterministic source scanning, stable hashing, JSON snapshot, Mermaid output, exclusions, and schema validation in `scripts/generate-structure.mjs`; make all deterministic, exclusion, schema, and stale-output cases in `tests/integration/structure-snapshot.test.ts` pass.
- [X] T048 [US3] Implement file watch and stale-output check modes in `scripts/structure-watch.mjs` and `scripts/structure-check.mjs`; make watch/change/check failure and recovery cases in `tests/integration/structure-snapshot.test.ts` pass.
- [X] T049 [US3] Add typecheck, test, architecture, build, structure, browser-test, and aggregate `verify` commands in `package.json`; make every command-success and command-failure case in `tests/integration/project-commands.test.ts` pass.
- [X] T050 [US3] Implement production build and health-check behavior in `Dockerfile`, `docker-compose.yml`, and `tests/integration/production-build.test.ts`; make container build, mounted-database, health, and restart cases in `tests/integration/project-commands.test.ts` pass.
- [X] T051 [US3] Replace planned instructions with verified commands, failure recovery, and rollback evidence steps in `specs/001-evolution-ready-foundation/quickstart.md`; make clean-install and existing-database cases in `tests/integration/project-commands.test.ts` pass.
- [X] T052 [US3] Document capability ownership, data ownership, commands, and add-capability workflow in `docs/architecture/README.md` and `app/features/README.md`; make traceability checks in `tests/TEST-MATRIX.md` pass.
- [X] T053 [US3] Run all command, structure, production, US1, and US2 suites; correct every failure and record the clean-checkout evidence in `tests/US3-GREEN.md`.

**Checkpoint**: A clean checkout starts within 15 minutes, `npm run verify` is green, architecture output is current, and a production container uses the existing mounted database.

---

## Phase 7: User Story 4 - Introduce Advanced Capabilities Gradually (Priority: P4)

**Goal**: Keep optional future technology isolated, observable, documented, and unable to break the core journal.

**Independent Test**: Exercise disabled, malformed, timed-out, and unavailable provider states while the complete core workflow remains green.

- [X] T054 [US4] Implement optional-provider contracts and runtime schemas in `shared/contracts/optional-provider.ts` and `shared/schemas/optional-provider.ts`; make validation cases in `tests/integration/optional-provider-isolation.test.ts` pass.
- [X] T055 [US4] Implement a disabled-by-default provider adapter, timeout handling, error mapping, and core-isolation behavior in `server/services/optional-provider.service.ts` and `server/domain/optional-provider.ts`; make disabled, timeout, malformed, unavailable, and core-workflow cases in `tests/integration/optional-provider-isolation.test.ts` pass.
- [X] T056 [US4] Implement the major-dependency and service-extraction decision template in `docs/architecture/decision-record-template.md`; make required-field cases in `tests/integration/technology-decision.test.ts` pass.
- [X] T057 [US4] Document FastAPI extraction criteria, provider ownership, removal path, operational cost, and failure isolation in `docs/architecture/advanced-capabilities.md`; make decision completeness cases in `tests/integration/technology-decision.test.ts` pass.
- [X] T058 [US4] Run optional-provider, technology-decision, and full core regression suites; correct every failure and record evidence in `tests/US4-GREEN.md`.

**Checkpoint**: Advanced integrations remain optional and independently failing; no second runtime exists without an approved, complete decision record.

---

## Phase 8: Polish & Final Green Verification

**Purpose**: Generate final evidence, ratify the permanent test-first rule, and only then remove obsolete compatibility code.

- [X] T059 Generate the committed architecture snapshot in `docs/architecture/structure.json` and `docs/architecture/structure.md`; make snapshot and stale-output cases in `tests/integration/structure-snapshot.test.ts` pass.
- [X] T060 Add local runtime, backup, test-output, and Nuxt build exclusions in `.gitignore`; make clean-install and artifact-exclusion cases in `tests/integration/project-commands.test.ts` pass.
- [X] T061 Record each validated migration checkpoint and a tested rollback drill in `docs/architecture/migration-checkpoints.md`; make recovery-evidence cases in `tests/migration/compatibility-store.test.ts` pass.
- [X] T062 Ratify the mandatory test-first, data-safety, boundary, and dependency rules in `.specify/memory/constitution.md`; make traceability checks in `tests/TEST-MATRIX.md` pass.
- [ ] T063 Remove Express, the monolithic HTML source, temporary fallback adapter, and unused `grapify` dependency only after all test suites are green; update `server.js`, `bitacora-protocolo-analitico (2).html`, `package.json`, and `package-lock.json`, then re-run `npm run verify` and `npm run verify:e2e`.
- [ ] T064 Run the complete release suite, fix every remaining failure, and record final pass evidence in `docs/architecture/release-evidence.md`.

---

## Dependencies & Execution Order

```text
Phase 1: write complete tests and record red baseline
    -> Phase 2: make the test environment executable
        -> Phase 3: make compatibility tests green
            -> US1: make primary workflow tests green (MVP)
                -> US2: make module and boundary tests green
                -> US3: make command and structure tests green
                -> US4: make optional-provider tests green
                    -> Final verification and legacy removal
```

- T001–T014 must complete before production architecture work. Tests are not deferred to later phases.
- T015–T020 make the test suite executable but do not alter product behavior.
- T021–T028 block all user-story work because they protect existing data and API behavior.
- US1 is the MVP. US2, US3, and US4 start only after compatibility gates are green; US3 and US4 may proceed in parallel after US1.
- T063 is strictly last and is prohibited until all recorded green evidence exists.

## Parallel Example: Test-First Work

After T001 defines traceability, the independent test files can be written in parallel:

```text
Task: "Write storage API contract tests in tests/contract/storage-api.contract.test.ts"
Task: "Write migration and recovery tests in tests/migration/compatibility-store.test.ts"
Task: "Write task domain tests in app/features/tasks/domain/task-rules.test.ts"
Task: "Write library tests in app/features/library/services/library-store.test.ts"
Task: "Write structure tests in tests/integration/structure-snapshot.test.ts"
```

No production implementation task starts until T014 records the red baseline. For each implementation task, re-run its named test before coding and again after coding; then correct until green.

## Implementation Strategy

### MVP First

1. Write and validate the entire test specification in Phase 1.
2. Make tests executable in Phase 2 while preserving their assertions.
3. Complete the compatibility foundation in Phase 3.
4. Implement US1 one task at a time: red test → minimal code → green test → regression check.
5. Stop and validate the MVP before starting any scope expansion.

### Completion Definition

A task is complete only when its named test cases pass, edge cases are covered, affected regression suites remain green, and its evidence file is updated. Code without passing tests is unfinished work.
