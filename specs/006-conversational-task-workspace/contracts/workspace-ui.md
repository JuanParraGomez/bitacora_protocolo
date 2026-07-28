# Contract: Persistent conversational workspace

## Desktop composition

- Collapsible project/task sidebar.
- Compact project, task and stage header.
- Conversation as the only permanent main surface.
- Structured summary inline and conditional.
- Composer anchored to the conversation region.
- No permanent third column.

## Responsive composition

- At 768–1023 px the sidebar becomes a drawer and conversation uses full width.
- At 320–767 px navigation is a drawer, Library may occupy the screen, and summary remains inline.
- Layout uses dynamic viewport height and safe-area spacing.
- At 200% zoom no third lateral region appears.

## Structured summary states

```text
hidden    = no confirmed data, proposal, contradiction or applicable action
collapsed = useful content exists
expanded  = relevant fields visible
review    = proposal, conflict or reopened data requires action
```

When hidden it reserves no layout box. Expanded content includes only the current question fields, pending proposals and contradictions.

## Overlay taxonomy

| Surface | Desktop | Mobile | Background/focus |
|---------|---------|--------|------------------|
| New task | Modal dialog | Near-full-screen dialog | Inert background, focus trap |
| Settings | Modal dialog | Modal dialog | Inert background, focus trap |
| Library | Right slideover | Full-width overlay | Modeless desktop; preserved shell |
| Notice | Toast/status region | Safe-area notice | No backdrop or focus move |

Closing restores focus to the opener. Unsaved modal input requires confirmation or preserved draft.

## Route compatibility

- `/tasks/new` resolves to the workspace with New task open.
- `/library` and `/library/:id` resolve to the workspace with Library open.
- Back/forward closes or reopens the overlay without clearing active task state.

## Context restoration

Before switching tasks, retain:

- composer draft;
- expanded summary state;
- last visible message ID;
- pending proposals.

Returning restores those values by task ID. Late responses remain bound to their origin.

## Accessibility and safety

- All interactive sidebar items participate in keyboard order.
- Dialogs/slideover have accessible names and explicit close.
- Notices use `status` except urgent errors using `alert`.
- User/assistant/library content is inert and cannot navigate or trigger actions without explicit activation.
