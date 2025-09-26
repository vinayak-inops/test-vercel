import React, { useState, useMemo } from 'react';
import { OTApplication } from './types';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

interface OTListProps {
  data: OTApplication[];
  onEdit: (item: OTApplication) => void;
  onDelete: (id: string) => void;
  onReadMore: (item: OTApplication) => void;
}

export default function OTList({ data, onEdit, onDelete, onReadMore }: OTListProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter(item =>
      item.remarks.toLowerCase().includes(search.toLowerCase()) ||
      item.shiftCode.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : filtered.map(i => i.id));
  };

  const toggleOne = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const totals = useMemo(() => ({ count: filtered.length }), [filtered]);

  return (
    <div className="bg-white rounded-xl shadow p-4 text-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 pb-2 border-b border-gray-200 text-sm">
        <div className="flex-1 md:flex-none flex justify-end">
          <input
            type="text"
            placeholder="Search remarks or shift code"
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
                Shift Code
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '120px' }}>Date</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '100px' }}>Overtime</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '180px' }}>Remarks</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '120px' }}>Applied Date</th>
              <th className="px-4 py-3 text-center whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No records found.</td>
              </tr>
            )}
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`border-b last:border-b-0 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="px-4 py-3 sticky left-0 bg-white z-10" style={{ minWidth: '48px' }}>
                  <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)} className="accent-[#0061ff]" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-12 bg-white z-10 border-l-4 border-[#0061ff]" style={{ minWidth: '170px' }}>
                  {item.shiftCode}
                </td>
                <td className="px-4 py-3" style={{ minWidth: '120px' }}>{item.date}</td>
                <td className="px-4 py-3" style={{ minWidth: '100px' }}>{item.overtime}</td>
                <td className="px-4 py-3" style={{ minWidth: '180px' }}>{item.remarks}</td>
                <td className="px-4 py-3" style={{ minWidth: '120px' }}>{item.appliedDate}</td>
                <td className="px-4 py-3 text-center" style={{ minWidth: '130px' }}>
                  <button className="mr-2 focus:outline-none" style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }} onClick={() => onEdit(item)} title="Edit" aria-label="Edit" type="button">
                    <FiEdit2 size={20} color="#0061ff" />
                  </button>
                  <button className="mr-2 focus:outline-none" style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }} onClick={() => onDelete(item.id)} title="Delete" aria-label="Delete" type="button">
                    <FiTrash2 size={20} color="#e02424" />
                  </button>
                  <button className="focus:outline-none" style={{ background: 'none', border: 'none', padding: 0, verticalAlign: 'middle' }} onClick={() => onReadMore(item)} title="Read More" aria-label="Read More" type="button">
                    <FiEye size={20} color="#0061ff" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2 text-gray-700">Total</td>
              <td className="px-4 py-2 text-right" colSpan={6}>{totals.count} record(s)</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
} 