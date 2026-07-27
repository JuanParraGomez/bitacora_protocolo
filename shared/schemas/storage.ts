import { z } from 'zod';

export const storageKeySchema = z.string().min(1).max(500);
export const storageValueSchema = z.object({ value: z.string() });
export const storageHealthSchema = z.object({
  ok: z.boolean(),
  storage: z.enum(['available', 'unavailable']),
});

export type StorageValueInput = z.infer<typeof storageValueSchema>;
