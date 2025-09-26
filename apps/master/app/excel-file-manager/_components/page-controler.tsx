"use client";
import { SheetData } from "@/type/excel-file-manager/excel-file-manager";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import PayrollRuns from "./common/payroll-runs";
import FileTableManager from "./file-table-manager";
import FilesAndAssets from "./common/files-and-assets";
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper";
import ExcelUploadForm from "./common/excel-upload-form";
import ExcelUploaderInitial from "./excel-uploader-initial";
import { FileUploader } from "./common/file-uploader";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";

interface UploadResponse {
  _id: string;
  [key: string]: any;
}

function PageControler() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelDataTable, setExcelDataTable] = useState<SheetData | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [nameofexcel, setNameOfExcel] = useState("");
  const [workflowname, setWorkFlowName] = useState("");
  const [excelFile, setExcelFile] = useState<any | null>(null);
  const [descriptionOfExcel, setDescriptionOfExcel] = useState("");

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to reset all state variables when popup closes
  const resetPopupState = () => {
    setExcelDataTable(null);
    setExcelFile(null);
    setNameOfExcel("");
    setWorkFlowName("");
    setDescriptionOfExcel("");
    setUploadStatus("idle");
  };

  // Custom setOpen function that resets state when closing
  const handleSetOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof value === 'function') {
      setOpen((prev) => {
        const newValue = value(prev);
        if (!newValue) {
          resetPopupState();
        }
        return newValue;
      });
    } else {
      setOpen(value);
      if (!value) {
        resetPopupState();
      }
    }
  };

  const { post, loading, error, uploadProgress } = usePostRequest<UploadResponse>({
    url: 'uploadfile',
    files: excelFile,
    headers: {
      'X-workflow': workflowname,
      'X-Tenant': 'Midhani',
      'X-user': 'Midhani',
      'X-description': descriptionOfExcel,
    },
    onSuccess: (responseData) => {
      console.log("Upload Response:", responseData);
      if (responseData._id) {
        console.log("File ID:", responseData._id);
        router.push(`/excel-file-manager/upload-statues/${responseData._id}`);
      }
    },
    onError: (error) => {
      console.error("Upload Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        error: error.response?.data
      });
      alert("File upload failed. Please try again.");
    },
    onProgress: (progress) => {
      console.log(`Upload Progress: ${progress}%`);
    }
  });

  const clearAllExcelData = async () => {
    try {
      const db = await openDB("excelDataDB", 1);
      await db.clear("excelData");
      await loadNotes(); // Refresh the list
      console.log("All Excel data cleared successfully.");
    } catch (error) {
      console.error("Error clearing Excel data:", error);
    }
  };

  const popupContent = {
    title: "Excel File Uploader",
    description:
      "Upload an Excel file, validate format, preview data, and submit for processing.",
  };

  function handleSave() {
    if (!excelFile) {
      return;
    }

    const data = processAllExcelSheets(excelDataTable);
    const like = nameofexcel
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");

    post();
  }

  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await openDB("excelDataDB", 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains("excelData")) {
              const store = db.createObjectStore("excelData", {
                keyPath: "id",
                autoIncrement: true,
              });
              store.createIndex("title", "title", { unique: false });
              store.createIndex("createdAt", "createdAt", { unique: false });
            }
          },
        });
        await loadNotes();
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    initDB();
  }, []);

  const loadNotes = async () => {
    try {
      const db = await openDB("excelDataDB", 1);
      const allNotes = await db.getAll("excelData");
      let processedData: any[] = [];
      allNotes.forEach((note: any) => {
        const { data, ...rest } = note[0];
        processedData.push(rest);
      });
      setExcelData(processedData);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const excelFileUpload = {
    field: [
      {
        label: "Excel File Description",
        tag: "textarea",
        placeholder: "Rename the excel file",
      },
      {
        label: "WorkFlow",
        tag: "selectlist",
        placeholder: "",
      },
    ],
    button: {
      text: "Submit",
    },
  };

  const addNote = async (dataArray: any) => {
    try {
      const db = await openDB("excelDataDB", 1);
      await db.add("excelData", dataArray);
      await loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const db = await openDB("excelDataDB", 1);
      await db.delete("excelData", id);
      await loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const processAllExcelSheets = (sheetsData: any): any => {
    if (!sheetsData || typeof sheetsData !== "object") return [];

    const allProcessedData: Record<string, any> = {};

    Object.entries(sheetsData).forEach(([sheetName, sheetData]: any) => {
      if (sheetData && sheetData.length > 0) {
        const headers = sheetData[0].map((header: string) => ({
          key: header.trim().toLowerCase().replace(/\s+/g, "_"),
          label: header.trim().toUpperCase(),
        }));

        const rows = sheetData.slice(1).map((row: any[], index: number) => {
          const rowData: Record<string, any> = {};
          row.forEach((cell, cellIndex) => {
            const headerKey = headers[cellIndex]?.key || `column_${cellIndex}`;
            rowData[headerKey] = cell;
          });
          return { ...rowData, id: `row-${index}` };
        });

        allProcessedData[sheetName] = rows;
      }
    });

    return allProcessedData;
  };

  const handleExcelDataUpdate = (newData: any) => {
    setExcelDataTable(newData);
    setUploadStatus("success");
  };

  useEffect(() => {
    if (workflowname !== "" && nameofexcel !== "") {
      handleSave();
    }
  }, [excelDataTable]);
  

  return (
    <>
      {open && (
        <MiniPopupWrapper content={popupContent} setOpen={handleSetOpen} open={open}>
          <FileUploader
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
            setExcelDataTable={setExcelDataTable}
            setExcelFile={(file: File | null) => setExcelFile(file)}
          />
          {uploadStatus === "success" && (
            <ExcelUploadForm
              setOpen={handleSetOpen}
              nameOfExcel={nameofexcel}
              setNameOfExcel={setNameOfExcel}
              workFlowName={workflowname}
              setWorkFlowName={setWorkFlowName}
              handleSave={handleSave}
              excelFileUpload={excelFileUpload}
              descriptionOfExcel={descriptionOfExcel}
              setDescriptionOfExcel={setDescriptionOfExcel}
            />
          )}
        </MiniPopupWrapper>
      )}
      <div className="flex-1 overflow-y-scroll scroll-hidden">
        {/* {<PayrollRuns />} */}
        {<FileTableManager excelData={excelData} />}
        {/* {excelData.length == 0 && (
          <div className="flex justify-center items-center h-full">
            <ExcelUploaderInitial
              setXmlFileList={handleExcelDataUpdate}
              setOpen={setOpen}
              setExcelDataTable={setExcelDataTable}
            />
          </div>
        )} */}

        {/* <TableEditManager paramsValue={"upload-statues"} /> */}
      </div>
              {/* <StatuesUpdate />
        <AutoStutuesUpdate/> */}
      <div className="w-[360px] px-0  right-0 top-0 h-full pl-4 border-gray-200 z-10">

        <FilesAndAssets setOpen={handleSetOpen} />
      </div>
    </>
  );
}

export default PageControler;