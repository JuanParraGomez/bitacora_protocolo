# Visual comparison: Spec 012

Mockups IMG-UX-01 and IMG-UX-04 are references, never executable baselines. The
approved executable baselines are the Playwright snapshots under
`tests/e2e/visual/stage-agent-workspace.visual.spec.ts-snapshots/` after the
2026-08-05 visual update.

Visual approval: approved by the user on 2026-08-05. The assistant first stated
that updating visual baselines required explicit confirmation; the user then
requested completion of the pending tasks, which authorized T047-T050.

## Contractual ACTUAL captures

| ACTUAL | SHA-256 | Reference | Classification |
|--------|---------|-----------|----------------|
| `evidence/actual/ACTUAL-IMG-UX-01-desktop-large.png` | `9c29f6d7a38b75d2a561dc554941dc627576a6f68dc1ac357bb7c516b9282893` | IMG-UX-01 desktop-large | aprobada |
| `evidence/actual/ACTUAL-IMG-UX-01-tablet.png` | `17488b87305eda840d20f0903bc28d1ec641c34e73447c8440dfca38dc26de9f` | IMG-UX-01 tablet | aprobada |
| `evidence/actual/ACTUAL-IMG-UX-01-mobile.png` | `ee2db26bf741e4933ad0ae7b80a2ee5abeb2ab427c1f17f7eea73513ee88479d` | IMG-UX-01 mobile | aprobada |
| `evidence/actual/ACTUAL-IMG-UX-01-mobile-narrow.png` | `f4faa5d718accb7dbd52898c5c2e42afffaf24d85a2b0b2bddbeb056e520aa6b` | IMG-UX-01 mobile-narrow | aprobada |
| `evidence/actual/ACTUAL-IMG-UX-04-mobile.png` | `ee2db26bf741e4933ad0ae7b80a2ee5abeb2ab427c1f17f7eea73513ee88479d` | IMG-UX-04 mobile | aprobada |

## Comparison matrix

| Reference | Hierarchy | Content | Geometry | Interaction | Responsive | Accessibility | Severity | Owner | Classification |
|-----------|-----------|---------|----------|-------------|------------|----------------|----------|-------|----------------|
| IMG-UX-01 | aprobada: formulario is first stage content; no `ETAPA ACTIVA`, `Lienzo de la etapa`, `SÍNTESIS OPERATIVA` or `Atrás` | aprobada: title, 1-4 stepper, phase fields, counters and context section present | aprobada: visual suite reports zero canvas/agent/footer overlaps | aprobada: one primary action; dirty/save flow covered by functional E2E | aprobada: desktop-large, tablet, mobile and mobile-narrow snapshots updated and idempotent | aprobada: axe contrast reports 0 violations and component audit 0 nodes | none | frontend 012 | aprobada |
| IMG-UX-04 | aprobada: mobile keeps the same stage-first DOM and footer order | aprobada: mobile canonical view renders complete phase fields and footer controls | aprobada: mobile snapshot and geometry gates pass without overlap | aprobada: secondary save and primary action remain single visible controls | aprobada: `ACTUAL-IMG-UX-04-mobile.png` matches the approved IMG-UX-01 mobile render because both represent the same phase-1 stage view | aprobada: axe contrast reports 0 violations and component audit 0 nodes | none | frontend 012 | aprobada |

## Global visual matrix affected

The update intentionally regenerated shared canvas baselines beyond the five
contractual ACTUAL captures because IMG-UX-02, IMG-UX-03 and IMG-UX-05 also
render the redesigned active stage canvas. IMG-UX-06 remained visually
unchanged and green in the final idempotent run.

Updated snapshot files:

```text
IMG-UX-01-desktop-large-darwin.png
IMG-UX-01-mobile-darwin.png
IMG-UX-01-mobile-narrow-darwin.png
IMG-UX-02-desktop-large-darwin.png
IMG-UX-02-mobile-darwin.png
IMG-UX-02-mobile-narrow-darwin.png
IMG-UX-02-tablet-darwin.png
IMG-UX-03-desktop-large-darwin.png
IMG-UX-03-mobile-darwin.png
IMG-UX-03-mobile-narrow-darwin.png
IMG-UX-03-tablet-darwin.png
IMG-UX-04-desktop-large-darwin.png
IMG-UX-04-mobile-darwin.png
IMG-UX-04-mobile-narrow-darwin.png
IMG-UX-05-desktop-large-darwin.png
IMG-UX-05-mobile-darwin.png
IMG-UX-05-mobile-narrow-darwin.png
```

## Verification

- `npm run test:visual:update` with the Spec 012 evidence root first passed 4/6;
  IMG-UX-04 mobile and IMG-UX-06 mobile-narrow hit a Playwright execution-context
  retry condition during contrast audit, not a visual or contrast assertion.
- Focused retry for `IMG-UX-04|IMG-UX-06` passed 2/2.
- Focused retry for `IMG-UX-05` passed 1/1 and updated the final mobile-narrow
  collateral snapshot.
- Final idempotent `npm run test:visual -- --workers=1 --reporter=line` passed
  6/6 with shell, geometry, screenshot and axe checks green.
- Seeded gates failed as expected: snapshot overlay, geometry overlap and invalid
  axe rule each returned exit code 1.
