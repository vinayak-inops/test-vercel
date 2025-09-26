import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import TableActions from "./table-actions";
import CellContent from "./cell-content";

interface TableBodyProps {
  data: Array<Record<string, any>>;
  dataColumns: Array<{ key: string; label: string }>;
  expandedCells: Record<string, boolean>;
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
  setExpandedCells:any
}

const TableBody: React.FC<TableBodyProps> = ({
  data,
  dataColumns,
  expandedCells,
  handleEdit,
  handleDelete,
  setExpandedCells
}) => {

  return (
    <tbody>
      {data.map((item, rowIndex) => (
        <tr className="border-b hover:bg-gray-50" key={item.id || rowIndex}>
          {dataColumns.map((column) => {
            const cellId = `${item.id || rowIndex}-${column.key}`;
            const cellContent = item[column.key]?.toString() || "";

            return (
              <td
                key={cellId}
                className={`py-2 px-4 text-sm text-gray-700 ${
                  expandedCells[cellId] ? "h-auto" : ""
                }`}
              >
                <CellContent setExpandedCells={setExpandedCells} expandedCells={expandedCells} content={cellContent} cellId={cellId}/>
              </td>
            );
          })}
          {/* Actions (Edit & Delete) */}
          <TableActions id={item.id || rowIndex.toString()} onEdit={handleEdit} onDelete={handleDelete} />
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
