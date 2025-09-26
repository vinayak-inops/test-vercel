"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Separator } from "@repo/ui/components/ui/separator"
import { AlertTriangle, Plus, Trash2, ArrowRight, ArrowLeft, RotateCcw, X } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useRouter } from "next/navigation"

// Validation schemas
const penaltySchema = z.object({
  dateOfOffence: z.string().min(1, "Date of offence is required"),
  actOfMisconduct: z.string().min(1, "Act of misconduct is required"),
  actionTaken: z.string().min(1, "Action taken is required"),
  amount: z.number().min(0, "Amount must be positive"),
  month: z.number().min(1, "Month is required").max(12, "Month must be between 1-12"),
  witnessName: z.string().min(1, "Witness name is required"),
  fineRealisedDate: z.string().min(1, "Fine realised date is required"),
})

const wcPolicySchema = z.object({
  policyNumber: z.string().min(1, "Policy number is required"),
  policyStartDate: z.string().min(1, "Policy start date is required"),
  policyExpiryDate: z.string().min(1, "Policy expiry date is required"),
  policyCompanyName: z.string().min(1, "Policy company name is required"),
  maximumWorkmen: z.number().min(1, "Maximum workmen must be positive"),
})

type Penalty = z.infer<typeof penaltySchema>
type WCPolicy = z.infer<typeof wcPolicySchema>

interface PenaltiesPoliciesFormProps {
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

// Helper function to ensure date is in YYYY-MM-DD format
const convertToInputDate = (dateValue: any): string => {
  if (!dateValue) return ""
  if (typeof dateValue === "string") {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue
    }
    // If it's an ISO string, convert to YYYY-MM-DD
    try {
      return new Date(dateValue).toISOString().split('T')[0]
    } catch {
      return ""
    }
  }
  if (dateValue.$date) {
    return new Date(dateValue.$date).toISOString().split('T')[0]
  }
  return ""
}

// Helper function to keep date in YYYY-MM-DD format for backend
const convertToBackendDate = (inputDate: string): string => {
  if (!inputDate) return ""
  return inputDate // Keep as YYYY-MM-DD format
}

export function PenaltiesPoliciesForm({ 
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
}: PenaltiesPoliciesFormProps) {
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [wcPolicies, setWcPolicies] = useState<WCPolicy[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: any}>({})
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"
  const router = useRouter()

   // Remove fetchContractor from dependencies to prevent infinite loop

  // Populate penalties and WC policies based on mode
  useEffect(() => {
    if (currentMode === "add") {
      // In add mode, get values from auditStatusFormData
      if (auditStatusFormData) {
        if (auditStatusFormData.penalty && Array.isArray(auditStatusFormData.penalty)) {
          const convertedPenalties = auditStatusFormData.penalty.map((penalty: any) => ({
            dateOfOffence: convertToInputDate(penalty.dateOfOffence),
            actOfMisconduct: penalty.actOfMisconduct || "",
            actionTaken: penalty.actionTaken || "",
            amount: penalty.amount || 0,
            month: penalty.month || 1,
            witnessName: penalty.witnessName || "",
            fineRealisedDate: convertToInputDate(penalty.fineRealisedDate),
          }))
          setPenalties(convertedPenalties)
        }
        
        if (auditStatusFormData.wcPolicies && Array.isArray(auditStatusFormData.wcPolicies)) {
          const convertedWcPolicies = auditStatusFormData.wcPolicies.map((policy: any) => ({
            policyNumber: policy.policyNumber || "",
            policyStartDate: convertToInputDate(policy.policyStartDate),
            policyExpiryDate: convertToInputDate(policy.policyExpiryDate),
            policyCompanyName: policy.policyCompanyName || "",
            maximumWorkmen: policy.maximumWorkmen || 0,
          }))
          setWcPolicies(convertedWcPolicies)
        }
      }
    } else if (currentMode === "edit" || currentMode === "view") {
      // In edit/view mode, get values from backend data
      if (auditStatusFormData && auditStatusFormData) {
        const contractorData = auditStatusFormData;
        
        if (contractorData.penalty && Array.isArray(contractorData.penalty)) {
          const convertedPenalties = contractorData.penalty.map((penalty: any) => ({
            dateOfOffence: convertToInputDate(penalty.dateOfOffence),
            actOfMisconduct: penalty.actOfMisconduct || "",
            actionTaken: penalty.actionTaken || "",
            amount: penalty.amount || 0,
            month: penalty.month || 1,
            witnessName: penalty.witnessName || "",
            fineRealisedDate: convertToInputDate(penalty.fineRealisedDate),
          }))
          setPenalties(convertedPenalties)
        }
        
        if (contractorData.wcPolicies && Array.isArray(contractorData.wcPolicies)) {
          const convertedWcPolicies = contractorData.wcPolicies.map((policy: any) => ({
            policyNumber: policy.policyNumber || "",
            policyStartDate: convertToInputDate(policy.policyStartDate),
            policyExpiryDate: convertToInputDate(policy.policyExpiryDate),
            policyCompanyName: policy.policyCompanyName || "",
            maximumWorkmen: policy.maximumWorkmen || 0,
          }))
          setWcPolicies(convertedWcPolicies)
        }
      }
    }
  }, [ auditStatusFormData, currentMode])

  // Memoized function to create exact data structure
  const createExactData = useCallback((penaltiesData: Penalty[], wcPoliciesData: WCPolicy[]) => {
    return {
      penalty: penaltiesData.map(penalty => ({
        dateOfOffence: convertToBackendDate(penalty.dateOfOffence),
        actOfMisconduct: penalty.actOfMisconduct || "",
        actionTaken: penalty.actionTaken || "",
        amount: penalty.amount || 0,
        month: penalty.month || 1,
        witnessName: penalty.witnessName || "",
        fineRealisedDate: convertToBackendDate(penalty.fineRealisedDate),
      })),
      wcPolicies: wcPoliciesData.map(policy => ({
        policyNumber: policy.policyNumber || "",
        policyStartDate: convertToBackendDate(policy.policyStartDate),
        policyExpiryDate: convertToBackendDate(policy.policyExpiryDate),
        policyCompanyName: policy.policyCompanyName || "",
        maximumWorkmen: policy.maximumWorkmen || 0,
      }))
    }
  }, [])

  // Update form data when penalties or WC policies change
  const updateFormData = () => {
    const exactData = createExactData(penalties, wcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  // API call for saving penalties and policies
  const {
    post: postPenaltiesPolicies,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Penalties and policies saved successfully:", data)
      // Clear validation errors on successful save
      router.push('/contractor')
      setValidationErrors({})
      setShowErrors(false)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving penalties and policies:", error)
    },
  })

  const addPenalty = () => {
    const newPenalty = {
      dateOfOffence: "",
      actOfMisconduct: "",
      actionTaken: "",
      amount: 0,
      month: 1,
      witnessName: "",
      fineRealisedDate: "",
    }
    const updatedPenalties = [...penalties, newPenalty]
    setPenalties(updatedPenalties)
    
    // Update form data immediately after adding
    const exactData = createExactData(updatedPenalties, wcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const removePenalty = (index: number) => {
    const updatedPenalties = penalties.filter((_, i) => i !== index)
    setPenalties(updatedPenalties)
    
    // Update form data immediately after removing
    const exactData = createExactData(updatedPenalties, wcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const updatePenalty = (index: number, field: string, value: any) => {
    const updatedPenalties = [...penalties]
    updatedPenalties[index] = { ...updatedPenalties[index], [field]: value }
    setPenalties(updatedPenalties)
    
    // Update form data immediately after updating
    const exactData = createExactData(updatedPenalties, wcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const addWcPolicy = () => {
    const newWcPolicy = {
      policyNumber: "",
      policyStartDate: "",
      policyExpiryDate: "",
      policyCompanyName: "",
      maximumWorkmen: 0,
    }
    const updatedWcPolicies = [...wcPolicies, newWcPolicy]
    setWcPolicies(updatedWcPolicies)
    
    // Update form data immediately after adding
    const exactData = createExactData(penalties, updatedWcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const removeWcPolicy = (index: number) => {
    const updatedWcPolicies = wcPolicies.filter((_, i) => i !== index)
    setWcPolicies(updatedWcPolicies)
    
    // Update form data immediately after removing
    const exactData = createExactData(penalties, updatedWcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const updateWcPolicy = (index: number, field: string, value: any) => {
    const updatedWcPolicies = [...wcPolicies]
    updatedWcPolicies[index] = { ...updatedWcPolicies[index], [field]: value }
    setWcPolicies(updatedWcPolicies)
    
    // Update form data immediately after updating
    const exactData = createExactData(penalties, updatedWcPolicies)
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    // Validate all penalties
    const penaltyValidationResults = penalties.map((penalty, index) => {
      const result = penaltySchema.safeParse(penalty)
      return { index, result }
    })
    const penaltyHasErrors = penaltyValidationResults.some(({ result }) => !result.success)
    
    // Validate all WC policies
    const wcPolicyValidationResults = wcPolicies.map((policy, index) => {
      const result = wcPolicySchema.safeParse(policy)
      return { index, result }
    })
    const wcPolicyHasErrors = wcPolicyValidationResults.some(({ result }) => !result.success)
    
    // Store validation errors for UI display
    const errors: {[key: string]: any} = {}
    penaltyValidationResults.forEach(({ index, result }) => {
      if (!result.success) {
        errors[`penalty_${index}`] = result.error.flatten().fieldErrors
      }
    })
    wcPolicyValidationResults.forEach(({ index, result }) => {
      if (!result.success) {
        errors[`wcPolicy_${index}`] = result.error.flatten().fieldErrors
      }
    })
    setValidationErrors(errors)
    
    if (penaltyHasErrors || wcPolicyHasErrors) {
      console.error("Validation errors found:")
      penaltyValidationResults.forEach(({ index, result }) => {
        if (!result.success) {
          console.error(`Penalty ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      wcPolicyValidationResults.forEach(({ index, result }) => {
        if (!result.success) {
          console.error(`WC Policy ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      return
    }

    // Clear validation errors if validation passes
    setValidationErrors({})

    // Create the exact JSON structure as requested
    const exactData = createExactData(penalties, wcPolicies)
    
    // Update form data based on mode
    if (currentMode === "add") {
      let json = {
        tenant: "Midhani",
        action: "insert",
        id:  null,
        collectionName: "contractor",
        data: {
          ...auditStatusFormData,
          ...exactData,
          penaltiesPolicies: true,
          organizationCode:"Midhani",
          tenantCode:"Midhani"
        }
      }
      postPenaltiesPolicies(json)
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
          penaltiesPolicies: true
        }
      }
      postPenaltiesPolicies(json)
    } else {
      // In view mode, just update parent formData
      onFormDataChange(exactData)
      if (onNextTab) {
        onNextTab()
      }
    }
  }

  const handleReset = () => {
    setPenalties([])
    setWcPolicies([])
    
    const clearedData = { penalty: [], wcPolicies: [] }
    
    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...clearedData
      })
    } else {
      onFormDataChange(clearedData)
    }
    
    setValidationErrors({})
    setShowErrors(false)
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-600 via-red-700 to-pink-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-pink-700/90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Penalties & Policies</CardTitle>
                <CardDescription className="text-red-100 text-base">
                  Penalties and workmen compensation policies management
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        {/* Loading and Error States */}
        {/* {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading contractor data...</p>
          </div>
        )}

        {contractorError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm">Error loading contractor data: {contractorError.message}</p>
          </div>
        )} */}

        {/* Validation Errors Summary */}
        {showErrors && Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h4>
            <div className="space-y-2">
              {Object.entries(validationErrors).map(([key, errors]) => {
                const [type, index] = key.split('_')
                const itemIndex = parseInt(index) + 1
                const itemName = type === 'penalty' ? 'Penalty' : 'WC Policy'
                return (
                  <div key={key} className="text-sm">
                    <p className="text-red-700 font-medium">{itemName} {itemIndex}:</p>
                    <ul className="list-disc list-inside text-red-600 ml-4">
                      {Object.entries(errors).map(([field, messages]) => (
                        <li key={field}>
                          {field}: {Array.isArray(messages) ? messages[0] : messages}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Penalties Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Penalties
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addPenalty} 
                  className="px-4 py-2 h-10 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg text-white font-medium transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Penalty
                </Button>
              )}
            </div>

            {penalties.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No penalties added yet</p>
                <p className="text-sm text-gray-400">Click "Add Penalty" to get started</p>
              </div>
            )}

            {penalties.map((penalty, index) => {
              const errors = validationErrors[`penalty_${index}`] || {}

              return (
                <div key={index} className="group/item bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Penalty {index + 1}</h4>
                    </div>
                    {!isViewMode && (
                      <Button
                        onClick={() => removePenalty(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Date of Offence <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={penalty.dateOfOffence}
                        onChange={(e) => updatePenalty(index, "dateOfOffence", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.dateOfOffence 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.dateOfOffence && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.dateOfOffence[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Act of Misconduct <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={penalty.actOfMisconduct}
                        onChange={(e) => updatePenalty(index, "actOfMisconduct", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.actOfMisconduct 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        placeholder="Enter act of misconduct"
                        disabled={isViewMode}
                      />
                      {errors.actOfMisconduct && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.actOfMisconduct[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Action Taken <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={penalty.actionTaken}
                        onChange={(e) => updatePenalty(index, "actionTaken", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.actionTaken 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        placeholder="Enter action taken"
                        disabled={isViewMode}
                      />
                      {errors.actionTaken && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.actionTaken[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={penalty.amount}
                        onChange={(e) => updatePenalty(index, "amount", Number.parseFloat(e.target.value) || 0)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.amount 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        placeholder="Enter amount"
                        disabled={isViewMode}
                      />
                      {errors.amount && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.amount[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Month <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={penalty.month.toString()}
                        onValueChange={(value) => updatePenalty(index, "month", Number.parseInt(value))}
                        disabled={isViewMode}
                      >
                        <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.month 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.month && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.month[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Witness Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={penalty.witnessName}
                        onChange={(e) => updatePenalty(index, "witnessName", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.witnessName 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        placeholder="Enter witness name"
                        disabled={isViewMode}
                      />
                      {errors.witnessName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.witnessName[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Fine Realised Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={penalty.fineRealisedDate}
                        onChange={(e) => updatePenalty(index, "fineRealisedDate", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.fineRealisedDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.fineRealisedDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.fineRealisedDate[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* WC Policies Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                Workmen Compensation Policies
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addWcPolicy} 
                  className="px-4 py-2 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add WC Policy
                </Button>
              )}
            </div>

            {wcPolicies.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No WC policies added yet</p>
                <p className="text-sm text-gray-400">Click "Add WC Policy" to get started</p>
              </div>
            )}

            {wcPolicies.map((policy, index) => {
              const errors = validationErrors[`wcPolicy_${index}`] || {}

              return (
                <div key={index} className="group/item bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">WC Policy {index + 1}</h4>
                    </div>
                    {!isViewMode && (
                      <Button
                        onClick={() => removeWcPolicy(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Policy Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={policy.policyNumber}
                        onChange={(e) => updateWcPolicy(index, "policyNumber", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.policyNumber 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter policy number"
                        disabled={isViewMode}
                      />
                      {errors.policyNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policyNumber[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Policy Start Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={policy.policyStartDate}
                        onChange={(e) => updateWcPolicy(index, "policyStartDate", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.policyStartDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.policyStartDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policyStartDate[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Policy Expiry Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={policy.policyExpiryDate}
                        onChange={(e) => updateWcPolicy(index, "policyExpiryDate", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.policyExpiryDate 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        disabled={isViewMode}
                      />
                      {errors.policyExpiryDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policyExpiryDate[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Policy Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={policy.policyCompanyName}
                        onChange={(e) => updateWcPolicy(index, "policyCompanyName", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.policyCompanyName 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter policy company name"
                        disabled={isViewMode}
                      />
                      {errors.policyCompanyName && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policyCompanyName[0]}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Maximum Workmen <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={policy.maximumWorkmen}
                        onChange={(e) => updateWcPolicy(index, "maximumWorkmen", Number.parseInt(e.target.value) || 0)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.maximumWorkmen 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter maximum workmen"
                        disabled={isViewMode}
                      />
                      {errors.maximumWorkmen && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.maximumWorkmen[0]}
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
                 onClick={() => {
                   // Refetch contractor data before going back
                   if (currentMode === "edit" || currentMode === "view") {
                    //  fetchContractor()
                   }
                   // Check if tab value changes and refetch data
                   const currentTab = searchParams.get("tab")
                   if (currentTab && currentTab !== "penalties-policies") {
                    //  fetchContractor()
                   }
                   onPreviousTab()
                 }}
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
              <div className={`w-3 h-3 rounded-full ${penalties.length > 0 || wcPolicies.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {penalties.length > 0 || wcPolicies.length > 0 
                  ? `${penalties.length} penalty(ies), ${wcPolicies.length} WC policy(ies)` 
                  : 'No penalties or policies added yet'}
              </span>
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={postLoading}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg text-white font-medium transition-all duration-300"
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