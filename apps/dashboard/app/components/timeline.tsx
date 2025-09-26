"use client"

import { useState } from "react"
import {
  ShoppingCart,
  Settings,
  CheckCircle,
  Clipboard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
} from "lucide-react"

import Image from "next/image"
import { Card, CardContent} from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"

// Sample product data
const products = [
  { id: 1, name: "Bamboo Watch", category: "Accessories", price: 65.0, image: "/placeholder.svg?height=50&width=50" },
  { id: 2, name: "Black Watch", category: "Accessories", price: 72.0, image: "/placeholder.svg?height=50&width=50" },
  { id: 3, name: "Blue Band", category: "Fitness", price: 79.0, image: "/placeholder.svg?height=50&width=50" },
  { id: 4, name: "Blue T-Shirt", category: "Clothing", price: 29.0, image: "/placeholder.svg?height=50&width=50" },
  { id: 5, name: "Bracelet", category: "Accessories", price: 15.0, image: "/placeholder.svg?height=50&width=50" },
  { id: 6, name: "Brown Purse", category: "Accessories", price: 120.0, image: "/placeholder.svg?height=50&width=50" },
  {
    id: 7,
    name: "Chakra Bracelet",
    category: "Accessories",
    price: 32.0,
    image: "/placeholder.svg?height=50&width=50",
  },
  {
    id: 8,
    name: "Galaxy Earrings",
    category: "Accessories",
    price: 34.0,
    image: "/placeholder.svg?height=50&width=50",
  },
]

// Timeline data
const timelineEvents = [
  {
    id: 1,
    title: "Ordered",
    date: "15/10/2020 10:30",
    description: "Richard Jones (C8012) has ordered a blue t-shirt for $79.",
    icon: <ShoppingCart className="h-5 w-5 text-white" />,
    iconBg: "bg-red-500",
  },
  {
    id: 2,
    title: "Processing",
    date: "15/10/2020 14:00",
    description: "Order #99207 has processed succesfully.",
    icon: <Settings className="h-5 w-5 text-white" />,
    iconBg: "bg-orange-500",
  },
  {
    id: 3,
    title: "Shipped",
    date: "15/10/2020 16:15",
    description: "Order #99207 has shipped with shipping code 2222302090.",
    icon: <CheckCircle className="h-5 w-5 text-white" />,
    iconBg: "bg-purple-500",
  },
  {
    id: 4,
    title: "Delivered",
    date: "16/10/2020 10:00",
    description: "Richard Jones (C8012) has recieved his blue t-shirt.",
    icon: <Clipboard className="h-5 w-5 text-white" />,
    iconBg: "bg-teal-500",
  },
]

type SortDirection = "asc" | "desc" | null
type SortField = "name" | "category" | "price" | null

export default function Timeline() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const itemsPerPage = 7
  const totalPages = Math.ceil(products.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc")
      if (sortDirection === "desc") {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    if (sortField === "price") {
      return sortDirection === "asc" ? a.price - b.price : b.price - a.price
    }

    const aValue = a[sortField].toLowerCase()
    const bValue = b[sortField].toLowerCase()

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timeline Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Timeline</h2>
          <button className="text-gray-500">
            <span className="sr-only">More options</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
              <div className="w-1 h-1 rounded-full bg-gray-500"></div>
            </div>
          </button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="relative pl-8 pr-4 py-4">
              {/* Timeline line */}
              <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {/* Timeline events */}
              <div className="space-y-8">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {/* Icon */}
                    <div
                      className={`absolute left-0 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full ${event.iconBg} z-10`}
                    >
                      {event.icon}
                    </div>

                    {/* Content */}
                    <div className="ml-6">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table Section */}
      <div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Image</th>
                    <th className="text-left p-4">
                      <button className="flex items-center space-x-1" onClick={() => handleSort("name")}>
                        <span>Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button className="flex items-center space-x-1" onClick={() => handleSort("category")}>
                        <span>Category</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button className="flex items-center space-x-1" onClick={() => handleSort("price")}>
                        <span>Price</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="text-center p-4">View</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">
                        <div className="w-12 h-12 relative">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md border"
                          />
                        </div>
                      </td>
                      <td className="p-4">{product.name}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">${product.price.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <Button size="icon" variant="default" className="bg-blue-600 hover:bg-blue-700">
                          <Search className="h-4 w-4" />
                          <span className="sr-only">View {product.name}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First page</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="icon"
                      className={`w-8 h-8 ${currentPage === page ? "bg-gray-200 text-gray-800" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last page</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
