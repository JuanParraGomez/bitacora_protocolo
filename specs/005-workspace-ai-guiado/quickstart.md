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

### Persistence and compatibility

```bash
npx vitest run tests/integration/task-persistence.test.ts
npx vitest run tests/migration/compatibility-store.test.ts
```

Comprobar round-trip de mensajes/evaluaciones, ajustes sin secretos y tareas heredadas con prompts intactos pero ocultos.

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
