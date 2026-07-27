# Research: Graphify Codebase Memory

## Decision 1: Use Graphify-Labs Graphify, not the installed `grapify` npm package

**Decision**: Use the locally installed `graphifyy` Python CLI from Graphify-Labs as development tooling; remove the unrelated npm package only after the new workflow is proven.

**Rationale**: Graphify-Labs parses source locally into a knowledge graph and exposes scoped `query`, `path`, and `explain` operations. Its output includes a machine-readable graph, concise report, and visual map. The installed npm package transforms chart values and cannot map a codebase.

**Alternatives considered**:

- **Keep npm `grapify`**: rejected because it is a data-chart utility, not repository intelligence.
- **Build a bespoke import graph with dependency-cruiser only**: retained as complementary architecture enforcement, but rejected as the primary AI retrieval layer because it does not provide Graphify's function/symbol graph and assistant integration.
- **Use embeddings/RAG**: rejected for the initial scope because the requirement is explicit relationship traversal, not fuzzy prose retrieval.

## Decision 2: Keep Graphify outside the runtime and production dependency graph

**Decision**: Install Graphify through `uv tool install graphifyy` (with `pipx` as documented alternative) and never add it to `package.json`, the Dockerfile, or the production image.

**Rationale**: The graph is local developer and assistant context. Isolating it preserves the existing Nuxt runtime, SQLite data, deployment surface, and rollback contract.

**Alternatives considered**:

- **Add Graphify to npm dependencies**: rejected because it is not an npm package and would incorrectly make a development tool a runtime concern.
- **Bundle it in the container**: rejected because the application does not need graph generation to serve users.

## Decision 3: Use project-local Codex guidance plus Graphify's Codex installer

**Decision**: Register Graphify for Codex with the project-scoped Codex installer, then keep an explicit, repository-owned graph consultation section in `AGENTS.md` that preserves existing safety and test-first rules.

**Rationale**: Graphify documents that Codex uses `AGENTS.md` as the always-on mechanism; its PreToolUse hook is intentionally a no-op on Codex. A checked, project-local rule is inspectable, testable, and survives sessions.

**Alternatives considered**:

- **Rely only on a user-profile installation**: rejected because collaborators and automated environments would not share the rule.
- **Use only an MCP server**: deferred; it is useful where a compatible host is configured, but it should not be required for the local CLI workflow.
- **Put full graph output in `AGENTS.md`**: rejected because it would consume context and become stale.

## Decision 4: Generate locally, refresh from the normal developer command surface, and verify freshness by fingerprint

**Decision**: Implement a small Node wrapper around the Graphify CLI with three commands: generate, watch/refresh, and check. It computes a deterministic fingerprint of approved inputs and generation configuration, stores metadata beside local graph artifacts, and invokes Graphify with incremental update support when relevant inputs change.

**Rationale**: The wrapper makes freshness testable and yields an actionable failure even when Graphify itself does not expose a project-specific stale contract. The existing Node toolchain can run it without adding another service. Watch mode covers continuous local work; the standard development and verification commands invoke a refresh/check so contributors do not need to remember manual maintenance.

**Alternatives considered**:

- **Manual `graphify .` runs**: rejected because they inevitably create stale maps.
- **Commit the full generated graph**: rejected by default because graph size and churn are not yet measured; the concise report can be revisited after a real output is inspected.
- **Git hooks only**: insufficient because hooks can be bypassed and do not cover uncommitted development changes.

## Decision 5: Limit inputs and make failures non-blocking for runtime work

**Decision**: Map application source, tests, scripts, specs, and selected project guidance. Exclude `.env*`, `secrets/`, dependencies, build artifacts, local databases, temporary directories, generated graph outputs, and Git internals. Graph failure blocks only graph freshness verification, never application startup, database access, or product workflows.

**Rationale**: The graph must be useful without ingesting sensitive or noisy inputs. Explicit failure isolation preserves the project's data safety and operational simplicity.

**Alternatives considered**:

- **Map every file by default**: rejected because it risks secrets/noise and degrades graph usefulness.
- **Fail every development command when Graphify is missing**: rejected because Graphify is optional developer tooling and must not stop core work.

## Sources

- Graphify's official README documents local installation, Codex integration, graph artifacts, scoped query commands, and Codex's `AGENTS.md` behavior: <https://github.com/Graphify-Labs/graphify>.
- Graphify's official quickstart documents `--update`, local artifacts, and graph queries: <https://graphify.com/docs>.
- Graphify's concepts documentation explains local AST parsing, provenance tags, and graph-first traversal: <https://graphify.com/concepts>.
