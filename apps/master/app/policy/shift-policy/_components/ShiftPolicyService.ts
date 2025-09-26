import { ShiftPolicy } from './ShiftPolicyTypes';

let shiftPolicies: ShiftPolicy[] = [];

export function getShiftPolicies(): Promise<ShiftPolicy[]> {
  return Promise.resolve(shiftPolicies);
}

export function addShiftPolicy(policy: ShiftPolicy): Promise<void> {
  shiftPolicies.push(policy);
  return Promise.resolve();
}

export function updateShiftPolicy(updatedPolicy: ShiftPolicy): Promise<void> {
  shiftPolicies = shiftPolicies.map(policy =>
    policy.id === updatedPolicy.id ? updatedPolicy : policy
  );
  return Promise.resolve();
}

export function deleteShiftPolicy(id: string): Promise<void> {
  shiftPolicies = shiftPolicies.filter(policy => policy.id !== id);
  return Promise.resolve();
} 