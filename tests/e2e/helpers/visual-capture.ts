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

export type VisualRunMode = 'baseline' | 'contract' | 'evidence';

export function getVisualRunMode(): VisualRunMode {
  const mode = process.env.VISUAL_RUN_MODE?.trim();
  return mode === 'contract' || mode === 'evidence' ? mode : 'baseline';
}

export function shouldCompareBaseline(): boolean {
  return getVisualRunMode() === 'baseline';
}

export function shouldCaptureEvidenceScreenshot(): boolean {
  return getVisualRunMode() === 'evidence';
}

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

export function buildEvidenceScreenshotOptions(page?: Page) {
  return {
    animations: 'disabled' as const,
    mask: page ? DYNAMIC_MASK_SELECTORS.map((selector) => page.locator(selector)) : [...DYNAMIC_MASK_SELECTORS],
  };
}

export async function captureVisualScreenshot(page: Page, id: string, viewportName: string): Promise<void> {
  const scenario = resolveVisualScenario(id);
  assertCanonicalViewport(viewportName);
  if (shouldCompareBaseline()) {
    await expect(page).toHaveScreenshot(`${scenario.id}-${viewportName}.png`, buildScreenshotOptions(page));
  }
  if (shouldCaptureEvidenceScreenshot() && shouldCaptureEvidence(id, viewportName)) {
    await page.screenshot({ path: artifactPath(id, viewportName), ...buildEvidenceScreenshotOptions(page) });
  }
}

export function artifactPath(id: string, viewportName: string): string {
  const scenario = resolveVisualScenario(id);
  assertCanonicalViewport(viewportName);
  const root = process.env.VISUAL_EVIDENCE_ROOT?.trim() || 'specs/010-visual-testing-infra/evidence/actual';
  return `${root.replace(/\/$/, '')}/ACTUAL-${scenario.id}-${viewportName}.png`;
}

export function shouldCaptureEvidence(id: string, viewportName: string): boolean {
  resolveVisualScenario(id);
  assertCanonicalViewport(viewportName);
  const configured = process.env.VISUAL_EVIDENCE_CASES?.trim();
  if (!configured) return true;
  const allowed = configured.split(',').map((entry) => entry.trim()).filter(Boolean);
  return allowed.includes(`${id}:${viewportName}`);
}
