# Visual Acceptance Contract: Agente rail y chat

## 1. Sources and precedence

1. `specs/013-agent-rail-chat/spec.md` gobierna alcance y comportamiento.
2. `docs/ux-ui/mockups/rediseño-agente/manifest.md` identifica referencias.
3. IMG-UX-01/02/03 definen intención; IMG-UX-05 solo evidencia badge `1`.
4. Baselines versionadas detectan regresión; no sustituyen mockup ni decisión humana.

## 2. Shared invariants

1. El agente es rail o columna estructural, nunca overlay.
2. Existe exactamente una acción primaria visible de etapa.
3. `Enviar`, `Aceptar`, `Editar` y `Descartar` son secundarios.
4. Navegación, lienzo, agente, mensajes, propuesta y compositor no se solapan.
5. Contraer conserva borrador, edición local, operación y contexto recuperable.
6. Todo control tiene nombre, foco visible y operación por teclado, o explica de
   forma accesible por qué está deshabilitado.
7. Cero overflow horizontal desde 320 px y cero violaciones axe aplicables.

## 3. Collapsed rail — IMG-UX-01

- En ≥768 px mide como máximo `7rem` y 12 % del layout stage+agent.
- Contiene `Agente IA`, sparkle, chevron y `Expandir agente IA`.
- No contiene `Panel estructural`, placeholder ni columna vacía.
- Badge ausente en 0; exacto/accesible en 1 y N; dos dígitos no ensanchan rail.
- El contenido del chat permanece montado pero oculto, fuera de layout/tab order.
- El lienzo ocupa el ancho liberado sin recorte o reordenamiento.

## 4. Expanded column — IMG-UX-02

- Es hermana del lienzo dentro del grid.
- Header: sparkle, `Agente IA`, `Listo para orientar esta etapa` y
  `Contraer agente IA`.
- Mensaje assistant: avatar, `Agente IA`, hora y contenido.
- Mensaje user: avatar, identidad/hora, contenido y alineación derecha.
- Roles se distinguen por identidad, alineación y estructura, no solo color.
- Propuesta: `Propuesta para <campo>`, valor completo y tres acciones secundarias.
- Compositor: `Escribe al agente…`, `Adjuntar archivo` deshabilitado con razón y
  `Enviar` secundario.

## 5. Tablet — IMG-UX-03

- A 1024×768, navegación inicia cerrada y stage/agente permanecen en dos columnas.
- Stage y área de mensajes tienen altura contenida y scroll vertical propio.
- Cambiar `scrollTop` de una región no cambia el de la otra.
- Compositor queda dentro de la columna y no cubre el último mensaje/propuesta.
- Ambos finales son alcanzables por teclado y puntero.

## 6. Mobile continuity

- En 390×844 y 320×667 se conserva `WorkspacePaneTabs` existente.
- No se añaden tabs, breakpoints o navegación de spec 015.
- IMG-UX-01 móvil siembra/muestra el pane `stage` y valida continuidad del lienzo;
  no exige rail, ancho o badge del estado desktop/tablet.
- IMG-UX-02 móvil siembra/muestra el pane `agent` y valida header, chat,
  propuesta, compositor, foco, geometría y axe sin exigir dos columnas.
- Ambas se capturan como proyecciones responsive, no como aprobación de un
  mockup móvil inexistente.
- Cambiar Etapa↔Agente conserva preferencia, draft y ancla existentes.

## 7. Proposal contract

| Action | Observable result |
|--------|-------------------|
| Aceptar | emite accept una vez; aplica valor sin cambio si contexto/revisión siguen vigentes |
| Editar válido | emite edit con valor validado; aplica por handler/rules existentes |
| Editar inválido | no emite; muestra alerta asociada; conserva edición y badge |
| Descartar | emite reject una vez; campo anterior intacto; badge disminuye |

Después de cada decisión, el badge coincide con las propuestas `proposed`
visibles para tarea/fase activas.

## 8. Geometry and accessibility assertions

- Estado estable del panel: atributo `data-agent-state="collapsed|expanded"`.
- Medir rail contra `.workspace-stage-layout`, no solo screenshot.
- Reutilizar `assertNoOverlap`/`assertNoOverlapPairs` para navigation, stage,
  agent, messages, proposal, composer y primaria.
- Verificar exactamente una `[data-primary-action="true"]` visible.
- Axe completo en IMG-UX-01/02 × cuatro viewports.
- Aserciones explícitas: aria-expanded/controls, Escape, retorno de foco, orden
  de foco, nombres, roles, adjunto disabled+descripción y badge anunciado.

## 9. Evidence and human gate

La matriz aprobable contiene ocho ACTUAL:

```text
IMG-UX-01 × desktop-large, tablet, mobile, mobile-narrow
IMG-UX-02 × desktop-large, tablet, mobile, mobile-narrow
```

IMG-UX-03 se compara con ACTUAL-IMG-UX-02-tablet y evidencia funcional de
scroll; no crea una novena captura.

1. Ejecutar modo `contract`: los ocho estados completan DOM/geometría/axe sin
   invocar snapshots ni abortar por pixel diff.
2. Con autorización de captura, ejecutar modo `evidence` y generar ocho ACTUAL
   usando `--grep`, sin modificar baselines.
3. Completar las seis dimensiones y auditar posibles impactos 03/05.
4. Mantener `HUMAN_DECISION_REQUIRED` hasta aprobación explícita y cero defectos.
5. Solo después, ejecutar `baseline --update-snapshots`, revisar/versionar el
   diff y repetir sin update hasta verde idempotente.
6. Sembrar/detectar defectos de pixel, geometría y axe; retirar siembras y volver a verde.
