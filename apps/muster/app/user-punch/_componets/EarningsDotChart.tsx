import React from 'react';
import { BarChart2 } from 'lucide-react';

// Static data to match the blood sugar chart image
const data = [
  { date: 'Jul 24', value: 70, type: 'normal' },
  { date: 'Jul 25', value: 80, type: 'normal' },
  { date: 'Jul 26', value: 90, type: 'normal' },
  { date: 'Jul 27', value: 100, type: 'normal' },
  { date: 'Jul 28', value: 60, type: 'recent' },
  { date: 'Jul 29', value: 120, type: 'high' },
  { date: 'Jul 30', value: 50, type: 'recent' },
  { date: 'Aug 3', value: 80, type: 'normal' },
  { date: 'Aug 6', value: 110, type: 'high' },
];

const getBarColor = (type: string) => {
  if (type === 'recent') return 'bg-blue-500';
  if (type === 'high') return 'bg-red-300';
  return 'bg-blue-200';
};

const MAX_Y = 120;
const Y_AXIS_LABELS = [0, 20, 40, 60, 80, 100, 120];

const EarningsDotChart: React.FC = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6 w-full max-w-xl mx-auto transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-gray-500" size={20} />
          <span className="font-semibold text-gray-700 text-lg">Blood Sugar</span>
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1 text-xs font-medium text-gray-600">
            <option>MG / DL</option>
          </select>
          <select className="border rounded px-2 py-1 text-xs font-medium text-gray-600">
            <option>Past 7 Days</option>
          </select>
        </div>
      </div>
      {/* Stats */}
      <div className="flex items-end gap-8 mb-2">
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-tight">50.0
            <span className="text-xs font-medium text-gray-400 ml-1">mg/dl</span>
          </div>
          <div className="text-xs text-gray-500">Recent Reading</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 leading-tight">89.1
            <span className="text-xs font-medium text-gray-400 ml-1">mg/dl</span>
          </div>
          <div className="text-xs text-gray-500">7 Day Average</div>
        </div>
      </div>
      {/* Chart */}
      <div className="relative h-36 flex items-end gap-2 mb-2">
        {/* Y-axis grid lines */}
        {Y_AXIS_LABELS.map((y) => (
          <div
            key={y}
            className="absolute left-0 w-full border-t border-dashed border-gray-200"
            style={{ bottom: `${(y / MAX_Y) * 100}%` }}
          >
            <span className="absolute -left-8 text-xs text-gray-300">{y}</span>
          </div>
        ))}
        {/* Bars */}
        <div className="flex w-full h-full items-end gap-2 z-10">
          {data.map((d, i) => (
            <div key={i} className="flex flex-col items-center w-7">
              <div
                className={`rounded-t-md ${getBarColor(d.type)}`}
                style={{
                  height: `${(d.value / MAX_Y) * 100}%`,
                  minHeight: 8,
                  width: 18,
                  transition: 'height 0.3s',
                }}
              ></div>
              <span className="text-[10px] text-gray-400 mt-1">{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsDotChart; 