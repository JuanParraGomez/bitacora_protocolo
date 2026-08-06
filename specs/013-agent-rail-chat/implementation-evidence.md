# Implementation Evidence: Agente como rail contraíble con chat

## Scope and authorization

- Feature: `codex/013-agent-rail-chat`
- Scope: frontend-only rail/chat/proposals/composer/scroll; no backend, domain
  rule, assistant pipeline, spec 014 evaluation/blocking or spec 015 mobile tabs.
- Authorization: user explicitly requested `[$speckit-implement] corre todas las
  fases` on 2026-08-05. This authorizes implementation phases, subject to the
  later visual `HUMAN_DECISION_REQUIRED` gate.
- Evidence policy: only executed commands with count, exit code, scope and
  verdict are recorded. A green test does not approve a visual baseline.

## Worktree and provenance gate

| Check | Command/evidence | Result |
|-------|------------------|--------|
| Branch | `git branch --show-current` | `codex/013-agent-rail-chat` |
| Upstream | `git branch -vv --no-abbrev` | `origin/codex/013-agent-rail-chat` |
| Lineage | `git merge-base --is-ancestor codex/012-stage-canvas-form HEAD` | exit 0; pass |
| 013 base | `20c8e57 docs: plan agent rail chat implementation` | present before product changes |
| 012 boundary | `specs/012-stage-canvas-form/plan.md` | present |
| 011 shell | `specs/011-workspace-shell/plan.md` | present |
| 010 visual infra | `specs/010-visual-testing-infra/implementation-evidence.md` | present |
| Checklist | `requirements.md` | 16/16 complete; pass |

The worktree contains pre-existing/parallel changes outside this feature:
`graphify-out/cache/last_query_stamp`, `.agents/skills/speckit-converge/`,
`.claude/`, `.codex/`, `.kimi/`, `Nexus — Rediseño visual/` and
`docs/ux-ui/prompts-specs-010-016.md`. They are excluded from all 013 staging.
SQLite/data, Graphify output/cache, Playwright results, secrets and generated
outputs remain excluded.

## Baseline inventory before UI changes

The 24 inherited Darwin snapshots were inventoried and hashed before product
changes. No snapshot update was executed at this checkpoint.

```text
9c29f6d7a38b75d2a561dc554941dc627576a6f68dc1ac357bb7c516b9282893  IMG-UX-01-desktop-large-darwin.png
ee2db26bf741e4933ad0ae7b80a2ee5abeb2ab427c1f17f7eea73513ee88479d  IMG-UX-01-mobile-darwin.png
f4faa5d718accb7dbd52898c5c2e42afffaf24d85a2b0b2bddbeb056e520aa6b  IMG-UX-01-mobile-narrow-darwin.png
d7b026cfd6c1107f3a09f6eac6c24dae5c6fe40b214036a97d780bf70487b6a0  IMG-UX-01-tablet-darwin.png
6b78a18087b59aee4227b5ce5aa55c7033e827297b79144a5a94ea180efe463e  IMG-UX-02-desktop-large-darwin.png
d2c0d39aa9efaaa8fd491644b3db1ff4afe2fc1e8431460b49c51174f04a08cb  IMG-UX-02-mobile-darwin.png
d8e2c134dc774eef8b65648937bdc2ef8c69af2a20814c21ccea524672029f19  IMG-UX-02-mobile-narrow-darwin.png
11733a54cb18cc4260ab8e90b3bf08ff313925b5e640f27dcbfdcbfff72f4d14  IMG-UX-02-tablet-darwin.png
6b78a18087b59aee4227b5ce5aa55c7033e827297b79144a5a94ea180efe463e  IMG-UX-03-desktop-large-darwin.png
d2c0d39aa9efaaa8fd491644b3db1ff4afe2fc1e8431460b49c51174f04a08cb  IMG-UX-03-mobile-darwin.png
d8e2c134dc774eef8b65648937bdc2ef8c69af2a20814c21ccea524672029f19  IMG-UX-03-mobile-narrow-darwin.png
11733a54cb18cc4260ab8e90b3bf08ff313925b5e640f27dcbfdcbfff72f4d14  IMG-UX-03-tablet-darwin.png
9c29f6d7a38b75d2a561dc554941dc627576a6f68dc1ac357bb7c516b9282893  IMG-UX-04-desktop-large-darwin.png
ee2db26bf741e4933ad0ae7b80a2ee5abeb2ab427c1f17f7eea73513ee88479d  IMG-UX-04-mobile-darwin.png
f4faa5d718accb7dbd52898c5c2e42afffaf24d85a2b0b2bddbeb056e520aa6b  IMG-UX-04-mobile-narrow-darwin.png
d7b026cfd6c1107f3a09f6eac6c24dae5c6fe40b214036a97d780bf70487b6a0  IMG-UX-04-tablet-darwin.png
c26a0a8adee581130fe3be3f456ada96903c35599db71993388bae0b9fe7b1cb  IMG-UX-05-desktop-large-darwin.png
c903d12bba67104f37c015b6c215e1bc1f83e334e7d5471f8f4c5d49e95c8741  IMG-UX-05-mobile-darwin.png
fc51c51ecb41713f8f5df8e97eadc762f53c2ad8fc8eca750ad4c0d94c56505b  IMG-UX-05-mobile-narrow-darwin.png
5f6f69a28bb86615eac791e47e437cd2e6f7b0369a380ff87d8a6595033af4b7  IMG-UX-05-tablet-darwin.png
edef8e2a6d45bef8502a201d3bfb5cccae30c4e92c5f981004ed57870b5a01a3  IMG-UX-06-desktop-large-darwin.png
fa62f67e4f1468c4b9077af4ff0196d833123c191d5b46d0e7f91c93a2ca287d  IMG-UX-06-mobile-darwin.png
6712ccaf57383993e126eb1b2e2398c155f27ea8923d5af771c839946046e3a9  IMG-UX-06-mobile-narrow-darwin.png
3804b20e4334881cd8a2e8d326e7590d4a634a4ea86e4a7f18fc32f2bf37521e  IMG-UX-06-tablet-darwin.png
```

## Existing fixture/selectors inventory

- Fixture: `tests/fixtures/tasks/stage-agent-workspace.ts`.
- Scenario catalog: `tests/e2e/helpers/visual-scenarios.ts`.
- Viewports: `tests/e2e/helpers/workspace-ux.ts`.
- Geometry: `assertNoOverlap`, `assertNoOverlapPairs`,
  `countPrimaryActions` in `tests/e2e/helpers/visual-geometry.ts`.
- Capture: `waitForStableUi`, masks and `artifactPath` in
  `tests/e2e/helpers/visual-capture.ts`.
- Product selectors: `.agent-panel`, `.workspace-stage`,
  `[data-primary-action="true"]`, `[data-stage-footer]`,
  `#task-chat-composer-input`, semantic region/tab labels.

## Execution ledger

| Task | Date | Command/evidence | Result | Scope/verdict |
|------|------|------------------|--------|---------------|
| T001–T006 | 2026-08-05 | branch/checklist/baseline/worktree gates above | pass | setup only; no product code |
| T007 | 2026-08-05 | `npm run test:unit -- --run tests/e2e/helpers/visual-geometry.test.ts` (red first, 3 expected missing-helper failures; then green) | exit 0, 325 tests | pure geometry width/containment/scroll helpers verified |
| T008 | 2026-08-05 | same focused geometry command after implementation | exit 0 | `isWithinWidthLimit`, `assertContained`, `hasIndependentScroll` green; no product selectors |
| T009 | 2026-08-05 | fixture inspection/build compile path covered by focused unit import | pass | additive deterministic chat roles/proposals/retry/long-conversation fixtures |
| T010 | 2026-08-05 | `npm run test:unit -- --run tests/e2e/helpers/visual-capture.test.ts` (red first, 2 expected missing-mode failures) | exit 0, 331 aggregate tests | mode/root/mask contracts verified without snapshot update |
| T011 | 2026-08-05 | `npm run test:unit -- --run tests/e2e/helpers/visual-capture.test.ts tests/e2e/helpers/visual-geometry.test.ts` | exit 0, 34 files / 331 tests | baseline/contract/evidence helpers green; no Playwright or snapshot update |
| T012 | 2026-08-05 | `npm run test:unit -- --run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/TaskChat.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/composables/useWorkspaceState.test.ts app/features/tasks/domain/task-assistant-rules.test.ts` | exit 0, 32 files / 317 tests | pre-product baseline green; no pre-existing debt observed in selected scope |
| T013–T016 | 2026-08-05 | AgentPanel/TaskWorkspace red-first tests, then focused unit run | red: missing `data-agent-state`; green: exit 0, 318 tests | rail/default/accessibility/persistence contracts verified |
| T017–T020 | 2026-08-05 | `npm run test:unit -- --run app/features/tasks/components/AgentPanel.test.ts app/features/tasks/components/TaskWorkspace.test.ts`; serial E2E | unit exit 0; E2E 6/7 with unrelated completed-return navigation debt | rail implementation green; mobile tabs and task-local toggle flow pass |
| T021–T024 | 2026-08-05 | AgentPanel/TaskChat red-first tests, then focused unit run | red: missing avatar/title/composer; green: exit 0, 321 tests | expanded header, message roles, stable order, empty filtering verified |
| T025–T028 | 2026-08-05 | focused component unit run + visual contract | exit 0; visual contract 2 scenarios × 4 viewports pass | structural column, focus/busy forwarding, mobile agent pane verified |
| T029, T033–T035 | 2026-08-05 | `npm run test:unit -- --run app/features/tasks/components/TaskChat.test.ts app/features/tasks/domain/task-assistant-rules.test.ts` | exit 0, 321 tests | proposal title/full value/three actions/schema validation and rules regression pass |
| T037, T041–T044 | 2026-08-05 | focused unit run; `VISUAL_RUN_MODE=contract TEST_BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --grep "IMG-UX-01|IMG-UX-02" --workers=1 --reporter=line` | exit 0, 2 visual tests / 8 states; axe 0 violations | composer, disabled attachment, independent overflow and no baseline update pass |
| T045 | 2026-08-05 | `TEST_BASE_URL=http://127.0.0.1:3000 npm run verify:e2e -- tests/e2e/stage-agent-workspace.spec.ts --workers=1 --reporter=line` | exit 1, 6/7; completed-task return expected `/`, received `/tasks/stage-agent-phase-1` | in-scope rail tests pass; navigation debt remains open |
| T046 | 2026-08-05 | contract visual command above | exit 0, 2 tests / 8 states; no `toHaveScreenshot` call | DOM/geometry/scroll/primary/axe contract pass |
| T047 | 2026-08-05 | evidence visual command with `VISUAL_EVIDENCE_ROOT=specs/013-agent-rail-chat/evidence/actual` | exit 0, 8 ACTUAL PNGs; no snapshot diff | evidence captured and hashed; baselines unchanged |
| T048 | 2026-08-05 | `shasum -a 256 specs/013-agent-rail-chat/evidence/actual/ACTUAL-*.png` + comparison ledger | pass | eight rows complete with contract dimensions; human decision remains pending |
| T051 | 2026-08-05 | seeded contract runs: `VISUAL_SEED_DEFECT=true`, `VISUAL_SEED_GEOMETRY_DEFECT=true`, `AXE_SEED_INVALID_RULE=true` | each exit 1 at its intended gate; unseeded contract rerun exit 0 | defect, geometry and axe recovery gates behave as designed |

Later task evidence is appended here with exact command, count, exit code,
failure cause, regression scope and verdict. Tasks remain unchecked until that
row exists.
