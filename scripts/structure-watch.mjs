import fs from 'node:fs';
import path from 'node:path';
import { writeSnapshot } from './generate-structure.mjs';

export function watchStructure({ rootDir = process.cwd(), outputDir = path.join(rootDir, 'docs/architecture') } = {}) {
  const watched = ['app', 'server', 'shared', 'scripts'].map(dir => path.join(rootDir, dir)).filter(fs.existsSync);
  const watchers = watched.map(directory => fs.watch(directory, { recursive: true }, () => writeSnapshot({ rootDir, outputDir })));
  return () => watchers.forEach(watcher => watcher.close());
}

if (process.argv[1]?.endsWith('structure-watch.mjs')) {
  watchStructure();
  console.log('Watching project structure. Press Ctrl+C to stop.');
}
