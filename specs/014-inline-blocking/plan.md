# Implementation Plan: Estado de bloqueo con errores inline y recuperación

**Branch**: `codex/014-inline-blocking` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-inline-blocking/spec.md`

## Summary

Proyectar los `gateReasons` no vacíos de la evaluación vigente que requiere
ajustes como un estado de recuperación coordinado: banner superior, correcciones
inline dentro de los bloques causantes, chip `Evaluación requiere ajustes`, una
única primaria `Reevaluar etapa` y badge de correcciones en rail/header del
agente. La proyección se resolverá en `workspace-presentation.ts` mediante un
catálogo exacto motivo→campo; `GuidedPhaseForm` distribuirá el mismo conjunto a
resumen y campos; `TaskWorkspace` derivará conteo y foco; `AgentPanel` solo lo
presentará. No se persiste estado derivado ni se modifican gates, backend,
pipeline, schema, formulario base o estructura del agente.

La entrega es frontend-only y test-first. Capa A demuestra primero el rojo de
mapeo, banner, asociación, foco, primaria, badge, limpieza, desfase y fallo;
Capa B valida IMG-UX-05 en cuatro viewports; Capa C registra ACTUAL frente a la
referencia. Capturar una imagen no aprueba una baseline: la aceptación visual
permanece `HUMAN_DECISION_REQUIRED` hasta decisión explícita.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5, Nuxt 4.5, Node ESM

**Primary Dependencies**: componentes Vue existentes; `@vue/test-utils` y
Vitest 4.1 para Capa A; Playwright 1.62 y `@axe-core/playwright` 4.12 para Capa
B. Sin dependencias nuevas.

**Storage**: sin cambios. Evaluaciones y mensajes continúan en la tarea; el
estado expandido/borrador/ancla del agente continúa en `useWorkspaceState`. El
conjunto y conteo de correcciones son proyecciones efímeras, nunca persistidas.

**Testing**: Vitest de presentación y componentes; regresión de reglas y
orquestación; Playwright funcional/visual serial; geometría, proximidad DOM,
overflow, foco y axe; comparación documental C.

**Target Platform**: navegadores en 1440×900, 1024×768, 390×844 y 320×667. En
desktop/tablet se conserva stage+agent estructural; en móvil se reutilizan los
tabs existentes.

**Project Type**: aplicación web Nuxt monolítica, cambio solo frontend.

**Performance Goals**: derivación lineal sobre los pocos `gateReasons` de la
evaluación visible; actualización en el mismo ciclo de render; foco al agente
sin navegación o solicitud de red adicional.

**Constraints**: TDD estricto; coincidencia exacta, sin inferencia textual;
errores dentro del bloque causante; una sola primaria; conteos 0/1/N/dos
dígitos; cero overlay, solape, overflow horizontal o violación axe aplicable;
sin cambios a reglas de dominio, persistencia, backend, estructura 012/013 o
navegación 015; mockup no equivale a baseline aprobada.

**Scale/Scope**: helper presentacional, formulario guiado, cuatro componentes
de fase existentes, bloque textual, resumen, panel/agente y orquestador; pruebas
unitarias afectadas, un fixture E2E y el escenario visual IMG-UX-05 × cuatro
viewports; cuatro candidatas ACTUAL y una comparación documental.

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1 design.*

- [x] **Test-first delivery**: cada bloque empieza con happy path, límites,
      inválidos, fallo/recuperación y regresiones; el rojo debe fallar por
      comportamiento 014 ausente, no por fixture o entorno.
- [x] **Data safety and compatibility**: no hay migración, schema o escritura
      nueva; el badge y las correcciones se derivan de datos autoritativos.
- [x] **Feature ownership and boundaries**: presentación deriva/mapea;
      formulario distribuye; campos renderizan; workspace coordina; agente
      presenta. Dominio, transporte, 012, 013 y 015 permanecen intactos.
- [x] **Operational simplicity**: ningún runtime, proveedor, store, servicio,
      cache, base o dependencia nueva; Playwright usa un único servidor serial.
- [x] **Fresh architecture evidence**: Graphify identificó `AgentPanel`,
      `EvaluationFeedback`, `StageFieldIssues`, `fieldIdMap` y
      `resolveContextualPrimaryAction`; cada relación fue verificada en fuente.
- [x] **Quality gates**: unitarias, regresión, typecheck, E2E, visual, axe,
      evidencia, revisión independiente, Graphify y diff sensible.

**Post-design re-check**: aprobado sin excepciones. No requiere Complexity Tracking.

## Prerequisite Gate

Antes del primer rojo de producto:

1. La solicitud actual autoriza plan y tareas, no implementación. El inicio de
   producto requiere orden explícita; hasta entonces T001 queda
   `HUMAN_DECISION_REQUIRED`.
2. La rama debe ser `codex/014-inline-blocking`, con upstream homónimo; no se
   implementa ni publica directamente en `main`.
3. Las specs 010–013 deben estar presentes y el worktree mixto clasificarse.
   Cambios ajenos, `graphify-out/`, caches y SQLite local se excluyen del commit.
4. Se inventarían y hashean las 24 baselines visuales existentes antes de tocar
   UI. No se ejecuta `--update-snapshots` antes del gate humano.
5. E2E/visual usan un único `TEST_BASE_URL` verificado contra este checkout y
   `--workers=1`, porque las suites escriben almacenamiento compartido.

Si falta un prerrequisito, se registra `HUMAN_DECISION_REQUIRED` y no se marcan
tareas posteriores.

## Verification and Evidence Plan

| Layer | Required evidence | Completion condition |
|-------|-------------------|----------------------|
| Capa A — derivación | Rojo/verde de catálogo exacto, vigencia, deduplicación, desconocidos, vacíos y exclusión de weaknesses/recommendations | Comando, fecha, conteo, exit code y causa del rojo/verde |
| Capa A — UI | Rojo/verde de banner, lista, singular/plural, inline dentro del campo, asociación ARIA, foco, primaria, badges 0/1/N/10 y limpieza | Suites enfocadas verdes sin debilitar aserciones |
| State regression | Desfase, fallo inicial, fallo durante recuperación, respuesta tardía, edición local y tarea completada | Ningún estado no vigente crea correcciones; las previas sobreviven al fallo hasta éxito |
| Functional E2E | Flujo bloqueado→agente→edición→reevaluación, desktop/tablet/móvil, una primaria y conservación de borrador | Suite serial verde con storage resembrado por caso |
| Capa B | Modo `contract` para IMG-UX-05 × cuatro viewports: proximidad, geometría, foco, primaria, overflow, solapes y axe | Los cuatro estados completan todos los gates sin depender del pixel diff |
| Evidence capture | Modo `evidence`, `--grep IMG-UX-05`, estabilidad/máscaras y sin `toHaveScreenshot` | Cuatro ACTUAL presentes; ninguna baseline alterada |
| Capa C | ACTUAL vs IMG-UX-05 por jerarquía, contenido, geometría, interacción, responsive y accesibilidad | Toda diferencia clasificada con severidad/owner; decisión humana explícita |
| Human gate | Revisión de cuatro ACTUAL; posterior corrida global detecta colaterales 01/02/03 | Aprobación explícita, cero defectos de alcance y baseline versionada intencionalmente |
| Closure | Focused, affected, typecheck, `verify:e2e`, visual global, `npm run verify`, Graphify, revisión y diff | Evidencia reproducible sincronizada; pendientes humanos siguen abiertos |

## Project Structure

### Documentation (this feature)

```text
specs/014-inline-blocking/
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
├── implementation-evidence.md       # se crea al iniciar implementación
└── evidence/
    ├── actual/                       # cuatro candidatas IMG-UX-05
    └── visual-comparison.md
```

### Source Code (repository root)

```text
app/features/tasks/components/
├── workspace-presentation.ts         # catálogo exacto y recovery view model
├── workspace-presentation.test.ts
├── EvaluationFeedback.vue            # chip/estado sin lista genérica duplicada
├── EvaluationFeedback.test.ts
├── StageFieldIssues.vue               # banner, conteo, lista y enlace al agente
├── StageFieldIssues.test.ts
├── StageTextField.vue                 # mensajes inline y relación ARIA
├── StageTextField.test.ts
├── GuidedPhaseForm.vue                # distribución por campo y evento de foco
├── GuidedPhaseForm.test.ts
├── OrientationPhase.vue               # Análisis y Criterio de éxito
├── GuidancePhase.vue                  # soporte de campos mapeados existente
├── ExecutionPhase.vue                 # soporte de campos mapeados existente
├── ReviewPhase.vue                    # soporte de campos mapeados existente
├── AgentPanel.vue                     # badge de correcciones rail/header y foco
├── AgentPanel.test.ts
├── TaskWorkspace.vue                  # conteo, expansión/pane móvil y foco
└── TaskWorkspace.test.ts

tests/
├── fixtures/tasks/stage-agent-workspace.ts
└── e2e/
    ├── stage-agent-workspace.spec.ts
    └── visual/stage-agent-workspace.visual.spec.ts
```

**Structure Decision**: extender componentes existentes. La proyección 014 se
construye una vez en `workspace-presentation.ts` y fluye hacia resumen, campos y
badge; no se recalcula con fuentes distintas. `StageFieldIssues` deja de ser una
tarjeta genérica y pasa a ser el banner. `StageTextField` y los contenedores de
campos no textuales reciben mensajes ya agrupados y los renderizan dentro del
bloque existente. `TaskWorkspace` reutiliza la preferencia/pane móvil de 013
para abrir y enfocar el agente. No se crea store, endpoint o schema.

La integración de las cuatro fases se limita a las asociaciones exactas que ya
existen en `GATE_REASON_FIELD_MAP`: no añade motivos, campos, controles ni reglas
de 012. Los criterios obligatorios de IMG-UX-05 ejercitan Análisis y Criterio de
éxito; las demás fases reciben cobertura de regresión para garantizar FR-004
cuando uno de sus motivos canónicos reconocidos aparezca.

## Design Decisions

Las decisiones D1–D12, alternativas y límites están en
[research.md](research.md). Las centrales son: una sola proyección autoritativa;
catálogo exacto separado de reglas de dominio; preservar correcciones previas
solo cuando una reevaluación falla; errores dentro de su bloque; badge de
correcciones separado del de propuestas; foco estructural con el selector móvil
existente; captura `contract`/`evidence` antes del gate humano.

## Visual Traceability Matrix

| Ref | Scenario | Viewports | Automated contract | Evidence |
|-----|----------|-----------|--------------------|----------|
| IMG-UX-05 | Evaluación vigente con dos correcciones en Análisis/Criterio; agente contraído y expandido | 1440×900, 1024×768, 390×844, 320×667 | banner, proximidad DOM, chip, una primaria, badge, foco, no overlap/overflow, axe | cuatro ACTUAL y `evidence/visual-comparison.md` |

En móvil, el enlace activa el pane `agent` existente; no exige un rail visible ni
añade navegación. En desktop/tablet se comprueban rail/header por separado sin
cambiar la estructura 013.

## Implementation Sequence

1. Cerrar prerrequisitos, inventario y ledger; no editar producto sin orden.
2. Escribir y ejecutar el rojo del recovery view model completo.
3. Implementar la proyección mínima y dejar verde su suite.
4. Escribir rojo de banner/inline/ARIA; implementar distribución y render.
5. Escribir rojo de foco/primaria/badges; integrar formulario, workspace/agente.
6. Escribir rojo de limpieza, desfase y fallos; completar transición mínima.
7. Actualizar fixture/E2E y completar Capa B en modo `contract`.
8. Capturar ACTUAL en modo `evidence`, completar Capa C y detener en aprobación.
9. Solo tras aprobación, actualizar IMG-UX-05, auditar diff y repetir baseline.
10. Ejecutar regresiones/agregados, Graphify, revisor independiente y cierre.

## Complexity Tracking

No hay violaciones constitucionales ni complejidad excepcional que justificar.
