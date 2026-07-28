import { describe, expect, it } from 'vitest';
import { createBlankTask } from '../domain/task-rules';
import type { Task } from '../domain/task.schema';
import { completeTask } from './task-completion';

describe('task completion service', () => {
  it('writes a permanent Markdown record and preserves existing records', async () => {
    const values = new Map<string, string>([['bitacora:index', '{"tareas":[],"registros":[{"id":"old","titulo":"Old"}]}']]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); }, delete: async (key: string) => { values.delete(key); } };
    const task = createBlankTask('Nueva', 'Directiva');
    const result = await completeTask(storage, task);
    expect(values.get(`bitacora:r:${task.id}`)).toContain('# ');
    expect(result.registros).toHaveLength(2);
    expect(result.registros[1]?.id).toBe('old');
  });

  it('removes the completed task from active tasks while preserving its record index', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'done', nombre: 'Done' }], registros: [] })]]);
    const storage = { get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); }, delete: async (key: string) => { values.delete(key); } };
    const task = { ...createBlankTask('Done', 'Directiva'), id: 'done' };
    const index = await completeTask(storage, task);
    expect(index.tareas.some(item => item.id === task.id)).toBe(false);
    expect(index.registros[0]?.id).toBe(task.id);
  });

  it('writes completed task records with legacy project when project id is missing', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'done-no-project', nombre: 'Sin proyecto', projectId: 'legacy' }], registros: [] })]]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };
    const task = { ...createBlankTask('Done', 'Directiva'), id: 'done-no-project' };
    const index = await completeTask(storage, task);

    const record = values.get(`bitacora:r:done-no-project`) ?? '';
    const parsedIndex = JSON.parse(values.get('bitacora:index') ?? '{}') as { tareas: unknown[]; registros: { id: string; projectId?: string }[] };
    expect(parsedIndex.registros[0]?.projectId).toBe('legacy');
    expect(index.registros.some((entry) => entry.id === 'done-no-project')).toBe(true);
    expect(index.registros[0]?.projectId).toBe('legacy');
    expect(record).toContain('#');
  });

  it('persists full method version history even when completing', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'version-task', nombre: 'Tarea con historial', projectId: 'legacy' }], registros: [] })]]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };

    const task: Task = {
      ...createBlankTask('Tarea con historial', 'Directiva'),
      id: 'version-task',
      estado: 'activa',
      methodVersions: [
        {
          id: 'method-v1',
          version: 1,
          parentVersionId: null,
          status: 'published',
          changeKind: 'initial',
          preconditions: ['Contexto inicial'],
          steps: [{
            id: 'step-v1-1',
            title: 'Paso uno',
            objective: 'Validar el contexto',
            dependencies: [],
            inputs: ['Contexto'],
            output: 'Condición inicial',
            tool: 'Sin definir',
            risk: 'Riesgo bajo',
            successCriterion: 'Contexto validado',
            sourceCriterionId: null,
          }],
          tools: ['Sin definir'],
          inputs: ['Contexto'],
          outputs: ['Condición inicial'],
          controls: ['Revisión humana'],
          exceptions: ['Ninguna'],
          exceptionsReviewed: false,
          successCriteria: ['Contexto correcto'],
          supportingIterationIds: ['it-v1'],
          createdAt: 1_000,
        },
        {
          id: 'method-v2',
          version: 2,
          parentVersionId: 'method-v1',
          status: 'draft',
          changeKind: 'material',
          preconditions: ['Contexto inicial'],
          steps: [{
            id: 'step-v2-1',
            title: 'Paso dos',
            objective: 'Validar resultados',
            dependencies: ['step-v1-1'],
            inputs: ['Resultado'],
            output: 'Reporte',
            tool: 'Sin definir',
            risk: 'Riesgo medio',
            successCriterion: 'Resultado registrado',
            sourceCriterionId: null,
          }],
          tools: ['Sin definir'],
          inputs: ['Resultado'],
          outputs: ['Reporte'],
          controls: ['Doble revisión'],
          exceptions: ['Ajuste menor'],
          exceptionsReviewed: true,
          successCriteria: ['Resultado revisable'],
          supportingIterationIds: ['it-v2'],
          createdAt: 2_000,
        },
      ],
      f4: {
        ...createBlankTask('Tarea con historial', 'Directiva').f4,
        methodVersionId: 'method-v2',
      },
    };

    await completeTask(storage, task);

    const persisted = JSON.parse(values.get('bitacora:t:version-task') ?? '{}');
    expect(persisted.estado).toBe('completada');
    expect(persisted.methodVersions).toHaveLength(2);
    expect(persisted.methodVersions[0]).toMatchObject({ id: 'method-v1', version: 1, status: 'published' });
    expect(persisted.methodVersions[1]).toMatchObject({ id: 'method-v2', version: 2, changeKind: 'material' });
  });

  it('completes a task with low or unknown maturity without filtering method history', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'low-maturity', nombre: 'Mínima madurez' }], registros: [] })]]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };

    const task: Task = {
      ...createBlankTask('Mínima madurez', 'Directiva'),
      id: 'low-maturity',
      estado: 'activa',
      f3: {
        ...createBlankTask('Mínima madurez', 'Directiva').f3,
      },
      methodVersions: [],
    };

    const index = await completeTask(storage, task);
    const persisted = values.get('bitacora:t:low-maturity') ?? '';
    const persistedTask = JSON.parse(persisted);
    expect(index.registros[0]?.id).toBe(task.id);
    expect(persistedTask.estado).toBe('completada');
    expect(persistedTask.methodVersions).toEqual([]);
  });
});
