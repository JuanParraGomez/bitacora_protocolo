import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { repairTask } from '../domain/task.schema';
import TaskWorkspace from './TaskWorkspace.vue';
import { stageAgentWorkspaceRecords, stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';

const sendMock = vi.fn();

vi.mock('../services/mock-workspace-assistant', () => ({
  mockWorkspaceAssistant: {
    send: (...args: unknown[]) => sendMock(...args),
    evaluate: vi.fn(),
  },
}));

function mountWorkspace() {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase3));
  return mount(TaskWorkspace, {
    props: {
      task,
      activeTasks: [task],
      completedItems: [],
      notices: [],
      projectGroups: [],
      expandedProjectIds: [],
    },
    global: {
      stubs: {
        DashboardSidebar: { template: '<div />' },
        WorkspaceHeader: { template: '<button type="button">nav</button>' },
        StructuredStageSummary: { template: '<div />' },
        GuidedPhaseForm: { template: '<div />' },
        AgentPanel: {
          props: ['draft', 'expanded'],
          emits: ['updateDraft', 'send', 'toggle'],
          template: `
            <div>
              <button type="button" data-testid="toggle" @click="$emit('toggle')">toggle</button>
              <button type="button" data-testid="draft" @click="$emit('updateDraft', 'borrador persistente')">draft</button>
              <button type="button" data-testid="send" @click="$emit('send', 'mensaje demo')">send</button>
              <span data-testid="expanded">{{ expanded }}</span>
              <span data-testid="draft-value">{{ draft }}</span>
            </div>
          `,
        },
        AssistantSettingsModal: { template: '<div />' },
        NewTaskModal: { template: '<div />' },
        LibrarySlideover: { template: '<div />' },
        NoticeRegion: { template: '<div />' },
      },
    },
  });
}

function mountCompletedWorkspace() {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase4));
  return mount(TaskWorkspace, {
    props: {
      task,
      activeTasks: [],
      completedItems: stageAgentWorkspaceRecords.completed,
      notices: [],
      projectGroups: [{
        project: {
          id: task.projectId,
          name: 'Tareas anteriores',
          description: '',
          status: 'active',
          lastActiveTaskId: null,
          createdAt: 0,
          updatedAt: 0,
        },
        activeTasks: [],
        pausedTasks: [],
        completedTasks: [],
        completedItems: stageAgentWorkspaceRecords.completed,
        isEmpty: false,
      }],
      activeProjectId: task.projectId,
      expandedProjectIds: [task.projectId],
    },
    global: {
      stubs: {
        DashboardSidebar: { template: '<div />' },
        WorkspaceHeader: { template: '<button type="button">nav</button>' },
        StructuredStageSummary: { template: '<div data-testid="structured-summary" />' },
        GuidedPhaseForm: { template: '<div data-testid="guided-form" />' },
        TaskCompletionSummary: {
          props: ['records'],
          emits: ['requestReturn'],
          template: `
            <section aria-label="Resumen completado" data-testid="completion-summary">
              <span data-testid="passed-records">{{ records.length }}</span>
              <button type="button" data-primary-action="true" @click="$emit('requestReturn')">Volver a tareas</button>
            </section>
          `,
        },
        AgentPanel: { template: '<div />' },
        AssistantSettingsModal: { template: '<div />' },
        NewTaskModal: { template: '<div />' },
        LibrarySlideover: { template: '<div />' },
        NoticeRegion: { template: '<div />' },
      },
    },
  });
}

function mountCompletedWorkspaceWithAgent() {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase4));
  return mount(TaskWorkspace, {
    props: {
      task,
      activeTasks: [],
      completedItems: stageAgentWorkspaceRecords.completed,
      notices: [],
      projectGroups: [{
        project: {
          id: task.projectId,
          name: 'Tareas anteriores',
          description: '',
          status: 'active',
          lastActiveTaskId: null,
          createdAt: 0,
          updatedAt: 0,
        },
        activeTasks: [],
        pausedTasks: [],
        completedTasks: [],
        completedItems: stageAgentWorkspaceRecords.completed,
        isEmpty: false,
      }],
      activeProjectId: task.projectId,
      expandedProjectIds: [task.projectId],
      agentPanelState: 'expanded',
    },
    global: {
      stubs: {
        DashboardSidebar: { template: '<div />' },
        WorkspaceHeader: { template: '<button type="button">nav</button>' },
        StructuredStageSummary: { template: '<div />' },
        GuidedPhaseForm: { template: '<div />' },
        TaskCompletionSummary: { template: '<section aria-label="Resumen completado" />' },
        AgentPanel: {
          props: ['disabled'],
          emits: ['send', 'proposalDecision'],
          template: `
            <div>
              <span data-testid="agent-disabled">{{ disabled }}</span>
              <button type="button" data-testid="send-completed" @click="$emit('send', 'mensaje sobre cierre')">send</button>
              <button type="button" data-testid="proposal-completed" @click="$emit('proposalDecision', { proposalId: 'proposal-closed', action: 'accept' })">proposal</button>
            </div>
          `,
        },
        AssistantSettingsModal: { template: '<div />' },
        NewTaskModal: { template: '<div />' },
        LibrarySlideover: { template: '<div />' },
        NoticeRegion: { template: '<div />' },
      },
    },
  });
}

describe('TaskWorkspace', () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  it('keeps the composer draft while the agent panel collapses and expands again', async () => {
    const wrapper = mountWorkspace();

    await wrapper.get('[data-testid="draft"]').trigger('click');
    await wrapper.get('[data-testid="toggle"]').trigger('click');
    await wrapper.get('[data-testid="toggle"]').trigger('click');

    const draftEvents = wrapper.emitted('updateDraft') ?? [];
    expect(draftEvents[0]).toEqual([{ taskId: stageAgentWorkspaceTasks.phase3.id, draft: 'borrador persistente' }]);
    expect(wrapper.get('[data-testid="draft-value"]').text()).toContain('borrador persistente');
  });

  it('ignores a late assistant response after the workspace context changes', async () => {
    let resolveSend: ((value: { message: string; suggestions: string[]; projectId: string; taskId: string; phase: 3; methodVersionId: null; baseRevision: string; updates: []; contradictions: []; primaryQuestion: null }) => void) | null = null;
    sendMock.mockImplementation(() => new Promise((resolve) => {
      resolveSend = resolve;
    }));

    const wrapper = mountWorkspace();

    await wrapper.get('[data-testid="send"]').trigger('click');
    await wrapper.setProps({
      task: repairTask(structuredClone(stageAgentWorkspaceTasks.phase2)),
      activeTasks: [repairTask(structuredClone(stageAgentWorkspaceTasks.phase2))],
    });
    await nextTick();

    resolveSend?.({
      message: 'respuesta tardia',
      suggestions: [],
      projectId: stageAgentWorkspaceTasks.phase3.projectId,
      taskId: stageAgentWorkspaceTasks.phase3.id,
      phase: 3,
      methodVersionId: null,
      baseRevision: 'rev-stage-agent-001',
      updates: [],
      contradictions: [],
      primaryQuestion: null,
    });
    await nextTick();
    await nextTick();

    const saveEvents = wrapper.emitted('save') ?? [];
    expect(saveEvents).toHaveLength(1);
  });

  it('renders completed tasks from task storage even when the index only has records', async () => {
    const wrapper = mountCompletedWorkspace();

    expect(wrapper.get('[data-testid="completion-summary"]').isVisible()).toBe(true);
    expect(wrapper.get('[data-testid="passed-records"]').text()).toBe(String(stageAgentWorkspaceRecords.completed.length));
    expect(wrapper.find('[data-testid="guided-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="structured-summary"]').exists()).toBe(false);

    await wrapper.get('[data-primary-action="true"]').trigger('click');

    expect(wrapper.emitted('requestReturn')).toHaveLength(1);
    expect(wrapper.emitted('requestContinue')).toBeUndefined();
    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.emitted('dirty')).toBeUndefined();
  });

  it('keeps completed tasks read-only even if the agent region emits write-capable events', async () => {
    const wrapper = mountCompletedWorkspaceWithAgent();

    expect(wrapper.get('[data-testid="agent-disabled"]').text()).toBe('true');

    await wrapper.get('[data-testid="send-completed"]').trigger('click');
    await wrapper.get('[data-testid="proposal-completed"]').trigger('click');
    await nextTick();

    expect(sendMock).not.toHaveBeenCalled();
    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.emitted('dirty')).toBeUndefined();
    expect(wrapper.emitted('requestContinue')).toBeUndefined();
  });
});
