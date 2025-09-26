import React, { useState } from 'react';
import { ShiftPolicy } from './ShiftPolicyTypes';

interface ShiftPolicyFormProps {
  initialValues: ShiftPolicy;
  onSubmit: (values: ShiftPolicy) => void;
  onCancel?: () => void;
}

export const ShiftPolicyForm: React.FC<ShiftPolicyFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [values, setValues] = useState<ShiftPolicy>(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!values.title) newErrors.title = 'Title is required';
    if (!values.shiftDuration) newErrors.shiftDuration = 'Shift Duration is required';
    if (!values.workingHrs1stHalf) newErrors.workingHrs1stHalf = 'Working Hrs in 1st-Half is required';
    if (!values.workingHrs2ndHalf) newErrors.workingHrs2ndHalf = 'Working Hrs in 2nd-Half is required';
    if (!values.shiftStartTime) newErrors.shiftStartTime = 'Shift Start Time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 md:p-8 shadow-inner space-y-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Shift Policy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
            required
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={values.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2"
          />
        </div>
        <div className="col-span-2 flex flex-wrap gap-6 mb-2">
          <label className="inline-flex items-center font-medium text-gray-700">
            <input type="checkbox" name="active" checked={values.active} onChange={handleChange} className="mr-2 accent-blue-600" />
            Active
          </label>
          <label className="inline-flex items-center font-medium text-gray-700">
            <input type="checkbox" name="isPreviousDayShift" checked={values.isPreviousDayShift} onChange={handleChange} className="mr-2 accent-blue-600" />
            Is Previous Day Shift
          </label>
          <label className="inline-flex items-center font-medium text-gray-700">
            <input type="checkbox" name="isNextDayShift" checked={values.isNextDayShift} onChange={handleChange} className="mr-2 accent-blue-600" />
            Is Next Day Shift
          </label>
          <label className="inline-flex items-center font-medium text-gray-700">
            <input type="checkbox" name="isBreakShift" checked={values.isBreakShift} onChange={handleChange} className="mr-2 accent-blue-600" />
            Is Break Shift
          </label>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Shift Duration (H:M)<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="shiftDuration"
            value={values.shiftDuration}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.shiftDuration ? 'border-red-500' : ''}`}
            required
          />
          {errors.shiftDuration && <p className="text-red-500 text-xs mt-1">{errors.shiftDuration}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Working Hrs in 1st-Half (H:M)<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="workingHrs1stHalf"
            value={values.workingHrs1stHalf}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.workingHrs1stHalf ? 'border-red-500' : ''}`}
            required
          />
          {errors.workingHrs1stHalf && <p className="text-red-500 text-xs mt-1">{errors.workingHrs1stHalf}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Working Hrs in 2nd-Half (H:M)<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="workingHrs2ndHalf"
            value={values.workingHrs2ndHalf}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.workingHrs2ndHalf ? 'border-red-500' : ''}`}
            required
          />
          {errors.workingHrs2ndHalf && <p className="text-red-500 text-xs mt-1">{errors.workingHrs2ndHalf}</p>}
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Shift Start Time<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="shiftStartTime"
            value={values.shiftStartTime}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base px-3 py-2 ${errors.shiftStartTime ? 'border-red-500' : ''}`}
            required
          />
          {errors.shiftStartTime && <p className="text-red-500 text-xs mt-1">{errors.shiftStartTime}</p>}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
        >
          Save
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ShiftPolicyForm; 