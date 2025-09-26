import React, { useState, useMemo } from 'react';

export interface OTApprovalTableItem {
  id: string;
  employee: string;
  shiftCode: string;
  date: string;
  overtime: number;
  status: string;
  remarks: string;
}

interface OTApprovalTableProps {
  data: OTApprovalTableItem[];
}

const statusOptions = ['Pending', 'Approved', 'Rejected', 'Forwarded'];

export default function OTApprovalTable({ data }: OTApprovalTableProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState<OTApprovalTableItem | null>(null);
  const [localData, setLocalData] = useState<OTApprovalTableItem[]>(data);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return localData;
    return localData.filter(item =>
      item.employee.toLowerCase().includes(search.toLowerCase()) ||
      item.remarks.toLowerCase().includes(search.toLowerCase())
    );
  }, [localData, search]);

  const allSelected = filtered.length > 0 && selected.length === filtered.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : filtered.map(i => i.id));
  };

  const toggleOne = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const totals = useMemo(() => ({ count: filtered.length }), [filtered]);

  const handleView = (item: OTApprovalTableItem) => {
    setPopupItem(item);
    setEditStatus(item.status);
    setEditRemarks(item.remarks);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupItem(null);
  };

  const handleSave = () => {
    if (!popupItem) return;
    setLocalData(prev => prev.map(item =>
      item.id === popupItem.id ? { ...item, status: editStatus, remarks: editRemarks } : item
    ));
    setShowPopup(false);
    setPopupItem(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 text-sm">
      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          Status and remarks updated successfully!
        </div>
      )}
      {/* Header controls: search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 pb-2 border-b border-gray-200 text-sm">
        <div className="flex-1 md:flex-none flex justify-end">
          <input
            type="text"
            placeholder="Search employee or remarks"
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
                Employee
              </th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '120px' }}>Shift</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '120px' }}>Date</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '120px' }}>Overtime</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '110px' }}>Status</th>
              <th className="px-4 py-3 text-left whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '180px' }}>Remarks</th>
              <th className="px-4 py-3 text-center whitespace-nowrap overflow-ellipsis text-sm font-semibold" style={{ minWidth: '130px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">No records found.</td>
              </tr>
            )}
            {filtered.map((item, idx) => (
              <tr key={item.id} className={`border-b last:border-b-0 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="px-4 py-3 sticky left-0 bg-white z-10" style={{ minWidth: '48px' }}>
                  <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleOne(item.id)} className="accent-[#0061ff]" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap sticky left-12 bg-white z-10 border-l-4 border-[#0061ff]" style={{ minWidth: '170px' }}>
                  {item.employee}
                </td>
                <td className="px-4 py-3" style={{ minWidth: '120px' }}>{item.shiftCode}</td>
                <td className="px-4 py-3" style={{ minWidth: '120px' }}>{item.date}</td>
                <td className="px-4 py-3" style={{ minWidth: '120px' }}>{item.overtime}</td>
                <td className="px-4 py-3" style={{ minWidth: '110px' }}>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === 'Rejected' ? 'bg-red-100 text-red-700' : item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-[#e6f0ff] text-[#0061ff]' }`}>
                    <span className={`w-2 h-2 rounded-full inline-block ${item.status === 'Rejected' ? 'bg-red-500' : item.status === 'Approved' ? 'bg-green-500' : 'bg-[#0061ff]'}`}></span> {item.status}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ minWidth: '180px' }}>{item.remarks}</td>
                <td className="px-4 py-3 text-center" style={{ minWidth: '130px' }}>
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleView(item)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2 text-gray-700">Total</td>
              <td className="px-4 py-2 text-right" colSpan={7}>{totals.count} record(s)</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Popup/modal for View button */}
      {showPopup && popupItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={handleClosePopup}
            >
              ×
            </button>
            <div className="mb-4">
              <div className="text-lg font-bold mb-1">OT Application Details</div>
              <div className="text-sm text-gray-500 mb-2">Detailed view of the overtime application.</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div><span className="text-gray-500">Employee:</span> <span className="font-medium text-gray-900">{popupItem.employee}</span></div>
                <div><span className="text-gray-500">Shift:</span> <span className="font-medium text-gray-900">{popupItem.shiftCode}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{popupItem.date}</span></div>
                <div><span className="text-gray-500">Overtime:</span> <span className="font-medium text-gray-900">{popupItem.overtime}</span></div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <select
                    className="ml-2 rounded border px-2 py-1"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Remarks:</span>
                  <input
                    className="ml-2 rounded border px-2 py-1 w-2/3"
                    value={editRemarks}
                    onChange={e => setEditRemarks(e.target.value)}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={handleClosePopup}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 