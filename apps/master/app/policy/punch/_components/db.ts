import Dexie, { Table } from 'dexie';
import { PunchApplication } from './types';

export class PunchDB extends Dexie {
  punchApplications!: Table<PunchApplication, string>;

  constructor() {
    super('PunchDB');
    this.version(1).stores({
      punchApplications: 'id',
    });
  }
}

export const db = new PunchDB(); 