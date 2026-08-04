# Feature Specification: Shell y navegación del workspace

**Feature Branch**: `codex/011-workspace-shell`

**Created**: 2026-08-04

**Status**: Approved

**Input**: User description: "Shell y navegación del workspace (spec 011, rama codex/011-workspace-shell)."

## Mapa de impacto verificable *(mandatory)*

**Graphify query/path**: `What components, routes, tests, and documented UX contracts govern the workspace shell sidebar, header, navigation, responsive drawer, and IMG-UX-01 IMG-UX-02 IMG-UX-05 IMG-UX-06?` (2026-08-04).

**Executable entries/routes identified**:

- `/` conserva la selección de proyecto y dirige a la tarea existente más reciente.
- `/tasks/[id]` carga la tarea existente, conserva su selección y presenta el workspace.
- `TaskWorkspace`, `WorkspaceHeader` y `DashboardSidebar` forman el shell de una tarea; `pages/index.vue` presenta el shell de inicio.

**Affected modules, contracts, persistence, and consumers**:

- La navegación visual y responsive del shell, incluyendo búsqueda, selección, expansión de proyecto, creación y renombrado, encabezado y drawer.
- Los consumidores de rutas existentes de tareas, biblioteca, referencias y ajustes conservan sus destinos y contratos.
- No se modifica ningún modelo, persistencia, ruta, API, servicio de backend ni dato almacenado.

**Confirmed inferred/ambiguous relationships**:

- Confirmado en fuente: `TaskWorkspace` compone `DashboardSidebar` y `WorkspaceHeader`; recibe y reemite búsqueda, creación/renombrado, selección y expansión de proyecto/tarea.
- Confirmado en fuente: las pantallas de inicio y de tarea ya gestionan un estado de navegación compacta cerrado y devuelven el foco al control que la abrió.
- Confirmado en fuente: la fase dispone de nombre contextual y de un valor entre 1 y 4.

**Excluded files**:

- Persistencia, contratos compartidos, rutas de servidor, esquemas de dominio y datos: solo cambia la presentación y navegación sobre datos existentes.
- Lienzo de etapa (spec 012), agente (013), bloqueos (014) y cierre (016): sus comportamientos no se rediseñan en esta feature.

**Compatibility and regression risks**:

- La reordenación visual podría duplicar acciones, romper rutas, ocultar la búsqueda o perder acciones de proyecto. Se mitiga con pruebas de estructura, rutas existentes y estados responsive.
- El contrato visual aprobado y la infraestructura de baselines de la spec 010 están presentes como artefactos de trabajo aún no versionados en el checkout de origen; su disponibilidad en la rama de implementación es una dependencia que se deberá resolver antes de ejecutar la capa visual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar tareas sin duplicados (Priority: P1)

Como persona que trabaja en una tarea, quiero una barra lateral con navegación clara, proyectos expandibles y tareas anidadas para cambiar de contexto sin perder las funciones actuales ni encontrar acciones repetidas.

**Why this priority**: La navegación es la entrada al workspace y condiciona el acceso continuo a proyectos, tareas, biblioteca, referencias y ajustes.

**Independent Test**: Con proyectos y tareas existentes, se comprueba que la barra lateral muestra las regiones en orden, permite buscar, expandir, seleccionar, crear y renombrar, y conserva una sola aparición de cada destino contextual.

**Refs**: IMG-UX-01, IMG-UX-02, IMG-UX-05, IMG-UX-06.

**Acceptance Scenarios**:

1. **Given** una tarea abierta y proyectos existentes, **When** la persona ve el sidebar de escritorio, **Then** encuentra la navegación por iconos Tareas, Biblioteca, Referencias y Ajustes, con el destino activo identificado de forma accesible.
2. **Given** varios proyectos, **When** la persona expande una carpeta de proyecto, **Then** ve sus tareas anidadas y puede seleccionar una sin crear una ruta ni dato nuevos.
3. **Given** una consulta de búsqueda, **When** la persona busca tareas o proyectos, **Then** se preserva el comportamiento existente de búsqueda y el campo muestra el texto “Buscar tareas o proyectos…” junto al atajo visible ⌘K.
4. **Given** la barra lateral, **When** se revisan las acciones disponibles en un mismo contexto, **Then** Nueva tarea, Biblioteca y Ajustes aparecen como máximo una vez cada una.

---

### User Story 2 - Entender el contexto de la tarea (Priority: P1)

Como persona que trabaja en una tarea, quiero ver de inmediato el proyecto, la tarea y el progreso de etapa para saber dónde estoy y qué parte del método estoy realizando.

**Why this priority**: El shell debe orientar antes de cualquier interacción con el contenido de la etapa.

**Independent Test**: Con una tarea de cada fase, se verifica que el encabezado presenta el breadcrumb proyecto/tarea, el chip verde “Etapa N de 4” y el nombre de fase correspondiente.

**Refs**: IMG-UX-01, IMG-UX-02, IMG-UX-05, IMG-UX-06.

**Acceptance Scenarios**:

1. **Given** una tarea de un proyecto existente en la etapa 1, **When** se abre el workspace, **Then** el encabezado muestra el breadcrumb “proyecto / tarea”, el chip verde “Etapa 1 de 4” y “Orientación y rastreo”.
2. **Given** una tarea en otra etapa válida, **When** cambia el contexto de tarea, **Then** el número y el subtítulo se actualizan con la etapa existente sin alterar su progreso.
3. **Given** el encabezado y el sidebar, **When** se compara su composición con el contrato visual, **Then** el encabezado no repite los destinos de navegación del sidebar.

---

### User Story 3 - Navegar en tablet y móvil (Priority: P2)

Como persona que usa una pantalla compacta, quiero abrir la navegación desde un control claro sin que el shell cubra el contenido ni pierda el contexto de proyecto y tarea.

**Why this priority**: La navegación debe seguir disponible sin competir con el lienzo ni el agente en los formatos de menor espacio.

**Independent Test**: A 1024×768 se comprueba un drawer inicialmente cerrado con hamburguesa; a 390×844 se comprueba un encabezado compacto con hamburguesa, logo y breadcrumb, sin solapes.

**Refs complementarias de responsive**: IMG-UX-03, IMG-UX-04. La comparación visual formal de esta feature permanece acotada a IMG-UX-01, IMG-UX-02, IMG-UX-05 e IMG-UX-06.

**Acceptance Scenarios**:

1. **Given** un viewport de 1024×768, **When** se carga el workspace, **Then** el drawer de navegación está cerrado por defecto y una hamburguesa permite abrirlo.
2. **Given** un viewport de 390×844, **When** se carga el workspace, **Then** el encabezado compacto muestra hamburguesa, logo y breadcrumb con el contexto actual.
3. **Given** un drawer abierto en pantalla compacta, **When** la persona lo cierra o selecciona una tarea, **Then** el foco vuelve al control apropiado y la ruta existente se conserva.

### Edge Cases

- Un proyecto sin tareas conserva su representación como carpeta y no genera una ruta ficticia.
- Una consulta sin coincidencias no elimina destinos de navegación ni impide limpiar la búsqueda.
- Si el nombre de proyecto o tarea es largo, el breadcrumb mantiene ambos contextos sin superponerse con navegación, lienzo, agente o footer.
- Si no hay identidad de usuario completa disponible en los datos existentes, el footer usa la representación de usuario actualmente disponible sin inventar ni persistir datos.
- La etapa recibida fuera del rango 1–4 se trata como un dato inválido existente y no se corrige desde este shell.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sidebar de escritorio DEBE presentar, en este orden, marca/contexto, navegación primaria, búsqueda, proyectos y footer de usuario.
- **FR-002**: La navegación primaria DEBE incluir Tareas, Biblioteca, Referencias y Ajustes con icono y nombre accesible, e identificar visual y semánticamente el destino activo.
- **FR-003**: El campo de búsqueda DEBE mostrar “Buscar tareas o proyectos…” y el indicador visible ⌘K, y conservar el filtrado existente de tareas y proyectos.
- **FR-004**: La sección PROYECTOS DEBE presentar cada proyecto existente como carpeta expandible con sus tareas anidadas.
- **FR-005**: El sidebar DEBE conservar la selección, expansión, creación de proyectos, renombrado de proyectos, renombrado de tareas y navegación a destinos existentes.
- **FR-006**: El footer del sidebar DEBE mostrar avatar, nombre y correo de la identidad disponible para el usuario, sin crear ni modificar datos de perfil.
- **FR-007**: En un mismo contexto visible, Nueva tarea, Biblioteca y Ajustes DEBEN aparecer no más de una vez cada uno.
- **FR-008**: El encabezado del workspace DEBE mostrar un breadcrumb con proyecto y tarea en el orden “proyecto / tarea”.
- **FR-009**: El encabezado DEBE mostrar un chip verde con el texto “Etapa N de 4”, donde N refleja la etapa actual existente.
- **FR-010**: El encabezado DEBE mostrar el nombre de la fase asociada a la etapa actual, incluido “Orientación y rastreo” para la etapa 1.
- **FR-011**: En 1024×768, la navegación DEBE iniciar en un drawer cerrado y ofrecer un botón hamburguesa con nombre accesible para abrirlo.
- **FR-012**: En 390×844, el encabezado compacto DEBE mostrar una hamburguesa, el logo y el breadcrumb del contexto actual.
- **FR-013**: Abrir, cerrar o usar la navegación compacta NO DEBE ocultar de forma persistente el lienzo, el agente ni el footer, ni crear destinos nuevos.
- **FR-014**: Cada estado del shell DEBE comunicar una única acción primaria; el resto de acciones disponibles deben conservar una jerarquía secundaria.
- **FR-015**: El shell DEBE cumplir el contrato visual de IMG-UX-01, IMG-UX-02, IMG-UX-05 e IMG-UX-06 para sus regiones de navegación y header, sin asumir cambios en el contenido excluido.
- **FR-016**: La implementación DEBE conservar rutas, datos existentes y comportamiento de backend sin modificaciones.
- **FR-017**: La Capa B DEBE ejecutarse y cerrarse únicamente con un baseline aprobado y versionado para cada combinación escenario-viewport; los mockups son referencias y nunca baselines. La ausencia de un baseline bloquea esta capa y el cierre de la feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En 100% de los escenarios de escritorio evaluados, las cinco regiones del sidebar aparecen una vez y en el orden definido.
- **SC-002**: En 100% de las tareas de prueba de las cuatro etapas, el encabezado presenta proyecto, tarea, número de etapa y subtítulo de fase coherentes con los datos existentes.
- **SC-003**: En los escenarios de 1024×768 y 390×844, la navegación inicia cerrada cuando corresponde y el control de apertura es localizable con teclado y nombre accesible en 100% de las ejecuciones.
- **SC-004**: Las capturas aprobadas de IMG-UX-01, IMG-UX-02, IMG-UX-05 e IMG-UX-06, evaluadas en los cuatro viewports definidos, no muestran solapamiento entre sidebar, lienzo, agente y footer.
- **SC-005**: En 100% de los estados visuales evaluados hay exactamente una acción primaria y no hay destinos Nueva tarea, Biblioteca o Ajustes duplicados.
- **SC-006**: Los controles de navegación, búsqueda y estados activo/hover alcanzan contraste mínimo de 4.5:1 para texto normal y 3:1 para componentes y texto grande en los estados evaluados.

## Matriz de aceptación *(mandatory)*

| Acceptance ID | Criterion | Verification method/test | Responsible task | Final evidence | Verifiable status |
|---------------|-----------|--------------------------|------------------|----------------|-------------------|
| AC-001 | Orden, iconos accesibles y footer de usuario del sidebar (IMG-UX-01, 02, 05, 06) | Capa A: Vitest | T004, T009–T012, T025, T031 | `implementation-evidence.md` | NO VERIFICADO |
| AC-002 | Breadcrumb, chip y subtítulo de fase (IMG-UX-01, 02, 05, 06) | Capa A: Vitest | T005, T013–T015, T025, T031 | `implementation-evidence.md` | NO VERIFICADO |
| AC-003 | Cero destinos duplicados y una acción primaria (IMG-UX-01, 02, 05, 06) | Capas A Vitest y B Playwright | T004, T008, T011–T012, T020, T023, T031 | `implementation-evidence.md` | NO VERIFICADO |
| AC-004 | Drawer cerrado y hamburguesa en tablet/móvil (IMG-UX-03, 04) | Capa A: Vitest en 1024×768 y 390×844 | T005–T007, T014, T016–T019, T025, T031 | `implementation-evidence.md` | NO VERIFICADO |
| AC-005 | Fidelidad del shell para IMG-UX-01, 02, 05 y 06 | Capa B: Playwright, snapshots aprobados en cuatro viewports | T008, T020–T023, T026, T031 | `evidence/visual-comparison.md` | NO VERIFICADO |
| AC-006 | Sin solapes y contraste accesible en normal, hover y activo (IMG-UX-01, 02, 05, 06) | Capa B: Playwright, geometría y axe-core | T008, T020, T023, T026, T031 | `implementation-evidence.md` | NO VERIFICADO |
| AC-007 | Diferencias ACTUAL contra IMG-UX-01, 02, 05 y 06 clasificadas | Capa C: comparación por región navegación/header | T021, T024, T031 | `evidence/visual-comparison.md` | NO VERIFICADO |
| AC-008 | Baseline aprobado/versionado por escenario-viewport antes de Capa B | Comprobación previa y gate de cierre | T001–T003, T022–T023, T026, T031 | `implementation-evidence.md` | NO VERIFICADO |

## Evidencia de interfaz *(mandatory when UI changes; otherwise state N/A)*

- **Viewports**: 1440×900, 1024×768, 390×844 y 320×667.
- **Verification**: Capa A usa Vitest, se ejecuta primero y debe fallar por la estructura o comportamiento ausente antes del cambio mínimo. Capa B usa Playwright y axe-core; compara snapshots aprobados de IMG-UX-01, IMG-UX-02, IMG-UX-05 e IMG-UX-06 en los cuatro viewports, aserta cero solapes, una primaria y contraste en normal/hover/activo. Requiere baseline aprobado/versionado por escenario-viewport y queda bloqueada si falta alguno. Capa C registra ACTUAL frente a cada referencia en navegación y header como aprobada, pendiente o defecto.
- **Accessibility**: teclado, foco, nombre accesible de iconos y hamburguesa, contraste 4.5:1/3:1, estados activo/hover y composición responsive son obligatorios.
- **Artifact**: `specs/011-workspace-shell/evidence/visual-comparison.md`, capturas ACTUAL y snapshots aprobados versionados por la suite visual.
- **Result and limitations**: NO VERIFICADO hasta completar las tres capas; los mockups son referencias aprobadas, no sustituyen baselines de regresión.

## Evidencia de datos, contratos y migraciones *(mandatory when applicable; otherwise state N/A)*

- **Previous and new contract**: se conserva el contrato de rutas y datos existentes; solo cambia la composición visual del shell.
- **Compatibility cases**: selección, búsqueda, expansión, creación y renombrado de proyectos/tareas; rutas de biblioteca, referencias y ajustes.
- **Non-sensitive fixture**: fixtures de proyectos, tareas y cuatro etapas ya usados por la infraestructura visual.
- **Migration and rollback/recovery**: N/A; no se alteran datos ni persistencia. Revertir el cambio de presentación devuelve la composición anterior.
- **Downstream consumers**: pantallas de inicio y tarea, y los destinos existentes, se verifican mediante sus rutas actuales.

## Evidencia para IA, LLM y agentes *(mandatory when applicable; otherwise state N/A)*

N/A. Los mockups fueron generados como referencias visuales aprobadas, pero esta feature no añade ni modifica ejecución, modelo, proveedor, prompts ni decisiones de agentes.

## Evidence Record *(mandatory)*

**Evidence file**: `implementation-evidence.md`

Durante `speckit-autopilot`, la evidencia operativa se guarda primero bajo
`.codex-autopilot/evidence/` y `.codex-autopilot/reports/`, porque el directorio
de la feature es contrato inmutable salvo las casillas autorizadas de
`tasks.md`. Cada tarea solo podrá marcarse terminada tras registrar la prueba
roja esperada, el cambio mínimo, la prueba verde, la regresión pertinente,
fecha, comando, código de salida y alcance verificado. Una tarea humana final
sincroniza la evidencia saneada en `implementation-evidence.md` y
`evidence/visual-comparison.md`; hasta entonces el cierre documental permanece
pendiente.

## Cierre y revisión independiente *(mandatory for implemented specifications)*

- **Independent patch review**: revisión independiente obligatoria después de los cambios de shell y antes del cierre; registrar hallazgos, resolución o riesgo aceptado.
- **Sensitive-artifact diff review**: confirmar que no se incluyen secretos, bases de datos, cachés, salidas generadas ni artefactos temporales.
- **Aggregate gates**: ejecutar las pruebas unitarias afectadas, la capa visual y la regresión de rutas existente; registrar resultados y cualquier gate no disponible.
- **Graphify validation/update**: actualizar el grafo tras cambios de código y registrar el resultado.
- **Final evidence summary**: resumir alcance verificado, diferencias aprobadas/pendientes/defectos y riesgos no ejecutados.

## Assumptions

- Las rutas, entidades, permisos y almacenamiento existentes son la fuente de verdad; la feature no introduce destinos, permisos ni datos de usuario.
- El usuario proporciona datos de identidad ya disponibles para avatar, nombre y correo; si alguno falta, se usa la representación existente sin persistir información nueva.
- Los escenarios IMG-UX-01, IMG-UX-02, IMG-UX-05 e IMG-UX-06 limitan esta feature a navegación y encabezado; cualquier diferencia del lienzo, agente, bloqueos o cierre permanece fuera de alcance.
- La infraestructura de pruebas visuales y sus baselines aprobadas de la spec 010 deben estar integradas antes de iniciar la Capa B; si no lo están, esta capa y el cierre de la feature permanecen bloqueados.
- La acción primaria se define por jerarquía visual e intención del estado actual; controles de navegación y utilidades no adquieren esa jerarquía.
