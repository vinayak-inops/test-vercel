import React from 'react';
import { OTApplication } from './types';
import { FiInfo } from 'react-icons/fi';

interface ReadMoreProps {
  item: OTApplication;
  onClose: () => void;
}

export default function ReadMore({ item, onClose }: ReadMoreProps) {
  return (
    <div className="p-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[16px] font-bold leading-tight">OT Application Details</span>
          <span className="text-[14px] text-gray-600">Detailed view of the overtime application.</span>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiInfo className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">OT Application Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{item.date}</span></div>
            <div><span className="text-gray-500">Overtime:</span> <span className="font-medium text-gray-900">{item.overtime}</span></div>
            <div><span className="text-gray-500">Shift Code:</span> <span className="font-medium text-gray-900">{item.shiftCode}</span></div>
            <div><span className="text-gray-500">Remarks:</span> <span className="font-medium text-gray-900">{item.remarks}</span></div>
            <div><span className="text-gray-500">Applied Date:</span> <span className="font-medium text-gray-900">{item.appliedDate}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
} 