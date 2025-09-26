"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Separator } from "@repo/ui/components/ui/separator"
import { Button } from "@repo/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Users, ArrowLeft, RotateCcw, Save, X } from "lucide-react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

// Zod schema for validationhandleSaveAndContinue
const managementHierarchySchema = z.object({
  manager: z.string().optional(),
  managerName: z.string().optional(),
})

type ManagementHierarchyFormData = z.infer<typeof managementHierarchySchema>

interface ManagementHierarchyFormProps {
  formData: ManagementHierarchyFormData
  onFormDataChange: (data: Partial<ManagementHierarchyFormData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (status: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function ManagementHierarchyForm({ 
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
}: ManagementHierarchyFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const [managerOptions, setManagerOptions] = useState<any[]>([])

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"

  // Determine which form data to use based on mode
  const currentFormData = mode === "add" ? auditStatusFormData : formData;

 

  // Fetch all employees for manager selection
  const {
    data: employeesData,
    loading: employeesLoading,
    error: employeesError,
    refetch: fetchEmployees
  } = useRequest<any[]>({
    url: 'company_employee/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        value: "Midhani",
        operator: "eq",
      }
    ],
    onSuccess: (data) => {
      console.log("Employees data:", data);
      if (data && data.length > 0) {
        // Filter out the current employee and format for dropdown
        const currentEmployeeId = id;
        const filteredEmployees = data
          .filter((employee: any) => 
            employee._id !== currentEmployeeId && 
            employee.employeeID && 
            employee.employeeID.trim() !== ""
          )
          .map((employee: any) => ({
            code: employee.employeeID || "",
            name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown"
          }));
        setManagerOptions(filteredEmployees);
      }
    },
    onError: (error) => {
      console.error("Error fetching employees data:", error);
      setManagerOptions([]);
    }
  });

  useEffect(() => {
    fetchEmployees()
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<ManagementHierarchyFormData>({
    resolver: zodResolver(managementHierarchySchema),
    defaultValues: {
      manager: currentFormData?.manager || "",
      managerName: currentFormData?.managerName || "",
    },
    mode: "onChange",
  })

  const watchedManager = watch("manager")

  // Update form when auditStatusFormData changes (for add mode)
  useEffect(() => {
    if (mode === "add" && auditStatusFormData) {
      setValue("manager", auditStatusFormData.manager || "");
      setValue("managerName", auditStatusFormData.managerName || "");
    }
  }, [auditStatusFormData, mode, setValue]);

  // Update form values when attendanceResponse changes
  useEffect(() => {
    if (auditStatusFormData) {
      const employeeData = auditStatusFormData;
      setValue("manager", employeeData.manager || "");
      
      // Find manager name from manager options
      const managerOption = managerOptions.find(option => option.code === employeeData.manager);
      setValue("managerName", managerOption?.name || "");
    }
  }, [auditStatusFormData, setValue, managerOptions]);

  // Auto-fill manager name when manager code is selected
  const handleManagerChange = (value: string) => {
    setValue("manager", value)
    const selectedManager = managerOptions.find(option => option.code === value)
    if (selectedManager) {
      setValue("managerName", selectedManager.name)
      
      // Update form data based on mode
      if (mode === "add") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          manager: value,
          managerName: selectedManager.name
        })
      } else {
        onFormDataChange({ manager: value, managerName: selectedManager.name })
      }
    } else {
      setValue("managerName", "")
      
      // Update form data based on mode
      if (mode === "add") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          manager: value,
          managerName: ""
        })
      } else {
        onFormDataChange({ manager: value, managerName: "" })
      }
    }
  }

  const handleReset = () => {
    reset({
      manager: "",
      managerName: "",
    })
    setShowErrors(false)
    
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        manager: "",
        managerName: ""
      })
    } else {
      onFormDataChange({ manager: "", managerName: "" })
    }
  }

  const {
    post: postBasicInformation,
  } = usePostRequest<any>({
    url: "company_employee",
    onSuccess: (data) => {
      alert("✅ Management hierarchy information successfully stored in backend!");
    },
    onError: (error) => {
      alert("❌ Failed to store management hierarchy information in backend!");
      console.error("POST error:", error);
    },
  });

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const isValid = await trigger()
    
    if (isValid) {
      const formValues = watch()
      
      if (mode === "add") {
        // Update audit status to mark this tab as completed
        setAuditStatus?.({
          ...auditStatus,
          managementHierarchy: true
        })
        
        // Update audit status form data
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          ...formValues
        })
      } else {
        // In edit mode, make API call
        if (auditStatusFormData) {
          let json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "company_employee",
            data: {
              ...auditStatusFormData,
              ...formValues,
              managementHierarchy: true
            }
          }
          postBasicInformation(json)
        }
      }
      
      // Form is valid, proceed to next tab
      if (onNextTab) {
        onNextTab()
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
                <Users className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Management Hierarchy</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Define reporting structure and management relationships
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        {/* Manager Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Reporting Manager
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-sm font-medium text-gray-700">
                Manager Employee Code
              </Label>
              <Select
                value={watchedManager}
                onValueChange={handleManagerChange}
                disabled={isViewMode}
              >
                <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.manager) 
                    ? "border-red-500" 
                    : "border-gray-200"
                }`}>
                  <SelectValue placeholder="Select manager code" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                  {employeesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : managerOptions.length > 0 ? (
                    managerOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code || "unknown"}>
                        {option.code || "Unknown"} - {option.name || "Unknown"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      {managerOptions.length === 0 ? 'No employees available' : 'Loading employees...'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {showErrors && errors.manager && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.manager.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Manager Name
              </Label>
              <div className="h-10 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  {watchedManager ? 
                    managerOptions.find(option => option.code === watchedManager)?.name || "Loading..." 
                    : "Select manager code to auto-fill"
                  }
                </span>
                {watchedManager && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              {showErrors && errors.managerName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.managerName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Organizational Chart Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Organizational Chart Preview
          </h3>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 text-center">
                <div className="text-sm font-medium text-gray-600">Manager</div>
                <div className="text-lg font-semibold text-blue-600">
                  {watchedManager || "Not Selected"}
                </div>
                <div className="text-sm text-gray-500">
                  {watchedManager ? 
                    managerOptions.find(option => option.code === watchedManager)?.name 
                    : "Manager name"
                  }
                </div>
              </div>
              <div className="w-px h-8 bg-blue-300"></div>
              <div className="bg-blue-500 text-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-sm font-medium text-blue-100">Current Employee</div>
                <div className="text-lg font-semibold">New Employee</div>
                <div className="text-sm text-blue-100">To be assigned</div>
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
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 