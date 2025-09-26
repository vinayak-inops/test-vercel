import React, { isValidElement } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  isDateLikeString,
  toggleCellExpansion,
} from "../../../utils/table-dynamic/table-body";

interface CellContentProps {
  content: any;
  cellId: string;
  expandedCells?: Record<string, boolean>;
  setExpandedCells?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  functionCallingId: string;
}

const CellContent: React.FC<CellContentProps> = ({
  content,
  cellId,
  expandedCells,
  setExpandedCells,
  functionCallingId,
}) => {
  if (!content) return "";

  const isExpanded = expandedCells && expandedCells[cellId];
  const needsTruncation = content.length > 10;
  const isDateLike = isDateLikeString(content);

  if (isValidElement(content)) {
    return (content)
  }

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
        {expandedCells
          ? isExpanded
            ? content
            : content.substring(0, 10) + "..."
          : content}
      </div>
      <button
        className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          if (setExpandedCells) {
            toggleCellExpansion(cellId, setExpandedCells);
          }
        }}
      >
        {expandedCells &&
          (isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ))}
      </button>
    </div>
  );
};

export default CellContent;
