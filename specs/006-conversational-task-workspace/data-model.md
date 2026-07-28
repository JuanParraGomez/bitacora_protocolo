# Data Model: Workspace conversacional de soluciones repetibles

## Compatibility strategy

La tabla SQLite y las claves existentes no cambian. La reparación parte de la forma 003/005, añade defaults 006 y conserva IDs, orden, prompts, mensajes, evaluaciones, registros y valores desconocidos no sensibles dentro de un sobre diagnóstico. Debe cumplirse:

```text
repairTask(repairTask(value)) == repairTask(value)
```

No se ejecuta migración masiva al iniciar.

## MigrationEnvelope

| Field | Type | Rules |
|-------|------|-------|
| `sourceSchemaVersion` | number \| null | Versión detectada antes de reparar |
| `unknownFields` | record of path to unknown | Conserva valor y ruta original no sensible |
| `invalidFields` | record of path to raw invalid value | Permite diagnóstico y recuperación |
| `redactedFields` | string[] | Rutas secret-like conservadas solo como diagnóstico, nunca con valor |

`repairTask()` recorre recursivamente objetos y arrays antes de parsear. Cada segmento de ruta se normaliza con Unicode NFKC, minúsculas y eliminación de separadores. Se considera sensible si coincide o termina en `password`, `passwd`, `secret`, `token`, `apikey`, `accesskey`, `privatekey`, `clientsecret`, `authorization`, `cookie`, `session` o `credential`. Un valor sensible nunca se copia: `redactedFields` conserva solo ruta y motivo. Guardar una tarea reparada conserva todos los demás valores desconocidos/ inválidos en el sobre y nunca los elimina silenciosamente.

## ProjectCollection

Clave: `bitacora:projects`

| Field | Type | Rules |
|-------|------|-------|
| `schemaVersion` | `1` | Reparable |
| `projects` | `Project[]` | IDs únicos; contiene `legacy` cuando existen tareas heredadas |
| `activeProjectId` | `string \| null` | Debe existir o repararse al primer proyecto activo |

## Project

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Único; `legacy` reservado |
| `name` | string | 1–120 caracteres |
| `description` | string | Máximo 1000 caracteres |
| `status` | `active \| archived` | Un archivado conserva tareas |
| `lastActiveTaskId` | `string \| null` | Debe pertenecer al proyecto o repararse |
| `createdAt` | number | Inmutable |
| `updatedAt` | number | No anterior a `createdAt` |

La tarea contiene la pertenencia canónica; el proyecto no almacena `taskIds`.

## Task extensions

| Field | Type | Rules |
|-------|------|-------|
| `schemaVersion` | `2` | Forma emitida al guardar |
| `projectId` | string | Default `legacy` al reparar |
| `estado` | `activa \| pausada \| completada` | Independiente de madurez |
| `fase` | `1 \| 2 \| 3 \| 4` | Compatible con rutas y datos actuales |

`bitacora:index.tareas[]` y `registros[]` añaden `projectId` denormalizado. Si falta, se interpreta como `legacy`.

## Stage mapping

| Existing source | Outcome stage | Required additions |
|-----------------|---------------|--------------------|
| `f1` | Entender el problema | resultado deseado, alcance, restricciones, actores, criterio de éxito |
| `f2` | Descomponer el camino | subproblemas, pasos, dependencias, decisiones, preguntas abiertas, riesgos |
| `f3` | Ejecutar e iterar | objetivo, acción, herramienta, entrada, evidencia, aprendizaje, resultado y versión por iteración |
| `f4` | Consolidar y automatizar | versiones de método, controles, excepciones y oportunidades |

Los datos 003/005 no cubiertos se conservan sin convertirse automáticamente en confirmados.

## SolutionStep

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Estable dentro de la tarea |
| `title` | string | Requerido |
| `objective` | string | Resultado local verificable |
| `dependencies` | string[] | Sin autoreferencia |
| `inputs` | string[] | Entradas conocidas |
| `output` | string | Salida esperada |
| `tool` | string | Puede estar vacío hasta consolidación |
| `risk` | string | Requerido al completar etapa 2 |
| `successCriterion` | string | Requerido |
| `sourceCriterionId` | string \| null | Conserva vínculo 003 |

## ExecutionIteration

Extiende la iteración existente.

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Conserva IDs históricos |
| `methodVersionId` | string \| null | Requerido para evidencia 006 |
| `objective` | string | Requerido |
| `action` | string | Requerido |
| `tool` | string | Requerido |
| `input` | string | Requerido |
| `result` | string | Requerido |
| `evidence` | `EvidenceReference[]` | Al menos una para éxito aplicable |
| `learning` | string | Requerido |
| `nextAdjustment` | string | Requerido; si no aplica debe contener una confirmación explícita |
| `applicableConditions` | string[] | Al menos una para contar repetibilidad |
| `success` | boolean | Comparado con criterios |
| `successCriteriaResults` | `CriterionResult[]` | Todos los criterios de la versión |
| `createdAt` | number | Orden estable |

## EvidenceReference

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Único dentro de iteración |
| `kind` | `note \| link \| artifact \| observation` | Cerrado |
| `label` | string | Requerido |
| `value` | string | Contenido inerte |

## MethodVersion

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Inmutable |
| `version` | positive integer | Creciente por tarea |
| `parentVersionId` | string \| null | Misma tarea |
| `status` | `draft \| published \| superseded` | Una activa como máximo |
| `changeKind` | `initial \| material` | Material reinicia evidencia |
| `preconditions` | string[] | No vacías al publicar |
| `steps` | `SolutionStep[]` | Al menos uno |
| `tools` | string[] | Dedupe |
| `inputs` | string[] | No vacías al publicar |
| `outputs` | string[] | No vacías al publicar |
| `controls` | string[] | Incluye controles humanos |
| `exceptions` | string[] | Puede estar vacía con confirmación |
| `exceptionsReviewed` | boolean | `true` obligatorio al publicar, incluso sin excepciones |
| `successCriteria` | string[] | Al menos uno |
| `supportingIterationIds` | string[] | Solo iteraciones de esta versión |
| `createdAt` | number | Inmutable |

Una versión publicada con evidencia no se muta materialmente; se crea sucesora.

## DerivedResultMaturity

No se persiste.

```text
hypothesis        = no method version sufficiently defined
proposed-path     = method version exists, no successful applicable iteration
documented-once   = exactly one or more successful iteration for active version
repeatable-method = two or more successful iterations for active version
                    under applicable conditions
```

El estado operativo `completada` no cambia este cálculo.

## AutomationOpportunity

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Único |
| `methodVersionId` | string | Versión propietaria |
| `stepIds` | string[] | Al menos uno |
| `classification` | `manual \| assistable \| automatable` | Requerido |
| `frequency` | string | Evidencia observable |
| `stability` | string | Evidencia observable |
| `risk` | string | Requerido |
| `humanJudgment` | string | Requerido |
| `trigger` | string | Requerido para assistable/automatable |
| `inputs` | string[] | Requerido |
| `transformation` | string | Requerido |
| `output` | string | Requerido |
| `candidateTool` | string | Hipótesis, no integración |
| `expectedFailures` | string[] | Al menos uno |
| `humanCheckpoint` | string | Requerido |
| `occurrenceIterationIds` | string[] | Misma secuencia/version |

Estado derivado:

```text
hypothesis              = 0..1 occurrence
candidate-with-evidence = 2+ equivalent occurrences
```

No existe `validated-automation` en schema 006.

## PhaseEvaluation extensions

| Field | Type | Rules |
|-------|------|-------|
| `gateVersion` | `legacy-v1 \| outcome-v2` | Legacy visible, no vigente para 006 |
| `methodVersionId` | string \| null | Requerido para fase 4 outcome-v2 |
| `responseRevision` | string | Incluye todos los mínimos de la etapa |

Una evaluación `legacy-v1` mantiene trazabilidad pero no abre compuertas 006.

## FormUpdate

Las rutas se amplían para los nuevos campos. El estado conserva:

```text
proposed -> applied
proposed -> rejected
proposed -> conflict
```

Ninguna propuesta se aplica al recibirse. `applied` exige acción explícita y revisión base vigente.

## WorkspaceViewState

Estado de presentación, no se escribe en la tarea:

| Field | Type | Rules |
|-------|------|-------|
| `activeProjectId` | string \| null | Proyecto visible |
| `activeTaskId` | string \| null | Tarea visible |
| `sidebarCollapsed` | boolean | Preferencia local |
| `expandedProjectIds` | string[] | IDs existentes |
| `summaryStateByTask` | record | `hidden \| collapsed \| expanded \| review` |
| `lastVisibleMessageByTask` | record | ID, no offset de píxeles |
| `activeOverlay` | `new-task \| library \| settings \| null` | Solo uno |

## Storage transitions

### Lazy legacy read

```text
missing projects -> synthesize legacy
task without projectId -> interpret legacy
save task -> materialize schemaVersion 2 + projectId + MigrationEnvelope
```

### Atomic operations

Una transacción batch cubre:

- crear tarea + actualizar índice + actividad de proyecto;
- mover tarea + actualizar índice y ambos proyectos;
- completar tarea + crear registro + actualizar índice/proyecto;
- eliminar tarea + índice/proyecto;
- materializar una migración explícita.

Si una operación falla, ninguna clave cambia.
