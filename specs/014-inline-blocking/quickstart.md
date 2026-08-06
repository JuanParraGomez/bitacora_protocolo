# Quickstart: Estado de bloqueo con errores inline y recuperación

## 1. Prerrequisitos

1. Rama `codex/014-inline-blocking` con upstream homónimo.
2. Orden explícita de implementación; generar plan/tasks no la concede.
3. Specs 010–013 presentes/versionadas y fronteras 012/013 preservadas.
4. Inventario/hash de las 24 baselines antes de cambios UI.
5. Worktree mixto clasificado; Graphify/caches/SQLite/cambios ajenos excluidos.

Si falta un gate, registrar `HUMAN_DECISION_REQUIRED` y detenerse.

## 2. Capa A: rojo de derivación

```bash
npx vitest run \
  app/features/tasks/components/workspace-presentation.test.ts \
  app/features/tasks/components/EvaluationFeedback.test.ts \
  --reporter=verbose
```

Cubrir: dos motivos canónicos→Análisis/Criterio, deduplicación, desconocido,
vacío, exclusión weaknesses/recommendations, stale, fallo inicial, fallo de
reevaluación y acceptable. Ejecutar antes de producto y confirmar que falla por
el contrato 014 ausente.

## 3. Capa A: rojo de UI e integración

```bash
npx vitest run \
  app/features/tasks/components/StageFieldIssues.test.ts \
  app/features/tasks/components/StageTextField.test.ts \
  app/features/tasks/components/GuidedPhaseForm.test.ts \
  app/features/tasks/components/AgentPanel.test.ts \
  app/features/tasks/components/TaskWorkspace.test.ts \
  --reporter=verbose
```

Cubrir banner/conteo/lista, inline dentro del bloque, ARIA, foco, badge rail y
header, una primaria, limpieza sin reload y conservación ante fallo. Tras el
cambio mínimo, repetir ambas suites y las regresiones de rules.

## 4. Servidor y E2E serial

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npx nuxi dev --host 127.0.0.1 --port 3005
```

En otra terminal, tras comprobar que el URL sirve este checkout:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npx playwright test tests/e2e/stage-agent-workspace.spec.ts \
  --workers=1 --reporter=line
```

Cada caso resembra storage. Verificar bloqueo→agente→reevaluación y que móvil
reutiliza el pane actual.

## 5. Capa B y evidencia

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
VISUAL_RUN_MODE=contract npm run test:visual -- --grep "IMG-UX-05" \
  --workers=1 --reporter=line
```

El modo `contract` debe completar los cuatro viewports con proximidad DOM,
solapes, overflow, primaria, foco y axe, sin invocar comparación de baseline.

Solo con autorización de captura:

```bash
VISUAL_EVIDENCE_ROOT=specs/014-inline-blocking/evidence/actual \
TEST_BASE_URL=http://127.0.0.1:3005 \
VISUAL_RUN_MODE=evidence npm run test:visual -- --grep "IMG-UX-05" \
  --workers=1 --reporter=line
```

Debe escribir cuatro ACTUAL sin modificar baselines.

## 6. Gate humano y baseline

Completar `evidence/visual-comparison.md` por jerarquía, contenido, geometría,
interacción, responsive y accesibilidad. Detener en `HUMAN_DECISION_REQUIRED`.

Tras aprobación explícita:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npm run test:visual:update -- --grep "IMG-UX-05" --workers=1 --reporter=line

TEST_BASE_URL=http://127.0.0.1:3005 \
npm run test:visual -- --grep "IMG-UX-05" --workers=1 --reporter=line
```

Revisar el diff de cuatro imágenes y repetir sin update hasta verde.

## 7. Cierre

```bash
npm run typecheck
npm run test:unit
TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e -- --workers=1 --reporter=line
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --workers=1 --reporter=line
npm run verify
git diff --check
```

Registrar cada comando, alcance, conteo y exit code en
`implementation-evidence.md`. Actualizar Graphify, ejecutar revisión
independiente y no cerrar tareas humanas por inferencia.
