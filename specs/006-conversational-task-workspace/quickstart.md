# Quickstart: Workspace conversacional de soluciones repetibles

## Preconditions

- Node.js 22.19+.
- Dependencias instaladas desde el lockfile.
- Base de prueba aislada.
- Sin credenciales ni proveedor externo.
- Fixtures históricos regenerables mediante `npm run fixtures:create`.

## Mandatory red-green sequence

Para cada bloque:

1. Escribir casos feliz, límite, entrada inválida, fallo/recuperación y regresión.
2. Ejecutar la prueba enfocada y confirmar que falla por el comportamiento ausente.
3. Implementar el cambio mínimo.
4. Ejecutar la prueba enfocada y la suite afectada.
5. Hacer commit/push del bloque autorizado antes de continuar.

## Focused verification

### Storage and migration

```bash
npx vitest run tests/contract/storage-batch.contract.test.ts
npx vitest run tests/migration/compatibility-store.test.ts
npx vitest run tests/integration/task-persistence.test.ts
```

Check:

- all-or-nothing batch;
- legacy project synthesis;
- idempotent task repair;
- preserved prompts/messages/evaluations;
- no secret-like fields;
- no partial state after simulated failure.

### Workflow and evidence

```bash
npx vitest run app/features/tasks/domain/task-rules.test.ts
npx vitest run app/features/tasks/domain/method-evidence.schema.test.ts
npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts
```

Check:

- all stage minimums;
- stale outcome-v2 gate;
- one/two executions on same method version;
- material version reset;
- automation hypothesis/candidate;
- legacy evaluation cannot unlock 006.

### Projects and stores

```bash
npx vitest run app/features/tasks/services/project-store.test.ts
npx vitest run app/features/tasks/services/task-store.test.ts
npx vitest run app/features/tasks/services/task-completion.test.ts
npx vitest run app/features/tasks/services/task-deletion.test.ts
```

Check empty, legacy, create, rename, archive, move, complete, delete and transaction failure recovery.

### Conversational workspace

```bash
npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts
npx playwright test tests/e2e/conversational-workspace.spec.ts
npx playwright test tests/e2e/workspace-overlays.spec.ts
```

Check:

- one question per turn;
- proposal accept/edit/reject/conflict;
- no autoapply;
- task/context restoration;
- summary hidden/collapsed/review;
- modal/slideover/notice taxonomy;
- direct route compatibility;
- 320 px, 200% zoom and keyboard.

### Library reuse

```bash
npx vitest run app/features/library/services/library-store.test.ts
npx playwright test tests/e2e/workspace-library.spec.ts
```

Check search, filter, detail, link without overwrite, empty/error recovery and project origin.

## Aggregate gates

```bash
npm run verify
npm run verify:e2e
npm run structure:check
npm run graph:check
```

Human usability criteria in SC-002, SC-003 and SC-010 must be recorded separately; automated tests cannot claim participant results.

## Migration checkpoints

1. Back up/checksum fixture database.
2. Read legacy data without writing.
3. Verify synthesized `legacy` project.
4. Save one repaired task and verify only additive fields.
5. Exercise batch failure and confirm no key changed.
6. Reopen all historical fixtures and compare preserved IDs/content.

## Actual outcomes on Tuesday, July 28, 2026

- `npx vitest run tests/migration/compatibility-store.test.ts`: green, 8/8. Confirms `schemaVersion: 2` round-trip for `repeatable-v1` and `material-v2`, `repeatable-method` on two same-version runs, and `documented-once` after the active material reset.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --grep "Phase 8 security regressions"`: green, 1/1. Hostile HTML remains inert text and does not execute.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --grep "preserves landmarks, keyboard order, modeless library and live regions across overlay states"`: green, 1/1 after removing a duplicated `main` landmark inside `TaskWorkspace.vue`.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/legacy-phase-workflows.spec.ts`: green, 3/3.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/legacy-task-workflows.spec.ts`: green, 4/4.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/nuxt-task-workflows.spec.ts`: green, 13/13 after aligning legacy seeds, preserved deep links (`/tasks/new`, `/library`, `/library/:id`) and the new-task modal navigation flow with the 006 shell.
- `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/nuxt-task-workflows.spec.ts tests/e2e/legacy-phase-workflows.spec.ts tests/e2e/legacy-task-workflows.spec.ts`: green, 20/20 as the combined T080 compatibility checkpoint.
- `npm run structure`: regenerated `docs/architecture/structure.json` and `docs/architecture/structure.md`.
- `npm run structure:check`: green after regeneration.
- `npm run graph:update`: regenerated the allowlisted Graphify output and backed up the curated graph under `graphify-out/2026-07-28/`.
- `npm run graph:check`: green, graph current.
- `npm run verify`: green. Completed `nuxt typecheck`, 221/221 unit tests, 20/20 contract tests, 8/8 migration tests, 37/37 integration tests, `structure:check`, `graph:update`, `graph:check` and `nuxt build`.
- `npm run verify:e2e`: green, 45/45 against `http://127.0.0.1:3005`.
- `npm run build`: green. Production build completed after the final 006 fixes; Nuxt Icon still reports runtime icon fallbacks but the build succeeds.

## Human-only follow-up

- SC-002, SC-003 and SC-010 still require the participant study recorded in `specs/006-conversational-task-workspace/usability-results.md`; automated verification cannot satisfy that evidence.
