import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Separator } from "@repo/ui/components/ui/separator"
import {
  CalendarDays,
  Building2,
  Users,
  FileText,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
} from "lucide-react"

export default function AttendanceReportPage() {
  const reportData = {
    _id: "c107263c-33c7-4f85-87a8-fdff15bb7217",
    reportName: "attendanceReport",
    extension: "pdf",
    reportTitle: "test",
    tenantCode: "Midhani",
    workflowName: "Report",
    createdBy: "user",
    createdOn: "2025-06-26T10:00:00.000+00:00",
    period: "Today",
    fromDate: "2025-03-01",
    toDate: "2025-03-17",
    organization: "ALL",
    subsidiary: ["sub1", "sub2"],
    division: ["DIV001"],
    department: [],
    designation: [],
    subDepartment: [],
    section: [],
    report: "",
    status: "",
  }

  const workStateUpdates = [
    {
      id: 1,
      task: "Data Processing",
      status: "completed",
      time: "2 min ago",
      description: "Employee attendance data processed successfully",
    },
    {
      id: 2,
      task: "Report Generation",
      status: "in-progress",
      time: "Just now",
      description: "Generating PDF report for attendance data",
    },
    {
      id: 3,
      task: "Data Validation",
      status: "pending",
      time: "5 min ago",
      description: "Validating subsidiary attendance records",
    },
    {
      id: 4,
      task: "Email Notification",
      status: "failed",
      time: "10 min ago",
      description: "Failed to send report notification to admin",
    },
    {
      id: 5,
      task: "Database Sync",
      status: "completed",
      time: "15 min ago",
      description: "Synchronized attendance data with main database",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-400" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in-progress":
        return "text-blue-400"
      case "pending":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main content with right margin for 70%+ screens */}
      <div className="hidden xl:block" style={{ marginRight: "280px" }}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Original Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Attendance Report</h1>
            <p className="text-slate-600">Comprehensive attendance report details and configuration</p>
          </div>

          {/* Report Overview */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl">{reportData.reportTitle}</CardTitle>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {reportData.extension.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Tenant</p>
                    <p className="font-semibold text-slate-900">{reportData.tenantCode}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created By</p>
                    <p className="font-semibold text-slate-900">{reportData.createdBy}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created On</p>
                    <p className="font-semibold text-slate-900">{formatDateTime(reportData.createdOn)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Range & Period */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-6 w-6" />
                  <span>Report Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Period Type:</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {reportData.period}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">From Date:</span>
                    <span className="font-semibold text-slate-900">{formatDate(reportData.fromDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">To Date:</span>
                    <span className="font-semibold text-slate-900">{formatDate(reportData.toDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizational Scope */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-6 w-6" />
                  <span>Organizational Scope</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Organization:</span>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                      {reportData.organization}
                    </Badge>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-slate-600 block mb-2">Subsidiaries:</span>
                    <div className="flex flex-wrap gap-2">
                      {reportData.subsidiary.map((sub, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-2">Divisions:</span>
                    <div className="flex flex-wrap gap-2">
                      {reportData.division.map((div, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {div}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Report Name</p>
                  <p className="font-mono text-sm bg-slate-100 p-2 rounded border">{reportData.reportName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Workflow</p>
                  <p className="font-mono text-sm bg-slate-100 p-2 rounded border">{reportData.workflowName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="font-mono text-sm bg-slate-100 p-2 rounded border">{reportData.status || "Not Set"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Report Content</p>
                  <p className="font-mono text-sm bg-slate-100 p-2 rounded border">{reportData.report || "Empty"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty Filters Notice */}
          <Card className="border-0 shadow-lg border-l-4 border-l-amber-400">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Additional Filters</h3>
                  <p className="text-slate-600 mb-3">
                    The following organizational filters are currently empty and will include all available options:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Departments
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Sub-Departments
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Designations
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Sections
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      
    </div>
  )
}
