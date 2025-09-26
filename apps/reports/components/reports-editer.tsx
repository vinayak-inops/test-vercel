"use client";

import ReportFileManager from "@/app/reports/_comonents/file-manager";
import FileTableManager from "@/app/reports/_comonents/file-table-manager";
import FilterBar from "@/app/reports/_comonents/FilterBar";
import PopupReportFilter from "@/app/reports/_comonents/popup-report-filter";
import PopupSelecter from "@/app/reports/_comonents/popup-selecter";
import ScrollableSection from "@/app/reports/_comonents/scrollable-section";
import { contacts } from "@/json/contractor-employee/check";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import {
  FilterIcon,
  Grid2X2Icon,
  ListIcon,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export default function ReportsEditer({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
  const [view, setView] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState<{ searchTerm: string; selectedCategory: string }>({
    searchTerm: '',
    selectedCategory: 'All'
  });

  const handleFilterChange = (newFilters: { searchTerm: string; selectedCategory: string }) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* {open && <PopupReportFilter open={open} setOpen={setOpen} />} */}
      <div className=" ">
        <div className="w-full">

          <div className="w-full">
            {/* <FileTableManager setOpen={setOpen}/> */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div >
                <FilterBar onFilterChange={handleFilterChange} />
              </div>
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                size="sm"
                className="bg-[#0061ff] text-white"
              >
                <Plus className="h-4 w-4 mr-2 text-white " />
                Generate New Report
              </Button>
            </div>

            {/* <div>
              <ReportFileManager filters={filters} />
            </div> */}

             {/* <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 border-r pr-4">
                  <Button
                    variant={view === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("grid")}
                  >
                    <Grid2X2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Input placeholder="All status" className="w-32" />
                </div>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search" className="pl-10 w-64" />
              </div>
            </div>  */}

             <div className="p-0">
              <div className="space-y-0"> 
                 <ScrollableSection
                  title="New Leads"
                  count={8}
                  contacts={contacts.slice(0, 10)}
                  filters={filters}
                /> 
                {/* <ScrollableSection
                  title="New Leads"
                  count={8}
                  contacts={contacts.slice(0, 6)}
                />
                <ScrollableSection
                  title="New Leads"
                  count={8}
                  contacts={contacts.slice(0, 6)}
                /> */}
               </div>
            </div> 
          </div>
        </div>
      </div>
    </div>
  );
}
