# Quickstart: Agente como rail contraíble con chat

## 1. Prerrequisitos

1. Rama `codex/013-agent-rail-chat` con upstream homónimo y base 012.
2. Orden explícita de implementación; generar plan/tasks no la concede.
3. Infraestructura 010, shell 011 y lienzo 012 presentes/versionados.
4. Inventario/hash de 24 baselines antes de cambios UI.
5. Worktree mixto clasificado; `graphify-out/`, caches y cambios ajenos excluidos.

Si falta un gate, registrar `HUMAN_DECISION_REQUIRED` y detenerse.

## 2. Capa A: rojo antes de producto

```bash
npx vitest run \
  app/features/tasks/components/AgentPanel.test.ts \
  app/features/tasks/components/TaskChat.test.ts \
  app/features/tasks/components/TaskWorkspace.test.ts \
  app/features/tasks/composables/useWorkspaceState.test.ts \
  --reporter=verbose
```

Cubrir rail/header/foco/badge, roles/hora/avatar/orden, propuesta completa y
tres decisiones, edit inválido, compositor/adjunto, default/persistencia A/B y
estado conservado al contraer. Ejecutar antes de producto y confirmar rojo por
contrato 013 ausente; import, servidor o fixture roto no es rojo válido.

Después del cambio mínimo, repetir y añadir regresión de dominio:

```bash
npx vitest run \
  app/features/tasks/domain/task-assistant-rules.test.ts \
  app/features/tasks/components/AgentPanel.test.ts \
  app/features/tasks/components/TaskChat.test.ts \
  app/features/tasks/components/TaskWorkspace.test.ts \
  app/features/tasks/composables/useWorkspaceState.test.ts \
  --reporter=verbose
```

## 3. Servidor y E2E serial

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npx nuxi dev --host 127.0.0.1 --port 3005
```

Verificar que el URL sirve este checkout. En otra terminal:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npx playwright test tests/e2e/stage-agent-workspace.spec.ts \
  --workers=1 --reporter=line
```

Cada caso resembra storage. A 1024×768 medir que cambiar scrollTop del stage no
cambia chat y viceversa; a ≤767 conservar tabs existentes.

## 4. Helpers y Capa B

```bash
npx vitest run \
  tests/e2e/helpers/visual-scenarios.test.ts \
  tests/e2e/helpers/visual-geometry.test.ts \
  tests/e2e/helpers/visual-capture.test.ts

TEST_BASE_URL=http://127.0.0.1:3005 \
VISUAL_RUN_MODE=contract npm run test:visual -- --grep "IMG-UX-01|IMG-UX-02" \
  --workers=1 --reporter=line
```

El modo `contract` omite `toHaveScreenshot`: así los ocho estados completan DOM,
ancho condicional, scroll, geometría, primaria y axe sin abortar por pixel diff.

Solo con autorización explícita de captura:

```bash
VISUAL_EVIDENCE_ROOT=specs/013-agent-rail-chat/evidence/actual \
TEST_BASE_URL=http://127.0.0.1:3005 \
VISUAL_RUN_MODE=evidence npm run test:visual -- --grep "IMG-UX-01|IMG-UX-02" \
  --workers=1 --reporter=line
```

El modo `evidence` usa estabilidad/máscaras, escribe ocho ACTUAL y no invoca
`toHaveScreenshot`; por tanto no modifica baselines. `--grep` limita escenarios.

## 5. Gate humano y pruebas negativas

Completar la comparación de ocho ACTUAL con IMG-UX-01/02/03 y clasificar cada
diferencia. Detener en `HUMAN_DECISION_REQUIRED` hasta decisión explícita.

Tras aprobación explícita:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 \
npm run test:visual:update -- --grep "IMG-UX-01|IMG-UX-02" --workers=1 --reporter=line

TEST_BASE_URL=http://127.0.0.1:3005 \
npm run test:visual -- --grep "IMG-UX-01|IMG-UX-02" --workers=1 --reporter=line

VISUAL_SEED_DEFECT=true TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --grep "IMG-UX-01" --workers=1 --reporter=line
VISUAL_SEED_GEOMETRY_DEFECT=true TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --grep "IMG-UX-01" --workers=1 --reporter=line
AXE_SEED_INVALID_RULE=true TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --grep "IMG-UX-01" --workers=1 --reporter=line
```

Revisar/versionar el diff de baselines solo tras la aprobación. Cada comando de
siembra debe fallar por su gate esperado; retirar la siembra y repetir verde.

## 6. Capa C y cierre

Completar `evidence/visual-comparison.md` con ACTUAL, referencia, dimensión,
clasificación, severidad, responsable y decisión humana.

```bash
npm run typecheck
npm run test:unit
TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e -- --workers=1 --reporter=line
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --workers=1 --reporter=line
npm run verify
git diff --check
```

Registrar comando, conteo, exit code y alcance no verificado en
`implementation-evidence.md`. No marcar una tarea ni gate humano por edición,
captura o suite parcial.
