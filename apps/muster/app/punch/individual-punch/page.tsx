"use client"

import { useRouter } from "next/navigation";
import AttendancePopup from "../_components/attendance-popup";
import PunchCalendar from "../_components/punch-calendar";

export default function Home() {
  const router = useRouter();

  const handleClose = () => {
    router.push("http://localhost:3006/muster/punch");
  };

  return (
    <div className="w-full px-12 h-full">
      <AttendancePopup isOpen={true} onClose={handleClose} onSubmit={() => {}} />
      <div className=" py-4 ">
        <PunchCalendar />
      </div>
    </div>
  );
}
