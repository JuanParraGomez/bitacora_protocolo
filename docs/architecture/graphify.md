# Graphify codebase context

Graphify is development tooling only. It is installed outside the Node/Nuxt runtime with `uv tool install graphifyy` and must not be added to `package.json`, Docker, or production deployment.

## Workflow

- `npm run graph:generate` creates `graphify-out/graph.json`, `GRAPH_REPORT.md`, `graph.html`, and freshness metadata.
- `npm run graph:update` refreshes the graph after relevant changes. The development command starts `scripts/graphify-watch.mjs` automatically.
- `npm run graph:check` validates artifacts and fingerprints without requiring the Graphify CLI.
- `npm run verify` updates and checks the graph as part of aggregate verification.

The default mode is `--code-only`, which parses source locally and requires no API key. Set `GRAPHIFY_CODE_ONLY=0` only when an intentionally configured semantic backend is available.

## Scope and safety

The wrapper allowlists application source, tests, scripts, specifications, project guidance, and architecture-relevant root configuration. It excludes environment files, secrets, private keys, dependencies, generated output, local databases, backups, temporary files, Git internals, and `graphify-out/`.

Graph artifacts are local and ignored by Git by default. The graph is not required by production startup, SQLite access, or user workflows.

## Assistant usage

Codex guidance lives in `AGENTS.md`. For architecture or multi-file work, query the graph first with a scoped `graphify query`, `graphify path`, or `graphify explain`; verify inferred or ambiguous edges against source. If the graph is stale or unavailable, disclose it and use targeted source exploration.

## Removal path

Remove `scripts/graphify-workflow.mjs`, `scripts/graphify-watch.mjs`, `scripts/dev-with-graphify.mjs`, their tests and npm commands, the Graphify section of `AGENTS.md`, and this document. The application runtime and database remain independently deployable. The unrelated npm `grapify` package may be removed only after repository-wide usage verification.
