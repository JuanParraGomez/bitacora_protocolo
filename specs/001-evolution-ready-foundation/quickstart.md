# Quickstart: Target Development Workflow

This guide describes the intended workflow after the modernization tasks are implemented. Until Checkpoint 1 lands, the current `npm start` command remains authoritative.

## Prerequisites

- Node.js 22.19 or a compatible Node 22 LTS release
- npm matching the committed lockfile
- A writable local `data/` directory
- Docker only for production-parity and release checks

## Initial setup

```sh
npm ci
cp .env.example .env
npm run db:check
```

The default local database path is `data/bitacora.sqlite`. Setup must not overwrite an existing database.

## Run locally

```sh
npm run dev
```

Open `http://localhost:3000`. Nuxt development mode refreshes UI and server-route changes.

## Standard verification

```sh
npm run verify
```

The command must run formatting/lint checks, type checking, unit tests, contract tests, integration tests, dependency-boundary checks, structure freshness checks, and a production build.

Run browser characterization tests separately when a browser is available:

```sh
npm run verify:e2e
```

## Structure graph

Generate the committed JSON and Mermaid views:

```sh
npm run structure:generate
```

Watch accepted source directories during architecture work:

```sh
npm run structure:watch
```

Verify that committed documentation matches source structure:

```sh
npm run structure:check
```

Generated output is stored in:

- `docs/architecture/structure.json`
- `docs/architecture/structure.md`

## Data safety before a migration checkpoint

```sh
npm run db:backup
npm run migration:verify
```

Backups must be written outside the live database file and include a manifest with key count and content hashes. Restore must be tested against a temporary path before accepting a checkpoint.

## Production-parity build

```sh
npm run build
docker compose build bitacora-protocolo
docker compose up bitacora-protocolo
```

Validate:

- `/api/health` reports application and storage availability.
- Existing `bitacora:*` records remain readable.
- Primary workflows pass against the mounted `data/` volume.

## Add a capability

1. Create `app/features/<capability>/` with its domain, components, services, and tests.
2. Keep pages thin and compose the feature through its public entry point.
3. Put cross-runtime schemas or types in `shared` only when at least two boundaries use them.
4. Add server persistence behind a repository; do not access SQLite from feature UI code.
5. Run `npm run verify` and regenerate the structure snapshot.
6. Document any major dependency using the decision format in `research.md`.

## FastAPI extraction rule

Do not create or deploy a Python service as part of routine feature work. Start a separate specification when a measured Python-native, scaling, or isolation requirement satisfies the criteria in `plan.md`.
## Verified local workflow

Use Node 22.19+ (`.nvmrc`) and install from the lockfile:

```sh
npm ci
cp .env.example .env
npm run fixtures:create   # optional: creates only test fixtures
npm run typecheck
npm run test:unit
npm run test:contract
npm run test:migration
npm run structure
npm run structure:check
npm run build
npm run verify
```

Run the production artifact with `node .output/server/index.mjs`; set `DATA_DIR` to a temporary directory for local verification. The mounted production database lives under `/app/data` in Docker.

Before a risky migration, run `npm run db:backup`. A checksum or health failure means stop, preserve the original database, and restore the verified backup through the documented restore-check script. Rollback is an image rollback; do not delete or rewrite the mounted database.
