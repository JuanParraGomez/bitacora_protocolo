# Contract: Outcome workflow and evidence gates

## Stage labels

| Phase | Label | Completion gate |
|------:|-------|-----------------|
| 1 | Entender el problema | All FR-020 fields confirmed; no contradiction |
| 2 | Descomponer el camino | All FR-021 fields confirmed; at least one actionable step |
| 3 | Ejecutar e iterar | Complete iteration with evidence and criterion comparison |
| 4 | Consolidar y automatizar | Complete method version; every step classified; every identified opportunity complete |

An `outcome-v2` evaluation with the current revision is required to advance. `legacy-v1` is historical only.

## Stage state

```text
pending -> in-progress -> ready-for-review -> complete
                             |                 |
                             v                 v
                       requires-review <-------
```

Editing supporting data invalidates the current evaluation and moves a complete stage to `requires-review`, without deleting later data.

## Method maturity

```text
hypothesis
  -> proposed-path
  -> documented-once
  -> repeatable-method
```

- `documented-once`: at least one successful applicable iteration for the active method version.
- `repeatable-method`: at least two successful applicable iterations for that same version.
- Material change creates a new version at `proposed-path`; old maturity remains on the old version.

## Automation evidence

```text
hypothesis -> candidate-with-evidence
```

Two equivalent occurrences in the same method version are required. No validated-automation state is allowed.

## Legacy mapping

- Existing phase and task status remain visible.
- Missing new minimums mark the equivalent stage `requires-review`.
- Later-stage data stays accessible and is never deleted.
- Completed legacy task remains operationally completed; its method maturity is derived independently.
