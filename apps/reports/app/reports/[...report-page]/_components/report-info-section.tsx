import { Calendar, Clock, FileText, Users, Building2, GitBranch, Filter, Download, RefreshCw, DownloadCloud, Eye, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useState } from "react"

interface AttendanceReportData {
  _id: string
  report: string
  reportName: string
  extension: string
  reportTitle: string
  tenantId: string
  workflowName: string
  subsidiaries: string[]
  divisions: string[]
  departments: string[]
  designations: string[]
  subDepartments: string[]
  sections: string[]
  grades: string[]
  fromDate: string
  toDate: string
  period: string
}

interface AttendanceReportProps {
  data?: AttendanceReportData
  fileId: string
}

export default function ReportInfoSection({ data, fileId }: AttendanceReportProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<string>('');

  // Default data for demo purposes
  const defaultData: AttendanceReportData = {
    _id: "08e2634d-ca4b-4031-b410-05f0b26a0021",
    report: "",
    reportName: "attendanceReport",
    extension: "excel",
    reportTitle: "report",
    tenantId: "Midhani",
    workflowName: "Report",
    subsidiaries: ["sub1"],
    divisions: [],
    departments: [],
    designations: [],
    subDepartments: [],
    sections: [],
    grades: [],
    fromDate: "2025-03-01",
    toDate: "2025-03-16",
    period: "custom",
  }

  const reportData = data || defaultData

  // Function to get MIME type based on extension
  const getMimeType = (ext: string) => {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'csv': 'text/csv',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'json': 'application/json',
      'xml': 'application/xml',
      'html': 'text/html',
      'htm': 'text/html',
      'rtf': 'application/rtf',
      'odt': 'application/vnd.oasis.opendocument.text',
      'ods': 'application/vnd.oasis.opendocument.spreadsheet',
      'odp': 'application/vnd.oasis.opendocument.presentation'
    };
    
    const normalizedExt = ext.toLowerCase().trim();
    const mimeType = mimeTypes[normalizedExt];
    
    console.log('ReportInfoSection MIME type lookup:', {
      extension: ext,
      normalizedExt: normalizedExt,
      mimeType: mimeType || 'application/octet-stream'
    });
    
    return mimeType || 'application/octet-stream';
  };

  // Function to handle report download
  const handleReportDownload = () => {
    console.log('Downloading report from ReportInfoSection:', {
      hasReport: !!reportData?.report,
      reportType: typeof reportData?.report,
      extension: reportData?.extension,
      reportId: reportData?._id,
      reportLength: reportData?.report?.length || 0
    });

    if (reportData?.report && typeof reportData.report === 'string') {
      try {
        // Validate base64 string
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(reportData.report)) {
          throw new Error('Invalid base64 string format');
        }

        // Convert base64 to blob
        const byteCharacters = atob(reportData.report);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
          type: getMimeType(reportData.extension || 'pdf') 
        });

        console.log('Created blob:', {
          size: blob.size,
          type: blob.type,
          extension: reportData.extension
        });

        // Validate blob size
        if (blob.size === 0) {
          throw new Error('Generated file is empty');
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report.${reportData.extension || 'pdf'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Download initiated successfully from ReportInfoSection');
      } catch (error) {
        console.error('Error downloading report from ReportInfoSection:', error);
        alert(`Failed to download report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.warn('No report data available for download in ReportInfoSection');
      alert('No report data available for download.');
    }
  };

  // Function to handle viewing file
  const handleViewFile = () => {
    console.log('Viewing file from ReportInfoSection:', {
      hasReport: !!reportData?.report,
      reportType: typeof reportData?.report,
      extension: reportData?.extension,
      reportId: reportData?._id,
      reportLength: reportData?.report?.length || 0
    });

    if (reportData?.report && typeof reportData.report === 'string') {
      try {
        // Validate base64 string
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(reportData.report)) {
          throw new Error('Invalid base64 string format');
        }

        // Convert base64 to blob
        const byteCharacters = atob(reportData.report);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { 
          type: getMimeType(reportData.extension || 'pdf') 
        });

        console.log('Created blob for viewing:', {
          size: blob.size,
          type: blob.type,
          extension: reportData.extension
        });

        // Validate blob size
        if (blob.size === 0) {
          throw new Error('Generated file is empty');
        }

        // Create URL for viewing
        const url = window.URL.createObjectURL(blob);
        
        // Set modal state
        setViewerUrl(url);
        setViewerType(reportData.extension || 'pdf');
        setViewerOpen(true);

        console.log('File viewer opened successfully');
      } catch (error) {
        console.error('Error viewing file from ReportInfoSection:', error);
        alert(`Failed to view file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.warn('No report data available for viewing in ReportInfoSection');
      alert('No report data available for viewing.');
    }
  };

  // Function to close viewer and cleanup
  const closeViewer = () => {
    if (viewerUrl) {
      window.URL.revokeObjectURL(viewerUrl);
    }
    setViewerOpen(false);
    setViewerUrl(null);
    setViewerType('');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date range
  const formatDateRange = (fromDate: string, toDate: string) => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const fromFormatted = from.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    const toFormatted = to.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    // Calculate days difference
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return { range: `${fromFormatted} - ${toFormatted}`, days: diffDays }
  }

  const dateRange = formatDateRange(reportData?.fromDate || '', reportData?.toDate || '')

  const {
    data: report,
    error,
    loading,
    refetch
  } = useRequest<any[]>({
    url: `map/reports/search?_id=${fileId}`,
    method: 'GET',
    onSuccess: (data: any) => {
      console.log("datadata", data);
    },
    onError: (error) => {
      
    },
    dependencies: [fileId]
  });

  // Filter out empty arrays for display
  const getActiveFilters = () => {
    const filters = []

    if (reportData?.tenantId) {
      filters.push({
        name: "Organization",
        icon: Building2,
        values: [reportData.tenantId],
        count: 1,
      })
    }

    if (reportData?.subsidiaries && reportData.subsidiaries.length > 0) {
      filters.push({
        name: "Subsidiaries",
        icon: GitBranch,
        values: reportData.subsidiaries,
        count: reportData.subsidiaries.length,
      })
    }

    if (reportData?.divisions && reportData.divisions.length > 0) {
      filters.push({
        name: "Divisions",
        icon: Users,
        values: reportData.divisions,
        count: reportData.divisions.length,
      })
    }

    if (reportData?.departments && reportData.departments.length > 0) {
      filters.push({
        name: "Departments",
        icon: Building2,
        values: reportData.departments,
        count: reportData.departments.length,
      })
    }

    if (reportData?.designations && reportData.designations.length > 0) {
      filters.push({
        name: "Designations",
        icon: Users,
        values: reportData.designations,
        count: reportData.designations.length,
      })
    }

    if (reportData?.subDepartments && reportData.subDepartments.length > 0) {
      filters.push({
        name: "Sub Departments",
        icon: Building2,
        values: reportData.subDepartments,
        count: reportData.subDepartments.length,
      })
    }

    if (reportData?.sections && reportData.sections.length > 0) {
      filters.push({
        name: "Sections",
        icon: Users,
        values: reportData.sections,
        count: reportData.sections.length,
      })
    }

    if (reportData?.grades && reportData.grades.length > 0) {
      filters.push({
        name: "Grades",
        icon: Users,
        values: reportData.grades,
        count: reportData.grades.length,
      })
    }

    return filters
  }

  const activeFilters = getActiveFilters()

  return (
    <div className="min-h-screen from-slate-50 to-slate-100 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-800">{reportData?.reportTitle || 'Report'}</h1>
              <p className="text-sm text-gray-500">Generated report • {(reportData?.extension || 'pdf').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
                onClick={handleViewFile}
                size="sm"
                className={`${reportData?.report ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!reportData?.report}
              >
                <Eye className="h-4 w-4 mr-2" />
                {reportData?.report ? 'View File' : 'No File Available'}
              </Button>
            <Button
                onClick={handleReportDownload}
                size="sm"
                className={`${reportData?.report ? 'bg-[#0061ff] text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!reportData?.report}
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                {reportData?.report ? 'Download Report' : 'No Report Available'}
              </Button>
            {/* <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-4 space-y-6">
            {/* Report Details & Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Details */}
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Report Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Report Name</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {reportData?.reportName || 'N/A'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Workflow</span>
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                        {reportData?.workflowName || 'N/A'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Tenant ID</span>
                      <span className="text-sm font-mono text-gray-900">{reportData?.tenantId || 'N/A'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Report ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">{reportData?._id || 'N/A'}</span>
                        {reportData?.report && (
                          <div className="flex items-center gap-1">
                            <Download size={12} className="text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Period */}
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Report Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Period</span>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{reportData?.period || 'N/A'}</Badge>
                    </div>
                    <Separator />
                    <div className="py-2">
                      <span className="text-sm font-medium text-gray-600 block mb-2">Date Range</span>
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{dateRange.range}</div>
                          <div className="text-xs text-gray-500 mt-1">{dateRange.days} days period</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Applied */}
            {activeFilters.length > 0 && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Filters Applied
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Active organizational filters for this report</p>
                </CardHeader>
                <CardContent>
                  <div
                    className={`grid grid-cols-1 ${activeFilters.length === 1 ? "md:grid-cols-1" : activeFilters.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}
                  >
                    {activeFilters.map((filter, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <filter.icon className="h-4 w-4" />
                          {filter.name}
                          {filter.count > 1 && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {filter.count}
                            </Badge>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border">
                          {filter.count === 1 ? (
                            <Badge variant="secondary" className="w-full justify-center">
                              {filter.values[0]}
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {filter.values.map((value, valueIndex) => (
                                <Badge key={valueIndex} variant="outline" className="text-xs">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>

      {/* File Viewer Modal */}
      {viewerOpen && viewerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Viewing Report ({viewerType.toUpperCase()})
                </h3>
              </div>
              <Button
                onClick={closeViewer}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-4 overflow-hidden">
              {viewerType === 'pdf' ? (
                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0 rounded"
                  title="PDF Viewer"
                />
              ) : viewerType === 'excel' || viewerType === 'xlsx' || viewerType === 'xls' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      Excel File Viewer
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Excel files cannot be previewed directly in the browser.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(viewerUrl, '_blank')}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button
                        onClick={handleReportDownload}
                        variant="outline"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      File Viewer
                    </h4>
                    <p className="text-gray-600 mb-4">
                      This file type cannot be previewed directly.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(viewerUrl, '_blank')}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button
                        onClick={handleReportDownload}
                        variant="outline"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
