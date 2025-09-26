"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Table from "@repo/ui/components/table-dynamic/data-table";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import { useDynamicQuery } from "@repo/ui/hooks/api/dynamic-graphql";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

interface TransformedReportDetails {
  _id: string;
  reportName: string;
  extension: string;
  reportTitle: string;
  tenantId: string;
  workflowName: string;
  createdBy: string;
  createdOn: string;
  period: string;
  fromDate: string;
  toDate: string;
  organization: string;
  subsidiary: string[];
  division: string[];
  department: string[];
  designation: string[];
  subDepartment: string[];
  section: string[];
  report: string;
  status: string;
}

function ReportFileManager({ reportData, filters }: { reportData?: any[], filters?: { searchTerm: string; selectedCategory: string } }) {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

  const functionalityList = {
    tabletype: {
      type: "data",
      classvalue: {
        container: "col-span-12 mb-2",
        tableheder: {
          container: "bg-[#2461e8]",
        },
        label: "text-gray-600",
        field: "p-1",
      },
    },
    columnfunctionality: {
      draggable: {
        status: true,
      },
      handleRenameColumn: {
        status: true,
      },
      slNumber: {
        status: true,
      },
      selectCheck: {
        status: false,
      },
      activeColumn: {
        status: true,
      },
    },
    textfunctionality: {
      expandedCells: {
        status: true,
      },
    },
    filterfunctionality: {
      handleSortAsc: {
        status: true,
      },
      handleSortDesc: {
        status: true,
      },
      search: {
        status: true,
      },
    },
    outsidetablefunctionality: {
      paginationControls: {
        status: true,
        start: "",
        end: "",
      },
      entriesPerPageSelector: {
        status: false,
      },
    },
    buttons: {
      save: {
        label: "Save",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => console.log("form"),
      },
      submit: {
        label: "Submit",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => console.log("form"),
      },
      adduser: {
        label: "Add User",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => console.log("form"),
      },
      cancel: {
        label: "Cancel",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => console.log("form"),
      },
      actionDelete: {
        label: "Delete",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (id: string) => console.log("report-delete", id),
      },
      actionLink: {
        label: "View",
        status: true,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (item: any) => {
          router.push(`/reports/${item?._id}`)
        },
      },
      actionEdit: {
        label: "Edit",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (id: string) => console.log("report-edit", id),
      },
    },
  }

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
        // Transform the data to flatten nested structure and format dates
        const transformedData = data.map((report: any) => {
            // Format date to readable format
            const date = new Date(report.createdOn);
            const formattedDate = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            // Format arrays to readable strings
            const formatArray = (arr: any[]) => {
                if (!arr || arr.length === 0) return "None";
                return arr.join(", ");
            };

            // Flatten the nested data object and merge with main object
            const flattenedReport = {
                ...report,
                createdOn: formattedDate,
                subsidiary: formatArray(report.subsidiary),
                division: formatArray(report.division),
                department: formatArray(report.department),
                designation: formatArray(report.designation),
                subDepartment: formatArray(report.subDepartment),
                section: formatArray(report.section),
                status: report.status || "Pending"
            };

            // If there's a nested data object, merge its properties (excluding _class)
            if (report.data && typeof report.data === 'object') {
                const { _class, ...dataWithoutClass } = report.data;
                Object.assign(flattenedReport, dataWithoutClass);
            }

            return flattenedReport;
        });
        
        setReports(transformedData);
        setFilteredReports(transformedData);
    },
    onError: (error: any) => {
        console.error('Error loading organization data:', error);
    }
});

  // Filter reports based on search term and category
  useEffect(() => {
    if (!filters) {
      setFilteredReports(reports);
      return;
    }

    const { searchTerm, selectedCategory } = filters;
    
    let filtered = reports;

    // Filter by search term (report name)
    if (searchTerm && searchTerm.trim() !== '') {
      filtered = filtered.filter((report) =>
        report.reportName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((report) => {
        // Check if the report belongs to the selected category
        return report.workflowName === selectedCategory || 
               report.organization === selectedCategory ||
               report.tenantId === selectedCategory;
      });
    }

    setFilteredReports(filtered);
  }, [reports, filters]);

  return (
    <div className="pl-0 pr-2 mt-0 pt-4">
      <Table
        data={filteredReports}
        functionalityList={functionalityList}
      />
    </div>
  );
}

export default ReportFileManager;
