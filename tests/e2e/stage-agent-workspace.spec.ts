import { expect, test } from '@playwright/test';
import { WORKSPACE_UX_VIEWPORTS } from './helpers/workspace-ux';
import { stageAgentWorkspaceTasks, stageAgentWorkspaceRecords, stageAgentWorkspaceWorkspaceState } from '../fixtures/tasks/stage-agent-workspace';

const INDEX_KEY = 'bitacora:index';
const SETTINGS_KEY = 'bitacora:assistant-settings';

type TaskSeed = {
  id: string;
  nombre: string;
  fase: number;
  estado: string;
  tipo: string;
  projectId: string;
};

const defaultTasks: TaskSeed[] = [
  stageAgentWorkspaceTasks.phase1,
  stageAgentWorkspaceTasks.phase2,
  stageAgentWorkspaceTasks.phase3,
  stageAgentWorkspaceTasks.phase4,
];

function buildActivePhaseFourTask(): TaskSeed {
  return {
    ...structuredClone(stageAgentWorkspaceTasks.phase4),
    estado: 'activa',
  };
}

async function seedTask(page: import('@playwright/test').Page, task: TaskSeed) {
  await page.request.put(`/api/storage/${encodeURIComponent(`bitacora:t:${task.id}`)}`, {
    data: { value: JSON.stringify(task) },
  });
}

async function seedIndex(page: import('@playwright/test').Page, tasks: TaskSeed[] = defaultTasks) {
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

async function seedCompletedIndexWithoutTask(page: import('@playwright/test').Page) {
  await page.request.put(`/api/storage/${encodeURIComponent(INDEX_KEY)}`, {
    data: {
      value: JSON.stringify({
        tareas: [
          stageAgentWorkspaceTasks.phase1,
          stageAgentWorkspaceTasks.phase2,
          stageAgentWorkspaceTasks.phase3,
        ].map((task) => ({
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

async function seedWorkspace(page: import('@playwright/test').Page, task: TaskSeed = stageAgentWorkspaceTasks.phase3, tasks: TaskSeed[] = defaultTasks) {
  await seedTask(page, task);
  await seedIndex(page, tasks);
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
      if (viewport.width < 768) {
        await expect(page.getByRole('tablist', { name: 'Planos del workspace' })).toBeVisible();
      } else {
        await expect(page.getByRole('region', { name: 'Panel del agente' })).toBeVisible();
        await expect(page.locator('.agent-panel')).toHaveAttribute('data-agent-state', 'collapsed');
        await expect(page.getByRole('button', { name: 'Expandir agente IA' })).toHaveAttribute('aria-expanded', 'false');
      }
      await expect(page.getByRole('button', { name: 'Guardar borrador' })).toBeVisible();
      await expect(page.getByText('Problema detectado')).toBeVisible();
      await expect(page.getByText('Contexto y confirmación')).toBeVisible();

      if (viewport.width <= 390) {
        const footer = page.locator('[data-stage-footer]');
        const saveButton = page.getByRole('button', { name: 'Guardar borrador' });
        const primary = page.locator('[data-primary-action="true"]');
        const footerBox = await footer.boundingBox();
        const saveBox = await saveButton.boundingBox();
        const primaryBox = await primary.boundingBox();
        expect(footerBox).not.toBeNull();
        expect(saveBox).not.toBeNull();
        expect(primaryBox).not.toBeNull();
        if (footerBox && saveBox && primaryBox) {
          expect(Math.abs((saveBox.x + saveBox.width / 2) - (footerBox.x + footerBox.width / 2))).toBeLessThan(3);
          expect(primaryBox.width).toBeGreaterThanOrEqual(footerBox.width - 32);
        }
      }

      const overflow = await page.locator('body').evaluate((element) => (
        element.scrollWidth > element.clientWidth
      ));
      expect(overflow, `${viewport.name} should not overflow horizontally`).toBe(false);
    }
  });

  test('keeps the capture controls for phases 2 to 4 available with manual save wording', async ({ page }) => {
    const activePhaseFour = buildActivePhaseFourTask();
    const tasks = [
      stageAgentWorkspaceTasks.phase2,
      stageAgentWorkspaceTasks.phase3,
      activePhaseFour,
    ];
    const indexedTasks = [
      stageAgentWorkspaceTasks.phase1,
      stageAgentWorkspaceTasks.phase2,
      stageAgentWorkspaceTasks.phase3,
      activePhaseFour,
    ];

    for (const task of tasks) {
      await seedWorkspace(page, task, indexedTasks);
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

  test('opens the agent as a structural region on desktop and tablet, and switches panes on mobile without duplicating navigation', async ({ page }) => {
    await seedWorkspace(page, stageAgentWorkspaceTasks.phase3);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/tasks/${stageAgentWorkspaceTasks.phase3.id}`);

    await page.getByRole('button', { name: 'Expandir agente IA' }).click();
    await expect(page.getByRole('region', { name: 'Panel del agente' })).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByLabel('Chat de asistencia')).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByRole('region', { name: 'Panel del agente' })).toBeVisible();
    await expect(page.getByLabel('Chat de asistencia')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('tablist', { name: 'Planos del workspace' })).toBeVisible();
    await page.getByRole('tab', { name: 'Agente' }).click();
    await expect(page.getByLabel('Chat de asistencia')).toBeVisible();
    await page.getByRole('tab', { name: 'Etapa' }).click();
    await expect(page.getByRole('region', { name: 'Formulario guiado' })).toBeVisible();

    await expect(page.getByRole('navigation', { name: 'Navegación de tareas' })).toHaveCount(0);
  });

  test('persists agent rail preference per task and keeps pending badge task-local', async ({ page }) => {
    const first = structuredClone(stageAgentWorkspaceTasks.phase1);
    const second = structuredClone(stageAgentWorkspaceTasks.phase2);
    await seedWorkspace(page, first, [first, second]);
    await seedTask(page, second);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/tasks/${first.id}`);
    await page.getByRole('button', { name: 'Expandir agente IA' }).click();
    await expect(page.locator('.agent-panel')).toHaveAttribute('data-agent-state', 'expanded');
    await page.reload();
    await expect(page.locator('.agent-panel')).toHaveAttribute('data-agent-state', 'expanded');
    await page.goto(`/tasks/${second.id}`);
    await expect(page.locator('.agent-panel')).toHaveAttribute('data-agent-state', 'collapsed');
  });

  test('shows a single contextual primary action and removes the external advance bar', async ({ page }) => {
    await seedWorkspace(page, stageAgentWorkspaceTasks.phase2);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/tasks/${stageAgentWorkspaceTasks.phase2.id}`);

    await expect(page.locator('.task-page__status')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Avanzar' })).toHaveCount(0);

    const primaryActions = page.locator('[data-primary-action="true"]');
    await expect(primaryActions).toHaveCount(1);
    await expect(primaryActions.first()).toHaveText('Evaluar etapa');
    await expect(page.getByRole('button', { name: 'Guardar borrador' })).toBeVisible();
  });

  test('uses one manual dirty-to-save flow for all four phases without autosave', async ({ page }) => {
    for (const sourceTask of defaultTasks) {
      const task = sourceTask.fase === 4 ? buildActivePhaseFourTask() : sourceTask;
      const indexedTasks = defaultTasks.map((candidate) => candidate.fase === 4 ? task : candidate);
      await seedWorkspace(page, task, indexedTasks);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/tasks/${task.id}`);
      const stageTab = page.getByRole('tab', { name: 'Etapa' });
      if (await stageTab.count()) await stageTab.click();
      let storageWrites = 0;
      page.on('request', (request) => {
        if (['PUT', 'POST', 'DELETE'].includes(request.method()) && request.url().includes('/api/storage')) storageWrites += 1;
      });

      const field = page.getByRole('region', { name: 'Formulario guiado' }).locator('textarea, input:not([type="checkbox"])').first();
      await field.fill(`${await field.inputValue()} edición manual`);
      await expect(page.locator('body')).toContainText('Cambios sin guardar');
      await page.waitForTimeout(100);
      expect(storageWrites, `phase ${task.fase} must not autosave`).toBe(0);

      await page.getByRole('button', { name: 'Guardar borrador' }).click();
      await expect(page.locator('body')).toContainText('Borrador guardado');
      await expect(page.locator('body')).not.toContainText('Cambios sin guardar');
      await page.reload();
    }
  });

  test('shows the completed summary, survives reload without duplicate records, and returns to tasks', async ({ page }) => {
    await seedTask(page, stageAgentWorkspaceTasks.phase4);
    await seedCompletedIndexWithoutTask(page);
    await seedWorkspaceState(page);
    await seedSettings(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/tasks/${stageAgentWorkspaceTasks.phase4.id}`);

    await expect(page.getByRole('region', { name: 'Resumen completado' })).toBeVisible();
    await expect(page.getByTestId('completion-progress')).toContainText('4/4');
    await expect(page.locator('[data-primary-action="true"]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Volver a tareas' })).toHaveCount(1);
    await expect(page.locator('body')).toContainText('El resumen final queda en solo lectura.');
    await expect(page.locator('body')).toContainText('El resumen final depende de datos persistidos');
    await expect(page.getByTestId('completion-record')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Biblioteca' })).toHaveCount(1);

    const indexBefore = await page.request.get(`/api/storage/${encodeURIComponent(INDEX_KEY)}`);
    const beforeValue = (await indexBefore.json()).value;
    let storageWrites = 0;
    page.on('request', (request) => {
      const method = request.method();
      if (['PUT', 'POST', 'DELETE'].includes(method) && request.url().includes('/api/storage')) {
        storageWrites += 1;
      }
    });

    await page.reload();
    await expect(page.getByRole('region', { name: 'Resumen completado' })).toBeVisible();
    await expect(page.getByTestId('completion-record')).toHaveCount(3);

    const indexAfter = await page.request.get(`/api/storage/${encodeURIComponent(INDEX_KEY)}`);
    const afterValue = (await indexAfter.json()).value;
    expect(afterValue).toBe(beforeValue);
    expect(storageWrites).toBe(0);

    await page.getByRole('button', { name: 'Volver a tareas' }).click();
    await expect(page).toHaveURL(new RegExp(`/tasks/${stageAgentWorkspaceTasks.phase1.id}$`));
  });
});
