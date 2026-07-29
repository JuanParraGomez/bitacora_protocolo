import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { stageAgentWorkspaceRecords, stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';
import type { Task, TaskIndex } from '../domain/task.schema';
import TaskCompletionSummary from './TaskCompletionSummary.vue';

function cloneTask(task: Task): Task {
  return structuredClone(task);
}

function asRecords(records: unknown[]): TaskIndex['registros'] {
  return records as TaskIndex['registros'];
}

describe('TaskCompletionSummary', () => {
  it('renders a read-only 4/4 summary with deterministic record ordering and one primary return action', async () => {
    const wrapper = mount(TaskCompletionSummary, {
      props: {
        task: cloneTask(stageAgentWorkspaceTasks.phase4),
        records: asRecords([
          ...stageAgentWorkspaceRecords.completed,
          ...stageAgentWorkspaceRecords.partialSources,
          ...stageAgentWorkspaceRecords.duplicates,
          {
            id: 'record-outside-task',
            titulo: 'Fuera de tarea',
            tareaId: 'other-task',
            taskId: 'other-task',
            projectId: 'legacy',
            resourceKind: 'method',
            sourceTaskId: 'other-task',
            sourceMethodVersionId: null,
            automationEvidence: null,
          },
        ]),
      },
    });

    expect(wrapper.get('[data-testid="completion-progress"]').text()).toContain('4/4');
    expect(wrapper.text()).toContain('El resumen final queda en solo lectura.');
    expect(wrapper.text()).toContain('El resumen final depende de datos persistidos');
    expect(wrapper.text()).toContain('IMG-UX-02');
    expect(wrapper.text()).toContain('Mantener el cierre idempotente');

    const recordItems = wrapper.findAll('[data-testid="completion-record"]');
    expect(recordItems.map((item) => item.attributes('data-record-id'))).toEqual([
      'record-stage-agent-method',
      'record-stage-agent-learning',
      'record-stage-agent-tool',
      'record-stage-agent-partial-1',
      'record-stage-agent-partial-2',
      'record-stage-agent-partial-3',
      'record-stage-agent-duplicate',
    ]);
    expect(wrapper.text()).toContain('Duplicado 1');
    expect(wrapper.text()).not.toContain('Duplicado 2');
    expect(wrapper.text()).not.toContain('Fuera de tarea');

    const primaryActions = wrapper.findAll('[data-primary-action="true"]');
    expect(primaryActions).toHaveLength(1);
    expect(primaryActions[0]!.text()).toBe('Volver a tareas');
    expect(wrapper.findAll('input, textarea, select')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Guardar borrador');
    expect(wrapper.text()).not.toContain('Biblioteca');

    await primaryActions[0]!.trigger('click');
    expect(wrapper.emitted('requestReturn')).toHaveLength(1);
    expect(wrapper.emitted('save')).toBeUndefined();
    expect(wrapper.emitted('dirty')).toBeUndefined();
    expect(wrapper.emitted('requestContinue')).toBeUndefined();
  });

  it('shows No registrado for every missing completion source without inventing fallback data', () => {
    const task = cloneTask(stageAgentWorkspaceTasks.phase4);
    task.f4.cambio = '';
    task.f4.conexiones = '';
    task.f2.decision = '';
    task.f1.analisisProblema.decision = '';
    task.f1.analisisProblema.justificacion = '';
    task.f1.analisisProblema.evidencia = '';
    task.f3.iteraciones = [];

    const wrapper = mount(TaskCompletionSummary, {
      props: {
        task,
        records: [],
      },
    });

    expect(wrapper.get('[data-testid="completion-progress"]').text()).toContain('4/4');
    expect(wrapper.findAll('[data-testid="completion-empty"]').map((item) => item.text())).toEqual([
      'No registrado',
      'No registrado',
      'No registrado',
      'No registrado',
      'No registrado',
    ]);
    expect(wrapper.findAll('[data-testid="completion-record"]')).toHaveLength(0);
  });
});
