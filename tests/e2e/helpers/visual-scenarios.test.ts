import { describe, expect, it } from 'vitest';
import {
  VISUAL_SCENARIOS,
  assertCanonicalAssetPath,
  resolveVisualScenario,
} from './visual-scenarios';

describe('visual scenario catalog', () => {
  it('contains the six stable manifest scenarios with canonical assets', () => {
    expect(VISUAL_SCENARIOS).toHaveLength(6);
    expect(VISUAL_SCENARIOS.map((scenario) => scenario.id)).toEqual([
      'IMG-UX-01', 'IMG-UX-02', 'IMG-UX-03', 'IMG-UX-04', 'IMG-UX-05', 'IMG-UX-06',
    ]);
    expect(VISUAL_SCENARIOS.every((scenario) => scenario.assetPath.startsWith('docs/ux-ui/mockups/rediseño-agente/'))).toBe(true);
  });

  it('resolves a known scenario and rejects unknown identifiers', () => {
    expect(resolveVisualScenario('IMG-UX-03').assetPath).toContain('img-ux-03-tablet-agente-activo-v2.png');
    expect(() => resolveVisualScenario('IMG-UX-99')).toThrow(/unknown visual scenario/i);
  });

  it('rejects globs and paths outside the canonical mockup directory', () => {
    expect(() => assertCanonicalAssetPath('docs/ux-ui/mockups/rediseño-agente/*.png')).toThrow(/glob/i);
    expect(() => assertCanonicalAssetPath('tests/e2e/visual/actual.png')).toThrow(/canonical/i);
    expect(assertCanonicalAssetPath('docs/ux-ui/mockups/rediseño-agente/img-ux-01-desktop-etapa.png')).toBe(true);
  });
});
