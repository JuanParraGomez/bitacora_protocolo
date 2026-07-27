# Quickstart: Verificar la bitácora de iteraciones guiada

## Prerrequisitos

- Dependencias del proyecto instaladas.
- Base de datos de desarrollo o almacenamiento de prueba disponible.

## Datos de prueba cubiertos

| Caso | Datos | Comprobación |
| --- | --- | --- |
| Heredada mínima | `{ id, nombre, directiva }` sin fases enriquecidas | `repairTask` conserva fase/directiva y añade valores seguros. |
| Enriquecida | Análisis, tres criterios etiquetados, iteraciones y prompts editados | Persistencia de tarea e índice sin perder campos anidados. |
| Vacía o parcial | Criterios/iteraciones ausentes o arrays vacíos | Se reparan colecciones y la interfaz mantiene controles utilizables. |
| Caracteres especiales | `<script>`, comillas, saltos de línea y Markdown en comentarios/prompts | Exportación Markdown textual; no se interpreta HTML ejecutable. |
| Fallo recuperable | Lectura/escritura que lanza `offline` o JSON inválido | Se expone `DATABASE_UNAVAILABLE`/`INVALID_LEGACY_VALUE` y se puede reintentar. |

## Recorrido manual repetible

1. Crear una tarea y abrirla.
2. En orientación, registrar el problema, evidencia y análisis; elegir reformularlo, indicar la justificación y comprobar que la formulación vigente se muestra.
3. Avanzar a guía. Verificar el texto que explica propósito, beneficios y utilidad; crear tres criterios con comentario, prioridad, estado e impacto distintos.
4. Guardar, recargar y confirmar que análisis y etiquetas permanecen.
5. Avanzar a ejecución y desplazarse hasta la sección de iteraciones. Agregar dos iteraciones y confirmar que la vista no vuelve al inicio y que cada nueva tarjeta es alcanzable.
6. Rellenar intento, resultado, ajuste y criterios aplicables; guardar y recargar.
7. Avanzar a revisión y comprobar que aparecen los criterios vigentes con casilla y espacio de mejora; registrar al menos una mejora.
8. En cada cajita de prompt, comprobar la presencia del problema vigente, criterios y comentarios aplicables; modificar y guardar desde esa misma cajita. Recargar y verificar la persistencia.
9. Descargar el Markdown y confirmar que el contenido textual no se interpreta como HTML ejecutable.

## Evidencia de accesibilidad y foco

- Las fases exponen encabezados y `aria-labelledby` estables para orientación, guía, ejecución y revisión.
- Cada criterio, iteración, mejora y prompt tiene una etiqueta asociada; los mensajes de guardado usan una región de estado.
- El botón de añadir iteración conserva el foco/visibilidad de la tarjeta nueva y respeta `prefers-reduced-motion`.
- La revisión mantiene casillas y notas de mejora separadas del criterio fuente para que puedan recorrerse con teclado.
- La prueba E2E de guía valida etiquetas, persistencia tras recarga y explicación de propósito, beneficios y utilidad.

## Verificación automatizada mínima

1. Ejecutar las nuevas pruebas de dominio y confirmar el rojo inicial antes de añadir producción.
2. Ejecutar las pruebas afectadas de unidad e integración y comprobar que pasan.
3. Ejecutar el escenario de navegador que inserta iteraciones con desplazamiento y guarda desde cada cajita de prompt.
4. Antes de cerrar, ejecutar `npm run verify` y `npm run verify:e2e`.
