import { describe, expect, it } from 'vitest';

import {
  assistanceSettingsSchema,
  assistantMessageSchema,
  assistantStateSchema,
  formUpdateSchema,
  phaseEvaluationSchema,
  repairAssistantState,
  repairAssistantStateForTask,
} from './task-assistant.schema';

describe('task assistant schema', () => {
  it('validates assistant messages with safe part payload and user/assistant role constraints', () => {
    const parsedMessage = assistantMessageSchema.parse({
      id: 'm-user-1',
      taskId: 'task-1',
      phase: 1,
      role: 'user',
      parts: [{ type: 'text', text: 'Necesito ayuda con el criterio.' }],
      status: 'sending',
      createdAt: 1_720_000_000_000,
      updates: [],
    });

    expect(parsedMessage).toMatchObject({
      id: 'm-user-1',
      taskId: 'task-1',
      phase: 1,
      role: 'user',
      status: 'sending',
    });
    expect(parsedMessage.parts).toHaveLength(1);
  });

  it('rejects assistant messages in sending/error state for non-user roles', () => {
    expect(() => assistantMessageSchema.parse({
      id: 'm-assistant-bad',
      taskId: 'task-1',
      phase: 1,
      role: 'assistant',
      parts: [{ type: 'text', text: 'Respuesta del asistente' }],
      status: 'sending',
      createdAt: 1_720_000_000_001,
      updates: [],
    })).toThrow();
  });

  it('validates typed field updates for each phase', () => {
    const base = {
      sourceMessageId: 'm-user-1',
      baseRevision: 'rev-1',
      status: 'proposed' as const,
    };

    const update01 = formUpdateSchema.parse({
      ...base,
      field: 'f1.checkMapeo',
      value: true,
    });
    expect(update01.field).toBe('f1.checkMapeo');

    const update02 = formUpdateSchema.parse({
      ...base,
      field: 'f2.decision',
      value: 'Decisión propuesta',
    });
    expect(update02.field).toBe('f2.decision');

    const update03 = formUpdateSchema.parse({
      ...base,
      field: 'f3.checkCompila',
      value: false,
    });
    expect(update03.field).toBe('f3.checkCompila');

    const update04 = formUpdateSchema.parse({
      ...base,
      field: 'f4.titulo',
      value: 'Afirmación de cambio',
    });
    expect(update04.field).toBe('f4.titulo');
  });

  it('rejects incompatible values for typed phase-update paths', () => {
    const base = {
      sourceMessageId: 'm-user-1',
      baseRevision: 'rev-1',
      status: 'proposed' as const,
    };

    expect(() => formUpdateSchema.parse({
      ...base,
      field: 'f1.checkMapeo',
      value: 'debería ser boolean',
    })).toThrow();

    expect(() => formUpdateSchema.parse({
      ...base,
      field: 'f2.decision',
      value: { texto: 'no es texto' },
    })).toThrow();

    expect(() => formUpdateSchema.parse({
      ...base,
      field: 'f3.checkCompila',
      value: 'sí/no',
    })).toThrow();
  });

  it('validates evaluation state transitions and required recommendation details', () => {
    const validNeedsWork = phaseEvaluationSchema.parse({
      id: 'eval-1',
      taskId: 'task-1',
      phase: 1,
      responseRevision: 'rev-1',
      evaluatorVersion: 'mock-v1',
      status: 'needs-work',
      weaknesses: ['Debe mejorar la formulación del problema'],
      recommendations: ['Completa evidencia del problema'],
      gatePassed: false,
      gateReasons: ['Falta decisión o reformulación'],
      createdAt: 1_720_000_000_000,
    });
    expect(validNeedsWork.status).toBe('needs-work');

    expect(() => phaseEvaluationSchema.parse({
      id: 'eval-2',
      taskId: 'task-1',
      phase: 1,
      responseRevision: 'rev-1',
      evaluatorVersion: 'mock-v1',
      status: 'acceptable',
      weaknesses: ['no requerido'],
      recommendations: ['no requerido'],
      gatePassed: true,
      gateReasons: ['debe estar vacío'],
      createdAt: 1_720_000_000_001,
    })).toThrow();

    expect(() => phaseEvaluationSchema.parse({
      id: 'eval-3',
      taskId: 'task-1',
      phase: 1,
      responseRevision: 'rev-1',
      evaluatorVersion: 'mock-v1',
      status: 'needs-work',
      weaknesses: [],
      recommendations: ['Falta evaluación'],
      gatePassed: false,
      gateReasons: ['sin debilidades'],
      createdAt: 1_720_000_000_002,
    })).toThrow();
  });

  it('defaults and validates assistant settings without secret fields', () => {
    const settings = assistanceSettingsSchema.parse({});
    expect(settings).toMatchObject({
      schemaVersion: 1,
      mode: 'codex',
      connectionStatus: 'deferred',
    });
    expect(settings).not.toHaveProperty('token');

    expect(() => assistanceSettingsSchema.parse({
      mode: 'deepseek',
      connectionStatus: 'deferred',
      schemaVersion: 1,
      apiKey: 'secret',
    })).toThrow();
  });

  it('provides repairable assistant defaults for missing state', () => {
    const repaired = repairAssistantState(undefined);
    expect(repaired).toMatchObject({
      schemaVersion: 1,
      messages: [],
      evaluations: [],
      settings: {
        mode: 'codex',
        connectionStatus: 'deferred',
        schemaVersion: 1,
      },
    });
  });

  it('repairs malformed assistant state with task-phase filtering', () => {
    const repaired = repairAssistantStateForTask(
      {
        schemaVersion: 1,
        messages: [
          {
            id: 'm-1',
            taskId: 'task-1',
            phase: 1,
            role: 'assistant',
            parts: [{ type: 'text', text: 'Bien' }],
            status: 'sent',
            createdAt: 1,
            updates: [],
          },
          {
            id: 'm-2',
            taskId: 'task-2',
            phase: 1,
            role: 'assistant',
            parts: [{ type: 'text', text: 'No debe entrar' }],
            status: 'sent',
            createdAt: 2,
            updates: [],
          },
        ],
        evaluations: [
          {
            id: 'e-1',
            taskId: 'task-1',
            phase: 1,
            responseRevision: 'rev-1',
            evaluatorVersion: 'mock-v1',
            status: 'acceptable',
            weaknesses: [],
            recommendations: [],
            gatePassed: true,
            gateReasons: [],
            createdAt: 10,
          },
          {
            id: 'e-2',
            taskId: 'task-1',
            phase: 2,
            responseRevision: 'rev-2',
            evaluatorVersion: 'mock-v1',
            status: 'needs-work',
            weaknesses: ['x'],
            recommendations: ['y'],
            gatePassed: false,
            gateReasons: ['falla'],
            createdAt: 11,
          },
        ],
        settings: {
          mode: 'deepseek',
          connectionStatus: 'deferred',
          schemaVersion: 1,
        },
      },
      { taskId: 'task-1', phase: 1 },
    );

    expect(repaired.messages).toHaveLength(1);
    expect(repaired.messages[0]).toMatchObject({ id: 'm-1', taskId: 'task-1', phase: 1 });
    expect(repaired.evaluations).toHaveLength(1);
    expect(repaired.evaluations[0]).toMatchObject({ id: 'e-1', taskId: 'task-1', phase: 1 });
  });

  it('repairs invalid assistant schema and keeps only allowed keys', () => {
    const repaired = repairAssistantState({
      schemaVersion: 2,
      messages: [{ id: '', taskId: 'task-1', phase: 1, role: 'user', parts: [], status: 'sending', createdAt: -1, updates: [] }],
      evaluations: [{ id: 'broken', taskId: '', phase: 9, responseRevision: 10 as unknown as string, evaluatorVersion: 'x', status: 'ok' as const, weaknesses: [], recommendations: [], gatePassed: 'yes' as unknown as boolean, gateReasons: ['x'], createdAt: -10 }],
      settings: { mode: 'azure', connectionStatus: 'online', schemaVersion: 2 },
    });

    expect(repaired.schemaVersion).toBe(1);
    expect(repaired.messages).toHaveLength(0);
    expect(repaired.evaluations).toHaveLength(0);
    expect(repaired.settings.mode).toBe('codex');
    expect(repaired.settings.connectionStatus).toBe('deferred');
  });

  it('keeps assistant state serializable for task-level storage', () => {
    const state = assistantStateSchema.parse({
      schemaVersion: 1,
      messages: [
        {
          id: 'm-1',
          taskId: 'task-1',
          phase: 1,
          role: 'assistant',
          parts: [{ type: 'text', text: 'Texto' }],
          status: 'sent',
          createdAt: 1,
          updates: [],
        },
      ],
      evaluations: [
        {
          id: 'eval-1',
          taskId: 'task-1',
          phase: 1,
          responseRevision: 'rev-1',
          evaluatorVersion: 'mock-v1',
          status: 'acceptable',
          weaknesses: [],
          recommendations: [],
          gatePassed: true,
          gateReasons: [],
          createdAt: 2,
        },
      ],
      settings: {
        mode: 'deepseek',
        connectionStatus: 'deferred',
        schemaVersion: 1,
      },
    });

    expect(() => JSON.stringify(state)).not.toThrow();
  });
});
