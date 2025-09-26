import React from 'react';
// import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import { PunchApplication } from './types';
import { FiX, FiUser, FiClock, FiInfo } from 'react-icons/fi';

interface ReadMoreProps {
  item: PunchApplication;
  onClose: () => void;
}

export default function ReadMore({ item, onClose }: ReadMoreProps) {
  return (
    <div className="p-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-[16px] font-bold leading-tight">Punch Application Details</span>
          <span className="text-[14px] text-gray-600">Detailed view of the punch application.</span>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl  overflow-hidden divide-y divide-gray-100">
        {/* Employee Info */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Employee Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{item.employee}</span></div>
            <div><span className="text-gray-500">Attendance Date:</span> <span className="font-medium text-gray-900">{item.attendanceDate}</span></div>
            <div><span className="text-gray-500">Reason Code:</span> <span className="font-medium text-gray-900">{item.reasonCode}</span></div>
            <div><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-900">{item.deleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span> Inactive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f0ff] text-[#0061ff]">
                <span className="w-2 h-2 bg-[#0061ff] rounded-full inline-block"></span> Active
              </span>
            )}</span></div>
          </div>
        </div>
        {/* Punch Details */}
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-[#0061ff]" size={20} />
            <h3 className="text-[14px] font-semibold text-gray-700">Punch Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="text-gray-500">Punched Time:</span> <span className="font-medium text-gray-900">{item.punchedTime}</span></div>
            <div><span className="text-gray-500">Swipe Mode:</span> <span className="font-medium text-gray-900">{item.swipeMode}</span></div>
            <div><span className="text-gray-500">Transaction Time:</span> <span className="font-medium text-gray-900">{item.transactionTime}</span></div>
            <div className="md:col-span-2"><span className="text-gray-500">Comments:</span> <span className="font-medium text-gray-900">{item.comments}</span></div>
          </div>
        </div>
        {/* Second Punch Details if Fullday */}
        {item.punchSelection === 'Fullday' && (
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo className="text-[#0061ff]" size={20} />
              <h3 className="text-[14px] font-semibold text-gray-700">Second Punch Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-gray-500">Second-Punched Time:</span> <span className="font-medium text-gray-900">{item.secondPunchedTime || '-'}</span></div>
              <div><span className="text-gray-500">Second-Swipe Mode:</span> <span className="font-medium text-gray-900">{item.secondSwipeMode || '-'}</span></div>
              <div><span className="text-gray-500">Second-Transaction Time:</span> <span className="font-medium text-gray-900">{item.secondTransactionTime || '-'}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 