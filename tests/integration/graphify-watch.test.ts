import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Graphify watch workflow', () => {
  it('provides a debounced watcher entry point', () => {
    const source = readFileSync('scripts/graphify-watch.mjs', 'utf8');
    expect(source).toMatch(/watch/);
    expect(source).toMatch(/debounce|setTimeout/);
    expect(source).toMatch(/graphify-workflow/);
    expect(readFileSync('scripts/dev-with-graphify.mjs', 'utf8')).toMatch(/graphify-watch/);
  });
});
