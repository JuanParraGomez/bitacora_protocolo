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

## Notes

- Las fases 1 y 2 quedaron documentadas con enfoque de TDD y trazabilidad append-only.
- La Fase 3 quedó implementada a nivel de código y trazabilidad de escritura; la ejecución de gates T010 y T015 sigue pendiente.
