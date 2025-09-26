"use client"

import AttendanceReportPage from "./_components/attendance-report-page";
import ReportInfoSection from "./_components/report-info-section";
import AutoStutuesUpdate from "../_comonents/auto-stutues-update";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [timelineReportData, setTimelineReportData] = useState<string | null>(null);
  const params = useParams();
  const fileId = params?.["report-page"];
  console.log("fileId",params);

  const {
    data: reportData,
    error,
    loading
  } = useRequest<any>({
    url: `map/reports/search?_id=${fileId}`,
    method: 'GET',
    onSuccess: (data: any) => {
      console.log("Report data:", data);
    },
    onError: (error) => {
      console.error('Error loading report data:', error);
    },
    dependencies: [fileId]
  });

  // Get the first report from the array or use default
  const report = Array.isArray(reportData) && reportData.length > 0 ? reportData[0] : null;
  const extension = report?.extension || 'pdf';

  // Function to handle report data from timeline items
  const handleTimelineReportData = (reportData: string) => {
    console.log('Received report data from timeline:', {
      hasData: !!reportData,
      dataLength: reportData?.length || 0
    });
    setTimelineReportData(reportData);
  };

  // Create enhanced report data with timeline report if available
  const enhancedReport = {
    ...report,
    report: timelineReportData || report?.report || ""
  };

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-scroll hide-scrollbar pr-4">
        <ReportInfoSection 
          fileId={fileId as string} 
          data={enhancedReport} 
        />
      </div>
      
      {/* Sidebar */}
      <div className="w-[360px]  bg-gray-50/50 overflow-y-auto scroll-hidden">
        <AutoStutuesUpdate 
          fileId={fileId as string} 
          setOpen={setOpen} 
          extension={extension}
          reportData={enhancedReport}
          onTimelineReportData={handleTimelineReportData}
        />
      </div>
    </div>
  );
}
