"use client"

import type React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSearchParams } from "next/navigation"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Switch } from "@repo/ui/components/ui/switch"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Separator } from "@repo/ui/components/ui/separator"
import { Settings, Plus, Trash2, Upload, FileText, FileCheck, X, Calendar, AlertTriangle, DollarSign, Save, RotateCcw, Package } from "lucide-react"
import { useState, useEffect } from "react"

// Enhanced Zod schema for validation
const actionsStatusSchema = z.object({
  remark: z.string().optional(),
  status: z.object({
    currentStatus: z.string().min(1, "Current status is required"),
    resignationDate: z.string().optional(),
    relievingDate: z.string().optional(),
    notToReHire: z.boolean(),
  }),

  penalty: z.array(z.object({
    dateOfOffence: z.string().min(1, "Date of offence is required"),
    offenceDescription: z.string().min(1, "Offence description is required"),
    actionTaken: z.string().min(1, "Action taken is required"),
    fineImposed: z.number().min(0, "Fine amount must be non-negative"),
    month: z.number().min(1, "Month is required").max(12, "Month must be between 1-12"),
    isCauseShownAgainstFine: z.boolean(),
    witnessName: z.string().optional(),
    fineRealisedDate: z.string().optional(),
  })).optional(),
  disciplinaryAction: z.array(z.object({
    actionTakenOn: z.string().min(1, "Action taken date is required"),
    issueReportedOn: z.string().min(1, "Issue reported date is required"),
    issuedescription: z.string().min(1, "Issue description is required"),
    actionDescription: z.string().min(1, "Action description is required"),
    remark: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    documentPath: z.string().optional(),
  })).optional(),
  assetAllocated: z.array(z.object({
    asset: z.object({
      assetCode: z.string().min(1, "Asset code is required"),
      assetName: z.string().min(1, "Asset name is required"),
      assetType: z.object({
        assetTypeCode: z.string().optional(),
        assetTypeTitle: z.string().optional(),
      }),
    }),
    issueDate: z.string().optional(),
    returnDate: z.string().optional(),
  })).optional(),
})

type ActionsStatusFormData = z.infer<typeof actionsStatusSchema>

interface ActionsStatusFormProps {
  formData: any
  onFormDataChange: (data: any) => void
  onPreviousTab?: () => void
  onNextTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
  isSubmitting?: boolean
}

// Helper function to format date for MongoDB
const formatDateForMongoDB = (dateString: string) => {
  if (!dateString) return null
  return { $date: new Date(dateString).toISOString() }
}

// Helper function to get current user ID (replace with your auth logic)
const getCurrentUserId = () => {
  // This should be replaced with your actual authentication logic
  return "current-user-id"
}

const assetTypeOptions = [
  { code: "AT001", title: "Returnable" },
  { code: "AT002", title: "Non-Returnable" },
  { code: "AT003", title: "Consumable" },
  { code: "AT004", title: "Equipment" },
]

export function ActionsStatusForm({ 
  formData, 
  onFormDataChange, 
  onPreviousTab,
  onNextTab,
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab,
  isSubmitting = false 
}: ActionsStatusFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const currentMode = mode || searchParams.get('mode') || 'add'
  const isViewMode = currentMode === 'view'



  const { post: postActionsStatus } = usePostRequest({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Actions status saved:", data)
      if (currentMode === 'add' && onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving actions status:", error)
    }
  })

  const {
    register,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
    reset,
    control,
    handleSubmit,
  } = useForm<ActionsStatusFormData>({
    resolver: zodResolver(actionsStatusSchema),
    defaultValues: {
      remark: "",
      status: {
        currentStatus: "Active",
        resignationDate: "",
        relievingDate: "",
        notToReHire: false,
      },

      penalty: [],
      disciplinaryAction: [],
      assetAllocated: [],
    },
    mode: "onChange",
  })

  const { fields: penaltyFields, append: appendPenalty, remove: removePenalty } = useFieldArray({
    control,
    name: "penalty",
  })

  const { fields: disciplinaryActionFields, append: appendDisciplinaryAction, remove: removeDisciplinaryAction } = useFieldArray({
    control,
    name: "disciplinaryAction",
  })

  const { fields: assetAllocatedFields, append: appendAssetAllocated, remove: removeAssetAllocated } = useFieldArray({
    control,
    name: "assetAllocated",
  })

  const watchedValues = watch()


  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.remark) {
        setValue("remark", auditStatusFormData.remark)
      }
      if (auditStatusFormData.status) {
        setValue("status", auditStatusFormData.status)
      }

      if (auditStatusFormData.penalty) {
        setValue("penalty", auditStatusFormData.penalty)
      }
      if (auditStatusFormData.disciplinaryAction) {
        setValue("disciplinaryAction", auditStatusFormData.disciplinaryAction)
      }
      if (auditStatusFormData.assetAllocated) {
        setValue("assetAllocated", auditStatusFormData.assetAllocated)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])



  const handleReset = () => {
    reset()
    setShowErrors(false)
    // Clear auditStatusFormData or call onFormDataChange with empty data
    if (currentMode === 'add') {
      onFormDataChange({
        remark: "",
        status: {
          currentStatus: "Active",
          resignationDate: "",
          relievingDate: "",
          notToReHire: false,
        },
        penalty: [],
        disciplinaryAction: [],
        assetAllocated: []
      })
    } else {
      onFormDataChange({
        remark: "",
        status: {
          currentStatus: "Active",
          resignationDate: "",
          relievingDate: "",
          notToReHire: false,
        },
        penalty: [],
        disciplinaryAction: [],
        assetAllocated: []
      })
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    setIsLoading(true)
    
    try {
      const valid = await trigger()
      
      if (valid) {
        const formValues = watch()
        
        // Convert nested form values to flat data structure
        const flatData = {
          remark: formValues.remark || "",
          status: formValues.status || {
            currentStatus: "Active",
            resignationDate: "",
            relievingDate: "",
            notToReHire: false,
          },

          penalty: formValues.penalty || [],
          disciplinaryAction: formValues.disciplinaryAction || [],
          assetAllocated: formValues.assetAllocated || []
        }

        if (currentMode === 'add') {
          setAuditStatusFormData?.({
            ...auditStatusFormData,
            ...flatData,
          })
          setAuditStatus?.({
            ...auditStatus,
            actionsStatus: true
          })
          if (onNextTab) onNextTab()
        } else {
          // Save to backend for edit mode
          const json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id ,
            collectionName: "contract_employee",
            data: {
              ...auditStatusFormData,
              ...flatData,
            }
          }
          await postActionsStatus(json)
        }
      } else {
        console.log("Form validation failed")
      }
    } catch (error) {
      console.error("Error saving form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = handleSubmit(handleSaveAndContinue)



  // Enhanced file upload handler
  const handleFileUpload = (index: number, field: 'disciplinaryAction') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setValue(`${field}.${index}.documentPath`, file.name)
      }
    }
    input.click()
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
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Actions & Status</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Employee status, disciplinary actions, and administrative details
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`px-3 py-1 text-sm ${
                isValid ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'
              }`}>
                {isValid ? 'Valid' : 'Validation Required'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Current Status */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Current Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Employment Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedValues.status?.currentStatus}
                    disabled={isViewMode}
                    onValueChange={(value) => setValue("status.currentStatus", value)}
                  >
                    <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                      (showErrors && errors.status?.currentStatus) 
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Terminated">Terminated</SelectItem>
                      <SelectItem value="Resigned">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                  {showErrors && errors.status?.currentStatus && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.status.currentStatus.message}
                    </p>
                  )}
                </div>
                <div className="group">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Re-hire Status
                  </Label>
                  <div className="flex items-center space-x-2 pt-3">
                    <Switch
                      checked={watchedValues.status?.notToReHire}
                      disabled={isViewMode}
                      onCheckedChange={(checked) => setValue("status.notToReHire", checked)}
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                    />
                    <Label className="text-sm text-gray-700">
                      Not to Re-hire
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="lg:col-span-3 my-2" />

            {/* Status Dates */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Status Dates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Resignation Date
                  </Label>
                  <Input
                    {...register("status.resignationDate")}
                    type="date"
                    disabled={isViewMode}
                    className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  />
                </div>
                <div className="group">
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Relieving Date
                  </Label>
                  <Input
                    {...register("status.relievingDate")}
                    type="date"
                    disabled={isViewMode}
                    className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* <Separator className="lg:col-span-3 my-2" />

            <div className="lg:col-span-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Status Badge
              </h3>
              <div className="flex items-center gap-4">
                <Badge className={`px-4 py-2 text-sm font-medium ${
                  watchedValues.status?.currentStatus === "Active" 
                    ? "bg-green-100 text-green-800" 
                    : watchedValues.status?.currentStatus === "Inactive"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {watchedValues.status?.currentStatus || "Select Status"}
                </Badge>
              </div>
            </div> */}

            <Separator className="lg:col-span-3 my-2" />

            {/* Disciplinary Actions */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                  Disciplinary Actions
                </h3>
                <Button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => appendDisciplinaryAction({
                    actionTakenOn: "",
                    issueReportedOn: "",
                    issuedescription: "",
                    actionDescription: "",
                    remark: "",
                    status: "Open",
                    documentPath: "",
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-4">
                {disciplinaryActionFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No disciplinary actions added yet</p>
                    <p className="text-sm">Click "Add Action" to get started</p>
                  </div>
                )}

                {disciplinaryActionFields.map((field, index) => (
                  <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">Disciplinary Action #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          watchedValues.disciplinaryAction?.[index]?.status === "Closed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {watchedValues.disciplinaryAction?.[index]?.status || "Open"}
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDisciplinaryAction(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Issue Reported On <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`disciplinaryAction.${index}.issueReportedOn`)}
                          type="date"
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.disciplinaryAction?.[index]?.issueReportedOn) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                        />
                        {showErrors && errors.disciplinaryAction?.[index]?.issueReportedOn && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.disciplinaryAction[index]?.issueReportedOn?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Action Taken On <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`disciplinaryAction.${index}.actionTakenOn`)}
                          type="date"
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.disciplinaryAction?.[index]?.actionTakenOn) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                        />
                        {showErrors && errors.disciplinaryAction?.[index]?.actionTakenOn && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.disciplinaryAction[index]?.actionTakenOn?.message}
                          </p>
                        )}
                      </div>
                      <div className="group lg:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Issue Description <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`disciplinaryAction.${index}.issuedescription`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.disciplinaryAction?.[index]?.issuedescription) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter issue description"
                        />
                        {showErrors && errors.disciplinaryAction?.[index]?.issuedescription && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.disciplinaryAction[index]?.issuedescription?.message}
                          </p>
                        )}
                      </div>
                      <div className="group lg:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Action Description <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`disciplinaryAction.${index}.actionDescription`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.disciplinaryAction?.[index]?.actionDescription) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter action description"
                        />
                        {showErrors && errors.disciplinaryAction?.[index]?.actionDescription && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.disciplinaryAction[index]?.actionDescription?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></Label>
                        <Select
                          value={watchedValues.disciplinaryAction?.[index]?.status}
                          onValueChange={(value) => setValue(`disciplinaryAction.${index}.status`, value)}
                        >
                          <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Remark</Label>
                        <Input
                          {...register(`disciplinaryAction.${index}.remark`)}
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                          placeholder="Enter remark"
                        />
                      </div>
                      <div className="group lg:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Document</Label>
                        <div className="relative">
                          {watchedValues.disciplinaryAction?.[index]?.documentPath ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <FileCheck className="h-5 w-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">Disciplinary Document</p>
                                <p className="text-xs text-green-600">File uploaded successfully</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setValue(`disciplinaryAction.${index}.documentPath`, "")
                                }}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => handleFileUpload(index, 'disciplinaryAction')}
                              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                            >
                              <Upload className="h-6 w-6 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Upload Disciplinary Document</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="lg:col-span-3 my-2" />

            {/* Asset Allocation */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Asset Allocation
                </h3>
                <Button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => appendAssetAllocated({
                    asset: {
                      assetCode: "",
                      assetName: "",
                      assetType: {
                        assetTypeCode: "",
                        assetTypeTitle: "",
                      },
                    },
                    issueDate: "",
                    returnDate: "",
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Allocate Asset
                </Button>
              </div>

              <div className="space-y-4">
                {assetAllocatedFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No assets allocated yet</p>
                    <p className="text-sm">Click "Allocate Asset" to get started</p>
                  </div>
                )}

                {assetAllocatedFields.map((field, index) => (
                  <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">{watchedValues.assetAllocated?.[index]?.asset?.assetName || `Asset ${index + 1}`} - {watchedValues.assetAllocated?.[index]?.asset?.assetCode || 'No Code'}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Allocated</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAssetAllocated(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Code <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`assetAllocated.${index}.asset.assetCode`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.assetAllocated?.[index]?.asset?.assetCode) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter asset code"
                        />
                        {showErrors && errors.assetAllocated?.[index]?.asset?.assetCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.assetAllocated[index]?.asset?.assetCode?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Name <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`assetAllocated.${index}.asset.assetName`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.assetAllocated?.[index]?.asset?.assetName) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter asset name"
                        />
                        {showErrors && errors.assetAllocated?.[index]?.asset?.assetName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.assetAllocated[index]?.asset?.assetName?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Type</Label>
                        <Select
                          value={watchedValues.assetAllocated?.[index]?.asset?.assetType?.assetTypeCode}
                          onValueChange={(value) => {
                            const option = assetTypeOptions.find(opt => opt.code === value)
                            setValue(`assetAllocated.${index}.asset.assetType.assetTypeCode`, value)
                            setValue(`assetAllocated.${index}.asset.assetType.assetTypeTitle`, option?.title || "")
                          }}
                        >
                          <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                            <SelectValue placeholder="Select asset type" />
                          </SelectTrigger>
                          <SelectContent>
                            {assetTypeOptions.map(option => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.code} - {option.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
                        <Input
                          {...register(`assetAllocated.${index}.issueDate`)}
                          type="date"
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                        />
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Return Date</Label>
                        <Input
                          {...register(`assetAllocated.${index}.returnDate`)}
                          type="date"
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="lg:col-span-3 my-2" />

            {/* Penalties */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Penalties
                </h3>
                <Button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => appendPenalty({
                    dateOfOffence: "",
                    offenceDescription: "",
                    actionTaken: "",
                    fineImposed: 0,
                    month: 1,
                    isCauseShownAgainstFine: false,
                    witnessName: "",
                    fineRealisedDate: "",
                  })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Penalty
                </Button>
              </div>

              <div className="space-y-4">
                {penaltyFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No penalties added yet</p>
                    <p className="text-sm">Click "Add Penalty" to get started</p>
                  </div>
                )}

                {penaltyFields.map((field, index) => (
                  <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">Penalty #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800">
                          ${watchedValues.penalty?.[index]?.fineImposed || 0} Fine
                        </Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePenalty(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Date of Offence <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`penalty.${index}.dateOfOffence`)}
                          type="date"
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.penalty?.[index]?.dateOfOffence) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                        />
                        {showErrors && errors.penalty?.[index]?.dateOfOffence && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.penalty[index]?.dateOfOffence?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Fine Amount <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`penalty.${index}.fineImposed`, { valueAsNumber: true })}
                          type="number"
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.penalty?.[index]?.fineImposed) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter fine amount"
                        />
                        {showErrors && errors.penalty?.[index]?.fineImposed && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.penalty[index]?.fineImposed?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Month <span className="text-red-500">*</span></Label>
                        <Select
                          value={watchedValues.penalty?.[index]?.month?.toString()}
                          onValueChange={(value) => setValue(`penalty.${index}.month`, parseInt(value))}
                        >
                          <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Offence Description <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`penalty.${index}.offenceDescription`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.penalty?.[index]?.offenceDescription) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter offence description"
                        />
                        {showErrors && errors.penalty?.[index]?.offenceDescription && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.penalty[index]?.offenceDescription?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Action Taken <span className="text-red-500">*</span></Label>
                        <Input
                          {...register(`penalty.${index}.actionTaken`)}
                          className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                            (showErrors && errors.penalty?.[index]?.actionTaken) 
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          }`}
                          placeholder="Enter action taken"
                        />
                        {showErrors && errors.penalty?.[index]?.actionTaken && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {errors.penalty[index]?.actionTaken?.message}
                          </p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Witness Name</Label>
                        <Input
                          {...register(`penalty.${index}.witnessName`)}
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                          placeholder="Enter witness name"
                        />
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Fine Realised Date</Label>
                        <Input
                          {...register(`penalty.${index}.fineRealisedDate`)}
                          type="date"
                          className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                        />
                      </div>
                      <div className="group lg:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Cause Shown Against Fine</Label>
                        <div className="flex items-center space-x-2 pt-3">
                          <Switch
                            checked={watchedValues.penalty?.[index]?.isCauseShownAgainstFine}
                            onCheckedChange={(checked) => setValue(`penalty.${index}.isCauseShownAgainstFine`, checked)}
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                          />
                          <Label className="text-sm text-gray-700">
                            Cause shown against fine
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* General Remarks */}
            <div className="lg:col-span-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                General Remarks
              </h3>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Remarks</Label>
                <Textarea
                  {...register("remark")}
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter general remarks"
                  rows={3}
                />
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
                  className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Form
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {isValid ? 'Form is valid and ready to continue' : 'Please complete all required fields'}
                  </span>
                </div>
                
                <Button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={isLoading || isSubmitting}
                  className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save & Continue
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 