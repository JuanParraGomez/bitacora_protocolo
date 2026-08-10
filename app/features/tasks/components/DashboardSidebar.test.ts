import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DashboardSidebar from './DashboardSidebar.vue';
import { stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';

const group = {
  project: {
    id: 'project-shell', name: 'Proyecto Shell', description: '', status: 'active',
    lastActiveTaskId: stageAgentWorkspaceTasks.phase1.id, createdAt: 0, updatedAt: 0,
  },
  activeTasks: [stageAgentWorkspaceTasks.phase1], pausedTasks: [], completedTasks: [],
  completedItems: [], isEmpty: false,
};

function mountSidebar() {
  return mount(DashboardSidebar, {
    props: { projectGroups: [group], selectedProjectId: group.project.id, selectedTaskId: stageAgentWorkspaceTasks.phase1.id },
    global: { stubs: { NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] } } },
  });
}

describe('DashboardSidebar shell contract', () => {
  it('renders one ordered navigation, search shortcut, projects tree, and user footer', () => {
    const wrapper = mountSidebar();
    expect(wrapper.find('[data-shell-region="navigation"]').exists()).toBe(true);
    expect(wrapper.find('[data-shell-region="search"]').exists()).toBe(true);
    expect(wrapper.find('[data-shell-region="projects"]').exists()).toBe(true);
    expect(wrapper.find('[data-shell-region="user-footer"]').exists()).toBe(true);
    expect(wrapper.find('#task-search').attributes('placeholder')).toBe('Buscar tareas o proyectos…');
    expect(wrapper.text()).toContain('⌘K');
    expect(wrapper.find('[aria-label="Tareas"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Biblioteca"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Referencias"]').exists()).toBe(true);
    expect(wrapper.find('[aria-label="Ajustes"]').exists()).toBe(true);
    expect(wrapper.find('[data-shell-user-name]').exists()).toBe(true);
  });

  it('does not duplicate primary destinations', () => {
    const wrapper = mountSidebar();
    for (const label of ['Tareas', 'Biblioteca', 'Ajustes']) {
      expect(wrapper.findAll(`[aria-label="${label}"]`)).toHaveLength(1);
    }
  });

  it('renders search as a single unified field without duplicated label row', () => {
    const wrapper = mountSidebar();
    const field = wrapper.find('[data-search-field]');
    expect(field.exists()).toBe(true);
    expect(field.find('#task-search').exists()).toBe(true);
    expect(field.find('kbd').text()).toBe('⌘K');
    expect(field.find('[data-search-icon]').exists()).toBe(true);
    const labelRow = wrapper.find('.task-sidebar__search-label');
    expect(labelRow.exists() === false || labelRow.classes().includes('sr-only')).toBe(true);
    expect(wrapper.findAll('input[type="search"]')).toHaveLength(1);
  });
});
