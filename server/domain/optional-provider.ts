import type { OptionalProviderResponse } from '../../shared/contracts/optional-provider';
import { optionalProviderResponseSchema } from '../../shared/schemas/optional-provider';

export function parseOptionalProviderResponse(value: unknown): OptionalProviderResponse | null {
  const parsed = optionalProviderResponseSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
