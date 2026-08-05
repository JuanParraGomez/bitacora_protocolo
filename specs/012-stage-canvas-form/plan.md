# Implementation Plan: Lienzo de etapa como formulario protagonista

**Branch**: `codex/012-stage-canvas-form` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-stage-canvas-form/spec.md`

## Summary

Convertir el formulario existente en el primer contenido del lienzo activo y
concentrar en `GuidedPhaseForm` un único título, stepper 1–4, estado de borrador
y footer. Los cuatro componentes de fase conservan sus datos y operaciones,
pero sus campos textuales adoptan una presentación común con icono, etiqueta y
contador informativo `N/500`; fase 1 mantiene sus cinco campos prioritarios antes
de `Contexto y confirmación`. `TaskWorkspace` elimina el panel meta duplicado y
coloca cualquier resumen complementario después del formulario.

La política de edición será manual y uniforme: cada control editable emite
`dirty`, ninguna fase guarda al escribir y el botón existente reutiliza el
pipeline de persistencia. `Cambios sin guardar` desaparece solo tras éxito; la
vigencia de evaluación sigue separada. La entrega es frontend-only, test-first
y preserva dominio, rutas, payloads, almacenamiento y eventos públicos.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5, Nuxt 4.5, Node ESM

**Primary Dependencies**: Nuxt/Vue existentes; `@vue/test-utils` y Vitest 4.1
para Capa A; Playwright 1.62 y `@axe-core/playwright` 4.12 para Capa B. SVG
local decorativo; ninguna dependencia nueva.

**Storage**: sin cambios. SQLite/API, modelos de tarea, payloads de guardado y
estado de evaluación conservan sus contratos actuales.

**Testing**: Vitest parametrizado para las cuatro fases y límites 0/499/500/>500;
Playwright serial para flujo editar→guardar, geometría y axe; suite visual
existente de spec 010; comparación documental Capa C.

**Target Platform**: navegadores en 1440×900, 1024×768, 390×844, 320×667 y
zoom 200 %.

**Project Type**: aplicación web Nuxt monolítica, cambio solo frontend.

**Performance Goals**: contador sincronizado en el mismo ciclo de render; cero
guardados al teclear; sin saltos de layout ni superposiciones; suite visual
serial dentro del presupuesto existente de spec 010.

**Constraints**: TDD estricto; una sola primaria; contador no restrictivo;
manual save uniforme; contraste 4.5:1/3:1; mockups no son baselines; no cambiar
agente, errores inline, responsive estructural, cierre, backend ni dominio.

**Scale/Scope**: `TaskWorkspace`, `GuidedPhaseForm`, helper presentacional y
cuatro componentes de fase; pruebas unitarias asociadas, dos suites E2E
existentes, cinco capturas contractuales y evidencia Capa C.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Test-first delivery**: `tasks.md` exige prueba completa y rojo esperado
      antes de cada bloque de producto, luego verde enfocado y regresión.
- [x] **Data safety and compatibility**: `N/500` no añade `maxlength`; ningún
      valor se trunca y no cambian esquemas, payloads ni persistencia.
- [x] **Feature ownership and boundaries**: fases poseen valores/edición,
      `GuidedPhaseForm` composición y estado visual, página/pipeline persisten.
- [x] **Operational simplicity**: no hay servicio, cache, runtime o librería
      nueva; el icono es SVG local y el view-model es derivado.
- [x] **Fresh architecture evidence**: Graphify fue consultado y los enlaces
      críticos se verificaron en fuente; `graphify update .` queda para cierre.
- [x] **Quality gates**: Vitest, E2E serial, typecheck, visual, axe, revisión
      independiente, diff sensible y evidencia con comando/conteo/exit code.

**Post-design re-check**: aprobado sin excepciones. No requiere Complexity Tracking.

## Prerequisite Gate

Antes del primer rojo de producto:

1. La spec 012 debe recibir aprobación explícita; mientras figure `Draft`, la
   planificación no autoriza implementación.
2. La rama debe contener la infraestructura visual 010 versionada en `68498d5`
   y el shell 011 de `4e0fbff`, con exactamente los artefactos esperados.
3. La deuda histórica T007/T008 de 011 se registra como ajena a 012: no se
   reescribe ni se presenta como evidencia de esta feature.
4. Deben inventariarse y hashearse las baselines relevantes antes de cambiar UI.
   Ningún update se ejecuta ni versiona sin aprobación humana del diff.
5. Se usa un único servidor Nuxt y Playwright serial porque las suites comparten
   almacenamiento.

Si falta un prerrequisito, registrar `HUMAN_DECISION_REQUIRED` y detener la
implementación sin marcar tareas posteriores.

## Verification and Evidence Plan

| Layer | Required evidence | Completion condition |
|-------|-------------------|----------------------|
| Capa A | Rojo y verde Vitest por fases 1–4: orden, icono/label, 0/499/500/>500, stepper, meta/Atrás ausentes, contexto, una primaria y guardado | Comando, fecha, conteo, exit code y causa/veredicto |
| Functional E2E | Cada fase: escribir→dirty; éxito→limpio; fallo→valores/reintento; sin autosave | Suite serial verde y solicitudes de guardado contadas |
| Capa B | IMG-UX-01 × cuatro viewports e IMG-UX-04 móvil canónico; geometría, primaria y axe | Cero solapes/violaciones; candidata aprobada antes de baseline |
| Capa C | ACTUAL vs IMG-UX-01/04 por jerarquía, contenido, geometría, interacción, responsive y accesibilidad | Cada diferencia `aprobada`, `pendiente` o `defecto` |
| Closure | Unit, typecheck, E2E, visual, `npm run verify`, Graphify, revisión independiente y diff sensible | Evidencia real sincronizada; pendientes humanos explícitos |

## Project Structure

### Documentation (this feature)

```text
specs/012-stage-canvas-form/
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
├── implementation-evidence.md       # durante implementación
└── evidence/
    ├── actual/                       # capturas aprobadas/saneadas
    └── visual-comparison.md
```

### Source Code (repository root)

```text
app/features/tasks/components/
├── TaskWorkspace.vue                # elimina meta; formulario antes del resumen
├── TaskWorkspace.test.ts
├── GuidedPhaseForm.vue              # título, stepper, estado y footer únicos
├── GuidedPhaseForm.test.ts
├── guided-phase-form.ts             # textos/view-model de presentación
├── guided-phase-form.test.ts
├── StageTextField.vue               # label, SVG, control y contador comunes
├── StageTextField.test.ts
├── OrientationPhase.vue             # cinco prioritarios + contexto
├── GuidancePhase.vue                # elimina autosave; dirty manual
├── ExecutionPhase.vue               # dirty uniforme, datos intactos
└── ReviewPhase.vue                  # dirty uniforme, datos intactos

tests/e2e/
├── stage-agent-workspace.spec.ts
├── helpers/
│   ├── visual-capture.ts             # root/casos de evidencia configurables
│   ├── visual-evidence.ts
│   └── visual-geometry.ts
└── visual/
    └── stage-agent-workspace.visual.spec.ts
```

**Structure Decision**: `StageTextField` estandariza solo controles textuales y
emite el valor sin conocer la tarea. Los componentes de fase adaptan arrays y
estructuras existentes. No se extrae otro canvas, store o layout: hacerlo
duplicaría orquestación y entraría en specs 013/015.

## Design Decisions

Las decisiones y alternativas D1–D10 están en [research.md](research.md). Las
centrales son: formulario primero, campo textual presentacional común, dirty
emitido por todas las fases sin autosave, persistencia/evaluación separadas y
un solo árbol semántico cuyo CSS se adapta en móvil.

## Visual Traceability Matrix

| Ref | Contrato 012 | Viewport | Evidencia | Riesgo |
|-----|--------------|----------|-----------|--------|
| IMG-UX-01 | título, stepper, formulario protagonista, estado y footer | 1440×900 | snapshot + DOM + geometría + axe | meta/resumen desplazan el formulario |
| IMG-UX-01 | misma jerarquía sin colisiones | 1024×768 | snapshot + geometría + axe | footer/agente comprimen el lienzo |
| IMG-UX-01 | continuidad funcional | 390×844 | snapshot + flujo + orden | acciones cubren campos |
| IMG-UX-01 | límite estrecho | 320×667 | snapshot + overflow + axe | contador/stepper desbordan |
| IMG-UX-04 | flujo móvil canónico y footer | 390×844 | captura ACTUAL + comparación Capa C | divergencia de contenido/orden |

## Risks and Mitigations

- **Dirty local desconectado**: cada fase emite explícitamente un evento de
  edición común —los eventos personalizados Vue no burbujean—;
  pruebas parametrizadas verifican los cuatro casos y cambio de tarea.
- **Autosave residual en fase 2**: una prueba cuenta emisiones/solicitudes antes
  de retirar el `save` del watcher; evaluación y operaciones explícitas se mantienen.
- **Contador cambia datos**: `StageTextField` calcula longitud y nunca usa
  `maxlength`; fixture >500 comprueba preservación.
- **Conversión masiva de controles**: adaptar por fase después del rojo, sin
  cambiar claves, arrays, handlers ni orden contractual; regresión por fixture.
- **Resumen complementario compite**: `TaskWorkspace` monta primero formulario
  y después resumen; no se elimina dato ni se altera lógica de evaluación.
- **Responsive invade 015**: mismo DOM y orden; solo estilos locales de campo y
  footer, sin nuevos breakpoints ni tabs/layout global.
- **Axe no prueba todo el contraste**: combinar axe con comprobación explícita
  de colores de estados normal/activo y revisión Capa C.
- **Baseline autoaprobada**: update explícito genera candidata; revisión humana
  precede cualquier commit de snapshots.

## Complexity Tracking

Sin violaciones constitucionales.
