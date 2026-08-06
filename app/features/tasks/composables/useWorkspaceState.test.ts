import { describe, expect, it, vi } from 'vitest';

import { useWorkspaceState } from './useWorkspaceState';

type MemoryStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createMemoryStorage(initial: Record<string, string> = {}): MemoryStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

const contexts = [
  { projectId: 'project-a', taskIds: ['task-a1', 'task-a2'] },
  { projectId: 'project-b', taskIds: ['task-b1'] },
] as const;

function createState(storage = createMemoryStorage()) {
  return useWorkspaceState({
    storage,
    contexts,
  });
}

describe('workspace state', () => {
  it('selects only known project/task pairs and clears a task that does not belong to the selected project', () => {
    const workspace = createState();

    expect(workspace.selectProject('project-a')).toBe(true);
    expect(workspace.selectTask('project-a', 'task-a1')).toBe(true);
    expect(workspace.activeProjectId.value).toBe('project-a');
    expect(workspace.activeTaskId.value).toBe('task-a1');

    expect(workspace.selectProject('project-b')).toBe(true);
    expect(workspace.activeProjectId.value).toBe('project-b');
    expect(workspace.activeTaskId.value).toBeNull();

    expect(workspace.selectTask('project-a', 'task-b1')).toBe(false);
    expect(workspace.selectProject('missing-project')).toBe(false);
    expect(workspace.selectTask('project-b', 'missing-task')).toBe(false);
    expect(workspace.activeProjectId.value).toBe('project-b');
    expect(workspace.activeTaskId.value).toBeNull();
  });

  it('preserves exact composer drafts independently for each task while navigating', () => {
    const workspace = createState();

    workspace.setDraft('task-a1', '  Borrador A con saltos\nsin normalizar  ');
    workspace.setDraft('task-b1', 'Borrador B');
    workspace.selectTask('project-b', 'task-b1');
    workspace.selectTask('project-a', 'task-a1');

    expect(workspace.draftFor('task-a1')).toBe('  Borrador A con saltos\nsin normalizar  ');
    expect(workspace.draftFor('task-b1')).toBe('Borrador B');
    expect(workspace.draftFor('missing-task')).toBe('');
  });

  it.each(['hidden', 'collapsed', 'expanded', 'review'] as const)(
    'restores the %s structured-summary state by task',
    (summaryState) => {
      const workspace = createState();

      expect(workspace.setSummaryState('task-a1', summaryState)).toBe(true);
      workspace.selectTask('project-b', 'task-b1');
      workspace.selectTask('project-a', 'task-a1');

      expect(workspace.summaryStateFor('task-a1')).toBe(summaryState);
      expect(workspace.summaryStateFor('task-b1')).toBe('hidden');
    },
  );

  it('stores a message identifier, never a pixel offset, as the task restore anchor', () => {
    const workspace = createState();

    expect(workspace.setLastVisibleMessage('task-a1', 'assistant:message-019')).toBe(true);
    expect(workspace.lastVisibleMessageFor('task-a1')).toBe('assistant:message-019');
    expect(workspace.setLastVisibleMessage('task-a1', null)).toBe(true);
    expect(workspace.lastVisibleMessageFor('task-a1')).toBeNull();

    expect(workspace.setLastVisibleMessage('task-a1', '')).toBe(false);
    expect(workspace.setLastVisibleMessage('task-a1', 480 as unknown as string)).toBe(false);
    expect(workspace.lastVisibleMessageFor('task-a1')).toBeNull();
  });

  it('keeps only existing project IDs expanded without duplicates', () => {
    const workspace = createState();

    expect(workspace.setProjectExpanded('project-a', true)).toBe(true);
    expect(workspace.setProjectExpanded('project-a', true)).toBe(true);
    expect(workspace.setProjectExpanded('project-b', true)).toBe(true);
    expect(workspace.setProjectExpanded('missing-project', true)).toBe(false);
    expect(workspace.expandedProjectIds.value).toEqual(['project-a', 'project-b']);

    expect(workspace.setProjectExpanded('project-a', false)).toBe(true);
    expect(workspace.expandedProjectIds.value).toEqual(['project-b']);
  });

  it('tracks expanded and collapsed navigation states and restores the desktop mode from storage', () => {
    const storage = createMemoryStorage();
    const workspace = createState(storage);

    expect(workspace.navigationState.value).toBe('expanded');
    expect(workspace.setSidebarCollapsed(true)).toBe(true);
    expect(workspace.navigationState.value).toBe('collapsed');

    const reopened = createState(storage);
    expect(reopened.navigationState.value).toBe('collapsed');
    expect(reopened.setSidebarCollapsed(false)).toBe(true);
    expect(reopened.navigationState.value).toBe('expanded');
  });

  it('opens a transient drawer state without losing the collapsed desktop preference', () => {
    const workspace = createState();

    expect(workspace.setSidebarCollapsed(true)).toBe(true);
    expect(workspace.navigationState.value).toBe('collapsed');

    workspace.openNavigationDrawer();
    expect(workspace.navigationState.value).toBe('drawer');

    workspace.closeNavigationDrawer();
    expect(workspace.navigationState.value).toBe('collapsed');

    workspace.reset();
    expect(workspace.navigationState.value).toBe('expanded');
  });

  it('accepts known historical IDs verbatim and rejects empty, unknown and invalid state inputs without mutation', () => {
    const historicalProjectId = 'Proyecto heredado / 2023';
    const historicalTaskId = `tarea:${'x'.repeat(240)}:ñ`;
    const workspace = useWorkspaceState({
      storage: createMemoryStorage(),
      contexts: [{ projectId: historicalProjectId, taskIds: [historicalTaskId] }],
    });

    expect(workspace.selectTask(historicalProjectId, historicalTaskId)).toBe(true);
    expect(workspace.activeProjectId.value).toBe(historicalProjectId);
    expect(workspace.activeTaskId.value).toBe(historicalTaskId);
    expect(workspace.setDraft('', 'no debe guardarse')).toBe(false);
    expect(workspace.setDraft('unknown-task', 'no debe guardarse')).toBe(false);
    expect(workspace.setSummaryState(
      historicalTaskId,
      'open' as unknown as 'hidden',
    )).toBe(false);
    expect(workspace.summaryStateFor(historicalTaskId)).toBe('hidden');
  });

  it('recovers task-local state from injected storage and repairs malformed or unknown persisted entries', () => {
    const storage = createMemoryStorage();
    const first = createState(storage);
    first.selectTask('project-a', 'task-a2');
    first.setDraft('task-a1', 'Persistido A');
    first.setSummaryState('task-a1', 'review');
    first.setLastVisibleMessage('task-a1', 'message-a-last');
    first.setProjectExpanded('project-a', true);

    const reopened = createState(storage);
    expect(reopened.activeProjectId.value).toBe('project-a');
    expect(reopened.activeTaskId.value).toBe('task-a2');
    expect(reopened.draftFor('task-a1')).toBe('Persistido A');
    expect(reopened.summaryStateFor('task-a1')).toBe('review');
    expect(reopened.lastVisibleMessageFor('task-a1')).toBe('message-a-last');
    expect(reopened.expandedProjectIds.value).toEqual(['project-a']);

    storage.setItem('bitacora:workspace-view-state', JSON.stringify({
      activeProjectId: 'missing-project',
      activeTaskId: 'missing-task',
      expandedProjectIds: ['missing-project', 'project-b', 'project-b'],
      draftByTask: { 'missing-task': 'unsafe', 'task-b1': 'Recuperado B' },
      summaryStateByTask: { 'missing-task': 'expanded', 'task-b1': 'invalid' },
      lastVisibleMessageByTask: { 'missing-task': 'message-x', 'task-b1': 320 },
    }));

    const repaired = createState(storage);
    expect(repaired.activeProjectId.value).toBeNull();
    expect(repaired.activeTaskId.value).toBeNull();
    expect(repaired.expandedProjectIds.value).toEqual(['project-b']);
    expect(repaired.draftFor('task-b1')).toBe('Recuperado B');
    expect(repaired.draftFor('missing-task')).toBe('');
    expect(repaired.summaryStateFor('task-b1')).toBe('hidden');
    expect(repaired.lastVisibleMessageFor('task-b1')).toBeNull();
  });

  it('resets one task or the complete workspace without leaking state to another task', () => {
    const storage = createMemoryStorage();
    const workspace = createState(storage);
    workspace.selectTask('project-a', 'task-a1');
    workspace.setDraft('task-a1', 'A');
    workspace.setSummaryState('task-a1', 'expanded');
    workspace.setLastVisibleMessage('task-a1', 'message-a');
    workspace.setDraft('task-b1', 'B');
    workspace.setProjectExpanded('project-a', true);

    expect(workspace.resetTask('task-a1')).toBe(true);
    expect(workspace.draftFor('task-a1')).toBe('');
    expect(workspace.summaryStateFor('task-a1')).toBe('hidden');
    expect(workspace.lastVisibleMessageFor('task-a1')).toBeNull();
    expect(workspace.draftFor('task-b1')).toBe('B');

    workspace.reset();
    expect(workspace.activeProjectId.value).toBeNull();
    expect(workspace.activeTaskId.value).toBeNull();
    expect(workspace.expandedProjectIds.value).toEqual([]);
    expect(workspace.draftFor('task-b1')).toBe('');
    expect(createState(storage).draftFor('task-b1')).toBe('');
  });

  it('coordinates one active overlay at a time and persists its metadata', () => {
    const storage = createMemoryStorage();
    const workspace = createState(storage);

    expect(workspace.setActiveOverlay('new-task', { projectId: 'project-a' })).toBe(true);
    expect(workspace.activeOverlay.value).toBe('new-task');
    expect(workspace.overlayProjectId.value).toBe('project-a');
    expect(workspace.overlayRecordId.value).toBeNull();

    expect(workspace.setActiveOverlay('library', {
      projectId: 'project-b',
      recordId: 'record-42',
    })).toBe(true);
    expect(workspace.activeOverlay.value).toBe('library');
    expect(workspace.overlayProjectId.value).toBe('project-b');
    expect(workspace.overlayRecordId.value).toBe('record-42');

    workspace.closeOverlay();
    expect(workspace.activeOverlay.value).toBeNull();
    expect(workspace.overlayProjectId.value).toBeNull();
    expect(workspace.overlayRecordId.value).toBeNull();
  });

  it('repairs invalid persisted overlay state without mutating valid task context', () => {
    const storage = createMemoryStorage({
      'bitacora:workspace-view-state': JSON.stringify({
        activeProjectId: 'project-a',
        activeTaskId: 'task-a1',
        expandedProjectIds: [],
        draftByTask: {},
        summaryStateByTask: {},
        lastVisibleMessageByTask: {},
        activeOverlay: 'unexpected',
        overlayProjectId: 'missing-project',
        overlayRecordId: '',
      }),
    });

    const workspace = createState(storage);
    expect(workspace.activeProjectId.value).toBe('project-a');
    expect(workspace.activeTaskId.value).toBe('task-a1');
    expect(workspace.activeOverlay.value).toBeNull();
    expect(workspace.overlayProjectId.value).toBeNull();
    expect(workspace.overlayRecordId.value).toBeNull();
  });

  it('invalidates a late response when its originating navigation context is no longer current', () => {
    const workspace = createState();
    workspace.selectTask('project-a', 'task-a1');
    const origin = workspace.captureResponseOrigin({
      phase: 2,
      revision: 'revision-a1',
    });
    const apply = vi.fn();

    expect(workspace.applyIfResponseOriginCurrent(origin, {
      phase: 2,
      revision: 'revision-a1',
    }, apply)).toBe(true);
    expect(apply).toHaveBeenCalledTimes(1);

    workspace.selectTask('project-b', 'task-b1');
    workspace.selectTask('project-a', 'task-a1');

    expect(workspace.applyIfResponseOriginCurrent(origin, {
      phase: 2,
      revision: 'revision-a1',
    }, apply)).toBe(false);
    expect(workspace.applyIfResponseOriginCurrent(
      workspace.captureResponseOrigin({ phase: 2, revision: 'revision-a2' }),
      { phase: 3, revision: 'revision-a2' },
      apply,
    )).toBe(false);
    expect(workspace.applyIfResponseOriginCurrent(
      workspace.captureResponseOrigin({ phase: 2, revision: 'revision-a2' }),
      { phase: 2, revision: 'stale-revision' },
      apply,
    )).toBe(false);
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('repairs task-local agent and mobile pane state from legacy snapshots while keeping task isolation', () => {
    const storage = createMemoryStorage({
      'bitacora:workspace-view-state': JSON.stringify({
        activeProjectId: 'project-a',
        activeTaskId: 'task-a1',
        expandedProjectIds: ['project-a'],
        sidebarCollapsed: false,
        draftByTask: {},
        summaryStateByTask: {},
        lastVisibleMessageByTask: {},
        activeOverlay: null,
        overlayProjectId: null,
        overlayRecordId: null,
        agentPanelByTask: {
          'task-a1': 'expanded',
          'task-b1': 'collapsed',
          'missing-task': 'expanded',
          'task-a2': 'unexpected',
        },
        mobilePaneByTask: {
          'task-a1': 'agent',
          'task-b1': 'stage',
          'missing-task': 'agent',
          'task-a2': 'invalid',
        },
      }),
    });

    const workspace = createState(storage);
    expect(workspace.hasAgentPanelPreference('task-a1')).toBe(true);
    expect(workspace.hasAgentPanelPreference('task-b1')).toBe(false);
    expect(workspace.hasAgentPanelPreference('task-a2')).toBe(false);
    expect(workspace.agentPanelFor('task-a1')).toBe('expanded');
    expect(workspace.agentPanelFor('task-b1')).toBe('collapsed');
    expect(workspace.agentPanelFor('missing-task')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-a1')).toBe('agent');
    expect(workspace.mobilePaneFor('task-b1')).toBe('stage');
    expect(workspace.mobilePaneFor('missing-task')).toBe('stage');
    expect(workspace.agentPanelFor('task-a2')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-a2')).toBe('stage');

    expect(workspace.setAgentPanel('task-a1', 'collapsed')).toBe(true);
    expect(workspace.setAgentPanel('task-b1', 'expanded')).toBe(true);
    expect(workspace.setMobilePane('task-a1', 'stage')).toBe(true);
    expect(workspace.setMobilePane('task-b1', 'agent')).toBe(true);
    expect(workspace.agentPanelFor('task-a1')).toBe('collapsed');
    expect(workspace.agentPanelFor('task-b1')).toBe('expanded');
    expect(workspace.mobilePaneFor('task-a1')).toBe('stage');
    expect(workspace.mobilePaneFor('task-b1')).toBe('agent');

    expect(workspace.setAgentPanel('missing-task', 'expanded')).toBe(false);
    expect(workspace.setMobilePane('missing-task', 'agent')).toBe(false);
    expect(workspace.setAgentPanel('task-a1', 'invalid' as unknown as 'collapsed')).toBe(false);
    expect(workspace.setMobilePane('task-a1', 'drawer' as unknown as 'stage')).toBe(false);
  });

  it('reopens the selected mobile pane per task without leaking the preference', () => {
    const storage = createMemoryStorage();
    const first = createState(storage);

    expect(first.setMobilePane('task-a1', 'agent')).toBe(true);
    expect(first.setMobilePane('task-a2', 'stage')).toBe(true);
    expect(first.setMobilePane('task-b1', 'agent')).toBe(true);

    const reopened = createState(storage);
    expect(reopened.mobilePaneFor('task-a1')).toBe('agent');
    expect(reopened.mobilePaneFor('task-a2')).toBe('stage');
    expect(reopened.mobilePaneFor('task-b1')).toBe('agent');

    expect(reopened.setMobilePane('task-a1', 'stage')).toBe(true);
    expect(reopened.mobilePaneFor('task-b1')).toBe('agent');
  });

  it('clears per-task agent and mobile pane preferences without affecting other tasks', () => {
    const workspace = createState();

    expect(workspace.setAgentPanel('task-a1', 'expanded')).toBe(true);
    expect(workspace.setAgentPanel('task-b1', 'collapsed')).toBe(true);
    expect(workspace.setMobilePane('task-a1', 'agent')).toBe(true);
    expect(workspace.setMobilePane('task-b1', 'stage')).toBe(true);

    expect(workspace.agentPanelFor('task-a1')).toBe('expanded');
    expect(workspace.agentPanelFor('task-b1')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-a1')).toBe('agent');
    expect(workspace.mobilePaneFor('task-b1')).toBe('stage');
    expect(workspace.hasAgentPanelPreference('task-a1')).toBe(true);
    expect(workspace.hasAgentPanelPreference('task-b1')).toBe(false);

    expect(workspace.resetTask('task-a1')).toBe(true);
    expect(workspace.agentPanelFor('task-a1')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-a1')).toBe('stage');
    expect(workspace.agentPanelFor('task-b1')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-b1')).toBe('stage');
    expect(workspace.hasAgentPanelPreference('task-a1')).toBe(false);

    expect(workspace.reset()).toBeUndefined();
    expect(workspace.agentPanelFor('task-b1')).toBe('collapsed');
    expect(workspace.mobilePaneFor('task-b1')).toBe('stage');
  });
});
