import { describe, expect, it } from 'vitest';
import {
  buildGuidedPhaseFormModel,
  resolveGuidedPhaseSaveCopy,
} from './guided-phase-form';
import { stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';

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
});
