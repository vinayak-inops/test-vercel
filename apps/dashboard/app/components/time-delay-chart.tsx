"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { UserPlus, UserMinus } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

export default function TimeDelayChart() {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        fill: true,
        label: "New employees",
        data: [] as number[],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
      {
        fill: true,
        label: "Left employees",
        data: [] as number[],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  })

  // Function to format time with 5-minute delay
  const getTimeWithDelay = (delayMinutes = 10) => {
    const now = new Date()
    // Subtract 5 minutes from current time
    now.setMinutes(now.getMinutes() - delayMinutes)
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  useEffect(() => {
    // Initial data setup
    const initialLabels = Array(12)
      .fill(0)
      .map((_, i) => {
        const date = new Date()
        // Set time to be 5 minutes ago, then go back by i*5 minutes
        date.setMinutes(date.getMinutes() - 5 - i * 5)
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      })
      .reverse() // Reverse to have oldest time first

    // Generate some sample data
    const newEmployeeData = Array(12)
      .fill(0)
      .map(() => Math.floor(Math.random() * 20) + 5)

    const leftEmployeeData = Array(12)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10) + 1)

    setChartData({
      labels: initialLabels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: newEmployeeData,
        },
        {
          ...chartData.datasets[1],
          data: leftEmployeeData,
        },
      ],
    })

    // Update chart every minute
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newLabels = [...prevData.labels.slice(1), getTimeWithDelay()]
        const newEmployeeValue = Math.floor(Math.random() * 20) + 5
        const leftEmployeeValue = Math.floor(Math.random() * 10) + 1

        return {
          labels: newLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: [...prevData.datasets[0].data.slice(1), newEmployeeValue],
            },
            {
              ...prevData.datasets[1],
              data: [...prevData.datasets[1].data.slice(1), leftEmployeeValue],
            },
          ],
        }
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Employees</CardTitle>
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-[260px] grid-cols-2">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="left" className="flex items-center gap-2">
              <UserMinus className="h-4 w-4" />
              Left
            </TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-4">
            <div className="text-sm font-medium text-blue-500">New employees</div>
            <div className="text-2xl font-bold">
              {chartData.datasets[0].data.length > 0
                ? chartData.datasets[0].data[chartData.datasets[0].data.length - 1]
                : 0}
            </div>
          </TabsContent>
          <TabsContent value="left" className="mt-4">
            <div className="text-sm font-medium text-red-500">Left employees</div>
            <div className="text-2xl font-bold">
              {chartData.datasets[1].data.length > 0
                ? chartData.datasets[1].data[chartData.datasets[1].data.length - 1]
                : 0}
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
