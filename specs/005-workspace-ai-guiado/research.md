# Research: Espacio de trabajo guiado por IA

## Decision: integrar Nuxt UI sin copiar las plantillas completas

**Rationale**: Nuxt UI ofrece los componentes de Dashboard, AI Chat, formularios y overlays solicitados. Se instalarán Nuxt UI 4.10 y Tailwind CSS 4.3, se registrará el módulo, se añadirá su hoja global y la raíz se envolverá con `UApp`. El dashboard se compondrá con `UDashboardGroup`, `UDashboardSidebar` y dos `UDashboardPanel`; el chat con `UChatMessages`, `UChatPrompt` y `UChatPromptSubmit`; el formulario con `UForm`, controles existentes, `UProgress` y `UModal`. La [documentación oficial de componentes](https://ui.nuxt.com/docs/components/) confirma que estas familias cubren el diseño requerido.

**Alternatives considered**:

- Copiar el template Dashboard y el template Chat completos: rechazado porque introduciría navegación, páginas y convenciones ajenas al dominio actual.
- Mantener CSS y controles artesanales: rechazado porque duplicaría primitivas accesibles y no cumpliría la decisión explícita de usar Nuxt UI.

## Decision: no añadir AI SDK, Vueform ni proveedores al MVP

**Rationale**: Los componentes de chat aceptan mensajes controlados por la aplicación y no requieren una llamada real. Zod y los formularios de fase existentes ya resuelven validación y edición dinámica. Un adaptador determinista permite probar envío, sugerencias, actualizaciones, demora, error y evaluación sin red ni secretos.

**Alternatives considered**:

- Instalar AI SDK para simular el chat: rechazado porque añade una abstracción de transporte sin proveedor real.
- Añadir Vueform: rechazado porque duplicaría el modelo Zod, los componentes de fase y la lógica de reparación existentes.
- Conectar Codex o DeepSeek ahora: rechazado por alcance, credenciales, costo y la restricción constitucional de que el flujo principal no dependa de un proveedor.

## Decision: conservar conversación y evaluaciones dentro de la tarea

**Rationale**: El volumen local actual es pequeño y la tarea ya se guarda de forma atómica bajo `bitacora:t:<id>`. Añadir un `assistant` reparable conserva aislamiento por tarea, simplifica guardado, eliminación y reapertura, y evita claves huérfanas. La preferencia global `codex|deepseek`, sin credenciales, sí usa una clave de ajustes independiente.

**Alternatives considered**:

- Una clave por hilo y otra por evaluación: rechazada porque exige coordinación de escrituras, borrado y recuperación sin necesidad medida.
- Solo estado efímero: rechazado porque incumple la continuidad al reabrir la tarea.

## Decision: versionar evaluaciones mediante una huella canónica de respuestas

**Rationale**: La huella se deriva exclusivamente de los campos funcionales de la fase, con orden estable y sin mensajes, evaluaciones ni prompts. `Continuar` requiere simultáneamente compuerta determinista abierta, evaluación aceptable y huella evaluada igual a la vigente. Cualquier edición invalida automáticamente una aceptación anterior.

**Alternatives considered**:

- Contador manual de revisión: rechazado porque los `v-model` anidados actuales podrían cambiar sin incrementar el contador.
- Confiar solo en la fecha de evaluación: rechazado porque no demuestra que las respuestas coincidan.

## Decision: usar actualizaciones de formulario tipadas y con control de concurrencia

**Rationale**: Cada actualización declara tarea, fase, campo permitido, valor, mensaje origen y huella base. Solo se aplica si tarea, fase y huella siguen vigentes; de lo contrario queda en conflicto para revisión. Las ediciones humanas prevalecen sobre una respuesta tardía.

**Alternatives considered**:

- JSON Patch libre: rechazado porque podría escribir otra fase, metadatos o prompts legacy.
- Aplicar silenciosamente toda respuesta: rechazado porque puede destruir una edición humana reciente.

## Decision: convertir el corpus analítico legacy en instrucciones internas confiables

**Rationale**: El HTML legacy contiene el tutor socrático, el facilitador AAR y pautas específicas por tipo. Estas reglas se normalizarán en un catálogo estático propiedad de la aplicación. Los campos `prompt*` guardados se conservan por compatibilidad, pero nunca se elevan a instrucciones confiables porque pudieron ser editados por usuarios.

**Alternatives considered**:

- Reutilizar directamente `buildPrompt()`: rechazado porque compone resúmenes de contexto y no criterios de evaluación.
- Usar los prompts persistidos como instrucciones: rechazado por integridad y riesgo de inyección.
- Borrar los prompts antiguos: rechazado porque perdería datos existentes.

## Decision: mantener el gate determinista como condición obligatoria

**Rationale**: La evaluación simulada transforma las razones de `gateReasons()` en debilidades y recomendaciones. Nunca devuelve `acceptable` si faltan campos obligatorios. Las futuras evaluaciones de proveedor deberán satisfacer el mismo contrato y no podrán omitir las reglas estructurales.

**Alternatives considered**:

- Reemplazar el gate por una puntuación de IA: rechazado por no determinismo y por permitir avanzar con datos obligatorios vacíos.
- Mostrar evaluación sin afectar avance: rechazado porque contradice el flujo solicitado de iterar antes de continuar.

## Decision: adaptar el dashboard para móvil mediante overlays accesibles

**Rationale**: En escritorio se muestran las tres regiones. En móvil, la navegación usa el comportamiento colapsable del dashboard y el formulario se abre desde un control «Cuestionario» en un slideover, sin desmontar ni perder datos. Modal y slideover deben restaurar foco, tener nombre accesible y anunciar estados por texto.

**Alternatives considered**:

- Ocultar el formulario derecho: rechazado porque elimina la capacidad principal.
- Reducir las tres columnas hasta 320 píxeles: rechazado porque vuelve ilegibles los controles.
- Duplicar el formulario para móvil: rechazado por dos fuentes de verdad.

