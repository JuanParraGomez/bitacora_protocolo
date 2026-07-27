import { describe, expect, it } from 'vitest';
import { generateSnapshot, renderMermaid } from '../../scripts/generate-structure.mjs';
import { validateSnapshot } from '../../scripts/structure-check.mjs';

describe('project structure snapshot', () => {
  it('excludes generated, dependency, data, and spec directories', async () => {
    const snapshot = generateSnapshot({ rootDir: process.cwd(), generatedAt: '2026-07-26T00:00:00.000Z' });
    expect(snapshot.modules.every((item: { path: string }) => !/(node_modules|\.nuxt|\.output|\/data\/|^specs\/)/.test(item.path))).toBe(true);
  });

  it('produces stable sorted output and source hash', async () => {
    const a = generateSnapshot({ rootDir: process.cwd(), generatedAt: '2026-07-26T00:00:00.000Z' });
    const b = generateSnapshot({ rootDir: process.cwd(), generatedAt: '2026-07-26T00:00:00.000Z' });
    expect(a).toEqual(b);
    expect(a.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(a.modules.map((item: { id: string }) => item.id)).toEqual([...a.modules].map((item: { id: string }) => item.id).sort());
    expect(renderMermaid(a)).toContain('graph TD');
  });

  it('rejects cycles, forbidden imports, stale output, and schema errors', async () => {
    const invalid = { schemaVersion: 2, generatedAt: 'not-date', sourceHash: 'bad', modules: [], edges: [] };
    expect(validateSnapshot(invalid).valid).toBe(false);
  });
});
