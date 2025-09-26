import Dexie, { Table } from 'dexie';
import { OTPolicyApplication } from './types';

export class OTPolicyDatabase extends Dexie {
  otPolicies!: Table<OTPolicyApplication>;

  constructor() {
    super('OTPolicyDB');
    this.version(1).stores({
      otPolicies: '++_id, organizationCode, tenantCode, otPolicy.otPolicyCode'
    });
  }
}

export const db = new OTPolicyDatabase(); 