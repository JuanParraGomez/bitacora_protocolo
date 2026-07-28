# Data Model: Correcciones UX/UI del workspace

Esta feature no añade tablas, claves de almacenamiento ni campos persistidos. Los modelos siguientes describen estados de presentacion y contratos de interaccion.

## WorkspacePresentation

Representa la composicion visible de una tarea o proyecto.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| activeProjectId | identificador opcional | Debe corresponder a un proyecto activo cuando se crea una tarea |
| activeTaskId | identificador opcional | Puede estar ausente en proyectos vacios |
| navigationMode | `expanded`, `collapsed`, `drawer-closed`, `drawer-open` | Depende del viewport y de la accion del usuario |
| activeOverlay | `new-task`, `library`, `settings` o ninguno | Solo uno puede estar activo |
| overlayContext | proyecto, tarea y recurso opcionales | Debe conservar la orientacion de origen |
| focusReturnTarget | control opcional | Se captura al abrir drawer u overlay |

### State transitions

- Escritorio inicial: `expanded`.
- `expanded` -> `collapsed` al contraer; `collapsed` -> `expanded` al restaurar.
- Movil inicial: `drawer-closed`.
- `drawer-closed` -> `drawer-open` desde `Abrir navegacion`.
- `drawer-open` -> `drawer-closed` por cierre, Escape o seleccion; luego se restaura foco.
- Cualquier estado estable -> un `activeOverlay`; al cerrar vuelve al mismo contexto.

## TaskIntakeSession

Agrupa datos y estado transitorio de una creacion.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| projectId | identificador | Requerido y valido al enviar |
| name | texto | Puede satisfacer por si mismo la descripcion minima |
| directive | texto opcional | Puede satisfacer por si misma la descripcion minima |
| templateTaskId | identificador opcional | No cambia la validacion basica |
| dirty | booleano | Activa proteccion al cerrar |
| submissionState | `idle`, `invalid`, `submitting`, `succeeded`, `failed` | Solo `idle` o `failed` admiten un nuevo envio |
| operationId | identificador efimero | Evita crear dos tareas por envio repetido |

### Validation

- Debe existir un proyecto activo.
- Debe existir nombre o directiva con contenido no vacio.
- Mientras `submitting`, nuevas activaciones no crean otra operacion.
- `failed` conserva los datos y ofrece reintento.

## WorkspaceNotice

Representa feedback no modal asociado a una operacion.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| operationId | identificador | Deduplica avisos de la misma operacion |
| tone | `info`, `success`, `error` | Determina prioridad semantica |
| title | texto | Espanol y accionable |
| message | texto | Explica resultado y siguiente paso |
| retry | accion opcional | Solo para errores recuperables |
| urgency | normal o urgente | Los errores urgentes se anuncian inmediatamente |

## LegacyEditableRow

Representa una fila repetible del formulario heredado.

| Campo | Tipo conceptual | Regla |
|---|---|---|
| localId | identificador efimero | Unico dentro del formulario |
| value | texto | Vacio o con contenido normalizado |
| state | `empty`, `valid`, `invalid` | Una fila vacia existente bloquea agregar otra |
| removable | booleano | Toda fila adicional puede eliminarse |

## Persisted entities unchanged

- Proyecto
- Tarea
- Indice de tareas
- Registro de biblioteca
- Ajustes de asistencia

La implementacion debe consumir sus contratos actuales sin migracion.
