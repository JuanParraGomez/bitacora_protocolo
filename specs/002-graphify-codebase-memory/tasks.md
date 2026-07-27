# Tasks: Graphify Codebase Memory

**Input**: Design documents from `/specs/002-graphify-codebase-memory/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/graph-workflow-contract.md`, and `quickstart.md`

**Tests**: Mandatory. Follow the project test-first sequence: write complete focused tests, run them red for the expected missing behavior, make the smallest production change, run focused and affected suites green, then run aggregate verification.

**Organization**: Tasks are grouped by user story so the initial graph, freshness automation, and AI guidance can each be verified independently.

## Non-negotiable Test-First Rule

For every implementation task:

1. Confirm its referenced test covers normal, boundary, invalid/failure, recovery, and regression behavior.
2. Run that test before production edits and record the expected red reason.
3. Make the smallest production change that can satisfy the test.
4. Re-run the focused test and affected suite until green.
5. Do not mark the task complete until the required aggregate verification passes.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a safe, documented boundary for the external CLI without changing product runtime behavior.

- [ ] T001 Create the Graphify scope fixture directory and safe/unsafe sample files in `tests/fixtures/graphify-scope/`.
- [ ] T002 [P] Add the Graphify CLI setup, supported versions, and recovery prerequisites to `specs/002-graphify-codebase-memory/quickstart.md`.
- [ ] T003 [P] Add a scope-policy fixture documenting allowed and excluded paths in `tests/fixtures/graphify-scope/scope-policy.json`.
- [ ] T004 Add a fake Graphify executable harness with successful, failed, partial-output, and unavailable modes in `tests/fixtures/graphify/fake-graphify.mjs`.

**Checkpoint**: Test fixtures and safe artifact policy exist; no application source, database, Docker, or npm runtime dependency has changed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the deterministic scope and test harness required by every graph workflow.

**⚠️ CRITICAL**: Do not implement graph scripts until the tests below are red for the expected missing behavior.

- [ ] T005 Write failing deterministic-scope, exclusion, and fingerprint tests in `tests/integration/graphify-workflow.test.ts`.
- [ ] T006 [P] Write failing generation, missing-CLI, failed-generation, partial-output, and recovery tests in `tests/integration/graphify-workflow.test.ts`.
- [ ] T007 [P] Write failing freshness, unchanged-input, stale-input, malformed-metadata, and actionable-check-message tests in `tests/integration/graphify-workflow.test.ts`.
- [ ] T008 Implement the canonical include/exclude configuration and deterministic fingerprint helpers in `scripts/graphify-workflow.mjs`, then add matching ignored local-artifact entries and the no-secrets policy to `.gitignore`, to make T005 green.
- [ ] T009 Implement injected CLI execution, required-artifact validation, atomic freshness metadata writes, and recovery diagnostics in `scripts/graphify-workflow.mjs` to make T006 green.
- [ ] T010 Implement current/stale/missing/failed graph state detection and `check` exit behavior in `scripts/graphify-workflow.mjs` to make T007 green.
- [ ] T011 Run `vitest run tests/integration/graphify-workflow.test.ts` and correct all foundational failures without changing application runtime behavior.

**Checkpoint**: The project can distinguish safe graph inputs and report trustworthy current, stale, missing, and failed artifact states; unavailable CLI diagnostics belong to generation, update, and watch.

---

## Phase 3: User Story 1 - Consult a Current Codebase Map (Priority: P1) 🎯 MVP

**Goal**: A contributor can generate a local Graphify graph and obtain source-backed, scoped repository context.

**Independent Test**: With the fake CLI, generation creates a valid artifact set and the project reports the exact command to query a known relationship; with a real installed CLI, the documented task-to-SQLite query succeeds locally.

### Tests for User Story 1

- [ ] T012 [P] [US1] Write failing command-surface tests for `graph:generate` and `graph:update` in `tests/integration/project-commands.test.ts`.
- [ ] T013 [P] [US1] Add a representative task-page-to-storage query smoke-test procedure to `specs/002-graphify-codebase-memory/quickstart.md`.

### Implementation for User Story 1

- [ ] T014 [US1] Add `generate` and `update` modes, including Graphify incremental update invocation only after input changes, in `scripts/graphify-workflow.mjs`.
- [ ] T015 [US1] Add `graph:generate`, `graph:update`, and `graph:check` commands in `package.json` without adding Graphify to dependencies.
- [ ] T016 [US1] Update `specs/002-graphify-codebase-memory/quickstart.md` with real setup, generate, query, path, explain, and recovery commands.
- [ ] T017 [US1] Run the focused integration tests red→green, then execute the real local Graphify smoke test if the CLI is installed; otherwise record the repeatable manual prerequisite.

**Checkpoint**: User Story 1 delivers a local graph workflow that is independently useful and does not affect the journal application.

---

## Phase 4: User Story 2 - Keep Graph Knowledge Current Automatically (Priority: P2)

**Goal**: Relevant changes refresh graph knowledge automatically, and stale artifacts cannot silently pass graph verification.

**Independent Test**: Edit an included fixture, observe exactly one debounced update, verify a current check; edit an excluded fixture and verify there is no update; make metadata stale and verify recovery.

### Tests for User Story 2

- [ ] T018 [P] [US2] Write failing watch debounce, included-file refresh, excluded-file ignore, and watcher-failure isolation tests in `tests/integration/graphify-watch.test.ts`.
- [ ] T019 [P] [US2] Extend command-surface tests for stale graph verification and non-blocking application commands in `tests/integration/project-commands.test.ts`.

### Implementation for User Story 2

- [ ] T020 [US2] Implement debounced approved-path watching and refresh scheduling in `scripts/graphify-watch.mjs` to make T018 green.
- [ ] T021 [US2] Add `graph:watch` and integrate non-blocking graph refresh into the documented development command in `package.json`.
- [ ] T022 [US2] Integrate artifact-only `graph:check` into the documented aggregate verification entry point in `package.json`, with an explicit stale/missing graph recovery path.
- [ ] T023 [US2] Update `specs/002-graphify-codebase-memory/quickstart.md` with automatic refresh, stale recovery, and platform watcher limitations.
- [ ] T024 [US2] Run graph workflow, watcher, command-surface, and existing migration tests; confirm product startup and SQLite files are unaffected.

**Checkpoint**: Graph artifacts remain current during ordinary work, while graph-tool failures stay isolated from product runtime and data workflows.

---

## Phase 5: User Story 3 - Make Graph Consultation an AI Working Rule (Priority: P3)

**Goal**: Codex receives persistent, safe, query-first project guidance without losing existing operating rules.

**Independent Test**: An automated assertion finds the required trigger, scoped-query, evidence-validation, direct-inspection, missing/stale fallback, and sensitive-path rules in `AGENTS.md`.

### Tests for User Story 3

- [ ] T025 [P] [US3] Write failing assistant-guidance content and existing-rule-preservation tests in `tests/integration/graphify-guidance.test.ts`.

### Implementation for User Story 3

- [ ] T026 [US3] Add a repository-owned Graphify consultation section to `AGENTS.md` with trigger, scoped-query, provenance, narrow-task exception, unavailable/stale fallback, and excluded-input requirements.
- [ ] T027 [US3] Document the one-time manual `graphify codex install --project` review, generated-change reconciliation, and manual fallback in `specs/002-graphify-codebase-memory/quickstart.md`.
- [ ] T028 [US3] Run guidance tests red→green and manually inspect the resulting `AGENTS.md` section for compatibility with the existing safety and test-first rules.

**Checkpoint**: AI assistants are directed to query Graphify when it helps, validate uncertain edges, and transparently fall back when it does not work.

---

## Phase 6: Polish & Cross-Cutting Verification

**Purpose**: Prove the integration is reproducible, bounded, and removable.

- [X] T029 [P] Add Graphify workflow ownership, scope, update policy, and removal instructions to `docs/architecture/graphify.md`.
- [X] T030 [P] Add a regression assertion that Graphify is absent from production dependencies and container configuration in `tests/integration/optional-provider-isolation.test.ts`.
- [X] T031 Decide and document whether any concise Graphify output is committed after measuring generated artifact size and review usefulness in `docs/architecture/graphify.md`.
- [X] T032 Run `npm run typecheck`, focused graph suites, `npm run test:integration`, `npm run test:migration`, and the graph freshness check; record results in `specs/002-graphify-codebase-memory/verification.md`.
- [X] T033 Remove the incorrect npm `grapify` dependency from `package.json` and `package-lock.json` only after T032 is green and a repository-wide usage search confirms no remaining use; rerun the affected verification.

## Dependencies & Execution Order

```text
Setup (T001–T004)
  → Foundation tests and workflow (T005–T011)
    → US1: generate and query (T012–T017)
      → US2: automatic refresh and freshness gate (T018–T024)
        → US3: durable Codex guidance (T025–T028)
          → Cross-cutting verification and obsolete package removal (T029–T033)
```

- User Story 1 is the MVP and depends only on the foundational workflow.
- User Story 2 depends on User Story 1 because it watches and invokes its update behavior.
- User Story 3 can begin after the foundation but is sequenced after User Story 2 so its guidance reflects final command names and recovery behavior.
- T033 is strictly last: no dependency removal occurs until the replacement is proven.

## Parallel Opportunities

- T002 and T003 can proceed in parallel with T001.
- T005, T006, and T007 write independent test cases in the same suite; coordinate edits or split by describe block.
- T012 and T013 can run in parallel.
- T018 and T019 can run in parallel.
- T029 and T030 can run in parallel after all user stories.

## Implementation Strategy

### MVP First

1. Complete setup and foundational red→green tests.
2. Deliver only User Story 1: safe local generation, update, check, and a scoped query workflow.
3. Validate it against a real local Graphify installation without changing product code or data.
4. Add watch automation and persistent Codex guidance only after the MVP is stable.

### Incremental Delivery

1. Foundation → deterministic graph state and safe scope.
2. US1 → useful codebase map and query path.
3. US2 → no-manual-maintenance freshness behavior.
4. US3 → AI reliably knows to use the graph.
5. Polish → document ownership, prove isolation, then remove the wrong package.
