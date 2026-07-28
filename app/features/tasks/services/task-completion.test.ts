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

  it('generates reusable method, tool and learning records for the completed task', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'reuse-task', nombre: 'Metodo reusable', projectId: 'project-a' }], registros: [] })]]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };

    const task: Task = {
      ...createBlankTask('Metodo reusable', 'Directiva'),
      id: 'reuse-task',
      projectId: 'project-a',
      estado: 'activa',
      methodVersions: [{
        id: 'method-v2',
        version: 2,
        parentVersionId: 'method-v1',
        status: 'published',
        changeKind: 'material',
        preconditions: ['Datos listos'],
        steps: [{
          id: 'step-1',
          title: 'Preparar datos',
          objective: 'Ordenar insumos',
          dependencies: [],
          inputs: ['Brief'],
          output: 'Datos listos',
          tool: 'CLI local',
          risk: 'Riesgo bajo',
          successCriterion: 'Datos consistentes',
          sourceCriterionId: null,
        }],
        tools: ['CLI local', 'Editor'],
        inputs: ['Brief'],
        outputs: ['Datos listos'],
        controls: ['Revision humana'],
        exceptions: ['Campos incompletos'],
        exceptionsReviewed: true,
        successCriteria: ['Datos consistentes'],
        supportingIterationIds: ['iteration-1', 'iteration-2'],
        createdAt: 1_000,
      }],
      f3: {
        ...createBlankTask('Metodo reusable', 'Directiva').f3,
        iteraciones: [{
          id: 'iteration-1',
          intento: 'Intento 1',
          resultado: 'Parcial',
          ajuste: 'Ajustar parser',
          criterioIds: [],
          methodVersionId: 'method-v2',
          objective: 'Normalizar',
          action: 'Ejecutar script',
          tool: 'CLI local',
          input: 'Brief',
          result: 'Datos listos',
          evidence: [{ id: 'e-1', kind: 'note', label: 'Captura', value: 'ok' }],
          learning: 'Conviene validar columnas antes del parseo',
          nextAdjustment: 'Repetir con otro brief',
          applicableConditions: ['Brief estable'],
          success: true,
          successCriteriaResults: [],
          createdAt: 1_100,
        }],
      },
      f4: {
        ...createBlankTask('Metodo reusable', 'Directiva').f4,
        titulo: 'Metodo reusable',
        cambio: 'Estandarizar el parseo',
        conexiones: 'Se puede reusar en proyectos similares',
        methodVersionId: 'method-v2',
      },
    };

    const index = await completeTask(storage, task);

    expect(index.registros).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'reuse-task',
        resourceKind: 'method',
        projectId: 'project-a',
        sourceTaskId: 'reuse-task',
        sourceMethodVersionId: 'method-v2',
      }),
      expect.objectContaining({
        id: 'reuse-task:tool:cli-local',
        resourceKind: 'tool',
        projectId: 'project-a',
      }),
      expect.objectContaining({
        id: 'reuse-task:learning',
        resourceKind: 'learning',
        projectId: 'project-a',
      }),
    ]));
    expect(values.get('bitacora:r:reuse-task:tool:cli-local')).toContain('CLI local');
    expect(values.get('bitacora:r:reuse-task:learning')).toContain('Conviene validar columnas');
  });

  it('stores automation candidates with hypothesis versus candidate-with-evidence labels', async () => {
    const values = new Map<string, string>([['bitacora:index', JSON.stringify({ tareas: [{ id: 'candidate-task', nombre: 'Automatizar', projectId: 'project-b' }], registros: [] })]]);
    const storage = {
      async get(key: string) { return values.get(key) ?? null; },
      async set(key: string, value: string) { values.set(key, value); },
      async delete() {},
    };

    const task: Task = {
      ...createBlankTask('Automatizar', 'Directiva'),
      id: 'candidate-task',
      projectId: 'project-b',
      estado: 'activa',
      methodVersions: [{
        id: 'method-v1',
        version: 1,
        parentVersionId: null,
        status: 'published',
        changeKind: 'initial',
        preconditions: ['Contexto'],
        steps: [{
          id: 'step-1',
          title: 'Clasificar',
          objective: 'Ordenar items',
          dependencies: [],
          inputs: ['Items'],
          output: 'Items clasificados',
          tool: 'Script local',
          risk: 'Riesgo medio',
          successCriterion: 'Categorias correctas',
          sourceCriterionId: null,
        }],
        tools: ['Script local'],
        inputs: ['Items'],
        outputs: ['Items clasificados'],
        controls: ['Revision humana'],
        exceptions: [],
        exceptionsReviewed: true,
        successCriteria: ['Categorias correctas'],
        supportingIterationIds: ['iteration-1', 'iteration-2'],
        createdAt: 1_000,
      }],
      automationOpportunities: [
        {
          id: 'candidate-1',
          methodVersionId: 'method-v1',
          stepIds: ['step-1'],
          classification: 'automatable',
          frequency: 'Semanal',
          stability: 'Alta',
          risk: 'Medio',
          humanJudgment: 'Revisar categorias dudosas',
          trigger: 'Llegan nuevos items',
          inputs: ['Items'],
          transformation: 'Clasificar por reglas',
          output: 'Items clasificados',
          candidateTool: 'Script local',
          expectedFailures: ['Categoria ambigua'],
          humanCheckpoint: 'Validar resumen final',
          occurrenceIterationIds: ['iteration-1'],
        },
        {
          id: 'candidate-2',
          methodVersionId: 'method-v1',
          stepIds: ['step-1'],
          classification: 'assistable',
          frequency: 'Diaria',
          stability: 'Alta',
          risk: 'Bajo',
          humanJudgment: 'Aprobar respuesta',
          trigger: 'Llega solicitud',
          inputs: ['Solicitud'],
          transformation: 'Preparar borrador',
          output: 'Borrador',
          candidateTool: 'Asistente',
          expectedFailures: ['Contexto incompleto'],
          humanCheckpoint: 'Revisar borrador',
          occurrenceIterationIds: ['iteration-1', 'iteration-2'],
        },
      ],
      f4: {
        ...createBlankTask('Automatizar', 'Directiva').f4,
        titulo: 'Automatizar',
        cambio: 'Automatizar lo repetido',
        methodVersionId: 'method-v1',
      },
    };

    const index = await completeTask(storage, task);

    expect(index.registros).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'candidate-task:automation:candidate-1',
        resourceKind: 'automation-candidate',
        automationEvidence: {
          status: 'hypothesis',
          occurrenceCount: 1,
        },
      }),
      expect.objectContaining({
        id: 'candidate-task:automation:candidate-2',
        resourceKind: 'automation-candidate',
        automationEvidence: {
          status: 'candidate-with-evidence',
          occurrenceCount: 2,
        },
      }),
    ]));
  });
});
