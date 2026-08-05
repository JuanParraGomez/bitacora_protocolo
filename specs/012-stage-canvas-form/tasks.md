# Tasks: Lienzo de etapa como formulario protagonista

**Input**: Design documents from `/specs/012-stage-canvas-form/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [visual-acceptance.md](contracts/visual-acceptance.md)

**Tests**: obligatorios y test-first. Cada bloque de producto depende de un rojo
válido por comportamiento ausente; un fallo de setup, importación o fixture no
cuenta. Registrar comando, conteo, exit code y causa/veredicto en
`implementation-evidence.md` solo después de ejecutar la evidencia.

**Organization**: tareas agrupadas por historia para entregar y verificar cada
incremento. `[P]` solo indica trabajo independiente en archivos sin dependencia
de un cambio pendiente; no autoriza saltarse orden TDD ni el límite de una tarea
Spec Kit por hilo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo después de satisfacer dependencias.
- **[USn]**: historia de usuario trazada a `spec.md`.
- Cada tarea nombra paths exactos y referencias funcionales/visuales.

---

## Phase 1: Setup y gates de procedencia

**Purpose**: asegurar rama, contrato aprobado, prerequisitos y evidencia limpia
antes de escribir pruebas o producto.

- [X] T001 Obtener aprobación explícita de `specs/012-stage-canvas-form/spec.md`, actualizar solo su `Status` con esa decisión y registrar fecha/alcance en `specs/012-stage-canvas-form/implementation-evidence.md`; si no existe aprobación, detener con `HUMAN_DECISION_REQUIRED` (Refs: todas AC/FR; IMG-UX-01, IMG-UX-04)
- [X] T002 Verificar en `specs/012-stage-canvas-form/implementation-evidence.md` rama `codex/012-stage-canvas-form`, base shell `4e0fbff`, infraestructura visual `68498d5`, upstream y worktree mixto; clasificar T007/T008 de 011 como deuda histórica externa sin marcarla resuelta (Refs: Dependencies; FR-022–FR-024)
- [X] T003 [P] Inventariar y hashear las 24 baselines heredadas bajo `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/` y registrar el manifiesto previo en `specs/012-stage-canvas-form/implementation-evidence.md` sin actualizar capturas (Refs: SC-008; IMG-UX-01, IMG-UX-04)
- [X] T004 [P] Crear la plantilla de Capa C en `specs/012-stage-canvas-form/evidence/visual-comparison.md` y el índice vacío `specs/012-stage-canvas-form/evidence/actual/.gitkeep`, con cinco ACTUAL contractuales y clasificaciones `aprobada|pendiente|defecto`, sin afirmar resultados no ejecutados (Refs: FR-024, SC-008; IMG-UX-01, IMG-UX-04)
- [X] T005 Revisar staged/untracked scope y documentar exclusiones de SQLite, `graphify-out/`, caches, resultados Playwright y ACTUAL ajenos en `specs/012-stage-canvas-form/implementation-evidence.md`; no comenzar producto si el checkout no permite aislar 012 (Refs: FR-022)

**Checkpoint**: contrato aprobado, procedencia verificable y baselines intactas.

---

## Phase 2: Foundational — arnés de presentación y evidencia

**Purpose**: preparar pruebas compartidas y selectores observables sin cambiar
todavía el comportamiento del producto.

- [X] T006 [P] Añadir factories/fixtures parametrizados de tareas phase1–phase4 y valores 0/499/500/742 en `app/features/tasks/components/GuidedPhaseForm.test.ts`, reutilizando el shape real sin modificar fuente (Refs: AC-001–AC-011; FR-002–FR-014)
- [X] T007 [P] Añadir helpers de orden, label asociado, icono decorativo, contador y primaria única en `app/features/tasks/components/GuidedPhaseForm.test.ts`, sin introducir expectativas de specs 013–016 (Refs: FR-003–FR-010, FR-015–FR-017; IMG-UX-01, IMG-UX-04)
- [X] T008 [P] Extender tipos y tests en `tests/e2e/helpers/visual-geometry.ts` y `tests/e2e/helpers/visual-geometry.test.ts` para pares observables canvas/formulario↔agente y última fila↔footer, sin comparar formulario padre con footer descendiente (Refs: FR-020, SC-007; IMG-UX-01, IMG-UX-04)
- [X] T009 [P] Añadir a `tests/e2e/helpers/visual-capture.ts` y su test las variables `VISUAL_EVIDENCE_ROOT` y `VISUAL_EVIDENCE_CASES`, con defaults intactos de spec 010, para escribir únicamente los pares `ref:viewport` autorizados en la carpeta 012 (Refs: FR-024, SC-008)
- [X] T010 Ejecutar únicamente los tests auxiliares de T008–T009, corregir solo el arnés hasta verde y registrar comando/conteo/exit code en `specs/012-stage-canvas-form/implementation-evidence.md`; no ejecutar update de snapshots (Refs: FR-020–FR-024)

**Checkpoint**: el arnés mide el contrato sin alterar el formulario.

---

## Phase 3: User Story 1 — Formulario protagonista (Priority: P1) 🎯 MVP

**Goal**: título/stepper/campos/footer forman directamente el lienzo en las
cuatro fases, con icono, label, contador, una primaria y cero meta/Atrás.

**Independent Test**: montar cada fase y verificar título único, orden completo,
contadores, formulario primero, footer y ausencias contractuales.

### Tests RED para User Story 1

- [X] T011 [P] [US1] Crear `app/features/tasks/components/StageTextField.test.ts` con label/control, SVG `aria-hidden`, input/textarea, `0/500`, `499/500`, `500/500`, `742/500`, edición/borrado y ausencia de `maxlength` (Refs: AC-003, AC-011; FR-006–FR-008; IMG-UX-01, IMG-UX-04)
- [X] T012 [P] [US1] Completar matriz phase1–phase4 en `app/features/tasks/components/GuidedPhaseForm.test.ts` para título/stepper, orden y editabilidad exhaustivos de FR-005/FR-010, icono/label/contador, `Contexto y confirmación`, round-trip exacto >500 y valores estructurados (Refs: AC-001–AC-004, AC-009–AC-011; FR-002–FR-010, FR-022)
- [X] T013 [P] [US1] Añadir en `app/features/tasks/components/TaskWorkspace.test.ts` casos móvil/escritorio de formulario antes del resumen y ausencias contractuales; añadir en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` las mismas aserciones DOM más pares geométricos formulario↔agente y última fila↔footer, preservando vista completada y matriz 6×4 (Refs: AC-001, AC-004; FR-001, FR-004, FR-016, FR-020, FR-023; IMG-UX-01, IMG-UX-04)
- [X] T014 [US1] Ejecutar T011–T013 con el comando Capa A y el caso visual enfocado de `quickstart.md`, confirmar rojo exclusivamente por contrato 012 ausente antes de producto y registrar comando, conteo, exit code y causas; detener si el rojo es de setup (Refs: Validation Capa A/B)

### Implementación mínima para User Story 1

- [X] T015 [US1] Implementar `app/features/tasks/components/StageTextField.vue` como wrapper presentacional de input/textarea con valor intacto, SVG local decorativo, label asociado, `aria-describedby` combinable y contador informativo sin `maxlength` (Refs: FR-006–FR-008; IMG-UX-01, IMG-UX-04; depende de T014)
- [X] T016 [US1] Actualizar títulos/descriptor presentacional en `app/features/tasks/components/guided-phase-form.ts` y su test, eliminando `Fase N ·` sin introducir persistencia ni reglas de dominio (Refs: FR-002–FR-004; depende de T014)
- [X] T017 [US1] Reordenar `app/features/tasks/components/GuidedPhaseForm.vue`: título + stepper, contenido de fase y footer final; eliminar botón `Atrás`, mantener acción contextual única y conservar eventos públicos necesarios fuera de la representación visual (Refs: FR-001–FR-004, FR-015–FR-017; depende de T015–T016)
- [X] T018 [P] [US1] Adaptar los cinco prioritarios y secundarios de `app/features/tasks/components/OrientationPhase.vue` a `StageTextField`, retirar título/legend redundantes y conservar IDs, `aria-describedby`, valores y sección `Contexto y confirmación` (Refs: FR-004–FR-009; depende de T015)
- [X] T019 [P] [US1] Adaptar controles textuales de `app/features/tasks/components/GuidancePhase.vue` a `StageTextField` sin cambiar arrays, handlers ni orden FR-010; dejar la política dirty/save para US2 (Refs: FR-006–FR-010; depende de T015)
- [X] T020 [P] [US1] Adaptar controles textuales de `app/features/tasks/components/ExecutionPhase.vue` a `StageTextField` sin cambiar iteraciones, criterios ni operaciones (Refs: FR-006–FR-010; depende de T015)
- [X] T021 [P] [US1] Adaptar controles textuales de `app/features/tasks/components/ReviewPhase.vue` a `StageTextField` sin cambiar confrontaciones, sincronización de mejoras ni operaciones (Refs: FR-006–FR-010; depende de T015)
- [X] T022 [US1] Eliminar en ambas composiciones activas el panel meta de `app/features/tasks/components/TaskWorkspace.vue`, montar `GuidedPhaseForm` antes de `StructuredStageSummary` y no tocar cabecera de tarea completada/agente (Refs: FR-001, FR-004, FR-023; depende de T013, T017)
- [X] T023 [US1] Ejecutar tests T011–T013 más tests de las cuatro fases; corregir solo producto 012 hasta verde y registrar conteos/exit code/regresiones en `specs/012-stage-canvas-form/implementation-evidence.md` (Refs: SC-001–SC-004, SC-006)

**Checkpoint**: MVP verificable — el formulario es el lienzo y ningún dato fue
eliminado; aún no se declara uniforme el guardado hasta completar US2.

---

## Phase 4: User Story 2 — Guardado manual inequívoco (Priority: P1)

**Goal**: las cuatro fases marcan dirty sin autosave; éxito, fallo y reintento
usan un único estado y persisten por el pipeline existente.

**Independent Test**: escribir en cada fase sin solicitud, guardar explícitamente,
comprobar limpio tras éxito y valores/dirty/reintento tras fallo.

### Tests RED para User Story 2

- [X] T024 [P] [US2] Añadir matriz phase1–phase4 en `app/features/tasks/components/GuidedPhaseForm.test.ts` y flujo E2E resembrado en `tests/e2e/stage-agent-workspace.spec.ts` para edición→chip único, cero guardados automáticos, bloqueo durante `saving`, éxito limpio, fallo conserva dirty/valor y reintento (Refs: AC-005–AC-008; FR-011–FR-014)
- [X] T025 [P] [US2] Crear `app/features/tasks/components/GuidancePhase.test.ts` con conteo de emisiones que demuestre que escribir ya no emite `save`, preservando las acciones explícitas existentes (Refs: FR-011, FR-013, FR-022)
- [X] T026 [P] [US2] Añadir en `app/features/tasks/components/GuidedPhaseForm.test.ts` reinicio de estado por `[task.id, task.fase]` y separación de chips: `Cambios sin guardar` depende de dirty; `Cambios sin evaluar` aparece solo con evaluación desfasada, sobrevive al guardado y desaparece al recuperar vigencia (Refs: AC-008 y Edge Cases; FR-012, FR-014)
- [X] T027 [US2] Ejecutar T024–T026 y el flujo E2E enfocado antes de tocar producto, confirmar rojo por política desigual/autosave real y registrar evidencia completa en `specs/012-stage-canvas-form/implementation-evidence.md` (Refs: Validation Capa A/B)

### Implementación mínima para User Story 2

- [X] T028 [US2] Hacer que `OrientationPhase.vue`, `GuidancePhase.vue`, `ExecutionPhase.vue` y `ReviewPhase.vue` emitan `dirty` explícitamente ante cada edición/operación, escucharlo en `GuidedPhaseForm.vue` y reiniciar por tarea/fase; no depender de burbujeo de eventos personalizados Vue ni crear otro store (Refs: FR-011–FR-014; depende de T027)
- [X] T029 [US2] Retirar el autosave profundo de `app/features/tasks/components/GuidancePhase.vue` y emitir solo dirty en edición, manteniendo payloads, evaluación y guardados explícitos ajenos al tecleo (Refs: FR-011–FR-014, FR-022; depende de T027)
- [X] T030 [US2] Ajustar `app/features/tasks/components/GuidedPhaseForm.vue` y `app/features/tasks/components/guided-phase-form.ts` para chips/copias únicos (`Cambios sin guardar` por dirty y `Cambios sin evaluar` solo por evaluación desfasada), botón deshabilitado durante `saving`, éxito limpio y error recuperable sin equiparar guardado/evaluación (Refs: FR-012–FR-014; depende de T027)
- [X] T031 [US2] Ejecutar T024–T026 y regresiones de `GuidedPhaseForm`/`TaskWorkspace`; exigir verde, cero autosave y pipeline `pages/tasks/[id].vue` intacto, registrando evidencia real (Refs: SC-005, SC-006)
- [X] T032 [US2] Completar fixtures/wiring del flujo E2E escrito en T024 sin relajar sus aserciones: resembrar cada fase y confirmar que el guardado real no contamina tests o snapshots posteriores (Refs: AC-005–AC-008; IMG-UX-01, IMG-UX-04)
- [X] T033 [US2] Ejecutar `tests/e2e/stage-agent-workspace.spec.ts` serial contra un solo servidor, corregir solo integración frontend 012 hasta verde y registrar comando/conteo/exit code (Refs: FR-011–FR-014, SC-005)

**Checkpoint**: política manual uniforme y evaluación separada, demostradas en
unitarias y navegador.

---

## Phase 5: User Story 3 — Contexto completo preservado (Priority: P1)

**Goal**: ningún campo, lista, iteración, criterio u operación existente queda
oculto, reordenado fuera del contrato, truncado o de solo lectura.

**Independent Test**: fixture completo por fase, recorrido y edición de todo el
contenido, incluyendo valor histórico >500.

### Regresión exhaustiva para User Story 3

- [X] T034 [P] [US3] Auditar en `app/features/tasks/components/GuidedPhaseForm.test.ts` que las aserciones test-first de T012 cubren `Contexto y confirmación`, orden FR-010 y editabilidad de cada familia phase1–phase4; añadir únicamente huecos de regresión encontrados (Refs: AC-009–AC-011; FR-009–FR-010)
- [X] T035 [P] [US3] Auditar en `app/features/tasks/components/GuidedPhaseForm.test.ts` la cobertura test-first de T012 para round-trip >500 y valores estructurados, sin cambiar expectativas para acomodar producto (Refs: AC-011; FR-007, FR-022)
- [X] T036 [US3] Ejecutar T034–T035 como regresión; si un hueco nuevo requiere comportamiento, detener, obtener su rojo antes del cambio mínimo en el componente de fase afectado y repetir verde (Refs: SC-006)
- [X] T037 [US3] Añadir recorrido E2E a `tests/e2e/stage-agent-workspace.spec.ts` que confirme secundarios de fase 1 y contenido completo/alcanzable de fases 2–4 sin exigir rediseños 013–016 (Refs: FR-009–FR-010, FR-023)
- [X] T038 [US3] Ejecutar las regresiones unitarias y E2E de T034–T037, registrar conteos y confirmar cero pérdida/truncamiento de datos (Refs: SC-003, SC-006)

**Checkpoint**: jerarquía nueva con protocolo y datos completos.

---

## Phase 6: User Story 4 — Mismo flujo en móvil (Priority: P2)

**Goal**: mismo árbol, contenido y orden; secundaria centrada, primaria full-width
y cero solapamiento/overflow en 390, 320 y zoom 200 %.

**Independent Test**: recorrer las cuatro fases en móvil hasta el footer y
guardar sin que agente/acciones cubran controles.

### Tests RED para User Story 4

- [X] T039 [P] [US4] Añadir a `app/features/tasks/components/GuidedPhaseForm.test.ts` contrato de orden DOM único y clases/atributos del footer móvil sin duplicar formulario ni IDs (Refs: AC-012–AC-014; FR-018–FR-020; IMG-UX-04)
- [X] T040 [P] [US4] Añadir a `tests/e2e/stage-agent-workspace.spec.ts` casos 390×844, 320×667 y zoom 200 % para mismo contenido/orden, scroll hasta último control, guardar centrado, primaria full-width y overflow horizontal cero (Refs: AC-012–AC-014; IMG-UX-04)
- [ ] T041 [US4] Ejecutar T039 y el caso E2E móvil antes de estilos; confirmar rojo por geometría/presentación 012 ausente y registrar evidencia, sin aceptar fallo de servidor/fixture como rojo (Refs: Validation Capa A/B)

> Nota de cierre 2026-08-05: T041 no es retroactivamente ejecutable porque el
> rojo previo a estilos no fue capturado antes de implementar T042. Las
> verificaciones posteriores de T043 y Capa B están verdes, pero esta deuda de
> evidencia test-first queda sin marcar en vez de fabricarse.

### Implementación mínima para User Story 4

- [X] T042 [US4] Ajustar solo estilos locales de `app/features/tasks/components/GuidedPhaseForm.vue`, `app/features/tasks/components/StageTextField.vue` y componentes de fase necesarios para flujo vertical, contadores estables, secundaria centrada y primaria full-width; no crear breakpoints/layout/tabs de spec 015 (Refs: FR-018–FR-020, FR-023; depende de T041)
- [X] T043 [US4] Ejecutar T039–T040 en 390/320/zoom, más regresión desktop/tablet, y registrar cero overflow/solape con conteos/exit code (Refs: SC-002, SC-007)

**Checkpoint**: paridad funcional móvil sin ampliar responsive estructural.

---

## Phase 7: Capa B visual y Capa C documental

**Purpose**: probar la integración renderizada, generar candidatas controladas y
obtener decisión humana antes de aceptar baselines.

- [X] T044 Ejecutar la suite visual completa con las aserciones test-first añadidas en T013: título/stepper/campos/footer, meta/Atrás ausentes, formulario↔agente y última fila↔footer sin solape, primaria única, SVG/labels y axe (Refs: FR-001–FR-010, FR-015–FR-021; IMG-UX-01, IMG-UX-04)
- [X] T045 Ejecutar el flujo E2E resembrado escrito en T024 inmediatamente antes de la corrida de snapshots y confirmar editar→dirty→guardar real→limpio sin contaminación de la siembra visual (Refs: FR-011–FR-014; IMG-UX-01, IMG-UX-04)
- [X] T046 Ejecutar `npm run test:visual` sin update contra las 24 baselines; confirmar que el rojo esperado proviene solo de diffs visuales mientras DOM, geometría y axe quedan verdes, y registrar todos los diffs colaterales IMG-UX-02/03/05 afectados (Refs: SC-007–SC-008)
- [X] T047 Con autorización explícita para captura, ejecutar `VISUAL_EVIDENCE_ROOT=specs/012-stage-canvas-form/evidence/actual VISUAL_EVIDENCE_CASES='IMG-UX-01:desktop-large,IMG-UX-01:tablet,IMG-UX-01:mobile,IMG-UX-01:mobile-narrow,IMG-UX-04:mobile' TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update -- --workers=1 --reporter=line` (evidencia real en `3000` porque el servidor Nuxt activo respondió ahí); actualizar/revisar la matriz global afectada pero escribir en evidencia 012 solo esos cinco ACTUAL y registrar hashes sin aceptar baselines (Refs: Validation Capa B; IMG-UX-01 ×4, IMG-UX-04 móvil)
- [X] T048 **HUMAN_DECISION_REQUIRED** Revisar los cinco ACTUAL 012 y toda baseline heredada cuyo diff cambió, compararlos con IMG-UX-01/04 y registrar aprobación explícita o defectos en `specs/012-stage-canvas-form/evidence/visual-comparison.md`; no avanzar con silencio (Refs: FR-024, SC-008)
- [X] T049 Tras aprobación de T048, ejecutar `npm run test:visual` sin update y exigir verde idempotente; sembrar por separado un defecto de snapshot, uno geométrico y uno de contraste, confirmar que cada gate falla, revertir solo las siembras y repetir verde (Refs: FR-020–FR-024, SC-007–SC-008)
- [X] T050 Completar `specs/012-stage-canvas-form/evidence/visual-comparison.md` por las seis dimensiones contractuales con evidencia, severidad, responsable y clasificación; enlazar cinco ACTUAL y distinguir mockup de baseline (Refs: FR-024; IMG-UX-01, IMG-UX-04)

**Checkpoint**: Capa B solo queda cerrada con verde idempotente y aprobación
humana; Capa C clasifica todas las diferencias.

---

## Phase 8: Polish, verificación agregada y publicación

**Purpose**: cerrar únicamente evidencia real, revisar alcance y publicar la
rama sin mezclar ruido del checkout.

- [X] T051 [P] Ejecutar Vitest enfocado de `StageTextField`, helper, `GuidedPhaseForm`, `TaskWorkspace` y cuatro fases; registrar comando, total, exit code y regresiones en `specs/012-stage-canvas-form/implementation-evidence.md` (Refs: Validation Capa A)
- [X] T052 [P] Ejecutar `npm run typecheck` y `npm run verify:e2e`; registrar conteos/exit code y cualquier alcance no verificado sin llamarlo “todo verde” (Refs: FR-020–FR-023)
- [X] T053 Ejecutar `npm run test:visual` completo y `npm run verify`; separar fallos de 012, deuda previa y mutaciones de fixtures, y registrar veredicto exacto (Refs: SC-007–SC-008)
- [X] T054 Ejecutar `graphify update .` y `graphify check`, inspeccionar el impacto arquitectónico y mantener `graphify-out/` fuera del staging; registrar solo el resultado en evidencia (Refs: Constitution V, FR-022–FR-023)
- [X] T055 Lanzar revisión independiente del patch completo 012; resolver hallazgos P0/P1 mediante un nuevo ciclo test rojo→cambio mínimo→verde y documentar decisiones P2/P3 (Refs: todas FR/SC)
- [X] T056 Validar `quickstart.md` de principio a fin y ejecutar `git diff --check`; sincronizar en `specs/012-stage-canvas-form/implementation-evidence.md` únicamente tareas/evidencias realmente completas (Refs: Validation Contract)
- [X] T057 Inspeccionar staged diff y secretos/ruido, stagear solo frontend/tests/docs/baselines 012 explícitamente aprobados, crear commit descriptivo y hacer push únicamente a `origin/codex/012-stage-canvas-form`; reportar commit, upstream y alcance mixto sin mergear `main` (Refs: workflow Git, FR-022)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: bloquea todo producto; T001 es gate humano.
- **Foundational (Phase 2)**: depende de Phase 1 y habilita medición compartida.
- **US1 (Phase 3)**: depende de Foundational; es el MVP visual/estructural.
- **US2 (Phase 4)**: depende de US1 porque usa el footer/campo común.
- **US3 (Phase 5)**: depende de US1; valida que la conversión preservó datos.
- **US4 (Phase 6)**: depende de US1 y US2 para probar el footer final.
- **Capa B/C (Phase 7)**: depende de US1–US4; T048 bloquea aceptación.
- **Closure (Phase 8)**: depende de capas A/B/C y de la decisión humana.

### User Story Dependencies

- **US1 (P1)**: independiente después del arnés; entrega formulario protagonista.
- **US2 (P1)**: integra sobre el footer US1, pero su contrato de save se prueba aislado.
- **US3 (P1)**: se puede auditar en paralelo con US2 después de US1; cualquier
  corrección debe respetar el ciclo TDD y no pisar los mismos archivos simultáneamente.
- **US4 (P2)**: requiere markup/footer finales de US1/US2; no cambia layout global.

### Within Each User Story

1. Escribir pruebas completas de happy, boundary, failure/recovery y regression.
2. Ejecutar y conservar rojo por comportamiento ausente.
3. Aplicar el cambio mínimo de producto.
4. Ejecutar prueba nueva y suite afectada hasta verde.
5. Registrar evidencia antes de marcar la tarea.

## Parallel Opportunities

- T003–T004 pueden ejecutarse en paralelo tras T001–T002.
- T006–T009 son de archivos independientes; T010 los integra.
- T011–T013 pueden escribirse en paralelo; T014 reúne el rojo.
- T018–T021 modifican fases distintas después de T015, pero una ejecución de
  un solo hilo puede hacerlas secuencialmente para respetar disciplina Spec Kit.
- T024–T026 pueden escribirse en paralelo; T027 reúne el rojo.
- T034–T035 y T039–T040 son pares unit/E2E independientes.
- T051–T052 pueden ejecutarse en paralelo solo si no comparten servidor/storage;
  E2E y visual permanecen seriales con un único servidor.

## Parallel Example: User Story 1

```text
Task T011: StageTextField.test.ts (contrato del wrapper)
Task T012: GuidedPhaseForm.test.ts (matriz de cuatro fases)
Task T013: TaskWorkspace.test.ts (composición/meta)

Después de reunir el rojo T014:
Task T018: OrientationPhase.vue
Task T019: GuidancePhase.vue
Task T020: ExecutionPhase.vue
Task T021: ReviewPhase.vue
```

## Implementation Strategy

### MVP First

1. Completar gates y arnés.
2. Completar US1 con rojo y verde.
3. Detener y demostrar formulario protagonista en cuatro fases.
4. No declarar política manual ni móvil completos hasta US2/US4.

### Incremental Delivery

1. US1: jerarquía, campos, contadores y footer.
2. US2: dirty/save manual uniforme y recuperable.
3. US3: auditoría exhaustiva de preservación.
4. US4: misma experiencia móvil.
5. Capa B/C: candidata, revisión humana, verde idempotente.
6. Cierre: agregados, revisión independiente, hygiene y push de rama.

### Stop Conditions

- Spec sin aprobación explícita.
- Prerrequisito 010/011 o baseline no identificable.
- Rojo causado por setup, servidor o fixture en vez del comportamiento esperado.
- Diff visual con gate geométrico/axe roto.
- Baseline candidata sin decisión humana.
- Imposibilidad de aislar staged scope de datos/artefactos ajenos.
