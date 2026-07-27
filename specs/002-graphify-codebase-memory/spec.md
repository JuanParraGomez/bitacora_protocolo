# Feature Specification: Graphify Codebase Memory

**Feature Branch**: `[002-graphify-codebase-memory]`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Integrate Graphify so the AI consults a relationship map instead of repeatedly reading the whole repository; regenerate it automatically and make its consultation a persistent project practice."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consult a current codebase map (Priority: P1)

As a contributor using an AI coding assistant, I can obtain a local, queryable map of the repository and ask architectural questions against it, so the assistant starts from real relationships rather than reconstructing the entire project from raw files.

**Why this priority**: A trustworthy initial graph is the smallest independently useful outcome and enables every later workflow.

**Independent Test**: From a clean supported development environment, generate a graph and verify that the expected graph artifacts exist and a scoped question about a known project relationship returns an evidence-backed result.

**Acceptance Scenarios**:

1. **Given** a supported local environment and this repository, **When** a contributor generates the codebase map, **Then** the map and its concise report are available locally without changing application behavior or stored journal data.
2. **Given** a generated map, **When** a contributor asks about a known relationship such as a task page's persistence path, **Then** the answer identifies the relevant connected components and source evidence.
3. **Given** Graphify is unavailable or has not been installed, **When** a contributor follows the documented setup, **Then** they receive an actionable setup or recovery instruction and the application itself remains usable.

---

### User Story 2 - Keep graph knowledge current automatically (Priority: P2)

As a contributor, I do not need to remember manual graph maintenance after changing tracked source or architecture documentation, so assistants are not guided by stale relationships.

**Why this priority**: A graph that is correct only on the day it is generated quickly loses its context-saving value.

**Independent Test**: Change a tracked fixture in a temporary copy, run the documented automation, and verify the graph is refreshed; verify that an unchanged repository does not produce a false stale result.

**Acceptance Scenarios**:

1. **Given** a current graph, **When** a tracked source or architecture-documentation file changes, **Then** the local developer workflow regenerates the graph without a manual Graphify command.
2. **Given** a stale graph, **When** project verification runs, **Then** it reports the graph as stale with a clear recovery command.
3. **Given** changes only in generated outputs, dependencies, local databases, or secrets, **When** the automatic refresh check runs, **Then** it does not treat them as source changes requiring a graph update.

---

### User Story 3 - Make graph consultation an AI working rule (Priority: P3)

As a project owner, I can rely on a persistent, scoped instruction that tells AI assistants when and how to consult the graph before broad code exploration, so use of the map does not depend on remembering a convention each session.

**Why this priority**: Installation alone does not change an assistant's retrieval behavior; the project needs an explicit and verifiable operating rule.

**Independent Test**: Inspect the committed assistant guidance and confirm it directs architecture and multi-file work to a scoped graph query first, with a safe fallback when no graph is available.

**Acceptance Scenarios**:

1. **Given** an AI assistant working in this repository, **When** it receives an architecture or multi-file change request, **Then** project guidance instructs it to query the graph before broad search or reading unrelated files.
2. **Given** an AI assistant receives a narrow one-file request, **When** the graph would not materially help, **Then** the guidance permits direct inspection without unnecessary graph queries.
3. **Given** the graph is unavailable or stale, **When** an AI assistant needs repository context, **Then** the guidance requires it to disclose the condition and use targeted source exploration as a fallback.

### Edge Cases

- Graphify is not installed, is an unsupported version, or fails to parse a file.
- The graph command produces partial output or exits unsuccessfully.
- A developer changes files while a graph refresh is running.
- The repository includes generated, dependency, database, secret, or temporary files that must never become graph inputs.
- The automatic workflow runs on a platform without a file-watching capability.
- Graph outputs are stale, absent, malformed, or too large to inspect wholesale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a documented, repeatable local setup for the approved Graphify CLI without adding it to production application dependencies.
- **FR-002**: The project MUST generate a local codebase graph, a concise human-readable report, and a visual exploration artifact from approved repository inputs.
- **FR-003**: The graph workflow MUST exclude secret files, dependency directories, generated build artifacts, local databases, and temporary outputs.
- **FR-004**: The project MUST provide a single documented command that refreshes the graph and a separate command that detects stale graph artifacts.
- **FR-005**: The local development workflow MUST refresh the graph after relevant accepted source or architecture-documentation changes without requiring a contributor to remember a separate manual step.
- **FR-006**: Project verification MUST report an absent, malformed, failed, or stale graph with an actionable recovery instruction.
- **FR-007**: The project MUST include persistent assistant guidance that requires a scoped graph query before broad architecture analysis or multi-file implementation work.
- **FR-008**: Assistant guidance MUST permit direct file inspection for narrow tasks and MUST specify a transparent fallback when Graphify is unavailable or stale.
- **FR-009**: The graph workflow MUST be deterministic enough that an unchanged repository passes freshness verification without rewriting artifacts.
- **FR-010**: The graph integration MUST not change product routes, journal behavior, storage keys, stored records, deployment runtime, or production container requirements.
- **FR-011**: Automated tests MUST cover normal generation, excluded paths, stale detection, regeneration/recovery, unavailable tooling, and assistant-guidance content before production workflow scripts are implemented.

### Key Entities

- **Codebase Graph**: Local machine-readable representation of project entities and their evidence-backed relationships.
- **Graph Artifact Set**: The graph, concise report, visual map, and freshness metadata generated together for one repository state.
- **Graph Scope**: The approved inputs and excluded paths that define what relationships are eligible for mapping.
- **Freshness State**: Whether the generated artifacts match the relevant repository content and generation configuration.
- **Assistant Consultation Rule**: Project-local instruction defining when an AI assistant queries the graph, when it may inspect directly, and how it falls back.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A contributor can set up the graph tool and generate the initial map in 10 minutes or less using only repository documentation.
- **SC-002**: For each of five representative architecture questions, a contributor can obtain a scoped, source-backed relationship answer without opening the full repository report.
- **SC-003**: 100% of relevant source or architecture-documentation changes detected by the development workflow trigger a graph refresh before the next verification succeeds.
- **SC-004**: 100% of stale, missing, or failed graph states produce a recovery instruction and do not prevent unrelated application runtime workflows from operating.
- **SC-005**: The committed assistant guidance contains query-first, direct-inspection, and unavailable-graph paths, all verified automatically.
- **SC-006**: Existing journal behavior, compatibility storage keys, and production startup checks remain unchanged by this feature.

## Assumptions

- Graphify refers to the local CLI and assistant integration published by Graphify-Labs, not the installed npm package named `grapify`.
- The graph is developer tooling and does not need to be available in production containers.
- Generated graph data is local by default; whether selected report artifacts are committed will be decided in planning based on reproducibility and repository size.
- The existing `AGENTS.md` is the primary repository-local instruction surface for Codex and compatible assistants; generated tool-specific instructions may supplement it but cannot weaken its safety rules.
- Existing mandatory test-first and data-preservation rules remain in force.
