"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { TrendingUp, TrendingDown, Eye, MousePointer, BarChart3, Facebook, Twitter, Github } from "lucide-react"
import { useEffect, useState } from "react"
import { Search, Plus, CheckCircle, RotateCcw, XCircle } from "lucide-react"
import { ChevronRight, UserPlus, UserMinus, Cake, Glasses } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import GoalCard from "./GoalCard"
import { getCurrentDate } from "../lib/date-utils"
import { minimalColors } from "../lib/chart-utils"

interface GoalCardProps {
    title: string
    date: string
    current: number
    target: number
}

const orderData = {
    new: [
        { month: "January", value: 12 },
        { month: "February", value: 15 },
        { month: "March", value: 8 },
        { month: "April", value: 22 },
        { month: "May", value: 18 },
        { month: "June", value: 25 },
        { month: "July", value: 30 },
        { month: "August", value: 30 },
        { month: "September", value: 30 },
        { month: "October", value: 30 },
        { month: "November", value: 30 },
        { month: "December", value: 30 },
    ],
    left: [
        { month: "January", value: 45 },
        { month: "February", value: 52 },
        { month: "March", value: 48 },
        { month: "April", value: 61 },
        { month: "May", value: 55 },
        { month: "June", value: 67 },
        { month: "July", value: 73 },
        { month: "August", value: 30 },
        { month: "September", value: 30 },
        { month: "October", value: 30 },
        { month: "November", value: 30 },
        { month: "December", value: 30 },
    ],
    birthday: [
        { month: "January", value: 3 },
        { month: "February", value: 5 },
        { month: "March", value: 2 },
        { month: "April", value: 8 },
        { month: "May", value: 6 },
        { month: "June", value: 4 },
        { month: "July", value: 7 },
        { month: "August", value: 30 },
        { month: "September", value: 30 },
        { month: "October", value: 30 },
        { month: "November", value: 30 },
        { month: "December", value: 30 },
    ],
    retirement: [
        { month: "January", value: 2 },
        { month: "February", value: 1 },
        { month: "March", value: 20 },
        { month: "April", value: 4 },
        { month: "May", value: 17 },
        { month: "June", value: 15 },
        { month: "July", value: 19 },
        { month: "August", value: 30 },
        { month: "September", value: 30 },
        { month: "October", value: 30 },
        { month: "November", value: 30 },
        { month: "December", value: 30 },
    ],
}

// Mini sparkline data for the buttons
const sparklineData = {
    new: [8, 12, 6, 15, 10, 18, 22],
    left: [35, 42, 38, 45, 48, 52, 55],
    birthday: [2, 4, 1, 6, 3, 5, 4],
    retirement: [1, 2, 15, 3, 12, 10, 14],
}

const orderTypes = [
    {
        key: "new" as const,
        label: "New",
        icon: UserPlus,
        color: minimalColors.primaryBg,
        strokeColor: minimalColors.primary,
    },
    {
        key: "left" as const,
        label: "Left",
        icon: UserMinus,
        color: minimalColors.secondaryBg,
        strokeColor: minimalColors.secondary,
    },
    {
        key: "birthday" as const,
        label: "Birthday",
        icon: Cake,
        color: minimalColors.tertiaryBg,
        strokeColor: minimalColors.tertiary,
    },
    {
        key: "retirement" as const,
        label: "Retirement",
        icon: Glasses,
        color: minimalColors.quaternaryBg,
        strokeColor: minimalColors.quaternary,
    },
]

// Mini sparkline component
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * 60
            const y = 20 - (value / Math.max(...data)) * 15
            return `${x},${y}`
        })
        .join(" ")

    return (
        <svg width="60" height="20" className="opacity-60">
            <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
        </svg>
    )
}

export default function AnalyticsDashboard() {
    const [mounted, setMounted] = useState(false)

    // Handle hydration mismatch by only rendering the chart on the client
    useEffect(() => {
        setMounted(true)
    }, [])

    const [target, setTarget] = useState(100)
    const [current, setCurrent] = useState(75)
    const percentage = Math.round((current / target) * 100)

    const [selectedType, setSelectedType] = useState<keyof typeof orderData>("new")

    const currentData = orderData[selectedType]
    const currentConfig = orderTypes.find((type) => type.key === selectedType)!

    const chartConfig = {
        value: {
            label: `${currentConfig.label} Employees`,
            color: currentConfig.strokeColor,
        },
    }

    return (
        <div className="p-0 space-y-6 bg-gray-50 ">

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">


                 {/* Traffic Sources */}
               
                {/* Top Products Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-semibold text-gray-900">Employees</CardTitle>
                            {/* <Search className="h-5 w-5 text-gray-400" /> */}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {orderTypes.map((type) => {
                                const Icon = type.icon
                                const isSelected = selectedType === type.key

                                return (
                                    <Button
                                        key={type.key}
                                        variant="ghost"
                                        className={`h-auto p-4 flex flex-col items-start space-y-2 border rounded-lg transition-all ${isSelected ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                        onClick={() => setSelectedType(type.key)}
                                    >
                                        <div className="flex items-center space-x-2 w-full">
                                            <Icon className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm font-medium text-gray-700">{type.label}</span>
                                        </div>
                                        {/* <div className="w-full">
                    <MiniSparkline data={sparklineData[type.key]} color={type.strokeColor} />
                  </div> */}
                                    </Button>
                                )
                            })}
                        </div>

                        {/* Main Chart */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: currentConfig.strokeColor }} />
                                <span className="text-sm font-medium text-gray-600">{currentConfig.label} employees</span>
                            </div>

                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={currentConfig.strokeColor} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={currentConfig.strokeColor} stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: "#6B7280" }}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: "#6B7280" }}
                                            domain={[0, "dataMax + 5"]}
                                        />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={currentConfig.strokeColor}
                                            strokeWidth={2}
                                            fill="url(#fillGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

               
            </div>
        </div>
    )
}


{/* <Card>
<CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-xl">Notifications</CardTitle>
    <button className="text-muted-foreground hover:text-foreground">
    </button>
</CardHeader>
<CardContent className="space-y-6">
    <div className="space-y-1">
        {[
            { name: "New employees ", icons: UserPlus },
            { name: "Left employees ", icons: UserMinus },
            { name: "Birthday employees", icons: Cake },
            { name: "Retirement employees", icons: Glasses },

        ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <item.icons className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
        ))}
    </div>

    {/* Today's Goal */}
    // <Card className="bg-blue-500 text-white">
    //     <CardContent className="p-4">
    //         <div className="flex items-center justify-between">
    //             <div>
    //                 <div className="text-lg opacity-90">{"Employees currently inside the premises"}</div>
    //                 <div className="text-sm opacity-75">{getCurrentDate()}</div>
    //                 <div className="text-lg font-bold mt-1">183/250</div>
    //             </div>
    //             <div className="mt-6 flex justify-center">
    //                 {mounted && (
    //                     <div className="relative h-40 w-40">
    //                         <svg viewBox="0 0 36 36" className="h-full w-full">
    //                             {/* Background circle */}
    //                             <path
    //                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
    //                                 fill="none"
    //                                 stroke="#85B7E8"
    //                                 strokeWidth="3"
    //                             />

    //                             {/* Progress arc - dynamically calculated */}
    //                             <path
    //                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831

    //                                 a 15.9155 15.9155 0 0 1 0 -31.831"
    //                                 fill="none"
    //                                 stroke="#FFFFFF"
    //                                 strokeWidth="3"
    //                                 strokeDasharray={`${percentage}, 100`}
    //                                 strokeLinecap="round"
    //                                 transform="rotate(-90, 18, 18)"
    //                             />
    //                         </svg>
    //                     </div>
    //                 )}
//                 </div>
//                 {/* <GoalCard title="Employees currently inside the premises" date={getCurrentDate()} current={183} target={255} /> */}
//             </div>
//         </CardContent>
//     </Card>
// </CardContent>
// </Card> */}
