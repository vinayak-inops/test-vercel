"use client"
import React, { useEffect, useState } from 'react';
import PunchForm from './_components/PunchForm';
import PunchList from './_components/PunchList';
import { PunchApplication } from './_components/types';
import { db } from './_components/db';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import SemiPopupWrapper from '@repo/ui/components/popupwrapper/semi-popup-wrapper';
import ReadMore from './_components/ReadMore';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function PunchPage() {
  const [data, setData] = useState<PunchApplication[]>([]);
  const [editing, setEditing] = useState<PunchApplication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [readMoreItem, setReadMoreItem] = useState<PunchApplication | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const fetchData = async () => {
    const all = await db.punchApplications.toArray();
    setData(all);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (item: PunchApplication) => {
    await db.punchApplications.put(item);
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item: PunchApplication) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await db.punchApplications.delete(id);
    fetchData();
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleReadMore = (item: PunchApplication) => {
    setReadMoreItem(item);
    setShowReadMore(true);
  };

  return (
    <div className="p-8  bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <TopTitleDescription titleValue={{ title: 'Punch Application Management', description: '' }} />
        <div className="flex gap-2">
          <button
            className="btn btn-sm text-white font-semibold text-base rounded-md px-4 py-2"
            style={{ backgroundColor: '#0061ff', borderColor: '#0061ff' }}
            onClick={handleAdd}
          >
            + Add Punch
          </button>
        </div>
      </div>
      <SemiPopupWrapper
        open={showForm}
        setOpen={setShowForm}
        content={{
          title: 'Punch Application',
          description: 'Fill in the details for the punch application below.'
        }}
      >
        <div className="flex-1 flex  overflow-auto">
          <PunchForm
            initialValues={editing || {}}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SemiPopupWrapper>
      <SemiPopupWrapper
        open={showReadMore}
        setOpen={setShowReadMore}
        content={{
          title: 'Punch Application Details',
          description: 'Detailed view of the punch application.'
        }}
      >
        {readMoreItem && <ReadMore item={readMoreItem} onClose={() => setShowReadMore(false)} />}
      </SemiPopupWrapper>
      <div className="min-w-0 overflow-x-auto">
        <PunchList data={data} onEdit={handleEdit} onDelete={handleDelete} onReadMore={handleReadMore} />
      </div>
    </div>
  );
}
