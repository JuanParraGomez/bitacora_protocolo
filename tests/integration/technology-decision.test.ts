import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('technology decision records', () => {
  it('requires benefit, owner, cost, isolation, and removal path', () => {
    const required = ['benefit', 'owner', 'cost', 'failureIsolation', 'removalPath'];
    expect(required).toHaveLength(5);
    const template = fs.readFileSync('docs/architecture/decision-record-template.md', 'utf8');
    for (const field of required) expect(template).toContain(field);
  });

  it('rejects a decision that omits operational ownership', () => {
    const decision = { benefit: 'x', owner: '', cost: 'x', failureIsolation: 'x', removalPath: 'x' };
    expect(decision.owner).toBe('');
    const guidance = fs.readFileSync('docs/architecture/advanced-capabilities.md', 'utf8');
    expect(guidance).toMatch(/FastAPI|Python/);
    expect(guidance).toContain('removal');
  });
});
