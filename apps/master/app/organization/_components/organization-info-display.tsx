"use client"

import type React from "react"
import { useState } from "react"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  FileText,
  Globe,
  User,
  Info,
  CheckCircle2,
  Edit3,
  Sparkles,
  Calendar,
  Users,
  Shield,
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/components/ui/tooltip"

interface Country {
  countryCode: string
  countryName: string
}

interface OrganizationData {
  countries: Country[]
  logoFileName: string
  description: string
  emailId: string
  contactPersonContactNumber: string
  registrationNo: string
  tenantCode: string
  organizationName: string
  organizationCode: string
  addressLine1: string | null
  addressLine2: string | null
  city: string
  pinCode: string
  state?: string
  country?: string
  status?: string
  createdAt?: string
  employeeCount?: number
}

// Sample data based on your structure
const organizationData: OrganizationData = {
  countries: [
    { countryCode: "IN", countryName: "India" },
    { countryCode: "US", countryName: "United States" },
    { countryCode: "DE", countryName: "Germany" },
    { countryCode: "BR", countryName: "Brazil" },
    { countryCode: "ZA", countryName: "South Africa" },
    { countryCode: "JP", countryName: "Japan" },
    { countryCode: "FR", countryName: "France" },
    { countryCode: "RU", countryName: "Russia" },
    { countryCode: "AU", countryName: "Australia" },
    { countryCode: "CN", countryName: "China" },
  ],
  logoFileName: "bb31b165-26ec-4ff0-8580-dfb7520beb37.png",
  description:
    "Leading automotive manufacturer specializing in commercial vehicles, buses, and defense systems. Ashok Leyland is committed to providing innovative transportation solutions that drive progress and connectivity across global markets.",
  emailId: "d@d.com",
  contactPersonContactNumber: "3456564",
  registrationNo: "3534646457457",
  tenantCode: "tenant1",
  organizationName: "Ashok Leyland Limited New",
  organizationCode: "ALL",
  addressLine1: "123 Business Street",
  addressLine2: "Suite 100, Floor 2",
  city: "Hosur",
  pinCode: "411029",
  state: "Tamil Nadu",
  country: "India",
  status: "active",
  createdAt: "2024-01-15",
  employeeCount: 2500,
}

export default function OrganizationInfoDisplay() {
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    console.log("Edit organization information")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-3 w-3" />
      case "inactive":
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />
      case "pending":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />
      case "suspended":
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 p-3 mb-6 shadow-lg">
            <div className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-inner">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Organization Information
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Complete overview of your organization's details and configuration
          </p>
        </div>

        {/* Organization Header Card */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8 rounded-3xl">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Logo Display */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <Building2 className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Organization Header Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                      {organizationData.organizationName}
                    </h2>
                    <p className="text-blue-100 text-lg">{organizationData.description.substring(0, 100)}...</p>
                  </div>
                  <Button
                    onClick={handleEdit}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm rounded-2xl"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <span className="flex items-center gap-2 bg-white/15 px-3 py-2 rounded-full backdrop-blur-sm">
                    <Hash className="h-4 w-4" />
                    {organizationData.organizationCode}
                  </span>
                  <span className="flex items-center gap-2 bg-white/15 px-3 py-2 rounded-full backdrop-blur-sm">
                    <User className="h-4 w-4" />
                    {organizationData.tenantCode}
                  </span>
                  <Badge className={`${getStatusColor(organizationData.status || 'active')} border`}>
                    {getStatusIcon(organizationData.status || 'active')}
                    <span className="ml-2 capitalize">{organizationData.status || 'active'}</span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Information */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
            <CardContent className="p-0">
              <div className="space-y-8 p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      Basic Information
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </h3>
                    <p className="text-slate-600 mt-1">Core organization details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Organization Name
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-slate-400 cursor-help hover:text-blue-500 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">Official registered name of the organization</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <span className="font-semibold text-slate-800">{organizationData.organizationName}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Organization Code
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <Hash className="h-5 w-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-slate-800">{organizationData.organizationCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Registration Number
                    </Label>
                    <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                      <FileText className="h-5 w-5 text-slate-400 mr-3" />
                      <span className="font-mono font-semibold text-slate-800">{organizationData.registrationNo}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Description</Label>
                    <div className="min-h-[100px] rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm p-4">
                      <p className="text-slate-700 leading-relaxed">{organizationData.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <div className="h-2 w-full bg-gradient-to-r from-green-500 via-blue-500 to-cyan-500"></div>
            <CardContent className="p-0">
              <div className="space-y-8 p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-green-50/30 to-blue-50/30">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg">
                    <Hash className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">System Information</h3>
                    <p className="text-slate-600 mt-1">Technical and system details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Organization Code
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <Hash className="h-5 w-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-slate-800">{organizationData.organizationCode}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Tenant Code
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <User className="h-5 w-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-slate-800">{organizationData.tenantCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">Status</Label>
                    <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                      <Badge className={`${getStatusColor(organizationData.status || 'active')} border`}>
                        {getStatusIcon(organizationData.status || 'active')}
                        <span className="ml-2 capitalize">{organizationData.status || 'active'}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Created Date
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-slate-800">{organizationData.createdAt || '2024-01-15'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        Employee Count
                      </Label>
                      <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                        <Users className="h-5 w-5 text-slate-400 mr-3" />
                        <span className="font-semibold text-slate-800">{organizationData.employeeCount?.toLocaleString() || '2,500'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl mb-8">
          <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          <CardContent className="p-0">
            <div className="space-y-8 p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Contact Information</h3>
                  <p className="text-slate-600 mt-1">How to reach the organization</p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Email Address
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <Mail className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="font-semibold text-slate-800">{organizationData.emailId}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Contact Number
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <Phone className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="font-semibold text-slate-800">{organizationData.contactPersonContactNumber}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Location
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="font-semibold text-slate-800">
                      {organizationData.city}, {organizationData.pinCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl mb-8">
          <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
          <CardContent className="p-0">
            <div className="space-y-8 p-8 md:p-10 border-b border-slate-100 bg-gradient-to-r from-orange-50/30 to-red-50/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Address Information</h3>
                  <p className="text-slate-600 mt-1">Physical location details</p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Street Address
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="font-semibold text-slate-800">{organizationData.addressLine1 || '123 Business Street'}</span>
                  </div>
                </div>

                {organizationData.addressLine2 && (
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Apartment, Suite, Unit
                    </Label>
                    <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                      <span className="font-semibold text-slate-800">{organizationData.addressLine2}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    City
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <span className="font-semibold text-slate-800">{organizationData.city}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Pincode
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <span className="font-semibold text-slate-800">{organizationData.pinCode}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    State
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <span className="font-semibold text-slate-800">{organizationData.state || 'Tamil Nadu'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Country
                  </Label>
                  <div className="h-14 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm flex items-center px-4">
                    <Globe className="h-5 w-5 text-slate-400 mr-3" />
                    <span className="font-semibold text-slate-800">{organizationData.country || 'India'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Countries */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardContent className="p-0">
            <div className="space-y-8 p-8 md:p-10 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    Operating Countries
                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {organizationData.countries.length}
                    </Badge>
                  </h3>
                  <p className="text-slate-600 mt-1">Global presence and operations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {organizationData.countries.map((country, index) => (
                  <div
                    key={country.countryCode}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 shadow-sm">
                      <div className="w-8 h-6 bg-gradient-to-r from-indigo-400 to-purple-500 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {country.countryCode}
                      </div>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {country.countryName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add the missing Label component
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <label className={`text-sm font-semibold text-slate-700 ${className}`}>{children}</label>
) 