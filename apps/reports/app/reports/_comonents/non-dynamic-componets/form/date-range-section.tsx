"use client"

import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/ui/button"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Calendar } from "@repo/ui/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"

interface DateRangeSectionProps {
  dateRange: string
  fromDate: Date | undefined
  toDate: Date | undefined
  errors: {
    fromDate?: string
    toDate?: string
  }
  onDateRangeChange: (value: string) => void
  onFromDateChange: (date: Date | undefined) => void
  onToDateChange: (date: Date | undefined) => void
}

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
  { value: "custom", label: "Custom" },
]

export function DateRangeSection({
  dateRange,
  fromDate,
  toDate,
  errors,
  onDateRangeChange,
  onFromDateChange,
  onToDateChange,
}: DateRangeSectionProps) {
  return (
    <div className="space-y-6 ">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-range" className="text-sm font-medium">
              Select Date <span className="text-red-500">*</span>
            </Label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  From Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground",
                        errors.fromDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={fromDate} onSelect={onFromDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
                {errors.fromDate && <p className="text-sm text-red-500">{errors.fromDate}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  To Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground",
                        errors.toDate && "border-red-500",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "dd-MM-yyyy") : <span>dd-mm-yyyy</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={onToDateChange}
                      disabled={(date) => (fromDate ? date < fromDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.toDate && <p className="text-sm text-red-500">{errors.toDate}</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
