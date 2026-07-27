import { libraryRecordSummarySchema, type LibraryRecord, type LibraryRecordSummary } from '../domain/library-record.schema';

const STORAGE_KEYS = {
  index: 'bitacora:index',
  record: (id: string) => `bitacora:r:${id}`,
  task: (id: string) => `bitacora:t:${id}`,
};

export type LibraryStorage = { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void>; delete(key: string): Promise<void> };

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
  return {
    list: summaries,
    async read(id: string): Promise<LibraryRecord | null> {
      const summary = (await summaries()).find(item => item.id === id);
      const markdown = await storage.get(STORAGE_KEYS.record(id));
      if (!markdown) return null;
      return summary ? { ...summary, markdown } : { id, titulo: 'Registro', taskId: id, markdown };
    },
    async reuseTemplate(id: string): Promise<Record<string, unknown> | null> {
      const summary = (await summaries()).find(item => item.id === id);
      if (!summary?.taskId) return null;
      const raw = await storage.get(STORAGE_KEYS.task(summary.taskId));
      if (!raw) return null;
      try { return JSON.parse(raw) as Record<string, unknown>; } catch { return null; }
    },
  };
}
