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
});
