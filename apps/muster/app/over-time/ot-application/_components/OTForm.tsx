import React, { useState, useEffect } from 'react';
import { OTApplication } from './types';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';

interface OTFormProps {
  initialValues?: Partial<OTApplication>;
  onSubmit: (data: OTApplication) => void;
  onCancel?: () => void;
}

export default function OTForm({ initialValues = {}, onSubmit, onCancel }: OTFormProps) {
  const [form, setForm] = useState<OTApplication>({
    id: initialValues.id || '',
    date: initialValues.date || '',
    overtime: initialValues.overtime || 0,
    shiftCode: initialValues.shiftCode || '',
    remarks: initialValues.remarks || '',
    appliedDate: initialValues.appliedDate || '',
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    setForm({
      id: initialValues.id || '',
      date: initialValues.date || '',
      overtime: initialValues.overtime || 0,
      shiftCode: initialValues.shiftCode || '',
      remarks: initialValues.remarks || '',
      appliedDate: initialValues.appliedDate || '',
    });
  }, [initialValues]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.date) errs.date = 'Required';
    if (!form.overtime) errs.overtime = 'Required';
    if (!form.shiftCode) errs.shiftCode = 'Required';
    if (!form.remarks) errs.remarks = 'Required';
    if (!form.appliedDate) errs.appliedDate = 'Required';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'overtime' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({ ...form, id: form.id || crypto.randomUUID() });
    }
  };

  return (
    <form className="w-full p-6" onSubmit={handleSubmit}>
      <TopTitleDescription titleValue={{ title: 'OT Application Details', description: 'Enter the details for the overtime application.' }} />
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Date<span className="text-red-500">*</span></label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
            {errors.date && <div className="text-red-500 text-xs mt-1">{errors.date}</div>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Overtime<span className="text-red-500">*</span></label>
              <input type="number" name="overtime" value={form.overtime} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.overtime && <div className="text-red-500 text-xs mt-1">{errors.overtime}</div>}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Shift Code<span className="text-red-500">*</span></label>
              <input name="shiftCode" value={form.shiftCode} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.shiftCode && <div className="text-red-500 text-xs mt-1">{errors.shiftCode}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-sm">Remarks<span className="text-red-500">*</span></label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm resize-none min-h-[48px] transition hover:border-[#0061ff]" />
            {errors.remarks && <div className="text-red-500 text-xs mt-1">{errors.remarks}</div>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-semibold text-sm">Applied Date<span className="text-red-500">*</span></label>
              <input type="date" name="appliedDate" value={form.appliedDate} onChange={handleChange} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] focus:shadow-lg shadow-sm transition hover:border-[#0061ff]" />
              {errors.appliedDate && <div className="text-red-500 text-xs mt-1">{errors.appliedDate}</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8 justify-end mb-6">
        <button type="submit" className="px-6 py-2 mb-6 rounded-md font-semibold text-white" style={{ backgroundColor: '#0061ff' }}>Save</button>
        {onCancel && <button type="button" className="px-6 mb-6 py-2 rounded-md font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
} 