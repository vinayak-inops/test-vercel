"use client"

import { useEffect, useRef } from "react"
import { minimalColors } from "../lib/chart-utils"

interface AreaChartProps {
  data: number[]
  color?: string
}

interface AreaChartProps1 {
  data: number[]
  color?: string
  fillColor?: string
}

export function AreaChart({ data, color = minimalColors.primary }: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    if (data.length < 2) return

    // Find min and max values for scaling
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    // Calculate point spacing
    const pointSpacing = rect.width / (data.length - 1)

    // Start path
    ctx.beginPath()

    // Move to first point at the bottom
    ctx.moveTo(0, rect.height)

    // Draw line to first data point
    const firstY = rect.height - ((data[0] - min) / range) * rect.height * 0.9
    ctx.lineTo(0, firstY)

    // Draw lines between points
    for (let i = 1; i < data.length; i++) {
      const x = i * pointSpacing
      const y = rect.height - ((data[i] - min) / range) * rect.height * 0.9
      ctx.lineTo(x, y)
    }

    // Complete the path to create area
    ctx.lineTo((data.length - 1) * pointSpacing, rect.height)
    ctx.closePath()

    // Fill area with minimal color
    ctx.fillStyle = minimalColors.primaryBg
    ctx.fill()

    // Draw the line on top
    ctx.beginPath()
    ctx.moveTo(0, firstY)

    for (let i = 1; i < data.length; i++) {
      const x = i * pointSpacing
      const y = rect.height - ((data[i] - min) / range) * rect.height * 0.9
      ctx.lineTo(x, y)
    }

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
  }, [data, color])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

export function AreaChart1({ data, color = minimalColors.primary, fillColor = minimalColors.primaryBg }: AreaChartProps1) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Find min and max values
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1 // Avoid division by zero

    // Calculate dimensions
    const padding = 5
    const chartWidth = rect.width - padding * 2
    const chartHeight = rect.height - padding * 2
    const stepX = chartWidth / (data.length - 1)

    // Function to convert data point to y coordinate
    const getY = (value: number) => {
      return padding + chartHeight - ((value - min) / range) * chartHeight
    }

    // Draw area
    ctx.beginPath()
    ctx.moveTo(padding, getY(data[0]))

    data.forEach((value, index) => {
      ctx.lineTo(padding + index * stepX, getY(value))
    })

    // Complete the area by drawing to the bottom right and bottom left
    ctx.lineTo(padding + (data.length - 1) * stepX, rect.height)
    ctx.lineTo(padding, rect.height)
    ctx.closePath()

    // Fill area
    ctx.fillStyle = fillColor
    ctx.fill()

    // Draw line
    ctx.beginPath()
    ctx.moveTo(padding, getY(data[0]))

    data.forEach((value, index) => {
      ctx.lineTo(padding + index * stepX, getY(value))
    })

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
  }, [data, color, fillColor])

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
}
