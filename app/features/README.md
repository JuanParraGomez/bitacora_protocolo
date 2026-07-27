# Feature modules

Each capability owns its components, domain rules, services, and tests. Pages
compose capabilities but do not own business rules. A capability may import
`shared` contracts, but must not import another capability's internals.

New capabilities require a test-first matrix entry before implementation.
## Capability ownership

Each feature owns its domain rules, components, services, and tests. Pages compose features; they do not own business rules. A new capability starts with a test specification, an owner, its data boundary, failure behavior, and a removal path.

The `example-capability` directory is intentionally removable and demonstrates the expected ownership documentation.

## Current capabilities

`tasks` owns the guided workspace: task intake, active/completed navigation, four phase forms, deterministic gates, assistant chat state, assistant evaluations, provider-mode preference, persistence repair, and completion into library records. The assistant adapter is intentionally deterministic and local in this MVP; it never reads credentials, opens network connections, or treats persisted `prompt*` fields as trusted instructions.

`library` owns completed Markdown records, record browsing, downloads, and template reuse.

`reference` owns static guidance content and accessible reference rendering.

## Deferred provider removal criteria

The mock workspace assistant can be removed only after a real Codex or DeepSeek adapter satisfies the same request/response contract, validates all output with the existing schemas, preserves the deterministic continuation gate, runs without client-side secrets, exposes timeout/cancellation/retry behavior, and passes the guided workspace browser, domain, persistence, migration, structure, and graph checks.

## Add a capability

1. Add behavior tests and edge cases before production code.
2. Create a feature directory with `domain`, `services`, `components`, and tests.
3. Keep persistence behind a service and use `shared` only for stable contracts.
4. Run focused tests, the affected regression suite, `npm run structure`, and `npm run verify`.
