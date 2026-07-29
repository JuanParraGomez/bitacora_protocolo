# Implementation Plan: Lienzo por etapas con agente IA

**Branch**: `codex/008-stage-agent-workspace` | **Date**: 2026-07-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-stage-agent-workspace/spec.md`

## Summary

Recomponer el workspace actual para que la etapa sea el lienzo principal y el
agente IA una región estructural contraíble. La implementación centraliza
`Evaluar`, `Reevaluar`, `Continuar`, `Finalizar` y `Volver a tareas` en una
acción presentacional derivada de las reglas existentes; reemplaza el slideover
móvil del formulario por los planos `Etapa` / `Agente`; y añade un resumen de
solo lectura para tareas completadas. No cambia schemas, rutas, almacenamiento,
proveedor del agente ni gates de dominio. Cada incremento se desarrolla con
TDD y se valida contra `IMG-UX-01` a `IMG-UX-06`.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Vue 3.5.40 y Node.js 22.19+ LTS

**Primary Dependencies**: Nuxt 4.5, Nuxt UI 4.10, Zod 4.4 y Tailwind CSS 4.3;
sin dependencias nuevas

**Storage**: SQLite `kv_store` y contratos JSON actuales; el estado de
presentación reutiliza el composable del workspace y no añade datos de negocio

**Testing**: Vitest 4.1 para funciones puras, componentes y composables;
Playwright 1.62 para recorridos, breakpoints, teclado y capturas contractuales

**Target Platform**: Navegadores modernos en 1440 × 900, 1024 × 768,
390 × 844, ancho mínimo de 320 px y zoom al 200 %

**Project Type**: Aplicación web full-stack dentro del monolito modular Nuxt
existente

**Performance Goals**: Alternar etapa/agente sin red ni pérdida de estado;
respuesta visual en la misma interacción; apertura/cierre sin layout shift que
oculte el control enfocado; cero solicitudes duplicadas por doble activación

**Constraints**: TDD obligatorio; una sola acción primaria; agente nunca
superpuesto; contenido responsive completo; conservación de borrador/foco/
scroll; no modificar `canAdvanceWithAssistant`, schemas, almacenamiento,
finalización, `/legacy`, dependencias o runtime salvo defecto de integración
demostrado primero por una prueba

**Scale/Scope**: Cuatro historias, 37 requisitos, 22 criterios de aceptación,
seis referencias visuales, cuatro estados principales de layout y seis estados
de acción contextual

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

### Pre-design: PASS

- **Test-first delivery**: PASS. Cada cambio de comportamiento tiene tarea de
  prueba completa, rojo esperado, cambio mínimo, verde enfocado y regresión.
- **Verifiable evidence**: PASS. Cada tarea completada requiere registro
  individual en `implementation-evidence.md`; una captura aislada no prueba
  interacción.
- **Data safety and compatibility**: PASS. No hay migración, schema nuevo ni
  escritura adicional durante la lectura del resumen.
- **Feature ownership and boundaries**: PASS. `tasks` conserva el workspace y
  sus reglas; las páginas siguen componiendo y persistiendo.
- **AI safe failure**: PASS. Respuestas tardías y propuestas continúan
  vinculadas a tarea, etapa, versión y revisión.
- **Operational simplicity**: PASS. No se añaden servicios, dependencias,
  proveedor ni unidad de despliegue.
- **Fresh architecture evidence**: PASS. El cierre incluye estructura,
  Graphify y revisión independiente.

### Post-design: PASS

- La acción contextual es una proyección pura y no una segunda máquina de
  estados.
- Los componentes nuevos separan layout, agente, acción y resumen sin mover
  reglas de dominio.
- El estado responsive es presentacional y tolera el estado vigente sin
  migración.
- `CompletionSummary` solo lee; finalización y creación de registros siguen en
  los servicios existentes.
- El contrato visual distingue apariencia estática de evidencia funcional y
  accesible.
- No se requiere excepción constitucional.

## Graphify and source evidence

| Lead | Source confirmation | Planning consequence |
|---|---|---|
| `TaskWorkspace` conecta chat, evaluación y formulario | `TaskWorkspace.vue`: `handleSendMessage`, `performEvaluation`, `handleProposalDecision`, `onRequestContinue` | Mantenerlo como orquestador y extraer solo presentación |
| El avance autorizado vive fuera de la UI | `pages/tasks/[id].vue`: `canAdvanceWithAssistant`, `advance`; `task-rules.ts` | El resolver visual consume el gate, no lo reimplementa |
| La finalización ya es idempotente por flujo | `pages/tasks/[id].vue`: `completeCurrentTask`; `task-completion.ts` | El resumen completado es lectura, nunca dispara finalización |
| Chat ya conserva borrador y mensaje visible | `TaskChat.vue`; `useWorkspaceState.ts` | Reutilizar continuidad al alternar planos |
| El layout actual usa formulario dentro del chat y slideover móvil | `TaskWorkspace.vue`: `workspace-guided-editor`, `workspace-guided-slideover` | Sustituir por canvas/agent grid y tabs móviles |
| Existe una barra externa con `Avanzar` | `pages/tasks/[id].vue`: `task-page__status` | Integrar estado/errores/acción en el canvas y retirar duplicado |

Las relaciones `INFERRED` o `AMBIGUOUS` de Graphify se usaron solo como
orientación y se confirmaron en los archivos citados.

## Project Structure

### Documentation (this feature)

```text
specs/008-stage-agent-workspace/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── implementation-evidence.md
├── checklists/
│   └── requirements.md
├── contracts/
│   └── visual-acceptance.md
├── evidence/
│   └── actual/
└── tasks.md
```

### Source Code (repository root)

```text
app/
└── features/
    └── tasks/
        ├── components/
        │   ├── DashboardSidebar.vue
        │   ├── EvaluationFeedback.vue
        │   ├── GuidedPhaseForm.vue
        │   ├── TaskChat.vue
        │   ├── AgentPanel.vue                     # new
        │   ├── StageFieldIssues.vue               # new
        │   ├── TaskCompletionSummary.vue          # new
        │   ├── TaskWorkspace.vue
        │   ├── WorkspaceHeader.vue
        │   ├── WorkspacePaneTabs.vue               # new
        │   ├── workspace-presentation.ts           # new
        │   └── *.test.ts
        ├── composables/
        │   ├── useWorkspaceState.ts
        │   └── useWorkspaceState.test.ts
        ├── domain/
        │   ├── task-assistant-rules.ts
        │   └── task-rules.ts
        └── services/
            └── task-completion.ts
pages/
└── tasks/
    └── [id].vue
scripts/
└── verify-workspace-visual-contract.mjs          # new
tests/
├── fixtures/
│   └── tasks/
│       └── stage-agent-workspace.ts              # new
└── e2e/
    ├── stage-agent-workspace.spec.ts             # new
    ├── conversational-workspace.spec.ts
    ├── guided-workspace.spec.ts
    ├── workspace-library.spec.ts
    └── workspace-overlays.spec.ts
```

**Structure Decision**: Mantener todo el rediseño dentro del feature `tasks`.
`TaskWorkspace` coordina datos, eventos y el grid; una única instancia de
`GuidedPhaseForm` pasa a ser el canvas; `AgentPanel` posee rail, panel y estado
accesible, delegando conversación a `TaskChat`; `WorkspacePaneTabs` controla
los planos móviles; `workspace-presentation.ts` deriva acción, issues y resumen
sin efectos; y `TaskCompletionSummary` proyecta el cierre.
`pages/tasks/[id].vue` conserva persistencia, avance y finalización, pero
elimina la barra visual duplicada.

## Component and responsibility plan

| Unit | Responsibility | Must not own |
|---|---|---|
| `workspace-presentation.ts` | Derivar acción, issues por campo y resumen completado | Persistencia, evaluación o avance |
| `GuidedPhaseForm.vue` | Canvas: progreso, fase completa, feedback, guardar y acción contextual | Reglas de gate o almacenamiento |
| `StageFieldIssues.vue` | Mensajes inline asociados a controles | Decidir si se puede avanzar |
| `AgentPanel.vue` | Rail contraído, panel expandido, estado y accesibilidad | Lógica de mensajes/propuestas |
| `WorkspacePaneTabs.vue` | Tabs móviles, teclado y plano activo | Contenido o estado de negocio |
| `TaskChat.vue` | Mensajes, compositor, borrador y decisiones existentes | Layout del workspace |
| `TaskCompletionSummary.vue` | Vista de solo lectura 4/4 | Completar tarea o crear registros |
| `TaskWorkspace.vue` | Grid, breakpoints, plano móvil y orquestación | Persistencia final |
| `useWorkspaceState.ts` | Continuidad por tarea de borrador, mensaje, agente y plano móvil | Datos de negocio |
| `pages/tasks/[id].vue` | Carga, guardado, avance, finalización y navegación | Geometría del workspace |

## Contextual action design

El resolver recibe una instantánea explícita:

- tarea activa/completada y fase;
- evaluación inexistente/vigente/desfasada/aceptable/no aceptable;
- `isEvaluating`;
- resultado vigente de `canAdvanceWithAssistant`;
- error recuperable.

Devuelve un discriminated union sin efectos:

| Kind | Label | Handler exposed by workspace |
|---|---|---|
| `evaluate` | `Evaluar etapa` | `performEvaluation` |
| `evaluating` | `Evaluando…` | ninguno |
| `reevaluate` | `Reevaluar etapa` | `performEvaluation` |
| `continue` | `Continuar a etapa N` | `requestContinue` |
| `finish` | `Finalizar tarea` | `requestContinue` |
| `return` | `Volver a tareas` | navegación al destino existente |

El resolver no puede transformar un gate rechazado en `continue` o `finish`.
Cada combinación límite se prueba antes de integrar UI.

## Responsive design

### Desktop: `min-width: 1200px`

- Sidebar persistente/contraíble.
- Agente contraído como rail; abierto como columna con ancho acotado.
- Canvas usa el espacio restante con mínimo legible.
- Canvas y agente tienen scroll independiente.

### Tablet: `768px–1199px`

- Navegación fuera del grid y cerrada inicialmente.
- Canvas y agente comparten dos columnas cuando el agente está abierto.
- Si el espacio útil no mantiene mínimos, el agente puede contraerse, pero
  nunca flotar sobre la etapa.

### Mobile: `<768px`

- Navegación en drawer.
- Tabs `Etapa` / `Agente`; `Etapa` inicial.
- Solo un plano visible y accesible; el plano inactivo no recibe foco.
- Los componentes permanecen montados al alternar; el plano inactivo usa
  visibilidad semántica e `inert` para no recibir foco.
- Acciones al final del flujo, no fixed sobre contenido.

### Boundary and zoom

- 320 px sin overflow horizontal.
- Zoom 200 % con reflow, foco y CTA alcanzables.
- Resize no cambia tarea, etapa, borrador ni respuesta pendiente.

## Visual traceability matrix

| Reference | Region/state | Components | Breakpoint | Primary verification | Main risk |
|---|---|---|---|---|---|
| IMG-UX-01 | Etapa, agente rail | GuidedPhaseForm, AgentPanel, Header, Sidebar | Desktop | Componente + E2E + captura | Acción duplicada |
| IMG-UX-02 | Etapa + agente activo | GuidedPhaseForm, AgentPanel, TaskChat | Desktop | Componente + E2E + captura | Chat cubre canvas |
| IMG-UX-03 | Dos regiones sin sidebar | TaskWorkspace, GuidedPhaseForm, AgentPanel | Tablet | E2E + scroll + captura | Ancho/scroll insuficiente |
| IMG-UX-04 | Plano móvil Etapa | WorkspacePaneTabs, GuidedPhaseForm, useWorkspaceState | Mobile | E2E + campos + captura | Pérdida de contenido/estado |
| IMG-UX-05 | Bloqueo recuperable | workspace-presentation, EvaluationFeedback, StageFieldIssues | Desktop | Unitario + componente + E2E + captura | Avance contra gate |
| IMG-UX-06 | Resumen 4/4 | CompletionSummary, TaskWorkspace, page | Desktop | Unitario + componente + E2E + captura | Escritura/registro duplicado |

Cada prueba e implementación de `tasks.md` citará `AC-*`, `FR-*` e
`IMG-UX-*`. La captura final correspondiente se llamará
`ACTUAL-IMG-UX-*`.

## Implementation phases

1. **Setup visual y fixtures**: ledger, fixture determinista y validador de
   referencias canónicas.
2. **Foundation**: proyecciones puras y continuidad del estado presentacional.
3. **US1**: canvas de etapa completo y composición responsive stage-first.
4. **US2**: agente estructural, tabs móviles y continuidad del chat.
5. **US3**: acción contextual completa, bloqueos inline y eliminación de
   acciones duplicadas.
6. **US4**: resumen completado de solo lectura y retorno.
7. **Visual validation**: capturas `ACTUAL-*`, comparación, accesibilidad,
   regresiones, gates y revisión independiente.

## Verification Strategy

### Unit and pure-state tests

- Tabla completa del resolver de acción, incluidos límites y gates rechazados.
- Proyección de issues y resumen sin mutar tarea ni registros.
- Estado de workspace válido/antiguo/inválido, aislamiento por tarea, reset y
  cambios de plano/breakpoint.

### Component tests

- Canvas con todos los campos de cada fase, cinco campos prioritarios de fase
  1, sección `Contexto y confirmación`, progreso, guardado y CTA única.
- Agente rail/panel, aria-expanded, tab order, borrador y propuestas.
- Bloqueo global + errores próximos + recuperación.
- Resumen parcial/completo con precedencia definida, deduplicación y navegación
  sin escritura.

### End-to-end tests

- Los seis estados contractuales en sus viewports.
- Pointer, teclado, Escape, retorno de foco, scroll independiente y resize.
- Respuesta tardía al cambiar tarea/etapa.
- Guardado/evaluación fallidos con conservación y reintento.
- Finalización/reload sin duplicados.
- Ubicación única de `Nueva tarea`, `Biblioteca`, `Referencias` y `Ajustes`
  en navegación primaria/secundaria, sin copias en header, agente o lienzo.
- 320 px y zoom al 200 %.

### Visual evidence

- Capturar `ACTUAL-IMG-UX-01` a `ACTUAL-IMG-UX-06`.
- Validar manifest/ruta/resolución con
  `scripts/verify-workspace-visual-contract.mjs`.
- Clasificar cada diferencia según
  `contracts/visual-acceptance.md`.
- Cero diferencias críticas/altas pendientes para cierre.

### Regression and aggregate gates

```bash
npm run verify
TEST_BASE_URL=http://127.0.0.1:3005 npm run verify:e2e
npm run structure:check
npm run graph:check
```

E2E se ejecuta contra un único servidor inspeccionado; no se reutilizan
resultados de procesos o checkouts anteriores.

## Risk matrix

| Risk | Mitigation | Evidence |
|---|---|---|
| Doble fuente de verdad para avance | Resolver puro consume gate existente | Tests de tabla y regresión de `task-rules` |
| Pérdida de borrador/scroll al alternar | Conservar instancias y estado vigente | Componente + E2E resize/tabs |
| Respuesta tardía aplicada a otro contexto | Mantener tarea/etapa/revisión en request | Regresión conversacional |
| Agente intercepta canvas | Grid estructural y detección E2E de solape | Capturas + hit targets |
| Móvil omite campos | Fixture común y assertions de los cinco campos | IMG-UX-04 |
| Finalización o registros duplicados | Resumen read-only y reload test | IMG-UX-06 |
| Raster tratado como evidencia suficiente | Contrato semántico + teclado/contraste | Ledger visual |
| Worktree contiene cambios ajenos | Diffs acotados y revisión sensible | Cierre independiente |

## Rollback and recovery

- Los cambios de presentación pueden revertirse por componentes sin migración.
- El modelo y almacenamiento permanecen compatibles con la UI anterior.
- Un fallo de guardado/evaluación conserva el estado editable y ofrece
  reintento.
- El feature no autoriza eliminar `/legacy`, fixtures o rutas existentes.

## Complexity Tracking

No hay violaciones constitucionales que requieran justificación.
