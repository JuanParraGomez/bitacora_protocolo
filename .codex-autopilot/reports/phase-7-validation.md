# Phase 7 Validation

Status: `PHASE_COMPLETED_WITH_SCOPED_EVIDENCE_AFTER_P1_REPAIR`

Spec Kit ledger was not edited. `speckit-autopilot` keeps `specs/008-stage-agent-workspace/tasks.md` and `implementation-evidence.md` immutable, so this checkpoint records operational evidence under `.codex-autopilot`.

## Verified

- T050: canonical visual manifest verified with six IMG-UX references.
- T051-T053: six actual screenshots captured under `.codex-autopilot/evidence/actual`.
- T057: focused quickstart Vitest subset passed after repair, 50/50.
- T059 stage-agent subset: `tests/e2e/stage-agent-workspace.spec.ts` passed, 5/5.
- Protected manifest: unchanged against autopilot hashes.
- T063 runtime review: independent reviewer found no P0. One runtime P1 in manual draft save was repaired with TDD; `GuidedPhaseForm.test.ts` went red, then green 11/11.

## Partial

- T054: captures and overflow checks exist, but formal visual comparison was not written to the protected Spec Kit path.
- T055: automated accessibility coverage exists through E2E landmarks, keyboard, overlays, live regions, and mobile behavior; manual contrast and full zoom protocol remain open.
- T056: phase controls are covered by stage-agent E2E and captures, but no protected phase-controls ledger was written.
- T064: path-only safety review found no `.env` or `secrets` entries. SQLite fixtures, Graphify caches, generated screenshots, and protected Spec Kit paths are present in the worktree and must be excluded or handled before commit.

## Failed Or Blocked

- T058: literal `npm run verify` was not executed because it includes `graph:update` and `build`, which write generated artifacts.
- T059: full `verify:e2e` completed with 57 passed and 14 failed. Failures are legacy guided/conversational/nuxt/ux-audit expectations after the 008 redesign.
- T060: `structure:check` fails with `snapshot is stale`; `graph:check` fails because Graphify is stale and requests `graph:update`.
- T061: named regression block completed with 19 passed and 4 failed, all in `nuxt-task-workflows` old copy/control expectations.
- T062: blocked by required five-person usability protocol.
- T065: blocked by immutable Spec Kit ledger.

## E2E Failure Clusters

- Removed/relocated status region: old `Estado de la tarea` assertion at tablet width.
- Old sidebar/footer placement: old per-project `Nueva tarea`, footer `Ajustes`, and `data-focus-target="settings"` assertions.
- Old mobile questionnaire model: tests expect a hidden guided form and a `cuestionario` trigger; new design keeps stage content visible with tabs.
- Old evaluation copy: tests expect `Debilidades`, `Estado vigente`, and stale-evaluation copy that changed in Phase 5.
- New field-level issues duplicate validation text intentionally, causing one strict locator failure.
- One UX audit expects `Nueva tarea` inside `Contexto del workspace`; the control moved with the redesigned shell.

## Next Decision

To mark `tasks.md`, update official Spec Kit evidence, refresh Graphify/structure artifacts, or migrate legacy E2E expectations, explicit permission is required because those actions write protected or generated project artifacts.
