import React from "react";
import { Clock, UserCheck, Calendar, FileText, X, Printer } from "lucide-react";

function ValueBadge({ value, color = "blue" }: { value: string; color?: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold bg-${color}-100 text-${color}-700 border border-${color}-200`}>{value}</span>
  );
}

export default function ShiftViewModal({ shift, isOpen, onClose }: { shift: any; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !shift) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-100/60 to-white/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-0 relative overflow-y-auto max-h-[90vh] print:border-0 print:shadow-none print:max-w-full print:rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl border-b border-blue-200 print:bg-white print:border-0 print:rounded-none">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide print:text-blue-700">Employer Shift Information</h2>
              <div className="text-blue-100 text-xs mt-1 print:text-gray-500">PDF Preview</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="hidden print:hidden md:inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition text-sm"
              onClick={handlePrint}
              title="Print"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              className="text-white hover:bg-blue-700/30 rounded-full p-1 transition-colors text-2xl font-bold print:hidden"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="px-0 py-8 bg-gradient-to-br from-white to-blue-50/40 print:bg-white print:px-0 print:py-4">
          <div className="px-8">
            {/* Section: Shift Info */}
            <div className="mb-6">
              <div className="text-blue-700 font-bold text-lg mb-2 pb-1 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" /> Shift Info
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                <div className="text-xs text-gray-500">Shift Name</div>
                <div className="font-semibold text-gray-800">{shift.shiftName}</div>
                <div className="text-xs text-gray-500">Status</div>
                <div><ValueBadge value={shift.status || "-"} color={shift.status === 'active' ? 'green' : 'gray'} /></div>
                <div className="text-xs text-gray-500">Shift Code</div>
                <div className="font-mono text-blue-700">{shift.shiftCode}</div>
                <div className="text-xs text-gray-500">Flexible</div>
                <div><ValueBadge value={shift.flexible ? "Yes" : "No"} color={shift.flexible ? "green" : "gray"} /></div>
                <div className="text-xs text-gray-500">Cross Day</div>
                <div><ValueBadge value={shift.crossDay ? "Yes" : "No"} color={shift.crossDay ? "green" : "gray"} /></div>
              </div>
            </div>
            {/* Section: Timing */}
            <div className="mb-6">
              <div className="text-blue-700 font-bold text-lg mb-2 border-b border-blue-100 pb-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Timing
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                <div className="text-xs text-gray-500">Main Shift</div>
                <div className="font-mono text-base text-blue-800">{shift.shiftStart} - {shift.shiftEnd}</div>
                <div className="text-xs text-gray-500">Lunch Break</div>
                <div className="font-mono text-base text-blue-800">{shift.lunchStart} - {shift.lunchEnd}</div>
                <div className="text-xs text-gray-500">First Half</div>
                <div className="font-mono text-base text-blue-800">{shift.firstHalfStart} - {shift.firstHalfEnd}</div>
                <div className="text-xs text-gray-500">Second Half</div>
                <div className="font-mono text-base text-blue-800">{shift.secondHalfStart} - {shift.secondHalfEnd}</div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="font-mono text-base text-blue-800">{shift.duration} min</div>
              </div>
            </div>
            {/* Section: Allowances */}
            <div className="mb-6">
              <div className="text-blue-700 font-bold text-lg mb-2 border-b border-blue-100 pb-1 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" /> Allowances & Rules
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2">
                <div className="text-xs text-gray-500">Grace Period</div>
                <div className="font-mono text-base text-blue-800">{shift.graceIn}m in / {shift.graceOut}m out</div>
                <div className="text-xs text-gray-500">Late In Allowed</div>
                <div className="font-mono text-base text-blue-800">{shift.lateInAllowedTime} min</div>
                <div className="text-xs text-gray-500">Early Out Allowed</div>
                <div className="font-mono text-base text-blue-800">{shift.earlyOutAllowedTime} min</div>
                <div className="text-xs text-gray-500">Flexi Full Day Duration</div>
                <div className="font-mono text-base text-blue-800">{shift.flexiFullDayDuration} min</div>
                <div className="text-xs text-gray-500">Flexi Half Day Duration</div>
                <div className="font-mono text-base text-blue-800">{shift.flexiHalfDayDuration} min</div>
                <div className="text-xs text-gray-500">Min Duration for Full Day</div>
                <div className="font-mono text-base text-blue-800">{shift.minimumDurationForFullDay} min</div>
                <div className="text-xs text-gray-500">Min Duration for Half Day</div>
                <div className="font-mono text-base text-blue-800">{shift.minimumDurationForHalfDay} min</div>
                <div className="text-xs text-gray-500">Min Extra Minutes for Extra Hours</div>
                <div className="font-mono text-base text-blue-800">{shift.minimumExtraMinutesForExtraHours} min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 