# Quickstart: Lienzo de etapa como formulario protagonista

## 1. Prerrequisitos

1. Rama activa `codex/012-stage-canvas-form`, basada en shell 011 `4e0fbff`.
2. Spec 012 aprobada explícitamente; no implementar mientras siga `Draft`.
3. Infraestructura visual 010 (`68498d5`) y snapshots versionados presentes.
4. Hash/inventario previo de las baselines relevantes; deuda T007/T008 de 011
   registrada como histórica, no como trabajo 012.
5. Un servidor Nuxt en puerto explícito; Playwright serial.

Si falta un gate, registrar `HUMAN_DECISION_REQUIRED` y detenerse.

## 2. Capa A: rojo antes de producto

```bash
npx vitest run app/features/tasks/components/StageTextField.test.ts app/features/tasks/components/guided-phase-form.test.ts app/features/tasks/components/GuidedPhaseForm.test.ts app/features/tasks/components/TaskWorkspace.test.ts --reporter=verbose
```

El primer resultado debe fallar por el contrato 012 ausente: orden, contadores,
dirty manual, meta/Atrás o footer. Guardar comando, conteo, exit code y causa.
Un error de fixture/importación no constituye rojo válido.

Después de cada cambio mínimo, repetir el mismo comando y las pruebas de los
cuatro componentes de fase afectados.

## 3. E2E funcional serial

Con un único servidor ya iniciado:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --workers=1 --reporter=line
```

Cubrir las cuatro fases: escribir produce un único `Cambios sin guardar`, no
persiste automáticamente, éxito limpia el pendiente, fallo preserva valores y
permite reintentar.

## 4. Capa B

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual -- --grep "IMG-UX-01|IMG-UX-04"
```

La primera corrida posterior al cambio debe producir diff rojo frente a la
baseline aprobada anterior, mientras geometría/axe siguen siendo gates. Para
generar candidatas, solo con autorización explícita:

```bash
VISUAL_EVIDENCE_ROOT=specs/012-stage-canvas-form/evidence/actual \
VISUAL_EVIDENCE_CASES='IMG-UX-01:desktop-large,IMG-UX-01:tablet,IMG-UX-01:mobile,IMG-UX-01:mobile-narrow,IMG-UX-04:mobile' \
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update -- --workers=1 --reporter=line
```

El comando revalida/actualiza candidatas para la matriz global, porque el canvas
también aparece en otros escenarios, pero `VISUAL_EVIDENCE_CASES` copia al
destino 012 únicamente IMG-UX-01 en cuatro viewports y el ACTUAL canónico
IMG-UX-04 a 390×844. Los demás diffs siguen sujetos a revisión humana. Tras
aprobación, repetir sin update y exigir verde idempotente.

## 5. Capa C y cierre

Completar `specs/012-stage-canvas-form/evidence/visual-comparison.md` con enlaces
a ACTUAL, referencia, diferencia, clasificación y responsable. No marcar la
aprobación humana sin respuesta explícita.

```bash
npm run typecheck
npm run test:unit
npm run verify:e2e
npm run test:visual
npm run verify
git diff --check
```

Registrar comando exacto, conteo, exit code y alcance no verificado en
`implementation-evidence.md`. Revisar staged diff para excluir bases SQLite,
`graphify-out/`, caches, resultados temporales y cambios ajenos.
