import { STORAGE_KEYS } from '../../../../shared/contracts/storage';
import type { LegacyStorage } from './task-completion';

export async function deleteTask(storage: LegacyStorage, id: string, options: { confirm?: boolean } = {}): Promise<void> {
  if (!options.confirm) throw new Error('Deletion requires explicit confirmation');
  await storage.delete(STORAGE_KEYS.task(id));
}
