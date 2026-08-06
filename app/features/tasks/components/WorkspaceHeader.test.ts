import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import WorkspaceHeader from './WorkspaceHeader.vue';

describe('WorkspaceHeader shell contract', () => {
  it.each([[1, 'Orientación y rastreo'], [4, 'Cierre y aprendizajes']])('renders breadcrumb and phase %d of 4', (phase, phaseTitle) => {
    const wrapper = mount(WorkspaceHeader, { props: { projectName: 'Proyecto Alfa', taskName: 'Tarea Beta', phase, phaseTitle } });
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').text()).toContain('Proyecto Alfa');
    expect(wrapper.find('nav[aria-label="Breadcrumb"]').text()).toContain('Tarea Beta');
    expect(wrapper.find('[data-stage-chip]').text()).toContain(`Etapa ${phase} de 4`);
    expect(wrapper.text()).toContain(phaseTitle);
  });

  it('provides compact hamburger and logo with accessible names', () => {
    const wrapper = mount(WorkspaceHeader, { props: { projectName: 'P', taskName: 'T', phase: 1, phaseTitle: 'Orientación', compactNavigation: true } });
    expect(wrapper.find('[aria-label="Abrir navegación"]').exists()).toBe(true);
    expect(wrapper.find('[data-mobile-logo]').text()).toContain('Nexus');
  });

  it('keeps compact breadcrumb and stage chip beside one accessible overflow menu', async () => {
    const wrapper = mount(WorkspaceHeader, {
      props: {
        projectName: 'Proyecto con nombre largo',
        taskName: 'Tarea activa',
        phase: 1,
        phaseTitle: 'Orientación y rastreo',
        compactNavigation: true,
      },
    });

    expect(wrapper.get('[aria-label="Abrir navegación"]').exists()).toBe(true);
    expect(wrapper.get('nav[aria-label="Breadcrumb"]').text()).toContain('Proyecto con nombre largo');
    expect(wrapper.get('[data-stage-chip]').text()).toBe('Etapa 1 de 4');
    expect(wrapper.get('[data-workspace-overflow]').attributes('aria-label')).toBe('Más opciones del workspace');

    await wrapper.get('[data-overflow-action="library"]').trigger('click');
    await wrapper.get('[data-overflow-action="settings"]').trigger('click');
    expect(wrapper.emitted('openLibrary')).toHaveLength(1);
    expect(wrapper.emitted('openSettings')).toHaveLength(1);
  });

  it('renders one compact mobile context line without repeating the phase title', () => {
    const wrapper = mount(WorkspaceHeader, {
      props: {
        projectName: 'Proyecto',
        taskName: 'Tarea',
        phase: 1,
        phaseTitle: 'Orientación y rastreo',
        compactNavigation: true,
        mobileContext: true,
      },
    });

    expect(wrapper.get('[data-mobile-context]').text()).toBe('Etapa 1 de 4 · Orientación y rastreo');
    expect(wrapper.findAll('[data-phase-title]')).toHaveLength(0);
  });
});
