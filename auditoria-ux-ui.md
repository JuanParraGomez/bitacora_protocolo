# Auditoria UX/UI - Plataforma local

URL auditada: `http://127.0.0.1:3005/`

Fecha de auditoria: 2026-07-28

Alcance: auditoria de caja negra desde la interfaz. No se reviso codigo ni se investigo causa tecnica. Se probaron rutas visibles, estados vacios, creacion en legado, workspace con tarea, chat, controles laterales y viewports de escritorio, tablet y movil.

Viewports usados:

- Escritorio: override 1440x900; captura efectiva observada 1152x720 CSS px.
- Tablet: override 1024x768; captura efectiva observada 819x614 CSS px.
- Movil: override 390x844; captura efectiva observada 312x675 CSS px.

Evidencias: capturas en `auditoria-ux-ui-evidencias/`.

## Hallazgos Criticos

### UX-001 La accion "Crear primera tarea" abre una pantalla sin formulario ni salida operativa

- **Severidad:** Critico
- **Categoria:** Funcionalidad / Navegacion / UX
- **Ruta o pantalla:** `/` -> `/tasks/new?projectId=p-ms53am96-u1jf1k`
- **Ubicacion exacta en la interfaz:** Estado vacio del proyecto `sd`, centro de la pantalla, boton verde `Crear primera tarea`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en `Crear primera tarea` desde un proyecto sin tareas.
- **Comportamiento observado:** La app navega a una pantalla con titulo `Nueva tarea` y texto: `Abre una tarea existente o crea un proyecto para lanzar esta vista dentro del workspace.` No aparece formulario, CTA, selector de proyecto, boton de retorno contextual ni accion para crear la tarea.
- **Comportamiento esperado:** El CTA primario deberia abrir el formulario de nueva tarea, un modal de creacion o una ruta con una accion clara para completar la tarea.
- **Impacto para el usuario:** Bloquea el flujo esencial de empezar una tarea desde el estado vacio.
- **Recomendacion concreta:** Convertir `Crear primera tarea` en una accion completa de creacion o reemplazarlo por una instruccion accionable con CTA real. Evitar una pantalla intermedia sin siguiente paso.
- **Evidencia:** `auditoria-ux-ui-evidencias/02-new-task-desktop.png`

### UX-002 Controles esenciales del workspace quedan visualmente presentes pero cubiertos por otra capa

- **Severidad:** Critico
- **Categoria:** Funcionalidad / UI / UX
- **Ruta o pantalla:** `/tasks/ms53kfcd713c`
- **Ubicacion exacta en la interfaz:** Workspace con tarea `Auditoria QA prueba`; zona central-derecha bajo `Editar datos de la etapa`, botones `Evaluar`, `Continuar` y `Avanzar`; tambien lista lateral de tareas.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Abrir `Tareas heredadas`, seleccionar la tarea activa y revisar/clicar controles del flujo.
- **Comportamiento observado:** Los botones aparecen en pantalla, pero el elemento superior real en el punto de clic corresponde a otras capas: `Evaluar` queda bajo la etiqueta `Escribe tu mensaje`, `Continuar` queda bajo el textarea del chat, y `Avanzar` queda cubierto por el contenedor principal. En la barra lateral, `Nueva tarea` y el icono de renombrar de la tarea tambien quedan cubiertos por `Ajustes`/`Aprendizajes guardados`.
- **Comportamiento esperado:** Todos los controles visibles deben ser clicables y no estar tapados por regiones flotantes o superpuestas.
- **Impacto para el usuario:** Puede impedir evaluar, continuar o avanzar de fase aunque el boton parezca disponible.
- **Recomendacion concreta:** Revisar apilamiento, alturas fijas y zonas sticky del layout. Separar claramente panel de chat, formulario y footer lateral para que ningun control quede debajo de otra capa.
- **Evidencia:** `auditoria-ux-ui-evidencias/27-workspace-tareas-heredadas-with-task.png`, `auditoria-ux-ui-evidencias/28-workspace-send-not-clickable.png`

### UX-003 En movil, el workspace superpone la barra lateral y el contenido principal

- **Severidad:** Critico
- **Categoria:** Responsive / UI / Navegacion
- **Ruta o pantalla:** `/`
- **Ubicacion exacta en la interfaz:** Home del workspace; bloque lateral `Nexus` y cabecera principal `PROYECTO OVERLAY / Sin tarea seleccionada`.
- **Viewport utilizado:** Movil 390x844.
- **Accion realizada:** Abrir `/` en viewport movil.
- **Comportamiento observado:** La cabecera principal aparece montada encima de la lista lateral. Textos como `Etapa 1 de 4` y `Crea la primera tarea` quedan cortados hacia la derecha; botones del contenido principal aparecen entre elementos del sidebar.
- **Comportamiento esperado:** En movil deberia existir una sola columna clara o un drawer lateral cerrado, sin mezcla visual entre navegacion y contenido.
- **Impacto para el usuario:** La orientacion y la seleccion de acciones quedan comprometidas; es dificil distinguir que controles pertenecen al sidebar y cuales al contenido principal.
- **Recomendacion concreta:** En movil, ocultar sidebar tras boton de menu o convertirlo en drawer modal; no renderizar sidebar y main en el mismo plano si no hay ancho suficiente.
- **Evidencia:** `auditoria-ux-ui-evidencias/23-home-mobile.png`

## Hallazgos Altos

### UX-004 Botones `Nueva tarea` no producen respuesta visible en proyectos vacios

- **Severidad:** Alto
- **Categoria:** Funcionalidad / UX
- **Ruta o pantalla:** `/`
- **Ubicacion exacta en la interfaz:** Cabecera del workspace, junto a `Biblioteca` y `Ajustes`; tambien dentro del proyecto expandido en la barra lateral.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en `Nueva tarea` en la cabecera y en la barra lateral de `Proyecto overlay`.
- **Comportamiento observado:** El boton recibe foco, pero no cambia la URL, no abre modal, no muestra toast, no despliega formulario y no cambia el estado visible.
- **Comportamiento esperado:** Al ser accion primaria, deberia abrir el formulario de creacion o informar por que no se puede crear.
- **Impacto para el usuario:** Genera bloqueo o desconfianza: hay varias entradas a la accion principal, pero ninguna responde.
- **Recomendacion concreta:** Unificar todos los CTA `Nueva tarea` al mismo flujo funcional y mostrar feedback inmediato.
- **Evidencia:** `auditoria-ux-ui-evidencias/03-home-after-main-buttons.png`, `auditoria-ux-ui-evidencias/15-sidebar-new-task-no-effect.png`

### UX-005 Botones `Biblioteca` y `Ajustes` dentro del workspace no muestran estado ni accion

- **Severidad:** Alto
- **Categoria:** Funcionalidad / Navegacion
- **Ruta o pantalla:** `/`
- **Ubicacion exacta en la interfaz:** Cabecera del workspace y accesos principales de la barra lateral.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en `Biblioteca` y `Ajustes`.
- **Comportamiento observado:** Los botones reciben foco pero no navegan, no abren overlay, no muestran panel, toast ni estado activo. `Referencia` si funciona como enlace, lo que hace mas evidente la inconsistencia.
- **Comportamiento esperado:** Si son botones, deberian abrir paneles; si son navegacion, deberian ser enlaces. Si estan deshabilitados, deberian comunicarlo.
- **Impacto para el usuario:** Dificulta descubrir donde estan biblioteca y configuracion dentro del flujo.
- **Recomendacion concreta:** Definir comportamiento unico por control: enlace real, overlay visible o estado deshabilitado con explicacion.
- **Evidencia:** `auditoria-ux-ui-evidencias/03-home-after-main-buttons.png`

### UX-006 La pagina `/library` es un callejon sin contenido accionable

- **Severidad:** Alto
- **Categoria:** Navegacion / Contenido / UX
- **Ruta o pantalla:** `/library`
- **Ubicacion exacta en la interfaz:** Pantalla completa `Biblioteca`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en enlace global `Biblioteca`.
- **Comportamiento observado:** Solo muestra `Abre una tarea del workspace para consultar la biblioteca como overlay.` No hay CTA para abrir una tarea, seleccionar proyecto, volver al workspace contextual ni ejemplo de uso.
- **Comportamiento esperado:** La biblioteca global deberia mostrar contenido, un estado vacio accionable o redirigir al contexto correcto.
- **Impacto para el usuario:** La navegacion global promete una seccion, pero entrega una instruccion sin salida.
- **Recomendacion concreta:** Agregar CTA `Ir a tareas`, selector de tarea/proyecto o contenido de biblioteca global. Si la biblioteca solo existe como overlay, no presentarla como ruta primaria.
- **Evidencia:** `auditoria-ux-ui-evidencias/08-library-desktop.png`

### UX-007 El modal de nueva tarea en movil queda cortado y el cierre aparece parcialmente fuera del panel

- **Severidad:** Alto
- **Categoria:** Responsive / UI / Funcionalidad
- **Ruta o pantalla:** `/tasks/new?projectId=project-overlay` con overlay de nueva tarea.
- **Ubicacion exacta en la interfaz:** Modal `Crear tarea`; borde superior derecho, boton `×`; campos `Proyecto`, `Nombre`, `Directiva`.
- **Viewport utilizado:** Movil 390x844.
- **Accion realizada:** Abrir la ruta de nueva tarea en movil.
- **Comportamiento observado:** El panel queda estrecho y desplazado; el boton `×` se ve recortado hacia la derecha. El selector `Proyecto` ocupa una altura excesiva y muestra varias opciones como texto visible dentro del control.
- **Comportamiento esperado:** El modal deberia ocupar casi todo el ancho disponible, mantener padding consistente, cierre completo y controles con altura normal.
- **Impacto para el usuario:** Crear una tarea en movil se siente fragil y puede impedir cerrar o completar el formulario con confianza.
- **Recomendacion concreta:** Usar modal full-screen o bottom sheet en movil; ajustar `select`, ancho maximo y posicion del boton de cierre.
- **Evidencia:** `auditoria-ux-ui-evidencias/24-new-task-mobile.png`

### UX-008 El footer de la barra lateral tapa acciones y tareas

- **Severidad:** Alto
- **Categoria:** UI / Navegacion / Responsive
- **Ruta o pantalla:** `/tasks/ms53kfcd713c`
- **Ubicacion exacta en la interfaz:** Barra lateral izquierda, debajo de `Tareas heredadas`; zona de `Nueva tarea`, tarea `Auditoria QA prueba`, `Ajustes` y `Aprendizajes guardados`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Abrir proyecto `Tareas heredadas` con una tarea activa.
- **Comportamiento observado:** `Ajustes` y `Aprendizajes guardados` aparecen montados en la misma zona donde deberian estar la accion `Nueva tarea` y la tarea activa. Algunos controles existen pero quedan visualmente ocultos o cubiertos.
- **Comportamiento esperado:** La lista de proyectos/tareas debe tener scroll propio o reservar espacio para el footer sin tapar elementos.
- **Impacto para el usuario:** Se pierden tareas y acciones en la navegacion principal.
- **Recomendacion concreta:** Separar lista y footer con contenedores scrollables y calcular altura disponible; evitar posicionamiento absoluto sobre contenido dinamico.
- **Evidencia:** `auditoria-ux-ui-evidencias/27-workspace-tareas-heredadas-with-task.png`

## Hallazgos Medios

### UX-009 `Contraer navegación` no contrae la barra lateral

- **Severidad:** Medio
- **Categoria:** Funcionalidad / Navegacion
- **Ruta o pantalla:** `/`
- **Ubicacion exacta en la interfaz:** Parte superior derecha de la barra lateral, boton con simbolo `‹`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en `Contraer navegación`.
- **Comportamiento observado:** No hay cambio visible en ancho, contenido, icono, etiqueta ni estado del sidebar.
- **Comportamiento esperado:** La barra lateral deberia contraerse, cambiar el icono a expandir y liberar espacio de contenido.
- **Impacto para el usuario:** El control comunica una promesa que no cumple; reduce confianza y ocupa espacio sin valor.
- **Recomendacion concreta:** Implementar colapso real o retirar el boton hasta que exista el comportamiento.
- **Evidencia:** `auditoria-ux-ui-evidencias/04-sidebar-collapsed.png`

### UX-010 El formulario de renombrar proyecto pierde acciones visibles al desplazarse

- **Severidad:** Medio
- **Categoria:** UI / UX
- **Ruta o pantalla:** `/`
- **Ubicacion exacta en la interfaz:** Barra lateral, proyecto `sd`, formulario `Nuevo nombre del proyecto`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en icono `✎` de `sd` y scroll para ver el formulario.
- **Comportamiento observado:** Se muestra el input con valor `sd`, pero las acciones `Cancelar`/`Guardar nombre de proyecto` no quedan claramente visibles en el contexto scrolleado; debajo aparece `Ajustes`, mezclando el formulario con el footer.
- **Comportamiento esperado:** El formulario inline debe mantener input, cancelar y guardar juntos, sin que el footer interrumpa la edicion.
- **Impacto para el usuario:** Puede abandonar la edicion por no encontrar como guardar o cancelar.
- **Recomendacion concreta:** Encapsular el formulario en una tarjeta inline con acciones fijas dentro del bloque editado.
- **Evidencia:** `auditoria-ux-ui-evidencias/07-rename-sd-scrolled.png`

### UX-011 El formulario legado permite crear una tarea sin `Directiva cruda`

- **Severidad:** Medio
- **Categoria:** Formularios / Contenido / UX
- **Ruta o pantalla:** `/legacy`
- **Ubicacion exacta en la interfaz:** Formulario `Nueva tarea`, campo `Directiva cruda (el requerimiento tal como te llegó, sin traducir)`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Crear tarea en legado con nombre `Auditoria QA prueba` y directiva vacia.
- **Comportamiento observado:** La tarea se crea y pasa a fase 1 con mensaje `guardado ✓`.
- **Comportamiento esperado:** Si la directiva es necesaria para entender la tarea, deberia validarse o explicarse como opcional. En el formulario, el texto la presenta como informacion central.
- **Impacto para el usuario:** Se puede iniciar una tarea sin contexto base, produciendo una experiencia incompleta desde el primer paso.
- **Recomendacion concreta:** Marcar el campo como requerido o cambiar el copy para indicar explicitamente que es opcional.
- **Evidencia:** `auditoria-ux-ui-evidencias/19-legacy-name-only-validation.png`, `auditoria-ux-ui-evidencias/20-legacy-created-task-phase1.png`

### UX-012 `+ Agregar elemento` en legado duplica filas vacias sin validacion ni confirmacion

- **Severidad:** Medio
- **Categoria:** Formularios / UX
- **Ruta o pantalla:** `/legacy`, tarea creada, fase 1.
- **Ubicacion exacta en la interfaz:** Seccion `Mapa del problema`, boton `+ Agregar elemento`.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Clic en `+ Agregar elemento` con todos los campos vacios.
- **Comportamiento observado:** Se agrega otra fila vacia completa, sin mensaje de validacion, confirmacion ni limite visible.
- **Comportamiento esperado:** La accion deberia validar la fila actual o explicar que se pueden crear filas vacias.
- **Impacto para el usuario:** Facilita acumular estructura vacia y aumentar ruido visual.
- **Recomendacion concreta:** Validar antes de agregar o permitir filas vacias con un patron visual claro de borrado/estado pendiente.
- **Evidencia:** `auditoria-ux-ui-evidencias/21-legacy-add-element-empty.png`

### UX-013 Se muestran dos toasts identicos de `Guardado`

- **Severidad:** Medio
- **Categoria:** Feedback / UI
- **Ruta o pantalla:** `/tasks/ms53kfcd713c`
- **Ubicacion exacta en la interfaz:** Esquina superior derecha, notificaciones superpuestas.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Escribir en el chat `Necesito ayuda para completar la fase 1.` y enviar.
- **Comportamiento observado:** Aparecen dos notificaciones iguales: `Guardado - La tarea se actualizó sin salir del workspace.`
- **Comportamiento esperado:** Una sola notificacion por accion o agrupacion de eventos si hubo varias actualizaciones.
- **Impacto para el usuario:** Duplica ruido visual y puede ocultar contenido o controles.
- **Recomendacion concreta:** Deduplicar toasts por mensaje/accion en una ventana corta o convertirlos en un unico estado persistente.
- **Evidencia:** `auditoria-ux-ui-evidencias/31-workspace-chat-after-send.png`

### UX-014 El 404 usa idioma y estilo generico de framework

- **Severidad:** Medio
- **Categoria:** Contenido / Navegacion
- **Ruta o pantalla:** `/no-existe-auditoria`
- **Ubicacion exacta en la interfaz:** Pantalla completa de error.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Navegar a una ruta inexistente.
- **Comportamiento observado:** Muestra `404`, `Page not found` y enlace `Go back home` en ingles, con titulo de navegador `Nuxt`.
- **Comportamiento esperado:** Error localizado al idioma de la app, con tono y navegacion consistentes: `Volver al workspace`, `Ir a tareas`, etc.
- **Impacto para el usuario:** Rompe coherencia y reduce orientacion tras un error.
- **Recomendacion concreta:** Crear pagina 404 propia en espanol con enlaces de recuperacion relevantes.
- **Evidencia:** `auditoria-ux-ui-evidencias/11-not-found-desktop.png`

## Hallazgos Bajos

### UX-015 Las paginas modernas no definen titulo visible de navegador

- **Severidad:** Bajo
- **Categoria:** Contenido / Accesibilidad
- **Ruta o pantalla:** `/`, `/library`, `/reference`
- **Ubicacion exacta en la interfaz:** Pestana/titulo del navegador.
- **Viewport utilizado:** Escritorio 1440x900.
- **Accion realizada:** Abrir rutas modernas.
- **Comportamiento observado:** El titulo de documento aparece vacio en las rutas modernas auditadas; en legado si aparece `Bitácora — protocolo analítico asistido por IA`.
- **Comportamiento esperado:** Cada ruta deberia definir titulo contextual: `Bitácora - Workspace`, `Bitácora - Biblioteca`, etc.
- **Impacto para el usuario:** Peor orientacion en pestanas, historial y tecnologias asistivas.
- **Recomendacion concreta:** Configurar titulos por ruta y mantener consistencia entre shell moderno y legado.
- **Evidencia:** Observado durante captura de estados de `/`, `/library` y `/reference`.

### UX-016 El boton de envio del chat tiene nombre accesible en ingles y no tiene texto visible

- **Severidad:** Bajo
- **Categoria:** Accesibilidad / Contenido / UI
- **Ruta o pantalla:** `/tasks/ms53kfcd713c`
- **Ubicacion exacta en la interfaz:** Debajo del textarea `Escribe un mensaje para Tareas heredadas`, boton con icono de flecha.
- **Viewport utilizado:** Escritorio 1440x900 y movil 390x844.
- **Accion realizada:** Revisar controles del chat.
- **Comportamiento observado:** El control aparece como icono; su nombre accesible es `Send prompt`, en ingles.
- **Comportamiento esperado:** Nombre accesible y tooltip en espanol, por ejemplo `Enviar mensaje`.
- **Impacto para el usuario:** Inconsistencia linguistica y menor claridad para lectores de pantalla.
- **Recomendacion concreta:** Cambiar `aria-label` y tooltip a espanol; mantener icono, pero con etiqueta accesible localizada.
- **Evidencia:** `auditoria-ux-ui-evidencias/28-workspace-send-not-clickable.png`

### UX-017 La navegacion global y la navegacion lateral duplican destinos con comportamientos distintos

- **Severidad:** Bajo
- **Categoria:** Navegacion / UX
- **Ruta o pantalla:** `/`, `/library`, `/reference`
- **Ubicacion exacta en la interfaz:** Barra superior `Bitácora / Biblioteca / Referencia / Rollback legado` y sidebar `Tareas / Biblioteca / Referencias / Ajustes`.
- **Viewport utilizado:** Escritorio 1440x900 y movil 390x844.
- **Accion realizada:** Comparar enlaces y botones de navegacion.
- **Comportamiento observado:** `Referencia/Referencias` navega, `Biblioteca` global navega a una pantalla informativa, `Biblioteca` lateral no hace nada visible, `Ajustes` no hace nada visible.
- **Comportamiento esperado:** Destinos iguales deberian comportarse igual o estar diferenciados visualmente como seccion global vs overlay contextual.
- **Impacto para el usuario:** Aumenta carga cognitiva y dificulta aprender el sistema.
- **Recomendacion concreta:** Renombrar o agrupar: `Biblioteca global`, `Biblioteca de tarea`, `Configuracion del workspace`; usar enlaces o botones de forma consistente.
- **Evidencia:** `auditoria-ux-ui-evidencias/01-home-desktop.png`, `auditoria-ux-ui-evidencias/08-library-desktop.png`

## Resumen ejecutivo

La plataforma comunica un flujo principal claro: crear o seleccionar una tarea, conversar con un asistente, completar datos de etapa, evaluar y avanzar. Sin embargo, el flujo moderno queda bloqueado o muy friccionado en puntos esenciales: el estado vacio no permite crear tarea de forma efectiva, varios botones primarios no responden, y con una tarea real hay superposiciones que hacen que controles visibles no sean clicables.

La experiencia legado esta mas completa funcionalmente: permite crear tarea, muestra validacion basica y abre la fase 1. Aun asi, permite crear una tarea sin directiva cruda y deja agregar filas vacias sin validacion. En movil, el workspace moderno presenta problemas severos de layout: sidebar y contenido principal se mezclan, y el modal de creacion se corta.

## Cantidad de hallazgos por severidad

- Critico: 3
- Alto: 5
- Medio: 6
- Bajo: 3
- Total: 17

## Cantidad de hallazgos por categoria principal

- Funcionalidad: 5
- Navegacion: 5
- UX: 8
- UI: 7
- Responsive: 3
- Accesibilidad: 2
- Contenido: 5
- Formularios: 2
- Feedback: 1

Un hallazgo puede pertenecer a mas de una categoria.

## Flujo esperado frente al flujo actual

Flujo esperado:

1. El usuario entra al workspace.
2. Selecciona un proyecto o crea uno.
3. Crea una primera tarea desde `Nueva tarea` o `Crear primera tarea`.
4. Entra a la tarea.
5. Conversa con el asistente y completa datos de etapa.
6. Evalua el estado de la etapa.
7. Corrige faltantes y avanza.

Flujo actual observado:

1. El usuario entra al workspace y ve proyectos, pero varios estan vacios.
2. `Crear primera tarea` puede llevar a una pantalla sin formulario ni accion.
3. Varios botones `Nueva tarea`, `Biblioteca` y `Ajustes` no generan respuesta visible en el workspace vacio.
4. El legado si permite crear tarea, pero acepta una tarea sin directiva.
5. La tarea creada puede verse en el workspace moderno, pero hay superposiciones entre sidebar, chat, formulario y botones de evaluacion.
6. El chat responde y genera propuesta, pero duplica toasts de guardado.
7. En movil, el layout mezcla navegacion y contenido, por lo que el flujo queda confuso o parcialmente inutilizable.

## Cinco problemas prioritarios

1. Reparar el flujo moderno de creacion de tarea desde estado vacio.
2. Eliminar superposiciones que bloquean `Evaluar`, `Continuar`, `Avanzar` y controles laterales.
3. Rediseñar responsive movil del workspace con sidebar tipo drawer.
4. Unificar comportamiento de botones `Nueva tarea`, `Biblioteca` y `Ajustes`.
5. Corregir la barra lateral para que lista de tareas y footer no se tapen.

## Mejoras rapidas de alto impacto

- Convertir `/library` y `/tasks/new` en estados vacios accionables con CTA real.
- Deshabilitar visualmente botones sin comportamiento o agregar feedback `Proximamente` / `Selecciona una tarea`.
- Cambiar `Send prompt` a `Enviar mensaje`.
- Deduplicar toasts `Guardado`.
- Agregar pagina 404 en espanol con enlaces de recuperacion.
- Reservar espacio fijo para el footer del sidebar o hacerlo no sticky temporalmente.
- En movil, ocultar sidebar por defecto y mostrar solo boton de menu.

## Recomendaciones generales de diseno

- Priorizar claridad operacional sobre decoracion: el producto parece una herramienta de trabajo y necesita controles confiables, densidad ordenada y estados claros.
- Reducir duplicacion de navegacion. La misma palabra no deberia significar ruta, overlay o boton inactivo segun donde aparezca.
- Separar visualmente tres zonas: navegacion de tareas, conversacion y formulario de etapa. Actualmente compiten y se superponen.
- Hacer que cada estado vacio tenga una accion directa, no solo explicacion.
- Mantener jerarquia estable: titulo de proyecto/tarea, estado de etapa, accion primaria y feedback deben ocupar lugares predecibles.
- Revisar accesibilidad de nombres, idioma, foco y controles iconograficos.
- Probar con contenido real y nombres largos: la plataforma ya muestra cortes y solapes con textos normales.

## Aspectos que no pudieron verificarse y razon

- No se verifico una creacion completa de tarea en el workspace moderno desde cero porque el flujo inicial observado quedo bloqueado o sin accion visible.
- No se verifico avance exitoso de fase en el workspace moderno porque los datos requeridos no se completaron y algunos controles de avance/evaluacion estaban cubiertos o deshabilitados.
- No se verificaron permisos, autenticacion ni persistencia multiusuario porque no aparecen en la interfaz auditada.
- No se verifico causa tecnica de ningun fallo por instruccion explicita de no investigar codigo.
- No se probo borrado en legado para evitar una accion destructiva innecesaria durante la auditoria.
