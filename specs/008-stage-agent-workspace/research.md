# Research: Lienzo por etapas con agente IA

## Decision 1: Convertir la etapa en el centro sin crear otro workflow

**Decision**: `TaskWorkspace` seguirá siendo el orquestador del workspace, pero
la etapa será su región principal y el agente una región estructural
contraíble. El rediseño reutiliza los mismos eventos de guardado, evaluación,
propuestas y avance.

**Rationale**: El código actual ya concentra contexto, respuestas tardías,
evaluación y decisiones en `TaskWorkspace`. Duplicar esa orquestación crearía
dos fuentes de verdad.

**Alternatives considered**:

- Crear una ruta o workspace paralelo: rechazada por duplicar persistencia,
  navegación y reglas.
- Mantener el chat como centro y estilizar el formulario incrustado: rechazada
  porque conserva la jerarquía y el solape conceptual que el rediseño corrige.

## Decision 2: Resolver una sola acción primaria desde el estado existente

**Decision**: Una función presentacional pura derivará la acción contextual a
partir de tarea, etapa, evaluación vigente/desfasada, estado ocupado y
autorización de avance. No se añadirá una máquina de estados de negocio.

**Rationale**: `canAdvanceWithAssistant`, la revisión de evaluación y la
finalización ya determinan qué operaciones son legales. La UI debe representar
esas reglas, no reimplementarlas.

**Alternatives considered**:

- Mantener botones separados y ocultarlos con CSS: rechazada porque permite
  combinaciones contradictorias y conserva handlers duplicados.
- Crear un nuevo estado persistido `primaryAction`: rechazado porque puede
  quedar desfasado respecto de la tarea real.

## Decision 3: Usar composición estructural y no overlays para etapa/agente

**Decision**: En desktop y tablet el agente abierto comparte el grid del
workspace con el lienzo. En móvil, `Etapa` y `Agente` son dos planos del mismo
contexto seleccionados mediante tabs; ninguno se abre como modal del otro.

**Rationale**: Las imágenes aprobadas exigen que el chat no cubra el
formulario. El grid permite límites, tamaños mínimos y scroll independiente
verificables.

**Alternatives considered**:

- Slideover móvil para el formulario: rechazado porque convierte la etapa
  principal en un overlay y complica cierre/foco.
- Panel flotante para el agente: rechazado por riesgo de interceptar controles.

## Decision 4: Preservar estado al cambiar de composición

**Decision**: El rediseño conservará una sola instancia de etapa y agente
durante el cambio de plano o breakpoint; borrador, mensaje visible y contexto
de foco seguirán coordinados por el estado existente del workspace. Los modos
de agente y plano móvil se añadirán como mapas opcionales por tarea dentro de
la misma clave de vista, con defaults `collapsed` y `stage`.

**Rationale**: Desmontar el chat o el formulario puede borrar estado local,
reiniciar scroll y aceptar respuestas tardías en un contexto equivocado.

**Alternatives considered**:

- Recrear cada panel al alternar: rechazada por pérdida de continuidad.
- Persistir toda geometría junto a la tarea: rechazada porque contamina el
  modelo de negocio con preferencias de presentación.

## Decision 5: Reutilizar el guardado actual para `Guardar borrador`

**Decision**: La acción secundaria invocará el mismo pipeline de guardado y
avisos de la página de tarea. Editar solo marca el borrador como sucio; el
autosave particular de fase 2 deja de disparar escrituras para que las cuatro
fases compartan una única política manual. Evaluación, propuestas, avance y
finalización conservan sus guardados actuales.

**Rationale**: El mockup expresa una intención visible de guardado y el producto
ya dispone de idempotencia, aviso y reintento. Una segunda estrategia produciría
duplicados.

**Alternatives considered**:

- Mostrar solo “Guardado automáticamente”: rechazada porque el comportamiento
  actual no es homogéneo en todas las etapas.
- Guardar cada pulsación: rechazada por ampliar lógica y tráfico fuera del
  alcance visual.

## Decision 6: Derivar el resumen completado sin nuevas escrituras

**Decision**: La vista completada proyectará datos ya existentes de la tarea y
sus registros. Cargar o recargar el resumen nunca ejecutará finalización ni
creará registros.

**Rationale**: La finalización actual ya actualiza la tarea y el índice. La
pantalla de cierre debe ser una lectura idempotente.

**Alternatives considered**:

- Materializar un segundo resumen persistido: rechazado por duplicar datos y
  requerir migración.
- Redirigir inmediatamente a Biblioteca: rechazado porque omite el cierre
  aprobado y duplica la navegación.

## Decision 7: Separar composición, acción y contenido

**Decision**: El plan usará responsabilidades pequeñas: shell y breakpoints,
canvas de etapa, panel del agente, resolución/representación de acción
contextual y resumen completado. Los componentes de fase y chat existentes
seguirán siendo dueños de su contenido.

**Rationale**: Concentrar todo el rediseño en `TaskWorkspace.vue` dificultaría
TDD, accesibilidad y pruebas de estados aislados.

**Alternatives considered**:

- Reescribir las cuatro fases: rechazada porque cambia contenido que no forma
  parte del problema.
- Un único componente monolítico: rechazado por acoplamiento y regresión.

## Decision 8: Contrato visual semántico, no comparación pixel-perfect

**Decision**: Cada `IMG-UX-*` se convertirá en reglas observables de jerarquía,
geometría, contenido, interacción y responsive. Las capturas `ACTUAL-*` se
compararán y toda diferencia se clasificará por impacto.

**Rationale**: Fuentes, antialiasing y raster pueden variar sin afectar UX; en
cambio, omitir campos, duplicar acciones o superponer paneles es siempre un
defecto.

**Alternatives considered**:

- Snapshot de píxeles como único gate: rechazado por fragilidad y baja
  cobertura semántica.
- Revisión manual sin artefactos: rechazada porque no deja evidencia repetible.

## Decision 9: Mantener dependencias y contratos de dominio

**Decision**: No se añadirán dependencias, servicios ni migraciones. Se
preservan `task-rules`, `task-assistant-rules`, `task-completion`, almacenamiento
y `/legacy`; solo se modificarán si una prueba demuestra un defecto de
integración indispensable para representar el contrato aprobado.

**Rationale**: El alcance es UX/UI y ya existe la lógica necesaria.

**Alternatives considered**:

- Incorporar una librería de paneles/redimensionado: rechazada por complejidad
  innecesaria.
- Cambiar schemas para acomodar el layout: rechazado porque la presentación no
  debe alterar datos de negocio.
