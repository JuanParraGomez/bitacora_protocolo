# Visual Acceptance Contract: Stage-Agent Workspace

## 1. Canonical reference set

El manifiesto
`docs/ux-ui/mockups/rediseño-agente/manifest.md` es la fuente de selección.
Solo estos archivos son contractuales:

| ID | Archivo canónico | Viewport objetivo |
|---|---|---:|
| IMG-UX-01 | `img-ux-01-desktop-etapa.png` | 1440 × 900 |
| IMG-UX-02 | `img-ux-02-desktop-agente-activo-v2.png` | 1440 × 900 |
| IMG-UX-03 | `img-ux-03-tablet-agente-activo-v2.png` | 1024 × 768 |
| IMG-UX-04 | `img-ux-04-mobile-etapa-v4.png` | 390 × 844 |
| IMG-UX-05 | `img-ux-05-desktop-bloqueo.png` | 1440 × 900 |
| IMG-UX-06 | `img-ux-06-desktop-completada-v2.png` | 1440 × 900 |

Las variantes anteriores quedan fuera del contrato aunque compartan prefijo.
Las herramientas de captura o comparación MUST resolver rutas desde esta tabla
y MUST NOT usar globs `img-ux-*.png`.

## 2. Shared invariants

1. Existe una sola acción primaria visible por estado.
2. Navegación, etapa, agente, compositor y acciones no se superponen.
3. El agente es una región estructural contraíble, no un overlay flotante.
4. La etapa conserva todos sus campos, listas y datos al cambiar de viewport;
   los cinco campos del mockup son síntesis prioritaria, no el formulario total.
5. La navegación persistente no duplica sus destinos en el lienzo.
6. Los bloqueos aparecen cerca de su causa y ofrecen recuperación.
7. Borrador, foco, scroll y contexto no se pierden al alternar paneles.
8. Evaluación, avance, finalización, guardado y propuestas conservan sus reglas.
9. Todo control visible es operable por teclado o explica por qué está
   deshabilitado.
10. No existe overflow horizontal involuntario desde 320 px.

## 3. Contextual action contract

| Estado observable | Única acción primaria | Acciones secundarias permitidas |
|---|---|---|
| Sin evaluación vigente | `Evaluar etapa` | `Guardar borrador`, controles de navegación |
| Evaluando | `Evaluando…` deshabilitada | Controles que no duplican la solicitud |
| No aceptable o desfasada | `Reevaluar etapa` | Guardado, agente, edición |
| Aceptable, etapa 1–3 | `Continuar a etapa N` | Guardado, agente, edición |
| Aceptable, etapa 4 | `Finalizar tarea` | Guardado, agente, edición |
| Completada | `Volver a tareas` | Navegación persistente |

`Enviar`, `Aceptar`, `Editar` y `Descartar` usan apariencia secundaria. No se
consideran primarias aunque disparen una operación local de su región.

## 4. Contract per reference

### IMG-UX-01 — Desktop, stage active

- Sidebar persistente, cabecera contextual, canvas de etapa y rail identificable
  del agente.
- Etapa 1/4 y sus cinco campos completos son el foco principal.
- `Guardar borrador` es secundario; `Evaluar etapa` es el único CTA primario.
- El rail del agente no intercepta el canvas.

### IMG-UX-02 — Desktop, agent expanded

- Canvas y agente son columnas hermanas dentro del mismo shell.
- El agente contiene cabecera, mensajes, propuesta y compositor.
- La propuesta expone `Aceptar`, `Editar` y `Descartar` sin competir
  visualmente con `Evaluar etapa`.
- Canvas, mensajes y compositor permanecen alcanzables sin overlays.

### IMG-UX-03 — Tablet, agent expanded

- Navegación persistente fuera del plano; se abre bajo demanda.
- Canvas y agente comparten el ancho con mínimos legibles.
- Ambos paneles conservan scroll independiente.
- `Enviar` y decisiones de propuesta permanecen secundarios.

### IMG-UX-04 — Mobile, stage active

- Un plano vertical con selector `Etapa` / `Agente`.
- La vista inicial es `Etapa`.
- Están presentes primero los cinco campos con los mismos valores semánticos
  del estado desktop. Los controles adicionales de fase 1 permanecen
  disponibles en `Contexto y confirmación`.
- Las acciones viven al final del flujo; ninguna barra fija cubre contenido.
- Cambiar a `Agente` y volver conserva valores, borrador y posición útil.

### IMG-UX-05 — Desktop, blocked

- El estado global resume por qué la etapa no puede avanzar.
- Cada problema concreto aparece junto al campo o decisión relacionada.
- El agente permanece disponible para orientación.
- `Reevaluar etapa` es la única acción primaria; guardado y recomendaciones son
  secundarios.

### IMG-UX-06 — Desktop, completed

- Progreso 4/4 y confirmación inequívoca.
- Resultado, aprendizaje, evidencia, decisión y registros se derivan de datos
  existentes.
- `Volver a tareas` es la única acción primaria.
- `Biblioteca` permanece en navegación y no se duplica en el lienzo.
- Recargar la vista no vuelve a completar ni generar registros.

## 5. Responsive and geometry rules

| Viewport | Navegación | Etapa/agente | Scroll |
|---|---|---|---|
| 1440 × 900 | Sidebar persistente o contraíble | Canvas protagonista; agente rail o columna | Regiones independientes |
| 1024 × 768 | Drawer cerrado inicialmente | Dos columnas cuando agente abierto | Regiones independientes |
| 390 × 844 | Drawer | Un plano con tabs | Scroll vertical del plano |
| 320 px | Drawer | Un plano | Sin overflow horizontal |
| Zoom 200 % | Accesible por teclado | Reflow sin pérdida | Campo y CTA alcanzables |

Los anchos exactos pueden adaptarse si se mantienen jerarquía, legibilidad,
ausencia de solape y el contenido contractual.

## 6. Accessibility rules

- Tabs móviles con roles/estado seleccionable y nombre accesible.
- Control del agente comunica expandido/contraído.
- Paneles tienen nombre de región; el agente no crea un segundo `main`.
- Foco visible en botones, links, tabs y campos.
- Drawer cierra con Escape y devuelve foco.
- Estados de envío/evaluación se anuncian sin duplicación.
- Causa de deshabilitación asociada al control.
- Contraste verificable para texto, bordes necesarios y acciones.
- Texto normal: mínimo 4.5:1. Texto grande, límites necesarios, iconos y
  estados/foco: mínimo 3:1, conforme a WCAG 2.2 AA.

## 7. Evidence and comparison protocol

Las capturas finales viven en:

`specs/008-stage-agent-workspace/evidence/actual/actual-img-ux-XX-*.png`

Cada captura registra en `implementation-evidence.md`:

- ID y ruta exacta de referencia.
- Ruta `ACTUAL-*`, viewport CSS y escala.
- Fixture/estado y URL.
- Commit o diff aplicado cuando exista.
- Diferencias por jerarquía, geometría, contenido, interacción y responsive.
- Decisión `approved`, `pending` o `defect`.
- Severidad, responsable y siguiente acción para pendientes/defectos.

### Always a defect

- Campo o dato contractual omitido.
- Acción primaria ausente, incorrecta o duplicada.
- Avance permitido contra el gate vigente.
- Overlay, clipping, overflow o control interceptado.
- Pérdida de borrador, valores o contexto al alternar.
- Destino global duplicado dentro del mismo contexto.
- Resumen que inventa, duplica o vuelve a persistir datos.
- Bloqueo sin causa o recuperación.

### Potentially acceptable with documentation

- Variaciones menores de fuente, antialiasing o wrapping.
- Espaciado y tamaño exacto que preservan jerarquía y legibilidad.
- Ajustes de color dentro de tokens con contraste suficiente.
- Contenido sintético diferente que conserva estructura y semántica.

La igualdad pixel-perfect no sustituye pruebas de interacción, teclado,
contraste, scroll, persistencia ni reglas de dominio.
