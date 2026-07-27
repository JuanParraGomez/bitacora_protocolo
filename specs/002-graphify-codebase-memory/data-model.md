# Data Model: Graphify Codebase Memory

## Codebase Graph

Produced and owned by Graphify. It represents source and documentation entities as nodes connected by typed, provenance-labelled edges.

| Field | Description | Validation |
|---|---|---|
| artifact path | Local location of the machine-readable graph | Must be under `graphify-out/` |
| source revision | Deterministic fingerprint of approved graph inputs | Must match the current input fingerprint for a current graph |
| provenance | Evidence class for a relationship | Must be Graphify-reported and displayed to a user when available |

## Graph Artifact Set

The coherent local output of one successful generation.

| Field | Description | Validation |
|---|---|---|
| graph | Machine-readable relationship data | Must parse and be non-empty |
| report | Concise architecture summary | Must be present after successful generation |
| visual map | Interactive human exploration view | Must be present after successful generation |
| freshness metadata | Project-owned generation metadata | Must describe the same input fingerprint and scope configuration |

## Graph Scope

Defines the repository inputs that may influence the graph.

| Field | Description | Validation |
|---|---|---|
| include paths | `app/`, `pages/`, `server/`, `shared/`, `scripts/`, `tests/`, `specs/`, legacy HTML, and the root files `AGENTS.md`, `app.vue`, `nuxt.config.ts`, `tsconfig.json`, `package.json`, `package-lock.json`, `Dockerfile`, and `docker-compose.yml` | Paths must match the single allowlist owned by `scripts/graphify-workflow.mjs` |
| exclude paths | Sensitive, generated, dependency, data, and temporary paths | Must include `.env*`, `secrets/`, dependency directories, output directories, local databases, and `graphify-out/` |
| generator version | CLI version used for the artifact set | Recorded for diagnostic purposes; version change requires regeneration |

## Freshness State

| State | Meaning | Required result |
|---|---|---|
| current | Artifact metadata matches source fingerprint and configuration | Check succeeds without regeneration |
| stale | Relevant input or configuration changed | Check fails with refresh command |
| missing | Artifact set or metadata does not exist | Check fails with setup/generate instruction |
| unavailable | CLI cannot run | Graph operation reports setup/recovery; application runtime remains unaffected |
| failed | Generation exited unsuccessfully or left invalid artifacts | Preserve diagnostics and report recovery instruction |

## Assistant Consultation Rule

| Field | Description |
|---|---|
| trigger | Architecture questions, impact analysis, unfamiliar areas, and multi-file changes |
| preferred action | Run a scoped Graphify query/path/explain command before broad search |
| direct-inspection exception | Narrow, clearly local one-file requests |
| fallback | State graph absence/staleness and use targeted `rg` plus minimal file reads |

## Relationships

```text
Graph Scope ──defines──> Input Fingerprint ──proves freshness of──> Graph Artifact Set
Graph Artifact Set ──serves──> Assistant Consultation Rule
Assistant Consultation Rule ──guides──> Scoped Graph Query
```
