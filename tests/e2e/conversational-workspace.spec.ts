import { expect, test, type Page } from '@playwright/test';
import { buildPhaseRevision } from '../../app/features/tasks/domain/task-assistant-rules';
import { repairTask } from '../../app/features/tasks/domain/task.schema';

const INDEX_KEY = 'bitacora:index';

async function seedConversationalTask(page: Page, id: string) {
  const task = {
    id,
    projectId: 'project-conversation',
    nombre: 'Conversación estructurada',
    directiva: 'Confirmar propuestas sin sobrescribir',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: {
      linaje: [{ origen: '', resultado: '' }],
      dudas: '',
      checkMapeo: false,
      confirmacion: false,
      resultadoDeseado: '',
      alcance: '',
      restricciones: '',
      actores: [],
      criterioExito: '',
      analisisProblema: {
        problemaDetectado: '',
        evidencia: '',
        analisis: '',
        decision: 'pendiente',
        justificacion: '',
        problemaVigente: '',
      },
    },
  };

  await page.request.put(`/api/storage/${encodeURIComponent(`bitacora:t:${id}`)}`, {
    data: { value: JSON.stringify(task) },
  });
  await page.request.put(`/api/storage/${encodeURIComponent(INDEX_KEY)}`, {
    data: {
      value: JSON.stringify({
        tareas: [{
          id,
          projectId: task.projectId,
          nombre: task.nombre,
          fase: task.fase,
          estado: task.estado,
          tipo: task.tipo,
        }],
        registros: [],
      }),
    },
  });
}

async function sendChatMessage(page: Page, text: string) {
  const composer = page.getByLabel('Escribe tu mensaje');
  await composer.fill(text);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
}

async function seedTypedProposal(page: Page, id: string) {
  const task = repairTask({
    id,
    projectId: 'project-conversation',
    nombre: 'Propuesta tipada',
    directiva: 'Editar actores sin degradar el tipo',
    fase: 1,
    estado: 'activa',
    tipo: 'protocolo',
    f1: {
      actores: ['Ana'],
    },
  });
  const baseRevision = buildPhaseRevision(task, 1);
  task.assistant.messages = [{
    id: 'assistant-typed-proposal',
    projectId: task.projectId,
    taskId: task.id,
    phase: 1,
    methodVersionId: null,
    baseRevision,
    role: 'assistant',
    parts: [{ type: 'text', text: 'Revisa los actores sugeridos.' }],
    status: 'sent',
    createdAt: 100,
    primaryQuestion: null,
    contradictions: [],
    updates: [{
      id: 'proposal-actors',
      sourceMessageId: 'assistant-typed-proposal',
      projectId: task.projectId,
      taskId: task.id,
      phase: 1,
      methodVersionId: null,
      baseRevision,
      status: 'proposed',
      field: 'f1.actores',
      previousValue: ['Ana'],
      value: ['Ana', 'Luis'],
    }],
  }];

  await page.request.put(`/api/storage/${encodeURIComponent(`bitacora:t:${id}`)}`, {
    data: { value: JSON.stringify(task) },
  });
  await page.request.put(`/api/storage/${encodeURIComponent(INDEX_KEY)}`, {
    data: {
      value: JSON.stringify({
        tareas: [{
          id,
          projectId: task.projectId,
          nombre: task.nombre,
          fase: task.fase,
          estado: task.estado,
          tipo: task.tipo,
        }],
        registros: [],
      }),
    },
  });
}

test.describe('US2 conversational proposals', () => {
  test('hides the structured summary while no confirmed data or action is useful', async ({ page }) => {
    await seedConversationalTask(page, 'conversation-empty');
    await page.goto('/tasks/conversation-empty');

    await expect(page.getByRole('heading', { name: /Resumen de etapa/i })).toHaveCount(0);
  });

  test('keeps proposals pending and makes chat, direct edits and mixed decisions converge on the same fields', async ({ page }) => {
    await seedConversationalTask(page, 'conversation-proposals');
    await page.goto('/tasks/conversation-proposals');

    const problemField = page.getByRole('textbox', { name: 'Problema detectado', exact: true });
    const evidenceField = page.getByRole('textbox', { name: 'Evidencia', exact: true });

    await sendChatMessage(page, 'problema: Demoras del proceso');
    const firstProposal = page.getByRole('group', { name: 'Propuesta para Problema detectado' }).last();
    await expect(firstProposal).toBeVisible();
    await expect(firstProposal).toContainText('Demoras del proceso');
    await expect(firstProposal).toContainText('Sin valor confirmado');
    await expect(problemField).toHaveValue('');

    await firstProposal.getByRole('button', { name: 'Aceptar propuesta' }).click();
    await expect(problemField).toHaveValue('problema: Demoras del proceso');

    await sendChatMessage(page, 'evidencia: Hay 12 minutos de espera');
    const evidenceProposal = page.getByRole('group', { name: 'Propuesta para Evidencia' }).last();
    await evidenceProposal.getByLabel('Editar propuesta para Evidencia').fill('Medición corregida: 12 minutos');
    await evidenceProposal.getByRole('button', { name: 'Editar propuesta' }).click();
    await expect(evidenceField).toHaveValue('Medición corregida: 12 minutos');

    await problemField.fill('Edición humana prioritaria');
    await sendChatMessage(page, 'problema: Inferencia posterior');
    const rejectedProposal = page.getByRole('group', { name: 'Propuesta para Problema detectado' }).last();
    await rejectedProposal.getByRole('button', { name: 'Descartar propuesta' }).click();
    await expect(problemField).toHaveValue('Edición humana prioritaria');

    await page.reload();
    await expect(problemField).toHaveValue('Edición humana prioritaria');
    await expect(evidenceField).toHaveValue('Medición corregida: 12 minutos');
  });

  test('preserves typed proposal values when the person edits an array', async ({ page }) => {
    await seedTypedProposal(page, 'conversation-typed');
    await page.goto('/tasks/conversation-typed');

    const proposal = page.getByRole('group', { name: 'Propuesta para Actores' });
    await expect(proposal).toBeVisible();
    await proposal.getByLabel('Editar propuesta para Actores').fill('["Ana"');
    await proposal.getByRole('button', { name: 'Editar propuesta' }).click();
    await expect(proposal.getByRole('alert')).toContainText('JSON válido');
    await expect(page.getByRole('textbox', { name: 'Actores involucrados (uno por línea)' }))
      .toHaveValue('Ana');

    await proposal.getByLabel('Editar propuesta para Actores').fill('["Ana","Luis","Marta"]');
    await proposal.getByRole('button', { name: 'Editar propuesta' }).click();

    await expect(page.getByRole('textbox', { name: 'Actores involucrados (uno por línea)' }))
      .toHaveValue('Ana\nLuis\nMarta');
  });
});
