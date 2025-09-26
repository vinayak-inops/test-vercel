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
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";



// Move the chart data outside component
const chartData1 = [
    { m: 450, f: 300 },
    { m: 380, f: 420 },
    { m: 520, f: 120 },
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


export default function PresentAbsent() {
    const [value, setValue] = useState("")
    const { token, loading: tokenLoading, error: tokenError } = useAuthToken();

    console.log("token tokentokentokentoken", token);

    // Headcount data using useRequest hook
    const {
        data: headcountData,
        loading: loadingHeadcount,
        error: headcountError
    } = useRequest<any[]>({
        url: 'attendance/headcount',
        method: 'GET',
        onSuccess: (data) => {
            console.log('Headcount data:', data);
        },
        onError: (error) => {
            console.error('Error fetching headcount data:', error);
        },
        dependencies: [token]
    });

    // Shift data using useRequest hook
    const {
        data: shiftData,
        loading: loadingShift,
        error: shiftError
    } = useRequest<any[]>({
        url: 'attendance/shift',
        method: 'GET',
        onSuccess: (data) => {
            console.log('Shift data:', data);
        },
        onError: (error) => {
            console.error('Error fetching shift data:', error);
        },
        dependencies: [token]
    });

    // Extract stats from headcount data
    const stats = headcountData?.[0] || { total: 0, present: 0 };

    // Extract shift codes from shift data
    const shiftCodes = shiftData ? shiftData.flatMap((item: any) =>
        item.shift?.map((s: any) => s.shiftCode) || []
    ) : [];

    // Combined loading state
    const loading = loadingHeadcount || loadingShift;


    console.log(stats);
    console.log(shiftCodes);

    const chartData2 = shiftCodes.map((code, index) => ({
        label: code,//.replace(/^A0*/, 'A'), // Convert A001 → A1, A002 → A2, etc.
        ...chartData1[index]
    }));

    console.log(chartData2);
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
        <div>
            <main>
                <div className="p-0 space-y-4 bg-gray-50">
                    {/* Show loading state when token is loading */}
                    {tokenLoading && (
                        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 m-4">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-blue-600 font-medium">Loading authentication...</span>
                            </div>
                        </div>
                    )}

                    {/* Show error state if token error */}
                    {tokenError && (
                        <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-200 m-4">
                            <span className="text-red-600 font-medium">Authentication error: {tokenError.message}</span>
                        </div>
                    )}

                    {/* Only show content if token is available and not loading */}
                    {!tokenLoading && token && (
                        <>
                            {loading && (
                                <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg border border-yellow-200 m-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                        <span className="text-yellow-600 font-medium">Loading attendance data...</span>
                                    </div>
                                </div>
                            )}
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
                                <div className="text-2xl font-bold">
                                    {loading ? "Loading..." : `${stats.present}/${stats.total}`}
                                </div>
                                <div className="mt-2 mb-4">
                                    {/* <div className="inline-flex items-center rounded-md bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
<span className="ml-1"> Total 2000</span>
</div> */}
                                </div>
                                <ChartContainer config={chartConfig1}>
                                    <BarChart accessibilityLayer data={loading ? [] : chartData2}>
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
                                            radius={[0, 0, 4, 4]}
                                        />
                                        <Bar
                                            dataKey="f"
                                            stackId="a"
                                            fill="var(--color-f)"
                                            radius={[4, 4, 0, 0]}
                                        />
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
                        </>
                    )}

                </div>

            </main>

        </div>
    )
}
