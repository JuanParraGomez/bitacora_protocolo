import { z } from 'zod';

export const libraryRecordSummarySchema = z.object({
  id: z.string().min(1), titulo: z.string().default('Registro'),
  fecha: z.union([z.string(), z.number()]).optional(), tarea: z.string().optional(), taskId: z.string().min(1),
});

export const libraryRecordSchema = libraryRecordSummarySchema.extend({ markdown: z.string() });
export type LibraryRecordSummary = z.infer<typeof libraryRecordSummarySchema>;
export type LibraryRecord = z.infer<typeof libraryRecordSchema>;
