# Quickstart: Lienzo por etapas con agente IA

## Preconditions

1. Confirmar rama `codex/008-stage-agent-workspace`.
2. Confirmar `.specify/feature.json` apuntando a
   `specs/008-stage-agent-workspace`.
3. Confirmar un único servidor actual y su URL antes de E2E.
4. No reutilizar capturas ni resultados de features 005–007 como evidencia.
5. Preservar cambios no relacionados y no versionar bases de datos, caches o
   secretos.

## TDD loop per behavior

1. Escribir la prueba completa: recorrido normal, límites, entrada inválida,
   fallo/recuperación y regresión.
2. Ejecutarla y registrar el rojo por comportamiento ausente.
3. Implementar el cambio mínimo.
4. Ejecutar prueba enfocada y suite afectada.
5. Registrar evidencia por tarea antes de marcarla completa.

## Reference matrix

| ID | Estado | Viewport |
|---|---|---:|
| IMG-UX-01 | Etapa activa, agente contraído | 1440 × 900 |
| IMG-UX-02 | Etapa y agente activo | 1440 × 900 |
| IMG-UX-03 | Etapa y agente activo tablet | 1024 × 768 |
| IMG-UX-04 | Etapa móvil completa | 390 × 844 |
| IMG-UX-05 | Evaluación bloqueada | 1440 × 900 |
| IMG-UX-06 | Tarea completada | 1440 × 900 |

Resolver siempre el nombre canónico desde
`docs/ux-ui/mockups/rediseño-agente/manifest.md`.

## Planned focused verification

```bash
npx vitest run app/features/tasks/components/workspace-presentation.test.ts
npx vitest run app/features/tasks/components/GuidedPhaseForm.test.ts
npx vitest run app/features/tasks/components/AgentPanel.test.ts
npx vitest run app/features/tasks/components/WorkspacePaneTabs.test.ts
npx vitest run app/features/tasks/components/TaskCompletionSummary.test.ts
npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/stage-agent-workspace.spec.ts --reporter=line
```

Los archivos nuevos son objetivos del plan; no se asume que existan antes de
sus tareas rojas.

## Acceptance journeys

| Recorrido | Desktop | Tablet | Móvil | Teclado |
|---|---:|---:|---:|---:|
| Etapa con agente contraído | Sí | Sí | Sí | Sí |
| Abrir/cerrar agente y conservar contexto | Sí | Sí | Sí | Sí |
| Chat y decisiones de propuesta | Sí | Sí | Sí | Sí |
| Acción contextual en todos sus estados | Sí | Sí | Sí | Sí |
| Bloqueo inline y recuperación | Sí | Sí | Sí | Sí |
| Finalización y resumen idempotente | Sí | Sí | Sí | Sí |
| 320 px y zoom 200 % | Revisar | Revisar | Sí | Sí |

## Visual capture protocol

1. Sembrar la fixture sintética del estado contractual.
2. Abrir la URL exacta con un único servidor inspeccionado.
3. Fijar viewport y escala de página.
4. Esperar hidratación, fuentes y estado determinista.
5. Capturar en `specs/008-stage-agent-workspace/evidence/actual/`.
6. Comparar con la referencia exacta, no con un glob.
7. Registrar diferencias y decisión en `implementation-evidence.md`.

## Regression suites

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test \
  tests/e2e/conversational-workspace.spec.ts \
  tests/e2e/guided-workspace.spec.ts \
  tests/e2e/workspace-library.spec.ts \
  tests/e2e/workspace-overlays.spec.ts \
  --reporter=line
```

## Aggregate gates

```bash
npm run verify
TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e
npm run structure:check
npm run graph:check
```

La feature no se considera cerrada si existe una diferencia crítica/alta,
algún gate disponible falla o la evidencia proviene de otro checkout/servidor.
