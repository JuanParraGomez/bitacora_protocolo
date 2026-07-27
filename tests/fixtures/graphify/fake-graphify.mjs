import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const out = path.join(cwd, 'graphify-out');
if (process.env.FAKE_GRAPHIFY_MODE === 'fail') process.exit(9);
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'graph.json'), JSON.stringify({ fake: true }));
if (process.env.FAKE_GRAPHIFY_MODE !== 'partial') {
  fs.writeFileSync(path.join(out, 'GRAPH_REPORT.md'), '# Fake Graphify\n');
  fs.writeFileSync(path.join(out, 'graph.html'), '<html></html>');
}
