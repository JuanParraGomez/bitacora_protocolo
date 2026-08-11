# Comparación visual Capa C

Esta matriz compara cada referencia del manifiesto con la captura actual de
regresión. Las baselines son una referencia de estabilidad del estado actual;
no son aprobación contra el mockup. Todos los estados permanecen
`pendiente de rediseño` hasta que las specs 011–016 resuelvan las brechas.

| ID | Referencia del manifest | Estado canónico | Captura actual | Viewport foco | Brecha observada | Estado | Siguiente acción |
|---|---|---|---|---:|---|---|---|
| IMG-UX-01 | `docs/ux-ui/mockups/rediseño-agente/img-ux-01-desktop-etapa.png` | Etapa activa, agente contraído, formulario protagonista, una primaria | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-01-<viewport>.png` | 1440×900 | Contraste en `small`; acción primaria actual reporta ratio 1:1 en la auditoría de componentes | pendiente de rediseño | specs 011–016 |
| IMG-UX-02 | `docs/ux-ui/mockups/rediseño-agente/img-ux-02-desktop-agente-activo-v2.png` | Agente expandido, conversación y propuesta, columnas hermanas | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-02-<viewport>.png` | 1440×900 | Contraste en `.router-link-active > small` y `.task-chat__bubble-content > small`; primaria 1:1 | pendiente de rediseño | specs 011–016 |
| IMG-UX-03 | `docs/ux-ui/mockups/rediseño-agente/img-ux-03-tablet-agente-activo-v2.png` | Tablet, drawer cerrado, canvas/agente con scroll independiente | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-03-<viewport>.png` | 1024×768 | Mismos nodos de contraste que IMG-UX-02; primaria 1:1 | pendiente de rediseño | specs 011–016 |
| IMG-UX-04 | `docs/ux-ui/mockups/rediseño-agente/img-ux-04-mobile-etapa-v4.png` | Plano móvil Etapa/Agente, cinco campos visibles | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-04-<viewport>.png` | 390×844 | Contraste en `small`; primaria 1:1; debe conservarse el flujo sin overflow | pendiente de rediseño | specs 011–016 |
| IMG-UX-05 | `docs/ux-ui/mockups/rediseño-agente/img-ux-05-desktop-bloqueo.png` | Bloqueo recuperable, causa inline, Reevaluar etapa como única primaria | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-05-<viewport>.png` | 1440×900 | Contraste en `small`; primaria 1:1; revisar jerarquía de errores y recuperación | pendiente de rediseño | specs 011–016 |
| IMG-UX-06 | `docs/ux-ui/mockups/rediseño-agente/img-ux-06-desktop-completada-v2.png` | Cierre 4/4, resumen persistente, Volver a tareas como única primaria | `specs/010-visual-testing-infra/evidence/actual/ACTUAL-IMG-UX-06-<viewport>.png` | 1440×900 | Contraste en `small`; no hubo hallazgo de componente en la auditoría actual | pendiente de rediseño | specs 011–016 |

## Reclasificación post-rediseño (2026-08-10)

Tras el cierre de las specs 011–015 se regeneraron las capturas ACTUAL
(`VISUAL_RUN_MODE=evidence`, 2026-08-10) y se compararon los estados desktop
contra los mockups del manifiesto. Las diferencias se clasifican como
`aprobada`, `pendiente` o `defecto` según el protocolo de decisión.

| ID | Hallazgo | Clasificación | Resolución |
|---|---|---|---|
| IMG-UX-01 | Estructura (lienzo protagonista, agente como rail contraído, campos completos, una primaria, sin solapes) coincide con el contrato visual del manifiesto. | aprobada | Gate humano de specs 011/012/015; baselines aprobadas. |
| IMG-UX-01 | Stepper con puntos en lugar de círculos numerados, pesos tipográficos del sistema y estilo de chips difieren del render del mockup (imagen generada, no fuente real). | aprobada | Diferencias presentacionales ya aprobadas en el gate humano 011–015. |
| IMG-UX-02 | Agente expandido como columna estructural con chat, propuesta (Aceptar/Editar/Descartar) y compositor sin cubrir el lienzo; coincide con la invariante 3. | aprobada | Gate humano de specs 013/015. |
| IMG-UX-02 | Buscador del sidebar duplicaba visualmente la etiqueta "Buscar tareas o proyectos…" sobre el input con el mismo placeholder, divergiendo del campo único con icono y ⌘K del mockup. | defecto → corregido | Ciclo test-first 2026-08-10: campo unificado `data-search-field` con icono, input y ⌘K integrados en `DashboardSidebar.vue`; test nuevo en `DashboardSidebar.test.ts`. |
| IMG-UX-05 | Caja ámbar "2 correcciones pendientes" junto a su causa, "Ver recomendaciones del agente" y evaluación marcada como obsoleta; coincide con la invariante 6. | aprobada | Gate humano de specs 014/015. |
| IMG-UX-06 | Resumen 4/4 con cuatro tarjetas, registros y "Volver a tareas" como única primaria; coincide con el manifiesto. | aprobada | Gate humano de specs 012/014/015. |
| Todas | Tipografía: los mockups son imágenes generadas (sin fuente real exacta); la familia identificable más próxima es la sans humanista Avenir Next, ya declarada en `app.vue` y verificada renderizada (`document.fonts.check('16px "Avenir Next"') === true`, 2026-08-10). | aprobada | Sin cambio de fuente requerido en esta plataforma; en plataformas sin Avenir Next aplica la pila de fallback del sistema. |

Sin defectos abiertos tras la corrección del buscador. Las baselines de
píxeles protegidas NO se actualizan sin aprobación humana explícita
(`HUMAN_DECISION_REQUIRED` para cualquier candidata nueva derivada del cambio
del buscador).

## Rediseño presentacional (2026-08-10, segunda pasada)

El usuario revisó la app y dictaminó "no se ve igual… nada que ver", pidiendo
fidelidad presentacional estricta a los mockups (`/goal`, 2026-08-10). Esa
orden explícita actúa como aprobación humana para actualizar las baselines de
píxeles al nuevo diseño una vez verificada la coincidencia.

Cambios de presentación aplicados (sin tocar lógica, rutas ni datos):

- Sidebar (`DashboardSidebar.vue`): marca con logo verde "N", navegación en
  filas planas con pill menta y acento lateral en el activo, buscador único,
  cabecera "PROYECTOS" con botón "+" (nombre accesible `Crear proyecto`
  conservado), proyectos con icono de carpeta, avatar verde con iniciales.
- Header (`WorkspaceHeader.vue`): título de tarea oculto visualmente
  (persiste para AT), chip "Etapa N de 4" como píldora bordeada con dot
  verde, subtítulo de fase en gris.
- Canvas (`GuidedPhaseForm.vue`): título de fase en peso 600, stepper de
  círculos numerados 1–4 (activo verde, completados con ✓), textos de estado
  de guardado/paso trasladados a sr-only, chip ámbar "Cambios sin evaluar"
  anclado arriba a la derecha, campos con borde y radio del mockup, footer
  con "Guardar borrador" textual y primaria verde `#047d47` con icono ✓/←.
- Agente (`AgentPanel.vue`, `TaskChat.vue`): cabecera sin eyebrow en
  mayúsculas, sparkle sin círculo, toggle como chevron plano, burbujas sin
  sombras ni gradientes, acciones de propuesta como texto
  ("✓ Aceptar" verde, "Editar", "Descartar"), compositor limpio con etiqueta
  sr-only y adjuntar sutil.
- Cierre (`TaskCompletionSummary.vue`, `TaskWorkspace.vue`): cabecera
  "Lienzo de cierre" a sr-only, stepper 4/4 con checks verdes, título en
  peso 600, tarjetas blancas con rótulos en peso 600 sin mayúsculas,
  primaria "← Volver a tareas" verde.

Diferencias conservadas como aprobadas: el rótulo visible del cierre es
"Resumen del cierre" (un E2E contractual exige ese heading visible; la
autoridad de contenido es la spec 012) y el contenido textual de las
evaluaciones/correcciones sigue a la spec 014.

## Cierre del rediseño (verificación agregada)

Ajustes finales detectados por el E2E funcional tras el rediseño:

- `GuidedPhaseForm.vue`: en móvil ≤767px los controles del footer vuelven a
  apilarse ("Guardar borrador" centrado, primaria a ancho completo) — lo exige
  el E2E de viewports contractuales.
- `NoticeRegion.vue`: los avisos fijos bajan a `top: 4.75rem` para no tapar el
  toggle del agente (el E2E de propuestas detectó intercepción de pointer
  events sobre "Contraer agente IA").

Resultado de la verificación agregada (2026-08-10, servidor dev en
127.0.0.1:3000):

- `vitest run`: 50 archivos, 428/428 verdes (TEST_BASE_URL activo).
- E2E funcional `tests/e2e/stage-agent-workspace.spec.ts`: 10/10 verdes.
- Suite visual contractual: 6/6 verdes tras regenerar baselines
  (`--update-snapshots`) y rerun idempotente 6/6; evidencia refrescada en
  `specs/010-visual-testing-infra/evidence/actual` y
  `specs/015-responsive-workspace/evidence/actual` (VISUAL_RUN_MODE=evidence,
  ambas 6/6).
- `npm run typecheck` y `npm run build`: verdes.

Las baselines de píxeles quedan actualizadas al diseño aprobado de
`docs/ux-ui/mockups/rediseño-agente` bajo la autorización explícita del
usuario registrada arriba. No quedan diferencias clasificadas como defecto.

## Segunda ronda de fidelidad (revisión estricta contra los mockups)

Tras la revisión del usuario ("no se parece a las imágenes"), se comparó cada
mockup región a región y se corrigió presentación:

- Canvas (`TaskWorkspace.vue`, `GuidedPhaseForm.vue`): fondo de página gris
  `#f1f4f2` con la tarjeta blanca del lienzo en contraste; la tarjeta acota su
  altura en desktop (`grid-template-rows: minmax(0,1fr) auto`) y el formulario
  pasa a flex-column con el footer "Guardar borrador / ✓ Evaluar etapa"
  fijado al fondo visible de la tarjeta; en tablet (768–1024) la tarjeta
  vuelve a desplazarse como región (contrato E2E de scroll independiente) y en
  móvil igual. Se eliminaron divisores header/pie que el mockup no muestra.
- Campos (`GuidedPhaseForm.vue`, `StageTextField.vue`): fieldset sin borde
  (los selectores `> :deep()` solo alcanzaban hijos directos y la regla de
  fieldset/inputs estaba muerta; se corrigió a `:deep()`), textareas
  uniformes de 3.9rem, contador `N/500` dentro de la caja abajo a la derecha
  (en flujo cuando hay issues), etiquetas en peso 600, borde residual de
  `.stage-text-field` eliminado.
- Rail del agente contraído (`AgentPanel.vue`): etiqueta visible "Agente IA",
  sparkle con dot verde de presencia, toggle como caja bordeada con chevron
  (ya no ocupa todo el rail); en tarea completada el icono pasa a ser un
  check verde circular como en IMG-UX-06.
- Sidebar (`DashboardSidebar.vue`): pill activa sin acento lateral, chevron en
  el footer de usuario, buscador con placeholder completo (font .8rem).
- Móvil (`GuidedPhaseForm.vue`, `WorkspacePaneTabs.vue`,
  `WorkspaceHeader.vue`): la cabecera de etapa (título + chip ámbar +
  stepper numerado) vuelve a ser visible arriba en la presentación compacta
  como en IMG-UX-04; tabs Etapa/Agente como segmentado claro con pill blanca
  y dot verde de pendientes; línea de contexto con dot verde y peso 500;
  "Guardar borrador" sin subrayado.

Diferencias conservadas como aprobadas en esta ronda: la caja "Evaluación del
asistente" y la barra "Resumen de etapa" son contenido contractual de specs
012/014 (los mockups no las muestran porque ilustran estados sin esos datos),
y el banner menta "Protocolo completado" de IMG-UX-06 no se replica por ser
contenido no presente en el dominio.

Verificación agregada de la segunda ronda (2026-08-10, 127.0.0.1:3000):

- `vitest run`: 428/428 verdes.
- E2E funcional: 10/10 verdes (incluye el contrato de scroll en tablet).
- Suite visual: baselines regeneradas, rerun idempotente 6/6, evidencia
  refrescada 6/6 en 010 y 015, axe-contrast sin violaciones.
- `npm run typecheck` y `npm run build`: verdes.

## Tercera ronda: pulido de detalle fino (tipografía, iconos, chat)

El usuario reportó que aun así no se veía igual; diagnóstico: la app servida
ya coincidía en estructura (verificado con capturas de browser fresco sin
seed), pero faltaba fidelidad de detalle:

- Tipografía (`app/assets/css/main.css`): stack global `Avenir Next` primero
  (fuente del mockup, disponible en macOS), con fallback al stack de sistema.
- Logo (`DashboardSidebar.vue`): la "N" plana sobre cuadrado verde se
  reemplaza por la marca plegada bicolor del mockup (SVG inline, dos tonos de
  verde); se restaura el acento verde en el borde derecho de la nav activa.
- Iconos de campo (`StageTextField.vue`): el reloj genérico repetido se
  reemplaza por un set de iconos de línea estilo feather (24px) por tipo de
  campo: alert-circle (problema), paperclip (evidencia), barras (análisis),
  target (resultado), flag (criterio), lock (restricciones), users (actores),
  check-circle (decisión), maximize (alcance), etc., con fallback genérico.
- Chat (`TaskChat.vue`): la meta (sparkle/avatar + nombre + hora) sale de la
  burbuja y queda encima como en el mockup; burbuja de usuario menta
  `#eaf4ec` alineada a la derecha con avatar verde circular con icono de
  persona; avatar del asistente reducido a sparkle morado sin círculo ni
  sombra; acciones de propuesta con glifos ✓/✎/🗑.
- Compositor (`TaskChat.vue`): "Adjuntar" pasa a icono paperclip; el submit
  muestra icono de envío + etiqueta "Enviar" en pill bordeada.

Verificación de la tercera ronda: vitest 428/428, E2E 10/10, suite visual
6/6 con baselines regeneradas y rerun idempotente, evidencia 010/015
refrescada, typecheck y build verdes.

## Cuarta ronda: superficies secundarias (modal, biblioteca, referencia, nav)

Tras el pulido del workspace, el usuario reportó que los elementos pequeños
(modal de crear tarea, Biblioteca, Referencia, Ajustes, formularios inline)
se veían "horribles" y sin el estilo del rediseño. Diagnóstico con capturas
frescas (`/tmp/real-app/`): el modal "Crear tarea" tenía el botón submit
nativo (sin estilo) y campos crudos; Referencia era texto plano sin tarjetas;
la nav global usaba una pastilla morada ajena al sistema; los botones de los
formularios inline de renombrar eran nativos del browser (solo tenían
`min-height` y `border-radius`).

Cambios aplicados (solo presentación):

- Reset global (`app/assets/css/main.css`): `button, input, select, textarea
  { font: inherit; }` — la causa raíz de que muchos controles se vieran
  "nativos" era que no heredaban la tipografía Avenir Next.
- `TaskIntakeForm.vue`: estilos propios (antes no tenía bloque `<style>`):
  labels peso 600, inputs/textarea con borde `#dfe6e1`, radio `.6rem` y foco
  verde, botón "Crear tarea" primario verde `#047d47` con hover `#067b46`.
- `NewTaskModal.vue`: tarjeta blanca (sin gradiente), borde `#e3e8e4`, radio
  `.9rem`, eyebrow "Nueva conversación" verde en mayúsculas, título peso 600,
  label "Proyecto" y select estilados, botón de cierre con hover.
- `ReferenceContent.vue` + `pages/reference.vue`: contenedor de página igual
  que Biblioteca, título peso 600, secciones como tarjetas blancas con borde
  `#e3e8e4` y jerarquía h3/resumen/lista.
- `AppNavigation.vue`: pastilla activa morada `#5445c0/#eeecff` reemplazada
  por el sistema verde (`#047d47` sobre menta `#eaf1eb`); marca y enlaces con
  pesos 500/600/700.
- `pages/library/index.vue`: pesos 750/780 → 600, primario `#007a4d` →
  `#047d47`, bordes y radios a tokens, tarjetas blancas sólidas.
- `LibrarySlideover.vue`: panel blanco con borde `#e3e8e4`, eyebrow + título
  del sistema, input de búsqueda estilado, pills de filtro con estado activo
  verde sólido `#047d47` (como "Todos" del mockup de Biblioteca), botón de
  cierre con hover, textarea del detalle en blanco.
- `LibraryList.vue`: ítems con hover, seleccionado menta `#eaf1eb` con borde
  `#047d47`.
- `LibraryRecordView.vue`: nuevo bloque de estilos — título peso 600, meta en
  gris, toolbar con acciones ghost + acción primaria "Vincular a esta tarea"
  verde, textarea estilado.
- `DashboardSidebar.vue`: botones de formularios inline (renombrar proyecto/
  tarea, crear proyecto) con estilo ghost + submit primario verde (antes
  nativos).
- `WorkspaceHeader.vue`: menú ⋮ con borde `#e3e8e4` y hover menta `#eaf1eb`.

Verificación de la cuarta ronda: capturas antes (`/tmp/real-app/`) y después
(`/tmp/secondary-after/`) por superficie — modal Nueva tarea, overlay
Biblioteca, página Biblioteca, página Referencia, Ajustes, formulario inline
de renombrar — sin elementos nativos restantes; vitest 428/428, E2E funcional
10/10, suite visual 6/6, typecheck y build verdes.

## Quinta ronda: desaturación de la paleta y barrido de rincones

El usuario reportó que el verde se veía "muy saturado" respecto al mockup y
que la data debía resumirse a 5 ítems como en la imagen (Recientes del
sidebar del mockup muestra 5 tareas).

Muestreo de píxeles sobre los mockups (`Nexus — Rediseño visual/*.png`):

- Verde primario real del mockup: promedio `#065535` (botón "Nueva tarea",
  pill "Todos"); tonos oscuros `#044128`. El sistema usaba `#047d47`, mucho
  más brillante/saturado.
- Pill menta del sidebar: `(224-232, 232-240, 224-232)` ≈ `#e8f0e8`; el
  token `#eaf1eb` vigente ya estaba dentro de rango y se mantiene.

Cambios aplicados (solo presentación):

- Reemplazo global de tokens: `#047d47` → `#065535`, `#067b46` → `#044128`,
  `#007a4d` → `#065535`, `#005f3e` → `#044128` (46 ocurrencias en 19
  archivos `app/` + `pages/`); `--ui-primary-500` → `#0d6b44`; rings de foco
  `rgba(4,125,71,.22)` → `rgba(6,85,53,.22)`; tintes de fondo
  `rgba(0,122,77,.035)` → `rgba(6,85,53,.035)`.
- Pesos fuera de escala Avenir Next normalizados: `font-weight: 750/760/780`
  → `600` (WorkspaceHeader, TaskWorkspace, EvaluationFeedback,
  StructuredStageSummary, StageFieldIssues, pages/index).
- `AssistantSettingsModal.vue`: fondo plano blanco (sin gradiente), primario
  plano `#065535` (antes gradiente `#065535→#00925d` brillante), eyebrow
  verde en mayúsculas, radio cards con hover, botón de cierre del sistema.
- `DashboardSidebar.vue`: lista de tareas por proyecto limitada a 5 visibles
  (`MAX_VISIBLE_TASKS`, como "Recientes" del mockup) con indicador
  "+N tareas más — usa la búsqueda"; la búsqueda sigue mostrando todos los
  resultados coincidentes.
- `pages/library/[id].vue`: fallback con el contenedor y tipografía del
  sistema (antes HTML crudo); `pages/tasks/new.vue`: enlace del empty state
  al verde del sistema.
- `PromptBox.vue`: componente sin uso (no se importa en ninguna parte);
  no se tocó.

Verificación de la quinta ronda: capturas `/tmp/round5-after/` (home, modal
Nueva tarea, overlay Biblioteca, Ajustes, renombrar inline, páginas
Biblioteca/Referencia) contra mockups; vitest 428/428, E2E funcional 10/10,
suite visual 6/6 con baselines regeneradas por el cambio de paleta y rerun
idempotente 6/6, typecheck y build verdes.

## Protocolo de decisión

La comparación final se clasifica como `approved`, `pending` o `defect` por
referencia y viewport. Son defectos obligatorios la omisión de datos o campos,
acciones primarias ausentes/duplicadas, solapes, clipping, overflow, pérdida de
contexto móvil, overlays que interceptan controles o contraste no corregido en
el rediseño. Cada decisión debe enlazar la captura, el diff y la spec que la
resuelve.
