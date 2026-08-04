---

description: "Task list for visual testing infrastructure (spec 010)"
---

# Tasks: Infraestructura de pruebas visuales del workspace

**Input**: Design documents from `/specs/010-visual-testing-infra/`

**Prerequisites**: plan.md, spec.md, research.md (data-model/contracts/quickstart omitidos por decisión del usuario)

**Tests**: OBLIGATORIOS (test-first por constitución y spec: Capa A Vitest de helpers, Capa B rojo→generación→verde idempotente). Toda tarea registra rojo esperado antes de implementar.

**Evidence**: `specs/010-visual-testing-infra/implementation-evidence.md`. Ninguna tarea se marca `[x]` sin registro individual VERIFICADO (comando, fecha ISO, exit code, rojo esperado + motivo, verde, regresiones, alcance no verificado, commit/diff, estado).

**Restricción transversal (FR-014)**: prohibido modificar `app/`, `server/`, `shared/`, `data/`, rutas o persistencia. Diff permitido: `tests/`, `package.json`, `package-lock.json`, `tests/e2e/README.md`, `docs/ux-ui/`, `specs/010-visual-testing-infra/`.

**Organization**: por historias de usuario (US1 P1, US2 P2, US3 P2, US4 P3 del spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizable (archivos distintos, sin dependencias)
- **[Story]**: [US1]–[US4] según spec.md
- Cada tarea cita `Refs: FR-XXX, IMG-UX-XX` y el AC que cubre

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: evidencia, dependencias y dataset determinista que todo lo demás usa

- [X] T001 Crear `specs/010-visual-testing-infra/implementation-evidence.md` con la plantilla de registro por tarea (ID, AC, archivos, comando, fecha ISO, exit code, rojo esperado + motivo, verde, regresiones, alcance no verificado, commit/diff, estado) y el directorio `specs/010-visual-testing-infra/evidence/actual/`. Refs: FR-008. AC-006
- [X] T002 Añadir `@axe-core/playwright` como devDependency en `package.json` (verificar primero que `axe-core`/`@axe-core/playwright` no existen — confirmado ausente el 2026-08-04) y añadir scripts `"test:visual": "playwright test tests/e2e/visual"` y `"test:visual:update": "playwright test tests/e2e/visual --update-snapshots"`; instalar y registrar versión. Refs: FR-007, FR-008. AC-005, AC-006
- [X] T003 Extender de forma ADITIVA `tests/fixtures/tasks/stage-agent-workspace.ts`: dataset por escenario IMG-UX (etapa activa agente contraído = `phase1`; agente expandido con conversación + propuesta = `phase2` + `proposalTurn`; bloqueo con 2 correcciones = nueva entrada con evaluación `status: 'error'`/issues de 2 correcciones junto a su causa; completada 4/4 = `phase4`), sin modificar entradas existentes ni romper `workspace-ux-audit.spec.ts`/`conversational-workspace.spec.ts`. Refs: FR-004, IMG-UX-01…06. AC-003

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: helpers puros con Capa A en rojo→verde; bloquean la suite visual

**⚠️ CRITICAL**: ninguna historia puede empezar hasta completar esta fase

- [X] T004 [P] Capa A ROJA: escribir `tests/e2e/helpers/visual-scenarios.test.ts` (Vitest) — resolución de rutas canónicas de IMG-UX-01…06 desde `docs/ux-ui/mockups/rediseño-agente/manifest.md`, rechazo de globs y de rutas no canónicas; ejecutar `npx vitest run tests/e2e/helpers/visual-scenarios.test.ts` y registrar rojo esperado (módulo inexistente). Refs: FR-002, FR-011. AC-002
- [X] T005 [P] Capa A ROJA: escribir `tests/e2e/helpers/visual-geometry.test.ts` (Vitest) — intersección de cajas sintéticas (solapadas, adyacentes sin solape, contenidas) y conteo de acción primaria (0, 1, 2 visibles); registrar rojo esperado. Refs: FR-005, FR-006, FR-011. AC-004
- [X] T006 [P] Capa A ROJA: escribir `tests/e2e/helpers/visual-capture.test.ts` (Vitest) — configuración de captura (tolerancia 1%, animaciones deshabilitadas, selectores de máscara para horas/avatares/ids) y construcción de ruta de artefacto `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-XX-<viewport>.png`; registrar rojo esperado. Refs: FR-001, FR-008, FR-011. AC-001
- [X] T007 Implementar `tests/e2e/helpers/visual-scenarios.ts` (catálogo IMG-UX-01…06 con rutas canónicas del manifest, validación anti-globs, viewports reutilizando `WORKSPACE_UX_VIEWPORTS` de `tests/e2e/helpers/workspace-ux.ts`) hasta verde T004. Refs: FR-002, FR-003, IMG-UX-01…06. AC-002
- [X] T008 Implementar `tests/e2e/helpers/visual-geometry.ts` (`assertNoOverlap(namedBoxes)` y `countPrimaryActions(...)`, lógica pura) hasta verde T005. Refs: FR-005, FR-006. AC-004
- [X] T009 Implementar `tests/e2e/helpers/visual-capture.ts` (`waitForStableUi(page)`, máscaras de regiones dinámicas, captura `toHaveScreenshot()` con `maxDiffPixelRatio: 0.01` y `animations: 'disabled'`) y `tests/e2e/helpers/visual-evidence.ts` (copia de artefactos a `evidence/actual/ACTUAL-IMG-UX-XX-<viewport>.png`) hasta verde T006. Refs: FR-001, FR-008. AC-001
- [X] T010 Registrar en `implementation-evidence.md` las entradas individuales VERIFICADO/PARCIAL de T001–T009 (rojos esperados T004–T006 con motivo, verdes T007–T009, comandos exactos, exit codes); solo VERIFICADO permite marcar `[x]`. Refs: FR-011. AC-001, AC-002, AC-004

**Checkpoint**: helpers con Capa A verde — las historias pueden empezar

---

## Phase 3: User Story 1 - Captura de escenarios canónicos con baseline (Priority: P1) 🎯 MVP

**Goal**: suite visual que captura los 6 escenarios × 4 viewports, falla ante diffs y solo genera baselines con flag explícito

**Independent Test**: `npm run test:visual` sin baselines (rojo) → `npm run test:visual:update` (genera 24 baselines) → `npm run test:visual` (verde, idempotente)

- [X] T011 [US1] Escribir `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`: para cada IMG-UX-01…06 y cada viewport de `WORKSPACE_UX_VIEWPORTS` (mismo dataset por escenario, siembra vía patrón `seedWorkspace` con el fixture extendido), navegar al estado, `waitForStableUi`, captura enmascarada `toHaveScreenshot` al 1%. Ejecutar `npm run test:visual` SIN baselines y registrar la corrida roja (Capa B rojo: baselines ausentes). Refs: FR-001, FR-002, FR-003, FR-004, FR-009, IMG-UX-01…06. AC-001, AC-002, AC-003, AC-006
- [X] T012 [US1] Ejecutar `npm run test:visual:update` (flag explícito) para generar las 24 baselines en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/` y los artefactos `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-XX-<viewport>.png` por escenario y viewport. Refs: FR-008, IMG-UX-01…06. AC-003, AC-006
- [X] T013 [US1] Ejecutar `npm run test:visual` por segunda vez: debe ser verde, sin diffs y sin regenerar artefactos (idempotencia); luego sembrar un defecto visual temporal y verificar que la suite falla señalando escenario y viewport (revertir el defecto después). Registrar ambas corridas con exit codes. Refs: FR-009, FR-012. AC-006, AC-007
- [X] T014 [US1] Registrar en `implementation-evidence.md` las entradas individuales de T011–T013 (rojo Capa B, generación con flag, verde idempotente, defecto sembrado detectado). Refs: FR-012. AC-001, AC-002, AC-003, AC-006, AC-007

**Checkpoint**: US1 funcional e idempotente — MVP de la infraestructura

---

## Phase 4: User Story 2 - Verificación de invariantes geométricas y de acción primaria (Priority: P2)

**Goal**: la suite falla si navegación/lienzo/agente/compositor/acciones se superponen o si hay ≠1 acción primaria visible

**Independent Test**: unitarias de cajas sintéticas (T005/T008) + verificación integrada en los 6 escenarios de la suite visual

- [X] T015 [US2] Integrar en `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` la verificación por escenario: `boundingBox()` de navegación, lienzo, agente, compositor y acciones → `assertNoOverlap` (cero intersecciones) y `countPrimaryActions(page) === 1`; registrar la corrida. Refs: FR-005, FR-006, IMG-UX-01…06 (invariantes 1 y 2 del manifest). AC-004
- [X] T016 [US2] Registrar en `implementation-evidence.md` las entradas individuales de T015 (unitarias sintéticas + verificación en los 6 escenarios). Refs: FR-005, FR-006, FR-011. AC-004

**Checkpoint**: US1 + US2 verdes de forma independiente

---

## Phase 5: User Story 3 - Verificación de contraste accesible (Priority: P2)

**Goal**: axe-core evalúa 4.5:1 (texto) y 3:1 (componentes) en los 6 escenarios y registra violaciones

**Independent Test**: ejecución de la evaluación de contraste por escenario con resultados (violaciones o no) registrados en evidencia

- [X] T017 [US3] Integrar `@axe-core/playwright` (`AxeBuilder`, regla `color-contrast` para 4.5:1 texto y 3:1 componentes) en la suite para los 6 escenarios; las violaciones del estado actual se reportan por escenario y elemento y se registran como excepciones conocidas pendientes de las specs 011–016 (el gate estricto lo activan 011–016). Refs: FR-007, IMG-UX-01…06. AC-005
- [X] T018 [US3] Registrar en `implementation-evidence.md` las entradas individuales de T017 (resultado por escenario, violaciones halladas y su clasificación). Refs: FR-007. AC-005

**Checkpoint**: contraste medido en los 6 escenarios con brecha registrada

---

## Phase 6: User Story 4 - Flujo documentado de baselines y evidencia de brecha (Priority: P3)

**Goal**: documentación reproducible del flujo de baselines + registro Capa C de la brecha contra mockups

**Independent Test**: un desarrollador sigue `tests/e2e/README.md` y genera/aprueba/actualiza baselines; `evidence/visual-comparison.md` lista los 6 escenarios como "pendiente de rediseño"

- [X] T019 [P] [US4] Documentar en `tests/e2e/README.md` el flujo completo: cómo generar baselines (`npm run test:visual:update`), cómo aprobarlas (revisión de diff en PR), cómo actualizarlas (solo con flag explícito), convención `evidence/actual/ACTUAL-IMG-UX-XX.png` y la regla "el mockup nunca es baseline (imagen IA; la aceptación contra mockup es documental, Capa C)". Refs: FR-010. AC-008
- [X] T020 [P] [US4] Crear `specs/010-visual-testing-infra/evidence/visual-comparison.md`: tabla IMG-UX-01…06 con estado "pendiente de rediseño", referencia a mockup del manifest, a las specs 011–016 y a las violaciones de contraste heredadas de T017. Refs: FR-013, IMG-UX-01…06. AC-009
- [X] T021 [US4] Registrar en `implementation-evidence.md` las entradas individuales de T019–T020 (revisión documental reproducible). Refs: FR-010, FR-013. AC-008, AC-009

**Checkpoint**: flujo de baselines documentado y brecha Capa C registrada

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: cierre verificable de la spec

- [ ] T022 Verificar que el diff de la rama queda limitado a `tests/`, `package.json`, `package-lock.json`, `tests/e2e/README.md`, `specs/010-visual-testing-infra/` (cero cambios en `app/`, `server/`, `shared/`, `data/`) y registrar el resultado. Refs: FR-014. AC-010
- [ ] T023 Ejecutar regresiones y gates: `npm run test:unit`, `npm run typecheck`, `npm run verify:e2e` (suites existentes intactas tras la extensión del fixture), `npm run test:visual` (verde idempotente final); registrar comandos, fechas ISO y exit codes. Refs: FR-012, FR-014. AC-006, AC-010
- [X] T024 Revisión independiente del patch (hallazgos, resolución o riesgo aceptado) + diff de artefactos sensibles (sin `.env`, SQLite, caches, temporales en el commit); registrar en evidencia
- [X] T025 Ejecutar `graphify update .`, registrar gates agregados y redactar el resumen final en `implementation-evidence.md` (alcance verificado, riesgos pendientes: violaciones de contraste heredadas → specs 011–016; verificación no ejecutada y motivo)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — T001→T002→T003 (T002 y T003 tocan archivos distintos pero T003 depende del fixture base; pueden solaparse T002 ∥ T003)
- **Foundational (Phase 2)**: depende de T001 (evidencia) — **bloquea todas las historias**; rojos T004∥T005∥T006 en paralelo, luego verdes T007∥T008∥T009
- **US1 (Phase 3)**: depende de Phase 2 completa + T003 (fixtures) — es el MVP
- **US2 (Phase 4)**: depende de T011 (suite existente) y T008 (geometry)
- **US3 (Phase 5)**: depende de T011 (suite existente) y T002 (axe-core instalado)
- **US4 (Phase 6)**: depende de T012/T017 (baselines y contraste ya generados) — T019 ∥ T020
- **Polish (Phase 7)**: depende de todas las historias

### User Story Dependencies

- **US1 (P1)**: tras Foundational — sin dependencias de otras historias
- **US2 (P2)**: tras Foundational + suite de US1 — integrable pero testeable por las unitarias sintéticas
- **US3 (P2)**: tras Foundational + suite de US1 — testeable de forma independiente por escenario
- **US4 (P3)**: tras US1/US3 (documenta resultados reales)

### Within Each User Story

- Rojo esperado registrado ANTES de implementar (Capa A unitaria, Capa B sin baselines)
- Evidencia individual por tarea antes de marcar `[x]`; `PARCIAL`/`BLOQUEADO`/`NO VERIFICADO` quedan abiertas
- Commit tras cada tarea o grupo lógico (en la rama `codex/010-visual-testing-infra`)

### Parallel Opportunities

- T002 ∥ T003 (package.json ∥ fixture)
- T004 ∥ T005 ∥ T006 (tres archivos de test distintos)
- T007 ∥ T008 ∥ T009 (tres helpers distintos, cada uno tras su rojo)
- T019 ∥ T020 (README ∥ visual-comparison.md)
- US2 y US3 pueden avanzar en paralelo una vez existe la suite (T011), en archivos distintos si se separa la configuración axe

---

## Parallel Example: Phase 2 (Capa A)

```bash
# Rojos esperados en paralelo (archivos distintos):
Task: "Capa A ROJA visual-scenarios.test.ts (rutas canónicas, anti-globs)"
Task: "Capa A ROJA visual-geometry.test.ts (overlap sintético, acción primaria)"
Task: "Capa A ROJA visual-capture.test.ts (máscaras, tolerancia, rutas de artefacto)"

# Verdes en paralelo tras sus rojos:
Task: "visual-scenarios.ts hasta verde"
Task: "visual-geometry.ts hasta verde"
Task: "visual-capture.ts + visual-evidence.ts hasta verde"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (Setup) + Phase 2 (Foundational) → helpers con Capa A verde
2. Phase 3 (US1) → rojo sin baselines → generación con flag → verde idempotente
3. **STOP and VALIDATE**: 24 capturas idempotentes = infraestructura mínima útil

### Incremental Delivery

1. Setup + Foundational → base
2. US1 → MVP (regresión visual operativa)
3. US2 → invariantes geométricas integradas
4. US3 → contraste medido y registrado
5. US4 → flujo documentado + Capa C
6. Polish → cierre con revisión independiente

---

## Notes

- [P] = archivos distintos, sin dependencias
- Toda referencia visual cita `IMG-UX-XX`; todo requisito cita `FR-XXX`
- La suite visual es serial (`workers: 1`) por la SQLite compartida — no paralelizar corridas Playwright
- Las baselines viven en `tests/e2e/visual/...-snapshots/` (convención Playwright, versionadas); `evidence/actual/` guarda los artefactos de corrida (D3 de research.md)
- El mockup NUNCA es baseline; la aceptación contra mockup es Capa C documental
