import Database from 'better-sqlite3';
import { openDatabase, type DatabaseOptions } from '../utils/database';
import { storageKeySchema } from '../../shared/schemas/storage';
import type { StorageRow } from '../../shared/types/storage';
import type { StorageBatchOperation } from '../../shared/contracts/storage';

export class KvStoreRepository {
  readonly db: Database.Database;

  constructor(options: DatabaseOptions = {}, db?: Database.Database) {
    this.db = db || openDatabase(options);
  }

  get(key: string): StorageRow | null {
    storageKeySchema.parse(key);
    const row = this.db.prepare(
      'SELECT key, value, updated_at AS updatedAt FROM kv_store WHERE key = ?',
    ).get(key) as StorageRow | undefined;
    return row || null;
  }

  set(key: string, value: string): void {
    storageKeySchema.parse(key);
    this.db.prepare(`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `).run(key, value);
  }

  delete(key: string): void {
    storageKeySchema.parse(key);
    this.db.prepare('DELETE FROM kv_store WHERE key = ?').run(key);
  }

  executeBatch(operations: StorageBatchOperation[]): void {
    this.transaction(() => {
      for (const operation of operations) {
        if (operation.type === 'set') {
          if (!('value' in operation)) {
            throw new Error('batch set operation requires value');
          }
          this.set(operation.key, typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value));
          continue;
        }

        if (operation.type === 'delete') {
          this.delete(operation.key);
          continue;
        }

        throw new Error(`unsupported operation: ${operation.type}`);
      }
    });
  }

  transaction<T>(work: () => T): T {
    return this.db.transaction(work)();
  }

  close(): void {
    if (this.db.open) this.db.close();
  }
}

export function createKvStoreRepository(options: DatabaseOptions = {}): KvStoreRepository {
  return new KvStoreRepository(options);
}
