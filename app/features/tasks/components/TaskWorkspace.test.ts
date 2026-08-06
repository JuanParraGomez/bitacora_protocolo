import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildPhaseRevision } from '../domain/task-assistant-rules';
import { repairTask } from '../domain/task.schema';
import TaskWorkspace from './TaskWorkspace.vue';
import { stageAgentWorkspaceRecords, stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';

const sendMock = vi.fn();

function setViewport(width: number) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('1024') ? width <= 1024 : width <= 767,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

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
        StructuredStageSummary: { template: '<div data-testid="structured-summary" />' },
        GuidedPhaseForm: { name: 'GuidedPhaseForm', emits: ['requestAgentRecommendations'], template: '<div data-testid="guided-form" />' },
        AgentPanel: {
          props: ['draft', 'expanded', 'pendingCorrections'],
          emits: ['updateDraft', 'send', 'toggle'],
          setup() {
            return { focusConversation: vi.fn() };
          },
          template: `
            <aside class="agent-panel">
              <button type="button" data-testid="toggle" @click="$emit('toggle')">toggle</button>
              <button type="button" data-testid="draft" @click="$emit('updateDraft', 'borrador persistente')">draft</button>
              <button type="button" data-testid="send" @click="$emit('send', 'mensaje demo')">send</button>
              <span data-testid="expanded">{{ expanded }}</span>
              <span data-testid="draft-value">{{ draft }}</span>
            </aside>
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

function mountProposalWorkspace() {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase2));
  const revision = buildPhaseRevision(task, task.fase);
  task.assistant.messages = [{
    id: 'proposal-message-visible',
    projectId: task.projectId,
    taskId: task.id,
    phase: task.fase,
    methodVersionId: null,
    baseRevision: revision,
    role: 'assistant',
    parts: [{ type: 'text', text: 'Revisa estas propuestas.' }],
    status: 'sent',
    createdAt: 1,
    primaryQuestion: null,
    contradictions: [],
    updates: [
      {
        id: 'proposal-accept-visible',
        sourceMessageId: 'proposal-message-visible',
        projectId: task.projectId,
        taskId: task.id,
        phase: task.fase,
        methodVersionId: null,
        baseRevision: revision,
        status: 'proposed',
        field: 'f2.pasos',
        previousValue: task.f2.pasos,
        value: '1. aceptar 2. verificar',
      },
      {
        id: 'proposal-reject-visible',
        sourceMessageId: 'proposal-message-visible',
        projectId: task.projectId,
        taskId: task.id,
        phase: task.fase,
        methodVersionId: null,
        baseRevision: revision,
        status: 'proposed',
        field: 'f2.alcance',
        previousValue: task.f2.alcance,
        value: 'Alcance propuesto para descartar',
      },
      {
        id: 'proposal-resolved-visible',
        sourceMessageId: 'proposal-message-visible',
        projectId: task.projectId,
        taskId: task.id,
        phase: task.fase,
        methodVersionId: null,
        baseRevision: revision,
        status: 'applied',
        field: 'f2.guia',
        previousValue: task.f2.guia,
        value: 'Resuelta',
      },
      {
        id: 'proposal-conflict-visible',
        sourceMessageId: 'proposal-message-visible',
        projectId: task.projectId,
        taskId: task.id,
        phase: task.fase,
        methodVersionId: null,
        baseRevision: revision,
        status: 'conflict',
        field: 'f2.decision',
        previousValue: task.f2.decision,
        value: 'Conflicto vigente',
      },
      {
        id: 'proposal-other-phase',
        sourceMessageId: 'proposal-message-visible',
        projectId: task.projectId,
        taskId: task.id,
        phase: 3,
        methodVersionId: null,
        baseRevision: revision,
        status: 'proposed',
        field: 'f3.notas',
        previousValue: task.f3.notas,
        value: 'Otra fase',
      },
    ],
  }];

  return mount(TaskWorkspace, {
    props: {
      task,
      activeTasks: [task],
      completedItems: [],
      notices: [],
      projectGroups: [],
      expandedProjectIds: [],
      agentPanelState: 'expanded',
    },
    global: {
      stubs: {
        DashboardSidebar: { template: '<div />' },
        WorkspaceHeader: { template: '<button type="button">nav</button>' },
        StructuredStageSummary: { template: '<div data-testid="structured-summary" />' },
        GuidedPhaseForm: { template: '<div data-testid="guided-form" />' },
        AgentPanel: {
          props: ['pendingProposals'],
          emits: ['proposalDecision'],
          setup(_props, { emit }) {
            return {
              acceptProposal: () => emit('proposalDecision', {
                proposalId: 'proposal-accept-visible',
                action: 'accept',
                baseRevision: revision,
              }),
              rejectProposal: () => emit('proposalDecision', {
                proposalId: 'proposal-reject-visible',
                action: 'reject',
                baseRevision: revision,
              }),
            };
          },
          template: `
            <div>
              <span data-testid="proposal-count">{{ pendingProposals }}</span>
              <button type="button" data-testid="accept-proposal" @click="acceptProposal">accept</button>
              <button type="button" data-testid="reject-proposal" @click="rejectProposal">reject</button>
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
    setViewport(1440);
  });

  it('loads tablet with a closed drawer and two adjacent independent scroll regions', async () => {
    setViewport(1024);
    const wrapper = mountWorkspace();
    await nextTick();

    expect(wrapper.find('.workspace-navigation-drawer').exists()).toBe(false);
    expect(wrapper.get('.workspace-stage').attributes('data-scroll-region')).toBe('stage');
    expect(wrapper.get('.agent-panel').attributes('data-scroll-region')).toBe('agent');
    expect(wrapper.get('.workspace-stage-layout').classes()).toContain('workspace-stage-layout--tablet');
  });

  it('keeps the composer draft while the agent panel collapses and expands again', async () => {
    const wrapper = mountWorkspace();

    expect(wrapper.get('[data-testid="expanded"]').text()).toBe('false');

    await wrapper.get('[data-testid="draft"]').trigger('click');
    await wrapper.get('[data-testid="toggle"]').trigger('click');
    await wrapper.get('[data-testid="toggle"]').trigger('click');

    const draftEvents = wrapper.emitted('updateDraft') ?? [];
    expect(draftEvents[0]).toEqual([{ taskId: stageAgentWorkspaceTasks.phase3.id, draft: 'borrador persistente' }]);
    expect(wrapper.get('[data-testid="draft-value"]').text()).toContain('borrador persistente');
  });

  it('routes recommendation requests to the agent while preserving the task-scoped state', async () => {
    const wrapper = mountWorkspace();
    wrapper.findComponent({ name: 'GuidedPhaseForm' }).vm.$emit('requestAgentRecommendations');
    await nextTick();

    expect(wrapper.emitted('updateAgentPanelState')).toEqual([
      [{ taskId: stageAgentWorkspaceTasks.phase3.id, state: 'expanded' }],
    ]);
  });

  it('makes the guided form the active canvas content without the redundant meta panel', () => {
    const wrapper = mountWorkspace();
    const canvas = wrapper.get('.workspace-stage');
    const text = canvas.text();
    expect(text).not.toContain('ETAPA ACTIVA');
    expect(text).not.toContain('Lienzo de la etapa');
    expect(text).not.toContain('SÍNTESIS OPERATIVA');
    expect(text).not.toContain('Atrás');
    expect(canvas.find('[data-testid="guided-form"]').exists()).toBe(true);
    expect(canvas.find('[data-testid="structured-summary"]').exists()).toBe(true);
    const regions = Array.from(canvas.element.querySelectorAll('[data-testid]')).map((element) => element.getAttribute('data-testid'));
    expect(regions.indexOf('guided-form')).toBeLessThan(regions.indexOf('structured-summary'));
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

  it('derives pending proposal badge from the visible phase and updates it through proposal decisions', async () => {
    const wrapper = mountProposalWorkspace();

    expect(wrapper.get('[data-testid="proposal-count"]').text()).toBe('2');

    await wrapper.get('[data-testid="accept-proposal"]').trigger('click');
    await nextTick();

    expect(wrapper.get('[data-testid="proposal-count"]').text()).toBe('1');
    const firstSave = wrapper.emitted('save')?.at(-1);
    expect(firstSave?.[0]).toMatchObject({
      f2: {
        pasos: '1. aceptar 2. verificar',
      },
    });
    expect(firstSave?.[1]).toEqual({ operationId: 'proposal-save:proposal-accept-visible' });

    await wrapper.get('[data-testid="reject-proposal"]').trigger('click');
    await nextTick();

    expect(wrapper.get('[data-testid="proposal-count"]').text()).toBe('0');
    const secondSave = wrapper.emitted('save')?.at(-1);
    expect(secondSave?.[0]).toMatchObject({
      f2: {
        alcance: stageAgentWorkspaceTasks.phase2.f2.alcance,
      },
    });
    expect(secondSave?.[1]).toEqual({ operationId: 'proposal-save:proposal-reject-visible' });
    expect(wrapper.emitted('dirty')?.length).toBeGreaterThanOrEqual(2);
  });
});
