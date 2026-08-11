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
import LibrarySlideover from '~/app/features/library/components/LibrarySlideover.vue';
import type { Project } from '../domain/project.schema';
import AgentPanel from './AgentPanel.vue';
import DashboardSidebar, { type WorkspaceProjectGroup } from './DashboardSidebar.vue';
import GuidedPhaseForm from './GuidedPhaseForm.vue';
import NewTaskModal from './NewTaskModal.vue';
import NoticeRegion from './NoticeRegion.vue';
import StructuredStageSummary from './StructuredStageSummary.vue';
import TaskCompletionSummary from './TaskCompletionSummary.vue';
import WorkspaceHeader from './WorkspaceHeader.vue';
import WorkspacePaneTabs from './WorkspacePaneTabs.vue';
import { WORKSPACE_SHELL_BREAKPOINTS } from './workspace-shell-presentation';
import type { WorkspaceNotice } from '../composables/useWorkspaceNotices';
import type { WorkspaceAgentPanelState, WorkspaceMobilePaneState, WorkspaceOverlayState } from '../composables/useWorkspaceState';
import { resolveContextualPrimaryAction, resolveEvaluationDisplay, resolveEvaluationRecovery } from './workspace-presentation';

const props = withDefaults(defineProps<{
  task: Task;
  projectGroups?: WorkspaceProjectGroup[];
  activeProjectId?: string;
  projectName?: string;
  expandedProjectIds?: string[];
  searchQuery?: string;
  sidebarCollapsed?: boolean;
  composerDraft?: string;
  summaryState?: 'hidden' | 'collapsed' | 'expanded' | 'review';
  lastVisibleMessageId?: string | null;
  activeTasks?: TaskIndex['tareas'];
  completedItems?: TaskIndex['registros'];
  saveTask?: () => Promise<boolean>;
  activeOverlay?: WorkspaceOverlayState;
  overlayRecordId?: string | null;
  overlayProjectId?: string | null;
  notices?: WorkspaceNotice[];
  agentPanelState?: WorkspaceAgentPanelState;
  mobilePane?: WorkspaceMobilePaneState;
}>(), {
  projectGroups: () => [],
  activeProjectId: '',
  projectName: '',
  expandedProjectIds: () => [],
  searchQuery: undefined,
  sidebarCollapsed: undefined,
  composerDraft: undefined,
  summaryState: undefined,
  lastVisibleMessageId: null,
  activeTasks: () => [],
  completedItems: () => [],
  saveTask: undefined,
  activeOverlay: null,
  overlayRecordId: null,
  overlayProjectId: null,
  notices: () => [],
  agentPanelState: undefined,
  mobilePane: undefined,
});

const emit = defineEmits<{
  save: [Task, { operationId?: string }?];
  dirty: [Task];
  requestEvaluate: [];
	  requestEvaluationRetry: [];
	  requestBack: [];
	  requestContinue: [];
	  requestReturn: [];
  createProject: [name: string];
  renameProject: [payload: { projectId: string; name: string }];
  renameTask: [payload: { taskId: string; name: string }];
  selectProject: [projectId: string];
  selectTask: [payload: { projectId: string; taskId: string }];
  toggleProject: [payload: { projectId: string; expanded: boolean }];
  searchTasks: [query: string];
  updateSidebarCollapsed: [collapsed: boolean];
  updateDraft: [payload: { taskId: string; draft: string }];
  updateSummaryState: [payload: { taskId: string; state: 'collapsed' | 'expanded' | 'review' }];
  updateLastVisibleMessage: [payload: { taskId: string; messageId: string | null }];
  requestOverlay: [payload: { overlay: WorkspaceOverlayState; projectId?: string | null; recordId?: string | null }];
  dismissNotice: [id: string];
  retryNotice: [id: string];
  updateAgentPanelState: [payload: { taskId: string; state: WorkspaceAgentPanelState }];
  updateMobilePane: [payload: { taskId: string; state: WorkspaceMobilePaneState }];
  libraryRecordLinked: [payload: {
    recordId: string;
    title: string;
    status: 'linked' | 'already-linked' | 'error';
    reason?: 'record-missing' | 'task-missing' | 'task-invalid' | 'write-failed';
    task?: Record<string, unknown> | null;
  }];
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
const isCompact = ref(false);
const isMobile = ref(false);
const sidebarOpen = ref(false);
const sidebarDrawerRef = ref<HTMLElement | null>(null);
const sidebarCloseButtonRef = ref<HTMLButtonElement | null>(null);
const workspaceHeaderRef = ref<InstanceType<typeof WorkspaceHeader> | null>(null);
const desktopAgentPanelRef = ref<InstanceType<typeof AgentPanel> | null>(null);
const mobileAgentPanelRef = ref<InstanceType<typeof AgentPanel> | null>(null);
const fallbackAgentPanelState = ref<WorkspaceAgentPanelState>('collapsed');
const fallbackMobilePane = ref<WorkspaceMobilePaneState>('stage');
const settingsButtonRef = ref<HTMLElement | null>(null);
const settingsOpen = ref(false);
const settingsSaving = ref(false);
const settingsSaved = ref(false);
const settingsError = ref('');
const assistanceSettings = ref<AssistanceSettings>(assistanceSettingsSchema.parse({}));
const fallbackSidebarCollapsed = ref(false);
const fallbackDrafts = reactive<Record<string, string>>({});
const fallbackSummaryStates = reactive<Record<string, 'collapsed' | 'expanded' | 'review'>>({});

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
const fallbackProject = computed<Project>(() => ({
  id: localTask.projectId || 'legacy',
  name: props.projectName || (localTask.projectId === 'legacy' ? 'Tareas anteriores' : 'Proyecto'),
  description: '',
  status: 'active',
  lastActiveTaskId: localTask.id,
  createdAt: 0,
  updatedAt: 0,
}));
const fallbackProjectGroup = computed<WorkspaceProjectGroup>(() => ({
  project: fallbackProject.value,
  activeTasks: props.activeTasks.filter((task) => task.estado === 'activa'),
  pausedTasks: props.activeTasks.filter((task) => task.estado === 'pausada'),
  completedTasks: props.activeTasks.filter((task) => task.estado === 'completada'),
  completedItems: props.completedItems,
  isEmpty: props.activeTasks.length === 0 && props.completedItems.length === 0,
}));
const projectGroups = computed(() => (
  props.projectGroups.length > 0 ? props.projectGroups : [fallbackProjectGroup.value]
));
const selectedProjectId = computed(() => props.activeProjectId || localTask.projectId || 'legacy');
const selectedProjectGroup = computed(() => (
  projectGroups.value.find((group) => group.project.id === selectedProjectId.value) ?? null
));
const selectedProjectTasks = computed(() => {
  const group = selectedProjectGroup.value;
  return group
    ? [...group.activeTasks, ...group.pausedTasks, ...group.completedTasks]
    : [];
});
const selectedProjectHasLocalTask = computed(() => (
  selectedProjectTasks.value.some((task) => task.id === localTask.id)
  || (localTask.estado === 'completada' && selectedProjectId.value === (localTask.projectId || 'legacy'))
  || (!selectedProjectGroup.value && selectedProjectId.value === localTask.projectId)
));
const activeProject = computed(() => (
  selectedProjectGroup.value?.project
  ?? projectGroups.value.find((group) => group.project.id === localTask.projectId)?.project
  ?? fallbackProject.value
));
const projectLabel = computed(() => activeProject.value.name);
const effectiveSidebarCollapsed = computed(() => props.sidebarCollapsed ?? fallbackSidebarCollapsed.value);
const effectiveDraft = computed(() => props.composerDraft ?? fallbackDrafts[localTask.id] ?? '');
const effectiveSummaryState = computed(() => (
  props.summaryState ?? fallbackSummaryStates[localTask.id] ?? 'collapsed'
));
const effectiveAgentPanelState = computed<WorkspaceAgentPanelState>(() => (
  props.agentPanelState
  ?? fallbackAgentPanelState.value
));
const effectiveMobilePane = computed<WorkspaceMobilePaneState>(() => (
  props.mobilePane ?? fallbackMobilePane.value
));
const isAgentPanelExpanded = computed(() => (
  isMobile.value ? true : effectiveAgentPanelState.value === 'expanded'
));
const isTablet = computed(() => isCompact.value && !isMobile.value);
const hasAgentPending = computed(() => (
  phasePendingProposals.value.length > 0 || evaluationRecovery.value.pendingCount > 0
));
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
const isCompletedTask = computed(() => localTask.estado === 'completada');
const fieldGateResult = computed(() => {
  const reasons = gateReasons(localTask);
  return {
    allowed: reasons.length === 0 && canContinue.value,
    reasons,
  };
});
const contextualPrimaryAction = computed(() => resolveContextualPrimaryAction({
  phase: localTask.fase as TaskPhase,
  taskState: localTask.estado === 'completada' ? 'completed' : 'active',
  evaluation: latestEvaluation.value,
  isEvaluating: isEvaluating.value,
  isStaleEvaluation: isEvaluationStale.value,
  gateResult: fieldGateResult.value,
  transportError: evaluationError.value,
}));
const evaluationDisplay = computed(() => resolveEvaluationDisplay({
  phase: localTask.fase as TaskPhase,
  latestEvaluation: latestEvaluation.value,
  isEvaluating: isEvaluating.value,
  isStaleEvaluation: isEvaluationStale.value,
  transportError: evaluationError.value,
  gateResult: fieldGateResult.value,
}));
const evaluationRecovery = computed(() => resolveEvaluationRecovery({
  phase: localTask.fase as TaskPhase,
  latestEvaluation: latestEvaluation.value,
  isEvaluating: isEvaluating.value,
  isStaleEvaluation: isEvaluationStale.value,
  transportError: evaluationError.value,
  gateResult: fieldGateResult.value,
}));
const isEvaluating = computed(() => evaluationState.value === 'evaluating');
const phaseMessages = computed(() => localTask.assistant.messages
  .filter((message) => message.taskId === localTask.id && message.phase === localTask.fase)
  .sort((left, right) => left.createdAt - right.createdAt));
const phasePendingProposals = computed(() => phaseMessages.value
  .flatMap((message) => message.updates)
  .filter((proposal) => (
    proposal.status === 'proposed'
    && proposal.taskId === localTask.id
    && proposal.phase === localTask.fase
  )));
const phaseContradictions = computed(() => phaseMessages.value.flatMap((message) => message.contradictions));

type SendError = unknown;
type EvaluationError = unknown;
type InFlightEvaluationKey = string;
type WorkspaceEvaluation = Awaited<ReturnType<typeof mockWorkspaceAssistant.evaluate>>;

let compactMediaQuery: MediaQueryList | null = null;
let mobileMediaQuery: MediaQueryList | null = null;
function updateResponsiveMode() {
  isCompact.value = compactMediaQuery ? compactMediaQuery.matches : false;
  isMobile.value = mobileMediaQuery ? mobileMediaQuery.matches : false;
  if (!isCompact.value) {
    sidebarOpen.value = false;
  }
}

function focusSidebarToggle() {
  workspaceHeaderRef.value?.focusNavigation();
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
  emit('requestOverlay', { overlay: 'settings' });
}

function closeSettings(next: boolean) {
  settingsOpen.value = next;
  emit('requestOverlay', { overlay: next ? 'settings' : null });
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
watch(() => props.activeOverlay, (next) => {
  settingsOpen.value = next === 'settings';
}, { immediate: true });
watch(() => props.agentPanelState, (next) => {
  fallbackAgentPanelState.value = next ?? 'collapsed';
}, { immediate: true });
watch(() => props.mobilePane, (next) => {
  fallbackMobilePane.value = next ?? 'stage';
}, { immediate: true });
watch(localTask, () => {
  emit('dirty', toRaw(localTask));
}, { deep: true });

watch(sidebarOpen, async (next) => {
  await nextTick();
  if (next) {
    sidebarCloseButtonRef.value?.focus();
  } else if (isCompact.value) {
    focusSidebarToggle();
  }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    compactMediaQuery = window.matchMedia(`(max-width: ${WORKSPACE_SHELL_BREAKPOINTS.tabletMax}px)`);
    mobileMediaQuery = window.matchMedia(`(max-width: ${WORKSPACE_SHELL_BREAKPOINTS.mobileMax}px)`);
    compactMediaQuery.addEventListener('change', updateResponsiveMode);
    mobileMediaQuery.addEventListener('change', updateResponsiveMode);
    updateResponsiveMode();
    resetWorkspaceScroll();
    void loadAssistanceSettings();
  }
});

onBeforeUnmount(() => {
  compactMediaQuery?.removeEventListener('change', updateResponsiveMode);
  mobileMediaQuery?.removeEventListener('change', updateResponsiveMode);
});

function onTaskDirty() {
  emit('dirty', toRaw(localTask));
}

function onTaskSave() {
  emit('save', toRaw(localTask), {
    operationId: `form-save:${localTask.id}:${localTask.fase}:${Date.now().toString(36)}`,
  });
}

function onSidebarKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    sidebarOpen.value = false;
    return;
  }
  if (event.key !== 'Tab') return;

  const drawer = sidebarDrawerRef.value;
  if (!drawer) return;
  const controls = Array.from(drawer.querySelectorAll<HTMLElement>([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'summary',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', '))).filter((element) => element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!drawer.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function updateSidebarCollapsed(collapsed: boolean) {
  fallbackSidebarCollapsed.value = collapsed;
  emit('updateSidebarCollapsed', collapsed);
}

function updateDraft(draft: string) {
  fallbackDrafts[localTask.id] = draft;
  emit('updateDraft', { taskId: localTask.id, draft });
}

function updateSummaryState(state: 'collapsed' | 'expanded' | 'review') {
  fallbackSummaryStates[localTask.id] = state;
  emit('updateSummaryState', { taskId: localTask.id, state });
}

function updateLastVisibleMessage(messageId: string | null) {
  emit('updateLastVisibleMessage', { taskId: localTask.id, messageId });
}

function updateAgentPanelState(state: WorkspaceAgentPanelState) {
  fallbackAgentPanelState.value = state;
  emit('updateAgentPanelState', { taskId: localTask.id, state });
}

function updateMobilePane(state: WorkspaceMobilePaneState) {
  fallbackMobilePane.value = state;
  emit('updateMobilePane', { taskId: localTask.id, state });
}

function onSelectTask(payload: { projectId: string; taskId: string }) {
  emit('selectTask', payload);
  if (isCompact.value) sidebarOpen.value = false;
}

function onSelectProject(projectId: string) {
  emit('selectProject', projectId);
}

function requestNewTask(projectId?: string) {
  emit('requestOverlay', {
    overlay: 'new-task',
    projectId: projectId ?? selectedProjectId.value,
  });
}

function requestLibrary(recordId?: string | null) {
  emit('requestOverlay', {
    overlay: 'library',
    projectId: selectedProjectId.value,
    recordId: recordId ?? null,
  });
}

function markEvaluationError(message: string) {
  evaluationError.value = message;
  evaluationState.value = 'idle';
}

function readTextFromMessage(message: AssistantMessage): string {
  return message.parts.map((part: { type: string; text?: string }) => part.type === 'text' ? part.text ?? '' : '').join(' ').trim();
}

function setUserMessageStatus(
  messageId: string,
  status: AssistantMessage['status'],
  targetTask: Task = localTask,
) {
  const index = targetTask.assistant.messages.findIndex((message) => message.id === messageId);
  if (index < 0) return;
  targetTask.assistant.messages[index] = {
    ...targetTask.assistant.messages[index],
    status,
  };
}

function cloneTask(task: Task): Task {
  return JSON.parse(JSON.stringify(toRaw(task))) as Task;
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
  Object.assign(task, mergedTask);
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
  if (isCompletedTask.value) return;
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
  emit('save', toRaw(localTask), {
    operationId: `proposal-save:${decision.proposalId}`,
  });
}

async function handleSendMessage(text: string, options: { retryMessageId?: string } = {}) {
  if (isCompletedTask.value) return;
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

  const originTask = cloneTask(localTask);
  emit('save', originTask, {
    operationId: `chat-send:${requestId}`,
  });
  chatSendState.value = 'submitted';
  chatError.value = '';
  chatSuggestions.value = [];

  const promise = (async () => {
    try {
      const response = await mockWorkspaceAssistant.send(request);
      applyAssistantResponse(originTask, response, userMessageId);
      const originIsCurrent = contextId === conversationContext.value
        && localTask.id === originTask.id
        && localTask.fase === originTask.fase;
      if (originIsCurrent) {
        Object.assign(localTask, originTask);
        chatSuggestions.value = response.suggestions;
        chatSendState.value = 'ready';
        emit('save', originTask, {
          operationId: `chat-send:${requestId}`,
        });
      }
    } catch (cause: SendError) {
      setUserMessageStatus(userMessageId, 'error', originTask);
      const originIsCurrent = contextId === conversationContext.value
        && localTask.id === originTask.id
        && localTask.fase === originTask.fase;
      if (originIsCurrent) {
        Object.assign(localTask, originTask);
        chatSendState.value = 'error';
        chatError.value = cause instanceof Error ? cause.message : 'No se pudo enviar el mensaje.';
        emit('save', originTask, {
          operationId: `chat-send:${requestId}`,
        });
      }
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
      emit('save', toRaw(localTask), {
        operationId: `evaluation-save:${requestId}`,
      });
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

function toggleAgentPanel() {
  updateAgentPanelState(isAgentPanelExpanded.value ? 'collapsed' : 'expanded');
}

async function focusAgentRecommendations() {
  if (isMobile.value) {
    updateMobilePane('agent');
    await nextTick();
    await mobileAgentPanelRef.value?.focusConversation();
    return;
  }
  if (!isAgentPanelExpanded.value) updateAgentPanelState('expanded');
  await nextTick();
  await desktopAgentPanelRef.value?.focusConversation();
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
  <div
    class="workspace-shell"
    :class="{ 'workspace-shell--sidebar-collapsed': effectiveSidebarCollapsed || isCompact }"
  >
    <div v-if="!isCompact && !effectiveSidebarCollapsed" class="workspace-sidebar-frame">
      <DashboardSidebar
        :project-groups="projectGroups"
        :selected-project-id="selectedProjectId"
        :selected-task-id="localTask.id"
        :expanded-project-ids="props.expandedProjectIds"
        :search-query="props.searchQuery"
        :collapsed="effectiveSidebarCollapsed"
        @open-settings="openSettings"
        @open-new-task="requestNewTask"
        @open-library="requestLibrary()"
        @create-project="emit('createProject', $event)"
        @rename-project="emit('renameProject', $event)"
        @rename-task="emit('renameTask', $event)"
        @select-project="onSelectProject"
        @select-task="onSelectTask"
        @toggle-project="emit('toggleProject', $event)"
        @search-tasks="emit('searchTasks', $event)"
        @update-collapsed="updateSidebarCollapsed"
      />
    </div>

    <div
      v-if="isCompact && sidebarOpen"
      ref="sidebarDrawerRef"
      class="workspace-navigation-drawer"
      :class="{ 'workspace-navigation-drawer--mobile': isMobile }"
      role="dialog"
      aria-label="Navegación del workspace"
      :aria-modal="isMobile ? 'true' : 'false'"
      @keydown="onSidebarKeydown"
    >
      <button
        ref="sidebarCloseButtonRef"
        type="button"
        class="workspace-navigation-drawer__close"
        aria-label="Cerrar navegación"
        @click="sidebarOpen = false"
      >
        ×
      </button>
      <div class="workspace-navigation-drawer__content">
        <DashboardSidebar
          :project-groups="projectGroups"
          :selected-project-id="selectedProjectId"
          :selected-task-id="localTask.id"
          :expanded-project-ids="props.expandedProjectIds"
          :search-query="props.searchQuery"
          @open-settings="(event) => { openSettings(event); sidebarOpen = false; }"
          @open-new-task="(projectId) => { requestNewTask(projectId); sidebarOpen = false; }"
          @open-library="() => { requestLibrary(); sidebarOpen = false; }"
          @create-project="emit('createProject', $event)"
          @rename-project="emit('renameProject', $event)"
          @rename-task="emit('renameTask', $event)"
          @select-project="onSelectProject"
          @select-task="onSelectTask"
          @toggle-project="emit('toggleProject', $event)"
          @search-tasks="emit('searchTasks', $event)"
          @update-collapsed="updateSidebarCollapsed"
        />
      </div>
    </div>

    <section
      class="workspace-panel workspace-panel--conversation"
      aria-label="Panel principal del workspace"
      :inert="isMobile && sidebarOpen ? true : undefined"
    >
      <section role="region" aria-label="Centro de conversación" class="workspace-section workspace-section--chat">
        <WorkspaceHeader
          ref="workspaceHeaderRef"
          :project-name="projectLabel"
          :task-name="selectedProjectHasLocalTask ? localTask.nombre : 'Sin tarea seleccionada'"
          :phase="localTask.fase"
          :phase-title="selectedProjectHasLocalTask ? phaseTitle : 'Crea la primera tarea'"
          :compact-navigation="isCompact"
          :mobile-context="isMobile"
          :sidebar-collapsed="effectiveSidebarCollapsed"
          @open-navigation="sidebarOpen = true"
          @expand-sidebar="updateSidebarCollapsed(false)"
          @open-new-task="requestNewTask()"
          @open-library="requestLibrary()"
          @open-settings="openSettings"
        />

        <div
          v-if="selectedProjectHasLocalTask"
          class="workspace-stage-layout"
          :class="{
            'workspace-stage-layout--agent-collapsed': !isAgentPanelExpanded,
            'workspace-stage-layout--tablet': isTablet,
            'workspace-stage-layout--mobile': isMobile,
          }"
        >
          <template v-if="isMobile">
            <WorkspacePaneTabs
              v-model="fallbackMobilePane"
              class="workspace-stage-layout__tabs"
              :agent-pending="hasAgentPending"
              @update:model-value="updateMobilePane"
            >
              <template #stage>
                <section data-scroll-region="stage" class="workspace-stage" :aria-label="isCompletedTask ? 'Lienzo de cierre' : 'Etapa activa'">
                  <header v-if="isCompletedTask" class="workspace-stage__header">
                    <p class="workspace-stage__eyebrow">Tarea completada</p>
                    <h2 id="workspace-stage-title">Lienzo de cierre</h2>
                  </header>
                  <TaskCompletionSummary
                    v-if="isCompletedTask"
                    :task="localTask"
                    :records="props.completedItems"
                    @request-return="emit('requestReturn')"
                  />
                  <template v-else>
                    <section role="region" aria-label="Formulario guiado" class="workspace-stage__form-region">
                      <GuidedPhaseForm
                        :task="localTask"
                        :save-task="props.saveTask"
                        :evaluation="latestEvaluation"
                        :is-evaluating="isEvaluating"
                        :is-stale-evaluation="isEvaluationStale"
                        :can-continue="canContinue"
                        :evaluation-error="evaluationError"
                        :evaluation-history="evaluationHistory"
                        :primary-action="contextualPrimaryAction"
                        :evaluation-display="evaluationDisplay"
                        :compact-presentation="isMobile"
                        @request-agent-recommendations="focusAgentRecommendations"
                        @dirty="onTaskDirty"
                        @save="onTaskSave"
                        @request-evaluate="onEvaluationRequest"
                        @request-evaluation-retry="onEvaluationRetry"
                        @request-back="onRequestBack"
                        @request-continue="onRequestContinue"
                        @request-return="emit('requestReturn')"
                      />
                    </section>
                    <StructuredStageSummary
                      :task="localTask"
                      :evaluation="latestEvaluation"
                      :is-stale-evaluation="isEvaluationStale"
                      :can-continue="canContinue"
                      :state="effectiveSummaryState"
                      @update-state="updateSummaryState"
                    />
                  </template>
                </section>
              </template>
              <template #agent>
                <AgentPanel
                  data-scroll-region="agent"
                  :messages="phaseMessages"
                  :suggestions="chatSuggestions"
                  :send-status="chatSendState"
                  :disabled="isCompletedTask"
                  :error-message="chatError"
                  :workspace-label="projectLabel"
                  :draft="effectiveDraft"
                  :restore-message-id="props.lastVisibleMessageId"
                  :expanded="true"
                  :collapsible="false"
                  :pending-proposals="phasePendingProposals.length"
                  :pending-corrections="evaluationRecovery.pendingCount"
                  ref="mobileAgentPanelRef"
                  @toggle="toggleAgentPanel"
                  @send="onChatSubmit"
                  @retry="onChatRetry"
                  @proposal-decision="handleProposalDecision"
                  @update-draft="updateDraft"
                  @visible-message="updateLastVisibleMessage"
                />
              </template>
            </WorkspacePaneTabs>
          </template>

          <template v-else>
            <section data-scroll-region="stage" class="workspace-stage" :aria-label="isCompletedTask ? 'Lienzo de cierre' : 'Etapa activa'">
              <header v-if="isCompletedTask" class="workspace-stage__header">
                <p class="workspace-stage__eyebrow">Tarea completada</p>
                <h2 id="workspace-stage-title">Lienzo de cierre</h2>
              </header>
              <TaskCompletionSummary
                v-if="isCompletedTask"
                :task="localTask"
                :records="props.completedItems"
                @request-return="emit('requestReturn')"
              />
              <template v-else>
                <section role="region" aria-label="Formulario guiado" class="workspace-stage__form-region">
                  <GuidedPhaseForm
                    :task="localTask"
                    :save-task="props.saveTask"
                    :evaluation="latestEvaluation"
                    :is-evaluating="isEvaluating"
                    :is-stale-evaluation="isEvaluationStale"
                    :can-continue="canContinue"
                    :evaluation-error="evaluationError"
                    :evaluation-history="evaluationHistory"
                    :primary-action="contextualPrimaryAction"
                        :evaluation-display="evaluationDisplay"
                        @request-agent-recommendations="focusAgentRecommendations"
                    @dirty="onTaskDirty"
                    @save="onTaskSave"
                    @request-evaluate="onEvaluationRequest"
                    @request-evaluation-retry="onEvaluationRetry"
                    @request-back="onRequestBack"
                    @request-continue="onRequestContinue"
                    @request-return="emit('requestReturn')"
                  />
                </section>
                <StructuredStageSummary
                  :task="localTask"
                  :evaluation="latestEvaluation"
                  :is-stale-evaluation="isEvaluationStale"
                  :can-continue="canContinue"
                  :state="effectiveSummaryState"
                  @update-state="updateSummaryState"
                />
              </template>
            </section>

            <AgentPanel
              data-scroll-region="agent"
              :messages="phaseMessages"
              :suggestions="chatSuggestions"
              :send-status="chatSendState"
              :disabled="isCompletedTask"
              :error-message="chatError"
              :workspace-label="projectLabel"
              :draft="effectiveDraft"
              :restore-message-id="props.lastVisibleMessageId"
              :expanded="isAgentPanelExpanded"
              :pending-proposals="phasePendingProposals.length"
              :pending-corrections="evaluationRecovery.pendingCount"
              ref="desktopAgentPanelRef"
              @toggle="toggleAgentPanel"
              @send="onChatSubmit"
              @retry="onChatRetry"
              @proposal-decision="handleProposalDecision"
              @update-draft="updateDraft"
              @visible-message="updateLastVisibleMessage"
            />
          </template>
        </div>

        <section v-else class="workspace-empty-context" aria-labelledby="workspace-empty-context-title">
          <p class="workspace-empty-context__eyebrow">Proyecto activo</p>
          <h2 id="workspace-empty-context-title">Este proyecto todavía no tiene tareas.</h2>
          <p>Abre una conversación para definir el primer resultado de {{ projectLabel }}.</p>
          <button
            type="button"
            class="workspace-empty-context__action"
            @click="requestNewTask(selectedProjectId)"
          >
            Crear primera tarea
          </button>
        </section>
      </section>
    </section>

    <AssistantSettingsModal
      :open="settingsOpen"
      :settings="assistanceSettings"
      :saving="settingsSaving"
      :saved="settingsSaved"
      :error-message="settingsError"
      @update:open="closeSettings"
      @save="saveAssistanceSettings"
    />

    <NewTaskModal
      :open="props.activeOverlay === 'new-task'"
      :project-groups="projectGroups"
      :selected-project-id="props.overlayProjectId || selectedProjectId"
      @update:open="emit('requestOverlay', { overlay: $event ? 'new-task' : null, projectId: selectedProjectId })"
    />

    <LibrarySlideover
      :open="props.activeOverlay === 'library'"
      :task-id="localTask.id"
      :project-id="selectedProjectId"
      :record-id="props.overlayRecordId"
      :mobile="isMobile"
      @update:open="emit('requestOverlay', { overlay: $event ? 'library' : null, projectId: selectedProjectId })"
      @open-record="requestLibrary"
      @record-linked="emit('libraryRecordLinked', $event)"
    />

    <NoticeRegion
      :notices="props.notices"
      @dismiss="emit('dismissNotice', $event)"
      @retry="emit('retryNotice', $event)"
    />
  </div>
</template>

<style scoped>
.workspace-shell {
  position: relative;
  display: grid;
  grid-template-columns: minmax(16rem, 19rem) minmax(0, 1fr);
  gap: 0;
  align-items: stretch;
  min-width: 0;
  height: 100dvh;
  min-height: 0;
  max-height: 100dvh;
  overflow: hidden;
  padding: .7rem;
  color: #171d19;
  background:
    linear-gradient(90deg, rgba(6, 85, 53, .035), transparent 32%),
    #f4f7f3;
}

.workspace-shell--sidebar-collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.workspace-sidebar-frame {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.workspace-section {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0;
  min-width: 0;
  min-height: 0;
  height: calc(100dvh - 1.4rem);
  overflow: hidden;
  border: 1px solid #d7ddd8;
  border-radius: 0 .95rem .95rem 0;
  background: rgba(255, 255, 255, .88);
}

.workspace-shell--sidebar-collapsed .workspace-section {
  border-radius: .95rem;
}

.workspace-section--chat {
  min-height: 100%;
}

.workspace-section--chat :deep(.task-chat) {
  min-height: 0;
}

.workspace-stage-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(19rem, .82fr);
  gap: 1rem;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 1rem;
  background: #f1f4f2;
}

.workspace-stage-layout--agent-collapsed {
  grid-template-columns: minmax(0, 1fr) minmax(3.5rem, 7rem);
}

.workspace-stage {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: .85rem;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0;
  border: 1px solid #dce3de;
  border-radius: .9rem;
  background: #fff;
}

.workspace-stage__header {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.workspace-stage__header h2,
.workspace-stage__header p {
  margin: 0;
}

.workspace-stage__eyebrow {
  color: #08724c;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.workspace-stage__header h2 {
  color: #101812;
  font-size: 1rem;
  font-weight: 600;
}

.workspace-stage__form-region {
  display: grid;
  min-width: 0;
  min-height: 0;
}

.workspace-empty-context {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: .65rem;
  width: min(100%, 42rem);
  margin-inline: auto;
  padding: clamp(1.5rem, 7vw, 5rem);
}

.workspace-empty-context h2,
.workspace-empty-context p {
  margin: 0;
}

.workspace-empty-context__eyebrow {
  color: #08724c;
  font-size: .78rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.workspace-empty-context__action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-top: .5rem;
  padding: .65rem 1rem;
  border: 0;
  border-radius: .65rem;
  color: #fff;
  font-weight: 600;
  background: #065535;
}

.workspace-sidebar-frame :deep(aside.task-sidebar) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #d7ddd8;
  border-right: 0;
  border-radius: .95rem 0 0 .95rem;
}

.workspace-navigation-drawer {
  position: fixed;
  z-index: 40;
  inset: 0 auto 0 0;
  width: min(22rem, 86vw);
  border-right: 1px solid #ccd8d0;
  background: #f8faf8;
  box-shadow: 24px 0 60px rgba(17, 34, 24, .18);
}

.workspace-navigation-drawer--mobile {
  width: min(100%, 24rem);
}

.workspace-navigation-drawer__close {
  position: absolute;
  z-index: 2;
  top: max(.65rem, env(safe-area-inset-top));
  right: .65rem;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #cbd7d0;
  border-radius: .6rem;
  background: #fff;
}

.workspace-navigation-drawer__content {
  height: 100dvh;
  overflow: auto;
}

.workspace-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.workspace-panel :deep(.workspace-shell) {
  min-width: 0;
}

@media (min-width: 768px) and (max-width: 1024px) {
  .workspace-stage-layout {
    grid-template-columns: minmax(0, 1.18fr) minmax(0, .82fr);
  }

  .workspace-stage-layout--agent-collapsed {
    grid-template-columns: minmax(0, 1fr) minmax(3.5rem, 7rem);
  }

  .workspace-stage {
    grid-template-rows: none;
  }
}

@media (max-width: 1024px) {
  .workspace-shell {
    grid-template-columns: 1fr;
    height: 100dvh;
    min-height: 0;
    padding: .5rem;
  }

  .workspace-section {
    height: calc(100dvh - 1rem);
    min-height: 0;
    border-radius: .8rem;
  }

}

@media (max-width: 767px) {
  .workspace-shell {
    padding: 0;
  }

  .workspace-section {
    height: 100dvh;
    border-width: 0;
    border-radius: 0;
  }

  .workspace-stage-layout {
    grid-template-columns: minmax(0, 1fr);
    padding: .75rem;
  }

  .workspace-stage-layout__tabs {
    width: 100%;
    min-width: 0;
  }

  .workspace-stage {
    grid-template-rows: none;
    padding: 0;
    overflow: auto;
  }
}
</style>
