import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const workflow = path.join(root, 'scripts/graphify-workflow.mjs');
const fake = path.join(root, 'tests/fixtures/graphify/fake-graphify.mjs');

function project() {
  const dir = mkdtempSync(path.join(tmpdir(), 'graphify-workflow-'));
  mkdirSync(path.join(dir, 'app'), { recursive: true });
  mkdirSync(path.join(dir, 'secrets'), { recursive: true });
  writeFileSync(path.join(dir, 'app', 'entry.ts'), 'export const value = 1;\n');
  writeFileSync(path.join(dir, 'secrets', 'private.txt'), 'do-not-map\n');
  return dir;
}

function run(command: string, cwd: string, extra: Record<string, string> = {}) {
  return execFileSync(process.execPath, [workflow, command], {
    cwd,
    env: { ...process.env, GRAPHIFY_COMMAND_JSON: JSON.stringify([process.execPath, fake]), ...extra },
    encoding: 'utf8',
  });
}

describe('Graphify workflow', () => {
  it('generates artifacts and excludes sensitive paths from the fingerprint', () => {
    const cwd = project();
    run('generate', cwd);
    expect(readFileSync(path.join(cwd, 'graphify-out', 'graph.json'), 'utf8')).toContain('fake');
    const metadata = JSON.parse(readFileSync(path.join(cwd, 'graphify-out', 'freshness.json'), 'utf8'));
    expect(metadata.inputFingerprint).toMatch(/^[a-f0-9]{64}$/);
    const before = metadata.inputFingerprint;
    writeFileSync(path.join(cwd, 'secrets', 'private.txt'), 'changed-secret\n');
    run('check', cwd);
    expect(JSON.parse(readFileSync(path.join(cwd, 'graphify-out', 'freshness.json'), 'utf8')).inputFingerprint).toBe(before);
  });

  it('detects stale inputs and recovers after update', () => {
    const cwd = project();
    run('generate', cwd);
    writeFileSync(path.join(cwd, 'app', 'entry.ts'), 'export const value = 2;\n');
    expect(() => run('check', cwd)).toThrow(/stale/i);
    run('update', cwd);
    expect(() => run('check', cwd)).not.toThrow();
  });

  it('reports a missing graph with an actionable recovery command', () => {
    const cwd = project();
    expect(() => run('check', cwd)).toThrow(/graph:generate/i);
  });

  it('fails safely when the generator produces incomplete output', () => {
    const cwd = project();
    expect(() => run('generate', cwd, { FAKE_GRAPHIFY_MODE: 'partial' })).toThrow(/artifact|graph/i);
  });

  it('rejects malformed generated artifacts during freshness checks', () => {
    const cwd = project();
    run('generate', cwd);
    writeFileSync(path.join(cwd, 'graphify-out', 'graph.json'), '{broken');
    expect(() => run('check', cwd)).toThrow(/malformed|generate/i);
  });
});
