"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import PDFViewer from "./PDFViewer";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import ExcelViewer from "./ExcelViewer";
import PDFByteViewer from "./PDFByteViewer";


function  ScrollableSection({
  title,
  count,
  contacts,
  filters,
}: {
  title: string;
  count: number;
  contacts: any[];
  filters?: { searchTerm: string; selectedCategory: string };
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [filteredReportData, setFilteredReportData] = useState<any[]>([]);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

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
    url: 'reports',
    onSuccess: (data: any) => {
      // setReportData(data);
    },
    onError: (error: any) => {
        console.error('Error loading organization data:', error);
    }
});


const {
  data: attendanceResponse,
  loading: attendanceLoading,
  error: attendanceError,
  refetch: fetchAttendance
} = useRequest<any>({
  url: 'reports/search',
  method: 'POST',
  data: [
    {
      field: "tenantCode",
      operator: "eq",
      value: "Midhani"
    },
  ],
  onSuccess: (data: any) => {
    setReportData(data);
  },
  onError: (error: any) => {
    console.error("Error fetching attendance data:", error);
  },
  dependencies: []
});

useEffect(() => {
  fetchAttendance();
}, []);
  
  // Listen for refresh reports event
  useEffect(() => {
    const handleRefreshReports = () => {
      refetch();
      fetchAttendance();
    };

    window.addEventListener('refreshReports', handleRefreshReports);
    
    return () => {
      window.removeEventListener('refreshReports', handleRefreshReports);
    };
  }, [refetch,fetchAttendance]);

  // Filter reports based on search term and selected category
  useEffect(() => {
    if (!reportData) return;

    let filtered = [...reportData];

    // Filter by search term
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((report) => {
        const reportName = (report.reportName || report.fileName || '').toLowerCase();
        const reportTitle = (report.reportTitle || '').toLowerCase();
        const status = (report.status || '').toLowerCase();
        
        return reportName.includes(searchLower) || 
               reportTitle.includes(searchLower) || 
               status.includes(searchLower);
      });
    }

    // Filter by selected category
    if (filters?.selectedCategory && filters.selectedCategory !== 'All') {
      filtered = filtered.filter((report) => {
        // Check if the report belongs to the selected category
        console.log("filters?.selectedCategory",filters?.selectedCategory,report.reportName)
        const reportCategory = report.category || report.reportName || report.extension;
        return reportCategory === filters.selectedCategory;
      });
    }

    setFilteredReportData(filtered);

    // Calculate filtered counts by category
    const counts: Record<string, number> = {};
    if (reportData) {
      // Count reports by category
      reportData.forEach((report) => {
        const category = report.category || report.reportType || report.extension || 'Other';
        counts[category] = (counts[category] || 0) + 1;
      });
      
      // Add total count
      counts['All'] = reportData.length;
    }

    // Dispatch custom event with filtered counts
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('updateFilteredCounts', { 
        detail: { counts } 
      }));
    }
  }, [reportData, filters]);

  const revers = [...filteredReportData].reverse();

  return (
    <div className=" py-4 rounded-2xl">
      <div className="mb-4">
            <TopTitleDescription
              titleValue={{
                title: "Report Generation",
                description:
                  "Generate and download reports in PDF and Excel formats. View, manage, and export your reports with ease.",
              }}
            />
          </div>
      {/* <div className="flex items-center justify-between mb-4 ">
        <h2 className="font-medium">{title}</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
          {count}
        </span>
      </div> */}
      <div className="grid grid-cols-10 gap-4">
        {
          revers.slice(0, 10).map((contact) => (
            <div key={contact.id} className="col-span-12 md:col-span-4 lg:col-span-2">
              {
                contact.extension === 'pdf' ? <PDFByteViewer 

                fileName={contact.reportName || contact.fileName || 'Report'}   
                base64=""
                // base64="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Y29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iago0IDAgb2JqCjw8L0tpZHNbMSAwIFJdL1R5cGUvUGFnZXMvQ291bnQgMS9JVFhUKDIuMS43KT4+CmVuZG9iago2IDAgb2JqCjw8L05hbWVzWyhKUl9QQUdFX0FOQ0hPUl8wXzEpIDUgMCBSXT4+CmVuZG9iago3IDAgb2JqCjw8L0Rlc3RzIDYgMCBSPj4KZW5kb2JqCjggMCBvYmoKPDwvTmFtZXMgNyAwIFIvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSL1ZpZXdlclByZWZlcmVuY2VzPDwvUHJpbnRTY2FsaW5nL0FwcERlZmF1bHQ+Pj4+CmVuZG9iago5IDAgb2JqCjw8L01vZERhdGUoRDoyMDI1MDYyODE4NDc0NiswNSczMCcpL0NyZWF0b3IoSmFzcGVyUmVwb3J0cyBMaWJyYXJ5IHZlcnNpb24gNi4yMC4wLTJiYzdhYjYxYzU2ZjQ1OWU4MTc2ZWIwNWM3NzA1ZTE0NWNkNDAwYWQpL0NyZWF0aW9uRGF0ZShEOjIwMjUwNjI4MTg0NzQ2KzA1JzMwJykvUHJvZHVjZXIoaVRleHQgMi4xLjcgYnkgMVQzWFQpPj4KZW5kb2JqCnhyZWYKMCAxMAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDMzNzQgMDAwMDAgbiAKMDAwMDAwMzY2MSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDM3NDkgMDAwMDAgbiAKMDAwMDAwMzYyNiAwMDAwMCBuIAowMDAwMDAzODEyIDAwMDAwIG4gCjAwMDAwMDM4NjYgMDAwMDAgbiAKMDAwMDAwMzg5OCAwMDAwMCBuIAowMDAwMDA0MDAxIDAwMDAwIG4gCnRyYWlsZXIKPDwvSW5mbyA5IDAgUi9JRCBbPGM5ZTc4N2Q2NWMwNDg0ZGNjNDdiOGY3MDI2MDRjYmRhPjxjMTdmNmIwZWEyNWEyNWNiYjZmYzVmNmZmNDIyNmI2Nj5dL1Jvb3QgOCAwIFIvU2l6ZSAxMD4+CnN0YXJ0eHJlZgo0MjEwCiUlRU9GCg=="
                createdAt={contact.createdOn || contact.createdAt || contact.date}
                _id={contact._id}
              />  : <ExcelViewer 
                fileName={contact.reportName || contact.fileName || 'Report'} 
                base64=""
                // base64="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" 
                createdAt={contact.createdOn || contact.createdAt || contact.date} 
                _id={contact._id}
              />
              }
              </div>
          ))}
          </div>
          </div>
  )}

  export default ScrollableSection