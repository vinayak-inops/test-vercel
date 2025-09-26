"use client"

import { useEffect, useRef } from "react"
import { minimalColors } from "../lib/chart-utils"

interface ExpensesChartProps {
  view: "weekly" | "monthly"
}

export function ExpensesChart({ view }: ExpensesChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1

    // Set the canvas dimensions accounting for device pixel ratio
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear the canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set up the chart data
    const data = view === "weekly" ? [30, 65, 45, 25, 55, 70, 60] : [40, 55, 75, 35, 60, 80, 50, 30, 70, 65, 45, 55]

    // Draw the chart
    drawChart(ctx, data, rect.width, rect.height)
  }, [view])

  function drawChart(ctx: CanvasRenderingContext2D, data: number[], width: number, height: number) {
    const padding = 20
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Calculate x and y coordinates for each data point
    const points = data.map((value: number, index: number) => {
      const x = padding + index * (chartWidth / (data.length - 1))
      const y = height - padding - (value / 100) * chartHeight
      return { x, y }
    })

    // Draw the area under the line
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = minimalColors.primaryBg // Use minimal color with transparency
    ctx.fill()

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.strokeStyle = minimalColors.primary
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw the data points
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      ctx.fillStyle = "hsl(var(--background))"
      ctx.fill()
      ctx.strokeStyle = minimalColors.primary
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}
