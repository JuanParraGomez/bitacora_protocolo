import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StageTextField from './StageTextField.vue';

function mountField(value = '') {
  return mount(StageTextField, {
    props: {
      id: 'problem-detected',
      label: 'Problema detectado',
      modelValue: value,
      icon: 'problem',
      as: 'textarea',
    },
  });
}

describe('StageTextField', () => {
  it.each([
    ['', '0/500'],
    ['x'.repeat(499), '499/500'],
    ['x'.repeat(500), '500/500'],
    ['x'.repeat(742), '742/500'],
  ])('reports the live informational count for %s', (value, expected) => {
    const wrapper = mountField(value);
    expect(wrapper.get('[data-stage-text-field]').exists()).toBe(true);
    expect(wrapper.get('label[for="problem-detected"]').text()).toContain('Problema detectado');
    expect(wrapper.get('[data-character-count="problem-detected"]').text()).toBe(expected);
    expect(wrapper.get('svg[aria-hidden="true"]').exists()).toBe(true);
    expect(wrapper.get('textarea').attributes('maxlength')).toBeUndefined();
  });

  it('supports editing and replacing the value without truncation', async () => {
    const wrapper = mountField('initial');
    await wrapper.get('textarea').setValue('changed');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['changed']);
    expect(wrapper.get('[data-character-count="problem-detected"]').text()).toBe('7/500');
  });

  it('renders all inline corrections inside the field and associates them with the control', () => {
    const wrapper = mount(StageTextField, {
      props: {
        id: 'problem-analysis',
        label: 'Análisis',
        modelValue: '',
        issues: [
          { field: 'f1.analisisProblema.analisis', message: 'Define una hipótesis verificable para poder evaluar el análisis' },
          { field: 'f1.analisisProblema.analisis', message: 'Añade una evidencia comprobable.' },
        ],
      },
    });

    const block = wrapper.get('[data-stage-text-field]');
    expect(block.findAll('[data-testid="stage-inline-issue"]')).toHaveLength(2);
    expect(block.get('textarea').attributes('aria-invalid')).toBe('true');
    expect(block.get('textarea').attributes('aria-describedby')).toContain('stage-inline-issue-f1-analisisProblema-analisis-1');
    expect(block.get('textarea').attributes('aria-describedby')).toContain('stage-inline-issue-f1-analisisProblema-analisis-2');
  });
});
