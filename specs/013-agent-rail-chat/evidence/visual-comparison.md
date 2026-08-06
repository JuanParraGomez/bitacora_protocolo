# Visual Comparison: Agente como rail contraíble con chat

**Status**: `HUMAN_DECISION_REQUIRED`

La captura ACTUAL se genera únicamente con el modo `VISUAL_RUN_MODE=evidence`.
El mockup no es una baseline y `test:visual:update` está prohibido hasta una
decisión humana explícita.

## Contractual candidates

| Actual | Reference | Viewport | Jerarquía | Contenido | Geometría | Interacción | Responsive | Accesibilidad | SHA-256 | Classification | Severity | Owner | Human decision |
|--------|-----------|----------|-----------|-----------|-----------|-------------|------------|---------------|----------------|----------|-------|----------------|
| ACTUAL-IMG-UX-01-desktop-large | IMG-UX-01 | 1440×900 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `bc354012676b…f958f7e` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-01-tablet | IMG-UX-01/03 | 1024×768 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `0c9df8242f9f…4e034ffec0b056c` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-01-mobile | IMG-UX-01 | 390×844 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `e485a801f751…c35be69` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-01-mobile-narrow | IMG-UX-01 | 320×667 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `4b08d65cb8ef…ecf0b056c` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-02-desktop-large | IMG-UX-02 | 1440×900 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `81e9870d958e…e2b92496` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-02-tablet | IMG-UX-02/03 | 1024×768 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `4d5499b0e6b5…10d9df42` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-02-mobile | IMG-UX-02 | 390×844 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `c4ceaca918aa…d40ffef` | pendiente | — | frontend | pendiente |
| ACTUAL-IMG-UX-02-mobile-narrow | IMG-UX-02 | 320×667 | contract-pass | contract-pass | contract-pass | contract-pass | contract-pass | axe-pass | `16e8c68ecde5…b457449385` | pendiente | — | frontend | pendiente |

## Collateral review

IMG-UX-03 is a tablet contract comparison, not a ninth candidate. A full visual
run after the 013 decision must identify any collateral IMG-UX-03/05 snapshot
diff. Such a diff opens a new human decision before any collateral baseline is
updated.

## Classification rules

- `aprobada`: evidence matches contract and human approved it.
- `pendiente`: not yet reviewed or awaiting a decision.
- `defecto`: in-scope contract failure; severity and owner are mandatory.
