import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GuidancePhase from './GuidancePhase.vue';
import { stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';

describe('GuidancePhase manual persistence', () => {
  it('does not emit save while a text control is edited', async () => {
    const wrapper = mount(GuidancePhase, {
      props: { task: structuredClone(stageAgentWorkspaceTasks.phase2), saveTask: vi.fn() },
    });

    await wrapper.get('#phase-two-decision').setValue('cambio explícito');

    expect(wrapper.emitted('dirty')).toBeTruthy();
    expect(wrapper.emitted('save')).toBeUndefined();
  });
});
