<!-- SPECKIT START -->
For the current responsive workspace adaptation, viewport states, verification
commands, and IMG-UX-03/04 contract, read
`specs/015-responsive-workspace/plan.md`. Preserve the approved/versioned spec
010 visual infrastructure, spec 011 shell, spec 012 canvas composition, spec 013
agent structure, and spec 014 recovery presentation recorded there. For migration checkpoints and deferred service-extraction criteria, retain
`specs/001-evolution-ready-foundation/plan.md` as the architectural baseline.

## Mandatory Test-First Workflow

For every behavior change, bug fix, migration, dependency update, or new
capability, follow this non-negotiable sequence:

1. Write the complete automated test first, covering the happy path, boundary
   values, invalid input, failure/recovery behavior, and relevant regressions.
2. Run that test and confirm that it fails for the expected missing-behavior
   reason. Do not write production implementation before this red result.
3. Implement the smallest production change that can satisfy the test.
4. Run the new test and the affected test suite; correct implementation and
   tests until both pass.
5. Run the required aggregate verification before marking the work complete.

No task is complete merely because code exists: its associated tests must pass,
and existing tests must remain green. If a behavior cannot be automatically
tested, document the reason and the repeatable manual verification in the task
before implementation begins.
<!-- SPECKIT END -->

## Graphify codebase context

When a request involves architecture, impact analysis, an unfamiliar area, or multiple files, consult the local Graphify knowledge graph first from the repository root:

- Prefer a scoped `graphify query`, `graphify path`, or `graphify explain` over reading the full report or searching the whole repository.
- Treat `INFERRED` and `AMBIGUOUS` relationships as leads; verify them in source before changing code.
- For a narrow, clearly local one-file request, direct inspection is acceptable.
- If the graph is missing, stale, or unavailable, say so and use targeted `rg` plus minimal file reads as the fallback.
- Never pass `.env*`, `secrets/`, private keys, local SQLite/database files, dependencies, or generated outputs to Graphify.

## Branch + GitHub workflow (obligatorio para esta sesión)

- Cada implementación / especificación debe vivir en su propia rama `codex/<número>-<slug>`.
- Antes de empezar un nuevo cambio, crear/usar una rama de especificación y jamás implementar en `main`.
- Cada cambio debe tener commit. En cuanto termines una unidad (o cambio intermedio), haz commit y push de esa rama.

### Flujo recomendado por especificación

1. Crear branch de implementación (con el script de specs):
   - `./.specify/scripts/bash/create-new-feature.sh "<Descripción de la implementación>" --short-name "<slug corto"`
2. Cambiar a la rama creada y activar tu identidad autorizada en GitHub:
   - `gh auth switch -u JuanParraGomez`
   - `gh auth setup-git`
3. Al terminar cada bloque de trabajo:
   - `git add -A`
   - `git commit -m "..."` (siempre con mensaje descriptivo)
   - `git push -u origin $(git branch --show-current)`
4. Revisar PR:
   - abrir PR solo desde la rama de feature hacia `main`.
5. Solo luego de autorización explícita del usuario, hacer merge a `main` y finalizar.

### Regla de seguridad de `main`

- No hacer `git push` directo a `main`.
- Si una rama no es `main`, su push debe ir siempre a su remoto homónimo:
  - `git push -u origin $(git branch --show-current)`
- Si existe configuración de branch protection en GitHub, mantenerla activa para exigir PR y aprobación antes de merge.

### Estado esperado en Git

- La rama de trabajo debe quedar con upstream:
  - `git branch -vv` debe mostrar `[origin/<rama>]` en la branch activa.
- Cuando cambies de rama, confirma antes de editar:
  - `git status` y `git branch --show-current`
