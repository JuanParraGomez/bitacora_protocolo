# Implementation Plan: Agente como rail contraíble con chat

**Branch**: `codex/013-agent-rail-chat` | **Date**: 2026-08-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-agent-rail-chat/spec.md`

## Summary

Recomponer el agente existente como una región estructural de dos estados. En
escritorio y tablet, `AgentPanel` será un rail de máximo `7rem`/12 % cuando esté
contraído y una columna hermana del lienzo cuando esté expandido. `TaskChat`
presentará identidad, hora, avatar, propuestas completas y compositor; el
conteo pendiente se derivará en `TaskWorkspace` y la preferencia seguirá en
`useWorkspaceState`. No se crea store, modelo persistente, servicio ni pipeline.

La entrega es frontend-only y test-first. Capa A cubre componentes, estado y
decisiones; Capa B valida IMG-UX-01/02 en cuatro viewports, con IMG-UX-03 como
contrato tablet; Capa C documenta diferencias. Capturar no aprueba: el cierre
permanece `HUMAN_DECISION_REQUIRED` hasta ocho candidatas aprobadas, cero
defectos de alcance y baselines versionadas intencionalmente.

## Technical Context

**Language/Version**: TypeScript 5.9, Vue 3.5, Nuxt 4.5, Node ESM

**Primary Dependencies**: Nuxt UI existente (`UChatMessages`, `UChatPrompt`,
`UChatPromptSubmit`); `@vue/test-utils` y Vitest 4.1 para Capa A; Playwright 1.62
y `@axe-core/playwright` 4.12 para Capa B. Sin dependencias nuevas.

**Storage**: sin cambios de esquema. La preferencia expandida por tarea, el
borrador y el último mensaje visible continúan en `useWorkspaceState`; mensajes,
propuestas y decisiones conservan los contratos actuales de tarea.

**Testing**: Vitest de `AgentPanel`, `TaskChat`, `TaskWorkspace` y
`useWorkspaceState`; regresión de reglas del asistente; Playwright funcional y
visual serial; helpers de geometría/captura existentes; axe completo más
aserciones explícitas de teclado, foco y controles deshabilitados; evidencia C.

**Target Platform**: navegadores en 1440×900, 1024×768, 390×844 y 320×667. En
768–1024 se preservan dos regiones; en ≤767 se conserva el selector móvil actual.

**Project Type**: aplicación web Nuxt monolítica, cambio solo frontend.

**Performance Goals**: alternancia sin solicitud de red; conteo pendiente
derivado en el mismo ciclo de render; scroll de lienzo/chat sin mover la región
hermana; sin salto de ancho mayor al cambio contractual rail↔columna.

**Constraints**: TDD estricto; rail ≤7rem y ≤12 %; una sola primaria; mensajes y
propuestas no se duplican; adjunto visible/deshabilitado; cero overlay, solape,
overflow o violación axe; mockups no son baselines; sin backend, dominio,
pipeline, tabs móviles, evaluación o bloqueos nuevos.

**Scale/Scope**: cuatro componentes/composable existentes y sus pruebas; una
suite E2E funcional, una visual y helpers puntuales; ocho candidatas 013 y una
comparación documental contra IMG-UX-01/02/03.

## Constitution Check

*GATE: pass before Phase 0; re-checked after Phase 1 design.*

- [x] **Test-first delivery**: cada historia tiene pruebas completas, rojo por
      comportamiento ausente, cambio mínimo, verde enfocado y regresión antes de
      avanzar. Un fallo de setup/fixture no cuenta como rojo.
- [x] **Data safety and compatibility**: no cambian claves, schemas ni payloads;
      `collapsed` continúa representado por ausencia de preferencia persistida.
- [x] **Feature ownership and boundaries**: `AgentPanel` posee shell/estado
      visual; `TaskChat`, conversación; `TaskWorkspace`, orquestación/conteo;
      `useWorkspaceState`, preferencia por tarea. Reglas de dominio no se mueven.
- [x] **Operational simplicity**: ningún proveedor, runtime, servicio, cache,
      base o dependencia nueva; un servidor y ejecución Playwright serial.
- [x] **Fresh architecture evidence**: Graphify se consultó y los enlaces se
      verificaron en fuente. `graphify update .` y `graph:check` son gates de cierre.
- [x] **Quality gates**: unitarias, reglas, typecheck, E2E, visual, axe, siembras
      negativas, `npm run verify`, revisión independiente y diff sensible.

**Post-design re-check**: aprobado sin excepciones. No requiere Complexity Tracking.

## Prerequisite Gate

Antes del primer rojo de producto:

1. La solicitud actual autoriza `plan.md` y `tasks.md`, no implementación. La
   implementación requiere una orden explícita posterior; hasta entonces T001
   queda en `HUMAN_DECISION_REQUIRED`.
2. La rama activa debe ser `codex/013-agent-rail-chat`, con upstream homónimo y
   ascendencia de 012 verificada; no implementar en `main`.
3. Deben estar presentes la infraestructura visual 010, el shell 011 y el lienzo
   012 versionados. Deudas o cambios mixtos ajenos se registran, no se absorben.
4. Deben inventariarse y hashearse las 24 baselines actuales antes de UI. Ningún
   `--update-snapshots` ocurre sin autorización explícita de captura.
5. E2E y visual usan un único `TEST_BASE_URL` comprobado contra este checkout y
   `--workers=1`, porque comparten claves de almacenamiento.

Si falta un prerrequisito, registrar `HUMAN_DECISION_REQUIRED` y detenerse sin
marcar tareas posteriores.

## Verification and Evidence Plan

| Layer | Required evidence | Completion condition |
|-------|-------------------|----------------------|
| Capa A | Rojo/verde Vitest: rail, header, foco, badge 0/1/N, roles/hora/avatar, orden estable, propuesta completa, accept/edit/reject, edición inválida, compositor/adjunto, persistencia A/B y regresiones | Comando, fecha, conteo, exit code y causa/veredicto por bloque |
| Domain regression | Reglas `applyAssistantUpdates`, contexto/revisión, reject idempotente, tarea completada y respuesta tardía | Suites existentes verdes sin modificar contrato de dominio |
| Functional E2E | Contraer/expandir por tarea, conversación, tres decisiones, badge, borrador/envío/reintento, 1024 con scroll independiente y móvil heredado | Suite serial verde con storage resembrado por caso |
| Capa B | Modo `contract` para IMG-UX-01/02 × cuatro viewports sin snapshot; rail 7rem/12 % solo ≥768, proyección móvil, geometría, primaria, overflow, axe, teclado/foco | Los ocho estados ejecutan todos los gates sin abortar por pixel diff |
| Evidence capture | Modo `evidence` para los mismos ocho estados, con máscaras/estabilidad y sin `toHaveScreenshot` | Ocho ACTUAL presentes; ninguna baseline modificada |
| Capa C | ACTUAL vs IMG-UX-01/02/03 por jerarquía, contenido, geometría, interacción, responsive y accesibilidad | Toda diferencia clasificada y responsable explícito |
| Human gate | Revisión de ocho ACTUAL; corrida global posterior detecta colaterales 03/05 y abre decisión adicional si aparecen | Aprobación explícita, cero defectos de alcance, baselines aceptadas/versionadas |
| Closure | Unit, typecheck, E2E, visual, `npm run verify`, Graphify, revisión independiente y diff sensible | Evidencia real sincronizada; pendientes humanos no se marcan completos |

## Project Structure

### Documentation (this feature)

```text
specs/013-agent-rail-chat/
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
    ├── actual/                       # ocho candidatas aprobables
    └── visual-comparison.md
```

### Source Code (repository root)

```text
app/features/tasks/
├── components/
│   ├── AgentPanel.vue                # rail/header/badge/toggle/foco
│   ├── AgentPanel.test.ts
│   ├── TaskChat.vue                  # mensajes/propuestas/compositor
│   ├── TaskChat.test.ts
│   ├── TaskWorkspace.vue             # conteo y grid rail/columna/tablet
│   └── TaskWorkspace.test.ts
├── composables/
│   ├── useWorkspaceState.ts          # contrato existente; cambio no esperado
│   └── useWorkspaceState.test.ts
└── domain/
    ├── task-assistant.schema.ts       # reutilizado, sin cambio esperado
    ├── task-assistant-rules.ts        # reutilizado, sin cambio esperado
    └── task-assistant-rules.test.ts   # regresión

tests/
├── fixtures/tasks/stage-agent-workspace.ts
└── e2e/
    ├── stage-agent-workspace.spec.ts
    ├── helpers/
    │   ├── visual-capture.ts
    │   ├── visual-capture.test.ts
    │   ├── visual-geometry.ts
    │   └── visual-geometry.test.ts
    └── visual/
        └── stage-agent-workspace.visual.spec.ts
```

**Structure Decision**: recomponer los componentes existentes. El conteo se
deriva en `TaskWorkspace` y se pasa como número a `AgentPanel`; no se persiste.
`TaskChat` conserva su estado local al ocultarse y `useWorkspaceState` sigue
siendo la única fuente de preferencia/borrador/ancla. Crear otro store, modelo o
panel duplicaría contratos y ampliaría el alcance.

## Design Decisions

Las decisiones D1–D12 y alternativas están en [research.md](research.md). Las
centrales son: estado por defecto contraído sin apertura heurística; `v-show`
para conservar estado local; badge derivado de la fase visible; validación de
edición con schema existente; grid contiguo a 1024; móvil intacto; captura
restringida por `--grep`; aprobación humana separada del update.

## Visual Traceability Matrix

| Ref | Contract 013 | Viewport | Evidence | Risk |
|-----|--------------|----------|----------|------|
| IMG-UX-01 | rail ≤7rem/12 %, marca, sparkle, chevron, badge y lienzo recuperado en ≥768; continuidad del pane Etapa en móvil | 1440, 1024, 390, 320 | snapshot + DOM + ancho condicional + axe | placeholder/columna residual |
| IMG-UX-02 | header expandido, ambos roles, propuesta, compositor y una primaria; pane Agente sembrado en móvil | 1440, 1024, 390, 320 | snapshot + DOM + decisiones + geometría + axe | chat compite o queda oculto en móvil |
| IMG-UX-03 | dos columnas y scroll independiente | 1024×768 | comportamiento + cajas/scroll + comparación C | breakpoint apila regiones |
| IMG-UX-05 | badge `1` únicamente, sin importar bloqueo 014 | 1440×900 | DOM/conteo + comparación puntual | expansión accidental de alcance |

IMG-UX-03 guía el comportamiento tablet, pero no crea una novena candidata: la
matriz aprobable de 013 sigue siendo IMG-UX-01/02 × cuatro viewports.

## Risks and Mitigations

- **Apertura automática contradice default**: retirar la heurística y resolver
  solo desde preferencia por tarea; prueba fase 1/mensajes/draft sin preferencia.
- **Desmontar chat pierde edición local**: mantenerlo montado con `v-show`, fuera
  de layout/tab order al contraer; probar borrador, propuesta editada y ancla.
- **Tablet apilada**: separar ≤1024 de ≤767 y conservar `min-height:0`, altura
  contenida y overflow propio; medir scrollTop de ambas regiones.
- **Edición sintáctica pero inválida**: validar con schema existente antes de
  emitir; no tocar reglas ni crear nuevo estado de dominio.
- **Badge desincronizado**: derivarlo de propuestas `proposed` filtradas por
  tarea/fase visibles; pruebas 0/1/N, decisiones y cambio de tarea/fase.
- **Valor propuesto truncado**: mostrar completo y permitir wrap; probar texto
  largo sin overflow ni pérdida semántica.
- **Adjunto engañoso**: botón visible, deshabilitado, focus/semántica y explicación
  accesible; sin input, upload o evento nuevo.
- **Pixel diff aborta viewports restantes**: añadir modos `contract|evidence|baseline`;
  `contract` ejecuta todos los gates sin snapshot y `evidence` captura ACTUAL sin
  tocar baselines. Solo `baseline` usa `toHaveScreenshot`.
- **Filtro de evidencia incompleto**: combinar modo `evidence` con
  `--grep IMG-UX-01|IMG-UX-02`; no confiar solo en `VISUAL_EVIDENCE_CASES`.
- **Pane móvil incorrecto**: sembrar `stage` para IMG-UX-01 y `agent` para
  IMG-UX-02; rail/ancho/badge colapsado se miden únicamente en ≥768.
- **Storage compartido**: resembrar cada caso, un servidor y workers seriales.
- **Baseline autoaprobada**: modo `evidence` genera candidatas sin tocar
  snapshots; el update ocurre solo tras decisión humana y antes del versionado.

## Complexity Tracking

Sin violaciones constitucionales.
