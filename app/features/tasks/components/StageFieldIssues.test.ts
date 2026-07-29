import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StageFieldIssues from './StageFieldIssues.vue';

describe('StageFieldIssues', () => {
  it('renders deduplicated issues in stable order and links each field to its control', () => {
    const wrapper = mount(StageFieldIssues, {
      props: {
        issues: [
          { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
          { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
          { field: 'f2.preguntasAbiertas', message: 'Añade al menos una pregunta abierta pendiente.' },
          { field: null, message: 'Reescribe el alcance.' },
        ],
        fieldIdMap: {
          'f2.decision': 'phase-two-decision',
          'f2.preguntasAbiertas': 'phase-two-open-questions',
        },
      },
    });

    const issueItems = wrapper.findAll('[data-testid="stage-field-issue"]');
    expect(issueItems).toHaveLength(3);
    expect(issueItems.map((item) => item.text())).toEqual([
      'Escribe la decisión o resultado que habilita la tarea.',
      'Añade al menos una pregunta abierta pendiente.',
      'Reescribe el alcance.',
    ]);
    expect(issueItems[0]!.attributes('id')).toBe('stage-issue-f2-decision');
    expect(issueItems[0]!.attributes('data-control-id')).toBe('phase-two-decision');
    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').attributes('aria-describedby')).toBe(
      'stage-issue-f2-decision stage-issue-f2-preguntasAbiertas stage-issue-general-3',
    );
  });
});
