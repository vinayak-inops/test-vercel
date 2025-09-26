import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@repo/ui/components/ui/select";
import { ArrowDown, ChevronUp, ChevronDown } from "lucide-react";

interface ColumnDropdownProps {
  columnKey: string;
  handleSortAsc: (key: string) => void;
  handleSortDesc: (key: string) => void;
  handleRenameColumn: (key: string, value: string) => void;
}

const ColumnDropdown: React.FC<ColumnDropdownProps> = ({ columnKey, handleSortAsc, handleSortDesc, handleRenameColumn }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none ml-2">
          <ArrowDown className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleSortAsc(columnKey)} className="flex items-center justify-between">
          <span>Sort Ascending</span>
          <ChevronUp className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSortDesc(columnKey)} className="flex items-center justify-between">
          <span>Sort Descending</span>
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="mb-1 text-xs font-medium">Rename Column</div>
          <Select onValueChange={(value: any) => handleRenameColumn(columnKey, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Id</SelectItem>
              <SelectItem value="organizationCode">Organization Code</SelectItem>
              <SelectItem value="organizationName">Organization Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="addressLine1">Address Line 1</SelectItem>
              <SelectItem value="addressLine2">Address Line 1</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="state">State</SelectItem>
              <SelectItem value="country">Country</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnDropdown;