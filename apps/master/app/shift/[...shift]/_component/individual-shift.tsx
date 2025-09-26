"use client"

import { useEffect, useState } from "react"
import EmployeeInfoPanel from "./employee-info-panel"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import IndividualShiftList from "./individual-shift-list"
import IndividualShiftCardFilter from "./individula-shift-card-filter"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

interface ShiftEvent {
  id: string
  type: "shift-start" | "shift-end" | "break-start" | "break-end" | "overtime"
  count: number
  employee: string
  day: number
  shiftCode: string
  shiftName: string
}

interface WorkingStats {
  monthly: number
  weekly: number
  daily: number
}

interface EmployeeInfo {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  joinDate: string
  manager: string
  location: string
  avatar?: string
  currentShift?: string
}

interface ShiftRequest {
  employeeId: string
  fromDate: string
  toDate: string
}

interface IndividualShiftProps {
  employeeInfo?: EmployeeInfo
  shiftData?: ShiftRequest
}

export default function IndividualShift({ employeeInfo, shiftData }: IndividualShiftProps) {
  // State for events and API data
  const [filteredEvents, setFilteredEvents] = useState<ShiftEvent[]>([])
  const [shiftDataFromAPI, setShiftDataFromAPI] = useState<any>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [hasInitialData, setHasInitialData] = useState(false)
  const [employeeIdFromUrl, setEmployeeIdFromUrl] = useState<string | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

  // Filter state management
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All Shifts")
  const [shiftGroupCode, setShiftGroupCode] = useState("")
  const [shiftName, setShiftName] = useState("")
  const [shiftCode, setShiftCode] = useState("")
  const [isShiftZoneFormOpen, setIsShiftZoneFormOpen] = useState(false)
  const [editShiftData, setEditShiftData] = useState<any | null>(null)


  // Get values from URL query parameters
  let employeeID = null;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    console.log("params", params);
    console.log("window.location.search", window.location.search);

    // Check for named parameters first
    employeeID = params.get('employeeId') || params.get('employeeID');

    // If no named parameter found, check for direct employee ID in query string
    if (!employeeID && window.location.search) {
      // Remove the '?' from the search string
      const queryString = window.location.search.substring(1);
      console.log("queryString", queryString);

      // Check if the query string looks like an employee ID (e.g., "EMP001")
      if (queryString && /^[A-Z]+\d+$/.test(queryString)) {
        employeeID = queryString;
        console.log("Found employee ID in query string:", employeeID);
      }
    }

    // If still no employee ID found, check the URL path
    if (!employeeID) {
      const pathSegments = window.location.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      console.log("lastSegment", lastSegment);
      // Check if the last segment looks like an employee ID
      if (lastSegment && /^[A-Z]+\d+$/.test(lastSegment)) {
        employeeID = lastSegment;
        console.log("Found employee ID in path:", employeeID);
      }
    }
  }

  const {
    data,
    error,
    loading,
    refetch
  } = useRequest<any[]>({
    url: `map/employee_shift/search?employeeID=${employeeID}`,
    method: 'GET',
    onSuccess: (data: any) => {
     
    },
    onError: (error) => {
      
    },
  });

  useEffect(() => {
    if (employeeID) {
      refetch();
    }
  }, [employeeID]);

  // Extract employeeId from URL on client side only
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const empId = params.get('employeeId') || undefined;
      setEmployeeIdFromUrl(empId);
    }
  }, []);

  // Monitor when initial data is available
  useEffect(() => {
    // Set a timeout to ensure we wait for backend data
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000); // Minimum loading time

    // Check if we have employee ID to start loading
    if (employeeIdFromUrl) {
      setHasInitialData(true);
    }

    return () => clearTimeout(timer);
  }, [employeeIdFromUrl]);

  // Additional effect to handle data readiness
  useEffect(() => {
    if (employeeIdFromUrl && !isInitialLoading) {
      setHasInitialData(true);
    }
  }, [employeeIdFromUrl, isInitialLoading]);

  // Calculate working statistics from filtered events
  const calculateWorkingStats = (): WorkingStats => {
    if (!filteredEvents || filteredEvents.length === 0) {
      return { monthly: 0, weekly: 0, daily: 0 }
    }

    // Calculate total working hours from shift events
    const workingDays = new Set(filteredEvents.map((event: ShiftEvent) => event.day)).size
    const totalWorkingHours = filteredEvents.reduce((total: number, event: ShiftEvent) => {
      if (event.type === "shift-start" || event.type === "shift-end") {
        // Assuming 8 hours per day for shift events
        return total + 8
      }
      return total
    }, 0)

    // Calculate averages
    const daily = workingDays > 0 ? Math.round(totalWorkingHours / workingDays) : 0
    const weekly = daily * 5 // Assuming 5 working days per week
    const monthly = daily * 22 // Assuming 22 working days per month

    return {
      monthly,
      weekly,
      daily
    }
  }
  const workingStats = calculateWorkingStats()

  // Calculate total working hours for the current month from shiftDataFromAPI
  const getTotalMonthlyWorkingHours = () => {
    if (
      !shiftDataFromAPI ||
      !Array.isArray(shiftDataFromAPI) ||
      shiftDataFromAPI.length === 0
    ) {
      return 0;
    }

    const shiftRecord = shiftDataFromAPI[0];
    if (!shiftRecord?.shiftDetails) return 0;

    const totalMinutes = shiftRecord.shiftDetails.reduce(
      (sum: number, detail: any) =>
        typeof detail.hoursWorked === "number" ? sum + detail.hoursWorked : sum,
      0
    );

    return Math.round(totalMinutes / 60); // Convert minutes to hours
  };
  const totalMonthlyWorkingHours = getTotalMonthlyWorkingHours();

  // Show loading state while waiting for initial setup or during hydration
  // if (!isMounted || isInitialLoading || !hasInitialData || !employeeIdFromUrl) {
  //     return (
  //     <div className="space-y-0">
  //         <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
  //         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
  //             <div className="flex items-center justify-center space-x-4">
  //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //             <div className="text-lg font-medium text-gray-700">
  //                 {!isMounted ? "Loading..." : 
  //                 !employeeIdFromUrl ? "Waiting for employee ID..." : "Initializing employee shift data..."}
  //             </div>
  //             </div>
  //         </div>
  //         </div>

  //         {/* Loading state for Calendar */}
  //         <div className="w-full pt-6">
  //         <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
  //             <div className="p-6">
  //             <div className="flex items-center justify-center space-x-4">
  //                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  //                 <div className="text-md font-medium text-gray-700">Loading shift calendar...</div>
  //             </div>
  //             </div>
  //         </div>
  //         </div>
  //     </div>
  //     );
  // }

  return (
    <div className="space-y-0">
      <ToastContainer />

      {/* Employee Information Panel */}
      <EmployeeInfoPanel
        employeeInfo={employeeInfo}
        filteredEvents={filteredEvents}
        workingStats={workingStats}
        shiftData={shiftData}
        employeeId={employeeIdFromUrl}
        totalMonthlyWorkingHours={totalMonthlyWorkingHours}
      />
      <div className="pt-6 relative z-10">
        <IndividualShiftCardFilter
          filterDropdownOpen={filterDropdownOpen}
          setFilterDropdownOpen={setFilterDropdownOpen}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          shiftGroupCode={shiftGroupCode}
          setShiftGroupCode={setShiftGroupCode}
          shiftName={shiftName}
          setShiftName={setShiftName}
          shiftCode={shiftCode}
          setShiftCode={setShiftCode}
          activeShiftsCount={3}
          isShiftZoneFormOpen={isShiftZoneFormOpen}
          setIsShiftZoneFormOpen={setIsShiftZoneFormOpen}
          onShiftZoneAdded={() => { }}
          editShiftData={editShiftData}
          setEditShiftData={setEditShiftData}
          existingShiftGroupCodes={["A", "B", "C"]}
          existingShiftGroupNames={["First Shift", "Second Shift", "Night Shift"]}
        />
      </div>
      <div className="mt-6">
        <IndividualShiftList
          shiftData={(data || []).reverse()}
          shiftGroupCode={shiftGroupCode}
          shiftName={shiftName}
          shiftCode={shiftCode}
          selectedFilter={selectedFilter}
        />
      </div>

    </div>
  )
}