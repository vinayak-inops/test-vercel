"use client"

import { useState, useEffect } from "react"
import { useRequest } from '@repo/ui/hooks/api/useGetRequest'
import { Clock, Send, CheckCircle, XCircle, Calendar, MessageSquare, User, AlertCircle, BarChart3, UserCheck, X, ChevronDown, Settings, ArrowLeft, RefreshCw } from "lucide-react"
import BigPopupWrapper from "@repo/ui/components/popupwrapper/big-popup-wrapper"
import AutoStatusUpdate from "./auto-stutues-update"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

interface ShiftChangeRequest {
  id: string
  employeeID: string
  uploadedBy: string
  fromDate: string
  toDate: string
  shiftGroupCode: string
  shift: {
    shiftCode: string
    shiftName: string
    shiftStart: string
    shiftEnd: string
    firstHalfStart: string
    firstHalfEnd: string
    secondHalfStart: string
    secondHalfEnd: string
    lunchStart: string
    lunchEnd: string
    duration: number
    crossDay: boolean
    flexible: boolean
    flexiFullDayDuration: number
    flexiHalfDayDuration: number
    minimumDurationForFullDay: number
    minimumDurationForHalfDay: number
  }
  remarks: string
  status: "pending" | "approved" | "rejected" | "validated" | "failed"
  submittedAt?: Date
  uploadTime?: string
  workflowState?: string
  appliedDate?: string
  isAutomatic: boolean
  organizationCode: string
  tenantCode: string
  // Backend raw fields for details view
  createdOn?: string
  workflowName?: string
  stateEvent?: string
  isDeleted?: boolean
  tenantId?: string
  Remarks?: string
}

interface ShiftRequestsPopupProps {
  isOpen: boolean
  onClose: () => void
  initialSelectedRequest?: ShiftChangeRequest | null
  selectedRequestId?: string | null
}

// Helper to safely parse date strings
function safeParseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  // If only date (YYYY-MM-DD), treat as UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00Z');
  }
  // If date and time without timezone (YYYY-MM-DDTHH:mm:ss)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
    return new Date(dateStr + 'Z');
  }
  // Otherwise, try native Date
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d;
}

function mapBackendToShiftChangeRequest(item: any): ShiftChangeRequest {
  return {
    id: item._id,
    uploadedBy: item.uploadedBy || '',
    employeeID: item.employeeID || '',
    fromDate: item.fromDate || '',
    toDate: item.toDate || '',
    shiftGroupCode: item.shiftGroupCode || '',
    shift: item.shift || {
      shiftCode: '',
      shiftName: '',
      shiftStart: '',
      shiftEnd: '',
      firstHalfStart: '',
      firstHalfEnd: '',
      secondHalfStart: '',
      secondHalfEnd: '',
      lunchStart: '',
      lunchEnd: '',
      duration: 0,
      crossDay: false,
      flexible: false,
      flexiFullDayDuration: 0,
      flexiHalfDayDuration: 0,
      minimumDurationForFullDay: 0,
      minimumDurationForHalfDay: 0
    },
    remarks: item.remarks || item.Remarks || "",
    status:
      item.workflowState?.toLowerCase() === "approved"
        ? "approved"
        : item.workflowState?.toLowerCase() === "rejected"
        ? "rejected"
        : item.workflowState?.toLowerCase() === "validated"
        ? "validated"
        : item.workflowState?.toLowerCase() === "failed"
        ? "failed"
        : "pending",
    submittedAt: safeParseDate(item.createdOn),
    uploadTime: item.uploadTime,
    workflowState: item.workflowState,
    appliedDate: item.appliedDate,
    isAutomatic: item.isAutomatic || false,
    organizationCode: item.organizationCode || '',
    tenantCode: item.tenantCode || '',
    // Raw backend fields for details view
    createdOn: item.createdOn,
    workflowName: item.workflowName,
    stateEvent: item.stateEvent,
    isDeleted: item.isDeleted,
    tenantId: item.tenantId,
    Remarks: item.Remarks,
  };
}

export default function ShiftRequestsPopup({ isOpen, onClose, initialSelectedRequest, selectedRequestId }: ShiftRequestsPopupProps) {
  const [selectedRequest, setSelectedRequest] = useState<ShiftChangeRequest | null>(initialSelectedRequest || null)
  const [search, setSearch] = useState("")
  const [showCancel, setShowCancel] = useState(false)
  const [cancelComment, setCancelComment] = useState("")
  const [cancelError, setCancelError] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all')
  const [showStatusView, setShowStatusView] = useState(false)
  const [shiftChangeRequests, setShiftChangeRequests] = useState<ShiftChangeRequest[]>([]);
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showCancelRequestPopup, setShowCancelRequestPopup] = useState(false);
  const [cancelRequestComment, setCancelRequestComment] = useState('');
  const [cancelRequestLoading, setCancelRequestLoading] = useState(false);
  const [cancelRequestError, setCancelRequestError] = useState('');

  const [showStatusOverlay, setShowStatusOverlay] = useState(false);
  const [statusAction, setStatusAction] = useState<'cancel' | 'reject' | 'approve' | null>(null);
  const [statusComment, setStatusComment] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Get URL parameters
  const getUrlParams = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const employeeId = urlParams.get('employeeId');
      const month = urlParams.get('month');
      const year = urlParams.get('year');
      const fromdate = urlParams.get('fromdate');
      const todate = urlParams.get('todate');
      
      // Check for calendar view (month/year pattern)
      if (employeeId && month && year) {
        return {
          type: 'calendar',
          employeeId,
          month,
          year
        };
      }
      
      // Check for table view (fromdate/todate pattern)
      if (employeeId && fromdate && todate) {
        return {
          type: 'table',
          employeeId,
          fromdate,
          todate
        };
      }
    }
    return null;
  };

  // Build request data based on URL parameters
  const buildRequestData = () => {
    const urlParams = getUrlParams();
    
    if (urlParams) {
      // If URL has employeeId parameter, only send employeeId filter
      return [
        {
          field: "tenantCode",
          operator: "eq",
          value: "Midhani"
        },
        {
          field: "employeeID",
          operator: "eq",
          value: urlParams.employeeId
        }
      ];
    }
    
    // Default request data
    return [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ];
  };

  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'shiftChangeApplication/search',
    method: 'POST',
    data: buildRequestData(),
    onSuccess: (data) => {
      // handled in useEffect
    },
    onError: (error) => {
      console.error("Error fetching shift change data:", error);
    },
    dependencies: []
  });

  const {
    post: postShiftZone,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "shiftChangeApplication",
    onSuccess: (data) => {
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      console.error("POST error:", error);
    },
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (attendanceResponse && Array.isArray(attendanceResponse)) {
      const mappedRequests = attendanceResponse.map(mapBackendToShiftChangeRequest);
      setShiftChangeRequests(mappedRequests);

      console.log('ShiftRequestsPopup: Data loaded', {
        selectedRequestId,
        initialSelectedRequest: initialSelectedRequest?.id,
        mappedRequestsCount: mappedRequests.length,
        mappedRequestIds: mappedRequests.map(req => req.id)
      });

      // Priority: selectedRequestId > initialSelectedRequest
      if (selectedRequestId) {
        const foundRequest = mappedRequests.find(req => req.id === selectedRequestId);
        console.log('ShiftRequestsPopup: Looking for selectedRequestId', selectedRequestId, 'Found:', foundRequest);
        if (foundRequest) {
          setSelectedRequest(foundRequest);
        } else {
          console.log('ShiftRequestsPopup: Request not found, will retry on next data load');
        }
      } else if (initialSelectedRequest) {
        console.log('ShiftRequestsPopup: Using initialSelectedRequest', initialSelectedRequest.id);
        setSelectedRequest(initialSelectedRequest);
      }
    }
  }, [attendanceResponse, selectedRequestId, initialSelectedRequest])

  // Handle selectedRequestId changes when data is already loaded
  useEffect(() => {
    if (selectedRequestId && shiftChangeRequests.length > 0) {
      const foundRequest = shiftChangeRequests.find(req => req.id === selectedRequestId);
      console.log('ShiftRequestsPopup: selectedRequestId changed, looking for', selectedRequestId, 'Found:', foundRequest);
      if (foundRequest) {
        setSelectedRequest(foundRequest);
      }
    }
  }, [selectedRequestId, shiftChangeRequests])

  // Update selected request when initialSelectedRequest changes
  useEffect(() => {
    setSelectedRequest(initialSelectedRequest || null)
  }, [initialSelectedRequest])

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getTimeAgo = (date?: Date) => {
    if (!date) return '';
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      return formatDate(date)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20"
      case "pending":
      case "initiated":
      case "validated":
        return "bg-[#64B5F6]/10 text-[#64B5F6] border-[#64B5F6]/20"
      case "rejected":
        return "bg-gray-100 text-gray-600 border-gray-200"
      case "failed":
        return "bg-red-100 text-red-600 border-red-200"
      default:
        return "bg-gray-200 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
      case "initiated":
      case "validated":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Filter out CANCEL requests before tab filtering (matching PunchRequestsPopup pattern)
  const visibleRequests = shiftChangeRequests.filter(req => req.workflowState?.toLowerCase() !== 'cancel');
  const filteredRequests = visibleRequests.filter(
    req => {
      const wf = req.workflowState?.toLowerCase() || '';
      const isPendingTab = activeTab === 'pending';
      const isPendingLike = /initiat|pending|validat/.test(wf);
      return (
        activeTab === 'all' ||
        (isPendingTab ? isPendingLike : wf === activeTab)
      ) &&
        (req.remarks?.toLowerCase().includes(search.toLowerCase()) ||
          req.workflowState?.toLowerCase().includes(search.toLowerCase()) ||
          req.uploadedBy?.toLowerCase().includes(search.toLowerCase()) ||
          req.shiftGroupCode?.toLowerCase().includes(search.toLowerCase()));
    }
  );

  const handleKnowStatus = () => {
    setShowStatusView(true)
  }

  const handleBackToRequests = () => {
    setShowStatusView(false)
  }



  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.manage-dropdown')) {
        setShowManageDropdown(false);
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen])

  return (
    <BigPopupWrapper open={isOpen} setOpen={onClose} content={undefined}>
      {/* Single header at the top */}
      <div className="w-full h-full">
        <div className="px-6 pt-6 pb-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {showStatusView ? "Shift Request Status" : "Shift Change Requests"}
            </h2>
            {showStatusView && (
              <button
                onClick={handleBackToRequests}
                className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Back to Requests
              </button>
            )}
          </div>
        </div>
        {/* Set flex row to fill popup minus header */}
        <div className="flex w-full" style={{height: 'calc(100% - 72px)'}}>
          {/* Left Side - Request List (hidden when showing status) */}
          {!showStatusView && (
            <div className="w-1/2 flex flex-col border-r border-gray-200">
              {/* Title, Tabs, and Search box */}
              <div className="p-4 pb-0 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-semibold text-gray-700 whitespace-nowrap">Requests ({filteredRequests.length})</span>
                  <div className="flex gap-1 ml-2">
                    {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(tab => (
                      <button
                        key={tab}
                        className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === tab
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                        }`}
                        onClick={() => setActiveTab(tab as any)}
                      >
                        {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                />
                
              </div>
              <div className="flex-1 overflow-y-auto custom-scroll">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg font-medium">Loading...</p>
                  </div>
                ) : attendanceError ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <AlertCircle className="h-16 w-16 mb-4 text-red-400" />
                    <p className="text-lg font-medium">Error loading requests</p>
                    <p className="text-sm text-red-400">Failed to load shift change requests</p>
                  </div>
                ) : !filteredRequests || filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Send className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No shift change requests</p>
                    <p className="text-sm">No requests have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {[...filteredRequests].reverse().map((request: ShiftChangeRequest) => (
                      <div
                        key={request.id}
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowCancel(false)
                          setCancelComment("")
                          setCancelError("")
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-500 to-blue-600">
                            <Send className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {request.uploadedBy ? `${request.uploadedBy} (${request.employeeID})` : request.employeeID}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium border ${request.workflowState?.toLowerCase() === "approved"
                                    ? "bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20"
                                    : request.workflowState?.toLowerCase() === "pending" || request.workflowState?.toLowerCase() === "initiated" || request.workflowState?.toLowerCase() === "validated"
                                      ? "bg-[#64B5F6]/10 text-[#64B5F6] border-[#64B5F6]/20"
                                      : request.workflowState?.toLowerCase() === "rejected"
                                        ? "bg-gray-100 text-gray-600 border-gray-200"
                                        : request.workflowState?.toLowerCase() === "failed"
                                          ? "bg-red-100 text-red-600 border-red-200"
                                          : "bg-gray-200 text-gray-700 border-gray-200"
                                  }`}
                              >
                                {request.workflowState}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                              <Calendar className="h-3 w-3" />
                              <span>{request.fromDate ? 
                                new Date(request.fromDate).toLocaleDateString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : ''
                              }</span>
                              {request.toDate && (
                                <span className="text-gray-500">
                                  to {new Date(request.toDate).toLocaleDateString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                              <Clock className="h-3 w-3" />
                              <span>{(() => {
                                if (!request.uploadTime) return '';

                                const uploadDate = new Date(request.uploadTime + '+05:30');
                                const appliedDate = request.appliedDate ? new Date(request.appliedDate) : null;

                                // Check if upload date is same as applied date
                                const isSameDate = appliedDate &&
                                  uploadDate.getDate() === appliedDate.getDate() &&
                                  uploadDate.getMonth() === appliedDate.getMonth() &&
                                  uploadDate.getFullYear() === appliedDate.getFullYear();

                                if (isSameDate) {
                                  // Show only time if same date
                                  return uploadDate.toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  });
                                } else {
                                  // Show date if different date
                                  return uploadDate.toLocaleDateString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                  });
                                }
                              })()}</span>
                              <span>•</span>
                              <span>Submitted {request.submittedAt ? getTimeAgo(request.submittedAt) : ''}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{request.remarks}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Right Side - Request Details */}
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div className="flex-1 overflow-y-auto custom-scroll">
              {selectedRequest ? (
                <div className="w-full p-6">
                  {/* Info Card Layout */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center shadow bg-blue-100">
                        <Send className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">{selectedRequest.employeeID}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${selectedRequest.workflowState?.toLowerCase() === "approved"
                              ? "bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20"
                              : selectedRequest.workflowState?.toLowerCase() === "pending" || selectedRequest.workflowState?.toLowerCase() === "initiated" || selectedRequest.workflowState?.toLowerCase() === "validated"
                                ? "bg-[#64B5F6]/10 text-[#64B5F6] border-[#64B5F6]/20"
                                : selectedRequest.workflowState?.toLowerCase() === "rejected"
                                  ? "bg-gray-100 text-gray-600 border-gray-200"
                                  : selectedRequest.workflowState?.toLowerCase() === "failed"
                                    ? "bg-red-100 text-red-600 border-red-200"
                                    : "bg-gray-200 text-gray-700 border-gray-200"
                            }`}>
                            {selectedRequest.workflowState}
                          </span>
                          {getStatusIcon(selectedRequest.status)}
                        </div>
                      </div>
                    </div>
                    <div className="relative manage-dropdown">
                      <button
                        onClick={() => setShowManageDropdown(!showManageDropdown)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 border-0"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Task
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showManageDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {showManageDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => {
                              setShowManageDropdown(false);
                              handleKnowStatus();
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Know Status
                          </button>
                          {!['APPROVED', 'REJECTED', 'CANCELLED'].includes(selectedRequest.workflowState?.toUpperCase() || '') && (
                            <button
                              onClick={() => {
                                setShowManageDropdown(false);
                                setShowCancelRequestPopup(true);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel Request
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6 mb-6">
                    {/* Section: Basic Info */}
                    <div>
                      <div className="text-blue-700 font-semibold text-md mb-2 pb-1 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" /> Basic Information
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="text-md text-gray-500">Employee ID</div>
                        <div className="font-semibold text-gray-800">{selectedRequest.employeeID || '-'}</div>
                        <div className="text-md text-gray-500">Uploaded By</div>
                        <div className="font-semibold text-gray-800">{selectedRequest.uploadedBy || '-'}</div>
                      </div>
                    </div>

                    {/* Section: Shift Details */}
                    <div>
                      <div className="text-blue-700 font-semibold text-lg mb-2 border-b border-blue-100 pb-1 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" /> Shift Details
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="text-md text-gray-500">From Date</div>
                        <div className="font-mono text-base text-blue-800">{selectedRequest.fromDate || '-'}</div>
                        <div className="text-md text-gray-500">To Date</div>
                        <div className="font-mono text-base text-blue-800">{selectedRequest.toDate || '-'}</div>
                        <div className="text-md text-gray-500">Shift Group</div>
                        <div className="font-mono text-base text-blue-800">{selectedRequest.shiftGroupCode || '-'}</div>
                        <div className="text-md text-gray-500">Shift Name</div>
                        <div className="font-mono text-base text-blue-800">{selectedRequest.shift?.shiftName || '-'}</div>
                        <div className="text-md text-gray-500">Applied Date</div>
                        <div className="font-mono text-base text-blue-800">
                          {selectedRequest.appliedDate ? 
                            new Date(selectedRequest.appliedDate).toLocaleDateString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }) : '-'
                          }
                  </div>
                    </div>
                    </div>

                    {/* Section: Shift Information */}
                    {selectedRequest.shift && (
                      <div>
                        <div className="text-blue-700 font-semibold text-md mb-2 border-b border-blue-100 pb-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" /> Shift Information
                    </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                          <div className="text-md text-gray-500">Shift Code</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.shiftCode || '-'}</div>
                          <div className="text-md text-gray-500">Shift Start</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.shiftStart || '-'}</div>
                          <div className="text-md text-gray-500">Shift End</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.shiftEnd || '-'}</div>
                          <div className="text-md text-gray-500">Duration</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.duration ? `${selectedRequest.shift.duration} minutes` : '-'}</div>
                          <div className="text-md text-gray-500">First Half Start</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.firstHalfStart || '-'}</div>
                          <div className="text-md text-gray-500">First Half End</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.firstHalfEnd || '-'}</div>
                          <div className="text-md text-gray-500">Second Half Start</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.secondHalfStart || '-'}</div>
                          <div className="text-md text-gray-500">Second Half End</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.secondHalfEnd || '-'}</div>
                          <div className="text-md text-gray-500">Lunch Start</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.lunchStart || '-'}</div>
                          <div className="text-md text-gray-500">Lunch End</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.lunchEnd || '-'}</div>
                          <div className="text-md text-gray-500">Cross Day</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.crossDay ? 'Yes' : 'No'}</div>
                          <div className="text-md text-gray-500">Flexible</div>
                          <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.flexible ? 'Yes' : 'No'}</div>
                          {selectedRequest.shift.flexible && (
                            <>
                              <div className="text-md text-gray-500">Flexi Full Day Duration</div>
                              <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.flexiFullDayDuration ? `${selectedRequest.shift.flexiFullDayDuration} minutes` : '-'}</div>
                              <div className="text-md text-gray-500">Flexi Half Day Duration</div>
                              <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.flexiHalfDayDuration ? `${selectedRequest.shift.flexiHalfDayDuration} minutes` : '-'}</div>
                              <div className="text-md text-gray-500">Min Duration (Full Day)</div>
                              <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.minimumDurationForFullDay ? `${selectedRequest.shift.minimumDurationForFullDay} minutes` : '-'}</div>
                              <div className="text-md text-gray-500">Min Duration (Half Day)</div>
                              <div className="font-mono text-sm text-blue-800">{selectedRequest.shift.minimumDurationForHalfDay ? `${selectedRequest.shift.minimumDurationForHalfDay} minutes` : '-'}</div>
                            </>
                          )}
                    </div>
                  </div>
                    )}

                    {/* Section: Request Details */}
                    <div>
                      <div className="text-blue-700 font-semibold text-md mb-2 border-b border-blue-100 pb-1 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-400" /> Request Details
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="text-md text-gray-500">Request ID</div>
                        <div className="font-mono text-base text-blue-800">#{selectedRequest.id}</div>
                        <div className="text-md text-gray-500">Upload Time</div>
                        <div className="font-mono text-base text-blue-800">
                          {(() => {
                            if (!selectedRequest.uploadTime) return '-';

                            const parseUploadTime = (dateStr: string) => {
                              try {
                                let date: Date;

                                if (dateStr.includes('+') || dateStr.includes('Z')) {
                                  date = new Date(dateStr);
                                } else {
                                  date = new Date(dateStr + '+05:30');
                                }

                                if (isNaN(date.getTime())) {
                                  return 'Invalid Date';
                                }

                                return date.toLocaleString('en-IN', {
                                  timeZone: 'Asia/Kolkata',
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                });
                              } catch (error) {
                                return 'Invalid Date';
                              }
                            };

                            return parseUploadTime(selectedRequest.uploadTime);
                          })()}
                        </div>
                        <div className="text-md text-gray-500">Remarks</div>
                        <div className="font-semibold text-gray-500 col-span-2">{selectedRequest.remarks || '-'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!['APPROVED', 'REJECTED', 'CANCELLED'].includes(selectedRequest.workflowState?.toUpperCase() || '') && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 h-9 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                        onClick={() => setShowStatusOverlay(true)}
                      >
                        Status Update
                      </button>
                    </div>
                  )}

                  {/* Cancel Request Popup */}
                  {showCancelRequestPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-100">
                        {/* Close Button */}
                        <button
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                          onClick={() => {
                            setShowCancelRequestPopup(false);
                            setCancelRequestComment('');
                            setCancelRequestError('');
                          }}
                        >
                          <X className="h-5 w-5" />
                    </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <XCircle className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Cancel Request</h3>
                          <p className="text-sm text-gray-500 mt-1">Are you sure you want to cancel this shift change request?</p>
                        </div>

                        {/* Comment Section */}
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            Reason for Cancellation <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={cancelRequestComment}
                            onChange={e => setCancelRequestComment(e.target.value)}
                            placeholder="Please provide a reason for cancelling this request..."
                            className="w-full min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg shadow-sm transition-all duration-200 hover:border-red-300 resize-none"
                          />
                          {cancelRequestError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                              <AlertCircle className="h-4 w-4" />
                              {cancelRequestError}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                            onClick={() => {
                              setShowCancelRequestPopup(false);
                              setCancelRequestComment('');
                              setCancelRequestError('');
                            }}
                          >
                            Keep Request
                          </button>
                          <button
                            className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={cancelRequestLoading || !cancelRequestComment.trim()}
                            onClick={() => {
                              if (!cancelRequestComment.trim()) {
                                setCancelRequestError('Please provide a reason for cancellation.');
                                return;
                              }
                              setCancelRequestLoading(true);
                              setTimeout(() => {
                                setCancelRequestLoading(false);
                                setShowCancelRequestPopup(false);
                                setCancelRequestComment('');
                                setCancelRequestError('');
                                // Here you would call your cancel API
                                alert("Request cancelled with comment: " + cancelRequestComment);
                              }, 1200);
                            }}
                          >
                            {cancelRequestLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Cancelling...
                              </div>
                            ) : (
                              'Cancel Request'
                            )}
                          </button>
                        </div>
                      </div>
                  </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Send className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No Request Selected</p>
                  <p className="text-sm">Select a request from the list to view its details.</p>
                </div>
              )}
            </div>
          </div>
          {/* Status Updates Section (shown when showStatusView is true) */}
          {showStatusView && (
            <div className="w-1/2 flex justify-center relative ">
              <button
                onClick={() => setShowStatusView(false)}
                className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-[360px]">
                <AutoStatusUpdate
                  fileId={selectedRequest?.id || ""}
                setOpen={setShowStatusView}
                  reportData={selectedRequest}
              />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Overlay Modal */}
      {showStatusOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-100">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              onClick={() => {
                setShowStatusOverlay(false);
                setStatusAction(null);
                setStatusComment('');
                setStatusError('');
              }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Update Request Status</h3>
              <p className="text-sm text-gray-500 mt-1">Choose an action to update the shift change request status</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${statusAction === 'cancel'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                onClick={() => { setStatusAction('cancel'); setStatusError(''); }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statusAction === 'cancel' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                  <X className={`h-4 w-4 ${statusAction === 'cancel' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-sm font-medium ${statusAction === 'cancel' ? 'text-blue-700' : 'text-gray-700'
                  }`}>Cancel</span>
              </button>

              <button
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${statusAction === 'reject'
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                  }`}
                onClick={() => { setStatusAction('reject'); setStatusError(''); }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statusAction === 'reject' ? 'bg-red-500' : 'bg-gray-200'
                  }`}>
                  <XCircle className={`h-4 w-4 ${statusAction === 'reject' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-sm font-medium ${statusAction === 'reject' ? 'text-red-700' : 'text-gray-700'
                  }`}>Reject</span>
              </button>

              <button
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${statusAction === 'approve'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }`}
                onClick={() => { setStatusAction('approve'); setStatusError(''); }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${statusAction === 'approve' ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                  <CheckCircle className={`h-4 w-4 ${statusAction === 'approve' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className={`text-sm font-medium ${statusAction === 'approve' ? 'text-green-700' : 'text-gray-700'
                  }`}>Approve</span>
              </button>
            </div>

            {/* Comment Section */}
            {(statusAction === 'cancel' || statusAction === 'reject') && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={statusComment}
                  onChange={e => setStatusComment(e.target.value)}
                  placeholder="Please provide a reason for this action..."
                  className="w-full min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition-all duration-200 hover:border-blue-300 resize-none"
                />
                {statusError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    {statusError}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            {(statusAction === 'cancel' || statusAction === 'reject' || statusAction === 'approve') && (
              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm ${statusAction === 'cancel'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    : statusAction === 'reject'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                disabled={statusLoading || ((statusAction === 'cancel' || statusAction === 'reject') && !statusComment.trim())}
                onClick={() => {
                  if ((statusAction === 'cancel' || statusAction === 'reject') && !statusComment.trim()) {
                    setStatusError('Please enter a comment to proceed.');
                    return;
                  }
                  setStatusLoading(true);
                  setTimeout(() => {
                    setStatusLoading(false);
                    setShowStatusOverlay(false);
                    setStatusAction(null);
                    setStatusComment('');
                    setStatusError('');
                    
                    // Determine stateEvent based on action
                    let stateEvent = "USERCANCEL"; // default
                    if (statusAction === 'reject') {
                      stateEvent = "REJECT";
                    } else if (statusAction === 'approve') {
                      stateEvent = "NEXT";
                    } else if (statusAction === 'cancel') {
                      stateEvent = "USERCANCEL";
                    }

                    // Helper functions for date formatting
                    const pad = (n: number) => n < 10 ? `0${n}` : n;
                    
                    // Get current time in Indian Standard Time (IST)
                    const now = new Date();
                    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
                    
                    const yyyy = istTime.getFullYear();
                    const mm = pad(istTime.getMonth() + 1);
                    const dd = pad(istTime.getDate());
                    const hh = pad(istTime.getHours());
                    const min = pad(istTime.getMinutes());
                    const ss = pad(istTime.getSeconds());
                    const ms = pad(istTime.getMilliseconds());
                    
                    // createdOn: 'YYYY-MM-DDTHH:mm:ss.sss+05:30' (IST timezone offset)
                    const createdOn = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.${ms}+05:30`;
                    // uploadTime: 'YYYY-MM-DDTHH:mm:ss'
                    const uploadTime = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
                    // appliedDate: 'YYYY-MM-DD'
                    const appliedDate = `${yyyy}-${mm}-${dd}`;
                    // uploadedBy: get from session
                    let uploadedBy = 'user'; // You can get this from session if available

                    const data = {
                      _id: selectedRequest?.id,
                      tenantCode: selectedRequest?.tenantCode || "Midhani",
                      workflowName: selectedRequest?.workflowName || "shiftChange Application",
                      stateEvent: stateEvent,
                      organizationCode: selectedRequest?.organizationCode || "Midhani",
                      isDeleted: selectedRequest?.isDeleted || false,
                      employeeID: selectedRequest?.employeeID,
                      fromDate: selectedRequest?.fromDate,
                      toDate: selectedRequest?.toDate,
                      shiftGroupCode: selectedRequest?.shiftGroupCode,
                      shift: selectedRequest?.shift,
                      uploadedBy: selectedRequest?.uploadedBy || uploadedBy,
                      createdOn: selectedRequest?.createdOn || createdOn,
                      workflowState: selectedRequest?.workflowState,
                      remarks: selectedRequest?.remarks,
                      action: statusAction,
                      comment: statusComment,
                      uploadTime: uploadTime,
                      appliedDate: appliedDate,
                    }

                   
                    const backendData = {
                      tenant: "Midhani",
                      action: "insert",
                      id: selectedRequest?.id,
                      event: "application",
                      collectionName: "shiftChangeApplication",
                      data: data,
                    }
                    postShiftZone(backendData);
                    // Refresh the data
                    fetchAttendance();
                  }, 1200);
                }}
              >
                {statusLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  `Submit ${statusAction?.charAt(0).toUpperCase() + statusAction?.slice(1)}`
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </BigPopupWrapper>
  )
} 