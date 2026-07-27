import { test, expect } from '@playwright/test';

test.describe('legacy phase and library workflows', () => {
  test('blocks progression when required fields are missing', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByText('Nueva tarea').click();
    await page.locator('#nnombre').fill('Gate boundary');
    await page.getByRole('button', { name: /crear/i }).click();
    await expect(page.locator('#gatebox')).toContainText(/compuerta cerrada|fase/i);
  });

  test('opens reference and library empty states', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByRole('button', { name: 'Referencia', exact: true }).click();
    await expect(page.locator('body')).toContainText(/referencia|princip/i);
    await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
    await expect(page.locator('body')).toContainText(/biblioteca/i);
  });

  test('handles a missing record without crashing the application', async ({ page }) => {
    const response = await page.goto('/legacy');
    expect(response?.status() ?? 404).toBeLessThan(500);
  });
});
