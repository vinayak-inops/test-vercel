"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { Banknote, CreditCard, ArrowRight, ArrowLeft, RotateCcw, X } from "lucide-react"
import { useState } from "react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Zod Schema for validation
const bankDetailsSchema = z.object({
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits"),
  bankDetails: z.object({
    bankName: z.string().min(1, "Bank name is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    branchName: z.string().min(1, "Branch name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
  }),
  esiNumber: z.string().optional(),
  uanNumber: z.string().optional(),
  pfNumber: z.string().optional(),
})

type BankDetailsData = z.infer<typeof bankDetailsSchema>

interface BankDetailsFormProps {
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

export function BankDetailsForm({ 
  formData, 
  onFormDataChange, 
  onNextTab, 
  onPreviousTab,
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: BankDetailsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const currentMode = mode || searchParams.get("mode") || "add";
  const isViewMode = currentMode === "view"

  // API hooks


  const {
    post: postBankDetails,
    loading: isSaving,
  } = usePostRequest<any>({
    url: "contractor-employee",
    onSuccess: (data) => {
      console.log("Bank details saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving bank details:", error)
    },
  });

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<BankDetailsData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      aadharNumber: auditStatusFormData?.aadharNumber || "",
      bankDetails: {
        bankName: auditStatusFormData?.bankDetails?.bankName || "",
        ifscCode: auditStatusFormData?.bankDetails?.ifscCode || "",
        branchName: auditStatusFormData?.bankDetails?.branchName || "",
        accountNumber: auditStatusFormData?.bankDetails?.accountNumber || "",
      },
      esiNumber: auditStatusFormData?.esiNumber || "",
      uanNumber: auditStatusFormData?.uanNumber || "",
      pfNumber: auditStatusFormData?.pfNumber || "",
    },
    mode: "onChange",
  })

  // Update form values based on mode
  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.aadharNumber) {
        setValue("aadharNumber", auditStatusFormData.aadharNumber)
      }
      if (auditStatusFormData.bankDetails) {
        setValue("bankDetails", auditStatusFormData.bankDetails)
      }
      if (auditStatusFormData.esiNumber) {
        setValue("esiNumber", auditStatusFormData.esiNumber)
      }
      if (auditStatusFormData.uanNumber) {
        setValue("uanNumber", auditStatusFormData.uanNumber)
      }
      if (auditStatusFormData.pfNumber) {
        setValue("pfNumber", auditStatusFormData.pfNumber)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])

  const watchedValues = watch()

  const handleReset = () => {
    reset()
    setShowErrors(false)
    
    // Create nested data structure for parent
    const nestedData = {
      aadharNumber: "",
      bankDetails: {
        bankName: "",
        ifscCode: "",
        branchName: "",
        accountNumber: "",
      },
      esiNumber: "",
      uanNumber: "",
      pfNumber: "",
    }
    
    if (currentMode === "add") {
      // Clear auditStatusFormData in add mode
      onFormDataChange(nestedData)
    } else {
      // Clear formData in edit/view mode
      onFormDataChange(nestedData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    try {
      const valid = await trigger()
      
      if (valid) {
        const formValues = watch()
        
        // Convert nested form values to nested data structure for parent
        const nestedData = {
          aadharNumber: formValues.aadharNumber || "",
          bankDetails: {
            bankName: formValues.bankDetails?.bankName || "",
            ifscCode: formValues.bankDetails?.ifscCode || "",
            branchName: formValues.bankDetails?.branchName || "",
            accountNumber: formValues.bankDetails?.accountNumber || "",
          },
          esiNumber: formValues.esiNumber || "",
          uanNumber: formValues.uanNumber || "",
          pfNumber: formValues.pfNumber || "",
        }

        if (currentMode === 'add') {
          // Update auditStatusFormData for add mode
          setAuditStatusFormData?.({
            ...auditStatusFormData,
            ...nestedData,
          })
          setAuditStatus?.({
            ...auditStatus,
            bankDetails: true
          })
          if (onNextTab) {
            onNextTab()
          }
        } else {
          // Save to backend for edit mode
          const json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "contract_employee",
            data: {
              ...auditStatusFormData,
              ...formValues,
            }
          }
          await postBankDetails(json)
        }
      } else {
        console.log("Form validation failed")
        // Show validation errors more prominently
        const errorFields = Object.keys(errors)
        if (errorFields.length > 0) {
          console.log("Validation errors:", errors)
        }
      }
    } catch (error) {
      console.error("Error saving form:", error)
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
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Bank & Identity Details</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Bank account information and identity verification details
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Validation Error Summary */}
        {showErrors && Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <X className="h-5 w-5 text-red-600" />
              <h4 className="text-sm font-semibold text-red-800">Please fix the following validation errors:</h4>
            </div>
            <div className="space-y-1">
              {errors.aadharNumber && (
                <p className="text-sm text-red-700">• Aadhar Number: {errors.aadharNumber.message}</p>
              )}
              {errors.bankDetails?.bankName && (
                <p className="text-sm text-red-700">• Bank Name: {errors.bankDetails.bankName.message}</p>
              )}
              {errors.bankDetails?.ifscCode && (
                <p className="text-sm text-red-700">• IFSC Code: {errors.bankDetails.ifscCode.message}</p>
              )}
              {errors.bankDetails?.branchName && (
                <p className="text-sm text-red-700">• Branch Name: {errors.bankDetails.branchName.message}</p>
              )}
              {errors.bankDetails?.accountNumber && (
                <p className="text-sm text-red-700">• Account Number: {errors.bankDetails.accountNumber.message}</p>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Aadhar Number */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Identity Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="aadharNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Aadhar Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aadharNumber"
                  {...register("aadharNumber")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.aadharNumber) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength={12}
                />
                {showErrors && errors.aadharNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.aadharNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-blue-600" />
              Bank Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="bankName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Bank Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bankName"
                  {...register("bankDetails.bankName")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.bankDetails?.bankName) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter bank name"
                />
                {showErrors && errors.bankDetails?.bankName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.bankDetails.bankName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="branchName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Branch Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="branchName"
                  {...register("bankDetails.branchName")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.bankDetails?.branchName) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter branch name"
                />
                {showErrors && errors.bankDetails?.branchName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.bankDetails.branchName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="accountNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Account Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  {...register("bankDetails.accountNumber")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.bankDetails?.accountNumber) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter account number"
                />
                {showErrors && errors.bankDetails?.accountNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.bankDetails.accountNumber.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="ifscCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  IFSC Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ifscCode"
                  {...register("bankDetails.ifscCode")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.bankDetails?.ifscCode) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter IFSC code"
                />
                {showErrors && errors.bankDetails?.ifscCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.bankDetails.ifscCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="esiNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  ESI Number
                </Label>
                <Input
                  id="esiNumber"
                  {...register("esiNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter ESI number"
                />
              </div>

              <div className="group">
                <Label htmlFor="uanNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  UAN Number
                </Label>
                <Input
                  id="uanNumber"
                  {...register("uanNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter UAN number"
                />
              </div>

              <div className="group">
                <Label htmlFor="pfNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  PF Number
                </Label>
                <Input
                  id="pfNumber"
                  {...register("pfNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter PF number"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isViewMode && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {onPreviousTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPreviousTab}
                  className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Back
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                Reset Form
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : showErrors ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm font-medium ${isValid ? 'text-green-700' : showErrors ? 'text-red-700' : 'text-gray-700'}`}>
                  {isValid ? 'Form is valid and ready to continue' : showErrors ? 'Please fix validation errors' : 'Please complete all required fields'}
                </span>
              </div>
              
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 