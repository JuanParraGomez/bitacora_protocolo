# Data Model: Bitácora de iteraciones guiada

## Task (extensión compatible)

La tarea continúa siendo el agregado almacenado bajo su clave existente. Los nuevos campos son opcionales al leer registros heredados y se materializan con valores seguros al repararlos.

| Área | Campo | Reglas y propósito |
|---|---|---|
| Orientación | `analisisProblema` | Problema detectado, evidencia, análisis, decisión (`pendiente`, `mantener` o `reformular`), justificación y formulación vigente. Una decisión final es necesaria para habilitar la guía. |
| Guía | `criterios[]` | Colección de criterios identificables con texto, comentario revisado, prioridad, estado e impacto. |
| Guía | `promptGuia` | Prompt editable derivado del análisis y criterios vigentes. |
| Ejecución | `iteraciones[]` | Cada elemento conserva identificador, intento, resultado, ajuste y referencias a criterios aplicables. |
| Ejecución | `promptEjecucion` | Prompt editable derivado del análisis, criterios/comentarios e iteraciones pertinentes. |
| Revisión | `mejorasCriterios[]` | Seguimiento derivado por identificador de criterio: confirmado y nota de mejora. No duplica el texto ni las etiquetas del criterio. |
| Revisión | `promptAar` | Prompt editable de revisión derivado de todos los datos pertinentes. |

Cada prompt mantiene además su condición de sincronización: al crearse o regenerarse queda alineado con sus fuentes; si se edita manualmente se marca como personalizado y se conserva hasta una regeneración explícita. Regenerar sustituye solo ese texto por una composición de los datos vigentes.

## ProblemAnalysis

| Campo | Validación |
|---|---|
| `problemaDetectado` | Texto, puede iniciar vacío y debe completarse para cerrar orientación. |
| `evidencia` | Texto o lista normalizada de hallazgos. |
| `analisis` | Texto que relaciona evidencia y problema. |
| `decision` | `pendiente`, `mantener` o `reformular`. Una tarea heredada en orientación se repara como `pendiente`; solo las dos últimas permiten cerrar la orientación. |
| `justificacion` | Texto requerido al adoptar una decisión. |
| `problemaVigente` | Derivado del problema detectado al mantener o indicado al reformular; es la fuente para guía y prompts. |

## GuidedCriterion

| Campo | Validación |
|---|---|
| `id` | Identificador estable y único dentro de la tarea; permite vincular iteraciones y mejoras. |
| `texto` | Criterio legible. |
| `comentario` | Comentario revisado o aclaración. |
| `prioridad` | Vocabulario cerrado: `alta`, `media`, `baja`. |
| `estado` | Vocabulario cerrado: `pendiente`, `en-progreso`, `resuelto`, `descartado`. |
| `impacto` | Vocabulario cerrado: `alto`, `medio`, `bajo`. |

## Iteration

| Campo | Validación |
|---|---|
| `id` | Identificador estable; se genera al insertar una nueva iteración. |
| `intento` | Texto del trabajo realizado. |
| `resultado` | Texto de lo observado. |
| `ajuste` | Texto de la mejora o siguiente cambio. |
| `criterioIds` | Lista de referencias a criterios existentes; referencias inexistentes se ignoran durante reparación sin borrar los demás datos. |

## CriterionImprovement

| Campo | Validación |
|---|---|
| `criterioId` | Referencia al criterio fuente vigente. |
| `confirmado` | Casilla de verificación del resumen final. |
| `mejora` | Espacio para la mejora anotada. |

## State transitions

```text
orientación incompleta
  → análisis con decisión explícita
  → guía con criterios etiquetados
  → ejecución con una o más iteraciones
  → revisión con seguimiento de mejoras
```

Las transiciones conservan los requisitos de fase existentes y añaden únicamente las validaciones necesarias para asegurar que el análisis y los criterios requeridos ya son utilizables por la fase posterior.

## Repair migration rules

- Una tarea heredada en orientación recibe `decision: pendiente` y debe completar el análisis antes de avanzar a guía.
- Una tarea heredada que ya está en guía, ejecución o revisión recibe una decisión de compatibilidad `mantener`, una justificación que indica la migración y una formulación vigente derivada de su problema existente o de su directiva. Conserva su fase, sus datos y sus condiciones de avance ya cumplidas.
- La reparación nunca fuerza a una tarea de fase 2–4 a volver a orientación ni elimina datos heredados para cumplir los nuevos campos.
