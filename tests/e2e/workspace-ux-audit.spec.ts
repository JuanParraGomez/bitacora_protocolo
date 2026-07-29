import { expect, test } from '@playwright/test';
import { expectTopHitTarget } from './helpers/workspace-ux';
import { WORKSPACE_UX_VIEWPORTS } from './helpers/workspace-ux';

const INDEX_KEY = 'bitacora:index';
const PROJECTS_KEY = 'bitacora:projects';

interface SeedTask {
  id: string;
  nombre: string;
  directiva: string;
  projectId: string;
  fase?: number;
  estado?: string;
  tipo?: string;
}

interface SeedProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  lastActiveTaskId?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

interface SeedWorkspaceOptions {
  tasks?: SeedTask[];
  projects?: SeedProject[];
  activeProjectId?: string;
}

const MOBILE_VIEWPORT = WORKSPACE_UX_VIEWPORTS.find((entry) => entry.name === 'mobile') ?? {
  name: 'mobile',
  width: 390,
  height: 844,
};

const DESKTOP_VIEWPORT = WORKSPACE_UX_VIEWPORTS.find((entry) => entry.name === 'desktop-large') ?? {
  name: 'desktop-large',
  width: 1440,
  height: 900,
};

async function seedWorkspace(page: import('@playwright/test').Page, options: SeedWorkspaceOptions) {
  const tasks = options.tasks ?? [];
  const normalizedProjects: SeedProject[] = (() => {
    if (options.projects && options.projects.length > 0) {
      return options.projects.map((project, index) => ({
        description: '',
        status: project.status,
        lastActiveTaskId: project.lastActiveTaskId ?? null,
        createdAt: project.createdAt ?? 1000 + index,
        updatedAt: project.updatedAt ?? 1000 + index,
        ...project,
      }));
    }

    const distinctProjectIds = [...new Set(tasks.map((task) => task.projectId || 'legacy'))];
    return distinctProjectIds.map((projectId, index) => ({
      id: projectId,
      name: projectId === 'legacy' ? 'Proyecto legado' : `Proyecto ${projectId}`,
      description: '',
      status: 'active',
      lastActiveTaskId: tasks.find((task) => task.projectId === projectId)?.id ?? null,
      createdAt: 1000 + index,
      updatedAt: 1000 + index,
    }));
  })();

  const activeProjectId =
    options.activeProjectId
    || normalizedProjects.find((project) => project.status === 'active')?.id
    || normalizedProjects[0]?.id
    || null;

  await page.addInitScript(() => {
    window.localStorage.removeItem('bitacora:workspace-view-state');
  });

  await page.request.post('/api/storage/batch', {
    data: {
      operations: [
        ...tasks.map((task) => ({
          type: 'set',
          key: `bitacora:t:${task.id}`,
          value: JSON.stringify({
            fase: 1,
            estado: 'activa',
            tipo: 'protocolo',
            ...task,
          }),
        })),
        {
          type: 'set',
          key: INDEX_KEY,
          value: JSON.stringify({
            tareas: tasks.map((task) => ({
              id: task.id,
              nombre: task.nombre,
              fase: task.fase ?? 1,
              estado: task.estado ?? 'activa',
              tipo: task.tipo ?? 'protocolo',
              projectId: task.projectId,
            })),
            registros: [],
          }),
        },
        {
          type: 'set',
          key: PROJECTS_KEY,
          value: JSON.stringify({
            schemaVersion: 1,
            activeProjectId,
            projects: normalizedProjects,
          }),
        },
      ],
    },
  });
}

async function readIndex(page: import('@playwright/test').Page) {
  const response = await page.request.get(`/api/storage/${encodeURIComponent(INDEX_KEY)}`);
  const raw = (await response.json()) as { value: string | null };
  return raw.value ? JSON.parse(raw.value) as { tareas: Array<{ id: string; projectId: string; nombre: string }> } : { tareas: [] };
}

test.describe('Workspace UX Audit', () => {
  test('muestra mensaje de creación cuando no hay proyectos activos', async ({ page }) => {
    await seedWorkspace(page, { tasks: [], projects: [] });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/tasks/new');

    await expect(page.getByRole('main')).toContainText('Aun no hay proyectos activos para crear una tarea.');
    await expect(page.getByRole('link', { name: 'Ir al workspace para crear un proyecto' })).toBeVisible();
  });

  test('abre el formulario operativo desde proyecto vacio en desktop y móvil y crea una sola tarea', async ({ page }) => {
    const cases = [
      { name: 'desktop', viewport: DESKTOP_VIEWPORT },
      { name: 'mobile', viewport: MOBILE_VIEWPORT },
    ];

    for (const { name, viewport } of cases) {
      await test.step(name, async () => {
        const projectId = `proyecto-vacio-${name}`;
        await seedWorkspace(page, {
          tasks: [],
          projects: [{
            id: projectId,
            name: `Proyecto ${projectId}`,
            status: 'active',
          }],
        });
        await page.setViewportSize(viewport);
        await page.goto('/');

        const createPrimaryAction = page.getByRole('link', { name: 'Crear primera tarea' });
        await expect(createPrimaryAction).toBeVisible();
        await createPrimaryAction.click();

        const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('#new-task-project')).toHaveValue(projectId);

        const taskName = `Tarea inicial ${name}`;
        await dialog.getByLabel('Nombre').fill(taskName);
        await dialog.getByLabel('Directiva').fill('Contexto inicial para la validación de creación');
        await dialog.getByRole('button', { name: 'Crear tarea' }).click();

        await expect(page).toHaveURL(/\/tasks\/[0-9a-z-]+$/);
        await expect(page.getByRole('heading', { name: taskName })).toBeVisible();
      });

      await page.reload();
    }
  });

  test('mantiene clicables crear, renombrar y enviar sin capas superpuestas', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'phase8-security-inert',
        nombre: 'Seguridad inerte',
        directiva: 'Mostrar texto hostil sin ejecutarlo',
        projectId: 'phase8-security-project',
      }],
      projects: [{
        id: 'phase8-security-project',
        name: 'Proyecto seguridad',
        status: 'active',
        lastActiveTaskId: 'phase8-security-inert',
      }],
      activeProjectId: 'phase8-security-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/phase8-security-inert');

    const workspace = page.getByRole('navigation', { name: 'Navegación de tareas' });
    const headerActions = page.getByRole('region', { name: 'Contexto del workspace' });
    const chat = page.getByRole('region', { name: 'Centro de conversación' });
    const firstTaskRow = workspace.locator('.task-sidebar__task-row').first();

    const createButton = headerActions.getByRole('button', { name: 'Nueva tarea', exact: true });
    await expectTopHitTarget(createButton);
    await createButton.click();

    const createDialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(createDialog).toBeVisible();
    await createDialog.getByRole('button', { name: 'Cerrar nueva tarea' }).click();
    await expect(createDialog).toHaveCount(0);

    const renameButton = firstTaskRow.getByRole('button', { name: /^Renombrar / });
    await expectTopHitTarget(renameButton);
    await renameButton.click();

    const renameInput = workspace.getByLabel('Nuevo nombre de la tarea');
    await expect(renameInput).toBeVisible();
    await renameInput.fill('Tarea renombrada de auditoría');
    const saveRename = workspace.getByRole('button', { name: 'Guardar nombre de tarea' });
    await expectTopHitTarget(saveRename);
    await saveRename.click();
    await expect(firstTaskRow.getByRole('link', { name: 'Tarea renombrada de auditoría' })).toBeVisible();

    const composer = page.getByLabel('Escribe tu mensaje');
    await composer.fill('Mensaje para comprobar el envío');
    const sendButton = page.getByRole('button', { name: /^(Send prompt|Enviar mensaje)$/ });
    await expectTopHitTarget(sendButton);
    await sendButton.click();
    await expect(chat).toContainText('Mensaje para comprobar el envío');
  });

  test('prefiere proyecto preseleccionado por query string', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [
        {
          id: 'seed-task-source',
          nombre: 'Proyecto base',
          directiva: 'Liderazgo de muestra',
          projectId: 'project-a',
        },
        {
          id: 'seed-task-alt',
          nombre: 'Segundo contexto',
          directiva: 'Opciones alternativas',
          projectId: 'project-b',
        },
      ],
      projects: [
        {
          id: 'project-a',
          name: 'Proyecto A',
          status: 'active',
        },
        {
          id: 'project-b',
          name: 'Proyecto B',
          status: 'active',
        },
      ],
      activeProjectId: 'project-a',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto(`/tasks/new?projectId=${encodeURIComponent('project-b')}`);

    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#new-task-project')).toHaveValue('project-b');
    await dialog.getByLabel('Nombre').fill('Tarea preseleccionada');
    await dialog.getByLabel('Directiva').fill('Mantener selección explícita del proyecto B');
    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(page).toHaveURL(/\/tasks\/[0-9a-z-]+$/);
  });

  test('recupera selección activa y conserva campos cuando el proyecto cambia a archivado durante el formulario', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'active-task',
        nombre: 'Tarea activa',
        directiva: 'Contexto de arranque',
        projectId: 'active-project',
      }],
      projects: [
        {
          id: 'active-project',
          name: 'Proyecto activo',
          status: 'active',
        },
        {
          id: 'backup-project',
          name: 'Proyecto alterno',
          status: 'active',
        },
      ],
      activeProjectId: 'active-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/new?projectId=active-project');

    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre').fill('Tarea migrada');
    await dialog.getByLabel('Directiva').fill('El proyecto inicial se archiva y debe reasignar destino');

    await page.request.post('/api/storage/batch', {
      data: {
        operations: [
          {
            type: 'set',
            key: PROJECTS_KEY,
            value: JSON.stringify({
              schemaVersion: 1,
              activeProjectId: 'backup-project',
              projects: [
                {
                  id: 'active-project',
                  name: 'Proyecto activo',
                  description: '',
                  status: 'archived',
                  lastActiveTaskId: 'active-task',
                  createdAt: 1000,
                  updatedAt: 1000,
                },
                {
                  id: 'backup-project',
                  name: 'Proyecto alterno',
                  description: '',
                  status: 'active',
                  lastActiveTaskId: null,
                  createdAt: 1001,
                  updatedAt: 1001,
                },
              ],
            }),
          },
        ],
      },
    });

    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(dialog.getByRole('alert')).toContainText('El proyecto seleccionado cambió y se asignó uno activo.');
    await expect(page).toHaveURL(/\/tasks\/[0-9a-z-]+$/);
  });

  test('conserva los datos al fallar el guardado y permite reintentar', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [
        {
          id: 'template-task',
          nombre: 'Referencia',
          directiva: 'Plantilla de recuperación',
          projectId: 'retry-project',
        },
      ],
      projects: [{
        id: 'retry-project',
        name: 'Proyecto de retry',
        status: 'active',
      }],
      activeProjectId: 'retry-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/new?projectId=retry-project');

    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Nombre').fill('Tarea recuperable');
    await dialog.getByLabel('Directiva').fill('Debe persistir al reintentar');

    await page.route('/api/storage/batch', (route) => {
      if (route.request().url().includes('/api/storage/batch')) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ ok: false }),
        });
        return;
      }
      route.fallback();
    });

    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(dialog.getByRole('alert')).toContainText('No se pudo crear la tarea. Reintenta.');
    await expect(dialog.getByLabel('Nombre')).toHaveValue('Tarea recuperable');
    await expect(dialog.getByLabel('Directiva')).toHaveValue('Debe persistir al reintentar');

    await page.unroute('/api/storage/batch');

    await dialog.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(page).toHaveURL(/\/tasks\/[0-9a-z-]+$/);
  });

  test('muestra errores de validación sin crear tarea', async ({ page }) => {
    await seedWorkspace(page, {
      projects: [{
        id: 'validation-project',
        name: 'Proyecto validación',
        status: 'active',
      }],
      tasks: [],
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/new?projectId=validation-project');
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await dialog.getByRole('button', { name: 'Crear tarea' }).click();

    await expect(dialog.getByRole('alert')).toContainText(/nombre o describe/i);
    const indexBefore = await readIndex(page);
    await expect(page).toHaveURL('/tasks/new?projectId=validation-project');
    await expect(indexBefore.tareas.find((task) => task.projectId === 'validation-project')).toBeUndefined();
  });

  test('protege el cierre con cambios y restaura foco al descartar o volver', async ({ page }) => {
    await seedWorkspace(page, {
      projects: [{
        id: 'dirty-project',
        name: 'Proyecto con borrador',
        status: 'active',
      }],
      tasks: [],
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/new?projectId=dirty-project');

    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await dialog.getByLabel('Nombre').fill('Borrador en progreso');
    page.once('dialog', (popup) => popup.dismiss());
    await dialog.getByRole('button', { name: /cerrar nueva tarea/i }).click();

    await expect(dialog).toBeVisible();

    await page.once('dialog', (popup) => popup.accept());
    await dialog.getByRole('button', { name: /cerrar nueva tarea/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('mantiene el estado del overlay al recargar', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [
        {
          id: 'reload-task',
          nombre: 'Tarea base',
          directiva: 'Base para recarga',
          projectId: 'reload-project',
        },
      ],
      projects: [{
        id: 'reload-project',
        name: 'Proyecto recarga',
        status: 'active',
      }],
      activeProjectId: 'reload-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/new?projectId=reload-project');
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre').fill('Borrador previo a recarga');
    await page.reload();

    await expect(page.getByRole('dialog', { name: 'Crear tarea' })).toBeVisible();
    await expect(dialog.getByLabel('Proyecto')).toBeVisible();
  });

  test('evita creación duplicada con clic repetido (desktop y móvil)', async ({ page }) => {
    const cases = [
      { name: 'desktop', viewport: DESKTOP_VIEWPORT },
      { name: 'mobile', viewport: MOBILE_VIEWPORT },
    ];

    for (const { name, viewport } of cases) {
      await test.step(name, async () => {
        await seedWorkspace(page, {
          tasks: [{
            id: `submit-${name}`,
            nombre: 'Base de idempotencia',
            directiva: 'Caso base',
            projectId: 'repeat-project',
          }],
          projects: [{
            id: 'repeat-project',
            name: 'Proyecto repetición',
            status: 'active',
          }],
          activeProjectId: 'repeat-project',
        });

        const calls: string[] = [];
        await page.route('/api/storage/batch', async (route) => {
          const postData = await route.request().postData();
          calls.push(postData ?? '');
          await route.continue();
        });

        await page.setViewportSize(viewport);
        await page.goto('/tasks/new?projectId=repeat-project');

        const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
        const submitButton = dialog.getByRole('button', { name: 'Crear tarea' });
        await dialog.getByLabel('Nombre').fill(`Tarea repetible ${name}`);
        await dialog.getByLabel('Directiva').fill('Revisión de envíos repetidos');

        await submitButton.dblclick();
        await expect(page).toHaveURL(/\/tasks\/[0-9a-z-]+$/);
        await page.unroute('/api/storage/batch');

        expect(calls.length).toBe(1);

        const index = await readIndex(page);
        const created = index.tareas.filter((task) => task.nombre === `Tarea repetible ${name}`);
        expect(created).toHaveLength(1);
      });

      await page.reload();
    }
  });

  test('mantiene el home móvil en un solo plano, con drawer cerrable y Biblioteca accionable', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [],
      projects: [{
        id: 'project-mobile-home',
        name: 'Proyecto móvil',
        status: 'active',
      }],
      activeProjectId: 'project-mobile-home',
    });

    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/');

    const openNavigation = page.getByRole('button', { name: 'Abrir navegación' });
    await expect(openNavigation).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Navegación del workspace' })).toHaveCount(0);

    await openNavigation.click();
    const drawer = page.getByRole('dialog', { name: 'Navegación del workspace' });
    await expect(drawer).toBeVisible();

    const projectButton = drawer.locator('.task-sidebar__project-toggle').first();
    await expectTopHitTarget(projectButton);
    await projectButton.click();
    await expect(drawer).toHaveCount(0);
    await expect(openNavigation).toBeVisible();

    await openNavigation.click();
    await expectTopHitTarget(drawer.getByRole('link', { name: 'Biblioteca', exact: true }));
    await drawer.getByRole('link', { name: 'Biblioteca', exact: true }).click();
    await expect(page).toHaveURL('/library');

    await page.goBack();
    await expect(page).toHaveURL('/');

    await page.setViewportSize({ width: 320, height: 667 });
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });

  test('anuncia un solo Guardado por operación y conserva roles accesibles', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'notice-task',
        nombre: 'Workspace de avisos',
        directiva: 'Base para el contrato de feedback',
        projectId: 'notice-project',
        fase: 2,
        estado: 'activa',
      }],
      projects: [{
        id: 'notice-project',
        name: 'Proyecto de avisos',
        status: 'active',
        lastActiveTaskId: 'notice-task',
      }],
      activeProjectId: 'notice-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('/tasks/notice-task');

    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('region', { name: 'Contexto del workspace' })).toBeVisible();

    const noticeRegion = page.getByLabel('Avisos del workspace');
    const decision = page.getByLabel('Decisión');
    await expect(decision).toBeVisible();
    await decision.fill('Decisión ajustada para provocar un guardado único');

    await expect(noticeRegion.getByRole('status')).toHaveCount(1);
    await expect(noticeRegion.getByRole('status')).toContainText('Guardado');
    await expect(noticeRegion.getByRole('alert')).toHaveCount(0);
  });

  test('expone títulos contextuales y 404 localizado', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [],
      projects: [{
        id: 'title-project',
        name: 'Proyecto de títulos',
        status: 'active',
      }],
      activeProjectId: 'title-project',
    });

    await page.setViewportSize(DESKTOP_VIEWPORT);

    await page.goto('/');
    await expect(page).toHaveTitle('Workspace · Bitácora Protocolo');
    await expect(page.locator('main')).toHaveCount(1);

    await seedWorkspace(page, {
      tasks: [{
        id: 'title-task',
        nombre: 'Workspace de títulos',
        directiva: 'Base para títulos y fallback',
        projectId: 'title-project',
        fase: 2,
        estado: 'activa',
      }],
      projects: [{
        id: 'title-project',
        name: 'Proyecto de títulos',
        status: 'active',
        lastActiveTaskId: 'title-task',
      }],
      activeProjectId: 'title-project',
    });

    await page.goto('/library');
    await expect(page).toHaveTitle('Biblioteca · Bitácora Protocolo');
    await expect(page.locator('main')).toHaveCount(1);

    await page.goto('/reference');
    await expect(page).toHaveTitle('Referencia · Bitácora Protocolo');
    await expect(page.locator('main')).toHaveCount(1);

    await page.goto('/tasks/title-task');
    await expect(page).toHaveTitle('Workspace de títulos · Bitácora Protocolo');
    await expect(page.locator('main')).toHaveCount(1);

    await page.goto('/ruta-404-ux-007');
    await expect(page).toHaveTitle('Página no encontrada · Bitácora Protocolo');
    await expect(page.getByRole('heading', { name: 'No encontramos esta ruta' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver al workspace' })).toBeVisible();
    await expect(page.locator('main')).toHaveCount(1);
  });
});
