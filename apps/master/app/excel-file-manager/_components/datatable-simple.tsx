"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Edit,
  Trash2,
  ChevronRight,
  ArrowDown,
  ChevronLeft,
  ChevronRight as RightIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/ui/components/ui/dropdown-menu";

export default function DatatableSimple({ excelData }: { excelData: any }) {
  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State to track expanded cells
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});

  // State for data and columns
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [dataColumns, setDataColumns] = useState<
    Array<{ key: string; label: string }>
  >([]);

  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null
  );
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(
    null
  );

  // Table scroll ref
  const tableRef = useRef<HTMLDivElement>(null);

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

    // Update state
    setDataColumns(headers);
    setData(rows);
    setSortColumn(headers[0]?.key || null); // Set initial sort column to the first column
    setExpandedCells({}); // Reset expanded cells
  };

  // Handle column rename
  const handleRenameColumn = (key: string, newLabel: string) => {
    if (!newLabel) return;

    const updatedColumns = dataColumns.map((col) =>
      col.key === key ? { ...col, label: newLabel.toUpperCase() } : col
    );

    setDataColumns(updatedColumns);
  };

  // Handle text expansion
  const toggleCellExpansion = (cellId: string) => {
    setExpandedCells((prev) => ({
      ...prev,
      [cellId]: !prev[cellId],
    }));
  };

  // Sort handlers
  const handleSortAsc = (column: string) => {
    setSortColumn(column);
    setSortDirection("asc");
  };

  const handleSortDesc = (column: string) => {
    setSortColumn(column);
    setSortDirection("desc");
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
    setDragActive(true);

    // Create ghost element
    const ghostElement = document.createElement("div");
    ghostElement.classList.add("ghost-column");
    ghostElement.style.opacity = "0";
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);

    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (index: number) => {
    setDragOverColumnIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedColumnIndex !== null && dragOverColumnIndex !== null) {
      const newColumns = [...dataColumns];
      const draggedColumn = newColumns[draggedColumnIndex];

      // Remove the dragged item
      newColumns.splice(draggedColumnIndex, 1);
      // Insert at the new position
      newColumns.splice(dragOverColumnIndex, 0, draggedColumn);

      setDataColumns(newColumns);
    }

    // Reset
    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
    setDragActive(false);
  };

  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / entriesPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle entries per page change
  const handleEntriesChange = (value: string) => {
    setEntriesPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Helper to get column styling
  const getColumnStyle = (index: number) => {
    if (dragActive) {
      if (draggedColumnIndex === index) {
        return "opacity-70 bg-blue-100";
      }
      if (dragOverColumnIndex === index) {
        return "bg-gray-100";
      }
    }
    return "";
  };

  // Helper to detect if a string looks like a date
  const isDateLikeString = (str: string): boolean => {
    // Basic patterns for date detection
    const datePatterns = [
      /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/, // Date patterns like YYYY-MM-DD, DD/MM/YYYY
      /\d{1,2}:\d{1,2}(:\d{1,2})?/, // Time patterns like HH:MM:SS or HH:MM
      /\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\s+\d{1,2}:\d{1,2}/, // DateTime patterns
    ];

    return datePatterns.some((pattern) => pattern.test(str));
  };

  // Function to render cell content with truncation if needed
  const renderCellContent = (content: string, cellId: string) => {
    if (!content) return "";

    const isExpanded = expandedCells[cellId];
    const needsTruncation = content.length > 10;
    const isDateLike = isDateLikeString(content);

    // For date-like strings, ensure they appear on a single line
    if (isDateLike) {
      return (
        <div className="flex items-start whitespace-nowrap">
          <div>{content}</div>
        </div>
      );
    }

    // For regular text
    if (!needsTruncation) {
      return content;
    }

    return (
      <div className="flex items-start justify-between w-full">
        <div className={`${isExpanded ? "" : "truncate"}`}>
          {isExpanded ? content : content.substring(0, 10) + "..."}
        </div>
        <button
          className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            toggleCellExpansion(cellId);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  };

  // Handle table scroll by cursor
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    let isDragging = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - table.offsetLeft;
      scrollLeft = table.scrollLeft;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - table.offsetLeft;
      const walk = (x - startX) * 2; // Adjust scroll speed
      table.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    table.addEventListener("mousedown", handleMouseDown);
    table.addEventListener("mousemove", handleMouseMove);
    table.addEventListener("mouseup", handleMouseUp);
    table.addEventListener("mouseleave", handleMouseUp);

    return () => {
      table.removeEventListener("mousedown", handleMouseDown);
      table.removeEventListener("mousemove", handleMouseMove);
      table.removeEventListener("mouseup", handleMouseUp);
      table.removeEventListener("mouseleave", handleMouseUp);
    };
  }, []);

  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 5) {
      // Show all pages if total pages are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              currentPage === i
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show first page, previous, next, and last page
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === 1
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          1
        </button>
      );

      if (currentPage > 2) {
        pages.push(
          <button
            key="prev"
            onClick={() => handlePageChange(currentPage - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        );
      }

      if (currentPage > 1 && currentPage < totalPages) {
        pages.push(
          <button
            key={currentPage}
            onClick={() => handlePageChange(currentPage)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white"
          >
            {currentPage}
          </button>
        );
      }

      if (currentPage < totalPages - 1) {
        pages.push(
          <button
            key="next"
            onClick={() => handlePageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100"
          >
            <RightIcon className="h-4 w-4" />
          </button>
        );
      }

      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            currentPage === totalPages
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

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

      <div className="flex items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select
            value={entriesPerPage.toString()}
            onValueChange={handleEntriesChange}
          >
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-500">entries per page</span>
        </div>
      </div>

      {data.length > 0 ? (
        <div
          ref={tableRef}
          className="overflow-x-auto scroll-smooth scrollbar-hide cursor-grab active:cursor-grabbing"
        >
          <table className="w-full border-collapse">
            <colgroup>
              {dataColumns.map((_, index) => (
                <col key={index} className={getColumnStyle(index)} />
              ))}
              <col />
            </colgroup>
            <thead>
              <tr className="bg-white border-b">
                {dataColumns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative ${getColumnStyle(
                      index
                    )} transition-colors duration-200 whitespace-nowrap`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.label}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none ml-2">
                            <ArrowDown className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => handleSortAsc(column.key)}
                            className="flex items-center justify-between"
                          >
                            <span>Sort Ascending</span>
                            <ChevronUp className="h-4 w-4" />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSortDesc(column.key)}
                            className="flex items-center justify-between"
                          >
                            <span>Sort Descending</span>
                            <ChevronDown className="h-4 w-4" />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <div className="p-2">
                            <div className="mb-1 text-xs font-medium">Rename Column</div>
                            <Select
                              onValueChange={(value) => handleRenameColumn(column.key, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FIRST NAME">FIRST NAME</SelectItem>
                                <SelectItem value="LAST NAME">LAST NAME</SelectItem>
                                <SelectItem value="EMAIL">EMAIL</SelectItem>
                                <SelectItem value="PHONE">PHONE</SelectItem>
                                <SelectItem value="ADDRESS">ADDRESS</SelectItem>
                                <SelectItem value="CITY">CITY</SelectItem>
                                <SelectItem value="STATE">STATE</SelectItem>
                                <SelectItem value="ZIP">ZIP</SelectItem>
                                <SelectItem value="COUNTRY">COUNTRY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {dragActive && draggedColumnIndex === index && (
                      <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 pointer-events-none"></div>
                    )}
                  </th>
                ))}
                               <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, rowIndex) => (
                <tr
                  className="border-b hover:bg-gray-50"
                  key={item.id || rowIndex}
                >
                  {dataColumns.map((column, cellIndex) => {
                    const cellId = `${item.id || rowIndex}-${column.key}`;
                    const cellContent = item[column.key]?.toString() || "";

                    return (
                      <td
                        key={cellId}
                        className={`py-2 px-4 text-sm text-gray-700 ${
                          expandedCells[cellId] ? "h-auto" : ""
                        }`}
                      >
                        {renderCellContent(cellContent, cellId)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        // onClick={() =>
                        //   handleEdit(item.id || rowIndex.toString())
                        // }
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        // onClick={() =>
                        //   handleDelete(item.id || rowIndex.toString())
                        // }
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No data available. Please upload an Excel JSON file.
        </div>
      )}

      {data.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, data.length)} of {data.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {renderPagination()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <RightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}