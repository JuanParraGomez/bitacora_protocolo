import { ref } from 'vue';

const WORKSPACE_STATE_STORAGE_KEY = 'bitacora:workspace-view-state';
const SUMMARY_STATES = ['hidden', 'collapsed', 'expanded', 'review'] as const;
const OVERLAY_STATES = ['new-task', 'library', 'settings'] as const;

export type WorkspaceSummaryState = typeof SUMMARY_STATES[number];
export type WorkspaceOverlayState = typeof OVERLAY_STATES[number] | null;

export type WorkspaceContextDefinition = {
  projectId: string;
  taskIds: readonly string[];
};

export type WorkspaceStateStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

export type WorkspaceResponseOrigin = {
  projectId: string | null;
  taskId: string | null;
  phase: number;
  revision: string;
  navigationGeneration: number;
};

type StoredWorkspaceState = {
  activeProjectId: string | null;
  activeTaskId: string | null;
  expandedProjectIds: string[];
  draftByTask: Record<string, string>;
  summaryStateByTask: Record<string, WorkspaceSummaryState>;
  lastVisibleMessageByTask: Record<string, string>;
  activeOverlay: WorkspaceOverlayState;
  overlayProjectId: string | null;
  overlayRecordId: string | null;
};

type UseWorkspaceStateOptions = {
  contexts: readonly WorkspaceContextDefinition[];
  storage?: WorkspaceStateStorage | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isSummaryState(value: unknown): value is WorkspaceSummaryState {
  return typeof value === 'string'
    && (SUMMARY_STATES as readonly string[]).includes(value);
}

function isOverlayState(value: unknown): value is Exclude<WorkspaceOverlayState, null> {
  return typeof value === 'string'
    && (OVERLAY_STATES as readonly string[]).includes(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readStoredState(storage: WorkspaceStateStorage | null | undefined): Record<string, unknown> {
  if (!storage) return {};

  try {
    const raw = storage.getItem(WORKSPACE_STATE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function useWorkspaceState(options: UseWorkspaceStateOptions) {
  const storage = options.storage;
  const projectIds = new Set<string>();
  const taskProjectIds = new Map<string, string>();
  const ambiguousTaskIds = new Set<string>();

  for (const context of options.contexts) {
    if (!nonEmptyString(context.projectId)) continue;
    projectIds.add(context.projectId);
    for (const taskId of context.taskIds) {
      if (!nonEmptyString(taskId)) continue;
      const existingProjectId = taskProjectIds.get(taskId);
      if (existingProjectId && existingProjectId !== context.projectId) {
        ambiguousTaskIds.add(taskId);
        taskProjectIds.delete(taskId);
        continue;
      }
      if (!ambiguousTaskIds.has(taskId)) {
        taskProjectIds.set(taskId, context.projectId);
      }
    }
  }

  const isKnownProject = (projectId: unknown): projectId is string =>
    typeof projectId === 'string' && projectIds.has(projectId);
  const isKnownTask = (taskId: unknown): taskId is string =>
    typeof taskId === 'string' && taskProjectIds.has(taskId);
  const taskBelongsToProject = (projectId: unknown, taskId: unknown): projectId is string =>
    isKnownProject(projectId)
    && isKnownTask(taskId)
    && taskProjectIds.get(taskId) === projectId;

  const stored = readStoredState(storage);
  const storedProjectId = isKnownProject(stored.activeProjectId)
    ? stored.activeProjectId
    : null;
  const storedTaskId = storedProjectId
    && taskBelongsToProject(storedProjectId, stored.activeTaskId)
    ? stored.activeTaskId as string
    : null;

  const activeProjectId = ref<string | null>(storedProjectId);
  const activeTaskId = ref<string | null>(storedTaskId);
  const expandedProjectIds = ref<string[]>([]);
  const activeOverlay = ref<WorkspaceOverlayState>(isOverlayState(stored.activeOverlay) ? stored.activeOverlay : null);
  const overlayProjectId = ref<string | null>(isKnownProject(stored.overlayProjectId) ? stored.overlayProjectId : null);
  const overlayRecordId = ref<string | null>(nonEmptyString(stored.overlayRecordId) ? stored.overlayRecordId : null);
  const draftByTask = new Map<string, string>();
  const summaryStateByTask = new Map<string, WorkspaceSummaryState>();
  const lastVisibleMessageByTask = new Map<string, string>();
  let navigationGeneration = 0;

  if (Array.isArray(stored.expandedProjectIds)) {
    const seen = new Set<string>();
    expandedProjectIds.value = stored.expandedProjectIds.filter((projectId): projectId is string => {
      if (!isKnownProject(projectId) || seen.has(projectId)) return false;
      seen.add(projectId);
      return true;
    });
  }

  if (isRecord(stored.draftByTask)) {
    for (const [taskId, draft] of Object.entries(stored.draftByTask)) {
      if (isKnownTask(taskId) && typeof draft === 'string') {
        draftByTask.set(taskId, draft);
      }
    }
  }

  if (isRecord(stored.summaryStateByTask)) {
    for (const [taskId, state] of Object.entries(stored.summaryStateByTask)) {
      if (isKnownTask(taskId) && isSummaryState(state)) {
        summaryStateByTask.set(taskId, state);
      }
    }
  }

  if (isRecord(stored.lastVisibleMessageByTask)) {
    for (const [taskId, messageId] of Object.entries(stored.lastVisibleMessageByTask)) {
      if (isKnownTask(taskId) && nonEmptyString(messageId)) {
        lastVisibleMessageByTask.set(taskId, messageId);
      }
    }
  }

  function snapshot(): StoredWorkspaceState {
    return {
      activeProjectId: activeProjectId.value,
      activeTaskId: activeTaskId.value,
      expandedProjectIds: [...expandedProjectIds.value],
      draftByTask: Object.fromEntries(draftByTask),
      summaryStateByTask: Object.fromEntries(summaryStateByTask),
      lastVisibleMessageByTask: Object.fromEntries(lastVisibleMessageByTask),
      activeOverlay: activeOverlay.value,
      overlayProjectId: overlayProjectId.value,
      overlayRecordId: overlayRecordId.value,
    };
  }

  function persist() {
    if (!storage) return;
    try {
      storage.setItem(WORKSPACE_STATE_STORAGE_KEY, JSON.stringify(snapshot()));
    } catch {
      // Presentation state remains usable in memory when browser storage is unavailable.
    }
  }

  function markNavigation(previousProjectId: string | null, previousTaskId: string | null) {
    if (previousProjectId !== activeProjectId.value || previousTaskId !== activeTaskId.value) {
      navigationGeneration += 1;
    }
  }

  function selectProject(projectId: string): boolean {
    if (!isKnownProject(projectId)) return false;

    const previousProjectId = activeProjectId.value;
    const previousTaskId = activeTaskId.value;
    activeProjectId.value = projectId;
    if (activeTaskId.value && taskProjectIds.get(activeTaskId.value) !== projectId) {
      activeTaskId.value = null;
    }
    markNavigation(previousProjectId, previousTaskId);
    persist();
    return true;
  }

  function selectTask(projectId: string, taskId: string): boolean {
    if (!taskBelongsToProject(projectId, taskId)) return false;

    const previousProjectId = activeProjectId.value;
    const previousTaskId = activeTaskId.value;
    activeProjectId.value = projectId;
    activeTaskId.value = taskId;
    markNavigation(previousProjectId, previousTaskId);
    persist();
    return true;
  }

  function setDraft(taskId: string, draft: string): boolean {
    if (!isKnownTask(taskId) || typeof draft !== 'string') return false;
    if (draft.length === 0) {
      draftByTask.delete(taskId);
    } else {
      draftByTask.set(taskId, draft);
    }
    persist();
    return true;
  }

  function draftFor(taskId: string): string {
    return isKnownTask(taskId) ? draftByTask.get(taskId) ?? '' : '';
  }

  function setSummaryState(taskId: string, state: WorkspaceSummaryState): boolean {
    if (!isKnownTask(taskId) || !isSummaryState(state)) return false;
    if (state === 'hidden') {
      summaryStateByTask.delete(taskId);
    } else {
      summaryStateByTask.set(taskId, state);
    }
    persist();
    return true;
  }

  function summaryStateFor(taskId: string): WorkspaceSummaryState {
    return isKnownTask(taskId) ? summaryStateByTask.get(taskId) ?? 'hidden' : 'hidden';
  }

  function setLastVisibleMessage(taskId: string, messageId: string | null): boolean {
    if (!isKnownTask(taskId)) return false;
    if (messageId === null) {
      lastVisibleMessageByTask.delete(taskId);
    } else if (nonEmptyString(messageId)) {
      lastVisibleMessageByTask.set(taskId, messageId);
    } else {
      return false;
    }
    persist();
    return true;
  }

  function lastVisibleMessageFor(taskId: string): string | null {
    return isKnownTask(taskId) ? lastVisibleMessageByTask.get(taskId) ?? null : null;
  }

  function setProjectExpanded(projectId: string, expanded: boolean): boolean {
    if (!isKnownProject(projectId) || typeof expanded !== 'boolean') return false;
    const next = new Set(expandedProjectIds.value);
    if (expanded) next.add(projectId);
    else next.delete(projectId);
    expandedProjectIds.value = [...next];
    persist();
    return true;
  }

  function resetTask(taskId: string): boolean {
    if (!isKnownTask(taskId)) return false;
    draftByTask.delete(taskId);
    summaryStateByTask.delete(taskId);
    lastVisibleMessageByTask.delete(taskId);
    if (activeTaskId.value === taskId) {
      navigationGeneration += 1;
    }
    persist();
    return true;
  }

  function setActiveOverlay(
    overlay: WorkspaceOverlayState,
    options: { projectId?: string | null; recordId?: string | null } = {},
  ): boolean {
    if (overlay !== null && !isOverlayState(overlay)) return false;
    if (options.projectId !== undefined && options.projectId !== null && !isKnownProject(options.projectId)) {
      return false;
    }
    activeOverlay.value = overlay;
    overlayProjectId.value = overlay ? options.projectId ?? activeProjectId.value ?? null : null;
    overlayRecordId.value = overlay === 'library' ? options.recordId ?? null : null;
    persist();
    return true;
  }

  function closeOverlay() {
    activeOverlay.value = null;
    overlayProjectId.value = null;
    overlayRecordId.value = null;
    persist();
  }

  function reset() {
    activeProjectId.value = null;
    activeTaskId.value = null;
    expandedProjectIds.value = [];
    activeOverlay.value = null;
    overlayProjectId.value = null;
    overlayRecordId.value = null;
    draftByTask.clear();
    summaryStateByTask.clear();
    lastVisibleMessageByTask.clear();
    navigationGeneration += 1;
    if (!storage) return;
    try {
      storage.removeItem(WORKSPACE_STATE_STORAGE_KEY);
    } catch {
      // A failed removal must not prevent the in-memory reset.
    }
  }

  function captureResponseOrigin(context: { phase: number; revision: string }): WorkspaceResponseOrigin {
    return {
      projectId: activeProjectId.value,
      taskId: activeTaskId.value,
      phase: context.phase,
      revision: context.revision,
      navigationGeneration,
    };
  }

  function applyIfResponseOriginCurrent(
    origin: WorkspaceResponseOrigin,
    current: { phase: number; revision: string },
    apply: () => void,
  ): boolean {
    const isCurrent = Boolean(
      origin.projectId
      && origin.taskId
      && origin.projectId === activeProjectId.value
      && origin.taskId === activeTaskId.value
      && origin.navigationGeneration === navigationGeneration
      && origin.phase === current.phase
      && origin.revision === current.revision,
    );
    if (!isCurrent) return false;
    apply();
    return true;
  }

  return {
    activeProjectId,
    activeTaskId,
    expandedProjectIds,
    activeOverlay,
    overlayProjectId,
    overlayRecordId,
    selectProject,
    selectTask,
    setDraft,
    draftFor,
    setSummaryState,
    summaryStateFor,
    setLastVisibleMessage,
    lastVisibleMessageFor,
    setProjectExpanded,
    setActiveOverlay,
    closeOverlay,
    resetTask,
    reset,
    captureResponseOrigin,
    applyIfResponseOriginCurrent,
  };
}
