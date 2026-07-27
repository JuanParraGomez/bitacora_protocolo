import { describe, expect, it } from 'vitest';
import { createOptionalProviderService } from '../../server/services/optional-provider.service';
import packageJson from '../../package.json';

describe('optional provider isolation', () => {
  it.each(['disabled', 'timeout', 'malformed', 'unavailable'])('keeps core workflows available when provider is %s', async (state) => {
    const adapter = state === 'timeout' ? () => new Promise(() => {})
      : state === 'malformed' ? async () => ({ unexpected: true })
        : state === 'unavailable' ? async () => { throw new Error('offline'); }
          : async () => ({ content: 'ok' });
    const service = createOptionalProviderService({ enabled: state !== 'disabled', timeoutMs: 20, adapter });
    const result = await service.run('input');
    expect(result.status).toBe(state);
    expect(service.coreWorkflowAvailable()).toBe(true);
  });

  it('keeps Graphify outside production dependencies', () => {
    expect(packageJson.dependencies).not.toHaveProperty('grapify');
  });
});
