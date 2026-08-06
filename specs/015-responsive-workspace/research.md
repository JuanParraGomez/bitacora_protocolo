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

## Visual evidence

**Decision**: ejecutar contrato, luego ACTUAL; mantener baseline y aprobación humana separadas.

**Rationale**: preserva la infraestructura 010 y evita aprobar cambios por automatismo.

**Alternatives considered**: actualizar snapshots durante implementación; rechazado por saltarse el gate humano.
