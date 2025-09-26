"use client";

import React from 'react';
import ApplicationCards from './_components/application-cards';

export default function UserPage() {
  return (
    <div className=" bg-gray-50">
      <div className=" px-12 py-6">
        <div className="w-full">

          {/* Application Cards Component */}
          <ApplicationCards />
        </div>
      </div>
    </div>
  );
}
