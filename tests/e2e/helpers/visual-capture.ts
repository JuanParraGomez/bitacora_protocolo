import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { assertCanonicalViewport, resolveVisualScenario } from './visual-scenarios';

export const DYNAMIC_MASK_SELECTORS = [
  '[data-testid="current-time"]',
  '[data-testid="current-date"]',
  '[data-testid="avatar"]',
  '[data-testid="record-id"]',
];

export const VISUAL_CAPTURE_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.01,
  mask: DYNAMIC_MASK_SELECTORS,
};

export async function waitForStableUi(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
}

export function buildScreenshotOptions(): typeof VISUAL_CAPTURE_OPTIONS;
export function buildScreenshotOptions(page: Page): typeof VISUAL_CAPTURE_OPTIONS & { mask: Locator[] };
export function buildScreenshotOptions(page?: Page) {
  return {
    ...VISUAL_CAPTURE_OPTIONS,
    mask: page ? DYNAMIC_MASK_SELECTORS.map((selector) => page.locator(selector)) : [...DYNAMIC_MASK_SELECTORS],
  };
}

export async function captureVisualScreenshot(page: Page, id: string, viewportName: string): Promise<void> {
  const scenario = resolveVisualScenario(id);
  assertCanonicalViewport(viewportName);
  await expect(page).toHaveScreenshot(`${scenario.id}-${viewportName}.png`, buildScreenshotOptions(page));
  await page.screenshot({ path: artifactPath(id, viewportName) });
}

export function artifactPath(id: string, viewportName: string): string {
  const scenario = resolveVisualScenario(id);
  assertCanonicalViewport(viewportName);
  return `specs/010-visual-testing-infra/evidence/actual/ACTUAL-${scenario.id}-${viewportName}.png`;
}
