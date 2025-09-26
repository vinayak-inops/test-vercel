import { Search, Plus, Filter, Download, Users, UserCheck, Clock, TrendingUp, Edit, Trash2, Eye, MoreVertical, Calendar, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Input } from "@repo/ui/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { useState, useMemo } from "react"

interface ShiftData {
  fromDate: string;
  toDate: string;
  shiftGroupCode: string;
  shift: {
    shiftCode: string;
    shiftName: string;
    shiftStart: string;
    shiftEnd: string;
    firstHalfStart: string;
    firstHalfEnd: string;
    secondHalfStart: string;
    secondHalfEnd: string;
    lunchStart: string;
    lunchEnd: string;
    duration: number;
    crossDay: boolean;
    flexible: boolean;
    flexiFullDayDuration: number;
    flexiHalfDayDuration: number;
    minimumDurationForFullDay: number;
    minimumDurationForHalfDay: number;
  };
}

interface IndividualShiftListProps {
  shiftData: ShiftData[];
  onEditShift?: (shift: ShiftData) => void;
  onDeleteShift?: (shift: ShiftData) => void;
  onViewShift?: (shift: ShiftData) => void;
  // Filter props
  shiftGroupCode?: string;
  shiftName?: string;
  shiftCode?: string;
  selectedFilter?: string;
}

function IndividualShiftList({ 
  shiftData, 
  onEditShift, 
  onDeleteShift, 
  onViewShift,
  shiftGroupCode = "",
  shiftName = "",
  shiftCode = "",
  selectedFilter = "All Shifts"
}: IndividualShiftListProps) {
  const [selectedShift, setSelectedShift] = useState<ShiftData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (shift: ShiftData) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
    if (onViewShift) onViewShift(shift);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };

  const handleEdit = (shift: ShiftData) => {
    if (onEditShift) onEditShift(shift);
  };

  const handleDelete = (shift: ShiftData) => {
    if (onDeleteShift) onDeleteShift(shift);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds and show HH:MM format
  };

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Filter the shift data based on search criteria
  const filteredShiftData = useMemo(() => {
    if (!shiftData) return [];

    return shiftData.filter((shiftItem) => {
      // Filter by shift group code
      const groupCodeMatch = !shiftGroupCode || 
        shiftItem.shiftGroupCode.toLowerCase().includes(shiftGroupCode.toLowerCase());

      // Filter by shift name
      const nameMatch = !shiftName || 
        shiftItem.shift.shiftName.toLowerCase().includes(shiftName.toLowerCase());

      // Filter by shift code
      const codeMatch = !shiftCode || 
        shiftItem.shift.shiftCode.toLowerCase().includes(shiftCode.toLowerCase());

      // Filter by status (if selectedFilter is not "All Shifts")
      let statusMatch = true;
      if (selectedFilter === "Active Shifts") {
        statusMatch = true; // All shifts are considered active in this context
      } else if (selectedFilter === "Inactive Shifts") {
        statusMatch = false; // No inactive shifts in current data structure
      }

      return groupCodeMatch && nameMatch && codeMatch && statusMatch;
    });
  }, [shiftData, shiftGroupCode, shiftName, shiftCode, selectedFilter]);

  return (
    <>
      <div className="px-0 mt-6">
        <div className="py-0">
          <Card className="border-none shadow-none mb-0">
            <CardContent className="px-0">
              {/* Filter Summary */}
              {(shiftGroupCode || shiftName || shiftCode || selectedFilter !== "All Shifts") && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                      {shiftGroupCode && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Group: {shiftGroupCode}
                        </Badge>
                      )}
                      {shiftName && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Name: {shiftName}
                        </Badge>
                      )}
                      {shiftCode && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Code: {shiftCode}
                        </Badge>
                      )}
                      {selectedFilter !== "All Shifts" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {selectedFilter}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-blue-600">
                      {filteredShiftData.length} of {shiftData?.length || 0} shifts
                    </div>
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {filteredShiftData.length === 0 && shiftData && shiftData.length > 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
              )}

              {/* Shift Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredShiftData?.map((shiftItem: ShiftData, idx: number) => (
                  <Card
                    key={shiftItem.shift.shiftCode + idx}
                    className="bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02] hover:border-gray-300 relative z-0"
                  >
                    <CardContent className="p-6">
                      {/* Shift Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-200">
                            {shiftItem.shift.shiftName?.[0] || shiftItem.shift.shiftCode?.[0] || "S"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{shiftItem.shift.shiftName}</h3>
                            <p className="text-gray-600 text-xs font-medium">Code: {shiftItem.shift.shiftCode}</p>
                            <p className="text-gray-500 text-xs font-medium">Group: {shiftItem.shiftGroupCode}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Status Badge */}
                          <Badge 
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 border-green-300 shadow-sm"
                          >
                            ● Active
                          </Badge>
                          {/* Dropdown Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-gray-100 z-20">
                              <DropdownMenuItem onClick={() => handleView(shiftItem)} className="text-gray-700 hover:bg-gray-50">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(shiftItem)} className="text-gray-700 hover:bg-gray-50">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Shift
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(shiftItem)}
                                className="text-red-600 hover:bg-red-50 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Shift
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                          <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">Date Range</p>
                        </div>
                        <p className="text-sm font-bold text-blue-900">
                          {formatDate(shiftItem.fromDate)} - {formatDate(shiftItem.toDate)}
                        </p>
                      </div>

                      {/* Shift Details */}
                      <div className="space-y-4 mb-5">
                        {/* Main Shift Time */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
                          <p className="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">Main Shift</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatTime(shiftItem.shift.shiftStart)} - {formatTime(shiftItem.shift.shiftEnd)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 font-medium">
                            Duration: {formatDuration(shiftItem.shift.duration)}
                          </p>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center text-gray-700 rounded-lg p-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></span>
                            <span className="font-medium">Full Day: {formatDuration(shiftItem.shift.minimumDurationForFullDay)}</span>
                          </div>
                          <div className="flex items-center text-gray-700 rounded-lg p-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 shadow-sm"></span>
                            <span className="font-medium">Half Day: {formatDuration(shiftItem.shift.minimumDurationForHalfDay)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex pt-3 border-t border-gray-100">
                        <Button 
                          size="sm" 
                          className="text-white w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs h-9 shadow-md shadow-blue-200"
                          onClick={() => handleView(shiftItem)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shift View Modal */}
      {isModalOpen && selectedShift && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative overflow-y-auto max-h-[90vh] border border-gray-200">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            
            {/* PDF-like header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-700 tracking-wide">Shift Details</h2>
                <div className="text-gray-500 text-sm mt-1">Document Preview</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Shift Code</span>
                <span className="font-mono text-lg font-semibold text-blue-600">{selectedShift.shift.shiftCode}</span>
              </div>
            </div>

            {/* PDF-like body */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Shift Name</div>
                  <div className="font-semibold text-gray-800 text-lg">{selectedShift.shift.shiftName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Shift Group</div>
                  <div className="font-semibold text-gray-800 text-lg">{selectedShift.shiftGroupCode}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" /> Main Shift
                  </div>
                  <div className="font-mono text-base text-blue-800">
                    {formatTime(selectedShift.shift.shiftStart)} - {formatTime(selectedShift.shift.shiftEnd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-mono text-base">{formatDuration(selectedShift.shift.duration)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Date Range</div>
                  <div className="font-mono text-base text-blue-800">
                    {formatDate(selectedShift.fromDate)} - {formatDate(selectedShift.toDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Cross Day</div>
                  <div className="font-mono text-base">{selectedShift.shift.crossDay ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Flexible</div>
                  <div className="font-mono text-base">{selectedShift.shift.flexible ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className="font-semibold text-green-600 text-lg">● Active</div>
                </div>
              </div>

              {/* Half Day & Extra Info */}
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">First Half</div>
                  <div className="font-mono text-base text-blue-800">
                    {formatTime(selectedShift.shift.firstHalfStart)} - {formatTime(selectedShift.shift.firstHalfEnd)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">Second Half</div>
                  <div className="font-mono text-base text-blue-800">
                    {formatTime(selectedShift.shift.secondHalfStart)} - {formatTime(selectedShift.shift.secondHalfEnd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Lunch Break</div>
                  <div className="font-mono text-base text-blue-800">
                    {formatTime(selectedShift.shift.lunchStart)} - {formatTime(selectedShift.shift.lunchEnd)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Flexi Full Day Duration</div>
                  <div className="font-mono text-base">{formatDuration(selectedShift.shift.flexiFullDayDuration)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Flexi Half Day Duration</div>
                  <div className="font-mono text-base">{formatDuration(selectedShift.shift.flexiHalfDayDuration)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Min Duration for Full Day</div>
                  <div className="font-mono text-base">{formatDuration(selectedShift.shift.minimumDurationForFullDay)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Min Duration for Half Day</div>
                  <div className="font-mono text-base">{formatDuration(selectedShift.shift.minimumDurationForHalfDay)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default IndividualShiftList;