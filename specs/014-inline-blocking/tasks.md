# Tasks: Estado de bloqueo con errores inline y recuperación

**Input**: Design documents from `/specs/014-inline-blocking/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md),
[contracts/visual-acceptance.md](contracts/visual-acceptance.md),
[quickstart.md](quickstart.md)

**Tests**: obligatorios y test-first. Cada cambio de comportamiento se divide en
prueba, rojo esperado, implementación mínima y verde/regresión. Un fallo de
setup, import, servidor o fixture no cuenta como rojo válido.

**Evidence rule**: crear y mantener
`specs/014-inline-blocking/implementation-evidence.md` con comando exacto,
fecha, alcance, conteo, exit code y veredicto. No marcar una tarea por editar
código ni un gate humano por inferencia.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo solo si no comparte archivos ni depende
  de una tarea incompleta.
- **[Story]**: historia cubierta (`US1`–`US4`).
- Cada tarea indica ruta exacta y condición observable de cierre.

---

## Phase 1: Setup y gates de seguridad

**Purpose**: autorizar y aislar la implementación antes del primer rojo.

- [X] T001 Registrar `HUMAN_DECISION_REQUIRED` en `specs/014-inline-blocking/implementation-evidence.md` y no editar producto hasta recibir una orden explícita de implementación posterior a este plan/tasks.
- [X] T002 Verificar rama `codex/014-inline-blocking`, upstream homónimo, `git status`, ascendencia 010–013 y clasificar cambios mixtos en `specs/014-inline-blocking/implementation-evidence.md`; detenerse si la rama es `main` o el alcance se solapa con cambios ajenos.
- [X] T003 [P] Inventariar rutas y SHA-256 de las 24 baselines existentes de `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/` en `specs/014-inline-blocking/implementation-evidence.md` antes de tocar UI.
- [X] T004 [P] Confirmar el manifiesto IMG-UX-05 y las fronteras 012/013 leyendo `docs/ux-ui/mockups/rediseño-agente/manifest.md`, `specs/012-stage-canvas-form/plan.md` y `specs/013-agent-rail-chat/plan.md`; registrar referencias exactas en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T005 Ejecutar una consulta Graphify enfocada en evaluación→campos→agente, verificar relaciones inferidas en fuente y registrar el resultado en `specs/014-inline-blocking/implementation-evidence.md` sin versionar `graphify-out/`.

**Checkpoint**: autoridad, rama, worktree, baselines y arquitectura verificadas.

---

## Phase 2: Foundation — proyección autoritativa de recuperación

**Purpose**: crear una única fuente frontend para correcciones, conteo y estado.

**⚠️ CRITICAL**: bloquea todas las historias. No avanzar a UI sin rojo válido y
verde enfocado de esta fase.

- [X] T006 [US1] Escribir primero en `app/features/tasks/components/workspace-presentation.test.ts` casos de happy path para `Define una hipótesis verificable para poder evaluar el análisis`→`f1.analisisProblema.analisis` y `Define criterio(s) de éxito para cerrar la fase.`→`f1.criterioExito`, y límites de vacío, duplicado, dos mensajes en un campo, desconocido, 1/N/10 y exclusión de weaknesses/recommendations.
- [X] T007 [US4] Añadir primero en `app/features/tasks/components/workspace-presentation.test.ts` casos de needs-work vigente, needs-work stale por edición que conserva pendientes, stale no needs-work sin correcciones, fallo inicial, fallo de reevaluación con correcciones previas, acceptable, respuesta de otra tarea/fase/revisión y tarea completada.
- [X] T008 Ejecutar solo `app/features/tasks/components/workspace-presentation.test.ts`, confirmar rojo por ausencia de la proyección 014 y registrar comando/salida/exit code en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T009 Implementar el cambio mínimo en `app/features/tasks/components/workspace-presentation.ts`: catálogo exacto, deduplicación, elegibilidad y `EvaluationRecoveryView`, sin modificar `app/features/tasks/domain/task-rules.ts`, schemas ni payloads.
- [X] T010 Ejecutar verde enfocado de `app/features/tasks/components/workspace-presentation.test.ts` y regresión de `app/features/tasks/domain/task-rules.test.ts`; sincronizar evidencia reproducible en `specs/014-inline-blocking/implementation-evidence.md`.

**Checkpoint**: una sola proyección autoritativa satisface vigencia y transición.

---

## Phase 3: User Story 1 — Entender qué corregir y dónde (Priority: P1) 🎯 MVP

**Goal**: banner con conteo/lista y todos los mensajes mapeados dentro del bloque
causante, en especial Análisis y Criterio de éxito (IMG-UX-05).

**Independent Test**: montar la evaluación contractual de dos correcciones y
comprobar banner exacto, dos mensajes inline descendientes de sus bloques,
asociación ARIA y ausencia de tarjeta genérica.

### Tests — escribir y demostrar rojo primero

- [X] T011 [P] [US1] Escribir pruebas de banner 0/1/N/10, lista completa, deduplicación, desconocidos y evento `Ver recomendaciones del agente` en `app/features/tasks/components/StageFieldIssues.test.ts`.
- [X] T012 [P] [US1] Escribir pruebas de uno/varios mensajes inline, IDs, `aria-invalid`, combinación de `aria-describedby` y conservación de captura/model value en `app/features/tasks/components/StageTextField.test.ts`.
- [X] T013 [US1] Escribir pruebas de distribución exacta, descendencia mensaje→bloque para Análisis/Criterio y eliminación de la lista genérica en `app/features/tasks/components/GuidedPhaseForm.test.ts`.
- [X] T014 [P] [US1] Cubrir en `app/features/tasks/components/GuidedPhaseForm.test.ts` y `app/features/tasks/components/GuidancePhase.test.ts` campos textuales/no textuales asociados por motivos ya existentes en `GATE_REASON_FIELD_MAP`, sin añadir mapeos.
- [X] T015 [US1] Ejecutar las pruebas T011–T014 y registrar rojo válido por banner/inline 014 ausentes en `specs/014-inline-blocking/implementation-evidence.md`.

### Implementation — cambio mínimo después del rojo

- [X] T016 [US1] Convertir `app/features/tasks/components/StageFieldIssues.vue` en banner superior con singular/plural, lista única completa y control `Ver recomendaciones del agente`; retirar el placeholder `Bloqueos de la etapa`.
- [X] T017 [US1] Extender `app/features/tasks/components/StageTextField.vue` para renderizar correcciones dentro de `[data-stage-text-field]`, conservar descripciones previas y exponer `aria-invalid`/`aria-describedby` correctos.
- [X] T018 [US1] Actualizar `app/features/tasks/components/GuidedPhaseForm.vue` para consumir `EvaluationRecoveryView`, agrupar mensajes por clave exacta, mapear `f1.analisisProblema.analisis` a `problem-analysis` y pasar grupos/IDs sin recomputar otra fuente.
- [X] T019 [US1] Integrar el contrato inline solo para las claves ya asociadas en `GATE_REASON_FIELD_MAP` dentro de `app/features/tasks/components/OrientationPhase.vue`, `GuidancePhase.vue`, `ExecutionPhase.vue` y `ReviewPhase.vue`, incluidos contenedores de checkbox/select/lista, sin añadir campos/motivos ni cambiar valores, reglas de captura o composición 012.
- [X] T020 [US1] Ajustar `app/features/tasks/components/EvaluationFeedback.vue` para conservar el chip `Evaluación requiere ajustes` y sus estados históricos/recuperación, eliminando cualquier lista genérica que duplique banner/inline.
- [X] T021 [US1] Ejecutar verde enfocado de `workspace-presentation`, `StageFieldIssues`, `StageTextField`, `GuidedPhaseForm`, las cuatro fases y `EvaluationFeedback`; corregir solo implementación y sincronizar `specs/014-inline-blocking/implementation-evidence.md`.

**Checkpoint**: US1 es demostrable aisladamente con dos campos contractuales.

---

## Phase 4: User Story 2 — Recuperarse por una sola ruta (Priority: P1)

**Goal**: estado, primaria, enlace y badge conducen inequívocamente al agente y
a `Reevaluar etapa` (IMG-UX-05).

**Independent Test**: con correcciones pendientes, comprobar chip, exactamente
una primaria, badge en rail/header y una activación que abre/enfoca conversación
en desktop/tablet y cambia al pane existente en móvil.

### Tests — escribir y demostrar rojo primero

- [X] T022 [P] [US2] Escribir pruebas de badge de correcciones separado de propuestas para 0/1/N/10 en rail y header, más método de foco expuesto, en `app/features/tasks/components/AgentPanel.test.ts`.
- [X] T023 [P] [US2] Añadir pruebas de chip blocked/transport/stale sin lista duplicada en `app/features/tasks/components/EvaluationFeedback.test.ts`.
- [X] T024 [US2] Añadir pruebas de evento del banner, unicidad/etiqueta de primaria y propagación al workspace en `app/features/tasks/components/GuidedPhaseForm.test.ts`.
- [X] T025 [US2] Escribir pruebas desktop-expanded, desktop-collapsed y mobile-pane del flujo abrir→`nextTick`→foco, conservación de draft/ancla y conteo común en `app/features/tasks/components/TaskWorkspace.test.ts`.
- [X] T026 [US2] Ejecutar T022–T025 y registrar rojo válido de badge/foco 014 ausentes en `specs/014-inline-blocking/implementation-evidence.md`.

### Implementation — cambio mínimo después del rojo

- [X] T027 [US2] Extender `app/features/tasks/components/AgentPanel.vue` con `pendingCorrections`, badge accesible en rail/header y un método de foco a la conversación, sin sumar/redefinir `pendingProposals` ni alterar estructura 013.
- [X] T028 [US2] Propagar `requestAgentRecommendations` desde `app/features/tasks/components/StageFieldIssues.vue` por `GuidedPhaseForm.vue` hasta `TaskWorkspace.vue`.
- [X] T029 [US2] Integrar en `app/features/tasks/components/TaskWorkspace.vue` el conteo derivado, expansión desktop/tablet, selección del pane móvil existente y foco posterior al render; preservar borrador, último mensaje y estado por tarea.
- [X] T030 [US2] Verificar en `app/features/tasks/components/workspace-presentation.ts` y `GuidedPhaseForm.vue` que `resolveContextualPrimaryAction` sigue siendo la única fuente y produce exactamente `Reevaluar etapa`; no crear una segunda CTA.
- [X] T031 [US2] Ejecutar verde enfocado de `AgentPanel`, `EvaluationFeedback`, `GuidedPhaseForm` y `TaskWorkspace`, más regresión de `useWorkspaceState.test.ts`; sincronizar evidencia.

**Checkpoint**: US2 funciona independientemente con agente contraído, expandido y móvil.

---

## Phase 5: User Story 3 — Limpiar tras reevaluación exitosa (Priority: P1)

**Goal**: edición conserva correcciones; resultado acceptable vigente limpia
banner/inline/badges sin reload y devuelve la primaria al flujo existente.

**Independent Test**: transicionar needs-work→dirty→acceptable y observar todas
las superficies antes/después en el mismo montaje.

### Tests — escribir y demostrar rojo primero

- [X] T032 [US3] Escribir en `app/features/tasks/components/TaskWorkspace.test.ts` el flujo reactivo needs-work→edición local→acceptable, afirmando persistencia antes de reevaluar y limpieza simultánea posterior sin remontar la tarea.
- [X] T033 [P] [US3] Añadir en `app/features/tasks/components/GuidedPhaseForm.test.ts` transiciones de primaria a avance permitido y a `Evaluar etapa` cuando no existe evaluación aplicable y el gate no avanza.
- [X] T034 [US3] Ejecutar T032–T033 y registrar rojo válido de limpieza/transición 014 ausentes en `specs/014-inline-blocking/implementation-evidence.md`.

### Implementation — cambio mínimo después del rojo

- [X] T035 [US3] Ajustar la reactividad en `app/features/tasks/components/TaskWorkspace.vue` y `GuidedPhaseForm.vue` para que banner, grupos inline y badges consuman siempre la evaluación aplicable más reciente, sin limpiar por dirty ni guardar copias.
- [X] T036 [US3] Corregir únicamente si las pruebas lo exigen la rama acceptable/no-evaluation de `app/features/tasks/components/workspace-presentation.ts`, preservando el resultado de gates y avance existente.
- [X] T037 [US3] Ejecutar verde enfocado de T032–T033 y regresión de `workspace-presentation`, `TaskWorkspace`, `GuidedPhaseForm` y reglas de avance; sincronizar evidencia.

**Checkpoint**: US3 demuestra salida observable y sin residuos del bloqueo.

---

## Phase 6: User Story 4 — Desfase, fallo y respuestas tardías (Priority: P2)

**Goal**: distinguir estados no vigentes y conservar correcciones previas solo
durante un fallo de reevaluación recuperable.

**Independent Test**: ejecutar fixtures stale, fallo inicial, fallo tras
needs-work, respuesta tardía y tarea completada; verificar chip/primaria y cero
asociaciones falsas.

### Tests — escribir y demostrar rojo primero

- [X] T038 [US4] Añadir fixtures deterministas de stale, fallo inicial, fallo de reevaluación, respuesta tardía y tarea completada en `tests/fixtures/tasks/stage-agent-workspace.ts`, sin cambiar schemas ni mock backend.
- [X] T039 [US4] Escribir pruebas integradas de esos fixtures en `app/features/tasks/components/TaskWorkspace.test.ts`, incluidas correcciones previas preservadas durante transport-error y limpieza al acceptable siguiente.
- [X] T040 [US4] Ejecutar T039 y la suite de presentación, confirmar rojo solo donde falte comportamiento integrado y registrar evidencia.

### Implementation — cambio mínimo después del rojo

- [X] T041 [US4] Completar en `app/features/tasks/components/TaskWorkspace.vue` la selección de evaluación aplicable para ignorar tarea/fase/revisión tardías y distinguir fallo inicial de fallo con needs-work previo, sin alterar transporte.
- [X] T042 [US4] Ejecutar verde enfocado de `TaskWorkspace.test.ts`, `workspace-presentation.test.ts` y fixtures existentes de evaluación desfasada/fallida; sincronizar evidencia.

**Checkpoint**: todas las historias y estados de recuperación funcionan en Capa A.

---

## Phase 7: Capa B — E2E funcional y contrato visual IMG-UX-05

**Purpose**: probar el flujo integrado, cuatro viewports, proximidad, geometría,
foco y accesibilidad antes de crear/actualizar snapshots.

- [X] T043 [US1] Actualizar el estado IMG-UX-05 de `tests/fixtures/tasks/stage-agent-workspace.ts` con exactamente dos motivos canónicos mapeados y contenido contextual que no incremente el conteo.
- [X] T044 [US1] Escribir primero en `tests/e2e/stage-agent-workspace.spec.ts` el flujo contractual banner→inline dentro de Análisis/Criterio, singular/plural y exactamente una primaria, sin editar producto.
- [X] T045 [US2] Extender primero `tests/e2e/stage-agent-workspace.spec.ts` con enlace→expansión/pane→foco, badges rail/header y conservación de draft, sin editar producto.
- [X] T046 [US3] Añadir primero en `tests/e2e/stage-agent-workspace.spec.ts` transición needs-work→reevaluación acceptable→limpieza/avance y fallo→conservación, sin editar producto.
- [X] T047 Ejecutar T044–T046 con `TEST_BASE_URL` único y `--workers=1`, confirmar rojo E2E por comportamiento 014 ausente y registrar comando/salida/exit code en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T048 Implementar el cambio mínimo exigido por T047 solo en `app/features/tasks/components/workspace-presentation.ts`, `StageFieldIssues.vue`, `StageTextField.vue`, `GuidedPhaseForm.vue`, `AgentPanel.vue` y `TaskWorkspace.vue`; no cambiar dominio, backend ni tests para forzar verde.
- [X] T049 Ejecutar `tests/e2e/stage-agent-workspace.spec.ts` verde con el mismo `TEST_BASE_URL` y `--workers=1`; registrar conteo/exit code y regresiones en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T050 [US1] Escribir primero en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` aserciones IMG-UX-05 de descendencia mensaje→bloque, `aria-describedby`, conteo, una primaria, rail/header, foco, cero overlap/overflow y cero violaciones axe en los cuatro viewports, sin editar producto.
- [X] T051 Ejecutar IMG-UX-05 en `VISUAL_RUN_MODE=contract`, confirmar rojo por el contrato visual 014 ausente y registrar los cuatro viewports sin invocar `--update-snapshots`.
- [X] T052 Implementar el cambio visual mínimo indicado por T051 en los estilos/atributos propietarios de `app/features/tasks/components/StageFieldIssues.vue`, `StageTextField.vue`, `AgentPanel.vue`, `GuidedPhaseForm.vue` y `TaskWorkspace.vue`; no debilitar aserciones ni actualizar snapshots.
- [X] T053 Reejecutar IMG-UX-05 en `VISUAL_RUN_MODE=contract` hasta verde en cuatro viewports y registrar proximidad, geometría, foco, overflow, solapes y axe en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T054 [P] Ejecutar regresión de helpers `tests/e2e/helpers/visual-scenarios.test.ts`, `visual-geometry.test.ts` y `visual-capture.test.ts`; registrar resultados sin cambiar baselines.

**Checkpoint**: Capa B funcional/contractual verde; aún no existe aprobación visual.

---

## Phase 8: Capa C, gate humano y baseline controlada

**Purpose**: comparar ACTUAL con IMG-UX-05 sin convertir capturas en aprobación.

- [X] T055 Crear `specs/014-inline-blocking/evidence/actual/` y ejecutar modo `evidence` con `--grep IMG-UX-05` para generar exactamente cuatro `ACTUAL-IMG-UX-05-<viewport>.png`; verificar por hash que ninguna baseline cambió.
- [X] T056 Completar `specs/014-inline-blocking/evidence/visual-comparison.md` ACTUAL vs IMG-UX-05 para jerarquía, contenido, geometría, interacción, responsive y accesibilidad; clasificar cada diferencia con severidad, owner y estado.
- [X] T057 Solicitar revisión humana de las cuatro ACTUAL y registrar la decisión explícita en `specs/014-inline-blocking/evidence/visual-comparison.md`; mantener T057 en `HUMAN_DECISION_REQUIRED` mientras falte aprobación o exista un defecto de alcance.
- [X] T058 Solo después de T057 aprobada, ejecutar `npm run test:visual:update -- --grep "IMG-UX-05"`, revisar/versionar únicamente las cuatro baselines aprobadas y repetir la misma selección sin update hasta verde idempotente.
- [X] T059 Ejecutar la suite visual global en modo baseline para detectar colaterales IMG-UX-01/02/03; abrir una nueva decisión humana si cambia cualquier referencia fuera de IMG-UX-05.

**Checkpoint**: Capa C completa; baseline solo cambia con aprobación explícita.

---

## Phase 9: Polish, regresión y cierre

**Purpose**: demostrar que el cambio está completo sin ocultar deudas externas.

- [X] T060 [P] Ejecutar `npm run typecheck` y la Capa A completa; registrar conteos y exit codes en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T061 Ejecutar `TEST_BASE_URL=<checkout-014> npm run verify:e2e -- --workers=1 --reporter=line` y documentar fallos globales preexistentes versus regresiones 014.
- [X] T062 Ejecutar `npm run verify`, `git diff --check` y `graphify update .`; verificar `graph:check` y registrar evidencia, sin stagear Graphify/caches/SQLite.
- [X] T063 Lanzar un revisor independiente de solo lectura sobre el patch 014; resolver hallazgos accionables con un nuevo ciclo test-first y registrar veredicto en `specs/014-inline-blocking/implementation-evidence.md`.
- [X] T064 Auditar `git status`, excluir cambios ajenos y stagear rutas explícitas 014; ejecutar `git diff --cached --check` y documentar el alcance exacto del commit.
- [ ] T065 Con autorización de publicación, crear commit descriptivo y hacer push únicamente a `origin/codex/014-inline-blocking`; registrar SHA y upstream. No abrir/mergear PR ni tocar `main` sin autorización adicional.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** bloquea todo producto.
- **Phase 2** depende de Phase 1 y bloquea las cuatro historias.
- **US1 (Phase 3)** y **US2 (Phase 4)** son ambas P1; se ejecutan secuencialmente
  porque comparten `GuidedPhaseForm` y la proyección.
- **US3 (Phase 5)** depende de US1+US2 para observar todas las superficies.
- **US4 (Phase 6)** depende de la transición US3.
- **Capa B (Phase 7)** depende de Capa A verde en US1–US4.
- **Capa C (Phase 8)** depende de contrato visual verde; T058 depende además de
  aprobación explícita T057.
- **Closure (Phase 9)** depende de las historias completas; puede registrar T057
  como pendiente, pero no declarar aceptación visual completa.

### Within each test-first block

1. Escribir caso completo sin producto.
2. Ejecutar y confirmar rojo por comportamiento ausente.
3. Registrar el rojo reproducible.
4. Implementar el cambio mínimo.
5. Ejecutar verde enfocado y regresión afectada.
6. Sincronizar tasks/evidence antes de continuar.

### Parallel opportunities

- T003 y T004 son de solo lectura y no comparten archivos.
- T011/T012 y T022/T023 escriben suites distintas, después de sus dependencias.
- T054 y las revisiones documentales pueden ejecutarse mientras no haya cambios
  concurrentes en fixtures/helpers.
- La implementación normal permanece en el hilo principal; `[P]` describe
  independencia técnica, no autoriza multi-agente automáticamente.

---

## Independent delivery increments

### MVP — US1

1. Completar setup/foundation.
2. Entregar banner y mensajes dentro de Análisis/Criterio con asociación ARIA.
3. Detener y validar la historia de forma aislada.

### Recovery increment — US2+US3

1. Añadir chip/primaria/badge/foco.
2. Demostrar edición conservada y limpieza tras acceptable.
3. Detener y validar transición sin reload.

### Resilience increment — US4

1. Distinguir stale/fallo inicial/fallo de reevaluación/respuesta tardía.
2. Ejecutar Capa B/C y gate humano.
3. Cerrar solo después de regresiones y revisión independiente.

## Task summary

- **Total**: 65 tareas.
- **US1**: 15 tareas etiquetadas, incluida derivación, UI, fixture y E2E.
- **US2**: 11 tareas etiquetadas de chip, primaria, badge y foco.
- **US3**: 7 tareas etiquetadas de persistencia durante edición y limpieza.
- **US4**: 6 tareas etiquetadas de desfase, fallo y tardías.
- **Shared/gates/evidence/closure**: 26 tareas.
- **MVP sugerido**: T001–T021, sin omitir autorización, rojo ni evidencia.
