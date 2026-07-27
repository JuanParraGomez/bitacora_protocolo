# Architecture and ownership

This repository is a Nuxt modular monolith: one browser application, one Nitro runtime, one SQLite database, and one deployment unit.

## Ownership

- `app/features/tasks` owns task shape, active/completed navigation, four phase gates, guided forms, assistant chat state, assistant evaluations, non-secret assistance settings, persistence repair, completion, and deletion.
- `app/features/library` owns completed Markdown records, safe download names, browsing, and template reuse.
- `app/features/reference` owns presentation-neutral guidance and accessibility-friendly rendering.
- `server` owns HTTP handlers, SQLite lifecycle, repository behavior, backup, and health checks.
- `shared` contains only cross-boundary contracts, schemas, and types.

Pages compose features. Feature internals must not import another feature's private modules. Optional integrations require an explicit contract, owner, timeout/error behavior, cost, and removal path.

## Guided workspace structure

The guided workspace is composed inside `TaskWorkspace`: `DashboardSidebar` provides task navigation and settings entry, `TaskChat` renders safe text-only conversation and update feedback, `GuidedPhaseForm` hosts the current phase fields and evaluation controls, `EvaluationFeedback` announces evaluator state, and `AssistantSettingsModal` persists the global Codex/DeepSeek preference without credential fields. Desktop keeps all three regions visible; mobile uses a dashboard sidebar overlay and a single-source questionnaire slideover.

Legacy `prompt*` values remain persisted for compatibility only. They are not rendered as editable controls in the guided workspace, are excluded from phase revisions, and are never promoted to trusted instructions for chat or evaluation.

## Deferred real-provider criteria

A future Codex or DeepSeek provider must live behind the existing assistant adapter contract. It must receive only the non-secret provider preference, validate output against the same schemas, preserve deterministic gates as mandatory, handle timeout/cancel/retry, avoid client-side credentials, and pass the same accessibility, security, migration, structure, graph, build, and E2E checks before the mock adapter is removed.

## Commands

```sh
npm run typecheck
npm run test:unit
npm run test:contract
npm run test:migration
npm run test:integration
npm run structure:check
npm run graph:check
npm run build
npm run verify
npm run verify:e2e
```

Regenerate the architecture map after an accepted source change with `npm run structure`; CI-style validation uses `npm run structure:check` and fails when the committed hash is stale.
