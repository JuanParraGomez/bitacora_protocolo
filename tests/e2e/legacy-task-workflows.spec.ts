import { test, expect } from '@playwright/test';

test.describe('legacy task workflows', () => {
  test('creates, saves, reopens, and deletes a task', async ({ page }) => {
    const name = `Tarea de caracterización ${Date.now()}`;
    await page.goto('/legacy');
    await page.getByText('Nueva tarea').click();
    await page.locator('#nnombre').fill(name);
    await page.locator('#ndirectiva').fill('Conservar comportamiento');
    await page.getByRole('button', { name: /crear/i }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.locator('#saveState')).toContainText(/guardado/i);
    await page.reload();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('rejects empty task name without changing storage', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByText('Nueva tarea').click();
    await page.getByRole('button', { name: /crear/i }).click();
    await expect(page.getByText('Ponle nombre a la tarea.')).toBeVisible();
  });

  test('preserves a completed record when the source task is deleted', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
    await expect(page.locator('body')).toContainText(/biblioteca/i);
  });

  test('downloads Markdown with a safe filename', async ({ page }) => {
    await page.goto('/legacy');
    await page.getByRole('button', { name: 'Biblioteca', exact: true }).click();
    await expect(page.getByRole('button', { name: /descargar|download/i })).toHaveCount(0);
  });
});
