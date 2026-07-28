import { libraryRecordSchema, libraryRecordSummarySchema, type LibraryRecord, type LibraryRecordSummary } from '../domain/library-record.schema';

const STORAGE_KEYS = {
  index: 'bitacora:index',
  record: (id: string) => `bitacora:r:${id}`,
  task: (id: string) => `bitacora:t:${id}`,
};

export type LibraryStorage = { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void>; delete(key: string): Promise<void> };
export type LibraryRecordFilters = {
  query?: string;
  projectId?: string | null;
  resourceKinds?: LibraryRecordSummary['resourceKind'][];
};
export type LibraryLinkResult =
  | { status: 'linked' | 'already-linked'; referenceId: string; task: Record<string, unknown> }
  | { status: 'error'; reason: 'record-missing' | 'task-missing' | 'task-invalid' | 'write-failed'; referenceId: null; task: null };

export function sanitizeDownloadName(title: string): string {
  const safe = title.normalize('NFKC').replace(/[^a-z0-9áéíóúñü]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'registro';
  return `${safe}.md`;
}

export function createLibraryStore(storage: LibraryStorage) {
  async function summaries(): Promise<LibraryRecordSummary[]> {
    const raw = await storage.get(STORAGE_KEYS.index);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as { registros?: unknown[] };
      return (parsed.registros || []).flatMap(item => { const result = libraryRecordSummarySchema.safeParse(item); return result.success ? [result.data] : []; });
    } catch { return []; }
  }

  function matchesFilters(record: LibraryRecordSummary, filters: LibraryRecordFilters): boolean {
    const query = filters.query?.trim().toLocaleLowerCase('es') ?? '';
    const matchesQuery = !query
      || record.titulo.toLocaleLowerCase('es').includes(query)
      || (record.tarea?.toLocaleLowerCase('es') ?? '').includes(query);
    const matchesProject = !filters.projectId || record.projectId === filters.projectId;
    const matchesKind = !filters.resourceKinds?.length || filters.resourceKinds.includes(record.resourceKind);
    return matchesQuery && matchesProject && matchesKind;
  }

  return {
    async list(filters: LibraryRecordFilters = {}): Promise<LibraryRecordSummary[]> {
      return (await summaries()).filter((record) => matchesFilters(record, filters));
    },
    async read(id: string): Promise<LibraryRecord | null> {
      const summary = (await summaries()).find(item => item.id === id);
      const markdown = await storage.get(STORAGE_KEYS.record(id));
      if (!markdown) return null;
      return summary
        ? { ...summary, markdown }
        : libraryRecordSchema.parse({ id, titulo: 'Registro', taskId: id, sourceTaskId: id, markdown });
    },
    async reuseTemplate(id: string): Promise<Record<string, unknown> | null> {
      const summary = (await summaries()).find(item => item.id === id);
      if (!summary?.taskId) return null;
      const raw = await storage.get(STORAGE_KEYS.task(summary.taskId));
      if (!raw) return null;
      try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; }
    },
    async linkRecordToTask(taskId: string, recordId: string): Promise<LibraryLinkResult> {
      const [summary, rawTask] = await Promise.all([
        summaries().then((items) => items.find((item) => item.id === recordId) ?? null),
        storage.get(STORAGE_KEYS.task(taskId)),
      ]);
      if (!summary) return { status: 'error', reason: 'record-missing', referenceId: null, task: null };
      if (!rawTask) return { status: 'error', reason: 'task-missing', referenceId: null, task: null };

      let parsedTask: Record<string, unknown>;
      try {
        parsedTask = JSON.parse(rawTask) as Record<string, unknown>;
      } catch {
        return { status: 'error', reason: 'task-invalid', referenceId: null, task: null };
      }

      const referenceId = `library-ref:${recordId}`;
      const currentReferences = Array.isArray(parsedTask.libraryReferences)
        ? parsedTask.libraryReferences.filter((reference): reference is Record<string, unknown> => Boolean(reference) && typeof reference === 'object')
        : [];
      if (currentReferences.some((reference) => reference.id === referenceId || reference.recordId === recordId)) {
        return { status: 'already-linked', referenceId, task: parsedTask };
      }

      const nextTask = {
        ...parsedTask,
        libraryReferences: [...currentReferences, {
        id: referenceId,
        recordId,
        title: summary.titulo,
        projectId: summary.projectId,
        resourceKind: summary.resourceKind,
        sourceTaskId: summary.sourceTaskId,
        sourceMethodVersionId: summary.sourceMethodVersionId,
        linkedAt: Date.now(),
        missing: false,
      }],
      };

      try {
        await storage.set(STORAGE_KEYS.task(taskId), JSON.stringify(nextTask));
      } catch {
        return { status: 'error', reason: 'write-failed', referenceId: null, task: null };
      }

      return { status: 'linked', referenceId, task: nextTask };
    },
  };
}
