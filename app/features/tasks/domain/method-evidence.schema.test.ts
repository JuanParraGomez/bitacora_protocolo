import { describe, expect, it } from 'vitest';
import {
  automationOpportunitySchema,
  evidenceReferenceSchema,
  iterationSchema,
  methodVersionSchema,
  solutionStepSchema,
} from './method-evidence.schema';

describe('method evidence schema', () => {
  it('accepts a minimal safe evidence reference and keeps inert fields', () => {
    const parsed = evidenceReferenceSchema.parse({
      id: 'e-1',
      kind: 'note',
      label: 'Referencia de sesión',
      value: 'Notas de monitoreo',
    });
    expect(parsed.value).toBe('Notas de monitoreo');
  });

  it('rejects unsafe evidence content', () => {
    expect(() => evidenceReferenceSchema.parse({
      id: 'e-1',
      kind: 'observation',
      label: 'Observación',
      value: 'javascript:alert(1)',
    })).toThrow();
  });

  it('rejects empty evidence labels', () => {
    expect(() => evidenceReferenceSchema.parse({
      id: 'e-1',
      kind: 'note',
      label: '',
      value: '',
    })).toThrow();
  });

  it('rejects malformed duplicate evidence identifiers in an iteration', () => {
    expect(() => iterationSchema.parse({
      id: 'i-1',
      intento: 'Intento de verificación',
      resultado: 'Resultado inicial',
      ajuste: 'Ajustar parámetros',
      criterioIds: ['c-1'],
      methodVersionId: 'method-1',
      objective: 'Objetivo funcional',
      action: 'Ejecutar script',
      tool: 'CLI',
      input: 'Entrada local',
      result: 'Resultado esperado',
      evidence: [
        { id: 'ev-1', kind: 'note', label: 'Evidencia A', value: '' },
        { id: 'ev-1', kind: 'note', label: 'Evidencia B', value: '' },
      ],
      learning: 'Aprendí a ajustar el timeout',
      nextAdjustment: 'Revisar logs y volver a intentar',
      applicableConditions: ['Condición: entorno estable'],
      success: true,
      successCriteriaResults: [{ criterion: 'c-1', passed: true }],
    })).toThrow();
  });

  it('requires explicit next adjustment when no-action is asserted', () => {
    expect(() => iterationSchema.parse({
      id: 'i-2',
      intento: 'Intento',
      resultado: 'Resultado',
      ajuste: 'Ajuste',
      criterioIds: ['c-1'],
      methodVersionId: 'method-1',
      objective: 'Objetivo',
      action: 'Acción',
      tool: 'Herramienta',
      input: 'Entrada',
      result: 'Resultado',
      evidence: [{ id: 'ev-2', kind: 'note', label: 'Evidencia', value: '' }],
      learning: 'Aprendizaje',
      nextAdjustment: 'N/A',
      applicableConditions: ['Condición estable'],
    })).toThrow();
  });

  it('requires safe and complete execution iteration fields', () => {
    expect(() => iterationSchema.parse({
      id: 'i-3',
      intento: 'Intento',
      resultado: 'Resultado',
      ajuste: 'Ajuste',
      criterioIds: ['c-1'],
      methodVersionId: null,
      objective: 'Objetivo',
      action: 'Acción',
      tool: 'Herramienta',
      input: 'Entrada',
      result: 'Resultado',
      evidence: [],
      learning: 'Aprendizaje',
      nextAdjustment: 'Confirmado',
      applicableConditions: ['Condición estable'],
      success: true,
      successCriteriaResults: [{ criterion: 'c-1', passed: true }],
    })).toThrow();
  });

  it('rejects solution steps that depend on themselves', () => {
    expect(() => solutionStepSchema.parse({
      id: 'step-1',
      title: 'Paso 1',
      objective: 'Objetivo del paso',
      dependencies: ['step-1'],
      inputs: ['Input'],
      output: 'Salida esperada',
      tool: 'CLI',
      risk: 'Riesgo inicial',
      successCriterion: 'Criterio de finalización',
      sourceCriterionId: null,
    })).toThrow();
  });

  it('accepts a draft method version with valid minimum fields', () => {
    const parsed = methodVersionSchema.parse({
      id: 'method-1',
      version: 1,
      parentVersionId: null,
      status: 'draft',
      changeKind: 'initial',
      preconditions: ['Debe ejecutarse en entorno de pruebas'],
      steps: [{
        id: 'step-1',
        title: 'Paso base',
        objective: 'Objetivo base',
        dependencies: [],
        inputs: ['Input'],
        output: 'Salida',
        tool: 'CLI',
        risk: 'Riesgo conocido',
        successCriterion: 'Criterio medible',
        sourceCriterionId: null,
      }],
      tools: ['CLI'],
      inputs: ['Entrada'],
      outputs: ['Salida'],
      controls: ['Revisión humana'],
      exceptions: [],
      exceptionsReviewed: false,
      successCriteria: ['Verificación de salida'],
      supportingIterationIds: ['i-1'],
      createdAt: 1,
    });

    expect(parsed.status).toBe('draft');
    expect(parsed.supportingIterationIds).toEqual(['i-1']);
  });

  it('deduplicates supportingIterationIds inside method versions', () => {
    const parsed = methodVersionSchema.parse({
      id: 'method-dup',
      version: 1,
      parentVersionId: null,
      status: 'draft',
      changeKind: 'initial',
      preconditions: ['Contexto'],
      steps: [{
        id: 'step-1',
        title: 'Paso',
        objective: 'Objetivo',
        dependencies: [],
        inputs: ['Input'],
        output: 'Salida',
        tool: 'CLI',
        risk: 'Bajo',
        successCriterion: 'Funciona',
        sourceCriterionId: null,
      }],
      tools: ['CLI'],
      inputs: ['Input'],
      outputs: ['Salida'],
      controls: ['Revisión'],
      exceptions: [],
      exceptionsReviewed: false,
      successCriteria: ['Éxito'],
      supportingIterationIds: ['i-1', 'i-1', 'i-2'],
      createdAt: 1,
    });

    expect(parsed.supportingIterationIds).toEqual(['i-1', 'i-2']);
  });

  it('requires explicit exception review when publishing a method version', () => {
    expect(() => methodVersionSchema.parse({
      id: 'method-2',
      version: 2,
      parentVersionId: 'method-1',
      status: 'published',
      changeKind: 'material',
      preconditions: ['Debe ejecutarse'],
      steps: [{
        id: 'step-2',
        title: 'Paso 2',
        objective: 'Validar',
        dependencies: [],
        inputs: ['Input'],
        output: 'Salida',
        tool: 'CLI',
        risk: 'Riesgo bajo',
        successCriterion: 'Criterio claro',
        sourceCriterionId: null,
      }],
      tools: ['CLI'],
      inputs: ['Entrada'],
      outputs: ['Salida'],
      controls: ['Revisión humana'],
      exceptions: [],
      exceptionsReviewed: false,
      successCriteria: ['Criterio'],
      supportingIterationIds: ['i-1'],
      createdAt: 1,
    })).toThrow();
  });

  it('requires a parent version id for material method changes', () => {
    expect(() => methodVersionSchema.parse({
      id: 'method-2',
      version: 2,
      status: 'draft',
      changeKind: 'material',
      preconditions: ['Debe ejecutarse'],
      steps: [{
        id: 'step-2',
        title: 'Paso 2',
        objective: 'Validar',
        dependencies: [],
        inputs: ['Input'],
        output: 'Salida',
        tool: 'CLI',
        risk: 'Riesgo bajo',
        successCriterion: 'Criterio claro',
        sourceCriterionId: null,
      }],
      tools: ['CLI'],
      inputs: ['Entrada'],
      outputs: ['Salida'],
      controls: ['Revisión humana'],
      exceptions: [],
      exceptionsReviewed: false,
      successCriteria: ['Criterio'],
      supportingIterationIds: ['i-1'],
      createdAt: 1,
    })).toThrow();
  });

  it('requires a method version id for automation opportunities', () => {
    expect(() => automationOpportunitySchema.parse({
      id: 'opp-1',
      methodVersionId: '',
      stepIds: ['step-1'],
      classification: 'assistable',
      frequency: 'Frecuente',
      stability: 'Variable',
      risk: 'Moderado',
      humanJudgment: 'Revisar cada corrida',
      trigger: 'Archivo recibido',
      inputs: ['Archivo'],
      transformation: 'Normalizar',
      output: 'Salida normalizada',
      candidateTool: 'script',
      expectedFailures: ['Formato inválido'],
      humanCheckpoint: 'Validar que no se pierdan campos',
      occurrenceIterationIds: ['i-1'],
    })).toThrow();
  });

  it('requires an explicit trigger for assistable opportunities', () => {
    expect(() => automationOpportunitySchema.parse({
      id: 'opp-2',
      methodVersionId: 'method-1',
      stepIds: ['step-1'],
      classification: 'assistable',
      frequency: 'Frecuente',
      stability: 'Alta',
      risk: 'Bajo',
      humanJudgment: 'Revisar validación',
      trigger: '',
      inputs: ['Entrada'],
      transformation: 'Normalizar',
      output: 'Salida',
      candidateTool: 'script',
      expectedFailures: ['Falla de red'],
      humanCheckpoint: 'Confirmar salida crítica',
      occurrenceIterationIds: ['i-1'],
    })).toThrow();
  });

  it('rejects unsafe automation values', () => {
    expect(() => automationOpportunitySchema.parse({
      id: 'opp-3',
      methodVersionId: 'method-1',
      stepIds: ['step-1'],
      classification: 'manual',
      frequency: 'Alto impacto',
      stability: 'Media',
      risk: 'Bajo',
      humanJudgment: 'Revisión completa',
      trigger: 'manual',
      inputs: ['Archivo'],
      transformation: '<script>document.cookie</script>',
      output: 'Salida',
      candidateTool: 'editor',
      expectedFailures: ['Error de parseo'],
      humanCheckpoint: 'Revisión de seguridad',
      occurrenceIterationIds: ['i-1'],
    })).toThrow();
  });

  it('accepts duplicate opportunities inputs as deduplicated identifiers', () => {
    const parsed = automationOpportunitySchema.parse({
      id: 'opp-4',
      methodVersionId: 'method-1',
      stepIds: ['step-1', 'step-1', 'step-2'],
      classification: 'automatable',
      frequency: 'Semanal',
      stability: 'Alta',
      risk: 'Moderado',
      humanJudgment: 'Aprobación inicial',
      trigger: 'Evento recurrente',
      inputs: ['Entrada'],
      transformation: 'Transformación limpia',
      output: 'Resultado limpio',
      candidateTool: 'tool-a',
      expectedFailures: ['Formato inválido'],
      humanCheckpoint: 'Aprobación final',
      occurrenceIterationIds: ['i-1', 'i-1'],
    });

    expect(parsed.stepIds).toEqual(['step-1', 'step-2']);
    expect(parsed.occurrenceIterationIds).toEqual(['i-1']);
  });
});
