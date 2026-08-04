# Quickstart: Shell y navegación del workspace

## 1. Prerrequisitos

1. Rama activa: `codex/011-workspace-shell`.
2. Spec 011 aprobada explícitamente por el usuario; no ejecutar mientras siga
   en `Draft`.
3. Revisión exacta de spec 010 aprobada y su integración Git autorizada; no
   copiar cambios no versionados.
4. Verificar 24 snapshots: 6 IMG-UX × `desktop-large`, `tablet`, `mobile`,
   `mobile-narrow`.
5. Un único servidor Nuxt; pruebas Playwright seriales por almacenamiento
   compartido.

Si falta cualquier artefacto 010, detenerse con `HUMAN_DECISION_REQUIRED`.

## 2. Ciclo TDD Capa A

```bash
npx vitest run app/features/tasks/components/DashboardSidebar.test.ts app/features/tasks/components/WorkspaceHeader.test.ts app/features/tasks/components/workspace-shell-presentation.test.ts --reporter=verbose
```

Primera corrida: rojo por contrato 011 ausente. Después del cambio mínimo:
verde y regresión enfocada de `TaskWorkspace`/estado de workspace.

## 3. Regresión funcional serial

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/conversational-workspace.spec.ts tests/e2e/workspace-ux-audit.spec.ts tests/e2e/workspace-overlays.spec.ts --workers=1 --reporter=line
```

Verifica búsqueda, create/rename, selección, rutas, drawer, Escape/Tab, foco y
overlays sin cambiar persistencia.

## 4. Capa B

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual
```

El cambio de UI debe producir un diff rojo contra la baseline aprobada anterior.
Para generar candidatas, solo después de revisar el rojo:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npm run test:visual:update
```

Revisar los 16 pares principales (IMG-UX-01/02/05/06 × 4 viewports), obtener
aprobación humana y repetir `npm run test:visual` verde sin regeneración.

## 5. Capa C y cierre

Durante autopilot, completar `.codex-autopilot/reports/visual-comparison.md`,
guardar ACTUAL bajo `.codex-autopilot/evidence/actual/` y registrar
aprobada/pendiente/defecto. Tras el cierre automatizable, una tarea humana
autorizada sincroniza la evidencia saneada a los paths finales de la spec.

Gates finales:

```bash
npm run typecheck
npm run test:unit
npm run verify:e2e
npm run test:visual
npm run verify
git diff --check
```

Registrar comando, conteo, exit code y alcance. No marcar tareas humanas de
aprobación visual hasta recibir evidencia explícita.
