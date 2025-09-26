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
import { Heart, Plus, Trash2, Upload, FileText, FileCheck, X, Shield, Calendar } from "lucide-react"
import { useState, useEffect } from "react"

// Zod schema for validation
const medicalSafetySchema = z.object({
  medicalVerificationRemark: z.string().optional(),
  covidVaccine: z.object({
    vaccine1: z.boolean(),
    vaccine2: z.boolean(),
    vaccine3: z.boolean(),
    vaccine1Certificate: z.string().optional(),
    vaccine2Certificate: z.string().optional(),
    vaccine3Certificate: z.string().optional(),
  }),
  policeVerification: z.array(z.object({
    verificationDate: z.string().min(1, "Verification date is required"),
    nextVerificationDate: z.string().min(1, "Next verification date is required"),
    description: z.string().min(1, "Description is required"),
    policeStationDetail: z.string().min(1, "Police station detail is required"),
    policeStationPinCode: z.string().min(1, "Police station pin code is required"),
    documentPath: z.string().optional(),
  })).min(1, "At least one police verification is required"),
  medicalCheckup: z.array(z.object({
    checkupDate: z.string().min(1, "Checkup date is required"),
    nextCheckupDate: z.string().min(1, "Next checkup date is required"),
    description: z.string().min(1, "Description is required"),
    documentPath: z.string().optional(),
  })).optional(),
  accidentRegister: z.array(z.object({
    dateOfAccident: z.string().min(1, "Accident date is required"),
    dateOfReport: z.string().min(1, "Report date is required"),
    accidentDescription: z.string().min(1, "Accident description is required"),
    dateOfReturn: z.string().min(1, "Return date is required"),
  })).optional(),
})

type MedicalSafetyFormData = z.infer<typeof medicalSafetySchema>

interface MedicalSafetyFormProps {
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
}

export function MedicalSafetyForm({ 
  formData, 
  onFormDataChange, 
  onPreviousTab,
  onNextTab,
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: MedicalSafetyFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const currentMode = mode || searchParams.get('mode') || 'add'
  const isViewMode = currentMode === 'view'

 

  const { post: postMedicalSafety } = usePostRequest({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Medical safety saved:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving medical safety:", error)
    }
  })

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
    control,
  } = useForm<MedicalSafetyFormData>({
    resolver: zodResolver(medicalSafetySchema),
    defaultValues: {
      medicalVerificationRemark: "",
      covidVaccine: {
        vaccine1: false,
        vaccine2: false,
        vaccine3: false,
        vaccine1Certificate: "",
        vaccine2Certificate: "",
        vaccine3Certificate: "",
      },
      policeVerification: [{
        verificationDate: "",
        nextVerificationDate: "",
        description: "",
        policeStationDetail: "",
        policeStationPinCode: "",
        documentPath: "",
      }],
      medicalCheckup: [],
      accidentRegister: [],
    },
    mode: "onChange",
  })

  const { fields: policeVerificationFields, append: appendPoliceVerification, remove: removePoliceVerification } = useFieldArray({
    control,
    name: "policeVerification",
  })

  const { fields: medicalCheckupFields, append: appendMedicalCheckup, remove: removeMedicalCheckup } = useFieldArray({
    control,
    name: "medicalCheckup",
  })

  const { fields: accidentRegisterFields, append: appendAccidentRegister, remove: removeAccidentRegister } = useFieldArray({
    control,
    name: "accidentRegister",
  })

  const watchedValues = watch()


  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.medicalVerificationRemark) {
        setValue("medicalVerificationRemark", auditStatusFormData.medicalVerificationRemark)
      }
      if (auditStatusFormData.covidVaccine) {
        setValue("covidVaccine", auditStatusFormData.covidVaccine)
      }
      if (auditStatusFormData.policeVerification) {
        setValue("policeVerification", auditStatusFormData.policeVerification)
      }
      if (auditStatusFormData.medicalCheckup) {
        setValue("medicalCheckup", auditStatusFormData.medicalCheckup)
      }
      if (auditStatusFormData.accidentRegister) {
        setValue("accidentRegister", auditStatusFormData.accidentRegister)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])

  const handleReset = () => {
    reset()
    setShowErrors(false)
    // Clear auditStatusFormData or call onFormDataChange with empty data
    if (currentMode === 'add') {
      onFormDataChange({
        medicalVerificationRemark: "",
        covidVaccine: {
          vaccine1: false,
          vaccine2: false,
          vaccine3: false,
          vaccine1Certificate: "",
          vaccine2Certificate: "",
          vaccine3Certificate: "",
        },
        policeVerification: [{
          verificationDate: "",
          nextVerificationDate: "",
          description: "",
          policeStationDetail: "",
          policeStationPinCode: "",
          documentPath: "",
        }],
        medicalCheckup: [],
        accidentRegister: []
      })
    } else {
      onFormDataChange({
        medicalVerificationRemark: "",
        covidVaccine: {
          vaccine1: false,
          vaccine2: false,
          vaccine3: false,
          vaccine1Certificate: "",
          vaccine2Certificate: "",
          vaccine3Certificate: "",
        },
        policeVerification: [{
          verificationDate: "",
          nextVerificationDate: "",
          description: "",
          policeStationDetail: "",
          policeStationPinCode: "",
          documentPath: "",
        }],
        medicalCheckup: [],
        accidentRegister: []
      })
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const valid = await trigger()
    if (valid) {
      const formValues = watch()
      
      // Convert nested form values to flat data structure
      const flatData = {
        medicalVerificationRemark: formValues.medicalVerificationRemark || "",
        covidVaccine: formValues.covidVaccine || {
          vaccine1: false,
          vaccine2: false,
          vaccine3: false,
          vaccine1Certificate: "",
          vaccine2Certificate: "",
          vaccine3Certificate: "",
        },
        policeVerification: formValues.policeVerification || [],
        medicalCheckup: formValues.medicalCheckup || [],
        accidentRegister: formValues.accidentRegister || []
      }

      if (currentMode === 'add') {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          ...flatData,
        })
        setAuditStatus?.({
          ...auditStatus,
          medicalSafety: true
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
        await postMedicalSafety(json)
      }
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
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Medical & Safety</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Medical checkups, COVID vaccination status, and safety records
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* COVID Vaccination */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-blue-600" />
              COVID-19 Vaccination Status
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  First Dose
                </Label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F8FF] to-[#E6F3FF] rounded-xl border border-blue-200">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">First Dose</p>
                    <p className="text-xs text-blue-700">Vaccination completed</p>
                  </div>
                  <Switch
                    checked={watchedValues.covidVaccine?.vaccine1}
                    disabled={isViewMode}
                    onCheckedChange={(checked) => {
                      setValue("covidVaccine.vaccine1", checked)
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Second Dose
                </Label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F8FF] to-[#E6F3FF] rounded-xl border border-blue-200">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">Second Dose</p>
                    <p className="text-xs text-blue-700">Vaccination completed</p>
                  </div>
                  <Switch
                    checked={watchedValues.covidVaccine?.vaccine2}
                    disabled={isViewMode}
                    onCheckedChange={(checked) => {
                      setValue("covidVaccine.vaccine2", checked)
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Booster Dose
                </Label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#F0F8FF] to-[#E6F3FF] rounded-xl border border-blue-200">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">Booster Dose</p>
                    <p className="text-xs text-blue-700">Vaccination completed</p>
                  </div>
                  <Switch
                    checked={watchedValues.covidVaccine?.vaccine3}
                    disabled={isViewMode}
                    onCheckedChange={(checked) => {
                      setValue("covidVaccine.vaccine3", checked)
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  First Dose Certificate
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={isViewMode}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("covidVaccine.vaccine1Certificate", file.name)
                      }
                    }}
                    className="hidden"
                    id="vaccine1-cert"
                  />
                  {watchedValues.covidVaccine?.vaccine1Certificate ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">First Dose Certificate</p>
                        <p className="text-xs text-green-600">{watchedValues.covidVaccine.vaccine1Certificate}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("covidVaccine.vaccine1Certificate", "")
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      disabled={isViewMode}
                      onClick={() => {
                        document.getElementById('vaccine1-cert')?.click()
                      }}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Certificate</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Second Dose Certificate
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("covidVaccine.vaccine2Certificate", file.name)
                      }
                    }}
                    className="hidden"
                    id="vaccine2-cert"
                  />
                  {watchedValues.covidVaccine?.vaccine2Certificate ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Second Dose Certificate</p>
                        <p className="text-xs text-green-600">{watchedValues.covidVaccine.vaccine2Certificate}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("covidVaccine.vaccine2Certificate", "")
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        document.getElementById('vaccine2-cert')?.click()
                      }}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Certificate</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Booster Dose Certificate
                </Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("covidVaccine.vaccine3Certificate", file.name)
                      }
                    }}
                    className="hidden"
                    id="vaccine3-cert"
                  />
                  {watchedValues.covidVaccine?.vaccine3Certificate ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Booster Dose Certificate</p>
                        <p className="text-xs text-green-600">{watchedValues.covidVaccine.vaccine3Certificate}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("covidVaccine.vaccine3Certificate", "")
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        document.getElementById('vaccine3-cert')?.click()
                      }}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Certificate</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Medical Checkups */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Medical Checkups
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={() => appendMedicalCheckup({
                  checkupDate: "",
                  nextCheckupDate: "",
                  description: "",
                  documentPath: "",
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Checkup
              </Button>
            </div>

            <div className="space-y-4">
              {medicalCheckupFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No medical checkups added yet</p>
                  <p className="text-sm">Click "Add Checkup" to get started</p>
                </div>
              )}

              {medicalCheckupFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">Medical Checkup #{index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#87CEEB] text-[#0056CC]">Active</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicalCheckup(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Checkup Date <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`medicalCheckup.${index}.checkupDate`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.medicalCheckup?.[index]?.checkupDate) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.medicalCheckup?.[index]?.checkupDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.medicalCheckup[index]?.checkupDate?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Next Checkup Date <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`medicalCheckup.${index}.nextCheckupDate`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.medicalCheckup?.[index]?.nextCheckupDate) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.medicalCheckup?.[index]?.nextCheckupDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.medicalCheckup[index]?.nextCheckupDate?.message}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`medicalCheckup.${index}.description`)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.medicalCheckup?.[index]?.description) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter checkup description"
                      />
                      {showErrors && errors.medicalCheckup?.[index]?.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.medicalCheckup[index]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Document</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setValue(`medicalCheckup.${index}.documentPath`, file.name)
                            }
                          }}
                          className="hidden"
                        />
                        {watchedValues.medicalCheckup?.[index]?.documentPath ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <FileCheck className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800">Medical Report</p>
                              <p className="text-xs text-green-600">File uploaded successfully</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setValue(`medicalCheckup.${index}.documentPath`, "")
                              }}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                              if (input) input.click()
                            }}
                            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                          >
                            <Upload className="h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Upload Medical Report</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Police Verification */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Police Verification
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={() => appendPoliceVerification({
                  verificationDate: "",
                  nextVerificationDate: "",
                  description: "",
                  policeStationDetail: "",
                  policeStationPinCode: "",
                  documentPath: "",
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Verification
              </Button>
            </div>

            <div className="space-y-4">
              {policeVerificationFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No police verifications added yet</p>
                  <p className="text-sm">Click "Add Verification" to get started</p>
                </div>
              )}

              {policeVerificationFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">Police Verification #{index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#87CEEB] text-[#0056CC]">Verified</Badge>
                      {policeVerificationFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePoliceVerification(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Verification Date <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`policeVerification.${index}.verificationDate`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.policeVerification?.[index]?.verificationDate) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.policeVerification?.[index]?.verificationDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policeVerification[index]?.verificationDate?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Next Verification Date <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`policeVerification.${index}.nextVerificationDate`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.policeVerification?.[index]?.nextVerificationDate) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.policeVerification?.[index]?.nextVerificationDate && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policeVerification[index]?.nextVerificationDate?.message}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`policeVerification.${index}.description`)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.policeVerification?.[index]?.description) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter verification description"
                      />
                      {showErrors && errors.policeVerification?.[index]?.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policeVerification[index]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Police Station Detail <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`policeVerification.${index}.policeStationDetail`)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.policeVerification?.[index]?.policeStationDetail) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter police station detail"
                      />
                      {showErrors && errors.policeVerification?.[index]?.policeStationDetail && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policeVerification[index]?.policeStationDetail?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Police Station Pin Code <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`policeVerification.${index}.policeStationPinCode`)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.policeVerification?.[index]?.policeStationPinCode) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter pin code"
                      />
                      {showErrors && errors.policeVerification?.[index]?.policeStationPinCode && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.policeVerification[index]?.policeStationPinCode?.message}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Document</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setValue(`policeVerification.${index}.documentPath`, file.name)
                            }
                          }}
                          className="hidden"
                        />
                        {watchedValues.policeVerification?.[index]?.documentPath ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <FileCheck className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800">Verification Document</p>
                              <p className="text-xs text-green-600">File uploaded successfully</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setValue(`policeVerification.${index}.documentPath`, "")
                              }}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                              if (input) input.click()
                            }}
                            className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                          >
                            <Upload className="h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Upload Verification Document</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Accident Register */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Accident Register
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={() => appendAccidentRegister({
                  dateOfAccident: "",
                  dateOfReport: "",
                  accidentDescription: "",
                  dateOfReturn: "",
                })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Accident Record
              </Button>
            </div>

            <div className="space-y-4">
              {accidentRegisterFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No accident records added yet</p>
                  <p className="text-sm">Click "Add Accident Record" to get started</p>
                </div>
              )}

              {accidentRegisterFields.map((field, index) => (
                <div key={field.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">Accident Record #{index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#87CEEB] text-[#0056CC]">Resolved</Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAccidentRegister(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Date of Accident <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`accidentRegister.${index}.dateOfAccident`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.accidentRegister?.[index]?.dateOfAccident) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.accidentRegister?.[index]?.dateOfAccident && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.accidentRegister[index]?.dateOfAccident?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Date of Report <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`accidentRegister.${index}.dateOfReport`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.accidentRegister?.[index]?.dateOfReport) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.accidentRegister?.[index]?.dateOfReport && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.accidentRegister[index]?.dateOfReport?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Date of Return <span className="text-red-500">*</span></Label>
                      <Input
                        {...register(`accidentRegister.${index}.dateOfReturn`)}
                        type="date"
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.accidentRegister?.[index]?.dateOfReturn) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                      />
                      {showErrors && errors.accidentRegister?.[index]?.dateOfReturn && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.accidentRegister[index]?.dateOfReturn?.message}
                        </p>
                      )}
                    </div>
                    <div className="group lg:col-span-3">
                      <Label className="text-sm font-medium text-gray-700">Accident Description <span className="text-red-500">*</span></Label>
                      <Textarea
                        {...register(`accidentRegister.${index}.accidentDescription`)}
                        className={`border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                          (showErrors && errors.accidentRegister?.[index]?.accidentDescription) 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter accident description"
                        rows={3}
                      />
                      {showErrors && errors.accidentRegister?.[index]?.accidentDescription && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.accidentRegister[index]?.accidentDescription?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Medical Verification Remark */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Medical Verification Remarks
            </h3>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Remarks</Label>
              <Textarea
                {...register("medicalVerificationRemark")}
                className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                placeholder="Enter medical verification remarks"
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
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
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