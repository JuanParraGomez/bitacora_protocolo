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

## Agent pending indicator

- Inputs: pending proposals count, pending corrections count.
- Output: `true` when either count is greater than zero.
- Presentation-only; not stored.

## Logical focus

- Current pane tab is the stable fallback target.
- Explicit recommendation navigation may focus the agent conversation.
- DOM IDs/selectors are not persisted.
