import { describe, expect, it } from 'vitest';
import {
  createTaskIntakeSubmissionMachine,
  buildTaskIntakeCreatePlan,
  createTaskIntakeOperationId,
  transitionTaskIntakeSubmissionState,
  TASK_DIRECTIVE_MAX_LENGTH,
  TASK_NAME_MAX_LENGTH,
  normalizeTaskIntake,
  validateTaskIntake,
} from './task-intake';

describe('TaskIntakeForm helpers', () => {
  it('starts intake submission at idle with a null operation id', () => {
    const machine = createTaskIntakeSubmissionMachine();
    expect(machine).toEqual({
      state: 'idle',
      operationId: null,
    });
  });

  it('moves to submitting once and blocks duplicate submit attempts with the same operation id', () => {
    let machine = createTaskIntakeSubmissionMachine();
    machine = transitionTaskIntakeSubmissionState(machine, 'attempt');
    expect(machine.state).toBe('submitting');
    expect(machine.operationId).toMatch(/^intake-/);

    const blocked = transitionTaskIntakeSubmissionState(machine, 'attempt');
    expect(blocked).toEqual(machine);
  });

  it('moves to invalid when validation fails and returns to idle after input', () => {
    let machine = createTaskIntakeSubmissionMachine();
    machine = transitionTaskIntakeSubmissionState(machine, 'invalid');
    expect(machine.state).toBe('invalid');

    machine = transitionTaskIntakeSubmissionState(machine, 'input');
    expect(machine.state).toBe('idle');
    expect(machine.operationId).toBeNull();
  });

  it('moves to succeeded after a completed submission', () => {
    let machine = createTaskIntakeSubmissionMachine();
    machine = transitionTaskIntakeSubmissionState(machine, 'attempt');
    machine = transitionTaskIntakeSubmissionState(machine, 'success');
    expect(machine.state).toBe('succeeded');
  });

  it('moves to failed on recoverable errors and keeps user data', () => {
    let machine = createTaskIntakeSubmissionMachine();
    machine = transitionTaskIntakeSubmissionState(machine, 'attempt');
    machine = transitionTaskIntakeSubmissionState(machine, 'failure');
    expect(machine.state).toBe('failed');

    machine = transitionTaskIntakeSubmissionState(machine, 'input');
    expect(machine.state).toBe('idle');
  });

  it('normalizes whitespace and preserves template references', () => {
    expect(normalizeTaskIntake({
      name: '  Nombre  ',
      directive: '  Problema inicial  ',
      templateTaskId: ' template-1 ',
    })).toEqual({
      name: 'Nombre',
      directive: 'Problema inicial',
      templateTaskId: 'template-1',
    });
  });

  it('accepts either an explicit name or a problem description', () => {
    expect(validateTaskIntake({
      name: 'Tarea concreta',
      directive: '',
    }).ok).toBe(true);

    const onlyDirective = validateTaskIntake({
      name: '',
      directive: 'Resolver cuello de botella operativo',
    });
    expect(onlyDirective.ok).toBe(true);
    if (onlyDirective.ok) {
      expect(onlyDirective.value.name).toContain('Resolver cuello');
    }
  });

  it('rejects fully empty submissions', () => {
    const result = validateTaskIntake({
      name: '   ',
      directive: '   ',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('nombre o describe');
    }
  });

  it('enforces the configured length boundaries', () => {
    expect(validateTaskIntake({
      name: 'x'.repeat(TASK_NAME_MAX_LENGTH),
      directive: 'x'.repeat(TASK_DIRECTIVE_MAX_LENGTH),
    }).ok).toBe(true);

    expect(validateTaskIntake({
      name: 'x'.repeat(TASK_NAME_MAX_LENGTH + 1),
      directive: '',
    }).ok).toBe(false);

    expect(validateTaskIntake({
      name: 'Nombre',
      directive: 'x'.repeat(TASK_DIRECTIVE_MAX_LENGTH + 1),
    }).ok).toBe(false);
  });

  it('generates stable intake operation identifiers', () => {
    const first = createTaskIntakeOperationId();
    const second = createTaskIntakeOperationId();
    expect(first).toMatch(/^intake-/);
    expect(second).toMatch(/^intake-/);
    expect(first).not.toBe(second);
  });

  it('resuelve un proyecto activo y actualiza la metadata del plan', () => {
    const plan = buildTaskIntakeCreatePlan({
      payload: {
        name: 'Tarea desde intake',
        directive: 'Resolver el arranque inicial',
        templateTaskId: null,
      },
      preferredProjectId: 'active-project',
      indexValue: JSON.stringify({
        tareas: [
          { id: 'legacy-task', nombre: 'Tarea legacy', estado: 'activa', fase: 1, tipo: 'protocolo', projectId: 'archived-project' },
        ],
        registros: [],
      }),
      projectsValue: JSON.stringify({
        schemaVersion: 1,
        activeProjectId: 'active-project',
        projects: [
          { id: 'archived-project', status: 'archived', name: 'Proyecto arch', description: '', lastActiveTaskId: null, createdAt: 1, updatedAt: 1 },
          { id: 'active-project', status: 'active', name: 'Proyecto activo', description: '', lastActiveTaskId: null, createdAt: 2, updatedAt: 2 },
        ],
      }),
      now: 1234,
    });

    expect(plan.task.projectId).toBe('active-project');
    expect(plan.index.tareas[0].id).toBe(plan.task.id);
    expect(plan.projects.activeProjectId).toBe('active-project');
    expect(plan.projects.projects.find((project) => project.id === 'active-project')?.lastActiveTaskId).toBe(plan.task.id);
  });

  it('lanza un error si no hay proyectos activos para crear la tarea', () => {
    expect(() => buildTaskIntakeCreatePlan({
      payload: {
        name: 'Sin proyecto',
        directive: 'No hay destino activo',
        templateTaskId: null,
      },
      preferredProjectId: 'archived-project',
      indexValue: JSON.stringify({ tareas: [], registros: [] }),
      projectsValue: JSON.stringify({
        schemaVersion: 1,
        activeProjectId: 'archived-project',
        projects: [
          {
            id: 'archived-project',
            status: 'archived',
            name: 'Proyecto archivado',
            description: '',
            lastActiveTaskId: null,
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      }),
      now: 4321,
    })).toThrowError('No hay un proyecto activo para crear la tarea.');
  });
});
