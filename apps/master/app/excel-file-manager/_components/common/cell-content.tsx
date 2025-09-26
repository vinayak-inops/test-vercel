import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { isDateLikeString, toggleCellExpansion } from "@/utils/table/table-body";

interface CellContentProps {
  content: string;
  cellId: string;
  expandedCells: Record<string, boolean>;
  setExpandedCells: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const CellContent: React.FC<CellContentProps> = ({ content, cellId, expandedCells, setExpandedCells }) => {
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
    return <div className="flex items-start whitespace-nowrap">{content}</div>;
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
          toggleCellExpansion(cellId, setExpandedCells);
        }}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default CellContent;
