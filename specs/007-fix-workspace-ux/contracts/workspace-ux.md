# UI Contract: Workspace UX audit remediation

## Route and action contract

| Contexto | Accion | Resultado obligatorio |
|---|---|---|
| Proyecto vacio | `Crear primera tarea` | Formulario operativo con proyecto preseleccionado |
| Cabecera o sidebar | `Nueva tarea` | El mismo formulario y validacion de creacion |
| `/tasks/new` | Carga directa | Formulario funcional; nunca una pagina solo informativa |
| Workspace con tarea | `Biblioteca` | Slideover contextual sin desmontar la tarea |
| `/library` | Carga directa | Biblioteca o estado vacio con CTA hacia workspace/tarea |
| Cualquier acceso contextual | `Ajustes` | Dialogo consistente o indisponibilidad explicita |
| Ruta inexistente | Carga directa | Error en espanol con retorno al workspace |

## Creation contract

1. El proyecto de origen se conserva y aparece seleccionado.
2. Nombre o directiva deben aportar una descripcion minima.
3. Los errores permanecen dentro del formulario y se asocian a su control.
4. El envio entra en estado ocupado y bloquea activaciones repetidas.
5. Exito crea una sola tarea, cierra el formulario y abre la tarea.
6. Fallo conserva los datos y permite reintentar.
7. Cierre con cambios solicita confirmacion y restaura foco.

## Workspace geometry contract

- Ningun control visible puede quedar debajo de otra region interactiva.
- Sidebar, conversacion y formulario tienen contenedores y desplazamiento definidos.
- El footer del sidebar no ocupa el area desplazable de tareas.
- Los formularios inline mantienen etiqueta, campo y acciones en una misma region.
- Nombres largos pueden truncarse, pero sus acciones permanecen visibles.
- No existe overflow horizontal involuntario a partir de 320 px.

## Responsive contract

| Viewport CSS | Navegacion | Contenido |
|---|---|---|
| 1440 x 900 | Expandida y contraible | Workspace multipanel sin solapes |
| 1024 x 768 | Expandida o compacta | Regiones utilizables sin clipping |
| 390 x 844 | Drawer cerrado inicialmente | Una sola columna principal |
| 320 px de ancho | Drawer | Sin controles fuera de pantalla |
| Cualquiera al 200% de zoom | Navegable por teclado | Campo activo y CTA alcanzables |

## Accessibility contract

- Landmarks: navegacion identificada, `main` unico y region de contexto.
- Drawer y overlays: nombre accesible, cierre visible, Escape y retorno de foco.
- Boton de chat: nombre accesible exacto `Enviar mensaje`.
- Iconos: nombre accesible en espanol y foco visible.
- Exito no urgente: region de estado; error urgente: alerta.
- Cada ruta moderna: titulo de documento contextual.
- Los estados deshabilitados explican su condicion mediante texto asociado.

## Notice contract

- Una operacion produce como maximo un aviso de exito activo.
- Repetir la publicacion para el mismo `operationId` reemplaza o actualiza.
- Operaciones distintas pueden coexistir dentro del limite del workspace.
- Un error recuperable incluye `Reintentar`; todo aviso puede cerrarse.

## Legacy form contract

- `Nombre` es requerido.
- `Directiva cruda (opcional)` no bloquea creacion si existe nombre.
- No pueden coexistir dos filas repetibles vacias.
- Una fila adicional ofrece eliminacion.
- El error dirige foco al primer campo invalido.

## Evidence mapping

La matriz completa UX-001–UX-017 vive en `spec.md`. Las capturas son evidencia historica; la conformidad se determina con interaccion reproducible y revision visual posterior.
