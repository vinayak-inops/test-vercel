"use client";

import { openDB } from "idb";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import Table from "@repo/ui/components/table-dynamic/data-table";
import DashboardComponent from "./common/DashboardComponent";
import { Button } from "@repo/ui/components/ui/button";
import * as XLSX from "xlsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

function TableEditManager({ paramsValue, setOpen }: { paramsValue: string, setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [excelData, setExcelData] = useState<any>({});
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const params = useParams();
  const fileId = params?.[paramsValue];
  const like = fileId;
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  // Hook for fetching file data
  const { data: searchData, loading: isFetching, error: fetchError } = useRequest<any[]>({
    url: `map/files/search?_id=${fileId}`,
    method: 'GET',
    onSuccess: (data) => {
      if (data && data[0] && data[0].file) {
        const decodedData = decodeExcelData(data[0].file);
        if (decodedData) {
          setExcelData(decodedData);
          const sheetNames = Object.keys(decodedData.data);
          if (sheetNames.length > 0) {
            setSelectedSheet(sheetNames[0]);
          }
        }
      }
    },
    onError: (error) => {
      console.error("Search Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error.response?.data
      });
      alert("Failed to fetch file data. Please try again.");
    },
    dependencies: [fileId]
  });

  // Function to decode base64 and parse Excel data
  const decodeExcelData = (base64Data: string) => {
    try {
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      // Convert binary string to array buffer
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Parse the Excel file
      const workbook = XLSX.read(bytes, { type: "array" });
      // Convert all sheets to JSON
      const data: Record<string, any[]> = {};
      workbook.SheetNames.forEach((sheetName) => {
        data[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
      });
      return { data };
    } catch (error) {
      console.error("Error decoding Excel data:", error);
      return null;
    }
  };

  useEffect(() => {
    const excelData = async () => {
      await loadNotes();
    };
    excelData();
  }, []);

  useEffect(() => {
    const updateValue = data.filter((nodes) => {
      return nodes[0].like == like;
    });
    const fileData = updateValue[0]?.[0];
    setExcelData(fileData);
    const sheetNames = fileData?.data ? Object.keys(fileData.data) : [];
    if (sheetNames.length > 0) {
      setSelectedSheet(sheetNames[0]);
    }
  }, [data]);

  const loadNotes = async () => {
    try {
      const db = await openDB("excelDataDB", 1);
      const allNotes = await db.getAll("excelData");
      setData(allNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  

  // Add scroll handler function
  const handleScroll = (container: HTMLElement) => {
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
  };

  // Add useEffect for initial button state
  useEffect(() => {
    const container = document.getElementById('tabs-container');
    if (container) {
      handleScroll(container);
      
      // Add scroll event listener
      container.addEventListener('scroll', () => handleScroll(container));
      
      // Add resize event listener
      window.addEventListener('resize', () => handleScroll(container));
      
      return () => {
        container.removeEventListener('scroll', () => handleScroll(container));
        window.removeEventListener('resize', () => handleScroll(container));
      };
    }
  }, [excelData]); // Re-run when excelData changes

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
        function: (id: string) => console.log("location-inops", id),
      },
      actionLink: {
        label: "link",
        status: true,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (item: any) => {
          router.push(`/excel-file-manager/upload-statues/${item?.like}`);
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
        function: (id: string) => console.log("location-inops", id),
      },
    },
  }
  console.log("searchData", searchData);

  return (
    <div className="w-full  bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* File Information Card */}
        {searchData && searchData[0] && (
          <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-600">File Name:</span>
                    <span className="font-medium text-gray-900">{searchData[0].fileName}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${searchData[0].status === 'Initiated' ? 'bg-yellow-100 text-yellow-800' :
                          searchData[0].status === 'Completed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {searchData[0].status}
                      </span>
                      <button className={`px-3 py-1 rounded-md text-sm font-medium ${searchData[0].status === 'Initiated' ? 'bg-[#0061ff] text-white' :
                          searchData[0].status === 'Completed' ? 'bg-[#0061ff] text-white' :
                            'bg-[#0061ff] text-white'
                        }`} onClick={() => setOpen(true)}>
                        Status Update Check
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-gray-600">Uploaded By:</span>
                    <span className="font-medium text-gray-900">{searchData[0].uploadedBy}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">Created On:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(searchData[0].createdOn).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-900">{searchData[0].description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading and Error States */}
        {isFetching && <div className="absolute inset-0 bg-white/50 flex items-center justify-center">Loading file data...</div>}
        {fetchError && <div className="text-red-500 p-2">Error loading file: {fetchError.message}</div>}

        {/* Excel Data Table Section */}
        {excelData?.data && (
          <div className=" rounded-lg shadow-sm">
            <Tabs
              defaultValue={selectedSheet}
              value={selectedSheet}
              onValueChange={setSelectedSheet}
              className="w-full"
            >
              <div className="relative w-full">
                {/* Navigation Buttons */}
                {showLeftButton && (
                  <button 
                    onClick={() => {
                      const container = document.getElementById('tabs-container');
                      if (container) {
                        container.scrollLeft -= 200;
                      }
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1 rounded-r-md shadow-md transition-opacity duration-200"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                )}

                {showRightButton && (
                  <button 
                    onClick={() => {
                      const container = document.getElementById('tabs-container');
                      if (container) {
                        container.scrollLeft += 200;
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-1 rounded-l-md shadow-md transition-opacity duration-200"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                )}

                {/* Tabs Container */}
                <div 
                  id="tabs-container"
                  className="overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={(e) => handleScroll(e.currentTarget)}
                >
                  <TabsList className="inline-flex space-x-2 bg-gray-100 p-0 min-w-full">
                    {Object.keys(excelData.data).map((sheetName) => (
                      <TabsTrigger
                        key={sheetName}
                        value={sheetName}
                        className="px-4 py-2 text-sm font-medium whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                      >
                        {sheetName}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Add custom scrollbar styles */}
                <style jsx global>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>

              <div className="p-0">
                {/* <div className="mb-6">
                  <TopTitleDescription
                    titleValue={{
                      title: "Excel Data Table",
                      description: "View and manage your Excel data with interactive features like column reordering and search.",
                    }}
                  />
                </div> */}

                {Object.entries(excelData.data).map(([sheetName, sheetData]) => (
                  <TabsContent key={sheetName} value={sheetName} className="mt-0">
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <Table
                        data={sheetData}
                        functionalityList={functionalityList}
                      />
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableEditManager;
