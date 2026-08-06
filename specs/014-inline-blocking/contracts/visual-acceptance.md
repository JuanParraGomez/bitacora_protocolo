# Visual Acceptance Contract: Bloqueo inline recuperable

## 1. Sources and precedence

1. `specs/014-inline-blocking/spec.md` gobierna comportamiento y alcance.
2. `docs/ux-ui/mockups/rediseño-agente/manifest.md` identifica IMG-UX-05.
3. Specs 012 y 013 gobiernan el formulario y la estructura del agente.
4. Baselines versionadas detectan regresión; no sustituyen mockup ni aprobación.

## 2. Canonical state — IMG-UX-05

- Evaluación vigente needs-work con dos motivos canónicos.
- Banner superior `2 correcciones pendientes`, lista completa y
  `Ver recomendaciones del agente`.
- Un mensaje inline dentro de `Análisis` y otro dentro de `Criterio de éxito`.
- Chip exacto `Evaluación requiere ajustes`.
- Exactamente una primaria visible: `Reevaluar etapa`.
- Badge de correcciones exacto/accesible en rail contraído y header expandido.
- Weaknesses/recommendations no cambian el conteo.

## 3. Field proximity and semantics

1. Cada mensaje mapeado es descendiente del mismo bloque visual que su control.
2. El control expone `aria-invalid="true"` mientras tenga correcciones.
3. `aria-describedby` contiene todos y solo los IDs de sus mensajes inline
   vigentes, además de cualquier descripción preexistente compatible.
4. Desconocidos permanecen en el banner y no aparecen bajo ningún campo.
5. Mensajes duplicados no generan nodos ni conteos adicionales.

La proximidad se prueba por relación DOM, no por distancia de píxeles solamente.

## 4. Recovery contract

| State | Banner/inline/badge | Chip | Primary |
|-------|---------------------|------|---------|
| needs-work vigente | visibles | `Evaluación requiere ajustes` | `Reevaluar etapa` |
| needs-work editado, sin reevaluar | permanecen como pendientes de confirmación | estado stale existente | `Reevaluar etapa` |
| reevaluación con fallo | previos permanecen si existían | `Evaluación con error` | `Reevaluar etapa` |
| fallo inicial | ausentes | `Evaluación con error` | `Reevaluar etapa` |
| acceptable vigente | ausentes | estado aceptable existente | avance o evaluación según gate |
| stale no procedente de needs-work | ausentes | estado obsoleto existente | `Reevaluar etapa` |

Siempre existe una sola `[data-primary-action="true"]` visible.

## 5. Agent focus and badge

- Desktop/tablet collapsed: activar el enlace expande la región estructural y
  enfoca `[data-agent-panel-content]` o un objetivo equivalente dentro del chat.
- Desktop/tablet expanded: conserva estado, draft y ancla; solo mueve el foco.
- Mobile: activa el pane `agent` existente y enfoca la conversación tras render.
- El badge de correcciones usa el conteo del banner y no suma propuestas.
- Conteos 0/1/N/10 no ensanchan el rail ni recortan el header.

## 6. Geometry and responsive invariants

- 1440×900: banner/campos/primaria contenidos en stage; rail/header en agente.
- 1024×768: stage y agente siguen en regiones estructurales con scroll propio.
- 390×844 y 320×667: un pane existente a la vez, sin tabs o drawers nuevos.
- Cero overlay, solape y overflow horizontal entre navegación, stage, banner,
  campo inline, agente, compositor y primaria.
- El compositor nunca cubre el último mensaje ni el contenido del stage.

## 7. Accessibility assertions

- Axe completo y contraste aplicable: cero violaciones en cuatro viewports.
- Banner nombrado; lista semántica; enlace/botón operable por teclado.
- Badge con singular/plural y conteo exacto en nombre accesible.
- Foco observable termina dentro de la conversación después de una activación.
- Error no se comunica solo por color; control y mensaje poseen asociación.
- Orden de tabulación preserva formulario, recuperación y agente existentes.

## 8. Evidence and human gate

La matriz aprobable contiene cuatro ACTUAL:

```text
ACTUAL-IMG-UX-05-desktop-large.png
ACTUAL-IMG-UX-05-tablet.png
ACTUAL-IMG-UX-05-mobile.png
ACTUAL-IMG-UX-05-mobile-narrow.png
```

1. Ejecutar modo `contract`: DOM, proximidad, geometría, foco y axe sin snapshot.
2. Ejecutar modo `evidence` con `--grep IMG-UX-05`: crear ACTUAL sin baseline.
3. Completar Capa C en `evidence/visual-comparison.md` para seis dimensiones.
4. Mantener `HUMAN_DECISION_REQUIRED` hasta aprobación explícita y cero defectos.
5. Solo después ejecutar update de IMG-UX-05, revisar/versionar diff y repetir
   baseline sin update hasta verde idempotente.
6. Ejecutar la suite visual global para detectar colaterales 01/02/03.
