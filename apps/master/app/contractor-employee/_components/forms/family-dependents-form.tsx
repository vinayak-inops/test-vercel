"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Switch } from "@repo/ui/components/ui/switch"
import { Separator } from "@repo/ui/components/ui/separator"
import { Users, Plus, Trash2, Upload, FileCheck, X, UserCheck, Heart } from "lucide-react"
import { useState } from "react"

// Zod Schema for validation
const familyDependentsSchema = z.object({
  familyMember: z.array(z.object({
    memberName: z.string().min(1, "Member name is required"),
    relation: z.string().min(1, "Relation is required"),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    aadharCard: z.object({
      aadharCardNumber: z.string()
        .min(1, "Aadhar number is required")
        .regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
      aadharCardPath: z.string().optional(),
    }),
    electionCard: z.object({
      electionCardNumber: z.string().optional(),
      electionCardPath: z.string().optional(),
    }),
    panCard: z.object({
      panCardNumber: z.string().optional(),
      panCardPath: z.string().optional(),
    }),
    remark: z.string().optional(),
    isDependent: z.boolean(),
  })),
  pfNominee: z.array(z.object({
    memberName: z.string().min(1, "Nominee name is required"),
    relation: z.string().min(1, "Relation is required"),
    birthDate: z.string().optional(),
    percentage: z.string().optional(),
  })),
  gratuityNominee: z.array(z.object({
    memberName: z.string().min(1, "Nominee name is required"),
    relation: z.string().min(1, "Relation is required"),
    birthDate: z.string().optional(),
    percentage: z.string().optional(),
  })),
})

type FamilyDependentsData = z.infer<typeof familyDependentsSchema>

interface FamilyDependentsFormProps {
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

const relationOptions = [
  "Spouse", "Child", "Parent", "Sibling", "Father", "Mother", "Son", "Daughter", "Brother", "Sister"
]
const genderOptions = ["Male", "Female", "Other"]

// Helper function to format Aadhar number
const formatAadharNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  // Limit to 12 digits
  const limitedDigits = digits.substring(0, 12);
  // Format as XXXX XXXX XXXX
  return limitedDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
};

// Helper function to get unformatted Aadhar number
const getUnformattedAadhar = (value: string) => {
  return value.replace(/\s/g, '');
};

export function FamilyDependentsForm({ 
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
}: FamilyDependentsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const currentMode = mode || searchParams.get('mode') || 'add'
  const isViewMode = currentMode === 'view'


  const { post: postFamilyDependents } = usePostRequest({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Family dependents saved:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving family dependents:", error)
    }
  })

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<FamilyDependentsData>({
    resolver: zodResolver(familyDependentsSchema),
    defaultValues: {
      familyMember: [],
      pfNominee: [],
      gratuityNominee: []
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  

  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.familyMember) {
        setValue("familyMember", auditStatusFormData.familyMember)
      }
      if (auditStatusFormData.pfNominee) {
        setValue("pfNominee", auditStatusFormData.pfNominee)
      }
      if (auditStatusFormData.gratuityNominee) {
        setValue("gratuityNominee", auditStatusFormData.gratuityNominee)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])

  // Family Member Add/Remove
  const addFamilyMember = () => {
    const newMembers = [...(watchedValues.familyMember || []), {
      memberName: "",
      relation: "",
      gender: "",
      birthDate: "",
      aadharCard: { aadharCardNumber: "", aadharCardPath: "" },
      electionCard: { electionCardNumber: "", electionCardPath: "" },
      panCard: { panCardNumber: "", panCardPath: "" },
      remark: "",
      isDependent: false,
    }]
    setValue("familyMember", newMembers)
    onFormDataChange({ familyMember: newMembers })
  }
  const removeFamilyMember = (index: number) => {
    const newMembers = watchedValues.familyMember?.filter((_, i) => i !== index) || []
    setValue("familyMember", newMembers)
    onFormDataChange({ familyMember: newMembers })
  }

  // Nominee Add/Remove
  const addPfNominee = () => {
    const newArr = [...(watchedValues.pfNominee || []), {
      memberName: "",
      relation: "",
      birthDate: "",
      percentage: "",
    }]
    setValue("pfNominee", newArr)
    onFormDataChange({ pfNominee: newArr })
  }
  const removePfNominee = (index: number) => {
    const newArr = watchedValues.pfNominee?.filter((_, i) => i !== index) || []
    setValue("pfNominee", newArr)
    onFormDataChange({ pfNominee: newArr })
  }
  const addGratuityNominee = () => {
    const newArr = [...(watchedValues.gratuityNominee || []), {
      memberName: "",
      relation: "",
      birthDate: "",
      percentage: "",
    }]
    setValue("gratuityNominee", newArr)
    onFormDataChange({ gratuityNominee: newArr })
  }
  const removeGratuityNominee = (index: number) => {
    const newArr = watchedValues.gratuityNominee?.filter((_, i) => i !== index) || []
    setValue("gratuityNominee", newArr)
    onFormDataChange({ gratuityNominee: newArr })
  }

  const handleReset = () => {
    reset()
    setShowErrors(false)
    // Clear auditStatusFormData or call onFormDataChange with empty data
    if (currentMode === 'add') {
      onFormDataChange({
        familyMember: [],
        pfNominee: [],
        gratuityNominee: []
      })
    } else {
      onFormDataChange({
        familyMember: [],
        pfNominee: [],
        gratuityNominee: []
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
        familyMember: formValues.familyMember || [],
        pfNominee: formValues.pfNominee || [],
        gratuityNominee: formValues.gratuityNominee || []
      }

      if (currentMode === 'add') {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          ...flatData,
        })
        setAuditStatus?.({
          ...auditStatus,
          familyDependents: true
        })
        if (onNextTab) {
          onNextTab()
        }
        if (onNextTab) onNextTab()
      } else {
        // Save to backend for edit mode
        const json = {
          tenant: "Midhani",
          action: "insert",
          id: auditStatusFormData._id || null,
          collectionName: "contract_employee",
          data: {
            ...auditStatusFormData,
            ...flatData,
          }
        }
        await postFamilyDependents(json)
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Family & Dependents</CardTitle>
              <CardDescription className="text-blue-100 text-base">
                Family member, document, and nominee details
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Family Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Family Members
              </h3>
              <Button type="button" disabled={isViewMode} onClick={addFamilyMember} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Family Member
              </Button>
            </div>
            
            {watchedValues.familyMember && watchedValues.familyMember.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.familyMember.map((member, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div/>
                      {/* <h4 className="text-md font-medium text-gray-800">Family Member {index + 1}</h4> */}
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">{member.relation || "Member"}</Badge>
                        {watchedValues.familyMember.length > 0 && (
                          <Button type="button" variant="outline" size="sm" disabled={isViewMode} onClick={() => removeFamilyMember(index)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Member Name <span className="text-red-500">*</span></Label>
                        <Input {...register(`familyMember.${index}.memberName`)} disabled={isViewMode} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.memberName) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter member name" />
                        {showErrors && errors.familyMember?.[index]?.memberName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].memberName.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Relation <span className="text-red-500">*</span></Label>
                        <Select value={member.relation} disabled={isViewMode} onValueChange={value => { setValue(`familyMember.${index}.relation`, value); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, relation: value } : m) }) }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.relation) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}><SelectValue placeholder="Select relation" /></SelectTrigger>
                          <SelectContent>{relationOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        {showErrors && errors.familyMember?.[index]?.relation && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].relation.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Gender</Label>
                        <Select value={member.gender} disabled={isViewMode} onValueChange={value => { setValue(`familyMember.${index}.gender`, value); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, gender: value } : m) }) }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.gender) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>{genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                        {showErrors && errors.familyMember?.[index]?.gender && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].gender.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Birth Date</Label>
                        <Input type="date" {...register(`familyMember.${index}.birthDate`)} disabled={isViewMode} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.birthDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.familyMember?.[index]?.birthDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].birthDate.message}</p>
                        )}
                      </div>
                    </div>
                    {/* Document Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                      {/* Aadhar Card */}
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Aadhar Number <span className="text-red-500">*</span></Label>
                        <Input 
                          value={formatAadharNumber(member.aadharCard?.aadharCardNumber || '')}
                          disabled={isViewMode} 
                          onChange={(e) => {
                            const unformattedValue = getUnformattedAadhar(e.target.value);
                            setValue(`familyMember.${index}.aadharCard.aadharCardNumber`, unformattedValue);
                            onFormDataChange({ 
                              familyMember: watchedValues.familyMember?.map((m, i) => 
                                i === index ? { 
                                  ...m, 
                                  aadharCard: { 
                                    ...m.aadharCard, 
                                    aadharCardNumber: unformattedValue 
                                  } 
                                } : m
                              ) || []
                            });
                          }}
                          className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.aadharCard?.aadharCardNumber) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} 
                          placeholder="XXXX XXXX XXXX" 
                          maxLength={14} // 12 digits + 2 spaces
                        />
                        {showErrors && errors.familyMember?.[index]?.aadharCard?.aadharCardNumber && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].aadharCard.aadharCardNumber.message}</p>
                        )}
                        {!errors.familyMember?.[index]?.aadharCard?.aadharCardNumber && (
                          <p className="text-gray-500 text-xs mt-1">Enter 12-digit Aadhar number (will be validated)</p>
                        )}
                        <div className="relative mt-2">
                          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={isViewMode} onChange={e => { const file = e.target.files?.[0]; if (file) { setValue(`familyMember.${index}.aadharCard.aadharCardPath`, file.name); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, aadharCard: { ...m.aadharCard, aadharCardPath: file.name } } : m) }) } }} className="hidden" id={`aadharCardPath${index}`} />
                          {member.aadharCard?.aadharCardPath ? (
                            <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg mt-1">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-800">{member.aadharCard.aadharCardPath}</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => { setValue(`familyMember.${index}.aadharCard.aadharCardPath`, ""); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, aadharCard: { ...m.aadharCard, aadharCardPath: "" } } : m) }) }} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">Remove</Button>
                            </div>
                          ) : (
                            <Button type="button" disabled={isViewMode} onClick={() => document.getElementById(`aadharCardPath${index}`)?.click()} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50 mt-1"><Upload className="h-4 w-4 text-gray-500" /><span className="text-xs font-medium text-gray-700">Upload Aadhar</span></Button>
                          )}
                        </div>
                      </div>
                      {/* Election Card */}
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Election Card Number</Label>
                        <Input {...register(`familyMember.${index}.electionCard.electionCardNumber`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.electionCard?.electionCardNumber) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter Election Card number" />
                        {showErrors && errors.familyMember?.[index]?.electionCard?.electionCardNumber && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].electionCard.electionCardNumber.message}</p>
                        )}
                        <div className="relative mt-2">
                          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const file = e.target.files?.[0]; if (file) { setValue(`familyMember.${index}.electionCard.electionCardPath`, file.name); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, electionCard: { ...m.electionCard, electionCardPath: file.name } } : m) }) } }} className="hidden" id={`electionCardPath${index}`} />
                          {member.electionCard?.electionCardPath ? (
                            <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg mt-1">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-800">{member.electionCard.electionCardPath}</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => { setValue(`familyMember.${index}.electionCard.electionCardPath`, ""); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, electionCard: { ...m.electionCard, electionCardPath: "" } } : m) }) }} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">Remove</Button>
                            </div>
                          ) : (
                            <Button type="button" onClick={() => document.getElementById(`electionCardPath${index}`)?.click()} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50 mt-1"><Upload className="h-4 w-4 text-gray-500" /><span className="text-xs font-medium text-gray-700">Upload Election Card</span></Button>
                          )}
                        </div>
                      </div>
                      {/* PAN Card */}
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">PAN Card Number</Label>
                        <Input {...register(`familyMember.${index}.panCard.panCardNumber`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.familyMember?.[index]?.panCard?.panCardNumber) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter PAN Card number" />
                        {showErrors && errors.familyMember?.[index]?.panCard?.panCardNumber && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.familyMember[index].panCard.panCardNumber.message}</p>
                        )}
                        <div className="relative mt-2">
                          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const file = e.target.files?.[0]; if (file) { setValue(`familyMember.${index}.panCard.panCardPath`, file.name); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, panCard: { ...m.panCard, panCardPath: file.name } } : m) }) } }} className="hidden" id={`panCardPath${index}`} />
                          {member.panCard?.panCardPath ? (
                            <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg mt-1">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-800">{member.panCard.panCardPath}</span>
                              <Button type="button" variant="outline" size="sm" onClick={() => { setValue(`familyMember.${index}.panCard.panCardPath`, ""); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, panCard: { ...m.panCard, panCardPath: "" } } : m) }) }} className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">Remove</Button>
                            </div>
                          ) : (
                            <Button type="button" onClick={() => document.getElementById(`panCardPath${index}`)?.click()} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50 mt-1"><Upload className="h-4 w-4 text-gray-500" /><span className="text-xs font-medium text-gray-700">Upload PAN Card</span></Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Remark & Dependent */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Remark</Label>
                        <Input {...register(`familyMember.${index}.remark`)} className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg" placeholder="Enter remark" />
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm mt-4 lg:mt-0">
                        <Switch checked={member.isDependent} onCheckedChange={checked => { setValue(`familyMember.${index}.isDependent`, checked); onFormDataChange({ familyMember: watchedValues.familyMember.map((m, i) => i === index ? { ...m, isDependent: checked } : m) }) }} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
                        <Label className="text-sm text-gray-700 font-medium cursor-pointer">{member.isDependent ? (<span className="text-blue-600">Is Dependent</span>) : (<span className="text-gray-500">Mark as Dependent</span>)}</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No family members added yet. Click "Add Family Member" to get started.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* PF Nominee */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                PF Nominee
              </h3>
              <Button type="button" disabled={isViewMode} onClick={addPfNominee} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add PF Nominee
              </Button>
            </div>
            
            {watchedValues.pfNominee && watchedValues.pfNominee.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.pfNominee.map((nominee, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div/>
                      {/* <h4 className="text-md font-medium text-gray-800">PF Nominee {index + 1}</h4> */}
                      {watchedValues.pfNominee.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removePfNominee(index)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Nominee Name <span className="text-red-500">*</span></Label>
                        <Input {...register(`pfNominee.${index}.memberName`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.pfNominee?.[index]?.memberName) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter nominee name" />
                        {showErrors && errors.pfNominee?.[index]?.memberName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.pfNominee[index].memberName.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Relation <span className="text-red-500">*</span></Label>
                        <Select value={nominee.relation} onValueChange={value => { setValue(`pfNominee.${index}.relation`, value); onFormDataChange({ pfNominee: watchedValues.pfNominee.map((n, i) => i === index ? { ...n, relation: value } : n) }) }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.pfNominee?.[index]?.relation) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}><SelectValue placeholder="Select relation" /></SelectTrigger>
                          <SelectContent>{relationOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        {showErrors && errors.pfNominee?.[index]?.relation && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.pfNominee[index].relation.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Birth Date</Label>
                        <Input type="date" {...register(`pfNominee.${index}.birthDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.pfNominee?.[index]?.birthDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.pfNominee?.[index]?.birthDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.pfNominee[index].birthDate.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Percentage</Label>
                        <Input {...register(`pfNominee.${index}.percentage`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.pfNominee?.[index]?.percentage) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="e.g., 100%" />
                        {showErrors && errors.pfNominee?.[index]?.percentage && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.pfNominee[index].percentage.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No PF nominees added yet. Click "Add PF Nominee" to get started.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Gratuity Nominee */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Gratuity Nominee
              </h3>
              <Button type="button" disabled={isViewMode} onClick={addGratuityNominee} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Gratuity Nominee
              </Button>
            </div>
            
            {watchedValues.gratuityNominee && watchedValues.gratuityNominee.length > 0 ? (
              <div className="space-y-4">
                {watchedValues.gratuityNominee.map((nominee, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div/>
                      {/* <h4 className="text-md font-medium text-gray-800">Gratuity Nominee {index + 1}</h4> */}
                      {watchedValues.gratuityNominee.length > 0 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeGratuityNominee(index)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Nominee Name <span className="text-red-500">*</span></Label>
                        <Input {...register(`gratuityNominee.${index}.memberName`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.gratuityNominee?.[index]?.memberName) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="Enter nominee name" />
                        {showErrors && errors.gratuityNominee?.[index]?.memberName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.gratuityNominee[index].memberName.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Relation <span className="text-red-500">*</span></Label>
                        <Select value={nominee.relation} onValueChange={value => { setValue(`gratuityNominee.${index}.relation`, value); onFormDataChange({ gratuityNominee: watchedValues.gratuityNominee.map((n, i) => i === index ? { ...n, relation: value } : n) }) }}>
                          <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.gratuityNominee?.[index]?.relation) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}><SelectValue placeholder="Select relation" /></SelectTrigger>
                          <SelectContent>{relationOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        {showErrors && errors.gratuityNominee?.[index]?.relation && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.gratuityNominee[index].relation.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Birth Date</Label>
                        <Input type="date" {...register(`gratuityNominee.${index}.birthDate`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.gratuityNominee?.[index]?.birthDate) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
                        {showErrors && errors.gratuityNominee?.[index]?.birthDate && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.gratuityNominee[index].birthDate.message}</p>
                        )}
                      </div>
                      <div className="group">
                        <Label className="text-sm font-medium text-gray-700">Percentage</Label>
                        <Input {...register(`gratuityNominee.${index}.percentage`)} className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg ${(showErrors && errors.gratuityNominee?.[index]?.percentage) ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`} placeholder="e.g., 100%" />
                        {showErrors && errors.gratuityNominee?.[index]?.percentage && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><X className="h-3 w-3" />{errors.gratuityNominee[index].percentage.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No gratuity nominees added yet. Click "Add Gratuity Nominee" to get started.</p>
              </div>
            )}
          </div>
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