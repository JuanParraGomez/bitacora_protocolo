import { test, expect } from '@playwright/test';

test.describe('Nuxt task workflows', () => {
  const INDEX_KEY = 'bitacora:index';
  const PROJECTS_KEY = 'bitacora:projects';

  async function putTask(page: import('@playwright/test').Page, task: { id: string; [key: string]: unknown }) {
    await page.request.put(`/api/storage/bitacora%3At%3A${encodeURIComponent(task.id)}`, { data: { value: JSON.stringify(task) } });
  }

  async function readTask(page: import('@playwright/test').Page, id: string) {
    const response = await page.request.get(`/api/storage/bitacora%3At%3A${encodeURIComponent(id)}`);
    expect(response.ok()).toBe(true);
    return JSON.parse((await response.json()).value) as Record<string, unknown>;
  }

  async function seedWorkspace(
    page: import('@playwright/test').Page,
    options: {
      tasks: Array<{ id: string; nombre: string; projectId?: string; fase?: number; estado?: string; tipo?: string; [key: string]: unknown }>;
      records?: Array<Record<string, unknown>>;
      recordBodies?: Array<{ id: string; markdown: string }>;
      activeProjectId?: string;
    },
  ) {
    const tasks = options.tasks.map((task) => ({
      projectId: 'legacy',
      fase: 1,
      estado: 'activa',
      tipo: 'protocolo',
      ...task,
    }));
    const activeProjectId = options.activeProjectId ?? tasks[0]?.projectId ?? 'legacy';
    const records = options.records ?? [];
    const recordBodies = options.recordBodies ?? [];
    const projectIds = [...new Set(tasks.map((task) => String(task.projectId || 'legacy')))];
    const projects = projectIds.map((projectId, index) => ({
      id: projectId,
      name: projectId === 'legacy' ? 'Tareas anteriores' : `Proyecto ${projectId}`,
      description: '',
      status: 'active',
      lastActiveTaskId: tasks.find((task) => task.projectId === projectId)?.id ?? null,
      createdAt: 1000 + index,
      updatedAt: 1000 + index,
    }));

    await page.addInitScript(() => {
      window.localStorage.removeItem('bitacora:workspace-view-state');
    });

    await page.request.post('/api/storage/batch', {
      data: {
        operations: [
          ...tasks.map((task) => ({
            type: 'set',
            key: `bitacora:t:${task.id}`,
            value: JSON.stringify(task),
          })),
          ...recordBodies.map((record) => ({
            type: 'set',
            key: `bitacora:r:${record.id}`,
            value: record.markdown,
          })),
          {
            type: 'set',
            key: INDEX_KEY,
            value: JSON.stringify({
              tareas: tasks.map((task) => ({
                id: task.id,
                nombre: task.nombre,
                fase: task.fase,
                estado: task.estado,
                tipo: task.tipo,
                projectId: task.projectId,
              })),
              registros: records,
            }),
          },
          {
            type: 'set',
            key: PROJECTS_KEY,
            value: JSON.stringify({
              schemaVersion: 1,
              activeProjectId,
              projects,
            }),
          },
        ],
      },
    });
  }

  test('shows an empty active-task dashboard', async ({ page }) => {
    await page.request.put('/api/storage/bitacora%3Aindex', { data: { value: JSON.stringify({ tareas: [], registros: [] }) } });
    await page.goto('/');
    await expect(page.locator('.workspace-shell')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación de tareas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sin tarea seleccionada' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Este proyecto todavía no tiene tareas/i }))
      .toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear primera tarea' })).toBeVisible();
  });

  test('shows navigation and validates task intake', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'intake-launcher',
        nombre: 'Lanzador intake',
        directiva: 'Abrir modal de nueva tarea',
        projectId: 'project-intake',
      }],
      activeProjectId: 'project-intake',
    });
    await page.goto('/tasks/new');
    await expect(page.locator('.app-shell')).toHaveCount(1);
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /crear tarea/i }).click();
    await expect(dialog.getByRole('alert')).toContainText(/nombre o describe/i);
  });

  test('applies the global shell styles once across Nuxt pages', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'style-launcher',
        nombre: 'Lanzador estilos',
        directiva: 'Abrir modal desde deep link',
        projectId: 'project-style',
      }],
      activeProjectId: 'project-style',
    });
    await page.goto('/tasks/new');
    await expect(page.locator('.app-shell')).toHaveCount(1);
    await expect(page.getByRole('dialog', { name: 'Crear tarea' })).toHaveCount(1);

    const styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const form = getComputedStyle(document.querySelector('.new-task-modal form')!);
      const main = getComputedStyle(document.querySelector('main[data-hydrated="true"]')!);
      return {
        bodyFont: body.fontFamily,
        bodyMargin: body.margin,
        formDisplay: form.display,
        formGap: form.gap,
        formMaxWidth: form.maxWidth,
        mainDisplay: main.display,
      };
    });

    expect(styles.bodyFont).not.toContain('Times');
    expect(styles.bodyMargin).toBe('0px');
    expect(styles.formDisplay).not.toBe('inline');
    expect(styles.mainDisplay).toBe('grid');
  });

  test('applies the Nexus guided visual language to the task workspace', async ({ page }) => {
    const task = {
      id: 'visual-system-e2e', nombre: 'Sistema visual', directiva: 'Definir una interfaz clara', fase: 3, estado: 'activa', projectId: 'visual-project',
      f1: { analisisProblema: { problemaVigente: 'Problema', decision: 'mantener' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
      f3: { iteraciones: [{ id: 'i1', intento: 'Intento', resultado: 'Resultado', ajuste: '', criterioIds: ['c1'] }], checkCompila: false, checkAuditado: false },
    };
    await seedWorkspace(page, { tasks: [task], activeProjectId: 'visual-project' });
    await page.goto(`/tasks/${task.id}`);

    await expect(page.locator('.app-shell')).toHaveClass(/app-shell--workspace/);
    await expect(page.getByRole('navigation', { name: 'Navegación de tareas' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Centro de conversación' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Formulario guiado' })).toBeVisible();
    await expect(page.getByText('Nexus')).toBeVisible();
    await expect(page.locator('.prompt-box')).toHaveCount(0);

    const visual = await page.evaluate(() => ({
      shellColumns: getComputedStyle(document.querySelector('.workspace-shell')!).gridTemplateColumns,
      chatBackground: getComputedStyle(document.querySelector('.task-chat__messages')!).backgroundImage,
      sidebarBackgroundColor: getComputedStyle(document.querySelector('.task-sidebar')!).backgroundColor,
      checkboxWidth: document.querySelector('input[type="checkbox"]')?.getBoundingClientRect().width,
    }));

    expect(visual.shellColumns.split(' ').filter(Boolean).length).toBe(2);
    expect(visual.chatBackground).not.toBe('none');
    expect(visual.sidebarBackgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(visual.checkboxWidth).toBeLessThanOrEqual(24);
  });

  test('creates a task, opens its workspace, and reports its gate', async ({ page }) => {
    const name = `Nuxt task ${Date.now()}`;
    await seedWorkspace(page, {
      tasks: [{
        id: 'create-launcher',
        nombre: 'Lanzador crear',
        directiva: 'Abrir nueva tarea desde deep link',
        projectId: 'project-create',
      }],
      activeProjectId: 'project-create',
    });
    await page.goto('/tasks/new');
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await dialog.getByLabel('Proyecto').selectOption('project-create');
    await dialog.getByLabel('Nombre').fill(name);
    await dialog.getByLabel('Directiva').fill('Validar migración');
    await dialog.getByRole('button', { name: /crear tarea/i }).click();
    await expect(page).toHaveURL(/\/tasks\/[^/?]+$/);
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('region', { name: 'Evaluación del asistente' }).getByText(/Completa al menos una relación de linaje|Define alcance explícito|Define al menos un actor/i).first()).toBeVisible();
    await page.getByLabel('Origen del linaje').fill('Brief');
    await page.getByLabel('Resultado del linaje').fill('Mapa validado');
    await page.getByLabel('Confirmar mapeo').check();
    await page.getByLabel('Confirmación final').check();
    await page.getByLabel('Resultado deseado').fill('Validar la migración con criterios explícitos');
    await page.getByLabel('Alcance').fill('Formulario y evaluación de fase 1');
    await page.getByLabel('Restricciones').fill('Sin proveedor externo');
    await page.getByLabel('Actores involucrados (uno por línea)').fill('Equipo núcleo');
    await page.getByLabel('Criterio de éxito').fill('La fase 1 queda aceptable');
    await page.getByLabel('Problema detectado').fill('El criterio no está claro');
    await page.getByLabel('Evidencia').fill('La guía actual es ambigua');
    await page.getByLabel('Análisis').fill('La ambigüedad impide priorizar');
    await page.getByLabel('Decisión sobre el problema').selectOption('reformular');
    await page.getByLabel('Justificación').fill('La evidencia exige reformular');
    await page.getByLabel('Formulación vigente').fill('Criterios explícitos y priorizados');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    const guidedForm = page.locator('.guided-phase-form');
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(guidedForm.getByText('Estado vigente y apto para continuar.')).toBeVisible();
    await formRegion.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('heading', { name: 'Descomponer el camino' }).first()).toBeVisible();
  });

  test('explains the guide and persists accessible criterion labels', async ({ page }) => {
    const task = {
      id: `guide-e2e-${Date.now()}`, nombre: 'Guía E2E', directiva: 'Priorizar criterios', fase: 2, estado: 'activa', projectId: 'guide-project',
      f1: { analisisProblema: { problemaDetectado: 'Problema', evidencia: 'Evidencia', analisis: 'Análisis', decision: 'mantener', justificacion: 'Confirmado', problemaVigente: 'Problema' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
    };
    await seedWorkspace(page, { tasks: [task], activeProjectId: 'guide-project' });
    await page.goto(`/tasks/${task.id}`);
    await expect(page.getByText(/Propósito: convertir el análisis/)).toBeVisible();
    await expect(page.getByText(/Beneficios: hace explícitos/)).toBeVisible();
    await expect(page.getByText(/Utilidad: conecta/)).toBeVisible();
    await page.getByLabel('Criterio 1').fill('Criterio priorizado');
    await page.getByLabel('Comentario revisado 1').fill('Comentario con evidencia');
    await page.getByLabel('Prioridad 1').selectOption('alta');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.locator('.evaluation-feedback__status')).toHaveText(/Evaluación requiere ajustes|Evaluación aceptable/);
    const persisted = await readTask(page, task.id);
    expect(persisted.f2).toMatchObject({ criterios: [{ texto: 'Criterio priorizado', comentario: 'Comentario con evidencia', prioridad: 'alta' }] });
    await page.reload();
    await expect(page.getByLabel('Criterio 1')).toHaveValue('Criterio priorizado');
  });

  test('adds iterations without returning to the top and persists through evaluation', async ({ page }) => {
    const task = {
      id: 'iteration-e2e', nombre: 'Iteraciones E2E', directiva: 'Registrar iteraciones', fase: 3, estado: 'activa', projectId: 'iteration-project',
      f1: { analisisProblema: { problemaDetectado: 'P', evidencia: 'E', analisis: 'A', decision: 'mantener', justificacion: 'J', problemaVigente: 'P' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio E2E', comentario: 'Comentario E2E', prioridad: 'alta', estado: 'pendiente', impacto: 'alto' }] },
      f3: { iteraciones: [{ id: 'i1', intento: 'Inicial', resultado: 'Resultado inicial', ajuste: '', criterioIds: ['c1'] }], checkCompila: false, checkAuditado: false },
    };
    await seedWorkspace(page, { tasks: [task], activeProjectId: 'iteration-project' });
    await page.goto('/tasks/iteration-e2e');
    await expect(page.getByRole('heading', { name: 'Iteraciones E2E' })).toBeVisible();
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Añadir iteración' }).click();
    await expect(page.getByLabel('Qué hice 2')).toBeVisible();
    await page.getByLabel('Qué hice 2').fill('Segundo intento');
    await page.getByLabel('Qué pasó 2').fill('Segundo resultado');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.locator('.evaluation-feedback__status')).toHaveText(/Evaluación requiere ajustes|Evaluación aceptable/);
    await page.reload();
    await expect(page.getByLabel('Qué hice 2')).toHaveValue('Segundo intento');
  });

  test('muestra formulario guiado y oculta prompts legacy en cada fase', async ({ page }) => {
    const cases: Array<{
      task: { id: string; nombre: string; directiva: string; fase: number; f1?: Record<string, unknown>; f2?: Record<string, unknown>; f3?: Record<string, unknown>; f4?: Record<string, unknown>; estado?: string };
      formField: string;
      promptField: string;
    }> = [
      {
        task: {
          id: 'layout-f1', nombre: 'F1', directiva: 'Fase 1', fase: 1, estado: 'activa',
          projectId: 'layout-project-f1',
          f1: { analisisProblema: { decision: 'reformular', problemaVigente: 'Problema vigente' } },
        },
        formField: 'Origen del linaje',
        promptField: 'Prompt de orientación editable',
      },
      {
        task: {
          id: 'layout-f2', nombre: 'F2', directiva: 'Fase 2', fase: 2, estado: 'activa',
          projectId: 'layout-project-f2',
          f1: { analisisProblema: { decision: 'mantener', problemaVigente: 'Problema vigente' } },
          f2: {
            decision: 'Base', alcance: 'Alcance', noObjetivos: 'Nada', pasos: 'Hacer',
            criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }],
            predicciones: [{ texto: 'Pred', umbral: '0', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }],
          },
        },
        formField: 'Decisión',
        promptField: 'Prompt de guía editable',
      },
      {
        task: {
          id: 'layout-f3', nombre: 'F3', directiva: 'Fase 3', fase: 3, estado: 'activa',
          projectId: 'layout-project-f3',
          f1: { analisisProblema: { decision: 'mantener', problemaVigente: 'Activo' } },
          f2: { predicciones: [{ texto: 'P', umbral: '0', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }] },
          f3: { iteraciones: [{ id: 'i1', intento: 'Intento base', resultado: 'Resultado base', ajuste: 'Ajuste base', criterioIds: [] }], checkCompila: false, checkAuditado: false },
        },
        formField: 'Qué hice 1',
        promptField: 'Prompt de ejecución editable',
      },
      {
        task: {
          id: 'layout-f4', nombre: 'F4', directiva: 'Fase 4', fase: 4, estado: 'activa',
          projectId: 'layout-project-f4',
          f1: { analisisProblema: { decision: 'mantener', problemaVigente: 'Final' } },
          f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
          f3: { iteraciones: [{ id: 'i1', intento: 'Intento', resultado: 'Resultado', ajuste: 'Ajuste', criterioIds: ['c1'] }], checkCompila: true, checkAuditado: true },
          f4: { aar: [{ pred: 'Pred', observado: 'Obs', causa: 'Causa', mia: true }], cambio: 'Cambio base', titulo: 'Cierre' },
        },
        formField: 'Cambio procedimental',
        promptField: 'Prompt de revisión editable',
      },
    ];

    for (const { task, formField, promptField } of cases) {
      const taskId = task.id;
      await seedWorkspace(page, { tasks: [task] });
      await page.setViewportSize({ width: 1280, height: 1200 });
      await page.goto(`/tasks/${taskId}`);
      await expect(page.getByLabel(formField)).toBeVisible();
      await expect(page.getByLabel(promptField)).toHaveCount(0);
      await expect(page.getByRole('region', { name: 'Centro de conversación' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Formulario guiado' })).toBeVisible();

      const formBox = await page.locator('.phase-workspace__form').first().boundingBox();
      expect(formBox).not.toBeNull();
      const desktopColumns = await page.locator('.workspace-shell').first().evaluate(element => getComputedStyle(element).gridTemplateColumns);
      expect(desktopColumns.split(' ').filter(Boolean).length).toBe(2);

      await page.setViewportSize({ width: 320, height: 1200 });
      await page.goto(`/tasks/${taskId}`);
      await expect(page.getByRole('button', { name: 'Etapa' })).toBeVisible();
      await expect(page.getByLabel(promptField)).toHaveCount(0);
    }
  });

  test('conserva prompts legacy como datos inertes al editar cada fase', async ({ page }) => {
    const cases = [
      { id: 'sync-f1', promptField: 'Prompt de orientación editable', sourceField: 'Origen del linaje', sourceValue: 'Nuevo origen', regenerate: 'Regenerar Prompt de orientación', expected: 'origen: Nuevo origen', resetValue: 'Prompt orientación base' },
      { id: 'sync-f2', promptField: 'Prompt de guía editable', sourceField: 'Decisión', sourceValue: 'Decisión inicial', regenerate: 'Regenerar Prompt de guía', expected: 'Decisión: Decisión inicial', resetValue: 'Prompt base' },
      { id: 'sync-f3', promptField: 'Prompt de ejecución editable', sourceField: 'Qué hice 1', sourceValue: 'Intento ajustado', regenerate: 'Regenerar Prompt de ejecución', expected: '1. Intento: Intento ajustado', resetValue: 'Prompt base' },
      { id: 'sync-f4', promptField: 'Prompt de revisión editable', sourceField: 'Cambio procedimental', sourceValue: 'Cambio ajustado', regenerate: 'Regenerar Prompt de revisión', expected: 'Cambio procedural: Cambio ajustado', resetValue: 'Prompt base' },
    ];

    const syncTasks: Record<string, { id: string; [key: string]: unknown }> = {
      'sync-f1': {
        id: 'sync-f1', nombre: 'Sincroniza F1', fase: 1, estado: 'activa', projectId: 'sync-project-f1',
        f1: {
          linaje: [{ origen: 'Origen inicial', resultado: 'Resultado inicial' }],
          analisisProblema: { problemaVigente: 'Inicial', decision: 'reformular' },
          promptOrientacion: 'Prompt orientación base',
          promptOrientacionPersonalizado: false,
        },
      },
      'sync-f2': {
        id: 'sync-f2', nombre: 'Sincroniza F2', fase: 2, estado: 'activa', projectId: 'sync-project-f2',
        f2: {
          decision: 'Base', alcance: 'Alcance', noObjetivos: 'No objetivos', pasos: 'Pasos',
          predicciones: [{ texto: 'Pred', umbral: '10', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }],
          criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }],
          promptGuia: 'Prompt base',
          promptGuiaPersonalizado: false,
        },
      },
      'sync-f3': {
        id: 'sync-f3', nombre: 'Sincroniza F3', fase: 3, estado: 'activa', projectId: 'sync-project-f3',
        f1: { analisisProblema: { problemaVigente: 'Inicial', decision: 'mantener' } },
        f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }], predicciones: [{ texto: 'P', umbral: '0', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }] },
        f3: {
          iteraciones: [{ id: 'i1', intento: 'Intento base', resultado: 'Resultado base', ajuste: 'Ajuste base', criterioIds: [] }],
          checkCompila: false, checkAuditado: false,
          promptEjecucion: 'Prompt base', promptEjecucionPersonalizado: false,
        },
      },
      'sync-f4': {
        id: 'sync-f4', nombre: 'Sincroniza F4', fase: 4, estado: 'activa', projectId: 'sync-project-f4',
        f1: { analisisProblema: { problemaVigente: 'Inicial', decision: 'mantener' } },
        f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
        f3: { iteraciones: [{ id: 'i1', intento: 'Intento base', resultado: 'Resultado base', ajuste: 'Ajuste base', criterioIds: [] }], checkCompila: true, checkAuditado: true },
        f4: {
          aar: [{ pred: 'Pred', observado: 'Obs', causa: 'Causa', mia: true }],
          cambio: 'Cambio base', titulo: 'Titulo',
          promptAar: 'Prompt base', promptAarPersonalizado: false,
        },
      },
    };

    for (const item of cases) {
      await seedWorkspace(page, { tasks: [syncTasks[item.id]] });
      await page.setViewportSize({ width: 1280, height: 1200 });
      await page.goto(`/tasks/${item.id}`);
      await expect(page.getByLabel(item.promptField)).toHaveCount(0);
      await page.getByLabel(item.sourceField).fill(item.sourceValue);
      const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
      await formRegion.getByRole('button', { name: 'Evaluar' }).click();
      const persisted = await readTask(page, item.id);
      const raw = JSON.stringify(persisted);
      expect(raw).toContain(item.resetValue);
      await expect(page.getByRole('button', { name: item.regenerate })).toHaveCount(0);
    }
  });

  test('completes phase four into the library and removes the active task', async ({ page }) => {
    const task = {
      id: 'completion-e2e', nombre: 'Cierre E2E', directiva: 'Cerrar registro', fase: 4, estado: 'activa', projectId: 'completion-project',
      f1: {
        linaje: [{ origen: 'Brief', resultado: 'Mapa' }],
        checkMapeo: true,
        confirmacion: true,
        resultadoDeseado: 'Consolidar y guardar el metodo',
        alcance: 'Validacion completa de fase 4',
        restricciones: 'Sin proveedor externo',
        actores: ['Equipo'],
        criterioExito: 'Se puede cerrar la tarea',
        analisisProblema: { problemaDetectado: 'P', evidencia: 'E', analisis: 'A', decision: 'mantener', justificacion: 'J', problemaVigente: 'P' },
      },
      f2: {
        decision: 'Cerrar el flujo',
        alcance: 'Completar consolidacion',
        noObjetivos: 'No automatizar aun',
        pasos: 'Paso final',
        subproblemas: ['Documentar'],
        preguntasAbiertas: ['Ninguna'],
        riesgos: ['Bajo'],
        guia: 'Seguir la secuencia actual',
        predicciones: [{ texto: 'Pred', umbral: '10', conf: 'media' }, { texto: 'Pred 2', umbral: '20', conf: 'media' }, { texto: 'Pred 3', umbral: '30', conf: 'media' }],
        criterios: [{ id: 'c1', texto: 'Criterio final', comentario: 'Comentario final', prioridad: 'alta', estado: 'resuelto', impacto: 'alto' }],
      },
      methodVersions: [{
        id: 'method-completion-v1',
        version: 1,
        parentVersionId: null,
        status: 'published',
        changeKind: 'initial',
        preconditions: ['Contexto base'],
        steps: [{
          id: 'step-1',
          title: 'Paso final',
          objective: 'Completar el flujo',
          dependencies: [],
          inputs: ['Entrada'],
          output: 'Salida',
          tool: 'CLI',
          risk: 'Bajo',
          successCriterion: 'Resultado esperado',
          sourceCriterionId: 'c1',
        }],
        tools: ['CLI'],
        inputs: ['Entrada'],
        outputs: ['Salida'],
        controls: ['Revision humana'],
        exceptions: [],
        exceptionsReviewed: true,
        successCriteria: ['Resultado esperado'],
        supportingIterationIds: ['i1', 'i2'],
        createdAt: 1,
      }],
      f3: {
        iteraciones: [
          {
            id: 'i1',
            intento: 'Intento 1',
            resultado: 'Resultado 1',
            ajuste: 'Ajuste 1',
            criterioIds: ['c1'],
            methodVersionId: 'method-completion-v1',
            objective: 'Objetivo 1',
            action: 'Accion 1',
            tool: 'CLI',
            input: 'Entrada 1',
            result: 'Salida 1',
            evidence: [{ id: 'ev-1', kind: 'note', label: 'Evidencia 1', value: 'Comprobacion 1' }],
            learning: 'Aprendizaje 1',
            nextAdjustment: 'Ajuste siguiente',
            applicableConditions: ['Condicion estable'],
            success: true,
            successCriteriaResults: [{ criterion: 'Resultado esperado', passed: true }],
          },
          {
            id: 'i2',
            intento: 'Intento 2',
            resultado: 'Resultado 2',
            ajuste: 'Ajuste 2',
            criterioIds: ['c1'],
            methodVersionId: 'method-completion-v1',
            objective: 'Objetivo 2',
            action: 'Accion 2',
            tool: 'CLI',
            input: 'Entrada 2',
            result: 'Salida 2',
            evidence: [{ id: 'ev-2', kind: 'note', label: 'Evidencia 2', value: 'Comprobacion 2' }],
            learning: 'Aprendizaje 2',
            nextAdjustment: 'No aplica',
            applicableConditions: ['Condicion estable'],
            success: true,
            successCriteriaResults: [{ criterion: 'Resultado esperado', passed: true }],
          },
        ],
        checkCompila: true,
        checkAuditado: true,
      },
      automationOpportunities: [{
        id: 'opportunity-1',
        methodVersionId: 'method-completion-v1',
        stepIds: ['step-1'],
        classification: 'assistable',
        frequency: 'Aparece en cada cierre',
        stability: 'Misma secuencia documentada',
        risk: 'Requiere supervisión',
        humanJudgment: 'Validar antes de ejecutar',
        trigger: 'Cierre de la tarea',
        inputs: ['Entrada'],
        transformation: 'Consolidar la salida final',
        output: 'Registro reutilizable',
        candidateTool: 'Plantilla local',
        expectedFailures: ['Datos incompletos'],
        humanCheckpoint: 'Revisión final del registro',
        occurrenceIterationIds: ['i1', 'i2'],
      }],
      f4: {
        aar: [{ pred: 'Predicción', observado: 'Observado', causa: 'Causa', mia: true }],
        cambio: 'Cambiar procedimiento',
        titulo: 'Registro cerrado',
        methodVersionId: 'method-completion-v1',
        mejorasCriterios: [{ criterioId: 'c1', confirmado: true, mejora: 'Mejora verificada' }],
      },
    };
    await seedWorkspace(page, { tasks: [task], activeProjectId: 'completion-project' });
    await page.goto('/tasks/completion-e2e');
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await expect(page.getByLabel('Criterio c1 revisado')).toBeVisible();
    await expect(page.getByLabel('Mejora 1')).toBeVisible();
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    const guidedForm = page.locator('.guided-phase-form');
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(guidedForm.getByText('Estado vigente y apto para continuar.')).toBeVisible();
    await formRegion.getByRole('button', { name: 'Finalizar tarea' }).click();
    await expect(page.getByRole('region', { name: 'Resumen completado' })).toBeVisible();
    await expect(page.getByTestId('completion-progress')).toContainText('4/4');
    await expect(page.getByRole('button', { name: 'Volver a tareas' })).toHaveCount(1);
    await expect((await page.request.get('/api/storage/bitacora%3Ar%3Acompletion-e2e')).status()).toBe(200);
    await expect.poll(async () => {
      const index = await page.request.get('/api/storage/bitacora%3Aindex');
      const indexPayload = JSON.parse((await index.json()).value) as { tareas: Array<{ id: string }> };
      return indexPayload.tareas.some((item) => item.id === 'completion-e2e');
    }).toBe(false);
  });

  test('prefills intake from an existing task template', async ({ page }) => {
    const template = { id: 'template-e2e', nombre: 'Plantilla base', directiva: 'Directiva reutilizable', projectId: 'template-project' };
    await seedWorkspace(page, {
      tasks: [
        { id: 'template-launcher', nombre: 'Lanzador plantilla', directiva: 'Abrir intake con template', projectId: 'template-project' },
        template,
      ],
      activeProjectId: 'template-project',
    });
    await page.goto('/tasks/new?template=template-e2e');
    const dialog = page.getByRole('dialog', { name: 'Crear tarea' });
    await expect(dialog.getByLabel('Nombre')).toHaveValue('Plantilla base');
    await expect(dialog.getByLabel('Directiva')).toHaveValue('Directiva reutilizable');
  });

  test('browses and downloads a library record', async ({ page }) => {
    await seedWorkspace(page, {
      tasks: [{
        id: 'library-launcher',
        nombre: 'Lanzador biblioteca',
        directiva: 'Abrir biblioteca desde deep link',
        projectId: 'library-project',
      }],
      records: [{
        id: 'r-e2e',
        titulo: 'Registro E2E',
        fecha: 'hoy',
        tarea: 'Tarea E2E',
        taskId: 'library-launcher',
        sourceTaskId: 'library-launcher',
        projectId: 'library-project',
        resourceKind: 'learning',
      }],
      recordBodies: [{ id: 'r-e2e', markdown: '# Registro E2E' }],
      activeProjectId: 'library-project',
    });
    await page.goto('/library');
    await expect(page.getByRole('heading', { name: 'Biblioteca', level: 1 })).toBeVisible();
    const openTaskLink = page.getByRole('link', { name: /Abrir / });
    await expect(openTaskLink).toBeVisible();
    await openTaskLink.click();
    const dialog = page.getByRole('dialog', { name: 'Biblioteca' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Registro E2E', { exact: true })).toBeVisible();
    await dialog.getByText('Registro E2E', { exact: true }).click();
    await expect(dialog.getByRole('link', { name: /descargar/i })).toBeVisible();
  });

  test('renders reference guidance with accessible headings', async ({ page }) => {
    await page.goto('/reference');
    await expect(page.getByRole('heading', { name: 'Referencia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Orientación e insumos/ })).toBeVisible();
  });
});
