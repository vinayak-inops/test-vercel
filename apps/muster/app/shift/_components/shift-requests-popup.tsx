"use client"

import { useState, useEffect } from "react"
import { Clock, Send, CheckCircle, XCircle, LogIn, LogOut, Calendar, MessageSquare, User, Mail, Phone, AlertCircle, BarChart3 } from "lucide-react"
import BigPopupWrapper from "@repo/ui/components/popupwrapper/big-popup-wrapper"
import ShiftStatusUpdate from "./shift-status-update"

interface PunchRequest {
  id: string
  type: "in" | "out"
  requestedTime: Date
  reason: string
  status: "pending" | "approved" | "rejected"
  submittedAt: Date
}

interface PunchRequestsPopupProps {
  isOpen: boolean
  onClose: () => void
  punchRequests: PunchRequest[]
  initialSelectedRequest?: PunchRequest | null
}

export default function ShiftRequestsPopup({ isOpen, onClose, punchRequests, initialSelectedRequest }: PunchRequestsPopupProps) {
  const [selectedRequest, setSelectedRequest] = useState<PunchRequest | null>(initialSelectedRequest || null)
  const [search, setSearch] = useState("")
  const [showCancel, setShowCancel] = useState(false)
  const [cancelComment, setCancelComment] = useState("")
  const [cancelError, setCancelError] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showStatusView, setShowStatusView] = useState(false)

  // Update selected request when initialSelectedRequest changes
  useEffect(() => {
    setSelectedRequest(initialSelectedRequest || null)
  }, [initialSelectedRequest])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getTimeAgo = (date: Date) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Filter requests by search and tab
  const filteredRequests = punchRequests.filter(
    req =>
      (activeTab === 'all' || req.status === activeTab) &&
      (req.reason.toLowerCase().includes(search.toLowerCase()) ||
        req.status.toLowerCase().includes(search.toLowerCase()) ||
        req.type.toLowerCase().includes(search.toLowerCase()))
  )

  const handleKnowStatus = () => {
    setShowStatusView(true)
  }

  const handleBackToRequests = () => {
    setShowStatusView(false)
  }

  return (
    <BigPopupWrapper open={isOpen} setOpen={onClose} content={undefined}>
      {/* Single header at the top */}
      <div className="w-full h-full">
        <div className="px-6 pt-6 pb-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {showStatusView ? "Punch Request Status" : "Punch Requests"}
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
                    {['all', 'pending', 'approved', 'rejected'].map(tab => (
                      <button
                        key={tab}
                        className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                          activeTab === tab
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
                {filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Send className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No punch requests</p>
                    <p className="text-sm">No requests have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {filteredRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowCancel(false)
                          setCancelComment("")
                          setCancelError("")
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                              request.type === "in"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                            }`}
                          >
                            {request.type === "in" ? (
                              <LogIn className="h-5 w-5 text-white" />
                            ) : (
                              <LogOut className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                Manual Punch {request.type === "in" ? "In" : "Out"}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(request.status)}`}
                              >
                                {request.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(request.requestedTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(request.requestedTime)}</span>
                              <span>•</span>
                              <span>Submitted {getTimeAgo(request.submittedAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{request.reason}</p>
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
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow ${selectedRequest.type === "in" ? "bg-blue-100" : "bg-indigo-100"}`}>
                      {selectedRequest.type === "in" ? (
                        <LogIn className="h-8 w-8 text-blue-600" />
                      ) : (
                        <LogOut className="h-8 w-8 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">Manual Punch {selectedRequest.type === "in" ? "In" : "Out"}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span>
                        {getStatusIcon(selectedRequest.status)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">Requested Date:</span>
                      <span className="text-gray-900">{formatDate(selectedRequest.requestedTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">Requested Time:</span>
                      <span className="text-gray-900">{formatTime(selectedRequest.requestedTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">Submitted:</span>
                      <span className="text-gray-900">{getTimeAgo(selectedRequest.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">Request ID:</span>
                      <span className="text-gray-900 font-mono">#{selectedRequest.id}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">Reason for Request:</span>
                    </div>
                    <div className="text-gray-800 leading-relaxed text-sm bg-gray-50 rounded-lg p-3 mt-1">{selectedRequest.reason}</div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 h-9 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                      onClick={handleKnowStatus}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Know Status
                    </button>
                    {selectedRequest.status === 'pending' ? (
                      showCancel ? (
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Comment <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={cancelComment}
                            onChange={e => setCancelComment(e.target.value)}
                            placeholder="Enter comment..."
                            className="w-full min-h-[80px] rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400"
                          />
                          {cancelError && (
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {cancelError}
                            </div>
                          )}
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              disabled={cancelLoading}
                              className="px-4 py-2 h-9 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              onClick={() => {
                                if (!cancelComment.trim()) {
                                  setCancelError("Please enter a comment to cancel the request.")
                                  return
                                }
                                setCancelLoading(true)
                                setTimeout(() => {
                                  setCancelLoading(false)
                                  setShowCancel(false)
                                  setCancelComment("")
                                  setCancelError("")
                                  // Here you would call your cancel API
                                  alert("Request cancelled with comment: " + cancelComment)
                                }, 1200)
                              }}
                            >
                              {cancelLoading ? "Submitting..." : "Submit Cancellation"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="flex-1 px-4 py-2 h-9 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
                            onClick={() => setShowCancel(true)}
                          >
                            Cancel Request
                          </button>
                          <button
                            className="flex-1 px-4 py-2 h-9 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Approve Request
                          </button>
                        </>
                      )
                    ) : null}
                  </div>
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
            <div className="w-1/2 flex flex-col">
              <ShiftStatusUpdate 
                requestId={selectedRequest?.id || ""} 
                setOpen={setShowStatusView}
                punchRequest={selectedRequest}
              />
            </div>
          )}
        </div>
      </div>
    </BigPopupWrapper>
  )
} 