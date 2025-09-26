import React, { useState, useMemo } from 'react';
import { PunchApplication } from './types';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

interface PunchListProps {
  data: PunchApplication[];
  onEdit: (item: PunchApplication) => void;
  onDelete: (id: string) => void;
  onReadMore: (item: PunchApplication) => void;
}

export default function PunchList({ data, onEdit, onDelete, onReadMore }: PunchListProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      item.employee.toLowerCase().includes(search.toLowerCase()) ||
      item.comments.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : filtered.map(i => i.id));
  };

  const toggleOne = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  // Example: totals for numeric fields (if needed)
  const totals = useMemo(() => {
    return {
      count: filtered.length,
    };
  }, [filtered]);

  return (
    <div className="bg-white rounded-xl shadow p-4 text-sm">
      {/* Header controls: filter and search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 pb-2 border-b border-gray-200 text-sm">
        <div className="flex gap-2 items-center">
          <button className="flex items-center gap-1 px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none h-10">
            <span className="material-icons text-base text-[#0061ff]">filter_list</span> <span className="text-[#0061ff] font-medium">Filter</span>
          </button>
          <select className="rounded-md border border-gray-200 bg-white text-gray-700 text-sm px-4 py-2 focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] h-10">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex-1 md:flex-none flex justify-end">
          <input
            type="text"
            placeholder="Search"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-[#0061ff] focus:border-[#0061ff] outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 0 }}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 bg-gray-50 shadow sticky top-0 z-10 text-base font-semibold">
              <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-20 whitespace-nowrap " style={{ minWidth: '48px' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-[#0061ff]" />
              </th>
              <th className="px-4 py-3 text-left sticky left-12 bg-gray-50 z-20 border-l-4 border-[#0061ff] whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '170px' }}>
                Name
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '150px' }}>Attendance Date</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Reason</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '110px' }}>Status</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Punched Time</th>
                <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Swipe Mode</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '160px' }}>Transaction Time</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '190px' }}>Comments</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '180px' }}>Second-Punched Time</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '180px' }}>Second-Swipe Mode</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '210px' }}>Second-Transaction Time</th>
              <th className="px-4 py-3 text-center whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-6 text-gray-400">No records found.</td>
              </tr>
            )}
            {filtered.map((item, idx) => (
              <tr key={item.id} className={
                `border-b last:border-b-0 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`
              }>
                <td className="px-4 py-3 sticky left-0 bg-white z-10" style={{ minWidth: '48px' }}>
                  <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)} className="accent-[#0061ff]" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-12 bg-white z-10 border-l-4 border-[#0061ff]" style={{ minWidth: '170px' }}>
                  {item.employee}
                </td>
                <td className="px-4 py-3" style={{ minWidth: '150px' }}>{item.attendanceDate}</td>
                <td className="px-4 py-3" style={{ minWidth: '130px' }}>{item.reasonCode}</td>
                <td className="px-4 py-3" style={{ minWidth: '110px' }}>
                  {item.deleted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span> Inactive
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f0ff] text-[#0061ff]">
                      <span className="w-2 h-2 bg-[#0061ff] rounded-full inline-block"></span> Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" style={{ minWidth: '130px' }}>{item.punchedTime}</td>
                <td className="px-4 py-3" style={{ minWidth: '130px' }}>{item.swipeMode}</td>
                <td className="px-4 py-3" style={{ minWidth: '160px' }}>{item.transactionTime}</td>
                <td className="px-4 py-3" style={{ minWidth: '190px' }}>{item.comments}</td>
                <td className="px-4 py-3" style={{ minWidth: '180px' }}>{item.secondPunchedTime || '-'}</td>
                <td className="px-4 py-3" style={{ minWidth: '180px' }}>{item.secondSwipeMode || '-'}</td>
                <td className="px-4 py-3" style={{ minWidth: '210px' }}>{item.secondTransactionTime || '-'}</td>
                <td className="px-4 py-3 text-center" style={{ minWidth: '130px' }}>
                  <button
                    className="mr-2 focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }}
                    onClick={() => onEdit(item)}
                    title="Edit"
                    aria-label="Edit"
                    type="button"
                  >
                    <FiEdit2 size={20} color="#0061ff" />
                  </button>
                  <button
                    className="mr-2 focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }}
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    aria-label="Delete"
                    type="button"
                  >
                    <FiTrash2 size={20} color="#e02424" />
                  </button>
                  <button
                    className="focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }}
                    onClick={() => onReadMore(item)}
                    title="Read More"
                    aria-label="Read More"
                    type="button"
                  >
                    <FiEye size={20} color="#0061ff" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2 text-gray-700">Total</td>
              <td className="px-4 py-2 text-right" colSpan={11}>{totals.count} record(s)</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
} 