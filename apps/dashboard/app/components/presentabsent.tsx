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
    const [stats, setStats] = useState({ total: 0, present: 0 })
    const [shiftCodes, setShiftCodes] = useState<string[]>([]);
   
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQeUt3ZW1kT1RPeVFnLTR0TjRHT1lBdFhMTEl1dmNGd3hGWTJFY29IQzRJIn0.eyJleHAiOjE3NTI5OTg3MTQsImlhdCI6MTc1Mjk5ODQxNCwianRpIjoidHJydGNjOjYzMmVlYmQ0LTFlNDktZGJjNS0yNGY0LWVmNThlMmVhZTY2MiIsImlzcyI6Imh0dHA6Ly8xMjIuMTY2LjI0NS45Nzo4MDgwL3JlYWxtcy9pbm9wcyIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJiNTRiN2UxZS0xMzY3LTQwZWItYjhmZS02ODMxY2ZjNTMzY2IiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJnYXRld2F5LWNsaWVudCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtaW5vcHMiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsImNsaWVudEhvc3QiOiIxNzIuMjUuMC4xIiwiYWRkcmVzcyI6e30sImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZ3JvdXBzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1pbm9wcyIsInVtYV9hdXRob3JpemF0aW9uIl0sInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1nYXRld2F5LWNsaWVudCIsImNsaWVudEFkZHJlc3MiOiIxNzIuMjUuMC4xIiwiY2xpZW50X2lkIjoiZ2F0ZXdheS1jbGllbnQifQ.U7_GJjixFATa-NcAR6XVdtv7TRwZjcgLBCxPvdKNT8X5rpgMRd5vkYKCXKzoYxox5OjcuPsfqdIlBCN3WObwkA9HhvuxsAqt84qZ6ZLVycyUa6NzQcHgTlrGviOeo9WxuEIjzqktkO5WzTznE_BTcPjvFpvd8lOMa_jbohgWoWncNBdWlteUR5C19i2BxUUzlMwF8ZH7hxgD7MU0TjJphSzJd6cuBKRhmHm75JXr3FzOZUQZYaA15Oc102HFiybdkPwYzVDbTiui9gt5t-ZDXTJ6sOr2449sm7KLbYRGA-pwqI9CxWFxe9va8jeWoE_c94gVVYTyj09_57CXgfW30w";
    useEffect(() => {
        fetch("http://192.168.88.100:8000/api/query/attendance/headcount", {
           //  fetch("http://122.166.245.97:8000/api/query/attendance/headcount", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                credentials: "include",
            },
            mode: "cors",
        }) // calls Next.js API route or proxy
            .then(res => res.json())
            .then(data => setStats(data[0]))
            .catch(err => console.error("Fetch error:", err))
    }, [])

    useEffect(() => {
       // fetch("http://192.168.71.20:8000/api/query/attendance/shift", {
             fetch("http://122.166.245.97:8000/api/query/attendance/shift", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                credentials: "include",
            },
            mode: "cors",
        }) // replace with your real API
            .then(res => res.json())
            .then(data => {
                // console.log("API data:", data);
                // const labels = data.flatMap((item: any) =>
                //     item.shift?.map((s: any) => s.shiftCode) || []
                // );
                console.log("API data:", data);
                const labels = data.flatMap((item: any) => {
                    const shift = item.shift;
    
                    // Ensure shift is an array before mapping
                    if (Array.isArray(shift)) {
                        return shift.map((s: any) => s.shiftCode);
                    } else if (typeof shift === "object" && shift !== null) {
                        // If shift is a single object, not an array
                        return [shift.shiftCode];
                    }
                    // If shift is null/undefined or not usable
                    return [];
                });
                setShiftCodes(labels);
                console.log("Extracted shift codes:", labels);
            })
            .catch(err => console.error("Error fetching shift codes:", err));
    }, []);


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
                                    <BarChart accessibilityLayer data={chartData2}>
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
                </div>

            </main>

        </div>
    )
}
