import { expect, test } from '@playwright/test';

const INDEX_KEY = 'bitacora:index';
const PROJECTS_KEY = 'bitacora:projects';

async function seedWorkspace(page: import('@playwright/test').Page) {
  const sourceTask = {
    id: 'task-source',
    projectId: 'project-source',
    nombre: 'Metodo fuente',
    directiva: 'Documentar pasos',
    fase: 4,
    estado: 'completada',
    tipo: 'protocolo',
    f1: { linaje: [{ origen: 'Brief', resultado: 'Resultado' }], checkMapeo: true, confirmacion: true, analisisProblema: { problemaDetectado: 'Problema', evidencia: 'Evidencia', analisis: 'Analisis', decision: 'mantener', justificacion: 'Justificado', problemaVigente: 'Problema vigente' }, resultadoDeseado: 'Resultado', alcance: 'Alcance', restricciones: 'Restricciones', actores: ['Equipo'], criterioExito: 'Criterio' },
  };
  const targetTask = {
    id: 'task-target',
    projectId: 'project-target',
    nombre: 'Tarea destino',
    directiva: 'Reusar metodo',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: { linaje: [{ origen: 'Brief', resultado: 'Resultado' }], checkMapeo: true, confirmacion: true, analisisProblema: { problemaDetectado: 'Problema destino', evidencia: 'Evidencia', analisis: 'Analisis', decision: 'mantener', justificacion: 'Justificado', problemaVigente: 'Problema vigente' }, resultadoDeseado: 'Mantener datos confirmados', alcance: 'Alcance', restricciones: 'Restricciones', actores: ['Equipo'], criterioExito: 'Criterio' },
  };

  await page.request.post('/api/storage/batch', {
    data: {
      operations: [
        {
          type: 'set',
          key: `bitacora:t:${sourceTask.id}`,
          value: JSON.stringify(sourceTask),
        },
        {
          type: 'set',
          key: `bitacora:t:${targetTask.id}`,
          value: JSON.stringify(targetTask),
        },
        {
          type: 'set',
          key: INDEX_KEY,
          value: JSON.stringify({
            tareas: [
              { id: targetTask.id, projectId: targetTask.projectId, nombre: targetTask.nombre, fase: targetTask.fase, estado: targetTask.estado, tipo: targetTask.tipo },
            ],
            registros: [
              {
                id: 'record-method',
                titulo: 'Metodo fuente',
                tareaId: sourceTask.id,
                taskId: sourceTask.id,
                projectId: sourceTask.projectId,
                resourceKind: 'method',
                sourceTaskId: sourceTask.id,
                sourceMethodVersionId: 'method-v1',
              },
              {
                id: 'record-candidate',
                titulo: 'Clasificar tickets',
                tareaId: sourceTask.id,
                taskId: sourceTask.id,
                projectId: sourceTask.projectId,
                resourceKind: 'automation-candidate',
                sourceTaskId: sourceTask.id,
                sourceMethodVersionId: 'method-v1',
                automationEvidence: {
                  status: 'hypothesis',
                  occurrenceCount: 1,
                },
              },
            ],
          }),
        },
        {
          type: 'set',
          key: PROJECTS_KEY,
          value: JSON.stringify({
            schemaVersion: 1,
            activeProjectId: targetTask.projectId,
            projects: [
              { id: sourceTask.projectId, name: 'Proyecto fuente', description: '', status: 'active', lastActiveTaskId: sourceTask.id, createdAt: 1, updatedAt: 1 },
              { id: targetTask.projectId, name: 'Proyecto destino', description: '', status: 'active', lastActiveTaskId: targetTask.id, createdAt: 2, updatedAt: 2 },
            ],
          }),
        },
        {
          type: 'set',
          key: 'bitacora:r:record-method',
          value: '# Metodo fuente',
        },
        {
          type: 'set',
          key: 'bitacora:r:record-candidate',
          value: '# Clasificar tickets',
        },
      ],
    },
  });
}

test.describe('workspace library reuse', () => {
  test('filters records, opens detail and links a reference without overwriting confirmed fields', async ({ page }) => {
    await seedWorkspace(page);
    await page.goto('/tasks/task-target?overlay=library');

    const dialog = page.getByRole('dialog', { name: 'Biblioteca' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Automatizacion', exact: true }).click();
    await expect(dialog.getByText('Metodo fuente')).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Clasificar tickets' }).click();
    await expect(dialog.getByText(/Hipotesis|Candidato con evidencia/i)).toBeVisible();
    await dialog.getByRole('button', { name: 'Vincular a esta tarea' }).click();

    await expect(page.getByLabel('Avisos del workspace')).toContainText('Referencia vinculada');
    await expect(page.getByRole('heading', { name: 'Tarea destino', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Resultado deseado')).toHaveValue('Mantener datos confirmados');

    await page.getByLabel('Escribe tu mensaje').fill('Guardar despues de vincular');
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Avisos del workspace')).toContainText('Guardado');

    const taskResponse = await page.request.get('/api/storage/bitacora%3At%3Atask-target');
    const storedTask = await taskResponse.json() as { value: string | null };
    const parsedTask = JSON.parse(storedTask.value ?? '{}') as { libraryReferences?: Array<{ recordId: string }> };
    expect(parsedTask.libraryReferences?.map((reference) => reference.recordId)).toContain('record-candidate');
  });
});
