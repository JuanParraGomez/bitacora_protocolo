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
