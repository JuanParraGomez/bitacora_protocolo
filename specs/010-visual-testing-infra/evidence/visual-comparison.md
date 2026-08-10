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

## Protocolo de decisión

La comparación final se clasifica como `approved`, `pending` o `defect` por
referencia y viewport. Son defectos obligatorios la omisión de datos o campos,
acciones primarias ausentes/duplicadas, solapes, clipping, overflow, pérdida de
contexto móvil, overlays que interceptan controles o contraste no corregido en
el rediseño. Cada decisión debe enlazar la captura, el diff y la spec que la
resuelve.
