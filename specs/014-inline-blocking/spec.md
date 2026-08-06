# Feature Specification: Estado de bloqueo con errores inline y recuperación

**Feature Branch**: `codex/014-inline-blocking`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "Presentar una evaluación que requiere ajustes como un estado de bloqueo recuperable: resumen superior, correcciones junto a sus campos, acción primaria de reevaluación, notificación en el agente y limpieza tras una reevaluación exitosa. Solo frontend; referencia IMG-UX-05."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender qué debe corregirse y dónde (Priority: P1)

Como persona que trabaja en una etapa activa, quiero ver un resumen de las
correcciones pendientes y cada corrección junto al campo que la causó, para
resolver el bloqueo sin tener que deducir la relación entre una lista genérica y
el formulario.

**Why this priority**: El valor principal de la funcionalidad es convertir una
evaluación abstracta en instrucciones localizadas y accionables. Sin esa
proximidad, el estado sigue siendo tan ambiguo como la presentación actual.

**Independent Test**: Sembrar una evaluación vigente con dos correcciones
asociadas a `Análisis` y `Criterio de éxito`; comprobar que el banner anuncia
exactamente dos pendientes, enumera ambas y que cada mensaje aparece dentro del
bloque visual de su campo, conforme a IMG-UX-05.

**Acceptance Scenarios**:

1. **AC-001 / IMG-UX-05** — **Given** una evaluación vigente que requiere dos ajustes, **When** se presenta el lienzo, **Then** aparece en su parte superior un banner con el texto `2 correcciones pendientes` y la lista completa de ambas correcciones.
2. **AC-002 / IMG-UX-05** — **Given** que una corrección identifica `Análisis` como causa, **When** se presenta el formulario, **Then** el mensaje aparece dentro del bloque de `Análisis`, visual y semánticamente asociado a su control.
3. **AC-003 / IMG-UX-05** — **Given** que otra corrección identifica `Criterio de éxito`, **When** se presenta el formulario, **Then** el mensaje aparece dentro del bloque de `Criterio de éxito` y no en un contenedor genérico separado.
4. **AC-004 / IMG-UX-05** — **Given** varias correcciones para un mismo campo, **When** se presenta ese campo, **Then** se muestran todos sus mensajes no duplicados dentro del mismo bloque y el conteo superior refleja las correcciones únicas.
5. **AC-004A / IMG-UX-05** — **Given** el motivo canónico `Define una hipótesis verificable para poder evaluar el análisis`, **When** se proyecta la evaluación, **Then** se mapea exactamente al campo `Análisis`; y `Define criterio(s) de éxito para cerrar la fase.` se mapea exactamente a `Criterio de éxito`.
6. **AC-004B / IMG-UX-05** — **Given** cualquier otro motivo canónico que ya tenga una asociación exacta en el catálogo presentacional existente de la fase visible, **When** se proyecta la evaluación, **Then** su mensaje aparece dentro del bloque de ese campo existente sin añadir campos, controles, motivos o reglas de captura; un motivo sin asociación permanece solo en el banner.

---

### User Story 2 - Recuperarse desde una única ruta de acción (Priority: P1)

Como persona bloqueada por una evaluación, quiero identificar el estado,
consultar las recomendaciones del agente y reevaluar mediante una sola acción
principal, para saber inequívocamente cuál es el siguiente paso.

**Why this priority**: La corrección inline explica el problema, pero la
recuperación necesita una salida clara. El estado, el agente y la acción primaria
deben comunicar la misma situación.

**Independent Test**: Abrir una etapa con correcciones vigentes en cada viewport
contractual; comprobar el chip `Evaluación requiere ajustes`, una sola primaria
`Reevaluar etapa`, la notificación del agente contraído y expandido, y que `Ver
recomendaciones del agente` abre o enfoca la conversación sin cubrir el lienzo,
conforme a IMG-UX-05.

**Acceptance Scenarios**:

1. **AC-005 / IMG-UX-05** — **Given** una evaluación vigente con correcciones pendientes, **When** se presenta el estado, **Then** el chip muestra exactamente `Evaluación requiere ajustes`.
2. **AC-006 / IMG-UX-05** — **Given** el mismo estado, **When** se inspeccionan las acciones visibles, **Then** existe exactamente una acción primaria y su etiqueta es `Reevaluar etapa`.
3. **AC-007 / IMG-UX-05** — **Given** el agente contraído y al menos una corrección pendiente, **When** se presenta el rail, **Then** su badge anuncia el número exacto de correcciones pendientes.
4. **AC-008 / IMG-UX-05** — **Given** el agente expandido y al menos una corrección pendiente, **When** se presenta su encabezado, **Then** el mismo conteo permanece visible y accesible sin duplicar la acción primaria.
5. **AC-009 / IMG-UX-05** — **Given** una o más correcciones pendientes, **When** la persona activa `Ver recomendaciones del agente`, **Then** el agente queda abierto y enfocado en la conversación relevante mediante el patrón estructural ya disponible para ese viewport.

---

### User Story 3 - Confirmar que la corrección resolvió el bloqueo (Priority: P1)

Como persona que ya ajustó los campos, quiero que una reevaluación exitosa limpie
el estado de error y restablezca el flujo normal, para confirmar que el bloqueo
fue resuelto y continuar sin residuos visuales.

**Why this priority**: Un bloqueo recuperable solo está completo si existe una
transición observable de salida. Mantener errores antiguos después del éxito
haría que la interfaz contradijera la evaluación vigente.

**Independent Test**: Partir de dos correcciones visibles, editar los campos y
obtener una reevaluación vigente y aceptable; comprobar sin recargar que banner,
mensajes inline y badges desaparecen, y que la única acción primaria vuelve a
`Evaluar etapa` o al avance permitido por el gate existente.

**Acceptance Scenarios**:

1. **AC-010 / IMG-UX-05** — **Given** correcciones visibles, **When** la persona modifica los campos pero aún no completa una reevaluación exitosa, **Then** las correcciones continúan visibles como pendientes de confirmación.
2. **AC-011 / IMG-UX-05** — **Given** correcciones visibles, **When** una reevaluación vigente resulta aceptable, **Then** el banner, los mensajes inline y los badges de correcciones desaparecen sin recargar la tarea.
3. **AC-012 / IMG-UX-05** — **Given** una reevaluación aceptable, **When** el gate permite avanzar, **Then** la única acción primaria es el avance ya definido por el flujo existente.
4. **AC-013 / IMG-UX-05** — **Given** que ya no existe una evaluación vigente aplicable y el gate aún no permite avanzar, **When** se presenta la etapa, **Then** la única acción primaria vuelve a `Evaluar etapa`.

---

### User Story 4 - Distinguir bloqueo, desfase y fallo de evaluación (Priority: P2)

Como persona que recibe estados distintos del evaluador, quiero que una
evaluación desfasada o fallida no se presente como si fueran correcciones
vigentes de campos, para elegir la recuperación adecuada sin información
engañosa.

**Why this priority**: Los fixtures existentes incluyen desfase y fallo. Su
regresión protege la claridad del flujo, aunque el caso principal siga siendo la
evaluación vigente que requiere ajustes.

**Independent Test**: Presentar por separado una evaluación desfasada y un fallo
de evaluación; confirmar que conservan sus etiquetas y recuperación existentes,
que ofrecen `Reevaluar etapa`, y que no generan mensajes inline ni conteos de
correcciones a partir de resultados no vigentes.

**Acceptance Scenarios**:

1. **AC-014 / IMG-UX-05** — **Given** una evaluación desfasada que no proviene de un resultado previo `needs-work`, **When** se presenta la etapa, **Then** el estado se identifica como obsoleto, la única primaria permite reevaluar y no aparecen correcciones inline atribuidas como vigentes; si el resultado `needs-work` de la misma tarea/fase se volvió desfasado únicamente por la edición local posterior, sus correcciones ya visibles permanecen como pendientes de confirmación hasta reevaluar.
2. **AC-015 / IMG-UX-05** — **Given** un fallo de transporte o evaluación sin correcciones vigentes utilizables, **When** se presenta la etapa, **Then** se conserva el mensaje de error y recuperación correspondiente, sin badge de correcciones ni asociación falsa a campos.
3. **AC-016 / IMG-UX-05** — **Given** correcciones previamente vigentes y visibles, **When** la reevaluación posterior falla por transporte, **Then** el chip cambia a `Evaluación con error`, la única primaria sigue siendo `Reevaluar etapa` y las correcciones anteriores permanecen visibles como pendientes de confirmación hasta obtener un resultado vigente y aceptable.

### Edge Cases

- Una corrección sin campo reconocido permanece en el banner general y nunca se
  coloca junto a un campo arbitrario.
- Mensajes vacíos se omiten; mensajes idénticos para el mismo campo se cuentan y
  muestran una sola vez.
- Dos mensajes distintos para el mismo campo se conservan y se anuncian como dos
  correcciones pendientes.
- El conteo admite cero, uno, varios y dos dígitos sin romper el rail, el header o
  el banner.
- Si el agente ya está abierto, el enlace de recomendaciones mueve el foco sin
  contraerlo, remontarlo ni perder el borrador de conversación.
- En viewport móvil, el enlace reutiliza el selector de plano existente y no
  introduce una tercera navegación ni una estructura nueva.
- Una edición local no elimina una corrección hasta que una evaluación vigente y
  aceptable confirma la recuperación.
- Una evaluación tardía de otra tarea, fase o revisión no altera los errores, el
  conteo ni la acción de la etapa visible.
- Una tarea completada permanece de solo lectura y no adopta el estado de
  reevaluación de una etapa activa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 / IMG-UX-05**: El lienzo MUST mostrar un banner superior cuando una evaluación vigente de la etapa visible requiera ajustes.
- **FR-002 / IMG-UX-05**: El banner MUST anunciar `N correcciones pendientes`, usando singular para una corrección y plural para cualquier otro conteo positivo.
- **FR-003 / IMG-UX-05**: El banner MUST enumerar todas las correcciones únicas vigentes sin truncar su contenido y MUST incluir `Ver recomendaciones del agente`.
- **FR-004 / IMG-UX-05**: Cada corrección con un campo reconocido MUST aparecer dentro del bloque visual y semántico de ese campo, mediante una extensión presentacional del bloque existente que no altere el campo, su valor ni su captura.
- **FR-005 / IMG-UX-05**: El control de un campo con correcciones MUST exponer programáticamente la relación con todos sus mensajes inline.
- **FR-006 / IMG-UX-05**: Las correcciones sin campo reconocido MUST permanecer en el resumen superior y MUST NOT asociarse a un campo arbitrario.
- **FR-007 / IMG-UX-05**: La presentación MUST deduplicar mensajes idénticos del mismo campo antes de calcular el conteo.
- **FR-008 / IMG-UX-05**: Una evaluación vigente que requiere ajustes MUST presentar el chip exacto `Evaluación requiere ajustes`.
- **FR-009 / IMG-UX-05**: En ese estado MUST existir exactamente una acción primaria visible con la etiqueta `Reevaluar etapa`.
- **FR-010 / IMG-UX-05**: Activar `Ver recomendaciones del agente` MUST abrir el agente si está contraído y trasladar el foco a su conversación; si ya está abierto, MUST conservar su estado y enfocar la misma región.
- **FR-011 / IMG-UX-05**: El agente MUST mostrar el número de correcciones pendientes tanto en el rail contraído como en el encabezado expandido.
- **FR-012 / IMG-UX-05**: El conjunto y conteo de correcciones MUST derivarse únicamente de los `gateReasons` no vacíos de la evaluación vigente que requiere ajustes y que aplica a la tarea, fase y revisión visibles; debilidades y recomendaciones siguen siendo contexto del agente y MUST NOT incrementar este conteo.
- **FR-012A / IMG-UX-05**: La asociación inline MUST usar un catálogo presentacional de coincidencia exacta entre motivo canónico y clave de campo existente; MUST mapear literalmente `Define una hipótesis verificable para poder evaluar el análisis` a `Análisis` y `Define criterio(s) de éxito para cerrar la fase.` a `Criterio de éxito`, y MUST NOT inferir campos mediante coincidencia parcial o interpretación de texto libre.
- **FR-013 / IMG-UX-05**: Editar un campo MUST NOT retirar su corrección antes de una reevaluación vigente y aceptable.
- **FR-014 / IMG-UX-05**: Una reevaluación vigente y aceptable MUST retirar banner, mensajes inline y badges de correcciones sin requerir recarga.
- **FR-015 / IMG-UX-05**: Tras la limpieza, la única acción primaria MUST volver a `Evaluar etapa` cuando corresponda evaluar, o al avance que el gate existente ya permita.
- **FR-016 / IMG-UX-05**: Una evaluación desfasada que no proviene de un resultado `needs-work`, o un fallo inicial sin correcciones previas, MUST conservar una presentación distinguible y MUST NOT crear correcciones inline o badges. Si un resultado `needs-work` aplicable se vuelve desfasado únicamente porque la persona editó la misma tarea/fase, sus correcciones existentes MUST permanecer visibles como pendientes de confirmación hasta una reevaluación vigente.
- **FR-016A / IMG-UX-05**: Si falla por transporte la reevaluación de una etapa que ya tenía correcciones visibles, el estado MUST mostrar `Evaluación con error`, conservar esas correcciones como pendientes de confirmación y mantener `Reevaluar etapa` como única primaria hasta una reevaluación vigente y aceptable.
- **FR-017 / IMG-UX-05**: Los estados de corrección MUST conservar legibilidad, contraste, navegación por teclado y asociación accesible en los cuatro viewports contractuales.
- **FR-018 / IMG-UX-05**: Banner, campos, agente y acción primaria MUST permanecer contenidos en sus regiones, sin overlays, superposiciones ni overflow horizontal.
- **FR-019 / IMG-UX-05**: La funcionalidad MUST reutilizar la estructura del formulario y del agente existentes y MUST NOT introducir cambios de backend, persistencia, gates de dominio o navegación móvil nueva.
- **FR-020 / IMG-UX-05**: La entrega MUST producir una comparación visual documentada entre el estado actual y IMG-UX-05 para los cuatro viewports contractuales antes de aceptar nuevas referencias visuales.

### Key Entities

- **Corrección pendiente**: Instrucción vigente para resolver un motivo de
  evaluación. Incluye mensaje, campo causante cuando se conoce, pertenencia a
  tarea/fase/revisión y estado de vigencia.
- **Resumen de correcciones**: Presentación superior del conjunto único de
  correcciones vigentes, su conteo y la ruta hacia las recomendaciones del
  agente.
- **Estado de recuperación**: Proyección coordinada del chip, la acción primaria,
  el badge del agente y los mensajes inline para la evaluación visible.
- **Evaluación vigente**: Resultado aplicable a la tarea, fase y revisión
  actuales; es la única fuente autorizada para declarar correcciones pendientes.

## Scope Boundaries

### Included

- Presentación frontend de evaluaciones vigentes que requieren ajustes.
- Asociación corrección-campo, banner, chip, acción primaria y notificaciones del
  agente.
- Recuperación tras reevaluación y regresión de estados desfasado/fallido.
- Evidencia visual IMG-UX-05 en 1440×900, 1024×768, 390×844 y 320×667.

### Excluded

- Cambios al inventario de campos, valores, reglas de captura o composición
  funcional del formulario base definido por la spec 012. Sí se permiten
  extensiones presentacionales y accesibles de error dentro de sus bloques
  existentes.
- Cambios a la estructura rail/columna/chat definida por la spec 013.
- Nuevos gates, reglas de evaluación, bloqueos o decisiones de dominio.
- Cambios de backend, persistencia, transporte o pipeline del asistente.
- Nuevos tabs, drawers o patrones móviles.

## Validation Obligations

- **Capa A**: Debe demostrar primero la ausencia del comportamiento y luego
  verificar el catálogo exacto `gateReason`→campo con dos correcciones en
  `Análisis` y `Criterio de éxito`, banner, foco del agente, primaria, badges,
  limpieza, desfase, fallo inicial y fallo durante recuperación.
- **Capa B**: Debe verificar IMG-UX-05 en los cuatro viewports, proximidad real
  del mensaje dentro del bloque causante, cero superposiciones y cero violaciones
  aplicables de contraste mediante axe-core.
- **Capa C**: Debe crear
  `specs/014-inline-blocking/evidence/visual-comparison.md` y documentar ACTUAL
  frente a IMG-UX-05 por jerarquía, contenido, geometría, interacción,
  responsive y accesibilidad; capturar no equivale a aprobar una referencia
  visual.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 / IMG-UX-05**: En el fixture contractual de dos correcciones, el 100 % de los mensajes aparece tanto en el banner como dentro del bloque correcto: `Análisis` y `Criterio de éxito`, sin mensajes huérfanos o duplicados.
- **SC-002 / IMG-UX-05**: En los cuatro viewports, toda evaluación vigente que requiera ajustes muestra exactamente una acción primaria y su etiqueta es `Reevaluar etapa`.
- **SC-003 / IMG-UX-05**: La persona puede pasar del banner a la conversación relevante del agente con una sola activación, conservando el lienzo y el borrador existentes.
- **SC-004 / IMG-UX-05**: El conteo mostrado en banner, rail y header coincide en el 100 % de los estados con 1, varios y dos dígitos.
- **SC-005 / IMG-UX-05**: Tras una reevaluación vigente y aceptable, el 100 % de los indicadores de corrección desaparece sin recargar y la acción primaria coincide con el gate existente.
- **SC-006 / IMG-UX-05**: Los cuatro viewports contractuales presentan cero superposiciones y cero overflow horizontal entre banner, campos, agente y acción primaria.
- **SC-007 / IMG-UX-05**: Los cuatro viewports registran cero violaciones aplicables de axe-core; cada control con error referencia programáticamente su mensaje inline y, tras activar el enlace de recomendaciones, el foco observable queda dentro de la conversación del agente.
- **SC-008 / IMG-UX-05**: Las evaluaciones desfasadas, fallidas y tardías conservan el 100 % de sus límites: ninguna inventa correcciones inline, conteos o cambios de la etapa visible a partir de datos no aplicables; únicamente un `needs-work` previo de la misma tarea/fase puede conservar sus correcciones ya pendientes durante edición stale o fallo de reevaluación.

## Assumptions

- Una corrección pendiente corresponde a un motivo de una evaluación vigente que
  requiere ajustes y posee un mensaje no vacío.
- Una corrección se origina exclusivamente en un `gateReason` no vacío de una
  evaluación vigente que requiere ajustes. Su campo se obtiene de un catálogo
  presentacional de coincidencia exacta entre el motivo canónico y la clave de
  campo existente; esta feature no infiere campos desde texto libre.
- `Análisis` corresponde al bloque de análisis del problema y `Criterio de éxito`
  al campo de criterio de éxito existentes.
- Las correcciones permanecen visibles después de editar hasta que una nueva
  evaluación vigente y aceptable confirme la recuperación.
- Las evaluaciones desfasadas que no provienen de `needs-work` y los fallos sin
  resultado previo utilizable son estados de reevaluación, no listas de
  correcciones actuales. Un `needs-work` de la misma tarea/fase que se vuelve
  stale por edición conserva sus correcciones como pendientes de confirmación.
- Si una reevaluación falla después de que ya existían correcciones vigentes,
  estas se conservan como pendientes de confirmación; el fallo no las valida ni
  las descarta.
- El agente, el selector móvil, los gates y las acciones de avance existentes son
  dependencias y no se rediseñan dentro de 014.
- Los mockups sirven como contrato de referencia; las nuevas capturas solo se
  convierten en referencias aceptadas tras una decisión explícita.
