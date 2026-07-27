# Feature Specification: Formularios y prompts sincronizados por fase

**Feature Branch**: `codex/004-prompts-por-fase`  
**Created**: 2026-07-26  
**Status**: Draft  
**Input**: Mostrar, en cada una de las cuatro fases, el formulario y un prompt en la otra mitad de la vista; el prompt debe completarse con la información que se diligencia en el formulario.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trabajar con formulario y prompt en una misma vista (Priority: P1)

Como persona que registra una tarea, quiero ver el formulario de la fase y su prompt correspondiente lado a lado, para entender y reutilizar la instrucción sin abandonar ni desplazarme fuera de la información que la compone.

**Why this priority**: La relación entre los campos y el prompt es el núcleo de la solicitud; si no se ven juntos, la persona no puede validar que el prompt representa el trabajo registrado.

**Independent Test**: Abrir cada una de las cuatro fases en una tarea y comprobar que contiene un área de formulario y un área de prompt identificables; reducir el ancho de la vista y comprobar que ambas siguen siendo accesibles en un único orden de lectura.

**Acceptance Scenarios**:

1. **Given** una tarea en cualquiera de las cuatro fases, **When** la persona abre su espacio de trabajo, **Then** ve el formulario de esa fase y su prompt asociado como dos áreas del mismo espacio de fase.
2. **Given** una vista suficientemente ancha, **When** la persona consulta una fase, **Then** el formulario y el prompt se presentan en columnas equilibradas y legibles.
3. **Given** una vista estrecha o navegación con teclado, **When** la persona recorre la fase, **Then** las áreas se apilan en un orden lógico, conservan etiquetas accesibles y no ocultan controles.
4. **Given** la fase de orientación, **When** la persona la abre, **Then** dispone de un prompt de orientación con las mismas acciones accesibles que los prompts ya existentes.

---

### User Story 2 - Completar el prompt con los datos vigentes (Priority: P2)

Como persona que diligencia una fase, quiero que el prompt generado refleje automáticamente los campos relevantes que voy completando, para usar una instrucción actual sin transcribir ni regenerar de forma repetitiva.

**Why this priority**: El diseño de dos columnas solo entrega valor si el texto presentado se mantiene alineado con el formulario.

**Independent Test**: Escribir valores representativos en cada formulario, incluidos campos vacíos y texto con caracteres especiales, y comprobar que el prompt de la misma fase los muestra de forma legible sin modificar otros prompts.

**Acceptance Scenarios**:

1. **Given** un prompt que no ha sido editado manualmente, **When** la persona cambia un campo que contribuye al prompt de la fase, **Then** el prompt se actualiza con el valor vigente sin requerir una acción adicional.
2. **Given** un prompt editado manualmente, **When** la persona cambia campos del formulario, **Then** el texto manual se conserva y se indica que puede regenerarse para aplicar los datos actuales.
3. **Given** la persona elige regenerar un prompt manual, **When** confirma la acción disponible, **Then** se reemplaza por la composición completa de los datos vigentes de su fase y vuelve a actualizarse automáticamente.
4. **Given** valores vacíos, extensos o con caracteres especiales, **When** se reflejan en el prompt, **Then** se muestran como texto seguro y comprensible, sin ejecutar contenido dentro de la aplicación.

---

### User Story 3 - Conservar prompts por fase al guardar y reabrir (Priority: P3)

Como persona que vuelve a una tarea, quiero recuperar tanto los prompts generados como mis ajustes manuales de cada fase, para continuar el trabajo con la misma instrucción y contexto.

**Why this priority**: La sincronización debe respetar la persistencia ya ofrecida por las cajitas de prompt y no perder contenido al cambiar de sesión.

**Independent Test**: Guardar una tarea con prompts automáticos y otro editado manualmente, reabrirla y comprobar que todos los textos, su modo de actualización y la acción de guardado se conservan.

**Acceptance Scenarios**:

1. **Given** cambios en formulario y prompt de una fase, **When** la persona guarda desde la cajita o mediante el flujo normal de la tarea, **Then** ambos cambios se conservan al reabrir.
2. **Given** una tarea almacenada antes de incluir el prompt de orientación, **When** se abre, **Then** recibe un valor seguro y editable sin perder sus datos previos.
3. **Given** un fallo recuperable al guardar, **When** la persona reintenta desde el prompt, **Then** el texto visible y el formulario permanecen disponibles para volver a guardar.

### Edge Cases

- Un campo se borra después de haberse reflejado en un prompt automático; el prompt debe reflejar el estado vacío de forma explícita y legible.
- La persona escribe rápidamente en varios campos; el prompt no debe adoptar datos de otra fase ni quedar con una mezcla de valores anteriores y nuevos.
- Un prompt se edita manualmente justo antes de un cambio de formulario; la edición manual debe prevalecer sin perderse.
- Una pantalla estrecha, zoom alto o preferencias de movimiento reducido no debe impedir editar ni guardar el formulario o el prompt.
- Una tarea heredada no contiene los datos nuevos de orientación; su reparación debe conservar su fase y agregar valores seguros.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar en cada una de las cuatro fases dos áreas distinguibles: formulario de fase y prompt de fase.
- **FR-002**: En un ancho de contenido normal de escritorio, el sistema MUST presentar ambas áreas lado a lado sin reducir los controles a un tamaño ilegible.
- **FR-003**: En una vista estrecha, zoom elevado o navegación asistida, el sistema MUST apilar las áreas en un orden lógico y conservar todos los controles utilizables mediante teclado.
- **FR-004**: El sistema MUST ofrecer un prompt de orientación para la fase 1, con edición, regeneración, guardado y estado accesible coherentes con los demás prompts.
- **FR-005**: El sistema MUST construir cada prompt con los datos relevantes y vigentes del formulario de su propia fase, además del contexto común de la tarea que corresponda.
- **FR-006**: Mientras un prompt permanezca generado automáticamente, el sistema MUST actualizarlo cuando cambie cualquier campo que lo compone.
- **FR-007**: Al editar manualmente un prompt, el sistema MUST marcarlo como personalizado y no sobrescribirlo por cambios posteriores del formulario.
- **FR-008**: La acción de regeneración MUST reemplazar un prompt personalizado con la composición de datos vigentes y restablecer su actualización automática.
- **FR-009**: El sistema MUST conservar los prompts, su estado personalizado y los datos de formulario con el flujo de guardado existente por tarea.
- **FR-010**: El sistema MUST reparar las tareas almacenadas antes del cambio con valores seguros para el prompt y el estado de personalización de orientación, sin alterar los datos y fases existentes.
- **FR-011**: La inclusión de texto de formulario en prompts MUST tratarse como contenido de texto y no ejecutar HTML, Markdown u otras instrucciones como interfaz de la aplicación.
- **FR-012**: El sistema MUST mantener las acciones existentes de guardar y de reintentar un guardado recuperable desde cada cajita de prompt.

### Key Entities

- **Prompt de fase**: Texto guardable asociado a una fase, su estado de edición manual y la composición automática aplicable.
- **Formulario de fase**: Conjunto de campos editables de una de las cuatro etapas que aporta contexto al prompt asociado.
- **Estado de sincronización**: Regla que determina si el prompt se actualiza desde el formulario o si se conserva una edición manual hasta regenerarla.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una prueba automatizada de interfaz confirma las dos áreas de contenido para el 100% de las cuatro fases.
- **SC-002**: Una prueba automatizada verifica que cada campo relevante de cada fase se refleja en su prompt automático después de modificarlo.
- **SC-003**: En una vista de 320 px de ancho y al 200% de zoom, los controles de formulario, edición, regeneración y guardado permanecen alcanzables por teclado en las cuatro fases.
- **SC-004**: El 100% de los prompts personalizados usados en la prueba se conserva intacto ante cambios de formulario y vuelve a modo automático después de regenerarse.
- **SC-005**: Las tareas heredadas de la prueba de compatibilidad abren, guardan y vuelven a abrir sin pérdida de fase ni de datos previos.

## Assumptions

- Se reutiliza la cajita de prompt y el guardado de tarea existentes; no se añade un proveedor de IA ni un servicio externo.
- «La otra mitad» describe una disposición en dos columnas cuando el espacio lo permite; en pantallas estrechas se prioriza accesibilidad y lectura mediante apilamiento.
- Los prompts de guía, ejecución y revisión conservan sus campos y acciones actuales; la entrega añade sincronización automática y uniformidad visual, además del prompt de orientación.
- El prompt se actualiza automáticamente solo mientras no tenga una edición manual, para no destruir una instrucción que la persona haya ajustado deliberadamente.
