# Research: Lienzo de etapa como formulario protagonista

**Date**: 2026-08-05

## D1 — Dueño del lienzo activo

**Decision**: `GuidedPhaseForm` será el contenido principal y dueño de título,
stepper, estado y footer; `TaskWorkspace` elimina su meta duplicada y monta el
formulario antes de `StructuredStageSummary`.

**Rationale**: el primero ya resuelve fase y acción contextual; el segundo debe
limitarse a composición. Así no aparecen dos títulos ni dos fuentes de estado.

**Alternatives considered**: crear otro canvas (duplica orquestación); ocultar
meta con CSS (permanece en DOM/accesibilidad); eliminar el resumen (pierde dato).

## D2 — Presentación común del campo textual

**Decision**: añadir `StageTextField.vue`, presentacional, capaz de renderizar
input/textarea con etiqueta asociada, SVG decorativo, descripción existente y
contador derivado de `String(modelValue ?? '').length`.

**Rationale**: garantiza el mismo contrato en cuatro fases sin repetir cálculo,
accesibilidad y estilos. No conoce modelos ni persiste.

**Alternatives considered**: markup repetido (drift); directiva (no compone
label/icono); librería de formularios/iconos (dependencia fuera de alcance).

## D3 — `N/500` es informativo

**Decision**: el denominador es referencia visual; no se añade `maxlength`,
validación, truncamiento ni migración. Los valores >500 muestran su longitud real.

**Rationale**: el dominio no define ese máximo y la feature debe preservar datos.

**Alternatives considered**: bloquear en 500 (cambia reglas); truncar al cargar
(destructivo); ocultar >500 (contador inexacto).

## D4 — Dirty uniforme, guardado manual

**Decision**: cada componente de fase emite `dirty` explícitamente para toda
mutación editable —los eventos personalizados de Vue no burbujean— y ninguna
fase emite `save` al escribir. Se retira el autosave profundo particular de
`GuidancePhase` y se conserva `save` solo para acciones explícitas que ya lo
requieran fuera de la edición ordinaria.

**Rationale**: 008 define una política manual; hoy fase 2 guarda al teclear y las
demás no notifican de forma uniforme al estado local.

**Alternatives considered**: autosave para las cuatro fases (contradice 008 y
el botón); depender solo del watch de `TaskWorkspace` (no actualiza el chip local).

## D5 — Estado visual y persistencia

**Decision**: `GuidedPhaseForm` conserva `idle|dirty|saving|saved|error`, ignora
activaciones duplicadas durante `saving`, restablece por tarea/fase y recibe el
resultado del mismo pipeline de `pages/tasks/[id].vue`.

**Rationale**: ya existe operación idempotente y manejo de éxito/error; crear
otra escritura o store produciría estados divergentes.

**Alternatives considered**: estado global nuevo (innecesario); asumir éxito al
click (oculta fallos); borrar dirty al iniciar (miente hasta confirmar).

## D6 — Persistencia no equivale a evaluación

**Decision**: `Cambios sin guardar` describe dirty y desaparece tras éxito. Un
chip separado `Cambios sin evaluar` se muestra únicamente cuando las reglas
actuales determinen una evaluación desfasada; permanece tras guardar y se limpia
solo cuando esas reglas vuelven a considerar vigente la evaluación.

**Rationale**: fue la aclaración aceptada y preserva las reglas de 008.

**Alternatives considered**: usar un mismo chip para ambos estados (ambiguo);
marcar evaluado al guardar (cambio de dominio prohibido).

## D7 — Acción y API pública

**Decision**: retirar solo la representación visual `Atrás`; conservar el emit y
wiring público existente si otros consumidores lo usan. El footer contiene
`Guardar borrador` secundario y exactamente la primaria ya resuelta.

**Rationale**: minimiza regresión y respeta que 012 es presentación.

**Alternatives considered**: borrar emits/handlers (cambio contractual); añadir
otra primaria “Continuar” (duplica decisión contextual).

## D8 — Contenido y orden

**Decision**: fase 1 muestra los cinco prioritarios y después `Contexto y
confirmación`; fases 2–4 conservan el orden enumerado en FR-010. Los controles
no textuales mantienen su markup/semántica y no reciben contador artificial.

**Rationale**: la síntesis cambia jerarquía, no datos ni protocolo.

**Alternatives considered**: ocultar secundarios (pérdida funcional); reordenar
por conveniencia técnica (rompe contrato); forzar contador en checkbox/select.

## D9 — Móvil con un solo árbol semántico

**Decision**: conservar contenido y orden DOM; estilos locales apilan el footer,
centran la secundaria y expanden la primaria. No se añade estructura responsive.

**Rationale**: satisface IMG-UX-04 sin adelantar spec 015 ni duplicar IDs/estado.

**Alternatives considered**: formulario móvil paralelo (drift); footer fijo
(puede cubrir campos); nuevo breakpoint global (fuera de alcance).

## D10 — Verificación visual y evidencia

**Decision**: reutilizar suite/helpers de 010. El gate contractual toma IMG-UX-01
en cuatro viewports y el ACTUAL canónico IMG-UX-04 a 390×844; las capturas extra
de la matriz global son regresión, no nuevas referencias. Update solo crea
candidatas y exige aprobación humana.

**Rationale**: mantiene una infraestructura común y distingue baseline ejecutable
de mockup de diseño.

**Alternatives considered**: suite visual paralela (duplicación); usar mockup como
baseline (incorrecto); aprobar automáticamente snapshots (oculta regresiones).
