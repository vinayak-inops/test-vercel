"use client"
import EmployeeInfoPanel from "../../calendar/[...calender]/_components/employee-info-panel";
import AttendanceCalendar from "../../calendar/[...calender]/_components/attendance-calendar";
import FileManager from "./_components/file-manager";


export default function Home() {
  

  let employeeIdFromUrl: string | undefined = undefined;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    employeeIdFromUrl = params.get('employeeId') || undefined;
  }
    

    return (
        <div className=" px-12">
            <div className="w-full overflow-y-auto scrollbar-hide">
                {/* Employee Information Panel */}
                <EmployeeInfoPanel
                employeeId={employeeIdFromUrl}
                />
            </div>
            <FileManager />
        </div>
    );
}
