import { expect, test } from '@playwright/test';
import { buildPhaseRevision } from '../../app/features/tasks/domain/task-assistant-rules';
import { repairTask } from '../../app/features/tasks/domain/task.schema';
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

function taskWithProposalConversation(suffix = '') {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase2));
  if (suffix) task.id = `${task.id}-${suffix}`;
  const revision = buildPhaseRevision(task, task.fase);
  task.assistant.messages = [{
    id: 'e2e-proposal-message',
    projectId: task.projectId,
    taskId: task.id,
    phase: task.fase,
    methodVersionId: null,
    baseRevision: revision,
    role: 'assistant',
    parts: [{ type: 'text', text: 'Revisa estas propuestas antes de continuar.' }],
    status: 'sent',
    createdAt: 1_725_000_100_000,
    primaryQuestion: null,
    contradictions: [],
    updates: [
      {
        id: 'e2e-proposal-accept', sourceMessageId: 'e2e-proposal-message', projectId: task.projectId,
        taskId: task.id, phase: task.fase, methodVersionId: null, baseRevision: revision,
        status: 'proposed', field: 'f2.pasos', previousValue: task.f2.pasos, value: 'Pasos aceptados desde el chat',
      },
      {
        id: 'e2e-proposal-edit', sourceMessageId: 'e2e-proposal-message', projectId: task.projectId,
        taskId: task.id, phase: task.fase, methodVersionId: null, baseRevision: revision,
        status: 'proposed', field: 'f2.criterios', previousValue: task.f2.criterios, value: [],
      },
      {
        id: 'e2e-proposal-reject', sourceMessageId: 'e2e-proposal-message', projectId: task.projectId,
        taskId: task.id, phase: task.fase, methodVersionId: null, baseRevision: revision,
        status: 'proposed', field: 'f2.alcance', previousValue: task.f2.alcance, value: 'Este alcance debe permanecer sin cambios',
      },
    ],
  }];
  return task;
}

function taskWithLongIndependentScroll() {
  const task = repairTask(structuredClone(stageAgentWorkspaceTasks.phase2));
  const revision = buildPhaseRevision(task, task.fase);
  const longText = 'Contenido largo para medir el scroll independiente del lienzo. '.repeat(80);
  task.f2.pasos = longText;
  task.f2.noObjetivos = longText;
  task.assistant.messages = Array.from({ length: 18 }, (_, index) => ({
    id: `e2e-long-message-${index}`,
    projectId: task.projectId,
    taskId: task.id,
    phase: task.fase,
    methodVersionId: null,
    baseRevision: revision,
    role: index % 2 === 0 ? 'assistant' as const : 'user' as const,
    parts: [{ type: 'text' as const, text: `Mensaje largo ${index}: ${longText}` }],
    status: 'sent' as const,
    createdAt: 1_725_000_200_000 + index,
    primaryQuestion: null,
    contradictions: [],
    updates: [],
  }));
  return task;
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
    await expect(page.getByRole('button', { name: 'Abrir navegación' })).toBeVisible();
    await expect(page.getByLabel('Más opciones del workspace')).toBeVisible();
    await expect(page.locator('.workspace-navigation-drawer')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('tablist', { name: 'Planos del workspace' })).toBeVisible();
    await page.getByRole('tab', { name: 'Agente' }).click();
    await expect(page.getByLabel('Chat de asistencia')).toBeVisible();
    await page.getByRole('tab', { name: 'Etapa' }).click();
    await expect(page.getByRole('region', { name: 'Formulario guiado' })).toBeVisible();

    await expect(page.getByRole('navigation', { name: 'Navegación de tareas' })).toHaveCount(0);
  });

  test('keeps mobile stage and agent drafts, focus and pane preference task-local', async ({ page }) => {
    const task = taskWithProposalConversation('responsive-mobile');
    const secondTask = structuredClone(stageAgentWorkspaceTasks.phase1);
    secondTask.id = 'responsive-mobile-second';
    secondTask.nombre = 'Segunda tarea responsive';
    await seedWorkspace(page, task, [task, secondTask]);
    await seedTask(page, secondTask);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/tasks/${task.id}`);

    await expect(page.locator('[data-mobile-context]')).toHaveText('Etapa 2 de 4 · Preguntas de orientación');
    const stageTab = page.getByRole('tab', { name: 'Etapa' });
    const agentTab = page.getByRole('tab', { name: /Agente/ });
    await expect(agentTab.locator('[data-agent-pending]')).toHaveCount(1);

    const stageField = page.getByRole('region', { name: 'Formulario guiado' }).locator('textarea').first();
    await stageField.fill('borrador de etapa sin guardar');
    await agentTab.click();
    await expect(agentTab).toBeFocused();
    const composer = page.getByPlaceholder('Escribe al agente…');
    await composer.fill('borrador móvil del agente');
    await stageTab.click();
    await expect(stageTab).toBeFocused();
    await expect(stageField).toHaveValue('borrador de etapa sin guardar');
    await agentTab.click();
    await expect(composer).toHaveValue('borrador móvil del agente');

    await page.goto(`/tasks/${secondTask.id}`);
    await expect(page.getByRole('tab', { name: 'Etapa' })).toHaveAttribute('aria-selected', 'true');
    await page.goto(`/tasks/${task.id}`);
    await expect(page.getByRole('tab', { name: /Agente/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByPlaceholder('Escribe al agente…')).toHaveValue('borrador móvil del agente');
    await page.goto(`/tasks/${secondTask.id}`);
    await expect(page.getByRole('tab', { name: 'Etapa' })).toHaveAttribute('aria-selected', 'true');
    await page.goto(`/tasks/${task.id}`);

    await page.reload();
    await expect(agentTab).toHaveAttribute('aria-selected', 'true');
    await expect(composer).toHaveValue('borrador móvil del agente');
    await expect(page.locator('[data-primary-action="true"]:visible')).toHaveCount(0);
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

  test('resolves accept, valid edit, invalid edit and reject proposals through the chat contract', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const editTask = taskWithProposalConversation('edit');
    await seedWorkspace(page, editTask, [editTask]);
    await page.goto(`/tasks/${editTask.id}`);
    await expect(page.locator('[data-agent-pending-badge]')).toHaveText('3');
    await page.getByRole('button', { name: 'Expandir agente IA' }).click();
    const criteriaProposal = page.getByRole('group', { name: 'Propuesta para Criterios' });
    await criteriaProposal.locator('input').fill('{invalid-json');
    await criteriaProposal.getByRole('button', { name: 'Editar propuesta' }).click();
    await expect(criteriaProposal.getByRole('alert')).toBeVisible();
    await expect(criteriaProposal).toContainText('Propuesta');
    await criteriaProposal.locator('input').fill('[]');
    await criteriaProposal.getByRole('button', { name: 'Editar propuesta' }).click();
    await expect(criteriaProposal).toContainText('Aplicado');

    const acceptTask = taskWithProposalConversation('accept');
    await seedWorkspace(page, acceptTask, [acceptTask]);
    await page.goto(`/tasks/${acceptTask.id}`);
    await page.getByRole('button', { name: 'Expandir agente IA' }).click();
    const acceptProposal = page.getByRole('group', { name: 'Propuesta para Pasos' });
    await acceptProposal.getByRole('button', { name: 'Aceptar propuesta' }).click();
    await expect(acceptProposal).toContainText('Aplicado');
    await page.getByRole('button', { name: 'Contraer agente IA' }).click();
    await expect(page.locator('[data-agent-pending-badge]')).toHaveText('2');
    const acceptedTask = JSON.parse((await (await page.request.get(`/api/storage/${encodeURIComponent(`bitacora:t:${acceptTask.id}`)}`)).json()).value);
    expect(acceptedTask.f2.pasos).toBe('Pasos aceptados desde el chat');

    const rejectTask = taskWithProposalConversation('reject');
    await seedWorkspace(page, rejectTask, [rejectTask]);
    await page.goto(`/tasks/${rejectTask.id}`);
    await page.getByRole('button', { name: 'Expandir agente IA' }).click();
    const rejectProposal = page.getByRole('group', { name: 'Propuesta para Alcance' });
    await rejectProposal.getByRole('button', { name: 'Descartar propuesta' }).click();
    await expect(rejectProposal).toContainText('Rechazado');
    await page.getByRole('button', { name: 'Contraer agente IA' }).click();
    await expect(page.locator('[data-agent-pending-badge]')).toHaveText('2');
    const rejectedTask = JSON.parse((await (await page.request.get(`/api/storage/${encodeURIComponent(`bitacora:t:${rejectTask.id}`)}`)).json()).value);
    expect(rejectedTask.f2.alcance).toBe(rejectTask.f2.alcance);
  });

  test('keeps canvas and chat scrolling independently at tablet width', async ({ page }) => {
    const task = taskWithLongIndependentScroll();
    await seedWorkspace(page, task, [task]);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`/tasks/${task.id}`);
    await page.getByRole('button', { name: 'Expandir agente IA' }).click();

    const stage = page.locator('.workspace-stage');
    const messages = page.locator('.task-chat__messages');
    await expect.poll(() => stage.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await expect.poll(() => messages.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);

    const initialStageScroll = await stage.evaluate((element) => element.scrollTop);
    const initialChatScroll = await messages.evaluate((element) => element.scrollTop);
    await stage.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const stageAfterStageScroll = await stage.evaluate((element) => element.scrollTop);
    const chatAfterStageScroll = await messages.evaluate((element) => element.scrollTop);
    expect(stageAfterStageScroll).toBeGreaterThan(initialStageScroll);
    expect(chatAfterStageScroll).toBe(initialChatScroll);
    await messages.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const chatAfterChatScroll = await messages.evaluate((element) => element.scrollTop);
    const stageAfterChatScroll = await stage.evaluate((element) => element.scrollTop);
    expect(chatAfterChatScroll).toBeGreaterThan(chatAfterStageScroll);
    expect(stageAfterChatScroll).toBe(stageAfterStageScroll);
    await stage.evaluate((element) => { element.scrollTop = 0; });
    expect(await messages.evaluate((element) => element.scrollTop)).toBe(chatAfterChatScroll);
    await expect(page.getByPlaceholder('Escribe al agente…')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adjuntar' })).toBeDisabled();
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
