# Feature Specification: Correcciones UX/UI del workspace

**Feature Branch**: `codex/007-fix-workspace-ux`

**Created**: 2026-07-28

**Status**: Draft

**Input**: Auditoria de caja negra documentada en `auditoria-ux-ui.md` y evidencias visuales de `auditoria-ux-ui-evidencias/`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear la primera tarea sin bloqueos (Priority: P1)

Como persona que abre un proyecto nuevo, quiero iniciar y completar la creacion de una tarea desde cualquier llamada a la accion para entrar directamente en un workspace utilizable.

**Why this priority**: La creacion es la puerta de entrada al producto. UX-001, UX-004 y UX-007 bloquean o dificultan esta accion esencial.

**Independent Test**: Con un proyecto activo sin tareas, activar `Crear primera tarea` o `Nueva tarea`, completar datos validos y comprobar que se crea exactamente una tarea y se abre su workspace.

**Acceptance Scenarios**:

1. **Given** un proyecto activo sin tareas, **When** la persona activa `Crear primera tarea`, **Then** ve un formulario de creacion operativo con el proyecto preseleccionado.
2. **Given** el formulario abierto, **When** la persona envia datos validos, **Then** se crea una sola tarea y se abre su workspace.
3. **Given** el formulario abierto con cambios, **When** la persona intenta cerrarlo, **Then** puede conservar el formulario o confirmar el descarte y regresar al contexto anterior.
4. **Given** que nombre y directiva estan vacios, **When** la persona intenta crear la tarea, **Then** permanece en el formulario y recibe un mensaje asociado al grupo de campos que debe completar.
5. **Given** un viewport movil de 390 x 844, **When** se abre el formulario, **Then** el titulo, cierre, campos, errores y accion primaria permanecen visibles y utilizables sin desplazamiento horizontal.

---

### User Story 2 - Operar el workspace sin capas que bloqueen controles (Priority: P1)

Como persona que trabaja en una tarea, quiero utilizar conversacion, formulario, evaluacion y navegacion lateral sin que una region visual cubra otra.

**Why this priority**: UX-002, UX-008 y UX-010 pueden impedir evaluar, continuar, avanzar o gestionar tareas aunque los controles parezcan disponibles.

**Independent Test**: Abrir una tarea con contenido suficiente, usar por puntero y teclado los controles visibles, desplazar la barra lateral y comprobar que cada control recibe la interaccion esperada.

**Acceptance Scenarios**:

1. **Given** una tarea activa, **When** la persona activa `Evaluar`, `Continuar`, `Avanzar`, enviar mensaje, crear o renombrar, **Then** el control responde o muestra una razon visible para no continuar.
2. **Given** contenido largo en conversacion y formulario, **When** la persona desplaza cada region, **Then** ninguna etiqueta, footer, chat o panel intercepta controles de otra region.
3. **Given** varias tareas y proyectos, **When** la lista lateral excede su altura, **Then** la lista puede desplazarse y el footer no tapa la ultima tarea ni sus acciones.
4. **Given** un renombrado en curso, **When** la persona desplaza la navegacion, **Then** el campo, `Cancelar` y `Guardar` permanecen agrupados y alcanzables.

---

### User Story 3 - Navegar con claridad en escritorio, tablet y movil (Priority: P1)

Como persona que usa la plataforma en distintos dispositivos, quiero distinguir la navegacion del contenido y llegar a biblioteca, ajustes y tareas mediante destinos consistentes.

**Why this priority**: UX-003, UX-005, UX-006, UX-009 y UX-017 afectan orientacion, acceso a funciones y responsive.

**Independent Test**: Recorrer home, tarea, biblioteca y ajustes en 1440 x 900, 1024 x 768 y 390 x 844, comprobando destino, estado activo, retorno y ausencia de solapes.

**Acceptance Scenarios**:

1. **Given** un viewport movil, **When** se abre el workspace, **Then** la navegacion lateral esta cerrada y el contenido principal ocupa un plano unico.
2. **Given** la navegacion movil cerrada, **When** se activa su control, **Then** se abre como panel identificable, puede cerrarse y devuelve el foco al control de origen.
3. **Given** un viewport de escritorio, **When** se activa `Contraer navegacion`, **Then** cambia visiblemente el ancho y el estado del control, y puede restaurarse.
4. **Given** cualquier acceso contextual llamado `Biblioteca`, **When** se activa, **Then** abre contenido utilizable dentro del workspace.
5. **Given** la ruta `/library` sin una tarea abierta, **When** se carga, **Then** muestra un estado accionable que permite volver al workspace o abrir una tarea disponible.
6. **Given** cualquier acceso llamado `Ajustes`, **When** se activa, **Then** abre el mismo destino contextual o comunica de forma explicita que no esta disponible.
7. **Given** nombres largos y contenido real, **When** se usan los tres viewports objetivo, **Then** no aparecen controles fuera de pantalla ni desplazamiento horizontal involuntario.

---

### User Story 4 - Comprender y corregir entradas invalidas (Priority: P2)

Como persona que utiliza el flujo heredado, quiero saber que datos son obligatorios y evitar crear estructuras vacias por accidente.

**Why this priority**: UX-011 y UX-012 no bloquean el flujo moderno, pero generan ambiguedad y datos vacios en una ruta que permanece accesible.

**Independent Test**: Abrir la creacion heredada, revisar la obligatoriedad de cada campo e intentar enviar y agregar elementos vacios repetidamente.

**Acceptance Scenarios**:

1. **Given** el formulario heredado de nueva tarea, **When** se muestra `Directiva cruda`, **Then** se identifica expresamente como opcional y la persona puede crear una tarea solo con nombre sin interpretar el resultado como omision accidental.
2. **Given** que faltan todos los datos requeridos, **When** se envia el formulario, **Then** se bloquea la creacion y se muestra un error junto al campo correspondiente.
3. **Given** una fila de elemento vacia, **When** la persona activa `+ Agregar elemento`, **Then** no se acumula otra fila vacia y se indica como completar o eliminar la actual.
4. **Given** una fila con datos validos, **When** la persona agrega otra, **Then** aparece una sola fila nueva y ambas pueden gestionarse de forma independiente.

---

### User Story 5 - Recibir feedback accesible, localizado y no duplicado (Priority: P2)

Como persona que navega o guarda cambios, quiero mensajes unicos, comprensibles y accesibles para saber que ocurrio y como continuar.

**Why this priority**: UX-013, UX-014, UX-015 y UX-016 reducen confianza, orientacion y accesibilidad transversal.

**Independent Test**: Guardar una vez, enviar un mensaje por teclado, abrir rutas modernas y una ruta inexistente, y revisar nombres accesibles, idioma y titulos.

**Acceptance Scenarios**:

1. **Given** una accion que se guarda correctamente, **When** finaliza, **Then** aparece una sola notificacion `Guardado` para esa operacion.
2. **Given** una ruta inexistente, **When** se carga, **Then** el mensaje esta en espanol y ofrece una accion para regresar al workspace.
3. **Given** las rutas `/`, `/library`, `/reference` y `/tasks/:id`, **When** se cargan, **Then** cada una expone un titulo de documento contextual y no vacio.
4. **Given** el compositor del chat, **When** una tecnologia de asistencia inspecciona el boton de envio, **Then** su nombre accesible esta en espanol y describe la accion `Enviar mensaje`.
5. **Given** cualquier control solo con icono, **When** recibe foco o se inspecciona con tecnologia de asistencia, **Then** presenta nombre accesible, foco visible y descripcion breve cuando sea necesaria.

### Edge Cases

- No existe ningun proyecto: el flujo de tarea debe orientar primero a crear un proyecto y conservar una siguiente accion clara.
- El proyecto seleccionado se archiva o desaparece mientras el formulario esta abierto: la creacion debe detenerse y pedir una seleccion valida sin perder los datos introducidos.
- Clic o envio repetido mientras se crea o guarda: debe producir una sola tarea o una sola operacion visible.
- Navegacion atras, adelante o recarga con un overlay abierto: la interfaz debe restaurar un estado coherente y cerrable.
- Nombres de proyecto y tarea de hasta 160 caracteres: deben truncarse de forma legible sin tapar acciones.
- Teclado visible en movil y zoom del 200%: el campo activo y la accion primaria deben seguir alcanzables.
- Listas vacias y busquedas sin coincidencias: deben mostrar un estado explicito, no una region aparentemente rota.
- Fallo de lectura o guardado: debe conservar el trabajo editable cuando sea posible y ofrecer reintento.
- Un control legitimamente no disponible por reglas de la etapa debe mostrarse deshabilitado y explicar la condicion; no debe parecer cubierto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todas las acciones visibles `Crear primera tarea` y `Nueva tarea` MUST iniciar el mismo contrato de creacion de tarea.
- **FR-002**: El flujo de creacion MUST ser operativo cuando el proyecto no tenga tareas previas.
- **FR-003**: El flujo de creacion MUST preseleccionar el proyecto desde el que fue invocado.
- **FR-004**: La creacion moderna MUST exigir contenido no vacio en nombre o directiva, y asociar el error al grupo de campos cuando ambos esten vacios.
- **FR-005**: Una activacion valida de creacion MUST producir exactamente una tarea, incluso ante clics o envios repetidos.
- **FR-006**: Cerrar un formulario modificado MUST solicitar confirmacion antes de descartar datos.
- **FR-007**: Los controles visibles del workspace MUST recibir interaccion por puntero y teclado sin ser interceptados por regiones superpuestas.
- **FR-008**: Todo control no disponible MUST mostrar un estado deshabilitado perceptible y una razon accesible.
- **FR-009**: La conversacion, el formulario guiado y la navegacion MUST conservar limites visuales y de desplazamiento independientes.
- **FR-010**: El footer lateral MUST permanecer separado del contenido desplazable y no ocultar la ultima accion o tarea.
- **FR-011**: Los formularios de renombrado MUST mantener campo y acciones agrupados durante desplazamiento y cambios de viewport.
- **FR-012**: En movil, la navegacion MUST abrirse en un panel separado del contenido principal y estar cerrada inicialmente.
- **FR-013**: El panel de navegacion movil MUST cerrarse por control visible, tecla Escape y seleccion de destino, devolviendo el foco cuando corresponda.
- **FR-014**: La navegacion MUST evitar desplazamiento horizontal involuntario desde 320 px de ancho.
- **FR-015**: `Contraer navegacion` MUST cambiar de forma perceptible el ancho, contenido y estado del control; si la capacidad no esta disponible, el control MUST ocultarse.
- **FR-016**: Los accesos contextuales a `Biblioteca` MUST abrir una biblioteca utilizable sin desmontar la tarea activa.
- **FR-017**: `/library` MUST ofrecer contenido accionable o una salida directa hacia una tarea o el workspace.
- **FR-018**: Todos los accesos `Ajustes` MUST abrir un destino consistente o comunicar explicitamente su indisponibilidad.
- **FR-019**: Controles con el mismo texto MUST representar la misma accion; acciones diferentes MUST tener nombres diferenciables.
- **FR-020**: La interfaz MUST mostrar estados explicitos para listas vacias, busquedas sin resultados, carga, exito y error.
- **FR-021**: En el flujo heredado, `Directiva cruda` MUST mostrarse como campo opcional.
- **FR-022**: El flujo heredado MUST exigir un nombre de tarea no vacio y mostrar el error junto al campo.
- **FR-023**: `+ Agregar elemento` MUST impedir la acumulacion silenciosa de filas vacias y permitir eliminar una fila no deseada.
- **FR-024**: Cada operacion de guardado MUST generar como maximo una notificacion de exito visible.
- **FR-025**: Las notificaciones MUST distinguir exito y error, permitir cierre y ofrecer reintento cuando la operacion sea recuperable.
- **FR-026**: La pagina de ruta inexistente MUST estar en espanol y ofrecer retorno al workspace.
- **FR-027**: Cada ruta moderna MUST definir un titulo de documento contextual y no vacio.
- **FR-028**: El boton de envio del chat MUST tener el nombre accesible `Enviar mensaje`.
- **FR-029**: Los controles iconograficos MUST tener nombre accesible en espanol y foco visible.
- **FR-030**: La interfaz MUST conservar contenido legible y controles utilizables en 1440 x 900, 1024 x 768, 390 x 844, 320 px de ancho y zoom del 200%.
- **FR-031**: Las pruebas de aceptacion MUST cubrir puntero, teclado, recarga, atras/adelante, clic repetido, errores recuperables y los tres viewports principales.
- **FR-032**: Cada requisito MUST mantener trazabilidad con al menos uno de los hallazgos UX-001 a UX-017 y, cuando exista, con su captura citada.

### Key Entities

- **Contexto de workspace**: Proyecto y tarea activos, etapa, estado de navegacion y overlay abierto que determinan la orientacion visible.
- **Solicitud de creacion moderna**: Proyecto seleccionado, nombre, directiva y posible plantilla; nombre o directiva deben aportar contenido y una solicitud solo puede producir una tarea.
- **Estado de navegacion**: Modalidad expandida, contraida o panel movil, junto con el control que debe recuperar el foco.
- **Aviso de operacion**: Mensaje unico de exito, informacion o error vinculado a una operacion observable y a una posible accion de reintento.
- **Fila heredada editable**: Elemento de formulario que puede estar vacio, valido o pendiente de correccion, y que puede eliminarse.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las entradas `Crear primera tarea` y `Nueva tarea` permiten completar una tarea valida sin llegar a una pantalla sin siguiente accion.
- **SC-002**: En pruebas de puntero y teclado, el 100% de los controles visibles objetivo reciben la interaccion; ningun clic es interceptado por otra region.
- **SC-003**: Los recorridos principales de creacion, navegacion, guardado y recuperacion se completan sin desplazamiento horizontal ni solapes en los tres viewports principales y a 320 px.
- **SC-004**: Una operacion de guardado genera exactamente una notificacion de exito y una creacion repetidamente activada genera exactamente una tarea.
- **SC-005**: El 100% de las rutas modernas auditadas presentan titulo contextual, y la ruta inexistente presenta contenido de recuperacion en espanol.
- **SC-006**: El 100% de los controles iconograficos y de envio auditados tienen nombre accesible en espanol y foco visible.
- **SC-007**: Los 17 hallazgos de la auditoria quedan cubiertos por pruebas de aceptacion repetibles o por una limitacion documentada y aprobada.
- **SC-008**: Cinco participantes que no conozcan el producto pueden crear una primera tarea y regresar al workspace desde biblioteca o un error de ruta; al menos cuatro completan cada recorrido sin ayuda.

## Assumptions

- La auditoria del 2026-07-28 es la linea base observable; las capturas son evidencia, no una referencia pixel-perfect.
- El flujo moderno y `/legacy` permanecen disponibles; esta feature no elimina ni migra datos heredados.
- En el flujo heredado, el nombre es obligatorio y `Directiva cruda` es opcional para conservar compatibilidad. En el flujo moderno, nombre o directiva deben aportar contenido.
- Biblioteca es contextual cuando existe una tarea activa; `/library` funciona como entrada global con una salida accionable.
- Ajustes conserva el alcance de asistencia existente y no introduce nuevas preferencias.
- No se añaden autenticacion, permisos, colaboracion multiusuario ni operaciones destructivas.
- Los viewports de aceptacion usan dimensiones CSS reproducibles y un navegador actual con escala de pagina normal, complementados con zoom al 200%.
- La feature corrige presentacion e interaccion sin cambiar las reglas de negocio de evaluacion o avance de etapas.

## Traceability

| Hallazgo | Requisitos principales | Evidencia |
|---|---|---|
| UX-001 | FR-001, FR-002, FR-003, FR-004, FR-005 | `02-new-task-desktop.png` |
| UX-002 | FR-007, FR-008, FR-009, FR-031 | `27-workspace-tareas-heredadas-with-task.png`, `28-workspace-send-not-clickable.png` |
| UX-003 | FR-012, FR-013, FR-014, FR-030, FR-031 | `23-home-mobile.png` |
| UX-004 | FR-001, FR-002, FR-004, FR-005, FR-020 | `03-home-after-main-buttons.png`, `15-sidebar-new-task-no-effect.png` |
| UX-005 | FR-016, FR-018, FR-019 | `03-home-after-main-buttons.png` |
| UX-006 | FR-017, FR-020 | `08-library-desktop.png` |
| UX-007 | FR-006, FR-030 | `24-new-task-mobile.png` |
| UX-008 | FR-009, FR-010 | `27-workspace-tareas-heredadas-with-task.png` |
| UX-009 | FR-015 | `04-sidebar-collapsed.png` |
| UX-010 | FR-011 | `06-rename-sd.png`, `07-rename-sd-scrolled.png` |
| UX-011 | FR-021, FR-022 | `19-legacy-name-only-validation.png`, `20-legacy-created-task-phase1.png` |
| UX-012 | FR-023 | `21-legacy-add-element-empty.png` |
| UX-013 | FR-024, FR-025 | `31-workspace-chat-after-send.png` |
| UX-014 | FR-026 | `11-not-found-desktop.png` |
| UX-015 | FR-027 | Auditoria textual; sin captura exclusiva |
| UX-016 | FR-028, FR-029 | `28-workspace-send-not-clickable.png` |
| UX-017 | FR-016, FR-017, FR-018, FR-019, FR-032 | `01-home-desktop.png`, `08-library-desktop.png`, `09-reference-desktop.png` |
