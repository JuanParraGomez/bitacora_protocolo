import { spawn } from 'node:child_process';
import path from 'node:path';

const nuxiPath = path.join(process.cwd(), 'node_modules', '.bin', 'nuxi');
const children = [
  spawn(process.execPath, [nuxiPath, 'dev', '--host', '0.0.0.0', '--port', '3000'], { stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['scripts/graphify-watch.mjs'], { stdio: 'inherit', env: process.env }),
];

function stop() {
  for (const child of children) child.kill('SIGTERM');
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children[0].on('exit', code => {
  stop();
  process.exit(code ?? 0);
});
