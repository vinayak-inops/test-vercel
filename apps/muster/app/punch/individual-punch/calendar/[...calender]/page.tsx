import PunchCalender from "./_components/punch-calender";

export default function Home() {
   

  // Sample attendance data (from form selection)
  const sampleAttendanceData = {
    employeeId: "EMP001",
    fromDate: "2025-01-06",
    toDate: "2025-01-16",
  }
    return (
      <div className="flex px-12">
        <div className="w-full overflow-y-auto scrollbar-hide">
            <PunchCalender attendanceData={sampleAttendanceData} />
        </div>
      </div>
    );
  }
  