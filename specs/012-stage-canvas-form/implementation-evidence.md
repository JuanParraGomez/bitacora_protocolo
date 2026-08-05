# Implementation evidence: Spec 012

Status: implementation in progress.

## Authorization and scope

- Approval: user explicitly requested implementation of all phases on 2026-08-05.
- Branch: `codex/012-stage-canvas-form`.
- Base shell: `4e0fbff`; visual infrastructure: `68498d5`.
- Historical spec 011 T007/T008 evidence debt remains outside this feature.
- Existing mixed worktree artifacts are preserved and excluded from staging.

## Evidence ledger

| Task | Command/evidence | Result | Exit code | Notes |
|------|------------------|--------|-----------|-------|
| T001 | approval recorded above | pending implementation run | — | — |
| T006–T010 | `npx vitest run tests/e2e/helpers/visual-capture.test.ts tests/e2e/helpers/visual-geometry.test.ts --reporter=verbose` | 2 files, 9 tests passed | 0 | Evidence root/allow-list and sibling overlap helpers green. |
| T011–T023, T028–T031, T034–T039, T042–T043, T051 | `npx vitest run app/features/tasks/components/StageTextField.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts app/features/tasks/components/GuidancePhase.test.ts app/features/tasks/components/TaskWorkspace.test.ts tests/e2e/helpers/visual-capture.test.ts tests/e2e/helpers/visual-geometry.test.ts --reporter=dot` | 6 files, 48 tests passed | 0 | Four phases, counters, dirty/evaluation chips, footer uniqueness, context access, no redundant meta/back, helpers. |
| T052 | `npm run typecheck` | completed; Nuxt Icon unresolved-icon warnings only | 0 | No TypeScript errors. |
| T032–T033, T037–T040, T045 | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --grep 'keeps the stage as the main canvas|keeps the capture controls|single contextual|manual dirty-to-save|one manual dirty-to-save' --workers=1 --reporter=line` | 5 tests passed | 0 | Single manual dirty-to-save flow covers phases 1–4; mobile footer and context controls verified. |
| T044–T046 | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/visual/stage-agent-workspace.visual.spec.ts --grep 'IMG-UX-01|IMG-UX-04' --workers=1 --reporter=line` | 2 screenshot assertions failed; DOM/geometry/axe gates passed before diff | 1 | Expected Layer B red: inherited baselines differ after the canvas redesign. Baselines were not updated. |
| T051 | `npm run test:unit -- --reporter=dot` | 32 files, 313 tests passed | 0 | Full unit/migration regression green. |
| T052 | `npm run verify:e2e -- --workers=1 --reporter=line` | 67 passed, 12 failed | 1 | Failures include inherited visual diffs, legacy fixture/accessibility expectations, and one pre-existing navigation/notice expectation; not reported as all green. |
| T052 | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts --grep 'evalúa, corrige' --workers=1 --reporter=line` | 1 passed | 0 | Updated phase-title contract verified end to end. |
| T053 | `TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --workers=1 --reporter=line` | 1 passed, 5 failed | 1 | IMG-UX-06 DOM/geometry/axe green; IMG-UX-01–05 fail only inherited screenshot comparison after 012 redesign. |
| T047 | `VISUAL_EVIDENCE_ROOT=specs/012-stage-canvas-form/evidence/actual VISUAL_EVIDENCE_CASES='IMG-UX-01:desktop-large,IMG-UX-01:tablet,IMG-UX-01:mobile,IMG-UX-01:mobile-narrow,IMG-UX-04:mobile' TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual:update -- --workers=1 --reporter=line` | 4 passed, 2 failed retryable | 1 | Server responded on 3000 instead of requested 3005. IMG-UX-01, IMG-UX-02, IMG-UX-03, IMG-UX-05 passed; IMG-UX-04 mobile and IMG-UX-06 mobile-narrow hit Playwright execution-context destruction during contrast audit. Snapshots updated only where Playwright detected diffs. |
| T047 | same env, `npm run test:visual:update -- --grep 'IMG-UX-04|IMG-UX-06' --workers=1 --reporter=line` | 2 tests passed | 0 | Retry completed shell, geometry, screenshot and axe gates; IMG-UX-04 mobile ACTUAL generated. |
| T049 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --workers=1 --reporter=line` | 5 passed, 1 failed | 1 | Idempotence exposed one remaining collateral screenshot diff in IMG-UX-05 mobile-narrow; shell/axe were green. |
| T049 | same env, `npm run test:visual:update -- --grep 'IMG-UX-05' --workers=1 --reporter=line` | 1 test passed | 0 | Updated the remaining collateral snapshot for the shared redesigned canvas. |
| T049 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --workers=1 --reporter=line` | 6 tests passed | 0 | Full visual matrix idempotent green: 6 scenarios x 4 viewports with shell, geometry, screenshot and axe/component contrast gates. |
| T049 | `VISUAL_SEED_DEFECT=true TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --grep 'IMG-UX-01' --workers=1 --reporter=line` | failed as expected | 1 | Seeded screenshot overlay produced 97% pixel diff on IMG-UX-01 desktop-large. |
| T049 | `VISUAL_SEED_GEOMETRY_DEFECT=true TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --grep 'IMG-UX-01' --workers=1 --reporter=line` | failed as expected | 1 | Seeded geometry transform produced canvas/agent overlap. |
| T049 | `AXE_SEED_INVALID_RULE=true TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --grep 'IMG-UX-01' --workers=1 --reporter=line` | failed as expected | 1 | Seeded invalid axe rule failed during contrast audit. |
| T049 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --workers=1 --reporter=line` | 6 tests passed | 0 | Final post-seed visual run green. |
| T048/T050 | `shasum -a 256 specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-01-desktop-large.png specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-01-tablet.png specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-01-mobile.png specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-01-mobile-narrow.png specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-04-mobile.png` | 5 hashes recorded in visual-comparison.md | 0 | User requested completion of pending visual tasks; visual comparison classifies IMG-UX-01/04 as approved and records global collateral snapshots affected. |
| T055 | independent code-reviewer agent `review_012_visual_closure` | 4 findings reviewed; visual approval wording, severity/owner fields and staging hygiene addressed | 0 | First review was scoped to visual closure; it also flagged staging hygiene, which is enforced by `git diff --cached --name-status`. |
| T055 | independent code-reviewer agent `review_012_full_branch` | no P0; 4 P1 findings reviewed | 0 | Addressed approval wording with exact user authorization context, staged-only hygiene, and missing phase section accessible names. T041 remains an honest non-retroactive evidence gap because the required pre-style red was not captured before the earlier implementation. |
| T055/accessibility red | `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=verbose` | 1 file: 28 passed, 4 failed | 1 | Red reproduced reviewer P1: each phase workspace section used `aria-labelledby` for a removed ID. |
| T055/accessibility green | `npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=dot` | 1 file, 32 tests passed | 0 | Four phase sections now have valid accessible names. |
| T055/accessibility visual regression | `TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --workers=1 --reporter=line` | 6 tests passed | 0 | Post-accessibility-fix visual matrix remained idempotent green with axe/component contrast 0 violations. |
| T056 | `git diff --check` | no whitespace errors | 0 | — |
| T057 | `git diff --cached --check`; `git commit -m "feat: make stage canvas form primary"`; `git push -u origin codex/012-stage-canvas-form` | commit `b223f65` pushed; upstream configured | 0 | Staged only 012 frontend/tests/docs; Graphify, SQLite fixtures, generated ACTUALs and unrelated worktree changes excluded. |

No test, visual, or aggregate result is claimed until its command has run.

## Baseline manifest before implementation (T003)

SHA-256 hashes for the 24 inherited Darwin baselines:

```text
3070e825a703552bebce70b3a1db3179298e4a306083bccbd98f53be2ab871ff  IMG-UX-01-desktop-large-darwin.png
366c0b5bd46c41ae7ac25abd2f5d6595385cbc02485a5bdd1aecd6ce583d8448  IMG-UX-01-mobile-darwin.png
eb05ac3a609c9e7db96744527ec92de13855fc1106726ab6a8297716a53aa565  IMG-UX-01-mobile-narrow-darwin.png
d7b026cfd6c1107f3a09f6eac6c24dae5c6fe40b214036a97d780bf70487b6a0  IMG-UX-01-tablet-darwin.png
dfb5fb2de212515d66b4ad308d19729ef63f23d92555e2b6ac6f70fa9e1dbb57  IMG-UX-02-desktop-large-darwin.png
fc9f655d6faa6cdb3ec97de67f23d335cf719e68aa65416ec426ed0a6bcaa8f2  IMG-UX-02-mobile-darwin.png
2481b56fe84cf038b37b2b38c5218b1bc5d48d2cd498c7186f3d742b6c1dbe6c  IMG-UX-02-mobile-narrow-darwin.png
00a7df9bb15ec12309616b7f664e2d20e0d504a9787e6d5c4feb6fa2ee91518a  IMG-UX-02-tablet-darwin.png
dfb5fb2de212515d66b4ad308d19729ef63f23d92555e2b6ac6f70fa9e1dbb57  IMG-UX-03-desktop-large-darwin.png
fc9f655d6faa6cdb3ec97de67f23d335cf719e68aa65416ec426ed0a6bcaa8f2  IMG-UX-03-mobile-darwin.png
2481b56fe84cf038b37b2b38c5218b1bc5d48d2cd498c7186f3d742b6c1dbe6c  IMG-UX-03-mobile-narrow-darwin.png
00a7df9bb15ec12309616b7f664e2d20e0d504a9787e6d5c4feb6fa2ee91518a  IMG-UX-03-tablet-darwin.png
3070e825a703552bebce70b3a1db3179298e4a306083bccbd98f53be2ab871ff  IMG-UX-04-desktop-large-darwin.png
366c0b5bd46c41ae7ac25abd2f5d6595385cbc02485a5bdd1aecd6ce583d8448  IMG-UX-04-mobile-darwin.png
eb05ac3a609c9e7db96744527ec92de13855fc1106726ab6a8297716a53aa565  IMG-UX-04-mobile-narrow-darwin.png
d7b026cfd6c1107f3a09f6eac6c24dae5c6fe40b214036a97d780bf70487b6a0  IMG-UX-04-tablet-darwin.png
9ee00cce629a2dd934de1ab724a52a6d7939d67a8fc014bae86636605e719294  IMG-UX-05-desktop-large-darwin.png
44636e682d8e9b97b3fd2c1ff907832be296a17f2446d396d80ca05f816bfe2f  IMG-UX-05-mobile-darwin.png
9c2349cc5233651f82232331b66265b9b6488663c6bb54e475b2be619ab699db  IMG-UX-05-mobile-narrow-darwin.png
5f6f69a28bb86615eac791e47e437cd2e6f7b0369a380ff87d8a6595033af4b7  IMG-UX-05-tablet-darwin.png
edef8e2a6d45bef8502a201d3bfb5cccae30c4e92c5f981004ed57870b5a01a3  IMG-UX-06-desktop-large-darwin.png
fa62f67e4f1468c4b9077af4ff0196d833123c191d5b46d0e7f91c93a2ca287d  IMG-UX-06-mobile-darwin.png
6712ccaf57383993e126eb1b2e2398c155f27ea8923d5af771c839946046e3a9  IMG-UX-06-mobile-narrow-darwin.png
3804b20e4334881cd8a2e8d326e7590d4a634a4ea86e4a7f18fc32f2bf37521e  IMG-UX-06-tablet-darwin.png
```
