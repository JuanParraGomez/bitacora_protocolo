# Graph Workflow Contract

## Purpose

Define the stable project-facing behavior for Graphify wrapper commands and assistant consultation. This is a development-tooling contract, not an HTTP or product-runtime interface.

## Commands

| Command | Preconditions | Success | Failure and recovery |
|---|---|---|---|
| `npm run graph:generate` | Graphify CLI installed | Rebuilds local artifact set and writes matching freshness metadata | Exits non-zero, preserves useful diagnostics, and prints installation or retry guidance |
| `npm run graph:update` | Graphify CLI installed | Rebuilds only when the approved input fingerprint differs | Same as generate; unchanged inputs do not rewrite artifacts |
| `npm run graph:watch` | Graphify CLI installed and watcher supported | Watches approved inputs and schedules one refresh per change burst | Reports watcher failure without stopping the application runtime |
| `npm run graph:check` | None | Exits zero only for current, valid artifacts | Exits non-zero for missing, stale, malformed, or failed artifact state with the exact refresh recovery command; it is artifact/fingerprint-only and does not require the CLI |

## Inputs and exclusions

The implementation must define one canonical scope configuration in `scripts/graphify-workflow.mjs`; the wrapper, tests, and freshness metadata must all consume that same definition. It includes `app/`, `pages/`, `server/`, `shared/`, `scripts/`, `tests/`, `specs/`, `AGENTS.md`, `app.vue`, `nuxt.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `Dockerfile`, `docker-compose.yml`, and the legacy HTML while it remains supported. It excludes:

- `.env*`, `secrets/`, credential material, and private keys;
- `node_modules/`, `.nuxt/`, `.output/`, coverage, and other generated build output;
- `data/`, `*.sqlite`, backup artifacts, temporary folders, and Git internals;
- `graphify-out/` and the wrapper's own generated freshness metadata.

## Freshness metadata

The wrapper records the following in a local metadata file:

```json
{
  "schemaVersion": 1,
  "inputFingerprint": "sha256 hex digest",
  "scopeFingerprint": "sha256 hex digest",
  "generatedAt": "ISO-8601 timestamp",
  "graphifyVersion": "detected CLI version"
}
```

The check command must regard the graph as current only when all required artifacts parse successfully and both fingerprints match the current repository state.

## Assistant guidance contract

The committed Codex guidance must state:

1. Query Graphify first for architecture, impact, or multi-file requests.
2. Prefer scoped `query`, `path`, or `explain` actions over reading the full report.
3. Treat inferred or ambiguous edges as leads to validate in source, not as unquestioned facts.
4. Skip the graph for a narrow local change where it would not improve the decision.
5. Disclose a missing or stale graph, then use narrow source exploration as a fallback.
6. Never pass excluded sensitive files to Graphify.
