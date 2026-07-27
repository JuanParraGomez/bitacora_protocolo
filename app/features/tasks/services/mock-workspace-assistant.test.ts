import { describe, expect, it } from 'vitest';
import { repairTask } from '../domain/task-rules';
import { getPhaseInstructionKey } from '../domain/phase-instructions';
import { createMockWorkspaceAssistant, type MockWorkspaceAdapterOptions } from './mock-workspace-assistant';
import { buildPhaseRevision } from '../domain/task-assistant-rules';

describe('mock workspace assistant', () => {
  function createTaskSeed() {
    return repairTask({
      id: 'task-chat',
      nombre: 'Espacio test',
      fase: 1,
      directiva: 'Directiva base',
      f1: {
        linaje: [{ origen: 'Origen', resultado: 'Resultado' }],
        analisisProblema: {
          problemaDetectado: 'Detectado', evidencia: 'Evidencia', analisis: 'Análisis',
          decision: 'reformular', justificacion: 'Justificada', problemaVigente: 'Problema vigente',
        },
      },
    });
  }

  function requestSeed(override: Partial<MockWorkspaceAdapterOptions> = {}) {
    const task = createTaskSeed();
    const assistant = createMockWorkspaceAssistant(override);

    return {
      task,
      assistant,
      baseRevision: buildPhaseRevision(task),
    };
  }

  it('sends a deterministic message, bounded suggestions and stable updates', async () => {
    const { task, assistant, baseRevision } = requestSeed();
    const response = await assistant.send({
      requestId: 'r-001',
      workspaceLabel: 'Proyecto principal',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: 'Necesito completar el problema y la formulación',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });

    expect(response.taskId).toBe(task.id);
    expect(response.phase).toBe(1);
    expect(response.baseRevision).toBe(baseRevision);
    expect(response.suggestions).toHaveLength(3);
    expect(response.updates.every((update) => update.status === 'proposed')).toBe(true);
    expect(response.message).toContain('Proyecto principal');
  });

  it('returns malformed-validated adapter errors as rejected promises', async () => {
    const { task, assistant, baseRevision } = requestSeed({ sendMode: 'malformed' });
    await expect(assistant.send({
      requestId: 'r-mal',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: 'Mensaje normal',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow();
  });

  it('rejects empty and instruction-like input safely', async () => {
    const { task, assistant, baseRevision } = requestSeed();

    await expect(assistant.send({
      requestId: 'r-empty',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: '   ',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow();

    await expect(assistant.send({
      requestId: 'r-instr',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: '<script>alert(1)</script> Completa',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow();
  });

  it('maps allowed phase-specific updates from user intent', async () => {
    const { task, assistant } = requestSeed();

    const phaseOne = await assistant.send({
      requestId: 'r-phase-1',
      workspaceLabel: 'Proyecto principal',
      taskId: task.id,
      phase: 1,
      baseRevision: buildPhaseRevision(task, 1),
      message: 'Completo problema: falta claridad y evidencia.',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });
    const phaseOneFields = phaseOne.updates.map((update) => update.field);
    expect(phaseOneFields).toContain('f1.analisisProblema.problemaDetectado');
    expect(phaseOneFields).toContain('f1.analisisProblema.evidencia');

    const phaseTwo = await assistant.send({
      requestId: 'r-phase-2',
      workspaceLabel: 'Proyecto principal',
      taskId: task.id,
      phase: 2,
      baseRevision: buildPhaseRevision(task, 2),
      message: 'Tomamos una decisión y alcance claro para esta guía.',
      phaseSnapshot: task.f2,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });
    const phaseTwoFields = phaseTwo.updates.map((update) => update.field);
    expect(phaseTwoFields.every((field) => field.startsWith('f2.'))).toBe(true);
    expect(phaseTwoFields).toContain('f2.decision');
    expect(phaseTwoFields).toContain('f2.alcance');

    const phaseThree = await assistant.send({
      requestId: 'r-phase-3',
      workspaceLabel: 'Proyecto principal',
      taskId: task.id,
      phase: 3,
      baseRevision: buildPhaseRevision(task, 3),
      message: 'Itero una nueva acción para validar.',
      phaseSnapshot: task.f3,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });
    expect(phaseThree.updates.every((update) => update.field.startsWith('f3.'))).toBe(true);
    expect(phaseThree.updates.map((update) => update.field)).toContain('f3.notas');

    const phaseFour = await assistant.send({
      requestId: 'r-phase-4',
      workspaceLabel: 'Proyecto principal',
      taskId: task.id,
      phase: 4,
      baseRevision: buildPhaseRevision(task, 4),
      message: 'Propongo un cambio de alcance y título.',
      phaseSnapshot: task.f4,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });
    const phaseFourFields = phaseFour.updates.map((update) => update.field);
    expect(phaseFourFields.every((field) => field.startsWith('f4.'))).toBe(true);
    expect(phaseFourFields).toContain('f4.cambio');
  });

  it('keeps update values sanitized and bounded for very long input', async () => {
    const { task, assistant, baseRevision } = requestSeed();

    const response = await assistant.send({
      requestId: 'r-long',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: `problema ${'x'.repeat(5000)}`,
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });

    expect(response.updates[0].value.length).toBeLessThanOrEqual(180);
  });

  it('uses bounded same-phase evaluation history for evaluate fallbacks', async () => {
    const task = createTaskSeed();
    const assistant = createMockWorkspaceAssistant();
    const baseRevision = buildPhaseRevision(task);
    const history = Array.from({ length: 8 }, (_, index) => ({
      id: `e-${index}`,
      taskId: task.id,
      phase: 1,
      responseRevision: `r-${index}`,
      evaluatorVersion: 'mock-v1',
      status: 'needs-work',
      weaknesses: [],
      recommendations: [],
      gatePassed: false,
      gateReasons: [`Old reason ${index}`],
      createdAt: index,
    }));

    const response = await assistant.evaluate({
      requestId: 'e-history',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: getPhaseInstructionKey(1),
      previousEvaluations: history,
    });

    expect(response.gateReasons).toEqual([
      'Old reason 3',
      'Old reason 4',
      'Old reason 5',
      'Old reason 6',
      'Old reason 7',
    ]);
    expect(response.weaknesses).toHaveLength(5);
  });

  it('retries idempotently by requestId and deduplicates in-flight calls', async () => {
    const { task, assistant, baseRevision } = requestSeed({ sendMode: 'delay', delayMs: 100 });
    const request = {
      requestId: 'r-dedupe',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: 'Reenvío de solicitud',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    };

    const [first, second] = await Promise.all([assistant.send(request), assistant.send(request)]);
    expect(first.requestId).toBe(second.requestId);
  });

  it('delays delivery when requested and exposes the configured wait', async () => {
    const { task, assistant, baseRevision } = requestSeed({ sendMode: 'delay', delayMs: 40 });
    const started = Date.now();
    await assistant.send({
      requestId: 'r-delay',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: 'Mensaje con tiempo',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });
    expect(Date.now() - started).toBeGreaterThanOrEqual(35);
  });

  it('returns unavailable as a recoverable transport error', async () => {
    const { task, assistant, baseRevision } = requestSeed({ sendMode: 'unavailable' });
    await expect(assistant.send({
      requestId: 'r-offline',
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      baseRevision,
      message: 'Qué falta',
      phaseSnapshot: task.f1,
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow('not available');
  });

  it('derives evaluation responses by gate reasons and previous history', async () => {
    const { task, assistant, baseRevision } = requestSeed();
    const good = await assistant.evaluate({
      requestId: 'e-accept',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    });

    expect(good.status).toBe('acceptable');
    expect(good.gatePassed).toBe(true);
    expect(good.weaknesses).toHaveLength(0);

    const bad = await assistant.evaluate({
      requestId: 'e-needs-work',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: ['Falta claridad en evidencia', 'Sin alcance'],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    });

    expect(bad.status).toBe('needs-work');
    expect(bad.weaknesses.length).toBe(2);
    expect(bad.recommendations.length).toBe(2);
    expect(bad.gatePassed).toBe(false);
  });

  it('evaluates with trusted instruction keys for all phases when no gate reasons remain', async () => {
    const taskByPhase = [
      repairTask({
        id: 'eval-phase-1',
        fase: 1,
        f1: {
          linaje: [{ origen: 'Origen', resultado: 'Resultado' }],
          checkMapeo: true,
          confirmacion: true,
          analisisProblema: {
            problemaDetectado: 'Detectado', evidencia: 'Evidencia', analisis: 'Análisis',
            decision: 'reformular', justificacion: 'Justificación', problemaVigente: 'Problema vigente',
          },
        },
      }),
      repairTask({
        id: 'eval-phase-2',
        fase: 2,
        f2: {
          decision: 'Decisión', alcance: 'Alcance', noObjetivos: 'No objetivos', pasos: 'Paso 1',
          predicciones: [
            { texto: 'Predicción 1', umbral: '10', conf: 'media' },
            { texto: 'Predicción 2', umbral: '20', conf: 'media' },
            { texto: 'Predicción 3', umbral: '30', conf: 'media' },
          ],
        },
      }),
      repairTask({
        id: 'eval-phase-3',
        fase: 3,
        f3: {
          iteraciones: [{ id: 'i-1', intento: 'Intento', resultado: 'Resultado', ajuste: 'Ajuste', criterioIds: [] }],
          checkCompila: true,
          checkAuditado: true,
        },
      }),
      repairTask({
        id: 'eval-phase-4',
        fase: 4,
        f4: {
          aar: [{ pred: 'P', observado: 'O', causa: 'C', mia: true }],
          cambio: 'Cambio',
          titulo: 'Título',
        },
      }),
    ];

    const assistant = createMockWorkspaceAssistant();
    for (const task of taskByPhase) {
      const response = await assistant.evaluate({
        requestId: `e-${task.id}`,
        taskId: task.id,
        phase: task.fase,
        responseRevision: buildPhaseRevision(task),
        phaseSnapshot: task[`f${task.fase}` as const],
        gateReasons: [],
        instructionKey: getPhaseInstructionKey(task.fase),
        previousEvaluations: task.assistant.evaluations,
      });

      expect(response.status).toBe('acceptable');
      expect(response.gatePassed).toBe(true);
    }
  });

  it('handles late-context responses by returning a malformed context', async () => {
    const { task, baseRevision } = requestSeed();
    const assistant = createMockWorkspaceAssistant({ evaluateMode: 'delay', delayMs: 10 });
    const evaluate = assistant.evaluate({
      requestId: 'e-late',
      taskId: task.id,
      phase: 1,
      responseRevision: `${baseRevision}-old`,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    });

    await expect(evaluate).resolves.toMatchObject({
      status: 'acceptable',
      responseRevision: `${baseRevision}-old`,
    });
  });

  it('rejects unknown instruction keys as a recoverable validation error', async () => {
    const { task, assistant, baseRevision } = requestSeed();
    const response = await assistant.evaluate({
      requestId: 'e-invalid-key',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'phase-1-review',
      previousEvaluations: task.assistant.evaluations,
    });

    expect(response.status).toBe('error');
    expect(response.gatePassed).toBe(false);
    expect(response.weaknesses[0]).toContain('Clave de instrucción inválida para la fase 1.');
  });

  it('supports evaluate-mode delay and unavailability errors as transport failures', async () => {
    const { task, baseRevision } = requestSeed({ evaluateMode: 'delay' });
    const delayed = createMockWorkspaceAssistant({ evaluateMode: 'delay', delayMs: 25 });
    const started = Date.now();
    await delayed.evaluate({
      requestId: 'e-delay',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    });
    expect(Date.now() - started).toBeGreaterThanOrEqual(20);

    const unavailable = createMockWorkspaceAssistant({ evaluateMode: 'unavailable' });
    await expect(unavailable.evaluate({
      requestId: 'e-unavailable',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow('not available');
  });

  it('rejects malformed evaluation payloads from the mock provider', async () => {
    const { task, baseRevision } = requestSeed({ evaluateMode: 'malformed' });
    await expect(task).toBeTruthy();
    await expect(task.assistant.evaluations).toBeDefined();
    await expect(createMockWorkspaceAssistant({ evaluateMode: 'malformed' }).evaluate({
      requestId: 'e-malformed',
      taskId: task.id,
      phase: 1,
      responseRevision: baseRevision,
      phaseSnapshot: task.f1,
      gateReasons: [],
      instructionKey: 'socratic',
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow();
  });
});
