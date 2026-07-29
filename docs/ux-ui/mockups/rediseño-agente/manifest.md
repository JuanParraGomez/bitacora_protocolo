# Manifiesto visual: rediseño del workspace con agente

**Estado**: aprobado por el usuario para especificación el 2026-07-28
**Dirección**: lienzo por etapas con agente contraíble
**Generación**: ImageGen integrado, modo `ui-mockup`

Las imágenes de este directorio son referencias de alta fidelidad para el flujo
Spec Kit posterior. Sus IDs son estables. El viewport objetivo describe el
escenario que representan; la resolución raster corresponde al archivo
generado y no reemplaza los criterios responsive que se definirán en la
especificación.

| ID | Archivo | Viewport objetivo | Resolución raster | Estado y contrato principal |
|---|---|---:|---:|---|
| IMG-UX-01 | `img-ux-01-desktop-etapa.png` | 1440 × 900 | 1586 × 992 | Etapa activa, agente contraído, formulario protagonista y una sola acción primaria |
| IMG-UX-02 | `img-ux-02-desktop-agente-activo-v2.png` | 1440 × 900 | 1586 × 992 | Agente expandido como columna estructural, chat y compositor neutro sin cubrir el lienzo |
| IMG-UX-03 | `img-ux-03-tablet-agente-activo-v2.png` | 1024 × 768 | 1448 × 1086 | Navegación en drawer cerrado, lienzo y agente con scroll independiente y una sola acción primaria |
| IMG-UX-04 | `img-ux-04-mobile-etapa-v4.png` | 390 × 844 | 853 × 1844 | Un solo plano móvil, selector Etapa/Agente y los cinco campos completos y consistentes dentro del flujo |
| IMG-UX-05 | `img-ux-05-desktop-bloqueo.png` | 1440 × 900 | 1586 × 992 | Bloqueo recuperable, errores próximos a su causa y única acción primaria Reevaluar etapa |
| IMG-UX-06 | `img-ux-06-desktop-completada-v2.png` | 1440 × 900 | 1586 × 992 | Progreso 4/4, resumen de resultados y única acción principal Volver a tareas |

Las versiones anteriores a las señaladas en la tabla quedan conservadas como
borradores reemplazados y no forman parte del contrato visual.

## Convención de trazabilidad Spec Kit

- `spec.md`: cada escenario, requisito y criterio visual aplicable citará uno o
  más IDs `IMG-UX-*`.
- `plan.md`: una matriz mapeará ID, región, componente probable, breakpoint,
  estado, prueba y riesgo.
- `contracts/visual-acceptance.md`: convertirá cada imagen en reglas observables
  de jerarquía, geometría, interacción, contenido y responsive.
- `tasks.md`: cada prueba e implementación incluirá
  `Refs: FR-XXX, IMG-UX-XX` y una ruta de archivo concreta.
- Validación final: cada imagen aprobada se comparará con una captura
  `ACTUAL-IMG-UX-XX`; toda diferencia quedará clasificada como aprobada,
  pendiente o defecto.

## Invariantes compartidas

1. Una sola acción primaria visible por estado.
2. Chat, formulario, navegación y footer nunca se superponen.
3. El agente es una región estructural contraíble, no un elemento flotante.
4. Nueva tarea, Biblioteca y Ajustes no se duplican dentro del mismo contexto.
5. En móvil se cambia entre Etapa y Agente sin modal de formulario.
6. Los bloqueos se explican junto a su causa y ofrecen recuperación.
7. La composición conserva la lógica, rutas y datos existentes hasta que una
   especificación aprobada indique expresamente lo contrario.

## Semántica resuelta por el feature 008

- Los textos y estados de los controles describen intención visual y se
  resuelven normativamente en
  `specs/008-stage-agent-workspace/spec.md`; no reemplazan los gates de dominio.
- `Guardar borrador` usa una política manual uniforme para las cuatro fases y
  reutiliza el pipeline de guardado existente. El autosave específico de una
  fase se retira para evitar políticas y avisos duplicados.
- `Volver a tareas` reutiliza la ruta existente `/`; la imagen no introduce una
  ruta nueva.
- Los cinco campos visibles en `IMG-UX-01` y `IMG-UX-04` son la síntesis
  prioritaria de fase 1. Los demás campos existentes permanecen accesibles en
  `Contexto y confirmación`; los mockups no autorizan eliminar datos.

## Resumen del conjunto de prompts

- `IMG-UX-01`: sistema visual base y estado normal de escritorio.
- `IMG-UX-02`: expansión no superpuesta del agente y conversación activa.
- `IMG-UX-03`: adaptación tablet con navegación compacta y dos regiones.
- `IMG-UX-04`: adaptación móvil de una columna con selector Etapa/Agente.
- `IMG-UX-05`: evaluación con ajustes, errores inline y recuperación.
- `IMG-UX-06`: cierre 4/4, resultados persistentes y retorno inequívoco a
  tareas, sin duplicar Biblioteca.

Todos los prompts exigieron contenido realista en español, controles compactos,
contraste accesible, ausencia de acciones duplicadas, cero superposiciones y
consistencia con el sistema visual base de `IMG-UX-01`.
