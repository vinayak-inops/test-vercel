"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Button } from "@repo/ui/components/ui/button"
import { Cloud, Tag, Monitor, Calculator, MoreHorizontal, ChevronRight, ArrowUpRight } from "lucide-react"
import { ExpensesChart } from "./expenses-chart"
import { Avatar } from "@repo/ui/components/ui/avatar"

export function ExpensesDashboard() {
  const [view, setView] = useState("weekly")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Expenses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses</CardTitle>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 py-2 text-sm text-muted-foreground border-b">November 22 - November 29</div>
          <div className="divide-y">
            <ExpenseItem
              icon={<Cloud className="h-5 w-5 text-sky-500" />}
              title="Cloud Infrastructure"
              amount={30247}
            />
            <ExpenseItem icon={<Tag className="h-5 w-5 text-emerald-500" />} title="General Goods" amount={29550} />
            <ExpenseItem
              icon={<Monitor className="h-5 w-5 text-purple-500" />}
              title="Consumer Electronics"
              amount={16660}
            />
            <ExpenseItem icon={<Calculator className="h-5 w-5 text-amber-500" />} title="Incalculables" amount={5801} />
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Dashboard */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Expenses</CardTitle>
          <Tabs defaultValue="weekly" value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] mb-6">
            <ExpensesChart view={view} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <MetricCard value="23" label="Product Questions" bgColor="bg-red-50" />
            <MetricCard value="54" label="Product Reviews" bgColor="bg-green-50" />
            <MetricCard value="99+" label="Will Shipping Orders" bgColor="bg-yellow-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardContent className="p-4 space-y-4">
                <ProductQuestion
                  avatar="/placeholder.svg?height=40&width=40"
                  product="Black Watch"
                  question="Is the Black Watch product water-resistant?"
                />
                <ProductQuestion
                  avatar="/placeholder.svg?height=40&width=40"
                  product="Blue T-Shirt"
                  question="Can I return or exchange the blue t-shirt if I am not satisfied with it?"
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4 space-y-4">
                <ProductReview
                  avatar="/placeholder.svg?height=40&width=40"
                  product="Blue Band"
                  review="Loved the blue band from this e-commerce site!"
                />
                <ProductReview
                  avatar="/placeholder.svg?height=40&width=40"
                  product="Bamboo Watch"
                  review="I purchased the bamboo watch and I'm really happy with it."
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardContent className="p-4 space-y-4">
                <ShippingOrder avatar="/placeholder.svg?height=40&width=40" product="Black Tshirt" />
                <ShippingOrder avatar="/placeholder.svg?height=40&width=40" product="Black Watch" />
                <ShippingOrder avatar="/placeholder.svg?height=40&width=40" product="Blue T-Shirt" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ExpenseItem({ icon, title, amount }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-medium">${amount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  )
}

function MetricCard({ value, label, bgColor }) {
  return (
    <Card className={`${bgColor} border-none`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value}</span>
          <ArrowUpRight className="h-5 w-5" />
        </div>
        <div className="text-sm">{label}</div>
      </CardContent>
    </Card>
  )
}

function ProductQuestion({ avatar, product, question }) {
  return (
    <div className="flex gap-3">
      <Avatar>
        <img src={avatar || "/placeholder.svg"} alt={product} />
      </Avatar>
      <div className="space-y-1">
        <div className="font-medium text-sm">{product}</div>
        <div className="text-xs text-muted-foreground">{question}</div>
      </div>
    </div>
  )
}

function ProductReview({ avatar, product, review }) {
  return (
    <div className="flex gap-3">
      <Avatar>
        <img src={avatar || "/placeholder.svg"} alt={product} />
      </Avatar>
      <div className="space-y-1">
        <div className="font-medium text-sm">{product}</div>
        <div className="text-xs text-muted-foreground">{review}</div>
      </div>
    </div>
  )
}

function ShippingOrder({ avatar, product }) {
  return (
    <div className="flex gap-3">
      <Avatar>
        <img src={avatar || "/placeholder.svg"} alt={product} />
      </Avatar>
      <div className="space-y-1">
        <div className="font-medium text-sm">{product}</div>
        <div className="text-xs text-muted-foreground">Last Shipping Date</div>
      </div>
    </div>
  )
}
