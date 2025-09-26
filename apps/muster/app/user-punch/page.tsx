import PunchCalender from "../punch/individual-punch/calendar/[...calender]/_components/punch-calender";

export default function Home() {
    // Sample employee data that would come from your backend
  const sampleEmployeeInfo = {
    id: "EMP001",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    position: "Senior Software Developer",
    joinDate: "2022-03-15",
    manager: "Sarah Johnson",
    location: "New York Office",
    avatar: "/placeholder.svg?height=64&width=64",
  }

  // Sample attendance data (from form selection)
  const sampleAttendanceData = {
    employeeId: "EMP001",
    fromDate: "2025-01-06",
    toDate: "2025-01-16",
  }
    return (
      <div className="flex px-12">
        <div className="w-full overflow-y-auto scrollbar-hide">
            <PunchCalender  employeeInfo={sampleEmployeeInfo} attendanceData={sampleAttendanceData} />
        </div>
      </div>
    );
  }
  