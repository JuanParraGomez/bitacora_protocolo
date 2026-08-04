import { describe, expect, it } from 'vitest';
import {
  DYNAMIC_MASK_SELECTORS,
  VISUAL_CAPTURE_OPTIONS,
  artifactPath,
  buildScreenshotOptions,
} from './visual-capture';

describe('visual capture configuration', () => {
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
});
