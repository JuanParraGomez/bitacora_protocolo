# Research: Adaptación responsive del workspace

## Breakpoints

**Decision**: reutilizar `WORKSPACE_SHELL_BREAKPOINTS` y documentar paridad CSS.

**Rationale**: ya clasifica 1024 como tablet y 767 como móvil, exactamente el contrato solicitado.

**Alternatives considered**: container queries o un composable nuevo; rechazados por duplicar autoridad y ampliar alcance.

## Pane lifecycle and focus

**Decision**: conservar ambos panes montados con `v-show`/`inert` y enfocar el tab activado después del cambio.

**Rationale**: mantiene valores locales y ofrece un ancla accesible determinista.

**Alternatives considered**: `v-if` remount o persistir selectores DOM; rechazados por pérdida de estado y fragilidad.

## Tablet scrolling

**Decision**: el grid contiene dos regiones `min-height:0`; lienzo y contenido del agente declaran su propio overflow.

**Rationale**: garantiza desplazamiento independiente dentro de la altura del shell.

**Alternatives considered**: scroll de página compartido; no cumple IMG-UX-03.

## Zoom and intrinsic sizing

**Decision**: usar tracks `minmax(0, …)`, `min-width: 0`, ancho máximo del
formulario/chat y wrap de controles en los breakpoints existentes.

**Rationale**: el zoom 200% reduce el espacio efectivo y reveló mínimos
intrínsecos en footer, composer y columna del agente; eliminarlos permite reflow
sin introducir otro breakpoint de viewport.

**Alternatives considered**: un breakpoint exclusivo para zoom o esconder
labels; rechazados por duplicar clasificación y perder contenido visible.

## Primary action semantics

**Decision**: contar entre cero y una acción visible con
`[data-primary-action="true"]` en cada estado/pane.

**Rationale**: algunos estados del agente no tienen primaria de etapa; la
invariante contractual es evitar duplicación, no fabricar una acción.

**Alternatives considered**: reclasificar envío del chat como primaria;
rechazado porque cambia el contrato funcional de Spec 013.

## Visual evidence

**Decision**: ejecutar contrato, luego ACTUAL; mantener baseline y aprobación humana separadas.

**Rationale**: preserva la infraestructura 010 y evita aprobar cambios por automatismo.

**Alternatives considered**: actualizar snapshots durante implementación; rechazado por saltarse el gate humano.
