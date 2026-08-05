# Visual comparison: Spec 011 workspace shell

**Decision**: approved after correction on 2026-08-05

**References**: IMG-UX-01, IMG-UX-02, IMG-UX-05, IMG-UX-06

The approved ACTUAL captures preserve the workspace hierarchy required by the
mockups while retaining existing routes and behavior. The first review found
clipped mobile action text; that defect was corrected and all candidates below
were reviewed again. The published ACTUAL files are byte-identical copies of
the approved Playwright baselines; those baselines remain distinct from ImageGen
mockups.

| Scenario | Viewport | Classification | Artifact |
|---|---|---|---|
| IMG-UX-01 | desktop-large | approved | [ACTUAL](actual/ACTUAL-IMG-UX-01-desktop-large.png) |
| IMG-UX-01 | tablet | approved | [ACTUAL](actual/ACTUAL-IMG-UX-01-tablet.png) |
| IMG-UX-01 | mobile | approved | [ACTUAL](actual/ACTUAL-IMG-UX-01-mobile.png) |
| IMG-UX-01 | mobile-narrow | approved | [ACTUAL](actual/ACTUAL-IMG-UX-01-mobile-narrow.png) |
| IMG-UX-02 | desktop-large | approved | [ACTUAL](actual/ACTUAL-IMG-UX-02-desktop-large.png) |
| IMG-UX-02 | tablet | approved | [ACTUAL](actual/ACTUAL-IMG-UX-02-tablet.png) |
| IMG-UX-02 | mobile | approved after clipped-button fix | [ACTUAL](actual/ACTUAL-IMG-UX-02-mobile.png) |
| IMG-UX-02 | mobile-narrow | approved after clipped-button fix | [ACTUAL](actual/ACTUAL-IMG-UX-02-mobile-narrow.png) |
| IMG-UX-05 | desktop-large | approved | [ACTUAL](actual/ACTUAL-IMG-UX-05-desktop-large.png) |
| IMG-UX-05 | tablet | approved | [ACTUAL](actual/ACTUAL-IMG-UX-05-tablet.png) |
| IMG-UX-05 | mobile | approved after clipped-button fix | [ACTUAL](actual/ACTUAL-IMG-UX-05-mobile.png) |
| IMG-UX-05 | mobile-narrow | approved after clipped-button fix | [ACTUAL](actual/ACTUAL-IMG-UX-05-mobile-narrow.png) |
| IMG-UX-06 | desktop-large | approved | [ACTUAL](actual/ACTUAL-IMG-UX-06-desktop-large.png) |
| IMG-UX-06 | tablet | approved | [ACTUAL](actual/ACTUAL-IMG-UX-06-tablet.png) |
| IMG-UX-06 | mobile | approved | [ACTUAL](actual/ACTUAL-IMG-UX-06-mobile.png) |
| IMG-UX-06 | mobile-narrow | approved | [ACTUAL](actual/ACTUAL-IMG-UX-06-mobile-narrow.png) |

## Observable comparison

- Desktop: navigation, project hierarchy, canvas and agent remain separate and
  non-overlapping.
- Tablet: navigation starts closed and the workspace retains its readable order.
- Mobile: compact header, Etapa/Agente selector and full-width actions remain
  readable without clipped labels or horizontal overflow.
- Accessibility: the approved visual run reported zero axe text-contrast and
  zero component-contrast violations across 24 viewport captures.
