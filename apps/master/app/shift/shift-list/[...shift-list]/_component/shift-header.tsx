import React from 'react'
import { Button } from '@repo/ui/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import ShiftCardFilter from '@/app/shift/_components/shift-card-filter'
import ShiftListBoxFilter from './shift-list-boxfilter'
import { useRouter } from 'next/navigation'

function ShiftHeader({ shiftData, existingShiftGroupCodes = [], existingShiftGroupNames = [], refetchShiftData, searchTerm, setSearchTerm, filteredShifts }: {
  shiftData: any;
  existingShiftGroupCodes: string[];
  existingShiftGroupNames: string[];
  refetchShiftData: any;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredShifts: any[];
}) {
  const router = useRouter();
  return (
    <div  className="space-y-6">
           {/* Breadcrumb */}
           <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span
          className="cursor-pointer hover:underline text-blue-600"
          onClick={() => router.push('/shift')}
        >
          Shift
        </span>
        <span>/</span>
        <span
          className="cursor-pointer hover:underline text-blue-600"
          onClick={() => router.push('/shift/shift-list')}
        >
          Shift Management
        </span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Shift List</span>
      </div>

      {/* Page Header */}
        <ShiftListBoxFilter 
          shiftData={shiftData} 
          existingShiftGroupCodes={existingShiftGroupCodes} 
          existingShiftGroupNames={existingShiftGroupNames} 
          refetchShiftData={refetchShiftData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredShifts={filteredShifts}
        />
    </div>
  )
}

export default ShiftHeader