import { describe, expect, it } from 'vitest';
import { createTaskStore } from '../../app/features/tasks/services/task-store';

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
});
