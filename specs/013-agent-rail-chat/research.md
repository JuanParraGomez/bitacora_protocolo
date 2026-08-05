# Research: Agente como rail contraíble con chat

## D1. Mantener las fronteras existentes

**Decision**: `AgentPanel` posee región, identidad, estado visual, badge y foco;
`TaskChat` posee mensajes, propuestas y compositor; `TaskWorkspace` deriva
conteo y compone el grid; `useWorkspaceState` conserva preferencia por tarea.

**Rationale**: esas responsabilidades ya existen y el flujo de eventos llega a
las reglas/persistencia sin una capa nueva.

**Alternatives considered**: crear un componente/store de agente completo o
mover propuestas al panel. Rechazadas por duplicar estado, handlers y ownership.

## D2. Default contraído sin heurística de apertura

**Decision**: ausencia de preferencia equivale siempre a `collapsed`; mensajes,
fase 1, draft o viewport compacto no abren automáticamente el agente.

**Rationale**: coincide con la spec y con la semántica ya persistida, donde solo
`expanded` se almacena.

**Alternatives considered**: conservar `shouldOpenAgentByDefault`. Rechazada
porque impide predecir/restaurar el estado por tarea.

## D3. Conservar el chat montado al contraer

**Decision**: ocultar el contenido con `v-show`/estado visual y retirarlo de
layout y recorrido, sin desmontar `TaskChat`.

**Rationale**: preserva edición local de propuesta, borrador, ancla y operación
en curso; el async sigue en `TaskWorkspace`.

**Alternatives considered**: `v-if`. Rechazada porque perdería estado local no
persistido, aunque borrador/ancla puedan restaurarse parcialmente.

## D4. Badge derivado, no persistido

**Decision**: contar propuestas `proposed` de `phaseMessages` ya filtrados por
tarea/fase y pasar `pendingProposalCount` a `AgentPanel`.

**Rationale**: el conteo es una proyección del estado autoritativo y se actualiza
con accept/edit/reject sin sincronización adicional.

**Alternatives considered**: guardar el conteo o calcular todas las fases.
Rechazadas por crear estado derivado obsoleto o señalar propuestas invisibles.

## D5. Identidad y orden conversacional deterministas

**Decision**: mostrar avatar, nombre, hora y texto para ambos roles; ordenar por
`createdAt` y conservar el índice original cuando las horas empatan. No renderizar
burbuja vacía si no existe texto/pregunta útil.

**Rationale**: ofrece lectura estable y fixtures reproducibles sin cambiar
`AssistantMessage`.

**Alternatives considered**: añadir autor/fecha formateada al schema. Rechazada:
son valores presentacionales derivados.

## D6. Propuesta completa y edición validada

**Decision**: mostrar `Propuesta para <campo>` y valor completo; reutilizar
`formUpdateSchema` antes de emitir una edición. Accept/edit/reject siguen en
`handleProposalDecision`/`applyAssistantUpdates`.

**Rationale**: el parse actual valida sintaxis de primitivos/JSON, no el shape
completo. Validar en UI conserva la edición y badge ante valor inválido sin
alterar dominio.

**Alternatives considered**: validar solo en rules o crear status nuevo.
Rechazadas porque una edición inválida podría resolverse como rechazo/conflicto
y porque ampliaría el contrato de dominio.

## D7. Adjunto visible y deshabilitado

**Decision**: presentar `Adjuntar archivo` deshabilitado con explicación
accesible; no crear input de archivo, evento ni transferencia.

**Rationale**: satisface la affordance visual sin prometer un pipeline excluido.

**Alternatives considered**: botón activo sin efecto o upload local. Rechazadas
por ser engañoso o ampliar alcance.

## D8. Grid estructural a 1024 y móvil intacto

**Decision**: escritorio/tablet (≥768) usan grid stage+rail/columna; 1024×768
mantiene dos regiones con altura contenida y scroll independiente. ≤767 conserva
`WorkspacePaneTabs` y un plano a la vez.

**Rationale**: IMG-UX-03 exige dos regiones en tablet y spec 015 posee tabs
móviles.

**Alternatives considered**: apilar a 1024 o rediseñar móvil. Rechazadas por
incumplir IMG-UX-03 o invadir spec 015.

## D9. Geometría medible con selectores estables

**Decision**: exponer estado del agente mediante atributo estable y medir ancho
del panel contra layout; reutilizar `assertNoOverlap`, `assertNoOverlapPairs` y
`countPrimaryActions` para stage/agente/compositor/CTA.

**Rationale**: `.agent-panel` sola no distingue rail/columna ni demuestra 7rem/12 %.

**Alternatives considered**: snapshots únicamente. Rechazadas porque un diff no
prueba límites ni independencia de scroll.

## D10. Accesibilidad dual

**Decision**: axe completo en ocho estados más aserciones de nombres, roles,
teclado, Escape, retorno de foco, orden de foco y explicación del adjunto.

**Rationale**: axe no cubre todos los flujos de teclado/foco; contraste aislado
no cubre estructura o nombres.

**Alternatives considered**: solo regla `color-contrast`. Rechazada por el
contrato 013 y cobertura insuficiente.

## D11. Candidatas controladas y gate humano

**Decision**: introducir tres modos del arnés: `contract` ejecuta DOM/geometría/
axe sin snapshots; `evidence` captura ACTUAL deterministas sin
`toHaveScreenshot`; `baseline` conserva comparación/update. Ejecutar `contract`
en ocho estados, luego `evidence` con `--grep`, completar Capa C y obtener
decisión humana. Solo tras aprobación usar `baseline --update-snapshots`.
IMG-UX-03 es comparación tablet, no candidata adicional; revisar colaterales 03/05.

**Rationale**: un pixel diff dentro del test que itera cuatro viewports aborta
los siguientes gates. Separar modos demuestra ocho contratos y evita sobrescribir
baselines antes de aprobación. `--grep` restringe escenarios aunque el filtro de
evidencia no limite todas las escrituras directas actuales.

**Alternatives considered**: update global o aceptar capturas automáticamente.
Rechazadas por contaminar baselines y eliminar la decisión humana.

## D12. Sin cambios de backend, schema ni dependencias

**Decision**: conservar APIs, almacenamiento, `AssistantMessage`, `FormUpdate`,
`ProposalDecision`, rules y mock assistant; ejecutar regresión, no modificarlos.

**Rationale**: el déficit es de composición/presentación y los contratos ya
soportan conversación, propuestas, borrador y estado por tarea.

**Alternatives considered**: endpoint de adjuntos, nuevo store o status.
Rechazadas por alcance y complejidad operacional.
