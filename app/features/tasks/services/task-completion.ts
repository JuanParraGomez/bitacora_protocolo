import { STORAGE_KEYS, type StorageBatchOperation } from '../../../../shared/contracts/storage';
import { buildMarkdown, currentMethodVersion } from '../domain/task-rules';
import { repairTask, taskIndexSchema, type Task, type TaskIndex } from '../domain/task.schema';

export type LegacyStorage = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  batch?(operations: StorageBatchOperation[]): Promise<void>;
};

const FALLBACK_INDEX: TaskIndex = { tareas: [], registros: [] };

function normalizeProjectId(raw: unknown): string {
  return typeof raw === 'string' && raw.trim().length > 0 ? raw : 'legacy';
}

function parseIndex(raw: string | null): TaskIndex {
  if (!raw) return FALLBACK_INDEX;
  try {
    const parsed = JSON.parse(raw);
    const repaired = taskIndexSchema.safeParse(parsed);
    if (repaired.success) return repaired.data;
  } catch { /* preserve */ }

  return FALLBACK_INDEX;
}

function normalizeMethodVersions(task: Task): Task['methodVersions'] {
  return task.methodVersions.map((version) => ({ ...version }));
}

function normalizeTask(task: Task): Task {
  const methodVersions = normalizeMethodVersions(task);
  const repaired = repairTask({
    ...task,
    estado: 'completada',
    projectId: normalizeProjectId((task as { projectId?: unknown }).projectId),
  });
  return {
    ...repaired,
    projectId: normalizeProjectId(repaired.projectId),
    methodVersions,
  };
}

type GeneratedLibraryRecord = {
  id: string;
  summary: TaskIndex['registros'][number];
  markdown: string;
};

function slugify(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'registro';
}

function automationEvidenceFor(opportunity: Task['automationOpportunities'][number]) {
  const occurrenceCount = opportunity.occurrenceIterationIds.length;
  return {
    status: occurrenceCount >= 2 ? 'candidate-with-evidence' : 'hypothesis',
    occurrenceCount,
  } as const;
}

function buildMethodRecord(task: Task, projectId: string, methodVersionId: string | null): GeneratedLibraryRecord {
  return {
    id: task.id,
    summary: {
      id: task.id,
      titulo: task.f4.titulo || task.nombre,
      tareaId: task.id,
      taskId: task.id,
      projectId,
      resourceKind: 'method',
      sourceTaskId: task.id,
      sourceMethodVersionId: methodVersionId,
      automationEvidence: null,
    },
    markdown: buildMarkdown(task),
  };
}

function buildToolRecords(task: Task, projectId: string, methodVersionId: string | null): GeneratedLibraryRecord[] {
  const version = currentMethodVersion(task);
  const tools = [...new Set((version?.tools ?? [])
    .map((tool) => tool.trim())
    .filter((tool) => tool.length > 0 && tool.toLowerCase() !== 'sin definir'))];

  return tools.map((tool) => ({
    id: `${task.id}:tool:${slugify(tool)}`,
    summary: {
      id: `${task.id}:tool:${slugify(tool)}`,
      titulo: tool,
      tareaId: task.id,
      taskId: task.id,
      projectId,
      resourceKind: 'tool',
      sourceTaskId: task.id,
      sourceMethodVersionId: methodVersionId,
      automationEvidence: null,
    },
    markdown: [
      `# Herramienta: ${tool}`,
      '',
      `Proyecto: ${projectId}`,
      `Tarea origen: ${task.nombre}`,
      `Metodo origen: ${methodVersionId ?? 'sin version activa'}`,
      '',
      task.f4.cambio ? `Uso observado: ${task.f4.cambio}` : 'Uso observado: [pendiente]',
    ].join('\n'),
  }));
}

function buildLearningRecord(task: Task, projectId: string, methodVersionId: string | null): GeneratedLibraryRecord | null {
  const learnings = task.f3.iteraciones
    .map((iteration) => iteration.learning.trim())
    .filter((learning) => learning.length > 0);
  if (!learnings.length && !task.f4.cambio.trim() && !task.f4.conexiones.trim()) {
    return null;
  }

  return {
    id: `${task.id}:learning`,
    summary: {
      id: `${task.id}:learning`,
      titulo: `Aprendizajes de ${task.f4.titulo || task.nombre}`,
      tareaId: task.id,
      taskId: task.id,
      projectId,
      resourceKind: 'learning',
      sourceTaskId: task.id,
      sourceMethodVersionId: methodVersionId,
      automationEvidence: null,
    },
    markdown: [
      `# Aprendizajes de ${task.f4.titulo || task.nombre}`,
      '',
      ...(learnings.length ? learnings.map((learning, index) => `${index + 1}. ${learning}`) : ['1. [sin aprendizaje registrado]']),
      '',
      `Cambio consolidado: ${task.f4.cambio || '[pendiente]'}`,
      `Conexiones: ${task.f4.conexiones || '[pendiente]'}`,
    ].join('\n'),
  };
}

function buildAutomationRecords(task: Task, projectId: string, methodVersionId: string | null): GeneratedLibraryRecord[] {
  return task.automationOpportunities
    .filter((opportunity) => !methodVersionId || opportunity.methodVersionId === methodVersionId)
    .map((opportunity) => {
      const evidence = automationEvidenceFor(opportunity);
      return {
        id: `${task.id}:automation:${opportunity.id}`,
        summary: {
          id: `${task.id}:automation:${opportunity.id}`,
          titulo: opportunity.candidateTool || opportunity.output || `Oportunidad ${opportunity.id}`,
          tareaId: task.id,
          taskId: task.id,
          projectId,
          resourceKind: 'automation-candidate',
          sourceTaskId: task.id,
          sourceMethodVersionId: methodVersionId,
          automationEvidence: evidence,
        },
        markdown: [
          `# Oportunidad de automatizacion: ${opportunity.candidateTool || opportunity.output || opportunity.id}`,
          '',
          `Clasificacion: ${opportunity.classification}`,
          `Estado de evidencia: ${evidence.status}`,
          `Frecuencia: ${opportunity.frequency || '[pendiente]'}`,
          `Estabilidad: ${opportunity.stability || '[pendiente]'}`,
          `Riesgo: ${opportunity.risk || '[pendiente]'}`,
          `Juicio humano: ${opportunity.humanJudgment || '[pendiente]'}`,
          `Disparador: ${opportunity.trigger || '[pendiente]'}`,
          `Entradas: ${opportunity.inputs.join(', ') || '[pendiente]'}`,
          `Transformacion: ${opportunity.transformation || '[pendiente]'}`,
          `Salida: ${opportunity.output || '[pendiente]'}`,
          `Herramienta candidata: ${opportunity.candidateTool || '[pendiente]'}`,
          `Fallos previsibles: ${opportunity.expectedFailures.join(', ') || '[pendiente]'}`,
          `Punto de supervision humana: ${opportunity.humanCheckpoint || '[pendiente]'}`,
        ].join('\n'),
      };
    });
}

function buildLibraryRecords(task: Task): GeneratedLibraryRecord[] {
  const projectId = normalizeProjectId((task as { projectId?: unknown }).projectId);
  const methodVersionId = currentMethodVersion(task)?.id ?? task.f4.methodVersionId ?? null;
  const learning = buildLearningRecord(task, projectId, methodVersionId);

  return [
    buildMethodRecord(task, projectId, methodVersionId),
    ...buildToolRecords(task, projectId, methodVersionId),
    ...(learning ? [learning] : []),
    ...buildAutomationRecords(task, projectId, methodVersionId),
  ];
}

function buildNextIndex(task: Task, current: TaskIndex, records: GeneratedLibraryRecord[]): TaskIndex {
  const projectId = normalizeProjectId((task as { projectId?: unknown }).projectId);
  const tareas = current.tareas.filter((item) => item.id !== task.id);
  const registros = [
    ...records.map((record) => record.summary),
    ...current.registros.filter((record) => {
      const sourceTaskId = record.sourceTaskId || record.taskId || record.tareaId;
      return sourceTaskId !== task.id && record.id !== task.id;
    }),
  ];

  return {
    ...current,
    tareas,
    registros,
  };
}

async function runBatch(storage: LegacyStorage, operations: StorageBatchOperation[]): Promise<void> {
  if (storage.batch) {
    await storage.batch(operations);
    return;
  }

  for (const operation of operations) {
    if (operation.type === 'set') {
      await storage.set(operation.key, typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value ?? null));
      continue;
    }

    await storage.delete(operation.key);
  }
}

export async function completeTask(storage: LegacyStorage, task: Task): Promise<TaskIndex> {
  const normalizedTask = normalizeTask(task);
  const indexRaw = await storage.get(STORAGE_KEYS.index);
  const currentIndex = parseIndex(indexRaw);
  const generatedRecords = buildLibraryRecords(normalizedTask);
  const nextIndex = buildNextIndex(normalizedTask, currentIndex, generatedRecords);
  const serializedTask = JSON.stringify(normalizedTask);
  const staleRecordIds = currentIndex.registros
    .filter((record) => (record.sourceTaskId || record.taskId || record.tareaId) === task.id)
    .map((record) => record.id)
    .filter((id) => !generatedRecords.some((generated) => generated.id === id));

  await runBatch(storage, [
    ...staleRecordIds.map((recordId) => ({ type: 'delete', key: STORAGE_KEYS.record(recordId) } as StorageBatchOperation)),
    ...generatedRecords.map((record) => ({ type: 'set', key: STORAGE_KEYS.record(record.id), value: record.markdown } as StorageBatchOperation)),
    { type: 'set', key: STORAGE_KEYS.task(task.id), value: serializedTask },
    { type: 'set', key: STORAGE_KEYS.index, value: JSON.stringify(nextIndex) },
  ]);

  return nextIndex;
}
