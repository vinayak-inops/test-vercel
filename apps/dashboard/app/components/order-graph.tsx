"use client"
import { useEffect, useRef, useState } from "react"
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js"
import { minimalColors } from "../lib/chart-utils"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function OrderGraph() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const newOrdersData = [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80]
  const completedOrdersData = [28, 48, 40, 19, 86, 27, 90, 85, 70, 60, 65, 70]

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Male count",
            data: newOrdersData,
            backgroundColor: minimalColors.primaryBg,
            borderColor: minimalColors.primary,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: "Female count",
            data: completedOrdersData,
            backgroundColor: minimalColors.secondaryBg,
            borderColor: minimalColors.secondary,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: true,
              color: "hsl(var(--border))",
            },
            ticks: {
              color: "hsl(var(--foreground))",
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              display: true,
              color: "hsl(var(--border))",
            },
            ticks: {
              color: "hsl(var(--foreground))",
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            align: "start",
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              pointStyle: "rect",
              color: "hsl(var(--foreground))",
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "hsl(var(--background))",
            titleColor: "hsl(var(--foreground))",
            bodyColor: "hsl(var(--foreground))",
            borderColor: "hsl(var(--border))",
            borderWidth: 1,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        elements: {
          line: {
            borderWidth: 2,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [theme])

  return (
    <div className="w-full h-[350px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

function useTheme(): { theme: any } {
    return { theme: "light" }; // or "dark"
}

