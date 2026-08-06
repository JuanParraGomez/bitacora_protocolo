import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import AgentPanel from './AgentPanel.vue';

const baseProps = {
  messages: [],
  suggestions: [],
  sendStatus: 'ready' as const,
  disabled: false,
  errorMessage: '',
  workspaceLabel: 'Proyecto demo',
  draft: '',
  restoreMessageId: null,
  expanded: true,
  pendingProposals: 0,
  pendingCorrections: 0,
};

describe('AgentPanel', () => {
  it('exposes the expanded state and lets the user collapse the panel from the toggle', async () => {
    const wrapper = mount(AgentPanel, {
      props: baseProps,
      global: {
        stubs: {
          TaskChat: {
            template: '<div data-testid="task-chat-stub">chat</div>',
          },
        },
      },
    });

    const toggle = wrapper.get('button[aria-expanded="true"]');
    await toggle.trigger('click');

    expect(wrapper.emitted('toggle')).toHaveLength(1);
  });

  it('collapses on Escape and returns focus to the toggle control', async () => {
    const wrapper = mount(AgentPanel, {
      props: baseProps,
      attachTo: document.body,
      global: {
        stubs: {
          TaskChat: {
            template: '<div data-testid="task-chat-stub">chat</div>',
          },
        },
      },
    });

    const content = wrapper.get('[data-agent-panel-content]');
    await content.trigger('keydown', { key: 'Escape' });
    await wrapper.setProps({ expanded: false });

    expect(wrapper.emitted('toggle')).toHaveLength(1);
    expect(document.activeElement).toBe(wrapper.get('button').element);
  });

  it('marks the panel as busy while the assistant is occupied and keeps a dedicated scroll region', () => {
    const wrapper = mount(AgentPanel, {
      props: {
        ...baseProps,
        sendStatus: 'streaming',
      },
      global: {
        stubs: {
          TaskChat: {
            template: '<div data-testid="task-chat-stub">chat</div>',
          },
        },
      },
    });

    const region = wrapper.get('[role="region"][aria-label="Panel del agente"]');
    const content = wrapper.get('[data-agent-panel-content]');

    expect(region.attributes('aria-busy')).toBe('true');
    expect(content.attributes('tabindex')).toBe('0');
  });

  it('renders a compact accessible rail with identity, sparkle, chevron and pending badge', () => {
    const wrapper = mount(AgentPanel, {
      props: { ...baseProps, expanded: false, pendingProposals: 2 },
      global: { stubs: { TaskChat: { template: '<div data-testid="task-chat-stub">chat</div>' } } },
    });

    expect(wrapper.attributes('data-agent-state')).toBe('collapsed');
    expect(wrapper.text()).toContain('Agente IA');
    expect(wrapper.find('[data-agent-icon="sparkle"]').exists()).toBe(true);
    expect(wrapper.find('[data-agent-chevron="expand"]').exists()).toBe(true);
    expect(wrapper.get('button[aria-label="Expandir agente IA"]').attributes('aria-expanded')).toBe('false');
    expect(wrapper.get('[data-agent-pending-badge]').text()).toBe('2');
    expect(wrapper.text()).not.toContain('Panel estructural');
    expect(wrapper.text()).not.toContain('El agente permanece disponible');
    expect(wrapper.find('[data-testid="task-chat-stub"]').isVisible()).toBe(false);
  });

  it('shows pending correction count in the collapsed rail and expanded header', async () => {
    const wrapper = mount(AgentPanel, {
      props: { ...baseProps, expanded: false, pendingCorrections: 10 },
      global: { stubs: { TaskChat: { template: '<div>chat</div>' } } },
    });

    expect(wrapper.get('[data-agent-correction-badge]').text()).toBe('10');
    expect(wrapper.get('[data-agent-correction-badge]').attributes('aria-label')).toBe('10 correcciones pendientes');

    await wrapper.setProps({ expanded: true });
    expect(wrapper.get('[data-agent-correction-badge]').text()).toBe('10');
  });

  it('exposes a focus method for recommendation links', async () => {
    const wrapper = mount(AgentPanel, {
      props: baseProps,
      attachTo: document.body,
      global: { stubs: { TaskChat: { template: '<div>chat</div>' } } },
    });

    await (wrapper.vm as unknown as { focusConversation: () => Promise<void> }).focusConversation();
    expect(document.activeElement).toBe(wrapper.get('[data-agent-panel-content]').element);
  });
});
