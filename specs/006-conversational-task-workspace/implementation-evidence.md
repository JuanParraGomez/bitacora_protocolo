# Implementation Evidence: Workspace conversacional de soluciones repetibles

## Phase 1: Setup and test harness

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T001 | Traceability | Append-only docs update | Mapping missing for FR-001...FR-039 and SC-001...SC-012 | `tests/TEST-MATRIX.md` now includes all requirements with owning test files | ✅ COMPLETE |
| T002 | Setup | `cat` / manual fixture generation | Missing reusable fixture builders in `tests/fixtures/tasks/conversational-workspace-task.ts` | Added project/method-version/iteration/automation candidate builders with deterministic defaults | ✅ COMPLETE |
| T003 | Setup | Manual fixture definition and manifest update | Missing fixture families for two-project, legacy-project, repeatable-v1, material-v2 | Added four legacy-oriented fixture definitions and `tests/fixtures/legacy/manifest.json` entries | ✅ COMPLETE |
| T004 | Setup | `specs/006.../implementation-evidence.md` ledger append-only | Missing phase-ledger format for red/green + manual-only boundaries | Evidence ledger created with first four phase entries, including human-only criteria rows | ✅ COMPLETE |

## Human-only criteria

| Criterion | Owner | Status |
|---|---|---|
| SC-002 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |
| SC-003 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |
| SC-010 | `specs/006-conversational-task-workspace/usability-results.md` | ⏳ PENDING |

## Phase 2: Foundational storage, schemas and migration (in progress)

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T005 | Contract | `npx vitest run tests/contract/storage-batch.contract.test.ts` | `storage-batch` contract lacked repository-failure atomic rollback coverage | Added `runStorageBatch` repository-failure coverage with expected 500 and no partial state mutation in `tests/contract/storage-batch.contract.test.ts` | ⏳ PENDING |

## Phase 3: User Story 1 - Convertir un problema en método repetible

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T032 | Verification | `npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts app/features/tasks/domain/task-rules.test.ts app/features/tasks/services/mock-workspace-assistant.test.ts app/features/tasks/services/task-completion.test.ts tests/contract/task-workflow.contract.test.ts tests/integration/task-persistence.test.ts` + `npx playwright test tests/e2e/guided-workspace.spec.ts` | US1 suites fallaban en validaciones de salida por fase (campos obligatorios y continuidad de fase 4) | Ajustado `tests/e2e/guided-workspace.spec.ts` para estado vigente de fase 2 y `pages/tasks/[id].vue` para que el estado de tarea no bloquee acciones con `pointer-events` | ✅ COMPLETE |

## Phase 4: User Story 2 - Responder conversando y confirmar de forma simple

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T033 | Unit / adapter contract | `npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts` | 3 fallos: faltaban identidad completa, `primaryQuestion` y retry secuencial determinista | 18/18 pasan; turno y propuestas conservan contexto, pregunta única, rutas cerradas y retry idempotente | ✅ COMPLETE |
| T034 | Unit / proposal rules | `npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts` | 9 fallos: autoaplicación sin decisión, sin `pending`, decisiones/contexto ignorados | 29/29 pasan; pending, accept, edit, reject, duplicados, stale y conflictos de identidad/versionado | ✅ COMPLETE |
| T035 | Playwright | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts` | 1 fallo: no existía tarjeta accesible ni acciones de propuesta | 2/2 pasan; resumen vacío oculto y flujo chat/formulario/mixto confirmado sin sobrescritura | ✅ COMPLETE |
| T036 | Integration / persistence | `npx vitest run tests/integration/task-persistence.test.ts` | 1 fallo: el mensaje con contexto, contradicciones y estados de propuesta se descartaba al reabrir | 8/8 pasan; `proposed`, `applied`, `rejected` y `conflict` sobreviven sin alterar el dato humano | ✅ COMPLETE |
| T037 | Schema | `npm run typecheck` + persistence focused | El contrato no modelaba pregunta, contradicción, contexto ni decisión | Schema de turno, contradicción, decisión y propuesta contextual tipado y persistible | ✅ COMPLETE |
| T038 | Domain | Unit rules focused | Las actualizaciones válidas se aplicaban automáticamente | Decisiones explícitas idempotentes con revisión y contexto actuales; compatibilidad legacy conservada | ✅ COMPLETE |
| T039 | Service | Unit adapter focused | El adaptador devolvía sugerencias/updates sin pregunta ni identidad completa | Pregunta guiada por vacío, propuestas pending seguras y IDs deterministas | ✅ COMPLETE |
| T040–T042 | UI / orchestration | Conversational + guided Playwright | Chat sin decisiones; resumen permanente; workspace autoaplicaba | Tarjetas con valor anterior/propuesto, Accept/Edit/Discard, resumen contextual y guardado explícito | ✅ COMPLETE |
| T043 | Focused checkpoint | `npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts app/features/tasks/domain/task-assistant-rules.test.ts tests/integration/task-persistence.test.ts` + conversational/guided Playwright + `npm run typecheck` | N/A after observed task-level reds | 55/55 Vitest, 2/2 US2 Playwright, 7/7 guided regression and typecheck pass | ✅ COMPLETE |

Known out-of-phase baseline: `app/features/tasks/domain/task-assistant.schema.test.ts`
has one existing index-repair failure (`record.taskId` repairs to `""` instead of the
expected legacy task ID). It is outside T033–T043 and is not counted as US2 green
evidence.

### Phase 4 independent-review corrections

| Scope | Red evidence | Green result | Status |
|---|---|---|---|
| Outcome-v2 revisions, closed paths and no-autoapply fallback | `task-assistant-rules.test.ts`: 19 expected failures (9 revision, 9 closed-path, 1 implicit autoapply) | 47/47 pass; every 006 field invalidates its phase revision and every public path leaves proposals pending until an explicit decision | ✅ COMPLETE |
| Gap-driven chat equivalence | `mock-workspace-assistant.test.ts`: 4 representative natural-answer failures, followed by 2 minimum-output gaps | 24/24 pass; typed proposals cover new phase fields, arrays, predictions, iterations and procedural change without repeating confirmed fields | ✅ COMPLETE |
| Typed proposal editing | Playwright typed-array case failed first because the UI emitted JSON as text, then rejected invalid JSON without feedback | 3/3 conversational Playwright cases pass; invalid JSON is announced and valid array edits preserve the schema type | ✅ COMPLETE |
| Affected schema regression | `task-assistant.schema.test.ts`: 14/15 because empty canonical `taskId` masked legacy `tareaId` | 15/15 pass after preferring the non-empty legacy identifier | ✅ COMPLETE |
| Final checkpoint | Focused reviewer run plus guided selector regression | 79/79 focused Vitest, 15/15 affected schema, 3/3 US2 Playwright, 7/7 guided regression, `npm run typecheck` and `npm run build` pass | ✅ COMPLETE |

The earlier “known out-of-phase baseline” note records the state observed before
the independent-review correction; it is superseded by the green schema row above.

## Phase 5: User Story 3 - Mantener el contexto al navegar

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T045 / T049 | Unit / workspace state | `npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts` | El módulo `useWorkspaceState.ts` no existía y Vitest falló al importarlo | 12/12 pasan; selección, borrador, resumen, ancla por ID, reparación, reset y aislamiento por generación quedan cubiertos | ✅ COMPLETE |
| T044 / T048 | Unit / project grouping | `npx vitest run app/features/tasks/composables/useTaskIndex.test.ts` | 6/6 fallaron porque no se cargaba `bitacora:projects` ni existían grupos por proyecto y estado | 6/6 pasan; proyectos activos, archivados, vacíos, legacy y recuperación conservan agrupación aislada | ✅ COMPLETE |
| T047 | Unit / atomic task move | `npx vitest run app/features/tasks/services/project-store.test.ts` | 6/6 fallaron porque `moveTask` no existía | 14/14 pasan; batch único, rollback/retry, pertenencia real, validación y no-op idempotente | ✅ COMPLETE |
| T046 | Playwright red | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts` | 4 escenarios US3 fallaron por ausencia de controles de proyecto/tarea, recuperación contextual, orden de teclado y shell adaptable; los casos posteriores reprodujeron selección global incorrecta, raíz 404, proyecto vacío con conversación ajena, pérdida de respuesta tardía, fuga de foco y superposición | 9 escenarios US3 pasan con creación/renombrado, búsqueda, proyecto vacío, tarea reciente, recuperación en dos acciones, respuesta tardía aislada, teclado, escritorio, tablet y 320 px con zoom 200 % | ✅ COMPLETE |
| T050–T052 | UI / workspace shell | Conversational + guided Playwright | La navegación no exponía proyectos operativos y el workspace mantenía una tercera región permanente | Sidebar plegable con controles útiles y nombres accesibles, encabezado compacto y una sola superficie conversacional con resumen/editor contextuales | ✅ COMPLETE |
| T053–T054 | Page composition | Conversational Playwright root/project scenarios | La raíz abría la primera tarea global y el estado sin tareas desmontaba el shell; la página de tarea no persistía selección ni metadatos recientes de proyecto | `/` restaura proyecto/tarea reciente o mantiene el shell vacío; la raíz de tarea persiste proyecto, tarea, borrador, resumen y ancla sin mezclar contextos | ✅ COMPLETE |
| T055 | US3 checkpoint | `npx vitest run app/features/tasks/composables/useTaskIndex.test.ts app/features/tasks/composables/useWorkspaceState.test.ts app/features/tasks/services/project-store.test.ts` + conversational/guided Playwright + `TEST_BASE_URL=http://127.0.0.1:3005 npm run verify` | N/A después de los reds observados por tarea | 33/33 Vitest enfocados, 12/12 Playwright conversacional (9 US3 + 3 regresión US2), 7/7 guided; verify agregado pasa typecheck, 206 unitarias, 20 contratos, 7 migraciones, 37 integraciones, estructura, Graphify y build | ✅ COMPLETE |

### Phase 5 independent-review corrections

| Scope | Red evidence | Green result | Status |
|---|---|---|---|
| Empty/bootstrap context | Revisión visual reprodujo 404 e hidratación divergente sin claves; E2E mostró la conversación anterior bajo un proyecto vacío | Las claves ausentes reparan a shell inicial y el proyecto vacío muestra identidad/acción propias sin montar chat ni formulario ajenos | ✅ COMPLETE |
| Late response isolation | E2E ganó la carrera de navegación y perdió mensaje y respuesta de origen | El turno se persiste antes del `await`, las escrituras se serializan y la respuesta se guarda en el snapshot de origen sin mutar la tarea visible | ✅ COMPLETE |
| Compact keyboard and layout | Revisión visual mostró foco fuera del drawer y alerta sobre el compositor a 820 px | Foco inicial/trampa/restauración, fondo móvil inerte y fila reservada para estado; verificación visual confirmó separación y ciclo bidireccional | ✅ COMPLETE |
| Selection failures | Revisión detectó selección optimista, escritura redundante tras crear y posible proyecto archivado activo | Navegación espera persistencia, comunica fallo sin cambiar contexto, elimina el segundo `PUT` y rechaza proyectos archivados | ✅ COMPLETE |

La suite E2E amplia `nuxt-task-workflows.spec.ts` queda en 10/13: sus tres
fixtures legacy incompletos no satisfacen las compuertas outcome-v2 de fases 1 y
4 y la interfaz lo comunica como «requiere ajustes». Esos fallos no atraviesan
los escenarios US3 ni contradicen el checkpoint de esta fase.

## Phase 6: User Story 4 - Usar ventanas contextuales sin interrumpir el trabajo

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T056 | Unit / red scaffold | `npx vitest run app/features/tasks/components/TaskIntakeForm.test.ts` | Faltaban helpers aislados para validar emision, alternativa nombre-o-problema y limites | Helpers y cobertura unitaria quedaron escritos en `TaskIntakeForm.test.ts`; ejecucion diferida hasta el checkpoint de la fase | ✅ COMPLETE |
| T057 | Playwright / red scaffold | `npx playwright test tests/e2e/workspace-overlays.spec.ts` | No existia el archivo de overlays ni escenarios de biblioteca modeless/full-width y deep links | Se agregaron escenarios rojos de biblioteca y compatibilidad de Back/Forward en `workspace-overlays.spec.ts` | ✅ COMPLETE |
| T058 | Playwright / red scaffold | `npx playwright test tests/e2e/workspace-overlays.spec.ts` | No existian escenarios de ajustes, focus lifecycle ni notices no modales | Se agregaron escenarios rojos para ajustes y avisos no modales en `workspace-overlays.spec.ts` | ✅ COMPLETE |
| T059-T065 | UI / orchestration | Manual implementation + focused overlay validation | El workspace no coordinaba overlays, deep links, notices ni intake emit-only | Modal de nueva tarea, slideover de biblioteca, cola de notices, deep links de shell y estado de overlay quedaron integrados en la composicion 006 | ✅ COMPLETE |
| T066 | Playwright checkpoint | `npx playwright test tests/e2e/workspace-overlays.spec.ts` | Primer intento fallo sin servidor en `http://127.0.0.1:3005`; luego hubo colisiones de selectores y expectativa de aviso sobre una accion que no guardaba | En Tuesday, July 28, 2026 la suite `workspace-overlays.spec.ts` paso 3/3 en 4.1 s contra Nuxt local en `127.0.0.1:3005`, cubriendo dirty close, biblioteca desktop/mobile, deep links, cierre de ajustes y notice no modal tras persistencia real | ✅ COMPLETE |

## Phase 7: User Story 5 - Reutilizar conocimiento y oportunidades de automatización

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T067 | Unit / schema | `npx vitest run app/features/library/domain/library-record.schema.test.ts` | `library-record.schema.ts` no modelaba `resourceKind`, origen de proyecto/tarea/metodo ni estados de evidencia; aceptaba estados fuera de 006 | El schema repara `method`, `tool`, `learning` y `automation-candidate`, completa origen faltante y rechaza `validated-automation` | ✅ COMPLETE |
| T068 | Unit / store | `npx vitest run app/features/library/services/library-store.test.ts` | El store solo listaba/leyó markdown simple; no filtraba por proyecto/tipo ni podia vincular referencias idempotentes | `createLibraryStore` ahora filtra por query/proyecto/tipo, preserva metadata de origen y agrega `libraryReferences` sin sobrescribir campos confirmados | ✅ COMPLETE |
| T069 | Playwright / red scaffold | `npx playwright test tests/e2e/workspace-library.spec.ts` | El nuevo flujo US5 no existia y el primer rojo observado quedo bloqueado por falta de servidor en `127.0.0.1:3005` | Se agrego `workspace-library.spec.ts` con escenario de filtro, detalle, evidencia y linking sin overwrite; luego se uso como verificacion verde con servidor local | ✅ COMPLETE |
| T070-T071 | Domain + service | Focused Vitest + `npm run typecheck` | Library y el indice seguian en el contrato minimo legacy | `library-record.schema.ts`, `library-store.ts`, `task.schema.ts` y `useTaskIndex.ts` conservan los nuevos campos de reusable knowledge y evidence-bounded automation | ✅ COMPLETE |
| T072-T073 | UI / page orchestration | `npm run typecheck` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-library.spec.ts` | El slideover no filtraba, no mostraba origen/evidencia ni podia vincular al task activo | `LibraryList`, `LibraryRecordView`, `LibrarySlideover`, `TaskWorkspace` y `pages/tasks/[id].vue` exponen filtros por tipo/proyecto, detalle con evidencia y notice no modal de referencia vinculada | ✅ COMPLETE |
| T074-T075 | Completion + review UI | `npx vitest run app/features/tasks/services/task-completion.test.ts` + `npm run typecheck` | `completeTask` solo generaba un markdown por tarea y `ReviewPhase` no mostraba hipotesis vs candidato con evidencia | Completion genera registros reutilizables de metodo, herramienta, aprendizaje y candidato; ReviewPhase muestra clasificacion y evidencia sin afirmar automatizacion validada | ✅ COMPLETE |
| T076 | Focused checkpoint | `npx vitest run app/features/library/domain/library-record.schema.test.ts app/features/library/services/library-store.test.ts app/features/tasks/services/task-completion.test.ts` + `npm run typecheck` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-library.spec.ts` | N/A despues de los reds observados por tarea | 15/15 Vitest enfocados, `nuxt typecheck` verde y `workspace-library.spec.ts` 1/1 verde contra Nuxt local en `127.0.0.1:3005` | ✅ COMPLETE |

## Phase 8: Polish and cross-cutting verification

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T077 | Fixtures / migration | `npx vitest run tests/migration/compatibility-store.test.ts` | `repeatable-v1.sqlite` quedaba en `proposed-path` porque sus iteraciones carecian de condiciones aplicables y evidencia 006 minima | El fixture round-trip de `schemaVersion: 2` ahora preserva `projectId: legacy`, `repairTask(repairTask(x)) === repairTask(x)`, `repeatable-v1` deriva `repeatable-method` y `material-v2` deriva `documented-once` tras el reset material | ✅ COMPLETE |
| T078 | Security regression | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts --grep "Phase 8 security regressions"` | Sin servidor local el primer rojo fue `ECONNREFUSED`; con Nuxt activo se validaba si el contenido hostil seguia siendo inerte | El escenario nuevo pasa en Tuesday, July 28, 2026: mensajes y prompts con HTML hostil se renderizan como texto, no crean nodos ejecutables y no exponen `window.__workspaceOwned` | ✅ COMPLETE |
| T079 | Accessibility regression | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --grep "preserves landmarks, keyboard order, modeless library and live regions across overlay states"` | El rojo funcional real fue un landmark `main` duplicado entre `pages/tasks/[id].vue` y `TaskWorkspace.vue` | Se sustituyo el `main` anidado por una `section` etiquetada y el escenario pasa con landmarks unicos, biblioteca modeless en desktop, foco de ajustes y reduced motion en Chromium | ✅ COMPLETE |
| T080 | Legacy E2E compatibility | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/nuxt-task-workflows.spec.ts tests/e2e/legacy-phase-workflows.spec.ts tests/e2e/legacy-task-workflows.spec.ts` | `nuxt-task-workflows.spec.ts` partia con 11 fallos por siembra legacy incompleta y expectativas superseded por 006: labels de navegación, `/tasks/new` como overlay, `/library` como deep link de workspace, prompts legacy inertes y cierre asincrono de fase 4 | En Tuesday, July 28, 2026 las tres suites pasaron juntas 20/20 contra Nuxt local en `127.0.0.1:3005`: `legacy-phase-workflows` 3/3, `legacy-task-workflows` 4/4 y `nuxt-task-workflows` 13/13 tras alinear seeds, deep links y la navegación del modal de nueva tarea | ✅ COMPLETE |
| T081 | Docs / architecture alignment | Manual doc refresh + focused source verification | La documentación seguía describiendo el shell previo: faltaban `bitacora:projects`, el batch allowlist real, los deep links preservados y el criterio agregado para diferir proveedores | `app/features/README.md`, `docs/architecture/README.md` y `docs/architecture/migration-checkpoints.md` ahora documentan el contrato exacto (`bitacora:index`, `bitacora:projects`, `bitacora:assistant-settings`, `bitacora:t:*`, `bitacora:r:*`), `pages/tasks/[id].vue` como page-root del shell y el criterio `verify`/`verify:e2e` para remover el mock | ✅ COMPLETE |
| T082 | Structure freshness | `npm run structure` + `npm run structure:check` | `structure:check` fallaba porque el snapshot no reflejaba el import `tasks -> library` introducido por el shell de overlays | `docs/architecture/structure.json` y `structure.md` se regeneraron y `npm run structure:check` vuelve a pasar | ✅ COMPLETE |
| T083 | Graphify freshness | `npm run graph:update` + `npm run graph:check` | `graph:check` reportaba `Graphify: graph is stale; run npm run graph:update` | El grafo allowlisted se refresco y `npm run graph:check` vuelve a reportar `graph is current` | ✅ COMPLETE |
| T084 | Focused quickstart checkpoint | Focused Vitest + Playwright commands from `quickstart.md` | Varias corridas enfocadas seguian usando seeds o selectores previos a 006 y no quedaban registradas en la quickstart | La quickstart ahora registra resultados reales del Tuesday, July 28, 2026 para migración 8/8, seguridad 1/1, accesibilidad 1/1, `nuxt-task-workflows` 13/13 y el checkpoint combinado 20/20 | ✅ COMPLETE |
| T085 | Aggregate automated verification | `npm run verify` + `npm run verify:e2e` | `verify` reprodujo import roto en `NewTaskModal.vue`, contratos apuntando a `localhost:3000`, snapshot stale y persistencia faltante en `GuidancePhase.vue`; `verify:e2e` reprodujo selectores stale, estado local persistido y avisos superpuestos | En Tuesday, July 28, 2026 `npm run verify` paso completo con 221 unit, 20 contract, 8 migration, 37 integration, `structure:check`, `graph:update`, `graph:check` y `nuxt build`; `npm run verify:e2e` paso 45/45 contra `http://127.0.0.1:3005` | ✅ COMPLETE |

## Remaining external study

| Task | Scope | Status | Notes |
|---|---|---|---|
| T086 | Human usability study for SC-002, SC-003 and SC-010 | ⏳ PENDING EXTERNAL | Automated evidence cannot replace 10 real participants. `specs/006-conversational-task-workspace/usability-results.md` now records the required protocol and the absence of participant data as of Tuesday, July 28, 2026. |
