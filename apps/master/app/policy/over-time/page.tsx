"use client"
import React, { useEffect, useState, Suspense } from 'react';
import OTPolicyForm from './_components/OTPolicyForm';
import OTPolicyList from './_components/OTPolicyList';
import ReadMore from './_components/ReadMore';
import { OTPolicyApplication } from './_components/types';
import { db } from './_components/db';
import TopTitleDescription from '@repo/ui/components/titleline/top-title-discription';
import SemiPopupWrapper from '@repo/ui/components/popupwrapper/semi-popup-wrapper';
import BigPopupWrapper from '@repo/ui/components/popupwrapper/big-popup-wrapper';
import OverTimePage from './_components/over-time-page';

function OverTimePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverTimePage />
    </Suspense>
  );
}

export default function OTPolicyPage() {
  const [data, setData] = useState<OTPolicyApplication[]>([]);
  const [editing, setEditing] = useState<OTPolicyApplication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [readMoreItem, setReadMoreItem] = useState<OTPolicyApplication | null>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const fetchData = async () => {
    const all = await db.otPolicies.toArray();
    setData(all);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (item: OTPolicyApplication) => {
    if (item._id) {
      const { _id, ...changes } = item;
      await db.otPolicies.update(_id, changes);
    } else {
      await db.otPolicies.add(item);
    }
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item: OTPolicyApplication) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      await db.otPolicies.delete(id);
      fetchData();
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleReadMore = (item: OTPolicyApplication) => {
    setReadMoreItem(item);
    setShowReadMore(true);
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full max-w-7xl">
      <OverTimePageWrapper />
      </div>
    </div>
  );
}