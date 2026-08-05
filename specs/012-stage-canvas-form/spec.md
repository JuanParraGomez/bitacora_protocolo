# Feature Specification: Lienzo de etapa como formulario protagonista

**Feature Branch**: `codex/012-stage-canvas-form`

**Created**: 2026-08-05

**Status**: Draft

**Input**: Convertir el lienzo de la etapa activa en el formulario protagonista,
eliminar la cabecera meta redundante y conservar todos los campos y reglas
existentes, de acuerdo con IMG-UX-01 e IMG-UX-04.

**Clarification recorded on 2026-08-05**: Ante la contradicción entre el prompt
(`Cambios sin evaluar` desaparece al guardar) y la semántica normativa de 008
(guardar no evalúa), se recomendó usar `Cambios sin guardar` para la transición
editar → guardar y reservar la vigencia de evaluación para un estado separado.
El usuario respondió `eso` y autorizó crear la spec 012; esta especificación
registra esa respuesta como aceptación de la recomendación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Completar la etapa directamente en el lienzo (Priority: P1)

Como persona que desarrolla una tarea, quiero encontrar el título, el progreso y
los campos editables directamente en el lienzo para concentrarme en el trabajo
de la etapa sin paneles, títulos ni acciones duplicadas.

**Why this priority**: El formulario contiene el trabajo principal. La jerarquía
actual lo desplaza debajo de un panel meta redundante y dificulta identificar qué
se debe completar.

**Independent Test**: Abrir una tarea representativa en cada una de las cuatro
fases y comprobar que el lienzo comienza con el título único, el stepper y los
campos en su orden contractual, con una sola acción primaria y sin el panel meta
ni el botón `Atrás`.

**Acceptance Scenarios**:

1. **AC-001 / Refs: IMG-UX-01, IMG-UX-04** — **Given** una tarea activa en
   cualquiera de las cuatro fases, **When** se abre el lienzo, **Then** se muestra
   un único título de fase sin el prefijo `Fase N ·`, seguido por un stepper
   numerado del 1 al 4 y los campos editables de esa fase.
2. **AC-002 / Refs: IMG-UX-01, IMG-UX-04** — **Given** una tarea en fase 1,
   **When** se recorre el formulario, **Then** aparecen primero, y en este orden,
   `Problema detectado`, `Evidencia`, `Análisis`, `Resultado deseado` y
   `Criterio de éxito`.
3. **AC-003 / Refs: IMG-UX-01, IMG-UX-04** — **Given** cualquier campo textual
   visible, **When** se escribe o borra contenido, **Then** su contador informativo
   se actualiza inmediatamente con el formato `N/500`, sin truncar ni modificar
   datos existentes.
4. **AC-004 / Refs: IMG-UX-01, IMG-UX-04** — **Given** cualquier fase activa,
   **When** se inspeccionan sus acciones, **Then** existe exactamente una acción
   primaria contextual y no aparecen el botón `Atrás`, `ETAPA ACTIVA`,
   `Lienzo de la etapa` ni `SÍNTESIS OPERATIVA`.

---

### User Story 2 - Guardar manualmente con un estado inequívoco (Priority: P1)

Como persona que edita una etapa, quiero saber si el borrador tiene cambios sin
guardar y guardarlo de forma manual para confiar en que las cuatro fases usan la
misma política y no confundir persistencia con evaluación.

**Why this priority**: La política desigual y los avisos duplicados pueden hacer
creer que una edición se guardó o se evaluó cuando ninguna de esas acciones ha
ocurrido.

**Independent Test**: Editar un campo en cada fase, comprobar la aparición del
chip `Cambios sin guardar`, guardar el borrador y verificar que el chip desaparece
solo después de una persistencia exitosa; repetir con fallo y reintento.

**Acceptance Scenarios**:

1. **AC-005 / Refs: IMG-UX-01, IMG-UX-04** — **Given** un borrador limpio,
   **When** se modifica cualquier control editable de la fase, **Then** aparece
   una sola indicación `Cambios sin guardar` y no ocurre un guardado automático.
2. **AC-006 / Refs: IMG-UX-01, IMG-UX-04** — **Given** cambios pendientes,
   **When** `Guardar borrador` finaliza correctamente, **Then** la indicación de
   cambios pendientes desaparece y el estado limpio queda comunicado una sola vez.
3. **AC-007 / Refs: IMG-UX-01, IMG-UX-04** — **Given** un fallo de guardado,
   **When** termina el intento, **Then** los valores editados permanecen visibles,
   el estado continúa pendiente y la persona puede reintentar.
4. **AC-008 / Refs: IMG-UX-01, IMG-UX-04** — **Given** cambios guardados pero
   todavía no evaluados, **When** se inspecciona el estado de la etapa, **Then**
   persistencia y vigencia de evaluación permanecen como conceptos separados;
   guardar nunca presenta el borrador como evaluado.

---

### User Story 3 - Conservar todo el contexto editable (Priority: P1)

Como persona que desarrolla una tarea, quiero que la síntesis prioritaria no
oculte ni elimine la información complementaria para poder revisar y modificar
todo el contenido existente de la fase.

**Why this priority**: El rediseño es de jerarquía visual. Perder campos o volverlos
de solo lectura alteraría el protocolo y podría destruir información existente.

**Independent Test**: Abrir fixtures completos de las cuatro fases, editar cada
control existente y verificar que fase 1 conserva sus campos secundarios en
`Contexto y confirmación` y que fases 2–4 conservan todos sus controles, listas y
operaciones actuales.

**Acceptance Scenarios**:

1. **AC-009 / Refs: IMG-UX-01, IMG-UX-04** — **Given** una tarea en fase 1,
   **When** se expande o recorre `Contexto y confirmación`, **Then** permanecen
   accesibles linaje, confirmaciones, dudas, alcance, restricciones, actores,
   decisión, justificación y formulación vigente.
2. **AC-010 / Refs: IMG-UX-01, IMG-UX-04** — **Given** una tarea en fase 2, 3
   o 4, **When** se recorre su formulario, **Then** todos los campos, listas,
   iteraciones, criterios y acciones de captura existentes siguen editables y en
   el orden contractual definido por FR-010.
3. **AC-011 / Refs: IMG-UX-01, IMG-UX-04** — **Given** contenido histórico de
   más de 500 caracteres, **When** se abre el campo, **Then** el valor completo se
   conserva y el contador informa su longitud real, incluso si supera `500`.

---

### User Story 4 - Trabajar con el mismo formulario en móvil (Priority: P2)

Como persona que trabaja desde móvil, quiero recorrer el mismo contenido y orden
del lienzo de escritorio en un único flujo vertical para editar y guardar sin
campos ocultos ni acciones superpuestas.

**Why this priority**: IMG-UX-04 exige continuidad funcional con escritorio;
una versión abreviada impediría completar el protocolo desde móvil.

**Independent Test**: Abrir las cuatro fases a 390 × 844 y 320 px, recorrer todos
los campos, guardar un cambio y confirmar que el guardado está centrado, la acción
primaria ocupa el ancho disponible y ninguna acción cubre el contenido.

**Acceptance Scenarios**:

1. **AC-012 / Refs: IMG-UX-04** — **Given** un viewport móvil, **When** se abre
   la vista `Etapa`, **Then** el formulario conserva el mismo contenido y orden
   semántico que en escritorio dentro de un único flujo vertical.
2. **AC-013 / Refs: IMG-UX-04** — **Given** el final del formulario móvil,
   **When** aparecen las acciones, **Then** `Guardar borrador` está centrado como
   acción secundaria y la única acción primaria ocupa todo el ancho disponible.
3. **AC-014 / Refs: IMG-UX-04** — **Given** 390 × 844, 320 px o zoom de 200 %,
   **When** se recorre el lienzo, **Then** formulario, agente y acciones permanecen
   alcanzables sin superposición ni desbordamiento horizontal.

### Edge Cases

- Un campo vacío muestra `0/500`.
- Los contadores reflejan caracteres visibles según el valor actual y se
  actualizan tanto al escribir como al borrar o reemplazar contenido.
- `500/500` es informativo, no una validación ni una autorización para truncar;
  un valor histórico mayor puede mostrar, por ejemplo, `742/500`.
- Cambiar de fase o de tarea restablece el estado visual del borrador al estado
  correspondiente a la nueva tarea, sin trasladar un chip pendiente entre tareas.
- Un guardado concurrente comunica un único estado y evita duplicar solicitudes
  por activaciones repetidas mientras está en curso.
- Un fallo de guardado no borra valores ni oculta la posibilidad de reintento.
- Los iconos son apoyo visual; la etiqueta textual asociada sigue siendo el nombre
  accesible del control.
- Los controles no textuales conservan su semántica y no muestran un contador de
  caracteres artificial.
- Una evaluación anterior desfasada continúa bajo las reglas existentes de
  evaluación y no se resuelve al guardar el borrador.
- La ausencia de campos secundarios o controles de captura en cualquier fixture
  de fase se considera una regresión, aunque los cinco prioritarios estén presentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001 / Refs: IMG-UX-01, IMG-UX-04**: El lienzo activo MUST presentar el
  formulario como contenido principal, sin una cabecera meta intermedia.
- **FR-002 / Refs: IMG-UX-01, IMG-UX-04**: El lienzo MUST mostrar exactamente un
  título de fase: `Entender el problema`, `Descomponer el camino`, `Ejecución` o
  `Revisión`, según la fase activa.
- **FR-003 / Refs: IMG-UX-01, IMG-UX-04**: El lienzo MUST mostrar un único stepper
  numerado 1–4 que distinga pasos completados, actual y pendientes, y comunique el
  paso actual de forma accesible.
- **FR-004 / Refs: IMG-UX-01, IMG-UX-04**: La interfaz MUST omitir los textos
  redundantes `ETAPA ACTIVA`, `Lienzo de la etapa`, `Fase N ·` delante del título
  y `SÍNTESIS OPERATIVA`.
- **FR-005 / Refs: IMG-UX-01, IMG-UX-04**: Fase 1 MUST presentar primero y en
  orden: Problema detectado, Evidencia, Análisis, Resultado deseado y Criterio de éxito.
- **FR-006 / Refs: IMG-UX-01, IMG-UX-04**: Cada campo textual visible MUST incluir
  icono, etiqueta textual asociada y contador vivo con formato `N/500`.
- **FR-007 / Refs: IMG-UX-01, IMG-UX-04**: El contador MUST ser informativo y
  MUST NOT truncar, rechazar, sobrescribir ni migrar valores existentes por superar 500.
- **FR-008 / Refs: IMG-UX-01, IMG-UX-04**: Los iconos MUST complementar la
  etiqueta sin reemplazarla ni duplicar el nombre accesible del control.
- **FR-009 / Refs: IMG-UX-01, IMG-UX-04**: Fase 1 MUST conservar los campos
  secundarios editables dentro de una sección identificada como
  `Contexto y confirmación`.
- **FR-010 / Refs: IMG-UX-01, IMG-UX-04**: Fases 2–4 MUST conservar todos sus
  controles, listas, iteraciones, criterios y acciones de captura existentes en
  este orden observable:
  - fase 2: Decisión, Alcance, No-objetivos, Pasos, Dependencias y orden entre
    pasos, Subproblemas, Preguntas abiertas, Riesgos detectados, Predicciones y
    Criterios revisados;
  - fase 3: por cada iteración, Qué hice, Qué pasó, Qué ajusté, Objetivo, Acción,
    Herramienta, Entrada, Resultado, Evidencia, Aprendizaje, Siguiente ajuste,
    Condiciones aplicables, éxito, resultados de criterios, versión de método y
    criterios considerados; después, Añadir iteración, confirmación de compilación
    y confirmación de auditoría;
  - fase 4: confrontaciones de predicción/observado/causa/suposición propia,
    Título de consolidación, Cambio procedimental, Patrón operativo, Conexiones y
    límites, resumen de método, oportunidades de automatización, mejoras de
    criterios y Añadir confrontación.
- **FR-011 / Refs: IMG-UX-01, IMG-UX-04**: Toda edición en cualquiera de las
  cuatro fases MUST marcar el borrador como pendiente sin guardarlo automáticamente.
- **FR-012 / Refs: IMG-UX-01, IMG-UX-04**: Un borrador pendiente MUST mostrar una
  sola indicación `Cambios sin guardar`; el estado MUST desaparecer después de un
  guardado exitoso y MUST permanecer tras un fallo.
- **FR-013 / Refs: IMG-UX-01, IMG-UX-04**: `Guardar borrador` MUST reutilizar la
  política manual uniforme existente para las cuatro fases y comunicar guardando,
  éxito o fallo sin avisos duplicados.
- **FR-014 / Refs: IMG-UX-01, IMG-UX-04**: Guardar MUST NOT crear ni implicar una
  evaluación; la vigencia de evaluación conserva sus reglas y estados existentes.
- **FR-015 / Refs: IMG-UX-01, IMG-UX-04**: El footer del lienzo MUST contener
  `Guardar borrador` como acción secundaria de texto y exactamente una acción
  primaria contextual a la derecha.
- **FR-016 / Refs: IMG-UX-01, IMG-UX-04**: El lienzo activo MUST NOT mostrar un
  botón `Atrás`.
- **FR-017 / Refs: IMG-UX-01, IMG-UX-04**: La acción primaria MUST seguir el
  estado contextual existente; en una fase sin evaluación vigente se presenta
  como `Evaluar etapa`.
- **FR-018 / Refs: IMG-UX-04**: Móvil MUST conservar el mismo contenido y orden
  semántico de escritorio en un flujo vertical.
- **FR-019 / Refs: IMG-UX-04**: En móvil, `Guardar borrador` MUST estar centrado
  y la única acción primaria MUST ocupar el ancho disponible al final del flujo.
- **FR-020 / Refs: IMG-UX-01, IMG-UX-04**: Formulario, agente y acciones MUST
  permanecer sin superposiciones en 1440 × 900, 1024 × 768, 390 × 844, 320 px y
  zoom de 200 %.
- **FR-021 / Refs: IMG-UX-01, IMG-UX-04**: Texto y componentes interactivos MUST
  conservar contraste mínimo de 4.5:1 y 3:1 respectivamente en los estados aplicables.
- **FR-022 / Refs: IMG-UX-01, IMG-UX-04**: El cambio MUST preservar rutas,
  persistencia, datos y reglas de dominio existentes.
- **FR-023 / Refs: IMG-UX-01, IMG-UX-04**: El cambio MUST NOT incorporar el rail
  o chat de agente, nuevos errores inline, reestructuración responsive global ni
  comportamiento de cierre de tarea, reservados para las specs 013–016.
- **FR-024 / Refs: IMG-UX-01, IMG-UX-04**: La aceptación visual MUST comparar
  capturas actuales contra ambos mockups y clasificar cada diferencia como
  aprobada, pendiente o defecto; el mockup MUST NOT usarse como baseline ejecutable.

### Validation and Traceability Contract

- **Capa A**: pruebas estructurales y de comportamiento para las cuatro fases,
  escritas y ejecutadas en rojo antes de modificar producto. Deben cubrir orden,
  contadores 0/499/500/>500, iconos y etiquetas, stepper, estado de borrador,
  guardado exitoso/fallido, una acción primaria, ausencia de meta/Atrás y
  preservación de campos secundarios.
- **Capa B**: cuatro capturas deterministas de IMG-UX-01 —1440 × 900,
  1024 × 768, 390 × 844 y 320 px— y una captura canónica de IMG-UX-04 en
  390 × 844. El viewport 320 px mantiene verificaciones de geometría, contenido y
  contraste, pero no convierte el mockup móvil en una referencia artificial de
  escritorio o tablet. También cubre el flujo editar → estado pendiente → guardar
  → estado limpio, cero superposiciones y contraste. Las capturas candidatas
  requieren revisión humana antes de reemplazar baselines.
- **Capa C**: `evidence/visual-comparison.md` compara los cuatro ACTUAL de
  IMG-UX-01 y el ACTUAL móvil canónico con IMG-UX-01 e IMG-UX-04 por jerarquía,
  contenido, geometría, interacción, responsive y accesibilidad.

## Dependencies

- Spec 008 conserva autoridad sobre persistencia manual, evaluación, avance y
  preservación de datos.
- Spec 010 proporciona la infraestructura visual y sus baselines versionadas.
- Spec 011 proporciona el shell publicado en la revisión `4e0fbff`; su T007/T008
  permanece como deuda de evidencia histórica y no se atribuye a 012.
- IMG-UX-01 e IMG-UX-04 del manifiesto visual son referencias aprobadas de diseño.

## Out of Scope

- Composición, expansión, conversación o propuestas del agente (spec 013).
- Errores de bloqueo inline y recuperación de evaluación (spec 014).
- Reestructuración responsive general del workspace (spec 015).
- Resumen y acciones de tarea completada (spec 016).
- Cambios de backend, rutas, almacenamiento, esquemas o reglas de dominio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 / Refs: IMG-UX-01, IMG-UX-04**: En 100 % de las cuatro fases, el
  formulario aparece antes que cualquier resumen complementario y muestra un
  único título y un único stepper 1–4.
- **SC-002 / Refs: IMG-UX-01, IMG-UX-04**: Los cinco campos prioritarios de fase
  1 aparecen en el orden contractual en los cuatro viewports, sin omisiones.
- **SC-003 / Refs: IMG-UX-01, IMG-UX-04**: El 100 % de los campos textuales
  visibles muestra un contador exacto que se actualiza inmediatamente al editar,
  incluidos 0, 499, 500 y valores históricos mayores de 500.
- **SC-004 / Refs: IMG-UX-01, IMG-UX-04**: Cada estado activo muestra exactamente
  una acción primaria, cero botones `Atrás` y cero instancias del panel meta eliminado.
- **SC-005 / Refs: IMG-UX-01, IMG-UX-04**: En las cuatro fases, editar muestra
  `Cambios sin guardar`, un guardado exitoso lo elimina y un fallo conserva los
  valores y permite reintentar.
- **SC-006 / Refs: IMG-UX-01, IMG-UX-04**: El 100 % de los campos y controles
  existentes permanece accesible y editable después del rediseño; ninguna prueba
  de regresión detecta pérdida o truncamiento de datos.
- **SC-007 / Refs: IMG-UX-01, IMG-UX-04**: Las comprobaciones automatizadas
  reportan cero superposiciones y cero violaciones de contraste aplicables en
  1440 × 900, 1024 × 768, 390 × 844 y 320 px.
- **SC-008 / Refs: IMG-UX-01, IMG-UX-04**: Cada diferencia visual entre ACTUAL
  y los dos mockups queda clasificada y ninguna baseline cambia sin aprobación humana.

## Assumptions

- La aclaración registrada adopta `Cambios sin guardar` para el estado de
  persistencia; `Cambios sin evaluar` se reserva para la vigencia de evaluación.
- `N/500` comunica una referencia de longitud y no introduce un máximo nuevo.
- Los contadores aplican a controles de texto; checkboxes, selects y otras
  acciones conservan etiqueta e iconografía apropiadas sin contador artificial.
- Los títulos de fase existentes son la fuente normativa del texto visible.
- La reorganización visual puede agrupar controles, pero no cambiar sus valores,
  editabilidad, eventos ni orden de persistencia.
