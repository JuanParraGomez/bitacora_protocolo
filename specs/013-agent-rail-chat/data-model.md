# Data Model: Agente como rail contraíble con chat

No se añade persistencia ni se migran schemas. Este documento describe
proyecciones frontend sobre entidades existentes.

## AgentRegionViewState

Representa la región del agente para la tarea visible.

| Field | Source | Rules |
|-------|--------|-------|
| `taskId` | tarea activa | debe pertenecer al proyecto activo |
| `state` | `useWorkspaceState.agentPanelFor(taskId)` | `collapsed` por ausencia; `expanded` si existe preferencia válida |
| `pendingProposalCount` | propuestas visibles derivadas | entero ≥0; solo `status=proposed` de tarea/fase activas |
| `busy` | estado de envío | true para submitted/streaming |
| `draft` | estado existente por tarea | cadena exacta, no compartida entre tareas |
| `restoreMessageId` | estado existente por tarea | ID estable o null; nunca offset de píxeles |

### State transitions

```text
sin preferencia ──expandir──> expanded persistido
expanded ──contraer/Escape──> preferencia eliminada (collapsed)
collapsed ──cambiar tarea──> estado propio de la tarea destino
expanded ──resetTask──> collapsed por defecto
```

Cambiar de viewport ≤767 proyecta el panel en el plano móvil existente; no
cambia la preferencia desktop/tablet ni crea un tercer estado.

## ConversationMessageView

Proyección de `AssistantMessage` para representación.

| Field | Source/derivation | Validation |
|-------|-------------------|------------|
| `id` | mensaje existente | estable y único en conversación |
| `role` | `user` o `assistant` | determina alineación/identidad, no solo color |
| `displayName` | derivado del rol | `Agente IA` o identidad de la persona disponible |
| `avatar` | derivado del rol | visible para ambos; texto alternativo no duplica nombre |
| `displayTime` | `createdAt` | hora/minuto local determinista en fixture |
| `body` | parts textuales | no crear burbuja vacía sin contenido útil |
| `sourceIndex` | posición original | desempata `createdAt` iguales de forma estable |

Relación: un mensaje assistant puede contener cero o más `ProposalCardView`.

## ProposalCardView

Proyección de un `FormUpdate` existente.

| Field | Source/derivation | Validation |
|-------|-------------------|------------|
| `proposalId` | update existente | obligatorio para decisión |
| `fieldLabel` | mapa presentacional | título `Propuesta para <campo>` |
| `proposedValue` | `value` | se muestra completo; wrap sin truncamiento |
| `status` | update existente | acciones visibles solo cuando `proposed` |
| `editDraft` | estado local de `TaskChat` | conserva valor hasta decisión o corrección |
| `editError` | validación presentacional | alerta asociada; no emite decisión inválida |
| `decision` | evento existente | `accept`, `edit` o `reject` |

### Decision transitions

```text
proposed ──accept──> applied o conflict según rules existentes
proposed ──edit válido──> applied o conflict según rules existentes
proposed ──edit inválido──> proposed + error local + badge intacto
proposed ──reject──> rejected + campo anterior intacto
```

Contexto, revisión, `methodVersionId`, idempotencia y persistencia siguen bajo
`applyAssistantUpdates`; este feature no redefine sus resultados.

## ComposerViewState

| Field | Source | Rules |
|-------|--------|-------|
| `draft` | prop/estado por tarea | trim solo para decidir envío; valor editable exacto |
| `sendStatus` | flujo existente | ready/submitted/streaming/error |
| `canSend` | derivado | ready, no disabled y texto no vacío tras trim |
| `attachmentAvailable` | constante de alcance | false; botón visible/deshabilitado con explicación |

Enviar texto válido vacía el borrador por el flujo existente. Contraer no
cancela, duplica ni mueve la operación. Error conserva recuperación/reintento.

## VisualEvidenceRecord

Entidad documental, no de producto.

| Field | Rules |
|-------|-------|
| `reference` | IMG-UX-01, IMG-UX-02 o IMG-UX-03 |
| `actual` | uno de ocho ACTUAL IMG-UX-01/02 × viewport |
| `dimension` | jerarquía, contenido, geometría, interacción, responsive o accesibilidad |
| `classification` | `aprobada`, `pendiente` o `defecto` |
| `severity` | obligatoria para defecto |
| `owner` | obligatorio mientras no esté aprobada |
| `humanDecision` | explícita; nunca inferida de snapshot verde |

## Invariants

1. No existe conteo persistido: siempre se deriva.
2. Una tarea no hereda preferencia, draft o ancla de otra.
3. Ocultar el chat no destruye edición local ni operación en curso.
4. Una edición inválida no emite decisión ni reduce el badge.
5. Reject no cambia el campo; accept/edit respetan revisión/contexto existentes.
6. El adjunto deshabilitado no emite eventos ni abre selector.
7. ≤767 conserva tabs/estado móvil existente; ≥768 usa región estructural.
