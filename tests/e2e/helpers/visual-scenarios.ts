import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORKSPACE_UX_VIEWPORTS, type WorkspaceUxViewport } from './workspace-ux';

const MOCKUP_ROOT = 'docs/ux-ui/mockups/rediseño-agente/';

export type VisualScenarioId = `IMG-UX-0${1 | 2 | 3 | 4 | 5 | 6}`;

export type VisualScenario = {
  id: VisualScenarioId;
  assetPath: string;
  viewports: WorkspaceUxViewport[];
};

const manifestPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs/ux-ui/mockups/rediseño-agente/manifest.md');
const manifest = readFileSync(manifestPath, 'utf8');
const manifestEntries = [...manifest.matchAll(/^\| (IMG-UX-[^ |]+) \| (?:`([^`]+)`|([^|]+)) \|/gm)]
  .map(([, id, filename, plainFilename]) => [id, (filename ?? plainFilename).trim()] as const);
const EXPECTED_IDS: VisualScenarioId[] = [
  'IMG-UX-01', 'IMG-UX-02', 'IMG-UX-03', 'IMG-UX-04', 'IMG-UX-05', 'IMG-UX-06',
];
const manifestIds = manifestEntries.map(([id]) => id);
if (manifestEntries.length !== EXPECTED_IDS.length
  || new Set(manifestIds).size !== EXPECTED_IDS.length
  || EXPECTED_IDS.some((id) => !manifestIds.includes(id))
  || manifestEntries.some(([, filename]) => filename.length === 0)) {
  throw new Error('Visual manifest must contain exactly one row for IMG-UX-01…06');
}
const ASSETS = Object.fromEntries(manifestEntries) as Record<VisualScenarioId, string>;

export const VISUAL_SCENARIOS: VisualScenario[] = Object.entries(ASSETS).map(([id, filename]) => ({
  id: id as VisualScenarioId,
  assetPath: `${MOCKUP_ROOT}${filename}`,
  viewports: WORKSPACE_UX_VIEWPORTS,
}));

export function assertCanonicalAssetPath(assetPath: string): true {
  if (assetPath.includes('*') || assetPath.includes('?') || assetPath.includes('[')) {
    throw new Error(`Glob is not allowed for visual assets: ${assetPath}`);
  }
  if (!assetPath.startsWith(MOCKUP_ROOT) || assetPath.includes('..')) {
    throw new Error(`Asset path is not canonical: ${assetPath}`);
  }
  if (!Object.values(ASSETS).some((filename) => assetPath === `${MOCKUP_ROOT}${filename}`)) {
    throw new Error(`Asset path is not listed in the canonical manifest: ${assetPath}`);
  }
  return true;
}

export function resolveVisualScenario(id: string): VisualScenario {
  const scenario = VISUAL_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown visual scenario: ${id}`);
  assertCanonicalAssetPath(scenario.assetPath);
  return scenario;
}

export function assertCanonicalViewport(viewportName: string): true {
  if (!WORKSPACE_UX_VIEWPORTS.some((viewport) => viewport.name === viewportName)) {
    throw new Error(`Unknown visual viewport: ${viewportName}`);
  }
  return true;
}
