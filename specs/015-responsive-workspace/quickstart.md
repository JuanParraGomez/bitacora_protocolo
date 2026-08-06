# Quickstart: Verify responsive workspace

1. Prepare Nuxt metadata: `npx nuxi prepare`.
2. Run focused Capa A suites for shell, header, tabs, workspace and state.
3. Start one server: `TEST_BASE_URL=http://127.0.0.1:3005 npx nuxi dev --host 127.0.0.1 --port 3005`.
4. Run responsive functional/visual contracts serially with the same base URL and `--workers=1`.
5. Capture ACTUAL IMG-UX-03/04 only into this feature evidence directory.
6. Run affected regressions, `npm run verify`, `git diff --check`, Graphify update/check and independent review.
7. Keep baseline approval pending until the user explicitly accepts the ACTUAL comparison.
