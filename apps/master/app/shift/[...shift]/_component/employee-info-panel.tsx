"use client"

import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"
// import TodayWorkPopup from "./today-work-popup"

interface ShiftEvent {
  id: string
  type: "shift-start" | "shift-end" | "break-start" | "break-end" | "overtime"
  count: number
  employee: string
  day: number
  shiftCode?: string
  shiftName?: string
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

interface EmployeeInfoPanelProps {
  employeeInfo?: EmployeeInfo
  filteredEvents?: ShiftEvent[]
  workingStats?: WorkingStats
  shiftData?: any
  employeeId?: string // Add employeeId prop for dynamic fetching
  totalMonthlyWorkingHours?: number // <-- add this
}

export default function EmployeeInfoPanel({ 
  employeeInfo, 
  filteredEvents, 
  workingStats, 
  shiftData,
  employeeId,  // Default fallback
  totalMonthlyWorkingHours // <-- add this
}: EmployeeInfoPanelProps) {
  const [contractEmployeeData, setContractEmployeeData] = useState<any>(null)
  const [attendanceDataFromAPI, setAttendanceDataFromAPI] = useState<any>(null)
  const [calculatedStats, setCalculatedStats] = useState<WorkingStats>({
    monthly: 0,
    weekly: 0,
    daily: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showTodayPopup, setShowTodayPopup] = useState(false);
  const [employeePanelError, setEmployeePanelError] = useState(false);

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

  console.log("employeeID", employeeID);

  const {
    data,
    error,
    loading,
    refetch
  } = useRequest<any[]>({
    url: `map/contract_employee/search?employeeID=${employeeID || employeeId}`,
    method: 'GET',
    onSuccess: (data: any) => {
      console.log("API Response:", data);
      if (data && Array.isArray(data) && data.length > 0) {
        console.log("data", data);
        setContractEmployeeData(data[0]);
        setHasError(false);
      } else {
        console.warn("No employee data found for ID:", employeeID || employeeId);
        setHasError(true);
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error loading employee data for ID:', employeeID || employeeId, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error.response?.data
      });
      setHasError(true);
      setIsLoading(false);
    },
  });

  // Prepare request data for attendance
  const getAttendanceRequestData = () => {
    let reqEmployeeId = employeeID || employeeId;
    console.log("Using employee ID for attendance:", reqEmployeeId);
    return [
      { field: "employeeID", operator: "eq", value: reqEmployeeId }
    ];
  };

  // Use the useRequest hook for attendance data
  const {
    data: attendanceResponse,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'muster/muster/search',
    method: 'POST',
    data: getAttendanceRequestData(),
    onSuccess: (data) => {
      console.log("Attendance data received:", data);
      setAttendanceDataFromAPI(data);
    },
    onError: (error) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: [employeeID, employeeId]
  });

  // Update loading state based on API loading
  useEffect(() => {
    setIsLoading(loading || attendanceLoading);
  }, [loading, attendanceLoading]);

  // Calculate working stats from attendance data
  const calculateWorkingStats = (attendanceRecords: any[]) => {
    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      console.log('No attendance records found');
      return;
    }

    console.log('Processing attendance records:', attendanceRecords);

    let totalMonthlyHours = 0;
    let totalWorkingDays = 0;
    let totalWorkingWeeks = new Set();

    // Process each attendance detail record
    attendanceRecords.forEach((record: any) => {
      if (!record) return;
      
      console.log('Processing record:', record);
      
      // Check if hoursWorked exists and is a number
      if (record.hoursWorked && typeof record.hoursWorked === 'number') {
        totalMonthlyHours += record.hoursWorked;
        totalWorkingDays++;
        
        // Add week number to set to count unique weeks
        if (record.date) {
          const recordDate = new Date(record.date);
          if (!isNaN(recordDate.getTime())) {
            const weekNumber = getWeekNumber(recordDate);
            totalWorkingWeeks.add(weekNumber);
          }
        }
        
        console.log(`Added ${record.hoursWorked} minutes from date ${record.date}`);
      }
    });

    // Calculate averages
    const monthlyHours = Math.round(totalMonthlyHours / 60); // Convert minutes to hours
    const weeklyHours = totalWorkingWeeks.size > 0 ? Math.round(monthlyHours / totalWorkingWeeks.size) : 0;
    const dailyHours = totalWorkingDays > 0 ? Math.round(monthlyHours / totalWorkingDays) : 0;

    console.log('Working Stats Calculation:', {
      totalMonthlyHours,
      totalWorkingDays,
      totalWorkingWeeks: totalWorkingWeeks.size,
      monthlyHours,
      weeklyHours,
      dailyHours
    });

    setCalculatedStats({
      monthly: monthlyHours,
      weekly: weeklyHours,
      daily: dailyHours
    });
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Calculate stats when attendance data changes
  useEffect(() => {
    console.log('Attendance data changed:', attendanceDataFromAPI);
    
    if (attendanceDataFromAPI && Array.isArray(attendanceDataFromAPI) && attendanceDataFromAPI.length > 0) {
      const attendanceRecord = attendanceDataFromAPI[0];
      console.log('Attendance record:', attendanceRecord);
      
      if (attendanceRecord?.attendanceDetails && Array.isArray(attendanceRecord.attendanceDetails)) {
        console.log('Attendance details found:', attendanceRecord.attendanceDetails);
        calculateWorkingStats(attendanceRecord.attendanceDetails);
      } else {
        console.log('No attendance details found in record');
      }
    } else {
      console.log('No attendance data available');
    }
  }, [attendanceDataFromAPI]);

  


  // Safely extract employee data with proper fallbacks
  const getEmployeeData = () => {
    if (!contractEmployeeData) {
      return employeeInfo || null;
    }

    // Safely extract nested properties with fallbacks
    const safeGet = (obj: any, path: string, fallback: string = "N/A") => {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : fallback;
      }, obj) || fallback;
    };

    const name = [
      contractEmployeeData.firstName,
      contractEmployeeData.middleName,
      contractEmployeeData.lastName
    ].filter(Boolean).join(' ') || "N/A";

    return {
      id: safeGet(contractEmployeeData, 'employeeID'),
      name: name,
      email: safeGet(contractEmployeeData, 'emailID.primaryEmailID'),
      phone: safeGet(contractEmployeeData, 'contactNumber.primaryContactNo'),
      department: safeGet(contractEmployeeData, 'deployment.department.departmentName'),
      position: safeGet(contractEmployeeData, 'deployment.designation.designationName'),
      joinDate: safeGet(contractEmployeeData, 'dateOfJoining'),
      manager: safeGet(contractEmployeeData, 'manager'),
      location: safeGet(contractEmployeeData, 'deployment.location.locationName'),
      avatar: safeGet(contractEmployeeData, 'uploadedDocuments.0.documentPath', undefined)
    };
  };

  const realEmployeeInfo = getEmployeeData();
  const stats = workingStats || calculatedStats;

  // Helper: Get today's date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // Helper: Get today's punches from attendanceDataFromAPI
  const getTodaysPunches = () => {
    if (!attendanceDataFromAPI || !Array.isArray(attendanceDataFromAPI) || attendanceDataFromAPI.length === 0) return [];
    const attendanceRecord = attendanceDataFromAPI[0];
    if (!attendanceRecord?.attendanceDetails) return [];
    return attendanceRecord.attendanceDetails.filter((rec: any) => rec.date === todayStr);
  };

  // Helper: Calculate total hours for today
  const getTodaysTotalHours = () => {
    const punches = getTodaysPunches();
    let totalMinutes = 0;
    punches.forEach((rec: any) => {
      if (typeof rec.hoursWorked === 'number') totalMinutes += rec.hoursWorked;
    });
    return Math.round(totalMinutes / 60);
  };

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium text-gray-700">Loading employee information...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-100 p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-lg font-medium text-red-700">
              Failed to load employee information
            </div>
            <button 
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                refetch();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything if no data is available
  if (!realEmployeeInfo) {
    return (
      <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100 p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-lg font-medium text-yellow-700">
              No employee information available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white mb-6 rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            {/* Enhanced Profile Photo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 ring-4 ring-white shadow-lg flex items-center justify-center">
                {realEmployeeInfo.avatar ? (
                  <img
                    src={realEmployeeInfo.avatar}
                    alt={realEmployeeInfo.name}
                    className="w-16 h-16 object-cover"
                    onError={(e) => {
                      // Fallback to user icon if avatar fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        `;
                      }
                    }}
                  />
                ) : (
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
            </div>

            {/* Employee Details */}
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-xl text-gray-900">{realEmployeeInfo.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {realEmployeeInfo.id}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{realEmployeeInfo.position}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{realEmployeeInfo.department}</span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{realEmployeeInfo.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    Joined{" "}
                    {realEmployeeInfo.joinDate !== "N/A" 
                      ? new Date(realEmployeeInfo.joinDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status and Working Stats - Updated to show monthly, weekly, daily averages */}
          <div className="text-right space-y-2">
            <div className="flex items-center justify-end space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                {contractEmployeeData?.status?.currentStatus || "Active"}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">
                  {stats.monthly && stats.monthly > 0 ? `${stats.monthly}h` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Monthly</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">
                  {stats.weekly && stats.weekly > 0 ? `${stats.weekly}h` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Weekly</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">
                  {stats.daily && stats.daily > 0 ? `${stats.daily}h` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Daily</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Bar */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{realEmployeeInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{realEmployeeInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Reports to {realEmployeeInfo.manager}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => setShowTodayPopup(true)}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Today
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              View Profile
            </button>
          </div>
        </div>
      </div>
      {/* <TodayWorkPopup
        isOpen={showTodayPopup}
        onClose={() => setShowTodayPopup(false)}
        punches={getTodaysPunches()}
        totalHours={getTodaysTotalHours()}
      /> */}
    </div>
  )
} 