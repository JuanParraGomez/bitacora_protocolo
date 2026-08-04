# Implementation Plan: Infraestructura de pruebas visuales del workspace

**Branch**: `codex/010-visual-testing-infra` | **Date**: 2026-08-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-visual-testing-infra/spec.md`

## Summary

Crear la capa de regresión visual del workspace con agente **sin tocar UI**:
helpers Playwright de captura determinista (espera estable, máscaras,
animaciones off, `toHaveScreenshot` al 1%), extensión aditiva de los fixtures
existentes, verificadores de invariantes geométricas (cero solapes, una acción
primaria), contraste con `@axe-core/playwright`, scripts npm
`test:visual`/`test:visual:update`, suite
`tests/e2e/visual/stage-agent-workspace.visual.spec.ts` para los 6 escenarios
IMG-UX-01…06 × 4 viewports, y documentación del flujo de baselines con la
regla "el mockup nunca es baseline". Decisiones técnicas detalladas en
[research.md](research.md) (D1–D10).

## Technical Context

**Language/Version**: TypeScript 5.9 / Node (ESM, `"type": "module"`)

**Primary Dependencies**: `@playwright/test ^1.62.0` (existente), `vitest ^4.1.10` (existente), `@axe-core/playwright` (nueva, solo devDependency — verificado que no existe en `package.json` al 2026-08-04)

**Storage**: N/A (no se toca SQLite; la suite siembra datos vía el patrón `seedWorkspace` existente)

**Testing**: Vitest (Capa A, lógica pura de helpers) + Playwright (Capa B, suite visual serial `workers: 1`)

**Target Platform**: ejecución local macOS/Linux contra `TEST_BASE_URL` o `http://127.0.0.1:3005`

**Project Type**: infraestructura de pruebas sobre app web Nuxt existente

**Performance Goals**: suite visual completa (24 capturas + invariantes + contraste) < 10 min en local (SC-006)

**Constraints**: prohibido modificar `app/`, rutas y persistencia (FR-014); baselines solo con flag explícito `--update-snapshots` (FR-008); misma SQLite compartida ⇒ ejecución serial

**Scale/Scope**: 6 escenarios canónicos × 4 viewports = 24 capturas; 5 helpers nuevos; 1 suite visual; 1 fixture extendido

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Scoped Graphify query/path is recorded in `spec.md` (query del 2026-08-04,
      entradas, exclusiones `app/**`/`server/**`/`data/**`, riesgos documentados).
- [x] Acceptance matrix assigns stable `AC-001`…`AC-010`, verification method,
      responsible task, evidence anchor, and verifiable status.
- [x] `implementation-evidence.md` defined; tasks plan red/green, commands,
      dates, exit codes, scope, status (ver Verification and Evidence Plan).
- [x] UI/data/AI evidence: UI aplica (capturas + contraste por viewport);
      datos/contratos/migraciones N/A; IA N/A salvo regla documental "mockup
      nunca es baseline" (mockups son imágenes IA).
- [x] Closure: revisión independiente, diff de artefactos sensibles, gates
      agregados (`npm run verify`, `verify:e2e`, `test:visual`), `graphify update .`,
      resumen final — planeado en sección de cierre del spec.

**Post-design re-check**: sin violaciones. No requiere Complexity Tracking.

## Verification and Evidence Plan *(mandatory)*

**Evidence file**: `specs/010-visual-testing-infra/implementation-evidence.md`

| Evidence area | Required method | Responsible tasks | Completion condition |
|---------------|-----------------|-------------------|----------------------|
| TDD Capa A | Vitest en rojo (helpers inexistentes) antes de implementar; verde tras cambio mínimo | T002–T005 | Comando, fecha ISO, exit code, rojo esperado y verde registrados por tarea |
| TDD Capa B | Suite visual roja sin baselines → generación con flag → segunda corrida verde e idempotente | T006–T008 | Las 3 corridas registradas con exit codes |
| Regressions | `npm run test:unit`, `verify:e2e` (suites existentes intactas), typecheck | T009 | Resultados y alcance excluido registrados |
| UI scope | 24 capturas `ACTUAL-IMG-UX-XX`, contraste axe-core por escenario, `evidence/visual-comparison.md` con brecha "pendiente de rediseño" | T007, T008, T010 | Artefactos enlazados en evidencia |
| Closure | Revisión independiente del patch, diff de artefactos sensibles, `graphify update .`, gates agregados | T011 | Hallazgos y riesgos aceptados enlazados |

## Project Structure

### Documentation (this feature)

```text
specs/010-visual-testing-infra/
├── spec.md                          # /speckit-specify
├── plan.md                          # este archivo
├── research.md                      # Phase 0 (decisiones D1–D10)
├── checklists/requirements.md       # validación de spec
├── tasks.md                         # Phase 2 (/speckit-tasks)
├── implementation-evidence.md       # evidencia por tarea (se crea en T001)
└── evidence/
    ├── actual/ACTUAL-IMG-UX-XX.png  # artefactos de corrida
    └── visual-comparison.md         # Capa C: brecha vs mockups
```

Nota: `data-model.md`, `contracts/` y `quickstart.md` se omiten por decisión
explícita del usuario (infraestructura interna de tests: sin API externa ni
modelo de datos nuevo; las entidades están descritas en spec.md y las
decisiones en research.md).

### Source Code (repository root)

```text
tests/
├── e2e/
│   ├── helpers/
│   │   ├── workspace-ux.ts                  # existente (se reutiliza WORKSPACE_UX_VIEWPORTS)
│   │   ├── visual-scenarios.ts              # NUEVO: catálogo IMG-UX-01…06 desde el manifest + rechazo de globs
│   │   ├── visual-capture.ts                # NUEVO: espera estable, máscaras, captura toHaveScreenshot
│   │   ├── visual-geometry.ts               # NUEVO: intersección de cajas, conteo de acción primaria (puro)
│   │   ├── visual-evidence.ts               # NUEVO: copia de artefactos a specs/010/evidence/actual/
│   │   ├── visual-scenarios.test.ts         # NUEVO (Capa A, Vitest)
│   │   ├── visual-geometry.test.ts          # NUEVO (Capa A, Vitest)
│   │   └── visual-capture.test.ts           # NUEVO (Capa A, Vitest: máscaras/rutas sin navegador)
│   └── visual/
│       ├── stage-agent-workspace.visual.spec.ts            # NUEVO (Capa B)
│       └── stage-agent-workspace.visual.spec.ts-snapshots/ # baselines versionadas (convención Playwright)
├── fixtures/tasks/
│   └── stage-agent-workspace.ts             # EXTENSIÓN aditiva (escenarios IMG-UX, bloqueo 2 correcciones)
└── e2e/README.md                            # NUEVO: flujo de baselines (o docs/ux-ui/)

package.json                                 # scripts test:visual / test:visual:update + @axe-core/playwright (dev)
```

**Structure Decision**: adiciones exclusivamente bajo `tests/` + scripts de
`package.json` + documentación; cero cambios en `app/`, `server/`, `shared/`,
`data/` (FR-014). Se reutilizan `WORKSPACE_UX_VIEWPORTS` (D4), el patrón
`seedWorkspace` de `workspace-ux-audit.spec.ts` (D5) y el `playwright.config.ts`
serial existente (D9).

## Diseño por escenario (matriz ID → fixture → invariantes)

| Escenario | Estado del fixture | Viewport foco | Invariantes clave |
|-----------|-------------------|---------------|-------------------|
| IMG-UX-01 | `phase1` (etapa activa, agente contraído) | 1440×900 | 1 acción primaria, sin solapes |
| IMG-UX-02 | `phase2` + `proposalTurn` (agente expandido, conversación + propuesta) | 1440×900 | agente como columna, compositor sin cubrir lienzo |
| IMG-UX-03 | mismo dataset IMG-UX-02 | 1024×768 | drawer cerrado, scroll independiente |
| IMG-UX-04 | `phase1` (plano móvil Etapa) | 390×844 (+320px) | un solo plano, selector Etapa/Agente |
| IMG-UX-05 | NUEVO: bloqueo con 2 correcciones (extensión fixture) | 1440×900 | errores junto a causa, única primaria "Reevaluar etapa" |
| IMG-UX-06 | `phase4` (completada 4/4) | 1440×900 | única primaria "Volver a tareas" |

Los 4 viewports se aplican a los 6 escenarios con el mismo dataset por
escenario (FR-003); el viewport foco indica el mockup de referencia conceptual.
320px usa IMG-UX-04 como referencia (Assumptions del spec).

## Riesgos y mitigaciones

- **Flakiness por datos/horas**: máscaras en regiones dinámicas + timestamps
  fijos del fixture (`baseTimestamp` ya fijo) + `waitForStableUi` (D8).
- ** axe-core falla en el estado actual**: las violaciones se registran como
  excepciones conocidas en `evidence/visual-comparison.md`; el gate estricto lo
  activan las specs 011–016 (D7).
- **Baselines iniciales malinterpretadas**: la regla "mockup nunca es baseline"
  y el estado "pendiente de rediseño" quedan en documentación y Capa C (FR-010/013).
- **Rotura de suites e2e existentes** al extender el fixture: extensión
  aditiva + `verify:e2e` como gate (T009).

## Cierre (previsto en T011)

Revisión independiente del patch, diff de artefactos sensibles (sin `.env`,
SQLite, caches), gates: `npm run test:unit` + typecheck + `verify:e2e` +
`test:visual` (verde idempotente), `graphify update .`, y resumen final de
riesgos pendientes (violaciones de contraste heredadas → specs 011–016).
