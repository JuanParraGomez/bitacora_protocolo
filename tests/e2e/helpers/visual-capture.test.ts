import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DYNAMIC_MASK_SELECTORS,
  VISUAL_CAPTURE_OPTIONS,
  artifactPath,
  buildScreenshotOptions,
  getVisualRunMode,
  shouldCompareBaseline,
  shouldCaptureEvidenceScreenshot,
  buildEvidenceScreenshotOptions,
} from './visual-capture';

describe('visual capture configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it('uses deterministic animation and one-percent diff settings', () => {
    expect(VISUAL_CAPTURE_OPTIONS).toMatchObject({ animations: 'disabled', maxDiffPixelRatio: 0.01 });
    expect(DYNAMIC_MASK_SELECTORS).toEqual(expect.arrayContaining([
      expect.stringMatching(/time|date|avatar|id/i),
    ]));
  });

  it('builds a screenshot config with the required masks', () => {
    expect(buildScreenshotOptions()).toMatchObject({
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
      mask: DYNAMIC_MASK_SELECTORS,
    });
  });

  it('builds a safe scenario artifact path and rejects invalid ids', () => {
    expect(artifactPath('IMG-UX-04', 'mobile-narrow')).toMatch(/ACTUAL-IMG-UX-04-mobile-narrow\.png$/);
    expect(() => artifactPath('IMG-UX-99', 'desktop-large')).toThrow(/scenario/i);
    expect(() => artifactPath('IMG-UX-04', '../outside')).toThrow(/viewport/i);
  });

  it('supports an explicit evidence root and ref/viewport allow-list', async () => {
    vi.stubEnv('VISUAL_EVIDENCE_ROOT', 'specs/012-stage-canvas-form/evidence/actual');
    vi.stubEnv('VISUAL_EVIDENCE_CASES', 'IMG-UX-01:desktop-large,IMG-UX-04:mobile');

    const { shouldCaptureEvidence } = await import('./visual-capture');
    expect(artifactPath('IMG-UX-01', 'desktop-large')).toBe(
      'specs/012-stage-canvas-form/evidence/actual/ACTUAL-IMG-UX-01-desktop-large.png',
    );
    expect(shouldCaptureEvidence('IMG-UX-01', 'desktop-large')).toBe(true);
    expect(shouldCaptureEvidence('IMG-UX-01', 'tablet')).toBe(false);
    expect(shouldCaptureEvidence('IMG-UX-04', 'mobile')).toBe(true);
  });

  it('resolves baseline, contract and evidence modes without updating snapshots', () => {
    vi.stubEnv('VISUAL_RUN_MODE', 'contract');
    expect(getVisualRunMode()).toBe('contract');
    expect(shouldCompareBaseline()).toBe(false);
    expect(shouldCaptureEvidenceScreenshot()).toBe(false);

    vi.stubEnv('VISUAL_RUN_MODE', 'evidence');
    expect(getVisualRunMode()).toBe('evidence');
    expect(shouldCompareBaseline()).toBe(false);
    expect(shouldCaptureEvidenceScreenshot()).toBe(true);

    vi.stubEnv('VISUAL_RUN_MODE', 'baseline');
    expect(getVisualRunMode()).toBe('baseline');
    expect(shouldCompareBaseline()).toBe(true);
    expect(shouldCaptureEvidenceScreenshot()).toBe(false);
  });

  it('uses the 013 evidence root and omits baseline diff options in evidence mode', () => {
    vi.stubEnv('VISUAL_RUN_MODE', 'evidence');
    vi.stubEnv('VISUAL_EVIDENCE_ROOT', 'specs/013-agent-rail-chat/evidence/actual');
    expect(artifactPath('IMG-UX-02', 'tablet')).toBe(
      'specs/013-agent-rail-chat/evidence/actual/ACTUAL-IMG-UX-02-tablet.png',
    );
    expect(buildEvidenceScreenshotOptions()).toMatchObject({ animations: 'disabled' });
    expect(buildEvidenceScreenshotOptions()).not.toHaveProperty('maxDiffPixelRatio');
  });
});
