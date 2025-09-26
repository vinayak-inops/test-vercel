"use client";

import { useState, useEffect } from "react";
import ExcelUploaderInitial from "./excel-uploader-initial";
import { SheetData } from "@/type/excel-file-manager/excel-file-manager";
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper";
import ExcelUploadForm from "./common/excel-upload-form";
import { FileUploader } from "./common/file-uploader";
import FileController from "./file-controller";
import { Button } from "@repo/ui/components/ui/button";
import StatCardMain from "@/components/statcard";
import { useRouter } from "next/navigation";
import { openDB } from "idb";
import * as XLSX from "xlsx";

export default function FileManager() {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelDataTable, setExcelDataTable] = useState<SheetData | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [nameOfExcel, setNameOfExcel] = useState("");
  const [workFlowName, setWorkFlowName] = useState("workspace-owner");
  const [descriptionOfExcel, setDescriptionOfExcel] = useState("");

  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const popupContent = {
    title: "Excel File Uploader",
    description:
      "Upload an Excel file, validate format, preview data, and submit for processing.",
  };

  function handleSave() {
    const save = async () => {
      const data = processAllExcelSheets(excelDataTable);
      const like = nameOfExcel
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");

      const dataArray = [
        {
          nameOfExcel,
          workFlowName,
          data,
          like,
        },
      ];
      await addNote(dataArray);
      router.push(`/excel-file-manager/excel-edit/${like}`);
    };
    save();
  }

  const excelFileUpload = {
    field: [
      {
        label: "Excel File Name",
        tag: "input",
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
      setExcelData(allNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
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
    if (workFlowName !== "" && nameOfExcel !== "") {
      handleSave();
    }
  }, [excelDataTable]);


  return (
    <div className="mx-auto">
      {open && (
        <MiniPopupWrapper content={popupContent} setOpen={setOpen} open={open}>
          {/* {excelData.length > 0 && (
            <FileUploader
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
              setExcelDataTable={setExcelDataTable}
            />
          )} */}
          {uploadStatus === "success" && (
            <ExcelUploadForm
              setOpen={setOpen}
              nameOfExcel={nameOfExcel}
              setNameOfExcel={setNameOfExcel}
              workFlowName={workFlowName}
              descriptionOfExcel={descriptionOfExcel}
              setDescriptionOfExcel={setDescriptionOfExcel}
              setWorkFlowName={setWorkFlowName}
              handleSave={handleSave}
              excelFileUpload={excelFileUpload}
            />
          )}
        </MiniPopupWrapper>
      )}

      {excelData.length === 0 && (
        <div className="flex justify-center items-center">
          <ExcelUploaderInitial
            setXmlFileList={handleExcelDataUpdate}
            setOpen={setOpen}
            setExcelDataTable={setExcelDataTable}
          />
        </div>
      )}

      {excelData.length > 0 && (
        <div>
          <StatCardMain />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOpen(true)}
              size="sm"
              className="flex items-center gap-2 h-9 px-3 text-sm font-medium bg-black text-white hover:bg-black/90"
            >
              <span className="text-sm font-bold">+</span> Upload New File
            </Button>
          </div>
          <FileController excelData={excelData} deleteNote={deleteNote} />
        </div>
      )}
    </div>
  );
}
