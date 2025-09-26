"use client"

import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Users, MoreHorizontal, Settings } from "lucide-react"

const chartData = [
  { hour: "00", men: 45, women: 32, total: 77 },
  { hour: "01", men: 38, women: 28, total: 66 },
  { hour: "02", men: 25, women: 18, total: 43 },
  { hour: "03", men: 15, women: 12, total: 27 },
  { hour: "04", men: 12, women: 8, total: 20 },
  { hour: "05", men: 18, women: 15, total: 33 },
  { hour: "06", men: 35, women: 42, total: 77 },
  { hour: "07", men: 65, women: 78, total: 143 },
  { hour: "08", men: 95, women: 88, total: 183 },
  { hour: "09", men: 125, women: 115, total: 240 },
  { hour: "10", men: 145, women: 135, total: 280 },
  { hour: "11", men: 165, women: 155, total: 320 },
  { hour: "12", men: 185, women: 175, total: 360 },
  { hour: "13", men: 175, women: 165, total: 340 },
  { hour: "14", men: 155, women: 145, total: 300 },
  { hour: "15", men: 135, women: 125, total: 260 },
  { hour: "16", men: 145, women: 135, total: 280 },
  { hour: "17", men: 165, women: 155, total: 320 },
  { hour: "18", men: 185, women: 175, total: 360 },
  { hour: "19", men: 195, women: 185, total: 380 },
  { hour: "20", men: 175, women: 165, total: 340 },
  { hour: "21", men: 145, women: 135, total: 280 },
  { hour: "22", men: 95, women: 85, total: 180 },
  { hour: "23", men: 65, women: 55, total: 120 },
]

// Using only the three blue colors from your palette
const chartConfig = {
  men: {
    label: "Men",
    color: "#007AFF", // Bright blue
  },
  women: {
    label: "Women",
    color: "#CCE7FF", // Light blue
  },
  total: {
    label: "Total",
    color: "#6BB6FF", // Medium blue
  },
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-blue-100 rounded-lg shadow-lg">
        <p className="font-medium mb-2 text-gray-900">{`${label}:00`}</p>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#007AFF" }}></div>
            <span className="text-sm">Men: {payload.find((p: any) => p.dataKey === "men")?.value}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#CCE7FF" }}></div>
            <span className="text-sm">Women: {payload.find((p: any) => p.dataKey === "women")?.value}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6BB6FF" }}></div>
            <span className="text-sm font-semibold">
              Total: {payload.find((p: any) => p.dataKey === "total")?.value}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function ComponentCharts() {
  const totalUsers = chartData.reduce((sum, item) => sum + item.total, 0)
  const avgHourly = Math.round(totalUsers / 24)
  const peakHour = chartData.reduce((max, item) => (item.total > max.total ? item : max))

  const todayDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  })

  const todayFullDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return (
    <Card className="w-full max-w-5xl border-blue-100 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4" style={{ color: "#007AFF" }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Hourly Activity</p>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-gray-900">{totalUsers.toLocaleString()}</span>
              <span className="text-sm font-medium" style={{ color: "#007AFF" }}>
                Peak: {peakHour.hour}:00 ({peakHour.total})
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4 w-[350px] flex-shrink-0 justify-end">
          <button
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-900 font-medium shadow-sm"
            disabled
            style={{ cursor: "default" }}
          >
            {todayFullDate}
          </button>
          <button
            className="border border-gray-200 rounded-lg px-4 py-2 bg-white text-gray-900 font-medium flex items-center gap-2 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Manage
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6F3FF" />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                domain={[0, 400]}
                ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="men"
                stroke={chartConfig.men.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.men.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: chartConfig.men.color, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="women"
                stroke={chartConfig.women.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.women.color, strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: chartConfig.women.color, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartConfig.total.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.total.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig.total.color, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center mt-4 space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#007AFF" }}></div>
            <span className="text-sm font-medium">Men</span>
            <span className="text-xs text-gray-500">
              ({chartData.reduce((sum, item) => sum + item.men, 0).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#CCE7FF" }}></div>
            <span className="text-sm font-medium">Women</span>
            <span className="text-xs text-gray-500">
              ({chartData.reduce((sum, item) => sum + item.women, 0).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6BB6FF" }}></div>
            <span className="text-sm font-medium">Total</span>
            <span className="text-xs text-gray-500">({totalUsers.toLocaleString()})</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: "#007aff" }}>
            <p className="text-sm text-white">Current Working Men</p>
            <p className="text-lg font-semibold" style={{ color: "#ffffff" }}>
              {Math.round(chartData.reduce((sum, item) => sum + item.men, 0) / 24)}
            </p>
          </div>
          <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: "#cce7ff" }}>
            <p className="text-sm text-gray-600">Current Working Women</p>
            <p className="text-lg font-semibold text-gray-900" >
              {Math.round(chartData.reduce((sum, item) => sum + item.women, 0) / 24)}
            </p>
          </div>
          <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: "#6bb6ff" }}>
            <p className="text-sm text-white">Current Working Total</p>
            <p className="text-lg font-semibold text-white">
              {avgHourly}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
