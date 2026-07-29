import { expect, test } from '@playwright/test';

const INDEX_KEY = 'bitacora:index';
const PROJECTS_KEY = 'bitacora:projects';

async function seedWorkspace(page: import('@playwright/test').Page) {
  const task = {
    id: 'overlay-task',
    projectId: 'project-overlay',
    nombre: 'Workspace overlays',
    directiva: 'Mantener el shell visible',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: {
      linaje: [{ origen: 'Brief', resultado: 'Resultado' }],
      checkMapeo: true,
      confirmacion: true,
      analisisProblema: {
        problemaDetectado: 'Problema',
        evidencia: 'Evidencia',
        analisis: 'Analisis',
        decision: 'mantener',
        justificacion: 'Justificado',
        problemaVigente: 'Problema vigente',
      },
      resultadoDeseado: 'Resultado deseado',
      alcance: 'Alcance',
      restricciones: 'Restricciones',
      actores: ['Equipo'],
      criterioExito: 'Criterio',
    },
  };

  await page.request.post('/api/storage/batch', {
    data: {
      operations: [
        {
          type: 'set',
          key: `bitacora:t:${task.id}`,
          value: JSON.stringify(task),
        },
        {
          type: 'set',
          key: INDEX_KEY,
          value: JSON.stringify({
            tareas: [{
              id: task.id,
              projectId: task.projectId,
              nombre: task.nombre,
              fase: task.fase,
              estado: task.estado,
              tipo: task.tipo,
            }],
            registros: [{
              id: 'record-1',
              titulo: 'Registro 1',
              tareaId: task.id,
              taskId: task.id,
              projectId: task.projectId,
            }],
          }),
        },
        {
          type: 'set',
          key: PROJECTS_KEY,
          value: JSON.stringify({
            schemaVersion: 1,
            activeProjectId: task.projectId,
            projects: [{
              id: task.projectId,
              name: 'Proyecto overlay',
              description: '',
              status: 'active',
              lastActiveTaskId: task.id,
              createdAt: 1,
              updatedAt: 1,
            }],
          }),
        },
        {
          type: 'set',
          key: 'bitacora:r:record-1',
          value: JSON.stringify({
            id: 'record-1',
            titulo: 'Registro 1',
            markdown: '# Registro 1',
            taskId: task.id,
          }),
        },
      ],
    },
  });
}

test.describe('workspace overlays', () => {
  test('opens new task as a modal, validates alternatives and protects dirty close', async ({ page }) => {
    await seedWorkspace(page);
    await page.goto('/tasks/overlay-task');

    await page.getByRole('navigation', { name: 'Navegación de tareas' })
      .getByRole('button', { name: 'Nueva tarea', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(dialog.getByRole('alert')).toContainText(/nombre o describe/i);

    await dialog.getByLabel('Directiva').fill('Resolver el problema inicial');
    page.once('dialog', (dialog) => dialog.dismiss());
    await dialog.getByRole('button', { name: /cerrar nueva tarea/i }).click();
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre').fill('Nueva tarea desde overlay');
    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(page).toHaveURL(/\/tasks\//);
  });

  test('submits the intake form with Enter from the name field', async ({ page }) => {
    await seedWorkspace(page);
    await page.goto('/tasks/overlay-task');

    await page.getByRole('navigation', { name: 'Navegación de tareas' })
      .getByRole('button', { name: 'Nueva tarea', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre').fill('Nueva tarea con Enter');
    await dialog.getByLabel('Directiva').fill('Verificar envío por teclado');
    await dialog.getByLabel('Nombre').press('Enter');

    await expect(page).toHaveURL(/\/tasks\//);
    await expect(page.getByRole('heading', { name: 'Nueva tarea con Enter' })).toBeVisible();
  });

  test('opens library as desktop modeless and mobile full-width overlay with deep links', async ({ page }) => {
    await seedWorkspace(page);
    await page.goto('/tasks/overlay-task?overlay=library&record=record-1');
    const libraryPanel = page.locator('.library-slideover__panel');
    await expect(libraryPanel).toBeVisible();
    await expect(libraryPanel).toContainText('Biblioteca');
    await expect(page.getByRole('heading', { name: 'Workspace overlays', level: 1 })).toBeVisible();

    await page.goBack();
    await page.goForward();
    await expect(libraryPanel).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tasks/overlay-task?overlay=library');
    await expect(page.locator('.library-slideover__panel')).toBeVisible();
  });

  test('keeps settings focus lifecycle and shows bounded nonmodal notices', async ({ page }) => {
    await seedWorkspace(page);
    await page.goto('/tasks/overlay-task?overlay=settings');
    const dialog = page.getByRole('dialog', { name: 'Ajustes de asistencia' });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await dialog.getByRole('button', { name: 'Cerrar ajustes' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByLabel('Escribe tu mensaje').fill('Problema confirmado para disparar guardado');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    const savedNotices = page.getByLabel('Avisos del workspace').getByText('Guardado');
    await expect(savedNotices.first()).toBeVisible();
    await expect(savedNotices).toHaveCount(1);
  });

  test('opens and closes new-task modal at 390x844 without clipping and returns focus', async ({ page }) => {
    await seedWorkspace(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/tasks/overlay-task');

    const navigationToggle = page.getByRole('button', { name: 'Abrir navegación' });
    await navigationToggle.click();
    const openButton = page.getByRole('dialog', { name: 'Navegación del workspace' })
      .getByRole('button', { name: 'Nueva tarea', exact: true });
    await openButton.click();

    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    const dialogContainer = page.locator('.new-task-modal');
    const dialogContent = page.locator('.new-task-modal__dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /cerrar nueva tarea/i })).toBeFocused();

    await expect(dialogContent).toBeVisible();
    const hasClipping = await dialogContent.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(hasClipping).toBe(false);

    const bounds = await dialogContainer.boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds) {
      expect(bounds.width).toBeLessThanOrEqual(390);
      expect(bounds.height).toBeGreaterThan(0);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(navigationToggle).toBeFocused();
  });

  test('preserves landmarks, keyboard order, modeless library and live regions across overlay states', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Reduced-motion emulation is validated on Chromium.');

    await seedWorkspace(page);
    await page.goto('/tasks/overlay-task');

    await expect(page.getByRole('navigation', { name: 'Navegación de tareas' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Contexto del workspace' })).toBeVisible();

    const before = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      return active?.getAttribute('aria-label') ?? active?.textContent ?? '';
    });
    expect(before).not.toContain('Biblioteca');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('navigation', { name: 'Navegación de tareas' })
      .getByRole('button', { name: 'Biblioteca', exact: true })
      .click();
    const library = page.getByRole('dialog', { name: 'Biblioteca' });
    await expect(library).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Workspace overlays', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Avisos del workspace')).toHaveCount(0);

    await page.getByRole('navigation', { name: 'Navegación de tareas' })
      .getByRole('navigation', { name: 'Navegación secundaria' })
      .getByRole('button', { name: 'Ajustes', exact: true })
      .click();
    const settings = page.getByRole('dialog', { name: 'Ajustes de asistencia' });
    await expect(settings).toBeVisible();
    await settings.getByRole('button', { name: 'Cerrar ajustes' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(settings.getByRole('button', { name: 'Guardar ajustes' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(settings).toHaveCount(0);
  });

  test('expone Biblioteca y Ajustes de forma consistente desde el home cuando no hay tarea activa', async ({ page }) => {
    await page.request.post('/api/storage/batch', {
      data: {
        operations: [
          {
            type: 'set',
            key: INDEX_KEY,
            value: JSON.stringify({
              tareas: [],
              registros: [],
            }),
          },
          {
            type: 'set',
            key: PROJECTS_KEY,
            value: JSON.stringify({
              schemaVersion: 1,
              activeProjectId: 'project-home',
              projects: [{
                id: 'project-home',
                name: 'Proyecto home',
                description: '',
                status: 'active',
                lastActiveTaskId: null,
                createdAt: 1,
                updatedAt: 1,
              }],
            }),
          },
        ],
      },
    });
    await page.addInitScript(() => {
      window.localStorage.removeItem('bitacora:workspace-view-state');
    });

    await page.goto('/');

    const sidebar = page.getByRole('navigation', { name: 'Navegación de tareas' });
    await expect(sidebar.getByRole('link', { name: 'Biblioteca', exact: true })).toBeVisible();
    await sidebar.getByRole('link', { name: 'Biblioteca', exact: true }).click();
    await expect(page).toHaveURL('/library');

    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(sidebar.getByRole('navigation', { name: 'Navegación secundaria' })
      .getByRole('button', { name: 'Ajustes', exact: true })).toBeDisabled();
  });
});
