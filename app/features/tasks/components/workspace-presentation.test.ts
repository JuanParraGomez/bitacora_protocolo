import { describe, expect, it } from 'vitest';

import { stageAgentWorkspaceRecords, stageAgentWorkspaceTasks } from '../../../../tests/fixtures/tasks/stage-agent-workspace';
import type { PhaseEvaluation } from '../domain/task-assistant.schema';
import type { Task } from '../domain/task.schema';
import {
  projectCompletionSummary,
  resolveContextualPrimaryAction,
  resolveEvaluationDisplay,
} from './workspace-presentation';

function cloneTask(task: Task): Task {
  return structuredClone(task);
}

function makeEvaluation(overrides: Partial<PhaseEvaluation> = {}): PhaseEvaluation {
  return {
    id: 'evaluation-stage-agent-001',
    taskId: stageAgentWorkspaceTasks.phase2.id,
    phase: 2,
    responseRevision: 'rev-stage-agent-current',
    gateVersion: 'outcome-v2',
    methodVersionId: 'method-stage-agent-001',
    evaluatorVersion: 'mock-v1',
    status: 'acceptable',
    weaknesses: [],
    recommendations: [],
    gatePassed: true,
    gateReasons: [],
    createdAt: 1_725_000_001_000,
    ...overrides,
  };
}

describe('workspace presentation', () => {
  describe('resolveContextualPrimaryAction', () => {
    it.each([
      {
        name: 'prompts evaluation when the task is active and no evaluation exists',
        snapshot: {
          phase: 2 as const,
          taskState: 'active' as const,
          evaluation: null,
          isEvaluating: false,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'evaluate', label: 'Evaluar etapa', disabled: false },
      },
      {
        name: 'shows the in-flight state while evaluation is running',
        snapshot: {
          phase: 2 as const,
          taskState: 'active' as const,
          evaluation: null,
          isEvaluating: true,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'evaluating', label: 'Evaluando…', disabled: true },
      },
      {
        name: 'continues to the next phase when the evaluation is acceptable and the gate allows it',
        snapshot: {
          phase: 2 as const,
          taskState: 'active' as const,
          evaluation: makeEvaluation(),
          isEvaluating: false,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'continue', label: 'Continuar a etapa 3', disabled: false, nextPhase: 3 },
      },
      {
        name: 'finishes the task from phase 4 when the gate allows it',
        snapshot: {
          phase: 4 as const,
          taskState: 'active' as const,
          evaluation: makeEvaluation({ phase: 4, taskId: stageAgentWorkspaceTasks.phase4.id, responseRevision: 'rev-stage-agent-final', methodVersionId: 'method-stage-agent-002' }),
          isEvaluating: false,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'finish', label: 'Finalizar tarea', disabled: false },
      },
      {
        name: 'falls back to reevaluate when the latest evaluation is stale',
        snapshot: {
          phase: 2 as const,
          taskState: 'active' as const,
          evaluation: makeEvaluation(),
          isEvaluating: false,
          isStaleEvaluation: true,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'reevaluate', label: 'Reevaluar etapa', disabled: false },
      },
      {
        name: 'keeps a rejected gate from becoming continue or finish',
        snapshot: {
          phase: 2 as const,
          taskState: 'active' as const,
          evaluation: makeEvaluation(),
          isEvaluating: false,
          gateResult: {
            allowed: false,
            reasons: [
              'Escribe la decisión o resultado que habilita la tarea.',
              'Escribe la decisión o resultado que habilita la tarea.',
              'Añade al menos una pregunta abierta pendiente.',
            ],
          },
          transportError: null,
        },
        expected: { kind: 'reevaluate', label: 'Reevaluar etapa', disabled: false },
      },
      {
        name: 'returns to the task list when the task is already completed',
        snapshot: {
          phase: 4 as const,
          taskState: 'completed' as const,
          evaluation: makeEvaluation({ phase: 4, taskId: stageAgentWorkspaceTasks.phase4.id, responseRevision: 'rev-stage-agent-final', methodVersionId: 'method-stage-agent-002' }),
          isEvaluating: false,
          gateResult: { allowed: true, reasons: [] as string[] },
          transportError: null,
        },
        expected: { kind: 'return', label: 'Volver a tareas', disabled: false },
      },
    ])('$name', ({ snapshot, expected }) => {
      expect(resolveContextualPrimaryAction(snapshot)).toMatchObject(expected);
    });
  });

  describe('resolveEvaluationDisplay', () => {
    it('maps blocked gate reasons to fields and deduplicates repeated messages', () => {
      const display = resolveEvaluationDisplay({
        phase: 2,
        latestEvaluation: makeEvaluation({
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
        }),
        isEvaluating: false,
        isStaleEvaluation: false,
        transportError: null,
        gateResult: {
          allowed: false,
          reasons: [
            'Escribe la decisión o resultado que habilita la tarea.',
            'Escribe la decisión o resultado que habilita la tarea.',
            'Añade al menos una pregunta abierta pendiente.',
          ],
        },
      });

      expect(display).toMatchObject({
        status: 'blocked',
        recovery: 'reevaluate',
        announcement: expect.stringContaining('ajustes'),
      });
      expect(display.issues).toEqual([
        { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
        { field: 'f2.preguntasAbiertas', message: 'Añade al menos una pregunta abierta pendiente.' },
      ]);
    });

    it.each([
      {
        name: 'reports a stale evaluation as stale and suggests reevaluation',
        input: {
          phase: 2 as const,
          latestEvaluation: makeEvaluation(),
          isEvaluating: false,
          isStaleEvaluation: true,
          transportError: null,
          gateResult: { allowed: true, reasons: [] as string[] },
        },
        expected: { status: 'stale', recovery: 'reevaluate' },
      },
      {
        name: 'reports transport failures without inventing a successful state',
        input: {
          phase: 2 as const,
          latestEvaluation: null,
          isEvaluating: false,
          isStaleEvaluation: false,
          transportError: 'No fue posible contactar el evaluador.',
          gateResult: { allowed: true, reasons: [] as string[] },
        },
        expected: { status: 'transport-error', recovery: 'evaluate' },
      },
      {
        name: 'treats a non-acceptable evaluation as blocked',
        input: {
          phase: 2 as const,
          latestEvaluation: makeEvaluation({
            status: 'needs-work',
            weaknesses: ['Falta claridad en el alcance.'],
            recommendations: ['Reescribe el alcance.'],
            gatePassed: false,
            gateReasons: ['Escribe la decisión o resultado que habilita la tarea.'],
          }),
          isEvaluating: false,
          isStaleEvaluation: false,
          transportError: null,
          gateResult: { allowed: true, reasons: [] as string[] },
        },
        expected: { status: 'blocked', recovery: 'reevaluate' },
      },
    ])('$name', ({ input, expected }) => {
      const display = resolveEvaluationDisplay(input);
      expect(display.status).toBe(expected.status);
      expect(display.recovery).toBe(expected.recovery);
      if (expected.status === 'stale') {
        expect(display.announcement).toContain('desfasada');
      }
      if (expected.status === 'transport-error') {
        expect(display.announcement).toContain('No fue posible contactar');
      }
      if (expected.status === 'blocked' && input.latestEvaluation?.status === 'needs-work') {
        expect(display.issues).toEqual([
          { field: 'f2.decision', message: 'Escribe la decisión o resultado que habilita la tarea.' },
          { field: null, message: 'Falta claridad en el alcance.' },
          { field: null, message: 'Reescribe el alcance.' },
        ]);
      }
    });
  });

  describe('projectCompletionSummary', () => {
    it('projects the final outcome, deduplicated learnings and evidence, and keeps only matching unique records', () => {
      const task = cloneTask(stageAgentWorkspaceTasks.phase4);
      task.f4.cambio = '';
      task.f2.decision = 'Decisión de cierre';
      task.f3.iteraciones = [
        {
          ...task.f3.iteraciones[0]!,
          learning: 'Aprendizaje repetido',
          evidence: [
            { id: 'evidence-a', kind: 'artifact', label: 'Captura', value: 'IMG-UX-02' },
          ],
          result: 'Resultado preliminar',
          resultado: 'Resultado preliminar',
        },
        {
          ...task.f3.iteraciones[0]!,
          id: 'iteration-duplicate',
          learning: 'Aprendizaje repetido',
          evidence: [
            { id: 'evidence-b', kind: 'artifact', label: 'Captura', value: 'IMG-UX-03' },
          ],
          result: '',
          resultado: 'Resultado final por resultado',
        },
        {
          ...task.f3.iteraciones[0]!,
          id: 'iteration-final',
          learning: 'Aprendizaje único',
          evidence: [
            { id: 'evidence-c', kind: 'artifact', label: 'Captura', value: 'IMG-UX-03' },
          ],
          result: 'Resultado final por result',
          resultado: 'Resultado final por resultado',
        },
      ];

      const summary = projectCompletionSummary(task, [
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
      ]);

      expect(summary).toMatchObject({
        progress: '4/4',
        finalOutcome: 'Resultado final por result',
        keyLearning: ['Aprendizaje repetido', 'Aprendizaje único'],
        evidence: ['IMG-UX-02', 'IMG-UX-03'],
        decision: 'Decisión de cierre',
      });
      expect(summary.records.map((record) => record.id)).toEqual([
        'record-stage-agent-method',
        'record-stage-agent-learning',
        'record-stage-agent-tool',
        'record-stage-agent-partial-1',
        'record-stage-agent-partial-2',
        'record-stage-agent-partial-3',
        'record-stage-agent-duplicate',
      ]);
    });

    it('falls back to connections, problem evidence and No registrado when completion text is missing', () => {
      const task = cloneTask(stageAgentWorkspaceTasks.phase4);
      task.f4.cambio = '';
      task.f3.iteraciones = [];
      task.f4.conexiones = 'Conexiones finales';
      task.f1.analisisProblema.evidencia = 'Evidencia de respaldo';
      task.f2.decision = '';
      task.f1.analisisProblema.decision = 'mantener';
      task.f1.analisisProblema.justificacion = 'Justificación de respaldo';

      const summary = projectCompletionSummary(task, []);

      expect(summary).toMatchObject({
        progress: '4/4',
        finalOutcome: 'No registrado',
        keyLearning: ['Conexiones finales'],
        evidence: ['Evidencia de respaldo'],
        decision: 'mantener',
      });
    });

    it('reports completed progress as 4/4 even for repaired historical tasks with a lower phase', () => {
      const task = cloneTask(stageAgentWorkspaceTasks.phase4);
      task.fase = 2;

      expect(projectCompletionSummary(task, []).progress).toBe('4/4');
    });
  });
});
