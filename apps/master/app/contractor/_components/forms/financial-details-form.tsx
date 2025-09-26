"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { CreditCard, Plus, Trash2, ArrowRight, ArrowLeft, RotateCcw, X } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

  // Helper function to convert date format
  const convertDateFormat = (dateString: string): string => {
    if (!dateString) return ""
    
    // If it's already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    
    // If it's in dd-mm-yyyy format, convert to yyyy-mm-dd
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-')
      return `${year}-${month}-${day}`
    }
    
    return dateString
  }

  // Helper function to convert yyyy-mm-dd to dd-mm-yyyy for display
  const convertToDisplayFormat = (dateString: string): string => {
    if (!dateString) return ""
    
    // If it's in yyyy-mm-dd format, convert to dd-mm-yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      return `${day}-${month}-${year}`
    }
    
    return dateString
  }

// Validation schemas
const bankDetailSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  micrNo: z.string().optional().default(""),
  ifscNo: z.string().min(1, "IFSC code is required"),
  bankAccountNo: z.string().min(1, "Bank account number is required"),
})

const securityDepositSchema = z.object({
  depositDate: z.string().min(1, "Deposit date is required"),
  depositDetail: z.string().min(1, "Deposit detail is required"),
  depositAmount: z.number().min(0, "Deposit amount must be positive"),
})

type BankDetail = z.infer<typeof bankDetailSchema>
type SecurityDeposit = z.infer<typeof securityDepositSchema>

interface FinancialDetailsFormProps {
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

export function FinancialDetailsForm({ 
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
}: FinancialDetailsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"
  
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([
    {
      bankName: "",
      branchName: "",
      micrNo: "",
      ifscNo: "",
      bankAccountNo: "",
    }
  ])
  const [securityDeposits, setSecurityDeposits] = useState<SecurityDeposit[]>([])

  // Update form values based on mode
  useEffect(() => {
    // In add mode, get values from auditStatusFormData
    if (auditStatusFormData) {
      if (auditStatusFormData.bankDetails && Array.isArray(auditStatusFormData.bankDetails)) {
        setBankDetails(auditStatusFormData.bankDetails)
      }
      
      if (auditStatusFormData.securityDeposit && Array.isArray(auditStatusFormData.securityDeposit)) {
        const formattedDeposits = auditStatusFormData.securityDeposit.map((deposit: any) => {
          let depositDate = ""
          
                     if (deposit.depositDate?.$date) {
             // Handle MongoDB $date object
             try {
               const date = new Date(deposit.depositDate.$date)
               if (!isNaN(date.getTime())) {
                 const yyyyMMdd = date.toISOString().split('T')[0] // Get YYYY-MM-DD format
                 depositDate = convertToDisplayFormat(yyyyMMdd) // Convert to DD-MM-YYYY for display
               }
             } catch (error) {
               console.error("Error parsing deposit date:", deposit.depositDate.$date, error)
               depositDate = ""
             }
           } else if (deposit.depositDate) {
             // Handle timestamp or regular date string
             let date: Date
             
             // Check if it's a timestamp (number)
             if (typeof deposit.depositDate === 'number') {
               date = new Date(deposit.depositDate)
             } else if (typeof deposit.depositDate === 'string') {
               // Check if it's a timestamp string
               if (/^\d{10,13}$/.test(deposit.depositDate)) {
                 // It's a timestamp string, convert to number
                 const timestamp = parseInt(deposit.depositDate)
                 date = new Date(timestamp)
               } else {
                 // It's a regular date string - convert to display format
                 const yyyyMMdd = convertDateFormat(deposit.depositDate)
                 depositDate = convertToDisplayFormat(yyyyMMdd)
                 return {
                   depositDate,
                   depositDetail: deposit.depositDetail || "",
                   depositAmount: deposit.depositAmount || 0,
                 }
               }
             } else {
               date = new Date(deposit.depositDate)
             }
             
             if (!isNaN(date.getTime())) {
               const yyyyMMdd = date.toISOString().split('T')[0] // Get YYYY-MM-DD format
               depositDate = convertToDisplayFormat(yyyyMMdd) // Convert to DD-MM-YYYY for display
             }
           }
          
          return {
            depositDate,
            depositDetail: deposit.depositDetail || "",
            depositAmount: deposit.depositAmount || 0,
          }
        })
        setSecurityDeposits(formattedDeposits)
      }
    }
  }, [auditStatusFormData, currentMode])

  const updateFormData = () => {
    const exactData = {
      bankDetails: bankDetails.map(bank => ({
        bankName: bank.bankName,
        branchName: bank.branchName,
        micrNo: bank.micrNo,
        ifscNo: bank.ifscNo,
        bankAccountNo: bank.bankAccountNo,
      })),
      securityDeposit: securityDeposits.map(deposit => {
        let depositDateISO = new Date().toISOString()
        
        if (deposit.depositDate && typeof deposit.depositDate === 'string' && deposit.depositDate.trim() !== "") {
          try {
            // Convert from dd-mm-yyyy to yyyy-mm-dd format first
            const yyyyMMdd = convertDateFormat(deposit.depositDate)
            const date = new Date(yyyyMMdd)
            if (!isNaN(date.getTime())) {
              depositDateISO = date.toISOString()
            }
          } catch (error) {
            console.error("Error converting deposit date to ISO:", deposit.depositDate, error)
            depositDateISO = new Date().toISOString()
          }
        }
        
        return {
          depositDate: {
            $date: depositDateISO
          },
          depositDetail: deposit.depositDetail,
          depositAmount: deposit.depositAmount,
        }
      }),
    }
    onFormDataChange(exactData)
  }

  // API call for saving financial details
  const {
    post: postFinancialDetails,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Financial details saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving financial details:", error)
    },
  })

  const addBankDetail = () => {
    const newBankDetails = [
      ...bankDetails,
      {
        bankName: "",
        branchName: "",
        micrNo: "",
        ifscNo: "",
        bankAccountNo: "",
      },
    ]
    setBankDetails(newBankDetails)
    updateFormData()
  }

  const removeBankDetail = (index: number) => {
    // Prevent removing the last bank detail (at least one is required)
    if (bankDetails.length <= 1) {
      return
    }
    const updatedBankDetails = bankDetails.filter((_, i) => i !== index)
    setBankDetails(updatedBankDetails)
    updateFormData()
  }

  const updateBankDetail = (index: number, field: string, value: string) => {
    const updatedBankDetails = [...bankDetails]
    updatedBankDetails[index] = { ...updatedBankDetails[index], [field]: value }
    setBankDetails(updatedBankDetails)
    updateFormData()
  }

  const addSecurityDeposit = () => {
    const newSecurityDeposits = [
      ...securityDeposits,
      { depositDate: "", depositDetail: "", depositAmount: 0 },
    ]
    setSecurityDeposits(newSecurityDeposits)
    updateFormData()
  }

  const removeSecurityDeposit = (index: number) => {
    const updatedSecurityDeposits = securityDeposits.filter((_, i) => i !== index)
    setSecurityDeposits(updatedSecurityDeposits)
    updateFormData()
  }

  const updateSecurityDeposit = (index: number, field: string, value: any) => {
    const updated = [...securityDeposits]
    updated[index] = { ...updated[index], [field]: value }
    setSecurityDeposits(updated)
    updateFormData()
  }

  const handleSaveAndContinue = async () => {
    console.log("Current bank details:", bankDetails)
    console.log("Current security deposits:", securityDeposits)
    
    // Ensure at least one bank detail exists
    if (bankDetails.length === 0) {
      setShowErrors(true)
      console.error("At least one bank detail is required")
      return
    }
    
    // Validate all bank details
    const bankValidationResults = bankDetails.map(bank => bankDetailSchema.safeParse(bank))
    const bankHasErrors = bankValidationResults.some(result => !result.success)
    
    // Validate all security deposits
    const depositValidationResults = securityDeposits.map(deposit => securityDepositSchema.safeParse(deposit))
    const depositHasErrors = depositValidationResults.some(result => !result.success)
    
    if (bankHasErrors || depositHasErrors) {
      setShowErrors(true)
      console.error("Validation errors:", {
        bankErrors: bankValidationResults.filter(r => !r.success),
        depositErrors: depositValidationResults.filter(r => !r.success)
      })
      
      // Log specific errors for debugging
      bankValidationResults.forEach((result, index) => {
        if (!result.success) {
          console.error(`Bank detail ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      
      depositValidationResults.forEach((result, index) => {
        if (!result.success) {
          console.error(`Security deposit ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      
      return
    }

    // Create the exact JSON structure as requested
    const exactData = {
      bankDetails: bankDetails.map(bank => ({
        bankName: bank.bankName,
        branchName: bank.branchName,
        micrNo: bank.micrNo,
        ifscNo: bank.ifscNo,
        bankAccountNo: bank.bankAccountNo,
      })),
      securityDeposit: securityDeposits.map(deposit => {
        let depositDateISO = new Date().toISOString()
        
        if (deposit.depositDate && typeof deposit.depositDate === 'string' && deposit.depositDate.trim() !== "") {
          try {
            // Convert from dd-mm-yyyy to yyyy-mm-dd format first
            const yyyyMMdd = convertDateFormat(deposit.depositDate)
            const date = new Date(yyyyMMdd)
            if (!isNaN(date.getTime())) {
              depositDateISO = date.toISOString()
            }
          } catch (error) {
            console.error("Error converting deposit date to ISO:", deposit.depositDate, error)
            depositDateISO = new Date().toISOString()
          }
        }
        
        return {
          depositDate: {
            $date: depositDateISO
          },
          depositDetail: deposit.depositDetail,
          depositAmount: deposit.depositAmount,
        }
      }),
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
        financialDetails: true
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
        id: auditStatusFormData._id || null,
        collectionName: "contractor",
        data: {
          ...auditStatusFormData,
          ...exactData,
          financialDetails: true
        },
      }
      postFinancialDetails(json)
    } else {
      // In view mode, just update parent formData
      onFormDataChange(exactData)
      if (onNextTab) {
        onNextTab()
      }
    }
  }

  const handleReset = () => {
    setBankDetails([
      {
        bankName: "",
        branchName: "",
        micrNo: "",
        ifscNo: "",
        bankAccountNo: "",
      }
    ])
    setSecurityDeposits([])
    
    const clearedData = { 
      bankDetails: [{
        bankName: "",
        branchName: "",
        micrNo: "",
        ifscNo: "",
        bankAccountNo: "",
      }], 
      securityDeposit: [] 
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
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Financial Details</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Bank details and security deposit information
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Bank Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Bank Details
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addBankDetail} 
                  className="px-4 py-2 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Detail
                </Button>
              )}
            </div>

            {bankDetails.map((bank, index) => {
              const validationResult = bankDetailSchema.safeParse(bank)
              const errors = validationResult.success ? {} : validationResult.error.flatten().fieldErrors

              return (
                <div key={index} className="p-6 border-2 border-gray-100 rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-800">
                      {index === 0 ? "Primary Bank Detail (Required)" : `Additional Bank Detail ${index + 1}`}
                    </h4>
                    {!isViewMode && bankDetails.length > 1 && (
                      <Button
                        onClick={() => removeBankDetail(index)}
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
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={bank.bankName}
                        onChange={(e) => updateBankDetail(index, "bankName", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.bankName 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter bank name"
                        disabled={isViewMode}
                      />
                      {errors.bankName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.bankName[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Branch Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={bank.branchName}
                        onChange={(e) => updateBankDetail(index, "branchName", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.branchName 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter branch name"
                        disabled={isViewMode}
                      />
                      {errors.branchName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.branchName[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        MICR Number
                      </Label>
                      <Input
                        value={bank.micrNo}
                        onChange={(e) => updateBankDetail(index, "micrNo", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                        placeholder="Enter MICR number"
                        disabled={isViewMode}
                      />

                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        IFSC Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={bank.ifscNo}
                        onChange={(e) => updateBankDetail(index, "ifscNo", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.ifscNo 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter IFSC code"
                        disabled={isViewMode}
                      />
                      {errors.ifscNo && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.ifscNo[0]}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-2">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Bank Account Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={bank.bankAccountNo}
                        onChange={(e) => updateBankDetail(index, "bankAccountNo", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.bankAccountNo 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter bank account number"
                        disabled={isViewMode}
                      />
                      {errors.bankAccountNo && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.bankAccountNo[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Security Deposits Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Security Deposits
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addSecurityDeposit} 
                  className="px-4 py-2 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deposit
                </Button>
              )}
            </div>

            {securityDeposits.map((deposit, index) => {
              const validationResult = securityDepositSchema.safeParse(deposit)
              const errors = validationResult.success ? {} : validationResult.error.flatten().fieldErrors

              return (
                <div key={index} className="p-6 border-2 border-gray-100 rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-800">Security Deposit {index + 1}</h4>
                    {!isViewMode && (
                      <Button
                        onClick={() => removeSecurityDeposit(index)}
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
                        Deposit Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        value={deposit.depositDate}
                        onChange={(e) => {
                          // Convert input from dd-mm-yyyy to yyyy-mm-dd for storage
                          const inputValue = e.target.value
                          const convertedValue = convertDateFormat(inputValue)
                          updateSecurityDeposit(index, "depositDate", inputValue)
                        }}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.depositDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="dd-mm-yyyy"
                        disabled={isViewMode}
                      />
                      {errors.depositDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.depositDate[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Deposit Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={deposit.depositAmount}
                        onChange={(e) => updateSecurityDeposit(index, "depositAmount", Number.parseFloat(e.target.value) || 0)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.depositAmount 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter deposit amount"
                        disabled={isViewMode}
                      />
                      {errors.depositAmount && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.depositAmount[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Deposit Detail <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={deposit.depositDetail}
                        onChange={(e) => updateSecurityDeposit(index, "depositDetail", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.depositDetail 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter deposit detail"
                        disabled={isViewMode}
                      />
                      {errors.depositDetail && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.depositDetail[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
              <div className={`w-3 h-3 rounded-full ${bankDetails.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {bankDetails.length > 0 
                  ? 'Form is valid and ready to continue' 
                  : 'Please complete the primary bank detail'
                }
              </span>
              {showErrors && (
                <div className="text-xs text-red-600 ml-2">
                  {bankDetails.length === 0 
                    ? 'Primary bank detail is required' 
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