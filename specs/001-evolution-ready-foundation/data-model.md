# Data Model: Evolution-Ready Project Foundation

## Compatibility store

### StoredRecord

Represents one row in the existing `kv_store`. It remains the persistence source of truth throughout this modernization.

| Field | Type | Rules |
|-------|------|-------|
| `key` | string | Required, unique, non-empty; URL-encoded when used in the HTTP path |
| `value` | string | Required; preserved byte-for-byte unless a user action changes the record |
| `updatedAt` | timestamp | Set by the server on accepted writes |
| `compatibilityState` | enum | Derived as `valid`, `legacy`, or `invalid`; not written into the existing row |

Key namespaces:

- `bitacora:index`: serialized `JournalIndex`
- `bitacora:t:<taskId>`: serialized `Task`
- `bitacora:r:<recordId>`: Markdown content for a completed `LibraryRecord`

Validation behavior:

- Unknown keys remain readable and are never deleted by migration.
- Invalid JSON in known JSON namespaces returns a diagnosable compatibility error to application services while preserving the original string.
- Writes require a string value to preserve the existing HTTP contract.

### JournalIndex

| Field | Type | Rules |
|-------|------|-------|
| `tasks` | TaskSummary[] | Defaults to an empty list when no index exists |
| `records` | RecordSummary[] | Defaults to an empty list when no index exists |

### TaskSummary

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Required and unique within the index |
| `name` | string | Required for newly created tasks |
| `phase` | integer | 1 through 4 |
| `status` | enum | `active` or `completed` |
| `type` | string | Known type or compatibility fallback |

### RecordSummary

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Required and unique within the index |
| `taskId` | string | References the originating task |
| `title` | string | Display and download name |
| `createdAt` | number or string | Existing representation preserved during compatibility phase |
| `type` | string | Known type or compatibility fallback |

## Task aggregate

### Task

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Immutable after creation |
| `name` | string | Non-empty |
| `directive` | string | May be empty |
| `type` | string | Defaults to `general` for new tasks |
| `createdAt` | number | Creation time |
| `phase` | integer | 1 through 4 |
| `status` | enum | `active` or `completed` |
| `templateFrom` | string or null | Optional source record |
| `orientation` | OrientationPhase | Required |
| `guidance` | GuidancePhase | Required |
| `execution` | ExecutionPhase | Required |
| `review` | ReviewPhase | Required |

### OrientationPhase

- `lineage`: one or more lineage entries
- `questions`: free text
- `mappingConfirmed`: boolean

### GuidancePhase

- Decision, FAQs, scope, non-goals, steps, discarded alternatives, guide text, and guide prompt
- `predictions`: one or more items with text, threshold, and confidence

### ExecutionPhase

- `iterations`: one or more attempt/result/adjustment items
- Compilation and audit confirmations
- Notes and execution prompt

### ReviewPhase

- After-action rows connecting prediction, observation, cause, and ownership
- Change, reusable pattern, title, connections, and review prompt

State transitions:

```text
active/phase-1 -> active/phase-2 -> active/phase-3
active/phase-3 -> active/phase-4 -> completed/phase-4
```

- A transition occurs only when the current phase gate reports no missing requirements.
- Completing phase 3 creates review rows from non-empty predictions.
- Completing phase 4 creates a `LibraryRecord` and updates the index.
- Deleting an active task removes its task value and index summary but preserves any completed library record.

Compatibility mapping:

- Existing `f1`, `f2`, `f3`, and `f4` JSON property names remain accepted.
- Typed domain names may be used internally, but serialization writes the existing shape until a separately tested data migration is approved.
- Missing prompt and phase objects receive the same defaults as the current `ensureTaskShape` behavior.

## Library record

### LibraryRecord

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Immutable |
| `taskId` | string | Links to the originating task |
| `title` | string | Used for display and download |
| `markdown` | string | Persisted under `bitacora:r:<id>` |
| `createdAt` | timestamp-compatible value | Existing representation preserved |
| `type` | string | Inherited from task |

Relationships:

- A task may produce zero or one completed library record in the current workflow.
- A library record references its originating task, but remains available if that task is later deleted.
- A library record may seed a new task through template reuse.

## Architecture metadata

### CapabilityModule

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Stable kebab-case identifier |
| `path` | string | Repository-relative source path |
| `purpose` | string | Required in module documentation |
| `owns` | string[] | User flows, rules, and data responsibilities |
| `dependencies` | string[] | May target `shared` or public module contracts only |

### ApplicationContract

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Stable identifier |
| `version` | string | Required for independently operated boundaries |
| `owner` | string | Capability or platform area |
| `inputs` | schema | Validated |
| `outputs` | schema | Validated |
| `errors` | schema | Enumerated and testable |

### MigrationCheckpoint

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Ordered checkpoint identifier |
| `scope` | string[] | Explicit included changes |
| `baselineEvidence` | string[] | Required before execution |
| `validationEvidence` | string[] | Required before acceptance |
| `recoveryProcedure` | string | Required and tested |
| `status` | enum | `planned`, `in-progress`, `validated`, `rolled-back` |

State transitions:

```text
planned -> in-progress -> validated
                    \-> rolled-back
```

### ProjectStructureSnapshot

| Field | Type | Rules |
|-------|------|-------|
| `schemaVersion` | integer | Starts at 1 |
| `generatedAt` | string | Informational; excluded from stale-content comparison if needed |
| `modules` | CapabilityModule[] | Sorted by stable identifier |
| `edges` | DependencyEdge[] | Sorted and deduplicated |
| `sourceHash` | string | Hash of accepted structural inputs |

`DependencyEdge` contains `from`, `to`, and `kind`. Paths must be repository-relative, generated directories are forbidden, and self-edges are omitted.
