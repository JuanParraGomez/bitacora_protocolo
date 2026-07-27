import { describe, expect, it } from 'vitest';
import { repairTask } from './task-rules';
import {
  buildPhaseSnapshot,
  buildPhaseRevision,
  canContinueByAssistant,
  classifyResponseConflict,
  getLatestCurrentEvaluation,
  isEvaluationCurrent,
} from './task-assistant-rules';

const taskForPhaseOne = () => repairTask({
  id: 'task-1',
  nombre: 'Migrar flujo',
  directiva: 'Mejora guiada',
  fase: 1,
  f1: {
    linaje: [{ origen: 'brief', resultado: 'migrar' }],
    dudas: 'Cómo arranca',
    promptOrientacion: 'Prompt legado',
    promptOrientacionPersonalizado: true,
    analisisProblema: {
      problemaDetectado: 'Falta definición',
      evidencia: 'No hay evidencia',
      analisis: 'Análisis',
      decision: 'mantener',
      justificacion: 'Se confirma',
      problemaVigente: 'Problema vigente',
    },
  },
});

const taskForPhaseTwo = () => repairTask({
  id: 'task-2',
  nombre: 'Guía',
  directiva: 'Guía profunda',
  fase: 2,
  f2: {
    decision: 'Propuesta definida',
    alcance: 'Cobertura completa',
    noObjetivos: 'No cubrir X',
    pasos: 'Paso 1; Paso 2',
    predicciones: [
      { texto: 'Predicción 1', umbral: 'alto', conf: 'alta' },
      { texto: 'Predicción 2', umbral: 'medio', conf: 'media' },
      { texto: 'Predicción 3', umbral: 'bajo', conf: 'baja' },
    ],
    promptGuia: 'Prompt legado',
    promptGuiaPersonalizado: false,
  },
});

describe('task assistant rules', () => {
  it('builds a canonical phase snapshot excluding legacy prompts', () => {
    const task = taskForPhaseOne();
    const snapshot = buildPhaseSnapshot(task, 1);

    expect(snapshot.phase).toBe(1);
    expect(snapshot.fields).not.toHaveProperty('promptOrientacion');
    expect(snapshot.fields).not.toHaveProperty('promptOrientacionPersonalizado');
    expect(snapshot.fields.analisisProblema).toBeUndefined();
  });

  it('keeps functional field changes stable in revision when prompts change', () => {
    const taskA = taskForPhaseOne();
    const taskB = taskForPhaseOne();
    taskB.f1.promptOrientacion = 'Prompt distinto';
    taskB.f1.promptOrientacionPersonalizado = !taskB.f1.promptOrientacionPersonalizado;

    expect(buildPhaseRevision(taskA)).toEqual(buildPhaseRevision(taskB));
  });

  it('changes phase revision when a functional field changes', () => {
    const taskA = taskForPhaseOne();
    const taskB = taskForPhaseOne();
    taskB.f1.dudas = 'Nueva duda';

    expect(buildPhaseRevision(taskA)).not.toEqual(buildPhaseRevision(taskB));
  });

  it('derives latest and current evaluation for the active phase', () => {
    const task = taskForPhaseTwo() as any;
    task.assistant = {
      schemaVersion: 1,
      messages: [],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
      evaluations: [
        {
          id: 'e-1',
          taskId: 'task-2',
          phase: 2,
          responseRevision: 'old',
          evaluatorVersion: 'mock-v1',
          status: 'needs-work',
          weaknesses: ['No cubre alcance'],
          recommendations: ['Ampliar alcance'],
          gatePassed: false,
          gateReasons: ['Alcance incompleto'],
          createdAt: 1,
        },
        {
          id: 'e-2',
          taskId: 'task-2',
          phase: 2,
          responseRevision: buildPhaseRevision(taskForPhaseTwo()),
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 2,
        },
      ],
    };

    const latest = getLatestCurrentEvaluation(task);
    expect(latest).toMatchObject({
      id: 'e-2',
      status: 'acceptable',
    });
    expect(isEvaluationCurrent(task, latest)).toBe(true);
    expect(isEvaluationCurrent(task, task.assistant.evaluations[0] as any)).toBe(false);
  });

  it('requires open gate and fresh acceptable evaluation to continue', () => {
    const task = taskForPhaseOne() as any;
    task.f1.checkMapeo = true;
    task.f1.confirmacion = true;
    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'e-1',
          taskId: 'task-1',
          phase: 1,
          responseRevision: buildPhaseRevision(task),
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 1,
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    task.f1.analisisProblema = {
      ...task.f1.analisisProblema,
      decision: 'mantener',
      justificacion: 'Actualizado',
      problemaVigente: 'Problema vigente',
    };
    expect(canContinueByAssistant(task)).toBe(true);

    task.f1.analisisProblema.decision = 'pendiente';
    expect(canContinueByAssistant(task)).toBe(false);
  });

  it('marks stale evaluations as conflicting for continuation', () => {
    const task = taskForPhaseOne() as any;
    task.f1.checkMapeo = true;
    task.f1.confirmacion = true;
    task.f1.analisisProblema = {
      ...task.f1.analisisProblema,
      decision: 'mantener',
      justificacion: 'OK',
      problemaVigente: 'Problema vigente',
    };
    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [
        {
          id: 'e-1',
          taskId: 'task-1',
          phase: 1,
          responseRevision: 'stale',
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 1,
        },
      ],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };

    expect(canContinueByAssistant(task)).toBe(false);
  });

  it('detects response conflicts by task/phase/revision context', () => {
    const task = taskForPhaseOne() as any;
    task.assistant = {
      schemaVersion: 1,
      messages: [],
      evaluations: [],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    };
    const revision = buildPhaseRevision(task);

    expect(classifyResponseConflict({
      task,
      response: { taskId: 'task-1', phase: 1, responseRevision: revision, requestId: 'r-1' },
    })).toBe(false);
    expect(classifyResponseConflict({
      task,
      response: { taskId: 'task-2', phase: 1, responseRevision: revision, requestId: 'r-2' },
    })).toBe(true);
    expect(classifyResponseConflict({
      task,
      response: { taskId: 'task-1', phase: 2, responseRevision: revision, requestId: 'r-3' },
    })).toBe(true);
    expect(classifyResponseConflict({
      task,
      response: { taskId: 'task-1', phase: 1, responseRevision: 'stale', requestId: 'r-4' },
    })).toBe(true);
  });
});
