import { expect, type Locator } from '@playwright/test';

export type WorkspaceUxViewport = {
  name: string;
  width: number;
  height: number;
};

export const WORKSPACE_UX_VIEWPORTS: WorkspaceUxViewport[] = [
  { name: 'desktop-large', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-narrow', width: 320, height: 667 },
];

export const WORKSPACE_AUDIT_TARGETS = Array.from({ length: 17 }, (_, index) => `UX-${String(index + 1).padStart(3, '0')}`);

export function hasHorizontalOverflow(element: Element | null): boolean {
  if (!element) {
    return false;
  }
  return element.scrollWidth > element.clientWidth;
}

export async function expectTopHitTarget(locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const isTopTarget = async () => locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const target = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    return Boolean(target && (target === element || element.contains(target)));
  });

  if (!(await isTopTarget())) {
    await locator.scrollIntoViewIfNeeded();
  }

  expect(await isTopTarget()).toBe(true);
}
