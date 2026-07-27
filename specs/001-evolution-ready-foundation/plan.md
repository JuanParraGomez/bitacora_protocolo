# Implementation Plan: Evolution-Ready Project Foundation

**Branch**: `main` | **Date**: 2026-07-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-evolution-ready-foundation/spec.md`

## Summary

Migrate the current single-file browser application and Express storage adapter into a Nuxt 4 modular monolith using Vue 3 and TypeScript. Preserve the existing SQLite `kv_store` and `/api/storage/:key` behavior during the first checkpoint, then move UI behavior into feature-owned modules behind typed application boundaries. Keep one repository, one runtime, one deployment unit, and one standard verification command. Generate the project relationship map from source imports as Mermaid documentation; do not introduce a separate Python service until a measured Python-specific workload requires it.

## Technical Context

**Language/Version**: TypeScript with Node.js 22.19+ LTS; existing JavaScript remains only inside migration adapters until its feature slice is moved

**Primary Dependencies**: Nuxt 4.x, Vue 3.5.x, Nitro server runtime, better-sqlite3 13.x, Zod 4.x, dependency-cruiser 18.x; Drizzle ORM is deferred until normalized tables provide a concrete benefit

**Storage**: Existing SQLite database and `kv_store(key, value, updated_at)` schema, mounted at `/app/data`; JSON payload formats remain compatible during migration

**Testing**: Vitest 4.x for domain and server tests, Nuxt Test Utils 4.x for application integration, Playwright 1.x for primary browser workflows

**Target Platform**: Linux container deployment behind the existing reverse proxy; local macOS/Linux development; current single-instance persistent-volume model

**Project Type**: Full-stack web application implemented as a modular monolith

**Performance Goals**: Primary navigation and saved-record views become interactive within 2 seconds on a typical broadband connection; save feedback appears within 1 second; structure generation completes within 10 seconds for the planned scope

**Constraints**: Preserve all existing records and storage keys; one deployment unit; no required external service; no visual redesign; rollback must restore the previous image while reusing an unchanged database; generated files and dependency directories are excluded from structure analysis

**Scale/Scope**: Initial single-owner application, one existing HTML client of approximately 1,150 lines, one 68-line server, five primary views, four task phases, and low-volume SQLite storage; architecture should support roughly 20 cohesive capability modules before service extraction is reconsidered

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

The constitution file is an unratified template and defines no enforceable project principles. The approved specification therefore supplies the gates for this plan:

- **Incremental migration**: PASS. Four checkpoints leave a runnable application after each stage.
- **Data compatibility and recovery**: PASS. The first implementation retains the SQLite schema and storage-key contract without destructive migration.
- **Operational simplicity**: PASS. The target remains one runtime, one deployment unit, and one standard command surface.
- **Capability isolation**: PASS. Source layout is feature-first with domain boundaries and contract tests.
- **Versioned contracts**: PASS. The compatibility HTTP interface is captured in `contracts/storage-api.openapi.yaml`.
- **Optional technology isolation**: PASS. No Python service, queue, cache, or separate database is introduced.
- **Structure documentation freshness**: PASS. Dependency analysis generates a deterministic Mermaid snapshot checked by the verification workflow.

Post-design re-check: **PASS**. The data model, contracts, migration checkpoints, and quickstart retain all gates. Ratifying a project constitution remains recommended but is not a blocker for this plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-evolution-ready-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── storage-api.openapi.yaml
│   └── structure-snapshot.schema.json
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── app.vue
├── assets/
│   └── css/
├── components/
│   └── shared/
├── composables/
└── features/
    ├── tasks/
    │   ├── components/
    │   ├── domain/
    │   ├── services/
    │   └── tests/
    ├── library/
    │   ├── components/
    │   ├── domain/
    │   ├── services/
    │   └── tests/
    └── reference/
        ├── components/
        ├── domain/
        └── tests/

pages/
├── index.vue
├── tasks/
│   ├── new.vue
│   └── [id].vue
├── library/
│   ├── index.vue
│   └── [id].vue
└── reference.vue

server/
├── api/
│   ├── health.get.ts
│   └── storage/
│       ├── [key].get.ts
│       ├── [key].put.ts
│       └── [key].delete.ts
├── domain/
├── repositories/
│   └── kv-store.repository.ts
├── services/
└── utils/
    └── database.ts

shared/
├── contracts/
├── schemas/
└── types/

scripts/
└── generate-structure.mjs

docs/
└── architecture/
    ├── structure.json
    └── structure.md

tests/
├── contract/
├── integration/
├── migration/
└── e2e/

data/
└── bitacora.sqlite
```

**Structure Decision**: Use Nuxt's standard full-stack directories with feature-owned client modules under `app/features`, server persistence behind a repository, and shared code limited to cross-boundary contracts and schemas. This provides a single deployable application while keeping extraction seams visible. A feature may depend on `shared`, but direct imports between feature internals are rejected by dependency rules.

## Design Decisions

### Runtime and application shape

- Nuxt owns browser rendering, routing, server endpoints, production build, and runtime configuration.
- Nitro replaces Express only after compatibility tests prove the existing HTTP storage behavior.
- Server-only modules never enter browser bundles. Client features access persistence through typed service interfaces.
- Pages compose feature components but contain no business rules.

### Persistence and compatibility

- Checkpoint 1 opens the existing SQLite file and retains the `kv_store` table unchanged.
- A `KvStoreRepository` centralizes reads, writes, deletes, timestamps, transactions, and error mapping.
- Existing keys (`bitacora:index`, `bitacora:t:<id>`, and `bitacora:r:<id>`) remain authoritative during this feature.
- JSON schemas validate data at read and write boundaries. Invalid legacy records are reported and preserved, not silently rewritten.
- Normalized tables and Drizzle are a later decision after access patterns or reporting needs justify migration.

### Module boundaries

- `tasks` owns task creation, four-phase progression, gates, prompts, and task persistence mapping.
- `library` owns completed-record browsing, download, and template reuse.
- `reference` owns static guidance and anti-pattern content.
- Shared code contains only stable contracts, validation primitives, and presentation-neutral utilities.
- Dependency rules fail verification on cycles, forbidden feature-to-feature imports, or server imports from client code.

### Project structure visualization

- `scripts/generate-structure.mjs` scans accepted source directories and dependency relationships.
- Output is deterministic `docs/architecture/structure.json` plus a Mermaid graph in `structure.md`.
- Development watch mode regenerates after accepted structural changes; CI runs a check mode that fails when committed output is stale.
- `node_modules`, `.nuxt`, `.output`, `data`, generated artifacts, and specification infrastructure are excluded.
- The installed `grapify` npm package is not used for this purpose because it transforms column/value inputs and does not inspect imports, watch files, or render architecture graphs. Remove it when implementation confirms there is no product-chart requirement.

## Migration Checkpoints

### Checkpoint 0 — Baseline and recovery

- Back up a representative database and record checksums/counts for all keys.
- Capture Playwright characterization tests for task creation, save/reopen, phase gates, completion, library access, template reuse, deletion, and Markdown download.
- Document current container startup and rollback.
- Exit gate: baseline tests pass against the current application and database restore is proven.

### Checkpoint 1 — Nuxt shell with compatibility storage

- Scaffold Nuxt in the existing repository and reproduce the health and storage endpoints through Nitro.
- Keep the current HTML experience available through a temporary legacy route or static asset.
- Run contract tests against both Express and Nitro adapters with the same fixtures.
- Exit gate: existing records and endpoint responses are byte-compatible where specified; one Nuxt production container starts successfully.

### Checkpoint 2 — Tasks capability

- Extract task types, shape repair, phase gates, prompt generation, saving, and task pages.
- Read and write the original storage keys through typed services.
- Exit gate: characterization and new unit/integration tests pass for active-task workflows.

### Checkpoint 3 — Library and reference capabilities

- Move completed records, Markdown generation/download, template reuse, and reference content.
- Replace the legacy client entry point after all primary workflows pass.
- Exit gate: all baseline workflows pass through the new client and the legacy route is no longer required for normal operation.

### Checkpoint 4 — Structure automation and cleanup

- Add dependency rules, deterministic Mermaid generation, watch/check commands, and architecture guidance.
- Remove Express, the monolithic HTML file, migration adapters, and `grapify` only after repository-wide usage checks.
- Exit gate: clean setup, test, build, structure check, backup, and rollback drills all pass.

## Verification Strategy

- **Unit**: Task shape repair, phase transition rules, prompts, Markdown generation, key naming, schema validation, and error mapping.
- **Contract**: Every status code and response body in `storage-api.openapi.yaml`, including encoded keys and malformed requests.
- **Migration**: Snapshot existing SQLite fixtures before and after each checkpoint; compare keys and values and verify restore.
- **Integration**: Nuxt pages with server routes and a temporary database.
- **End-to-end**: Representative primary workflows in a real browser.
- **Architecture**: Dependency-cycle and boundary checks plus stale structure snapshot detection.
- **Release**: `npm run verify` runs type checking, unit, contract, integration, architecture, and production build checks; browser tests may use a dedicated `verify:e2e` command locally and in CI.

## Deferred Extraction Criteria

Introduce FastAPI as a separate service only when at least one measured condition exists:

- Python-native AI/data libraries are central to a capability and a TypeScript adapter would add more maintenance than isolation.
- A workload requires independent scaling, resource limits, or long-running execution.
- The capability has a stable, versioned contract and can fail without blocking primary journal workflows.
- Deployment, monitoring, authentication, retries, data ownership, and local developer overhead are explicitly funded.

Until then, advanced providers are adapters inside the modular monolith.
