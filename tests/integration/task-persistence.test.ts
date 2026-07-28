import { describe, expect, it } from 'vitest';
import { createTaskStore } from '../../app/features/tasks/services/task-store';
import { createBlankTask } from '../../app/features/tasks/domain/task-rules';
import { buildPhaseRevision } from '../../app/features/tasks/domain/task-assistant-rules';
import { completeTask } from '../../app/features/tasks/services/task-completion';
import { deleteTask } from '../../app/features/tasks/services/task-deletion';

describe('guided task persistence', () => {
  it('round-trips legacy tasks and injects repaired assistant state with prompt preservation', async () => {
    const values = new Map<string, string>();
    const store = createTaskStore({
      async get(key) { return values.get(key) ?? null; },
      async set(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    });
    const task = {
      id: 'persisted',
      fase: 4,
      nombre: 'Tarea persistente',
      directiva: 'Conservar prompts y estado nuevo',
      f1: {
        analisisProblema: { decision: 'mantener', problemaVigente: 'Problema' },
        promptOrientacion: 'Prompt orientación guardado',
        promptOrientacionPersonalizado: true,
      },
      f2: {
        criterios: [{ id: 'c1', texto: 'Criterio' }],
        promptGuia: 'Prompt guía',
        promptGuiaPersonalizado: false,
      },
      f3: {
        iteraciones: [{ id: 'i1', intento: 'Intento', resultado: 'Resultado', ajuste: 'Ajuste', criterioIds: ['c1'] }],
        promptEjecucion: 'Prompt guardado',
        promptEjecucionPersonalizado: true,
      },
      f4: {
        promptAar: 'Prompt revisión',
        promptAarPersonalizado: false,
      },
      estado: 'activa',
      tipo: 'protocolo',
      created: 1_720_000_000_000,
    };

    await store.writeTask(task.id, task);
    const raw = await store.readTask(task.id);
    expect(raw).toMatchObject({
      id: 'persisted',
      f1: { promptOrientacion: 'Prompt orientación guardado', promptOrientacionPersonalizado: true },
      f2: { promptGuia: 'Prompt guía', promptGuiaPersonalizado: false },
      f3: { promptEjecucion: 'Prompt guardado', promptEjecucionPersonalizado: true },
      f4: { promptAar: 'Prompt revisión', promptAarPersonalizado: false },
    });
    expect(raw).toMatchObject({
      assistant: {
        schemaVersion: 1,
        messages: [],
        evaluations: [],
        settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
      },
    });
  });

  it('repairs malformed assistant payload without discarding legacy prompts', async () => {
    const values = new Map<string, string>();
    const store = createTaskStore({
      async get(key) { return values.get(key) ?? null; },
      async set(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    });
    const task = {
      id: 'legacy-malformed',
      fase: 1,
      nombre: 'Legacy',
      directiva: 'Sin asistente',
      f1: {
        linaje: [{ origen: 'brief', resultado: 'legacy' }],
        promptOrientacion: 'No se debe tocar',
      },
      estado: 'activa',
      tipo: 'protocolo',
      created: 1_720_000_000_000,
      assistant: {
        schemaVersion: 'bad',
        messages: [{ id: '', taskId: 'task-other', phase: 9, role: 'assistant', parts: [], status: 'broken', createdAt: -10, updates: [] }],
        evaluations: [{ id: '', taskId: '', phase: 9, responseRevision: 'bad', evaluatorVersion: 'x', status: 'ok', weaknesses: [], recommendations: [], gatePassed: 'yes', gateReasons: [], createdAt: -10 }],
        settings: { mode: 'azure', connectionStatus: 'online', schemaVersion: 99 },
      },
    };
    await store.writeTask(task.id, task);
    const raw = await store.readTask(task.id) as Record<string, unknown>;

    expect(raw.assistant).toMatchObject({
      schemaVersion: 1,
      messages: [],
      evaluations: [],
      settings: { mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 },
    });
    expect((raw as Record<string, unknown>).f1).toMatchObject({
      promptOrientacion: 'No se debe tocar',
    });
  });

  it('drops assistant secret keys on read/write round-trip', async () => {
    const values = new Map<string, string>();
    const store = createTaskStore({
      async get(key) { return values.get(key) ?? null; },
      async set(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    });
    const task = {
      id: 'secret-mode',
      nombre: 'Con secretos',
      directiva: 'Validar limpieza',
      fase: 2,
      estado: 'activa',
      tipo: 'protocolo',
      created: 1_720_000_000_000,
      assistant: {
        schemaVersion: 1,
        messages: [],
        evaluations: [],
        settings: {
          mode: 'deepseek',
          connectionStatus: 'deferred',
          schemaVersion: 1,
          apiKey: 'local-sandbox-key',
        },
      },
    };
    await store.writeTask(task.id, task);
    const roundTripped = await store.readTask(task.id) as Record<string, any>;
    expect(roundTripped.assistant?.settings?.apiKey).toBeUndefined();
    expect(roundTripped.assistant?.settings?.mode).toBe('deepseek');
  });

  it('round-trips the compatible index and maps malformed JSON', async () => {
    const values = new Map<string, string>();
    const store = createTaskStore({
      async get(key) { return values.get(key) ?? null; },
      async set(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    });
    const index = { tareas: [{ id: 't1', nombre: 'Tarea', fase: 2, estado: 'activa', tipo: 'protocolo' }], registros: [] };
    await store.writeIndex(index);
    await expect(store.readIndex()).resolves.toEqual(index);
    values.set('bitacora:index', '{not-json');
    await expect(store.readIndex()).rejects.toMatchObject({ code: 'INVALID_LEGACY_VALUE' });
  });

  it('maps storage failure to a recoverable compatibility error', async () => {
    const store = createTaskStore({
      async get() { throw new Error('offline'); },
      async set() { throw new Error('offline'); },
      async delete() { throw new Error('offline'); },
    });
    await expect(store.writeIndex({ tareas: [], registros: [] })).rejects.toMatchObject({ code: 'DATABASE_UNAVAILABLE' });
    await expect(store.readTask('failure')).rejects.toMatchObject({ code: 'DATABASE_UNAVAILABLE' });
  });

  it('enforces projectId defaults for persisted tasks and atomic rollbacks for failed completion', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'legacy-id', nombre: 'Sin proyecto', fase: 1, estado: 'activa', tipo: 'protocolo' }], registros: [] })]]);
    const task = createBlankTask('Persistir proyecto', 'Conserva legacy');
    const store = createTaskStore({
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete(key: string) { values.delete(key); },
    });

    await store.writeTask(task.id, { ...task });
    await expect(store.readTask(task.id)).resolves.toMatchObject({ projectId: 'legacy' });

    const failingStorage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set() { throw new Error('batch failed'); },
      async delete() { throw new Error('batch failed'); },
      async batch() { throw new Error('batch failed'); },
    };

    await expect(completeTask(failingStorage as never, task)).rejects.toThrow();
    expect(values.get(`bitacora:index`)).not.toContain(task.id);
  });

  it('deletes task and keeps record even with fallback index parser errors', async () => {
    const values = new Map<string, string>([
      ['bitacora:index', '{bad'],
      ['bitacora:t:legacy', '{}'],
      ['bitacora:r:legacy', '# record'],
    ]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete(key: string) { values.delete(key); },
    };
    await deleteTask(storage, 'legacy', { confirm: true });
    expect(values.has('bitacora:t:legacy')).toBe(false);
    expect(values.get('bitacora:r:legacy')).toBe('# record');
  });

  it('reopens every proposal state with its origin context without mutating confirmed fields', async () => {
    const values = new Map<string, string>();
    const store = createTaskStore({
      async get(key) { return values.get(key) ?? null; },
      async set(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    });
    const task = createBlankTask('Persistir propuestas', 'La edición humana prevalece');
    task.projectId = 'project-persistence';
    task.fase = 1;
    task.f1.analisisProblema.problemaDetectado = 'Dato confirmado por la persona';
    const baseRevision = buildPhaseRevision(task, 1);
    const statuses = ['proposed', 'applied', 'rejected', 'conflict'] as const;
    const updates = statuses.map((status) => ({
      id: `proposal-${status}`,
      sourceMessageId: 'message-proposals',
      projectId: task.projectId,
      taskId: task.id,
      phase: 1,
      methodVersionId: null,
      baseRevision,
      status,
      field: 'f1.analisisProblema.problemaDetectado',
      previousValue: 'Dato confirmado por la persona',
      value: `Valor ${status}`,
    }));
    task.assistant.messages = [{
      id: 'assistant-proposals',
      taskId: task.id,
      phase: 1,
      role: 'assistant',
      parts: [{ type: 'text', text: 'Revisa las propuestas.' }],
      status: 'sent',
      createdAt: 100,
      primaryQuestion: '¿Quieres actualizar el problema?',
      contradictions: [{
        id: 'contradiction-problem',
        projectId: task.projectId,
        taskId: task.id,
        phase: 1,
        methodVersionId: null,
        field: 'f1.analisisProblema.problemaDetectado',
        confirmedValue: 'Dato confirmado por la persona',
        proposedValue: 'Valor conflict',
        message: 'La propuesta contradice una edición confirmada.',
      }],
      updates,
    } as never];

    await store.writeTask(task.id, task);
    const reopened = await store.readTask(task.id);

    expect(reopened?.f1.analisisProblema.problemaDetectado).toBe('Dato confirmado por la persona');
    expect(reopened?.assistant.messages).toHaveLength(1);
    expect(reopened?.assistant.messages[0]).toMatchObject({
      primaryQuestion: '¿Quieres actualizar el problema?',
      contradictions: [{ id: 'contradiction-problem', projectId: task.projectId, taskId: task.id, phase: 1 }],
      updates,
    });
  });
});
