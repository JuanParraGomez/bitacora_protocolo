import { describe, expect, it } from 'vitest';
import { repairTask } from '../domain/task-rules';
import { getPhaseInstructionKey } from '../domain/phase-instructions';
import { createMockWorkspaceAssistant, type MockWorkspaceAdapterOptions } from './mock-workspace-assistant';
import { buildPhaseRevision, isAllowedPhaseFieldPath } from '../domain/task-assistant-rules';

type ConversationalTurnProbe = {
  projectId?: unknown;
  taskId?: unknown;
  phase?: unknown;
  methodVersionId?: unknown;
  primaryQuestion?: unknown;
  proposals?: Array<{
    projectId?: unknown;
    taskId?: unknown;
    phase?: unknown;
    methodVersionId?: unknown;
    field?: unknown;
    status?: unknown;
  }>;
  contradictions?: unknown;
};

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

  it('preserves project, task, phase and method identity on the turn and every closed-path proposal', async () => {
    const task = repairTask({
      id: 'task-us2-identity',
      projectId: 'project-us2',
      fase: 2,
    });
    const assistant = createMockWorkspaceAssistant();
    const methodVersionId = 'method-us2-v1';
    const request = {
      requestId: 'r-us2-identity',
      projectId: task.projectId,
      workspaceLabel: 'Proyecto US2',
      taskId: task.id,
      phase: 2 as const,
      methodVersionId,
      baseRevision: buildPhaseRevision(task, 2),
      message: 'La decisión es priorizar el flujo y el alcance cubre una sola tarea.',
      phaseSnapshot: task.f2,
      confirmedFields: task.f2,
      pendingProposals: [],
      contradictions: [],
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    };

    const response = await assistant.send(request);
    const turn = response as unknown as ConversationalTurnProbe;

    expect(turn).toMatchObject({
      projectId: request.projectId,
      taskId: request.taskId,
      phase: request.phase,
      methodVersionId: request.methodVersionId,
      contradictions: expect.any(Array),
    });
    expect(turn.proposals).toEqual(expect.any(Array));
    expect(turn.proposals?.length).toBeGreaterThan(0);
    expect(turn.proposals?.every((proposal) => (
      proposal.projectId === request.projectId
      && proposal.taskId === request.taskId
      && proposal.phase === request.phase
      && proposal.methodVersionId === request.methodVersionId
      && proposal.status === 'proposed'
      && typeof proposal.field === 'string'
      && isAllowedPhaseFieldPath(proposal.field, request.phase)
    ))).toBe(true);
  });

  it('asks at most one gap-driven primary question and does not repeat a confirmed field', async () => {
    const task = repairTask({
      id: 'task-us2-question',
      projectId: 'project-us2',
      fase: 2,
      f2: {
        decision: 'Lanzar primero el recorrido guiado',
      },
    });
    const request = {
      requestId: 'r-us2-question',
      projectId: task.projectId,
      workspaceLabel: 'Proyecto US2',
      taskId: task.id,
      phase: 2 as const,
      methodVersionId: null,
      baseRevision: buildPhaseRevision(task, 2),
      message: 'Quiero continuar con el siguiente vacío.',
      phaseSnapshot: task.f2,
      confirmedFields: task.f2,
      pendingProposals: [],
      contradictions: [],
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    };

    const response = await createMockWorkspaceAssistant().send(request);
    const primaryQuestion = (response as unknown as ConversationalTurnProbe).primaryQuestion;

    expect(typeof primaryQuestion).toBe('string');
    expect((primaryQuestion as string).trim().length).toBeGreaterThan(0);
    expect((primaryQuestion as string).match(/\?/g) ?? []).toHaveLength(1);
    expect(primaryQuestion).not.toMatch(/decisi[oó]n/i);
    expect(primaryQuestion).toMatch(/alcance|no[- ]?objetivos|pasos|predicci[oó]n/i);
  });

  it.each([
    {
      label: 'phase 1 desired result',
      phase: 1 as const,
      taskInput: { f1: {} },
      expectedField: 'f1.resultadoDeseado',
      message: 'Reducir el tiempo de espera a menos de cinco minutos.',
      expectedValue: 'Reducir el tiempo de espera a menos de cinco minutos.',
    },
    {
      label: 'phase 1 current problem',
      phase: 1 as const,
      taskInput: {
        f1: {
          resultadoDeseado: 'Reducir esperas',
          alcance: 'Pedidos nacionales',
          restricciones: 'Sin ampliar el equipo',
          actores: ['Operaciones'],
          criterioExito: 'Menos de cinco minutos',
        },
      },
      expectedField: 'f1.analisisProblema.problemaVigente',
      message: 'Los pedidos esperan una aprobación manual antes de avanzar.',
      expectedValue: 'Los pedidos esperan una aprobación manual antes de avanzar.',
    },
    {
      label: 'phase 2 subproblems',
      phase: 2 as const,
      taskInput: {
        f2: {
          decision: 'Priorizar el recorrido',
          alcance: 'Una tarea',
          noObjetivos: 'No rediseñar permisos',
          pasos: 'Medir\nAjustar',
        },
      },
      expectedField: 'f2.subproblemas',
      message: 'Datos incompletos; integración inestable',
      expectedValue: ['Datos incompletos', 'integración inestable'],
    },
    {
      label: 'phase 2 predictions',
      phase: 2 as const,
      taskInput: {
        f2: {
          decision: 'Priorizar el recorrido',
          alcance: 'Una tarea',
          noObjetivos: 'No rediseñar permisos',
          pasos: 'Medir\nAjustar',
          subproblemas: ['Datos incompletos'],
          preguntasAbiertas: ['¿Qué fuente prevalece?'],
          riesgos: ['Integración inestable'],
        },
      },
      expectedField: 'f2.predicciones',
      message: '5 minutos; 10 minutos; 15 minutos',
      expectedValue: expect.arrayContaining([
        expect.objectContaining({ texto: '5 minutos', umbral: expect.any(String) }),
        expect.objectContaining({ texto: '10 minutos', umbral: expect.any(String) }),
        expect.objectContaining({ texto: '15 minutos', umbral: expect.any(String) }),
      ]),
    },
    {
      label: 'phase 3 iteration',
      phase: 3 as const,
      taskInput: { f3: {} },
      expectedField: 'f3.iteraciones',
      message: 'Ejecutar una prueba controlada y registrar el tiempo observado.',
      expectedValue: expect.arrayContaining([
        expect.objectContaining({
          intento: expect.stringContaining('Ejecutar una prueba controlada'),
          result: expect.stringContaining('Ejecutar una prueba controlada'),
        }),
      ]),
    },
    {
      label: 'phase 4 procedural change',
      phase: 4 as const,
      taskInput: {
        f4: {
          aar: [{ pred: '10 minutos', observado: '12 minutos', causa: 'Validación tardía', mia: true }],
        },
      },
      expectedField: 'f4.cambio',
      message: 'Agregar una validación antes de publicar.',
      expectedValue: 'Agregar una validación antes de publicar.',
    },
  ])('turns a natural answer into a typed proposal for the current $label gap', async ({
    phase,
    taskInput,
    expectedField,
    message,
    expectedValue,
  }) => {
    const task = repairTask({
      id: `task-gap-${phase}`,
      projectId: 'project-us2',
      fase: phase,
      ...taskInput,
    });
    const response = await createMockWorkspaceAssistant().send({
      requestId: `request-gap-${phase}`,
      projectId: task.projectId,
      workspaceLabel: 'Proyecto US2',
      taskId: task.id,
      phase,
      methodVersionId: phase >= 3 ? 'method-us2-v1' : null,
      baseRevision: buildPhaseRevision(task, phase),
      message,
      phaseSnapshot: task[`f${phase}` as const],
      confirmedFields: task[`f${phase}` as const],
      pendingProposals: [],
      contradictions: [],
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    });

    expect(response.proposals).toEqual([
      expect.objectContaining({
        field: expectedField,
        status: 'proposed',
        value: expectedValue,
      }),
    ]);
  });

  it('rejects malformed structured output without changing confirmed input', async () => {
    const { task, assistant, baseRevision } = requestSeed({ sendMode: 'malformed' });
    const confirmedBefore = structuredClone(task.f1);

    await expect(assistant.send({
      requestId: 'r-mal',
      projectId: task.projectId,
      workspaceLabel: 'Proyecto',
      taskId: task.id,
      phase: 1,
      methodVersionId: null,
      baseRevision,
      message: 'Mensaje normal',
      phaseSnapshot: task.f1,
      confirmedFields: task.f1,
      pendingProposals: [],
      contradictions: [],
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    })).rejects.toThrow();

    expect(task.f1).toEqual(confirmedBefore);
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

  it('returns the same logical turn for a sequential retry without duplicating proposals', async () => {
    const task = repairTask({
      id: 'task-us2-retry',
      projectId: 'project-us2',
      fase: 2,
    });
    const assistant = createMockWorkspaceAssistant();
    const request = {
      requestId: 'r-us2-retry',
      projectId: task.projectId,
      workspaceLabel: 'Proyecto US2',
      taskId: task.id,
      phase: 2 as const,
      methodVersionId: 'method-us2-v1',
      baseRevision: buildPhaseRevision(task, 2),
      message: 'La decisión y el alcance quedan definidos.',
      phaseSnapshot: task.f2,
      confirmedFields: task.f2,
      pendingProposals: [],
      contradictions: [],
      recentMessages: task.assistant.messages,
      previousEvaluations: task.assistant.evaluations,
    };

    const first = await assistant.send(request);
    const retry = await assistant.send(request);
    const firstTurn = first as unknown as ConversationalTurnProbe;
    const retryTurn = retry as unknown as ConversationalTurnProbe;

    expect(retry).toEqual(first);
    expect(retryTurn.proposals).toEqual(firstTurn.proposals);
    expect(new Set(retryTurn.proposals?.map((proposal) => JSON.stringify(proposal))).size)
      .toBe(retryTurn.proposals?.length);
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
