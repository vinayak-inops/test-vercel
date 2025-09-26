"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Download, Users, UserCheck, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Input } from "@repo/ui/components/ui/input"
import ValueFilterSection from "./value-filter-section"
import { fetchDynamicQuery } from '@repo/ui/hooks/api/dynamic-graphql'

// GraphQL query for fetching all employees
const FETCH_ALL_EMPLOYEES_QUERY = `
  query FetchAllEmployees {
    fetchAllEmployees(tenantCode: "Midhani", collection: "contract_employee") {
      _id
      employeeID
      firstName
      middleName
      lastName
      dateOfJoining
      emailID
    }
  }
`

// Interface for employee data from GraphQL
interface Employee {
  _id: string
  employeeID: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfJoining?: string
  emailID?: string
}

// Static employees data (fallback)
const staticEmployees = [
  {
    id: "EMP-2022-1547",
    name: "John Michael Smith",
    title: "Senior Software Engineer",
    joinDate: "March 15, 2022",
    status: "Active",
    avatar: "JS",
  },
  {
    id: "EMP-2022-1823",
    name: "Sarah Johnson",
    title: "Product Manager",
    joinDate: "January 8, 2022",
    status: "Active",
    avatar: "SJ",
  },
  {
    id: "EMP-2023-0234",
    name: "David Chen",
    title: "UX Designer",
    joinDate: "June 12, 2023",
    status: "Active",
    avatar: "DC",
  },
  {
    id: "EMP-2021-0891",
    name: "Emily Rodriguez",
    title: "Marketing Specialist",
    joinDate: "September 3, 2021",
    status: "Active",
    avatar: "ER",
  },
  {
    id: "EMP-2023-0445",
    name: "Michael Thompson",
    title: "Data Analyst",
    joinDate: "April 20, 2023",
    status: "On Leave",
    avatar: "MT",
  },
  {
    id: "EMP-2022-1156",
    name: "Lisa Wang",
    title: "HR Manager",
    joinDate: "November 14, 2022",
    status: "Active",
    avatar: "LW",
  },
]

const stats = [
  { title: "Total Employees", value: "156", icon: Users, color: "blue" },
  { title: "Active Employees", value: "142", icon: UserCheck, color: "green" },
  { title: "On Leave", value: "8", icon: Clock, color: "yellow" },
  { title: "New Hires (30d)", value: "12", icon: TrendingUp, color: "purple" },
]

export default function Component() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch employees using GraphQL
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const employeeFields = {
        fields: [
          '_id',
          'organizationCode',
          'contractorCode',
          'tenantCode',
          'firstName',
          'middleName',
          'lastName'
        ]
      };

      const result = await fetchDynamicQuery(
        employeeFields,
        'contract_employee',
        'FetchAllEmployees',
        'fetchAllEmployees',
        {
          collection: 'contract_employee',
          tenantCode: 'Midhani'
        }
      )

      console.log("GraphQL Query Result2:", result.data)
      
      if (result?.data && Array.isArray(result.data)) {
        const fetchedEmployees = result.data
        console.log("Fetched Employees:", fetchedEmployees)
      } else {
        console.error("No employee data found in response:", result)
        setError("No employee data found")
      }
    } catch (err) {
      console.error("Error fetching employees2:", err)
      setError("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  // Fetch employees when component mounts
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Transform GraphQL data to match the component's expected format
  const transformedEmployees = employees.map(emp => ({
    id: emp.employeeID,
    name: `${emp.firstName} ${emp.middleName || ''} ${emp.lastName}`.trim(),
    title: "Employee", // You can add a title field to your GraphQL query if needed
    joinDate: emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : "N/A",
    status: "Active", // You can add a status field to your GraphQL query if needed
    avatar: `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`,
    email: emp.emailID
  }))

  // Use transformed data or fallback to static data
  const displayEmployees = transformedEmployees.length > 0 ? transformedEmployees : staticEmployees

  return (
    <div className="px-7">
      <div className="py-0">
        {/* Search and Filters */}
        <Card className="border-0 shadow-blue-50 mb-0">
          <div className="py-6 px-6">
            <ValueFilterSection />
          </div>
          <CardContent>
            {/* Loading and Error States */}
            {loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employees...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">Error: {error}</p>
                <Button onClick={fetchEmployees} className="bg-blue-600 hover:bg-blue-700">
                  Retry
                </Button>
              </div>
            )}

            {/* Employee Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEmployees.map((employee) => (
                  <Card
                    key={employee.id}
                    className="border-0 bg-white shadow-md shadow-blue-50 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 cursor-pointer"
                  >
                    <CardContent className="p-6">
                      {/* Employee Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {employee.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{employee.name}</h3>
                            <p className="text-blue-600 text-xs font-medium">{employee.title}</p>
                          </div>
                        </div>
                        <Badge
                          className={`text-xs ${
                            employee.status === "Active"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {employee.status}
                        </Badge>
                      </div>

                      {/* Employee Details */}
                      <div className="space-y-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-medium">Employee ID</p>
                          <p className="text-sm font-semibold text-gray-900">{employee.id}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          Joined {employee.joinDate}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button size="sm" className="text-white flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8">
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 text-xs h-8 bg-transparent"
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
