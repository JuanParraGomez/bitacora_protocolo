import { z } from 'zod';

export const libraryResourceKindSchema = z.enum(['method', 'tool', 'learning', 'automation-candidate']);
export const libraryAutomationEvidenceSchema = z.object({
  status: z.enum(['hypothesis', 'candidate-with-evidence']),
  occurrenceCount: z.number().int().min(0).default(0),
});

const libraryRecordSummaryBaseSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().default('Registro'),
  fecha: z.union([z.string(), z.number()]).optional(),
  tarea: z.string().optional(),
  taskId: z.string().min(1),
  tareaId: z.string().optional(),
  projectId: z.string().default('legacy'),
  resourceKind: libraryResourceKindSchema.default('learning'),
  sourceTaskId: z.string().optional(),
  sourceMethodVersionId: z.string().nullable().optional(),
  automationEvidence: libraryAutomationEvidenceSchema.nullable().optional(),
});

export const libraryRecordSummarySchema = libraryRecordSummaryBaseSchema.transform((record) => {
  const taskId = record.taskId || record.tareaId || record.id;
  return {
    ...record,
    tareaId: taskId,
    taskId,
    projectId: record.projectId || 'legacy',
    resourceKind: record.resourceKind || 'learning',
    sourceTaskId: record.sourceTaskId || taskId,
    sourceMethodVersionId: record.sourceMethodVersionId ?? null,
    automationEvidence: record.automationEvidence ?? null,
  };
});

export const libraryRecordSchema = libraryRecordSummaryBaseSchema.extend({
  markdown: z.string(),
}).transform((record) => {
  const taskId = record.taskId || record.tareaId || record.id;
  return {
    ...record,
    tareaId: taskId,
    taskId,
    projectId: record.projectId || 'legacy',
    resourceKind: record.resourceKind || 'learning',
    sourceTaskId: record.sourceTaskId || taskId,
    sourceMethodVersionId: record.sourceMethodVersionId ?? null,
    automationEvidence: record.automationEvidence ?? null,
  };
});
export type LibraryRecordSummary = z.infer<typeof libraryRecordSummarySchema>;
export type LibraryRecord = z.infer<typeof libraryRecordSchema>;
