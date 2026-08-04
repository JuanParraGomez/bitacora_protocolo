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

## Protocolo de decisión

La comparación final se clasifica como `approved`, `pending` o `defect` por
referencia y viewport. Son defectos obligatorios la omisión de datos o campos,
acciones primarias ausentes/duplicadas, solapes, clipping, overflow, pérdida de
contexto móvil, overlays que interceptan controles o contraste no corregido en
el rediseño. Cada decisión debe enlazar la captura, el diff y la spec que la
resuelve.
