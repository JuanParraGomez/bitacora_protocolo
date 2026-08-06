# Comparación visual — IMG-UX-05

Estado: `APPROVED_FOR_BASELINE_UPDATE` (capturas ACTUAL revisadas; actualización visual autorizada por el usuario).

Revision Codex 2026-08-06: las cuatro capturas ACTUAL fueron inspeccionadas
manualmente y el contrato IMG-UX-05 se reejecuto en modo `contract` contra
`http://127.0.0.1:3000`; desktop-large, tablet, mobile y mobile-narrow pasaron
shell-contract y axe sin violaciones. Esta revision tecnica no sustituye la
aprobacion humana requerida para actualizar baselines.

Revision independiente 2026-08-06: el revisor confirmo que los dos hallazgos
accionables de la revision visual fueron corregidos con pruebas enfocadas:
correcciones renderizadas solo desde `resolveEvaluationRecovery` e IDs de
banner unicos para multiples correcciones en un campo.

Decision humana 2026-08-06: el usuario autorizo a Codex a cerrar la revision
visual con "hazlo tu". Con base en la revision tecnica, contrato Playwright,
axe y revisor independiente, IMG-UX-05 queda aprobado para actualizacion
controlada de baseline.

## Capturas comparadas

| Viewport | ACTUAL | Baseline IMG-UX-05 | Estado técnico |
|---|---|---|---|
| desktop-large | `actual/ACTUAL-IMG-UX-05-desktop-large.png` | `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-desktop-large-darwin.png` | contrato y axe verdes |
| tablet | `actual/ACTUAL-IMG-UX-05-tablet.png` | `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-tablet-darwin.png` | contrato y axe verdes |
| mobile | `actual/ACTUAL-IMG-UX-05-mobile.png` | `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-mobile-darwin.png` | contrato y axe verdes |
| mobile-narrow | `actual/ACTUAL-IMG-UX-05-mobile-narrow.png` | `tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/IMG-UX-05-mobile-narrow-darwin.png` | contrato y axe verdes |

## Diferencias observables a revisar

| Dimensión | ACTUAL | Severidad | Owner | Estado |
|---|---|---:|---|---|
| Jerarquía | Banner superior con conteo y lista de dos correcciones; tarjeta genérica sin lista duplicada. | media | frontend | aprobado para baseline |
| Contenido | Motivos canónicos aparecen en banner y dentro de Análisis/Criterio de éxito. | alta | frontend | técnicamente verificado |
| Geometría | Lienzo, agente y compositor conservan regiones independientes; no hay overlay. | alta | frontend | técnicamente verificado |
| Interacción | “Ver recomendaciones del agente” expande/enfoca el agente o cambia al pane móvil. | alta | frontend | técnicamente verificado |
| Responsive | Cuatro viewports contractuales pasan sin overflow horizontal. | media | frontend | técnicamente verificado |
| Accesibilidad | Descendencia inline, `aria-invalid`, `aria-describedby` y contraste axe sin violaciones. | alta | frontend | técnicamente verificado |

Baselines autorizadas para actualización controlada: únicamente IMG-UX-05 en
los cuatro viewports contractuales.

## Notas de revision tecnica

- Desktop-large: banner, lista de correcciones, badge del agente en rail y
  region estructural sin overlay se ven consistentes con el alcance IMG-UX-05.
- Tablet: el lienzo conserva scroll propio y el rail permanece estructural; la
  captura inicial no muestra todos los mensajes inline por posicion de scroll,
  pero el contrato verifica descendencia y geometria en DOM.
- Mobile y mobile-narrow: el pane activo es `Etapa`; el badge visible requerido
  por spec 014 esta cubierto en rail/header. No se agrego badge a la pestana
  movil porque tabs moviles pertenecen a otro alcance.
