# Research: Workspace conversacional de soluciones repetibles

## Decision: conversación como superficie principal, sin tercera columna permanente

**Rationale**: El panel derecho actual ocupa espacio incluso cuando no contiene información útil. El nuevo shell conserva navegación plegable y conversación; el resumen estructurado aparece dentro del flujo solo cuando existe un dato confirmado, propuesta, contradicción o acción pertinente.

**Alternatives considered**:

- Mantener tres columnas y ocultar contenido vacío: conserva el problema de ancho, zoom y jerarquía.
- Llevar todo a modales: bloquea trabajo que debe permanecer disponible.

## Decision: taxonomía explícita de overlays

**Rationale**: Nueva tarea y Ajustes requieren decisión cerrada y serán modales con foco atrapado. Biblioteca es consulta paralela y será slideover no modal en escritorio. Avisos de éxito, información y error recuperable serán no modales y nunca añadirán backdrop.

**Alternatives considered**:

- Mantener rutas de página como navegación principal: desmonta el workspace.
- Hacer Biblioteca modal: impide comparar un recurso con la conversación.

## Decision: proyectos aditivos con pertenencia canónica en la tarea

**Rationale**: Se añade `bitacora:projects` para metadatos; `task.projectId` es la pertenencia canónica y `bitacora:index` solo la denormaliza. Las tareas sin `projectId` se interpretan como `legacy`/«Tareas anteriores» y se materializan al guardarse, sin reescritura eager.

**Alternatives considered**:

- Usar `tipo` como proyecto: no soporta metadatos, estado ni tarea reciente.
- Anidar tareas en proyectos: rompe `bitacora:t:<id>`.
- Crear tablas relacionales: viola la migración aditiva y la simplicidad operativa.

## Decision: evolucionar `f1`–`f4` como única fuente de verdad

**Rationale**: Las fases existentes ya contienen análisis, criterios, iteraciones y revisión. Se amplían con los mínimos de las cuatro etapas 006 y se cambia su presentación. Los campos anteriores y prompts permanecen preservados e inertes.

**Alternatives considered**:

- Añadir un objeto `workflow` paralelo: crea divergencia entre UI nueva, reglas y rutas heredadas.
- Reemplazar los campos existentes: pierde compatibilidad y referencias históricas.

## Decision: versiones inmutables de método y madurez derivada

**Rationale**: Una versión con evidencia no se muta materialmente. Cada iteración referencia `methodVersionId`; una ejecución exitosa produce `documented-once` y dos de la misma versión bajo condiciones aplicables producen `repeatable-method`. El nivel se calcula, no se persiste.

**Alternatives considered**:

- Guardar un booleano `repeatable`: puede contradecir las iteraciones.
- Contar ejecuciones de versiones distintas: mezcla métodos materialmente incompatibles.

## Decision: automatización como hipótesis o candidato con evidencia

**Rationale**: Cada oportunidad registra contrato, riesgos, control humano y ocurrencias. Una observación es hipótesis; dos secuencias equivalentes permiten candidato con evidencia. La feature nunca declara automatización validada porque no ejecuta automatizaciones.

**Alternatives considered**:

- Derivar automatización solo del texto del asistente: carece de evidencia.
- Esperar integración real antes de modelarla: impide producir el mapa solicitado.

## Decision: propuestas conversacionales pendientes de confirmación

**Rationale**: El adaptador puede proponer rutas tipadas, pero `TaskChat` no las aplica. La persona acepta, edita o descarta; tarea, etapa y revisión base protegen contra respuestas tardías.

**Alternatives considered**:

- Autoaplicar como en 005: contradice la edición humana prevalente y oculta cambios.
- Extraer solo texto libre: pierde la estructura que hace repetible el trabajo.

## Decision: compuertas `outcome-v2`

**Rationale**: Las evaluaciones 005 se conservan como historial, pero no prueban los nuevos mínimos. Una compuerta vigente requiere todos los campos de la etapa, ausencia de contradicciones y huella actual. Consolidación exige además clasificaciones y contratos de automatización completos.

**Alternatives considered**:

- Reutilizar aceptaciones 005: concedería progreso sin los nuevos resultados.
- Eliminar evaluaciones anteriores: perdería trazabilidad.

## Decision: escritura batch transaccional dentro del runtime existente

**Rationale**: Crear/mover/completar/eliminar puede afectar tarea, proyecto, índice y registro. `POST /api/storage/batch` valida un lote acotado y lo ejecuta en `KvStoreRepository.transaction()`, sin retirar las rutas unitarias.

**Alternatives considered**:

- Varios PUT desde cliente: puede dejar estado parcial.
- Guardar todo en una sola clave: amplía colisiones y riesgo de pérdida global.

## Decision: composición en página para respetar límites de features

**Rationale**: `tasks` no importa componentes privados de `library`. La página de tarea compone `TaskWorkspace` y `LibrarySlideover` mediante datos, slots y eventos. Solo el contrato batch vive en `shared`.

**Alternatives considered**:

- Crear un feature `workspace` que importe internamente tasks/library: rompe la regla de dependencias privadas.
- Mover componentes de dominio a shared: convertiría shared en un contenedor sin dueño.

## Decision: conservar deep links sin desmontar el shell

**Rationale**: `/tasks/new` y `/library/*` siguen válidos para enlaces existentes, pero redirigen o componen el shell con el overlay correspondiente. El overlay puede reflejarse en query para recarga y botón Atrás.

**Alternatives considered**:

- Eliminar rutas: rompe marcadores y pruebas heredadas.
- Mantener páginas independientes: reproduce la pérdida de contexto.

## Decision: no añadir dependencias ni proveedor

**Rationale**: Nuxt UI ya cubre diálogo, slideover y avisos; Zod cubre schemas; el adaptador determinista cubre contratos conversacionales. El flujo principal debe funcionar sin red ni credenciales.

**Alternatives considered**:

- Estado global externo: innecesario para un shell y store local.
- AI SDK o proveedor real: amplía alcance y coste operacional.
