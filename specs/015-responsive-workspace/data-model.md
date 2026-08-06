# Presentation State Model: Adaptación responsive del workspace

## Workspace shell mode

- Values: `desktop | tablet | mobile`
- Derived from viewport width; never persisted.
- Invalid widths resolve to `mobile`.

## Mobile pane preference

- Values: `stage | agent`
- Key: task ID known to `useWorkspaceState`.
- Default: `stage`; only non-default entries need stored representation.
- Reset: deleting a task preference returns it to `stage` without affecting others.
- Transition: `stage -> agent -> stage` updates only the current task key.
- Isolation invariant: navigating between task A and task B restores two
  independently stored values; no global pane fallback may overwrite either.

## Agent pending indicator

- Inputs: pending proposals count, pending corrections count.
- Output: `true` when either count is greater than zero.
- Presentation-only; not stored.

## Logical focus

- Current pane tab is the stable fallback target.
- Explicit recommendation navigation may focus the agent conversation.
- DOM IDs/selectors are not persisted.

## Responsive presentation contract

- Values: `desktop | tablet | mobile`.
- Boundaries: `>=1025`, `768–1024`, `<=767`.
- Invalid/non-finite input: `mobile`.
- Presentation is derived per viewport and never stored.

## Primary action projection

- Input: visible interactive elements in the active presentation.
- Valid count: integer `0 | 1`.
- Invalid state: any count greater than one.
