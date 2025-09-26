import React from "react";
import { Edit, Trash2 } from "lucide-react";

interface TableActionsProps {
  id: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TableActions: React.FC<TableActionsProps> = ({ id, onEdit, onDelete }) => {
  return (
    <td className="py-2 px-4 text-sm">
      <div className="flex space-x-2">
        {/* Edit Button */}
        <button
        //   onClick={() => onEdit(id)}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
        >
          <Edit className="h-4 w-4" />
        </button>

        {/* Delete Button */}
        <button
        //   onClick={() => onDelete(id)}
          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  );
};

export default TableActions;
