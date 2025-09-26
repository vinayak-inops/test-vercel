"use client";

import React, { useRef, useState } from "react";
import { FolderPlus } from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import { ExcelUploaderProps } from "@/type/excel-file-manager/props";
import { SheetData } from "@/type/excel-file-manager/excel-file-manager";
import * as XLSX from "xlsx";
import { Input } from "@repo/ui/components/ui/input";

function ExcelUploaderInitial({ setXmlFileList, setOpen, setExcelDataTable }: ExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setLoading(true);

    if (file) {
      const validFileTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      if (!validFileTypes.includes(file.type)) {
        setError("Please upload a valid Excel file (.xlsx or .xls).");
        setLoading(false);
        setXmlFileList(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          const allSheetData: Record<string, any[][]> = {};
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            if (jsonData.length > 0) {
              allSheetData[sheetName] = jsonData;
            }
          });

          if (Object.keys(allSheetData).length === 0) {
            setError("The uploaded Excel file is empty or contains no valid data.");
            setXmlFileList(null);
          } else {
            setXmlFileList(allSheetData);
            setExcelDataTable(allSheetData);
            sessionStorage.setItem("excelData", JSON.stringify(allSheetData));
            setOpen(true);
          }
        } catch (err) {
          console.error("Error parsing Excel file:", err);
          setError("Error parsing Excel file. Please make sure it's a valid Excel file.");
          setXmlFileList(null);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Error reading the file. Please try again.");
        setXmlFileList(null);
        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="relative flex justify-center mb-4">
        <Image
          width={150}
          height={80}
          src="/images/excel-file.png"
          alt="Empty folder illustration"
          className="object-contain"
        />
      </div>
      <h5 className="text-lg font-semibold mb-1">
        Projects is the home for all your content
      </h5>
      <p className="text-gray-600 mb-6 text-[14px] w-[300px]">
        Find all of your personal and shared designs here. Create a design or folder to get started.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="hidden"
        disabled={loading}
      />

      {/* <Button
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-sm"
      >
        <FolderPlus className="w-4 h-4 mr-2" />
        Upload Excel File
      </Button> */}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default ExcelUploaderInitial;
