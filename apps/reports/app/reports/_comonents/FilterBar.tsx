'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Building2, Users, Filter } from 'lucide-react';
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

interface FilterBarProps {
  onFilterChange?: (filters: { searchTerm: string; selectedCategory: string }) => void;
  filteredCounts?: Record<string, number>;
}

export default function FilterBar({ onFilterChange, filteredCounts }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subOrganization, setSubOrganization] = useState<any[]>([])

  const {
    data,
    error,
    loading,
    refetch
  } = useRequest<any[]>({
    url: "tenantReportConfiguration/6827076ad74e6f59df5f2166",
    onSuccess: (data:any) => {
      setSubOrganization([{label:"All",value:"All",category:"All"},...data?.options]);
    },
    onError: (error) => {
      console.error('Error loading organization data:', error);
    }
  });


  const {
    data: attendanceResponse,
    loading: attendanceLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'tenantReportConfiguration/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ],
    onSuccess: (data: any) => {
      console.log("Attendance data received:", data);
      setSubOrganization([{label:"All",value:"All",category:"All"},...data?.options]);
    },
    onError: (error: any) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: []
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle search term change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onFilterChange) {
      onFilterChange({ searchTerm: value, selectedCategory: activeCategory });
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (onFilterChange) {
      onFilterChange({ searchTerm: searchTerm, selectedCategory: category });
    }
  };

  const checkScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < maxScrollLeft - 1); // -1 handles small pixel rounding issues
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      // Call checkScrollButtons after the scroll completes (small delay)
      setTimeout(checkScrollButtons, 300); // 300ms matches scroll-smooth timing
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    checkScrollButtons();

    const handleScroll = () => checkScrollButtons();
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  // Add new useEffect to check scroll buttons when subOrganization changes
  useEffect(() => {
    // Add a small delay to ensure DOM is updated with new content
    setTimeout(checkScrollButtons, 100);
  }, [subOrganization]);

  console.log("subOrganization", subOrganization);

  return (
    <div className=" ">
      <div className="px-0 py-4">
        

        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          {/* Enhanced Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search reports by name..."
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Filter Icon for Mobile */}
          {/* <button className="lg:hidden p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
          <div className="hidden lg:flex items-center gap-3">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="flex-shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <div
              ref={scrollRef}
              className="overflow-x-auto max-w-2xl flex gap-2 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex gap-2 py-1">
                {error ? (
                  <div className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                    Failed to load departments
                    <button onClick={() => fetchAttendance()} className="ml-2 text-red-700 hover:text-red-800 underline">
                      Retry
                    </button>
                  </div>
                ) : (
                  subOrganization.map((category:any) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category?.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                        activeCategory === category?.value
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <span>{category?.label}</span>
                      {category?.count !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            activeCategory === category?.value
                              ? "bg-blue-500 text-blue-100"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {filteredCounts?.[category?.value] !== undefined 
                            ? filteredCounts[category?.value] 
                            : category.count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="flex-shrink-0 p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div> */}
        </div>

        {/* Mobile Department Filters */}
        {/* <div className="lg:hidden mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {subOrganization.map((category:any) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category?.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  activeCategory === category?.value
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                <span>{category?.label}</span>
                {category?.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeCategory === category?.value ? "bg-blue-500 text-blue-100" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {filteredCounts?.[category?.value] !== undefined 
                      ? filteredCounts[category?.value] 
                      : category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
