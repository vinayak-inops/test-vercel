'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Download, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Button } from "@repo/ui/components/ui/button";
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

interface ExcelViewerProps {
  fileName: string;
  base64: string;
  createdAt?: string;
  _id: string;
}

// Function to format date in a user-friendly way
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date available';
  
  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format: "Jan 15, 2025 at 10:00 AM"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export default function ExcelViewer({ fileName, base64, createdAt,_id }: ExcelViewerProps) {
  const [data, setData] = useState<any[][]>([]);
  const [mode, setMode] = useState<'preview' | 'advanced'>('advanced');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleViewStates = () => {
    if (_id) {
      router.push(`/reports/${_id}`);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (base64) {
      setTimeout(() => {
        try {
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const workbook = XLSX.read(bytes, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          setData(sheetData as any[][]);
        } catch (e) {
          setData([]);
        } finally {
          setLoading(false);
        }
      }, 10);
    } else {
        setData([]);
        setLoading(false);
    }
  }, [base64]);

  const handleDownload = () => {
    const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = () => {
    setMode(mode === 'advanced' ? 'preview' : 'advanced');
  };

  // Format the date for display
  const formattedDate = formatDate(createdAt);

  return (
    <div className="p-0 w-full">
      <div className="">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="w-full h-48 bg-white flex justify-center items-center">
          <img src="/images/pdf.jpg" alt="PDF" className="w-[80px] h-[80px] object-cover" />
            {/* {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                  <p className="mt-2 text-sm">Loading Preview...</p>
                </div>
              </div>
            ) : mode === 'advanced' && data.length > 0 ? (
              <div className="w-full h-full">
                <table className="min-w-full border text-xs bg-white">
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="border px-2 py-1">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                {mode === 'advanced' ? 'No Data' : 'Preview is off'}
              </div>
            )} */}
          </div>
          <div className="p-4 py-2 bg-[#f5f5f5] relative">
            <div className="ml-4 flex-shrink-0 absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 rounded-md shadow-lg border border-gray-200 bg-white py-1"
                >
                  <DropdownMenuItem 
                    onClick={handleViewStates}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    <Eye className="mr-3 h-4 w-4 text-gray-500" />
                    <span>View Updated Report</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h2 className="font-semibold text-sm mb-1 text-gray-900 pr-8">{fileName}</h2>
            <p className="text-gray-500 text-sm">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 