# Data Model: Lienzo de etapa como formulario protagonista

Esta feature no añade tablas, migraciones, claves, endpoints ni campos de
dominio. `Task` y sus estructuras `f1`–`f4` se conservan exactamente; las
entidades siguientes son view-models derivados y no persistidos.

## StageCanvasViewModel

- `phase`: entero existente 1–4.
- `title`: uno de `Entender el problema`, `Descomponer el camino`, `Ejecución`,
  `Revisión`.
- `steps`: cuatro `StageStepViewModel` ordenados.
- `draftState`: `DraftVisualState`.
- `evaluationFreshness`: estado existente, separado de persistencia; cuando es
  `stale` proyecta el chip `Cambios sin evaluar` y guardar no lo modifica.
- `primaryAction`: acción contextual ya derivada por 008.

## StageStepViewModel

- `number`: 1–4.
- `label`: título de fase existente.
- `status`: `completed | current | pending`.
- `current`: redundancia accesible derivada; nunca persistida.

Invariante: existe exactamente un `current`; números y orden no cambian.

## StageTextFieldViewModel

- `id`: ID estable y único del control existente.
- `label`: etiqueta textual contractual.
- `icon`: nombre cerrado de SVG presentacional.
- `kind`: `input | textarea`.
- `value`: string actual; no se normaliza al renderizar.
- `characterCount`: longitud actual derivada.
- `referenceLength`: constante presentacional `500`.
- `describedBy`: IDs existentes de ayuda/error, si aplican.
- `group`: `priority | context | phase-capture`.
- `order`: posición observable dentro de su fase.

Invariantes: `characterCount` puede superar 500; no existe `maxlength`; el icono
es `aria-hidden`; la etiqueta asociada aporta el nombre accesible.

## DraftVisualState

- `idle`: borrador limpio; comunica `Borrador listo` como máximo una vez.
- `dirty`: edición local pendiente; chip único `Cambios sin guardar`.
- `saving`: solicitud explícita en curso; evita segunda activación.
- `saved`: última persistencia confirmó éxito; no muestra chip dirty.
- `error`: persistencia falló; conserva valores y condición pendiente/reintento.

El chip dirty y el chip de evaluación no se sustituyen entre sí: el primero
depende de persistencia local y el segundo de las reglas de vigencia existentes.

```text
idle/saved ── editar ──> dirty
dirty/error ── Guardar ──> saving
saving ── éxito ──> saved
saving ── fallo ──> error
dirty ── evaluar ──> reglas 008 (guardar/evaluar siguen separadas)
cambio de tarea/fase ──> estado correspondiente al nuevo contexto
```

## Content groups

- Fase 1 `priority`: Problema detectado, Evidencia, Análisis, Resultado deseado,
  Criterio de éxito.
- Fase 1 `context`: linaje, confirmaciones, dudas, alcance, restricciones,
  actores, decisión, justificación y formulación vigente.
- Fases 2–4 `phase-capture`: todos los controles y operaciones existentes en el
  orden de FR-010; ningún elemento se elimina o cambia de tipo.

## Compatibility invariants

- Los eventos/payloads de guardado y evaluación mantienen forma y orden.
- Ningún estado visual se escribe en SQLite ni localStorage nuevo.
- Editar no dispara persistencia.
- Guardar no crea evaluación ni cambia su vigencia.
- Cambiar composición o viewport no crea una segunda copia del formulario.
