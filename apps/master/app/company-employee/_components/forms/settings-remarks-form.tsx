"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Separator } from "@repo/ui/components/ui/separator"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Button } from "@repo/ui/components/ui/button"
import { Settings, ArrowLeft, RotateCcw, CheckCircle, X } from "lucide-react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

// Zod schema for validation
const settingsRemarksSchema = z.object({
  deployment: z.object({
    effectiveFrom: z.string().min(1, "Effective date is required"),
    remark: z.string().optional(),
  }),
  status: z.enum(["active", "pending", "inactive"], {
    required_error: "Please select a status",
  }),
})

type SettingsRemarksFormData = z.infer<typeof settingsRemarksSchema>

interface SettingsRemarksFormProps {
  formData: SettingsRemarksFormData
  onFormDataChange: (data: Partial<SettingsRemarksFormData>) => void
  onPreviousTab?: () => void
  onSubmit?: (data: SettingsRemarksFormData) => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (status: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function SettingsRemarksForm({ 
  formData, 
  onFormDataChange, 
  onPreviousTab,
  onSubmit,
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: SettingsRemarksFormProps) {
  const [showErrors, setShowErrors] = useState(false)

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"

  // Determine which form data to use based on mode
  const currentFormData = mode === "add" ? auditStatusFormData : formData;



  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<SettingsRemarksFormData>({
    resolver: zodResolver(settingsRemarksSchema),
    defaultValues: {
      deployment: currentFormData?.deployment || { effectiveFrom: "", remark: "" },
      status: currentFormData?.status || undefined,
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  // Update form when auditStatusFormData changes (for add mode)
  useEffect(() => {
    if (mode === "add" && auditStatusFormData) {
      setValue("deployment.effectiveFrom", auditStatusFormData.deployment?.effectiveFrom || "");
      setValue("deployment.remark", auditStatusFormData.deployment?.remark || "");
      setValue("status", auditStatusFormData.status || undefined);
    }
  }, [auditStatusFormData, mode, setValue]);

  // Update form values when attendanceResponse changes
  useEffect(() => {
    if (auditStatusFormData) {
      const employeeData = auditStatusFormData;
      const deploymentData = employeeData.deployment || {};
      
      // Convert date format if needed
      const convertDateFormat = (dateString: string) => {
        if (!dateString) return "";
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
      };

      setValue("deployment.effectiveFrom", convertDateFormat(deploymentData.effectiveFrom || ""));
      setValue("deployment.remark", deploymentData.remark || "");
      
      // Set status based on employee data or default to active
      const employeeStatus = employeeData.status || "active";
      setValue("status", employeeStatus);
    }
  }, [auditStatusFormData, setValue]);

  const handleReset = () => {
    reset({
      deployment: { effectiveFrom: "", remark: "" },
      status: undefined
    })
    setShowErrors(false)
    
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        deployment: { effectiveFrom: "", remark: "" },
        status: undefined
      })
    } else {
      onFormDataChange({ 
        deployment: { effectiveFrom: "", remark: "" },
        status: undefined
      })
    }
  }

  const {
    post: postBasicInformation,
  } = usePostRequest<any>({
    url: "company_employee",
    onSuccess: (data) => {
      alert("✅ Settings & remarks information successfully stored in backend!");
    },
    onError: (error) => {
      alert("❌ Failed to store settings & remarks information in backend!");
      console.error("POST error:", error);
    },
  });

  const handleFormSubmit = async () => {
    setShowErrors(true)
    const isValid = await trigger()

    if (isValid) {
      const formValues = watch()
      
      if (mode === "add") {
        const newFormValues = {
          ...auditStatusFormData,
          deployment: {
            ...auditStatusFormData.deployment,
            ...formValues.deployment
          },
          organizationCode:"Midhani",
          tenantCode: "Midhani",
          status: formValues.status,
        }
        alert("newFormValues: " + JSON.stringify(newFormValues))
        let json = {
          tenant: "Midhani",
          action: "insert",
          id:  null,
          collectionName: "company_employee",
          data: newFormValues
        }
        postBasicInformation(json)
      } else {

        const newFormValues = {
          ...auditStatusFormData,
          deployment: {
            ...auditStatusFormData.deployment,
            ...formValues.deployment
          },
          status: formValues.status,
        }

        alert("newFormValues: " + JSON.stringify(newFormValues))
        // In edit mode, make API call
        if (auditStatusFormData) {
          let json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "company_employee",
            data: newFormValues
          }
          postBasicInformation(json)
        }
      }
      
      onFormDataChange(formValues)
      if (onSubmit) {
        onSubmit(formValues)
      }
    } else {
      console.log("Form validation failed")
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
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Settings & Remarks</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Deployment effective date and additional remarks
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Deployment Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Deployment Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Effective From <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("deployment.effectiveFrom")}
                type="date"
                disabled={isViewMode}
                className={`h-10 border-2 rounded-xl ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.deployment?.effectiveFrom) 
                    ? "border-red-500" 
                    : "border-gray-200"
                }`}
              />
              {showErrors && errors.deployment?.effectiveFrom && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.deployment.effectiveFrom.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedValues.status}
                onValueChange={(value) => {
                  setValue("status", value as "active" | "pending" | "inactive")
                  onFormDataChange({ status: value as "active" | "pending" | "inactive" })
                }}
                disabled={isViewMode}
              >
                <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.status) 
                    ? "border-red-500" 
                    : "border-gray-200"
                }`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {showErrors && errors.status && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Remarks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Deployment Remarks
          </h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Remarks</Label>
            <Textarea
              {...register("deployment.remark")}
              disabled={isViewMode}
              className={`border-2 rounded-xl ${
                isViewMode 
                  ? "bg-gray-100 cursor-not-allowed" 
                  : ""
              } ${
                (showErrors && errors.deployment?.remark) 
                  ? "border-red-500" 
                  : "border-gray-200"
              }`}
              placeholder="Enter deployment remarks"
              rows={4}
            />
            {showErrors && errors.deployment?.remark && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <X className="h-3 w-3" />
                {errors.deployment.remark.message}
              </p>
            )}
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
                {isValid ? 'Form is valid and ready to submit' : 'Please complete all required fields'}
              </span>
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleFormSubmit}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Deployment
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 