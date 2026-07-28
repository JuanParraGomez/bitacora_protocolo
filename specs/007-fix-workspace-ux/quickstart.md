# Quickstart: Correcciones UX/UI del workspace

## Preconditions

1. Confirmar rama `codex/007-fix-workspace-ux`.
2. Confirmar un unico servidor actual y su URL.
3. No reutilizar resultados de feature 005 o 006 como evidencia de esta feature.
4. Preservar los cambios no relacionados del worktree.

## TDD loop per task

1. Escribir la prueba completa: normal, limite, entrada invalida, fallo/recuperacion y regresion relevante.
2. Ejecutar solo la prueba nueva y registrar que falla por el comportamiento ausente.
3. Implementar el cambio minimo.
4. Repetir la prueba y la suite afectada.
5. Actualizar `tasks.md` solo cuando el comportamiento y sus pruebas esten completos.

## Focused verification

```bash
npx vitest run app/features/tasks/components/TaskIntakeForm.test.ts
npx vitest run app/features/tasks/composables/useWorkspaceState.test.ts
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-ux-audit.spec.ts --reporter=line
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/workspace-overlays.spec.ts tests/e2e/workspace-library.spec.ts tests/e2e/legacy-task-workflows.spec.ts --reporter=line
```

## Acceptance matrix

| Recorrido | Desktop | Tablet | Movil | Teclado |
|---|---:|---:|---:|---:|
| Primera tarea desde proyecto vacio | Si | Si | Si | Si |
| Nueva tarea desde cabecera/sidebar | Si | Si | Si | Si |
| Evaluar, continuar, avanzar y chat | Si | Si | Si | Si |
| Drawer y retorno de foco | No aplica | Revisar | Si | Si |
| Biblioteca y ajustes | Si | Si | Si | Si |
| Renombrado con lista larga | Si | Si | Si | Si |
| Validacion heredada | Si | Si | Si | Si |
| 404, titulos y nombres accesibles | Si | Si | Si | Si |

## Visual evidence

- Usar `auditoria-ux-ui-evidencias/23-home-mobile.png` para reproducir la mezcla sidebar/main.
- Usar `24-new-task-mobile.png` para reproducir clipping del formulario.
- Usar `27-workspace-tareas-heredadas-with-task.png` y `28-workspace-send-not-clickable.png` para controles interceptados.
- Usar `31-workspace-chat-after-send.png` para avisos duplicados.
- Capturar resultados nuevos en viewports CSS exactos; no sobrescribir la evidencia original.

## Aggregate gates

```bash
npm run verify
TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e
```

La feature solo se considera cerrada cuando ambas verificaciones pasan sobre el mismo checkout y servidor actual, o cuando cualquier limitacion restante queda documentada con comando, salida y alcance.
