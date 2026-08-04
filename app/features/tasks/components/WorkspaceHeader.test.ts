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
});
