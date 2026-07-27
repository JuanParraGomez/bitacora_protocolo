# Contract: Workspace Assistant Adapter

## Purpose

Separar la experiencia de chat y evaluación del mecanismo que producirá respuestas. El MVP usa un adaptador determinista sin red; una integración futura debe cumplir el mismo contrato.

## Interface

```ts
interface WorkspaceAssistantAdapter {
  send(request: ChatRequest): Promise<ChatResponse>;
  evaluate(request: EvaluationRequest): Promise<EvaluationResponse>;
}
```

## ChatRequest

- `requestId`: identificador único para deduplicación.
- `workspaceLabel`: etiqueta estable del proyecto o espacio activo en el MVP; no implica acceso a archivos ni una entidad persistida.
- `taskId`: tarea activa.
- `phase`: fase vigente.
- `baseRevision`: huella de respuestas al enviar.
- `message`: texto no vacío de la persona.
- `phaseSnapshot`: únicamente campos funcionales de la fase.
- `recentMessages`: mensajes seguros de la misma tarea y fase.
- `previousEvaluations`: hasta las cinco evaluaciones más recientes de la misma fase, ordenadas de la más antigua a la más nueva; el historial completo permanece persistido en la tarea.

## ChatResponse

- `requestId`, `taskId`, `phase` y `baseRevision` deben coincidir con la solicitud.
- `message`: mensaje asistente con partes de texto.
- `suggestions`: hasta tres acciones breves relacionadas con campos incompletos o debilidades.
- `updates`: cero o más actualizaciones con rutas cerradas de la misma fase.

La interfaz rechaza o marca en conflicto cualquier respuesta cuyo contexto ya no coincida. No se usa `v-html`.

## EvaluationRequest

- `requestId`, `taskId`, `phase`.
- `responseRevision`: huella exacta.
- `phaseSnapshot`: campos funcionales vigentes.
- `gateReasons`: razones deterministas vigentes.
- `instructionKey`: referencia al catálogo interno por fase y tipo, nunca texto `prompt*` persistido.
- `previousEvaluations`: historial de la misma fase.

## EvaluationResponse

- `requestId`, `taskId`, `phase`, `responseRevision`.
- `status`: `acceptable`, `needs-work` o `error`.
- `weaknesses`: obligatorio y no vacío para `needs-work`.
- `recommendations`: obligatorio y no vacío para `needs-work`.
- `gatePassed` y `gateReasons`.
- `evaluatorVersion`.

El adaptador no puede devolver `acceptable` si `gateReasons` no está vacío. Una respuesta inválida se transforma en error recuperable y no cambia el último estado válido.

## Mock behavior

El adaptador `mock-v1` ofrece fixtures deterministas:

- éxito con mensaje, sugerencias y actualizaciones tipadas;
- demora controlada;
- indisponibilidad;
- respuesta mal formada;
- respuesta tardía después de cambio de tarea, fase o revisión.

`evaluate()` transforma faltantes del gate en debilidades y recomendaciones. Cuando el gate pasa, aplica criterios estáticos del catálogo analítico y produce un resultado estable para el mismo snapshot.

## Deferred adapter requirements

Una integración real deberá:

- recibir la preferencia Codex o DeepSeek desde servidor, nunca credenciales desde el contrato cliente;
- validar su salida contra los mismos esquemas;
- aplicar timeout, cancelación, deduplicación y límites;
- conservar el gate determinista como condición obligatoria;
- aislar herramientas y acceso a proyecto según autorización explícita.
