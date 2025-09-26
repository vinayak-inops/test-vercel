"use client"

import { useState } from "react"
import { Clock, Send, CheckCircle, XCircle, LogIn, LogOut, User, Calendar, MessageSquare, ChevronRight, Users, Timer, TrendingUp, X } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Updated interface to match the actual JSON structure
interface PunchRecord {
  _id: {
    $oid: string
  }
  id: string
  punchedTime: string
  transactionTime: string
  inOut: "I" | "O" // I for In, O for Out
  typeOfMovement: string
  readerSerialNumber: number
  uploadTime: string
  attendanceDate: string
  Status: string
  employeeID: string
  organizationCode: string
  tenantCode: string
  isDeleted: boolean
}

interface PunchRequest {
  id: string
  type: "in" | "out"
  requestedTime: Date
  reason: string
  status: "pending" | "approved" | "rejected"
  submittedAt: Date
}

interface PunchRequestListProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function PunchRequestList({ isOpen = true, onClose }: PunchRequestListProps) {
  const [currentView, setCurrentView] = useState<"main" | "history" | "individual">("main")
  const [selectedUser, setSelectedUser] = useState<string>("")

  const {
    data,
    error,
    loading,
    refetch
}: {
    data: any;
    error: any;
    loading: any;
    refetch: any;
} = useRequest<any[]>({
    url: 'punchdata',
    onSuccess: (data: any) => {

    },
    onError: (error: any) => {
        console.error('Error loading organization data:', error);
    }
});
  
  // Updated sample data to match the actual JSON structure
  const [punchHistory, setPunchHistory] = useState<PunchRecord[]>([
    {
      _id: { $oid: "67f908024f877ca3ade33bc3" },
      id: "PUNCH1",
      punchedTime: "2025-03-01T06:30:00",
      transactionTime: "2025-03-01T06:30:00",
      inOut: "I",
      typeOfMovement: "O",
      readerSerialNumber: 5001,
      uploadTime: "2025-03-01T06:31:00.001",
      attendanceDate: "2025-03-01",
      Status: "NEW",
      employeeID: "EMP001",
      organizationCode: "ALL",
      tenantCode: "TEN001",
      isDeleted: false
    },
    {
      _id: { $oid: "67f908024f877ca3ade33bc4" },
      id: "PUNCH2",
      punchedTime: "2025-03-01T17:30:00",
      transactionTime: "2025-03-01T17:30:00",
      inOut: "O",
      typeOfMovement: "O",
      readerSerialNumber: 5001,
      uploadTime: "2025-03-01T17:31:00.001",
      attendanceDate: "2025-03-01",
      Status: "NEW",
      employeeID: "EMP001",
      organizationCode: "ALL",
      tenantCode: "TEN001",
      isDeleted: false
    },
    {
      _id: { $oid: "67f908024f877ca3ade33bc5" },
      id: "PUNCH3",
      punchedTime: "2025-03-02T08:45:00",
      transactionTime: "2025-03-02T08:45:00",
      inOut: "I",
      typeOfMovement: "O",
      readerSerialNumber: 5002,
      uploadTime: "2025-03-02T08:46:00.001",
      attendanceDate: "2025-03-02",
      Status: "NEW",
      employeeID: "EMP002",
      organizationCode: "ALL",
      tenantCode: "TEN001",
      isDeleted: false
    },
    {
      _id: { $oid: "67f908024f877ca3ade33bc6" },
      id: "PUNCH4",
      punchedTime: "2025-03-02T12:15:00",
      transactionTime: "2025-03-02T12:15:00",
      inOut: "O",
      typeOfMovement: "O",
      readerSerialNumber: 5001,
      uploadTime: "2025-03-02T12:16:00.001",
      attendanceDate: "2025-03-02",
      Status: "NEW",
      employeeID: "EMP001",
      organizationCode: "ALL",
      tenantCode: "TEN001",
      isDeleted: false
    },
    {
      _id: { $oid: "67f908024f877ca3ade33bc7" },
      id: "PUNCH5",
      punchedTime: "2025-03-03T09:15:00",
      transactionTime: "2025-03-03T09:15:00",
      inOut: "I",
      typeOfMovement: "O",
      readerSerialNumber: 5001,
      uploadTime: "2025-03-03T09:16:00.001",
      attendanceDate: "2025-03-03",
      Status: "NEW",
      employeeID: "EMP003",
      organizationCode: "ALL",
      tenantCode: "TEN001",
      isDeleted: false
    },
  ])

  const [punchRequests, setPunchRequests] = useState<PunchRequest[]>([
    {
      id: "1",
      type: "in",
      requestedTime: new Date("2024-01-14T09:15:00"),
      reason: "Forgot to punch in due to urgent meeting",
      status: "pending",
      submittedAt: new Date("2024-01-14T10:00:00"),
    },
    {
      id: "2",
      type: "out",
      requestedTime: new Date("2024-01-13T18:00:00"),
      reason: "System was down during punch out",
      status: "approved",
      submittedAt: new Date("2024-01-13T19:00:00"),
    },
    {
      id: "3",
      type: "in",
      requestedTime: new Date("2024-01-12T08:30:00"),
      reason: "Traffic jam caused delay",
      status: "approved",
      submittedAt: new Date("2024-01-12T09:30:00"),
    },
    {
      id: "4",
      type: "out",
      requestedTime: new Date("2024-01-11T17:45:00"),
      reason: "Emergency call from client",
      status: "rejected",
      submittedAt: new Date("2024-01-11T18:30:00"),
    },
    {
      id: "5",
      type: "in",
      requestedTime: new Date("2024-01-10T09:00:00"),
      reason: "Doctor appointment ran late",
      status: "pending",
      submittedAt: new Date("2024-01-10T11:00:00"),
    },
    {
      id: "6",
      type: "out",
      requestedTime: new Date("2024-01-09T16:30:00"),
      reason: "Family emergency",
      status: "approved",
      submittedAt: new Date("2024-01-09T17:00:00"),
    },
    {
      id: "7",
      type: "in",
      requestedTime: new Date("2024-01-08T08:45:00"),
      reason: "Public transport delay",
      status: "approved",
      submittedAt: new Date("2024-01-08T10:15:00"),
    },
    {
      id: "8",
      type: "out",
      requestedTime: new Date("2024-01-07T18:15:00"),
      reason: "Forgot to punch out before leaving",
      status: "pending",
      submittedAt: new Date("2024-01-08T08:00:00"),
    },
    {
      id: "9",
      type: "in",
      requestedTime: new Date("2024-01-06T09:30:00"),
      reason: "Car breakdown on the way to office",
      status: "rejected",
      submittedAt: new Date("2024-01-06T12:00:00"),
    },
    {
      id: "10",
      type: "out",
      requestedTime: new Date("2024-01-05T17:00:00"),
      reason: "System maintenance prevented punch out",
      status: "approved",
      submittedAt: new Date("2024-01-05T20:30:00"),
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [requestType, setRequestType] = useState<"in" | "out">("in")
  const [requestTime, setRequestTime] = useState("")
  const [requestReason, setRequestReason] = useState("")
  const [showAllDialog, setShowAllDialog] = useState(false)
  const [selectedRequestForPopup, setSelectedRequestForPopup] = useState<PunchRequest | null>(null)
  
  // PunchFormPopup states
  const [isPunchFormOpen, setIsPunchFormOpen] = useState(false)
  const [punchFormType, setPunchFormType] = useState<"in" | "out">("in")

  // Employee mapping for display purposes
  const employeeMap = {
    "EMP001": "John Doe",
    "EMP002": "Jane Smith", 
    "EMP003": "Mike Johnson",
  }

  const users = [
    { id: "EMP001", name: "John Doe" },
    { id: "EMP002", name: "Jane Smith" },
    { id: "EMP003", name: "Mike Johnson" },
  ]

  const handlePunchIn = () => {
    setPunchFormType("in")
    setIsPunchFormOpen(true)
  }

  const handlePunchOut = () => {
    setPunchFormType("out")
    setIsPunchFormOpen(true)
  }

  const handleSubmitRequest = () => {
    if (!requestTime || !requestReason) return

    const newRequest: PunchRequest = {
      id: Date.now().toString(),
      type: requestType,
      requestedTime: new Date(requestTime),
      reason: requestReason,
      status: "pending",
      submittedAt: new Date(),
    }

    setPunchRequests([newRequest, ...punchRequests])
    setRequestTime("")
    setRequestReason("")
    setIsDialogOpen(false)
  }

  const handleRequestClick = (request: PunchRequest) => {
    setSelectedRequestForPopup(request)
    setShowAllDialog(true)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      return formatDate(dateString)
    }
  }

  const getFilteredHistory = () => {
    if (currentView === "individual" && selectedUser) {
      return punchHistory.filter((punch) => punch.employeeID === selectedUser)
    }
    return punchHistory
  }

  // Helper function to get employee name
  const getEmployeeName = (employeeID: string) => {
    return employeeMap[employeeID as keyof typeof employeeMap] || employeeID
  }

  // Helper function to get punch type display
  const getPunchTypeDisplay = (inOut: string) => {
    return inOut === "I" ? "In" : "Out"
  }

  // Helper function to get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "NEW":
        return "approved"
      case "PENDING":
        return "pending"
      case "REJECTED":
        return "rejected"
      default:
        return "pending"
    }
  }

  // Calculate daily work statistics
  const calculateDailyStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayPunches = punchHistory.filter(punch => punch.attendanceDate === today)
    
    const uniqueEmployees = new Set(todayPunches.map(punch => punch.employeeID))
    const totalPunches = todayPunches.length
    const punchInCount = todayPunches.filter(punch => punch.inOut === "I").length
    const punchOutCount = todayPunches.filter(punch => punch.inOut === "O").length
    
    // Calculate total work hours (simplified calculation)
    let totalWorkHours = 0
    const employeeSessions = new Map()
    
    todayPunches.forEach(punch => {
      if (!employeeSessions.has(punch.employeeID)) {
        employeeSessions.set(punch.employeeID, [])
      }
      employeeSessions.get(punch.employeeID).push(punch)
    })
    
    employeeSessions.forEach((punches, employeeId) => {
      const sortedPunches = punches.sort((a: any, b: any) => 
        new Date(a.punchedTime).getTime() - new Date(b.punchedTime).getTime()
      )
      
      for (let i = 0; i < sortedPunches.length - 1; i++) {
        if (sortedPunches[i].inOut === "I" && sortedPunches[i + 1].inOut === "O") {
          const startTime = new Date(sortedPunches[i].punchedTime)
          const endTime = new Date(sortedPunches[i + 1].punchedTime)
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
          totalWorkHours += hours
        }
      }
    })
    
    return {
      totalPunches,
      uniqueEmployees: uniqueEmployees.size,
      punchInCount,
      punchOutCount,
      totalWorkHours: Math.round(totalWorkHours * 100) / 100
    }
  }

  const dailyStats = calculateDailyStats()

  const renderWorkSummary = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 mb-0 border border-blue-200/50 relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-xl transition-colors z-10"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>
      
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Today's Work Summary</h3>
          <p className="text-sm text-gray-600">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>
      
      {/* Total Hours Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{dailyStats.totalWorkHours}h</p>
          <p className="text-sm text-gray-600">Total Work Hours</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
          <div className="flex items-center space-x-2 mb-2">
            <LogIn className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Punch In</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{dailyStats.punchInCount}</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
          <div className="flex items-center space-x-2 mb-2">
            <LogOut className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-gray-600">Punch Out</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{dailyStats.punchOutCount}</p>
        </div>
      </div>
      
      <div className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Punches Today</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{dailyStats.totalPunches}</span>
        </div>
      </div>
    </div>
  )

  const renderMainView = () => (
    <div className="bg-white/90 mb-6 backdrop-blur-sm rounded-3xl p-6 ">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView("main")} className="p-2 hover:bg-blue-50 rounded-xl transition-colors">
            <svg className="h-5 w-5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Today punch list</h2>
        </div>
      </div>
      <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-hide">
        {getFilteredHistory().map((punch) => (
          <div
            key={punch._id.$oid}
            className="flex items-center justify-between py-4 border-b border-blue-100/50 last:border-b-0"
          >
            <div className="flex ite-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-sm ${
                  punch.inOut === "I" ? "border-[#007AFF]/20 bg-[#007AFF]" : "border-[#64B5F6]/20 bg-[#64B5F6]"
                }`}
              >
                {punch.inOut === "I" ? (
                  <LogIn className="h-5 w-5 text-white" />
                ) : (
                  <LogOut className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{getEmployeeName(punch.employeeID)}</p>
                <p className="text-sm text-blue-600">
                  Punch {getPunchTypeDisplay(punch.inOut)} • {formatDate(punch.attendanceDate)}
                </p>
                <p className="text-xs text-gray-500">Reader: {punch.readerSerialNumber} • ID: {punch.id}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatTime(punch.punchedTime)}</p>
              <div className="flex items-center justify-end mt-1">
                {getStatusDisplay(punch.Status) === "approved" && <CheckCircle className="h-3 w-3 text-[#007AFF]" />}
                {getStatusDisplay(punch.Status) === "pending" && <Clock className="h-3 w-3 text-[#64B5F6]" />}
                {getStatusDisplay(punch.Status) === "rejected" && <XCircle className="h-3 w-3 text-gray-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        {/* <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Work Summary</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div> */}

        {/* Content */}
        <div className="p-0">
          {renderWorkSummary()}
          {/* {renderMainView()} */}
        </div>
      </div>
    </div>
  )
}
