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
| Capa B functional/visual contract | pending | pending | pending |
| Aggregate | n/a | pending | pending |

## Publication

- Commit/push authorized by user on 2026-08-06.
- SHA/upstream: pending.
