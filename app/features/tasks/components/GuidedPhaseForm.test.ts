import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import {
  buildGuidedPhaseFormModel,
  resolveGuidedPhaseSaveCopy,
} from './guided-phase-form';
import GuidedPhaseForm from './GuidedPhaseForm.vue';
import { stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';
import type { ContextualPrimaryAction, EvaluationDisplay } from './workspace-presentation';
import type { PhaseEvaluation } from '../domain/task-assistant.schema';
import type { Task } from '../domain/task.schema';

const blockedDisplay: EvaluationDisplay = {
  status: 'blocked',
  announcement: 'La evaluación requiere ajustes antes de continuar.',
  recovery: 'reevaluate',
  issues: [
    { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
    { field: 'f2.preguntasAbiertas', message: 'Añade al menos una pregunta abierta pendiente.' },
  ],
};

function mountForm(
  primaryAction: ContextualPrimaryAction,
  display: EvaluationDisplay = blockedDisplay,
  task: Task = stageAgentWorkspaceTasks.phase2,
  extraProps: Partial<{
    evaluation: PhaseEvaluation | null;
    isStaleEvaluation: boolean;
    evaluationError: string;
    canContinue: boolean;
  }> = {},
) {
  return mount(GuidedPhaseForm, {
    props: {
      task: structuredClone(task),
      primaryAction,
      evaluationDisplay: display,
      ...extraProps,
    },
    global: {
      stubs: {
        EvaluationFeedback: false,
      },
    },
  });
}

function makeNeedsWorkEvaluation(
  task: Task,
  gateReasons: string[],
  overrides: Partial<PhaseEvaluation> = {},
): PhaseEvaluation {
  return {
    id: 'guided-form-evaluation-001',
    taskId: task.id,
    phase: task.fase,
    responseRevision: 'rev-stage-agent-current',
    gateVersion: 'legacy-v1',
    methodVersionId: null,
    evaluatorVersion: 'mock-v1',
    status: 'needs-work',
    weaknesses: ['La evaluación requiere ajustes.'],
    recommendations: ['Revisa las correcciones marcadas.'],
    gatePassed: false,
    gateReasons,
    createdAt: 1_725_000_002_000,
    ...overrides,
  };
}

describe('guided-phase-form model', () => {
  it('prioritizes phase 1 synthesis fields before the context section', () => {
    const model = buildGuidedPhaseFormModel(stageAgentWorkspaceTasks.phase1);

    expect(model.phaseLabel).toBe('Entender el problema');
    expect(model.priorityFieldLabels).toEqual([
      'Problema detectado',
      'Evidencia',
      'Análisis',
      'Resultado deseado',
      'Criterio de éxito',
    ]);
    expect(model.contextSectionLabel).toBe('Contexto y confirmación');
    expect(model.priorityFieldLabels).not.toContain('Origen del linaje');
  });

  it.each([
    [stageAgentWorkspaceTasks.phase1, 'Entender el problema'],
    [stageAgentWorkspaceTasks.phase2, 'Descomponer el camino'],
    [stageAgentWorkspaceTasks.phase3, 'Ejecución'],
    [stageAgentWorkspaceTasks.phase4, 'Revisión'],
  ] as const)('uses one unprefixed phase title and one stepper for phase %s', (task, title) => {
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, task);

    expect(wrapper.get('#guided-form-title').text()).toBe(title);
    expect(wrapper.get('#guided-form-title').text()).not.toContain('Fase ');
    expect(wrapper.findAll('.guided-phase-form__progress-step')).toHaveLength(4);
    expect(wrapper.findAll('[data-primary-action="true"]')).toHaveLength(1);
    expect(wrapper.find('button').text()).not.toContain('Atrás');
  });

  it.each([
    [stageAgentWorkspaceTasks.phase1, 'Entender el problema'],
    [stageAgentWorkspaceTasks.phase2, 'Descomponer el camino'],
    [stageAgentWorkspaceTasks.phase3, 'Ejecución'],
    [stageAgentWorkspaceTasks.phase4, 'Revisión'],
  ] as const)('keeps the phase workspace section accessibly named for phase %s', (task, title) => {
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, task);
    const section = wrapper.get('section.phase-workspace');
    const labelledBy = section.attributes('aria-labelledby');
    const directLabel = section.attributes('aria-label');

    expect(directLabel || labelledBy).toBeTruthy();
    if (labelledBy) expect(wrapper.find(`#${labelledBy}`).exists()).toBe(true);
    expect(directLabel || wrapper.get(`#${labelledBy}`).text()).toContain(title);
  });

  it('renders phase one priority fields in order with informative counters', () => {
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, stageAgentWorkspaceTasks.phase1);

    const labels = wrapper.findAll('label').map((label) => label.text().trim()).filter(Boolean);
    expect(labels.slice(0, 5)).toEqual([
      'Problema detectado', 'Evidencia', 'Análisis', 'Resultado deseado', 'Criterio de éxito',
    ]);
    expect(wrapper.findAll('[data-stage-text-field]')).toHaveLength(13);
    expect(wrapper.findAll('[data-character-count]')[0]?.text()).toBe(`${stageAgentWorkspaceTasks.phase1.f1.analisisProblema.problemaDetectado.length}/500`);
    expect(wrapper.text()).toContain('Contexto y confirmación');
    expect(wrapper.text()).not.toContain('SÍNTESIS OPERATIVA');
  });

  it('preserves a historical value above 500 without a maxlength', async () => {
    const task = structuredClone(stageAgentWorkspaceTasks.phase1);
    task.f1.analisisProblema.problemaDetectado = 'x'.repeat(742);
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, task);

    const field = wrapper.get('#problem-detected');
    expect((field.element as HTMLTextAreaElement).value).toHaveLength(742);
    expect(field.attributes('maxlength')).toBeUndefined();
    expect(wrapper.find('[data-character-count="problem-detected"]').text()).toBe('742/500');
    await field.setValue('');
    expect(wrapper.find('[data-character-count="problem-detected"]').text()).toBe('0/500');
  });

  it.each([
    [stageAgentWorkspaceTasks.phase2, ['Decisión', 'Alcance', 'No-objetivos', 'Pasos', 'Dependencias y orden entre pasos', 'Subproblemas', 'Preguntas abiertas', 'Riesgos detectados', 'Predicciones', 'Criterios revisados']],
    [stageAgentWorkspaceTasks.phase3, ['Iteración 1', 'Qué hice 1', 'Qué pasó 1', 'Qué ajusté 1', 'Añadir iteración', 'Confirma que compila', 'Confirma que fue auditado']],
    [stageAgentWorkspaceTasks.phase4, ['Observado 1', 'Causa 1', 'Título de consolidación', 'Cambio procedimental', 'Patrón operativo', 'Conexiones y límites', 'Añadir confrontación']],
  ] as const)('keeps every phase capture control accessible in order for phase %s', (task, labels) => {
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, task);
    const text = wrapper.text();
    for (const label of labels) expect(text).toContain(label);
    expect(wrapper.findAll('[data-stage-text-field]').length).toBeGreaterThan(0);
  });

  it('keeps capture controls and save copy available across phases 2 to 4', () => {
    expect(buildGuidedPhaseFormModel(stageAgentWorkspaceTasks.phase2).captureControlLabels).toEqual([
      'Decisión',
      'Alcance',
      'No-objetivos',
      'Pasos',
      'Dependencias y orden entre pasos',
      'Subproblemas',
      'Preguntas abiertas',
      'Riesgos detectados',
      'Predicciones',
      'Criterios revisados',
    ]);

    expect(buildGuidedPhaseFormModel(stageAgentWorkspaceTasks.phase3).captureControlLabels).toEqual([
      'Iteración 1',
      'Añadir iteración',
      'Confirma que compila',
      'Confirma que fue auditado',
    ]);

    expect(buildGuidedPhaseFormModel(stageAgentWorkspaceTasks.phase4).captureControlLabels).toEqual([
      'Observado',
      'Causa',
      'Fue una suposición propia',
      'Título de consolidación',
      'Cambio procedimental',
      'Patrón operativo',
      'Conexiones y límites',
      'Añadir confrontación',
    ]);

    expect(resolveGuidedPhaseSaveCopy('dirty')).toEqual({
      statusLabel: 'Cambios sin guardar',
      actionLabel: 'Guardar borrador',
      helperLabel: 'Los cambios aún no se han guardado.',
      retryLabel: 'Reintentar',
    });
    expect(resolveGuidedPhaseSaveCopy('saving')).toEqual({
      statusLabel: 'Guardando…',
      actionLabel: 'Guardar borrador',
      helperLabel: 'Persistiendo el borrador actual.',
      retryLabel: 'Reintentar',
    });
    expect(resolveGuidedPhaseSaveCopy('saved')).toEqual({
      statusLabel: 'Borrador guardado',
      actionLabel: 'Guardar borrador',
      helperLabel: 'El borrador queda disponible para continuar.',
      retryLabel: 'Reintentar',
    });
    expect(resolveGuidedPhaseSaveCopy('error', 'No se pudo guardar el borrador.')).toEqual({
      statusLabel: 'No se pudo guardar el borrador.',
      actionLabel: 'Guardar borrador',
      helperLabel: 'El trabajo permanece en memoria y puede reintentarse.',
      retryLabel: 'Reintentar',
    });
  });

  it('renders one ordered footer with unique controls and mobile hooks', () => {
    const wrapper = mountForm({
      kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, stageAgentWorkspaceTasks.phase1);
    const footer = wrapper.find('[data-stage-footer]');
    expect(footer.exists()).toBe(true);
    expect(wrapper.findAll('[data-stage-footer]').length).toBe(1);
    expect(footer.find('.guided-phase-form__save-button').text()).toContain('Guardar borrador');
    expect(footer.findAll('.guided-phase-form__primary-action').length).toBe(1);
    const ids = wrapper.findAll('[id]').map((node) => node.attributes('id'));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each([
    {
      kind: 'evaluate' as const,
      label: 'Evaluar etapa',
      disabled: false,
      emitted: 'requestEvaluate',
    },
    {
      kind: 'evaluating' as const,
      label: 'Evaluando…',
      disabled: true,
      emitted: null,
    },
    {
      kind: 'reevaluate' as const,
      label: 'Reevaluar etapa',
      disabled: false,
      emitted: 'requestEvaluate',
    },
    {
      kind: 'continue' as const,
      label: 'Continuar a etapa 3',
      disabled: false,
      emitted: 'requestContinue',
    },
    {
      kind: 'finish' as const,
      label: 'Finalizar tarea',
      disabled: false,
      emitted: 'requestContinue',
    },
    {
      kind: 'return' as const,
      label: 'Volver a tareas',
      disabled: false,
      emitted: 'requestReturn',
    },
  ])('renders one contextual primary action for $kind', async ({ kind, label, disabled, emitted }) => {
    const wrapper = mountForm({
      kind,
      label,
      disabled,
      nextPhase: kind === 'continue' ? 3 : null,
      reason: kind === 'evaluating' ? 'La evaluación ya está en curso.' : null,
      gateReasons: [],
    });

    const primaryActions = wrapper.findAll('[data-primary-action="true"]');
    expect(primaryActions).toHaveLength(1);
    expect(primaryActions[0]!.text()).toBe(label);
    expect(primaryActions[0]!.attributes('disabled')).toBe(disabled ? '' : undefined);
    expect(wrapper.findAll('button').filter((button) => ['Evaluar', 'Continuar'].includes(button.text()))).toHaveLength(0);
    expect(wrapper.get('button.guided-phase-form__save-button').attributes('data-primary-action')).toBeUndefined();

    await primaryActions[0]!.trigger('click');
    if (emitted) {
      expect(wrapper.emitted(emitted)).toHaveLength(1);
    } else {
      expect(wrapper.emitted('requestEvaluate')).toBeUndefined();
      expect(wrapper.emitted('requestContinue')).toBeUndefined();
    }
  });

  it('associates field-level blocking causes with the matching phase controls', () => {
    const task = stageAgentWorkspaceTasks.phase2;
    const wrapper = mountForm({
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: 'Escribe la decisión o resultado que habilita la tarea.',
      gateReasons: ['Escribe la decisión o resultado que habilita la tarea.'],
    }, blockedDisplay, task, {
      evaluation: makeNeedsWorkEvaluation(task, [
        'Escribe la decisión o resultado que habilita la tarea.',
        'Añade al menos una pregunta abierta pendiente.',
      ]),
    });

    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').text()).toContain('La evaluación requiere ajustes');
    expect(wrapper.get('input#phase-two-decision').attributes('aria-describedby')).toContain('stage-issue-f2-decision-1');
    expect(wrapper.get('textarea#phase-two-open-questions').attributes('aria-describedby')).toContain('stage-issue-f2-preguntasAbiertas-2');
  });

  it('does not render recovery corrections from display-only gate issues', () => {
    const wrapper = mountForm({
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: 'La fase requiere una evaluación vigente.',
      gateReasons: ['La fase requiere una evaluación vigente.'],
    }, blockedDisplay);

    expect(wrapper.find('[data-testid="stage-field-issues-summary"]').exists()).toBe(false);
    expect(wrapper.findAll('[data-testid="stage-inline-issue"]')).toHaveLength(0);
    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(0);
    expect(wrapper.get('[data-primary-action="true"]').text()).toBe('Reevaluar etapa');
  });

  it('keeps the two IMG-UX-05 corrections inside their causative phase-one blocks', () => {
    const task = stageAgentWorkspaceTasks.phase1;
    const wrapper = mountForm({
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: null,
      gateReasons: [],
    }, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [
        { field: 'f1.analisisProblema.analisis', message: 'Define una hipótesis verificable para poder evaluar el análisis' },
        { field: 'f1.criterioExito', message: 'Define criterio(s) de éxito para cerrar la fase.' },
      ],
    }, task, {
      evaluation: makeNeedsWorkEvaluation(task, [
        'Define una hipótesis verificable para poder evaluar el análisis',
        'Define criterio(s) de éxito para cerrar la fase.',
      ]),
    });

    const analysisBlock = wrapper.findAll('[data-stage-text-field]').find((node) => node.find('#problem-analysis').exists());
    const successBlock = wrapper.findAll('[data-stage-text-field]').find((node) => node.find('#success-criteria').exists());
    expect(analysisBlock?.find('[data-testid="stage-inline-issue"]').text()).toContain('Define una hipótesis');
    expect(successBlock?.find('[data-testid="stage-inline-issue"]').text()).toContain('Define criterio(s)');
    expect(wrapper.findAll('[data-primary-action="true"]')).toHaveLength(1);
  });

  it('forwards the banner recommendation request to the workspace', async () => {
    const task = stageAgentWorkspaceTasks.phase2;
    const wrapper = mountForm({
      kind: 'reevaluate', label: 'Reevaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [],
    }, blockedDisplay, task, {
      evaluation: makeNeedsWorkEvaluation(task, ['Escribe la decisión o resultado que habilita la tarea.']),
    });
    await wrapper.get('[data-testid="stage-field-issues-agent-link"]').trigger('click');
    expect(wrapper.emitted('requestAgentRecommendations')).toHaveLength(1);
  });

  it('keeps the manual draft state in error when persistence fails', async () => {
    const saveTask = vi.fn().mockResolvedValue(false);
    const wrapper = mount(GuidedPhaseForm, {
      props: {
        task: structuredClone(stageAgentWorkspaceTasks.phase2),
        primaryAction: {
          kind: 'reevaluate',
          label: 'Reevaluar etapa',
          disabled: false,
          nextPhase: null,
          reason: null,
          gateReasons: [],
        },
        evaluationDisplay: blockedDisplay,
        saveTask,
      },
      global: {
        stubs: {
          EvaluationFeedback: false,
        },
      },
    });

    await wrapper.get('button.guided-phase-form__save-button').trigger('click');
    await flushPromises();

    expect(saveTask).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('No se pudo guardar el borrador.');
    expect(wrapper.text()).not.toContain('Borrador guardado');
  });

  it('associates compound gate reasons with every affected phase control', () => {
    const primaryAction: ContextualPrimaryAction = {
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: 'Completa el problema, la evidencia y el análisis.',
      gateReasons: ['Completa el problema, la evidencia y el análisis.'],
    };

    const phase1Task = stageAgentWorkspaceTasks.phase1;
    const phase1 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [
        { field: 'f1.linaje', message: 'Completa al menos una relación de linaje con dos campos.' },
        { field: 'f1.analisisProblema', message: 'Completa el problema, la evidencia y el análisis.' },
        { field: 'f1.analisisProblema.justificacion', message: 'Justifica la decisión y escribe la formulación vigente.' },
      ],
    }, phase1Task, {
      evaluation: makeNeedsWorkEvaluation(phase1Task, [
        'Completa al menos una relación de linaje con dos campos.',
        'Completa el problema, la evidencia y el análisis.',
        'Justifica la decisión y escribe la formulación vigente.',
      ]),
    });

    expect(phase1.get('input#lineage-source').attributes('aria-describedby')).toContain('stage-issue-f1-linaje-1');
    expect(phase1.get('input#lineage-result').attributes('aria-describedby')).toContain('stage-issue-f1-linaje-1');
    expect(phase1.get('textarea#problem-detected').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-2');
    expect(phase1.get('textarea#problem-evidence').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-2');
    expect(phase1.get('textarea#problem-analysis').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-2');
    expect(phase1.get('textarea#problem-justification').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-justificacion-3');
    expect(phase1.get('textarea#current-problem').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-justificacion-3');

    const phase3Task = stageAgentWorkspaceTasks.phase3;
    const phase3 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [{ field: 'f3.iteraciones', message: 'Registra al menos una iteración completa de ejecución y su siguiente ajuste.' }],
    }, phase3Task, {
      evaluation: makeNeedsWorkEvaluation(phase3Task, ['Registra al menos una iteración completa de ejecución y su siguiente ajuste.']),
    });

    expect(phase3.get('input#iteration-attempt-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones-1');
    expect(phase3.get('textarea#iteration-result-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones-1');
    expect(phase3.get('textarea#iteration-adjustment-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones-1');

    const phase4Task = {
      ...stageAgentWorkspaceTasks.phase4,
      estado: 'activa' as const,
    };
    const phase4 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [{ field: 'f4.aar', message: 'Completa observado y causa en cada predicción.' }],
    }, phase4Task, {
      evaluation: makeNeedsWorkEvaluation(phase4Task, ['Completa observado y causa en cada predicción.']),
    });

    expect(phase4.get('input#phase-four-observed-0').attributes('aria-describedby')).toContain('stage-issue-f4-aar-1');
    expect(phase4.get('input#phase-four-cause-0').attributes('aria-describedby')).toContain('stage-issue-f4-aar-1');
  });

  it.each([
    stageAgentWorkspaceTasks.phase1,
    stageAgentWorkspaceTasks.phase2,
    stageAgentWorkspaceTasks.phase3,
    stageAgentWorkspaceTasks.phase4,
  ])('marks phase $fase dirty on edit without autosave', async (task) => {
    const saveTask = vi.fn().mockResolvedValue(true);
    const wrapper = mount(GuidedPhaseForm, {
      props: {
        task: structuredClone(task),
        primaryAction: { kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [] },
        evaluationDisplay: blockedDisplay,
        saveTask,
      },
    });

    const field = wrapper.find('textarea, input:not([type="checkbox"])');
    expect(field.exists()).toBe(true);
    await field.setValue(`${field.element.value ?? ''} editado`);

    expect(wrapper.text()).toContain('Cambios sin guardar');
    expect(saveTask).not.toHaveBeenCalled();
  });

  it('keeps evaluation freshness separate from the draft chip', async () => {
    const saveTask = vi.fn().mockResolvedValue(true);
    const wrapper = mount(GuidedPhaseForm, {
      props: {
        task: structuredClone(stageAgentWorkspaceTasks.phase1),
        primaryAction: { kind: 'reevaluate', label: 'Reevaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [] },
        evaluationDisplay: blockedDisplay,
        isStaleEvaluation: true,
        saveTask,
      },
    });

    expect(wrapper.text()).toContain('Cambios sin evaluar');
    await wrapper.get('textarea').setValue('cambio local');
    expect(wrapper.text()).toContain('Cambios sin guardar');
    await wrapper.get('button.guided-phase-form__save-button').trigger('click');
    await flushPromises();
    expect(wrapper.text()).not.toContain('Cambios sin guardar');
    expect(wrapper.text()).toContain('Cambios sin evaluar');
  });

  it('preserves dirty state and values after a failed save and allows retry', async () => {
    const saveTask = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const wrapper = mount(GuidedPhaseForm, {
      props: {
        task: structuredClone(stageAgentWorkspaceTasks.phase1),
        primaryAction: { kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [] },
        evaluationDisplay: blockedDisplay,
        saveTask,
      },
    });

    await wrapper.get('textarea').setValue('valor a preservar');
    await wrapper.get('button.guided-phase-form__save-button').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('No se pudo guardar el borrador.');
    expect(wrapper.get('textarea').element.value).toBe('valor a preservar');
    await wrapper.get('button.guided-phase-form__save-button').trigger('click');
    await flushPromises();
    expect(saveTask).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).not.toContain('Cambios sin guardar');
  });

  it('resets the visual draft state when the task phase changes', async () => {
    const wrapper = mount(GuidedPhaseForm, {
      props: {
        task: structuredClone(stageAgentWorkspaceTasks.phase1),
        primaryAction: { kind: 'evaluate', label: 'Evaluar etapa', disabled: false, nextPhase: null, reason: null, gateReasons: [] },
        evaluationDisplay: blockedDisplay,
      },
    });
    await wrapper.get('textarea').setValue('cambio de fase uno');
    expect(wrapper.text()).toContain('Cambios sin guardar');
    await wrapper.setProps({ task: structuredClone(stageAgentWorkspaceTasks.phase2) });
    expect(wrapper.text()).not.toContain('Cambios sin guardar');
  });
});
