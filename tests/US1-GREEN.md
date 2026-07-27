# US1 Green Evidence

Validated on 2026-07-26 against a temporary SQLite data directory.

- `npm run typecheck` — passed.
- `npm run test:unit -- app/features/tasks tests/migration` — 22 tests passed.
- `TEST_BASE_URL=http://localhost:3101 npm run test:contract` — 6 tests passed.
- `npm run test:migration` — 7 tests passed.
- `TEST_BASE_URL=http://localhost:3101 npm run test:e2e:red` — 10 tests passed, including Nuxt intake/workspace and legacy rollback workflows.

The permanent database was not modified. The legacy root route remains available while the Nuxt task routes are exercised independently.
