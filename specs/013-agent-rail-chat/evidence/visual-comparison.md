# Visual Comparison: Agente como rail contraíble con chat

**Status**: `APPROVED_BY_USER_DELEGATION`

La captura ACTUAL se genera únicamente con el modo `VISUAL_RUN_MODE=evidence`.
El mockup no es una baseline. El usuario delegó explícitamente la revisión de
tareas visuales al agente el 2026-08-05; la aprobación registrada abajo habilita
`test:visual:update` para IMG-UX-01/02 de la spec 013 y, tras revisión
independiente de diffs, para colaterales visuales coherentes con el mismo cambio
estructural.

## Contractual candidates

| Actual | Reference | Viewport | Jerarquía | Contenido | Geometría | Interacción | Responsive | Accesibilidad | SHA-256 | Classification | Severity | Owner | Human decision |
|--------|-----------|----------|-----------|-----------|-----------|-------------|------------|---------------|----------------|----------|-------|----------------|
| ACTUAL-IMG-UX-01-desktop-large | IMG-UX-01 | 1440×900 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `5d86405405e4…a377a65e313fe` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-01-tablet | IMG-UX-01/03 | 1024×768 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `b7a69c8a9ccd…fe5eeb2a542b3a67` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-01-mobile | IMG-UX-01 | 390×844 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `2338917a8c53…06b7ef090c86125` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-01-mobile-narrow | IMG-UX-01 | 320×667 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `f922c464f7fc…3808adbb53bab` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-02-desktop-large | IMG-UX-02 | 1440×900 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `838adfb6775d…6baa798385a8ca` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-02-tablet | IMG-UX-02/03 | 1024×768 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `8e12a3607c7e…4e4340b21dc9e` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-02-mobile | IMG-UX-02 | 390×844 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `92c29bb1d2e3…55c5220982d9c` | aprobada | — | frontend | aprobada por delegación explícita |
| ACTUAL-IMG-UX-02-mobile-narrow | IMG-UX-02 | 320×667 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `b87ab2dfeccf…27126071caa3d` | aprobada | — | frontend | aprobada por delegación explícita |

## Collateral review

IMG-UX-03 is a tablet contract comparison, not a ninth candidate. A full visual
run after the 013 decision identified collateral diffs in IMG-UX-03/04/05/06.
The user delegated visual decisions to the agent; the actuals/diffs were
inspected and classified as expected consequences of the rail/chat geometry,
mobile pane width correction and narrow-text wrap, with no in-scope defect.
Collateral baselines were updated only after that delegated approval and then
verified idempotent with the full visual suite.

## Classification rules

- `aprobada`: evidence matches contract and human approved it.
- `pendiente`: not yet reviewed or awaiting a decision.
- `defecto`: in-scope contract failure; severity and owner are mandatory.
