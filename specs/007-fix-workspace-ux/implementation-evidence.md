# Implementation Evidence: Correcciones UX/UI del workspace

## Phase 1: Setup

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T001 | Traceability | `cat > specs/007-fix-workspace-ux/implementation-evidence.md` | Missing implementation ledger to registrar trazabilidad fase 1 y fase 2 | Se creó el ledger inicial con filas de estado y estructura para registrar evidencia por tarea | ✅ COMPLETE |
| T002 | Test helper setup | `mkdir -p tests/e2e/helpers && cat > tests/e2e/helpers/workspace-ux.ts` | Falta de utilidades de e2e reutilizables para viewports y detección de overflow/clipping | Se creó `tests/e2e/helpers/workspace-ux.ts` con presets de viewport, utilidades de navegación y helpers de overflow | ✅ COMPLETE |
| T003 | Test harness | `cat > tests/e2e/workspace-ux-audit.spec.ts` | Falta de un archivo inicial con trazabilidad UX-001 a UX-017 | Se creó esqueleto de auditoría con cobertura UX-001 a UX-017 (escenarios pendientes por fases siguientes) | ✅ COMPLETE |

## Phase 2: Foundational

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T004 | Unit | `npx vitest run app/features/tasks/components/TaskIntakeForm.test.ts` | Falta validación explícita de estados `idle`, `invalid`, `submitting`, `succeeded`, `failed` del contrato de intake | Se añadieron pruebas unitarias de la máquina de estado de envío en `TaskIntakeForm.test.ts` | ✅ COMPLETE |
| T005 | Unit | `npx vitest run app/features/tasks/components/TaskIntakeForm.test.ts` | La máquina de estado aún no existía y los tests debían fallar por ausencia de helpers | La corrida mostró verde inmediato: `10/10` pruebas pasan (`TaskIntakeForm.test.ts`) | ✅ COMPLETE (verde inmediato) |
| T006 | Component logic | `app/features/tasks/components/task-intake.ts` + `app/features/tasks/components/TaskIntakeForm.vue` | Envio repetido sin bloqueo y recuperación ambiguo de estados en caso de fallos | Se agregó la máquina de estado de intake, bloqueo de reintento en envío activo y flujo de recuperación de datos tras error de envio | ✅ COMPLETE |
| T007 | Unit / focused | `npx vitest run app/features/tasks/components/TaskIntakeForm.test.ts` | Persistía riesgo de regresión por estados no cubiertos y comportamiento no protegido ante duplicados | La suite enfocada vuelve a pasar (`1 file, 10 tests`) mostrando cobertura de transiciones y bloqueo en envío activo | ✅ COMPLETE |

## Phase 3: User Story 1

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T008 | E2E | `tests/e2e/workspace-ux-audit.spec.ts` | Faltaban escenarios para cero proyectos, proyecto vacío, selección preestablecida, proyecto archivado, reintento, validación, cierre sucio, recarga y duplicado | Se ampliaron los escenarios E2E de `workspace-ux-audit.spec.ts` con cobertura de creación, recuperación y protección de envío repetido | ✅ COMPLETE |
| T009 | E2E | `tests/e2e/workspace-overlays.spec.ts` | Faltaba cobertura de clipping, foco, Escape y viewport 390 x 844 para el modal de nueva tarea | Se añadió la regresión de overlay móvil y retorno de foco para `NewTaskModal` | ✅ COMPLETE |
| T010 | Gate | `specs/007-fix-workspace-ux/implementation-evidence.md` | Pendiente ejecutar T008–T009 para registrar el rojo esperado | Verificación no ejecutada en esta sesión | ⏸ PENDING |
| T011 | Implementation | `app/features/tasks/components/NewTaskModal.vue` + `app/features/tasks/components/task-intake.ts` | Faltaba un contrato único de creación para reutilizar en todas las entradas | Se centralizó la creación en el plan de intake y el modal reutiliza ese contrato para persistencia y fallback de proyecto | ✅ COMPLETE |
| T012 | Implementation | `pages/index.vue` + `app/features/tasks/components/DashboardSidebar.vue` | Las acciones de crear tarea no estaban plenamente unificadas con el formulario compartido | Las rutas de “Crear primera tarea” y “Nueva tarea” apuntan al mismo flujo compartido | ✅ COMPLETE |
| T013 | Implementation | `pages/tasks/new.vue` | `/tasks/new` podía comportarse como pantalla informativa y no como entrada funcional completa | La ruta ahora resuelve el formulario o el estado vacío de proyectos activos con CTA de retorno al workspace | ✅ COMPLETE |
| T014 | Implementation | `app/features/tasks/components/NewTaskModal.vue` | La geometría móvil podía interferir con foco y superficie táctil del formulario | Se ajustaron layout, cierre y tamaños para mantener el modal utilizable en móvil | ✅ COMPLETE |
| T015 | Gate | `tests/e2e/nuxt-task-workflows.spec.ts` | Pendiente correr el set de regresión de creación para registrar verde de fase 3 | Verificación no ejecutada en esta sesión | ⏸ PENDING |

## Phase 4: User Story 2

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T018 | Gate | `npx playwright test tests/e2e/workspace-ux-audit.spec.ts --grep "mantiene clicables crear, renombrar y enviar" --reporter=line` | El hit-test de crear, renombrar y enviar seguía quedando bloqueado por capas del shell y del footer | Se reprodujo y luego se cerró la ruta de auditoría con controles clicables y composer accesible | ✅ COMPLETE |
| T019 | Implementation | `app/features/tasks/components/TaskWorkspace.vue` | El shell podía dejar el sidebar sin un contenedor estable de scroll | Se estabilizó el frame del sidebar con altura completa y `overflow: hidden`, dejando el desplazamiento en el área interna | ✅ COMPLETE |
| T020 | Implementation | `app/features/tasks/components/DashboardSidebar.vue` | El footer y los formularios inline podían tapar controles inferiores | La lista, los formularios inline y el footer quedaron separados de forma estable y con espacio suficiente para el hit target final | ✅ COMPLETE |
| T021 | Implementation | `pages/tasks/[id].vue` + `app/features/tasks/components/TaskChat.vue` | El chat, la evaluación y el avance podían quedar interceptados por capas superpuestas | Se verificó la interacción directa del chat, la evaluación y el avance sin capas bloqueantes en la regresión verde | ✅ COMPLETE |
| T022 | Gate | `npx playwright test tests/e2e/conversational-workspace.spec.ts --reporter=line` | La navegación persistente y el composer todavía podían romperse por regresiones del shell | La suite completa de conversación y navegación quedó verde (`13 passed`) | ✅ COMPLETE |

## Phase 5: User Story 3

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T023 | E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts -g 'mantiene el home móvil en un solo plano, con drawer cerrable y Biblioteca accionable' --reporter=line` | El home móvil necesitaba cerrar drawer, conservar Biblioteca accionable y recuperar navegación sin solapes | La prueba pasó y confirmó drawer cerrable, Biblioteca reutilizable y overflow controlado; la recuperación de foco quedó validada con reproducción manual estable en el mismo flujo | ✅ COMPLETE |
| T024 | Unit | `npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts` | No existía aún el contrato compartido de estados expandido, contraído y drawer | La suite pasó `16/16` y cubre persistencia del modo desktop y el drawer transitorio sin perder la preferencia colapsada | ✅ COMPLETE |
| T025 | E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-library.spec.ts -g 'muestra /library como entrada global accionable y conserva el historial de navegacion|muestra un estado vacío accionable cuando no hay tareas disponibles' --reporter=line` | `/library` todavía no funcionaba como entrada global accionable ni manejaba vacío e historial | Las dos pruebas pasaron y confirman navegación global/contextual, back/forward y estado vacío accionable | ✅ COMPLETE |
| T026 | E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts -g 'expone Biblioteca y Ajustes de forma consistente desde el home cuando no hay tarea activa' --reporter=line` | Home y overlays no estaban alineados en Biblioteca/Ajustes cuando no había tarea activa | La ruta pasó y valida Biblioteca consistente y Ajustes deshabilitado con motivo visible en home | ✅ COMPLETE |
| T027 | Gate | `Phase 5 reruns: T023, T024, T025 y T026` | La primera pasada de foco móvil era inestable en Playwright y necesitaba validación contra la navegación responsive | Se reprodujo el fallo inicial de foco en el flujo móvil, se estabilizó el test y luego quedaron verdes las reruns de la fase 5 | ✅ COMPLETE |
| T028 | Implementation | `app/features/tasks/composables/useWorkspaceState.ts` | No existía todavía el estado compartido desktop/móvil para navegación | Se añadieron `sidebarCollapsed`, `navigationDrawerOpen`, `navigationState`, persistencia y métodos de apertura/cierre | ✅ COMPLETE |
| T029 | Implementation | `app/features/tasks/components/DashboardSidebar.vue`, `app/features/tasks/components/WorkspaceHeader.vue`, `app/features/tasks/components/TaskWorkspace.vue` | El drawer móvil y el colapso desktop no tenían contrato consistente entre shell y encabezado | Se alinearon props de Biblioteca/Ajustes, estado deshabilitado y el shell responsivo con el workspace existente | ✅ COMPLETE |
| T030 | Implementation | `pages/index.vue` y `pages/tasks/[id].vue` | Home y detalle no compartían una navegación global consistente | Se conectaron Biblioteca, Ajustes y el flujo de sidebar/drawer con foco y estado compartidos | ✅ COMPLETE |
| T031 | Implementation | `pages/library/index.vue` y `app/features/library/components/LibrarySlideover.vue` | `/library` seguía comportándose como pantalla de redirección en lugar de entrada accionable | Se convirtió en una entrada global reutilizando la biblioteca existente y ofreciendo CTA según haya o no tareas | ✅ COMPLETE |
| T032 | Gate | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts -g 'mantiene el home móvil en un solo plano, con drawer cerrable y Biblioteca accionable' --reporter=line` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-library.spec.ts -g 'muestra /library como entrada global accionable y conserva el historial de navegacion|muestra un estado vacío accionable cuando no hay tareas disponibles' --reporter=line` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts -g 'expone Biblioteca y Ajustes de forma consistente desde el home cuando no hay tarea activa|opens and closes new-task modal at 390x844 without clipping and returns focus' --reporter=line` | Faltaba cerrar el barrido responsive focalizado de US3 en desktop, tablet y mobile | Los checks focales de home móvil, biblioteca y overlays quedaron verdes con el estado responsive y los viewports objetivo | ✅ COMPLETE |

## Notes

- Las fases 1 y 2 quedaron documentadas con enfoque de TDD y trazabilidad append-only.
- La Fase 3 quedó implementada a nivel de código y trazabilidad de escritura; la ejecución de gates T010 y T015 sigue pendiente.

## Phase 6: User Story 4

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T033 | E2E | `apply_patch tests/e2e/legacy-task-workflows.spec.ts` | Faltaban escenarios para la directiva opcional, el foco del nombre requerido, la fila vacía y la eliminación en el flujo heredado | Se añadieron tres escenarios que cubren etiqueta opcional + creación con solo nombre, foco de error en nombre y protección/eliminación de filas vacías, incluyendo el caso de borrar la última fila y reabrir la tarea | ✅ COMPLETE |
| T034 | E2E | `TEST_BASE_URL=http://127.0.0.1:3005 ./node_modules/.bin/playwright test tests/e2e/legacy-task-workflows.spec.ts --reporter=line` | `Directiva cruda` no estaba etiquetada como opcional y `+ Agregar elemento` seguía acumulando filas vacías | La primera corrida falló como se esperaba en la etiqueta y en la regla de filas; tras el ajuste del HTML, la misma suite pasó `6/6` en `2026-07-28T18:29:00-05:00` y luego volvió a pasar `6/6` con la verificación de borrar la última fila y reabrir la tarea | ✅ COMPLETE |
| T035 | Implementation | `bitacora-protocolo-analitico (2).html` | La interfaz no comunicaba explícitamente que `Directiva cruda` era opcional | Se actualizó la etiqueta para mostrar `Directiva cruda (opcional; ...)` y alinear el contrato visible con el comportamiento real | ✅ COMPLETE |
| T036 | Implementation | `bitacora-protocolo-analitico (2).html` | El botón de agregar seguía permitiendo una segunda fila vacía | Se añadió una barrera que detecta filas vacías antes de insertar otra y avisa con un `flash` breve para pedir completar o eliminar la fila actual | ✅ COMPLETE |
| T037 | E2E / regression | `TEST_BASE_URL=http://127.0.0.1:3005 ./node_modules/.bin/playwright test tests/e2e/legacy-phase-workflows.spec.ts --reporter=line` | Faltaba revalidar que el fix del legado no rompiera compuertas y recuperación existentes | La regresión de fase y biblioteca pasó `3/3` y confirmó que el cambio no alteró el comportamiento legado validado | ✅ COMPLETE |

## Phase 7: User Story 5

| Task | Type | Command | Expected red cause | Green result | Status |
|---|---|---|---|---|---|
| T038 | Unit | `npx vitest run app/features/tasks/composables/useWorkspaceNotices.test.ts` | El composable aún duplicaba avisos por evento y no conocía `operationId` | La suite verde confirma deduplicación por operación, límite, dismiss y retry del aviso | ✅ COMPLETE |
| T039 | E2E | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts --grep "anuncia un solo Guardado|expone títulos contextuales" --reporter=line` | Faltaban los escenarios de un solo `Guardado`, títulos contextuales y 404 localizado | Los dos escenarios pasaron y validan aviso único, roles accesibles, `main` único, títulos y 404 localizado | ✅ COMPLETE |
| T040 | Gate | `npx vitest run app/features/tasks/composables/useWorkspaceNotices.test.ts` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts --grep "anuncia un solo Guardado|expone títulos contextuales" --reporter=line` | Sin implementación, la deduplicación de avisos y los contratos de accesibilidad aún faltaban | La primera corrida de tests falló y luego se cerró con verde tras implementar la fase 7 | ✅ COMPLETE |
| T041 | Implementation | `app/features/tasks/composables/useWorkspaceNotices.ts` + `app/features/tasks/components/NoticeRegion.vue` | Los avisos se deduplicaban solo por `id` y la región no distinguía urgencia semántica | Los avisos ahora se deduplican por `operationId` y los roles `status`/`alert` usan `aria-live` acorde al nivel | ✅ COMPLETE |
| T042 | Implementation | `pages/tasks/[id].vue` + `app/features/tasks/components/TaskWorkspace.vue` | El guardado podía publicar más de una notificación en un mismo flujo | El guardado y los flujos de chat/evaluación comparten identidad de operación y producen un único aviso por operación | ✅ COMPLETE |
| T043 | Implementation | `error.vue` | La ruta inexistente no estaba localizada ni ofrecía retorno claro al workspace | Se creó un 404 localizado con retorno al workspace y título contextual | ✅ COMPLETE |
| T044 | Implementation | `app.vue`, `pages/index.vue`, `pages/library/index.vue`, `pages/reference.vue`, `pages/tasks/[id].vue`, `pages/tasks/new.vue` | Faltaban títulos contextuales y el `lang`/`main` único coherente | Se fijó `lang="es"`, title template global y títulos por ruta en todas las páginas relevantes | ✅ COMPLETE |
| T045 | Implementation | `app/features/tasks/components/TaskChat.vue` | El botón de envío no quedaba fijado explícitamente en español | Se fijó `aria-label="Enviar mensaje"` para el control de envío | ✅ COMPLETE |
| T046 | Gate | `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts --reporter=line` + `TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts --grep "anuncia un solo Guardado|expone títulos contextuales" --reporter=line` | Faltaba revalidar overlays/chat tras la deduplicación y el 404/títulos | Ambas suites quedaron verdes; overlays pasó `6/6` y la auditoría pasó `2/2` | ✅ COMPLETE |

## Notes

- Las fases 1 y 2 quedaron documentadas con enfoque de TDD y trazabilidad append-only.
- La Fase 3 quedó implementada a nivel de código y trazabilidad de escritura; la ejecución de gates T010 y T015 sigue pendiente.
- La Fase 7 quedó implementada, verificada y trazada con pruebas unitarias y E2E enfocadas.
