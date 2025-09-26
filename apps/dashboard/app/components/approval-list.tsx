"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Eye, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table"

interface ApprovalRequest {
    id: string
    employeeName: string
    employeeId: string
    leaveType: string
    fromDate: string
    toDate: string
    days: number
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    submittedDate: string
}

interface ApprovalListProps {
    requests: ApprovalRequest[]
    onApprove?: (id: string) => void
    onReject?: (id: string) => void
    onView?: (id: string) => void
    onRefresh?: () => void
    title?: string
    description?: string
    showStats?: boolean
}

export default function ApprovalList({
    requests,
    onApprove,
    onReject,
    onView,
    onRefresh,
    title = "Leave Approval Requests",
    description = "Review and approve leave requests from your team members",
    showStats = true
}: ApprovalListProps) {
    const [loading, setLoading] = useState(false)

    const handleApproval = async (id: string, action: 'approve' | 'reject') => {
        setLoading(true)
        try {
            if (action === 'approve' && onApprove) {
                await onApprove(id)
            } else if (action === 'reject' && onReject) {
                await onReject(id)
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        if (onRefresh) {
            setLoading(true)
            try {
                await onRefresh()
            } catch (error) {
                console.error('Error refreshing data:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    // Helper function to format dates
    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) {
            return 'N/A'
        }
        
        try {
            // Handle dd-mm-yyyy format (like "18-06-2025")
            if (dateString.includes('-') && dateString.split('-').length === 3) {
                const [day, month, year] = dateString.split('-')
                return `${day}/${month}/${year}`
            }
            
            // Handle ISO date strings or other formats
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

    // Get status badge
    const getStatusBadge = (status: string | undefined | null) => {
        if (!status) {
            return <Badge variant="secondary">Unknown</Badge>
        }
        
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
            case 'approved':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
            case 'rejected':
                return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const pendingCount = requests.filter(req => req.status === 'pending').length
    const approvedCount = requests.filter(req => req.status === 'approved').length
    const rejectedCount = requests.filter(req => req.status === 'rejected').length

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            {showStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Require attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Approval Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>
                        Review and take action on leave requests from your team
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600">No leave requests to review</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{request.employeeName}</div>
                                                <div className="text-sm text-muted-foreground">{request.employeeId}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{request.leaveType}</TableCell>
                                        <TableCell>
                                            {formatDate(request.fromDate)} - {formatDate(request.toDate)}
                                        </TableCell>
                                        <TableCell>{request.days}</TableCell>
                                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApproval(request.id, 'approve')}
                                                    disabled={request.status !== 'pending' || loading}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApproval(request.id, 'reject')}
                                                    disabled={request.status !== 'pending' || loading}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                {onView && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => onView(request.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 