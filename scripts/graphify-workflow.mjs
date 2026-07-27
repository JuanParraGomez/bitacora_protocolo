import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

const root = process.env.GRAPHIFY_PROJECT_ROOT || process.cwd();
const outputDir = path.join(root, 'graphify-out');
const metadataPath = path.join(outputDir, 'freshness.json');
const requiredArtifacts = ['graph.json', 'GRAPH_REPORT.md', 'graph.html'];

const directories = ['app', 'pages', 'server', 'shared', 'scripts', 'tests', 'specs'];
const rootFiles = ['AGENTS.md', 'app.vue', 'nuxt.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', 'Dockerfile', 'docker-compose.yml', 'bitacora-protocolo-analitico (2).html'];
const excluded = /(^|\/)(\.env[^/]*|secrets|node_modules|\.nuxt|\.output|coverage|data|\.git|graphify-out)(\/|$)|\.(sqlite|db|bak|tmp)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  if (fs.lstatSync(dir).isSymbolicLink()) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const relative = path.relative(root, path.join(dir, entry.name)).replaceAll(path.sep, '/');
    if (excluded.test(relative)) continue;
    if (entry.isDirectory()) result.push(...walk(path.join(dir, entry.name)));
    else result.push(relative);
  }
  return result;
}

function inputs() {
  const files = [...directories.flatMap(dir => walk(path.join(root, dir))), ...rootFiles]
    .filter(file => fs.existsSync(path.join(root, file)) && !excluded.test(file) && !fs.lstatSync(path.join(root, file)).isSymbolicLink());
  return [...new Set(files)].sort();
}

function fingerprint(files) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file).update('\0').update(fs.readFileSync(path.join(root, file))).update('\0');
  }
  return hash.digest('hex');
}

function scopeFingerprint() {
  return createHash('sha256').update(JSON.stringify({ directories, rootFiles, excluded: excluded.source })).digest('hex');
}

function stageInputs(files, update) {
  const stage = fs.mkdtempSync(path.join(tmpdir(), 'graphify-scope-'));
  for (const file of files) {
    const destination = path.join(stage, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, file), destination);
  }
  if (update && fs.existsSync(outputDir)) {
    const stagedOutput = path.join(stage, 'graphify-out');
    fs.mkdirSync(stagedOutput, { recursive: true });
    for (const file of ['graph.json', '.graphify_analysis.json', '.graphify_manifest.json']) {
      const source = path.join(outputDir, file);
      if (fs.existsSync(source)) fs.copyFileSync(source, path.join(stagedOutput, file));
    }
  }
  return stage;
}

function fail(message) {
  console.error(`Graphify: ${message}`);
  process.exitCode = 1;
}

function generate(update = false) {
  const files = inputs();
  fs.mkdirSync(outputDir, { recursive: true });
  const stage = stageInputs(files, update);
  const args = process.env.GRAPHIFY_COMMAND_JSON ? ['.'] : [update ? 'update' : 'extract', stage];
  if (!update && process.env.GRAPHIFY_CODE_ONLY !== '0' && !process.env.GRAPHIFY_COMMAND_JSON) args.push('--code-only');
  let command;
  let configuredArgs;
  if (process.env.GRAPHIFY_COMMAND_JSON) {
    [command, ...configuredArgs] = JSON.parse(process.env.GRAPHIFY_COMMAND_JSON);
  } else {
    command = process.env.GRAPHIFY_COMMAND || 'graphify';
    configuredArgs = [];
  }
  try {
    execFileSync(command, [...configuredArgs, ...args], { cwd: stage, stdio: 'inherit', env: process.env });
    if (!process.env.GRAPHIFY_COMMAND_JSON) {
      execFileSync(command, [...configuredArgs, 'cluster-only', stage, '--no-label'], { cwd: stage, stdio: 'inherit', env: process.env });
    }
  } catch (error) {
    fail(`generation failed. Install graphifyy and retry with npm run graph:generate (${error?.message || error})`);
    fs.rmSync(stage, { recursive: true, force: true });
    return;
  }
  const stagedOutput = path.join(stage, 'graphify-out');
  const missing = requiredArtifacts.filter(file => !fs.existsSync(path.join(stagedOutput, file)));
  if (missing.length) {
    fail(`generation did not produce required artifacts: ${missing.join(', ')}`);
    fs.rmSync(stage, { recursive: true, force: true });
    return;
  }
  fs.cpSync(stagedOutput, outputDir, { recursive: true });
  const metadata = {
    schemaVersion: 1,
    inputFingerprint: fingerprint(files),
    scopeFingerprint: scopeFingerprint(),
    generatedAt: new Date().toISOString(),
    graphifyVersion: process.env.GRAPHIFY_VERSION || 'external-cli',
  };
  const temporary = `${metadataPath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(metadata, null, 2)}\n`);
  fs.renameSync(temporary, metadataPath);
  fs.rmSync(stage, { recursive: true, force: true });
}

function check() {
  if (!fs.existsSync(metadataPath)) return fail('graph is missing; run npm run graph:generate');
  const missing = requiredArtifacts.filter(file => !fs.existsSync(path.join(outputDir, file)));
  if (missing.length) return fail(`graph artifacts are incomplete (${missing.join(', ')}); run npm run graph:generate`);
  let metadata;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    JSON.parse(fs.readFileSync(path.join(outputDir, 'graph.json'), 'utf8'));
    for (const file of ['GRAPH_REPORT.md', 'graph.html']) if (!fs.readFileSync(path.join(outputDir, file), 'utf8').trim()) throw new Error('empty artifact');
  } catch { return fail('graph artifacts or freshness metadata are malformed; run npm run graph:generate'); }
  if (metadata.schemaVersion !== 1 || metadata.scopeFingerprint !== scopeFingerprint()) return fail('graph scope changed; run npm run graph:generate');
  if (metadata.inputFingerprint !== fingerprint(inputs())) return fail('graph is stale; run npm run graph:update');
  console.log('Graphify: graph is current');
}

const mode = process.argv[2] || 'check';
if (mode === 'generate') generate(false);
else if (mode === 'update') {
  if (!fs.existsSync(metadataPath)) generate(false);
  else if (metadataPath && (() => { try { const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')); return metadata.inputFingerprint !== fingerprint(inputs()) || metadata.scopeFingerprint !== scopeFingerprint(); } catch { return true; } })()) generate(true);
  else console.log('Graphify: graph is already current');
} else if (mode === 'check') check();
else fail(`unknown mode '${mode}'; use generate, update, or check`);
