export type StorageRow = {
  key: string;
  value: string;
  updatedAt: string;
};

export type StorageHealth = {
  ok: boolean;
  storage: 'available' | 'unavailable';
};
