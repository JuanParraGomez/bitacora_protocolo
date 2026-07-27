# Release evidence

Date: 2026-07-26

## Verified green suites

The migration foundation, Nuxt application, storage contracts, structure tooling, optional-provider isolation, and browser workflows were verified with the following results:

| Check | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm run test:unit` | 34 tests passed |
| `npm run test:integration` | 30 tests passed |
| `npm run test:migration` | 7 tests passed |
| `TEST_BASE_URL=http://localhost:3101 npm run test:contract` | 6 tests passed |
| `npx vitest run tests/integration/production-build.test.ts tests/integration/technology-decision.test.ts` | 4 tests passed |
| `npm run structure:check` | pass |
| `TEST_BASE_URL=http://localhost:3101 npm run verify` | pass |
| `TEST_BASE_URL=http://localhost:3101 npm run verify:e2e` | 13 tests passed |
| `npm run build` | pass |

The contract and aggregate checks require a running production server. The verified flow was:

```sh
npm run build
PORT=3101 node .output/server/index.mjs
TEST_BASE_URL=http://localhost:3101 npm run verify
TEST_BASE_URL=http://localhost:3101 npm run verify:e2e
```

## Remaining release decision

T063 remains intentionally open. The repository still keeps the Express entry point, the monolithic HTML source, and the `/legacy` rollback route so the migration can be recovered without deleting the previous workflow. The `grapify` dependency is also retained because the next feature specification (`specs/002-graphify-codebase-memory/`) defines its removal as part of the Graphify implementation checkpoint rather than this foundation checkpoint.

Removing those assets is a destructive, irreversible migration step. It should be completed only after the Graphify feature is implemented and its rollback policy is explicitly approved.

The architecture checker also reports that the current local Node runtime is `25.2.1`, while the project declares `22.19.0` in `.nvmrc` and dependency-cruiser supports Node 22, 24, or 26+. Run `npm run architecture:check` under a supported runtime before closing the final release gate.
