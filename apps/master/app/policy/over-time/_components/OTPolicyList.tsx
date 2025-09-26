import React, { useState, useMemo } from 'react';
import { OTPolicyApplication } from './types';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

interface OTPolicyListProps {
  data: OTPolicyApplication[];
  onEdit: (item: OTPolicyApplication) => void;
  onDelete: (id: string) => void;
  onReadMore: (item: OTPolicyApplication) => void;
}

export default function OTPolicyList({ data, onEdit, onDelete, onReadMore }: OTPolicyListProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(item =>
      item.otPolicy?.otPolicyCode?.toLowerCase().includes(searchLower) ||
      item.otPolicy?.otPolicyName?.toLowerCase().includes(searchLower) ||
      item.organizationCode?.toLowerCase().includes(searchLower) ||
      item.tenantCode?.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : filtered.map(i => i._id || ''));
  };

  const toggleOne = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 pb-2 border-b border-gray-200 text-sm">
        <div className="flex gap-2 items-center">
          <button className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50">
            <span className="material-icons text-base text-[#0061ff]">filter_list</span>
            <span className="text-[#0061ff] font-medium">Filter</span>
          </button>
          <select className="rounded-md border border-gray-200 bg-white text-gray-700 text-sm px-4 py-2 focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff]">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex-1 md:flex-none flex justify-end">
          <input
            type="text"
            placeholder="Search policies..."
            className="rounded-md border border-gray-200 px-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 bg-gray-50 shadow sticky top-0 z-10 text-base font-semibold">
              <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-20 whitespace-nowrap" style={{ minWidth: '48px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#0061ff]" />
              </th>
              <th className="px-4 py-3 text-left sticky left-12 bg-gray-50 z-20 border-l-4 border-[#0061ff] whitespace-nowrap text-sm font-semibold" style={{ minWidth: '170px' }}>
                Policy Code
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap text-sm font-semibold" style={{ minWidth: '170px' }}>
                Policy Name
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap text-sm font-semibold" style={{ minWidth: '170px' }}>
                Subsidiary
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap text-sm font-semibold" style={{ minWidth: '170px' }}>
                Location
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap text-sm font-semibold" style={{ minWidth: '110px' }}>
                Status
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap text-sm font-semibold" style={{ minWidth: '130px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  No policies found
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr
                  key={item._id}
                  className={`border-b last:border-b-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item._id || '')}
                      onChange={() => toggleOne(item._id || '')}
                      className="accent-[#0061ff]"
                    />
                  </td>
                  <td className="px-4 py-3">{item.otPolicy.otPolicyCode}</td>
                  <td className="px-4 py-3">{item.otPolicy.otPolicyName}</td>
                  <td className="px-4 py-3">{item.subsidiary.subsidiaryName}</td>
                  <td className="px-4 py-3">{item.location.locationName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.otPolicy.status === 'active'
                          ? 'bg-[#e6f0ff] text-[#0061ff]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${
                          item.otPolicy.status === 'active'
                            ? 'bg-[#0061ff]'
                            : 'bg-red-500'
                        }`}
                      />
                      {item.otPolicy.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(item)}
                      className="mr-2 text-[#0061ff] hover:text-[#0052cc]"
                      title="Edit"
                    >
                      <FiEdit2 size={20} />
                    </button>
                    <button
                      onClick={() => onDelete(item._id || '')}
                      className="mr-2 text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FiTrash2 size={20} />
                    </button>
                    <button
                      onClick={() => onReadMore(item)}
                      className="text-[#0061ff] hover:text-[#0052cc]"
                      title="View Details"
                    >
                      <FiEye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total: {filtered.length} policies</span>
          <span>Selected: {selected.length} policies</span>
        </div>
      </div>
    </div>
  );
} 