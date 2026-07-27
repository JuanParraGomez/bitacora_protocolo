import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.env.GRAPHIFY_PROJECT_ROOT || process.cwd();
const watched = ['app', 'pages', 'server', 'shared', 'scripts', 'tests', 'specs', 'AGENTS.md', 'app.vue', 'nuxt.config.ts', 'tsconfig.json', 'package.json', 'package-lock.json', 'Dockerfile', 'docker-compose.yml', 'bitacora-protocolo-analitico (2).html'];
const ignored = /(^|[\\/])(\.env[^/]*|secrets|node_modules|\.nuxt|\.output|coverage|data|\.git|graphify-out)([\\/]|$)|\.(sqlite|db|bak|tmp)$/i;
let timer;
let running = false;
let queued = false;

function refresh() {
  if (running) { queued = true; return; }
  running = true;
  const child = spawn(process.execPath, [path.join(root, 'scripts/graphify-workflow.mjs'), 'update'], { cwd: root, stdio: 'inherit', env: process.env });
  child.on('exit', () => {
    running = false;
    if (queued) { queued = false; refresh(); }
  });
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(refresh, Number(process.env.GRAPHIFY_WATCH_DEBOUNCE_MS || 500));
}

function onChange(_event, filename) {
  if (filename && ignored.test(String(filename))) return;
  schedule();
}

for (const entry of watched) {
  const target = path.join(root, entry);
  if (!fs.existsSync(target)) continue;
  const watcher = fs.watch(target, { recursive: fs.statSync(target).isDirectory() }, onChange);
  watcher.on('error', error => console.error(`Graphify: watcher error: ${error.message}`));
}

console.log('Graphify: watching approved project inputs; press Ctrl-C to stop');
refresh();
