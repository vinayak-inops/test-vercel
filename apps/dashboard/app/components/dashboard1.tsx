"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { MonthlyComparisonChart } from "../components/monthly-comparison-chart"
import { InsightsPanel } from "../components/insights-panel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"
import InsightsChart from "./insights-chart"
import StackedBarChart from "./stacked-bar-chart"

export default function Dashboard1() {
  const [chartType, setChartType] = useState<"vertical" | "stacked">("vertical")
  const [dataType, setDataType] = useState<"semi" | "full">("full")
  const [value, setValue] = useState("")

  return (
    // <div className="w-full  grid grid-cols-1 lg:grid-cols-2 ">
      <div className="w-full grid grid-cols-1 lg:grid-cols-10 gap-6 ">
      {/* <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Monthly Comparison</CardTitle>
          <div className="w-64">
            <Select onValueChange={setValue}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="location">Present</SelectItem>
                <SelectItem value="subsidiary">Absent</SelectItem>
                <SelectItem value="division">Late</SelectItem>
                <SelectItem value="department">Early</SelectItem>
              </SelectContent>
            </Select>
          </div>

         
        </CardHeader>
        <CardContent>
        <StackedBarChart />
        </CardContent>
      </Card> */}
      {/* 
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Insights</CardTitle>
          
        </CardHeader>
        <CardContent>
        <InsightsChart />
        </CardContent>
      </Card> */}

<div className="lg:col-span-7">
    <StackedBarChart />
  </div>

  {/* 30% on large screens = 3/10 columns */}
  <div className="lg:col-span-3">
    <InsightsChart />
  </div>

    </div>
  )
}
