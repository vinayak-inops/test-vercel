"use client";

import { useEffect } from "react"
import { CheckCircle, XCircle, Clock, ArrowUpIcon as ClockArrowUp, } from "lucide-react"
import { MoreHorizontal, Settings, ArrowUpRight, DollarSign, RefreshCw, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import React, { useState } from "react"
import { Bar, BarChart, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"



// Move the chart data outside component
const chartData1 = [
    { label: "A1", m: 450, f: 300 },
    { label: "A2", m: 380, f: 420 },
    { label: "A3", m: 520, f: 120 },
    { label: "B1", m: 140, f: 550 },
    { label: "B2", m: 600, f: 350 },
    { label: "B3", m: 480, f: 400 },
    { label: "C1", m: 480, f: 400 },
    { label: "C2", m: 480, f: 400 },
    { label: "C3", m: 480, f: 400 },
]

const chartConfig1 = {
    m: {
        label: "Male",
        color: "rgb(59, 130, 246)",
    },
    f: {
        label: "Female",
        color: "rgb(191, 219, 254)",
    },
} satisfies ChartConfig


export default function PresentAbsentLocationSelection({ name }: { name: string }) {
    const [value, setValue] = useState("")
    const [stats, setStats] = useState({ total: 0, present: 0 })
    const [shiftCodes, setShiftCodes] = useState<string[]>([]);
    useEffect(() => {
        fetch("http://192.168.1.11:8000/api/query/attendance/headcount") // calls Next.js API route or proxy
            .then(res => res.json())
            .then(data => setStats(data[0]))
            .catch(err => console.error("Fetch error:", err))
    }, [])

    useEffect(() => {
        fetch("http://192.168.1.11:8000/api/query/attendance/shift")  // replace with your real API
            .then(res => res.json())
            .then(data => {
                console.log("API data:", data);
                const codes = data.flatMap((item: any) =>
                    item.shift?.map((s: any) => s.shiftCode) || []
                );
                setShiftCodes(codes);
                console.log("Extracted shift codes:", codes);
            })
            .catch(err => console.error("Error fetching shift codes:", err));
    }, []);


    console.log(stats);
    console.log(shiftCodes);
    // const {
    //   data,
    //   error,
    //   loading,
    //   refetch
    //   } = useRequest<any[]>({
    //   url: "headcount",
    //   onSuccess: (data) => {
    //   console.log(data);
    //   },
    //   onError: (error) => {
    //   console.error('Error loading organization data:', error);
    //   }
    //   });
    //   console.log("hello");

    const openPopup = (url: string) => {
        window.open(
            url,
            "popup",
            "width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no",
        )
    }

    return (


        <> 
         {/* <p>Total Users: {stats.total}</p>
            <p>Active Users: {stats.present}</p><div>
                <h2>Shift Codes</h2>
                <ul>
                    {shiftCodes.map((code, idx) => (
                        <li key={idx}>{code}</li>
                    ))}
                </ul>
            </div> */}


            <div >
                <main >


                    <div className="p-0 space-y-4 bg-gray-50">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 p-4">

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Present
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}

                                    <Button onClick={() => openPopup("https://www.google.com")} className="flex items-center gap-2 bg-blue-500">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Button>

                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold"> {stats.present}/{stats.total}</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={chartData1}>
                                            <XAxis
                                                dataKey="code"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => {
                                                    return value;
                                                }} />
                                            <Bar
                                                dataKey="m"
                                                stackId="a"
                                                fill="var(--color-m)"
                                                radius={[0, 0, 4, 4]} />
                                            <Bar
                                                dataKey="f"
                                                stackId="a"
                                                fill="var(--color-f)"
                                                radius={[4, 4, 0, 0]} />
                                            <ChartTooltip
                                                content={<ChartTooltipContent
                                                    hideLabel
                                                    className="w-[180px]"
                                                    formatter={(value, name, item, index) => (
                                                        <>
                                                            <div
                                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                                style={{
                                                                    "--color-bg": `var(--color-${name})`,
                                                                } as React.CSSProperties} />
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
                                                            </div>
                                                            {/* Add this after the last item */}
                                                            {index === 1 && (
                                                                <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                                    Total :
                                                                    <span className="font-normal text-muted-foreground">
                                                                        {item.payload.label}
                                                                    </span>
                                                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                        {item.payload.m + item.payload.f}
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        Absent
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1440/2000</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={chartData1}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => {
                                                    return value;
                                                }} />
                                            <Bar
                                                dataKey="m"
                                                stackId="a"
                                                fill="var(--color-m)"
                                                radius={[0, 0, 4, 4]} />
                                            <Bar
                                                dataKey="f"
                                                stackId="a"
                                                fill="var(--color-f)"
                                                radius={[4, 4, 0, 0]} />
                                            <ChartTooltip
                                                content={<ChartTooltipContent
                                                    hideLabel
                                                    className="w-[180px]"
                                                    formatter={(value, name, item, index) => (
                                                        <>
                                                            <div
                                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                                style={{
                                                                    "--color-bg": `var(--color-${name})`,
                                                                } as React.CSSProperties} />
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
                                                            </div>
                                                            {/* Add this after the last item */}
                                                            {index === 1 && (
                                                                <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                                     Total :
                                                                    <span className="font-normal text-muted-foreground">
                                                                        {item.payload.label}
                                                                    </span>
                                                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                        {item.payload.m + item.payload.f}
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>


                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Late
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1440/2000</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={chartData1}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => {
                                                    return value;
                                                }} />
                                            <Bar
                                                dataKey="m"
                                                stackId="a"
                                                fill="var(--color-m)"
                                                radius={[0, 0, 4, 4]} />
                                            <Bar
                                                dataKey="f"
                                                stackId="a"
                                                fill="var(--color-f)"
                                                radius={[4, 4, 0, 0]} />
                                            <ChartTooltip
                                                content={<ChartTooltipContent
                                                    hideLabel
                                                    className="w-[180px]"
                                                    formatter={(value, name, item, index) => (
                                                        <>
                                                            <div
                                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                                style={{
                                                                    "--color-bg": `var(--color-${name})`,
                                                                } as React.CSSProperties} />
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
                                                            </div>
                                                            {/* Add this after the last item */}
                                                            {index === 1 && (
                                                                <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                                    Total :
                                                                    <span className="font-normal text-muted-foreground">
                                                                        {item.payload.label}
                                                                    </span>
                                                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                        {item.payload.m + item.payload.f}
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <ClockArrowUp className="w-5 h-5" />
                                        Early
                                    </CardTitle>
                                    {/* <CardTitle className="text-base font-medium">Present</CardTitle> */}
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">1440/2000</div>
                                    <div className="mt-2 mb-4">
                                        {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                    </div>
                                    <ChartContainer config={chartConfig1}>
                                        <BarChart accessibilityLayer data={chartData1}>
                                            <XAxis
                                                dataKey="label"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                tickFormatter={(value) => {
                                                    return value;
                                                }} />
                                            <Bar
                                                dataKey="m"
                                                stackId="a"
                                                fill="var(--color-m)"
                                                radius={[0, 0, 4, 4]} />
                                            <Bar
                                                dataKey="f"
                                                stackId="a"
                                                fill="var(--color-f)"
                                                radius={[4, 4, 0, 0]} />
                                            <ChartTooltip
                                                content={<ChartTooltipContent
                                                    hideLabel
                                                    className="w-[180px]"
                                                    formatter={(value, name, item, index) => (
                                                        <>
                                                            <div
                                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                                                style={{
                                                                    "--color-bg": `var(--color-${name})`,
                                                                } as React.CSSProperties} />
                                                            {chartConfig1[name as keyof typeof chartConfig1]?.label ||
                                                                name}
                                                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                {value}
                                                                {/* <span className="font-normal text-muted-foreground">
                                                                    {name}
                                                                </span> */}
                                                            </div>
                                                            {/* Add this after the last item */}
                                                            {index === 1 && (
                                                                <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                                                                    Total :
                                                                    <span className="font-normal text-muted-foreground">
                                                                        {item.payload.label}
                                                                    </span>
                                                                    <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                                                        {item.payload.m + item.payload.f}
                                                                        {/* <span className="font-normal text-muted-foreground">
                                                                            {name}
                                                                        </span> */}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )} />}
                                                cursor={false}
                                                defaultIndex={1} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                </main>

            </div></>
    )
}
