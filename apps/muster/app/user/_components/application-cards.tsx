"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock3, Users, Activity } from 'lucide-react';

const getPunchUrl = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `/punch/individual-punch/calendar/information?employeeId=EMP001&month=${month}&year=${year}`;
};

const cards = [
  {
    title: 'Leave Application',
    description: 'Request annual, sick, or special leave with a few clicks.',
    button: 'Apply for Leave',
    icon: <CalendarDays className="h-7 w-7 text-[#0092fb]" />, // main icon
    route: '/user/leave-application',
    iconBg: 'bg-[#e6f3fd]',
  },
  {
    title: 'Punch Application',
    description: 'Submit manual punch or correction requests easily.',
    button: 'Apply for Punch',
    icon: <Clock3 className="h-7 w-7 text-[#0061ff]" />,
    route: getPunchUrl,
    iconBg: 'bg-[#e6f3fd]',
  },
  {
    title: 'Shift Application',
    description: 'Request shift changes and manage your work schedule.',
    button: 'Apply for Shift',
    icon: <Users className="h-7 w-7 text-[#0092fb]" />,
    route: '/user/shift-application',
    iconBg: 'bg-[#e6f3fd]',
  },
  {
    title: 'OT Application',
    description: 'Apply for overtime work and track your extra hours.',
    button: 'Apply for OT',
    icon: <Activity className="h-7 w-7 text-[#0061ff]" />,
    route: '/user/ot-application',
    iconBg: 'bg-[#e6f3fd]',
  },
];

const ApplicationCards: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-full mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Manage Your Applications</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
        {cards.map((card) => {
          // Support dynamic route for punch card
          const route = typeof card.route === 'function' ? card.route() : card.route;
          return (
            <div
              key={card.title}
              className="group flex flex-col items-start rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer relative p-8 min-h-[320px]"
              onClick={() => router.push(route)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter') router.push(route); }}
            >
              {/* Icon */}
              <div className={`mb-6 rounded-full ${card.iconBg} flex items-center justify-center w-14 h-14 shadow-sm`}>
                {card.icon}
              </div>
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{card.title}</h3>
              {/* Description */}
              <p className="text-gray-500 text-sm mb-8 flex-1">{card.description}</p>
              {/* Button */}
              <button
                className="w-full rounded-lg bg-[#0092fb] text-white font-semibold py-3 text-base hover:bg-[#0061ff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0092fb]"
                onClick={e => { e.stopPropagation(); router.push(route); }}
                type="button"
              >
                {card.button}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationCards; 