import { employeeFilterFormStructure, periodFilterFormStructure, progressform, reportFilterFormStructure, reportFormStructure } from "@/json/report/form-structure";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import ProgressForm from "@repo/ui/components/form-dynamic/components/common-field/progress-form";
import PopupTable from "./popup-table";
import { useDynamicQuery } from "@repo/ui/hooks/api/dynamic-graphql";
import { useOrganizationData } from "@repo/ui/hooks/global-backend-value/useOrganizationData";
import { Button } from "@repo/ui/components/ui/button";
import { useApolloClient } from '@apollo/client';
import { fetchDynamicQuery } from '@repo/ui/hooks/api/dynamic-graphql';
import organizationData from "@/json/report/sample-organization";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import { ReportPreview } from "./non-dynamic-componets/report-preview";
import { useSession } from 'next-auth/react';
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken";
import { useWorkflowSSE } from "@repo/ui/hooks/workflow-management/useWorkflowSSE";
import SSEStatusTimeline from "./sse-status-timeline";
import { fetchReports } from "@repo/ui/api/api-connection";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";


interface ReportData {
    report?: string;
    status?: string;
    tenantId?: string;
    reportName?: string;
    subsidiaries?: string[];
    divisions?: string[];
    departments?: string[];
    subDepartments?: string[];
    sections?: string[];
    designations?: string[];
    grades?: string[];
    toDate?: string;
    fromDate?: string;
    period?: string;
    reportTitle?: string;
    extension?: string;
    workflowName?: string;
    [key: string]: any;
}

interface ReportFormData {
    reportName: string;
    period: string;
    extension: string;
    fromDate: string;
    toDate: string;
    reportTitle: string;
    tenantId: string;
    subsidiaries: string[];
    divisions: string[];
    departments: string[];
    subDepartments: string[];
    sections: string[];
    designations: string[];
    grades: string[];
}

interface SimpleTabsProps {
    onTabChange?: (index: number) => void;
    initialTab?: number;
    setOpen?: (open: boolean) => void;
}

export default function SimpleTabs({ onTabChange, initialTab = 0, setOpen }: SimpleTabsProps) {
    const [active, setActive] = useState<number>(initialTab);
    const { data: session, status: sessionStatus } = useSession();
    const [fromValue, setFormValue] = useState<ReportData>({
        report: "",
        tenantCode: "Midhani",
        workflowName: "Report",
        organization: "Midhani",
        uploadedBy: session?.user?.name || "user",
        createdOn: new Date().toISOString(),
    });
    const [messenger, setMessenger] = useState<Record<string, any>>({});
    const [tempOrganizationData, setTempOrganizationData] = useState<any>(null);
    const [currentReportId, setCurrentReportId] = useState<string | null>(null);
    const [showSSEPanel, setShowSSEPanel] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
    const { workflows, status: sseStatus, error: sseError, reconnect } = useWorkflowSSE();

    const client = useApolloClient();
    const {
        data: attendanceResponse,
        loading: attendanceLoading,
        error: attendanceError,
        refetch: fetchAttendance
      } = useRequest<any>({
        url: 'tenantReportConfiguration/search',
        method: 'POST',
        data: [
          {
            field: "tenantCode",
            operator: "eq",
            value: "Midhani"
          },
        ],
        onSuccess: (data: any) => {
          console.log("Attendance data received:", data);
        },
        onError: (error: any) => {
          console.error("Error fetching attendance data:", error);
        },
        dependencies: []
      });

    // Fetch organization data
    const fetchOrganizationData = async () => {
        const organizationFields = {
            fields: [
                'organizationCode',
                'firstMonthOfFinancialYear',
                'subsidiaries { label:subsidiaryName, value:subsidiaryCode, locationCode }',
                'designations { divisionCode, value:designationCode, label:designationName, subsidiaryCode, locationCode }',
                'grades { label:gradeCode, value:gradeName, designationCode, divisionCode, subsidiaryCode, locationCode }',
                'divisions { subsidiaryCode, value:divisionCode, label:divisionName, locationCode }',
                'departments { label:departmentName, value:departmentCode, divisionCode, subsidiaryCode, locationCode }',
                'subDepartments { label:subDepartmentName, value:subDepartmentCode, departmentCode, organizationCode, subsidiaryCode, divisionCode, locationCode }',
                'sections { label:sectionName, value:sectionCode, subDepartmentCode, departmentCode, divisionCode, subsidiaryCode, locationCode }',
                'location { label:locationName, value:locationCode }',
                'employeeCategories { employeeCategoryCode, employeeCategoryName }'
            ]
        };

        try {
            const result = await fetchDynamicQuery(
                organizationFields,
                'organization',
                'FetchAllOrganization', // operationName
                'fetchAllOrganization', // operationType
                {
                    collection: 'organization',
                    tenantCode: 'Midhani'
                }
            );

            if (result.error) {
                throw new Error(result.error.message || 'Failed to fetch organization data');
            }

            return result.data;
        } catch (err) {
            console.error('Error fetching organization data:', err);
            return null;
        }
    };
    console.log("reportName", messenger);

    // Update uploadedBy when session becomes available
    useEffect(() => {
        if (session?.user?.name) {
            setFormValue(prev => ({
                ...prev,
                uploadedBy: session.user!.name
            }));
        }
    }, [session]);

    // Load organization data on component mount
    useEffect(() => {
        const fetchAndSet = async () => {
            setIsLoading(true);
            try {
                const [organizationData, reportsResponse] = await Promise.all([
                    fetchOrganizationData(),
                    fetchReports({ 
                        endpoint: 'tenantReportConfiguration/search',
                        token: token || undefined,
                        method: 'POST',
                        body: [
                            {
                              field: "tenantCode",
                              operator: "eq",
                              value: "Midhani"
                            },
                        ],
                    })
                ]);
                setTempOrganizationData(organizationData);
                if (organizationData) {
                    setMessenger((prev: Record<string, any>) => ({
                        ...prev,
                        organizationData: organizationData[0], // Use organizationData[0] if only the first item is needed
                        reportName: reportsResponse?.data?.[0] || [] 
                    }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchAndSet();
        }
    }, [token]);

    // Check SSE connection status and show connection info
    useEffect(() => {
        console.log("SSE Status:", sseStatus);
        console.log("SSE Error:", sseError);
        console.log("SSE Workflows:", workflows);
        
        if (sseStatus === "error") {
            console.error("SSE Connection failed:", sseError);
        }
    }, [sseStatus, sseError, workflows]);

    useEffect(() => {
        if(messenger?.progressbar === "Report Status"){
            setOpen?.(false);
        }
    }, [messenger]);

    const handleGenerate = async (data: ReportData) => {
        try {

            if (!token) {
                throw new Error('No access token available');
            }

            const backendData = Object.keys(data).reduce((acc: any, key: string) => {
                if(key !== "forlocaluse"){
                    acc[key] = data[key];
                }
                return acc;
            }, {});

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/command/attendance/reports`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        tenant: "Midhani",
                        action: "insert",
                        id: null,
                        collectionName: "reports",
                        event: "reportGeneration",
                        data: backendData
                    })
                }
            );

            const responseData = await response.json();

            console.log("response", response);
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to generate report');
            }
            
            // Only proceed if we have a valid _id in the response
            if (!responseData._id) {
                throw new Error('No report ID received from server');
            }

            // Store the report ID and show SSE panel
            setCurrentReportId(responseData._id);
            setShowSSEPanel(true);

            // If we have a valid _id, continue with the process
            setFormValue((prev: any) => ({
                ...prev,
                generatereport: true,
                _id: responseData._id
            }));
            setMessenger(prev => ({
                ...prev,
                progressbar: "Report Status"
            }));

            console.log("Report generation started with ID:", responseData._id);
            console.log("SSE Status:", sseStatus);
            console.log("Available workflows:", Object.keys(workflows));

            // Call refetch to refresh the reports data after successful generation
            // This will update the reports list in the parent component
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('refreshReports'));
            }

        } catch (error) {
            console.error('Error generating report:', error);
            // Handle error appropriately
        }
    };

    // Show loader while data is being fetched
    if (isLoading || tokenLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Loading report configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex relative">
            <div className="flex-1 overflow-y-scroll scroll-hidden">
                <div className="space-y-4">
                    {/* <div className="w-full flex justify-start">
                        <div className="inline-flex ">
                            {tabs.map((tab, idx) => (
                                <button
                                    key={tab.label}
                                    onClick={() => handleTabClick(idx)}
                                    className={`px-4 py-1.5 text-sm font-bold uppercase rounded-md focus:outline-none transition-all duration-200
                      ${active === idx
                                        ? "bg-[#2563eb] text-white border border-[#2563eb] shadow z-10 scale-105"
                                        : "bg-white text-gray-800 border border-gray-300"}
                      ${idx === 0 ? "ml-0" : "ml-0.5"}
                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div> */}

                    {/* <PopupTable/> */}
                    <DynamicForm
                        department={reportFormStructure}
                        setFormValue={setFormValue}
                        fromValue={fromValue}
                        setMessenger={setMessenger}
                        messenger={messenger}
                    />
                    {(messenger?.progressbar === "Select Report" ||
                        messenger?.progressbar == undefined) && (
                            <DynamicForm
                                department={reportFilterFormStructure}
                                setFormValue={setFormValue}
                                fromValue={fromValue}
                                setMessenger={setMessenger}
                                messenger={messenger}
                            />
                        )}

                    {messenger?.progressbar === "Employee Filter" && (
                        <> 
                            <DynamicForm
                                department={employeeFilterFormStructure}
                                setFormValue={setFormValue}
                                fromValue={fromValue}
                                setMessenger={setMessenger}
                                messenger={messenger}
                                test={tempOrganizationData}
                            />
                        </>
                    )} 

                    {messenger?.progressbar === "Basic Information"   && (
                        <>
                            <DynamicForm
                                department={periodFilterFormStructure}
                                setFormValue={setFormValue}
                                fromValue={fromValue}
                                setMessenger={setMessenger}
                                messenger={messenger}
                            />
                        </>
                    )}

                    {messenger?.progressbar === "Preview" && (
                            <ReportPreview 
                                onBack={() => setMessenger(prev => ({ 
                                    ...prev, 
                                    progressbar: "Basic Information" 
                                }))}
                                onNext={() => {}}
                                onGenerate={handleGenerate}
                                fromValue={fromValue as ReportFormData}
                                setMessenger={setMessenger}
                            />
                    )}
                    {/* {messenger?.progressbar === "Report Status" && (
                        <div className="p-4">
                            <TopTitleDescription
                                titleValue={{
                                    title: "Report Generation Status",
                                    description: `Report ID: ${currentReportId || 'Unknown'}`,
                                }}
                            />
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium">SSE Connection Status: <span className={`${sseStatus === 'connected' ? 'text-green-600' : sseStatus === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>{sseStatus}</span></p>
                                        {sseError && <p className="text-sm text-red-600">Error: {sseError}</p>}
                                    </div>
                                    <Button 
                                        onClick={reconnect} 
                                        variant="outline" 
                                        size="sm"
                                        disabled={sseStatus === 'connecting'}
                                    >
                                        {sseStatus === 'connecting' ? 'Connecting...' : 'Reconnect'}
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Waiting for real-time updates from the server...
                                </p>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
            
            {/* SSE Status Panel */}
            {showSSEPanel && currentReportId && (<></>
                // <div className="w-[360px] px-0 absolute right-0 top-0 h-full pl-4 border-gray-200 z-50">
                //     <SSEStatusTimeline
                //         fileId={currentReportId}
                //         setOpen={setShowSSEPanel}
                //         sseData={workflows}
                //     />
                // </div>
            )}
        </div>
    );
} 