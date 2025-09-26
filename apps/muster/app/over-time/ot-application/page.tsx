"use client"
import React, { useEffect, useState } from 'react';
import OTForm from './_components/OTForm';
import OTList from './_components/OTList';
import { OTApplication } from './_components/types';
import { db } from './_components/db';
import ReadMore from './_components/ReadMore';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import SemiPopupWrapper from '@repo/ui/components/popupwrapper/semi-popup-wrapper';

export default function OTApplicationPage() {
  const [data, setData] = useState<OTApplication[]>([]);
  const [editing, setEditing] = useState<OTApplication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [readMoreItem, setReadMoreItem] = useState<OTApplication | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const fetchData = async () => {
    const all = await db.otApplications.toArray();
    setData(all);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (item: OTApplication) => {
    await db.otApplications.put(item);
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item: OTApplication) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await db.otApplications.delete(id);
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

  const handleReadMore = (item: OTApplication) => {
    setReadMoreItem(item);
    setShowReadMore(true);
  };

  return (
    <div className="p-8 px-0 bg-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <TopTitleDescription titleValue={{ title: 'OT Application Management', description: '' }} />
        <div className="flex gap-2">
          <button
            className="btn btn-sm text-white font-semibold text-base rounded-md px-4 py-2"
            style={{ backgroundColor: '#0061ff', borderColor: '#0061ff' }}
            onClick={handleAdd}
          >
            + Add OT Application
          </button>
        </div>
      </div>
      <SemiPopupWrapper
        open={showForm}
        setOpen={setShowForm}
        content={{
          title: 'OT Application',
          description: 'Fill in the details for the OT application below.'
        }}
      >
        <div className="flex-1 flex overflow-auto">
          <OTForm
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
          title: 'OT Application Details',
          description: 'Detailed view of the OT application.'
        }}
      >
        {readMoreItem && <ReadMore item={readMoreItem} onClose={() => setShowReadMore(false)} />}
      </SemiPopupWrapper>
      <div className="min-w-0 overflow-x-auto">
        <OTList data={data} onEdit={handleEdit} onDelete={handleDelete} onReadMore={handleReadMore} />
      </div>
    </div>
  );
} 