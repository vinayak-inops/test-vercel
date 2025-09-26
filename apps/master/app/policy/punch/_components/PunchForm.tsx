import React, { useState, useEffect } from 'react';
import { PunchApplication, PunchReason, SwipeMode } from './types';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';

const reasonOptions: PunchReason[] = ['DEFAULT', 'OFFICIAL', 'MEDICAL', 'PERSONAL', 'LUNCH'];
const swipeOptions: SwipeMode[] = ['In', 'Out'];

interface PunchFormProps {
  initialValues?: Partial<PunchApplication>;
  onSubmit: (data: PunchApplication) => void;
  onCancel?: () => void;
}

export default function PunchForm({ initialValues = {}, onSubmit, onCancel }: PunchFormProps) {
  const [form, setForm] = useState<Omit<PunchApplication, 'punchSelection'> & { punchSelection: string }>({
    ...initialValues,
    punchSelection: initialValues.punchSelection || '',
    id: initialValues.id || '',
    employee: initialValues.employee || '',
    attendanceDate: initialValues.attendanceDate || '',
    reasonCode: initialValues.reasonCode || 'DEFAULT',
    deleted: initialValues.deleted ?? false,
    punchedTime: initialValues.punchedTime || '',
    swipeMode: initialValues.swipeMode || 'In',
    transactionTime: initialValues.transactionTime || '',
    comments: initialValues.comments || '',
    secondPunchedTime: initialValues.secondPunchedTime || '',
    secondSwipeMode: initialValues.secondSwipeMode || 'In',
    secondTransactionTime: initialValues.secondTransactionTime || '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    setForm({
      ...initialValues,
      punchSelection: initialValues.punchSelection || '',
      id: initialValues.id || '',
      employee: initialValues.employee || '',
      attendanceDate: initialValues.attendanceDate || '',
      reasonCode: initialValues.reasonCode || 'DEFAULT',
      deleted: initialValues.deleted ?? false,
      punchedTime: initialValues.punchedTime || '',
      swipeMode: initialValues.swipeMode || 'In',
      transactionTime: initialValues.transactionTime || '',
      comments: initialValues.comments || '',
      secondPunchedTime: initialValues.secondPunchedTime || '',
      secondSwipeMode: initialValues.secondSwipeMode || 'In',
      secondTransactionTime: initialValues.secondTransactionTime || '',
    });
  }, [initialValues]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.employee) errs.employee = 'Required';
    if (!form.attendanceDate) errs.attendanceDate = 'Required';
    if (!form.reasonCode) errs.reasonCode = 'Required';
    if (!form.punchedTime) errs.punchedTime = 'Required';
    if (!form.swipeMode) errs.swipeMode = 'Required';
    if (!form.transactionTime) errs.transactionTime = 'Required';
    if (!form.comments) errs.comments = 'Required';
    if (form.punchSelection === 'Fullday') {
      if (!form.secondPunchedTime) errs.secondPunchedTime = 'Required';
      if (!form.secondSwipeMode) errs.secondSwipeMode = 'Required';
      if (!form.secondTransactionTime) errs.secondTransactionTime = 'Required';
    }
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, punchSelection: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({ ...form, id: form.id || crypto.randomUUID(), punchSelection: form.punchSelection as 'Fullday' });
    }
  };

  return (
    <form className="w-full p-6 " onSubmit={handleSubmit}>
      <TopTitleDescription titleValue={{ title: 'Punch Application Details', description: 'Enter the details for the punch application.' }} />
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Employee */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Employee<span className="text-red-500">*</span></label>
            <input name="employee" value={form.employee} onChange={handleChange} placeholder="Enter employee name" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
            {errors.employee && <div className="text-red-500 text-xs mt-1">{errors.employee}</div>}
          </div>
          {/* Attendance Date, Reason Code, Deleted */}
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Attendance Date<span className="text-red-500">*</span></label>
              <input type="date" name="attendanceDate" value={form.attendanceDate} onChange={handleChange} placeholder="Select date" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.attendanceDate && <div className="text-red-500 text-xs mt-1">{errors.attendanceDate}</div>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Reason Code<span className="text-red-500">*</span></label>
              <select name="reasonCode" value={form.reasonCode} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]">
                <option value="">Select a Reason</option>
                {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.reasonCode && <div className="text-red-500 text-xs mt-1">{errors.reasonCode}</div>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Deleted<span className="text-red-500">*</span></label>
              <div className="flex gap-2 mt-2">
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="deleted" value="true" checked={form.deleted} onChange={() => setForm(f => ({ ...f, deleted: true }))} className="accent-[#0061ff]" /> True</label>
                <label className="flex items-center gap-1 text-sm"><input type="radio" name="deleted" value="false" checked={!form.deleted} onChange={() => setForm(f => ({ ...f, deleted: false }))} className="accent-[#0061ff]" /> False</label>
              </div>
            </div>
          </div>
          {/* Comments */}
          <div className="flex flex-col gap-1 h-full">
            <label className="font-semibold text-sm">Comments<span className="text-red-500">*</span></label>
            <textarea name="comments" value={form.comments} onChange={handleChange} placeholder="Enter comments" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm resize-none min-h-[48px] transition hover:border-[#0061ff]" />
            {errors.comments && <div className="text-red-500 text-xs mt-1">{errors.comments}</div>}
          </div>
          {/* Punch Selection (checkbox) */}
          <div className="flex items-center gap-3 mt-2">
            <label className="font-semibold text-sm">Punch Selection:</label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                name="punchSelection"
                checked={form.punchSelection === 'Fullday'}
                onChange={e => setForm(f => ({ ...f, punchSelection: e.target.checked ? 'Fullday' : '' }))}
                className="accent-[#0061ff]"
              />
              Fullday
            </label>
          </div>
          {/* Punched Time, Swipe Mode */}
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Punched Time<span className="text-red-500">*</span></label>
              <input type="time" name="punchedTime" value={form.punchedTime} onChange={handleChange} placeholder="--:--" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.punchedTime && <div className="text-red-500 text-xs mt-1">{errors.punchedTime}</div>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Swipe Mode<span className="text-red-500">*</span></label>
              <select name="swipeMode" value={form.swipeMode} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]">
                <option value="">Select One</option>
                {swipeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.swipeMode && <div className="text-red-500 text-xs mt-1">{errors.swipeMode}</div>}
            </div>
          </div>
          {/* Transaction Time */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Transaction Time<span className="text-red-500">*</span></label>
            <input type="time" name="transactionTime" value={form.transactionTime} onChange={handleChange} placeholder="--:--" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
            {errors.transactionTime && <div className="text-red-500 text-xs mt-1">{errors.transactionTime}</div>}
          </div>
          {/* Second Punch Fields (conditional) */}
          {form.punchSelection === 'Fullday' && <>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-semibold text-sm">Second-Punched Time<span className="text-red-500">*</span></label>
                <input type="time" name="secondPunchedTime" value={form.secondPunchedTime} onChange={handleChange} placeholder="--:--" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
                {errors.secondPunchedTime && <div className="text-red-500 text-xs mt-1">{errors.secondPunchedTime}</div>}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="font-semibold text-sm">Second-Swipe Mode<span className="text-red-500">*</span></label>
                <select name="secondSwipeMode" value={form.secondSwipeMode} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]">
                  <option value="">Select One</option>
                  {swipeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.secondSwipeMode && <div className="text-red-500 text-xs mt-1">{errors.secondSwipeMode}</div>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm">Second-Transaction Time<span className="text-red-500">*</span></label>
              <input type="time" name="secondTransactionTime" value={form.secondTransactionTime} onChange={handleChange} placeholder="--:--" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.secondTransactionTime && <div className="text-red-500 text-xs mt-1">{errors.secondTransactionTime}</div>}
            </div>
          </>}
        </div>
      </div>
      <div className="flex gap-4 mt-8 justify-end mb-6">
        <button type="submit" className="px-6 py-2 mb-6 rounded-md font-semibold text-white" style={{ backgroundColor: '#0061ff' }}>Save</button>
        {onCancel && <button type="button" className="px-6 mb-6 py-2 rounded-md font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
} 