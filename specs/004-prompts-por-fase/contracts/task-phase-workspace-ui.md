# UI Contract: Área de formulario y prompt por fase

## Scope

Este contrato cubre los componentes de las cuatro fases de una tarea. No modifica rutas ni contratos HTTP.

## Required interaction contract

| Elemento | Contrato observable |
| --- | --- |
| Área de fase | Contiene el encabezado de fase, un área de formulario y un área de prompt asociadas semánticamente. |
| Formulario | Conserva los controles y etiquetas existentes de la fase; aparece antes que el prompt en el orden de lectura. |
| Prompt | Tiene etiqueta única por fase, textarea editable, regeneración, guardado y región de estado. |
| Diseño ancho | Formulario y prompt se disponen en dos columnas legibles del mismo espacio de fase. |
| Diseño estrecho | Las áreas se apilan sin ocultar controles ni alterar el orden de teclado. |
| Cambio de fuente | Cuando el prompt no es personalizado, el texto refleja inmediatamente los valores actuales de los campos que le corresponden. |
| Edición manual | El prompt queda personalizado y deja de actualizarse de manera automática hasta regenerarlo. |
| Regeneración | Sustituye el texto por la composición actual de la fase y reactiva la actualización automática. |

## Accessibility requirements

- Cada textarea de prompt debe mantener una etiqueta asociada y un identificador único.
- Los botones de regenerar y guardar deben conservar nombres accesibles que identifiquen la fase.
- El estado de guardado debe seguir comunicándose mediante una región viva.
- El orden de tabulación sigue formulario, prompt, regenerar y guardar.

## Non-goals

- No se interpreta ni ejecuta el prompt dentro de la aplicación.
- No se agrega un modelo de IA, una petición de red ni un historial de versiones del prompt.
