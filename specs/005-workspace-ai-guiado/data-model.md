# Data Model: Espacio de trabajo guiado por IA

## Compatibility strategy

La tarea existente sigue siendo la unidad de persistencia. `repairTask()` añade un estado `assistant` seguro cuando falta, conserva todos los campos `prompt*` y no los usa como instrucciones. No hay migración destructiva ni cambio de las claves de tarea o índice.

## Phase

Tipo cerrado `1 | 2 | 3 | 4`, correspondiente a Orientación, Guía, Ejecución y Revisión.

### Rules

- Solo la fase vigente recibe mensajes aplicables y actualizaciones.
- Los campos funcionales válidos de cada fase se definen mediante una unión cerrada de rutas.
- La huella de respuestas excluye prompts heredados, chat y evaluaciones.

## AssistantMessage

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Requerido y único dentro de la tarea |
| `taskId` | string | Debe coincidir con la tarea propietaria |
| `phase` | Phase | Contexto de origen inmutable |
| `role` | `user \| assistant` | No se persisten instrucciones internas como mensajes de usuario |
| `parts` | text parts | Contenido tratado siempre como texto seguro |
| `status` | `sending \| sent \| error` | Solo mensajes de usuario pueden permanecer en `sending` o `error` |
| `createdAt` | number | Marca temporal de orden estable |
| `updates` | FormUpdate[] | Opcional; solo actualizaciones tipadas de la misma fase |

### State transitions

```text
sending -> sent
sending -> error -> sending
assistant response -> sent
```

Un reintento conserva el mismo mensaje lógico y no duplica el contenido confirmado.

## FormUpdate

| Field | Type | Rules |
|-------|------|-------|
| `field` | PhaseFieldPath | Ruta permitida para la fase del mensaje |
| `value` | supported field value | Debe satisfacer el esquema del campo destino |
| `sourceMessageId` | string | Debe referenciar el mensaje asistente que la propuso |
| `baseRevision` | string | Huella vigente al originar la propuesta |
| `status` | `proposed \| applied \| rejected \| conflict` | No se aplica fuera de `proposed` |

### State transitions

```text
proposed -> applied
proposed -> rejected
proposed -> conflict
```

Una propuesta pasa a `conflict` si cambió tarea, fase o huella. Nunca sobrescribe automáticamente una edición humana posterior.

## PhaseEvaluation

| Field | Type | Rules |
|-------|------|-------|
| `id` | string | Requerido y único |
| `taskId` | string | Debe coincidir con la tarea |
| `phase` | Phase | Fase evaluada |
| `responseRevision` | string | Huella canónica exacta de las respuestas |
| `evaluatorVersion` | string | `mock-v1` en el MVP |
| `status` | `acceptable \| needs-work \| error` | `acceptable` exige gate determinista abierto |
| `weaknesses` | string[] | Al menos una cuando `needs-work` |
| `recommendations` | string[] | Al menos una cuando `needs-work` |
| `gatePassed` | boolean | Resultado determinista |
| `gateReasons` | string[] | Vacío únicamente cuando el gate pasa |
| `createdAt` | number | Ordena el historial |

### Freshness

Una evaluación es vigente cuando:

```text
evaluation.taskId == task.id
AND evaluation.phase == task.fase
AND evaluation.responseRevision == currentPhaseRevision(task)
```

No se persiste un booleano `stale`; se deriva para evitar estados contradictorios.

## AssistantState

| Field | Type | Rules |
|-------|------|-------|
| `schemaVersion` | `1` | Permite reparación futura |
| `messages` | AssistantMessage[] | Solo mensajes de la tarea propietaria |
| `evaluations` | PhaseEvaluation[] | Historial ordenado de las cuatro fases |

### Default

```text
{ schemaVersion: 1, messages: [], evaluations: [] }
```

## AssistanceSettings

| Field | Type | Rules |
|-------|------|-------|
| `mode` | `codex \| deepseek` | Selección única |
| `connectionStatus` | `deferred` | Único estado del MVP |
| `schemaVersion` | `1` | Reparable |

No contiene token, clave, organización, modelo remoto ni otro secreto.

## Task extensions

`Task` añade `assistant: AssistantState`. Los campos existentes permanecen sin cambios, incluidos:

- identidad, nombre, directiva, tipo, fecha, fase y estado;
- `f1`, `f2`, `f3`, `f4`;
- todos los campos `promptOrientacion`, `promptGuia`, `promptEjecucion`, `promptAar` y sus marcas de personalización.

Los prompts legacy no se muestran ni participan en la huella.

## Derived task groups

La navegación usa los estados existentes:

- **Activas**: entradas presentes en `index.tareas`, incluida la tarea seleccionada.
- **Completadas**: registros presentes en `index.registros`.

No se crea una entidad Proyecto ni estados adicionales. El «proyecto activo» es una etiqueta de presentación configurable en una entrega posterior.

## Continue rule

`Continuar` está habilitado si y solo si:

```text
gateReasons(task).length == 0
AND latestCurrentEvaluation.status == acceptable
AND latestCurrentEvaluation.responseRevision == currentPhaseRevision(task)
```

En fase 4, continuar conserva la finalización actual: genera el registro, retira la tarea activa del índice y la presenta en Completadas.

