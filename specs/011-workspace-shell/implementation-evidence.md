# Implementation evidence: Spec 011 workspace shell

**Synchronized**: 2026-08-05

**Branch**: `codex/011-workspace-shell`

**Upstream visual infrastructure**: `68498d5` (`codex/010-visual-testing-infra`)

**Status**: PARTIAL — implementation and later verification are published,
while T007 and T008 remain open because their required foundational red evidence
was not captured independently before implementation.

## Implemented scope

- Sidebar and workspace header were recomposed without changing routes, storage,
  task models, server code or domain rules.
- The shared responsive contract treats 1024 px as compact navigation and keeps
  mobile navigation, focus recovery and task operations available.
- The 24 executable visual baselines cover six canonical scenarios across four
  viewports. The 16 principal candidates for IMG-UX-01, IMG-UX-02, IMG-UX-05
  and IMG-UX-06 were approved after correcting clipped mobile action text.

## Test-first and verification evidence

| Gate | Command | Result | Exit |
|---|---|---:|---:|
| Focused Capa A | `npx vitest run app/features/tasks/components/DashboardSidebar.test.ts app/features/tasks/components/WorkspaceHeader.test.ts app/features/tasks/components/workspace-shell-presentation.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/composables/useTaskIndex.test.ts app/features/tasks/composables/useWorkspaceState.test.ts --reporter=verbose` | 6 files, 41 tests passed | 0 |
| Focused shell E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts tests/e2e/workspace-ux-audit.spec.ts tests/e2e/workspace-overlays.spec.ts --workers=1 --reporter=line` | 34 passed | 0 |
| Visual expected red | `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --workers=1 --reporter=line` | 6 expected snapshot diffs; shell, geometry and contrast subgates green | 1 expected |
| Candidate generation | `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update -- --workers=1 --reporter=line` | 6 scenarios, 24 viewport captures, 0 contrast violations | 0 |
| Visual idempotence | `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --workers=1 --reporter=line` | 6 passed across 24 captures | 0 |
| Typecheck | `npm run typecheck` | no type errors | 0 |
| Aggregate E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e` | 76 passed, 2 pre-existing `/legacy` failures outside 011 | 1 |
| Aggregate verification | `npm run verify` | typecheck, 289 unit, 20 contract, 8 migration, 37 integration, structure, Graphify and build passed | 0 |

## Seeded defect detection

- Snapshot seed: failed as expected with 1,248,739 differing pixels.
- Geometry seed: failed as expected with `canvas overlaps agent`.
- Invalid axe rule seed: failed as expected before the clean visual rerun.
- A final run without seed variables returned 6/6 visual scenarios green.

## Human visual decision

The 16 principal candidates were reviewed and approved on 2026-08-05. A
mobile clipping defect in phase actions was reproduced red, corrected by
stacking those actions in one column, and verified green before approval.
Mockups were used only as design references, never as executable baselines.

## Remaining scope and risks

- The two `/legacy` E2E failures remain out of scope and unmodified.
- Functional-red evidence for foundational tasks T007/T008 was not independently
  captured before implementation; later focused and aggregate coverage is green,
  but this does not administratively close either task or the feature.
- Graphify caches, generated reports outside this feature, test-mutated SQLite
  fixtures and spec 010 historical ACTUAL images are excluded from publication.
