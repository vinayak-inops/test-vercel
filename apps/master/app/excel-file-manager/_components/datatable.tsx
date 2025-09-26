"use client";

import { useEffect, useState } from "react";
import Table from "./common/data-table";

export default function Datatable({
  excelData,
  nameOfExcel,
  workFlowName,
}: {
  excelData: any;
  nameOfExcel: string;
  workFlowName: string;
}) {
  // Data and column state
  const [data, setData] = useState<Array<Record<string, any>>>([]);

  // Process excelData on component mount or when excelData changes
  useEffect(() => {
    if (excelData && excelData.Worksheet && excelData.Worksheet.length > 0) {
      processExcelData(excelData);
    }
  }, [excelData]);

  // Process Excel data (first row as headers, rest as data)
  const processExcelData = (excelData: any) => {
    const worksheet = excelData.Worksheet;

    // Extract headers (first row)
    const headers = worksheet[0].map((header: string) => ({
      key: header.trim().toLowerCase().replace(/\s+/g, "_"), // Normalize header keys
      label: header.trim().toUpperCase(), // Display headers in uppercase
    }));

    // Extract rows (rest of the data)
    const rows = worksheet.slice(1).map((row: any[], index: number) => {
      const rowData: Record<string, any> = {};
      row.forEach((cell, cellIndex) => {
        const headerKey = headers[cellIndex].key;
        rowData[headerKey] = cell;
      });
      return { ...rowData, id: `row-${index}` }; // Add unique ID for each row
    });

    setData(rows);
    // setSortColumn(headers[0]?.key || null);
    // setExpandedCells({});
  };

  // Render pagination buttons

  return (
    <div className="w-full p-6 bg-white rounded-md shadow">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Excel to Datatable
        </h2>
        <p className="text-sm text-gray-500">
          Import Excel JSON data with drag-and-drop column reordering and action
          buttons.
        </p>
      </div>
      <Table data={data} workFlowName={workFlowName} nameOfExcel={nameOfExcel}/>
    </div>
  );
}
