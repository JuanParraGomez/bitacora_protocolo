import { describe, expect, it } from 'vitest';
import { libraryRecordSchema, libraryRecordSummarySchema } from './library-record.schema';

describe('library record schema', () => {
  it('accepts method, tool, learning and automation candidate records with project origin metadata', () => {
    const method = libraryRecordSummarySchema.parse({
      id: 'record-method',
      titulo: 'Metodo repetible',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      resourceKind: 'method',
      sourceTaskId: 'task-origin',
      sourceMethodVersionId: 'method-v2',
    });
    const tool = libraryRecordSummarySchema.parse({
      id: 'record-tool',
      titulo: 'CLI local',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      resourceKind: 'tool',
      sourceTaskId: 'task-origin',
    });
    const learning = libraryRecordSummarySchema.parse({
      id: 'record-learning',
      titulo: 'Aprendizaje clave',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      resourceKind: 'learning',
      sourceTaskId: 'task-origin',
    });
    const candidate = libraryRecordSchema.parse({
      id: 'record-candidate',
      titulo: 'Clasificar tickets',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      resourceKind: 'automation-candidate',
      sourceTaskId: 'task-origin',
      sourceMethodVersionId: 'method-v2',
      automationEvidence: {
        status: 'candidate-with-evidence',
        occurrenceCount: 2,
      },
      markdown: '# Hipotesis segura',
    });

    expect(method.resourceKind).toBe('method');
    expect(tool.resourceKind).toBe('tool');
    expect(learning.resourceKind).toBe('learning');
    expect(candidate.automationEvidence).toEqual({
      status: 'candidate-with-evidence',
      occurrenceCount: 2,
    });
  });

  it('repairs missing source metadata and keeps inert content', () => {
    const parsed = libraryRecordSchema.parse({
      id: 'record-inert',
      titulo: 'Notas utiles',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      markdown: '<script>alert(1)</script>\n[texto](javascript:alert(1))',
    });

    expect(parsed.resourceKind).toBe('learning');
    expect(parsed.sourceTaskId).toBe('task-origin');
    expect(parsed.sourceMethodVersionId).toBeNull();
    expect(parsed.automationEvidence).toBeNull();
    expect(parsed.markdown).toContain('<script>alert(1)</script>');
  });

  it('rejects unsupported automation evidence states', () => {
    expect(() => libraryRecordSchema.parse({
      id: 'record-invalid',
      titulo: 'Automatizacion',
      taskId: 'task-origin',
      projectId: 'project-alpha',
      resourceKind: 'automation-candidate',
      sourceTaskId: 'task-origin',
      automationEvidence: {
        status: 'validated-automation',
        occurrenceCount: 3,
      },
      markdown: '# No permitido',
    })).toThrow();
  });
});
