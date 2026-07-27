import fs from 'node:fs';
import path from 'node:path';
import { generateSnapshot } from './generate-structure.mjs';

export function validateSnapshot(snapshot) {
  const errors = [];
  if (snapshot?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!snapshot?.generatedAt || Number.isNaN(Date.parse(snapshot.generatedAt))) errors.push('generatedAt must be a date');
  if (!/^[a-f0-9]{64}$/.test(snapshot?.sourceHash || '')) errors.push('sourceHash must be sha256');
  for (const module of snapshot?.modules || []) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(module.id || '')) errors.push(`invalid module id: ${module.id}`);
    if (!/^(app\/features|server|shared)\//.test(module.path || '') && module.path !== 'server' && module.path !== 'shared') errors.push(`invalid module path: ${module.path}`);
  }
  return { valid: errors.length === 0, errors };
}

export function checkStructure({ rootDir = process.cwd(), snapshotPath = path.join(rootDir, 'docs/architecture/structure.json') } = {}) {
  if (!fs.existsSync(snapshotPath)) return { valid: false, errors: ['snapshot missing'] };
  let stored;
  try { stored = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')); } catch { return { valid: false, errors: ['snapshot is not valid JSON'] }; }
  const validation = validateSnapshot(stored);
  const current = generateSnapshot({ rootDir, generatedAt: stored.generatedAt });
  if (current.sourceHash !== stored.sourceHash || JSON.stringify(current.modules) !== JSON.stringify(stored.modules) || JSON.stringify(current.edges) !== JSON.stringify(stored.edges)) validation.errors.push('snapshot is stale');
  return { valid: validation.errors.length === 0, errors: validation.errors };
}

if (process.argv[1]?.endsWith('structure-check.mjs')) process.exitCode = checkStructure().valid ? 0 : 1;
