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
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PDFByteViewerProps {
  fileName: string;
  base64: string;
  createdAt?: string;
  _id?: string;
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

export default function PDFByteViewer({ fileName, base64, createdAt, _id }: PDFByteViewerProps) {
  const [mode, setMode] = useState<'preview' | 'advanced'>('advanced');
  const [isPdfJsReady, setIsPdfJsReady] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      setIsPdfJsReady(true);
    };
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const renderPdfThumbnail = async (base64Data: string) => {
    return new Promise<string>(async (resolve, reject) => {
      if (typeof window !== 'undefined' && window?.pdfjsLib?.getDocument) {
        try {
          // Convert base64 to Uint8Array
          const binary = atob(base64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          // Load PDF from bytes
          const loadingTask = window.pdfjsLib.getDocument({ data: bytes });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          
          // Create canvas for thumbnail
          const canvas = document.createElement('canvas');
          const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Render the page
          await page.render({ 
            canvasContext: canvas.getContext('2d'), 
            viewport 
          }).promise;
          
          resolve(canvas.toDataURL());
        } catch (error) {
          console.error('Error loading PDF:', error);
          reject('Failed to render PDF');
        }
      } else {
        reject('PDF.js is not loaded');
      }
    });
  };

  useEffect(() => {
    if (mode === 'advanced' && isPdfJsReady && base64) {
      setLoading(true);
      renderPdfThumbnail(base64)
        .then((imgData) => {
          setThumbnail(imgData);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error rendering PDF thumbnail:', error);
          setLoading(false);
        });
    } else if (!base64) {
      setLoading(false);
    }
  }, [mode, isPdfJsReady, base64]);

  const handleDownload = () => {
    if (!base64) return;
    
    // Convert base64 to blob and download
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewStates = () => {
    if (_id) {
      router.push(`/reports/${_id}`);
    }
  };

  // Format the date for display
  const formattedDate = formatDate(createdAt);

  return (
    <div className="p-0 w-full">
      <div className="">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="w-full h-48 bg-white flex items-center justify-center">
            <img src="/images/pdflogo.png" alt="PDF" className="w-[80px] h-[80px] object-cover" />
            {/* {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                  <p className="mt-2 text-sm">Loading Preview...</p>
                </div>
              </div>
            ) : mode === 'advanced' && thumbnail ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <img 
                  src={thumbnail} 
                  alt={fileName} 
                  className="max-w-full max-h-full object-contain shadow-sm" 
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                {mode === 'advanced' ? 'No PDF Preview Available' : 'Preview is off'}
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