"use client"

import { useState, useEffect } from "react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Building2, Hash, FileText, MapPin, Mail, Phone, Globe, Edit3, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import OrganizationEditForm from "./organization-edit-form"

interface OrganizationData {
  organizationName: string
  organizationCode: string
  addressLine1: string | null
  addressLine2: string | null
  city: string
  pinCode: string
  logoFileName: string
  description: string
  emailId: string
  contactPersonContactNumber: string
  registrationNo: string
  tenantCode: string
  isActive: number
  firstMonthOfFinancialYear: number
}

// Default data structure (will be replaced by API data)
const defaultOrganizationData: OrganizationData = {
  organizationName: "",
  organizationCode: "",
  addressLine1: null,
  addressLine2: null,
  city: "",
  pinCode: "",
  logoFileName: "",
  description: "",
  emailId: "",
  contactPersonContactNumber: "",
  registrationNo: "",
  tenantCode: "",
  isActive: 1,
  firstMonthOfFinancialYear: 1
}

export default function OrganizationInfo() {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [currentData, setCurrentData] = useState<OrganizationData>(defaultOrganizationData)

  // Fetch organization data from API
  const {
    data: organizationResponse,
    loading: isLoading,
    error: organizationError,
    refetch: fetchOrganization
  } = useRequest<any>({
    url: 'organization/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ],
    onSuccess: (data) => {
      console.log("Organization data fetched:", data);
      if (data && data.length > 0) {
        // Transform API response to match our interface
        const orgData = data[0];
        setCurrentData(orgData);
      }
    },
    onError: (error) => {
      console.error("Error fetching organization data:", error);
    },
    dependencies: []
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchOrganization();
  }, []);

  const handleEdit = () => {
    // If we have data, use it; otherwise use empty values
    const formData = currentData.organizationName ? currentData : {
      organizationName: "",
      organizationCode: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      pinCode: "",
      logoFileName: "",
      description: "",
      emailId: "",
      contactPersonContactNumber: "",
      registrationNo: "",
      tenantCode: "",
      isActive: 1,
      firstMonthOfFinancialYear: 1
    }
    setIsEditFormOpen(true)
  }

  const handleEditClose = () => {
    setIsEditFormOpen(false)
  }

  const handleEditSubmit = (updatedData: OrganizationData) => {
    setCurrentData(updatedData)
    console.log("Organization updated:", updatedData)
    // Optionally refetch data after update
    // fetchOrganization();
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Organization Information</h2>
          <p className="text-gray-500">Please wait while we fetch the data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (organizationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Data</h2>
          <p className="text-gray-500 mb-4">Failed to load organization information</p>
          <Button 
            onClick={fetchOrganization}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="p-6 px-12 space-y-8">
        {/* Header Section with Logo */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Logo Display */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <img
                    src={`/images/logo.jpg`}
                    alt="Organization Logo"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* Organization Header Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">{currentData.organizationName}</h1>
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <span className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Hash className="h-4 w-4" />
                    {currentData.organizationCode}
                  </span>
                  <span className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Building2 className="h-4 w-4" />
                    {currentData.tenantCode}
                  </span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 shadow-sm">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    {currentData.isActive === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Building2 className="h-4 w-4" />
                    Organization Name
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.organizationName}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Hash className="h-4 w-4" />
                    Organization Code
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.organizationCode}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <FileText className="h-4 w-4" />
                  Registration Number
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="font-mono text-gray-800 font-medium">{currentData.registrationNo}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-blue-600">Description</div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300 shadow-sm">
                  <p className="text-gray-700 leading-relaxed">{currentData.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Mail className="h-4 w-4" />
                    Email ID
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.emailId}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <Phone className="h-4 w-4" />
                    Contact Number
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.contactPersonContactNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <MapPin className="h-4 w-4" />
                  Address Line 1
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-800">{currentData.addressLine1 || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <MapPin className="h-4 w-4" />
                  Address Line 2
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-800">{currentData.addressLine2 || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <MapPin className="h-4 w-4" />
                    City
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.city}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <MapPin className="h-4 w-4" />
                    Pin Code
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <p className="font-semibold text-gray-800">{currentData.pinCode}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-md">
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                  System Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Tenant Code:</span>
                    <span className="font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
                      {currentData.tenantCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Status:</span>
                    <span className="font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
                      {currentData.isActive === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Financial Year Start:</span>
                    <span className="font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
                      Month {currentData.firstMonthOfFinancialYear}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Popup */}
      <OrganizationEditForm
        isOpen={isEditFormOpen}
        onClose={handleEditClose}
        initialValues={currentData.organizationName ? currentData : {
          organizationName: "",
          organizationCode: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          pinCode: "",
          logoFileName: "",
          description: "",
          emailId: "",
          contactPersonContactNumber: "",
          registrationNo: "",
          tenantCode: "",
          isActive: 1,
          firstMonthOfFinancialYear: 1
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
