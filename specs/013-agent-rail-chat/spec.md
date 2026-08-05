# Feature Specification: Agente como rail contraíble con chat

**Feature Branch**: `codex/013-agent-rail-chat`

**Created**: 2026-08-05

**Status**: Draft

**Input**: Convertir el agente actual en una región estructural contraíble: rail
angosto cuando está cerrado y columna de conversación cuando está abierta, con
mensajes, propuestas accionables, compositor, persistencia por tarea y scroll
independiente, conforme a IMG-UX-01, IMG-UX-02 e IMG-UX-03.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recuperar el lienzo al contraer el agente (Priority: P1)

**Visual Refs**: IMG-UX-01; IMG-UX-05 únicamente para el badge pendiente.

Como persona que trabaja en una etapa, quiero contraer el agente a un rail
angosto para dedicar el espacio principal al lienzo sin perder la forma de abrir
la orientación ni la señal de que existe una propuesta pendiente.

**Why this priority**: El estado contraído actual conserva una columna completa
con contenido de relleno. Esto desperdicia espacio y contradice el propósito de
una región contraíble.

**Independent Test**: Abrir una tarea con el agente contraído y comprobar que el
costado derecho contiene únicamente la marca `Agente IA`, el icono sparkle, el
control de expansión y, cuando corresponda, el badge; el lienzo ocupa el espacio
liberado y no aparece ningún placeholder.

**Acceptance Scenarios**:

1. **AC-001 / Refs: IMG-UX-01** — **Given** una tarea cuyo agente está
   contraído en escritorio o tablet, **When** se muestra el workspace, **Then**
   el agente ocupa un rail de máximo 7 rem y no más del 12 % del ancho disponible,
   mientras el lienzo usa el resto del espacio.
2. **AC-002 / Refs: IMG-UX-01** — **Given** el rail contraído, **When** una
   persona lo recorre visualmente o con tecnología asistiva, **Then** encuentra
   la marca `Agente IA`, el icono sparkle y un control con nombre accesible
   `Expandir agente IA`.
3. **AC-003 / Refs: IMG-UX-01** — **Given** el rail contraído, **When** se
   inspecciona su contenido, **Then** no aparecen `Panel estructural`, `Expandir
   agente` como texto de placeholder ni una superficie vacía del ancho de una
   columna.
4. **AC-004 / Refs: IMG-UX-01** — **Given** tareas A y B con preferencias de
   agente distintas, **When** la persona alterna entre ellas, **Then** cada tarea
   recupera su propio estado contraído o expandido.
5. **AC-005 / Refs: IMG-UX-01, IMG-UX-05** — **Given** al menos una propuesta
   pendiente en la conversación vigente de la tarea, **When** el agente está
   contraído, **Then** el rail muestra un badge con el número exacto de propuestas
   pendientes y un nombre accesible equivalente; con cero pendientes no muestra
   badge.

---

### User Story 2 - Conversar en una columna estructural (Priority: P1)

**Visual Refs**: IMG-UX-02.

Como persona que desarrolla una tarea, quiero abrir el agente como una columna
integrada para conversar y consultar orientación sin que el chat cubra el
lienzo ni me haga perder el contexto de la etapa.

**Why this priority**: La expansión es el flujo principal del agente. Sin una
conversación visible, la región no entrega la orientación representada en el
contrato aprobado.

**Independent Test**: Expandir el agente en una tarea con conversación y
verificar header, mensajes de ambos roles, compositor y contracción, mientras el
lienzo permanece visible y sin superposición.

**Acceptance Scenarios**:

1. **AC-006 / Refs: IMG-UX-02** — **Given** el rail contraído, **When** se
   activa `Expandir agente IA`, **Then** el agente se convierte en una columna
   estructural contigua al lienzo y no en un overlay.
2. **AC-007 / Refs: IMG-UX-02** — **Given** el agente expandido, **When** se
   inspecciona su header, **Then** muestra icono, título `Agente IA`, subtítulo
   `Listo para orientar esta etapa` y un control con nombre accesible `Contraer
   agente IA`.
3. **AC-008 / Refs: IMG-UX-02** — **Given** mensajes del agente, **When** se
   renderiza la conversación, **Then** cada mensaje muestra avatar, nombre
   `Agente IA`, hora y contenido en orden cronológico.
4. **AC-009 / Refs: IMG-UX-02** — **Given** mensajes de la persona, **When** se
   renderiza la conversación, **Then** aparecen alineados a la derecha con su
   avatar, hora y contenido, distinguibles sin depender solo del color.
5. **AC-010 / Refs: IMG-UX-02** — **Given** el agente expandido, **When** se
   contrae y vuelve a expandir, **Then** la conversación, el borrador del
   compositor y la posición recuperable de lectura conservan el contexto de la
   tarea bajo las reglas existentes.
6. **AC-011 / Refs: IMG-UX-02** — **Given** el agente expandido junto al lienzo,
   **When** se inspeccionan sus acciones, **Then** existe exactamente una acción
   primaria para el estado de la etapa y `Enviar`, `Aceptar`, `Editar` y
   `Descartar` permanecen visual y semánticamente secundarios.

---

### User Story 3 - Resolver una propuesta dentro del chat (Priority: P1)

**Visual Refs**: IMG-UX-02; IMG-UX-05 únicamente para el conteo del badge.

Como persona que recibe orientación, quiero aceptar, editar o descartar una
propuesta asociada a un campo para controlar explícitamente qué contenido pasa
al lienzo.

**Why this priority**: Las propuestas son el puente entre la conversación y el
trabajo estructurado. Deben permanecer reversibles y bajo decisión humana.

**Independent Test**: Mostrar una propuesta pendiente para un campo y ejecutar
por separado `Aceptar`, `Editar` y `Descartar`, comprobando el resultado visible
y la actualización del conteo pendiente.

**Acceptance Scenarios**:

1. **AC-012 / Refs: IMG-UX-02** — **Given** una propuesta pendiente, **When**
   se muestra en el chat, **Then** aparece una tarjeta titulada `Propuesta para
   <campo>`, el texto completo propuesto y las acciones `Aceptar`, `Editar` y
   `Descartar`.
2. **AC-013 / Refs: IMG-UX-02** — **Given** una propuesta pendiente, **When**
   la persona elige `Aceptar`, **Then** el valor propuesto se confirma sin
   cambios mediante el flujo existente, deja de estar pendiente y el lienzo
   refleja la decisión según sus reglas actuales.
3. **AC-014 / Refs: IMG-UX-02** — **Given** una propuesta pendiente, **When**
   la persona elige `Editar`, modifica el valor y confirma, **Then** se procesa
   el valor editado mediante el mismo flujo de decisión; una edición inválida
   permanece disponible y comunica el problema sin aplicar cambios.
4. **AC-015 / Refs: IMG-UX-02** — **Given** una propuesta pendiente, **When**
   la persona elige `Descartar`, **Then** la propuesta deja de estar pendiente y
   el campo del lienzo conserva su valor anterior.
5. **AC-016 / Refs: IMG-UX-02, IMG-UX-05** — **Given** varias propuestas
   pendientes, **When** se resuelve una de ellas, **Then** el badge disminuye en
   una unidad; al resolver la última, desaparece.

---

### User Story 4 - Escribir sin perder espacio de trabajo (Priority: P2)

**Visual Refs**: IMG-UX-02, IMG-UX-03.

Como persona que usa el agente, quiero un compositor claro al final de su
columna y desplazamiento independiente para escribir y revisar una conversación
larga sin mover involuntariamente el lienzo.

**Why this priority**: El chat debe poder crecer sin cubrir campos ni acciones
de la etapa. En tablet, compartir un único scroll vuelve inaccesible una de las
dos regiones.

**Independent Test**: Enviar un mensaje desde el compositor y, en 1024 × 768,
desplazar por separado una conversación y un lienzo más altos que el viewport,
comprobando que cada región conserva su posición y que el compositor no cubre
contenido.

**Acceptance Scenarios**:

1. **AC-017 / Refs: IMG-UX-02, IMG-UX-03** — **Given** el agente expandido,
   **When** se llega a su parte inferior, **Then** existe un compositor dentro de
   la columna con placeholder `Escribe al agente…`, botón `Adjuntar archivo` y
   botón `Enviar`; el adjunto está deshabilitado y comunica accesiblemente que
   la capacidad aún no está disponible.
2. **AC-018 / Refs: IMG-UX-02, IMG-UX-03** — **Given** texto no vacío en el
   compositor, **When** se activa `Enviar`, **Then** se reutiliza el flujo de
   envío existente; el control de adjunto deshabilitado no recibe activación,
   no envía ni muta mensajes.
3. **AC-019 / Refs: IMG-UX-03** — **Given** un viewport de 1024 × 768 con
   contenido largo en ambas regiones, **When** se desplaza el lienzo, **Then** la
   posición del chat no cambia; al desplazar el chat, la posición del lienzo no
   cambia.
4. **AC-020 / Refs: IMG-UX-02, IMG-UX-03** — **Given** contenido que excede la
   altura disponible, **When** se recorre el workspace, **Then** chat, compositor,
   formulario y acciones permanecen alcanzables sin superposición ni
   desbordamiento horizontal.

### Edge Cases

- El estado por defecto de una tarea sin preferencia guardada es contraído.
- Una preferencia desconocida, corrupta o perteneciente a una tarea inexistente
  no abre el agente ni contamina otra tarea.
- El badge cuenta solo propuestas con estado pendiente de la tarea y etapa
  visibles; propuestas aceptadas, editadas, descartadas, en conflicto o de otra
  etapa no incrementan el conteo.
- Una cantidad de dos o más dígitos sigue siendo legible, no ensancha el rail
  más allá de 7 rem o del 12 % disponible y conserva un nombre accesible con el
  conteo.
- Mensajes con la misma hora preservan su orden conversacional estable.
- Un mensaje sin texto útil no crea una burbuja vacía; los estados existentes de
  envío, error y reintento conservan su comportamiento.
- Un nombre de campo largo puede envolver dentro de la tarjeta sin ocultar el
  texto propuesto ni sus tres acciones.
- Una propuesta editada con valor inválido no se aplica, no reduce el badge y
  conserva la edición para corregirla.
- Activar `Enviar` con contenido vacío o solo espacios no crea un mensaje.
- Contraer durante un envío en curso no cancela ni duplica la operación.
- Una conversación larga no empuja el compositor fuera de su columna ni lo
  superpone sobre la última propuesta.
- A 390 × 844 y 320 × 667 se conserva la proyección móvil ya existente; esta
  feature no añade ni redefine tabs, breakpoints o navegación móvil.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 / Refs: IMG-UX-01**: El estado contraído MUST representarse en
  escritorio y tablet como un rail reservado a la marca y controles del agente,
  con un máximo de 7 rem y del 12 % del ancho disponible; nunca como una columna
  de contenido vacía o con placeholder.
- **FR-002 / Refs: IMG-UX-01**: El rail MUST mostrar `Agente IA`, un icono
  sparkle y un control accesible denominado `Expandir agente IA`.
- **FR-003 / Refs: IMG-UX-01**: Al contraerse, el agente MUST liberar el ancho de
  columna para el lienzo sin cubrir, recortar ni reordenar su contenido.
- **FR-004 / Refs: IMG-UX-01**: El estado contraído MUST omitir los textos
  `Panel estructural` y `Expandir agente` usados como contenido de relleno.
- **FR-005 / Refs: IMG-UX-01, IMG-UX-02**: La preferencia contraído/expandido
  MUST persistir de forma independiente por tarea mediante el estado de
  workspace existente.
- **FR-006 / Refs: IMG-UX-02**: El estado expandido MUST ocupar una columna
  estructural contigua al lienzo y MUST NOT presentarse como overlay.
- **FR-007 / Refs: IMG-UX-02**: El header expandido MUST mostrar icono, `Agente
  IA`, `Listo para orientar esta etapa` y un control accesible `Contraer agente
  IA`.
- **FR-008 / Refs: IMG-UX-02**: La conversación MUST ordenar los mensajes por su
  secuencia temporal estable y mostrar contenido, hora, identidad y avatar de
  cada participante.
- **FR-009 / Refs: IMG-UX-02**: Los mensajes del agente MUST identificar
  `Agente IA`; los mensajes de la persona MUST alinearse a la derecha y ambos
  roles MUST distinguirse por más de una señal visual.
- **FR-010 / Refs: IMG-UX-02**: Cada propuesta pendiente MUST presentarse como
  tarjeta `Propuesta para <campo>` con el valor propuesto completo y exactamente
  tres decisiones: `Aceptar`, `Editar` y `Descartar`.
- **FR-011 / Refs: IMG-UX-02**: `Aceptar`, `Editar` y `Descartar` MUST reutilizar
  el flujo existente de decisión de propuestas y conservar sus garantías de
  aplicación, validación, conflicto, persistencia y no modificación al descartar.
- **FR-012 / Refs: IMG-UX-01, IMG-UX-05**: El rail contraído MUST mostrar el
  conteo exacto y accesible de propuestas pendientes para la tarea y etapa
  visibles, y MUST omitirlo cuando el conteo sea cero.
- **FR-013 / Refs: IMG-UX-02, IMG-UX-03**: El compositor MUST permanecer dentro
  de la columna del agente y mostrar el placeholder `Escribe al agente…`, un
  botón accesible `Adjuntar archivo` deshabilitado con explicación de que la
  capacidad aún no está disponible, y un botón `Enviar`.
- **FR-014 / Refs: IMG-UX-02, IMG-UX-03**: `Enviar` MUST conservar el flujo de
  conversación existente, incluidos borrador, estados de envío, error y
  reintento; contenido vacío MUST NOT crear mensajes.
- **FR-015 / Refs: IMG-UX-03**: En 1024 × 768, el lienzo y el área conversacional
  MUST tener desplazamiento vertical independiente y conservar su propia
  posición al desplazar la otra región.
- **FR-016 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: Rail, columna, mensajes,
  tarjetas y compositor MUST ser operables por teclado, tener nombres accesibles
  y mantener contraste aplicable de al menos 4.5:1 para texto normal y 3:1 para
  texto grande, iconos y límites de controles.
- **FR-017 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: Lienzo, agente y compositor
  MUST mantener cero superposiciones y cero desbordamientos horizontales en
  1440 × 900, 1024 × 768, 390 × 844 y 320 × 667.
- **FR-018 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: La proyección en 390 × 844
  y 320 × 667 MUST conservar la navegación móvil existente sin añadir ni
  rediseñar tabs, breakpoints o cambios de plano reservados para spec 015.
- **FR-019 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: El cambio MUST limitarse
  al frontend y MUST NOT modificar backend, esquemas, rutas, almacenamiento de
  dominio ni el pipeline del asistente.
- **FR-020 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: La aceptación visual MUST
  comparar capturas actuales contra los mockups y clasificar cada diferencia
  como aprobada, pendiente o defecto; los mockups MUST NOT convertirse
  automáticamente en baselines ejecutables.
- **FR-021 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: Cada estado MUST mostrar
  exactamente una acción primaria de etapa; `Enviar`, `Aceptar`, `Editar` y
  `Descartar` MUST conservar tratamiento visual y semántico secundario.
- **FR-022 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: La aceptación MUST quedar
  en `HUMAN_DECISION_REQUIRED` hasta que una persona apruebe las ocho capturas,
  existan cero defectos abiertos dentro del alcance y cualquier baseline
  aceptada esté versionada intencionalmente.

### Validation and Traceability Contract

- **Capa A — test-first**: las pruebas de comportamiento se escriben y ejecutan
  en rojo antes de modificar producto. Con Vitest deben cubrir rail compacto y
  nombre accesible; expansión/contracción y persistencia por tarea; roles,
  avatares y horas; tarjeta y las tres decisiones mediante el manejador
  existente; conteo y desaparición del badge; compositor, envío y adjunto;
  estado deshabilitado y explicación accesible del adjunto; una sola acción
  primaria; además de los edge cases aplicables.
- **Capa B — visual y geometría**: Playwright captura de forma determinista
  IMG-UX-01 (rail) e IMG-UX-02 (chat activo con propuesta) en 1440 × 900,
  1024 × 768, 390 × 844 y 320 × 667. Las proyecciones móviles verifican la
  composición existente sin convertir los mockups de escritorio en referencias
  móviles ni implementar spec 015. En 1024 × 768 también verifica independencia
  de scroll; en los cuatro viewports comprueba cero superposiciones entre chat,
  lienzo y compositor, ausencia de overflow, exactamente una acción primaria y
  una auditoría axe-core completa sin violaciones. Teclado, orden de foco,
  retorno de foco y explicación de controles deshabilitados se verifican además
  con aserciones explícitas porque no quedan cubiertos íntegramente por la
  auditoría automática. Toda captura candidata requiere revisión humana antes
  de reemplazar una baseline.
- **Capa C — comparación documentada**: `evidence/visual-comparison.md` compara
  los ACTUAL contra IMG-UX-01, IMG-UX-02 e IMG-UX-03 por jerarquía, contenido,
  geometría, interacción, responsive y accesibilidad. Cada diferencia queda
  clasificada como `aprobada`, `pendiente` o `defecto`. El cierre permanece en
  `HUMAN_DECISION_REQUIRED` mientras una captura no esté aprobada o exista un
  defecto de alcance; una baseline aceptada debe quedar versionada.

### Key Entities

- **Estado de región del agente**: preferencia contraída o expandida asociada a
  una tarea; no crea un nuevo estado de dominio.
- **Mensaje de conversación**: intervención ordenada de agente o persona con
  identidad, hora, contenido y estado de entrega ya existentes.
- **Propuesta de campo**: valor sugerido para un campo concreto, asociado al
  mensaje que lo originó y a una decisión pendiente, aplicada, editada,
  descartada o en conflicto.
- **Conteo de pendientes**: valor derivado de las propuestas pendientes visibles
  para la tarea y etapa activas; no se persiste como dato independiente.
- **Borrador del compositor**: texto en preparación asociado al contexto de la
  tarea según las reglas existentes de workspace.

## Dependencies

- Spec 006 conserva autoridad sobre conversación, mensajes, propuestas y
  confirmación humana.
- Spec 008 conserva autoridad sobre composición estructural, persistencia,
  evaluación y reglas de dominio del workspace.
- Spec 010 proporciona la infraestructura visual, captura determinista,
  geometría, axe-core y gate humano de baselines.
- Spec 011 proporciona el shell y la distribución general del workspace.
- Spec 012 proporciona el lienzo de formulario que esta feature debe acompañar
  sin modificar.
- El manifiesto visual aprobado define IMG-UX-01, IMG-UX-02 e IMG-UX-03 como
  referencias principales. IMG-UX-05 se usa solo como evidencia del badge `1` y
  no incorpora su contrato de bloqueo.
- El estado por tarea, el flujo de envío y el manejador de decisiones existentes
  son contratos que se reutilizan, no se reemplazan.

## Out of Scope

- Lógica de evaluación, bloqueos, errores inline o recuperación de spec 014.
- Tabs, selector Etapa/Agente, nuevos breakpoints o rediseño móvil de spec 015.
- Resumen y acciones de tarea completada de spec 016.
- Carga, almacenamiento, transmisión o procesamiento real de archivos adjuntos.
- Nuevos roles de conversación, automatización de decisiones o aplicación de
  propuestas sin confirmación humana.
- Cambios de backend, API, rutas, esquemas, almacenamiento o pipeline del
  asistente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 / Refs: IMG-UX-01**: En el 100 % de los estados contraídos verificados
  en escritorio y tablet, el rail mide como máximo 7 rem y 12 % del ancho
  disponible, el lienzo recupera el resto y existen cero instancias del
  placeholder `Panel estructural`.
- **SC-002 / Refs: IMG-UX-01, IMG-UX-02**: Una sola activación alterna entre
  rail y columna, y el 100 % de las tareas probadas recupera su preferencia sin
  heredar la de otra tarea.
- **SC-003 / Refs: IMG-UX-02**: El 100 % de los mensajes del fixture muestra
  avatar, identidad, hora y contenido en orden estable; todos los mensajes de la
  persona están alineados a la derecha.
- **SC-004 / Refs: IMG-UX-02**: Cada propuesta pendiente muestra exactamente
  tres decisiones y las pruebas confirman los tres resultados: aplicación sin
  cambios, aplicación del valor editado válido y descarte sin mutar el campo.
- **SC-005 / Refs: IMG-UX-01, IMG-UX-05**: En todos los conteos probados —0, 1 y
  múltiples pendientes— el badge coincide exactamente; con cero pendientes hay
  cero badges visibles.
- **SC-006 / Refs: IMG-UX-02, IMG-UX-03**: El compositor permanece alcanzable
  y dentro del agente en los cuatro viewports, envía texto válido y no genera
  mensajes para entradas vacías.
- **SC-007 / Refs: IMG-UX-03**: En 1024 × 768, el 100 % de las pruebas de scroll
  mantiene inmóvil la región no desplazada y permite alcanzar el final de lienzo
  y conversación de manera independiente.
- **SC-008 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: Las ocho capturas
  contractuales —dos estados por cuatro viewports— reportan cero superposiciones,
  cero desbordamientos horizontales, exactamente una acción primaria y cero
  violaciones en la auditoría automática de accesibilidad; las verificaciones
  explícitas de teclado y foco también pasan en los ocho estados.
- **SC-009 / Refs: IMG-UX-01, IMG-UX-02, IMG-UX-03**: El 100 % de las diferencias
  observadas contra las tres referencias queda clasificado, las ocho capturas
  reciben aprobación humana, quedan cero defectos abiertos dentro del alcance y
  ninguna baseline cambia sin aprobación y versionado intencionales.

## Assumptions

- El estado inicial contraído y su persistencia por tarea ya existen y se
  conservan como fuente de verdad.
- El conteo del badge se deriva de propuestas pendientes de la conversación
  visible para la tarea y etapa activas; no incluye propuestas resueltas ni de
  otras etapas.
- `Editar` reutiliza la validación y confirmación de valor editado existentes;
  esta feature cambia su presentación, no sus reglas de aplicación.
- El botón de adjunto es una affordance frontend visible pero deshabilitada, con
  explicación accesible. Al no existir autorización para ampliar el pipeline,
  la transferencia de archivos queda explícitamente diferida.
- Los cuatro viewports son 1440 × 900, 1024 × 768, 390 × 844 y 320 × 667, según
  la infraestructura visual vigente.
- Los mockups son referencias aprobadas de intención, no baselines ejecutables.
