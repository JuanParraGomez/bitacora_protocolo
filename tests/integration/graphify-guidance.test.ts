import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Graphify assistant guidance', () => {
  it('keeps query-first guidance and safe fallback in AGENTS.md', () => {
    const agents = readFileSync('AGENTS.md', 'utf8');
    expect(agents).toMatch(/Graphify/);
    expect(agents).toMatch(/query|path|explain/i);
    expect(agents).toMatch(/stale|unavailable|fallback/i);
    expect(agents).toMatch(/\.env|secrets|SQLite|sqlite/i);
  });
});
