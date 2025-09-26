"use client"

import { useEffect, useState } from "react"
import EmployeeInfoPanel from "./employee-info-panel"
import AttendanceCalendar from "./attendance-calendar"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface LoginEvent {
  id: string
  type: "login" | "logout" | "missing-login" | "missing-logout"
  count: number
  employee: string
  day: number
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
}

interface AttendanceRequest {
  employeeId: string
  fromDate: string
  toDate: string
}

interface LoginCalendarProps {
  employeeInfo?: EmployeeInfo
  attendanceData?: AttendanceRequest
}

export default function LoginCalendar({ employeeInfo, attendanceData }: LoginCalendarProps) {
  // State for events and API data
  const [filteredEvents, setFilteredEvents] = useState<LoginEvent[]>([])
  const [attendanceDataFromAPI, setAttendanceDataFromAPI] = useState<any>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [hasInitialData, setHasInitialData] = useState(false)
  const [employeeIdFromUrl, setEmployeeIdFromUrl] = useState<string | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

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
    // Calculate total working hours from login/logout events
    const workingDays = new Set(filteredEvents.map((event: LoginEvent) => event.day)).size
    const totalWorkingHours = filteredEvents.reduce((total: number, event: LoginEvent) => {
      if (event.type === "login" || event.type === "logout") {
        // Assuming 8 hours per day for login/logout events
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

  // Calculate total working hours for the current month from attendanceDataFromAPI
  const getTotalMonthlyWorkingHours = () => {
    if (
      !attendanceDataFromAPI ||
      !Array.isArray(attendanceDataFromAPI) ||
      attendanceDataFromAPI.length === 0
    ) {
      return 0;
    }
    const attendanceRecord = attendanceDataFromAPI[0];
    if (!attendanceRecord?.attendanceDetails) return 0;
    const totalMinutes = attendanceRecord.attendanceDetails.reduce(
      (sum: number, detail: any) =>
        typeof detail.hoursWorked === "number" ? sum + detail.hoursWorked : sum,
      0
    );
    return Math.round(totalMinutes / 60); // Convert minutes to hours
  };
  const totalMonthlyWorkingHours = getTotalMonthlyWorkingHours();

  // Show loading state while waiting for initial setup or during hydration
  if (!isMounted || isInitialLoading || !hasInitialData || !employeeIdFromUrl) {
    return (
      <div className="space-y-0">
        {/* Loading state for Employee Information Panel */}
        <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg font-medium text-gray-700">
                {!isMounted ? "Loading..." : 
                 !employeeIdFromUrl ? "Waiting for employee ID..." : "Initializing employee data..."}
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading state for Calendar */}
        <div className="w-full pt-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div className="text-md font-medium text-gray-700">Loading calendar...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Employee Information Panel */}
      <EmployeeInfoPanel 
        employeeInfo={employeeInfo} 
        filteredEvents={filteredEvents}
        workingStats={workingStats}
        attendanceData={attendanceData}
        employeeId={employeeIdFromUrl}
        totalMonthlyWorkingHours={totalMonthlyWorkingHours}
      />
      {/* Calendar Component */}
      <div className="w-full pt-6">
        <AttendanceCalendar 
          filteredEvents={filteredEvents}
          attendanceData={attendanceData}
        />
      </div>
    </div>
  )
}
