# Implementation Evidence: Adaptación responsive del workspace

## Scope checkpoint

- Branch: `codex/015-responsive-workspace`
- Base: `d0afee4` (`codex/014-inline-blocking`)
- Worktree: `/Users/j.parra/Downloads/tareas-dificiles-spec015`
- Scope: frontend responsive presentation only; IMG-UX-03/04.
- Excluded: field content 012, chat behavior 013, recovery semantics 014, domain, backend.

## Preflight

- 2026-08-06: isolated clean worktree created because the principal checkout contained unrelated generated/local changes.
- Existing authority verified: `WORKSPACE_SHELL_BREAKPOINTS`, `mobilePaneByTask`, `WorkspacePaneTabs` mounted-pane behavior, visual helper suite.
- Baselines remain untouched. Human visual approval: **PENDING**.
- Initial selected baseline SHA-256:
  - IMG-UX-03 tablet: `d358ab3f797b1b31830d2b845d13387ea9290340a3a030235efd1ea9e9cf3f2b`
  - IMG-UX-04 mobile: `1d0a362391fcb21264eb86fd81526bf1eaf47b6b7b5727465e43864643f7b18f`
  - IMG-UX-04 mobile-narrow: `f922c464f7fcd3b5946a3ce111c26a4406f744bab55ede1bdda3808adbb53bab`
- First `npx nuxi prepare` attempt was rejected as TDD evidence because the isolated worktree lacked dependencies and failed on `@nuxt/kit`; `npm ci` repaired the harness. Node 25.2.1 produced non-blocking engine warnings against the supported even releases.

## TDD ledger

| Block | Red command/result | Green command/result | Regression |
|---|---|---|---|
| Capa A controller/state | `npx vitest run app/features/tasks/components/workspace-shell-presentation.test.ts app/features/tasks/composables/useWorkspaceState.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts --reporter=dot` → exit 1, 3 expected failures for missing icons, pending dot and logical focus; 30 passed | same command → exit 0, 33/33 passed | breakpoint and task-local persistence included |
| Capa A tablet/header | `npx vitest run app/features/tasks/components/WorkspaceHeader.test.ts app/features/tasks/components/TaskWorkspace.test.ts --reporter=dot` → exit 1, 3 expected failures for missing overflow, mobile context and scroll-region contract; 10 passed | `npx vitest run app/features/tasks/components/WorkspaceHeader.test.ts app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/AgentPanel.test.ts --reporter=dot` → exit 0, 24/24 passed | header, workspace, pane controller and agent rail |
| Capa A mobile flow | `npx vitest run app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts --reporter=dot` → exit 1, 2 expected failures for compact form presentation/wiring; 44 passed | `npx vitest run app/features/tasks/components/TaskWorkspace.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts app/features/tasks/components/WorkspacePaneTabs.test.ts app/features/tasks/components/WorkspaceHeader.test.ts --reporter=dot` → exit 0, 56/56 passed | phase/field regression 7/7; `npm run typecheck` exit 0 |
| Capa B geometry helper | `npx vitest run tests/e2e/helpers/visual-geometry.test.ts --reporter=dot` → exit 1, 1 expected failure because `fitsViewportWidth` did not exist; 8 passed | same command → exit 0, 9/9 passed | complete helper suite later passed 18/18 |
| Capa B responsive journey | Contract-first Playwright assertions added before product corrections; focus/collapsible cycle failed 2/13 as expected, then selector-to-panel gap failed at 186.96875 px | selected responsive journeys → exit 0, 4/4 passed; focus/collapsible regression → 23/23 passed | task-local draft/pane, independent scroll, one-primary limit and capture controls included |
| Capa B visual contract | baseline comparison without update → exit 1 with expected protected differences (`IMG-UX-03` mobile ratio 0.07; `IMG-UX-04` mobile ratio 0.06); later axe red exposed selected-tab hover contrast ratio 1.06 | `VISUAL_RUN_MODE=contract ... --grep "IMG-UX-0(3|4)" --workers=1` → exit 0, 2/2 scenarios passed across tablet, mobile and mobile-narrow | zero geometry violations, zero horizontal overflow at 320 px, usable 200% zoom and zero axe contrast violations in stage/agent panes |
| Aggregate | n/a | focused Vitest 101/101; full workspace E2E 10/10; typecheck, structure check, graph check and production build exit 0 | `npm run verify` reached 350 unit, 20 contract, 8 migration and 37 integration tests green, then exited 1 at the stale structure snapshot; after `npm run structure`, `structure:check`, `graph:update`, `graph:check` and build all exited 0 |

## Capa B/C visual evidence

- Explicit server/base URL: `TEST_BASE_URL=http://127.0.0.1:3005`; all storage-writing visual runs used `--workers=1`.
- Five candidate ACTUAL captures were produced: tablet agent; mobile stage/agent; mobile-narrow stage/agent.
- Selected baseline SHA-256 values remain identical to preflight; no baseline was created or updated.
- Human visual approval remains **HUMAN_DECISION_REQUIRED**. The protected baseline comparison is intentionally red until that decision.
- `git diff --check` passed. Migration-created SQLite fixture mutations were restored; generated Graphify outputs/caches were excluded from the product patch after the required update/check.

## Independent review cycle

- Initial verdict: **not approved** because the recorded evidence overclaimed 200% zoom, task isolation and independent scrolling.
- Strengthened task-local journey alternates two tasks twice, keeps the first in Agente and the second in Etapa, then returns to the first with its pane/agent draft intact; focused run passed 3/3 including the symmetric scroll probe.
- Strengthened scroll probe records both initial positions, proves each region moves, and proves the other remains exactly stable in both directions.
- Valid zoom red: at mobile-narrow/200%, the stage footer measured 301.796875 px beyond its constrained grid column; after that fix, the agent composer measured 384.75 px and the Agente tab intercepted the Etapa tab. The failures exposed intrinsic grid sizing rather than a harness error.
- Tablet zoom red: at 1024/200%, the fixed 16 rem agent minimum produced overlapping regions (stage x=50 width=68; agent x=82 width=512). Removing that intrinsic minimum only in the documented tablet breakpoint preserved the normal fractional split and allowed both regions to reflow without overlap.
- Minimum product correction: constrain GuidedPhaseForm/AgentPanel/TaskChat grid columns and inline sizes, allow mobile footer/tab copy to wrap, and preserve all accessible names.
- Final review regression: component tests 65/65, workspace E2E 10/10 and IMG-UX-03/04 contract 2/2 across all contract viewports; 200% zoom checks tablet 1024 plus mobile 390/320, including stage footer, agent composer, pane/tab non-overlap, both pane switches and visible actions.
- Reviewer medium evidence concern resolved by narrowing the ACTUAL comparison below: viewport captures show the canonical fold, while completeness/dot/persistence claims are explicitly attributed to automated journeys rather than to pixels outside the capture.
- Final independent verdict: **technically approved**, with no critical or medium findings. The optional generic `collapsible=false` plus `expanded=false` combination remains out of scope because the only 015 caller forces `expanded=true`. Human visual approval remains the next gate.

## Publication

- Commit/push authorized by user on 2026-08-06.
- SHA/upstream: pending.
