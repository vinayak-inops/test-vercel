import Dexie, { Table } from 'dexie';
import { OTApplication } from './types';

export class OTDB extends Dexie {
  otApplications!: Table<OTApplication, string>;

  constructor() {
    super('OTDB');
    this.version(1).stores({
      otApplications: 'id',
    });
  }
}

export const db = new OTDB(); 