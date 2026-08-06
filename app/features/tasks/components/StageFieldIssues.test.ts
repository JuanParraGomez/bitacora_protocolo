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
    expect(issueItems[0]!.attributes('id')).toBe('stage-issue-f2-decision-1');
    expect(issueItems[0]!.attributes('data-control-id')).toBe('phase-two-decision');
    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').attributes('aria-describedby')).toBe(
      'stage-issue-f2-decision-1 stage-issue-f2-preguntasAbiertas-2 stage-issue-general-3',
    );
  });

  it('uses unique ids when one field has multiple distinct corrections', () => {
    const wrapper = mount(StageFieldIssues, {
      props: {
        issues: [
          { field: 'f1.analisisProblema.analisis', message: 'Define una hipótesis verificable.' },
          { field: 'f1.analisisProblema.analisis', message: 'Conecta el análisis con la evidencia.' },
        ],
      },
    });

    const ids = wrapper.findAll('[data-testid="stage-field-issue"]').map((issue) => issue.attributes('id'));
    expect(ids).toEqual([
      'stage-issue-f1-analisisProblema-analisis-1',
      'stage-issue-f1-analisisProblema-analisis-2',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').attributes('aria-describedby')).toBe(ids.join(' '));
  });

  it('announces the pending correction count and emits the agent recommendation request', async () => {
    const wrapper = mount(StageFieldIssues, {
      props: {
        issues: [
          { field: 'f1.analisisProblema.analisis', message: 'Define una hipótesis verificable para poder evaluar el análisis' },
          { field: 'f1.criterioExito', message: 'Define criterio(s) de éxito para cerrar la fase.' },
        ],
      },
    });

    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').text()).toContain('2 correcciones pendientes');
    expect(wrapper.get('[data-testid="stage-field-issues-agent-link"]').text()).toBe('Ver recomendaciones del agente');
    await wrapper.get('[data-testid="stage-field-issues-agent-link"]').trigger('click');
    expect(wrapper.emitted('requestAgentRecommendations')).toHaveLength(1);
  });
});
