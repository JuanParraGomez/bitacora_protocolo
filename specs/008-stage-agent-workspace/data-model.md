# Data Model: Lienzo por etapas con agente IA

Este feature no añade tablas ni entidades persistidas de negocio. Los modelos
siguientes describen estado presentacional derivado o efímero.

## StageAgentPresentation

Representa la geometría visible del workspace.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| viewportMode | `desktop`, `tablet`, `mobile` | Se deriva del viewport, no se persiste con la tarea |
| navigationMode | `expanded`, `collapsed`, `drawer-closed`, `drawer-open` | Reutiliza el contrato vigente |
| agentMode | `collapsed`, `expanded` | Preferencia opcional por tarea dentro del estado de vista existente |
| activeMobilePlane | `stage`, `agent` | Preferencia opcional por tarea; un plano visible por vez |
| stageScroll | posición efímera | Se conserva al alternar dentro de la sesión |
| agentScroll | mensaje visible existente | Reutiliza el seguimiento vigente del chat |
| focusReturnTarget | control opcional | Se restaura al cerrar drawer o contraer panel |

### State transitions

- Desktop inicial: navegación según preferencia vigente, agente `collapsed`.
- `collapsed` -> `expanded`: el agente ocupa una columna y reduce el canvas sin
  cubrirlo.
- `expanded` -> `collapsed`: el canvas recupera ancho y el control del agente
  permanece disponible.
- Tablet: navegación fuera del grid principal; agente puede compartir el plano.
- Móvil inicial: `activeMobilePlane = stage`.
- `stage` <-> `agent`: conserva tarea, etapa, borrador, valores y scroll.
- Un cambio de breakpoint normaliza la geometría sin cambiar el contexto activo.

`agentMode` y `activeMobilePlane` se almacenan, si se persisten, como mapas
opcionales por `taskId` dentro de `bitacora:workspace-view-state`. Valores
ausentes o inválidos se reparan a `collapsed` y `stage`; no se crea una nueva
clave ni se modifica la tarea.

## ContextualPrimaryAction

Proyección pura del estado actual de la tarea.

| Estado derivado | Etiqueta | Disponibilidad | Operación reutilizada |
|---|---|---|---|
| cambios sin evaluación vigente | `Evaluar etapa` | habilitada | evaluación |
| evaluación en curso | `Evaluando…` | deshabilitada | ninguna adicional |
| evaluación no aceptable o desfasada | `Reevaluar etapa` | habilitada | evaluación |
| evaluación aceptable, etapa 1–3 | `Continuar a etapa N` | según gate vigente | avance |
| evaluación aceptable, etapa 4 | `Finalizar tarea` | según gate vigente | avance/finalización |
| tarea completada | `Volver a tareas` | habilitada | navegación existente |

### Invariants

- Solo un estado puede estar activo.
- La presentación no puede conceder avance si el gate de dominio lo rechaza.
- Una operación ocupada no admite doble activación.
- La razón de indisponibilidad es visible y accesible.

## AgentPanelState

Agrupa continuidad del agente sin cambiar sus schemas.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| taskId | identificador | Debe coincidir con la tarea visible |
| phase | 1–4 | Debe coincidir con la etapa visible |
| mode | `collapsed`, `expanded` | Solo presentación |
| operationalStatus | `ready`, `sending`, `evaluating`, `error` | Derivado de operaciones existentes |
| draft | texto | Reutiliza el borrador vigente por tarea |
| lastVisibleMessageId | identificador opcional | Reutiliza restauración vigente |
| pendingResponseContext | tarea, etapa, revisión | Evita aplicar respuestas tardías fuera de contexto |

## EvaluationDisplay

Vista de una evaluación ya existente.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| status | `none`, `evaluating`, `acceptable`, `blocked`, `stale`, `transport-error` | Derivado |
| issues | lista de causas | Cada causa se asocia a su campo o decisión cuando sea posible |
| recovery | acción opcional | `Evaluar` o `Reevaluar`; nunca avance |
| announcement | mensaje accesible | Comunica estado y siguiente paso |

## CompletionSummary

Proyección de solo lectura de una tarea completada.

| Campo | Fuente | Regla |
|---|---|---|
| progress | fase/estado | Siempre 4/4 para una tarea completada |
| finalOutcome | primer texto no vacío: `f4.cambio`; si falta, última iteración por orden del arreglo con `result` o `resultado`, priorizando `result` dentro de esa iteración | `No registrado` si está vacío |
| keyLearning | aprendizajes no vacíos de `f3.iteraciones`, en orden y deduplicados por igualdad exacta; solo si no existen, `f4.conexiones` | Fallback, no concatenación entre fuentes |
| evidence | referencias no vacías de `f3.iteraciones`, en orden y deduplicadas por igualdad exacta; solo si no existen, `f1.analisisProblema.evidencia` | Fallback; sin inventar artefactos |
| decision | primer texto no vacío: `f2.decision`, `f1.analisisProblema.decision`, `f1.analisisProblema.justificacion` | Fallback; solo lectura |
| records | registros cuyo `(record.sourceTaskId || record.taskId || record.tareaId) === task.id` | Recorrer orden original; conservar primera aparición de cada `record.id` |

## VisualAcceptanceRecord

Evidencia de la comparación final.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| referenceId | `IMG-UX-01`…`IMG-UX-06` | ID canónico |
| referencePath | ruta exacta | Debe venir del manifiesto, nunca de un glob |
| actualPath | ruta exacta `ACTUAL-*` | Captura del mismo estado/viewport |
| viewport | ancho × alto | Debe coincidir con el contrato |
| fixture | identificador sintético | Reproducible y sin secretos |
| differences | lista | Jerarquía, geometría, contenido, interacción o responsive |
| decision | `approved`, `pending`, `defect` | Obligatoria por diferencia |
| severity | `low`, `medium`, `high`, `critical` | Obligatoria para pendientes/defectos |
| evidenceAnchor | referencia | Enlace al ledger del feature |

## Persisted entities unchanged

- Proyecto y colección de proyectos.
- Tarea, fases e historial.
- Mensajes, evaluaciones y propuestas del agente.
- Índice de tareas y registros generados.
- Biblioteca y referencias.
- Contrato de almacenamiento.
- Datos del flujo `/legacy`.

No se requiere migración. Cualquier campo opcional de presentación que se
incorpore al estado local debe tener default seguro y tolerar snapshots
anteriores sin reparación de datos de negocio.
