import React from 'react';
import { ShiftPolicy } from './ShiftPolicyTypes';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ShiftPolicyTableProps {
  policies: ShiftPolicy[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ShiftPolicyTable: React.FC<ShiftPolicyTableProps> = ({ policies, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Shift Duration</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Active</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {policies.map((policy) => (
            <tr key={policy.id} className="hover:bg-blue-50 transition">
              <td className="px-6 py-3 whitespace-nowrap text-base text-gray-800">{policy.title}</td>
              <td className="px-6 py-3 whitespace-nowrap text-base text-gray-800">{policy.shiftDuration}</td>
              <td className="px-6 py-3 whitespace-nowrap text-base text-gray-800">{policy.shiftStartTime}</td>
              <td className="px-6 py-3 whitespace-nowrap">
                <span
                  className={`inline-block w-10 h-6 rounded-full transition-colors duration-200 ${policy.active ? 'bg-green-400' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block w-4 h-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform duration-200 ${policy.active ? 'translate-x-4' : ''}`}
                  />
                </span>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-right">
                <button
                  onClick={() => onEdit(policy.id)}
                  className="inline-flex items-center p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 mr-2 transition"
                  title="Edit"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(policy.id)}
                  className="inline-flex items-center p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftPolicyTable; 