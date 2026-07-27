# Implementation Plan: Graphify Codebase Memory

**Branch**: `main` | **Date**: 2026-07-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-graphify-codebase-memory/spec.md`

## Summary

Add a local Graphify-Labs knowledge graph for AI-assisted repository exploration. Keep Graphify outside the product runtime, generate graph artifacts from an explicit safe scope, automate local refresh and deterministic freshness checking, and add a project-owned query-first rule for Codex in `AGENTS.md`. Preserve all journal behavior, SQLite keys, deployment behavior, and legacy migration work.

## Technical Context

**Language/Version**: Node.js 22.19+ for wrapper scripts; Python 3.10+ for external Graphify CLI

**Primary Dependencies**: Graphify-Labs `graphifyy` external CLI; existing Node standard library and package scripts; existing Vitest

**Storage**: Local ignored `graphify-out/` artifacts and a project-owned freshness metadata file; no product-data changes

**Testing**: Vitest 4.x for wrapper, scope, freshness, failure/recovery, and assistant-guidance tests; existing aggregate verification

**Target Platform**: macOS/Linux development machines; no production runtime target

**Project Type**: Development tooling integrated into an existing Nuxt modular monolith

**Performance Goals**: Initial graph generation completes within 5 minutes on the current repository; unchanged freshness check completes within 3 seconds; one change burst schedules at most one refresh

**Constraints**: Local-only code parsing; no secrets, databases, dependencies, or build output in graph scope; no product runtime dependency; graph failure must not block application startup or data workflows; Graphify invocation must not overwrite existing `AGENTS.md` rules

**Scale/Scope**: One repository with Nuxt/Vue, server TypeScript, legacy HTML, tests, scripts, and specifications; one developer workflow and Codex project guidance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution is still an unratified template. The enforced project gates in `AGENTS.md` and the feature specification apply:

- **Test-first**: PASS in plan. Every behavior change starts with a focused red test; tasks explicitly order tests before implementation.
- **Data safety**: PASS. No SQLite schema, key, backup, or runtime behavior changes.
- **Operational simplicity**: PASS. One external local CLI; no new service, container, or production dependency.
- **Sensitive-input exclusion**: PASS. Scope excludes `.env*`, secrets, local databases, dependencies, and generated outputs.
- **AI instruction safety**: PASS. Graph guidance supplements rather than replaces existing `AGENTS.md` rules and includes a transparent fallback.

Post-design re-check: **PASS**. The data model and workflow contract keep all graph state local and isolate failure from the application.

## Project Structure

### Documentation (this feature)

```text
specs/002-graphify-codebase-memory/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── graph-workflow-contract.md
└── tasks.md
```

### Source Code (repository root)
```text
scripts/
├── graphify-workflow.mjs       # generate/update/check orchestration and fingerprinting
└── graphify-watch.mjs          # debounced local refresh watcher

tests/integration/
└── graphify-workflow.test.ts   # workflow, scope, stale and recovery behavior

graphify-out/                   # ignored local Graphify artifacts
├── graph.html
├── GRAPH_REPORT.md
├── graph.json
└── freshness.json

AGENTS.md                       # project-owned query-first Codex guidance
package.json                    # graph commands integrated with dev/verify workflow
.gitignore                      # local graph artifact policy
```

**Structure Decision**: Put all project-owned behavior in small Node scripts because the repository already runs Node tooling and needs no new service. Keep Graphify output outside source and ignored by default. Keep the durable behavior contract in `AGENTS.md`, tests, scripts, and this feature documentation; let the external CLI own graph extraction and query semantics.

## Design Decisions

### Installation and ownership

- Graphify is installed once per developer machine with `uv tool install graphifyy`; `pipx` remains an alternative.
- `graphify codex install --project` is run manually during setup only after its intended `AGENTS.md` change is reviewed. The project keeps an explicit owned section so a tool update cannot silently replace safety rules; no wrapper automates this mutation.
- The incorrect npm `grapify` dependency remains untouched by this feature until the Graphify workflow is verified and its removal is separately test-covered.

### Scope and privacy

- Include: `app/`, `pages/`, `server/`, `shared/`, `scripts/`, `tests/`, `specs/`, legacy HTML, and `AGENTS.md`, `app.vue`, `nuxt.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `Dockerfile`, and `docker-compose.yml`.
- Exclude: `.env*`, `secrets/`, `.ssh/`, `.aws/`, `.gnupg/`, `node_modules/`, `.nuxt/`, `.output/`, coverage, `data/`, `*.sqlite`, backups, temp directories, `.git/`, and `graphify-out/`.
- The wrapper passes only the approved scope to Graphify and never relies on a broad repository scan that could violate exclusions.

### Freshness and automatic regeneration

- `graphify-workflow.mjs` owns that canonical allowlist, hashes sorted approved input paths plus contents and scope configuration, and writes `freshness.json` only after Graphify successfully emits all required artifacts.
- `graph:generate` always builds the graph; `graph:update` compares fingerprints and runs Graphify incremental update only when needed; `graph:check` validates artifact existence/shape and fingerprint equality without invoking Graphify. CLI availability is diagnosed only by generate, update, and watch.
- `graphify-watch.mjs` uses the Node watcher to debounce relevant changes and calls `graph:update`. It ignores output and excluded paths.
- `dev` starts the watcher alongside the existing application command only after the initial graph behavior is test-proven. `verify` runs `graph:check` once the required local tooling contract is documented; standard product tests remain independently runnable when Graphify is absent.

### AI consultation behavior

- For architecture, impact analysis, unfamiliar modules, or multi-file changes, `AGENTS.md` directs Codex to query Graphify first using a specific scoped question; `path` and `explain` clarify dependency routes and evidence.
- The assistant must validate inferred or ambiguous edges against source before changing code.
- A narrow, obviously local one-file request may proceed directly.
- If the graph is missing, stale, or unavailable, the assistant says so and falls back to targeted `rg` and minimal file reads; it does not claim graph-backed evidence.

### Test-first verification

- Add integration tests before wrapper code for normal generation via a fake CLI, scope exclusions, hash determinism, absent/malformed output, stale detection, recovery after regeneration, debounce behavior, unavailable CLI, and `AGENTS.md` rule content.
- The test fake is injected through a command-path environment variable; real Graphify need not be installed in CI.
- Add focused command-surface assertions to ensure graph failure does not start or modify the product runtime, database, or container configuration.

## Implementation Stages

1. **Contract and red tests**: Define canonical scope, freshness metadata, fake CLI harness, and failing tests.
2. **Workflow scripts**: Implement generation, update, check, and watch with atomic metadata writes and deterministic hashing.
3. **Command and instruction integration**: Add npm commands, non-invasive dev integration, ignored artifact policy, and owned `AGENTS.md` guidance; document the one-time project-scoped Codex installer and require manual review rather than automate its mutation.
4. **Operational verification**: Generate a real local graph, prove automatic refresh and stale recovery, then decide whether any concise artifact should be committed.

## Complexity Tracking

No constitution-gate violations require justification.
