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
});
