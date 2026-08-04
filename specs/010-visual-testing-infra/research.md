# Research: Infraestructura de pruebas visuales del workspace (spec 010)

**Date**: 2026-08-04
**Branch**: `codex/010-visual-testing-infra`

Todas las incógnitas del Technical Context se resolvieron inspeccionando el
repositorio (no quedan NEEDS CLARIFICATION).

## Decisiones

### D1. Comparación de capturas: `toHaveScreenshot()` nativo de Playwright

- **Decision**: usar `expect(page).toHaveScreenshot()` con
  `maxDiffPixelRatio: 0.01`, `animations: 'disabled'` y `mask` para regiones
  dinámicas.
- **Rationale**: `@playwright/test ^1.62.0` ya está en devDependencies;
  `toHaveScreenshot` cubre generación de baseline (`--update-snapshots`),
  diff y artefactos actual/expected/diff sin dependencias extra.
- **Alternatives considered**: `pixelmatch`/`looks-same` manuales (más código
  que mantener, mismo resultado); Percy/Chromatic (servicio externo, viola
  simplicidad operacional y ejecución local).

### D2. Actualización de baselines solo con flag explícito

- **Decision**: script `test:visual` = `playwright test tests/e2e/visual` en
  modo verificación; actualización mediante
  `test:visual:update` = `playwright test tests/e2e/visual --update-snapshots`.
- **Rationale**: Playwright ya implementa el flag explícito
  (`--update-snapshots`); separar los dos scripts npm hace imposible regenerar
  baselines por accidente en una corrida de verificación (FR-008, SC-005).
- **Alternatives considered**: variable de entorno propia (redundante con el
  flag nativo); aprobación interactiva (no automatizable).

### D3. Ubicación de baselines y artefactos

- **Decision**: baselines en
  `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/`
  (convención nativa de Playwright, versionadas en git); artefactos de corrida
  copiados a `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-XX.png`
  por un helper post-captura.
- **Rationale**: cumple la convención de rutas pedida (FR-008) sin pelear con
  el snapshot resolver de Playwright; las baselines versionadas permiten
  revisión por diff en PR.
- **Alternatives considered**: forzar `snapshotPathTemplate` a `specs/010/...`
  (rompe la convención nativa y complica múltiples viewports); guardar solo en
  `test-results/` (efímero, no versionable).

### D4. Viewports: reutilizar `WORKSPACE_UX_VIEWPORTS` existente

- **Decision**: reutilizar la constante de `tests/e2e/helpers/workspace-ux.ts`
  (1440×900, 1024×768, 390×844, 320×667) en lugar de duplicarla.
- **Rationale**: coincide 1:1 con los 4 viewports pedidos por la spec
  (320px = `mobile-narrow` 320×667); evita dos fuentes de verdad.
- **Alternatives considered**: nueva constante en el helper visual (duplicación).

### D5. Fixtures: extensión aditiva de `stage-agent-workspace.ts`

- **Decision**: añadir entradas nuevas al fixture existente (agente expandido
  con conversación + propuesta usando `stageAgentWorkspaceWorkspaceState.proposalTurn`;
  bloqueo con 2 correcciones vía evaluación con issues; dataset único por
  escenario IMG-UX) sin modificar las entradas actuales.
- **Rationale**: el fixture ya cubre etapa activa por fase, estado completado
  4/4 (`phase4`) y turno de propuesta; la extensión aditiva no rompe
  `workspace-ux-audit.spec.ts` ni `conversational-workspace.spec.ts`.
- **Alternatives considered**: fixture nuevo separado (duplica builders y
  diverge del patrón de siembra `seedWorkspace` existente).

### D6. Invariantes geométricas: bounding boxes + selectores de regiones

- **Decision**: helper puro `assertNoOverlap(regions: NamedBox[])` y
  `countPrimaryActions(page)` en `tests/e2e/helpers/`, testeable en Vitest con
  cajas sintéticas (Capa A); en la suite se alimentan con
  `locator.boundingBox()` de las regiones (navegación, lienzo, agente,
  compositor, acciones).
- **Rationale**: la lógica de intersección de rectángulos es pura y unit-testeable
  sin navegador; sigue el patrón de `hasHorizontalOverflow` ya existente.
- **Alternatives considered**: evaluación en página con `elementFromPoint`
  (ya cubierta por `expectTopHitTarget`, complementaria pero no verifica
  intersección par/por/par); assertions solo visuales (no detectan solapes
  por debajo de la tolerancia de píxeles).

### D7. Contraste: `@axe-core/playwright`

- **Decision**: añadir `@axe-core/playwright` como devDependency (no existe en
  `package.json` — verificado 2026-08-04) y ejecutar `AxeBuilder` con las
  reglas `color-contrast` en los 6 escenarios.
- **Rationale**: es la integración oficial de axe-core para Playwright; mapea
  directo a WCAG 4.5:1 (texto) y 3:1 (componentes, regla
  `color-contrast-enhanced`/checks de UI según configuración).
- **Alternatives considered**: `axe-core` inyectado manualmente con
  `page.addScriptTag` (más frágil, mismo motor); pa11y (proceso aparte, rompe
  la unidad de la suite).
- **Nota**: las violaciones del estado actual se registran como hallazgos en
  evidencia (Capa C) y NO bloquean la suite hasta que 011–016 los corrijan —
  la regla se evalúa y reporta; el umbral de fallo por contraste se activa con
  una lista de excepciones conocidas registrada en
  `evidence/visual-comparison.md`.

### D8. Espera estable antes de captura

- **Decision**: helper `waitForStableUi(page)` que combina
  `page.waitForLoadState('networkidle')`, `document.fonts.ready` y
  `animations: 'disabled'` en la captura.
- **Rationale**: el workspace carga datos vía API (seed por SQLite) y fuentes;
  sin espera estable la idempotencia (SC-002) es inalcanzable.
- **Alternatives considered**: `waitForTimeout` fijo (frágil, lento);
  solo `animations: 'disabled'` (no cubre carga de datos).

### D9. Ejecución serial y servidor

- **Decision**: la suite visual usa el mismo `playwright.config.ts`
  (`workers: 1`, `baseURL` `TEST_BASE_URL` o `127.0.0.1:3005`) y vive bajo
  `tests/e2e/visual/`.
- **Rationale**: la config actual ya serializa por la SQLite compartida;
  `testDir: './tests/e2e'` ya recoge el subdirectorio `visual/` sin cambios de
  configuración.
- **Alternatives considered**: proyecto Playwright separado con
  `playwright.visual.config.ts` (innecesario mientras la ejecución sea serial;
  revisitable si la suite crece).

### D10. Vitest para la Capa A

- **Decision**: las pruebas unitarias de los helpers viven en
  `tests/e2e/helpers/*.test.ts` pero se ejecutan con Vitest importando solo la
  lógica pura (sin `@playwright/test` runtime de navegador).
- **Rationale**: `npm run test:unit` ya corre `vitest run app tests/migration`;
  se añade `tests/e2e/helpers` al include de la corrida o un script dedicado;
  la lógica pura (intersección, rutas canónicas, conteo) no necesita navegador.
- **Alternatives considered**: tests de helpers solo dentro de Playwright
  (mezcla niveles, más lentos, difícil sembrar cajas sintéticas).
