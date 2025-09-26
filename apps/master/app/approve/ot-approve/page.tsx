"use client"
import React, { useState } from 'react';
import OTApprovalTable, { OTApprovalTableItem } from './_components/OTApprovalTable';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import OTApprovalInfoCards from './_components/OTApprovalInfoCards';

const mockData: OTApprovalTableItem[] = [
  {
    id: '1',
    employee: 'John Doe',
    shiftCode: 'A',
    date: '2024-06-01',
    overtime: 2,
    status: 'Pending',
    remarks: '',
  },
  {
    id: '2',
    employee: 'Jane Smith',
    shiftCode: 'B',
    date: '2024-06-02',
    overtime: 3,
    status: 'Approved',
    remarks: 'Well done',
  },
  {
    id: '3',
    employee: 'Alice Brown',
    shiftCode: 'C',
    date: '2024-06-03',
    overtime: 1.5,
    status: 'Rejected',
    remarks: 'Insufficient reason',
  },
];

export default function OTApprovalPage() {
  const [data, setData] = useState<OTApprovalTableItem[]>(mockData);

  // You can add update logic here if needed

  return (
    <div className="p-12 bg-gray-100 min-h-screen">
      <TopTitleDescription titleValue={{ title: 'OT Approval', description: '' }} />
      <OTApprovalInfoCards />
      <OTApprovalTable data={data} />
    </div>
  );
}
