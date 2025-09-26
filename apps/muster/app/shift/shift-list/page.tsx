"use client"
import { useState, useEffect } from "react";
import ShiftCategoryCard from "../_components/shift-category-card";
import ShiftCardFilter from "../_components/shift-card-filter";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

export default function Home() {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Active Shifts");
  const [shiftGroupCode, setShiftGroupCode] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isShiftZoneFormOpen, setIsShiftZoneFormOpen] = useState(false);
  const [editShiftData, setEditShiftData] = useState<any | null>(null);

  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'shift/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ],
    dependencies: []
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (!attendanceResponse || !Array.isArray(attendanceResponse)) {
      setFilteredData([]);
      return;
    }
    let data = attendanceResponse;
    if (shiftGroupCode) {
      data = data.filter((item: any) =>
        item.shiftGroupCode && item.shiftGroupCode.toLowerCase().includes(shiftGroupCode.toLowerCase())
      );
    }
    if (selectedFilter === "Active Shifts") {
      data = data.filter((item: any) => item.isActive !== false);
    } else if (selectedFilter === "Inactive Shifts") {
      data = data.filter((item: any) => item.isActive === false);
    }
    setFilteredData(data);
  }, [attendanceResponse, shiftGroupCode, selectedFilter]);

  const activeShiftsCount = attendanceResponse ? attendanceResponse.filter((item: any) => item.isActive !== false).length : 0;
  const existingShiftGroupCodes = attendanceResponse ? attendanceResponse.map((item: any) => item.shiftGroupCode?.toLowerCase()).filter(Boolean) : [];
  const existingShiftGroupNames = attendanceResponse ? attendanceResponse.map((item: any) => item.shiftGroupName?.toLowerCase()).filter(Boolean) : [];

  // Handler for editing a shift
  const handleEditShift = (shift: any) => {
    setEditShiftData(shift);
    setIsShiftZoneFormOpen(true);
  };

  return (
    <div className="px-12 py-6 h-full bg-gray-50">
      <ShiftCardFilter
        filterDropdownOpen={filterDropdownOpen}
        setFilterDropdownOpen={setFilterDropdownOpen}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        shiftGroupCode={shiftGroupCode}
        setShiftGroupCode={setShiftGroupCode}
        activeShiftsCount={activeShiftsCount}
        isShiftZoneFormOpen={isShiftZoneFormOpen}
        setIsShiftZoneFormOpen={setIsShiftZoneFormOpen}
        onShiftZoneAdded={fetchAttendance}
        editShiftData={editShiftData}
        setEditShiftData={setEditShiftData}
        existingShiftGroupCodes={existingShiftGroupCodes}
        existingShiftGroupNames={existingShiftGroupNames}
      />
      <div className="w-full mt-6 ">
        <ShiftCategoryCard
          data={filteredData}
          isLoading={isLoading}
          error={attendanceError}
          onEditShift={handleEditShift}
        />
      </div>
    </div>
  );
}
