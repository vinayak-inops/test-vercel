"use client"
import React, { useEffect, useState } from 'react';
import { ShiftPolicy } from './ShiftPolicyTypes';
import { getShiftPolicies, addShiftPolicy, updateShiftPolicy, deleteShiftPolicy } from './ShiftPolicyService';
import ShiftPolicyTable from './ShiftPolicyTable';
import ShiftPolicyForm from './ShiftPolicyForm';

const emptyPolicy: ShiftPolicy = {
  id: '',
  title: '',
  description: '',
  active: true,
  isPreviousDayShift: false,
  isNextDayShift: false,
  isBreakShift: false,
  shiftDuration: '',
  workingHrs1stHalf: '',
  workingHrs2ndHalf: '',
  shiftStartTime: '',
  shiftEndTime: '',
  firstHalfStartTime: '',
  firstHalfEndTime: '',
  secondHalfStartTime: '',
  secondHalfEndTime: '',
  earlyInDuration: '',
  maxOutDuration: '',
  inGraceDuration: '',
  lateUptoDuration: '',
  earlyGoDuration: '',
  graceOutDuration: '',
  isFlexiShift: false,
  isCoreTimeApplicable: false,
  isAutoShift: false,
  considerShiftStartIfInPunch: false,
};

const ShiftPolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<ShiftPolicy[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<ShiftPolicy | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchPolicies = async () => {
    const data = await getShiftPolicies();
    setPolicies(data);
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAdd = () => {
    setEditingPolicy(null);
    setIsAdding(true);
  };

  const handleEdit = (id: string) => {
    const policy = policies.find(p => p.id === id);
    if (policy) {
      setEditingPolicy(policy);
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteShiftPolicy(id);
    fetchPolicies();
  };

  const handleFormSubmit = async (policy: ShiftPolicy) => {
    if (editingPolicy) {
      await updateShiftPolicy(policy);
    } else {
      await addShiftPolicy({ ...policy, id: Math.random().toString(36).substr(2, 9) });
    }
    setEditingPolicy(null);
    setIsAdding(false);
    fetchPolicies();
  };

  const handleCancel = () => {
    setEditingPolicy(null);
    setIsAdding(false);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Shift Policies</h2>
        <div className="border-b border-gray-200 mb-6" />
        {isAdding || editingPolicy ? (
          <ShiftPolicyForm
            initialValues={editingPolicy || { ...emptyPolicy, id: '' }}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleAdd}
              >
                Add Shift Policy
              </button>
            </div>
            <ShiftPolicyTable
              policies={policies}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ShiftPolicyList; 