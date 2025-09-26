"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StoreData {
  id: string
  name: string
  currentValue: number
  change: number
  trend: "up" | "down"
  chartData: { time: number; value: number }[]
}

const generateRandomValue = (base: number, variance: number) => {
  return base + (Math.random() - 0.5) * variance
}

const generateChartData = (baseValue: number, points = 20) => {
  const data = []
  let currentValue = baseValue

  for (let i = 0; i < points; i++) {
    currentValue += (Math.random() - 0.5) * 50
    data.push({
      time: Date.now() - (points - i) * 1000,
      value: Math.max(0, currentValue),
    })
  }

  return data
}

const initialStores: StoreData[] = [
  {
    id: "store-a",
    name: "Store A Sales",
    currentValue: 176.24,
    change: -276.24,
    trend: "down",
    chartData: generateChartData(200),
  },
  {
    id: "store-b",
    name: "Store B Sales",
    currentValue: 40.16,
    change: -160.16,
    trend: "down",
    chartData: generateChartData(100),
  },
  {
    id: "store-c",
    name: "Store C Sales",
    currentValue: 386.5,
    change: 236.5,
    trend: "up",
    chartData: generateChartData(300),
  },
  {
    id: "store-d",
    name: "Store D Sales",
    currentValue: 86.76,
    change: 6.76,
    trend: "up",
    chartData: generateChartData(80),
  },
]

export default function LivePerformanceDashboard() {
  const [stores, setStores] = useState<StoreData[]>(initialStores)

  useEffect(() => {
    const interval = setInterval(() => {
      setStores((prevStores) =>
        prevStores.map((store) => {
          const newValue = generateRandomValue(store.currentValue, 20)
          const newChange = newValue - store.currentValue
          const newTrend = newChange >= 0 ? "up" : "down"

          // Add new data point and remove oldest
          const newChartData = [
            ...store.chartData.slice(1),
            {
              time: Date.now(),
              value: Math.max(0, newValue),
            },
          ]

          return {
            ...store,
            currentValue: newValue,
            change: store.change + newChange,
            trend: newTrend,
            chartData: newChartData,
          }
        }),
      )
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const chartConfig = {
    value: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
     <div className="w-full  ">
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Live Performance Dashboard</h1>
        <p className="text-muted-foreground mt-2">Real-time sales performance across all stores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{store.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {store.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-2xl font-bold">${store.currentValue.toFixed(2)}</span>
                  </div>
                  <div className={`text-sm font-medium ${store.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {store.change >= 0 ? "+" : ""}
                    {store.change.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="h-20">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={store.chartData}>
                      <defs>
                        <linearGradient id={`gradient-${store.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill={`url(#gradient-${store.id})`}
                        strokeWidth={2}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <div className="inline-flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          Live data updates every 2 seconds
        </div>
      </div>
    </div>
    </div>
  )
}
