# Research: Estado de bloqueo con errores inline y recuperación

## D1. Una proyección autoritativa de correcciones

**Decision**: ampliar `workspace-presentation.ts` con un view model de
recuperación derivado exclusivamente de la evaluación aplicable y sus
`gateReasons` no vacíos. Banner, inline y badges consumen el mismo arreglo.

**Rationale**: evita conteos divergentes y mantiene reglas de UI fuera del
dominio y de los componentes.

**Alternatives considered**: calcular en cada componente o usar `gateReasons()`
del dominio. Rechazadas porque duplican deduplicación/vigencia o convierten
validación de formulario en una evaluación del asistente.

## D2. Catálogo exacto, no inferencia

**Decision**: usar un catálogo presentacional exacto `gateReason`→clave de campo
y añadir las frases contractuales de Análisis y Criterio de éxito. Desconocidos
quedan con `field: null` y solo aparecen en el banner.

**Rationale**: la coincidencia exacta es determinista, testeable y no atribuye
texto libre a un campo incorrecto.

**Alternatives considered**: coincidencia parcial, regex o modelo semántico.
Rechazadas por falsos positivos, opacidad y ampliación del pipeline.

## D3. Vigencia y fallo durante recuperación

**Decision**: una evaluación `needs-work` aplicable produce correcciones. Si se
vuelve stale únicamente por editar la misma tarea/fase, conserva sus motivos
como pendientes de confirmación y usa la presentación stale; un stale que no
procede de `needs-work` no crea correcciones. Si la reevaluación falla, el
`latestEvaluation` needs-work anterior continúa siendo la fuente mientras el
chip representa `transport-error`; un fallo inicial sin evaluación previa
produce cero correcciones. Una evaluación aceptable reemplaza la fuente y
limpia todo.

**Rationale**: los datos actuales ya conservan el último resultado mientras el
error de transporte vive aparte; no hace falta persistir una copia.

**Alternatives considered**: limpiar al editar/fallar o guardar un snapshot
adicional. Rechazadas por declarar éxito sin confirmación o crear estado
derivado obsoleto.

## D4. `StageFieldIssues` se convierte en banner

**Decision**: reutilizar `StageFieldIssues` como resumen superior con título
`N correcciones pendientes`, lista completa y enlace/botón
`Ver recomendaciones del agente`. Deja de ser la tarjeta genérica
`Bloqueos de la etapa`.

**Rationale**: ya posee deduplicación, IDs y ubicación superior. Cambiar su
responsabilidad evita un componente paralelo con las mismas correcciones.

**Alternatives considered**: crear `CorrectionBanner.vue` y mantener ambas
tarjetas. Rechazada por duplicar contenido y producir jerarquía contradictoria.

## D5. Error dentro del bloque existente

**Decision**: `StageTextField` acepta mensajes/IDs y renderiza todos los errores
después del control dentro de `[data-stage-text-field]`, con `aria-invalid` y
`aria-describedby`. Los campos no textuales usan el mismo contrato de datos en
su contenedor existente dentro de cada componente de fase.

**Rationale**: satisface proximidad visual y semántica sin cambiar valor,
captura, modelo o inventario de campos de 012.

**Alternatives considered**: enlaces desde el banner, tooltips o una lista al
lado del formulario. Rechazadas porque el mensaje no quedaría dentro del bloque
causante o sería menos accesible.

## D6. Separar correcciones de propuestas en el agente

**Decision**: `AgentPanel` recibe `pendingCorrections` aparte de
`pendingProposals`. Presenta el conteo de correcciones en rail y header con
nombre accesible; el badge de propuestas de 013 conserva su semántica.

**Rationale**: ambos conteos tienen fuentes y ciclos de vida distintos. Sumarlos
haría que el número dejara de corresponder al banner.

**Alternatives considered**: un badge total o persistir correcciones.
Rechazadas por ambigüedad y estado derivado duplicado.

## D7. Foco coordinado por el workspace

**Decision**: el banner emite una intención; `GuidedPhaseForm` la propaga;
`TaskWorkspace` expande el agente en desktop/tablet o activa el pane `agent` en
móvil y, tras `nextTick`, invoca un método expuesto por `AgentPanel` para enfocar
la región de conversación.

**Rationale**: solo el workspace conoce viewport y estado persistido; el panel
es dueño de su objetivo de foco. Se preservan borrador y ancla.

**Alternatives considered**: buscar el DOM globalmente o navegar a una ruta.
Rechazadas por acoplamiento frágil o por introducir navegación excluida.

## D8. Estado y primaria reutilizan resolución existente

**Decision**: conservar `resolveContextualPrimaryAction`, que ya retorna
`Reevaluar etapa` para evaluación no aceptable, desfase o error. Añadir pruebas
de unicidad/etiqueta y ajustar solo si el contrato falla. `EvaluationFeedback`
mantiene el chip exacto y elimina la lista genérica duplicada.

**Rationale**: el déficit verificado es de presentación y coordinación, no de
la máquina de gates.

**Alternatives considered**: nueva acción o nuevo estado de dominio. Rechazadas
por alcance y riesgo de alterar gates existentes.

## D9. Edición no limpia; resultado aceptable sí

**Decision**: no limpiar correcciones por estado dirty. Un `needs-work` que se
vuelve stale por la edición de la misma tarea/fase conserva sus correcciones
como pendientes de confirmación; un stale de otro estado no las crea. La
proyección se limpia con resultado aceptable.

**Rationale**: una edición es una hipótesis de corrección, no una confirmación.

**Alternatives considered**: ocultar por campo al escribir. Rechazada porque el
usuario perdería el criterio antes de reevaluar.

## D10. Fixture determinista de dos correcciones

**Decision**: IMG-UX-05 siembra exactamente
`Define una hipótesis verificable para poder evaluar el análisis` para
`f1.analisisProblema.analisis` y
`Define criterio(s) de éxito para cerrar la fase.` para `f1.criterioExito`, con
evaluación y revisión aplicables. Weaknesses/recommendations pueden existir,
pero no cuentan.

**Rationale**: prueba simultáneamente catálogo, conteo, proximidad y exclusión de
contenido contextual.

**Alternatives considered**: usar razones del gate local actual. Rechazada
porque no demuestra la fuente exclusiva de la evaluación del asistente.

## D11. Contrato visual antes de snapshot

**Decision**: ejecutar IMG-UX-05 en modo `contract` para los cuatro viewports y
verificar DOM/geometría/foco/axe; después modo `evidence` genera cuatro ACTUAL
sin `toHaveScreenshot`. Solo una aprobación humana habilita update de baseline.

**Rationale**: separa corrección funcional, comparación visual y aceptación de
referencia; un pixel diff no aborta los demás viewports.

**Alternatives considered**: actualizar snapshots al implementar o capturar
solo desktop. Rechazadas por ocultar defectos y omitir contratos responsive.

## D12. Sin cambios de backend, schema o estructura base

**Decision**: no modificar endpoints, mock assistant, schemas, rules,
persistencia, componentes de navegación móvil ni composición rail/chat. Solo se
extienden props/eventos presentacionales de componentes existentes.

**Rationale**: todos los datos y transiciones necesarios ya existen; la spec
014 corrige cómo se proyectan.

**Alternatives considered**: enriquecer respuesta backend con field IDs, nuevo
store de errores o navegación específica. Rechazadas por exclusiones y costo de
compatibilidad.
