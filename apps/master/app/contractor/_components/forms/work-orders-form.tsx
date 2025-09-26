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
import { ClipboardList, Plus, Trash2, ArrowRight, ArrowLeft, RotateCcw, X } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Validation schemas
const assetChargeSchema = z.object({
  assetCode: z.string().min(1, "Asset code is required"),
  assetName: z.string().min(1, "Asset name is required"),
  assetCharges: z.number().min(0, "Asset charges must be positive"),
})

const employeeWagesSchema = z.object({
  wageType: z.string().optional(),
  wageAmount: z.number().min(0, "Wage amount must be positive").optional(),
})

const workOrderSchema = z.object({
  workOrderNumber: z.string().min(1, "Work order number is required"),
  workOrderDate: z.string().min(1, "Work order date is required"),
  proposalReferenceNumber: z.string().optional(),
  NumberOfEmployee: z.number().min(0, "Number of employees must be positive"),
  contractPeriodFrom: z.string().min(1, "Contract period from is required"),
  contractPeriodTo: z.string().min(1, "Contract period to is required"),
  workOrderDocumentFilePath: z.string().optional(),
  annexureFilePath: z.string().optional(),
  serviceChargeAmount: z.number().min(0, "Service charge amount must be positive"),
  workOrderType: z.string().min(1, "Work order type is required"),
  workOrderLineItems: z.string().optional(),
  serviceLineItems: z.string().optional(),
  serviceCode: z.string().optional(),
  wcChargesPerEmployee: z.number().min(0, "WC charges per employee must be positive").optional(),
  assetChargesPerDay: z.array(assetChargeSchema),
  employeeWages: employeeWagesSchema.optional(),
})

// Schema for the entire work orders array
const workOrdersArraySchema = z.array(workOrderSchema).min(1, "At least one work order is required")

type AssetCharge = z.infer<typeof assetChargeSchema>
type EmployeeWages = z.infer<typeof employeeWagesSchema>
type WorkOrder = z.infer<typeof workOrderSchema>

interface WorkOrdersFormProps {
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

export function WorkOrdersForm({ 
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
}: WorkOrdersFormProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: any}>({})
  const isInitialMount = useRef(true)
  const lastWorkOrdersRef = useRef<WorkOrder[]>([])
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"
 // Remove fetchContractor from dependencies to prevent infinite loop

  // Populate work orders from fetched data (primary source)
  useEffect(() => {
    if (auditStatusFormData && auditStatusFormData.workOrders) {
      const workOrdersData = auditStatusFormData.workOrders.map((workOrder: any) => {
        // Transform flat structure to nested structure
        const transformedWorkOrder = {
          ...workOrder,
          // Handle NumberOfEmployee field - support both old and new field names
          NumberOfEmployee: workOrder.NumberOfEmployee || workOrder.NumberOfEmployees || 0,
          // Map direct wageType and wageAmount to employeeWages object
          employeeWages: {
            wageType: workOrder.wageType || workOrder.employeeWages?.wageType || "",
            wageAmount: workOrder.wageAmount || workOrder.employeeWages?.wageAmount || 0,
          },
          // Map direct assetCode, assetName, assetCharges to assetChargesPerDay array
          assetChargesPerDay: workOrder.assetChargesPerDay || (workOrder.assetCode ? [{
            assetCode: workOrder.assetCode || "",
            assetName: workOrder.assetName || "",
            assetCharges: workOrder.assetCharges || 0,
          }] : []),
        }
        
        // Remove the flat properties to avoid duplication
        const { wageType, wageAmount, assetCode, assetName, assetCharges, NumberOfEmployees, ...cleanWorkOrder } = transformedWorkOrder
        return cleanWorkOrder
      })
      setWorkOrders(workOrdersData)
    }
  }, [auditStatusFormData])

  // Populate work orders from formData (fallback)
  useEffect(() => {
    if (formData && formData.workOrders && !auditStatusFormData) {
      const workOrdersData = formData.workOrders.map((workOrder: any) => {
        // Transform flat structure to nested structure
        const transformedWorkOrder = {
          ...workOrder,
          // Handle NumberOfEmployee field - support both old and new field names
          NumberOfEmployee: workOrder.NumberOfEmployee || workOrder.NumberOfEmployees || 0,
          // Map direct wageType and wageAmount to employeeWages object
          employeeWages: {
            wageType: workOrder.wageType || workOrder.employeeWages?.wageType || "",
            wageAmount: workOrder.wageAmount || workOrder.employeeWages?.wageAmount || 0,
          },
          // Map direct assetCode, assetName, assetCharges to assetChargesPerDay array
          assetChargesPerDay: workOrder.assetChargesPerDay || (workOrder.assetCode ? [{
            assetCode: workOrder.assetCode || "",
            assetName: workOrder.assetName || "",
            assetCharges: workOrder.assetCharges || 0,
          }] : []),
        }
        
        // Remove the flat properties to avoid duplication
        const { wageType, wageAmount, assetCode, assetName, assetCharges, NumberOfEmployees, ...cleanWorkOrder } = transformedWorkOrder
        return cleanWorkOrder
      })
      setWorkOrders(workOrdersData)
    }
  }, [formData, auditStatusFormData])

  // Memoized function to create exact data structure
  const createExactData = useCallback((workOrdersData: WorkOrder[]) => {
    return {
      workOrders: workOrdersData.map(workOrder => ({
        workOrderNumber: workOrder.workOrderNumber || "",
        workOrderDate: workOrder.workOrderDate || "",
        proposalReferenceNumber: workOrder.proposalReferenceNumber || null,
        NumberOfEmployee: typeof workOrder.NumberOfEmployee === 'string' ? parseInt(workOrder.NumberOfEmployee) || 0 : workOrder.NumberOfEmployee || 0,
        contractPeriodFrom: workOrder.contractPeriodFrom || "",
        contractPeriodTo: workOrder.contractPeriodTo || "",
        workOrderDocumentFilePath: workOrder.workOrderDocumentFilePath || "",
        annexureFilePath: workOrder.annexureFilePath || "",
        serviceChargeAmount: workOrder.serviceChargeAmount || 0,
        workOrderType: workOrder.workOrderType || "Standard",
        workOrderLineItems: workOrder.workOrderLineItems || "",
        serviceLineItems: workOrder.serviceLineItems || "",
        serviceCode: workOrder.serviceCode || "",
        wcChargesPerEmployee: workOrder.wcChargesPerEmployee || 0,
        assetChargesPerDay: workOrder.assetChargesPerDay.map(asset => ({
          assetCode: asset.assetCode || "",
          assetName: asset.assetName || "",
          assetCharges: asset.assetCharges || 0,
        })),
        employeeWages: {
          wageType: workOrder.employeeWages?.wageType || "",
          wageAmount: workOrder.employeeWages?.wageAmount || 0,
        },
      }))
    }
  }, [])

  // Update form data when work orders change - with proper guards
  useEffect(() => {
    // Skip the first render to prevent infinite loop
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastWorkOrdersRef.current = workOrders
      return
    }

    // Check if workOrders actually changed to prevent unnecessary updates
    const workOrdersChanged = JSON.stringify(workOrders) !== JSON.stringify(lastWorkOrdersRef.current)
    
    if (workOrdersChanged) {
      const exactData = createExactData(workOrders)
      onFormDataChange(exactData)
      lastWorkOrdersRef.current = workOrders
    }
  }, [workOrders, createExactData]) // Removed onFormDataChange from dependencies

  // API call for saving work orders
  const {
    post: postWorkOrders,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Work orders saved successfully:", data)
      // Clear validation errors on successful save
      setValidationErrors({})
      setShowErrors(false)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving work orders:", error)
      // Show error message to user
      alert(`Error saving work orders: ${error.message || 'Unknown error occurred'}`)
    },
  })

  const addWorkOrder = () => {
    const newWorkOrder = {
      workOrderNumber: "",
      workOrderDate: "",
      proposalReferenceNumber: "",
      NumberOfEmployee: 0,
      contractPeriodFrom: "",
      contractPeriodTo: "",
      workOrderDocumentFilePath: "",
      annexureFilePath: "",
      serviceChargeAmount: 0,
             workOrderType: "Job Work",
      workOrderLineItems: "",
      serviceLineItems: "",
      serviceCode: "",
      wcChargesPerEmployee: 0,
      assetChargesPerDay: [],
      employeeWages: {
        wageType: "",
        wageAmount: 0,
      },
    }
    const updatedWorkOrders = [...workOrders, newWorkOrder]
    setWorkOrders(updatedWorkOrders)
  }

  const removeWorkOrder = (index: number) => {
    const updatedWorkOrders = workOrders.filter((_, i) => i !== index)
    setWorkOrders(updatedWorkOrders)
  }

  const updateWorkOrder = (index: number, field: string, value: any) => {
    const updatedWorkOrders = [...workOrders]
    updatedWorkOrders[index] = { ...updatedWorkOrders[index], [field]: value }
    setWorkOrders(updatedWorkOrders)
  }

  const addAssetCharge = (workOrderIndex: number) => {
    const updatedWorkOrders = [...workOrders]
    updatedWorkOrders[workOrderIndex].assetChargesPerDay.push({
      assetCode: "",
      assetName: "",
      assetCharges: 0,
    })
    setWorkOrders(updatedWorkOrders)
  }

  const removeAssetCharge = (workOrderIndex: number, assetIndex: number) => {
    const updatedWorkOrders = [...workOrders]
    updatedWorkOrders[workOrderIndex].assetChargesPerDay = updatedWorkOrders[
      workOrderIndex
    ].assetChargesPerDay.filter((_, i) => i !== assetIndex)
    setWorkOrders(updatedWorkOrders)
  }



  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    // First validate that at least one work order exists
    const arrayValidationResult = workOrdersArraySchema.safeParse(workOrders)
    if (!arrayValidationResult.success) {
      setValidationErrors({ array: arrayValidationResult.error.flatten().formErrors })
      console.error("Array validation error:", arrayValidationResult.error.flatten().formErrors)
      return
    }
    
    // Validate all work orders
    const workOrderValidationResults = workOrders.map((workOrder, index) => {
      const result = workOrderSchema.safeParse(workOrder)
      return { index, result }
    })
    const workOrderHasErrors = workOrderValidationResults.some(({ result }) => !result.success)
    
    // Store validation errors for UI display
    const errors: {[key: string]: any} = {}
    workOrderValidationResults.forEach(({ index, result }) => {
      if (!result.success) {
        errors[`workOrder_${index}`] = result.error.flatten().fieldErrors
      }
    })
    setValidationErrors(errors)
    
    if (workOrderHasErrors) {
      console.error("Validation errors found:")
      workOrderValidationResults.forEach(({ index, result }) => {
        if (!result.success) {
          console.error(`Work Order ${index + 1} errors:`, result.error.flatten().fieldErrors)
        }
      })
      return
    }

    // Clear validation errors if validation passes
    setValidationErrors({})

    // Create the exact JSON structure as requested
    const exactData = createExactData(workOrders)
    
    onFormDataChange(exactData)
    
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
      setAuditStatus?.({
        ...auditStatus,
        workOrdersCompleted:true
      })
      if (onNextTab) {
        onNextTab()
      }
    } else if (currentMode === "edit") {
      let json = {
        tenant: "Midhani",
        action: "insert",
        id: auditStatusFormData._id || null,
        collectionName: "contractor",
        data: {
          ...auditStatusFormData,
          ...exactData,
          workOrdersCompleted: true
        }
      }
      postWorkOrders(json)
    } else {
      if (onNextTab) {
        onNextTab()
      }
    }
  }

  const handleReset = () => {
    setWorkOrders([])
    onFormDataChange({ workOrders: [] })
    lastWorkOrdersRef.current = []
    setValidationErrors({})
    setShowErrors(false)
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
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Work Orders</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Work order management and contract details
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                if (key === 'array') {
                  return (
                    <div key={key} className="text-sm">
                      <p className="text-red-700 font-medium">General Error:</p>
                      <ul className="list-disc list-inside text-red-600 ml-4">
                        {Array.isArray(errors) && errors.map((message, index) => (
                          <li key={index}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  )
                }
                const workOrderIndex = parseInt(key.split('_')[1]) + 1
                return (
                  <div key={key} className="text-sm">
                    <p className="text-red-700 font-medium">Work Order {workOrderIndex}:</p>
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
          {/* Work Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Work Orders
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addWorkOrder} 
                  className="px-4 py-2 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Order
                </Button>
              )}
            </div>

            {workOrders.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No work orders added yet</p>
                <p className="text-sm text-gray-400">Click "Add Work Order" to get started</p>
              </div>
            )}

            {workOrders.map((workOrder, index) => {
              const errors = validationErrors[`workOrder_${index}`] || {}

              return (
                <div key={index} className="group/item bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Work Order {index + 1}</h4>
                    </div>
                    {!isViewMode && (
                      <Button
                        onClick={() => removeWorkOrder(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Basic Work Order Details */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Basic Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Work Order Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={workOrder.workOrderNumber}
                          onChange={(e) => updateWorkOrder(index, "workOrderNumber", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.workOrderNumber 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter work order number"
                          disabled={isViewMode}
                        />
                        {errors.workOrderNumber && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.workOrderNumber[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Work Order Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={workOrder.workOrderDate}
                          onChange={(e) => updateWorkOrder(index, "workOrderDate", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.workOrderDate 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          disabled={isViewMode}
                        />
                        {errors.workOrderDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.workOrderDate[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Proposal Reference Number
                        </Label>
                        <Input
                          value={workOrder.proposalReferenceNumber || ""}
                          onChange={(e) => updateWorkOrder(index, "proposalReferenceNumber", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                          placeholder="Enter proposal reference number"
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Number of Employees <span className="text-red-500">*</span>
                        </Label>
                                                  <Input
                            type="number"
                            value={workOrder.NumberOfEmployee}
                            onChange={(e) =>
                              updateWorkOrder(index, "NumberOfEmployee", parseInt(e.target.value) || 0)
                            }
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.NumberOfEmployee 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter number of employees"
                          disabled={isViewMode}
                        />
                        {errors.NumberOfEmployee && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.NumberOfEmployee[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Contract Period From <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={workOrder.contractPeriodFrom}
                          onChange={(e) => updateWorkOrder(index, "contractPeriodFrom", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.contractPeriodFrom 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          disabled={isViewMode}
                        />
                        {errors.contractPeriodFrom && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.contractPeriodFrom[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Contract Period To <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={workOrder.contractPeriodTo}
                          onChange={(e) => updateWorkOrder(index, "contractPeriodTo", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.contractPeriodTo 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          disabled={isViewMode}
                        />
                        {errors.contractPeriodTo && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.contractPeriodTo[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Paths */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Document Paths
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Work Order Document File Path
                        </Label>
                        <Input
                          value={workOrder.workOrderDocumentFilePath}
                          onChange={(e) => updateWorkOrder(index, "workOrderDocumentFilePath", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.workOrderDocumentFilePath 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter work order document path"
                          disabled={isViewMode}
                        />
                        {errors.workOrderDocumentFilePath && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.workOrderDocumentFilePath[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Annexure File Path
                        </Label>
                        <Input
                          value={workOrder.annexureFilePath}
                          onChange={(e) => updateWorkOrder(index, "annexureFilePath", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.annexureFilePath 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter annexure file path"
                          disabled={isViewMode}
                        />
                        {errors.annexureFilePath && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.annexureFilePath[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Service Details
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Service Charge Amount <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          value={workOrder.serviceChargeAmount}
                          onChange={(e) =>
                            updateWorkOrder(index, "serviceChargeAmount", Number.parseFloat(e.target.value) || 0)
                          }
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.serviceChargeAmount 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter service charge amount"
                          disabled={isViewMode}
                        />
                        {errors.serviceChargeAmount && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.serviceChargeAmount[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Work Order Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={workOrder.workOrderType}
                          onValueChange={(value) => updateWorkOrder(index, "workOrderType", value)}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.workOrderType 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}>
                            <SelectValue placeholder="Select work order type" />
                          </SelectTrigger>
                                                     <SelectContent>
                             <SelectItem value="Job Work">Job Work</SelectItem>
                             <SelectItem value="Man Power">Man Power</SelectItem>
                           </SelectContent>
                        </Select>
                        {errors.workOrderType && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.workOrderType[0]}
                          </p>
                        )}
                      </div>
                      <div className="group md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Work Order Line Items
                        </Label>
                        <Textarea
                          value={workOrder.workOrderLineItems}
                          onChange={(e) => updateWorkOrder(index, "workOrderLineItems", e.target.value)}
                          className={`border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.workOrderLineItems 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter work order line items"
                          rows={2}
                          disabled={isViewMode}
                        />
                        {errors.workOrderLineItems && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.workOrderLineItems[0]}
                          </p>
                        )}
                      </div>
                      <div className="group md:col-span-2">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Service Line Items
                        </Label>
                        <Textarea
                          value={workOrder.serviceLineItems}
                          onChange={(e) => updateWorkOrder(index, "serviceLineItems", e.target.value)}
                          className={`border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.serviceLineItems 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter service line items"
                          rows={2}
                          disabled={isViewMode}
                        />
                        {errors.serviceLineItems && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.serviceLineItems[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Service Code
                        </Label>
                        <Input
                          value={workOrder.serviceCode}
                          onChange={(e) => updateWorkOrder(index, "serviceCode", e.target.value)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.serviceCode 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter service code"
                          disabled={isViewMode}
                        />
                        {errors.serviceCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.serviceCode[0]}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          WC Charges Per Employee
                        </Label>
                        <Input
                          type="number"
                          value={workOrder.wcChargesPerEmployee}
                          onChange={(e) =>
                            updateWorkOrder(index, "wcChargesPerEmployee", Number.parseFloat(e.target.value) || 0)
                          }
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } ${
                            errors.wcChargesPerEmployee 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter WC charges per employee"
                          disabled={isViewMode}
                        />
                        {errors.wcChargesPerEmployee && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.wcChargesPerEmployee[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Employee Wages */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Employee Wages
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Wage Type
                        </Label>
                        <Select
                          value={workOrder.employeeWages?.wageType || ""}
                          onValueChange={(value) => {
                            const updatedWorkOrders = [...workOrders]
                            if (!updatedWorkOrders[index].employeeWages) {
                              updatedWorkOrders[index].employeeWages = {
                                wageType: "",
                                wageAmount: 0,
                              }
                            }
                            updatedWorkOrders[index].employeeWages.wageType = value
                            setWorkOrders(updatedWorkOrders)
                          }}
                          disabled={isViewMode}
                        >
                          <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}>
                            <SelectValue placeholder="Select wage type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="group">
                        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Wage Amount
                        </Label>
                        <Input
                          type="number"
                          value={workOrder.employeeWages?.wageAmount || 0}
                          onChange={(e) => {
                            const updatedWorkOrders = [...workOrders]
                            if (!updatedWorkOrders[index].employeeWages) {
                              updatedWorkOrders[index].employeeWages = {
                                wageType: "",
                                wageAmount: 0,
                              }
                            }
                            updatedWorkOrders[index].employeeWages.wageAmount = Number.parseFloat(e.target.value) || 0
                            setWorkOrders(updatedWorkOrders)
                          }}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : ""
                          } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                          placeholder="Enter wage amount"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Asset Charges Per Day */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      Asset Charges Per Day
                    </h5>
                    {!isViewMode && (
                      <Button
                        onClick={() => addAssetCharge(index)}
                        variant="outline"
                        size="sm"
                        className="mb-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Asset Charge
                      </Button>
                    )}

                    {workOrder.assetChargesPerDay.map((asset, assetIndex) => (
                      <div key={assetIndex} className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h6 className="text-sm font-medium text-gray-700">Asset {assetIndex + 1}</h6>
                          {!isViewMode && (
                            <Button
                              onClick={() => removeAssetCharge(index, assetIndex)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="group">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Asset Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={asset.assetCode}
                              onChange={(e) => {
                                const updatedWorkOrders = [...workOrders]
                                updatedWorkOrders[index].assetChargesPerDay[assetIndex].assetCode = e.target.value
                                setWorkOrders(updatedWorkOrders)
                              }}
                              className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                                isViewMode 
                                  ? "bg-gray-100 cursor-not-allowed" 
                                  : ""
                              } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                              placeholder="Enter asset code"
                              disabled={isViewMode}
                            />
                          </div>
                          <div className="group">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Asset Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={asset.assetName}
                              onChange={(e) => {
                                const updatedWorkOrders = [...workOrders]
                                updatedWorkOrders[index].assetChargesPerDay[assetIndex].assetName = e.target.value
                                setWorkOrders(updatedWorkOrders)
                              }}
                              className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                                isViewMode 
                                  ? "bg-gray-100 cursor-not-allowed" 
                                  : ""
                              } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                              placeholder="Enter asset name"
                              disabled={isViewMode}
                            />
                          </div>
                          <div className="group">
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Asset Charges <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              type="number"
                              value={asset.assetCharges}
                              onChange={(e) => {
                                const updatedWorkOrders = [...workOrders]
                                updatedWorkOrders[index].assetChargesPerDay[assetIndex].assetCharges =
                                  Number.parseFloat(e.target.value) || 0
                                setWorkOrders(updatedWorkOrders)
                              }}
                              className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                                isViewMode 
                                  ? "bg-gray-100 cursor-not-allowed" 
                                  : ""
                              } border-gray-200 focus:border-blue-500 focus:ring-blue-500/20`}
                              placeholder="Enter asset charges"
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
              <div className={`w-3 h-3 rounded-full ${workOrders.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {workOrders.length > 0 ? `${workOrders.length} work order(s) added` : 'At least one work order is required'}
              </span>
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