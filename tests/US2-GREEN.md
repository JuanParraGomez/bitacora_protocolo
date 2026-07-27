# US2 Green Evidence

Validated on 2026-07-26 against a temporary SQLite data directory.

- `npm run typecheck` — passed.
- `npm run test:unit -- app/features/tasks app/features/library app/features/reference tests/migration` — 27 tests passed.
- `npx vitest run tests/integration/structure-snapshot.test.ts` — 3 tests passed.
- `npm run structure:check` — passed.
- `TEST_BASE_URL=http://localhost:3101 npm run test:e2e:red` — 12 tests passed, covering legacy rollback, Nuxt task routes, library download/template entry, and reference headings.

Browser tests run with one worker because all compatibility scenarios intentionally share one SQLite index; this prevents cross-scenario data races.
