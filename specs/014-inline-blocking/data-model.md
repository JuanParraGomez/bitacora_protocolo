# Data Model: Estado de bloqueo con errores inline y recuperación

No se añade persistencia ni se migran schemas. Estas entidades son view models
frontend derivados de contratos existentes.

## PendingCorrection

| Field | Source/derivation | Rules |
|-------|-------------------|-------|
| `message` | `PhaseEvaluation.gateReasons[]` | trim; omitir vacío |
| `field` | catálogo exacto por fase | clave existente o `null`; sin inferencia |
| `id` | clave estable derivada de campo+orden/hash | único en la evaluación visible |
| `controlId` | `fieldIdMap` del formulario | `null` si no hay control reconocido |

Unicidad: dos entradas con el mismo `field` y `message` son una corrección. Dos
mensajes distintos del mismo campo permanecen separados. El mismo texto en dos
campos distintos son dos correcciones.

## EvaluationRecoveryView

| Field | Source/derivation | Rules |
|-------|-------------------|-------|
| `status` | evaluación/desfase/transporte | `none`, `evaluating`, `acceptable`, `blocked`, `stale`, `transport-error` |
| `corrections` | evaluación needs-work aplicable | arreglo deduplicado; weaknesses/recommendations excluidas |
| `pendingCount` | `corrections.length` | entero ≥0 |
| `hasPendingCorrections` | conteo | true solo si `pendingCount > 0` |
| `recovery` | estado existente | `evaluate`, `reevaluate` o `null` |
| `announcement` | estado | texto live-region existente, sin duplicar lista |

### Source eligibility

```text
needs-work vigente ──> corrections(gateReasons)
needs-work de misma tarea/fase + stale por edición ──> conserva corrections como pendientes de confirmación
needs-work + reeval transport-error ──> conserva corrections previas
sin evaluación + transport-error ──> corrections=[]
evaluación stale no needs-work ──> corrections=[]
evaluación acceptable vigente ──> corrections=[]
respuesta de otra tarea/fase/revisión ──> no altera la proyección visible
```

## FieldCorrectionGroup

Agrupación consumida por cada bloque de campo.

| Field | Rules |
|-------|-------|
| `field` | clave exacta reconocida |
| `controlId` | ID real del control causante |
| `messages` | todas las correcciones únicas de ese campo |
| `descriptionIds` | un ID por mensaje, concatenados para `aria-describedby` |
| `invalid` | true mientras haya al menos un mensaje |

Para el fixture IMG-UX-05:

| Canonical reason | Field | Control |
|------------------|-------|---------|
| `Define una hipótesis verificable para poder evaluar el análisis` | `f1.analisisProblema.analisis` | `problem-analysis` |
| `Define criterio(s) de éxito para cerrar la fase.` | `f1.criterioExito` | `success-criteria` |

## CorrectionBannerView

| Field | Rules |
|-------|-------|
| `title` | `1 corrección pendiente` o `N correcciones pendientes` |
| `items` | todas las correcciones únicas, incluidas las no mapeadas |
| `agentActionLabel` | exacto `Ver recomendaciones del agente` |
| `visible` | solo con conteo positivo |

El banner resume; no es el contenedor semántico del error de un campo. La
asociación del control referencia los mensajes inline dentro de su bloque.

## AgentCorrectionNotice

| Field | Source | Rules |
|-------|--------|-------|
| `count` | `EvaluationRecoveryView.pendingCount` | no persistir ni sumar propuestas |
| `placement` | estado del agente | rail si collapsed; header si expanded |
| `accessibleName` | conteo | `N corrección/correcciones pendientes` |

## Recovery transitions

```text
sin evaluación ──evaluar/needs-work──> blocked + correcciones
blocked ──editar campos──> stale + mismas correcciones pendientes de confirmación
blocked ──reevaluar/error──> transport-error + mismas correcciones
transport-error ──reevaluar/needs-work──> blocked + correcciones nuevas
blocked|transport-error ──reevaluar/acceptable──> acceptable + cero correcciones
acceptable ──editar campos──> stale + cero correcciones
stale ──reevaluar/acceptable──> acceptable + cero correcciones
```

La acción primaria se deriva por el resolver existente: blocked, stale y
transport-error usan `Reevaluar etapa`; acceptable usa avance si el gate lo
permite; ausencia de evaluación usa `Evaluar etapa` cuando corresponda.

## Invariants

1. Banner, inline, rail y header leen el mismo conteo derivado.
2. Weaknesses y recommendations nunca son correcciones pendientes.
3. Una edición local vuelve stale la evaluación, pero no cambia el conjunto de
   correcciones de un resultado needs-work de la misma tarea/fase.
4. Un fallo inicial no inventa correcciones; un fallo de reevaluación no borra
   las correcciones previas.
5. Un resultado aceptable vigente limpia todas las superficies en el mismo render.
6. Un mensaje desconocido nunca se asigna a un campo arbitrario.
7. No hay cambios de schema, persistencia, gate o payload.
