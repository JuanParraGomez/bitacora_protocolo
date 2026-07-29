import { describe, expect, it, vi } from 'vitest';

import { useWorkspaceNotices } from './useWorkspaceNotices';

describe('useWorkspaceNotices', () => {
  it('deduplicates notices by operationId and keeps the latest content', () => {
    const noticesApi = useWorkspaceNotices();

    noticesApi.pushNotice({
      operationId: 'save-task-1',
      title: 'Guardado',
      message: 'Primera versión',
      tone: 'success',
    });

    noticesApi.pushNotice({
      operationId: 'save-task-1',
      title: 'Guardado',
      message: 'Versión final',
      tone: 'success',
    });

    expect(noticesApi.notices.value).toHaveLength(1);
    expect(noticesApi.notices.value[0]).toMatchObject({
      operationId: 'save-task-1',
      title: 'Guardado',
      message: 'Versión final',
      tone: 'success',
    });
  });

  it('caps the list, dismisses notices, and retries the associated operation once', async () => {
    const noticesApi = useWorkspaceNotices();
    const retry = vi.fn().mockResolvedValue(undefined);

    noticesApi.pushNotice({
      operationId: 'save-a',
      title: 'Guardado A',
      message: 'Mensaje A',
      tone: 'success',
    });
    noticesApi.pushNotice({
      operationId: 'save-b',
      title: 'Guardado B',
      message: 'Mensaje B',
      tone: 'success',
    });
    noticesApi.pushNotice({
      operationId: 'save-c',
      title: 'Guardado C',
      message: 'Mensaje C',
      tone: 'success',
    });
    noticesApi.pushNotice({
      operationId: 'save-d',
      title: 'Guardado D',
      message: 'Mensaje D',
      tone: 'success',
    });

    expect(noticesApi.notices.value).toHaveLength(3);
    expect(noticesApi.notices.value.map((notice) => notice.operationId)).toEqual(['save-d', 'save-c', 'save-b']);

    const dismissedNoticeId = noticesApi.notices.value[1]?.id;
    expect(dismissedNoticeId).toBeDefined();
    if (dismissedNoticeId) {
      noticesApi.dismissNotice(dismissedNoticeId);
    }
    expect(noticesApi.notices.value.map((notice) => notice.operationId)).toEqual(['save-d', 'save-b']);

    const retryNoticeId = noticesApi.pushNotice({
      operationId: 'save-error',
      title: 'No se pudo guardar',
      message: 'El cambio quedó en memoria.',
      tone: 'error',
      urgent: true,
      retryLabel: 'Reintentar',
      onRetry: retry,
    });

    await noticesApi.retryNotice(retryNoticeId);
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
