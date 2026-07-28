import { z } from 'zod';
import { BATCH_MAX_OPERATIONS } from '../contracts/storage';

export const storageKeySchema = z.string().min(1).max(500);
export const storageValueSchema = z.object({ value: z.string() });
export const storageHealthSchema = z.object({
  ok: z.boolean(),
  storage: z.enum(['available', 'unavailable']),
});

export const storageBatchSetValueSchema = z.unknown().superRefine((value, ctx) => {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'storage-batch.set value must be JSON-serializable' });
    }
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'storage-batch.set value must be JSON-serializable' });
  }
});

const storageBatchOperationSchema = z.object({
  type: z.enum(['set', 'delete']),
  key: z.string().min(1).max(250),
  value: storageBatchSetValueSchema.optional(),
}).strict();

const storageBatchOperationObjectSchema = storageBatchOperationSchema.superRefine((operation, ctx) => {
  if (operation.type === 'set' && !Object.prototype.hasOwnProperty.call(operation, 'value')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'set operation requires value' });
  }

  if (operation.type === 'delete' && operation.value !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'delete operation must not include value' });
  }
});

export const storageBatchSchema = z.object({ operations: z.array(storageBatchOperationObjectSchema).max(BATCH_MAX_OPERATIONS).min(1) });

export type StorageValueInput = z.infer<typeof storageValueSchema>;

export type StorageBatchPayload = z.infer<typeof storageBatchSchema>;
