import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import {
  buildGuidedPhaseFormModel,
  resolveGuidedPhaseSaveCopy,
} from './guided-phase-form';
import GuidedPhaseForm from './GuidedPhaseForm.vue';
import { stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';
import type { ContextualPrimaryAction, EvaluationDisplay } from './workspace-presentation';

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
  task = stageAgentWorkspaceTasks.phase2,
) {
  return mount(GuidedPhaseForm, {
    props: {
      task: structuredClone(task),
      primaryAction,
      evaluationDisplay: display,
    },
    global: {
      stubs: {
        EvaluationFeedback: false,
      },
    },
  });
}

describe('guided-phase-form model', () => {
  it('prioritizes phase 1 synthesis fields before the context section', () => {
    const model = buildGuidedPhaseFormModel(stageAgentWorkspaceTasks.phase1);

    expect(model.phaseLabel).toBe('Fase 1 · Entender el problema');
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
    const wrapper = mountForm({
      kind: 'reevaluate',
      label: 'Reevaluar etapa',
      disabled: false,
      nextPhase: null,
      reason: 'Escribe la decisión o resultado que habilita la tarea.',
      gateReasons: ['Escribe la decisión o resultado que habilita la tarea.'],
    });

    expect(wrapper.get('[data-testid="stage-field-issues-summary"]').text()).toContain('La evaluación requiere ajustes');
    expect(wrapper.get('input#phase-two-decision').attributes('aria-describedby')).toContain('stage-issue-f2-decision');
    expect(wrapper.get('textarea#phase-two-open-questions').attributes('aria-describedby')).toContain('stage-issue-f2-preguntasAbiertas');
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

    const phase1 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [
        { field: 'f1.linaje', message: 'Completa al menos una relación de linaje con dos campos.' },
        { field: 'f1.analisisProblema', message: 'Completa el problema, la evidencia y el análisis.' },
        { field: 'f1.analisisProblema.justificacion', message: 'Justifica la decisión y escribe la formulación vigente.' },
      ],
    }, stageAgentWorkspaceTasks.phase1);

    expect(phase1.get('input#lineage-source').attributes('aria-describedby')).toContain('stage-issue-f1-linaje');
    expect(phase1.get('input#lineage-result').attributes('aria-describedby')).toContain('stage-issue-f1-linaje');
    expect(phase1.get('textarea#problem-detected').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema');
    expect(phase1.get('textarea#problem-evidence').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema');
    expect(phase1.get('textarea#problem-analysis').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema');
    expect(phase1.get('textarea#problem-justification').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-justificacion');
    expect(phase1.get('textarea#current-problem').attributes('aria-describedby')).toContain('stage-issue-f1-analisisProblema-justificacion');

    const phase3 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [{ field: 'f3.iteraciones', message: 'Registra al menos una iteración completa de ejecución y su siguiente ajuste.' }],
    }, stageAgentWorkspaceTasks.phase3);

    expect(phase3.get('input#iteration-attempt-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones');
    expect(phase3.get('textarea#iteration-result-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones');
    expect(phase3.get('textarea#iteration-adjustment-0').attributes('aria-describedby')).toContain('stage-issue-f3-iteraciones');

    const phase4 = mountForm(primaryAction, {
      status: 'blocked',
      announcement: 'La evaluación requiere ajustes antes de continuar.',
      recovery: 'reevaluate',
      issues: [{ field: 'f4.aar', message: 'Completa observado y causa en cada predicción.' }],
    }, {
      ...stageAgentWorkspaceTasks.phase4,
      estado: 'activa',
    });

    expect(phase4.get('input#phase-four-observed-0').attributes('aria-describedby')).toContain('stage-issue-f4-aar');
    expect(phase4.get('input#phase-four-cause-0').attributes('aria-describedby')).toContain('stage-issue-f4-aar');
  });
});
