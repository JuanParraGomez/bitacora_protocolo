import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const EXCLUDED = new Set(['node_modules', '.nuxt', '.output', 'data', 'specs', '.git', 'coverage', 'test-results']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.vue', '.mjs', '.js']);

function sourceFiles(rootDir) {
  const result = [];
  function visit(relativeDir) {
    const absoluteDir = path.join(rootDir, relativeDir);
    if (!fs.existsSync(absoluteDir)) return;
    for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (EXCLUDED.has(entry.name) || entry.name.startsWith('.')) continue;
      const relative = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) visit(relative);
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) result.push(relative.split(path.sep).join('/'));
    }
  }
  for (const dir of ['app', 'server', 'shared', 'scripts']) visit(dir);
  return result.sort();
}

function moduleFor(file) {
  if (file.startsWith('app/features/')) return file.split('/').slice(0, 3).join('/');
  if (file.startsWith('server/')) return 'server';
  if (file.startsWith('shared/')) return 'shared';
  return null;
}

function moduleId(modulePath) { return modulePath.replace(/^app\/features\//, '').replace(/^app\//, '').replaceAll('/', '-'); }

export function generateSnapshot({ rootDir = process.cwd(), generatedAt = new Date().toISOString() } = {}) {
  const files = sourceFiles(rootDir);
  const accepted = files.filter(file => moduleFor(file));
  const modulePaths = [...new Set(accepted.map(moduleFor))].sort();
  const modules = modulePaths.map(modulePath => ({
    id: moduleId(modulePath), path: modulePath, purpose: `Owns ${moduleId(modulePath)} capability`,
    owns: [moduleId(modulePath)], dependencies: [],
  })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const edges = new Set();
  for (const file of accepted) {
    const fromPath = moduleFor(file);
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    for (const match of content.matchAll(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g)) {
      const specifier = match[1] || match[2];
      let targetPath = null;
      if (specifier.startsWith('~/app/features/')) targetPath = specifier.slice(2).split('/').slice(0, 3).join('/');
      else if (specifier.startsWith('~/shared/')) targetPath = 'shared';
      else if (specifier.startsWith('../') || specifier.startsWith('./')) {
        const resolved = path.normalize(path.join(path.dirname(file), specifier)).split(path.sep).join('/');
        targetPath = moduleFor(resolved);
      }
      if (targetPath && targetPath !== fromPath && modulePaths.includes(targetPath)) edges.add(`${moduleId(fromPath)}|${moduleId(targetPath)}|imports`);
    }
  }
  const sourceHash = crypto.createHash('sha256').update(accepted.map(file => `${file}\0${fs.readFileSync(path.join(rootDir, file), 'utf8')}`).join('\0')).digest('hex');
  return { schemaVersion: 1, generatedAt, sourceHash, modules, edges: [...edges].sort().map(edge => { const [from, to, kind] = edge.split('|'); return { from, to, kind }; }) };
}

export function renderMermaid(snapshot) {
  const lines = ['```mermaid', 'graph TD'];
  for (const module of snapshot.modules) lines.push(`  ${module.id}["${module.id}"]`);
  for (const edge of snapshot.edges) lines.push(`  ${edge.from} -->|${edge.kind}| ${edge.to}`);
  lines.push('```', '');
  return lines.join('\n');
}

export function writeSnapshot({ rootDir = process.cwd(), outputDir = path.join(rootDir, 'docs/architecture'), generatedAt } = {}) {
  const snapshot = generateSnapshot({ rootDir, generatedAt });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'structure.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'structure.md'), `# Project structure\n\n${renderMermaid(snapshot)}`);
  return snapshot;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSnapshot({ rootDir: process.cwd(), generatedAt: new Date().toISOString() });
}
