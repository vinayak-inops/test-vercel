import React from "react";
import { 
  ArrowDown, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@repo/ui/components/ui/dropdown-menu";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@repo/ui/components/ui/select";
import ColumnDropdown from "./table-column-dropdown";

interface TableHeaderProps {
  dataColumns: Array<{ key: string; label: string }>;
  dragActive: boolean;
  draggedColumnIndex: number | null;
  dragOverColumnIndex:number|null;
  getColumnStyle: (index: number, dragActive: boolean, draggedColumnIndex: number | null, dragOverColumnIndex: number | null) => string;
  handleDragStart: (e: React.DragEvent<HTMLTableCellElement>, index: number) => void;
  handleDragOver: (e: React.DragEvent<HTMLTableCellElement>) => void;
  handleDragEnter: (index: number) => void;
  handleDragEnd: () => void;
  handleSortAsc: (key: string) => void;
  handleSortDesc: (key: string) => void;
  handleRenameColumn: (key: string, value: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  dataColumns,
  dragActive,
  draggedColumnIndex,
  dragOverColumnIndex,
  getColumnStyle,
  handleDragStart,
  handleDragOver,
  handleDragEnter,
  handleDragEnd,
  handleSortAsc,
  handleSortDesc,
  handleRenameColumn
}) => {
  return (
    <thead>
      <tr className="bg-white border-b">
        {dataColumns.map((column, index) => (
          <th
            key={column.key}
            className={`py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative ${getColumnStyle(index, dragActive, draggedColumnIndex, dragOverColumnIndex)} transition-colors duration-200 whitespace-nowrap`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center justify-between">
              <span>{column.label}</span>
              
              {/* Dropdown Menu */}
              <ColumnDropdown columnKey={column.key} handleSortAsc={handleSortAsc} handleSortDesc={handleSortDesc} handleRenameColumn={handleRenameColumn}/>
            </div>

            {/* Drag Indicator */}
            {dragActive && draggedColumnIndex === index && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 pointer-events-none"></div>
            )}
          </th>
        ))}
        
        {/* Actions Column */}
        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
          ACTIONS
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
