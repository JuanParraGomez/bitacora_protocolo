# Test-First Traceability Matrix

Every implementation task must point to a test here before production code is changed.

| Area | Normal case | Boundary/empty case | Invalid/failure case | Recovery/regression | Test file |
|---|---|---|---|---|---|
| Storage API | read/write/delete value | missing key and encoded key | malformed body and unavailable DB | existing key/value preserved | `tests/contract/storage-api.contract.test.ts` |
| SQLite migration | valid legacy database | empty database | malformed/interrupted/checksum mismatch | backup and restore | `tests/migration/compatibility-store.test.ts` |
| Tasks | create/save/reopen/complete | empty index and phase boundaries | invalid task shape and blocked transition | legacy keys unchanged | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/services/task-store.test.ts` |
| Browser workflow | primary user journeys | empty lists/missing record | save failure and invalid form | characterization suite | `tests/e2e/*.spec.ts` |
| Library/reference | browse/reuse/render | empty/missing content | unsafe download and unavailable data | task regression | `app/features/library/services/library-store.test.ts`, `app/features/reference/tests/reference-content.test.ts` |
| Commands/build | clean install and production build | missing config/data | command failure | mounted DB and restart | `tests/integration/project-commands.test.ts` |
| Structure graph | deterministic snapshot | excluded/generated dirs | cycles/forbidden imports/schema errors | stale snapshot detection | `tests/integration/structure-snapshot.test.ts` |
| Optional technology | enabled adapter | disabled adapter | timeout/malformed/unavailable provider | core workflows remain green | `tests/integration/optional-provider-isolation.test.ts` |
| Decisions | complete technology record | optional fields absent | missing owner/benefit/cost/removal path | extraction review | `tests/integration/technology-decision.test.ts` |

## Rule

The test must be run once before implementation and fail for the expected missing behavior. The implementation is then made, the test is run again, and the affected regression suite must be green before the task is checked off.

## Feature 006: Conversational workspace traceability

| Criterion | Automated? | Owning test file |
|---|---|---|
| FR-001 | Yes | `app/features/tasks/composables/useTaskIndex.test.ts` |
| FR-002 | Yes | `tests/e2e/workspace-overlays.spec.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-003 | Yes | `tests/e2e/conversational-workspace.spec.ts`, `tests/e2e/workspace-overlays.spec.ts` |
| FR-004 | Yes | `app/features/tasks/composables/useTaskIndex.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-005 | Yes | `app/features/tasks/components/TaskIntakeForm.test.ts`, `tests/e2e/workspace-overlays.spec.ts` |
| FR-006 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| FR-007 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| FR-008 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| FR-009 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| FR-010 | Yes | `app/features/tasks/components/TaskIntakeForm.test.ts`, `tests/e2e/workspace-overlays.spec.ts` |
| FR-011 | Yes | `app/features/tasks/domain/task-workflow.contract.test.ts`, `app/features/tasks/domain/task-rules.test.ts` |
| FR-012 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-013 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-014 | Yes | `app/features/tasks/services/mock-workspace-assistant.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts` |
| FR-015 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-016 | Yes | `app/features/tasks/domain/task-assistant.schema.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-017 | Yes | `app/features/tasks/domain/task-assistant-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-018 | Yes | `app/features/tasks/domain/task-assistant-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-019 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-020 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts`, `app/features/tasks/domain/task-rules.test.ts` |
| FR-021 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts`, `app/features/tasks/domain/task-rules.test.ts` |
| FR-022 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts` |
| FR-023 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts`, `app/features/tasks/domain/task-rules.test.ts` |
| FR-024 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts` |
| FR-025 | Yes | `app/features/tasks/domain/method-evidence.schema.test.ts`, `app/features/library/domain/library-record.schema.test.ts` |
| FR-026 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts` |
| FR-027 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts` |
| FR-028 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/method-evidence.schema.test.ts` |
| FR-029 | Yes | `app/features/library/domain/library-record.schema.test.ts`, `app/features/tasks/domain/method-evidence.schema.test.ts` |
| FR-030 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/task-assistant-rules.test.ts` |
| FR-031 | Yes | `app/features/tasks/domain/task-rules.test.ts` |
| FR-032 | Yes | `app/features/library/services/library-store.test.ts`, `app/features/library/domain/library-record.schema.test.ts` |
| FR-033 | Yes | `app/features/library/services/library-store.test.ts`, `tests/e2e/workspace-library.spec.ts` |
| FR-034 | Yes | `app/features/tasks/domain/task-assistant.schema.test.ts`, `app/features/tasks/composables/useWorkspaceState.test.ts` |
| FR-035 | Yes | `app/features/tasks/composables/useTaskIndex.test.ts`, `app/features/tasks/composables/useWorkspaceState.test.ts` |
| FR-036 | Yes | `tests/e2e/conversational-workspace.spec.ts`, `tests/e2e/workspace-overlays.spec.ts` |
| FR-037 | Yes | `tests/e2e/workspace-overlays.spec.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| FR-038 | Yes | `tests/migration/compatibility-store.test.ts` |
| FR-039 | Yes | `app/features/tasks/domain/task-assistant.schema.test.ts`, `app/features/tasks/domain/task-rules.test.ts` |
| SC-001 | Yes | `tests/e2e/conversational-workspace.spec.ts` |
| SC-002 | No (human) | `specs/006-conversational-task-workspace/usability-results.md` |
| SC-003 | No (human) | `specs/006-conversational-task-workspace/usability-results.md` |
| SC-004 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| SC-005 | Yes | `tests/e2e/workspace-overlays.spec.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| SC-006 | Yes | `tests/e2e/workspace-overlays.spec.ts` |
| SC-007 | Yes | `app/features/tasks/composables/useTaskIndex.test.ts`, `app/features/tasks/composables/useWorkspaceState.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| SC-008 | Yes | `app/features/tasks/domain/task-assistant-rules.test.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| SC-009 | Yes | `app/features/tasks/domain/task-rules.test.ts`, `app/features/tasks/domain/method-evidence.schema.test.ts` |
| SC-010 | No (human) | `specs/006-conversational-task-workspace/usability-results.md` |
| SC-011 | Yes | `tests/e2e/workspace-overlays.spec.ts`, `tests/e2e/conversational-workspace.spec.ts` |
| SC-012 | Yes | `tests/migration/compatibility-store.test.ts` |
