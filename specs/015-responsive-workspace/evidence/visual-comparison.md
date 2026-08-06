# Visual Comparison: ACTUAL vs IMG-UX-03/04

**Status**: approved candidates; baselines updated after explicit human closure
request on 2026-08-06.

| Ref/state | Hierarchy/content | Geometry/interaction | Responsive/accessibility | Classification |
|---|---|---|---|---|
| IMG-UX-03 tablet agent | Compact breadcrumb header, stage chip and overflow are present; canvas and agent retain the 012/013 content hierarchy. | Closed drawer/hamburger and adjacent stage/agent regions match the reference intent; automated scroll probes confirm independent vertical scroll. | 1024×768 contract has no overlap or horizontal overflow at normal/200% zoom; agent controls remain keyboard reachable and axe reports zero contrast violations. | Approved structural contract; selected baselines updated. |
| IMG-UX-04 mobile stage | The viewport candidate shows the exact context line, icon-labelled selector, complete in-flow fields/counters and the stage footer after the form content instead of covering fields. | The visible single plane and field-first hierarchy match the reference; centered save/full-width primary are visible in the flow and covered by footer-vs-field overlap assertions. | Automated 390×844 checks preserve all fields, draft and focus with no overlap; axe contrast is clear. | Approved visual contract; selected baselines updated. |
| IMG-UX-04 mobile agent | The viewport candidate shows the same compact context, selected Agente pane, agent identity and composer. Its canonical fixture is idle; pending-dot appearance is proven separately by component and task-with-proposal journeys. | No redundant collapse control or modal appears. Mounted-draft and logical-focus behavior are automated interaction evidence, not inferable from one still image. | Automated agent-pane checks report no overlap/horizontal overflow and clear axe contrast at 390×844 and 320 px. | Approved structural contract; selected baselines updated. |
| IMG-UX-04 mobile narrow | Separate stage/agent viewport candidates exist at 320 px and show the canonical flow without horizontal clipping or footer-field overlap. | Selector-to-panel geometry is contiguous and at most one primary is proven by DOM inspection. | Automated scroll/reflow checks prove below-fold reachability and both-pane usability at 200% zoom, including footer/composer width, footer-vs-field containment and tab/pane non-overlap; axe reports zero contrast violations. | Approved invariant 4 flow; selected baselines updated. |

Approval source: after the footer overlap was rejected as blocking, user wrote
`ok arregal y cierra las tareas` on 2026-08-06.
Baselines were updated only after that request, then rerun without update.
