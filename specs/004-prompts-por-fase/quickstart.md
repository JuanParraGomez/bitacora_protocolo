# Quickstart: Verificación de formularios y prompts por fase

## Preconditions

- Estar en `codex/004-prompts-por-fase`.
- Instalar las dependencias del repositorio.

## Test-first sequence

1. Añadir primero las pruebas de composición, reparación y navegador descritas en `tasks.md`.
2. Ejecutar las pruebas nuevas y confirmar que fallan por ausencia del prompt de orientación, de la sincronización o de la disposición requerida.
3. Implementar el cambio mínimo y volver a ejecutar las pruebas enfocadas.
4. Ejecutar las suites afectadas y, finalmente, `npm run verify` y `npm run verify:e2e`.

## Manual browser verification

1. Abrir una tarea en cada una de las fases 1–4.
2. Confirmar que el formulario y el prompt se ven lado a lado con espacio suficiente.
3. Cambiar un campo de cada fase y comprobar que su prompt automático se actualiza, sin cambiar los otros.
4. Editar manualmente cada prompt, modificar de nuevo un campo y comprobar que el texto manual no cambia.
5. Regenerar y comprobar que se aplica el estado vigente y se reanuda la actualización automática.
6. Guardar desde una cajita, recargar y comprobar texto y estado de personalización.
7. Repetir a 320 px de ancho y 200% de zoom con navegación de teclado.

## Compatibility verification

1. Abrir una tarea heredada sin datos de prompt de orientación.
2. Comprobar que conserva fase y datos existentes.
3. Guardarla y reabrirla; comprobar que puede editar y guardar el nuevo prompt de orientación.
