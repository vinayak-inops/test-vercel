"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, Users } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "@repo/ui/components/ui/select"

// Sample employee data
const employeeData = {
  "2024-01-01": { status: "Holiday", name: "New Year's Day", hours: 0, extraHours: 0 },
  "2024-01-02": { status: "Present", hours: 8, extraHours: 2 },
  "2024-01-03": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-04": { status: "Present", hours: 7.5, extraHours: 0 },
  "2024-01-05": { status: "On Leave", hours: 0, extraHours: 0 },
  "2024-01-06": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-07": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-08": { status: "Present", hours: 8, extraHours: 1.5 },
  "2024-01-09": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-10": { status: "Absent", hours: 0, extraHours: 0 },
  "2024-01-11": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-12": { status: "Present", hours: 8, extraHours: 3 },
  "2024-01-13": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-14": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-15": { status: "Holiday", name: "Martin Luther King Jr. Day", hours: 0, extraHours: 0 },
  "2024-01-16": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-17": { status: "Present", hours: 7, extraHours: 0 },
  "2024-01-18": { status: "On Leave", hours: 0, extraHours: 0 },
  "2024-01-19": { status: "Present", hours: 8, extraHours: 2.5 },
  "2024-01-20": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-21": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-22": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-23": { status: "Present", hours: 8, extraHours: 1 },
  "2024-01-24": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-25": { status: "Absent", hours: 0, extraHours: 0 },
  "2024-01-26": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-27": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-28": { status: "WeekOff", hours: 0, extraHours: 0 },
  "2024-01-29": { status: "Present", hours: 8, extraHours: 0 },
  "2024-01-30": { status: "Present", hours: 8, extraHours: 1.5 },
  "2024-01-31": { status: "Present", hours: 8, extraHours: 0 },
}

const statusColors = {
  Present: "bg-green-100 text-green-800 border-green-200",
  Absent: "bg-red-100 text-red-800 border-red-200",
  "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200",
  WeekOff: "bg-blue-100 text-blue-800 border-blue-200",
  Holiday: "bg-purple-100 text-purple-800 border-purple-200",
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface DayCellProps {
  date: Date
  data?: {
    status: string
    name?: string
    hours: number
    extraHours: number
  }
  isCurrentMonth: boolean
}

function DayCell({ date, data, isCurrentMonth }: DayCellProps) {
  const dateStr = date.toISOString().split("T")[0]

  return (
    <div className={`min-h-[120px] p-2 border border-gray-200 ${isCurrentMonth ? "bg-white" : "bg-gray-50"}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-sm font-medium ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>
          {date.getDate()}
        </span>
      </div>

      {data && isCurrentMonth && (
        <div className="space-y-1">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-1 ${statusColors[data.status as keyof typeof statusColors]}`}
          >
            {data.status}
          </Badge>

          {data.name && <div className="text-xs text-gray-600 font-medium">{data.name}</div>}

          {data.hours > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{data.hours}h</span>
              {data.extraHours > 0 && <span className="text-orange-600 font-medium">+{data.extraHours}h</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmployeeAttendanceCalendar() {
    const [value, setValue] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)) // January 2024

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of the month and calculate calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendarDays = []
  const currentCalendarDate = new Date(startDate)

  // Generate 42 days (6 weeks) for the calendar grid
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentCalendarDate))
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Calculate monthly statistics
  const monthlyStats = Object.entries(employeeData).reduce(
    (acc, [dateStr, data]) => {
      const date = new Date(dateStr)
      if (date.getMonth() === month && date.getFullYear() === year) {
        acc.totalHours += data.hours
        acc.extraHours += data.extraHours
        acc.statusCount[data.status] = (acc.statusCount[data.status] || 0) + 1
      }
      return acc
    },
    {
      totalHours: 0,
      extraHours: 0,
      statusCount: {} as Record<string, number>,
    },
  )

  return (
    <div className="p-0 space-y-6 bg-gray-50 ">
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        
    <div className="max-w-full  p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Attendance Calendar</h1>
          <p className="text-gray-600 mt-1">Track employee attendance and working hours</p>
        </div>

        <div className="w-64">
          <Select onValueChange={setValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Employess" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="location">abc</SelectItem>
              <SelectItem value="subsidiary">xxx</SelectItem>
              <SelectItem value="division">eee</SelectItem>
              <SelectItem value="department">sss</SelectItem>
              <SelectItem value="contractor">aaa</SelectItem>
            </SelectContent>
          </Select>

          {value && <p className="mt-4 text-sm text-gray-700">You selected: {value}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {monthNames[month]} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthlyStats.totalHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Extra Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{monthlyStats.extraHours}h</div>
          </CardContent>
        </Card>

      
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Status Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusColors).map(([status, colorClass]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant="outline" className={`${colorClass}`}>
                  {status}
                </Badge>
                <span className="text-sm text-gray-600">{monthlyStats.statusCount[status] || 0} days</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dateStr = date.toISOString().split("T")[0]
              const isCurrentMonth = date.getMonth() === month
              const data = employeeData[dateStr as keyof typeof employeeData]

              return <DayCell key={index} date={date} data={data} isCurrentMonth={isCurrentMonth} />
            })}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>  
    </div>  
  )
}
