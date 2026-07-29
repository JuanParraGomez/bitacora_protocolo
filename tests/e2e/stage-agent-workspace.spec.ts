import { expect, test } from '@playwright/test';
import { WORKSPACE_UX_VIEWPORTS } from './helpers/workspace-ux';
import { stageAgentWorkspaceTasks, stageAgentWorkspaceRecords, stageAgentWorkspaceWorkspaceState } from '../fixtures/tasks/stage-agent-workspace';

const INDEX_KEY = 'bitacora:index';
const SETTINGS_KEY = 'bitacora:assistant-settings';

type TaskSeed = typeof stageAgentWorkspaceTasks.phase1;

async function seedTask(page: import('@playwright/test').Page, task: TaskSeed) {
  await page.request.put(`/api/storage/${encodeURIComponent(`bitacora:t:${task.id}`)}`, {
    data: { value: JSON.stringify(task) },
  });
}

async function seedIndex(page: import('@playwright/test').Page, tasks = [stageAgentWorkspaceTasks.phase1, stageAgentWorkspaceTasks.phase2, stageAgentWorkspaceTasks.phase3, stageAgentWorkspaceTasks.phase4]) {
  await page.request.put(`/api/storage/${encodeURIComponent(INDEX_KEY)}`, {
    data: {
      value: JSON.stringify({
        tareas: tasks.map((task) => ({
          id: task.id,
          nombre: task.nombre,
          fase: task.fase,
          estado: task.estado,
          tipo: task.tipo,
          projectId: task.projectId,
        })),
        registros: stageAgentWorkspaceRecords.completed,
      }),
    },
  });
}

async function seedWorkspaceState(page: import('@playwright/test').Page) {
  await page.request.put(`/api/storage/${encodeURIComponent(`bitacora:workspace-view-state`)}`, {
    data: { value: JSON.stringify(stageAgentWorkspaceWorkspaceState.dirtyDraft) },
  });
}

async function seedSettings(page: import('@playwright/test').Page) {
  await page.request.put(`/api/storage/${encodeURIComponent(SETTINGS_KEY)}`, {
    data: { value: JSON.stringify({ mode: 'codex', connectionStatus: 'deferred', schemaVersion: 1 }) },
  });
}

async function seedWorkspace(page: import('@playwright/test').Page, task = stageAgentWorkspaceTasks.phase3) {
  await seedTask(page, task);
  await seedIndex(page);
  await seedWorkspaceState(page);
  await seedSettings(page);
}

test.describe('stage-agent workspace', () => {
  test('keeps the stage as the main canvas across the contract viewports', async ({ page }) => {
    await seedWorkspace(page, stageAgentWorkspaceTasks.phase1);

    for (const viewport of WORKSPACE_UX_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/tasks/${stageAgentWorkspaceTasks.phase1.id}`);

      await expect(page.getByRole('region', { name: 'Formulario guiado' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Panel del agente' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Guardar borrador' })).toBeVisible();
      await expect(page.getByText('Problema detectado')).toBeVisible();
      await expect(page.getByText('Contexto y confirmación')).toBeVisible();

      const overflow = await page.locator('body').evaluate((element) => (
        element.scrollWidth > element.clientWidth
      ));
      expect(overflow, `${viewport.name} should not overflow horizontally`).toBe(false);
    }
  });

  test('keeps the capture controls for phases 2 to 4 available with manual save wording', async ({ page }) => {
    const tasks = [
      stageAgentWorkspaceTasks.phase2,
      stageAgentWorkspaceTasks.phase3,
      stageAgentWorkspaceTasks.phase4,
    ];

    for (const task of tasks) {
      await seedWorkspace(page, task);
      await page.setViewportSize({ width: 320, height: 667 });
      await page.goto(`/tasks/${task.id}`);
      await page.evaluate(() => {
        document.documentElement.style.zoom = '200%';
      });

      await expect(page.locator('body')).toContainText('Guardar borrador');

      if (task.fase === 2) {
        await expect(page.locator('body')).toContainText('Añadir criterio');
      }
      if (task.fase === 3) {
        await expect(page.locator('body')).toContainText('Añadir iteración');
      }
      if (task.fase === 4) {
        await expect(page.locator('body')).toContainText('Añadir confrontación');
      }

      const overflow = await page.locator('body').evaluate((element) => (
        element.scrollWidth > element.clientWidth
      ));
      expect(overflow).toBe(false);
    }
  });
});
