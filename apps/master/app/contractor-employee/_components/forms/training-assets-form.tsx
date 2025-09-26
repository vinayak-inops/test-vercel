"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Switch } from "@repo/ui/components/ui/switch"
import { Separator } from "@repo/ui/components/ui/separator"
import { Briefcase, Plus, Trash2, Upload, FileCheck, X, GraduationCap, Package, FileText } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useState, useEffect } from "react"

// Zod Schema for validation
const trainingAssetsSchema = z.object({
  trainings: z.array(z.object({
    trainingProgram: z.object({
      trainingProgramCode: z.string().min(1, "Training program code is required"),
      trainingProgramTitle: z.string().min(1, "Training program title is required"),
    }),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    totalDays: z.number().optional(),
    totalHours: z.string().optional(),
    validUpto: z.string().optional(),
    conductedByFaculty: z.string().optional(),
    conductedByCompany: z.string().optional(),
    filePath: z.string().optional(),
  })),
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
  })),
  workOrder: z.array(z.object({
    workOrderNumber: z.string().min(1, "Work order number is required"),
    effectiveFrom: z.string().optional(),
    effectiveTo: z.string().optional(),
  })).min(1, "At least one work order is required"),
  cards: z.array(z.object({
    cardNumber: z.string().min(1, "Card number is required"),
    cardType: z.string().min(1, "Card type is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
    isActive: z.boolean(),
  })),
})

type TrainingAssetsData = z.infer<typeof trainingAssetsSchema>

interface TrainingAssetsFormProps {
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

const assetTypeOptions = [
  { code: "AT001", title: "Returnable" },
  { code: "AT002", title: "Non-Returnable" },
  { code: "AT003", title: "Consumable" },
  { code: "AT004", title: "Equipment" },
]

const trainingProgramOptions = [
  { code: "TRP001", title: "Safety Training" },
  { code: "TRP002", title: "Technical Training" },
  { code: "TRP003", title: "Soft Skills Training" },
  { code: "TRP004", title: "Compliance Training" },
]

export function TrainingAssetsForm({ 
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
}: TrainingAssetsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const currentMode = mode || searchParams.get('mode') || 'add'
  const isViewMode = currentMode === 'view'



  const { post: postTrainingAssets } = usePostRequest({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Training assets saved:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving training assets:", error)
    }
  })

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<TrainingAssetsData>({
    resolver: zodResolver(trainingAssetsSchema),
    defaultValues: {
      trainings: [],
      assetAllocated: [],
      workOrder: [{
        workOrderNumber: "",
        effectiveFrom: "",
        effectiveTo: "",
      }],
      cards: [{
        cardNumber: "",
        cardType: "",
        issueDate: "",
        expiryDate: "",
        isActive: true,
      }],
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  // Fetch employee data and populate form


  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.trainings) {
        setValue("trainings", auditStatusFormData.trainings)
      }
      if (auditStatusFormData.assetAllocated) {
        setValue("assetAllocated", auditStatusFormData.assetAllocated)
      }
      if (auditStatusFormData.workOrder) {
        setValue("workOrder", auditStatusFormData.workOrder)
      }
      if (auditStatusFormData.cards) {
        setValue("cards", auditStatusFormData.cards)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])

  // Training Add/Remove
  const addTraining = () => {
    const newTrainings = [...(watchedValues.trainings || []), {
      trainingProgram: {
        trainingProgramCode: "",
        trainingProgramTitle: "",
      },
      fromDate: "",
      toDate: "",
      totalDays: 0,
      totalHours: "",
      validUpto: "",
      conductedByFaculty: "",
      conductedByCompany: "",
      filePath: "",
    }]
    setValue("trainings", newTrainings)
    onFormDataChange({ trainings: newTrainings })
  }
  const removeTraining = (index: number) => {
    const newTrainings = watchedValues.trainings?.filter((_, i) => i !== index) || []
    setValue("trainings", newTrainings)
    onFormDataChange({ trainings: newTrainings })
  }

  // Asset Add/Remove
  const addAsset = () => {
    const newAssets = [...(watchedValues.assetAllocated || []), {
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
    }]
    setValue("assetAllocated", newAssets)
    onFormDataChange({ assetAllocated: newAssets })
  }
  const removeAsset = (index: number) => {
    const newAssets = watchedValues.assetAllocated?.filter((_, i) => i !== index) || []
    setValue("assetAllocated", newAssets)
    onFormDataChange({ assetAllocated: newAssets })
  }

  // Work Order Add/Remove
  const addWorkOrder = () => {
    const newWorkOrders = [...(watchedValues.workOrder || []), {
      workOrderNumber: "",
      effectiveFrom: "",
      effectiveTo: "",
    }]
    const newCards = [...(watchedValues.cards || []), {
      cardNumber: "",
      cardType: "",
      issueDate: "",
      expiryDate: "",
      isActive: true,
    }]
    setValue("workOrder", newWorkOrders)
    setValue("cards", newCards)
    onFormDataChange({ workOrder: newWorkOrders, cards: newCards })
  }
  const removeWorkOrder = (index: number) => {
    const newWorkOrders = watchedValues.workOrder?.filter((_, i) => i !== index) || []
    const newCards = watchedValues.cards?.filter((_, i) => i !== index) || []
    setValue("workOrder", newWorkOrders)
    setValue("cards", newCards)
    onFormDataChange({ workOrder: newWorkOrders, cards: newCards })
  }

  // Cards Add/Remove
  const addCard = () => {
    const newWorkOrders = [...(watchedValues.workOrder || []), {
      workOrderNumber: "",
      effectiveFrom: "",
      effectiveTo: "",
    }]
    const newCards = [...(watchedValues.cards || []), {
      cardNumber: "",
      cardType: "",
      issueDate: "",
      expiryDate: "",
      isActive: true,
    }]
    setValue("workOrder", newWorkOrders)
    setValue("cards", newCards)
    onFormDataChange({ workOrder: newWorkOrders, cards: newCards })
  }
  const removeCard = (index: number) => {
    const newWorkOrders = watchedValues.workOrder?.filter((_, i) => i !== index) || []
    const newCards = watchedValues.cards?.filter((_, i) => i !== index) || []
    setValue("workOrder", newWorkOrders)
    setValue("cards", newCards)
    onFormDataChange({ workOrder: newWorkOrders, cards: newCards })
  }

  const handleReset = () => {
    reset()
    setShowErrors(false)
    // Clear auditStatusFormData or call onFormDataChange with empty data
    onFormDataChange({
      trainings: [],
      assetAllocated: [],
      workOrder: [{
        workOrderNumber: "",
        effectiveFrom: "",
        effectiveTo: "",
      }],
      cards: [{
        cardNumber: "",
        cardType: "",
        issueDate: "",
        expiryDate: "",
        isActive: true,
      }]
    })
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    try {
      const valid = await trigger()
      
      if (valid) {
        const formValues = watch()
        
        // Convert nested form values to flat data structure
        const flatData = {
          trainings: formValues.trainings || [],
          assetAllocated: formValues.assetAllocated || [],
          workOrder: formValues.workOrder || [],
          cards: formValues.cards || []
        }

        if (currentMode === 'add') {
          setAuditStatusFormData?.({
            ...auditStatusFormData,
            ...flatData,
          })
          setAuditStatus?.({
            ...auditStatus,
            trainingAssets: true
          })
          if (onNextTab) onNextTab()
        } else {
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
          await postTrainingAssets(json)
        }
      } else {
        console.log("Form validation failed")
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Training & Assets</CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Training programs completed and assets allocated to the employee
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Training Programs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Training Programs
              </h3>
              <Button 
                type="button" 
                disabled={isViewMode}
                onClick={addTraining} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Training
              </Button>
            </div>
            
            {watchedValues.trainings && watchedValues.trainings.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.trainings.map((training, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">{training.trainingProgram.trainingProgramTitle || `Training ${index + 1}`}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        {watchedValues.trainings.length > 0 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeTraining(index)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Training Program Code <span className="text-red-500">*</span></Label>
                        <Select value={training.trainingProgram.trainingProgramCode} onValueChange={value => {
                          const option = trainingProgramOptions.find(opt => opt.code === value)
                          setValue(`trainings.${index}.trainingProgram.trainingProgramCode`, value)
                          setValue(`trainings.${index}.trainingProgram.trainingProgramTitle`, option?.title || "")
                          onFormDataChange({
                            trainings: watchedValues.trainings.map((t, i) => 
                              i === index ? { 
                                ...t, 
                                trainingProgram: { 
                                  trainingProgramCode: value, 
                                  trainingProgramTitle: option?.title || "" 
                                } 
                              } : t
                            )
                          })
                        }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.trainingProgram?.trainingProgramCode) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}>
                            <SelectValue placeholder="Select training program" />
                          </SelectTrigger>
                          <SelectContent>
                            {trainingProgramOptions.map(option => (
                              <SelectItem key={option.code} value={option.code}>
                                {option.code} - {option.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {showErrors && errors.trainings?.[index]?.trainingProgram?.trainingProgramCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].trainingProgram.trainingProgramCode.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Training Program Title <span className="text-red-500">*</span></Label>
                        <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg text-blue-800 flex items-center font-medium">
                          {training.trainingProgram.trainingProgramTitle || "Will auto-fill from code"}
                        </div>
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">From Date</Label>
                        <Input type="date" {...register(`trainings.${index}.fromDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.fromDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.trainings?.[index]?.fromDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].fromDate.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">To Date</Label>
                        <Input type="date" {...register(`trainings.${index}.toDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.toDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.trainings?.[index]?.toDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].toDate.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Total Days</Label>
                        <Input type="number" {...register(`trainings.${index}.totalDays`, { valueAsNumber: true })} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.totalDays) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter total days" />
                        {showErrors && errors.trainings?.[index]?.totalDays && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].totalDays.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Total Hours</Label>
                        <Input {...register(`trainings.${index}.totalHours`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.totalHours) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter total hours" />
                        {showErrors && errors.trainings?.[index]?.totalHours && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].totalHours.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Valid Until</Label>
                        <Input type="date" {...register(`trainings.${index}.validUpto`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.validUpto) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.trainings?.[index]?.validUpto && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].validUpto.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Conducted By Faculty</Label>
                        <Input {...register(`trainings.${index}.conductedByFaculty`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.conductedByFaculty) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter faculty name" />
                        {showErrors && errors.trainings?.[index]?.conductedByFaculty && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].conductedByFaculty.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Conducted By Company</Label>
                        <Input {...register(`trainings.${index}.conductedByCompany`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.trainings?.[index]?.conductedByCompany) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter company name" />
                        {showErrors && errors.trainings?.[index]?.conductedByCompany && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.trainings[index].conductedByCompany.message}</p>
                        )}
                      </div>
                    </div>
                    {/* Training Document Upload */}
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700">Training Certificate</Label>
                      <div className="relative mt-2">
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const file = e.target.files?.[0]; if (file) { setValue(`trainings.${index}.filePath`, file.name); onFormDataChange({ trainings: watchedValues.trainings.map((t, i) => i === index ? { ...t, filePath: file.name } : t) }) } }} className="hidden" id={`trainingFilePath${index}`} />
                        {training.filePath ? (
                          <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <FileCheck className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-800">{training.filePath}</span>
                            <Button type="button" variant="outline" size="sm" onClick={() => { setValue(`trainings.${index}.filePath`, ""); onFormDataChange({ trainings: watchedValues.trainings.map((t, i) => i === index ? { ...t, filePath: "" } : t) }) }} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">Remove</Button>
                          </div>
                        ) : (
                          <Button type="button" onClick={() => document.getElementById(`trainingFilePath${index}`)?.click()} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50">
                            <Upload className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700">Upload Training Certificate</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No training programs added yet. Click "Add Training" to get started.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Asset Allocation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Asset Allocation
              </h3>
              <Button 
                type="button" 
                disabled={isViewMode}
                onClick={addAsset} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Allocate Asset
              </Button>
            </div>
            
            {watchedValues.assetAllocated && watchedValues.assetAllocated.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.assetAllocated.map((asset, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-800">{asset.asset.assetName} - {asset.asset.assetCode}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">Allocated</Badge>
                        {watchedValues.assetAllocated.length > 0 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeAsset(index)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Code <span className="text-red-500">*</span></Label>
                        <Input {...register(`assetAllocated.${index}.asset.assetCode`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.assetAllocated?.[index]?.asset?.assetCode) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter asset code" />
                        {showErrors && errors.assetAllocated?.[index]?.asset?.assetCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.assetAllocated[index].asset.assetCode.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Name <span className="text-red-500">*</span></Label>
                        <Input {...register(`assetAllocated.${index}.asset.assetName`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.assetAllocated?.[index]?.asset?.assetName) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter asset name" />
                        {showErrors && errors.assetAllocated?.[index]?.asset?.assetName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.assetAllocated[index].asset.assetName.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Asset Type</Label>
                        <Select value={asset.asset.assetType.assetTypeCode} onValueChange={value => {
                          const option = assetTypeOptions.find(opt => opt.code === value)
                          setValue(`assetAllocated.${index}.asset.assetType.assetTypeCode`, value)
                          setValue(`assetAllocated.${index}.asset.assetType.assetTypeTitle`, option?.title || "")
                          onFormDataChange({
                            assetAllocated: watchedValues.assetAllocated.map((a, i) => 
                              i === index ? { 
                                ...a, 
                                asset: { 
                                  ...a.asset, 
                                  assetType: { 
                                    assetTypeCode: value, 
                                    assetTypeTitle: option?.title || "" 
                                  } 
                                } 
                              } : a
                            )
                          })
                        }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.assetAllocated?.[index]?.asset?.assetType?.assetTypeCode) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}>
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
                        {showErrors && errors.assetAllocated?.[index]?.asset?.assetType?.assetTypeCode && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.assetAllocated[index].asset.assetType.assetTypeCode.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Issue Date</Label>
                        <Input type="date" {...register(`assetAllocated.${index}.issueDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.assetAllocated?.[index]?.issueDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.assetAllocated?.[index]?.issueDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.assetAllocated[index].issueDate.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Return Date</Label>
                        <Input type="date" {...register(`assetAllocated.${index}.returnDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.assetAllocated?.[index]?.returnDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.assetAllocated?.[index]?.returnDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.assetAllocated[index].returnDate.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No assets allocated yet. Click "Allocate Asset" to get started.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Work Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Work Orders & Related Security pass
              </h3>
              <Button 
                type="button" 
                disabled={isViewMode}
                onClick={addWorkOrder} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Work Order
              </Button>
            </div>
            
            {watchedValues.workOrder && watchedValues.workOrder.length > 0 ? (
              <div className="space-y-6">
                {watchedValues.workOrder.map((workOrder, index) => (
                  <div key={index} className="space-y-4">
                    {/* Work Order */}
                    <div className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-800">Work Order - {workOrder.workOrderNumber || `WO${index + 1}`}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                          {watchedValues.workOrder.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeWorkOrder(index)} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="group">
                          <Label className="text-sm font-medium text-gray-700">Work Order Number <span className="text-red-500">*</span></Label>
                          <Input {...register(`workOrder.${index}.workOrderNumber`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.workOrder?.[index]?.workOrderNumber) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter work order number" />
                          {showErrors && errors.workOrder?.[index]?.workOrderNumber && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.workOrder[index].workOrderNumber.message}</p>
                          )}
                        </div>
                        <div className="group">
                          <Label className="text-sm font-medium text-gray-700">Effective From</Label>
                          <Input type="date" {...register(`workOrder.${index}.effectiveFrom`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.workOrder?.[index]?.effectiveFrom) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                          {showErrors && errors.workOrder?.[index]?.effectiveFrom && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.workOrder[index].effectiveFrom.message}</p>
                          )}
                        </div>
                        <div className="group">
                          <Label className="text-sm font-medium text-gray-700">Effective To</Label>
                          <Input type="date" {...register(`workOrder.${index}.effectiveTo`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.workOrder?.[index]?.effectiveTo) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                          {showErrors && errors.workOrder?.[index]?.effectiveTo && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.workOrder[index].effectiveTo.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Related Card */}
                    {watchedValues.cards && watchedValues.cards[index] && (
                      <div className="p-6 border border-gray-200 rounded-xl bg-gray-50/50 ml-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-800">Related Security pass - {watchedValues.cards[index].cardNumber || `Card${index + 1}`}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${watchedValues.cards[index].isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {watchedValues.cards[index].isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="group">
                            <Label className="text-sm font-medium text-gray-700">Security Pass Number <span className="text-red-500">*</span></Label>
                            <Input {...register(`cards.${index}.cardNumber`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.cards?.[index]?.cardNumber) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter card number" />
                            {showErrors && errors.cards?.[index]?.cardNumber && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.cards[index].cardNumber.message}</p>
                            )}
                          </div>
                          <div className="group">
                            <Label className="text-sm font-medium text-gray-700">Card Type <span className="text-red-500">*</span></Label>
                            <Input {...register(`cards.${index}.cardType`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.cards?.[index]?.cardType) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter card type" />
                            {showErrors && errors.cards?.[index]?.cardType && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.cards[index].cardType.message}</p>
                            )}
                          </div>
                          <div className="group">
                            <Label className="text-sm font-medium text-gray-700">Issue Date <span className="text-red-500">*</span></Label>
                            <Input type="date" {...register(`cards.${index}.issueDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.cards?.[index]?.issueDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                            {showErrors && errors.cards?.[index]?.issueDate && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.cards[index].issueDate.message}</p>
                            )}
                          </div>
                          <div className="group">
                            <Label className="text-sm font-medium text-gray-700">Expiry Date <span className="text-red-500">*</span></Label>
                            <Input type="date" {...register(`cards.${index}.expiryDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.cards?.[index]?.expiryDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                            {showErrors && errors.cards?.[index]?.expiryDate && (
                              <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.cards[index].expiryDate.message}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <Switch checked={watchedValues.cards[index].isActive} onCheckedChange={checked => { setValue(`cards.${index}.isActive`, checked); onFormDataChange({ cards: watchedValues.cards.map((c, i) => i === index ? { ...c, isActive: checked } : c) }) }} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
                            <Label className="text-sm text-gray-700 font-medium cursor-pointer">
                              {watchedValues.cards[index].isActive ? (
                                <span className="text-blue-600">Card Active</span>
                              ) : (
                                <span className="text-gray-500">Mark as Active</span>
                              )}
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No work orders added yet. Click "Add Work Order" to get started.</p>
              </div>
            )}
          </div>

          <Separator />

        </div>
        {/* Action Buttons */}
        {!isViewMode && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {onPreviousTab && (
                <Button type="button" variant="outline" onClick={onPreviousTab} className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"><span>Back</span></Button>
              )}
              <Button type="button" variant="outline" onClick={handleReset} className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors">Reset Form</Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">{isValid ? 'Form is valid and ready to continue' : 'Please complete all required fields'}</span>
              </div>
              <Button type="button" onClick={handleSaveAndContinue} className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"><span>Save & Continue</span></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 