"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Calendar, User, Search, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper"
import { fetchDynamicQuery } from '@repo/ui/hooks/api/dynamic-graphql';

const validationSchema = yup.object({
  employeeId: yup.string().required("Employee is required"),
  month: yup.string().required("Month is required"),
  year: yup.string().required("Year is required"),
})

type FormData = yup.InferType<typeof validationSchema>

interface MusterSearchPopupProps {
  isOpen: boolean
  onClose: () => void
}

// GraphQL query for fetching all employees
const FETCH_ALL_EMPLOYEES_QUERY = `
  query FetchAllEmployees {
    fetchAllEmployees(tenantCode: "Midhani", collection: "contract_employee") {
      _id
      organizationCode
      contractorCode
      tenantCode
      employeeID
      firstName
      middleName
      lastName
    }
  }
`

// Interface for employee data from GraphQL
interface Employee {
  _id: string
  organizationCode: string
  contractorCode: string
  tenantCode: string
  employeeID: string
  firstName: string
  middleName?: string
  lastName: string
}

export default function MusterSearchPopup({ isOpen, onClose }: MusterSearchPopupProps) {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      employeeId: "",
      month: "",
      year: "",
    },
    mode: "onChange",
  })

  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Employee[]>([])

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
          'employeeID',
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

      
      if (result?.data && Array.isArray(result.data)) {
        const fetchedEmployees = result.data
        setEmployees(fetchedEmployees)
        setSearchResults(fetchedEmployees)
      } else {
        console.error("No employee data found in response:", result)
        setError("No employee data found")
      }
    } catch (err) {
      setError("Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  // Fetch employees when component mounts or popup opens
  useEffect(() => {
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      reset({ employeeId: "", month: "", year: "" })
      clearErrors()
      setSearch("")
      setSearchResults(employees)
    }
  }, [isOpen, reset, clearErrors, employees])

  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults(employees)
    } else {
      setSearchResults(
        employees.filter((emp) => {
          const fullName = `${emp.firstName} ${emp.middleName || ''} ${emp.lastName}`.toLowerCase()
          const employeeId = (emp.employeeID || '').toLowerCase()
          const searchTerm = search.toLowerCase()
          
          return fullName.includes(searchTerm) || employeeId.includes(searchTerm)
        })
      )
    }
  }, [search, employees])

  const onFormSubmit = (data: FormData) => {
    // Create query parameters from form data
    const queryParams = new URLSearchParams({
      employeeId: data.employeeId,
      month: data.month,
      year: data.year
    })
    
    router.push(`/punch/individual-punch/calendar/information?${queryParams.toString()}`)
    onClose()
  }

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </div>
    )
  }

  // Month and year options
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => `${currentYear - i}`)

  return (
    <MiniPopupWrapper
      open={isOpen}
      setOpen={open => { if (!open) onClose(); }}
      content={undefined}
    >
      {/* Custom Header matching AttendancePopup */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Muster Search Details
          </h2>
          <p className="text-blue-100 text-sm mt-1">Search muster records by employee, month, and year</p>
        </div>
        <button
          onClick={() => {
            onClose()
            router.push('/punch')
          }}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Employee Search Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Employee <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={loading ? "Loading employees..." : "Search employee by name or ID"}
              disabled={loading}
              className={`w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400 ${errors.employeeId ? "border-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400" : ""} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
              tabIndex={-1}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
          {/* Dropdown results */}
          {search && searchResults.length > 0 && !loading && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {searchResults.map(emp => (
                <div
                  key={emp._id}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                  onClick={() => {
                    setValue("employeeId", emp.employeeID)
                    setSearch(`${emp.firstName} ${emp.middleName || ''} ${emp.lastName}`.trim())
                  }}
                >
                  {emp.firstName} {emp.middleName || ''} {emp.lastName} <span className="text-gray-400">({emp.employeeID})</span>
                </div>
              ))}
            </div>
          )}
          <input type="hidden" {...register("employeeId")} />
          <ErrorMessage error={errors.employeeId?.message} />
          {error && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </div>
          )}
        </div>
        {/* Month and Year Select */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Month <span className="text-red-500">*</span></label>
            <select
              {...register("month")}
              className={`w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400 ${errors.month ? "border-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400" : ""}`}
            >
              <option value="">Select month</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ErrorMessage error={errors.month?.message} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Year <span className="text-red-500">*</span></label>
            <select
              {...register("year")}
              className={`w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400 ${errors.year ? "border-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400" : ""}`}
            >
              <option value="">Select year</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ErrorMessage error={errors.year?.message} />
          </div>
        </div>
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 font-medium text-sm">
              <AlertCircle className="h-4 w-4" />
              Please fix the errors above
            </div>
          </div>
        )}
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => { router.push('/punch'); }}
            disabled={isSubmitting}
            className="px-4 py-2 h-9 rounded-md font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 h-9 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? "Loading..." : "Submit"}
          </button>
        </div>
      </form>
    </MiniPopupWrapper>
  )
} 