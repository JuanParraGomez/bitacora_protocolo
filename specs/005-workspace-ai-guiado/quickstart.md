# Quickstart: Espacio de trabajo guiado por IA

## Preconditions

- Node.js 22.19+.
- Dependencias instaladas desde el lockfile.
- Base de prueba aislada; no usar datos personales ni credenciales.
- Modo de asistencia simulado activo.

## Test-first sequence

Para cada bloque:

1. Escribir casos completos de camino feliz, límites, entrada inválida, fallo/recuperación y regresión.
2. Ejecutar la prueba enfocada y confirmar que falla por el comportamiento todavía ausente.
3. Implementar el cambio mínimo.
4. Ejecutar la prueba enfocada y el conjunto afectado hasta verde.
5. Hacer commit del bloque antes de continuar.

## Registro de implementación (2026-07-27)

- T001: `tests/contract/nuxt-ui-setup.test.ts` creado para validar `@nuxt/ui`, `UApp`, `app/assets/css/main.css` y ausencia de `@ai-sdk/*`/`vueform`.
- T002: la corrida inicial falló por configuración incompleta (`nuxt.config.ts`, `app.vue`, `app.config.ts`, `app/assets/css/main.css`); se dejó evidencia y luego se corrigió.
- T003: se instaló `@nuxt/ui` y `tailwindcss`, se agregó `app.config.ts`, `app/assets/css/main.css` y se envolvió `app.vue` con `<UApp>`.
- T004: validación final ejecutada con resultados verdes:
  - `npx vitest run tests/contract/nuxt-ui-setup.test.ts`
  - `npm run typecheck`
  - `npm run build`

  Ajuste de compatibilidad aplicado:
  - el primer intento de build falló por lock activo y por path de stylesheet (`app/assets/css/main.css`), se resolvió con `alias: { app: \`\${process.cwd()}/app\` }` en `nuxt.config.ts`.

## Focused verification

### Domain and adapter

```bash
npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts
npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts
npx vitest run app/features/tasks/domain/task-rules.test.ts
```

Comprobar:

- reparación de tareas sin `assistant`;
- huella estable por fase y exclusión de prompts;
- aplicación solo a tarea, fase y revisión correctas;
- evaluación obsoleta después de editar;
- `acceptable` imposible con gate cerrado;
- demora, error, respuesta inválida y reintento.

#### T047 (fase 5 verde)

Validación ejecutada el 2026-07-27:

```bash
npx vitest run app/features/tasks/services/mock-workspace-assistant.test.ts app/features/tasks/domain/task-assistant-rules.test.ts app/features/tasks/domain/task-rules.test.ts
npx vitest run tests/integration/task-persistence.test.ts tests/migration/compatibility-store.test.ts
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts
npm run typecheck
```

Resultado:

- 57 pruebas de adaptador y dominio en verde.
- 9 pruebas de persistencia y migración en verde.
- 4 escenarios Playwright del workspace guiado en verde.
- Typecheck de Nuxt en verde tras endurecer casts de fase y actualizaciones tipadas.
- Ajuste aplicado durante la verificación: las evaluaciones guardadas se normalizan al esquema de dominio sin `requestId`, y las reevaluaciones solo reciben historial de la revisión vigente para evitar arrastrar debilidades obsoletas.
- Revisión posterior multiagente atendida: chat y evaluaciones emiten guardado inmediato, el soporte 320 px/200% zoom ya no usa counter-zoom global, `f4.patron` y el fallback de fase 2 están alineados con el schema, y la huella de revisión pasó de 32 a 64 bits síncronos.
- Medición visual final en 320 px/200% zoom: `clientWidth=320`, `scrollWidth=320`, sin overflow horizontal.

#### T050 (fase 6 red)

Validación roja ejecutada el 2026-07-27 antes de implementar ajustes:

```bash
npx vitest run app/features/tasks/services/task-store.test.ts
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts
```

Resultado esperado:

- Persistencia falló porque `readAssistanceSettings` y `writeAssistanceSettings` todavía no existían en `TaskStore`.
- Playwright falló buscando el botón `Ajustes`, confirmando ausencia real del flujo de settings y no un problema de fixtures.

#### T054 (fase 6 verde)

Validación ejecutada el 2026-07-27:

```bash
npx vitest run app/features/tasks/services/task-store.test.ts
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts
npm run typecheck
npm run build
```

Resultado:

- 10 pruebas de persistencia del store en verde, incluyendo default, Codex, DeepSeek, reparación de payload inválido y eliminación de campos tipo secreto.
- 5 escenarios Playwright del workspace guiado en verde, incluyendo apertura/cierre de Ajustes, opciones exactas, explicación diferida, persistencia tras recarga y ausencia de controles de credenciales.
- Typecheck de Nuxt en verde.
- Build de producción en verde.
- Ajuste aplicado durante E2E: `Ajustes` conserva el orden de teclado previo del workspace y el texto del modal evita etiquetas que puedan confundirse con campos de credenciales.
- Revisión multiagente atendida: `Ajustes` volvió a ser accesible por teclado, el E2E inicializa la preferencia global antes de navegar y el diálogo atrapa el foco con Tab/Shift+Tab.

#### T008 (fase fundacional red)

```bash
npx vitest run app/features/tasks/domain/task-assistant.schema.test.ts
npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts
```

Estado esperado en esta etapa: las pruebas pasaron al implementar `task-assistant.schema.ts` y `task-assistant-rules.ts`.

#### T055-T058 (fase 7 accesibilidad, seguridad y migración)

Validación roja ejecutada el 2026-07-27 antes de los ajustes de polish:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts
npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts
npx vitest run tests/migration/compatibility-store.test.ts
```

Resultado rojo esperado:

- Playwright falló por ausencia de label visible del composer y cue textual no dependiente de color.
- Migración falló por fixtures históricos ausentes y luego por reparación incompleta de `assistant` corrupto al llamar `repairTask()` directamente.
- Las regresiones de reglas para prompts inertes y updates malformados ya estaban protegidas por el parser cerrado.

Validación verde posterior:

```bash
TEST_BASE_URL=http://127.0.0.1:3005 npx playwright test tests/e2e/guided-workspace.spec.ts
npx vitest run app/features/tasks/domain/task-assistant-rules.test.ts
npx vitest run app/features/tasks/domain/task-assistant.schema.test.ts app/features/tasks/domain/task-assistant-rules.test.ts
npx vitest run app/features/tasks/services/task-store.test.ts tests/integration/task-persistence.test.ts
npx vitest run tests/migration/compatibility-store.test.ts
```

Resultado:

- 7 escenarios Playwright del workspace guiado en verde, incluyendo accesibilidad, foco de overlays y HTML tratado como texto.
- 15 pruebas de reglas del asistente en verde.
- 25 pruebas de schema/reglas en verde.
- 15 pruebas de store/persistencia en verde.
- 5 pruebas de migración en verde con fixtures históricos generados.
- Ajustes aplicados: label visible del composer, cue textual `Paso actual`, `repairTask()` repara `assistant` corrupto directamente y `AssistanceSettings.schemaVersion` queda cerrado a `1`.

#### T060 (manual polish check)

Validación manual reproducible ejecutada el 2026-07-27 con Playwright contra `http://127.0.0.1:3005`:

```bash
node <<'NODE'
# script local de inspección: seed de tarea con chat histórico, desktop, 320px/200%, teclado, modal y slideover
NODE
```

Resultado:

- Desktop: navegación, chat central y formulario guiado visibles.
- Chat histórico: mensajes anteriores de usuario y asistente visibles como texto.
- Teclado: orden `tarea activa -> Ajustes -> chat -> formulario` confirmado.
- Modal: `Ajustes` abre/cierra y restaura foco al botón.
- Mobile 320 px con zoom 200%: `Cuestionario` abre el slideover, Escape restaura foco y no hay overflow horizontal.

### Persistence and compatibility

```bash
npx vitest run tests/integration/task-persistence.test.ts
npx vitest run tests/migration/compatibility-store.test.ts
```

Comprobar round-trip de mensajes/evaluaciones, ajustes sin secretos y tareas heredadas con prompts intactos pero ocultos.

Estado esperado en esta etapa: las pruebas deben fallar en persistencia de `assistant`
hasta antes de la integración del mapa de persistencia.  
Con `app/features/tasks/services/task-store.ts` actualizado, ahora pasan en verde con:

- `assistant` agregado con reparación si falta, sin perder prompts heredados;
- `assistant` sin secretos y con modo persistente (`codex`/`deepseek`);
- tolerancia a JSON malformado y compatibilidad no destructiva.

### Browser

```bash
npx playwright test tests/e2e/nuxt-task-workflows.spec.ts
```

Comprobar:

- tres regiones en escritorio;
- tareas activas y completadas, Nueva tarea y Ajustes;
- Codex/DeepSeek persistidos sin credenciales;
- chat, sugerencias, envío, error y reintento;
- actualizaciones correctas del formulario;
- ciclo Evaluar, corregir, reevaluar y Continuar;
- aceptación desactualizada tras editar;
- cuatro formularios completos sin `PromptBox`;
- móvil a 320 píxeles, zoom 200%, slideover y navegación por teclado;
- foco restaurado y estados anunciados por texto.

## Aggregate verification

```bash
npm run verify
npm run verify:e2e
```

Ninguna tarea se marca completa si falla typecheck, pruebas, arquitectura, estructura, grafo, build o navegador.

Evidencia final ejecutada el 2026-07-27:

```bash
npm run structure:check
npm run graph:check
npm run structure
npm run graph:update
npm run verify:e2e
npm run verify
```

Resultados:

- `npm run structure:check` y `npm run graph:check` detectaron evidencia desactualizada antes de regenerar.
- `npm run structure` actualizó `docs/architecture/STRUCTURE.md` y `docs/architecture/structure.json`.
- `npm run graph:update` actualizó la evidencia Graphify local configurada en `graphify-out/`; el directorio quedó des-ignorado para que pueda incluirse en el próximo commit.
- `npm run verify:e2e` quedó en verde con 27 pruebas Playwright.
- `npm run verify` quedó en verde con unit, contract, migration, integration, structure, graph, typecheck y build.
- La salida de integración incluyó diagnósticos esperados de fixtures Graphify no actuales o ausentes, pero la suite terminó correctamente.

## Manual visual check

1. Abrir una tarea activa en escritorio y comparar jerarquía, espaciado y distribución con la referencia aprobada.
2. Redimensionar sidebar y paneles; confirmar mínimos legibles y ausencia de superposición.
3. Recorrer toda la vista solo con teclado.
4. Abrir y cerrar Ajustes y Cuestionario; confirmar captura y restauración de foco.
5. Cambiar a 320 píxeles y zoom 200%; completar una iteración sin perder información.
6. Mantener el chat desplazado hacia mensajes anteriores y recibir uno nuevo; confirmar que no se fuerza un salto destructivo.

## Guided usability check

Con el flujo completo y los datos de demostración:

1. Reclutar 10 participantes que no hayan usado esta versión.
2. Pedirles localizar dónde conversar, dónde completar respuestas y cómo reconocer que pueden continuar, sin indicar las regiones.
3. Registrar resultados anonimizados en `usability-results.md`.
4. La salida cumple SC-009 cuando al menos 9 de 10 identifican correctamente las tres acciones.
5. Si no cumple, registrar los puntos de confusión y crear tareas de corrección antes de declarar la feature terminada.
