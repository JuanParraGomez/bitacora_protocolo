# Implementation Plan: Shell y navegación del workspace

**Branch**: `codex/011-workspace-shell` | **Date**: 2026-08-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-workspace-shell/spec.md`

## Summary

Recomponer únicamente el shell frontend del workspace mediante los componentes
compartidos existentes: transformar `DashboardSidebar.vue` en una navegación
vertical con iconos, búsqueda, proyectos-carpetas y footer de identidad;
transformar `WorkspaceHeader.vue` en breadcrumb + chip de etapa + subtítulo; y
ajustar el breakpoint compartido para que 1024×768 use drawer cerrado y móvil
muestre hamburguesa, logo y breadcrumb. La persistencia, eventos, rutas y datos
continúan bajo sus dueños actuales (`useTaskIndex`, `useWorkspaceState`,
`pages/index.vue` y `pages/tasks/[id].vue`).

La implementación será estrictamente test-first: Capa A Vitest roja antes del
cambio; Capa B Playwright sobre la infraestructura de la spec 010, con
baselines aprobadas/versionadas, geometría, acción primaria y contraste como
gates; y Capa C documental ACTUAL vs IMG-UX-01/02/05/06. La infraestructura
010 no está versionada en esta rama al crear el plan, por lo que su integración
aprobada es un prerrequisito bloqueante, no trabajo que 011 pueda recrear o
absorber silenciosamente.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5, Nuxt 4.5, Node ESM

**Primary Dependencies**: Nuxt/Vue existentes; `@vue/test-utils` y Vitest para
Capa A; Playwright 1.62 y `@axe-core/playwright` de la spec 010 para Capa B.
No se añade una librería de iconos: los iconos del shell serán SVG locales
presentacionales con color heredado.

**Storage**: sin cambios. Se conservan SQLite/API de almacenamiento, claves
`STORAGE_KEYS`, localStorage de presentación y contratos actuales.

**Testing**: Vitest de componentes y helper responsive; Playwright serial
(`workers: 1`) para navegación/rutas y 24 combinaciones visuales; axe-core y
auditoría de componentes para 4.5:1/3:1; comparación documental Capa C.

**Target Platform**: navegadores de escritorio, tablet 1024×768, móvil
390×844 y móvil estrecho 320×667.

**Project Type**: aplicación web Nuxt monolítica, cambio solo frontend.

**Performance Goals**: interacción del shell sin salto de layout observable;
búsqueda y expansión continúan siendo locales; suite visual completa menor a
10 minutos en ejecución serial, heredando el objetivo de la spec 010.

**Constraints**: TDD estricto; una sola acción primaria; cero superposiciones;
contraste AA; no cambiar backend, rutas, esquemas, almacenamiento ni contenido
del lienzo/agente/bloqueo/cierre; mockup nunca es baseline; ninguna baseline se
actualiza sin flag y aprobación explícitos.

**Scale/Scope**: 2 componentes compartidos, 1 helper presentacional responsive,
2 dueños de shell que consumen el breakpoint, pruebas Vitest enfocadas, suites
E2E existentes y 4 referencias visuales principales × 4 viewports.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Test-first delivery**: `tasks.md` separará rojos de sidebar, header,
      responsive y Capa B antes de implementar; cada verde incluye regresión.
- [x] **Data safety and compatibility**: no se modifica persistencia, claves,
      modelos, migraciones ni orden persistir→navegar.
- [x] **Feature ownership and boundaries**: presentación en componentes de
      tareas; rutas/persistencia siguen en páginas y composables existentes;
      no se crean importaciones servidor→cliente ni cruces privados nuevos.
- [x] **Operational simplicity**: sin runtime, proveedor, base, cache o servicio
      adicional; SVG local en vez de dependencia de iconos.
- [x] **Fresh architecture evidence**: Graphify consultado y relaciones
      verificadas en fuente; `graphify update .` se reserva para el cierre.
- [x] **Quality gates**: Vitest enfocado, regresiones de navegación, typecheck,
      `verify:e2e`, `test:visual`, revisión independiente y diff sensible.

**Post-design re-check**: aprobado sin excepciones. No requiere Complexity Tracking.

## Prerequisite Gate: spec 010

Antes de escribir pruebas o código de producto de 011 deben existir en esta
rama, provenientes de una revisión aprobada y trazable de la spec 010:

- `tests/e2e/helpers/visual-{scenarios,capture,evidence,geometry}.ts` y sus tests;
- `tests/e2e/visual/stage-agent-workspace.visual.spec.ts`;
- exactamente 24 snapshots canónicos (6 escenarios × 4 viewports);
- `tests/e2e/README.md`, scripts `test:visual`/`test:visual:update` y
  `@axe-core/playwright`;
- fixture visual aditivo y evidencia del ciclo rojo→update explícito→verde.

Al 2026-08-04 esos artefactos existen únicamente como cambios no versionados en
el checkout `codex/010-visual-testing-infra`; T022/T023 siguen abiertos y
`verify:e2e` no está verde. No deben copiarse ni atribuirse a 011 sin una
revisión/commit aprobado. Si el gate no se satisface, `tasks.md` exige
`HUMAN_DECISION_REQUIRED` antes de implementar.

La spec 011 permanece en estado `Draft` durante esta planificación. Antes de
invocar `speckit-autopilot ejecutar`, el usuario debe aprobar explícitamente el
contrato y autorizar la revisión exacta de 010 que se integrará; el director no
puede promover el estado ni ejecutar Git por inferencia.

## Verification and Evidence Plan

**Operational evidence**: `.codex-autopilot/evidence/` y
`.codex-autopilot/reports/` durante ejecución. Tras finalizar, una tarea humana
autorizada materializa la evidencia saneada en
`specs/011-workspace-shell/implementation-evidence.md` y
`specs/011-workspace-shell/evidence/visual-comparison.md`.

| Layer | Required evidence | Completion condition |
|-------|-------------------|----------------------|
| Capa A | Vitest rojo esperado para sidebar, header y breakpoint; verde tras cambio mínimo; happy, boundary, invalid, recovery y regression | Comando, fecha, exit code y veredicto por tarea |
| Functional E2E | Búsqueda, creación/renombrado, selección, rutas, Escape/Tab/retorno de foco a 1024 y 390 | Suites seriales verdes sin cambiar datos/rutas |
| Capa B | Snapshot diff rojo contra baseline aprobada; geometría cero; una primaria; destinos únicos; contraste 4.5:1/3:1 en normal/hover/activo | 4 refs × 4 viewports verdes; update solo tras aprobación humana |
| Capa C | ACTUAL vs IMG-UX-01/02/05/06 por navegación/header | Cada diferencia clasificada aprobada/pendiente/defecto |
| Closure | Unit, typecheck, `verify:e2e`, `test:visual`, `npm run verify`, revisión independiente, diff sensible, Graphify | Alcance, conteos, exit codes y pendientes humanos registrados |

## Project Structure

### Documentation (this feature)

```text
specs/011-workspace-shell/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── visual-acceptance.md
├── checklists/
│   └── requirements.md
├── tasks.md
├── implementation-evidence.md       # sincronización humana post-autopilot
└── evidence/
    ├── actual/                       # sincronización humana post-autopilot
    └── visual-comparison.md          # sincronización humana post-autopilot
```

```text
.codex-autopilot/
├── state.json
├── evidence/                         # evidencia por tarea/fase y capturas
└── reports/                          # comparación visual y cierre saneado
```

### Source Code (repository root)

```text
app/features/tasks/components/
├── DashboardSidebar.vue             # composición visual, búsqueda y proyectos
├── DashboardSidebar.test.ts         # Capa A sidebar
├── WorkspaceHeader.vue              # breadcrumb/chip/mobile header
├── WorkspaceHeader.test.ts          # Capa A header
├── WorkspaceShellIcon.vue           # SVG local tipado/presentacional
├── workspace-shell-presentation.ts  # breakpoints/modo sin estado persistido
└── workspace-shell-presentation.test.ts

app/features/tasks/components/TaskWorkspace.vue  # consume breakpoint; conserva eventos
pages/index.vue                                  # consume breakpoint; conserva rutas
pages/tasks/[id].vue                             # sin cambio esperado; regresión solamente

tests/e2e/
├── conversational-workspace.spec.ts  # búsqueda, create/rename, selección/rutas
├── workspace-ux-audit.spec.ts        # drawer, foco, hit targets
├── workspace-overlays.spec.ts        # no regresión overlays/ajustes
└── visual/
    └── stage-agent-workspace.visual.spec.ts # Capa B heredada de 010
```

**Structure Decision**: se modifican los dos componentes compartidos y solo el
wiring de breakpoint duplicado en los dos dueños de shell. No se extrae un nuevo
layout contenedor porque implicaría mover lógica de persistencia, overlays y
conversación; la reutilización ya ocurre en `DashboardSidebar` y
`WorkspaceHeader`. El helper puro evita que 1024 quede fuera del drawer sin
introducir estado nuevo.

## Design Decisions

Las decisiones D1–D10 y alternativas están detalladas en [research.md](research.md).
Las principales son: SVG local sin dependencia, identidad de usuario como
view-model presentacional no persistido, breakpoint compacto inclusivo en
1024px, eventos y rutas intactos, y gate estricto sobre la infraestructura 010.

## Visual Traceability Matrix

| Ref | Región 011 | Componente probable | Viewport/estado | Verificación | Riesgo principal |
|-----|------------|---------------------|-----------------|--------------|------------------|
| IMG-UX-01 | sidebar + header | DashboardSidebar / WorkspaceHeader | 1440×900, etapa 1, agente contraído | snapshot, jerarquía, primaria, contraste | formulario fuera de alcance no debe cambiar |
| IMG-UX-02 | sidebar + header | DashboardSidebar / WorkspaceHeader | 1440×900, agente expandido | cero solape con columna agente | sidebar demasiado ancho comprime lienzo |
| IMG-UX-05 | sidebar + header | DashboardSidebar / WorkspaceHeader | 1440×900, bloqueo | destino único + contraste + primaria | no alterar mensajes/bloqueos de spec 014 |
| IMG-UX-06 | sidebar + header | DashboardSidebar / WorkspaceHeader | 1440×900, completada | breadcrumb, chip 4/4, no duplicar Biblioteca | no alterar cierre de spec 016 |
| IMG-UX-03 | soporte responsive | TaskWorkspace / index / Header | 1024×768, drawer cerrado | drawer ausente al cargar, hamburguesa, foco | límite actual 1023 deja 1024 en desktop |
| IMG-UX-04 | soporte responsive | Header / wrappers | 390×844, header compacto | hamburguesa + logo + breadcrumb, cero overflow | nombres largos y safe areas |

## Risks and Mitigations

- **Dependencia 010 no publicada**: aprobación humana de la revisión exacta y
  autorización Git antes de cualquier RED/código.
- **Spec 011 en Draft**: no ejecutar autopilot hasta aprobación explícita y
  actualización controlada del estado fuera de la ejecución protegida.
- **Divergencia index/tarea**: constantes/helper compartido y las mismas pruebas
  de drawer contra ambos contextos; no mover persistencia.
- **Regresiones de navegación**: conservar emisiones y orden persistir→navigate;
  ejecutar suites existentes de create/rename/select/search.
- **Identidad inexistente en dominio**: prop presentacional con fallback local
  no personal y no persistido; no crear API ni dato de usuario.
- **Iconos inaccesibles o redundantes**: iconos decorativos `aria-hidden`; el
  link/botón conserva texto y nombre accesible inequívoco.
- **Duplicidad de IDs/acciones**: una sola instancia visible por breakpoint y
  aserciones de conteo en Vitest/Playwright.
- **Snapshot ≠ mockup**: baseline solo captura regresión; aceptación visual se
  registra aparte en Capa C.

## Complexity Tracking

Sin violaciones constitucionales.
