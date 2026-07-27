# Feature Specification: Espacio de trabajo guiado por IA

**Feature Branch**: `codex/005-workspace-ai-guiado`

**Created**: 2026-07-27

**Status**: Draft

**Input**: Reorganizar la experiencia como un dashboard de tres paneles: tareas y ajustes a la izquierda, chat contextual en el centro y formulario guiado de cuatro fases a la derecha. El prompt deja de ser visible; la persona conversa para nutrir el formulario, evalúa cada fase y recibe observaciones iterativas hasta habilitar la continuación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trabajar en un dashboard de tres paneles (Priority: P1)

Como persona que desarrolla un proyecto, quiero ver mis tareas, la conversación activa y el formulario de la fase en un mismo espacio, para mantener contexto y avanzar sin cambiar repetidamente de pantalla.

**Why this priority**: La distribución unificada es la base sobre la que funcionan la conversación, el formulario y la evaluación. Sin ella, la experiencia continúa fragmentada y no entrega el cambio visual solicitado.

**Independent Test**: Abrir una tarea existente y comprobar que se puede seleccionar otra tarea, conversar y editar el formulario vigente desde las tres regiones identificables; repetir la prueba en una vista estrecha y con teclado.

**Acceptance Scenarios**:

1. **Given** una persona con tareas guardadas, **When** abre el espacio de trabajo, **Then** ve una navegación de tareas, el chat de la tarea activa y el formulario de su fase vigente en regiones distinguibles.
2. **Given** tareas en distintos estados, **When** consulta la navegación lateral, **Then** las encuentra agrupadas por estado y puede identificar la tarea activa.
3. **Given** la necesidad de iniciar otro trabajo, **When** activa «Nueva tarea», **Then** accede al flujo de creación sin perder accidentalmente cambios pendientes de la tarea actual.
4. **Given** una pantalla estrecha, zoom elevado o navegación por teclado, **When** recorre el espacio, **Then** las tres regiones permanecen accesibles en un orden lógico y ninguna acción esencial queda fuera de alcance.

---

### User Story 2 - Nutrir el formulario mediante conversación (Priority: P2)

Como persona que completa una fase, quiero conversar con un asistente que conoce la tarea y el formulario vigente, para transformar mis respuestas en información estructurada sin redactar ni editar prompts.

**Why this priority**: La conversación reemplaza el prompt visible y reduce la carga de entender cómo instruir a la IA; mantiene a la persona enfocada en el contenido del proyecto.

**Independent Test**: Iniciar una conversación en cada fase, responder preguntas relevantes y comprobar que solo los campos correspondientes se proponen o actualizan, permanecen editables y se conservan al reabrir la tarea.

**Acceptance Scenarios**:

1. **Given** una tarea y fase activas, **When** la persona abre el chat, **Then** recibe un mensaje inicial y sugerencias relacionadas con el contexto y los campos incompletos de esa fase.
2. **Given** una respuesta que aporta información a uno o más campos, **When** el asistente la procesa, **Then** el formulario derecho refleja claramente los valores propuestos o actualizados sin modificar campos ajenos a la fase.
3. **Given** un valor aportado por el chat, **When** la persona lo edita directamente en el formulario, **Then** su edición prevalece y queda disponible para la conversación posterior.
4. **Given** un cambio de tarea o de fase, **When** continúa la conversación, **Then** los mensajes, sugerencias y actualizaciones se mantienen asociados al contexto correcto.
5. **Given** contenido vacío, muy extenso o con instrucciones incrustadas, **When** se muestra en el chat o formulario, **Then** se trata como contenido de usuario y no altera la interfaz ni ejecuta acciones.

---

### User Story 3 - Evaluar e iterar hasta poder continuar (Priority: P3)

Como persona que termina de responder una fase, quiero solicitar una evaluación que señale vacíos, riesgos y puntos débiles, para mejorar mis respuestas hasta alcanzar un resultado aceptable antes de avanzar.

**Why this priority**: El ciclo de evaluación convierte el formulario en una guía de calidad y conserva la intención de los criterios y prompts analíticos existentes sin exponerlos como texto editable.

**Independent Test**: Completar parcialmente una fase, evaluar, aplicar observaciones mediante chat o formulario, reevaluar y comprobar que «Continuar» solo se habilita al obtener un resultado aceptable.

**Acceptance Scenarios**:

1. **Given** una fase con información insuficiente, **When** la persona selecciona «Evaluar», **Then** recibe un resultado no aceptable con puntos débiles y acciones concretas de mejora.
2. **Given** una evaluación no aceptable, **When** la persona conversa o edita el formulario, **Then** puede volver a evaluar sin perder las respuestas ni el historial de observaciones.
3. **Given** una fase que satisface los criterios vigentes, **When** finaliza la evaluación, **Then** se marca como aceptable, el indicador superior refleja que está lista y se habilita «Continuar».
4. **Given** una evaluación pendiente, fallida o desactualizada por cambios posteriores, **When** la persona intenta avanzar, **Then** «Continuar» permanece deshabilitado y se explica la acción necesaria.
5. **Given** la última fase aceptada, **When** la persona continúa, **Then** la tarea pasa al estado completado y conserva su historial de evaluaciones.

---

### User Story 4 - Elegir el modo de asistencia (Priority: P4)

Como persona usuaria, quiero escoger desde Ajustes si trabajaré mediante una conexión con Codex o mediante DeepSeek API, para preparar el espacio según el proveedor que usaré cuando las integraciones estén disponibles.

**Why this priority**: La selección hace visible el modo de trabajo previsto, pero no bloquea la validación del flujo frontend ni requiere adelantar la integración de proveedores.

**Independent Test**: Abrir Ajustes, alternar entre Codex y DeepSeek, cerrar y reabrir el diálogo y comprobar que la selección se conserva y que los estados no disponibles se explican sin solicitar secretos en el MVP.

**Acceptance Scenarios**:

1. **Given** cualquier tarea abierta, **When** la persona activa «Ajustes», **Then** se abre un diálogo de configuración sin abandonar el espacio de trabajo.
2. **Given** el diálogo abierto, **When** revisa los modos disponibles, **Then** puede escoger entre «Conectarse a Codex» y «Usar DeepSeek API» y entiende cuál está seleccionado.
3. **Given** una selección guardada, **When** vuelve a abrir Ajustes o recarga la aplicación, **Then** el modo elegido permanece visible.
4. **Given** que la integración real está fuera del MVP, **When** intenta completar una conexión, **Then** la interfaz comunica que la conexión se incorporará en una entrega posterior y no solicita ni almacena credenciales.

### Edge Cases

- No existen tareas: la navegación muestra un estado vacío con una acción clara para crear la primera.
- Una tarea guardada usa el modelo anterior con prompts visibles: conserva sus datos de las cuatro fases, pero los prompts dejan de mostrarse como campos editables.
- La tarea activa se elimina, completa o deja de estar disponible desde otra sesión: el espacio selecciona un estado seguro y no mezcla su conversación con otra tarea.
- El chat está vacío, enviando, sin respuesta o en error: el formulario sigue siendo editable y el mensaje se puede reintentar sin duplicarlo.
- Una evaluación termina después de que la persona cambió respuestas: el resultado antiguo se marca como desactualizado y no habilita la continuación.
- La evaluación devuelve observaciones incompletas o no estructuradas: se muestra un error recuperable y no se altera el estado aceptable anterior sin confirmación válida.
- Cambiar el modo de asistencia no elimina mensajes, respuestas, evaluaciones ni progreso.
- Texto largo en mensajes, sugerencias u observaciones no rompe la distribución ni oculta acciones.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST presentar el espacio de tarea mediante tres regiones: navegación lateral, conversación central y formulario guiado de la fase vigente.
- **FR-002**: La navegación lateral MUST mostrar el proyecto activo, agrupar las tareas por estado, identificar la tarea seleccionada y ofrecer una acción visible para crear una nueva tarea.
- **FR-003**: La navegación lateral MUST ofrecer una acción «Ajustes» que abra un diálogo sin abandonar la tarea.
- **FR-004**: El diálogo de ajustes MUST permitir seleccionar exactamente uno de los modos iniciales: conexión con Codex o uso de DeepSeek API.
- **FR-005**: El MVP MUST conservar la selección del modo de asistencia, comunicar el estado diferido de las conexiones reales y MUST NOT solicitar ni almacenar credenciales.
- **FR-006**: La conversación central MUST mostrar mensajes de la persona y del asistente, sugerencias contextuales, estado de envío, recuperación de errores y un campo de composición.
- **FR-007**: El asistente MUST recibir como contexto funcional la tarea activa, la fase vigente, los valores actuales del formulario y las evaluaciones previas de esa fase.
- **FR-008**: Las respuestas conversacionales MUST poder proponer o actualizar datos de la fase vigente de forma visible, conservando la posibilidad de edición directa por la persona.
- **FR-009**: El sistema MUST impedir que una conversación, sugerencia o actualización de formulario se aplique a una tarea o fase distinta de aquella que la originó.
- **FR-010**: El formulario derecho MUST conservar los campos y reglas de las cuatro fases existentes: Orientación, Guía, Ejecución y Revisión.
- **FR-011**: El formulario MUST mostrar la fase, el avance dentro de ella, controles de selección y texto según corresponda, y acciones de navegación coherentes con el progreso.
- **FR-012**: Los prompts de fase MUST dejar de mostrarse como campos editables; sus valores heredados se conservan como datos inertes y únicamente un catálogo interno confiable puede aportar instrucciones equivalentes a la conversación o evaluación.
- **FR-013**: La acción «Evaluar» MUST analizar los valores vigentes mediante los criterios analíticos existentes y devolver estado, puntos débiles y recomendaciones accionables.
- **FR-014**: Cada evaluación MUST quedar asociada a la tarea, fase y versión de respuestas que evaluó.
- **FR-015**: Una modificación posterior del formulario MUST marcar como desactualizada cualquier aceptación basada en valores anteriores.
- **FR-016**: La acción «Continuar» MUST permanecer deshabilitada hasta que la evaluación vigente de la fase sea aceptable.
- **FR-017**: Al continuar, el sistema MUST conservar respuestas, conversación y evaluaciones, y activar la fase siguiente o completar la tarea después de la fase final.
- **FR-018**: La persona MUST poder repetir el ciclo de conversación, edición y evaluación tantas veces como sea necesario sin perder iteraciones anteriores.
- **FR-019**: El sistema MUST conservar la compatibilidad con tareas existentes y no eliminar datos previos al ocultar los campos de prompt.
- **FR-020**: Las tres regiones y sus acciones esenciales MUST ser utilizables mediante teclado, zoom elevado y vistas desde 320 píxeles de ancho.
- **FR-021**: El sistema MUST comunicar estados vacíos, carga, envío, evaluación, error recuperable, aceptación y contenido desactualizado mediante texto comprensible, no únicamente mediante color.
- **FR-022**: Todo contenido aportado por la persona o generado por el asistente MUST mostrarse como contenido seguro, sin ejecutar instrucciones incrustadas como interfaz.

### Key Entities

- **Proyecto activo**: Identidad visible del espacio de trabajo que contextualiza la lista de tareas; en el MVP es una etiqueta de presentación, no una entidad persistida ni una nueva jerarquía de datos.
- **Tarea**: Unidad de trabajo con nombre, estado, fase actual, respuestas, conversación y evaluaciones asociadas.
- **Fase**: Una de las cuatro etapas ordenadas —Orientación, Guía, Ejecución y Revisión— con campos, progreso y estado de aceptación propios.
- **Hilo de conversación**: Secuencia ordenada de mensajes, sugerencias y estados asociada a una tarea y capaz de referirse a la fase vigente.
- **Mensaje**: Aporte de la persona o del asistente con autor, contenido, estado y contexto de origen.
- **Actualización propuesta**: Relación explícita entre una respuesta conversacional y uno o más campos de la fase.
- **Evaluación de fase**: Resultado versionado con estado, puntos débiles, recomendaciones y referencia a las respuestas evaluadas.
- **Configuración de asistencia**: Selección persistida entre Codex y DeepSeek, sin credenciales en el MVP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las tareas de prueba puede abrirse, cambiarse y crearse desde la navegación lateral en un máximo de tres acciones.
- **SC-002**: El 100% de los campos existentes de las cuatro fases permanece disponible y editable desde el formulario guiado.
- **SC-003**: En pruebas de los cuatro flujos, cada respuesta conversacional aplicada actualiza únicamente los campos esperados de la tarea y fase correctas.
- **SC-004**: El 100% de las evaluaciones no aceptables de prueba mantiene «Continuar» deshabilitado y muestra al menos un punto débil con una recomendación.
- **SC-005**: El 100% de las evaluaciones aceptables vigentes habilita «Continuar», mientras que cualquier cambio posterior lo vuelve a deshabilitar hasta reevaluar.
- **SC-006**: Una persona puede completar el ciclo responder, evaluar, corregir y continuar sin abandonar el espacio de trabajo ni manipular un prompt visible.
- **SC-007**: En una vista de 320 píxeles y con zoom del 200%, todas las regiones y acciones esenciales son alcanzables por teclado sin pérdida de información.
- **SC-008**: La selección Codex o DeepSeek se conserva en el 100% de las pruebas de cierre y reapertura del diálogo y de recarga de la aplicación.
- **SC-009**: Al menos 9 de 10 participantes de una prueba guiada identifican correctamente dónde conversar, dónde completar respuestas y cómo saber si pueden continuar.
- **SC-010**: El 100% de las tareas heredadas de prueba abre con sus datos de fase intactos y sin mostrar prompts editables.

## Assumptions

- La primera entrega prioriza una experiencia frontend completa y verificable con adaptadores controlados; las conexiones reales con proveedores se incorporarán después.
- «Conectarse a Codex» y «Usar DeepSeek API» son las únicas opciones iniciales; agregar otros proveedores queda fuera de alcance.
- Ningún secreto, token o clave se solicita o persiste hasta que exista una integración segura de backend.
- Los campos, reglas de completitud y datos guardados de las cuatro fases actuales se reutilizan en lugar de crear un cuestionario paralelo.
- Los prompts analíticos existentes se normalizarán posteriormente como instrucciones internas; dejan de ser contenido que la persona edita o guarda desde la interfaz.
- La aceptación combina la completitud determinista vigente con una evaluación estructurada; una evaluación nunca omite campos obligatorios.
- El historial conversacional se separa por tarea y las evaluaciones se separan además por fase.
- La adaptación móvil puede reorganizar los paneles en navegación secuencial siempre que conserve el mismo orden lógico y todas las capacidades.
- El proyecto activo se representa inicialmente mediante una etiqueta estable del espacio; crear y administrar múltiples proyectos persistidos queda fuera de este alcance.

## Scope Boundaries

### Included

- Nueva estructura visual y navegación del espacio de tarea.
- Estados frontend de conversación, sugerencias, actualizaciones propuestas y evaluación iterativa.
- Reutilización de formularios y datos de las cuatro fases.
- Diálogo de ajustes y persistencia de la opción de proveedor.
- Contratos internos que permitan conectar proveedores y orquestación en una entrega posterior.

### Deferred

- Autenticación o conexión real con Codex.
- Captura, almacenamiento o uso real de una clave de DeepSeek.
- Ejecución remota de modelos, cobro, cuotas, streaming real o reintentos de proveedor.
- Grafo multiagente y orquestación LangGraph en producción.
- Acceso autónomo del asistente a archivos o recursos fuera del proyecto y tarea activos.
