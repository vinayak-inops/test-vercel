import { User, Folder, ListTodo, PercentCircle } from "lucide-react";
import React from "react";

interface InfoCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}

const cards: InfoCard[] = [
  {
    label: "Active Employees",
    value: 547,
    icon: <User size={22} />, 
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    label: "Number of Projects",
    value: 339,
    icon: <Folder size={22} />, 
    iconBg: "bg-green-100 text-green-600",
  },
  {
    label: "Number of Task",
    value: 147,
    icon: <ListTodo size={22} />, 
    iconBg: "bg-yellow-100 text-yellow-600",
  },
  {
    label: "Target Percentage Completed",
    value: "89.75%",
    icon: <PercentCircle size={22} />, 
    iconBg: "bg-purple-100 text-purple-600",
  },
];

export default function OTApprovalInfoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[180px] transition-transform hover:scale-[1.03] hover:shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 tracking-wide">
              {card.label}
            </span>
            <span className={`rounded-full p-2 ${card.iconBg} flex items-center justify-center`}>
              {card.icon}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
