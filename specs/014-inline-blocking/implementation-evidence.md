# Implementation Evidence: Estado de bloqueo inline

## Initial gate — 2026-08-06

Branch: `codex/014-inline-blocking` with upstream `origin/codex/014-inline-blocking`.
The feature specification commit `97eae2c` is based on the 013 branch
(`c547df2`) and the prior 012 line. No implementation product file has been
changed at this checkpoint.

The user explicitly authorized execution of all implementation phases. The
visual approval gate remains `HUMAN_DECISION_REQUIRED`; this ledger does not
approve or update baselines.

### Checklist

| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| requirements.md | 16 | 16 | 0 | PASS |

### Repository/setup evidence

- `./.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks`: exit 0; feature dir resolved to this directory and all design docs/tasks are available.
- `git rev-parse --git-dir`: exit 0.
- `.gitignore`, `.dockerignore`, `.npmignore` exist and contain the required Node/Docker patterns. No ESLint or Prettier config was detected, so no ignore file was created for them.
- `git diff --check -- AGENTS.md specs/014-inline-blocking`: exit 0 at initial planning validation.
- Existing unrelated mixed-worktree changes (Graphify generated output, legacy SQLite fixtures, untracked tooling/docs) are excluded from the feature scope and must not be staged.

### Graphify evidence

Query: `spec 014 evaluation needs-work gateReasons field mapping inline correction agent badge stale recovery`.

Verified source nodes: `gateReasons()` in `app/features/tasks/domain/task-rules.ts`,
`AgentPanel.vue`, `EvaluationFeedback.vue`, `fieldIdMap` in
`GuidedPhaseForm.vue`, and `isEvaluationStale` in `TaskWorkspace.vue`. The
planned ownership is presentation-only; Graphify output remains untracked.

### Baseline inventory before product changes

SHA-256 inventory of 24 existing visual captures:

```text
9c29f6d7a38b75d2a561dc554941dc627576a6f68dc1ac357bb7c516b9282893  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-01-desktop-large-darwin.png
1d0a362391fcb21264eb86fd81526bf1eaf47b6b7b5727465e43864643f7b18f  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-01-mobile-darwin.png
f922c464f7fcd3b5946a3ce111c26a4406f744bab55ede1bdda3808adbb53bab  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-01-mobile-narrow-darwin.png
b7a69c8a9ccd1cddc1cb878a29db0f07f82ede59835cbfa1fe5eeb2a542b3a67  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-01-tablet-darwin.png
f165f0d7a7f1043337206baba14f16196e044802975f18cefb405322990fc170  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-02-desktop-large-darwin.png
92c29bb1d2e3bb11ec1ac2d8f4790653191310cf59cfde431d755c5220982d9c  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-02-mobile-darwin.png
b87ab2dfeccfe0b12cfa68c30904a857ab82c8c6ec6991d6eb827126071caa3d  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-02-mobile-narrow-darwin.png
d358ab3f797b1b31830d2b845d13387ea9290340a3a030235efd1ea9e9cf3f2b  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-02-tablet-darwin.png
f165f0d7a7f1043337206baba14f16196e044802975f18cefb405322990fc170  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-03-desktop-large-darwin.png
92c29bb1d2e3bb11ec1ac2d8f4790653191310cf59cfde431d755c5220982d9c  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-03-mobile-darwin.png
b87ab2dfeccfe0b12cfa68c30904a857ab82c8c6ec6991d6eb827126071caa3d  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-03-mobile-narrow-darwin.png
d358ab3f797b1b31830d2b845d13387ea9290340a3a030235efd1ea9e9cf3f2b  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-03-tablet-darwin.png
9c29f6d7a38b75d2a561dc554941dc627576a6f68dc1ac357bb7c516b9282893  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-04-desktop-large-darwin.png
1d0a362391fcb21264eb86fd81526bf1eaf47b6b7b5727465e43864643f7b18f  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-04-mobile-darwin.png
f922c464f7fcd3b5946a3ce111c26a4406f744bab55ede1bdda3808adbb53bab  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-04-mobile-narrow-darwin.png
b7a69c8a9ccd1cddc1cb878a29db0f07f82ede59835cbfa1fe5eeb2a542b3a67  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-04-tablet-darwin.png
c26a0a8adee581130fe3be3f456ada96903c35599db71993388bae0b9fe7b1cb  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-desktop-large-darwin.png
628bfe9d8705cf551c78b3099a450c40e53a6ed9c8aa00278062180a2ca6a25d  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-mobile-darwin.png
352aae91062658493d54ce23d0a828377eaf95abf06e107adf898032396020ff  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-mobile-narrow-darwin.png
4e143633caac5a7d159752836d264ef7ff83454a6e7e67637b684d90e80adcab  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-tablet-darwin.png
0eca44c065166edab8925f7d02dc0c889a987b318d5bc5aafca2c41319b21795  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-06-desktop-large-darwin.png
fa62f67e4f1468c4b9077af4ff0196d833123c191d5b46d0e7f91c93a2ca287d  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-06-mobile-darwin.png
6712ccaf57383993e126eb1b2e2398c155f27ea8923d5af771c839946046e3a9  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-06-mobile-narrow-darwin.png
f80c9524d64bc87f10bf6f0c1b490d55ec6c60f5ca7e1f530d4fbdddfe0b2cbc  tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-06-tablet-darwin.png
```

## Execution log

| Task range | Command/evidence | Result |
|------------|------------------|--------|
| T001–T005 | Prerequisite, checklist, branch, ignore-file, baseline and Graphify checks above | PASS |
| T006–T008 | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts --reporter=verbose` before implementation | RED: 4 new recovery tests failed with `resolveEvaluationRecovery is not a function`; 14 existing tests passed; exit 1 |
| T009–T010 | Added exact catalog/recovery projection in `app/features/tasks/components/workspace-presentation.ts`; reran focused suite | GREEN: 1 file, 18 tests passed; exit 0 |
| T011–T015 | New banner/inline/form tests, then focused red run | RED: banner count/link and inline behavior absent; 4 expected failures; exit 1 |
| T016–T021 | Implemented banner, inline ARIA, phase propagation and removed duplicate feedback list; `npx vitest run ...` across 6 affected files | GREEN: 6 files, 81 tests passed; exit 0 |
| T022–T026 | `npx vitest run app/features/tasks/components/AgentPanel.test.ts --reporter=dot` before implementation | RED: 2 expected failures (missing correction badge and exposed focus method); exit 1 |
| T027–T030 | Added `pendingCorrections`, accessible badge, exposed focus, banner event propagation, and recovery count wiring in `AgentPanel.vue`/`TaskWorkspace.vue` | PASS: focused implementation completed without domain/schema/backend changes |
| T031 | `npx vitest run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/EvaluationFeedback.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/composables/useWorkspaceState.test.ts --reporter=dot` | GREEN: 5 files, 67 tests passed; exit 0 |
| T032–T042 | `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/components/TaskWorkspace.test.ts --reporter=dot` plus deterministic fixture assertions | GREEN: 2 files, 26 tests passed; stale/acceptable/transport recovery semantics remain explicit; exit 0 |
| T043–T049 | IMG-UX-05 fixture switched to two canonical reasons; `TEST_BASE_URL=http://127.0.0.1:3000 npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line` | GREEN: 1 test across 4 viewports; geometry, primary count, inline mapping and axe checks passed; exit 0 |
| T050–T053 | `TEST_BASE_URL=http://127.0.0.1:3000 VISUAL_RUN_MODE=contract npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line` | GREEN: 4 viewports, 0 axe violations; no snapshots updated; exit 0 |
| T054 | `npx vitest run tests/e2e/helpers/visual-scenarios.test.ts tests/e2e/helpers/visual-geometry.test.ts tests/e2e/helpers/visual-capture.test.ts --reporter=dot` | GREEN: 3 files, 17 tests passed; exit 0 |
| T055 | `TEST_BASE_URL=http://127.0.0.1:3000 VISUAL_RUN_MODE=evidence VISUAL_EVIDENCE_ROOT=specs/014-inline-blocking/evidence/actual npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line` | GREEN: generated four ACTUAL captures for desktop-large, tablet, mobile and mobile-narrow; exit 0 |
| T056 review | Manual inspection of `specs/014-inline-blocking/evidence/actual/ACTUAL-IMG-UX-05-*.png`; `TEST_BASE_URL=http://127.0.0.1:3000 VISUAL_RUN_MODE=contract npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line` | GREEN: desktop-large, tablet, mobile and mobile-narrow passed shell-contract; axe reported 0 violations; no snapshots updated; T057 remains human decision required |
| T063 review | Independent read-only reviewer reported two actionable bugs: correction surfaces could fall back to display-only gate issues while badge stayed 0, and same-field corrections reused banner IDs | ACTION REQUIRED: fixed with a new red->green cycle before staging |
| T063 fixes RED | `npx vitest run app/features/tasks/components/StageFieldIssues.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose` after adding tests | RED: 5 expected failures covering indexed banner IDs, same-field duplicate IDs, and no banner/inline when only display issues exist; exit 1 |
| T063 fixes GREEN | `npx vitest run app/features/tasks/components/StageFieldIssues.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=dot`; `npx vitest run app/features/tasks/components/workspace-presentation.test.ts app/features/tasks/components/StageFieldIssues.test.ts app/features/tasks/components/StageTextField.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/EvaluationFeedback.test.ts --reporter=dot`; `TEST_BASE_URL=http://127.0.0.1:3000 VISUAL_RUN_MODE=contract npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line` | GREEN: focused 2 files/38 tests passed; affected 7 files/78 tests passed; IMG-UX-05 contract passed across 4 viewports with 0 axe violations; no snapshots updated |
| T063 verdict | Independent read-only reviewer rechecked the corrected patch | PASS FOR VISUAL REVIEW: prior High and Medium findings are fixed; visual review can proceed to T057 human decision gate. Reviewer kept broader closure caveats for T044-T049 evidence naming, partial `verify:e2e`/`verify`, and T064-T065 publication gates |
| T063 post-fix regression | `npm run typecheck`; `npm run test:unit` | PASS: typecheck exit 0; unit suite 32 files, 336 tests passed; exit 0 |
| T057 | User authorization after visual review: `hazlo tu`; `specs/014-inline-blocking/evidence/visual-comparison.md` updated from `HUMAN_DECISION_REQUIRED` to `APPROVED_FOR_BASELINE_UPDATE` | PASS: human decision recorded for IMG-UX-05 baseline update |
| T058 setup | `npm run test:visual:update -- --grep "IMG-UX-05"` without `TEST_BASE_URL` | EXPECTED ENV FAILURE: default server 127.0.0.1:3005 unavailable; no visual assertion ran; rerun with explicit checkout URL |
| T058 update | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual:update -- --grep "IMG-UX-05"`; `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --grep "IMG-UX-05" --workers=1 --reporter=line` | PASS: four IMG-UX-05 baselines regenerated/validated; idempotent rerun passed 1 visual test across 4 viewports; 0 axe violations |
| T058 evidence sync | `TEST_BASE_URL=http://127.0.0.1:3000 VISUAL_RUN_MODE=evidence VISUAL_EVIDENCE_ROOT=specs/014-inline-blocking/evidence/actual npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep IMG-UX-05 --workers=1 --reporter=line`; `shasum -a 256 ...IMG-UX-05...` | PASS: evidence captures regenerated; desktop/tablet hashes match baselines; mobile/mobile-narrow have same dimensions and visual appearance while baseline comparison is idempotent green |
| T059 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --workers=1 --reporter=line` | PASS: global visual suite 6 tests passed across IMG-UX-01..06, 4 viewports each; 0 axe violations; no colateral failures in IMG-UX-01/02/03 |
| T064 | Explicit `git add --` for AGENTS, app task components/tests, spec 014 docs/evidence, IMG-UX-05 snapshots, visual spec, and task fixture; `git diff --cached --name-status`; `git diff --cached --check` | PASS: staged scope excludes `graphify-out/`, spec 010 evidence, SQLite fixtures, local tool dirs and unrelated docs; cached diff check exit 0 |
| T060 | `npm run typecheck`; `npm run test:unit` | PASS: typecheck exit 0; Capa A/unit 32 files, 334 tests passed; exit 0 |
| T061 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run verify:e2e -- --workers=1 --reporter=line` | PARTIAL/BASELINE: 19 passed, 9 pre-existing failures observed in conversational/guided/legacy suites, 1 interrupted after safe stop; no new IMG-UX-05 contract failure |
| T062 | `npm run verify`; `git diff --check`; `graphify update .` | PARTIAL: `git diff --check` and Graphify update exit 0; `npm run verify` stopped at contract tests because required API on 127.0.0.1:3005 was unavailable (12 ECONNREFUSED failures) |
| T062 extra | `npm run graph:check`; `npm run build` | Graph check remains blocked by pre-existing missing `graph.html` after Graphify skips visualization over 5000 nodes; production build passed (Nuxt client/server/Nitro) exit 0 |
| T063 | Independent read-only review requested on current patch | HUMAN/REVIEW PENDING: no actionable verdict returned before handoff; task intentionally remains open |

Further task rows are appended as each strict red→green block completes.
