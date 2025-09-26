"use client"
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { getColorPalette } from "../lib/chart-utils"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Define the years
const years = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]

// Sample data for the chart
const generateRandomData = () => {
  const colors = getColorPalette(years.length)
  return years.map((year) => ({
    label: year.toString(),
    data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
    backgroundColor: colors[years.indexOf(year)],
  }))
}

interface MonthlyComparisonChartProps {
  type: "vertical" | "stacked"
}

export function MonthlyComparisonChart({ type }: MonthlyComparisonChartProps) {
  const months = ["January", "February", "March", "April", "May", "June", "July"]
  const datasets = generateRandomData()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: type === "stacked",
        grid: {
          display: true,
          color: "hsl(var(--border))",
        },
      },
      y: {
        stacked: type === "stacked",
        beginAtZero: true,
        max: 100,
        grid: {
          display: true,
          color: "hsl(var(--border))",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: "hsl(var(--foreground))",
        },
      },
    },
  }

  const data = {
    labels: months,
    datasets,
  }

  return (
    <div className="w-full h-[500px]">
      <Bar options={options} data={data} />
    </div>
  )
}
