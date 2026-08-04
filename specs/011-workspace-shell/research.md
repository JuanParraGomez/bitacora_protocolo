# Research: Shell y navegación del workspace

**Date**: 2026-08-04

## D1 — Límite de implementación

**Decision**: rediseñar los componentes compartidos `DashboardSidebar` y
`WorkspaceHeader`; ajustar únicamente el breakpoint/wiring en `TaskWorkspace`
y `pages/index.vue`.

**Rationale**: ambos shells ya comparten esos componentes. Extraer un layout
nuevo movería persistencia, overlays y conversación sin aportar valor al
contrato 011.

**Alternatives considered**: duplicar markup en cada shell (riesgo de drift);
extraer todo el layout (alcance excesivo y mayor riesgo funcional).

## D2 — Preservación de rutas y eventos

**Decision**: mantener intactas props/emits del sidebar y header, las rutas `/`,
`/tasks/:id`, `/tasks/new`, `/library`, `/reference` y el orden
persistir→navegar de las páginas.

**Rationale**: crear/renombrar/seleccionar y los overlays dependen de los dueños
actuales. 011 solo cambia presentación.

**Alternatives considered**: navegar directamente desde el sidebar (rompe
persistencia de selección); mover stores al componente (viola ownership).

## D3 — Iconografía

**Decision**: componente SVG local tipado, sin paquete nuevo. Los SVG son
decorativos y el control con texto aporta el nombre accesible.

**Rationale**: el checkout no tiene una librería de iconos instalada y el
alcance requiere un conjunto pequeño/estable.

**Alternatives considered**: caracteres Unicode (inconsistentes); dependencia
de iconos (coste y riesgo innecesarios); iconos con nombre separado (duplica el
nombre anunciado por lectores de pantalla).

## D4 — Identidad del footer

**Decision**: introducir un view-model presentacional opcional `{ name, email,
avatarUrl?, initials }` en el sidebar, con fallback local no personal y no
persistido cuando no existe identidad real.

**Rationale**: no hay perfil, avatar ni correo en el dominio actual. La spec
prohíbe backend/datos nuevos y exige un footer completo.

**Alternatives considered**: crear perfil/API (fuera de alcance); inventar una
persona real (riesgo de datos falsos); ocultar campos (incumple FR-006).

## D5 — Breakpoints responsive

**Decision**: helper/constantes compartidas: compacto inclusivo a 1024px,
móvil inclusivo a 767px. Actualizar tanto `matchMedia` como CSS.

**Rationale**: el código actual usa `max-width: 1023px`, por lo que 1024×768 no
activa el drawer requerido. Un helper puro permite probar 1025/1024 y 768/767.

**Alternatives considered**: detectar dispositivo (inestable); CSS sin alinear
JS (estados divergentes); mantener 1023 (incumple FR-011).

## D6 — Búsqueda y acciones de proyecto

**Decision**: conservar normalización, filtrado, expansión automática con hits,
trim, límites 120/160 y emisiones actuales. Reubicar controles sin reescribir
su lógica; renombrar queda accesible mediante acción compacta visible en
hover/focus.

**Rationale**: cumple la nueva jerarquía sin alterar datos ni navegación.

**Alternatives considered**: buscador global nuevo o atajo ⌘K funcional (no
requerido; ampliaría comportamiento); eliminar acciones de rename (regresión).

## D7 — Duplicados y acción primaria

**Decision**: cada destino Nueva tarea, Biblioteca y Ajustes tiene una sola
representación en el contexto visible; la navegación/utilidades son secundarias
y no usan `data-primary-action=true`.

**Rationale**: invariante 4 del manifiesto y FR-007/FR-014.

**Alternatives considered**: accesos duplicados desktop/header (ambigüedad y
fallo visual); ocultar duplicados solo con CSS (DOM/accesibilidad duplicados).

## D8 — Infraestructura visual 010

**Decision**: exigir integración desde una revisión aprobada antes de 011. No
copiar el trabajo no versionado del checkout origen ni recrearlo en esta spec.

**Rationale**: existen 24 snapshots/helpers/evidencia, pero no pertenecen a la
rama 011, T022/T023 siguen abiertos y `verify:e2e` tiene fallos.

**Alternatives considered**: copiar archivos (mezcla autoría/alcance); omitir
Capa B (incumple spec); usar mockups como baseline (conceptualmente incorrecto).

## D9 — Ciclo de baselines

**Decision**: baseline versionada primero; UI produce diff rojo; generación de
candidatas solo con `test:visual:update`; aprobación humana antes de aceptar y
repetición verde idempotente. Mockup permanece referencia de Capa C.

**Rationale**: evita aprobar una regresión mediante actualización automática.

**Alternatives considered**: auto-update en CI (riesgoso); comparación pixel a
pixel con mockup IA (no representa el producto ejecutable).

## D10 — Estrategia de pruebas y evidencia

**Decision**: Vitest de estructura/semántica y límites; Playwright serial para
flujos y visual; axe-core + comprobación 3:1 de componentes en normal,
hover/activo. Durante autopilot, evidencia y comparación viven bajo
`.codex-autopilot/`; una tarea humana posterior sincroniza las versiones
saneadas a los artefactos de evidencia exigidos por la spec.

**Rationale**: cada capa prueba una responsabilidad distinta y deja evidencia
reproducible sin confundir estabilidad con aprobación visual.

**Alternatives considered**: escribir directamente dentro del feature durante
autopilot (viola su protección); solo snapshots (no prueba semántica ni rutas);
solo unitarias (no prueba geometría/contraste/render real); solo auditoría
manual (no regresión automatizada).
