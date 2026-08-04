# Feature Specification: Infraestructura de pruebas visuales del workspace

**Feature Branch**: `codex/010-visual-testing-infra`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Infraestructura de pruebas visuales del workspace (spec 010): capa de regresión visual automatizada para los 6 escenarios canónicos IMG-UX-01…06 del manifiesto de rediseño del agente (helpers de captura en 4 viewports, fixtures deterministas, invariantes geométricos, contraste axe-core, scripts npm, suite visual, documentación del flujo de baselines y evidencia Capa A/B/C). SOLO infraestructura; no cambia UI."

## Mapa de impacto verificable *(mandatory)*

**Graphify query/path**: `graphify query "tests e2e helpers playwright fixtures stage-agent-workspace visual"` (BFS depth=2, 144 nodos, ejecutada 2026-08-04)

**Executable entries/routes identified**:

- `tests/e2e/helpers/workspace-ux.ts` — helper existente con `WORKSPACE_UX_VIEWPORTS`, `WORKSPACE_AUDIT_TARGETS`, `hasHorizontalOverflow()`, `expectTopHitTarget()` (patrón de referencia para los nuevos helpers).
- `tests/e2e/workspace-ux-audit.spec.ts` — suite existente con `seedWorkspace()`, `SeedTask`, `SeedProject`, `SeedWorkspaceOptions` (patrón de siembra a reutilizar).
- `tests/fixtures/tasks/stage-agent-workspace.ts` — fixture base a extender (confirmado en disco).
- `package.json` — scripts (`verify:e2e`, `fixtures:create`) y `devDependencies` (`@playwright/test` ya presente; `axe-core` por verificar antes de añadir).

**Affected modules, contracts, persistence, and consumers**:

- Afectados (solo adiciones): `tests/e2e/helpers/`, `tests/e2e/visual/`, `tests/fixtures/tasks/stage-agent-workspace.ts` (extensión), scripts de `package.json`, `specs/010-visual-testing-infra/evidence/`, documentación en `tests/e2e/README` o `docs/ux-ui/`.
- Contratos y persistencia: ninguno. No se tocan esquemas, rutas ni `data/bitacora.sqlite`.

**Confirmed inferred/ambiguous relationships**:

- N/A — las relaciones relevantes (fixtures → suites e2e, helpers → specs) se confirmaron leyendo el grafo y el disco directamente.

**Excluded files**:

- `app/**` — prohibido por restricción explícita (esta spec no cambia UI).
- `server/**`, `data/**` — prohibido modificar rutas ni persistencia.
- `docs/ux-ui/mockups/**` — los mockups son referencia de solo lectura; nunca se usan como baseline.

**Compatibility and regression risks**:

- Riesgo: romper suites e2e existentes al extender el fixture compartido. Mitigación: extensión aditiva y ejecución de la suite e2e existente como gate.
- Riesgo: baselines no deterministas por animaciones/horas/avatares. Mitigación: animaciones deshabilitadas y enmascarado de regiones dinámicas (FR-001).
- Riesgo: añadir `axe-core` como dependencia de producción. Mitigación: verificación previa de `package.json` y alta solo como `devDependency` (FR-007).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Captura de escenarios canónicos con baseline (Priority: P1)

Como desarrollador del rediseño, ejecuto la suite visual y obtengo capturas deterministas de los 6 escenarios canónicos (IMG-UX-01…06) en los 4 viewports definidos (1440×900, 1024×768, 390×844, 320px), comparadas automáticamente contra baselines aprobadas. La primera corrida sin baselines falla; tras generar baselines con el flag explícito, una segunda corrida es verde e idempotente.

**Why this priority**: Es el núcleo de la infraestructura: sin capturas deterministas y comparación contra baseline no hay regresión visual, y las specs 011–016 dependen de esta capa.

**Independent Test**: Ejecutar el script de pruebas visuales sin baselines (falla), generar baselines con el flag explícito, repetir la ejecución y comprobar resultado verde con cero diffs y artefactos `ACTUAL-IMG-UX-XX` por escenario y viewport.

**Acceptance Scenarios**:

1. **Given** no existen baselines aprobadas, **When** se ejecuta la suite visual en modo verificación, **Then** la suite falla indicando que faltan baselines (corrida roja inicial, Capa B).
2. **Given** la corrida roja inicial, **When** se ejecuta el script con el flag explícito de actualización, **Then** se generan las 24 capturas baseline (6 escenarios × 4 viewports).
3. **Given** baselines generadas, **When** se repite la ejecución sin cambios, **Then** la suite es verde, sin diffs y sin regenerar artefactos (idempotente).
4. **Given** un cambio visual en un escenario, **When** se ejecuta la suite, **Then** falla señalando el escenario y viewport que difieren del baseline, con artefacto `ACTUAL-IMG-UX-XX` en `specs/010-visual-testing-infra/evidence/actual/`.

---

### User Story 2 - Verificación de invariantes geométricos y de acción primaria (Priority: P2)

Como desarrollador, la suite verifica automáticamente en cada escenario que navegación, lienzo, agente, compositor y acciones nunca se superponen (intersección de áreas) y que hay exactamente una acción primaria visible por estado.

**Why this priority**: Las invariantes geométricas son el contrato transversal del manifiesto visual (invariantes 1 y 2) y detectan defectos que una comparación de píxeles puede no acotar.

**Independent Test**: Pruebas unitarias con cajas sintéticas (solapadas y no solapadas, cero/una/dos acciones primarias) sobre los helpers, más la ejecución de la suite sobre los 6 escenarios.

**Acceptance Scenarios**:

1. **Given** dos regiones estructurales que se intersectan, **When** el verificador evalúa el escenario, **Then** la prueba falla identificando las regiones superpuestas.
2. **Given** un escenario con cero o más de una acción primaria visible, **When** el verificador evalúa el escenario, **Then** la prueba falla indicando el conteo encontrado.
3. **Given** los 6 escenarios canónicos en estado conforme, **When** se ejecuta la verificación, **Then** todos pasan sin superposiciones y con exactamente una acción primaria.

---

### User Story 3 - Verificación de contraste accesible (Priority: P2)

Como desarrollador, la suite evalúa el contraste de los 6 escenarios con axe-core: 4.5:1 para texto y 3:1 para componentes de interfaz, y reporta las violaciones por escenario.

**Why this priority**: El contraste accesible es parte del contrato visual aprobado ("contraste accesible" en los prompts del manifiesto) y debe quedar medido antes de los deltas de las specs 011–016.

**Independent Test**: Ejecutar la verificación de contraste sobre los 6 escenarios y comprobar que cada escenario produce un resultado (sin violaciones o con violaciones explícitamente reportadas y registradas en evidencia).

**Acceptance Scenarios**:

1. **Given** un escenario canónico cargado, **When** se ejecuta la evaluación de contraste, **Then** se verifican las reglas 4.5:1 (texto) y 3:1 (componentes) y cualquier violación queda identificada por elemento.
2. **Given** violaciones de contraste en el estado actual, **When** finaliza la corrida, **Then** quedan registradas en la evidencia como pendientes del rediseño (specs 011–016), sin ocultarse.

---

### User Story 4 - Flujo documentado de baselines y evidencia de brecha contra mockups (Priority: P3)

Como desarrollador o revisor, dispongo de documentación que explica cómo generar, aprobar y actualizar baselines, con la regla explícita de que el mockup nunca es baseline (es imagen generada por IA; la aceptación contra mockup es documental, Capa C), y de un registro `evidence/visual-comparison.md` que deja constancia de que las baselines iniciales están "pendiente de rediseño".

**Why this priority**: Sin el flujo documentado y el registro de brecha, las baselines iniciales (que NO cumplen los mockups) podrían malinterpretarse como aceptación visual.

**Independent Test**: Leer la documentación y `evidence/visual-comparison.md` y verificar que el flujo es reproducible y que cada escenario IMG-UX-XX tiene su estado de brecha registrado.

**Acceptance Scenarios**:

1. **Given** un desarrollador nuevo en el flujo, **When** lee la documentación, **Then** puede generar, aprobar y actualizar baselines sin conocimiento externo.
2. **Given** las baselines iniciales generadas, **When** se consulta `evidence/visual-comparison.md`, **Then** cada escenario IMG-UX-01…06 figura como "pendiente de rediseño" con referencia a las specs 011–016.

---

### Edge Cases

- ¿Qué pasa cuando no existen baselines? La suite en modo verificación falla; solo el flag explícito las genera (nunca se crean baselines implícitamente en una corrida de verificación).
- ¿Cómo se manejan regiones dinámicas (horas, avatares, ids)? Se enmascaran antes de la captura; una región dinámica sin enmascarar produce diffs falsos y debe detectarse como idempotencia rota en la segunda corrida.
- ¿Qué pasa con el viewport de 320px, sin mockup dedicado en el manifiesto? Se captura con el mismo dataset y las mismas invariantes; su referencia conceptual es el escenario móvil (IMG-UX-04).
- ¿Qué pasa si un fixture no es determinista entre corridas? La segunda corrida idempotente falla, señalando el escenario afectado.
- ¿Qué pasa si `axe-core` ya existe en `package.json`? Se reutiliza tal cual; no se añade ni cambia de versión.
- ¿Qué pasa si las rutas de escenario se definen con globs? Se rechazan: solo se aceptan rutas canónicas resueltas desde el manifiesto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La infraestructura MUST proveer helpers de captura (en `tests/e2e/helpers/`) que naveguen a cada estado, esperen estabilidad visual, enmascaren regiones dinámicas (horas, avatares, ids), deshabiliten animaciones y comparen capturas con tolerancia de diferencia de píxeles máxima del 1%. Refs: IMG-UX-01…06.
- **FR-002**: La infraestructura MUST resolver los 6 escenarios canónicos (IMG-UX-01…06) desde el manifiesto visual (`docs/ux-ui/mockups/rediseño-agente/manifest.md`) con rutas canónicas estables, y MUST rechazar globs o rutas no canónicas. Refs: IMG-UX-01…06.
- **FR-003**: Cada escenario MUST capturarse en los 4 viewports 1440×900, 1024×768, 390×844 y 320px de ancho, usando el mismo dataset en todos ellos. Refs: IMG-UX-01…06.
- **FR-004**: Los fixtures deterministas MUST reutilizar/extender `tests/fixtures/tasks/stage-agent-workspace.ts` cubriendo: etapa activa con agente contraído (IMG-UX-01), agente expandido con conversación y propuesta (IMG-UX-02, IMG-UX-03), flujo móvil de etapa (IMG-UX-04), bloqueo con 2 correcciones (IMG-UX-05) y tarea completada 4/4 (IMG-UX-06).
- **FR-005**: La infraestructura MUST verificar cero superposiciones (intersección de áreas) entre navegación, lienzo, agente, compositor y acciones en cada escenario. Refs: IMG-UX-01…06, invariante 2 del manifiesto.
- **FR-006**: La infraestructura MUST verificar exactamente una acción primaria visible por estado. Refs: IMG-UX-01…06, invariante 1 del manifiesto.
- **FR-007**: La infraestructura MUST evaluar contraste con axe-core en los 6 escenarios: 4.5:1 para texto y 3:1 para componentes. `axe-core` se añade solo como `devDependency` y únicamente si no existe ya en `package.json` (verificación previa obligatoria). Refs: IMG-UX-01…06.
- **FR-008**: MUST existir un script npm `test:visual` para la verificación, con actualización/generación de baselines únicamente mediante flag explícito, y la convención de rutas `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-XX.png` para los artefactos de captura.
- **FR-009**: MUST existir la suite `tests/e2e/visual/stage-agent-workspace.visual.spec.ts` que capture los 6 escenarios y falle si difieren del baseline o violan invariantes geométricas, de acción primaria o de contraste. Refs: IMG-UX-01…06.
- **FR-010**: MUST existir documentación del flujo (en `tests/e2e/README` o `docs/ux-ui/`) que explique cómo generar, aprobar y actualizar baselines, incluyendo la regla de que el mockup nunca es baseline (imagen IA; la aceptación contra mockup es documental, Capa C).
- **FR-011**: Los helpers MUST tener pruebas unitarias (Capa A) que cubran: resolución de rutas canónicas desde el manifiesto, rechazo de globs, enmascarado de regiones dinámicas, detección de superposición con cajas sintéticas y conteo de acción primaria.
- **FR-012**: La suite visual MUST ser idempotente: tras generar baselines, una segunda corrida sin cambios es verde y no regenera artefactos (Capa B).
- **FR-013**: MUST existir `specs/010-visual-testing-infra/evidence/visual-comparison.md` registrando que las baselines iniciales quedan "pendiente de rediseño" para los 6 escenarios, con referencia a las specs 011–016 (Capa C).
- **FR-014**: Esta spec MUST NOT modificar componentes de `app/`, rutas ni persistencia; el alcance es exclusivamente infraestructura de pruebas y documentación.
- **FR-015**: Todos los requisitos, pruebas y tareas MUST mantener trazabilidad explícita con refs `IMG-UX-01`…`IMG-UX-06`.

### Key Entities *(include if feature involves data)*

- **Escenario canónico**: uno de los 6 estados visuales del workspace con agente (IMG-UX-01…06), definido por el manifiesto visual; atributos: ID estable, estado de la tarea, viewport objetivo, contrato principal.
- **Baseline**: captura aprobada de un escenario en un viewport, contra la que se comparan las corridas posteriores; solo se crea/actualiza con flag explícito.
- **Viewport**: tamaño de ventana de evaluación (1440×900, 1024×768, 390×844, 320px); el mismo dataset se renderiza en todos.
- **Fixture de tarea**: dataset determinista del workspace (etapa, estado del agente, conversación, propuesta, correcciones, progreso) que siembra cada escenario.
- **Registro de comparación visual**: documento de evidencia que clasifica la brecha de cada escenario contra su mockup (pendiente de rediseño / aprobado / defecto).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una sola ejecución del comando de pruebas visuales produce y verifica las 24 capturas (6 escenarios × 4 viewports) con tolerancia de diferencia ≤ 1% de píxeles.
- **SC-002**: Tras generar baselines, una segunda ejecución sin cambios es 100% verde, con cero diffs y sin regenerar artefactos (idempotencia demostrada).
- **SC-003**: Las pruebas unitarias de los helpers detectan el 100% de los defectos sintéticos sembrados (superposiciones, conteo incorrecto de acción primaria, globs, regiones sin enmascarar).
- **SC-004**: Los 6 escenarios quedan evaluados por contraste (4.5:1 texto, 3:1 componentes) y toda violación queda registrada por escenario y elemento en la evidencia.
- **SC-005**: Ninguna baseline se crea ni actualiza sin el flag explícito; una corrida de verificación nunca modifica baselines.
- **SC-006**: La ejecución completa de la suite visual (24 capturas + invariantes + contraste) termina en menos de 10 minutos en un entorno local estándar.

## Matriz de aceptación *(mandatory)*

| Acceptance ID | Criterion | Verification method/test | Responsible task | Final evidence | Verifiable status |
|---------------|-----------|--------------------------|------------------|----------------|-------------------|
| AC-001 | Helpers de captura con espera estable, máscaras y tolerancia 1% (FR-001) | Pruebas unitarias Capa A + suite visual verde | T### | implementation-evidence.md | NO VERIFICADO |
| AC-002 | Escenarios canónicos resueltos desde el manifiesto; globs rechazados (FR-002) | Pruebas unitarias de resolución y rechazo | T### | implementation-evidence.md | NO VERIFICADO |
| AC-003 | 24 capturas en 4 viewports con el mismo dataset (FR-003, FR-004) | Corrida de suite visual con baselines | T### | evidence/actual/ACTUAL-IMG-UX-XX | NO VERIFICADO |
| AC-004 | Cero superposiciones y una acción primaria por estado (FR-005, FR-006) | Unitarias con cajas sintéticas + verificación en suite | T### | implementation-evidence.md | NO VERIFICADO |
| AC-005 | Contraste 4.5:1/3:1 evaluado en los 6 escenarios (FR-007) | Ejecución axe-core con resultados registrados | T### | implementation-evidence.md | NO VERIFICADO |
| AC-006 | Baselines solo con flag explícito; corrida roja → generación → verde idempotente (FR-008, FR-012) | Secuencia Capa B documentada | T### | implementation-evidence.md | NO VERIFICADO |
| AC-007 | Suite visual falla ante diff o violación de invariantes (FR-009) | Corrida con defecto sembrado + corrida limpia | T### | implementation-evidence.md | NO VERIFICADO |
| AC-008 | Flujo documentado y regla "mockup nunca es baseline" (FR-010) | Revisión documental | T### | tests/e2e/README o docs/ux-ui | NO VERIFICADO |
| AC-009 | Brecha inicial registrada como "pendiente de rediseño" (FR-013) | Revisión de evidence/visual-comparison.md | T### | evidence/visual-comparison.md | NO VERIFICADO |
| AC-010 | Sin cambios en app/, rutas ni persistencia (FR-014) | Diff de la rama limitado a tests/, package.json, docs y specs/010 | T### | implementation-evidence.md | NO VERIFICADO |

## Evidencia de interfaz *(mandatory when UI changes; otherwise state N/A)*

- **Viewports**: 1440×900, 1024×768, 390×844, 320px (los 4 viewports de la infraestructura).
- **Verification**: ejecución de la suite visual (`test:visual`) con generación de baselines vía flag explícito y segunda corrida idempotente.
- **Accessibility**: contraste evaluado con axe-core (4.5:1 texto, 3:1 componentes) en los 6 escenarios; teclado/foco/nombre accesible fuera de alcance de esta spec.
- **Artifact**: `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-XX.png` por escenario y viewport, más `evidence/visual-comparison.md`.
- **Result and limitations**: esta spec no cambia la UI; las baselines iniciales reflejan el estado actual, que NO cumple los mockups (brecha registrada como pendiente de las specs 011–016).

## Evidencia de datos, contratos y migraciones *(mandatory when applicable; otherwise state N/A)*

N/A — no se modifican contratos, persistencia ni migraciones (FR-014). Los fixtures usan datos sintéticos no sensibles.

## Evidencia para IA, LLM y agentes *(mandatory when applicable; otherwise state N/A)*

N/A — la única relación con IA es que los mockups son imágenes generadas por IA, y la regla documental (FR-010) prohíbe usarlas como baseline; la aceptación contra mockup es documental (Capa C).

## Evidence Record *(mandatory)*

**Evidence file**: `implementation-evidence.md`

## Cierre y revisión independiente *(mandatory for implemented specifications)*

- **Independent patch review**: pendiente (se registrará al cierre).
- **Sensitive-artifact diff review**: pendiente; alcance esperado limitado a `tests/`, `package.json`, documentación y `specs/010-visual-testing-infra/`.
- **Aggregate gates**: pendiente; se espera la suite e2e existente verde más la nueva suite visual y las unitarias de helpers.
- **Graphify validation/update**: `graphify update .` tras implementar.
- **Final evidence summary**: pendiente.

## Assumptions

- El estado actual del workspace NO cumple los mockups; las baselines iniciales son la referencia de regresión, no de aceptación visual (la aceptación la hacen las specs 011–016 con la Capa C documental).
- El viewport de 320px no tiene mockup dedicado; se evalúa con el mismo dataset e invariantes, tomando IMG-UX-04 como referencia conceptual.
- `axe-core` se verificará en `package.json` antes de añadirlo; si ya existe, se reutiliza sin cambios.
- Las baselines se versionan en el repositorio junto al código de pruebas.
- La ejecución en CI queda fuera de alcance; el objetivo es ejecución local reproducible.
- La rama de implementación será `codex/010-visual-testing-infra`, creada antes de empezar según el flujo de AGENTS.md.
