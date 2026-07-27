import type { OptionalProviderResult } from '../../shared/contracts/optional-provider';
import { optionalProviderConfigSchema } from '../../shared/schemas/optional-provider';
import { parseOptionalProviderResponse } from '../domain/optional-provider';

type Adapter = (input: string) => Promise<unknown> | unknown;

export function createOptionalProviderService(options: { enabled?: boolean; timeoutMs?: number; adapter?: Adapter } = {}) {
  const { adapter: configuredAdapter, ...configInput } = options;
  const config = optionalProviderConfigSchema.parse(configInput);
  const adapter = configuredAdapter || (async () => ({ content: '' }));
  return {
    async run(input: string): Promise<OptionalProviderResult> {
      if (!config.enabled) return { status: 'disabled' };
      try {
        const result = await Promise.race([
          Promise.resolve().then(() => adapter(input)),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), config.timeoutMs)),
        ]);
        const response = parseOptionalProviderResponse(result);
        return response ? { status: 'ok', response } : { status: 'malformed', error: 'Provider response failed schema validation' };
      } catch (error) {
        return { status: error instanceof Error && error.message === 'timeout' ? 'timeout' : 'unavailable', error: error instanceof Error ? error.message : 'Provider unavailable' };
      }
    },
    coreWorkflowAvailable: () => true,
  };
}
