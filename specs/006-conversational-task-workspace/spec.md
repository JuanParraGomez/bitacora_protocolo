# Feature Specification: Workspace conversacional de soluciones repetibles

**Feature Branch**: `codex/006-conversational-task-workspace`

**Created**: 2026-07-27

**Status**: Draft

**Input**: Replantear la experiencia para que crear tareas, consultar la biblioteca y recibir mensajes no rompa ni bloquee el espacio de trabajo; mantener proyectos, tareas y progreso visibles como en los chats modernos; simplificar las fases mediante una combinación de conversación guiada y formularios breves; y orientar todo el recorrido a transformar un problema en una solución ejecutable, repetible y susceptible de automatización.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Convertir un problema en un método repetible (Priority: P1)

Como persona que necesita resolver una tarea, quiero partir de una descripción libre del problema y terminar con un camino de solución descompuesto, probado y reutilizable, para poder repetirlo, delegarlo o decidir qué partes automatizar.

**Why this priority**: Este es el propósito central del producto. La navegación, el chat, los formularios y las iteraciones solo aportan valor si conducen a una solución concreta y reutilizable.

**Independent Test**: Crear una tarea desde un problema sin estructurar, recorrer las cuatro etapas y comprobar que el resultado final contiene definición vigente, pasos ordenados, dependencias, herramientas, iteraciones, método validado y oportunidades de automatización.

**Acceptance Scenarios**:

1. **Given** un problema descrito en lenguaje libre, **When** la persona inicia el recorrido, **Then** el sistema convierte la conversación en una definición verificable del resultado esperado, alcance, evidencia y restricciones.
2. **Given** un problema entendido, **When** avanza a la descomposición, **Then** obtiene subproblemas, pasos, dependencias, criterios de éxito y preguntas aún abiertas.
3. **Given** un camino propuesto, **When** registra intentos y resultados, **Then** cada iteración conserva qué se probó, con qué herramienta, qué ocurrió y qué debe ajustarse.
4. **Given** al menos dos ejecuciones que alcanzan los criterios de éxito bajo condiciones aplicables, **When** consolida la solución, **Then** obtiene un método marcado como repetible, junto con pasos asistibles, herramientas candidatas y controles que deben seguir siendo humanos.
5. **Given** que todavía faltan evidencias o resultados, **When** intenta cerrar la tarea, **Then** el sistema explica los vacíos concretos y no presenta una solución incompleta como validada.

---

### User Story 2 - Responder conversando y confirmar de forma simple (Priority: P2)

Como persona que no conoce el protocolo interno, quiero conversar naturalmente con el asistente mientras mis respuestas alimentan campos breves y comprensibles, para avanzar sin enfrentar un formulario largo ni tener que adivinar qué escribir.

**Why this priority**: El recorrido actual exige entender demasiados campos y separa artificialmente la conversación del formulario. La interacción híbrida reduce carga cognitiva sin perder estructura.

**Independent Test**: Completar una etapa usando solo el chat, otra usando solo los campos visibles y otra alternando ambos; comprobar que los tres caminos producen la misma información estructurada y editable.

**Acceptance Scenarios**:

1. **Given** una etapa activa, **When** la persona abre la tarea, **Then** el asistente explica en lenguaje cotidiano qué resultado se busca y formula una sola pregunta principal a la vez.
2. **Given** una respuesta conversacional útil, **When** el sistema identifica información estructurable, **Then** muestra qué campos propone completar y permite aceptar, corregir o descartar la propuesta.
3. **Given** una persona que prefiere escribir directamente, **When** abre el resumen estructurado, **Then** encuentra únicamente los campos necesarios para el paso actual, con ejemplos y lenguaje comprensible.
4. **Given** datos ya confirmados, **When** continúa la conversación, **Then** el asistente evita preguntar lo mismo y se concentra en vacíos, contradicciones o decisiones pendientes.
5. **Given** una respuesta ambigua o contradictoria, **When** el sistema no puede asignarla con seguridad, **Then** solicita aclaración y no altera datos confirmados.
6. **Given** que una etapa aún no tiene información estructurada útil, **When** la persona conversa, **Then** la interfaz no reserva un panel lateral vacío ni muestra controles que todavía no aportan contexto.

---

### User Story 3 - Mantener el contexto al navegar (Priority: P3)

Como persona con varios trabajos, quiero ver mis proyectos, sus tareas y el progreso de la tarea activa dentro del mismo espacio, para cambiar de contexto con la misma claridad de una aplicación moderna de chat.

**Why this priority**: Crear una tarea o abrir la biblioteca no debe desmontar la interfaz ni hacer que la persona pierda el proyecto, la conversación o el punto exacto donde estaba.

**Independent Test**: Abrir una tarea, cambiar de proyecto, volver a la tarea, crear otra y consultar la biblioteca; verificar que la estructura principal permanece estable y cada contexto recupera su conversación, etapa y borradores.

**Acceptance Scenarios**:

1. **Given** uno o más proyectos, **When** la persona abre el workspace, **Then** ve el proyecto activo, sus tareas y la tarea seleccionada en una navegación persistente y plegable.
2. **Given** tareas en etapas distintas, **When** revisa la navegación, **Then** identifica el objetivo y estado de cada tarea sin mostrar una lista decorativa de fases vacías.
3. **Given** una tarea con una conversación extensa, **When** cambia a otra tarea y regresa, **Then** recupera el hilo, los datos estructurados, la etapa, los borradores y la posición de trabajo correctos.
4. **Given** que crea una tarea, **When** confirma sus datos mínimos, **Then** la nueva conversación aparece en el proyecto elegido sin reemplazar ni deformar el shell principal.
5. **Given** una pantalla estrecha, **When** navega entre proyectos, conversación y resumen, **Then** cada región es alcanzable mediante controles claros y el regreso conserva el contexto.

---

### User Story 4 - Usar ventanas contextuales sin interrumpir el trabajo (Priority: P4)

Como persona concentrada en una tarea, quiero que crear, configurar, consultar o recibir avisos ocurra en capas adecuadas, para mantener visible mi trabajo y cerrar la interacción sin perder cambios.

**Why this priority**: Las acciones auxiliares actuales se sienten como cambios de pantalla o bloqueos. Una jerarquía clara entre diálogos, paneles y avisos evita interrupciones innecesarias.

**Independent Test**: Desde una tarea con cambios en curso, abrir Nueva tarea, Biblioteca y Ajustes, provocar avisos de éxito y error, y comprobar que ninguno elimina el contexto ni bloquea la pantalla más de lo necesario.

**Acceptance Scenarios**:

1. **Given** una tarea activa, **When** selecciona «Nueva tarea», **Then** se abre una ventana superpuesta con los datos mínimos y el workspace permanece reconocible detrás.
2. **Given** una tarea activa, **When** consulta la biblioteca, **Then** se abre un panel superpuesto desde el que puede buscar, revisar y vincular recursos sin abandonar la conversación.
3. **Given** una acción que requiere una decisión antes de continuar, **When** se abre un diálogo modal, **Then** el fondo queda temporalmente inactivo, el foco permanece dentro del diálogo y una salida segura devuelve al punto anterior.
4. **Given** un mensaje informativo, de éxito o de error recuperable, **When** se muestra, **Then** aparece como aviso transitorio no modal, no tapa acciones esenciales y puede descartarse.
5. **Given** contenido sin guardar dentro de una ventana, **When** intenta cerrarla, **Then** el sistema conserva el borrador o solicita confirmación antes de descartarlo.

---

### User Story 5 - Reutilizar conocimiento y oportunidades de automatización (Priority: P5)

Como persona que resuelve tareas recurrentes, quiero guardar soluciones, herramientas, criterios e iteraciones útiles en una biblioteca vinculada a mis proyectos, para reutilizar patrones y detectar trabajo automatizable.

**Why this priority**: La repetibilidad aumenta cuando el aprendizaje deja de estar enterrado en una sola conversación y se convierte en material localizable y comparable.

**Independent Test**: Completar una tarea, guardar su método en la biblioteca, vincularlo a una nueva tarea similar y verificar que la nueva tarea recibe contexto reutilizable sin copiar datos irrelevantes.

**Acceptance Scenarios**:

1. **Given** una solución consolidada, **When** la persona la guarda como aprendizaje, **Then** la biblioteca conserva su problema aplicable, método, herramientas, condiciones, límites y origen.
2. **Given** una tarea nueva con señales similares, **When** consulta la biblioteca, **Then** puede encontrar y vincular aprendizajes relevantes sin alterar automáticamente su definición.
3. **Given** pasos repetidos en varias tareas o iteraciones, **When** revisa la consolidación, **Then** el sistema los presenta como candidatos de automatización con frecuencia, entradas, salidas, herramienta posible, riesgo y control humano.
4. **Given** una automatización candidata sin evidencia suficiente, **When** se presenta, **Then** queda marcada como hipótesis y no como automatización validada.

### Edge Cases

- No existen proyectos ni tareas: el workspace explica el propósito y permite crear el primer proyecto y su primera tarea sin mostrar paneles vacíos.
- Una tarea heredada no pertenece todavía a un proyecto: se asigna a «Tareas anteriores» sin perder datos y puede moverse después.
- Un proyecto contiene muchas tareas: la navegación permite buscar, filtrar y plegar sin perder la tarea activa.
- La persona cambia de tarea con una respuesta o ventana sin confirmar: el sistema conserva el borrador o pide una decisión explícita.
- La biblioteca no tiene elementos, no encuentra coincidencias o falla al cargar: el workspace permanece utilizable y ofrece una recuperación clara.
- Una respuesta del asistente llega después de cambiar de tarea o etapa: solo puede aplicarse al contexto que la originó y nunca contamina la vista activa.
- La misma respuesta parece corresponder a varios campos: se presenta como propuesta pendiente y requiere confirmación.
- Una etapa tiene demasiados datos para un resumen breve: se agrupa por resultados y permite ampliar secciones sin convertir la pantalla en un formulario continuo.
- Una tarea heredada tiene las cuatro fases anteriores: sus datos se conservan y se presentan dentro de la etapa equivalente sin obligar a reiniciar.
- Una iteración contradice una solución previamente marcada como válida: la solución vuelve a estado de revisión y conserva ambas evidencias.
- Un recurso de biblioteca fue eliminado o actualizado: las tareas vinculadas conservan una referencia comprensible y comunican su estado.
- Mensajes extensos, código, enlaces o texto con instrucciones incrustadas no ejecutan acciones ni rompen la distribución.
- La conexión con el asistente falla: la persona puede continuar editando datos estructurados, conservar su borrador y reintentar la conversación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST organizar el trabajo persistente en proyectos que contienen tareas; cuando exista un proyecto MUST identificar el proyecto activo, cuando ese proyecto contenga tareas MUST identificar además una tarea activa, y en cada nivel vacío MUST mostrar la acción correspondiente para crear el elemento faltante.
- **FR-002**: Mientras la persona crea tareas, consulta recursos o ajusta preferencias, el workspace MUST mantener visibles la identidad del proyecto y tarea activos, la navegación y la conversación, y MUST NOT sustituirlos por otra página ni reiniciar su estado.
- **FR-003**: La navegación MUST mostrar proyectos y tareas como unidades útiles, con objetivo breve, estado y etapa vigente; MUST NOT mostrar subfases vacías o indicadores que no expliquen progreso.
- **FR-004**: La persona MUST poder crear, renombrar, cambiar y localizar proyectos y tareas sin abandonar el workspace.
- **FR-005**: Crear una tarea MUST requerir únicamente proyecto, nombre o problema inicial; la información restante se obtiene durante la conversación.
- **FR-006**: «Nueva tarea» MUST abrirse como diálogo superpuesto y MUST conservar la tarea activa hasta que la creación sea confirmada.
- **FR-007**: «Biblioteca» MUST abrirse como panel superpuesto que permita buscar, revisar y vincular recursos sin reemplazar la conversación activa.
- **FR-008**: «Ajustes» y otras decisiones acotadas MUST abrirse como diálogos superpuestos, conservar el contexto y devolver el foco a la acción de origen al cerrar.
- **FR-009**: Solo las interacciones que requieren una decisión inmediata MAY bloquear temporalmente el fondo; los avisos de estado, éxito y error recuperable MUST ser no modales.
- **FR-010**: Todo diálogo y panel superpuesto MUST ofrecer cierre comprensible, navegación por teclado, foco visible y protección ante pérdida de cambios.
- **FR-011**: El flujo de resolución MUST conducir por cuatro resultados ordenados: entender el problema, descomponer el camino, ejecutar e iterar, y consolidar la solución repetible con su mapa de automatización.
- **FR-012**: Cada etapa MUST explicar su propósito, el entregable que producirá, la información ya confirmada, los vacíos y la siguiente acción útil.
- **FR-013**: Solo la etapa activa MUST mostrar preguntas y campos completos; cada etapa futura o completada MUST limitarse a nombre, estado y entregable resumido hasta que la persona la seleccione.
- **FR-014**: El asistente MUST formular una pregunta principal por turno y adaptar la siguiente pregunta a la información confirmada, los vacíos y las contradicciones de la tarea.
- **FR-015**: La persona MUST poder completar cada dato mediante conversación, edición directa o una combinación de ambas.
- **FR-016**: La información inferida desde el chat MUST mostrarse como propuesta identificable antes de modificar datos confirmados.
- **FR-017**: La persona MUST poder aceptar, editar o descartar una propuesta, y su edición explícita MUST prevalecer sobre inferencias posteriores.
- **FR-018**: El resumen estructurado MUST mostrar los campos que responden a la pregunta vigente, contienen una propuesta pendiente o requieren resolver una contradicción; los demás MUST permanecer plegados, usando etiquetas, explicaciones y ejemplos en lenguaje cotidiano.
- **FR-019**: El resumen estructurado MUST poder plegarse y MUST permanecer oculto cuando no exista información o acción útil que mostrar.
- **FR-020**: La etapa «Entender el problema» MUST obtener como mínimo problema vigente, resultado deseado, evidencia, alcance, restricciones, actores y criterio de éxito.
- **FR-021**: La etapa «Descomponer el camino» MUST obtener como mínimo subproblemas, pasos ordenados, dependencias, decisiones, preguntas abiertas y riesgos.
- **FR-022**: La etapa «Ejecutar e iterar» MUST registrar para cada intento objetivo, acción, herramienta, entrada, resultado, evidencia, aprendizaje y siguiente ajuste.
- **FR-023**: La etapa «Consolidar y automatizar» MUST producir un método consolidado con nivel de evidencia visible, precondiciones, pasos, herramientas, entradas, salidas, controles, excepciones y evidencia de validación.
- **FR-024**: La consolidación MUST clasificar cada paso como manual, asistible o automatizable, y MUST justificar la clasificación con frecuencia, estabilidad, riesgo y necesidad de juicio humano.
- **FR-025**: Cada oportunidad de automatización MUST describir disparador, entradas, transformación esperada, salida, herramienta candidata, fallos previsibles y punto de supervisión humana.
- **FR-026**: El sistema MUST distinguir los estados de resultado «hipótesis», «camino propuesto», «documentado una vez» y «método repetible».
- **FR-027**: Cada etapa MUST completarse únicamente cuando todos sus datos mínimos definidos en FR-020, FR-021, FR-022 o FR-023, según corresponda, estén confirmados y no existan contradicciones pendientes; «Consolidar y automatizar» MUST exigir además la clasificación y justificación de cada paso según FR-024 y todos los datos de FR-025 para cada oportunidad identificada.
- **FR-028**: Un resultado MAY alcanzar «documentado una vez» después de una ejecución de una versión del método que cumple sus criterios de éxito, pero MUST requerir al menos dos ejecuciones exitosas de esa misma versión bajo condiciones aplicables para alcanzar «método repetible»; un cambio material crea una nueva versión y su evidencia de repetibilidad comienza de nuevo.
- **FR-029**: Una oportunidad de automatización MUST permanecer como «hipótesis» cuando se observa una vez y MAY pasar a «candidato con evidencia» únicamente cuando la misma secuencia, con entradas y salidas equivalentes, se registra al menos dos veces; esta entrega MUST NOT presentarla como automatización validada.
- **FR-030**: Cuando una persona modifica datos que sustentan la compuerta de una etapa completada, la etapa y sus resultados derivados MUST volver a revisión hasta confirmar de nuevo sus condiciones.
- **FR-031**: La persona MUST poder reabrir una solución, añadir nuevas iteraciones y actualizar el método sin eliminar versiones ni aprendizajes anteriores.
- **FR-032**: La biblioteca MUST almacenar y permitir localizar métodos, herramientas, aprendizajes y oportunidades de automatización vinculados con sus proyectos y tareas de origen.
- **FR-033**: Vincular un recurso de biblioteca MUST aportar contexto como referencia revisable; MUST NOT sobrescribir automáticamente datos confirmados de la tarea.
- **FR-034**: Mensajes, propuestas, formularios, iteraciones y resultados MUST permanecer asociados al proyecto, tarea, etapa y versión que los originó.
- **FR-035**: Al cambiar de proyecto, tarea o región, el sistema MUST conservar la conversación, datos y borradores, y al regresar MUST restaurar el último mensaje visible y la sección estructurada que estaba abierta.
- **FR-036**: La experiencia MUST ser utilizable con teclado, zoom elevado y pantallas desde 320 píxeles de ancho, reorganizando navegación y contexto sin perder capacidades.
- **FR-037**: Estados vacíos, carga, guardado, error, conflicto y recuperación MUST explicarse mediante texto accionable y no depender únicamente de color o iconos.
- **FR-038**: Tareas heredadas MUST conservar sus datos, progreso e iteraciones y MUST mapearlos mediante las reglas de compatibilidad sin exigir que la persona empiece de cero.
- **FR-039**: El contenido aportado por la persona, el asistente o la biblioteca MUST mostrarse como contenido inerte; MUST NOT iniciar acciones, cambiar de tarea, navegar, abrir enlaces ni confirmar propuestas sin una acción explícita de la persona.

### Key Entities

- **Proyecto**: Contenedor persistente de tareas y recursos relacionados, con nombre, descripción breve, estado y tarea activa reciente.
- **Tarea**: Problema o resultado por resolver dentro de un proyecto, con conversación, etapa, datos estructurados, iteraciones y solución consolidada.
- **Estado de tarea**: Situación operativa de la tarea —activa, pausada o completada— independiente del nivel de evidencia alcanzado por su resultado.
- **Etapa de resolución**: Uno de los cuatro resultados ordenados del recorrido, con propósito, estado, resumen, vacíos y entregable.
- **Hilo de conversación**: Secuencia de mensajes asociada a una tarea que guía preguntas y conserva decisiones.
- **Respuesta estructurada**: Dato confirmado de una etapa, con origen conversacional o edición directa y trazabilidad de cambios.
- **Propuesta de actualización**: Interpretación pendiente que relaciona una respuesta conversacional con uno o más datos estructurados.
- **Paso de solución**: Acción ordenada con objetivo, dependencias, entradas, salida, herramienta, riesgo y criterio de terminación.
- **Iteración**: Intento ejecutado con objetivo, acciones, herramientas, evidencia, resultado, aprendizaje y ajuste posterior.
- **Solución consolidada**: Método versionado y repetible derivado de pasos e iteraciones, con condiciones, excepciones y nivel de validación.
- **Oportunidad de automatización**: Paso o secuencia candidata a asistencia o automatización, con justificación, contrato esperado, riesgos y control humano.
- **Recurso de biblioteca**: Método, herramienta, aprendizaje u oportunidad reutilizable, vinculado a sus tareas y proyectos de origen.
- **Aviso transitorio**: Mensaje no modal de estado, éxito o error recuperable que no sustituye el contenido de trabajo.

### Compatibility Rules

| Información anterior | Representación nueva | Regla de conservación |
|----------------------|----------------------|-----------------------|
| Tarea sin proyecto persistente | Proyecto «Tareas anteriores» | Se asigna automáticamente sin cambiar identidad, nombre, fechas ni contenido de la tarea. |
| Orientación y análisis del problema | Entender el problema | Se conservan problema, evidencia, decisión, justificación, formulación vigente y estado de completitud. |
| Guía, criterios y prioridades | Descomponer el camino | Se conservan guía y criterios; cada criterio se presenta como paso, restricción, riesgo o pregunta pendiente sin borrar el texto fuente. |
| Ejecución e iteraciones | Ejecutar e iterar | Se conservan intentos, resultados, ajustes, herramientas y orden histórico. |
| Revisión, mejoras y criterios finales | Consolidar y automatizar | Se conservan revisión y mejoras como evidencia; no se clasifican automáticamente como método repetible ni automatización validada. |
| Conversaciones y propuestas | Hilo y propuestas de la tarea equivalente | Se conservan autor, contenido, estado y contexto de origen. |
| Evaluaciones y aceptaciones de fase | Historial de evaluación y revisión de etapa | Se conservan como evidencia histórica y mantienen accesibles todas las etapas alcanzadas; si faltan mínimos de FR-020 a FR-025, la etapa equivalente queda «requiere revisión» sin ocultar ni bloquear los datos posteriores. |
| Prompts heredados ocultos | Datos históricos inertes | Se conservan sin mostrarse como instrucciones editables ni ejecutarse. |
| Tarea completada anteriormente | Estado de tarea «completada» | Conserva su estado operativo y puede consultarse; su resultado se clasifica por separado como hipótesis, camino propuesto, documentado una vez o método repetible según la evidencia de FR-028. |
| Preferencia de asistencia Codex o DeepSeek | Preferencia de asistencia existente | Se conserva sin solicitar credenciales ni activar una conexión real. |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las tareas que completan el nuevo recorrido genera un resultado final con problema vigente, camino ordenado, herramientas, evidencia de iteración, método consolidado, nivel de evidencia visible y mapa de oportunidades de automatización.
- **SC-002**: Al menos 9 de 10 participantes pueden explicar en menos de 15 segundos qué etapa trabajan, qué resultado deben producir y cuál es la siguiente acción.
- **SC-003**: Al menos 9 de 10 participantes completan una etapa de muestra combinando chat y resumen estructurado sin recibir explicación externa sobre el protocolo.
- **SC-004**: En el 100% de los recorridos de prueba, abrir y cerrar Nueva tarea, Biblioteca o Ajustes conserva proyecto, tarea, conversación, borradores y posición de trabajo.
- **SC-005**: El 100% de los avisos informativos, de éxito y de error recuperable permite seguir usando las acciones esenciales del workspace mientras permanece visible.
- **SC-006**: En el 100% de los estados de prueba, toda región secundaria visible contiene al menos un dato confirmado, una propuesta pendiente, una contradicción o una acción aplicable a la pregunta vigente.
- **SC-007**: Una persona puede cambiar entre dos proyectos y recuperar la tarea exacta de cada uno en un máximo de dos acciones.
- **SC-008**: El 100% de las respuestas conversacionales de prueba que podrían modificar datos se presenta como propuesta aceptable, editable o descartable antes de cambiar información confirmada.
- **SC-009**: El 100% de los resultados «documentado una vez» incluye una ejecución exitosa de la versión indicada, y el 100% de los «métodos repetibles» incluye al menos dos ejecuciones exitosas de la misma versión bajo condiciones aplicables; los demás se distinguen como hipótesis o camino propuesto.
- **SC-010**: Al menos 8 de 10 participantes pueden usar el resultado final de una tarea de muestra para repetir el proceso sin revisar toda la conversación original.
- **SC-011**: En pruebas con pantalla de 320 píxeles, zoom de 200% y navegación por teclado, todas las acciones esenciales y regiones conservan un orden comprensible y son alcanzables.
- **SC-012**: El 100% de las tareas heredadas representativas abre con sus datos y progreso anteriores disponibles dentro del nuevo recorrido.

## Assumptions

- El producto atiende inicialmente a una persona que organiza sus propios proyectos; colaboración simultánea y permisos por equipo quedan fuera de esta entrega.
- Un proyecto es una entidad persistente real que agrupa tareas y recursos, no solo una etiqueta visual.
- Las tareas existentes se agrupan inicialmente en «Tareas anteriores»; la persona puede reorganizarlas después sin migración destructiva.
- Las cuatro etapas reemplazan la presentación de Orientación, Guía, Ejecución y Revisión, pero reutilizan y mapean sus datos vigentes para conservar compatibilidad.
- La conversación es la superficie principal; el resumen estructurado aparece bajo demanda o cuando existe información útil para revisar.
- Un diálogo bloquea el fondo únicamente cuando completar o cancelar una decisión es necesario para mantener consistencia.
- La biblioteca forma parte del mismo shell y no requiere una navegación de página independiente.
- Las sugerencias de herramientas y automatización son hipótesis revisables hasta que existan evidencia y validación explícitas.
- Esta entrega identifica hipótesis y candidatos de automatización con evidencia, pero no concede el estado de automatización validada porque no ejecuta automatizaciones reales.
- La primera entrega diseña el recorrido y sus resultados; ejecutar automatizaciones externas o aprovisionar herramientas no forma parte del alcance.
- Si el asistente no está disponible, la persona puede completar el recorrido mediante los datos estructurados y registrar iteraciones manualmente.
- La solución final es un artefacto vivo: puede reabrirse y versionarse cuando nuevas iteraciones cambian el método.

## Scope Boundaries

### Included

- Shell persistente de proyectos, tareas y conversación.
- Creación de tarea, biblioteca, ajustes y avisos mediante capas contextuales adecuadas.
- Recorrido conversacional y estructurado de problema a solución repetible.
- Redefinición de las etapas según el resultado que producen.
- Registro de herramientas, pasos, dependencias, iteraciones y evidencia.
- Consolidación del método y clasificación de oportunidades de automatización.
- Biblioteca integrada de métodos, herramientas y aprendizajes reutilizables.
- Compatibilidad y mapeo de tareas existentes.

### Deferred

- Ejecución real de automatizaciones o agentes autónomos.
- Instalación, compra o configuración automática de herramientas externas.
- Colaboración multiusuario, permisos de equipo y edición simultánea.
- Conexiones reales con proveedores de modelos o almacenamiento de sus credenciales.
- Decidir automáticamente que una hipótesis es una solución validada sin evidencia humana revisable.
