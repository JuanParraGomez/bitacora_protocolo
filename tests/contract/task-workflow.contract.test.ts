import { describe, expect, it } from 'vitest';
import { canContinueByAssistant, getLatestCurrentEvaluation, isEvaluationCurrent } from '../../app/features/tasks/domain/task-assistant-rules';
import { phaseInstructions } from '../../app/features/tasks/domain/phase-instructions';
import { canAdvance } from '../../app/features/tasks/domain/task-rules';
import { repairTask } from '../../app/features/tasks/domain/task.schema';
import { buildPhaseRevision } from '../../app/features/tasks/domain/task-assistant-rules';

describe('task-workflow contract', () => {
  it('uses the canonical four stage labels', () => {
    expect(phaseInstructions[1]?.[0]?.title).toBe('Entender el problema');
    expect(phaseInstructions[2]?.[0]?.title).toBe('Descomponer el camino');
    expect(phaseInstructions[3]?.[0]?.title).toBe('Ejecutar e iterar');
    expect(phaseInstructions[4]?.[0]?.title).toBe('Consolidar y automatizar');
  });

  it('requires minimum deliverables before stage advancement', () => {
    const phase1 = repairTask({
      id: 'contract-p1',
      fase: 1,
      nombre: 'Contrato',
      directiva: 'Entender contrato',
      f1: {
        linaje: [{ origen: 'brief', resultado: 'resolver' }],
        checkMapeo: true,
        confirmacion: true,
        resultadoDeseado: 'Resultado estable',
        alcance: 'Alcance',
        restricciones: 'Sin cambios de contrato',
        actores: ['Operaciones'],
        criterioExito: 'Se completa sin errores',
        analisisProblema: {
          problemaDetectado: 'Problema base',
          evidencia: 'Evidencia base',
          analisis: 'Análisis base',
          decision: 'mantener',
          justificacion: 'Revisado',
          problemaVigente: 'Problema vigente',
        },
      },
    });
    const phase2 = repairTask({
      id: 'contract-p2',
      fase: 2,
      nombre: 'Contrato',
      directiva: 'Descomponer contrato',
      f2: {
        decision: 'Decisión',
        alcance: 'Alcance',
        noObjetivos: 'Sin objetivos externos',
        pasos: '1. Identificar\n2. Ejecutar',
        predicciones: [
          { texto: 'Predicción 1', umbral: '1', conf: 'alta' },
          { texto: 'Predicción 2', umbral: '2', conf: 'media' },
          { texto: 'Predicción 3', umbral: '3', conf: 'media' },
        ],
        subproblemas: ['Subproblema'],
        preguntasAbiertas: ['¿Qué falla si... ?'],
        riesgos: ['Riesgo'],
      },
    });
    const phase3 = repairTask({
      id: 'contract-p3',
      fase: 3,
      nombre: 'Contrato',
      directiva: 'Iterar contrato',
      f3: {
        iteraciones: [
          {
            id: 'it-1',
            intento: 'Intento',
            resultado: 'Resultado',
            ajuste: 'Ajuste',
            criterioIds: [],
            methodVersionId: 'method-1',
            objective: 'Objetivo',
            action: 'Acción',
            tool: 'CLI',
            input: 'Input',
            result: 'Resultado',
            evidence: [{ id: 'e-1', kind: 'note', label: 'Evidencia', value: 'ok' }],
            learning: 'Aprendizaje',
            nextAdjustment: 'Sin acción',
            applicableConditions: ['Condición'],
            success: true,
            successCriteriaResults: [{ criterion: 'criterio', passed: true }],
          },
        ],
        checkCompila: true,
        checkAuditado: true,
      },
      methodVersions: [
        {
          id: 'method-1',
          version: 1,
          preconditions: ['Precondición'],
          steps: [
            {
              id: 'step-1',
              title: 'Paso',
              objective: 'Objetivo',
              dependencies: [],
              inputs: ['Input'],
              output: 'Salida',
              tool: 'CLI',
              risk: 'Riesgo',
              successCriterion: 'Resultado esperado',
              sourceCriterionId: null,
            },
          ],
          tools: ['CLI'],
          inputs: ['Input'],
          outputs: ['Salida'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado esperado'],
          createdAt: 1,
        },
      ],
    });
    const phase4 = repairTask({
      id: 'contract-p4',
      fase: 4,
      nombre: 'Contrato',
      directiva: 'Consolidar contrato',
      f4: {
        aar: [{ pred: 'Predicción', observado: 'Observado', causa: 'Causa', mia: true }],
        cambio: 'Cambios consolidados',
        titulo: 'Método consolidado',
        patron: 'Patrón base',
        mejorasCriterios: [{ criterioId: 'c1', confirmado: true, mejora: 'Mejora' }],
      },
      methodVersions: [
        {
          id: 'method-1',
          version: 1,
          preconditions: ['Precondición'],
          steps: [
            {
              id: 'step-1',
              title: 'Paso',
              objective: 'Objetivo',
              dependencies: [],
              inputs: ['Input'],
              output: 'Salida',
              tool: 'CLI',
              risk: 'Riesgo',
              successCriterion: 'Resultado esperado',
              sourceCriterionId: null,
            },
          ],
          tools: ['CLI'],
          inputs: ['Input'],
          outputs: ['Salida'],
          controls: ['Revisión humana'],
          exceptions: [],
          exceptionsReviewed: true,
          successCriteria: ['Resultado esperado'],
          supportingIterationIds: [],
          createdAt: 1,
        },
      ],
      automationOpportunities: [
        {
          id: 'opp-1',
          methodVersionId: 'method-1',
          stepIds: ['step-1'],
          classification: 'manual',
          frequency: 'Baja',
          stability: 'Estable',
          risk: 'Controlado',
          humanJudgment: 'Validación',
          trigger: 'Entrada válida',
          inputs: ['Input'],
          transformation: 'Normalizar',
          output: 'Output',
          candidateTool: 'Tool',
          expectedFailures: ['Error de salida'],
          humanCheckpoint: 'Confirmar',
          occurrenceIterationIds: ['it-1'],
        },
      ],
    });

    expect(canAdvance(phase1).allowed).toBe(true);
    expect(canAdvance(phase2).allowed).toBe(true);
    expect(canAdvance(phase3).allowed).toBe(true);
    expect(canAdvance(phase4).allowed).toBe(true);
  });

  it('keeps only one current outcome-v2 per task/phase/version combination', () => {
    const task = repairTask({
      id: 'contract-outcome',
      fase: 1,
      nombre: 'Contrato',
      directiva: 'Outcome por fase',
      f1: {
        linaje: [{ origen: 'brief', resultado: 'resolver' }],
        checkMapeo: true,
        confirmacion: true,
        resultadoDeseado: 'Resultado',
        alcance: 'Alcance',
        restricciones: 'Restricción',
        actores: ['Actor'],
        criterioExito: 'Criterio',
        analisisProblema: {
          problemaDetectado: 'Detectado',
          evidencia: 'Evidencia',
          analisis: 'Análisis',
          decision: 'reformular',
          justificacion: 'Justificación',
          problemaVigente: 'Vigente',
        },
      },
    });
    const baseRevision = buildPhaseRevision(task);

    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'legacy',
          taskId: task.id,
          phase: 1,
          responseRevision: baseRevision,
          gateVersion: 'legacy-v1',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 1,
        },
        {
          id: 'stale',
          taskId: task.id,
          phase: 1,
          responseRevision: `${baseRevision}-old`,
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 2,
        },
        {
          id: 'current',
          taskId: task.id,
          phase: 1,
          responseRevision: baseRevision,
          gateVersion: 'outcome-v2',
          methodVersionId: null,
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 3,
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    const currentOutcomes = task.assistant.evaluations.filter((evaluation) => isEvaluationCurrent(task, evaluation));

    expect(currentOutcomes).toHaveLength(1);
    expect(currentOutcomes[0]!.id).toBe('current');
    expect(getLatestCurrentEvaluation(task)).toMatchObject({ id: 'current' });
    expect(canContinueByAssistant(task)).toBe(true);
  });
});
