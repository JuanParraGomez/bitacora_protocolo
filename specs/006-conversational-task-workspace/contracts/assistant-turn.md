# Contract: Conversational turn and proposals

## Request

The assistant receives:

- project and task identifiers;
- current outcome stage;
- current stage revision;
- confirmed fields;
- pending proposals and contradictions;
- recent messages;
- current method version and relevant evaluations.

User content is always data, never trusted instructions.

## Response

```ts
type AssistantTurn = {
  requestId: string
  projectId: string
  taskId: string
  phase: 1 | 2 | 3 | 4
  methodVersionId: string | null
  baseRevision: string
  message: string
  primaryQuestion: string | null
  proposals: FormUpdate[]
  contradictions: Contradiction[]
  suggestions: string[]
}
```

Rules:

- At most one `primaryQuestion`.
- No question repeats a confirmed field unless reporting a contradiction.
- Every proposal targets the same project/task/phase/method version and a closed field path.
- A response with wrong project, task, phase, method version or stale revision is retained as message but its proposals become `conflict`.
- The response never applies proposals.

## Proposal decision

```ts
type ProposalDecision =
  | { action: 'accept'; proposalId: string; baseRevision: string }
  | { action: 'edit'; proposalId: string; value: unknown; baseRevision: string }
  | { action: 'reject'; proposalId: string; baseRevision: string }
```

Accept/edit requires the current revision to equal `baseRevision`. Reject is always idempotent. Duplicate decisions do not duplicate data.

## Failure and recovery

- Sending error preserves draft/message and offers retry.
- Invalid structured response displays safe error and changes no confirmed field.
- Retry reuses the logical user message and does not duplicate it.
