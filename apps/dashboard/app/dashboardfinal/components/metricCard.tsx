import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowUpRight, ExternalLink, DivideIcon as LucideIcon, Download, FileText } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import PresentAbsent from './presentabsent';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { CheckCircle, XCircle, Clock, ArrowUpIcon as ClockArrowUp, } from "lucide-react"
import { Bar, BarChart, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import Table from "@repo/ui/components/table-dynamic/data-table";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRequest } from '@repo/ui/hooks/api/useGetRequest';

// PDF generation utility
const generatePDF = (data: any[], title: string) => {
    // Create a simple HTML table for PDF generation
    const tableHTML = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    h1 { color: #333; text-align: center; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .timestamp { font-size: 12px; color: #666; text-align: center; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>First Name</th>
                            <th>Middle Name</th>
                            <th>Last Name</th>
                            <th>Shift Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(employee => `
                            <tr>
                                <td>${employee.employeeId || ''}</td>
                                <td>${employee.firstName || ''}</td>
                                <td>${employee.middleName || ''}</td>
                                <td>${employee.lastName || ''}</td>
                                <td>${employee.shiftCode || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `;

    // Create blob and download
    const blob = new Blob([tableHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Excel generation utility
const generateExcel = (data: any[], title: string) => {
    try {
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        
        // Prepare data for Excel
        const excelData = [
            ['Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Shift Code'], // Headers
            ...data.map(employee => [
                employee.employeeId || '',
                employee.firstName || '',
                employee.middleName || '',
                employee.lastName || '',
                employee.shiftCode || ''
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');
        
        // Generate file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        saveAs(blob, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error generating Excel file:', error);
    }
};



// Memoized chart component to prevent re-renders
const ChartModal = React.memo(({ data, config, title }: { data: any[], config: ChartConfig, title: string }) => {
    return (
        <div className="w-full min-h-[250px] p-4 flex justify-center">
            <ChartContainer config={config}>
                <BarChart 
                    accessibilityLayer 
                    data={data}
                    width={Math.max(500, data.length * 60)} // Smaller dynamic width
                    height={250} // Smaller height
                    margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
                >
                    <XAxis
                        dataKey="label"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tickFormatter={(value) => {
                            return value;
                        }} />
                    <Bar
                        dataKey="m"
                        stackId="a"
                        fill="var(--color-m)"
                        radius={[0, 0, 4, 4]} />
                    <Bar
                        dataKey="f"
                        stackId="a"
                        fill="var(--color-f)"
                        radius={[4, 4, 0, 0]} />
                    <ChartTooltip
                        content={<ChartTooltipContent
                            hideLabel
                            className="w-[180px]"
                            formatter={(value, name, item, index) => (
                                <>
                                    <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                        style={{
                                            "--color-bg": `var(--color-${name})`,
                                        } as React.CSSProperties} />
                                    {config[name as keyof typeof config]?.label ||
                                        name}
                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                        {value}
                                    </div>
                                    {/* Add this after the last item */}
                                    {index === 1 && (
                                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                            Total :
                                            <span className="font-normal text-muted-foreground">
                                                {item.payload.label}
                                            </span>
                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                {item.payload.m + item.payload.f}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )} />}
                        cursor={false}
                        defaultIndex={1} />
                </BarChart>
            </ChartContainer>
        </div>
    );
});

ChartModal.displayName = 'ChartModal';

// Separate Modal Component to prevent re-rendering issues
const ModalPortal = React.memo(({ 
    isOpen, 
    onClose, 
    title, 
    children
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode;
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
                    <div 
            className="modal-content bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-4xl max-h-[80vh] animate-in slide-in-from-bottom-4 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
});

ModalPortal.displayName = 'ModalPortal';

const chartData1 = [
    { m: 450, f: 300 },
    { m: 380, f: 420 },
    { m: 520, f: 120 },
]

const chartConfig1 = {
    m: {
        label: "Male",
        color: "rgb(59, 130, 246)",
    },
    f: {
        label: "Female",
        color: "rgb(191, 219, 254)",
    },
} satisfies ChartConfig


interface MetricCardProps {
    icon: typeof LucideIcon;
    title: string;
    value: number;
    change: number;
    chartColor: string;
    className?: string;
    cardType?: 'employee-table' | 'chart-data'; // New prop to determine modal content
    attendanceType?: 'present' | 'absent' | 'lateIn' | 'earlyOut'; // New prop for attendance type
}

export const MetricCard: React.FC<MetricCardProps> = ({
    icon: Icon,
    title,
    value,
    change,
    chartColor,
    className = '',
    cardType = 'chart-data', // Default to chart data
    attendanceType = 'present' // Default to present
}) => {
    const formatValue = (num: number) => {
        return num.toLocaleString();
    };


    const generateChartBars = () => {
        const heights = [40, 25, 35, 60, 45];
        
        // Get color based on attendance type
        let barColor = chartColor;
        if (attendanceType === 'absent') {
            barColor = 'bg-red-400';
        } else if (attendanceType === 'lateIn') {
            barColor = 'bg-orange-400';
        } else if (attendanceType === 'earlyOut') {
            barColor = 'bg-purple-400';
        } else if (attendanceType === 'present') {
            barColor = 'bg-green-400';
        }
        
        return heights.map((height, index) => (
            <div
                key={index}
                className={`${barColor} rounded-sm transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}%`, width: '6px' }}
            />
        ));
    };

    const openPopup = (url: string) => {
        window.open(
            url,
            "popup",
            "width=800,height=500,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
        )
    }
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({ total: 0, present: 0 })
    const [shiftCodes, setShiftCodes] = useState<string[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [employeeData, setEmployeeData] = useState<any[]>([]);
    
    // Additional state for attendance data and chart
    const [presentData, setPresentData] = useState<number>(0);
    const [absentData, setAbsentData] = useState<number>(0);
    const [lateInData, setLateInData] = useState<number>(0);
    const [earlyOutData, setEarlyOutData] = useState<number>(0);
    const [maleData, setMaleData] = useState<number>(0);
    const [femaleData, setFemaleData] = useState<number>(0);
    const [uniqueShiftCodes, setUniqueShiftCodes] = useState<string[]>([]);
    const [uniqueShiftCodesCount, setUniqueShiftCodesCount] = useState<number>(0);
    const [shiftCodeStats, setShiftCodeStats] = useState<{[key: string]: {male: number, female: number}}>({});
    const [chartData, setChartData] = useState(chartData1);

    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQeUt3ZW1kT1RPeVFnLTR0TjRHT1lBdFhMTEl1dmNGd3hGWTJFY29IQzRJIn0.eyJleHAiOjE3NTM2MzE2NDEsImlhdCI6MTc1MzU5NTY0MSwianRpIjoidHJydGNjOjc2Njk0NjA4LTg2MmQtMTJiOC1mYjllLWNmODc0MmJmZjVhOSIsImlzcyI6Imh0dHA6Ly8xMjIuMTY2LjI0NS45Nzo4MDgwL3JlYWxtcy9pbm9wcyIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCJdLCJzdWIiOiJiNTRiN2UxZS0xMzY3LTQwZWItYjhmZS02ODMxY2ZjNTMzY2IiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJnYXRld2F5LWNsaWVudCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImFkbWluIiwiZGVmYXVsdC1yb2xlcy1pbm9wcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJ2aWV3LXVzZXJzIiwicXVlcnktY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyIsInF1ZXJ5LXVzZXJzIl19LCJnYXRld2F5LWNsaWVudCI6eyJyb2xlcyI6WyJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctYXBwbGljYXRpb25zIiwidmlldy1jb25zZW50Iiwidmlldy1ncm91cHMiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsImRlbGV0ZS1hY2NvdW50IiwibWFuYWdlLWNvbnNlbnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9yZ2FuaXphdGlvbiBwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4yNS4wLjEiLCJhZGRyZXNzIjp7fSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJncm91cHMiOlsib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsImRlZmF1bHQtcm9sZXMtaW5vcHMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtZ2F0ZXdheS1jbGllbnQiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjI1LjAuMSIsImNsaWVudF9pZCI6ImdhdGV3YXktY2xpZW50In0.a_P_Ol3MW1bC6j9uH1J06dE9x6ka1Gcvd158MruAk3L_pPDwykcV2gG90axKB7hIksyIK_2h-gb5xjIOj36miBgUL3hmmrNzYCPJPf1AGUWcwR6x6vRPQYjwbNxak6Hpk7pFKauIxYhTuIJISAkpPQIqGIXUFFbd7suB-CWbNAlT7om-tHETMP-JLUPRl9ENMFZ_ffGJ82aLAS7VGCRNC7DInKwJTsqInrfAmfBwf7hgAZh6zRAlH3fs2AM-aKUIBDvacIdoSdU8-9anfmwSAb5Xl-r5qbmN1o4ZQVSGNAC7uJGm_HQtlaG5dvyKtvrQSdQJLuniXnSb0SCKdKWjpw";

    // Use useRequest hook for fetching attendance data
    const {
        data: attendanceResponse,
        loading: isLoadingAttendance,
        error: attendanceError,
        refetch: fetchAttendanceData
    } = useRequest<any[]>({
        url: 'muster/liveAttendance/search',
        method: 'POST',
        data: [
            {
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            }
        ],
        onSuccess: (data) => {
            console.log('Attendance data result:', data);

            // Filter data based on attendance type
            let filteredResult = data;
            if (attendanceType === 'present') {
                filteredResult = data.filter((item: { present: boolean; }) => item.present === true);
            } else if (attendanceType === 'absent') {
                filteredResult = data.filter((item: { absent: boolean; }) => item.absent === true);
            } else if (attendanceType === 'lateIn') {
                filteredResult = data.filter((item: { lateIn: boolean; }) => item.lateIn === true);
            } else if (attendanceType === 'earlyOut') {
                filteredResult = data.filter((item: { earlyOut: boolean; }) => item.earlyOut === true);
            }

            console.log(`Filtered result for ${attendanceType}:`, filteredResult);

            setPresentData(data.filter((item: { present: boolean; }) => item.present === true).length);
            setAbsentData(data.filter((item: { absent: boolean; }) => item.absent === true).length);
            setLateInData(data.filter((item: { lateIn: boolean; }) => item.lateIn === true).length);
            setEarlyOutData(data.filter((item: { earlyOut: boolean; }) => item.earlyOut === true).length);
                         
            const shiftCodes = filteredResult.map((entry: { shiftCode: string; }) => entry.shiftCode);
            const unique = Array.from(new Set(shiftCodes)) as string[];
            setUniqueShiftCodes(unique);
            setUniqueShiftCodesCount(unique.length);
            console.log("uniqueShiftCodes", unique);
            console.log("uniqueShiftCodesCount", unique.length);

            // Calculate male and female count for each shift code based on filtered data
            const shiftStats: {[key: string]: {male: number, female: number}} = {};
            
            unique.forEach(shiftCode => {
                const shiftEmployees = filteredResult.filter((item: { shiftCode: string; }) => item.shiftCode === shiftCode);
                console.log("shiftEmployees", shiftEmployees);
                const maleCount = shiftEmployees.filter((item: { gender: string; }) => item.gender === "Male").length;
                const femaleCount = shiftEmployees.filter((item: { gender: string; }) => item.gender === "Female").length;
                
                shiftStats[shiftCode] = {
                    male: maleCount,
                    female: femaleCount
                };
            });
            
            setShiftCodeStats(shiftStats);
            console.log("shiftCodeStats", shiftStats);

            // Generate chart data from actual shift codes
            const newChartData = unique.map(shiftCode => ({
                label: shiftCode,
                m: shiftStats[shiftCode]?.male || 0,
                f: shiftStats[shiftCode]?.female || 0
            }));

            setChartData(newChartData);
            console.log("newChartData", newChartData);
        },
        onError: (error) => {
            console.error("Error fetching attendance data:", error);
        },
        dependencies: [attendanceType]
    });

    // Use useRequest hook for fetching employee data
    const {
        data: employeeResponse,
        loading: isLoadingEmployees,
        error: employeeError,
        refetch: fetchEmployeeData
    } = useRequest<any[]>({
        url: 'muster/liveAttendance/search',
        method: 'POST',
        data: [
            {
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            },
            {
                "field": "insidePremises",
                "operator": "eq",
                "value": "true"
            },
        ],
        onSuccess: (data) => {
            console.log("Employee data fetched:", data);
            
            // Check if data is an array and has items
            if (!Array.isArray(data) || data.length === 0) {
                console.warn("No employee data received or data is not an array");
                setEmployeeData([]);
                return;
            }
            
            // Log the first employee object to see its structure
            console.log("First employee object structure:", data[0]);
            console.log("Available keys in first employee:", Object.keys(data[0]));
            
            // Filter data to show only required columns
            const filteredData = data.map((employee: any, index: number) => {
                console.log(`Processing employee ${index}:`, employee);
                
                // Try multiple possible field names for each property
                const employeeId = employee.employeeId || employee.employee_id || employee.id || employee.empId || employee.emp_id || employee.employeeID || '';
                const firstName = employee.firstName || employee.first_name || employee.fname || employee.firstname || '';
                const middleName = employee.middleName || employee.middle_name || employee.mname || employee.middlename || '';
                const lastName = employee.lastName || employee.last_name || employee.lname || employee.lastname || '';
                const shiftCode = employee.shiftCode || employee.shift_code || employee.shift || employee.shiftcode || '';
                
                const mappedEmployee = {
                    employeeId,
                    firstName,
                    middleName,
                    lastName,
                    shiftCode
                };
                
                console.log(`Mapped employee ${index}:`, mappedEmployee);
                return mappedEmployee;
            });
            
            console.log("Final filtered data:", filteredData);
            setEmployeeData(filteredData);
        },
        onError: (error) => {
            console.error("Error fetching employee data:", error);
            // Fallback to empty array if API fails
            setEmployeeData([]);
        },
        dependencies: []
    });

    const handleModalOpen = useCallback(() => {
        setShowModal(true);
        // Fetch employee data when modal opens if it's an employee table
        if (cardType === 'employee-table' && employeeData.length === 0) {
            fetchEmployeeData();
        }
        // Fetch attendance data when modal opens if it's chart data
        if (cardType === 'chart-data') {
            fetchAttendanceData();
        }
    }, [cardType, employeeData.length, fetchAttendanceData, fetchEmployeeData]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
    }, []);

    // Effect to set client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect to disable hover effects when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showModal]);

    // Memoized functionality list to prevent re-renders
    const tableFunctionalityList = useMemo(() => ({
        tabletype: {
            type: "data",
            classvalue: {
                container: "col-span-12 mb-2",
                tableheder: {
                    container: "bg-[#f8fafc]",
                },
                label: "text-gray-600",
                field: "p-1",
            },
        },
        columnfunctionality: {
            draggable: {
                status: false,
            },
            handleRenameColumn: {
                status: false,
            },
            slNumber: {
                status: true,
            },
            selectCheck: {
                status: false,
            },
            activeColumn: {
                status: false,
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
                status: true,
            },
        },

    }), []);

    useEffect(() => {
        //fetch("http://192.168.1.11:8000/api/query/attendance/headcount", {
        fetch("http://122.166.245.97:8000/api/query/attendance/headcount", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
               
            },
            mode: "cors",
            credentials: "include",
        }) // calls Next.js API route or proxy
            .then(res => res.json())
            .then(data => setStats(data[0]))
            .catch(err => console.error("Fetch error:", err))
    }, [])

    useEffect(() => {
       //  fetch("http://192.168.1.11:8000/api/query/attendance/shift", {
        fetch("http://122.166.245.97:8000/api/query/attendance/shift", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
               
            },
            mode: "cors",
            credentials: "include",
        }) // replace with your real API
            .then(res => res.json())
            .then(data => {
                // console.log("API data:", data);
                // const labels = data.flatMap((item: any) =>
                //     item.shift?.map((s: any) => s.shiftCode) || []
                // );
                console.log("API data:", data);
                const labels = data.flatMap((item: any) => {
                    const shift = item.shift;

                    // Ensure shift is an array before mapping
                    if (Array.isArray(shift)) {
                        return shift.map((s: any) => s.shiftCode);
                    } else if (typeof shift === "object" && shift !== null) {
                        // If shift is a single object, not an array
                        return [shift.shiftCode];
                    }
                    // If shift is null/undefined or not usable
                    return [];
                });
                setShiftCodes(labels);
                console.log("Extracted shift codes:", labels);
            })
            .catch(err => console.error("Error fetching shift codes:", err));
    }, []);


    console.log(stats);
    console.log(shiftCodes);

    const chartData2 = shiftCodes.map((code, index) => ({
        label: code,//.replace(/^A0*/, 'A'), // Convert A001 → A1, A002 → A2, etc.
        ...chartData1[index]
    }));

    // Memoized chart configuration based on attendance type
    const chartConfig = useMemo(() => {
        const baseConfig = {
            m: {
                label: "Male",
                color: "rgb(59, 130, 246)",
            },
            f: {
                label: "Female",
                color: "rgb(191, 219, 254)",
            },
        };

        // Customize colors based on attendance type
        if (attendanceType === 'absent') {
            return {
                m: {
                    label: "Male",
                    color: "rgb(239, 68, 68)", // Red for absent
                },
                f: {
                    label: "Female",
                    color: "rgb(254, 202, 202)", // Light red for absent
                },
            };
        } else if (attendanceType === 'lateIn') {
            return {
                m: {
                    label: "Male",
                    color: "rgb(245, 158, 11)", // Orange for late in
                },
                f: {
                    label: "Female",
                    color: "rgb(254, 215, 170)", // Light orange for late in
                },
            };
        } else if (attendanceType === 'earlyOut') {
            return {
                m: {
                    label: "Male",
                    color: "rgb(168, 85, 247)", // Purple for early out
                },
                f: {
                    label: "Female",
                    color: "rgb(233, 213, 255)", // Light purple for early out
                },
            };
        }

        return baseConfig;
    }, [attendanceType]);

    // Determine modal title based on card type
    const getModalTitle = () => {
        if (cardType === 'employee-table') {
            return 'Employee List';
        } else {
            const attendanceTypeLabel = attendanceType ? 
                attendanceType.charAt(0).toUpperCase() + attendanceType.slice(1).replace(/([A-Z])/g, ' $1') : 
                'Chart';
            return `${title} - ${attendanceTypeLabel} Data`;
        }
    };

    // Memoized modal content to prevent re-renders
    const modalContent = useMemo(() => {
        if (cardType === 'employee-table') {
            console.log("Rendering employee table with data:", employeeData);
            console.log("Employee data length:", employeeData.length);
            console.log("First employee in modal:", employeeData[0]);
            
            return (
                <div className="flex flex-col h-full">
                    {isLoadingEmployees ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-lg text-gray-600">Loading employee data...</div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Table container with proper scrolling */}
                            <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 border border-gray-200 rounded-lg" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                                <div className="min-w-full">
                                    <Table 
                                        data={employeeData} 
                                        functionalityList={tableFunctionalityList}
                                    />
                                </div>
                            </div>
                            {/* Download buttons - always visible at bottom */}
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center mt-4 flex-shrink-0 bg-white">
                                <div className="text-sm text-gray-600">
                                    {employeeData.length === 0 ? 'No employee data available' : `${employeeData.length} employee(s) found`}
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => generateExcel(employeeData, 'Employee List')}
                                        disabled={employeeData.length === 0}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Excel
                                    </button>
                                    <button
                                        onClick={() => generatePDF(employeeData, 'Employee List')}
                                        disabled={employeeData.length === 0}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div className="overflow-auto max-h-[70vh]">
                    <div className="min-w-[500px] flex justify-center">
                        <ChartModal 
                            data={chartData} 
                            config={chartConfig}
                            title={title}
                        />
                    </div>
                </div>
            );
        }
    }, [cardType, chartData, title, employeeData, isLoadingEmployees, tableFunctionalityList, chartConfig]);

    return (

        <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}>

            <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Icon size={28} className="text-white" />
                </div>

                <div className="text-right">
                    <div className="text-3xl font-bold">{formatValue(value)}</div>
                </div>

                <Button onClick={handleModalOpen} className="gap-2 bg-blue-500">
                    <ExternalLink size={10} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                </Button>

                {/* Modal Portal */}
                {isClient && (
                    <ModalPortal
                        isOpen={showModal}
                        onClose={handleModalClose}
                        title={getModalTitle()}
                    >
                        {modalContent}
                    </ModalPortal>
                )}

            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white/90">{title}</h3>


                <div className="flex items-center text-sm">
                    <span className="text-white/80">
                        Out of {formatValue(change)} Employees
                    </span>

                </div>
            </div>
        </div>
    );
};


//  {/* Mini Chart */}
//  <div className="flex items-end space-x-1 h-16 ml-4">
//         {generateChartBars()}
//     </div>