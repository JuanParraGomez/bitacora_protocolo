# Quickstart: Verify responsive workspace

1. Prepare Nuxt metadata: `npx nuxi prepare`.
2. Run focused Capa A suites for shell, header, tabs, workspace, form, agent and state.
3. Start one server: `TEST_BASE_URL=http://127.0.0.1:3005 npx nuxi dev --host 127.0.0.1 --port 3005`.
4. Run `tests/e2e/stage-agent-workspace.spec.ts` serially with `--workers=1`.
5. Run IMG-UX-03/04 with `VISUAL_RUN_MODE=contract`; do not update snapshots.
6. Verify no overlap/overflow at 1024, 390 and 320, including both panes at zoom 200%, and axe contrast in Etapa/Agente.
7. Capture ACTUAL with `VISUAL_RUN_MODE=evidence` into `specs/015-responsive-workspace/evidence/actual/`.
8. Verify protected baseline hashes remain unchanged and complete `evidence/visual-comparison.md`.
9. Run typecheck, affected Vitest/E2E, structure, Graphify, build, `git diff --check` and independent review.
10. Keep `HUMAN_DECISION_REQUIRED`; update baselines only after explicit approval and rerun the same selection.
