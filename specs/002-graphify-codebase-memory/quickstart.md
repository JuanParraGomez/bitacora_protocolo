# Quickstart: Graphify Codebase Memory

## Prerequisites

- Python 3.10 or later.
- `uv` (preferred) or `pipx`.
- Node.js version already required by this repository.

## Install the development tool

```bash
uv tool install graphifyy
graphify --version
```

If `uv` is unavailable, use the documented `pipx install graphifyy` alternative. Do not add Graphify to `package.json`, Docker, or production deployment configuration. The project defaults to Graphify's local `--code-only` mode so no API key is required; set `GRAPHIFY_CODE_ONLY=0` only when a configured semantic backend is intentionally available.

## Register project-local Codex guidance

After initial generation, run `graphify codex install --project` once. Review its proposed changes to `AGENTS.md` before accepting them; it must preserve the repository-owned Graphify section and all existing project rules. The project does not automate or wrap this mutation.

## Generate and consult the graph

From the repository root, where the local `graphify-out/` artifact set lives:

```bash
npm run graph:generate
graphify query "how does task creation reach SQLite?"
graphify path "TaskIntakeForm" "KvStoreRepository"
```

Use `graphify explain <symbol>` to inspect a node and distinguish extracted, inferred, or ambiguous relationships.

## Keep it fresh

```bash
npm run graph:watch
npm run graph:check
```

The normal development and verification commands documented by the implementation refresh/check the graph automatically. If check reports a stale graph, run `npm run graph:update` and repeat the check.

## Recovery

- **CLI missing**: install `graphifyy`, then run `npm run graph:generate`.
- **Generation failed**: inspect the displayed diagnostic, fix the relevant local prerequisite or parse error, then rerun generate.
- **Graph stale**: run `npm run graph:update`.
- **Assistant needs context while graph is unavailable**: state the limitation and use targeted repository exploration; application runtime and stored data remain independent of Graphify.
