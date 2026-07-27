# Contract: Task Workspace UI

## Desktop regions

| Region | Required content | Primary action |
|--------|------------------|----------------|
| Navegación lateral | Proyecto visible, Activas, Completadas, tarea actual, Nueva tarea, Ajustes | Seleccionar o crear tarea |
| Chat central | Mensajes, sugerencias, estados, prompt de mensaje y envío | Conversar |
| Formulario derecho | Fase, progreso, campos, evaluación, Atrás/Evaluar/Continuar | Completar y validar |

Cada región tiene un landmark con nombre único. El orden inicial de teclado es navegación, chat y formulario.

## Responsive behavior

- En escritorio, las tres regiones están visibles y los paneles centrales pueden ajustar su ancho dentro de límites legibles.
- En móvil, la navegación se abre desde el toggle del dashboard.
- El chat permanece como contenido principal.
- «Cuestionario» abre el mismo formulario en un slideover; no se monta una copia paralela.
- Cerrar modal o slideover devuelve el foco al control que lo abrió.
- Cambiar de presentación no pierde texto, selección ni desplazamiento relevante.

## Sidebar behavior

- `Nueva tarea` conduce al formulario de creación existente.
- Activas se construye con `index.tareas`.
- Completadas se construye con `index.registros`.
- La tarea seleccionada usa estado activo perceptible por texto/semántica además de color.
- `Ajustes` abre un modal con exactamente Codex y DeepSeek.
- Ninguna opción muestra campos de credenciales en el MVP.

## Chat behavior

- Mensajes de usuario y asistente tienen autor y estado accesibles.
- Enviar un texto vacío está deshabilitado.
- Durante envío, el campo evita duplicados y mantiene una cancelación segura al cambiar de contexto.
- Un fallo muestra Reintentar; el reintento no duplica un mensaje ya confirmado.
- Las sugerencias rellenan o envían una intención visible, nunca ejecutan una mutación oculta.
- Las actualizaciones de campo se muestran como propuestas o cambios aplicados y permiten detectar conflicto.
- Los estados de envío y evaluación se anuncian mediante una región `aria-live` no intrusiva.

## Guided form behavior

- Un único formulario reactivo es fuente de verdad en desktop y móvil.
- Orientación, Guía, Ejecución y Revisión exponen todos los campos funcionales persistidos.
- Los componentes de fase no renderizan `PromptBox`.
- Los campos `prompt*` permanecen intactos en el objeto guardado.
- Editar cualquier respuesta invalida visualmente la evaluación aceptable previa mediante comparación de huella.
- «Evaluar» queda disponible cuando existe contenido evaluable y evita solicitudes duplicadas.
- «Continuar» cumple la regla combinada documentada en `data-model.md`.

## Evaluation feedback

- `needs-work`: presenta encabezado, puntos débiles y recomendaciones.
- `acceptable`: presenta confirmación y habilita Continuar solo si sigue vigente.
- `error`: conserva respuestas y evaluación válida anterior, y ofrece Reintentar.
- `stale`: es un estado derivado con texto «Evalúa nuevamente los cambios».
- El historial permite distinguir iteraciones sin exponer prompts internos ni razonamiento privado.

## Save and navigation

- Mensaje, actualización aplicada, evaluación y preferencia muestran guardado real solo tras persistir.
- Cambiar de tarea espera o cancela de forma segura operaciones pendientes.
- Un fallo de guardado no descarta cambios locales y ofrece reintento.
- Finalizar fase 4 conserva la creación de registro y la aparición en Completadas.

