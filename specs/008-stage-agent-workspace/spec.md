# Feature Specification: Lienzo por etapas con agente IA

**Feature Branch**: `codex/008-stage-agent-workspace`

**Created**: 2026-07-28

**Status**: Approved for planning

**Input**: Rediseñar el workspace como un lienzo por etapas con agente IA
contraíble, usando como contrato visual aprobado `IMG-UX-01` a `IMG-UX-06` y
sin cambiar las reglas, rutas ni datos existentes.

## Mapa de impacto verificable *(mandatory)*

**Graphify query/path**:

- `graphify query "How does the task workspace compose navigation, stage form, assistant chat, and responsive state across TaskWorkspace, GuidedPhaseForm, TaskChat, WorkspaceHeader, DashboardSidebar, and pages/tasks/[id].vue?" --budget 3500`
- `graphify query "Where are evaluation, canAdvanceWithAssistant, requestContinue, phase advancement, task completion, and assistant proposal accept edit discard implemented and tested?" --budget 3500`

**Executable entries/routes identified**:

- `pages/tasks/[id].vue`: carga, persistencia, avance y finalización de la tarea.
- `app/features/tasks/components/TaskWorkspace.vue`: composición del workspace,
  evaluación, conversación y decisiones sobre propuestas.
- `app/features/tasks/components/GuidedPhaseForm.vue`: formulario, progreso,
  evaluación y solicitud de avance.
- `app/features/tasks/components/TaskChat.vue`: conversación, borrador,
  reintento y acciones `Aceptar`, `Editar` y `Descartar`.

**Affected modules, contracts, persistence, and consumers**:

- Presentación: `TaskWorkspace`, `WorkspaceHeader`, `DashboardSidebar`,
  `GuidedPhaseForm`, `TaskChat`, `EvaluationFeedback` y
  `StructuredStageSummary`.
- Estado de presentación: `useWorkspaceState`.
- Reglas reutilizadas sin modificación semántica: `task-rules`,
  `task-assistant-rules` y `task-completion`.
- Consumidores de regresión: pruebas de componentes/composables y suites E2E
  del workspace conversacional, guiado, biblioteca y overlays.
- Persistencia: se reutiliza el guardado actual; no se añaden tablas, claves de
  negocio ni migraciones.

**Confirmed inferred/ambiguous relationships**:

- Graphify relacionó `performEvaluation`, `onRequestContinue`,
  `canAdvanceWithAssistant` y `advance`; las relaciones se confirmaron en
  `TaskWorkspace.vue`, `pages/tasks/[id].vue` y `task-rules.ts`.
- Graphify relacionó las propuestas del agente con `TaskChat.decide` y
  `TaskWorkspace.handleProposalDecision`; ambos puntos conservan las decisiones
  existentes y solo cambian de composición visual.

**Excluded files**:

- `bitacora-protocolo-analitico (2).html`: el flujo `/legacy` se preserva y no
  adopta el nuevo shell.
- `tests/fixtures/legacy/*.sqlite`: datos binarios y fixtures históricos fuera
  del alcance del rediseño.
- `graphify-out/`: salida generada; solo se actualizará durante el cierre
  arquitectónico si la implementación cambia relaciones.
- `.env*`, `secrets/` y cualquier credencial: excluidos por seguridad.

**Compatibility and regression risks**:

- El layout actual prioriza el chat e incrusta el formulario; sustituir esa
  jerarquía puede perder borradores, scroll o foco. Las pruebas deben cubrir
  cambio de panel, resize y recarga.
- Hoy existen controles separados `Evaluar`, `Continuar` y `Avanzar`; su
  unificación visual no puede alterar `canAdvanceWithAssistant` ni permitir
  saltar una evaluación.
- La finalización mueve la tarea a completadas y genera registros; el resumen
  nuevo debe leer ese resultado sin duplicarlo ni cambiar su persistencia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trabajar con la etapa como foco principal (Priority: P1)

Como persona que desarrolla una tarea, quiero que la etapa actual sea el lienzo
principal para comprender qué debo completar, revisar todos sus campos y
ejecutar una sola acción contextual sin competir con otras zonas.

**Why this priority**: La etapa contiene el trabajo que determina si la tarea
puede avanzar. Hacerla secundaria o cubrirla con chat y barras duplicadas
impide completar el protocolo con confianza.

**Independent Test**: Abrir tareas con contenido representativo en las cuatro
etapas y verificar el lienzo, todos los controles existentes, el progreso y la
acción contextual en 1440 × 900, 1024 × 768, 390 × 844 y 320 px.

**Acceptance Scenarios**:

1. **AC-001 / IMG-UX-01** — **Given** una tarea activa con cambios sin evaluar
   en escritorio, **When** se carga el workspace, **Then** la etapa ocupa el
   lienzo principal, el agente permanece contraído e identificable y
   `Evaluar etapa` es la única acción primaria.
2. **AC-002 / IMG-UX-03** — **Given** un viewport tablet, **When** el agente está
   abierto, **Then** etapa y agente son regiones estructurales adyacentes con
   desplazamiento independiente y la navegación no reduce el espacio como una
   tercera columna permanente.
3. **AC-003 / IMG-UX-04** — **Given** un viewport móvil, **When** se abre la
   vista `Etapa`, **Then** existe un solo plano vertical y se conservan todos
   los controles de la fase; `Problema detectado`, `Evidencia`, `Análisis`,
   `Resultado deseado` y `Criterio de éxito` aparecen primero como síntesis
   operativa, y linaje, confirmaciones, alcance, restricciones, actores,
   decisión, justificación y formulación vigente siguen disponibles en una
   sección `Contexto y confirmación` dentro del mismo plano.
4. **AC-004 / IMG-UX-01, IMG-UX-04** — **Given** valores largos, zoom al 200 %
   o ancho de 320 px, **When** se recorre la etapa, **Then** ningún campo ni
   control queda cubierto, recortado o fuera del ancho disponible.
5. **AC-005 / IMG-UX-01, IMG-UX-04** — **Given** cambios editables en cualquier
   fase, **When** la persona modifica un control, **Then** el estado pasa a
   `Cambios sin guardar` sin escribir automáticamente; al activar
   `Guardar borrador` se usa el pipeline existente y se comunica
   `Guardando…`, `Borrador guardado` o un error recuperable. La acción continúa
   siendo secundaria frente a la acción contextual.
6. **AC-021 / visual hierarchy references IMG-UX-01–IMG-UX-05** — **Given**
   contenido de las fases 2, 3 o 4, **When** se abre su lienzo en cualquier
   breakpoint, **Then** todos los campos, listas, iteraciones, criterios,
   revisiones y controles de captura o manipulación de contenido existentes
   permanecen accesibles; pueden agruparse o reordenarse, pero no omitirse ni
   convertirse en datos de solo lectura. Se exceptúan los controles de
   evaluación, continuación, avance y guardado sustituidos expresamente por
   AC-005 y AC-011–AC-016.

---

### User Story 2 - Colaborar con el agente sin perder el trabajo (Priority: P1)

Como persona que necesita orientación, quiero abrir y cerrar el agente dentro
de la geometría del workspace para conversar, revisar propuestas y volver a la
etapa sin superposiciones ni pérdida de contexto.

**Why this priority**: El agente es parte esencial del flujo, pero debe asistir
el trabajo en vez de convertirse en una capa que tape campos o acciones.

**Independent Test**: Abrir el agente, enviar un mensaje, aceptar/editar/
descartar una propuesta, cambiar entre etapa y agente, contraerlo y confirmar
que borrador, mensaje visible, valores del formulario y foco se conservan.

**Acceptance Scenarios**:

1. **AC-006 / IMG-UX-02** — **Given** el workspace de escritorio, **When** se
   expande el agente, **Then** aparece como columna derecha y el lienzo se
   ajusta sin quedar debajo del chat.
2. **AC-007 / IMG-UX-02, IMG-UX-03** — **Given** una conversación extensa,
   **When** se desplazan chat y formulario, **Then** cada región conserva su
   propio desplazamiento y su compositor o acción final permanece alcanzable.
3. **AC-008 / IMG-UX-04** — **Given** un viewport móvil, **When** se alterna
   entre `Etapa` y `Agente`, **Then** solo una vista ocupa el plano y se
   conservan el borrador, el mensaje visible y los valores editados.
4. **AC-009 / IMG-UX-02, IMG-UX-03** — **Given** una propuesta del agente,
   **When** se muestran `Aceptar`, `Editar` y `Descartar`, **Then** las tres
   acciones son distinguibles y secundarias; solo la decisión elegida reutiliza
   el contrato de propuesta existente.
5. **AC-010 / IMG-UX-02** — **Given** un envío fallido o una respuesta tardía,
   **When** la persona reintenta, cambia de etapa o cambia de tarea, **Then** no
   se aplica una respuesta al contexto equivocado y el texto recuperable no se
   pierde.
6. **AC-022 / navigation placement references IMG-UX-01–IMG-UX-06** —
   **Given** cualquier breakpoint o estado activo/completado, **When** se
   inspecciona la navegación, el encabezado y el lienzo, **Then** `Nueva tarea`
   aparece una sola vez en la navegación primaria y `Biblioteca`,
   `Referencias` y `Ajustes` aparecen una sola vez cada uno en la navegación
   secundaria, mediante sidebar o drawer según el breakpoint, sin duplicados
   dentro del encabezado, agente o lienzo.

---

### User Story 3 - Comprender el estado y avanzar sin acciones duplicadas (Priority: P1)

Como persona que completa una etapa, quiero una sola acción principal que
represente el estado real de evaluación y que los bloqueos expliquen qué debo
corregir y cómo recuperarme.

**Why this priority**: Mostrar simultáneamente `Evaluar`, `Continuar` y
`Avanzar` crea una decisión falsa y puede contradecir las reglas reales de la
tarea.

**Independent Test**: Recorrer cambios sin evaluar, evaluación en curso,
resultado no aceptable, evaluación desfasada, resultado aceptable y fallo de
transporte, comprobando etiqueta, disponibilidad, causa y handler de la única
acción principal.

**Acceptance Scenarios**:

1. **AC-011 / IMG-UX-01** — **Given** cambios sin evaluación vigente, **When**
   se consulta la acción principal, **Then** se muestra `Evaluar etapa`.
2. **AC-012 / textual state contract; placement reference IMG-UX-01** —
   **Given** una evaluación en curso, **When** se consulta la acción principal,
   **Then** se muestra `Evaluando…`, permanece deshabilitada y evita
   solicitudes duplicadas. La imagen define ubicación y jerarquía, no esa
   etiqueta dinámica.
3. **AC-013 / IMG-UX-05** — **Given** una evaluación no aceptable o desfasada,
   **When** se presenta el resultado, **Then** los problemas aparecen junto a
   su causa y la única acción primaria es `Reevaluar etapa`.
4. **AC-014 / IMG-UX-05** — **Given** un fallo recuperable de evaluación,
   **When** se informa el error, **Then** los datos editables se conservan y la
   recuperación vuelve a ejecutar la evaluación sin crear otra transición.
5. **AC-015 / textual state contract; placement references IMG-UX-01,
   IMG-UX-05** — **Given** una evaluación aceptable en etapas 1–3, **When** la
   persona continúa, **Then** la acción indica la etapa siguiente y reutiliza
   exactamente la autorización de avance existente.
6. **AC-016 / transition contract; completed-result reference IMG-UX-06** —
   **Given** una evaluación aceptable en etapa 4, **When** la persona finaliza,
   **Then** la acción completa la tarea una sola vez y no existe una barra
   externa adicional con `Avanzar`. `IMG-UX-06` demuestra el resultado posterior,
   no el texto previo `Finalizar tarea`.

---

### User Story 4 - Cerrar la tarea con un resumen reutilizable (Priority: P2)

Como persona que terminó las cuatro etapas, quiero ver qué resultado,
aprendizaje, evidencia, decisión y registros dejó la tarea para cerrar el ciclo
y regresar claramente a mis tareas.

**Why this priority**: El cierre convierte el trabajo en conocimiento
reutilizable. Debe ser inequívoco, pero depende primero de que la etapa y la
evaluación funcionen correctamente.

**Independent Test**: Completar una tarea en etapa 4, verificar el resumen,
recargar la URL y volver a tareas sin modificar ni duplicar registros.

**Acceptance Scenarios**:

1. **AC-017 / IMG-UX-06** — **Given** una tarea completada, **When** se muestra
   el workspace, **Then** el progreso indica 4/4 y el lienzo presenta resultado
   final, aprendizaje, evidencia y decisión derivados de la tarea.
2. **AC-018 / IMG-UX-06** — **Given** registros generados, **When** se muestra
   el resumen, **Then** cada registro existente aparece una sola vez con estado
   comprensible.
3. **AC-019 / IMG-UX-06** — **Given** el resumen completado, **When** se revisan
   sus acciones, **Then** `Volver a tareas` es la única acción primaria y no se
   duplica `Biblioteca` dentro del lienzo.
4. **AC-020 / IMG-UX-06** — **Given** una tarea ya completada, **When** se
   recarga o se abre su URL, **Then** el resumen permanece estable y no vuelve a
   ejecutar finalización, guardado o creación de registros.

### Edge Cases

- El agente se contrae durante un envío o una evaluación: la operación continúa
  ligada a la misma tarea, etapa y revisión, sin perder el borrador.
- El viewport cruza 1024 px o 768 px con contenido editado: la composición
  cambia sin desmontar los controles ni reiniciar scroll, foco o valores.
- La tarea cambia mientras existe una respuesta tardía: la respuesta no se
  aplica al nuevo contexto.
- La evaluación aceptable queda desfasada por una edición: `Continuar` deja de
  estar disponible y la acción vuelve a `Reevaluar etapa`.
- Un error de guardado conserva el trabajo en memoria y ofrece reintento.
- No existen mensajes del agente: el panel muestra un estado inicial útil, no
  una región vacía.
- El contenido del resumen es parcial por datos históricos: se muestran solo
  secciones disponibles y se explica cualquier ausencia sin inventar valores.
- Los nombres de proyecto o tarea tienen hasta 160 caracteres: se truncan sin
  desplazar progreso, acciones o control del agente.
- Una fase contiene controles que no aparecen en el mockup: permanecen
  operables en el lienzo y se agrupan sin descartarlos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las seis imágenes canónicas declaradas en
  `docs/ux-ui/mockups/rediseño-agente/manifest.md` MUST ser las referencias
  visuales aprobadas; los borradores reemplazados MUST quedar excluidos.
- **FR-002**: La etapa actual MUST ser el contenido principal del workspace y
  MUST permanecer operable con el agente contraído o expandido.
- **FR-003**: El agente contraído MUST conservar nombre, estado y control
  accesible para expandirlo.
- **FR-004**: El agente expandido MUST ocupar una región estructural adyacente,
  nunca una capa flotante sobre el lienzo.
- **FR-005**: Formulario y agente MUST conservar límites y desplazamiento
  independientes cuando ambos estén visibles.
- **FR-006**: En tablet la navegación MUST abrirse bajo demanda y etapa/agente
  MUST conservar espacio utilizable sin clipping.
- **FR-007**: En móvil MUST existir un selector accesible `Etapa` / `Agente` que
  muestre un único plano cada vez.
- **FR-008**: La vista móvil de etapa MUST conservar todos los campos, listas y
  acciones disponibles en escritorio; responsive no puede eliminar contenido.
- **FR-009**: Alternar agente, cambiar breakpoint o cerrar navegación MUST
  conservar valores editados, borrador del chat, mensaje visible y contexto de
  foco recuperable.
- **FR-010**: Cada estado de la etapa MUST mostrar como máximo una acción
  primaria visible.
- **FR-011**: La acción primaria MUST resolver los estados `Evaluar etapa`,
  `Evaluando…`, `Reevaluar etapa`, `Continuar a etapa N`, `Finalizar tarea` y
  `Volver a tareas` sin cambiar las reglas que los autorizan.
- **FR-012**: `Guardar borrador`, `Enviar`, `Aceptar`, `Editar` y `Descartar`
  MUST permanecer visual y semánticamente secundarios frente a la acción
  primaria del estado.
- **FR-013**: Todas las fases MUST usar una política uniforme de guardado manual:
  editar marca el borrador como sucio, `Guardar borrador` reutiliza el pipeline
  existente y no existe un autosave paralelo por fase.
- **FR-014**: El estado de guardado MUST distinguir `Cambios sin guardar`,
  `Guardando…`, `Borrador guardado` y error recuperable; un fallo MUST conservar
  los datos editables y ofrecer reintento.
- **FR-015**: Un control deshabilitado MUST comunicar la condición que impide
  usarlo y MUST ser distinguible de un control cubierto o roto.
- **FR-016**: Un bloqueo de evaluación MUST mostrar causas concretas junto a
  los campos o decisiones relacionadas y MUST ofrecer una recuperación.
- **FR-017**: Una evaluación desfasada MUST impedir el avance hasta reevaluar
  la revisión vigente.
- **FR-018**: Un fallo de transporte al evaluar MUST permitir reintento sin
  duplicar evaluaciones ni transiciones.
- **FR-019**: Las decisiones `Aceptar`, `Editar` y `Descartar` MUST reutilizar
  el contrato actual de propuestas y MUST rechazar respuestas de otro contexto.
- **FR-020**: El compositor MUST conservar borrador y reintento, y el estado de
  envío MUST ser anunciado de forma accesible.
- **FR-021**: `Nueva tarea`, `Biblioteca`, `Referencias` y `Ajustes` MUST tener
  una sola ubicación persistente por contexto.
- **FR-022**: El progreso de cuatro etapas MUST tener una sola representación
  principal y MUST comunicar etapa actual y completadas.
- **FR-023**: La barra externa que duplica estado y `Avanzar` MUST eliminarse
  del recorrido visual; guardado, errores y avance MUST vivir en el lienzo.
- **FR-024**: La vista completada MUST mostrar 4/4 y resumir resultado,
  aprendizaje, evidencia, decisión y registros existentes sin inventar datos.
- **FR-025**: `Volver a tareas` MUST usar el destino de tareas existente y MUST
  ser la única acción primaria del resumen.
- **FR-026**: La vista completada MUST evitar un acceso contextual duplicado a
  `Biblioteca`; el destino persistente de navegación permanece disponible.
- **FR-027**: Paneles, selector móvil, progreso, mensajes, bloqueos y controles
  iconográficos MUST tener nombres accesibles en español y foco visible.
- **FR-028**: Texto normal MUST alcanzar contraste mínimo 4.5:1; texto grande,
  límites necesarios, iconos y estados/foco MUST alcanzar 3:1 conforme a WCAG
  2.2 AA.
- **FR-029**: La interacción MUST funcionar por puntero y teclado, incluyendo
  Escape y retorno de foco en drawer y paneles que correspondan.
- **FR-030**: El workspace MUST permanecer sin solapes ni overflow horizontal
  en 1440 × 900, 1024 × 768, 390 × 844, 320 px y zoom al 200 %.
- **FR-031**: El rediseño MUST preservar rutas, datos, historial del agente,
  guardado, evaluación, autorización de avance, finalización y `/legacy`.
- **FR-032**: La implementación MUST producir capturas
  `ACTUAL-IMG-UX-01` a `ACTUAL-IMG-UX-06` en los estados y viewports
  contractuales.
- **FR-033**: Cada diferencia entre referencia y captura actual MUST
  clasificarse como aprobada, pendiente o defecto, con responsable y evidencia.
- **FR-034**: La conformidad visual MUST evaluar jerarquía, geometría,
  contenido, interacción y responsive; no se exige igualdad pixel-perfect.
- **FR-035**: Todos los datos y controles de captura o manipulación de contenido
  existentes en fases 1–4 MUST permanecer operables. La fase 1 MUST priorizar
  los cinco campos del mockup y agrupar los demás en
  `Contexto y confirmación`; las fases 2–4 MAY agrupar secciones, pero MUST
  conservar campos, listas, iteraciones y decisiones. Los controles existentes
  de evaluación, continuación, avance y guardado son las únicas excepciones:
  MUST ser sustituidos por la acción contextual y la política manual definidas
  en FR-010–FR-014 y FR-023.
- **FR-036**: El resumen MUST aplicar reglas deterministas de fallback. Para
  resultado, MUST usar el primer texto no vacío entre `f4.cambio` y, si falta,
  la última iteración según orden del arreglo que tenga `result` o
  `resultado`, priorizando `result` dentro de esa iteración. Para aprendizaje,
  MUST concatenar en orden los aprendizajes no vacíos de `f3.iteraciones`,
  deduplicados por igualdad exacta; solo si no existe ninguno MUST usar
  `f4.conexiones`. Para evidencia, MUST concatenar en orden las referencias no
  vacías de las iteraciones, deduplicadas por igualdad exacta; solo si no
  existe ninguna MUST usar `f1.analisisProblema.evidencia`. Para decisión, MUST
  usar el primer texto no vacío entre `f2.decision`,
  `f1.analisisProblema.decision` y
  `f1.analisisProblema.justificacion`. Cada sección sin fuente MUST mostrar
  `No registrado`.
- **FR-037**: Los registros del resumen MUST filtrar mediante
  `(record.sourceTaskId || record.taskId || record.tareaId) === task.id`,
  recorrer el índice en su orden original y conservar la primera aparición de
  cada `record.id`; las apariciones posteriores con el mismo `id` MUST
  descartarse sin leer o crear registros adicionales.

### Key Entities

- **WorkspacePresentation**: contexto visible de proyecto, tarea, etapa,
  navegación, agente y plano móvil activo.
- **AgentPanelState**: modo contraído/expandido, estado operativo, borrador,
  mensaje visible y control al que se devuelve el foco.
- **ContextualPrimaryAction**: etiqueta, disponibilidad, razón, estado ocupado y
  operación existente asociada al estado real de la etapa.
- **EvaluationDisplay**: evaluación vigente o desfasada, causas, campos
  relacionados y recuperación disponible.
- **CompletionSummary**: proyección de resultado, aprendizaje, evidencia,
  decisión y registros ya persistidos de una tarea completada.
- **VisualAcceptanceRecord**: vínculo entre `IMG-UX-*`, viewport, captura
  `ACTUAL-IMG-UX-*`, diferencias, severidad y decisión.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los seis estados de la tabla textual de acción contextual
  (`Evaluar`, `Evaluando`, `Reevaluar`, `Continuar`, `Finalizar`, `Volver`)
  producen exactamente una acción primaria o su versión ocupada deshabilitada;
  `IMG-UX-01`, `IMG-UX-05` e `IMG-UX-06` verifican colocación y jerarquía de
  los estados representados.
- **SC-002**: El 100 % de los controles visibles objetivo recibe interacción
  por puntero y teclado sin ser interceptado por otra región.
- **SC-003**: Los recorridos de etapa y agente se completan sin solapes,
  clipping ni overflow horizontal en los cuatro tamaños y zoom definidos.
- **SC-004**: El 100 % de los controles y datos editables existentes en las
  cuatro fases permanece accesible en escritorio, tablet y móvil; en fase 1
  los cinco campos de síntesis conservan contenido equivalente y los controles
  adicionales permanecen en `Contexto y confirmación`.
- **SC-005**: Tras alternar etapa/agente, contraer/expandir o cambiar de
  breakpoint, el 100 % de los borradores, valores y contextos de tarea/etapa se
  conserva.
- **SC-006**: Ninguna evaluación desfasada o no aceptable permite avanzar.
- **SC-007**: Cada error de evaluación o guardado recuperable conserva el
  trabajo y ofrece una acción de reintento.
- **SC-008**: Completar o recargar una tarea completada genera cero
  finalizaciones y registros duplicados.
- **SC-009**: Las seis comparaciones `IMG-UX-*` / `ACTUAL-IMG-UX-*` quedan sin
  diferencias críticas o altas pendientes.
- **SC-010**: El 100 % de los paneles, tabs y controles iconográficos auditados
  tiene nombre accesible en español y foco perceptible; texto normal alcanza
  4.5:1 y texto grande, límites necesarios, iconos y foco alcanzan 3:1.
- **SC-011**: Todos los recorridos y contratos automatizados aceptados antes de
  este feature permanecen operables.
- **SC-012**: Al menos cuatro de cinco participantes adultos, familiarizados
  con aplicaciones web pero sin experiencia previa en el producto, pueden en
  un máximo de 7 minutos identificar la etapa, abrir el agente, corregir y
  reevaluar un bloqueo sembrado y regresar a tareas, sin indicaciones del
  moderador después de leer la consigna.

## Matriz de aceptación *(mandatory)*

| Acceptance ID | Criterion | Verification method/test | Responsible task | Final evidence | Verifiable status |
|---|---|---|---|---|---|
| AC-001 | Lienzo desktop con agente contraído y una acción primaria | Componente + E2E 1440 × 900 | T013–T020, T034–T041, T051 | `ACTUAL-IMG-UX-01` | NO VERIFICADO |
| AC-002 | Tablet con etapa/agente estructurales y scroll independiente | E2E 1024 × 768 | T025–T031, T052 | `ACTUAL-IMG-UX-03` | NO VERIFICADO |
| AC-003–AC-005, AC-021 | Contenido completo de las cuatro fases, responsive y guardado uniforme | Componente + E2E 1440 × 900, 1024 × 768, 390 × 844 y 320 px | T013–T021, T052, T056 | `ACTUAL-IMG-UX-01`, `ACTUAL-IMG-UX-03`, `ACTUAL-IMG-UX-04` + ledger de campos por fase y breakpoint | NO VERIFICADO |
| AC-006–AC-010 | Agente expandible, propuestas, borrador y recuperación | Componente + E2E desktop/tablet/mobile | T022–T031, T051–T052 | `ACTUAL-IMG-UX-02`, `ACTUAL-IMG-UX-03` | NO VERIFICADO |
| AC-011–AC-016 | Seis estados de acción contextual, bloqueo y transición segura | Tabla unitaria completa + componente + E2E | T006, T009, T033–T042, T051, T053 | Ledger de estados + `ACTUAL-IMG-UX-01`, `ACTUAL-IMG-UX-05`, `ACTUAL-IMG-UX-06` | NO VERIFICADO |
| AC-017–AC-020 | Resumen completado idempotente y retorno a tareas | Unitario + componente + E2E | T006, T009, T043–T049, T053 | `ACTUAL-IMG-UX-06` | NO VERIFICADO |
| AC-022 | Ubicación única de Nueva tarea, Biblioteca, Referencias y Ajustes | Componente + E2E desktop/tablet/mobile | T025, T030–T032, T051–T053 | Ledger de navegación por breakpoint | NO VERIFICADO |
| AC-001–AC-022 | Contraste WCAG 2.2 AA y foco visible | Medición automatizada + revisión de estados | T055 | Reporte de contraste/foco | NO VERIFICADO |
| AC-003, AC-008, AC-013, AC-019 | Protocolo humano de orientación, agente, bloqueo y retorno | 5 participantes según SC-012 | T062 | `usability-study.md` | NO VERIFICADO |

## Evidencia de interfaz *(mandatory when UI changes; otherwise state N/A)*

- **Viewports**: 1440 × 900, 1024 × 768, 390 × 844, 320 px y zoom 200 %.
- **Verification**: pruebas de componentes y E2E más comparación documentada
  entre las seis referencias y sus capturas `ACTUAL-*`.
- **Accessibility**: teclado PENDIENTE, foco PENDIENTE, nombre accesible
  PENDIENTE, contraste WCAG 2.2 AA PENDIENTE, responsive PENDIENTE.
- **Artifact**: `docs/ux-ui/mockups/rediseño-agente/manifest.md` y los seis
  archivos canónicos que declara.
- **Result and limitations**: los mockups fueron aprobados como contrato de
  intención; un raster no demuestra foco, teclado, scroll ni contraste, por lo
  que esas propiedades requieren pruebas y medición.

## Evidencia de datos, contratos y migraciones *(mandatory when applicable; otherwise state N/A)*

- **Previous and new contract**: los contratos de tarea, agente y almacenamiento
  existentes no cambian; se añade un contrato de presentación y aceptación
  visual.
- **Compatibility cases**: tareas activas, completadas, históricas, evaluación
  vigente/desfasada, respuestas tardías y `/legacy`.
- **Non-sensitive fixture**: se definirá una tarea sintética con las etapas y
  estados de `IMG-UX-01` a `IMG-UX-06`.
- **Migration and rollback/recovery**: N/A; no se prevé migración.
- **Downstream consumers**: shell del workspace, vistas de etapa, agente,
  biblioteca, índice de tareas y suites de regresión.

## Evidencia para IA, LLM y agentes *(mandatory when applicable; otherwise state N/A)*

- **Execution record**: no ejecutado todavía. La implementación no cambiará
  proveedor, modelo, parámetros ni schema de salida del agente; cualquier
  desviación deberá registrarse antes de implementarse.
- **Evaluation**: las pruebas reutilizarán respuestas sintéticas deterministas
  y contratos actuales; no se usarán secretos ni PII.
- **Operations**: latencia, reintentos y errores del chat/evaluación se
  conservarán y se verificarán como comportamiento de recuperación.
- **Human decision and safe failure**: propuestas ambiguas siguen requiriendo
  `Aceptar`, `Editar` o `Descartar`; una respuesta tardía o conflictiva no
  modifica permanentemente otro contexto.

## Evidence Record *(mandatory)*

**Evidence file**: `implementation-evidence.md`

Ninguna tarea de comportamiento podrá marcarse completa sin rojo esperado,
verde enfocado, regresión afectada, comando, resultado, alcance y estado
`VERIFICADO` en el ledger.

## Cierre y revisión independiente *(mandatory for implemented specifications)*

- **Independent patch review**: pendiente tras la implementación.
- **Sensitive-artifact diff review**: pendiente; excluirá secretos, bases de
  datos, caches y borradores visuales no contractuales.
- **Aggregate gates**: pendientes; se definirán exactamente en `plan.md` y
  `quickstart.md`.
- **Graphify validation/update**: pendiente tras cambios de arquitectura.
- **Final evidence summary**: pendiente de las fases de implementación y
  validación visual.

## Assumptions

- Los seis archivos canónicos del manifiesto expresan estructura, jerarquía,
  contenido y estados; no son una exigencia pixel-perfect.
- Si un mockup es ambiguo, prevalecen los requisitos escritos y
  `contracts/visual-acceptance.md`.
- `Guardar borrador` es el único disparador manual común de cambios de campos:
  el autosave específico de fase 2 se retira para evitar una segunda política.
  Evaluación, propuestas, avance y finalización conservan sus guardados
  transaccionales existentes.
- `Volver a tareas` usa el destino de tareas existente.
- El agente mantiene su comportamiento y contratos actuales; el alcance cambia
  su presentación y coordinación con el lienzo.
- Los datos sintéticos `test1 / dsd` de los mockups son ejemplos visuales y no
  requisitos de contenido ni fixtures de producción.
- El flujo `/legacy`, los datos históricos, Biblioteca, Referencias y Ajustes
  permanecen disponibles.
- Las pruebas comparan los archivos exactos declarados en el manifiesto; no
  seleccionan referencias mediante globs que puedan incluir borradores.

## Traceability: requirements, acceptance, outcomes and images

| Requirements | Acceptance | Outcomes | Visual references |
|---|---|---|---|
| FR-001, FR-032–FR-034 | AC-001–AC-022 | SC-009 | IMG-UX-01–IMG-UX-06 |
| FR-002–FR-005 | AC-001, AC-006, AC-007 | SC-001–SC-003 | IMG-UX-01–IMG-UX-03 |
| FR-006–FR-009 | AC-002–AC-004, AC-008, AC-021 | SC-003–SC-005 | IMG-UX-03, IMG-UX-04 |
| FR-010–FR-012 | AC-011–AC-016 | SC-001, SC-006 | IMG-UX-01, IMG-UX-05, IMG-UX-06 |
| FR-013, FR-014 | AC-005, AC-014 | SC-007 | IMG-UX-01, IMG-UX-04, IMG-UX-05 |
| FR-015–FR-018 | AC-011–AC-016 | SC-006, SC-007 | IMG-UX-01, IMG-UX-05, IMG-UX-06 |
| FR-019, FR-020 | AC-009, AC-010 | SC-005, SC-007 | IMG-UX-02, IMG-UX-03 |
| FR-021–FR-023 | AC-001–AC-004, AC-016, AC-019, AC-022 | SC-001–SC-003 | IMG-UX-01–IMG-UX-06 |
| FR-024–FR-026, FR-036, FR-037 | AC-017–AC-020 | SC-008 | IMG-UX-06 |
| FR-027–FR-030 | AC-001–AC-022 | SC-002, SC-003, SC-010, SC-012 | IMG-UX-01–IMG-UX-06 |
| FR-031 | AC-001–AC-022 | SC-011 | IMG-UX-01–IMG-UX-06 |
| FR-035 | AC-003, AC-004, AC-021 | SC-004, SC-011 | IMG-UX-01, IMG-UX-04 |
