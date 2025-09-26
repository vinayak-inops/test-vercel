"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { ThumbsUp, ThumbsDown, MoreHorizontal, Calendar, ChevronDownIcon } from 'lucide-react';
import { Spacer } from './ui/spacer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getColorPalette } from "../lib/chart-utils"

interface DayData {
    day: string;
    value: number;
    color: string;
}

const weekData: DayData[] = [
    { day: 'Sunday', value: 15, color: '' },
    { day: 'Monday', value: 20, color: '' },
    { day: 'Tuesday', value: 25, color: '' },
    { day: 'Wednesday', value: 18, color: '' },
    { day: 'Thursday', value: 22, color: '' },
    { day: 'Friday', value: 35, color: '' },
    { day: 'Saturday', value: 8, color: '' },
];

// Apply minimal colors to the data
const colors = getColorPalette(weekData.length)
weekData.forEach((item, index) => {
    item.color = colors[index]
})

const CircleChart = ({ isSemi, data }: { isSemi: boolean; data: DayData[] }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerX = 120;
    const centerY = isSemi ? 120 : 120;
    const radius = 80;

    // For semi-circle: start from left (-180°) and go to right (0°)
    // For full circle: start from top (-90°) and go full circle
    let currentAngle = isSemi ? 180 : -90;
    const maxAngle = isSemi ? 180 : 360;

    const paths = data.map((item) => {
        const angleSize = (item.value / total) * maxAngle;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angleSize;

        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

        const largeArcFlag = angleSize > 180 ? 1 : 0;

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        currentAngle += angleSize;

        return {
            path: pathData,
            color: item.color,
            day: item.day,
            value: item.value
        };
    });

    return (
        <div className="flex justify-center">
            <svg
                width="240"
                height={isSemi ? "140" : "240"}
                viewBox={isSemi ? "0 40 240 140" : "0 0 240 240"}
                className="transition-all duration-500 ease-in-out"
            >
                {paths.map((segment, index) => (
                    <path
                        key={index}
                        d={segment.path}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="2"
                        className="transition-all duration-500 ease-in-out hover:opacity-80 cursor-pointer"
                    />
                ))}

                {/* Center circle for full chart */}
                {!isSemi && (
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r="25"
                        fill="white"
                        className="transition-all duration-500 ease-in-out"
                    />
                )}
            </svg>
        </div>
    );
};

const Legend = ({ data }: { data: DayData[] }) => {
    return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm justify-center">
            {data.map((item) => (
                <div key={item.day} className="flex items-center gap-1.5">
                    <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground whitespace-nowrap">{item.day}</span>
                </div>
            ))}
        </div>
    );
};

export default function InsightsChart() {
    const [isSemi, setIsSemi] = useState(true);
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    const bestDay = weekData.reduce((max, day) => day.value > max.value ? day : max);
    const worstDay = weekData.reduce((min, day) => day.value < min.value ? day : min);

    return (
        <Card className="w-full ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <h2 className="text-xl font-bold">Insights</h2>
                    <div className="text-gray-600">
                        <div>November 22
                            - November 29</div>
                    </div>
                </div>
                {/* <p className="text-sm text-gray-500">November 22 - November 29</p> */}
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-1">
                        <Button
                            variant={!isSemi ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsSemi(false)}
                            className="text-xs h-7 px-2"
                        >
                            Semi
                        </Button>
                        {/* <span className="text-gray-400">/</span> */}
                        <Button
                            variant={isSemi ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsSemi(true)}
                            className="text-xs h-7 px-2"
                        >
                            Full Data
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <Spacer />
                <Legend data={weekData} />



                <CircleChart isSemi={!isSemi} data={weekData} />

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <ThumbsUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Best Day of the Week</p>
                                <p className="text-sm text-gray-600">{bestDay.day}</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {bestDay.value}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <ThumbsDown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Worst Day of the Week</p>
                                <p className="text-sm text-gray-600">{worstDay.day}</p>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            {worstDay.value}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}