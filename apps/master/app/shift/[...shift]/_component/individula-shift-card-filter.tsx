"use client";
import { useRef, useState, Dispatch, SetStateAction } from "react";
import { Search, Users, Plus, Clock, Filter, ListChecks, X, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import ShiftChangeFormPopup from "../../_components/shift-change-form-popup";
import ShiftRequestsPopup from "../../_components/shift-requests-popup";

export default function IndividualShiftCardFilter({
  filterDropdownOpen,
  setFilterDropdownOpen,
  selectedFilter,
  setSelectedFilter,
  shiftGroupCode,
  setShiftGroupCode,
  shiftName,
  setShiftName,
  shiftCode,
  setShiftCode,
  activeShiftsCount,
  isShiftZoneFormOpen,
  setIsShiftZoneFormOpen,
  onShiftZoneAdded,
  editShiftData,
  setEditShiftData,
  existingShiftGroupCodes = [],
  existingShiftGroupNames = [],
}: {
  filterDropdownOpen: boolean;
  setFilterDropdownOpen: Dispatch<SetStateAction<boolean>>;
  selectedFilter: string;
  setSelectedFilter: Dispatch<SetStateAction<string>>;
  shiftGroupCode: string;
  setShiftGroupCode: Dispatch<SetStateAction<string>>;
  shiftName: string;
  setShiftName: Dispatch<SetStateAction<string>>;
  shiftCode: string;
  setShiftCode: Dispatch<SetStateAction<string>>;
  activeShiftsCount: number;
  isShiftZoneFormOpen: boolean;
  setIsShiftZoneFormOpen: Dispatch<SetStateAction<boolean>>;
  onShiftZoneAdded: () => void;
  editShiftData: any | null;
  setEditShiftData: Dispatch<SetStateAction<any | null>>;
  existingShiftGroupCodes?: string[];
  existingShiftGroupNames?: string[];
}) {
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [isShiftChangeFormOpen, setIsShiftChangeFormOpen] = useState(false);
  const [isShiftRequestsOpen, setIsShiftRequestsOpen] = useState(false);
  const taskBtnRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsTaskDropdownOpen(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setShiftGroupCode("");
    setShiftName("");
    setShiftCode("");
    setSelectedFilter("All Shifts");
    setSelectedFilterType("");
    setFilterValue("");
  };

  // Handle filter type selection
  const handleFilterTypeSelect = (filterType: string) => {
    setSelectedFilterType(filterType);
    setFilterValue("");
  };

  // Handle filter value change
  const handleFilterValueChange = (value: string) => {
    setFilterValue(value);
    
    // Apply filter immediately as user types
    switch (selectedFilterType) {
      case "shiftGroup":
        setShiftGroupCode(value);
        setShiftName("");
        setShiftCode("");
        break;
      case "shiftName":
        setShiftName(value);
        setShiftGroupCode("");
        setShiftCode("");
        break;
      case "shiftCode":
        setShiftCode(value);
        setShiftGroupCode("");
        setShiftName("");
        break;
    }
  };

  // Handle shift change form submission
  const handleShiftChangeSubmit = (data: any) => {
    console.log("Shift change application submitted:", data);
    // You can add additional logic here like showing a success toast
  };

  // Mock data for shift change requests - you can replace this with real API data
  const mockShiftChangeRequests = [
    {
      id: "1",
      type: "in",
      requestedTime: new Date("2024-01-15T09:00:00"),
      reason: "Need to change shift due to personal emergency",
      status: "pending",
      submittedAt: new Date("2024-01-14T16:30:00")
    },
    {
      id: "2", 
      type: "out",
      requestedTime: new Date("2024-01-16T17:00:00"),
      reason: "Medical appointment scheduled",
      status: "approved",
      submittedAt: new Date("2024-01-14T14:20:00")
    },
    {
      id: "3",
      type: "in", 
      requestedTime: new Date("2024-01-17T08:00:00"),
      reason: "Family function attendance required",
      status: "rejected",
      submittedAt: new Date("2024-01-14T12:15:00")
    }
  ];

  return (
    <>
      <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50/30 ">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-lg rounded-xl">
          <div className=" px-6 py-6">
            <div className="flex items-center justify-between">
              {/* Left Section - Title and Description */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shift Management</h1>
                  <p className="text-gray-600 font-medium">Manage employee shifts and schedules efficiently</p>
                </div>
              </div>

              {/* Right Section - Search and Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Field - Shows based on selected filter type */}
                {selectedFilterType && (
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      type="text"
                      placeholder={`Search ${selectedFilterType === "shiftGroup" ? "shift group code" : selectedFilterType === "shiftName" ? "shift name" : "shift code"}...`}
                      value={filterValue}
                      onChange={(e) => handleFilterValueChange(e.target.value)}
                      className="pl-12 pr-4 py-3 w-64 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                )}

                {/* Filter Button with Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md"
                    onClick={() => setFilterDropdownOpen(v => !v)}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">Filter</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {filterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                      <div
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedFilterType === "shiftGroup" ? "font-bold text-blue-700" : ""}`}
                        onClick={() => { handleFilterTypeSelect("shiftGroup"); setFilterDropdownOpen(false); }}
                      >
                        Shift Group
                      </div>
                      <div
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedFilterType === "shiftName" ? "font-bold text-blue-700" : ""}`}
                        onClick={() => { handleFilterTypeSelect("shiftName"); setFilterDropdownOpen(false); }}
                      >
                        Shift Name
                      </div>
                      <div
                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedFilterType === "shiftCode" ? "font-bold text-blue-700" : ""}`}
                        onClick={() => { handleFilterTypeSelect("shiftCode"); setFilterDropdownOpen(false); }}
                      >
                        Shift Code
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <div
                          className="px-4 py-2 cursor-pointer hover:bg-red-50 text-red-600"
                          onClick={() => { clearFilters(); setFilterDropdownOpen(false); }}
                        >
                          Clear All Filters
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Shifts Button */}
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Active Shifts</span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{activeShiftsCount}</span>
                </Button>

                {/* Task Management Button */}
                <div className="relative">
                  <Button
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    onClick={() => setIsTaskDropdownOpen((v) => !v)}
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span className="font-semibold text-white">Task Management</span>
                  </Button>
                  {/* Dropdown */}
                  {isTaskDropdownOpen && (
                    <div className="fixed inset-0 z-50" onClick={e => { if (e.target === e.currentTarget) setIsTaskDropdownOpen(false); }}>
                      <div
                        className="absolute right-4 top-32 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Dropdown Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
                          <h2 className="text-lg font-bold">Manage Tasks</h2>
                          <button
                            onClick={() => setIsTaskDropdownOpen(false)}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        {/* Dropdown Content */}
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                <span>TASKS</span>
                                <ListChecks className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                {/* Applied Shift Change Requests */}
                                <div
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                                  onClick={() => {
                                    setIsShiftRequestsOpen(true);
                                    setIsTaskDropdownOpen(false);
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <ListChecks className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                      Applied Shift Change Requests
                                    </span>
                                  </div>
                                  <button className="w-5 h-5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ListChecks className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Apply for Shift Change */}
                                <div
                                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                                  onClick={() => {
                                    setIsShiftChangeFormOpen(true);
                                    setIsTaskDropdownOpen(false);
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                      Apply for Shift Change
                                    </span>
                                  </div>
                                  <button className="w-5 h-5 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Clock className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Dropdown Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm">
                            Quick Actions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Change Form Popup */}
      <ShiftChangeFormPopup
        isOpen={isShiftChangeFormOpen}
        onClose={() => setIsShiftChangeFormOpen(false)}
        onSubmit={handleShiftChangeSubmit}
        initialValues={{
          employeeID: "EMP001", // You can make this dynamic based on logged-in user
          fromDate: "",
          toDate: "",
          shiftGroupCode: "",
          isAutomatic: false,
          Remarks: "",
          remarks: "",
        }}
      />

      {/* Shift Requests Popup */}
      <ShiftRequestsPopup
        isOpen={isShiftRequestsOpen}
        onClose={() => setIsShiftRequestsOpen(false)}
      />
    </>
  );
}
