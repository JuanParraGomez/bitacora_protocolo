# Research: Evolution-Ready Project Foundation

## Decision 1: Application architecture

**Decision**: Build a Nuxt 4 modular monolith with Vue 3 and TypeScript.

**Rationale**: The project needs frequent UI and server iteration but currently has one owner, one deployment, and one small SQLite store. Nuxt supplies file-based pages, server routes, production builds, and hot reload in one runtime. Feature-first internal boundaries provide growth without paying the operational cost of distributed services.

**Alternatives considered**:

- **Vue with Vite plus a separate Express backend**: viable, but duplicates development/build concerns and keeps two application entry points without a present isolation need.
- **Next.js**: capable full-stack choice, but requires moving to React when the owner already leans toward Vue; no project requirement benefits uniquely from React.
- **Vue plus FastAPI**: attractive for Python-heavy work, but introduces two languages, two dependency systems, CORS/contract concerns, and two runtimes before a Python-specific workload exists.
- **Keep the current Express and single HTML file**: lowest immediate effort, but does not solve feature isolation, typed boundaries, testability, or maintainable UI growth.

## Decision 2: Runtime versions

**Decision**: Target Node.js 22.19+ LTS and Nuxt 4.x; use the Vue and TypeScript versions resolved and supported by the selected Nuxt release.

**Rationale**: The current Nuxt release declares Node 22.19 or newer supported lines. Pinning the runtime in development and the container prevents local Node 25 behavior from drifting away from production.

**Alternatives considered**:

- **Node 24 LTS**: supported but would require changing the existing Node 22 production image without a feature-level benefit.
- **Unpinned latest Node**: rejected because reproducibility is more important than using a non-LTS local runtime.

## Decision 3: Persistence

**Decision**: Keep SQLite and the existing `kv_store` schema for the modernization; add a repository and validation boundary before considering normalization.

**Rationale**: Data preservation is the highest-priority requirement. The current key/value model already supports the workload. Wrapping it first separates persistence from features and makes future migration testable without combining architecture and data changes.

**Alternatives considered**:

- **Immediate Drizzle schema normalization**: improves queryability but adds migration risk before access patterns require it.
- **PostgreSQL**: useful for concurrent multi-instance workloads, but creates an external service and migration burden unsupported by current scale.
- **Browser-only storage**: would weaken existing server persistence and deployment behavior.

## Decision 4: Validation and contracts

**Decision**: Use shared Zod schemas at browser/server persistence boundaries and an OpenAPI 3.1 document for HTTP compatibility.

**Rationale**: Current values are arbitrary strings containing JSON, and malformed legacy records are possible. Runtime validation creates an explicit compatibility boundary while TypeScript provides compile-time guidance. OpenAPI makes status and body behavior independently testable.

**Alternatives considered**:

- **TypeScript types only**: cannot validate stored or network data at runtime.
- **Generate all application types from OpenAPI**: unnecessary for the small internal interface initially; generation can be added when consumers multiply.

## Decision 5: Testing

**Decision**: Use Vitest for unit/server tests, Nuxt Test Utils for application integration, and Playwright for characterization and primary browser workflows.

**Rationale**: The migration needs both fast rule tests and browser-level proof that the monolithic UI behavior remains intact. Characterization tests reduce rewrite ambiguity.

**Alternatives considered**:

- **End-to-end tests only**: too slow and imprecise for domain rules.
- **Unit tests only**: cannot prove browser workflows, routing, downloads, or persistence integration.
- **Jest**: workable, but Vitest aligns with the Vite/Nuxt toolchain and current Nuxt test utilities.

## Decision 6: Structure graph automation

**Decision**: Analyze import relationships with dependency-cruiser, generate deterministic JSON and Mermaid Markdown, and use a lightweight file watcher only during development.

**Rationale**: The requirement is an architecture/dependency map, not a statistical chart. Mermaid keeps the result reviewable in source control, and dependency rules can enforce the same boundaries shown by the diagram.

**Alternatives considered**:

- **`grapify` npm package**: its published API maps column/value input into chart data; it does not scan project structure, watch files, enforce dependency boundaries, or render architecture diagrams.
- **Runtime dashboard**: adds a product surface and deployment cost for development-only information.
- **Manual diagrams**: become stale and cannot enforce boundaries.

## Decision 7: Future Python service

**Decision**: Defer FastAPI and define extraction criteria rather than including an empty service.

**Rationale**: FastAPI is a strong option for typed Python APIs, validation, generated OpenAPI documentation, AI/data libraries, and independently scaled jobs. None of those needs currently justifies a second runtime.

**Alternatives considered**:

- **Create an empty FastAPI service now**: rejected as speculative complexity.
- **Rule out Python permanently**: rejected because future AI or data-processing capabilities may have a clear Python advantage.

## Decision 8: Deployment

**Decision**: Preserve a single Docker image, the current persistent `/app/data` volume, port 3000, and reverse-proxy integration.

**Rationale**: Keeping the operational contract stable limits modernization risk. Nuxt can produce a Node server output suitable for the same deployment shape.

**Alternatives considered**:

- **Static hosting plus separate API**: splits deployment and does not simplify persistence.
- **Multiple containers now**: has no current scaling or ownership benefit.
