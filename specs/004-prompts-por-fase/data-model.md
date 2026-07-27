# Data Model: Formularios y prompts sincronizados por fase

## Task (aggregate existente)

No se crean claves de almacenamiento ni entidades externas. La tarea mantiene los cuatro objetos `f1` a `f4`.

| Fase | Datos de prompt | Fuente de datos de su prompt | Compatibilidad |
| --- | --- | --- | --- |
| F1 orientación | `promptOrientacion`, `promptOrientacionPersonalizado` | Linaje, confirmación, análisis de problema y directiva | Nuevos campos con texto vacío y `false` al reparar |
| F2 guía | `promptGuia`, `promptGuiaPersonalizado` | Formulación vigente, decisión, alcance, no-objetivos, pasos, predicciones y criterios | Campos ya existentes |
| F3 ejecución | `promptEjecucion`, `promptEjecucionPersonalizado` | Contexto vigente, criterios, iteraciones y comprobaciones | Campos ya existentes |
| F4 revisión | `promptAar`, `promptAarPersonalizado` | Contexto vigente, confrontaciones, cambio, título y mejoras de criterios | Campos ya existentes |

## State transition: prompt synchronization

1. Una tarea nueva o reparada inicia cada marca de personalización en `false`.
2. Si cambia un campo fuente y la marca es `false`, se recalcula y asigna el texto de la misma fase.
3. Si la persona modifica el textarea, la marca pasa a `true` y se conserva el texto escrito.
4. Si la persona selecciona regenerar, se calcula el texto con el estado actual y la marca vuelve a `false`.
5. El guardado de la tarea persiste tanto el texto como la marca; una reapertura recupera el mismo estado.

## Validation rules

- Todos los prompts son cadenas de texto; los datos de usuario se interpolan como texto legible y no se convierten a HTML ejecutable.
- La reparación de una tarea existente no cambia su número de fase, directiva, análisis, criterios, iteraciones ni revisiones conocidos.
- Un prompt personalizado no puede ser actualizado implícitamente por un cambio de otro campo o de otra fase.
