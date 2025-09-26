"use client";
import React, { useEffect, useRef, useState } from "react";
import TableHeader from "./data-table-header";
import TableBody from "./data-table-body";
import { useDraggableColumns } from "../../hooks/table-dynamic/useDraggableColumns";
import { getColumnStyle } from "../../utils/table-dynamic/table";
import {
  handleSort,
  renameColumn,
} from "../../utils/table-dynamic/table-header";
import useTableDrag from "../../hooks/table-dynamic/useTableDrag";
import { useTableState } from "../../hooks/table-dynamic/useTableState";
import {
  handleEntriesChange,
  handlePageChange,
  sortData,
} from "../../utils/table-dynamic/table-body";
import {
  handleSelectAll,
  handleIndividualSelect,
  handleSelectAllClick,
  handleCollectCheckedData
} from "../../utils/table-dynamic/table-selection";
import PaginationControls from "./common/pagination-controls";
import EntriesPerPageSelector from "./common/entries-per-page-selector";
import { CloudCog, Save, Send } from "lucide-react";
import ListHeaderTable from "./common/list-header-table";
import { MdCancel } from "react-icons/md";
import { TableItem } from "../../types/table";

interface TableProps {
  data: any;
  functionalityList?: any;
  headData?: any;
}

const Table: React.FC<TableProps> = ({
  data: initialData,
  functionalityList,
  headData,
}) => {
  const [tableData, setData] = useState<TableItem[]>(initialData || []);
  const [selectAll, setSelectAll] = useState(false);
  const [filteredData, setFilteredData] = useState<TableItem[]>(initialData || []);

  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      setData(initialData);
      setFilteredData(initialData);
    }
  }, [initialData]);

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
    setSelectedComponents,
    selectedComponents,
  } = useTableState();

  // Reset current page when total pages change to prevent pagination issues
  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredData.length, entriesPerPage, currentPage, setCurrentPage]);

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
  const currentItems = sortData(filteredData, sortColumn, sortDirection).slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // Debug logging for pagination
  console.log('Pagination Debug:', {
    filteredDataLength: filteredData.length,
    entriesPerPage,
    currentPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItemsLength: currentItems.length
  });

  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [rowHeights, setRowHeights] = useState<{ [key: string]: number }>({});

  // Handle column rename
  const handleRenameColumn = (key: string, newLabel: string) => {
    const newKey = newLabel;

    const updatedColumns = dataColumns.map((col) =>
      col.key === key
        ? { ...col, key: newKey, label: newLabel.toUpperCase() }
        : col
    );
    setDataColumns(updatedColumns);

    const updatedData = tableData.map((row: any) => {
      const updatedRow = { ...row };
      if (key in updatedRow) {
        updatedRow[newKey] = updatedRow[key];
        delete updatedRow[key];
      }
      return updatedRow;
    });

    setData(updatedData);
  };
  const updateCellValue = (
    rowKey: string,
    columnKey: string,
    value: string
  ) => {
    const updatedData = [...tableData];
    const index = updatedData.findIndex(
      (item) => item && (item.id?.toString() === rowKey)
    );
    if (index !== -1 && updatedData[index]) {
      updatedData[index] = {
        ...updatedData[index],
        [columnKey]: value
      };
      setData(updatedData);
    }
  };

  useEffect(() => {
    if (tableData.length > 0 || headData) {
      const firstItem = tableData[0];
      const heads = tableData.length > 0 && firstItem ? Object.keys(firstItem) : headData || [];

      const headers = heads
        .filter(
          (header: string) =>
            header !==
            "functioncallingid"
        )
        .map((header: string) => {
          const key = header;
          const label = header.trim().toUpperCase();
          return { key, label, excelname: header };
        });

      setDataColumns(headers);
      setSortColumn(headers[0]?.key || null);
      setExpandedCells({});

      const ctx = document.createElement("canvas").getContext("2d");
      ctx!.font = "14px Segoe UI";

      const labelWidths: any = {};
      let totalWidth = 0;

      headers.forEach((col: any) => {
        const width = Math.max(ctx!.measureText(col.label).width + 50, 100);
        labelWidths[col.key] = width;
        totalWidth += width;
      });

      const containerWidth = tableRef?.current?.offsetWidth || 0;

      // ✅ Only adjust widths if total column width is LESS than table width
      if (totalWidth < containerWidth && containerWidth > 0) {
        const extraSpace = containerWidth - totalWidth;
        const extraPerColumn = Math.floor(extraSpace / headers.length);

        headers.forEach((col: any) => {
          labelWidths[col.key] += extraPerColumn;
        });

        totalWidth = containerWidth; // update total width to match container
      }

      setColumnWidths(labelWidths);
    }
  }, [tableData]);

  const handleAddRow = () => {
    const emptyRow: any = {};
    dataColumns.forEach((col) => {
      emptyRow[col.key] = "";
    });

    const newId = Date.now(); // Simple unique ID
    emptyRow["id"] = newId;

    setData((prev: any) => [...prev, emptyRow]);
  };

  // Update selectAll state when current items change
  useEffect(() => {
    // Check if there are any items and if all of them are checked
    const allSelected = currentItems.length > 0 &&
      currentItems.every(item => {

        return item.isChecked;
      });

    // Check if any items are checked
    const someSelected = currentItems.some(item => item.isChecked);

    // Update selectAll state
    setSelectAll(allSelected);

  }, [currentItems]);

  const onSelectAllClick = () => {
    handleSelectAllClick(
      selectAll,
      tableData,
      currentItems,
      setData,
      setSelectAll,
      setSelectedComponents,
      functionalityList,
      handleSelectAll
    );
  };

  const onCollectCheckedData = (com: TableItem) => {
    handleCollectCheckedData(
      com,
      tableData,
      setData,
      setSelectedComponents,
      functionalityList,
      handleIndividualSelect
    );
  };

  // Update table data when selectAll changes
  useEffect(() => {
    if (selectAll) {
      const updatedData = tableData.map(item => {
        const isOnCurrentPage = currentItems.some(currentItem => currentItem.id === item.id);
        return isOnCurrentPage ? { ...item, isChecked: true } : item;
      });
      setData(updatedData);
    }
  }, [selectAll]);

  const handleSearch = (column: string, value: string) => {
    if (!column || !value) {
      setFilteredData(tableData);
      return;
    }

    const filtered = tableData.filter((item) => {
      const cellValue = item[column]?.toString().toLowerCase() || '';
      return cellValue.includes(value.toLowerCase());
    });

    setFilteredData(filtered);
  };

  return (
    <div className="bg-white p-0 rounded-lg">
      {functionalityList.outsidetablefunctionality.entriesPerPageSelector.status && (
        <EntriesPerPageSelector
          entriesPerPage={entriesPerPage}
          handleEntriesChange={(value) =>
            handleEntriesChange(value, setEntriesPerPage, setCurrentPage)
          }
        />
      )}
      <ListHeaderTable
        entriesPerPage={entriesPerPage}
        handleEntriesChange={(value: any) =>
          handleEntriesChange(value, setEntriesPerPage, setCurrentPage)
        }
        functionalityList={functionalityList}
        totalRows={filteredData.length}
        tableType={functionalityList?.tabletype?.type || "data"}
        dataColumns={dataColumns}
        onSearch={handleSearch}
      />

      {filteredData?.length > 0 || headData != "undefined" ? (
        <div
          ref={tableRef}
          className="overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
        >
          <table className="border-collapse w-full shadow-sm rounded-lg overflow-hidden">
            {functionalityList?.tabletype.type == "excel" && (
              <colgroup>
                {dataColumns.map((col) => (
                  <col
                    key={col.key}
                    style={{
                      width: columnWidths[col.key]
                        ? `${columnWidths[col.key]}px`
                        : "auto",
                    }}
                  />
                ))}
              </colgroup>
            )}
            {functionalityList?.tabletype.type == "data" && (
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
            )}
            <TableHeader
              functionalityList={functionalityList}
              dataColumns={dataColumns}
              dragActive={
                functionalityList.columnfunctionality.draggable.status && dragActive
              }
              draggedColumnIndex={
                functionalityList.columnfunctionality.draggable.status &&
                draggedColumnIndex
              }
              dragOverColumnIndex={
                functionalityList.columnfunctionality.draggable.status &&
                dragOverColumnIndex
              }
              getColumnStyle={getColumnStyle}
              handleDragStart={
                functionalityList.columnfunctionality.draggable.status &&
                handleDragStart
              }
              handleDragOver={
                functionalityList.columnfunctionality.draggable.status &&
                handleDragOver
              }
              handleDragEnter={
                functionalityList.columnfunctionality.draggable.status &&
                handleDragEnter
              }
              handleDragEnd={
                functionalityList.columnfunctionality.draggable.status && handleDragEnd
              }
              handleSortAsc={(column) =>
                functionalityList.filterfunctionality.handleSortAsc.status &&
                handleSort(column, "asc", setSortColumn, setSortDirection)
              }
              handleSortDesc={(column) =>
                functionalityList.handleSortDesc &&
                handleSort(column, "desc", setSortColumn, setSortDirection)
              }
              handleRenameColumn={
                functionalityList.filterfunctionality?.handleRenameColumn?.status && handleRenameColumn
              }
              selectAll={selectAll}
              handleSelectAll={onSelectAllClick}
            />
            <TableBody
              collectCheckedData={onCollectCheckedData}
              data={currentItems}
              dataColumns={dataColumns}
              expandedCells={
                functionalityList.textfunctionality.expandedCells.status &&
                expandedCells
              }
              setExpandedCells={
                functionalityList.textfunctionality.expandedCells.status &&
                setExpandedCells
              }
              functionalityList={{ ...functionalityList, handleAddRow }}
              rowHeights={rowHeights}
              setRowHeights={setRowHeights}
              columnWidths={columnWidths}
              setColumnWidths={setColumnWidths}
              updateCellValue={updateCellValue}
              selectAll={selectAll}
            />
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm mt-2">Please upload an Excel JSON file to view data</p>
        </div>
      )}
      <div className="w-full ">
      {functionalityList.outsidetablefunctionality.paginationControls.status && (
        <PaginationControls
          dataLength={filteredData.length}
          indexOfFirstItem={indexOfFirstItem}
          indexOfLastItem={indexOfLastItem}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={(pageNumber) =>
            handlePageChange(pageNumber, setCurrentPage)
          }
        />
      )}
      <div className="pt-0 border-t border-gray-200 flex justify-end space-x-4 mt-0">
        {functionalityList?.buttons?.cancel?.status && (
          <button
            onClick={() => {
              functionalityList?.buttons?.cancel?.function();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <MdCancel className="h-4 w-4 mr-2" />
            Cancel
          </button>
        )}
        {functionalityList?.buttons?.save?.status && (
          <button
            onClick={() => {
              functionalityList?.buttons?.save?.function(selectedComponents);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        )}
        {functionalityList?.buttons?.submit?.status && (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

export default Table;