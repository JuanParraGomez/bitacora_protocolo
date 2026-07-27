# Bitácora Protocol Constitution

## Core Principles

### I. Test-first delivery

Every implementation task begins with normal, boundary, invalid-input, failure/recovery, and regression tests. Run the expected red test before production code, then implement the smallest change and keep focused and aggregate suites green.

### II. Data safety and compatibility

Existing SQLite keys and values remain authoritative during migration. Invalid legacy values are diagnosable and preserved. Backups, checksums, and rollback evidence precede destructive changes.

### III. Feature ownership and boundaries

Features own their rules, services, components, data mapping, and tests. Shared code contains stable cross-boundary contracts only. Cycles, server imports into client code, and private feature-to-feature imports fail verification.

### IV. Operational simplicity

Use one Nuxt/Nitro runtime and one mounted SQLite database until measured workload, ownership, failure isolation, and removal criteria justify extraction. Optional technologies are disabled by default.

### V. Fresh architecture evidence

Source structure is generated deterministically, committed, and checked for staleness. Every capability documents purpose, ownership, dependencies, operational cost, and removal path.

## Development constraints

No provider, queue, cache, second database, or second runtime may be required for the core journal workflow.

## Workflow and quality gates

Tasks are completed only after focused tests, affected regression tests, typecheck, and relevant build/structure checks pass. The standard command is `npm run verify`; browser regression uses `npm run verify:e2e`.

## Governance

This constitution governs implementation and review. Any exception requires a written decision record with benefit, owner, cost, failure isolation, and removal path.

**Version**: 1.0.0 | **Ratified**: 2026-07-26 | **Last Amended**: 2026-07-26
