"use client"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card"
import { Separator } from "@repo/ui/components/ui/separator"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { Building2, MapPin, Users, BarChart3, Settings, MoreHorizontal } from "lucide-react"
import { useEffect } from "react"
import { FC } from "react";
import { useRouter } from "next/navigation";

const ShiftCategoryCard: FC<{
  data: any[];
  isLoading: boolean;
  error: any;
  onEditShift: (shift: any) => void;
}> = ({ data, isLoading, error, onEditShift }) => {
  const router = useRouter();
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading data</div>;
  }
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-8 text-center text-gray-400">No shift data found.</div>;
  }
  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {data.map((item: any, idx: number) => {
        const categories = item.employeeCategory || [];
        const shifts = item.shift || [];
        const totalEmployees = "--"; // Placeholder, replace with backend value if available
        const shiftId = item._id?.$oid || item._id;
        return (
          <Card key={shiftId || idx} className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{item.shiftGroupName || "-"}</h2>
                    <p className="text-sm text-gray-500">Code: {item.shiftGroupCode || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    Active
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Location and Subsidiary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{item.location?.locationName || "-"}</p>
                    <p className="text-xs text-gray-500">Code: {item.location?.locationCode || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-bold  text-gray-900">{item.subsidiary?.subsidiaryName || "-"}</p>
                    <p className="text-xs text-gray-500">Subsidiary</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Employee Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Categories & Employee Count
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {categories.length} total categories
                  </Badge>
                </div>
                {/* Category Summary */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Total Shift</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-blue-900">{totalEmployees}</span>
                      <span className="text-sm text-blue-700">employees across {shifts.length} shifts</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center gap-2 h-11 bg-transparent" onClick={() => onEditShift(item)}>
                  <Settings className="h-4 w-4" />
                  Manage Employees
                </Button>
                <Button className="flex items-center gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push(`/shift/shift-list/${shiftId}`)}>
                  <BarChart3 className="h-4 w-4" />
                  View Shifts
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ShiftCategoryCard;
