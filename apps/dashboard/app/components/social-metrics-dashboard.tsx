import type React from "react"
import { Twitter, Facebook, Github } from "lucide-react"
import { Card } from "@repo/ui/components/ui/card"

interface MetricCardProps {
  icon: React.ReactNode
  value: number
  label: string
  target: number
  record: number
  valueFormatted?: string
}

const MetricCard = ({ icon, value, label, target, record, valueFormatted }: MetricCardProps) => {
  // Calculate percentages for progress bars
  const targetPercentage = Math.min((value / target) * 100, 100)
  const recordPercentage = Math.min((value / record) * 100, 100)

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-muted-foreground">{icon}</div>
        <div className="text-right">
          <div className="text-3xl font-bold">{valueFormatted || formatNumber(value)}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Target</span>
            <span>{formatNumber(target)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${targetPercentage}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>All Time Record</span>
            <span>{formatNumber(record)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${recordPercentage}%` }} />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function SocialMediaDashboard() {
  const metrics = [
    {
      icon: <Twitter className="h-8 w-8 text-[#1DA1F2]" />,
      value: 44995,
      label: "Retweets",
      target: 10000,
      record: 50702,
    },
    {
      icon: <Facebook className="h-8 w-8 text-[#1877F2]" />,
      value: 44995,
      label: "Facebook Interactions",
      target: 10000,
      record: 99028,
    },
    {
      icon: <Github className="h-8 w-8" />,
      value: 81002,
      label: "Stars",
      target: 10000,
      record: 162550,
    },
  ]

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  )
}
