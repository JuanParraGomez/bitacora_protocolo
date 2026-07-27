# UI Contract: Espacio de trabajo de tarea

## Alcance

Contrato de interacción interno entre el espacio de trabajo, sus componentes de fase y la persistencia de la tarea. No modifica los endpoints públicos de almacenamiento existentes.

## Eventos observables

| Evento | Origen | Garantía |
|---|---|---|
| `task-dirty` | Cualquier campo editable | La tarea se marca como no guardada sin perder los datos visibles. |
| `save-request` | Guardado general, autoguardado o cajita de prompt | Persiste la tarea completa y comunica éxito o error recuperable. |
| `iteration-added` | Control de nueva iteración | Inserta una iteración con identificador, preserva la posición de lectura y deja accesible el primer campo de la nueva tarjeta. |
| `prompt-save-request` | Cajita de prompt | Actualiza el prompt de la fase y desencadena `save-request` sin requerir otro control. |

## Requisitos de accesibilidad

- Cada campo, casilla, selector y botón tiene nombre accesible único.
- La nueva iteración es identificable por número o nombre y recibe foco controlado solo si ello no contradice preferencias de movimiento reducido.
- El resultado de guardado directo se anuncia con una región de estado.
- Prioridad, estado e impacto se expresan como controles con opciones explícitas, no solo por color.

## Invariantes de compatibilidad

- La carga y guardado continúan usando las claves de tarea existentes.
- La reparación de datos llena valores nuevos por defecto sin eliminar campos heredados conocidos.
- El enlace de descarga y el registro completado siguen usando una representación de la tarea que escapa contenido no confiable.
