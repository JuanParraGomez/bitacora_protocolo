import { describe, expect, it } from 'vitest';
import { optionalProviderConfigSchema, optionalProviderResponseSchema } from '../../shared/schemas/optional-provider';

describe('optional provider contracts', () => {
  it('accepts disabled defaults and valid responses', () => {
    expect(optionalProviderConfigSchema.parse({ enabled: false }).timeoutMs).toBeGreaterThan(0);
    expect(optionalProviderResponseSchema.parse({ content: 'answer' }).content).toBe('answer');
  });

  it('rejects malformed provider responses', () => {
    expect(optionalProviderResponseSchema.safeParse({ unexpected: true }).success).toBe(false);
  });
});
