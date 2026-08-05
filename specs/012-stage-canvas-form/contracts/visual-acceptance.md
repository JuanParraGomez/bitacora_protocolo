# Visual Acceptance Contract: Lienzo de etapa como formulario protagonista

## Alcance

Este contrato cubre exclusivamente el contenido y footer del lienzo activo para
IMG-UX-01 e IMG-UX-04. Sidebar/header de 011, agente 013, bloqueo 014,
responsive estructural 015 y cierre 016 solo se observan como límites para
detectar duplicados o superposiciones.

## Jerarquía y contenido

1. El primer contenido funcional del canvas es `GuidedPhaseForm`; cualquier
   resumen complementario aparece después.
2. Existe un único título sin `Fase N ·`, seguido por un stepper numerado 1–4.
3. No existen `ETAPA ACTIVA`, `Lienzo de la etapa`, `SÍNTESIS OPERATIVA` ni botón
   `Atrás` en el lienzo activo.
4. Fase 1 muestra, en orden: Problema detectado, Evidencia, Análisis, Resultado
   deseado y Criterio de éxito; después `Contexto y confirmación` conserva todos
   los secundarios.
5. Fases 2–4 conservan todos los controles en el orden FR-010.
6. Cada control textual incluye SVG decorativo, label asociado y contador vivo
   exacto `N/500`; >500 permanece visible y editable.

## Estado e interacción

1. Editar cualquier control de cualquier fase muestra una sola indicación
   `Cambios sin guardar` y no dispara guardado.
2. `Guardar borrador` es texto secundario; éxito elimina dirty, fallo conserva
   valor y reintento, y `saving` bloquea duplicados.
3. `Cambios sin evaluar` aparece solo cuando la evaluación existente está
   desfasada, como indicación separada, y no se limpia al guardar.
4. El footer contiene exactamente un `[data-primary-action="true"]`; en fixture
   sin evaluación vigente su texto es `Evaluar etapa`.
5. El orden de tabulación sigue título/stepper, campos, secundaria y primaria.

## Responsive — IMG-UX-04

- El mismo DOM conserva contenido y orden en 390×844 y 320×667.
- El formulario fluye verticalmente; no hay versión móvil abreviada ni campos
  dentro de overlays.
- `Guardar borrador` se centra y la primaria ocupa el ancho disponible al final.
- No hay footer fijo cubriendo controles; zoom 200 % no produce overflow horizontal.

## Matriz de capturas contractuales

| Ref | Viewport | Estado | Nombre lógico |
|-----|----------|--------|----------------|
| IMG-UX-01 | 1440×900 | fase 1 activa, agente contraído | desktop-large |
| IMG-UX-01 | 1024×768 | fase 1 activa | tablet |
| IMG-UX-01 | 390×844 | fase 1 activa, plano Etapa | mobile |
| IMG-UX-01 | 320×667 | fase 1 activa, plano Etapa | mobile-narrow |
| IMG-UX-04 | 390×844 | flujo móvil canónico | mobile |

La suite global puede capturar combinaciones adicionales; solo estas cinco
constituyen el conjunto de aceptación 012.

## Geometría y accesibilidad

- Intersección 0 entre formulario/footer y columna del agente; las aserciones
  respetan que formulario/footer son descendientes contenidos por el canvas.
- Intersección 0 entre la última fila de campos y acciones; controles alcanzables.
- Un solo elemento visible con `data-primary-action="true"`.
- Texto normal ≥4.5:1; controles, bordes significativos y estados ≥3:1.
- Axe sin violaciones aplicables; labels e IDs únicos; SVG `aria-hidden`.
- Stepper comunica el paso actual sin depender solo de color.

## Capa C y baselines

- Baseline = captura ejecutable aprobada/versionada; mockup = referencia.
- Update requiere flag explícito y solo genera candidata.
- `evidence/visual-comparison.md` compara cinco ACTUAL con IMG-UX-01/04 por
  jerarquía, contenido, geometría, interacción, responsive y accesibilidad.
- Cada delta se clasifica `aprobada`, `pendiente` o `defecto`, con evidencia,
  severidad y responsable; ninguna baseline se acepta automáticamente.
