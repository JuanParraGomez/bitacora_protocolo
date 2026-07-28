import { test, expect } from '@playwright/test';

test.describe('Nuxt task workflows', () => {
  async function putTask(page: import('@playwright/test').Page, task: { id: string; [key: string]: unknown }) {
    await page.request.put(`/api/storage/bitacora%3At%3A${encodeURIComponent(task.id)}`, { data: { value: JSON.stringify(task) } });
  }

  async function readTask(page: import('@playwright/test').Page, id: string) {
    const response = await page.request.get(`/api/storage/bitacora%3At%3A${encodeURIComponent(id)}`);
    expect(response.ok()).toBe(true);
    return JSON.parse((await response.json()).value) as Record<string, unknown>;
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
    await page.goto('/tasks/new');
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /crear tarea/i }).click();
    await expect(page.getByRole('alert')).toContainText(/obligatorio/i);
  });

  test('applies the global shell styles once across Nuxt pages', async ({ page }) => {
    await page.goto('/tasks/new');
    await expect(page.locator('.app-shell')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toHaveCount(1);

    const styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const form = getComputedStyle(document.querySelector('form')!);
      const main = getComputedStyle(document.querySelector('main')!);
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
    expect(styles.formDisplay).toBe('grid');
    expect(styles.formGap).not.toBe('normal');
    expect(styles.formMaxWidth).not.toBe('none');
    expect(styles.mainDisplay).toBe('grid');
  });

  test('applies the Nexus guided visual language to the task workspace', async ({ page }) => {
    const task = {
      id: 'visual-system-e2e', nombre: 'Sistema visual', directiva: 'Definir una interfaz clara', fase: 3, estado: 'activa',
      f1: { analisisProblema: { problemaVigente: 'Problema', decision: 'mantener' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
      f3: { iteraciones: [{ id: 'i1', intento: 'Intento', resultado: 'Resultado', ajuste: '', criterioIds: ['c1'] }], checkCompila: false, checkAuditado: false },
    };
    await putTask(page, task);
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
    await page.goto('/tasks/new');
    await page.waitForTimeout(1000);
    await page.getByLabel('Nombre').fill(name);
    await page.getByLabel('Directiva').fill('Validar migración');
    await page.getByRole('button', { name: /crear tarea/i }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/linaje|mapeo|fase/i);
    await page.getByLabel('Origen del linaje').fill('Brief');
    await page.getByLabel('Resultado del linaje').fill('Mapa validado');
    await page.getByLabel('Confirmar mapeo').check();
    await page.getByLabel('Problema detectado').fill('El criterio no está claro');
    await page.getByLabel('Evidencia').fill('La guía actual es ambigua');
    await page.getByLabel('Análisis').fill('La ambigüedad impide priorizar');
    await page.getByLabel('Decisión sobre el problema').selectOption('reformular');
    await page.getByLabel('Justificación').fill('La evidencia exige reformular');
    await page.getByLabel('Formulación vigente').fill('Criterios explícitos y priorizados');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.getByText('Estado vigente y apto para continuar.')).toBeVisible();
    await formRegion.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('heading', { name: /Fase 2/ })).toBeVisible();
  });

  test('explains the guide and persists accessible criterion labels', async ({ page }) => {
    const task = {
      id: `guide-e2e-${Date.now()}`, nombre: 'Guía E2E', directiva: 'Priorizar criterios', fase: 2, estado: 'activa',
      f1: { analisisProblema: { problemaDetectado: 'Problema', evidencia: 'Evidencia', analisis: 'Análisis', decision: 'mantener', justificacion: 'Confirmado', problemaVigente: 'Problema' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }] },
    };
    await putTask(page, task);
    await page.goto(`/tasks/${task.id}`);
    await expect(page.getByText(/Propósito: convertir el análisis/)).toBeVisible();
    await expect(page.getByText(/Beneficios: hace explícitos/)).toBeVisible();
    await expect(page.getByText(/Utilidad: conecta/)).toBeVisible();
    await page.getByLabel('Criterio 1').fill('Criterio priorizado');
    await page.getByLabel('Comentario revisado 1').fill('Comentario con evidencia');
    await page.getByLabel('Prioridad 1').selectOption('alta');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.getByText(/Debilidades|Estado vigente/)).toBeVisible();
    const persisted = await readTask(page, task.id);
    expect(persisted.f2).toMatchObject({ criterios: [{ texto: 'Criterio priorizado', comentario: 'Comentario con evidencia', prioridad: 'alta' }] });
    await page.reload();
    await expect(page.getByLabel('Criterio 1')).toHaveValue('Criterio priorizado');
  });

  test('adds iterations without returning to the top and persists through evaluation', async ({ page }) => {
    const task = {
      id: 'iteration-e2e', nombre: 'Iteraciones E2E', directiva: 'Registrar iteraciones', fase: 3, estado: 'activa',
      f1: { analisisProblema: { problemaDetectado: 'P', evidencia: 'E', analisis: 'A', decision: 'mantener', justificacion: 'J', problemaVigente: 'P' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio E2E', comentario: 'Comentario E2E', prioridad: 'alta', estado: 'pendiente', impacto: 'alto' }] },
      f3: { iteraciones: [{ id: 'i1', intento: 'Inicial', resultado: 'Resultado inicial', ajuste: '', criterioIds: ['c1'] }], checkCompila: false, checkAuditado: false },
    };
    await putTask(page, task);
    await page.goto('/tasks/iteration-e2e');
    await expect(page.getByRole('heading', { name: /Fase 3/ })).toBeVisible();
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await page.getByRole('button', { name: 'Añadir iteración' }).click();
    await expect(page.getByLabel('Qué hice 2')).toBeVisible();
    await page.getByLabel('Qué hice 2').fill('Segundo intento');
    await page.getByLabel('Qué pasó 2').fill('Segundo resultado');
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.getByText(/Debilidades|Estado vigente/)).toBeVisible();
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
          f1: { analisisProblema: { decision: 'reformular', problemaVigente: 'Problema vigente' } },
        },
        formField: 'Origen del linaje',
        promptField: 'Prompt de orientación editable',
      },
      {
        task: {
          id: 'layout-f2', nombre: 'F2', directiva: 'Fase 2', fase: 2, estado: 'activa',
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
      await putTask(page, task);
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
      await expect(page.getByRole('button', { name: /cuestionario/i })).toBeVisible();
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
        id: 'sync-f1', nombre: 'Sincroniza F1', fase: 1, estado: 'activa',
        f1: {
          linaje: [{ origen: 'Origen inicial', resultado: 'Resultado inicial' }],
          analisisProblema: { problemaVigente: 'Inicial', decision: 'reformular' },
          promptOrientacion: 'Prompt orientación base',
          promptOrientacionPersonalizado: false,
        },
      },
      'sync-f2': {
        id: 'sync-f2', nombre: 'Sincroniza F2', fase: 2, estado: 'activa',
        f2: {
          decision: 'Base', alcance: 'Alcance', noObjetivos: 'No objetivos', pasos: 'Pasos',
          predicciones: [{ texto: 'Pred', umbral: '10', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }],
          criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: 'Comentario inicial', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }],
          promptGuia: 'Prompt base',
          promptGuiaPersonalizado: false,
        },
      },
      'sync-f3': {
        id: 'sync-f3', nombre: 'Sincroniza F3', fase: 3, estado: 'activa',
        f1: { analisisProblema: { problemaVigente: 'Inicial', decision: 'mantener' } },
        f2: { criterios: [{ id: 'c1', texto: 'Criterio inicial', comentario: '', prioridad: 'media', estado: 'pendiente', impacto: 'medio' }], predicciones: [{ texto: 'P', umbral: '0', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }, { texto: '', umbral: '', conf: 'media' }] },
        f3: {
          iteraciones: [{ id: 'i1', intento: 'Intento base', resultado: 'Resultado base', ajuste: 'Ajuste base', criterioIds: [] }],
          checkCompila: false, checkAuditado: false,
          promptEjecucion: 'Prompt base', promptEjecucionPersonalizado: false,
        },
      },
      'sync-f4': {
        id: 'sync-f4', nombre: 'Sincroniza F4', fase: 4, estado: 'activa',
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
      await putTask(page, syncTasks[item.id]);
      await page.setViewportSize({ width: 1280, height: 1200 });
      await page.goto(`/tasks/${item.id}`);
      await expect(page.getByLabel(item.promptField)).toHaveCount(0);
      await page.getByLabel(item.sourceField).fill(item.sourceValue);
      const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
      await formRegion.getByRole('button', { name: 'Evaluar' }).click();
      await expect(formRegion.getByText(/Debilidades|Estado vigente/)).toBeVisible();
      const persisted = await readTask(page, item.id);
      const raw = JSON.stringify(persisted);
      expect(raw).toContain(item.resetValue);
      await expect(page.getByRole('button', { name: item.regenerate })).toHaveCount(0);
    }
  });

  test('completes phase four into the library and removes the active task', async ({ page }) => {
    const task = {
      id: 'completion-e2e', nombre: 'Cierre E2E', directiva: 'Cerrar registro', fase: 4, estado: 'activa',
      f1: { analisisProblema: { problemaDetectado: 'P', evidencia: 'E', analisis: 'A', decision: 'mantener', justificacion: 'J', problemaVigente: 'P' } },
      f2: { criterios: [{ id: 'c1', texto: 'Criterio final', comentario: 'Comentario final', prioridad: 'alta', estado: 'resuelto', impacto: 'alto' }] },
      f3: { iteraciones: [{ id: 'i1', intento: 'Intento', resultado: 'Resultado', ajuste: 'Ajuste', criterioIds: ['c1'] }], checkCompila: true, checkAuditado: true },
      f4: { aar: [{ pred: 'Predicción', observado: 'Observado', causa: 'Causa', mia: true }], cambio: 'Cambiar procedimiento', titulo: 'Registro cerrado' },
    };
    await putTask(page, task);
    await page.request.put('/api/storage/bitacora%3Aindex', { data: { value: JSON.stringify({ tareas: [null, { id: 'completion-e2e', nombre: 'Anterior', fase: 4, estado: 'activa', tipo: 'protocolo' }], registros: [null] }) } });
    await page.goto('/tasks/completion-e2e');
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    await expect(page.getByLabel('Criterio c1 revisado')).toBeVisible();
    await expect(page.getByLabel('Mejora 1')).toBeVisible();
    const formRegion = page.getByRole('region', { name: 'Formulario guiado' });
    await formRegion.getByRole('button', { name: 'Evaluar' }).click();
    await expect(formRegion.getByText('Estado vigente y apto para continuar.')).toBeVisible();
    await formRegion.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText(/Fase 4 · completada/)).toBeVisible();
    await expect(page.getByText('Guardado ✓')).toBeVisible();
    await expect((await page.request.get('/api/storage/bitacora%3Ar%3Acompletion-e2e')).status()).toBe(200);
    const index = await page.request.get('/api/storage/bitacora%3Aindex');
    const indexPayload = JSON.parse((await index.json()).value);
    expect(indexPayload.tareas.some((item: { id: string }) => item.id === 'completion-e2e')).toBe(false);
  });

  test('prefills intake from an existing task template', async ({ page }) => {
    const template = { id: 'template-e2e', nombre: 'Plantilla base', directiva: 'Directiva reutilizable' };
    await page.request.put('/api/storage/bitacora%3At%3Atemplate-e2e', { data: { value: JSON.stringify(template) } });
    await page.goto('/tasks/new?template=template-e2e');
    await expect(page.getByLabel('Nombre')).toHaveValue('Plantilla base');
    await expect(page.getByLabel('Directiva')).toHaveValue('Directiva reutilizable');
  });

  test('browses and downloads a library record', async ({ page }) => {
    await page.request.put('/api/storage/bitacora%3Aindex', { data: { value: JSON.stringify({ tareas: [], registros: [{ id: 'r-e2e', titulo: 'Registro E2E', fecha: 'hoy', tarea: 'Tarea E2E', taskId: 't-e2e' }] }) } });
    await page.request.put('/api/storage/bitacora%3Ar%3Ar-e2e', { data: { value: '# Registro E2E' } });
    await page.goto('/library');
    await expect(page.getByRole('heading', { name: 'Biblioteca' })).toBeVisible();
    await expect(page.getByText('Registro E2E', { exact: true })).toBeVisible();
    await page.getByText('Registro E2E', { exact: true }).click();
    await expect(page.getByRole('link', { name: /descargar/i })).toBeVisible();
  });

  test('renders reference guidance with accessible headings', async ({ page }) => {
    await page.goto('/reference');
    await expect(page.getByRole('heading', { name: 'Referencia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Orientación e insumos/ })).toBeVisible();
  });
});
