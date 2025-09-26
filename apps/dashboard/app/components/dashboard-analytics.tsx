"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table"
import Image from "next/image"

interface TopSearch {
  name: string
  conversionRate: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
}

export default function DashboardAnalytics() {
  const [currentPage, setCurrentPage] = useState(1)

  const topSearches: TopSearch[] = [
    { name: "Mat Orange Case", conversionRate: 82 },
    { name: "Space T-Shirt", conversionRate: 78 },
    { name: "Orange Black Hoodie", conversionRate: 61 },
    { name: "Wonders Notebook", conversionRate: 48 },
    { name: "Robots T-Shirt", conversionRate: 34 },
    { name: "Green Portal Sticker", conversionRate: 11 },
  ]

  const products: Product[] = [
    {
      id: "1",
      name: "Bamboo Watch",
      category: "Accessories",
      price: 65.0,
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "2",
      name: "Black Watch",
      category: "Accessories",
      price: 72.0,
      image: "/placeholder.svg?height=60&width=60",
    },
    { id: "3", name: "Blue Band", category: "Fitness", price: 79.0, image: "/placeholder.svg?height=60&width=60" },
    { id: "4", name: "Blue T-Shirt", category: "Clothing", price: 29.0, image: "/placeholder.svg?height=60&width=60" },
  ]

  const getConversionRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-500"
    if (rate >= 50) return "text-orange-500"
    if (rate >= 30) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="w-full  ">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Top Searches</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">More options</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="font-medium">{search.name}</span>
                  <span className={`${getConversionRateColor(search.conversionRate)} font-medium`}>
                    {search.conversionRate}% CONV RATE
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead className="cursor-pointer">
                    Name <span className="ml-1">↕</span>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    Category <span className="ml-1">↕</span>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    Price <span className="ml-1">↕</span>
                  </TableHead>
                  <TableHead>View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">View {product.name}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-center space-x-2 py-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>

              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                disabled={currentPage === 5}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentPage(5)} disabled={currentPage === 5}>
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
