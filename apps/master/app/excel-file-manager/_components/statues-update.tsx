"use client";

import { Package2, Truck, CheckCircle2, Clock4 } from "lucide-react";
import { useState } from "react";
import HFiveTag from "@repo/ui/components/text/h-five-tag"
import Ptag from "@repo/ui/components/text/p-tag"
import HSixTag from "@repo/ui/components/text/h-six-tag"

const orderStatuses = [
  {
    id: 1,
    title: "Order Placed",
    description: "Your order has been confirmed",
    time: "11:30 AM",
    date: "20 Mar 2024",
    icon: Clock4,
    isCompleted: true,
  },
  {
    id: 2,
    title: "Processing",
    description: "Your order is being processed",
    time: "2:45 PM",
    date: "20 Mar 2024",
    icon: Package2,
    isCompleted: true,
  },
  {
    id: 3,
    title: "Shipped",
    description: "Your order is on the way",
    time: "9:15 AM",
    date: "21 Mar 2024",
    icon: Truck,
    isCompleted: false,
  },
  {
    id: 4,
    title: "Delivered",
    description: "Package will be delivered soon",
    time: "Expected by",
    date: "23 Mar 2024",
    icon: CheckCircle2,
    isCompleted: false,
  },
];

const updates = [
  {
    id: 1,
    message: "Package has left the warehouse",
    timestamp: "21 Mar, 9:15 AM",
  },
  {
    id: 2,
    message: "Order processed and ready for shipping",
    timestamp: "20 Mar, 2:45 PM",
  },
  {
    id: 3,
    message: "Order confirmed",
    timestamp: "20 Mar, 11:30 AM",
  },
];

export default function StatuesUpdate() {
  const [activeStatus] = useState(2); // 0-based index for current status

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className=" rounded-lg px-1 mb-6">
            <div className="my-6">
            <HFiveTag textvalue="Projects is the home"/>
            <Ptag textvalue="Find all of your personal and shared designs here. Create a design or folder to get started."/>
            </div>
          {/* Status Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
            {orderStatuses.map((status, index) => (
              <div key={status.id} className="relative flex items-start mb-8">
                <div className={`absolute left-8 -ml-3 h-6 w-6 flex items-center justify-center rounded-full ${index <= activeStatus ? "bg-[#0d47a1] text-white" : "bg-gray-200"}`}>
                  <status.icon className="h-4 w-4 " />
                </div>
                <div className="ml-12">
                <HSixTag textvalue={status.title}/>
                  <Ptag textvalue={status.description}/>
                  <Ptag textvalue={`${status.time} • ${status.date}`}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
}