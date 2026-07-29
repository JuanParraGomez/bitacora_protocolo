import { ref } from 'vue';

export type WorkspaceNoticeTone = 'info' | 'success' | 'error';

export type WorkspaceNotice = {
  id: string;
  operationId: string;
  title: string;
  message: string;
  tone: WorkspaceNoticeTone;
  urgent?: boolean;
  retryLabel?: string;
  onRetry?: (() => void | Promise<void>) | null;
};

export function useWorkspaceNotices() {
  const notices = ref<WorkspaceNotice[]>([]);

  function dismissNotice(id: string) {
    notices.value = notices.value.filter((notice) => notice.id !== id);
  }

  function pushNotice(input: Omit<WorkspaceNotice, 'id'> & { id?: string }) {
    const existing = notices.value.find((notice) => notice.operationId === input.operationId);
    const notice: WorkspaceNotice = {
      id: input.id ?? existing?.id ?? `notice-${input.operationId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      operationId: input.operationId,
      title: input.title,
      message: input.message,
      tone: input.tone,
      urgent: input.urgent ?? false,
      retryLabel: input.retryLabel,
      onRetry: input.onRetry ?? null,
    };
    notices.value = [notice, ...notices.value.filter((item) => item.operationId !== notice.operationId)].slice(0, 3);
    return notice.id;
  }

  async function retryNotice(id: string) {
    const notice = notices.value.find((item) => item.id === id);
    if (!notice?.onRetry) return;
    await notice.onRetry();
  }

  return {
    notices,
    pushNotice,
    dismissNotice,
    retryNotice,
  };
}
