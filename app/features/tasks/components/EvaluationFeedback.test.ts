import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import EvaluationFeedback from './EvaluationFeedback.vue';
import type { EvaluationDisplay } from './workspace-presentation';

function mountFeedback(display: EvaluationDisplay) {
  return mount(EvaluationFeedback, {
    props: {
      display,
    },
  });
}

describe('EvaluationFeedback', () => {
  it('presents the blocked status without duplicating the correction banner', () => {
    const wrapper = mountFeedback({
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [
        { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
        { field: null, message: 'Reescribe el alcance.' },
      ],
    });

    expect(wrapper.text()).toContain('La evaluación requiere ajustes antes de continuar.');
    expect(wrapper.find('.evaluation-feedback__issue-list').exists()).toBe(false);
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.attributes('aria-live')).toBe('polite');
  });

  it('keeps transport failures recoverable through the delegated contextual action', () => {
    const wrapper = mountFeedback({
      status: 'transport-error',
      announcement: 'No fue posible contactar el evaluador.',
      recovery: 'evaluate',
      issues: [],
    });

    expect(wrapper.text()).toContain('No fue posible contactar el evaluador.');
    expect(wrapper.text()).toContain('Usa la acción principal para reintentar.');
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
