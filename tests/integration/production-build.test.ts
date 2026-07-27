import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('production build configuration', () => {
  it('configures Nuxt build output as the production server', () => {
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
    expect(dockerfile).toContain('npm run build');
    expect(dockerfile).toContain('.output/server/index.mjs');
    expect(packageJson.scripts.start).toBe('node .output/server/index.mjs');
  });

  it('uses the lockfile for reproducible container dependency installs', () => {
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
    expect(dockerfile).toContain('npm ci');
    expect(dockerfile).not.toContain('npm install --no-audit --no-fund');
  });

  it('provides a local compose profile that exposes localhost without Coolify', () => {
    const compose = fs.readFileSync('docker-compose.local.yml', 'utf8');
    expect(compose).toContain('PORT: 3000');
    expect(compose).toContain('${HOST_PORT:-3000}:3000');
    expect(compose).not.toContain('PORT: ${PORT');
    expect(compose).not.toContain('external: true');
    expect(compose).not.toContain('coolify');
  });

  it('keeps the SQLite data directory mounted outside the image', () => {
    const compose = fs.readFileSync('docker-compose.yml', 'utf8');
    expect(compose).toMatch(/\/app\/data/);
    expect(compose).toContain('/health');
  });
});
