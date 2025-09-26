"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { getColorPalette } from "../lib/chart-utils"

// Sample data structure with months (3-letter abbreviations)
const data = [
  {
    month: "Jan",
    "2012": 80,
    "2013": 70,
    "2014": 30,
    "2015": 90,
    "2016": 40,
    "2017": 60,
    "2018": 30,
    "2019": 20,
    "2020": 30,
  },
  {
    month: "Feb",
    "2012": 30,
    "2013": 40,
    "2014": 20,
    "2015": 40,
    "2016": 50,
    "2017": 30,
    "2018": 10,
    "2019": 5,
    "2020": 0,
  },
  {
    month: "Mar",
    "2012": 100,
    "2013": 40,
    "2014": 30,
    "2015": 40,
    "2016": 30,
    "2017": 70,
    "2018": 40,
    "2019": 35,
    "2020": 30,
  },
  {
    month: "Apr",
    "2012": 20,
    "2013": 30,
    "2014": 40,
    "2015": 50,
    "2016": 20,
    "2017": 30,
    "2018": 50,
    "2019": 40,
    "2020": 60,
  },
  {
    month: "May",
    "2012": 40,
    "2013": 90,
    "2014": 30,
    "2015": 20,
    "2016": 70,
    "2017": 50,
    "2018": 40,
    "2019": 30,
    "2020": 30,
  },
  {
    month: "Jun",
    "2012": 70,
    "2013": 50,
    "2014": 60,
    "2015": 20,
    "2016": 30,
    "2017": 40,
    "2018": 60,
    "2019": 30,
    "2020": 20,
  },
  {
    month: "Jul",
    "2012": 140,
    "2013": 100,
    "2014": 70,
    "2015": 60,
    "2016": 90,
    "2017": 50,
    "2018": 40,
    "2019": 70,
    "2020": 50,
  },
  {
    month: "Aug",
    "2012": 85,
    "2013": 75,
    "2014": 45,
    "2015": 55,
    "2016": 65,
    "2017": 35,
    "2018": 25,
    "2019": 45,
    "2020": 40,
  },
  {
    month: "Sep",
    "2012": 95,
    "2013": 60,
    "2014": 50,
    "2015": 70,
    "2016": 45,
    "2017": 55,
    "2018": 35,
    "2019": 25,
    "2020": 35,
  },
  {
    month: "Oct",
    "2012": 110,
    "2013": 80,
    "2014": 65,
    "2015": 45,
    "2016": 75,
    "2017": 60,
    "2018": 50,
    "2019": 40,
    "2020": 45,
  },
  {
    month: "Nov",
    "2012": 75,
    "2013": 55,
    "2014": 35,
    "2015": 65,
    "2016": 50,
    "2017": 45,
    "2018": 30,
    "2019": 35,
    "2020": 25,
  },
  {
    month: "Dec",
    "2012": 120,
    "2013": 90,
    "2014": 80,
    "2015": 70,
    "2016": 85,
    "2017": 75,
    "2018": 60,
    "2019": 55,
    "2020": 65,
  },
]

// Color palette using minimal colors
const colors = getColorPalette(9)

export default function StackedBarChart() {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"stacked" | "vertical">("stacked")

  const years = ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"]

  const handleMouseEnter = (year: string) => {
    setHoveredBar(year)
  }

  const handleMouseLeave = () => {
    setHoveredBar(null)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xl font-bold">Monthly Comparison</CardTitle>
        <div className="flex gap-2">
          <Badge
            variant={chartType === "vertical" ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => setChartType("vertical")}
          >
            Vertical Data
          </Badge>
          <Badge
            variant={chartType === "stacked" ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => setChartType("stacked")}
          >
            Stacked Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {years.map((year, index) => (
            <div
              key={year}
              className="flex items-center gap-1.5"
              onMouseEnter={() => handleMouseEnter(year)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="w-4 h-4"
                style={{
                  backgroundColor: colors[index],
                  opacity: hoveredBar && hoveredBar !== year ? 0.5 : 1,
                }}
              />
              <span className="text-sm">{year}</span>
            </div>
          ))}
        </div>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "hsl(var(--foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
              />
              {years.map((year, index) => (
                <Bar
                  key={year}
                  dataKey={year}
                  stackId="a"
                  fill={colors[index]}
                  onMouseEnter={() => handleMouseEnter(year)}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
