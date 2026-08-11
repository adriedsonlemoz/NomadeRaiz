import Dexie, { type Table } from 'dexie';

export interface KeyValueRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

class NomadeDatabase extends Dexie {
  kv!: Table<KeyValueRecord, string>;

  constructor() {
    super('nomade-raiz');
    this.version(1).stores({
      kv: '&key,updatedAt',
    });
  }
}

export const db = new NomadeDatabase();
