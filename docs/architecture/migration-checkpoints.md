# Migration checkpoints

## Checkpoint 0 — Baseline and recovery

- Status: validated.
- Evidence: legacy Playwright workflows, SQLite fixtures, backup manifest, restore/checksum tests.
- Recovery: restore the verified database backup and redeploy the previous image.

## Checkpoint 1 — Nuxt shell and compatibility storage

- Status: validated.
- Evidence: storage contract 6/6, migration 7/7, Nuxt build, health endpoint, and legacy route.
- Recovery: use `/legacy` and the previous image with the unchanged mounted database.

## Checkpoint 2 — Tasks capability

- Status: validated.
- Evidence: task domain/persistence services, Nuxt task intake/workspace, four phase controls, completion/deletion, and 13 browser tests.
- Recovery: keep `/legacy` available while task routes are disabled or the previous image is redeployed.

## Checkpoint 3 — Library and reference capabilities

- Status: validated.
- Evidence: 27 unit/migration tests, library Markdown download/template flow, reference accessibility headings, and legacy regression.
- Recovery: use `/legacy`; no data migration was performed.

## Checkpoint 4 — Structure and optional technology isolation

- Status: validated.
- Evidence: deterministic structure snapshot/check, dependency rules, 19 integration tests, disabled/timeout/malformed/unavailable provider cases.
- Recovery: remove the optional adapter and redeploy the same SQLite-backed core.

## Checkpoint 5 — Guided workspace assistant MVP

- Status: validated for the deterministic MVP; real providers remain deferred.
- Evidence: Nuxt UI shell, three-region workspace, safe chat updates, versioned evaluations, current-evaluation continuation gate, non-secret Codex/DeepSeek preference, accessibility/security/migration regressions, and refreshed structure/graph evidence.
- Compatibility: existing tasks remain under `bitacora:t:<id>`, `bitacora:index` remains the navigation index, completed records remain under `bitacora:r:<id>`, and legacy `prompt*` fields are preserved but inert.
- Provider removal criteria: remove the mock only after a real adapter validates against the same schemas, keeps deterministic gates mandatory, avoids client-side secrets, documents timeout/cancellation behavior, and passes aggregate verification plus browser E2E.
- Recovery: keep `/legacy` available, retain SQLite backups, disable real provider wiring if introduced, and redeploy the deterministic single-runtime image.
