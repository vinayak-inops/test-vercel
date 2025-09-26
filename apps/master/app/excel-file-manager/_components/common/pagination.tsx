import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  // Helper function to create a pagination button
  const renderPageButton = (page: number, isActive: boolean) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`w-8 h-8 flex items-center justify-center rounded-full ${
        isActive ? "bg-gray-800 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i, currentPage === i));
      }
    } else {
      // First page button
      pages.push(renderPageButton(1, currentPage === 1));

      // Previous button if applicable
      if (currentPage > 2) {
        pages.push(
          <button
            key="prev"
            onClick={() => onPageChange(currentPage - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        );
      }

      // Current page button if applicable
      if (currentPage > 1 && currentPage < totalPages) {
        pages.push(renderPageButton(currentPage, true));
      }

      // Next button if applicable
      if (currentPage < totalPages - 1) {
        pages.push(
          <button
            key="next"
            onClick={() => onPageChange(currentPage + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-700 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        );
      }

      // Last page button
      pages.push(renderPageButton(totalPages, currentPage === totalPages));
    }

    return pages;
  };

  return <div className="flex gap-2">{renderPagination()}</div>;
};

export default Pagination;
