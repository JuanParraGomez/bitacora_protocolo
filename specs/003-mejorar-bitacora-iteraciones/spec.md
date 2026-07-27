# Feature Specification: Bitácora de iteraciones guiada

**Feature Branch**: `codex/003-mejorar-bitacora-iteraciones`  
**Created**: 2026-07-26  
**Status**: Draft  
**Input**: Mejorar el criterio y la guía de la bitácora, revisar el protocolo analítico inicial, registrar iteraciones completas sin perder el contexto, consolidar criterios y comentarios en prompts guardables, e identificar prioridad, estado e impacto de cada punto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Analizar y encuadrar el problema antes de actuar (Priority: P1)

Como persona que inicia una tarea, quiero recorrer un protocolo analítico explícito en la primera parte de la bitácora para documentar el problema detectado, su evidencia y si debe reformularse antes de generar una guía de trabajo.

**Why this priority**: Si el problema no se entiende o se conserva sin revisión, los criterios, las iteraciones y los prompts posteriores pueden orientar trabajo sobre una premisa equivocada.

**Independent Test**: Crear o abrir una tarea, completar el protocolo por fases con una conclusión de mantener o reformular el problema y comprobar que la guía resultante presenta propósito, beneficio y utilidad basados en esa conclusión.

**Acceptance Scenarios**:

1. **Given** una tarea nueva o existente sin análisis inicial, **When** la persona abre la primera parte de la bitácora, **Then** ve fases separadas para describir el problema, registrar evidencia, analizar causas y decidir explícitamente si se mantiene o se modifica el problema.
2. **Given** evidencia que demuestra que el problema original es incorrecto o incompleto, **When** la persona selecciona reformularlo y escribe la nueva formulación, **Then** la guía y los prompts posteriores usan la formulación revisada en lugar de ocultar la decisión.
3. **Given** evidencia insuficiente para cambiar el problema, **When** la persona decide mantenerlo, **Then** se conserva el problema original junto con la justificación de esa decisión.
4. **Given** una tarea heredada sin decisión analítica, **When** la persona la abre, **Then** se muestra como pendiente de decisión y puede completarla sin perder datos previos.
5. **Given** una tarea heredada que ya está en guía, ejecución o revisión, **When** se repara para este cambio, **Then** conserva su progreso y recibe una decisión de compatibilidad que mantiene su problema original como vigente sin obligarla a volver a orientación.

---

### User Story 2 - Crear una guía accionable con criterios priorizados (Priority: P2)

Como persona que planifica una tarea, quiero que la guía explique su propósito, beneficios y utilidad respecto del análisis previo, y que cada criterio tenga prioridad, estado e impacto, para decidir qué atender primero de forma trazable.

**Why this priority**: Una guía clara transforma el análisis en trabajo utilizable y evita que los criterios sean una lista ambigua sin orden ni contexto.

**Independent Test**: Completar el análisis de una tarea, añadir criterios con sus tres etiquetas y verificar que la guía presenta su explicación, permite ordenarlos visualmente y conserva sus valores al volver a abrir la tarea.

**Acceptance Scenarios**:

1. **Given** una decisión registrada en el protocolo analítico, **When** la persona abre la guía, **Then** encuentra una explicación clara de qué propósito cumple la guía, qué beneficios aporta y cómo utiliza los hallazgos de la etapa anterior.
2. **Given** un criterio de guía, **When** la persona lo registra o modifica, **Then** puede asignarle una prioridad, un estado y un impacto de un conjunto de valores definidos por el producto.
3. **Given** varios criterios con etiquetas distintas, **When** la persona consulta la guía, **Then** puede identificar sin ambigüedad cuáles requieren atención prioritaria y cuáles están pendientes, en curso, resueltos o descartados.

---

### User Story 3 - Ejecutar y conservar iteraciones completas (Priority: P3)

Como persona que ejecuta una tarea, quiero añadir múltiples iteraciones completas sin que la interfaz vuelva al inicio de la bitácora, para registrar qué intenté, qué ocurrió, qué ajusté y los criterios/comentarios aplicables sin interrumpir mi trabajo.

**Why this priority**: La continuidad de la ejecución es necesaria para que la bitácora refleje el aprendizaje real; el reinicio del desplazamiento y la falta de campos por iteración rompen ese registro.

**Independent Test**: Con la vista desplazada hasta la zona de iteraciones, añadir dos iteraciones, rellenar sus campos y verificar que el foco o la posición permanece en la iteración nueva y que ambas se conservan tras recargar.

**Acceptance Scenarios**:

1. **Given** una persona situada en la sección de iteraciones, **When** agrega una iteración, **Then** la página no se desplaza al inicio y la nueva iteración queda visible y lista para recibir datos.
2. **Given** dos o más iteraciones, **When** la persona registra intento, resultado y ajuste en cada una, **Then** los datos se mantienen separados y se guardan con la tarea.
3. **Given** criterios y comentarios revisados durante la ejecución, **When** la persona llega al final de la bitácora, **Then** ve una copia de esos criterios con casillas de verificación y espacios para anotar mejoras por cada punto aplicable.

---

### User Story 4 - Usar y guardar prompts completos desde la bitácora (Priority: P4)

Como persona que trabaja con asistentes o herramientas externas, quiero que cada cajita de prompt incluya todos los criterios y comentarios revisados y pueda guardarse directamente desde ese lugar, para reutilizar una instrucción completa sin copiar información incompleta.

**Why this priority**: El prompt es el puente entre la reflexión de la bitácora y la ejecución asistida; perder criterios o requerir un guardado indirecto reduce su confiabilidad.

**Independent Test**: Rellenar criterios, comentarios e iteraciones, abrir cada prompt disponible y verificar que contiene los datos relevantes; guardarlo desde su propia cajita, recargar la tarea y comprobar que se mantiene sin necesidad de usar el botón general.

**Acceptance Scenarios**:

1. **Given** criterios y comentarios revisados en una tarea, **When** la persona genera un prompt de guía, ejecución o revisión, **Then** el texto incluye todos los criterios vigentes y los comentarios asociados que correspondan a esa etapa.
2. **Given** una cajita de prompt modificada, **When** la persona pulsa su acción de guardado directo, **Then** recibe confirmación de éxito o un error recuperable y el contenido queda disponible al reabrir la tarea.
3. **Given** campos vacíos, texto extenso o caracteres especiales en criterios y comentarios, **When** se genera o guarda un prompt, **Then** el contenido conserva los datos de forma legible y segura sin convertirlos en instrucciones ejecutables de la aplicación.
4. **Given** un prompt editado manualmente y datos fuente que cambian, **When** la persona vuelve a abrir la etapa, **Then** se conserva el texto guardado hasta que elija regenerarlo explícitamente a partir de los datos vigentes.

### Edge Cases

- Una tarea creada antes de la funcionalidad no tiene análisis, criterios etiquetados, comentarios ni metadatos de iteración; debe abrirse con valores seguros y editables.
- La persona agrega una iteración mientras hay cambios aún pendientes de guardado o el guardado falla; los datos visibles no deben desaparecer y debe haber una forma clara de reintentar.
- Una iteración se agrega cuando el navegador no puede mantener el foco o reducir movimiento está activado; el resultado debe seguir siendo accesible sin un salto inesperado al inicio.
- El problema se reformula más de una vez; la bitácora debe identificar la formulación vigente y conservar la justificación, sin mezclar silenciosamente criterios de formulaciones incompatibles.
- Un criterio o comentario contiene Markdown, HTML o caracteres especiales; su visualización y su inclusión en prompts/exportaciones no debe ejecutar contenido.
- No existen criterios aplicables al final de la bitácora; la sección duplicada debe explicar el estado vacío y permitir continuar sin crear casillas falsas.
- La persona cambia datos fuente después de editar un prompt manualmente; el prompt guardado no se sobrescribe sin una acción explícita de regeneración.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST presentar en la primera parte de la bitácora un protocolo analítico por fases que separe problema detectado, evidencia, análisis, decisión y formulación vigente.
- **FR-002**: El protocolo MUST requerir una decisión explícita y justificable entre mantener el problema detectado o reformularlo antes de habilitar la guía posterior.
- **FR-003**: Cuando se reformule el problema, el sistema MUST identificar la formulación revisada como vigente y conservar la razón y evidencia de la modificación.
- **FR-004**: La guía MUST explicar de manera visible su propósito, beneficios y utilidad como continuación del protocolo analítico anterior.
- **FR-005**: El sistema MUST permitir registrar criterios de la guía con texto, comentario revisado, prioridad, estado e impacto.
- **FR-006**: El sistema MUST conservar y mostrar las etiquetas de prioridad, estado e impacto de cada criterio de manera inequívoca al reabrir una tarea.
- **FR-007**: El sistema MUST permitir agregar, editar y conservar múltiples iteraciones, cada una con intento, resultado, ajuste y los metadatos necesarios para relacionarla con los criterios y comentarios pertinentes.
- **FR-008**: Al agregar una iteración, la interfaz MUST conservar el contexto de lectura de la persona: no puede reiniciar el desplazamiento de la bitácora al inicio y debe dejar accesible la iteración creada.
- **FR-009**: Al final de la bitácora, el sistema MUST mostrar una copia actualizada de los criterios aplicables con una casilla de verificación y un espacio para registrar una mejora por punto.
- **FR-010**: Las casillas y mejoras del resumen final MUST conservarse por tarea y no sustituir ni destruyen el criterio fuente ni su comentario.
- **FR-011**: El sistema MUST generar los prompts de cada etapa a partir de la información vigente de la tarea e incluir todos los criterios y comentarios revisados pertinentes, junto con la conclusión analítica y las iteraciones cuando correspondan.
- **FR-012**: Cada cajita de prompt MUST ofrecer una acción de guardado directo, con estado visible de éxito o fallo y posibilidad de reintentar.
- **FR-013**: El guardado directo de un prompt MUST persistir todos los cambios asociados de la tarea sin exigir que la persona use un control de guardado distinto.
- **FR-013a**: Un prompt editado manualmente MUST conservarse ante cambios en sus datos fuente hasta que la persona solicite regenerarlo de forma explícita; esa acción MUST mostrar qué datos vigentes se aplicaron.
- **FR-014**: El sistema MUST reparar de forma compatible las tareas almacenadas antes de esta funcionalidad, proporcionando valores iniciales seguros para los nuevos datos.
- **FR-014a**: Al reparar una tarea heredada ya situada en guía, ejecución o revisión, el sistema MUST conservar su fase y progreso y derivar una decisión de compatibilidad que mantenga como vigente su problema o directiva original; no puede bloquearla por una decisión inaccesible en orientación.
- **FR-015**: Los nuevos flujos MUST conservar la capacidad existente de avanzar entre fases, guardar tareas y generar el registro descargable, sin exponer contenido ingresado por usuarios como HTML ejecutable.

### Key Entities

- **Análisis de problema**: Registro por fases del problema inicial, evidencia, análisis, decisión de conservación o modificación, justificación y formulación vigente.
- **Criterio guiado**: Punto de evaluación asociado a la guía, con texto, comentario revisado, prioridad, estado, impacto y su seguimiento de mejora.
- **Iteración de ejecución**: Intento de trabajo con su resultado, ajuste, criterios/comentarios considerados y metadatos de seguimiento.
- **Resumen de mejora**: Copia de los criterios aplicables al final de la bitácora, con confirmación y nota de mejora que conserva vínculo con el criterio fuente.
- **Prompt de etapa**: Instrucción editable y guardable para guía, ejecución o revisión, compuesta con el análisis vigente y la información relevante de la tarea.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las tareas creadas o reparadas muestran una decisión explícita sobre mantener o reformular el problema antes de pasar de la etapa analítica a la guía.
- **SC-002**: En una prueba de recorrido, una persona puede identificar propósito, beneficio y utilidad de la guía y clasificar cinco criterios por prioridad, estado e impacto en menos de 5 minutos.
- **SC-003**: En pruebas automatizadas de interfaz, agregar una iteración desde una posición desplazada nunca deja la vista en el inicio de la bitácora y deja la iteración creada disponible para edición.
- **SC-004**: El 100% de los datos de al menos tres iteraciones, sus criterios y sus mejoras se conserva al guardar y reabrir una tarea.
- **SC-005**: Para cada etapa con prompt, una prueba de composición confirma que incluye el 100% de los criterios y comentarios revisados aplicables de la tarea.
- **SC-006**: El guardado desde cada cajita de prompt persiste cambios y comunica el resultado en una sola interacción, sin requerir el botón general de guardado.
- **SC-007**: Las tareas heredadas representativas abren sin error, conservan sus datos previos y adquieren valores seguros para todos los campos nuevos.

## Assumptions

- La primera parte de la bitácora corresponde a la fase de orientación actual; no se creará una fase adicional fuera del flujo de cuatro fases sin evidencia de que sea necesaria.
- La decisión de reformular no elimina el problema original ni su evidencia; preserva trazabilidad dentro de la misma tarea.
- Los valores permitidos para prioridad, estado e impacto se definirán en el plan de acuerdo con el vocabulario más pequeño que permita priorizar de forma consistente.
- Los criterios duplicados al final representan seguimiento y mejora, no una segunda fuente independiente de criterios.
- Los prompts siguen siendo texto editable de la tarea y se guardan en el almacenamiento existente; no se incorpora un proveedor de IA ni un servicio externo.
- Una tarea heredada en orientación inicia el análisis con decisión `pendiente`; solo `mantener` o `reformular` son decisiones que habilitan la fase de guía. Las tareas heredadas ya en fases 2–4 reciben una decisión de compatibilidad `mantener` basada en su problema o directiva original para preservar el progreso sin bloquearlas.
- Esta entrega no rediseña de forma general la aplicación ni cambia los contratos de almacenamiento públicos; la compatibilidad de tareas existentes es obligatoria.
