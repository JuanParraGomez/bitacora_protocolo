import { z } from 'zod';

export const optionalProviderConfigSchema = z.object({
  enabled: z.boolean().default(false),
  timeoutMs: z.number().int().positive().max(120_000).default(10_000),
});

export const optionalProviderRequestSchema = z.object({ input: z.string().min(1) });
export const optionalProviderResponseSchema = z.object({ content: z.string(), metadata: z.record(z.string(), z.unknown()).optional() });
