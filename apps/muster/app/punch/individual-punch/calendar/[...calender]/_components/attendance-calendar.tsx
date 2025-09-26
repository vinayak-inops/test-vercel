"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Search, Calendar } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import PunchFormPopup from "../../../../_components/punch-form-popup"
import PunchRequestsPopup from '../../../../_components/punch-requests-popup'
import NewPunchUpdateForm from "../../../../_components/new-punch-update-form"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import DayDetailsPopup from "./day-details-popup"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


interface LoginEvent {
  id: string
  type: "login" | "logout" | "missing-login" | "missing-logout"
  employee: string
  day: number
  loginTime?: string // e.g., "09:15"
  logoutTime?: string // e.g., "18:00"
  workDurationMinutes?: number // e.g., 495 for 8h 15m
}

interface Holiday {
  id: string
  day: number
  name: string
  reason: string
}

interface AttendanceRequest {
  employeeId: string
  fromDate: string
  toDate: string
}

interface AttendanceDetail {
  date: string
  shiftCode: string
  attendanceID: string
  hoursWorked: number
  lateIn: number
  earlyOut: number
  extraHoursPostShift: number
  extraHoursPreShift: number
  extraHours: number
  personalOut: number
  officialOut: number
  otHours: number
  punchDetails: {
    inPunches: any[]
    outPunches: any[]
    defaultPunches: any[]
  }
}

interface AttendanceRecord {
  _id: string
  id: string
  month: number
  year: number
  attendanceDetails: AttendanceDetail[]
  organizationCode: string
  tenantCode: string
  employeeID: string
}

interface AttendanceCalendarProps {
  filteredEvents: LoginEvent[]
  attendanceData?: AttendanceRequest
  onNewPunchSubmit?: (data: any) => Promise<boolean>
}

export default function AttendanceCalendar({ filteredEvents, attendanceData, onNewPunchSubmit }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // January 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPunchFormOpen, setIsPunchFormOpen] = useState(false)
  const [isPunchRequestsPopupOpen, setIsPunchRequestsPopupOpen] = useState(false)
  const [isNewPunchFormOpen, setIsNewPunchFormOpen] = useState(false)
  const [contractEmployeeData, setContractEmployeeData] = useState<any>(null)
  const [attendanceDataFromAPI, setAttendanceDataFromAPI] = useState<any>(null)
  const [punchFormType, setPunchFormType] = useState<"in" | "out">("in")

  // Get values from URL query parameters
  let year = null, month = null, employeeID = null;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    year = params.get('year');
    month = params.get('month');
    employeeID = params.get('employeeId');

    if (month) month = month.replace(/^0+/, "");
    if (year) year = year.replace(/^0+/, "");
  }

  // Prepare request data based on URL params or fallback to current date and employee
  const getRequestData = () => {
    let reqYear = year || currentDate.getFullYear();
    let reqMonth = month || (currentDate.getMonth() + 1);
    let reqEmployeeId = employeeID || contractEmployeeData?.employeeID || "EMP001";
    return [
      { field: "year", operator: "eq", value: reqYear },
      { field: "month", operator: "eq", value: reqMonth },
      { field: "employeeID", operator: "eq", value: reqEmployeeId }
    ];
  };

  // Use the useRequest hook for attendance data
  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'muster/muster/search',
    method: 'POST',
    data: getRequestData(),
    onSuccess: (data) => {
      console.log("Attendance data received: hello", data);
      setAttendanceDataFromAPI(data);
      
      // Force update current date based on API data immediately
      if (data && Array.isArray(data) && data.length > 0) {
        const attendanceRecord = data[0] as AttendanceRecord;
        console.log("Attendance Record from API:", attendanceRecord);
        
        // Use month and year directly from the API response
        if (attendanceRecord?.month && attendanceRecord?.year) {
          console.log("Using month and year from API:", { month: attendanceRecord.month, year: attendanceRecord.year });
          
          // month is 1-based, so subtract 1 for JavaScript Date constructor
          const newDate = new Date(attendanceRecord.year, attendanceRecord.month - 1, 1);
          console.log("Setting current date to:", newDate, "Month:", monthNames[newDate.getMonth()]);
          setCurrentDate(newDate);
        } else if (attendanceRecord?.attendanceDetails && attendanceRecord.attendanceDetails.length > 0) {
          // Fallback to parsing date string if month/year not available
          const firstDate = attendanceRecord.attendanceDetails[0].date;
          console.log("Fallback: First date from API response:", firstDate);
          
          if (firstDate) {
            const [year, month, day] = firstDate.split('-').map(Number);
            console.log("Fallback: Parsed date components:", { year, month, day });
            
            if (year && month && day) {
              const newDate = new Date(year, month - 1, 1);
              console.log("Fallback: Setting current date to:", newDate, "Month:", monthNames[newDate.getMonth()]);
              setCurrentDate(newDate);
            }
          }
        }
      }
    },
    onError: (error) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: [currentDate, contractEmployeeData]
  });

  useEffect(() => {
    fetchAttendance()
  }, []);

  

  // Removed dummy holidays - using real data from API

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      
      // Update URL with new month and year
      const newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0')
      const newYear = newDate.getFullYear().toString()
      
      // Get current URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set('month', newMonth)
      urlParams.set('year', newYear)
      
      // Update the URL without page reload
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`
      window.history.pushState({}, '', newUrl)
      
      return newDate
    })
  }

  const getEventStyling = (eventType: string) => {
    switch (eventType) {
      case "login":
        return "bg-blue-600 text-white border border-blue-700 shadow-sm"
      case "logout":
        return "bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
      case "missing-login":
      case "missing-logout":
        return "bg-red-500 text-white border-2 border-red-600 shadow-md font-bold"
      default:
        return "bg-gray-500 text-white border border-gray-600"
    }
  }

  const formatTime = (time?: string) => {
    if (!time) return "--:--"
    const [h, m] = time.split(":")
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const formatWorkDuration = (minutes?: number) => {
    if (!minutes) return "--"
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  // Get attendance data for a specific day
  const getAttendanceForDay = (day: number): AttendanceDetail | null => {
    if (!attendanceDataFromAPI || !Array.isArray(attendanceDataFromAPI) || attendanceDataFromAPI.length === 0) {
      return null;
    }

    const attendanceRecord = attendanceDataFromAPI[0] as AttendanceRecord;
    if (!attendanceRecord?.attendanceDetails) {
      return null;
    }

    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;

    return attendanceRecord.attendanceDetails.find(detail => detail.date === dateString) || null;
  }

  // Check if punch details are empty (no punches recorded)
  const hasNoPunches = (attendanceDetail: AttendanceDetail): boolean => {
    return (
      attendanceDetail.punchDetails.inPunches.length === 0 &&
      attendanceDetail.punchDetails.outPunches.length === 0 &&
      attendanceDetail.punchDetails.defaultPunches.length === 0
    );
  }

  // Get attendance status styling based on attendanceID
  const getAttendanceStatusStyling = (attendanceID: string) => {
    switch (attendanceID) {
      case "PP": // Present
        return "bg-green-100 text-green-800 border border-green-200"
      case "AA": // Absent
        return "bg-red-100 text-red-800 border border-red-200"
      case "WW": // Weekend
        return "bg-gray-100 text-gray-600 border border-gray-200"
      case "HH": // Holiday
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200"
    }
  }

  // Check if a day is within the selected date range
  const isInSelectedRange = (day: number) => {
    if (!attendanceData) return false
    const fromDay = new Date(attendanceData.fromDate).getDate()
    const toDay = new Date(attendanceData.toDate).getDate()
    return day >= fromDay && day <= toDay
  }

  const handlePunchFormSubmit = (data: any) => {
    console.log("Punch form submitted:", data)
    setIsPunchFormOpen(false)
  }

  const handleNewPunchFormSubmit = async (data: any) => {
    if (onNewPunchSubmit) {
      const success = await onNewPunchSubmit(data)
      if (success) {
        setIsNewPunchFormOpen(false)
      }
    }
  }

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(clickedDate)
    setIsDayDetailsOpen(true)
  }

  // Initialize empty punch requests array - will be populated from API
  const punchRequests: any[] = []

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-48 border-r border-b border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = filteredEvents.filter((event) => event.day === day)
      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()
      const inSelectedRange = isInSelectedRange(day)
      const attendanceDetail = getAttendanceForDay(day)
      const hasNoPunchData = attendanceDetail ? hasNoPunches(attendanceDetail) : false

      days.push(
        <div
          key={day}
          className={`h-48 w-full border-r border-b p-2 overflow-y-auto scrollbar-hide relative cursor-pointer hover:bg-gray-50 transition-colors ${
            hasNoPunchData ? "border-red-500 border-2 bg-red-50" : "border-gray-300"
          }`}
          onClick={() => handleDayClick(day)}
        >
          <div className="relative z-10 h-full flex flex-col">
            {/* Day number */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div
                className={`text-sm font-semibold ${isToday
                    ? "bg-black text-white rounded-full w-7 h-7 flex items-center justify-center"
                    : "text-gray-700"
                  }`}
              >
                {day}
              </div>
            </div>

            {/* Events - scrollable area */}
            <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
              {/* Contract Employee Status */}
              {contractEmployeeData && (
                <div className="rounded-lg px-2 py-1 bg-green-100 text-green-800 text-xs font-medium w-fit mb-1">
                  {contractEmployeeData.status?.currentStatus || 'Active'}
                </div>
              )}
              
              {/* Display attendance data from API - Only Shift Code and Hours Worked */}
              {attendanceDetail && (
                <div className="space-y-1">
                  {/* Shift Code */}
                  <div className="rounded-lg px-2 py-1 text-white bg-blue-600 text-xs font-medium w-fit">
                    Shift: {attendanceDetail.shiftCode}
                  </div>
                  
                  {/* Hours Worked */}
                  <div className="rounded-lg px-2 py-1 text-blue-800 bg-blue-100 text-xs font-medium w-fit">
                    Hours: {formatWorkDuration(attendanceDetail.hoursWorked)}
                  </div>
                  
                  {/* No Punches Warning */}
                  {hasNoPunchData && (
                    <div className="rounded-lg px-2 py-1 bg-red-500 text-white text-xs font-bold w-fit">
                      ⚠️ NO PUNCHES
                    </div>
                  )}
                </div>
              )}
              
              {/* Fallback to filtered events if no API data */}
              {(!attendanceDataFromAPI || !Array.isArray(attendanceDataFromAPI) || attendanceDataFromAPI.length === 0) && (
                <>
                  {/* Punch In pill */}
                  {dayEvents.find(e => e.type === "login") && (
                    <div className="rounded-lg px-4 py-2 text-white bg-blue-600 text-xs font-medium w-fit mb-1">
                      Punch In: {dayEvents.find(e => e.type === "login")?.loginTime || "12:00"}
                    </div>
                  )}
                  {/* Punch Out pill */}
                  {dayEvents.find(e => e.type === "logout") && (
                    <div className="rounded-lg px-4 py-2 text-blue-800 bg-blue-100 text-xs font-medium w-fit mb-1">
                      Punch Out: {dayEvents.find(e => e.type === "logout")?.logoutTime || "07:50"}
                    </div>
                  )}
                  {/* Working Hours pill (only if both in and out exist) */}
                  {dayEvents.find(e => e.type === "login") && dayEvents.find(e => e.type === "logout") && (
                    <div className="rounded-lg px-4 py-2 text-white text-xs font-medium w-fit mb-1" style={{ backgroundColor: '#94b5e5' }}>
                      Working Hours: {formatWorkDuration(dayEvents.find(e => e.type === "login")?.workDurationMinutes)}
                    </div>
                  )}
                  {/* If punch in exists but punch out is missing, show PUNCH MISS and Working Hours */}
                  {dayEvents.find(e => e.type === "login") && !dayEvents.find(e => e.type === "logout") && (
                    <>
                      <div className="rounded-lg px-4 py-2 bg-red-500 text-white text-xs font-bold w-fit flex flex-col mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">⚠️</span>
                          <span>PUNCH MISS</span>
                        </div>
                        <span className="text-white font-normal text-xs mt-1">Missing In/Out pair</span>
                      </div>
                      <div className="rounded-lg px-4 py-2 text-white text-xs font-medium w-fit mb-1" style={{ backgroundColor: '#94b5e5' }}>
                        Working Hours: --
                      </div>
                    </>
                  )}
                  {/* Missing login/logout warnings (for other cases) */}
                  {dayEvents.map((event) => (
                    (event.type === "missing-login" || event.type === "missing-logout") && (
                      <div key={event.id} className={`text-xs p-2 rounded-md ${getEventStyling(event.type)}`}>
                        <div className="font-medium break-words leading-tight">
                          {event.type === "missing-login" ? "⚠️ MISSING LOGIN" : event.type === "missing-logout" ? "⚠️ MISSING LOGOUT" : "Unknown"}
                        </div>
                        <div className="text-xs opacity-90 break-words leading-tight mt-1">
                          {event.type === "missing-login" ? "No login recorded" : "No logout recorded"}
                        </div>
                      </div>
                    )
                  ))}
                </>
              )}
            </div>
          </div>
        </div>,
      )
    }

    return days
  }

  // Calculate total working hours for the current month
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
    // Sum up hoursWorked for all days in the month
    const totalMinutes = attendanceRecord.attendanceDetails.reduce(
      (sum: number, detail: any) =>
        typeof detail.hoursWorked === "number" ? sum + detail.hoursWorked : sum,
      0
    );
    return Math.round(totalMinutes / 60); // Convert minutes to hours
  };
  const totalMonthlyWorkingHours = getTotalMonthlyWorkingHours();

  return (
    <>
      <ToastContainer />
      {/* Loading Screen */}
      {isLoading && (
        <div className="w-full mb-6 overflow-y-auto scrollbar-hide bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-lg font-medium text-gray-700">Loading attendance data...</div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Component - Updated with date range filtering */}
      {!isLoading && (
        <div className="w-full mb-6 overflow-y-auto scrollbar-hide bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-blue-100">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                {monthNames[currentDate.getMonth()].slice(0, 3)}
              </div>
              <div className="text-3xl font-light text-gray-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <div className="text-sm text-gray-500">
                {monthNames[currentDate.getMonth()].slice(0, 3)} 1, {currentDate.getFullYear()} –{" "}
                {monthNames[currentDate.getMonth()].slice(0, 3)} {getDaysInMonth(currentDate)},{" "}
                {currentDate.getFullYear()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="hover:bg-white/50">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="hover:bg-white/50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 h-9 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Selected Date
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="hover:bg-white/50">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 h-9 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Month view
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-4 py-2 h-9 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Manage Tasks
              </Button>
            </div>
          </div>

          {/* Total Monthly Working Hours */}
          {/* <div className="flex items-center justify-end px-6 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-800 font-semibold text-lg shadow-sm">
              Total Working Hours (This Month): {totalMonthlyWorkingHours}h
            </div>
          </div> */}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-4 text-sm font-semibold text-gray-700 border-r border-b border-gray-200 bg-gray-100 text-center"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {renderCalendarDays()}
          </div>

          {/* Enhanced Legend */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded shadow-sm"></div>
                <span className="text-sm text-gray-700 font-medium">Login</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded shadow-sm"></div>
                <span className="text-sm text-gray-700 font-medium">Logout</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                <span className="text-sm text-gray-700 font-medium">Missing Login/Logout</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                <Calendar className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700 font-medium">Holiday</span>
              </div>
              {attendanceData && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700 font-medium">Selected Date Range</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Management Dropdown */}
      {isDropdownOpen && (
        <div className="fixed mb-6 inset-0 z-50" onClick={() => setIsDropdownOpen(false)}>
          <div
            className="absolute right-4 top-32 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dropdown Header - Sidebar Style */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Manage Tasks</h2>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="p-4">
              <div className="space-y-2">
                {/* ATTENDANCE Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    <span>ATTENDANCE</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    {/* Punch Application */}
                    <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => {
                        setIsPunchFormOpen(true)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-600 group-hover:text-blue-600">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Punch Application
                        </span>
                      </div>
                      <button className="w-5 h-5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Request for Punch */}
                    <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => {
                        setIsPunchRequestsPopupOpen(true)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-600 group-hover:text-blue-600">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Request for Punch
                        </span>
                      </div>
                      <button className="w-5 h-5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Punch Add */}
                    {/* <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => {
                        setIsNewPunchFormOpen(true)
                        setIsDropdownOpen(false)
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-gray-600 group-hover:text-blue-600">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Punch Add
                        </span>
                      </div>
                      <button className="w-5 h-5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      )}

         <PunchFormPopup
          isOpen={isPunchFormOpen}
          onClose={() => setIsPunchFormOpen(false)}
          initialValues={{
            inOut: punchFormType === "in" ? "In" : "Out",
            attendanceDate: new Date().toISOString().split("T")[0],
            punchedTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            transactionTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
          }}
          onSubmit={handlePunchFormSubmit}
        />

      <PunchRequestsPopup
        isOpen={isPunchRequestsPopupOpen}
        onClose={() => setIsPunchRequestsPopupOpen(false)}
      />

      {/* Day Details Popup */}
      <DayDetailsPopup
        isOpen={isDayDetailsOpen}
        onClose={() => setIsDayDetailsOpen(false)}
        selectedDate={selectedDate}
        attendanceDetail={selectedDate ? getAttendanceForDay(selectedDate.getDate()) : null}
      />

      {/* New Punch Update Form Popup */}
      <NewPunchUpdateForm
        key={`punch-form-${punchFormType}`}
        isOpen={isNewPunchFormOpen}
        onClose={() => setIsNewPunchFormOpen(false)}
        initialValues={{
          employeeID: employeeID || contractEmployeeData?.employeeID || "EMP001",
          punchedTime: new Date().toISOString().slice(0, 16),
          transactionTime: new Date().toISOString().slice(0, 16),
          inOut: punchFormType === "in" ? "I" : "O",
          typeOfMovement: "P",
          uploadTime: new Date().toISOString().slice(0, 16),
          attendanceDate: new Date().toISOString().split("T")[0],
          previosAttendanceDate: new Date().toISOString().split("T")[0],
          Status: "NEW",
          isDeleted: false,
          remarks: `Manual ${punchFormType === "in" ? "punch in" : "punch out"} request`,
        }}
        disableInOut={true}
        onSubmit={handleNewPunchFormSubmit}
      />
      
      <ToastContainer />
    </>
  )
} 