# Visual Acceptance Contract: Responsive workspace

## IMG-UX-03 — Tablet 1024×768

- Drawer absent/closed initially; `Abrir navegación` visible.
- Header compact: hamburger, breadcrumb, stage chip and right overflow.
- Stage and agent are adjacent structural regions with independent vertical scroll.
- No navigation, canvas, agent, composer or footer intersections.
- Zero or one visible `[data-primary-action="true"]`; never more than one.

## IMG-UX-04 — Mobile 390×844 and 320×667

- Single plane with exact context line `Etapa N de 4 · <phase title>`.
- One segmented tablist with Etapa/Agente icons and an accessible pending dot.
- Inactive pane stays mounted but hidden/inert.
- Switching panes preserves stage fields, composer draft and task-local preference.
- All stage fields/counters remain present; no form modal.
- `Guardar borrador` is centered text; contextual primary fills available width.
- At 320 px the document and every pane have zero horizontal overflow.

## Zoom 200%

- Reflow remains usable at 1024, 390 and 320 with no overlapping interactive regions.
- All essential controls remain reachable by keyboard and scrolling.
- No clipped field/list data and no fixed footer covering content.
- Tablet retains non-overlapping stage/agent regions; móvil permite alternar
  ambos tabs sin intercepción y mantiene footer/composer dentro del viewport.

## Accessibility and evidence

- Tab roles, selected state, controls and keyboard behavior remain valid.
- Pending state has accessible text and is not conveyed by color alone.
- Axe-core contrast runs in stage and agent panes for IMG-UX-03/04.
- Mockups are references, not Playwright baselines.
- ACTUAL captures require explicit human approval before baseline update.
- A green contract or inspected ACTUAL does not close the human gate.
