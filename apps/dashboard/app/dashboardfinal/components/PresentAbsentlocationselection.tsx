"use client";

/**
 * PresentAbsentLocationSelection Component
 * 
 * Enhanced with improved scrollable functionality:
 * - Responsive modal with better sizing (90vh height, max-width 6xl)
 * - Custom scrollbar styling for better UX
 * - Sticky table headers that remain visible during scroll
 * - Scroll indicator when content overflows
 * - Keyboard navigation support (ESC to close modal)
 * - Loading spinner and empty state handling
 * - Improved table row hover effects
 * - Better responsive design for different screen sizes
 * - Body scroll prevention when modal is open
 */

import { CheckCircle, XCircle, Clock, LogOut, ArrowUpRight, RefreshCw, Edit, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Bar, BarChart, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { createPortal } from 'react-dom';
import Table from "@repo/ui/components/table-dynamic/data-table";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF generation utility
const generatePDF = (data: any[], title: string) => {
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
        const workbook = XLSX.utils.book_new();
        
        const excelData = [
            ['Employee ID', 'First Name', 'Middle Name', 'Last Name', 'Shift Code'],
            ...data.map(employee => [
                employee.employeeId || '',
                employee.firstName || '',
                employee.middleName || '',
                employee.lastName || '',
                employee.shiftCode || ''
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Data');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        saveAs(blob, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Error generating Excel file:', error);
    }
};

// Memoized table component
const EmployeeTable = React.memo(({ data, functionalityList }: { data: any[], functionalityList: any }) => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkScroll = () => {
            if (tableRef.current) {
                const { scrollHeight, clientHeight } = tableRef.current;
                setShowScrollIndicator(scrollHeight > clientHeight);
            }
        };

        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [data]);

    return (
        <div className="w-full h-full flex flex-col">
            {showScrollIndicator && (
                <div className="text-xs text-gray-500 text-center py-1 bg-blue-50 border-b border-blue-200 flex-shrink-0">
                    ↕️ Scroll to see more data
                </div>
            )}
            <div ref={tableRef} className="flex-1 overflow-auto min-h-0 table-container">
                <Table 
                    data={data} 
                    functionalityList={functionalityList}
                />
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4 mt-4 flex-shrink-0 bg-white">
                <button
                    onClick={() => generateExcel(data, 'Employee List')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors duration-200"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Download Excel
                </button>
                <button
                    onClick={() => generatePDF(data, 'Employee List')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-colors duration-200"
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Download PDF
                </button>
            </div>
        </div>
    );
});

EmployeeTable.displayName = 'EmployeeTable';

// Modal Portal Component
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
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4"
            onClick={onClose}
        >
            <div 
                className="modal-content bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-6xl h-[90vh] animate-in slide-in-from-bottom-4 duration-200 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0 bg-white">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
});

ModalPortal.displayName = 'ModalPortal';


// Move the chart data outside component - will be replaced with actual data
const chartData1 = [
    { label: "A1", m: 0, f: 0 },
    { label: "A2", m: 0, f: 0 },
    { label: "A3", m: 0, f: 0 },
    { label: "B1", m: 0, f: 0 },
    { label: "B2", m: 0, f: 0 },
    { label: "B3", m: 0, f: 0 },
    { label: "C1", m: 0, f: 0 },
    { label: "C2", m: 0, f: 0 },
    { label: "C3", m: 0, f: 0 },
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


export default function PresentAbsentLocationSelection({ 
    name, 
    hierarchyLevel = 'location',
    parentLocation = '',
    parentSubsidiary = '',
    parentDivision = ''
}: { 
    name: string;
    hierarchyLevel?: 'location' | 'subsidiary' | 'division' | 'department';
    parentLocation?: string;
    parentSubsidiary?: string;
    parentDivision?: string;
}) {
    // Add custom styles for better scrolling
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .modal-open {
                overflow: hidden;
            }
            .table-container {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e0 #f7fafc;
            }
            .table-container::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .table-container::-webkit-scrollbar-track {
                background: #f7fafc;
                border-radius: 4px;
            }
            .table-container::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 4px;
            }
            .table-container::-webkit-scrollbar-thumb:hover {
                background: #a0aec0;
            }
            .sticky-header {
                position: sticky;
                top: 0;
                z-index: 10;
                background: #f8fafc;
            }
            .table-row:hover {
                background-color: #f8fafc;
                transition: background-color 0.2s ease;
            }
            .table-cell {
                padding: 12px 8px;
                border-bottom: 1px solid #e2e8f0;
            }
            .table-header {
                background-color: #f8fafc;
                font-weight: 600;
                color: #374151;
                border-bottom: 2px solid #e5e7eb;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    console.log("name", name);
    console.log("hierarchyLevel", hierarchyLevel);
    console.log("parentLocation", parentLocation);
    console.log("parentSubsidiary", parentSubsidiary);
    console.log("parentDivision", parentDivision);
    
    const [value, setValue] = useState("")
    const [stats, setStats] = useState({ total: 0, present: 0 })
    const [shiftCodes, setShiftCodes] = useState<string[]>([]);
    
    // Additional state for attendance data
    const [insidePremisesData, setInsidePremisesData] = useState<number>(0);
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
    const [orgempcount, setOrgempcount] = useState<number>(0);
    
    // Separate chart data for each attendance type
    const [presentChartData, setPresentChartData] = useState(chartData1);
    const [absentChartData, setAbsentChartData] = useState(chartData1);
    const [lateChartData, setLateChartData] = useState(chartData1);
    const [earlyChartData, setEarlyChartData] = useState(chartData1);

    // Modal state management
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [employeeData, setEmployeeData] = useState<any[]>([]);
    const [isClient, setIsClient] = useState(false);

    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQeUt3ZW1kT1RPeVFnLTR0TjRHT1lBdFhMTEl1dmNGd3hGWTJFY29IQzRJIn0.eyJleHAiOjE3NTM3MDQ4NTEsImlhdCI6MTc1MzY2ODg1MSwianRpIjoidHJydGNjOmM0NmYyNjk1LTNjZDQtOGJjOC1hNDYyLTZkNTUxYzgwYzQyMyIsImlzcyI6Imh0dHA6Ly8xMjIuMTY2LjI0NS45Nzo4MDgwL3JlYWxtcy9pbm9wcyIsImF1ZCI6WyJyZWFsbS1tYW5hZ2VtZW50IiwiYWNjb3VudCJdLCJzdWIiOiJiNTRiN2UxZS0xMzY3LTQwZWItYjhmZS02ODMxY2ZjNTMzY2IiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJnYXRld2F5LWNsaWVudCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImFkbWluIiwiZGVmYXVsdC1yb2xlcy1pbm9wcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsicmVhbG0tbWFuYWdlbWVudCI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJ2aWV3LXVzZXJzIiwicXVlcnktY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyIsInF1ZXJ5LXVzZXJzIl19LCJnYXRld2F5LWNsaWVudCI6eyJyb2xlcyI6WyJhZG1pbiJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctYXBwbGljYXRpb25zIiwidmlldy1jb25zZW50Iiwidmlldy1ncm91cHMiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsImRlbGV0ZS1hY2NvdW50IiwibWFuYWdlLWNvbnNlbnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9yZ2FuaXphdGlvbiBwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4yNS4wLjEiLCJhZGRyZXNzIjp7fSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJncm91cHMiOlsib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsImRlZmF1bHQtcm9sZXMtaW5vcHMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtZ2F0ZXdheS1jbGllbnQiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjI1LjAuMSIsImNsaWVudF9pZCI6ImdhdGV3YXktY2xpZW50In0.Yn7-aDuLAZWnTM_eD12b-g-MxW4EWyYL_GOdq2bkbCKLVEeUOZl1W38J4rZOukxoXw1osbXyY_askiZV07nxXzuBRkoZtjf1flAgMVstOam7d3tC3ht25CxX5EqLLhkfG-HvFAsYGI0Ji4h3KKmM744s5I6HKa9pup97OtcQvNcAURM1ZKz9qblVW0GR-z7KAr-kNemx4t5aSmm5tsEFHpQnFaylLPZtfZnc875_BDr4thqX3ADiew3h-JMQ5KHkLcVmdo5qwsgWkJShhWFUQB6acTML4wgIrBirCkfcopvYsiiom_DQ7nmiQebZGcJh9uZ0DTs8xNsU4uY-DDtnAw";

    // Helper function to build payload based on hierarchy level
    const buildHierarchyPayload = () => {
        const basePayload = [
            {
                "field": "organizationCode",
                "operator": "eq",
                "value": "Midhani"
            }
        ];

        // Add location filter (always required)
        if (parentLocation) {
            basePayload.push({
                "field": "deployment.location.locationCode",
                "operator": "eq",
                "value": parentLocation
            });
        } else {
            // If no parent location, use the name as location
            basePayload.push({
                "field": "deployment.location.locationCode",
                "operator": "in",
                "value": name
            });
        }

        // Add subsidiary filter if we're at division or department level
        if (hierarchyLevel === 'division' || hierarchyLevel === 'department') {
            if (parentSubsidiary) {
                basePayload.push({
                    "field": "deployment.subsidiary.subsidiaryCode",
                    "operator": "eq",
                    "value": parentSubsidiary
                });
            }
        }

        // Add division filter if we're at department level
        if (hierarchyLevel === 'department') {
            if (parentDivision) {
                basePayload.push({
                    "field": "deployment.division.divisionCode",
                    "operator": "eq",
                    "value": parentDivision
                });
            }
        }

        // Add current level filter
        switch (hierarchyLevel) {
            case 'subsidiary':
                basePayload.push({
                    "field": "deployment.subsidiary.subsidiaryCode",
                    "operator": "eq",
                    "value": name
                });
                break;
            case 'division':
                basePayload.push({
                    "field": "deployment.division.divisionCode",
                    "operator": "eq",
                    "value": name
                });
                break;
            case 'department':
                basePayload.push({
                    "field": "deployment.department.departmentCode",
                    "operator": "eq",
                    "value": name
                });
                break;
            default:
                // For location level, no additional filter needed
                break;
        }

        return basePayload;
    };

    // Fetch organization data and attendance data
    useEffect(() => {
        const fetchOrganizationData = async () => {
            const payload = buildHierarchyPayload();
            console.log('Organization payload:', payload);

            try {
                const response = await fetch('http://192.168.88.86:8000/api/query/attendance/contract_employee/count', {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    mode: "cors",
                    credentials: "include",
                    body: JSON.stringify(payload),
                });
              
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const rawData = await response.json();
                console.log('Organization API Response:', rawData);
                setOrgempcount(rawData);
                setStats(prev => ({ ...prev, total: rawData }));

            } catch (error) {
                console.error('Error fetching organization data:', error);
            }
        };

        const fetchAttendanceData = async () => {
            const today = new Date();
            const formattedToday = today.toLocaleDateString('en-GB').split('/').join('-'); // "26-07-2025"
            console.log("formattedToday", formattedToday);
            
            // Build attendance payload based on hierarchy
            const attendancePayload = [{
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            }];

            // Add location filter
            if (parentLocation) {
                attendancePayload.push({
                    "field": "deployment.location.locationCode",
                    "operator": "eq",
                    "value": parentLocation
                });
            } else {
                attendancePayload.push({
                    "field": "deployment.location.locationCode",
                    "operator": "eq",
                    "value": name
                });
            }

            // Add subsidiary filter if we're at division or department level
            if (hierarchyLevel === 'division' || hierarchyLevel === 'department') {
                if (parentSubsidiary) {
                    attendancePayload.push({
                        "field": "deployment.subsidiary.subsidiaryCode",
                        "operator": "eq",
                        "value": parentSubsidiary
                    });
                }
            }

            // Add division filter if we're at department level
            if (hierarchyLevel === 'department') {
                if (parentDivision) {
                    attendancePayload.push({
                        "field": "deployment.division.divisionCode",
                        "operator": "eq",
                        "value": parentDivision
                    });
                }
            }

            // Add current level filter
            switch (hierarchyLevel) {
                case 'subsidiary':
                    attendancePayload.push({
                        "field": "deployment.subsidiary.subsidiaryCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                case 'division':
                    attendancePayload.push({
                        "field": "deployment.division.divisionCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                case 'department':
                    attendancePayload.push({
                        "field": "deployment.department.departmentCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                default:
                    // For location level, no additional filter needed
                    break;
            }

            console.log("attendance payload", attendancePayload);

            try {
                const response = await fetch('http://122.166.245.97:8000/api/query/attendance/muster/liveAttendance/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    mode: 'cors',
                    credentials: 'include',
                    body: JSON.stringify(attendancePayload),
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('POST error:', errorText);
                    return;
                }
                const result = await response.json();
                console.log('POST result:', result);

              //  setInsidePremisesData(result.filter((item: { insidePremises: boolean; }) => item.insidePremises === true).length);
                setPresentData(result.filter((item: { present: boolean; }) => item.present === true).length);
                setAbsentData(result.filter((item: { absent: boolean; }) => item.absent === true).length);
                setLateInData(result.filter((item: { lateIn: boolean; }) => item.lateIn === true).length);
                setEarlyOutData(result.filter((item: { earlyOut: boolean; }) => item.earlyOut === true).length);
                             
                const shiftCodes = result.map((entry: { shiftCode: string; }) => entry.shiftCode);
                const unique = Array.from(new Set(shiftCodes)) as string[];
                setUniqueShiftCodes(unique);
                setUniqueShiftCodesCount(unique.length);
                console.log("uniqueShiftCodes", unique);
                console.log("uniqueShiftCodesCount", unique.length);

                // Calculate male and female count for each shift code
                const shiftStats: {[key: string]: {male: number, female: number}} = {};
                
                unique.forEach(shiftCode => {
                    const shiftEmployees = result.filter((item: { shiftCode: string; }) => item.shiftCode === shiftCode);
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

                // Generate chart data for each attendance type
                const generateChartDataForStatus = (status: string) => {
                    return unique.map(shiftCode => {
                        const shiftEmployees = result.filter((item: { shiftCode: string; }) => item.shiftCode === shiftCode);
                        const statusEmployees = shiftEmployees.filter((item: any) => {
                            switch(status) {
                                case 'present': return item.present === true;
                                case 'absent': return item.absent === true;
                                case 'late': return item.lateIn === true;
                                case 'early': return item.earlyOut === true;
                                default: return false;
                            }
                        });
                        
                        const maleCount = statusEmployees.filter((item: { gender: string; }) => item.gender === "Male").length;
                        const femaleCount = statusEmployees.filter((item: { gender: string; }) => item.gender === "Female").length;
                        
                        return {
                            label: shiftCode,
                            m: maleCount,
                            f: femaleCount
                        };
                    });
                };

                // Set chart data for each attendance type
                setPresentChartData(generateChartDataForStatus('present'));
                setAbsentChartData(generateChartDataForStatus('absent'));
                setLateChartData(generateChartDataForStatus('late'));
                setEarlyChartData(generateChartDataForStatus('early'));
                
                // Keep the original chart data for backward compatibility
                setChartData(generateChartDataForStatus('present'));
                console.log("Chart data generated for all attendance types");
            } catch (error) {
                console.error('POST exception:', error);
            }
        };

        // Fetch both organization data and attendance data
        fetchOrganizationData();
        fetchAttendanceData();
    }, [name, hierarchyLevel, parentLocation, parentSubsidiary, parentDivision]); // Add all dependencies

    // Effect to set client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Effect to disable hover effects when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('modal-open');
            // Restore body scroll when modal is closed
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    // Memoized functionality list to prevent re-renders
    const tableFunctionalityList = useMemo(() => ({
        tabletype: {
            type: "data",
            classvalue: {
                container: "col-span-12 mb-2 h-full",
                tableheder: {
                    container: "bg-[#f8fafc] sticky top-0 z-10",
                },
                label: "text-gray-600",
                field: "p-2",
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

     // POST logic moved from handlePostExample
     const fetchShiftCodes = async () => {
        const today = new Date();
        const formattedToday = today.toLocaleDateString('en-GB').split('/').join('-'); // "26-07-2025"
        console.log("formattedToday", formattedToday);
        const payload = [{
            "field": "attendanceDate",
            "operator": "eq",
            "value": "23-07-2025"
        }];
        console.log("payload", payload);

        try {
            const response = await fetch('http://122.166.245.97:8000/api/query/attendance/muster/liveAttendance/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('POST error:', errorText);
                // alert('POST failed: ' + errorText);
                return;
            }
            const result = await response.json();
            console.log('POST result:', result);

           


        } catch (error) {
            console.error('POST exception:', error);
            // alert('POST exception: ' + error);
        }
    };


    // const {
    //   data,
    //   error,
    //   loading,
    //   refetch
    //   } = useRequest<any[]>({
    //   url: "headcount",
    //   onSuccess: (data) => {
    //   console.log(data);
    //   },
    //   onError: (error) => {
    //   console.error('Error loading organization data:', error);
    //   }
    //   });
    //   console.log("hello");

    // Function to fetch employee data based on attendance type
    const fetchEmployeeData = useCallback(async (attendanceType: 'present' | 'absent' | 'lateIn' | 'earlyOut') => {
        setIsLoadingEmployees(true);
        try {
            // Build hierarchical payload for employee data
            const payload = [{
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            }];

            // Add location filter
            if (parentLocation) {
                payload.push({
                    "field": "deployment.location.locationCode",
                    "operator": "eq",
                    "value": parentLocation
                });
            } else {
                payload.push({
                    "field": "deployment.location.locationCode",
                    "operator": "eq",
                    "value": name
                });
            }

            // Add subsidiary filter if we're at division or department level
            if (hierarchyLevel === 'division' || hierarchyLevel === 'department') {
                if (parentSubsidiary) {
                    payload.push({
                        "field": "deployment.subsidiary.subsidiaryCode",
                        "operator": "eq",
                        "value": parentSubsidiary
                    });
                }
            }

            // Add division filter if we're at department level
            if (hierarchyLevel === 'department') {
                if (parentDivision) {
                    payload.push({
                        "field": "deployment.division.divisionCode",
                        "operator": "eq",
                        "value": parentDivision
                    });
                }
            }

            // Add current level filter
            switch (hierarchyLevel) {
                case 'subsidiary':
                    payload.push({
                        "field": "deployment.subsidiary.subsidiaryCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                case 'division':
                    payload.push({
                        "field": "deployment.division.divisionCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                case 'department':
                    payload.push({
                        "field": "deployment.department.departmentCode",
                        "operator": "eq",
                        "value": name
                    });
                    break;
                default:
                    // For location level, no additional filter needed
                    break;
            }

            // Add attendance type filter
            if (attendanceType === 'present') {
                payload.push({
                    "field": "present",
                    "operator": "eq",
                    "value": "true"
                });
            } else if (attendanceType === 'absent') {
                payload.push({
                    "field": "absent",
                    "operator": "eq",
                    "value": "true"
                });
            } else if (attendanceType === 'lateIn') {
                payload.push({
                    "field": "lateIn",
                    "operator": "eq",
                    "value": "true"
                });
            } else if (attendanceType === 'earlyOut') {
                payload.push({
                    "field": "earlyOut",
                    "operator": "eq",
                    "value": "true"
                });
            }

            const response = await fetch('http://122.166.245.97:8000/api/query/attendance/muster/liveAttendance/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Employee data fetched for ${attendanceType}:`, data);
                
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn(`No employee data received for ${attendanceType}`);
                    setEmployeeData([]);
                    return;
                }
                
                // Filter data to show only required columns
                const filteredData = data.map((employee: any) => {
                    const employeeId = employee.employeeId || employee.employee_id || employee.id || employee.empId || employee.emp_id || employee.employeeID || '';
                    const firstName = employee.firstName || employee.first_name || employee.fname || employee.firstname || '';
                    const middleName = employee.middleName || employee.middle_name || employee.mname || employee.middlename || '';
                    const lastName = employee.lastName || employee.last_name || employee.lname || employee.lastname || '';
                    const shiftCode = employee.shiftCode || employee.shift_code || employee.shift || employee.shiftcode || '';
                    
                    return {
                        employeeId,
                        firstName,
                        middleName,
                        lastName,
                        shiftCode
                    };
                });
                
                console.log(`Filtered data for ${attendanceType}:`, filteredData);
                setEmployeeData(filteredData);
            } else {
                console.error(`Failed to fetch employee data for ${attendanceType}:`, response.status);
                setEmployeeData([]);
            }
        } catch (error) {
            console.error(`Error fetching employee data for ${attendanceType}:`, error);
            setEmployeeData([]);
        } finally {
            setIsLoadingEmployees(false);
        }
    }, [name, hierarchyLevel, parentLocation, parentSubsidiary, parentDivision, token]);

    // Function to handle modal open for different attendance types
    const handleModalOpen = useCallback((attendanceType: 'present' | 'absent' | 'lateIn' | 'earlyOut') => {
        const titles = {
            present: 'Present Employees',
            absent: 'Absent Employees',
            lateIn: 'Late In Employees',
            earlyOut: 'Early Out Employees'
        };
        
        setModalTitle(titles[attendanceType]);
        setShowModal(true);
        fetchEmployeeData(attendanceType);
    }, [fetchEmployeeData]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
        setEmployeeData([]);
    }, []);

    // Add keyboard navigation support
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (showModal && event.key === 'Escape') {
                handleModalClose();
            }
        };

        if (showModal) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showModal, handleModalClose]);

    const openPopup = (url: string) => {
        window.open(
            url,
            "popup",
            "width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
        )
    }

    return (


        <> 
         {/* <p>Total Users: {stats.total}</p>
            <p>Active Users: {stats.present}</p><div>
                <h2>Shift Codes</h2>
                <ul>
                    {shiftCodes.map((code, idx) => (
                        <li key={idx}>{code}</li>
                    ))}
                </ul>
            </div> */}


            <div >
                <main >


                    <div className="p-0 space-y-4 bg-gray-50">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 p-4">

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Present
                                        </div>
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}

                                    <Button onClick={() => handleModalOpen('present')} className="flex items-center gap-2 bg-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>

                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold"> {presentData}/{orgempcount}</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={presentChartData}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
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
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
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
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <UserX className="w-5 h-5" />
                                            Absent
                                        </div>
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button onClick={() => handleModalOpen('absent')} className="flex items-center gap-2 bg-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{absentData}/{orgempcount}</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={absentChartData}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
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
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
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
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>


                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Late
                                        </div>
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button onClick={() => handleModalOpen('lateIn')} className="flex items-center gap-2 bg-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{lateInData}/{orgempcount}</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={lateChartData}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
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
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
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
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <LogOut className="w-5 h-5" />
                                            Early
                                        </div>
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button onClick={() => handleModalOpen('earlyOut')} className="flex items-center gap-2 bg-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{earlyOutData}/{orgempcount}</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={earlyChartData}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
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
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
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
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>



                        </div>
                    </div>

                </main>

            </div>

            {/* Modal Portal */}
            {isClient && (
                <ModalPortal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    title={modalTitle}
                >
                    <div className="h-full flex flex-col">
                        {isLoadingEmployees ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <div className="text-lg text-gray-600">Loading employee data...</div>
                                </div>
                            </div>
                        ) : employeeData.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                                    <div className="text-lg text-gray-600">No employee data found</div>
                                    <div className="text-sm text-gray-500 mt-2">Try adjusting your filters or check the date range</div>
                                </div>
                            </div>
                        ) : (
                            <EmployeeTable 
                                data={employeeData} 
                                functionalityList={tableFunctionalityList}
                            />
                        )}
                    </div>
                </ModalPortal>
            )}
        </>
    )
}
