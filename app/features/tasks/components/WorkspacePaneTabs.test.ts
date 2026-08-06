import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import WorkspacePaneTabs from './WorkspacePaneTabs.vue';

describe('WorkspacePaneTabs', () => {
  it('renders a single-tablist controller for Etapa and Agente', () => {
    const wrapper = mount(WorkspacePaneTabs, {
      props: {
        modelValue: 'stage',
      },
      slots: {
        stage: '<div data-testid="stage-slot">Etapa</div>',
        agent: '<div data-testid="agent-slot">Agente</div>',
      },
    });

    const tabs = wrapper.findAll('[role="tab"]');
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('Planos del workspace');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].text()).toContain('Etapa');
    expect(tabs[1].text()).toContain('Agente');
    expect(tabs[0].find('[data-pane-icon="stage"]').exists()).toBe(true);
    expect(tabs[1].find('[data-pane-icon="agent"]').exists()).toBe(true);
  });

  it('supports keyboard navigation and emits pane changes without unmounting the inactive panel', async () => {
    const wrapper = mount(WorkspacePaneTabs, {
      props: {
        modelValue: 'stage',
      },
      slots: {
        stage: '<div data-testid="stage-slot">Etapa</div>',
        agent: '<div data-testid="agent-slot">Agente</div>',
      },
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[0].trigger('keydown', { key: 'ArrowRight' });
    await tabs[1].trigger('keydown', { key: 'Enter' });
    await wrapper.setProps({ modelValue: 'agent' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['agent']);
    expect(wrapper.get('[data-pane="stage"]').attributes('inert')).toBeDefined();
    expect(wrapper.get('[data-testid="stage-slot"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="agent-slot"]').exists()).toBe(true);
  });

  it('keeps both pane drafts mounted while switching visibility', async () => {
    const wrapper = mount(WorkspacePaneTabs, {
      props: { modelValue: 'stage' },
      slots: {
        stage: '<input data-testid="stage-draft" value="hipótesis local">',
        agent: '<textarea data-testid="agent-draft">borrador agente</textarea>',
      },
    });

    await wrapper.setProps({ modelValue: 'agent' });
    await wrapper.setProps({ modelValue: 'stage' });

    expect((wrapper.get('[data-testid="stage-draft"]').element as HTMLInputElement).value).toBe('hipótesis local');
    expect((wrapper.get('[data-testid="agent-draft"]').element as HTMLTextAreaElement).value).toBe('borrador agente');
  });

  it('shows one accessible agent status dot only while work is pending', async () => {
    const wrapper = mount(WorkspacePaneTabs, {
      props: { modelValue: 'stage', agentPending: false },
      slots: { stage: '<div />', agent: '<div />' },
    });

    expect(wrapper.find('[data-agent-pending]').exists()).toBe(false);

    await wrapper.setProps({ agentPending: true });
    const dot = wrapper.get('[data-agent-pending]');
    expect(dot.text()).toContain('pendientes');
    expect(wrapper.get('[role="tab"][aria-controls]').text()).toContain('Etapa');
    expect(wrapper.findAll('[role="tab"]')[1]?.text()).toContain('Agente');

    await wrapper.setProps({ agentPending: false });
    expect(wrapper.find('[data-agent-pending]').exists()).toBe(false);
  });

  it('moves logical focus to the selected tab for pointer and keyboard activation', async () => {
    const wrapper = mount(WorkspacePaneTabs, {
      attachTo: document.body,
      props: { modelValue: 'stage' },
      slots: { stage: '<div />', agent: '<div />' },
    });
    const tabs = wrapper.findAll<HTMLButtonElement>('[role="tab"]');

    await tabs[1]?.trigger('click');
    expect(document.activeElement).toBe(tabs[1]?.element);

    await wrapper.setProps({ modelValue: 'agent' });
    await tabs[0]?.trigger('keydown', { key: 'Enter' });
    expect(document.activeElement).toBe(tabs[0]?.element);

    wrapper.unmount();
  });
});
