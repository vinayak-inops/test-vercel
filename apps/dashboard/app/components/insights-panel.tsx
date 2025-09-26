"use client"

import { useState } from "react"
import { Doughnut } from "react-chartjs-2"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { getColorPalette } from "../lib/chart-utils"

interface InsightsPanelProps {
  type: "semi" | "full"
}

export function InsightsPanel({ type }: InsightsPanelProps) {
  const [dateRange, setDateRange] = useState("November 22 - November 29")

  // Sample data for the days of the week
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dayColors = getColorPalette(days.length)

  // Generate random data for the chart
  const generateData = () => {
    const values = days.map((_, index) => {
      // Make Friday the best day and Saturday the worst day to match the image
      if (index === 5) return 95 // Friday
      if (index === 6) return 6 // Saturday
      return Math.floor(Math.random() * 80) + 20
    })

    return {
      labels: days,
      datasets: [
        {
          data: values,
          backgroundColor: dayColors,
          borderWidth: 0,
        },
      ],
    }
  }

  const chartData = generateData()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    circumference: 180,
    rotation: 270,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: "hsl(var(--foreground))",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw}`,
        },
        backgroundColor: "hsl(var(--background))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground text-center">{dateRange}</div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {days.map((day, index) => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-4 h-4" style={{ backgroundColor: dayColors[index] }}></div>
            <span className="text-sm">{day}</span>
          </div>
        ))}
      </div>

      <div className="h-[200px] relative">
        <Doughnut data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <ThumbsUp className="text-green-600" />
          </div>
          <div>
            <div className="font-medium">Best Day of the Week</div>
            <div className="text-green-600">Friday</div>
          </div>
          <div className="ml-auto text-2xl font-bold">95</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <ThumbsDown className="text-orange-600" />
          </div>
          <div>
            <div className="font-medium">Worst Day of the Week</div>
            <div className="text-orange-600">Saturday</div>
          </div>
          <div className="ml-auto text-2xl font-bold">6</div>
        </div>
      </div>
    </div>
  )
}
