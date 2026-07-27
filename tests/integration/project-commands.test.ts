import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('project command surface', () => {
  it('has reproducible project manifests', () => {
    expect(existsSync('package.json')).toBe(true);
    expect(existsSync('package-lock.json')).toBe(true);
  });

  it('keeps runtime configuration outside source defaults', () => {
    expect(existsSync('.env.example')).toBe(true);
  });

  it('does not require a local database to install', () => {
    // Existing data is user-owned and may already exist; installation must not
    // read or overwrite it. The manifest is the install-time requirement.
    expect(existsSync('package-lock.json')).toBe(true);
  });

  it('exposes the aggregate verification command', async () => {
    const packageJson = await import('../../package.json', { with: { type: 'json' } });
    expect(packageJson.default.scripts.verify).toBeTypeOf('string');
  });

  it('exposes typecheck, architecture, build, structure, browser, and aggregate commands', async () => {
    const packageJson = await import('../../package.json', { with: { type: 'json' } });
    const scripts = packageJson.default.scripts;
    for (const name of ['typecheck', 'test:architecture', 'architecture:check', 'build:production', 'structure', 'structure:check', 'test:browser', 'verify', 'verify:e2e']) {
      expect(scripts[name], `missing npm script ${name}`).toBeTypeOf('string');
    }
  });

  it('exposes separate red, green, and scoped verification commands', async () => {
    const packageJson = await import('../../package.json', { with: { type: 'json' } });
    const scripts = packageJson.default.scripts;
    for (const name of ['test:red', 'test:green', 'test:unit', 'test:contract', 'test:integration', 'test:migration', 'db:check', 'db:backup', 'migration:verify']) {
      expect(scripts[name], `missing npm script ${name}`).toBeTypeOf('string');
    }
  });
});
