"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { Shield, Plus, Trash2, ArrowRight, ArrowLeft, RotateCcw, X } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Validation schemas
const licenseSchema = z.object({
  licenseNo: z.string().min(1, "License number is required"),
  licenseFromDate: z.string().min(1, "License from date is required"),
  licenseToDate: z.string().min(1, "License to date is required"),
  workmen: z.number().min(0, "Number of workmen must be positive"),
  issuedOn: z.string().min(1, "Issued on date is required"),
  natureOfWork: z.string().min(1, "Nature of work is required"),
})

// const importantNumberSchema = z.object({
//   documentTypeCode: z.string().min(1, "Document type code is required"),
//   documentTypeTitle: z.string().min(1, "Document type title is required"),
//   identificatinNumber: z.string().min(1, "Identification number is required"),
// })

type License = z.infer<typeof licenseSchema>
// type ImportantNumber = z.infer<typeof importantNumberSchema>

interface LicensesPermitsFormProps {
  formData: any
  onFormDataChange: (data: any) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function LicensesPermitsForm({ 
  formData, 
  onFormDataChange,
  onNextTab,
  onPreviousTab,
  mode = "add" ,
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: LicensesPermitsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"
  
  const [licenses, setLicenses] = useState<License[]>([
    {
      licenseNo: "",
      licenseFromDate: "",
      licenseToDate: "",
      workmen: 0,
      issuedOn: "",
      natureOfWork: "",
    }
  ])
  // const [importantNumbers, setImportantNumbers] = useState<ImportantNumber[]>([])


  // Helper function to convert date format
  const convertDateFormat = (dateString: any) => {
    if (!dateString || typeof dateString !== 'string') return "";
    // Check if it's already in yyyy-mm-dd format
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      return dateString;
    }
    // Convert from dd-mm-yyyy to yyyy-mm-dd
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }

  // Update form values based on mode
  useEffect(() => {
      // In add mode, get values from auditStatusFormData
      if (auditStatusFormData) {
        if (auditStatusFormData.licenses && Array.isArray(auditStatusFormData.licenses)) {
          const formattedLicenses = auditStatusFormData.licenses.map((license: any) => ({
            licenseNo: license.licenseNo || "",
            licenseFromDate: license.licenseFromDate?.$date ? new Date(license.licenseFromDate.$date).toISOString().split('T')[0] : (license.licenseFromDate || ""),
            licenseToDate: license.licenseToDate?.$date ? new Date(license.licenseToDate.$date).toISOString().split('T')[0] : (license.licenseToDate || ""),
            workmen: license.workmen || 0,
            issuedOn: license.issuedOn?.$date ? new Date(license.issuedOn.$date).toISOString().split('T')[0] : (license.issuedOn || ""),
            natureOfWork: license.natureOfWork || "",
          }))
          setLicenses(formattedLicenses)
        }
        
        // if (auditStatusFormData.importantNumbers && Array.isArray(auditStatusFormData.importantNumbers)) {
        //   setImportantNumbers(auditStatusFormData.importantNumbers)
        // }
      }
    
  }, [ auditStatusFormData, currentMode])

  const updateFormData = () => {
    const exactData = {
      licenses: licenses.map(license => ({
        licenseNo: license.licenseNo,
        licenseFromDate: license.licenseFromDate || "",
        licenseToDate: license.licenseToDate || "",
        workmen: license.workmen,
        issuedOn: license.issuedOn || "",
        natureOfWork: license.natureOfWork,
      })),
      // importantNumbers: importantNumbers.map(number => ({
      //   documentTypeCode: number.documentTypeCode,
      //   documentTypeTitle: number.documentTypeTitle,
      //   identificatinNumber: number.identificatinNumber,
      // })),
    }
    onFormDataChange(exactData)
  }

  // API call for saving licenses and permits
  const {
    post: postLicensesPermits,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Licenses and permits saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving licenses and permits:", error)
    },
  })

  const addLicense = () => {
    const newLicenses = [
      ...licenses,
      {
        licenseNo: "",
        licenseFromDate: "",
        licenseToDate: "",
        workmen: 0,
        issuedOn: "",
        natureOfWork: "",
      },
    ]
    setLicenses(newLicenses)
    updateFormData()
  }

  const removeLicense = (index: number) => {
    // Prevent removing the last license (at least one is required)
    if (licenses.length <= 1) {
      return
    }
    const updatedLicenses = licenses.filter((_, i) => i !== index)
    setLicenses(updatedLicenses)
    updateFormData()
  }

  const updateLicense = (index: number, field: string, value: any) => {
    const updatedLicenses = [...licenses]
    updatedLicenses[index] = { ...updatedLicenses[index], [field]: value }
    setLicenses(updatedLicenses)
    updateFormData()
  }

  // const addImportantNumber = () => {
  //   const newImportantNumbers = [
  //     ...importantNumbers,
  //     { documentTypeCode: "", documentTypeTitle: "", identificatinNumber: "" },
  //   ]
  //   setImportantNumbers(newImportantNumbers)
  //   updateFormData()
  // }

  // const removeImportantNumber = (index: number) => {
  //   const updatedImportantNumbers = importantNumbers.filter((_, i) => i !== index)
  //   setImportantNumbers(updatedImportantNumbers)
  //   updateFormData()
  // }

  // const updateImportantNumber = (index: number, field: string, value: string) => {
  //   const updated = [...importantNumbers]
  //   updated[index] = { ...updated[index], [field]: value }
  //   setImportantNumbers(updated)
  //   updateFormData()
  // }

  const handleSaveAndContinue = async () => {
    console.log("Current licenses:", licenses)
    // console.log("Current important numbers:", importantNumbers)
    
    // Ensure at least one license exists
    if (licenses.length === 0) {
      setShowErrors(true)
      console.error("At least one license is required")
      return
    }
    
    // Validate all licenses
    const licenseValidationResults = licenses.map(license => licenseSchema.safeParse(license))
    const licenseHasErrors = licenseValidationResults.some(result => !result.success)
    
    // Validate all important numbers
    // const numberValidationResults = importantNumbers.map(number => importantNumberSchema.safeParse(number))
    // const numberHasErrors = numberValidationResults.some(result => !result.success)
    
    if (licenseHasErrors) {
      setShowErrors(true)
      console.error("Validation errors:", {
        licenseErrors: licenseValidationResults.filter(r => !r.success),
        // numberErrors: numberValidationResults.filter(r => !r.success)
      })
      
      // Log specific failing fields
      licenseValidationResults.forEach((result, index) => {
        if (!result.success) {
          console.log(`License ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      
      // numberValidationResults.forEach((result, index) => {
      //   if (!result.success) {
      //     console.log(`Important Number ${index + 1} errors:`, result.error.flatten().fieldErrors)
      //   }
      // })
      
      return
    }

    // Create the exact JSON structure as requested
    const exactData = {
      licenses: licenses.map(license => ({
        licenseNo: license.licenseNo,
        licenseFromDate: license.licenseFromDate || "",
        licenseToDate: license.licenseToDate || "",
        workmen: license.workmen,
        issuedOn: license.issuedOn || "",
        natureOfWork: license.natureOfWork,
      })),
      // importantNumbers: importantNumbers.map(number => ({
      //   documentTypeCode: number.documentTypeCode,
      //   documentTypeTitle: number.documentTypeTitle,
      //   identificatinNumber: number.identificatinNumber,
      // })),
    }
    
    console.log("Saving data:", exactData)
    
    // Update form data based on mode
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
      setAuditStatus?.({
        ...auditStatus,
        licensesPermits:true
      })
      // In add mode, also move to next tab after saving
      if (onNextTab) {
        onNextTab()
      }
    } else if (currentMode === "edit") {
      // In edit mode, update parent formData and save to backend
      onFormDataChange(exactData)
      let json = {
        tenant: "Midhani",
        action: "insert",
        id: auditStatusFormData._id,
        collectionName: "contractor",
        data: {
          ...auditStatusFormData,
          ...exactData,
          licensesPermits: true
        }
      }
      postLicensesPermits(json)
    } else {
      // In view mode, just update parent formData
      onFormDataChange(exactData)
      if (onNextTab) {
        onNextTab()
      }
    }
    
  }

  const handleReset = () => {
    setLicenses([
      {
        licenseNo: "",
        licenseFromDate: "",
        licenseToDate: "",
        workmen: 0,
        issuedOn: "",
        natureOfWork: "",
      }
    ])
    // setImportantNumbers([])
    
    const clearedData = { 
      licenses: [{
        licenseNo: "",
        licenseFromDate: "",
        licenseToDate: "",
        workmen: 0,
        issuedOn: "",
        natureOfWork: "",
      }], 
      // importantNumbers: [] 
    }
    
    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...clearedData
      })
    } else {
      onFormDataChange(clearedData)
    }
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Licenses & Permits</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  License information and permit details
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-blue-600 text-lg">Loading licenses and permits...</div>
          </div>
        )}
        {contractorError && (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-600 text-lg">Error loading data: {contractorError.message}</div>
          </div>
        )} */}
        <div className="space-y-8">
          {/* Licenses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Licenses
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addLicense} 
                  className="px-4 py-2 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add License
                </Button>
              )}
            </div>

            {licenses.map((license, index) => {
              const validationResult = licenseSchema.safeParse(license)
              const errors = validationResult.success ? {} : validationResult.error.flatten().fieldErrors

              return (
                <div key={index} className="p-6 border-2 border-gray-100 rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-800">
                      {index === 0 ? "Primary License (Required)" : `Additional License ${index + 1}`}
                    </h4>
                    {!isViewMode && licenses.length > 1 && (
                      <Button
                        onClick={() => removeLicense(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        License Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={license.licenseNo}
                        onChange={(e) => updateLicense(index, "licenseNo", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.licenseNo 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter license number"
                        disabled={isViewMode}
                      />
                      {errors.licenseNo && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.licenseNo[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        License From Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={license.licenseFromDate}
                        onChange={(e) => updateLicense(index, "licenseFromDate", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.licenseFromDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.licenseFromDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.licenseFromDate[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        License To Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={license.licenseToDate}
                        onChange={(e) => updateLicense(index, "licenseToDate", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.licenseToDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.licenseToDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.licenseToDate[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Number of Workmen <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={license.workmen}
                        onChange={(e) => updateLicense(index, "workmen", Number.parseInt(e.target.value) || 0)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.workmen 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter number of workmen"
                        disabled={isViewMode}
                      />
                      {errors.workmen && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.workmen[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Issued On <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={license.issuedOn}
                        onChange={(e) => updateLicense(index, "issuedOn", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.issuedOn 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.issuedOn && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.issuedOn[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Nature of Work <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={license.natureOfWork}
                        onChange={(e) => updateLicense(index, "natureOfWork", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.natureOfWork 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter nature of work"
                        disabled={isViewMode}
                      />
                      {errors.natureOfWork && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.natureOfWork[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* <Separator />

          {/* Important Numbers Section */}
          {/* <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Important Numbers
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addImportantNumber} 
                  className="px-4 py-2 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Number
                </Button>
              )}
            </div>

            {importantNumbers.map((number, index) => {
              const validationResult = importantNumberSchema.safeParse(number)
              const errors = validationResult.success ? {} : validationResult.error.flatten().fieldErrors

              return (
                <div key={index} className="p-6 border-2 border-gray-100 rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-800">Document {index + 1}</h4>
                    {!isViewMode && (
                      <Button
                        onClick={() => removeImportantNumber(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Type Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={number.documentTypeCode}
                        onChange={(e) => updateImportantNumber(index, "documentTypeCode", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.documentTypeCode 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter document type code"
                        disabled={isViewMode}
                      />
                      {errors.documentTypeCode && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.documentTypeCode[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Type Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={number.documentTypeTitle}
                        onChange={(e) => updateImportantNumber(index, "documentTypeTitle", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.documentTypeTitle 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter document type title"
                        disabled={isViewMode}
                      />
                      {errors.documentTypeTitle && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.documentTypeTitle[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Identification Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={number.identificatinNumber}
                        onChange={(e) => updateImportantNumber(index, "identificatinNumber", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.identificatinNumber 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter identification number"
                        disabled={isViewMode}
                      />
                      {errors.identificatinNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.identificatinNumber[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {onPreviousTab && (
              <Button
                type="button"
                variant="outline"
                onClick={onPreviousTab}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Form
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${licenses.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {licenses.length > 0 ? 'Form is valid and ready to continue' : 'Please complete the primary license'}
              </span>
              {showErrors && (
                <div className="text-xs text-red-600 ml-2">
                  {licenses.length === 0 
                    ? 'Primary license is required' 
                    : 'Please complete all required fields'}
                </div>
              )}
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={postLoading}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 