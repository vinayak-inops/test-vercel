"use client"
import React, { useEffect, useRef, useState } from "react";
import TableHeader from "./data-table-header";
import TableBody from "./data-table-body";
import { useDraggableColumns } from "@/hooks/excel-file-manager/useDraggableColumns";
import { getColumnStyle } from "@/utils/table/table";
import { handleSort, renameColumn } from "@/utils/table/table-header";
import useTableDrag from "@/hooks/excel-file-manager/useTableDrag";
import { useTableState } from "@/hooks/excel-file-manager/useTableState";
import {
  handleEntriesChange,
  handlePageChange,
  sortData,
} from "@/utils/table/table-body";
import PaginationControls from "./pagination-controls";
import EntriesPerPageSelector from "./entries-per-page-selector";
import { Save, Send } from "lucide-react";

interface TableProps {
  data: any;
  workFlowName: any;
  nameOfExcel: any;
}

const Table: React.FC<TableProps> = ({ data, nameOfExcel, workFlowName }) => {
  const {
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    expandedCells,
    setExpandedCells,
    tableRef,
    dataColumns,
    setDataColumns,
  } = useTableState();

  const {
    draggedColumnIndex,
    dragOverColumnIndex,
    dragActive,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver,
  } = useDraggableColumns(dataColumns, setDataColumns);

  // Handle table scroll by cursor
  useTableDrag(tableRef);

  // Calculate pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = sortData(data, sortColumn, sortDirection).slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(data.length / entriesPerPage);

  // Handle column rename
  const handleRenameColumn = (key: string, newLabel: string) => {
    const updatedColumns = renameColumn(dataColumns, key, newLabel);
    setDataColumns(updatedColumns);
  };

  useEffect(() => {
    if (data.length > 0) {
      const head = Object.keys(data[0]);
      // Extract headers (first row)
      const headers = head.map((header: string) => ({
        key: header.trim().toLowerCase().replace(/\s+/g, "_"), // Normalize header keys
        label: header.trim().toUpperCase(), // Display headers in uppercase
        excelname: header,
      }));
      setDataColumns(headers);
      setSortColumn(headers[0]?.key || null);
      setExpandedCells({});
    }
  }, [data]);

  function handleSave(newData: any) {
    // Optimized version with O(n) complexity
    const transformedData = data.map((item: any) => {
      // Create mapping dictionary once outside the loop
      const keyToExcelMap: { [key: string]: string } = {};
      const excelToIndexMap: { [key: string]: number } = {};

      // Build the maps in O(m) time where m is number of columns
      dataColumns.forEach((col: any, index: number) => {
        keyToExcelMap[col.key] = col.excelname;
        excelToIndexMap[col.excelname] = index;
      });

      // First pass: transform keys according to mapping - O(k) where k is keys per item
      const transformedItem: { [key: string]: any } = {};
      for (const key in item) {
        const excelName = keyToExcelMap[key] || key;
        transformedItem[excelName] = item[key];
      }

      // Second pass: create ordered object using index mapping - O(m) worst case
      const orderedKeys = Object.keys(transformedItem)
        .filter((key) => excelToIndexMap[key] !== undefined)
        .sort((a, b) => excelToIndexMap[a] - excelToIndexMap[b]);

      // Build the final ordered object
      const reorderedItem: { [key: string]: any } = {};
      for (const key of orderedKeys) {
        reorderedItem[key] = transformedItem[key];
      }

      return reorderedItem;
    });
    
  }

  function handleSubmit() {
    
  }

  return (
    <div>
      <EntriesPerPageSelector
        entriesPerPage={entriesPerPage}
        handleEntriesChange={(value) =>
          handleEntriesChange(value, setEntriesPerPage, setCurrentPage)
        }
      />
      {data?.length > 0 ? (
        <div
          ref={tableRef}
          className="overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
        >
          <table className="w-full border-collapse">
            <colgroup>
              {dataColumns.map((_, index) => (
                <col
                  key={index}
                  className={getColumnStyle(
                    index,
                    dragActive,
                    draggedColumnIndex,
                    dragOverColumnIndex
                  )}
                />
              ))}
              <col />
            </colgroup>
            <TableHeader
              dataColumns={dataColumns}
              dragActive={dragActive}
              draggedColumnIndex={draggedColumnIndex}
              dragOverColumnIndex={dragOverColumnIndex}
              getColumnStyle={getColumnStyle}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragEnter={handleDragEnter}
              handleDragEnd={handleDragEnd}
              handleSortAsc={(column) =>
                handleSort(column, "asc", setSortColumn, setSortDirection)
              }
              handleSortDesc={(column) =>
                handleSort(column, "desc", setSortColumn, setSortDirection)
              }
              handleRenameColumn={handleRenameColumn}
            />
            <TableBody
              data={currentItems}
              dataColumns={dataColumns}
              expandedCells={expandedCells}
              setExpandedCells={setExpandedCells}
            />
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No data available. Please upload an Excel JSON file.
        </div>
      )}
      <PaginationControls
        dataLength={data.length}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={(pageNumber) =>
          handlePageChange(pageNumber, setCurrentPage)
        }
      />
      <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4 mt-6">
        <button
          onClick={() => {
            handleSave(data);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit
        </button>
      </div>
    </div>
  );
};

export default Table;
