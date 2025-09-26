import React from 'react';

interface PunchStatsProps {
  total: number;
  today: number;
  active: number;
  deleted: number;
}

export default function PunchStats({ total, today, active, deleted }: PunchStatsProps) {
  const stats = [
    { label: 'Total punches', value: total, icon: '👥' },
    { label: "Today's punches", value: today, icon: '🕒' },
    { label: 'Active employees', value: active, icon: '✅' },
    { label: 'Deleted punches', value: deleted, icon: '🗑️' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => (
        <div key={i} className="flex items-center bg-white rounded-lg border border-gray-200 p-4 gap-4">
          <div className="text-2xl bg-gray-100 rounded-full p-2 flex items-center justify-center" style={{ minWidth: 40, minHeight: 40 }}>{s.icon}</div>
          <div>
            <div className="text-base font-bold" style={{ fontSize: '16px' }}>{s.value}</div>
            <div className="text-gray-500 text-sm" style={{ fontSize: '14px' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 