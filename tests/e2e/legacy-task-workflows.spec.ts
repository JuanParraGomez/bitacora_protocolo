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
  });

  test('marks raw directive as optional and allows creating with only a name', async ({ page }) => {
    const name = `Tarea heredada ${Date.now()}`;
    await page.goto('/legacy');
    await page.getByText('Nueva tarea').click();

    const directivaLabel = page.locator('label').filter({ hasText: 'Directiva cruda' });
    await expect(directivaLabel).toContainText(/opcional/i);

    await page.locator('#nnombre').fill(name);
    await page.getByRole('button', { name: /crear/i }).click();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.locator('body')).toContainText(/fase 1/i);
    await page.reload();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  });

  test('rejects empty task name without changing storage', async ({ page }) => {
    await page.goto('/legacy');
    const beforeIndex = await page.evaluate(async () => {
      const raw = await window.storage.get('bitacora:index');
      return JSON.parse(raw.value);
    });

    await page.getByText('Nueva tarea').click();
    await page.getByRole('button', { name: /crear/i }).click();

    await expect(page.getByText('Ponle nombre a la tarea.')).toBeVisible();
    await expect(page.locator('#nnombre')).toBeFocused();
    await expect(page).toHaveURL(/\/legacy$/);

    const afterIndex = await page.evaluate(async () => {
      const raw = await window.storage.get('bitacora:index');
      return JSON.parse(raw.value);
    });
    expect(afterIndex).toEqual(beforeIndex);
  });

  test('does not accumulate blank legacy rows and allows removing the extra row', async ({ page }) => {
    const name = `Fila heredada ${Date.now()}`;
    await page.goto('/legacy');
    await page.getByText('Nueva tarea').click();
    await page.locator('#nnombre').fill(name);
    await page.getByRole('button', { name: /crear/i }).click();

    const rowset = page.locator('.rowset');
    const rows = rowset.locator('.rw');
    const addRowButton = page.getByRole('button', { name: /\+ agregar elemento/i });
    const firstRowField = page.locator('[data-p="f1.linaje.0.variable"]');
    const secondRowDelete = page.locator('.rw .del').nth(1);

    await expect(rows).toHaveCount(1);

    await addRowButton.click();
    await expect(rows).toHaveCount(1);

    await firstRowField.fill('Indicador principal');
    await addRowButton.click();
    await expect(rows).toHaveCount(2);

    await secondRowDelete.click();
    await expect(rows).toHaveCount(1);

    await page.locator('.rw .del').first().click();
    await expect(rows).toHaveCount(0);

    await addRowButton.click();
    await expect(rows).toHaveCount(1);

    await page.reload();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await page.getByText(name, { exact: true }).click();
    await expect(rows).toHaveCount(1);
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
