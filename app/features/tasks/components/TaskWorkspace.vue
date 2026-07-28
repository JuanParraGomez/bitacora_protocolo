<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue';
import type { Task, TaskIndex } from '../domain/task.schema';
import type { AssistanceSettings, AssistantMessage, FormUpdate, PhaseEvaluation, ProposalDecision, TaskPhase } from '../domain/task-assistant.schema';
import { applyAssistantUpdates, buildPhaseRevision, buildPhaseSnapshot, canContinueByAssistant, getLatestCurrentEvaluation, isEvaluationCurrent } from '../domain/task-assistant-rules';
import { currentMethodVersion, gateReasons } from '../domain/task-rules';
import { getPhaseInstructionKey } from '../domain/phase-instructions';
import { assistanceSettingsSchema, phaseEvaluationSchema } from '../domain/task-assistant.schema';
import { STORAGE_KEYS } from '../../../../shared/contracts/storage';
import AssistantSettingsModal from './AssistantSettingsModal.vue';
import { mockWorkspaceAssistant, type ChatRequest, type ChatResponse } from '../services/mock-workspace-assistant';
import DashboardSidebar from './DashboardSidebar.vue';
import GuidedPhaseForm from './GuidedPhaseForm.vue';
import TaskChat from './TaskChat.vue';

const props = withDefaults(defineProps<{
  task: Task;
  activeTasks: TaskIndex['tareas'];
  completedItems: TaskIndex['registros'];
  saveTask?: () => Promise<boolean>;
}>(), {
  saveTask: undefined,
});

const emit = defineEmits<{
  save: [Task];
  dirty: [Task];
  requestEvaluate: [];
  requestEvaluationRetry: [];
  requestBack: [];
  requestContinue: [];
}>();
const localTask = reactive(props.task);
const chatSuggestions = ref<string[]>([]);
const chatSendState = ref<'ready' | 'streaming' | 'submitted' | 'error'>('ready');
const chatError = ref('');
const evaluationError = ref('');
const evaluationState = ref<'idle' | 'evaluating'>('idle');
const conversationContext = ref(0);
const inFlightByRequest = new Map<string, Promise<void>>();
const evaluationInFlight = new Map<string, Promise<void>>();
const isMobile = ref(false);
const sidebarOpen = ref(false);
const mobileFormOpen = ref(false);
const sidebarToggleRef = ref<HTMLElement | null>(null);
const questionnaireButtonRef = ref<HTMLElement | null>(null);
const settingsButtonRef = ref<HTMLElement | null>(null);
const settingsOpen = ref(false);
const settingsSaving = ref(false);
const settingsSaved = ref(false);
const settingsError = ref('');
const assistanceSettings = ref<AssistanceSettings>(assistanceSettingsSchema.parse({}));

const phaseLabel = computed(() => `Fase ${localTask.fase}`);
const phaseTitle = computed(() => {
  const titles: Record<TaskPhase, string> = {
    1: 'Orientación y rastreo',
    2: 'Preguntas de orientación',
    3: 'Ejecución guiada',
    4: 'Final del proyecto',
  };
  return titles[localTask.fase as TaskPhase];
});
const projectLabel = computed(() => `Proyecto ${localTask.tipo || 'General'}`);
const phaseSnapshot = computed(() => buildPhaseSnapshot(localTask, localTask.fase).fields);
const latestEvaluations = computed(() => localTask.assistant.evaluations
  .filter((evaluation) => evaluation.taskId === localTask.id && evaluation.phase === localTask.fase)
  .slice()
  .sort((left, right) => left.createdAt - right.createdAt));
const latestEvaluationsForRequest = computed(() => latestEvaluations.value.slice(-5));
const evaluationHistory = computed(() => [...latestEvaluations.value].sort((left, right) => right.createdAt - left.createdAt));
const latestEvaluation = computed(() => getLatestCurrentEvaluation(localTask));
const isEvaluationStale = computed(() => !!latestEvaluation.value && !isEvaluationCurrent(localTask, latestEvaluation.value));
const canContinue = computed(() => canContinueByAssistant(localTask));
const isEvaluating = computed(() => evaluationState.value === 'evaluating');
const phaseMessages = computed(() => localTask.assistant.messages
  .filter((message) => message.taskId === localTask.id && message.phase === localTask.fase)
  .sort((left, right) => left.createdAt - right.createdAt));
const phasePendingProposals = computed(() => phaseMessages.value
  .flatMap((message) => message.updates)
  .filter((proposal) => proposal.status === 'proposed'));
const phaseContradictions = computed(() => phaseMessages.value.flatMap((message) => message.contradictions));

type SendError = unknown;
type EvaluationError = unknown;
type InFlightEvaluationKey = string;
type WorkspaceEvaluation = Awaited<ReturnType<typeof mockWorkspaceAssistant.evaluate>>;

let mediaQuery: MediaQueryList | null = null;
function updateMobileMode() {
  isMobile.value = mediaQuery ? mediaQuery.matches : false;
  if (!isMobile.value) {
    mobileFormOpen.value = false;
  }
}

function focusSidebarToggle() {
  if (sidebarToggleRef.value) {
    sidebarToggleRef.value.focus();
  }
}

function resetWorkspaceScroll() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0 });
  }
}

function sanitizeAssistanceSettings(raw: unknown): AssistanceSettings {
  const parsed = assistanceSettingsSchema.safeParse(raw);
  return parsed.success ? { ...parsed.data, schemaVersion: 1 } : assistanceSettingsSchema.parse({});
}

async function loadAssistanceSettings() {
  try {
    const response = await $fetch<{ value: string | null }>(`/api/storage/${encodeURIComponent(STORAGE_KEYS.assistanceSettings)}`).catch(() => ({ value: null }));
    assistanceSettings.value = sanitizeAssistanceSettings(response.value ? JSON.parse(response.value) : undefined);
    settingsError.value = '';
  } catch {
    assistanceSettings.value = assistanceSettingsSchema.parse({});
    settingsError.value = 'No se pudieron cargar los ajustes; usando Codex diferido.';
  }
}

function openSettings(event?: Event) {
  settingsButtonRef.value = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  settingsSaved.value = false;
  settingsOpen.value = true;
}

function closeSettings(next: boolean) {
  settingsOpen.value = next;
  if (!next) {
    nextTick(() => settingsButtonRef.value?.focus());
  }
}

async function saveAssistanceSettings(nextSettings: AssistanceSettings) {
  settingsSaving.value = true;
  settingsSaved.value = false;
  settingsError.value = '';
  const sanitized = sanitizeAssistanceSettings(nextSettings);
  try {
    await $fetch(`/api/storage/${encodeURIComponent(STORAGE_KEYS.assistanceSettings)}`, {
      method: 'PUT',
      body: { value: JSON.stringify(sanitized) },
    });
    assistanceSettings.value = sanitized;
    settingsSaved.value = true;
  } catch {
    settingsError.value = 'No se pudo guardar la preferencia. Reintenta.';
  } finally {
    settingsSaving.value = false;
  }
}

watch(() => props.task, next => {
  Object.assign(localTask, toRaw(next));
}, { deep: true, immediate: true });
watch(localTask, () => {
  emit('dirty', toRaw(localTask));
}, { deep: true });

watch(sidebarOpen, (next) => {
  if (!next && isMobile.value) {
    focusSidebarToggle();
  }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(max-width: 767px)');
    mediaQuery.addEventListener('change', updateMobileMode);
    updateMobileMode();
    resetWorkspaceScroll();
    void loadAssistanceSettings();
  }
});

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', updateMobileMode);
  }
});

function onTaskDirty() {
  emit('dirty', toRaw(localTask));
}

function onTaskSave() {
  emit('save', toRaw(localTask));
}

function openQuestionnaire() {
  mobileFormOpen.value = true;
}

function onMobileFormClose() {
  mobileFormOpen.value = false;
  nextTick(() => {
    questionnaireButtonRef.value?.focus();
  });
}

function markEvaluationError(message: string) {
  evaluationError.value = message;
  evaluationState.value = 'idle';
}

function readTextFromMessage(message: AssistantMessage): string {
  return message.parts.map((part: { type: string; text?: string }) => part.type === 'text' ? part.text ?? '' : '').join(' ').trim();
}

function setUserMessageStatus(messageId: string, status: AssistantMessage['status']) {
  const index = localTask.assistant.messages.findIndex((message) => message.id === messageId);
  if (index < 0) return;
  localTask.assistant.messages[index] = {
    ...localTask.assistant.messages[index],
    status,
  };
}

function applyAssistantResponse(task: Task, response: ChatResponse, userMessageId: string) {
  const responseContext = {
    projectId: response.projectId,
    taskId: response.taskId,
    phase: response.phase,
    methodVersionId: response.methodVersionId,
    baseRevision: response.baseRevision,
  };
  const proposals = response.proposals ?? response.updates;
  const updateResult = applyAssistantUpdates(task, proposals, { response: responseContext });
  const pending = updateResult.pending.map((update) => ({ ...(update as FormUpdate), status: 'proposed' as const }));
  const rejected = updateResult.rejected.map((update) => ({
    ...(update as FormUpdate),
    status: (update.status === 'conflict' ? 'conflict' : 'rejected') as ChatUpdateStatus,
  }));
  const assistantUpdates: (FormUpdate & { status: ChatUpdateStatus })[] = [
    ...pending,
    ...rejected,
  ];

  const mergedTask = updateResult.task;
  const assistantMessageId = `assistant-${userMessageId}`;
  const nextMessages = [...mergedTask.assistant.messages];
  const userIndex = nextMessages.findIndex((message) => message.id === userMessageId);
  if (userIndex >= 0) {
    nextMessages[userIndex] = {
      ...nextMessages[userIndex],
      status: 'sent',
    };
  }

  const assistantMessage: AssistantMessage = {
    id: assistantMessageId,
    projectId: response.projectId,
    taskId: localTask.id,
    phase: localTask.fase,
    methodVersionId: response.methodVersionId,
    baseRevision: response.baseRevision,
    role: 'assistant',
    parts: [{ type: 'text', text: response.message }],
    status: 'sent',
    createdAt: Date.now(),
    primaryQuestion: response.primaryQuestion,
    contradictions: response.contradictions,
    updates: assistantUpdates,
  };

  nextMessages.push(assistantMessage);
  mergedTask.assistant.messages = nextMessages;
  Object.assign(localTask, mergedTask);
}

function appendEvaluation(evaluation: WorkspaceEvaluation) {
  const { requestId: _requestId, ...normalizedEvaluation } = evaluation;

  const normalized: PhaseEvaluation = {
    ...phaseEvaluationSchema.parse(normalizedEvaluation),
    createdAt: Date.now(),
  };

  localTask.assistant.evaluations = [
    ...localTask.assistant.evaluations.filter((entry) => entry.id !== normalized.id),
    normalized,
  ];
}

type ChatUpdateStatus = 'proposed' | 'applied' | 'rejected' | 'conflict';

function handleProposalDecision(decision: ProposalDecision) {
  const sourceMessage = localTask.assistant.messages.find((message: AssistantMessage) =>
    message.role === 'assistant' && message.updates.some((proposal: FormUpdate) => proposal.id === decision.proposalId));
  const proposal = sourceMessage?.updates.find((candidate: FormUpdate) => candidate.id === decision.proposalId);
  if (!sourceMessage || !proposal) return;

  const result = applyAssistantUpdates(localTask, [proposal], {
    response: {
      projectId: proposal.projectId,
      taskId: proposal.taskId,
      phase: proposal.phase,
      methodVersionId: proposal.methodVersionId,
      baseRevision: proposal.baseRevision,
    },
    decision,
  });
  const resolved = result.applied[0] ?? result.rejected[0] ?? result.pending[0];
  if (!resolved) return;

  const targetMessage = result.task.assistant.messages.find((message: AssistantMessage) => message.id === sourceMessage.id);
  if (targetMessage) {
    targetMessage.updates = targetMessage.updates.map((candidate: FormUpdate) =>
      candidate.id === resolved.id ? resolved : candidate);
  }
  Object.assign(localTask, result.task);
  emit('dirty', toRaw(localTask));
  emit('save', toRaw(localTask));
}

async function handleSendMessage(text: string, options: { retryMessageId?: string } = {}) {
  if (chatSendState.value === 'submitted' || chatSendState.value === 'streaming') return;
  const normalized = text.trim();
  if (!normalized) return;

  const contextId = conversationContext.value;
  const requestId = options.retryMessageId || `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const userMessageId = options.retryMessageId || `message-${requestId}`;
  const request: ChatRequest = {
    requestId,
    projectId: localTask.projectId,
    workspaceLabel: projectLabel.value,
    taskId: localTask.id,
    phase: localTask.fase as TaskPhase,
    methodVersionId: currentMethodVersion(localTask)?.id ?? null,
    baseRevision: buildPhaseRevision(localTask, localTask.fase),
    message: normalized,
    phaseSnapshot: phaseSnapshot.value,
    confirmedFields: phaseSnapshot.value,
    pendingProposals: phasePendingProposals.value,
    contradictions: phaseContradictions.value,
    recentMessages: phaseMessages.value,
    previousEvaluations: latestEvaluationsForRequest.value,
  };

  const existingMessage = localTask.assistant.messages.find((message) => message.id === userMessageId && message.taskId === localTask.id && message.phase === localTask.fase);
  if (existingMessage) {
    setUserMessageStatus(userMessageId, 'sending');
  } else {
    const draftMessage: AssistantMessage = {
      id: userMessageId,
      projectId: localTask.projectId,
      taskId: localTask.id,
      phase: localTask.fase,
      methodVersionId: currentMethodVersion(localTask)?.id ?? null,
      baseRevision: request.baseRevision,
      role: 'user',
      parts: [{ type: 'text', text: normalized }],
      status: 'sending',
      createdAt: Date.now(),
      primaryQuestion: null,
      contradictions: [],
      updates: [],
    };
    localTask.assistant.messages = [...localTask.assistant.messages, draftMessage];
  }

  if (inFlightByRequest.has(requestId)) {
    return;
  }

  chatSendState.value = 'submitted';
  chatError.value = '';
  chatSuggestions.value = [];

  const promise = (async () => {
    try {
      const response = await mockWorkspaceAssistant.send(request);
      if (contextId !== conversationContext.value) return;

      applyAssistantResponse(localTask, response, userMessageId);
      emit('save', toRaw(localTask));
      chatSuggestions.value = response.suggestions;
      chatSendState.value = 'ready';
    } catch (cause: SendError) {
      if (contextId !== conversationContext.value) return;

      setUserMessageStatus(userMessageId, 'error');
      chatSendState.value = 'error';
      chatError.value = cause instanceof Error ? cause.message : 'No se pudo enviar el mensaje.';
    } finally {
      inFlightByRequest.delete(requestId);
      if (contextId === conversationContext.value && chatSendState.value === 'submitted') {
        chatSendState.value = 'ready';
      }
    }
  })();
  inFlightByRequest.set(requestId, promise);
  await promise;
}

async function performEvaluation() {
  if (evaluationState.value === 'evaluating') return;
  const contextId = conversationContext.value;
  const responseRevision = buildPhaseRevision(localTask, localTask.fase);
  const inFlightKey: InFlightEvaluationKey = `${localTask.id}-${localTask.fase}-${responseRevision}`;
  if (evaluationInFlight.has(inFlightKey)) return;
  const relevantPreviousEvaluations = latestEvaluationsForRequest.value
    .filter((entry) => entry.responseRevision === responseRevision);

  const requestId = `evaluation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const request = {
    requestId,
    taskId: localTask.id,
    phase: localTask.fase as TaskPhase,
    responseRevision,
    phaseSnapshot: phaseSnapshot.value,
    gateReasons: gateReasons(localTask),
    instructionKey: getPhaseInstructionKey(localTask.fase as TaskPhase),
    previousEvaluations: relevantPreviousEvaluations,
    activeMethodVersionId: currentMethodVersion(localTask)?.id ?? null,
  };

  const promise = (async () => {
    evaluationState.value = 'evaluating';
    evaluationError.value = '';

    try {
      const evaluation = await mockWorkspaceAssistant.evaluate(request);
      if (contextId !== conversationContext.value) return;

      const currentRevision = buildPhaseRevision(localTask, localTask.fase);
      if (currentRevision !== responseRevision) {
        markEvaluationError('La evaluación llegó desfasada para este estado. Reevalúa.');
        return;
      }

      appendEvaluation(evaluation);
      emit('save', toRaw(localTask));
      evaluationError.value = '';
    } catch (cause: EvaluationError) {
      if (contextId !== conversationContext.value) return;
      markEvaluationError(cause instanceof Error ? cause.message : 'No se pudo evaluar. Reintenta.');
    } finally {
      evaluationInFlight.delete(inFlightKey);
      if (contextId === conversationContext.value && evaluationState.value === 'evaluating') {
        evaluationState.value = 'idle';
      }
    }
  })();

  evaluationInFlight.set(inFlightKey, promise);
  await promise;
}

function onEvaluationRequest() {
  void performEvaluation();
}

function onEvaluationRetry() {
  void performEvaluation();
}

function onRequestBack() {
  emit('requestBack');
}

function onRequestContinue() {
  emit('requestContinue');
}

function onChatSubmit(text: string) {
  void handleSendMessage(text);
}

function onChatRetry(messageId: string) {
  const message = localTask.assistant.messages.find((candidate) => candidate.id === messageId && candidate.role === 'user');
  if (!message) return;
  void handleSendMessage(readTextFromMessage(message), { retryMessageId: messageId });
}

watch(() => [localTask.id, localTask.fase], () => {
  resetWorkspaceScroll();
  chatError.value = '';
  chatSendState.value = 'ready';
  chatSuggestions.value = [];
  evaluationError.value = '';
  evaluationState.value = 'idle';
  evaluationInFlight.clear();
  conversationContext.value += 1;
}, { deep: true });
</script>

<template>
  <div class="workspace-shell">
    <button
      v-if="isMobile"
      ref="sidebarToggleRef"
      type="button"
      class="task-sidebar__toggle"
      data-focus-target="sidebar-toggle"
      aria-label="Open"
      @click="sidebarOpen = true"
    >
      Open
    </button>

    <div v-if="!isMobile" class="workspace-sidebar-frame">
      <DashboardSidebar
        :project-name="projectLabel"
        :active-tasks="activeTasks"
        :completed-items="completedItems"
        :selected-task-id="localTask.id"
        @open-settings="openSettings"
      />
    </div>

    <UDashboardSidebar
      v-if="isMobile"
      v-model:open="sidebarOpen"
      :mode="isMobile ? 'slideover' : 'drawer'"
      :default-size="16"
      :auto-close="true"
      @update:open="(next) => (sidebarOpen = next)"
    >
      <template #content>
        <DashboardSidebar
          :project-name="projectLabel"
          :active-tasks="activeTasks"
          :completed-items="completedItems"
          :selected-task-id="localTask.id"
          @open-settings="openSettings"
        />
      </template>

      <template #default="{ collapse }">
        <DashboardSidebar
          :project-name="projectLabel"
          :active-tasks="activeTasks"
          :completed-items="completedItems"
          :selected-task-id="localTask.id"
          @open-settings="(event) => { openSettings(event); collapse(true); }"
          @click="collapse(true)"
        />
      </template>
    </UDashboardSidebar>

    <div class="workspace-panel workspace-panel--chat">
      <section role="region" aria-label="Centro de conversación" class="workspace-section workspace-section--chat">
        <header class="workspace-section__header">
          <div>
            <p class="workspace-section__eyebrow">{{ phaseLabel }}</p>
            <h1>{{ localTask.nombre || 'Tarea' }}</h1>
          </div>
          <p>{{ phaseTitle }}</p>
        </header>
        <TaskChat
          :messages="phaseMessages"
          :suggestions="chatSuggestions"
          :send-status="chatSendState"
          :disabled="false"
          :error-message="chatError"
          :workspace-label="projectLabel"
          @send="onChatSubmit"
          @retry="onChatRetry"
          @proposal-decision="handleProposalDecision"
        />

        <p v-if="isMobile" class="workspace-section__mobile-action">
          <button type="button" ref="questionnaireButtonRef" data-focus-target="form" @click="openQuestionnaire">Cuestionario</button>
        </p>
      </section>
    </div>

    <div v-if="!isMobile" class="workspace-panel workspace-panel--form">
      <section
        role="region"
        aria-label="Formulario guiado"
        data-mobile-form-panel
        class="workspace-section workspace-section--form"
      >
        <GuidedPhaseForm
          :task="localTask"
          :save-task="props.saveTask"
          :evaluation="latestEvaluation"
          :is-evaluating="isEvaluating"
          :is-stale-evaluation="isEvaluationStale"
          :can-continue="canContinue"
          :evaluation-error="evaluationError"
          :evaluation-history="evaluationHistory"
          @dirty="onTaskDirty"
          @save="onTaskSave"
          @request-evaluate="onEvaluationRequest"
          @request-evaluation-retry="onEvaluationRetry"
          @request-back="onRequestBack"
          @request-continue="onRequestContinue"
        />
      </section>
    </div>

    <USlideover
      v-if="isMobile"
      v-model:open="mobileFormOpen"
      title="Formulario guiado"
      @update:open="(next) => {
        if (!next) {
          onMobileFormClose();
        }
      }"
    >
      <template #content>
        <section
          role="region"
          aria-label="Formulario guiado"
          data-mobile-form-panel
          class="workspace-section workspace-section--form"
        >
          <GuidedPhaseForm
            :task="localTask"
            :save-task="props.saveTask"
            :evaluation="latestEvaluation"
            :is-evaluating="isEvaluating"
            :is-stale-evaluation="isEvaluationStale"
            :can-continue="canContinue"
            :evaluation-error="evaluationError"
            :evaluation-history="evaluationHistory"
            @dirty="onTaskDirty"
            @save="onTaskSave"
            @request-evaluate="onEvaluationRequest"
            @request-evaluation-retry="onEvaluationRetry"
            @request-back="onRequestBack"
            @request-continue="onRequestContinue"
          />
        </section>
      </template>
    </USlideover>

    <AssistantSettingsModal
      :open="settingsOpen"
      :settings="assistanceSettings"
      :saving="settingsSaving"
      :saved="settingsSaved"
      :error-message="settingsError"
      @update:open="closeSettings"
      @save="saveAssistanceSettings"
    />
  </div>
</template>

<style scoped>
.workspace-shell {
  position: relative;
  display: grid;
  grid-template-columns: minmax(15rem, 18rem) minmax(0, 1.85fr) minmax(22rem, .95fr);
  gap: 0;
  align-items: stretch;
  min-width: 0;
  height: 100vh;
  min-height: 0;
  max-height: 100vh;
  overflow: hidden;
  padding: .7rem;
  color: #171d19;
  background:
    linear-gradient(90deg, rgba(0, 122, 77, .035), transparent 32%),
    #f4f7f3;
}

.workspace-sidebar-frame {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.workspace-section {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 0;
  min-width: 0;
  min-height: 0;
  height: calc(100vh - 1.4rem);
  overflow: hidden;
  border: 1px solid #d7ddd8;
  background: rgba(255, 255, 255, .88);
}

.workspace-section--chat,
.workspace-section--form {
  min-height: 100%;
}

.workspace-section--chat {
  border-radius: 0;
}

.workspace-section--form {
  border-left: 0;
  border-radius: 0 .95rem .95rem 0;
}

.workspace-section__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  min-width: 0;
  padding: 1.25rem 1.65rem 1.05rem;
  border-bottom: 1px solid #dde3de;
}

.workspace-section__header h1 {
  margin: 0;
  color: #0f1511;
  font-size: 1.35rem;
  font-weight: 760;
  line-height: 1.15;
}

.workspace-section__header p {
  margin: 0;
  color: #59645d;
  font-size: .85rem;
}

.workspace-section__eyebrow {
  color: #007a4d !important;
  font-size: .72rem !important;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.workspace-section__mobile-action {
  margin: 0;
  padding: .85rem 1rem;
  border-top: 1px solid #dde3de;
  background: #fff;
}

.workspace-section__mobile-action button {
  width: 100%;
  border-color: #007a4d;
  color: #fff;
  background: #007a4d;
}

.workspace-sidebar-frame :deep(aside.task-sidebar) {
  height: 100%;
  min-height: 0;
  overflow: auto;
  border: 1px solid #d7ddd8;
  border-right: 0;
  border-radius: .95rem 0 0 .95rem;
}

.workspace-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.workspace-section--chat textarea {
  min-height: 6rem;
  width: 100%;
}

.workspace-panel :deep(.workspace-shell) {
  min-width: 0;
}

@media (max-width: 767px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    height: 100vh;
    min-height: 0;
    padding: .5rem;
  }

  .workspace-section {
    height: calc(100vh - 1rem);
    min-height: 0;
    border-radius: .8rem;
  }

  .workspace-section__header {
    align-items: start;
    flex-direction: column;
    padding: 1rem;
  }

  .task-sidebar__toggle {
    position: fixed;
    z-index: 20;
    top: .8rem;
    right: .8rem;
    border-color: #007a4d;
    color: #fff;
    background: #007a4d;
  }
}
</style>
