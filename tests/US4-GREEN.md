# US4 Green Evidence

Validated on 2026-07-26.

- `npx vitest run tests/integration/optional-provider-isolation.test.ts tests/integration/optional-provider-contract.test.ts` — 6 tests passed.
- `npx vitest run tests/integration/technology-decision.test.ts` — 2 tests passed.
- `npm run test:integration` — 19 tests passed, including disabled, timeout, malformed, and unavailable provider states.
- Core task, library, reference, migration, contract, and browser regressions remain green.

The provider is disabled by default, bounded by timeout, schema-validated, and unable to make the core workflow unavailable.
