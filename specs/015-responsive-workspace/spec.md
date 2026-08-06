# Feature Specification: Adaptación responsive del workspace

**Feature Branch**: `codex/015-responsive-workspace`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "Adaptar el workspace para tablet y móvil según IMG-UX-03 e IMG-UX-04, preservando formulario, chat, errores y backend existentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trabajar en tablet con dos regiones autónomas (Priority: P1)

Como persona que usa una tablet, quiero mantener el lienzo y el agente lado a
lado, con navegación disponible bajo demanda y desplazamiento independiente,
para consultar la conversación sin perder mi posición en el formulario.

**Why this priority**: IMG-UX-03 define el modo tablet y corrige la carencia
actual de regiones autónomas.

**Independent Test**: En 1024×768 se puede cargar una tarea con agente activo,
ver drawer cerrado, abrirlo desde la hamburguesa, recorrer lienzo y agente por
separado y encontrar como máximo una acción primaria visible. **Refs: IMG-UX-03**

**Acceptance Scenarios**:

1. **Given** una tarea abierta en 1024×768, **When** carga el workspace, **Then** el drawer está cerrado, la hamburguesa es visible y el header muestra breadcrumb, chip de etapa y overflow sin solapes. **Refs: IMG-UX-03**
2. **Given** lienzo y agente con contenido extenso, **When** se desplaza una región, **Then** la otra conserva su posición y ambas permanecen lado a lado. **Refs: IMG-UX-03**
3. **Given** cualquier estado tablet, **When** se cuentan controles primarios visibles, **Then** el total nunca supera uno. **Refs: IMG-UX-03**

---

### User Story 2 - Alternar Etapa y Agente en móvil sin perder trabajo (Priority: P1)

Como persona que usa el workspace en móvil, quiero alternar entre Etapa y
Agente dentro de un único plano, conservando borrador, datos y foco lógico,
para trabajar sin modal ni reinicios de contexto.

**Why this priority**: IMG-UX-04 exige que el formulario vuelva a ser
protagonista y que el cambio de plano sea seguro.

**Independent Test**: En 390×844 y 320×667 se completa un campo y un borrador,
se alterna Etapa→Agente→Etapa, y ambos valores, el pane por tarea y un destino
de foco lógico permanecen correctos. **Refs: IMG-UX-04**

**Acceptance Scenarios**:

1. **Given** una tarea móvil, **When** se muestra Etapa, **Then** aparecen la línea `Etapa 1 de 4 · Orientación y rastreo`, el selector Etapa/Agente con iconos y todos los campos/contadores dentro del flujo. **Refs: IMG-UX-04**
2. **Given** cambios sin guardar y borrador del agente, **When** se alternan los panes repetidamente, **Then** no se desmontan ni pierden valores y el foco queda en un destino lógico del pane activo. **Refs: IMG-UX-04**
3. **Given** pendientes del agente, **When** se observa el selector, **Then** Agente muestra un indicador de estado accesible; sin pendientes no se muestra. **Refs: IMG-UX-04**
4. **Given** una tarea distinta, **When** se regresa a cada tarea, **Then** cada una restaura su propio pane móvil. **Refs: IMG-UX-04**
5. **Given** el footer del formulario móvil, **When** está visible, **Then** `Guardar borrador` es texto centrado y la acción primaria ocupa el ancho disponible sin duplicarse. **Refs: IMG-UX-04**

---

### User Story 3 - Conservar acceso completo en ancho estrecho y zoom (Priority: P2)

Como persona con pantalla estrecha o zoom alto, quiero acceder a todos los
campos, listas y datos sin superposiciones ni desplazamiento horizontal.

**Why this priority**: protege la invariante de no pérdida de información y la
accesibilidad del workspace.

**Independent Test**: En 320 px y con zoom 200% se recorren Etapa y Agente,
incluidas listas, campos y footer, sin overflow horizontal ni intersecciones.
**Refs: IMG-UX-03, IMG-UX-04**

**Acceptance Scenarios**:

1. **Given** ancho de 320 px, **When** se recorre todo el documento, **Then** no existe scroll horizontal ni contenido truncado inaccesible. **Refs: IMG-UX-04**
2. **Given** zoom 200%, **When** se usan ambos panes, **Then** controles, formulario, chat y footer no se superponen y siguen operables. **Refs: IMG-UX-03, IMG-UX-04**
3. **Given** cualquiera de los dos panes, **When** se ejecuta la auditoría de contraste, **Then** no existen violaciones axe-core aplicables. **Refs: IMG-UX-03, IMG-UX-04**

### Edge Cases

- El límite 1024 px pertenece a tablet; 1025 px pertenece a desktop.
- El límite 767 px pertenece a móvil; 768 px pertenece a tablet.
- Un ancho inválido o no medible adopta la presentación móvil segura.
- Conteos combinados de propuestas y correcciones pendientes producen un solo dot, no dos badges.
- Textos de proyecto/tarea largos envuelven o truncan sin cubrir hamburguesa, chip u overflow.
- El pane inactivo permanece montado pero no es enfocable ni visible al árbol de interacción.
- El drawer es transitorio, cerrado al cargar y no modifica la preferencia desktop persistida.
- La tarea completada y el estado de bloqueo conservan sus acciones contextuales existentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El workspace MUST usar exactamente tres modos documentados: desktop `>=1025`, tablet `768–1024` y móvil `<=767`. **Refs: IMG-UX-03, IMG-UX-04**
- **FR-002**: Tablet MUST cargar con navegación en drawer cerrado y hamburguesa accesible; abrir/cerrar/Escape MUST gestionar el foco. **Refs: IMG-UX-03**
- **FR-003**: Tablet MUST presentar lienzo y agente lado a lado como regiones estructurales con desplazamiento vertical independiente. **Refs: IMG-UX-03**
- **FR-004**: El header compacto MUST mostrar breadcrumb y chip de etapa, y MUST ofrecer un menú overflow a la derecha sin duplicar destinos visibles. **Refs: IMG-UX-03, IMG-UX-04**
- **FR-005**: Móvil MUST presentar un único plano con línea de contexto `Etapa N de 4 · <fase>` y selector segmentado Etapa/Agente con iconos. **Refs: IMG-UX-04**
- **FR-006**: El selector MUST mostrar un dot accesible en Agente cuando existan propuestas o correcciones pendientes, y ocultarlo cuando el total sea cero. **Refs: IMG-UX-04**
- **FR-007**: Alternar panes MUST conservar campos, borrador del agente, posición recuperable y foco lógico sin modal ni desmontaje destructivo. **Refs: IMG-UX-04**
- **FR-008**: El pane móvil seleccionado MUST persistir aisladamente por tarea usando el estado existente. **Refs: IMG-UX-04**
- **FR-009**: El flujo móvil MUST mantener todos los campos y contadores de la etapa; `Guardar borrador` MUST ser una acción textual centrada y la acción primaria MUST ocupar el ancho disponible. **Refs: IMG-UX-04**
- **FR-010**: En todo viewport y pane MUST existir como máximo una acción marcada como primaria visible. **Refs: IMG-UX-03, IMG-UX-04**
- **FR-011**: A 320 px MUST haber cero overflow horizontal y cero pérdida de campos, listas o datos. **Refs: IMG-UX-04**
- **FR-012**: A zoom 200% MUST conservarse operabilidad, orden de lectura y cero superposiciones. **Refs: IMG-UX-03, IMG-UX-04**
- **FR-013**: Ambos panes MUST cumplir contraste automatizable y nombres/estados accesibles. **Refs: IMG-UX-03, IMG-UX-04**
- **FR-014**: La adaptación MUST preservar contenido 012, chat 013, recuperación 014, dominio, almacenamiento y backend sin redefinirlos. **Refs: IMG-UX-03, IMG-UX-04**

### Key Entities

- **Modo responsive**: clasificación derivada del ancho; no se persiste.
- **Pane móvil por tarea**: preferencia existente `stage | agent`, aislada por ID de tarea.
- **Estado pendiente del agente**: proyección visual booleana derivada de propuestas y correcciones.
- **Destino de foco lógico**: elemento recuperable dentro de la sesión, no un ID persistido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los escenarios IMG-UX-03/04 pasan en 1024×768, 390×844 y 320×667 sin solapes ni overflow horizontal.
- **SC-002**: El 100% de los cambios Etapa↔Agente conserva valores de formulario y borrador en pruebas automatizadas.
- **SC-003**: El 100% de tareas probadas restaura su pane móvil sin contaminar otra tarea.
- **SC-004**: Todos los estados probados muestran entre cero y una acción primaria visible, nunca dos.
- **SC-005**: Ambos panes tienen cero violaciones axe-core de contraste en los viewports contractuales.
- **SC-006**: A zoom 200% todos los controles esenciales permanecen visibles, alcanzables y sin intersecciones.

## Assumptions

- `mobilePaneByTask` es la fuente autoritativa existente para persistencia y no requiere migración.
- Los mockups orientan la comparación; no son baselines Playwright aprobadas.
- El botón de envío del chat no se reclasifica como acción primaria del flujo de etapa.
- El menú overflow reutiliza acciones frontend existentes y no introduce destinos ni permisos nuevos.
- La altura contractual de 320 px es 667 px, coherente con la infraestructura visual versionada.
