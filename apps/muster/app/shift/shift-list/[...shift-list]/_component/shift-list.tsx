import { Search, Plus, Filter, Download, Users, UserCheck, Clock, TrendingUp, Edit, Trash2, Eye, MoreVertical } from "lucide-react"
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



const stats = [
  { title: "Total Employees", value: "156", icon: Users, color: "blue" },
  { title: "Active Employees", value: "142", icon: UserCheck, color: "green" },
  { title: "On Leave", value: "8", icon: Clock, color: "yellow" },
  { title: "New Hires (30d)", value: "12", icon: TrendingUp, color: "purple" },
]

function ShiftList({ shiftData, onEditShift, onDeleteShift, onViewShift }: { shiftData: any, onEditShift: (shift: any) => void, onDeleteShift: (shift: any) => void, onViewShift: (shift: any) => void }) {

  const handleView = (shift: any) => {
    if (onViewShift) onViewShift(shift);
  };

  const handleEdit = (shift: any) => {
    if (onEditShift) onEditShift(shift);
  };

  const handleDelete = (shift: any) => {
    if (onDeleteShift) onDeleteShift(shift);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="px-0 mt-6">
      <div className="py-0">
        <Card className=" border-none shadow-none mb-0">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {shiftData?.shift?.map((shift: any, idx: number) => (
                <Card
                  key={shift.shiftCode + idx}
                  className=" bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02] hover:border-gray-300 relative z-10"
                >
                  <CardContent className="p-6">
                    {/* Shift Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg ${
                          shift.status === 'active' 
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-200' 
                            : 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-200'
                        }`}>
                          {shift.shiftName?.[0] || shift.shiftCode?.[0] || "S"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{shift.shiftName}</h3>
                          <p className="text-gray-600 text-xs font-medium">Code: {shift.shiftCode}</p>
                          {/* <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 font-medium">{shift.employeeCount} employees</span>
                          </div> */}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Status Badge */}
                        <Badge 
                          className={`text-xs px-2 py-1 ${
                            shift.status != 'active' 
                              ? 'bg-green-100 text-green-800 border-green-300 shadow-sm' 
                              : 'bg-gray-100 text-gray-600 border-gray-300 shadow-sm'
                          }`}
                        >
                          {shift.status != 'active' ? '● Active' : '○ Inactive'}
                        </Badge>
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50">
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-gray-100 z-20">
                            <DropdownMenuItem onClick={() => handleView(shift)} className="text-gray-700 hover:bg-gray-50">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(shift)} className="text-gray-700 hover:bg-gray-50">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Shift
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(shift)}
                              className="text-red-600 hover:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Shift
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Shift Details */}
                    <div className="space-y-4 mb-5">
                      {/* Main Shift Time */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
                        <p className="text-xs text-gray-600 font-semibold mb-2 uppercase tracking-wide">Main Shift</p>
                        <p className="text-lg font-bold text-gray-900">{shift.shiftStart} - {shift.shiftEnd}</p>
                        <p className="text-sm text-gray-600 mt-1 font-medium">Duration: {formatDuration(shift.duration)}</p>
                      </div>

                      {/* Break Times */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50/70 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Lunch Break</p>
                          <p className="text-sm font-semibold text-gray-900">{shift.lunchStart} - {shift.lunchEnd}</p>
                        </div>
                        <div className="bg-gray-50/70 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Grace Period</p>
                          <p className="text-sm font-semibold text-gray-900">{shift.graceIn}m in / {shift.graceOut}m out</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center text-gray-700  rounded-lg p-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 shadow-sm"></span>
                          <span className="font-medium">Late: {shift.lateInAllowedTime}m</span>
                        </div>
                        <div className="flex items-center text-gray-700  rounded-lg p-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 shadow-sm"></span>
                          <span className="font-medium">Early out: {shift.earlyOutAllowedTime}m</span>
                        </div>
                        {/* {shift.flexible && (
                          <div className="flex items-center text-gray-700 bg-gray-50/50 rounded-lg p-2 col-span-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 shadow-sm"></span>
                            <span className="font-medium">Flexible shift enabled</span>
                          </div>
                        )}
                        {shift.crossDay && (
                          <div className="flex items-center text-gray-700 bg-gray-50/50 rounded-lg p-2 col-span-2">
                            <span className="w-2 h-2 bg-blue-700 rounded-full mr-2 shadow-sm"></span>
                            <span className="font-medium">Cross-day shift</span>
                          </div>
                        )} */}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        className="text-white flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs h-9 shadow-md shadow-blue-200"
                        onClick={() => handleView(shift)}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-xs h-9 bg-white"
                        onClick={() => handleEdit(shift)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs h-9 bg-white"
                        onClick={() => handleDelete(shift)}
                      >
                        <Trash2 className="h-3 w-3" />
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
  );
}

export default ShiftList;
