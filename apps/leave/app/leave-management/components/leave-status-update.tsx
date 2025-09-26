"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"

interface Leave {
  date: string
  leaveCode: string
  duration: string
}

interface LeaveApplication {
  _id: string
  tenantCode: string
  workflowName: string
  uploadedBy: string
  createdOn: string
  employeeID: string
  fromDate: string
  toDate: string
  leaves: Leave[]
  uploadTime: string
  organizationCode: string
  appliedDate: string
  workflowState: string
  remarks: string
}

interface LeaveStatusUpdateProps {
  requestId: string
  setOpen: (open: boolean) => void
  leaveApplication?: LeaveApplication | null
}

interface StatusUpdate {
  id: string
  status: string
  updatedBy: string
  updatedAt: Date
  comment?: string
  action: 'Validated' | 'approved' | 'rejected' | 'cancelled'
}

const LeaveStatusUpdate: React.FC<LeaveStatusUpdateProps> = ({ requestId, setOpen, leaveApplication }) => {
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [loading, setLoading] = useState(true)

  // Sample status updates for demonstration
  const sampleStatusUpdates: StatusUpdate[] = [
    {
      id: '1',
      status: 'VALIDATED',
      updatedBy: 'Employee',
      updatedAt: new Date(leaveApplication?.createdOn || Date.now()),
      comment: 'Leave application submitted and validated',
      action: 'Validated'
    },
    {
      id: '2',
      status: 'PENDING',
      updatedBy: 'System',
      updatedAt: new Date(new Date(leaveApplication?.createdOn || Date.now()).getTime() + 1000 * 60 * 5), // 5 minutes later
      comment: 'Application forwarded to manager for approval',
      action: 'pending'
    },
    {
      id: '3',
      status: leaveApplication?.workflowState || 'PENDING',
      updatedBy: 'Manager',
      updatedAt: new Date(new Date(leaveApplication?.createdOn || Date.now()).getTime() + 1000 * 60 * 30), // 30 minutes later
      comment: leaveApplication?.workflowState === 'APPROVED' ? 'Leave application approved' :
        leaveApplication?.workflowState === 'REJECTED' ? 'Leave application rejected' : 'Under review',
      action: leaveApplication?.workflowState?.toLowerCase() as any || 'pending'
    }
  ]

  useEffect(() => {
    // Simulate API call to fetch status updates
    const fetchStatusUpdates = async () => {
      setLoading(true)
      try {
        // In a real implementation, you would fetch from API
        // const response = await fetch(`/api/leave-applications/${requestId}/status-updates`)
        // const data = await response.json()

        // For now, use sample data
        setTimeout(() => {
          setStatusUpdates(sampleStatusUpdates)
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Error fetching status updates:', error)
        setStatusUpdates(sampleStatusUpdates)
        setLoading(false)
      }
    }

    fetchStatusUpdates()
  }, [requestId])

  const formatDate = (dateString: string) => {
    try {
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const [day, month, year] = dateString.split('-')
        return `${day}/${month}/${year}`
      }

      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
      }

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'Validated':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getLeaveSummary = (leaves: Leave[] | undefined) => {
    if (!leaves || leaves.length === 0) return 'No leaves'

    const leaveTypes = leaves.reduce((acc, leave) => {
      const code = leave.leaveCode || 'Unknown'
      acc[code] = (acc[code] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(leaveTypes)
      .map(([code, count]) => `${count} ${code}`)
      .join(', ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading status updates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Status Timeline</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Application Summary Card */}
        {leaveApplication && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Application Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-medium ml-2">{leaveApplication.employeeID}</span>
                </div>
                <div>
                  <span className="text-gray-600">Applied Date:</span>
                  <span className="font-medium ml-2">{formatDate(leaveApplication.appliedDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium ml-2">{formatDate(leaveApplication.fromDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium ml-2">{formatDate(leaveApplication.toDate)}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-600">Leave Details:</span>
                <span className="font-medium ml-2">{getLeaveSummary(leaveApplication.leaves)}</span>
              </div>
              {leaveApplication.remarks && (
                <div>
                  <span className="text-gray-600">Remarks:</span>
                  <span className="font-medium ml-2">{leaveApplication.remarks}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status History
          </h4>

          <div className="space-y-3">
            {statusUpdates.map((update, index) => (
              <div key={update.id} className="relative">
                {/* Timeline line */}
                {index < statusUpdates.length - 1 && (
                  <div className="absolute left-6 top-8 w-0.5 h-12 bg-gray-200"></div>
                )}

                <div className="flex items-start space-x-4">
                  {/* Status icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${update.action === 'approved' ? 'bg-green-100' :
                      update.action === 'rejected' ? 'bg-red-100' :
                        update.action === 'Validated' ? 'bg-blue-100' :
                          'bg-red-100'
                    }`}>
                    {getStatusIcon(update.action)}
                  </div>

                  {/* Status details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-gray-900">{update.status}</h5>
                      <Badge variant="outline" className={`text-sm ${getStatusColor(update.status)}`}>
                        {update.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <User className="h-3 w-3" />
                      <span>Updated by: {update.updatedBy}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(update.updatedAt)}</span>
                    </div>

                    {update.comment && (
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {update.comment}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status Summary */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-900">Current Status</h5>
                <p className="text-sm text-gray-600 mt-1">
                  {leaveApplication?.workflowState || 'Unknown'}
                </p>
              </div>
              <Badge variant="outline" className={`${getStatusColor(leaveApplication?.workflowState || '')}`}>
                {leaveApplication?.workflowState || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LeaveStatusUpdate 