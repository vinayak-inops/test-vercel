"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Separator } from "@repo/ui/components/ui/separator"
import { Button } from "@repo/ui/components/ui/button"
import { Phone, Mail, RotateCcw, ArrowRight, ArrowLeft, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Zod Schema for validation
const contactEmergencySchema = z.object({
  emailID: z.object({
    primaryEmailID: z.string().email("Please enter a valid primary email address").optional().or(z.literal("")),
    secondaryEmailID: z.string().email("Please enter a valid secondary email address").optional().or(z.literal("")),
  }),
  contactNumber: z.object({
    primaryContactNo: z.string().min(10, "Primary contact number must be at least 10 digits").max(15, "Primary contact number must be less than 15 digits").min(1, "Primary contact number is required"),
    secondarContactNumber: z.string().min(10, "Secondary contact number must be at least 10 digits").max(15, "Secondary contact number must be less than 15 digits").optional().or(z.literal("")),
    emergencyContactPerson1: z.string().min(2, "Emergency contact person 1 name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
    emergencyContactNo1: z.string().min(10, "Emergency contact number 1 must be at least 10 digits").max(15, "Emergency contact number 1 must be less than 15 digits").optional().or(z.literal("")),
    emergencyContactPerson2: z.string().min(2, "Emergency contact person 2 name must be at least 2 characters").max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
    emergencyContactNo2: z.string().min(10, "Emergency contact number 2 must be at least 10 digits").max(15, "Emergency contact number 2 must be less than 15 digits").optional().or(z.literal("")),
  }),
})

type ContactEmergencyData = z.infer<typeof contactEmergencySchema>

interface ContactEmergencyFormProps {
  formData: any
  onFormDataChange: (data: Partial<ContactEmergencyData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function ContactEmergencyForm({
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
}: ContactEmergencyFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const router = useRouter()

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : mode;
  const isViewMode = currentMode === "view"

  

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<ContactEmergencyData>({
    resolver: zodResolver(contactEmergencySchema),
    defaultValues: {
      emailID: {
        primaryEmailID: "",
        secondaryEmailID: "",
      },
      contactNumber: {
        primaryContactNo: "",
        secondarContactNumber: "",
        emergencyContactPerson1: "",
        emergencyContactNo1: "",
        emergencyContactPerson2: "",
        emergencyContactNo2: "",
      },
    },
    mode: "onChange",
  })

  const {
    post: postContactEmergency,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contract_employee",
    onSuccess: (data) => {
      router.push(`/contractor-employee`)
    },
    onError: (error) => {
      console.error("Error saving contact & emergency information:", error)
    },
  });

  // Update form values based on mode
  useEffect(() => {
      if (auditStatusFormData) {
        setValue("emailID.primaryEmailID", auditStatusFormData.emailID?.primaryEmailID || "");
        setValue("emailID.secondaryEmailID", auditStatusFormData.emailID?.secondaryEmailID || "");
        setValue("contactNumber.primaryContactNo", auditStatusFormData.contactNumber?.primaryContactNo || "");
        setValue("contactNumber.secondarContactNumber", auditStatusFormData.contactNumber?.secondarContactNumber || "");
        setValue("contactNumber.emergencyContactPerson1", auditStatusFormData.contactNumber?.emergencyContactPerson1 || "");
        setValue("contactNumber.emergencyContactNo1", auditStatusFormData.contactNumber?.emergencyContactNo1 || "");
        setValue("contactNumber.emergencyContactPerson2", auditStatusFormData.contactNumber?.emergencyContactPerson2 || "");
        setValue("contactNumber.emergencyContactNo2", auditStatusFormData.contactNumber?.emergencyContactNo2 || "");
      }
    setTimeout(() => {
      trigger();
    }, 100);
  }, [ auditStatusFormData, currentMode, setValue, trigger]);

  const watchedValues = watch()

  const handleInputChange = async (section: "emailID" | "contactNumber", field: string, value: string) => {
    setValue(`${section}.${field}` as any, value)
    await trigger(`${section}.${field}` as any)
    const currentValues = watch()
    const exactData = {
      emailID: {
        primaryEmailID: currentValues.emailID.primaryEmailID || "",
        secondaryEmailID: currentValues.emailID.secondaryEmailID || "",
      },
      contactNumber: {
        primaryContactNo: currentValues.contactNumber.primaryContactNo || "",
        secondarContactNumber: currentValues.contactNumber.secondarContactNumber || "",
        emergencyContactPerson1: currentValues.contactNumber.emergencyContactPerson1 || "",
        emergencyContactNo1: currentValues.contactNumber.emergencyContactNo1 || "",
        emergencyContactPerson2: currentValues.contactNumber.emergencyContactPerson2 || "",
        emergencyContactNo2: currentValues.contactNumber.emergencyContactNo2 || "",
      },
    }
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const handleReset = () => {
    reset({
      emailID: {
        primaryEmailID: "",
        secondaryEmailID: "",
      },
      contactNumber: {
        primaryContactNo: "",
        secondarContactNumber: "",
        emergencyContactPerson1: "",
        emergencyContactNo1: "",
        emergencyContactPerson2: "",
        emergencyContactNo2: "",
      },
    })
    setShowErrors(false)
    const clearedData = {
      emailID: {
        primaryEmailID: "",
        secondaryEmailID: "",
      },
      contactNumber: {
        primaryContactNo: "",
        secondarContactNumber: "",
        emergencyContactPerson1: "",
        emergencyContactNo1: "",
        emergencyContactPerson2: "",
        emergencyContactNo2: "",
      },
    }
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...clearedData
      })
    } else {
      onFormDataChange(clearedData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const valid = await trigger()
    if (valid) {
      const formValues = watch()
      const exactData = {
        emailID: {
          primaryEmailID: formValues.emailID.primaryEmailID || "",
          secondaryEmailID: formValues.emailID.secondaryEmailID || "",
        },
        contactNumber: {
          primaryContactNo: formValues.contactNumber.primaryContactNo || "",
          secondarContactNumber: formValues.contactNumber.secondarContactNumber || "",
          emergencyContactPerson1: formValues.contactNumber.emergencyContactPerson1 || "",
          emergencyContactNo1: formValues.contactNumber.emergencyContactNo1 || "",
          emergencyContactPerson2: formValues.contactNumber.emergencyContactPerson2 || "",
          emergencyContactNo2: formValues.contactNumber.emergencyContactNo2 || "",
        },
      }
      if (currentMode === "add") {
        const json = {
          tenant: "Midhani",
          action: "insert",
          id: null ,
          collectionName: "contract_employee",
          data: {
            ...auditStatusFormData,
            ...exactData,
            organizationCode: "Midhani",
            tenantCode: "Midhani",
          }
        }
        postContactEmergency(json)
        if (onNextTab) {
          onNextTab()
        }
      } else if (currentMode === "edit") {
        // In edit mode, update parent formData and save to backend
        onFormDataChange(exactData)
        const json = {
          tenant: "Midhani",
          action: "insert",
          id: auditStatusFormData._id ,
          collectionName: "contract_employee",
          data: {
            ...auditStatusFormData,
            ...exactData,
          }
        }
        postContactEmergency(json)
      } else {
        // In view mode, just update parent formData
        onFormDataChange(exactData)
        if (onNextTab) {
          onNextTab()
        }
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
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Contact & Emergency Information</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Contact details and emergency contact information
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Email Information */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="primaryEmailID" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Primary Email ID
                </Label>
                <Input
                  {...register("emailID.primaryEmailID")}
                  id="primaryEmailID"
                  type="email"
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    (showErrors && errors.emailID?.primaryEmailID)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter primary email"
                  disabled={isViewMode}
                />
                {showErrors && errors.emailID?.primaryEmailID && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.emailID.primaryEmailID.message}
                  </p>
                )}
              </div>
              <div className="group">
                <Label htmlFor="secondaryEmailID" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Secondary Email ID
                </Label>
                <Input
                  {...register("emailID.secondaryEmailID")}
                  id="secondaryEmailID"
                  type="email"
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    (showErrors && errors.emailID?.secondaryEmailID)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter secondary email"
                  disabled={isViewMode}
                />
                {showErrors && errors.emailID?.secondaryEmailID && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.emailID.secondaryEmailID.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Phone Numbers */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Phone Numbers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="primaryContactNo" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Primary Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("contactNumber.primaryContactNo")}
                  id="primaryContactNo"
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    (showErrors && errors.contactNumber?.primaryContactNo)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter primary contact number"
                  disabled={isViewMode}
                />
                {showErrors && errors.contactNumber?.primaryContactNo && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contactNumber.primaryContactNo.message}
                  </p>
                )}
              </div>
              <div className="group">
                <Label htmlFor="secondarContactNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Secondary Contact Number
                </Label>
                <Input
                  {...register("contactNumber.secondarContactNumber")}
                  id="secondarContactNumber"
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    (showErrors && errors.contactNumber?.secondarContactNumber)
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter secondary contact number"
                  disabled={isViewMode}
                />
                {showErrors && errors.contactNumber?.secondarContactNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contactNumber.secondarContactNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Emergency Contacts */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Emergency Contact 1</h4>
                <div className="space-y-4">
                  <div className="group">
                    <Label htmlFor="emergencyContactPerson1" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contact Person Name
                    </Label>
                    <Input
                      {...register("contactNumber.emergencyContactPerson1")}
                      id="emergencyContactPerson1"
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        (showErrors && errors.contactNumber?.emergencyContactPerson1)
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contact person name"
                      disabled={isViewMode}
                    />
                    {showErrors && errors.contactNumber?.emergencyContactPerson1 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contactNumber.emergencyContactPerson1.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="emergencyContactNo1" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contact Number
                    </Label>
                    <Input
                      {...register("contactNumber.emergencyContactNo1")}
                      id="emergencyContactNo1"
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        (showErrors && errors.contactNumber?.emergencyContactNo1)
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contact number"
                      disabled={isViewMode}
                    />
                    {showErrors && errors.contactNumber?.emergencyContactNo1 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contactNumber.emergencyContactNo1.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-800">Emergency Contact 2</h4>
                <div className="space-y-4">
                  <div className="group">
                    <Label htmlFor="emergencyContactPerson2" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contact Person Name
                    </Label>
                    <Input
                      {...register("contactNumber.emergencyContactPerson2")}
                      id="emergencyContactPerson2"
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        (showErrors && errors.contactNumber?.emergencyContactPerson2)
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contact person name"
                      disabled={isViewMode}
                    />
                    {showErrors && errors.contactNumber?.emergencyContactPerson2 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contactNumber.emergencyContactPerson2.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="emergencyContactNo2" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contact Number
                    </Label>
                    <Input
                      {...register("contactNumber.emergencyContactNo2")}
                      id="emergencyContactNo2"
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        (showErrors && errors.contactNumber?.emergencyContactNo2)
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contact number"
                      disabled={isViewMode}
                    />
                    {showErrors && errors.contactNumber?.emergencyContactNo2 && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contactNumber.emergencyContactNo2.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isValid ? 'Form is valid and ready to continue' : 'Please complete all required fields'}
              </span>
              {!isValid && showErrors && Object.keys(errors).length > 0 && (
                <div className="text-xs text-red-600 ml-2">
                  Errors: {Object.keys(errors).join(', ')}
                </div>
              )}
            </div>
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
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