"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Separator } from "@repo/ui/components/ui/separator"
import { Button } from "@repo/ui/components/ui/button"
import { MapPin, RotateCcw, ArrowRight, ArrowLeft, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

// Zod Schema for validation
const deploymentDetailsSchema = z.object({
  employeeCategory: z.object({
    employeeCategoryCode: z.string().min(1, "Employee category code is required"),
    employeeCategoryTitle: z.string().min(2, "Employee category title must be at least 2 characters"),
  }),
  grade: z.object({
    gradeCode: z.string().min(1, "Grade code is required"),
    gradeTitle: z.string().min(2, "Grade title must be at least 2 characters"),
  }),
  designation: z.object({
    designationCode: z.string().min(1, "Designation code is required"),
    designationName: z.string().min(2, "Designation name must be at least 2 characters"),
  }),
  location: z.object({
    locationCode: z.string().min(1, "Location code is required"),
    locationName: z.string().min(2, "Location name must be at least 2 characters"),
  }),
  skillLevel: z.object({
    skillLevelCode: z.string().optional(),
    skillLevelTitle: z.string().optional(),
  }),
})

type DeploymentDetailsData = z.infer<typeof deploymentDetailsSchema>

interface DeploymentDetailsFormProps {
  formData: DeploymentDetailsData
  onFormDataChange: (data: Partial<DeploymentDetailsData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (status: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function DeploymentDetailsForm({ 
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
}: DeploymentDetailsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const [subOrganization, setSubOrganization] = useState<any>({})

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"

  // Determine which form data to use based on mode
  const currentFormData = mode === "add" ? auditStatusFormData : formData;

  // Conditional API call - only fetch in edit/view mode when id is available
  const shouldFetchAttendance = (currentMode === "edit" || currentMode === "view") && id;


  const {
    data,
    error,
    loading,
    refetch
  }: {
    data: any;
    error: any;
    loading: any;
    refetch: any;
  } = useRequest<any[]>({
    url: 'map/organization/search?tenantCode=Midhani',
    onSuccess: (data: any) => {
      console.log("organizationData", data)
      if (data && data.length > 0) {
        const orgData = data[0];
        console.log("Processed organization data:", orgData);
        
        // Ensure we have the expected structure
        setSubOrganization({
          employeeCategories: orgData.employeeCategories || [],
          grades: orgData.grades || [],
          designations: orgData.designations || [],
          location: orgData.location || []
        });
      } else {
        console.warn("No organization data received");
        // Set default empty structure to prevent undefined errors
        setSubOrganization({
          employeeCategories: [],
          grades: [],
          designations: [],
          location: []
        });
      }
    },
    onError: (error: any) => {
      console.error('Error loading organization data:', error);
      // Set default empty structure on error
      setSubOrganization({
        employeeCategories: [],
        grades: [],
        designations: [],
        location: []
      });
    }
  });

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<DeploymentDetailsData>({
    resolver: zodResolver(deploymentDetailsSchema),
    defaultValues: {
      employeeCategory: currentFormData?.employeeCategory || { employeeCategoryCode: "", employeeCategoryTitle: "" },
      grade: currentFormData?.grade || { gradeCode: "", gradeTitle: "" },
      designation: currentFormData?.designation || { designationCode: "", designationName: "" },
      location: currentFormData?.location || { locationCode: "", locationName: "" },
      skillLevel: currentFormData?.skillLevel || { skillLevelCode: "", skillLevelTitle: "" },
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  // Component mount initialization - set default values based on mode
  useEffect(() => {
    console.log("Component mount initialization - currentMode:", currentMode);
    if (currentMode === "add" && auditStatusFormData) {
      console.log("Initializing from auditStatusFormData:", auditStatusFormData);
      setValue("employeeCategory.employeeCategoryCode", auditStatusFormData.employeeCategory?.employeeCategoryCode || "");
      setValue("employeeCategory.employeeCategoryTitle", auditStatusFormData.employeeCategory?.employeeCategoryTitle || "");
      setValue("grade.gradeCode", auditStatusFormData.grade?.gradeCode || "");
      setValue("grade.gradeTitle", auditStatusFormData.grade?.gradeTitle || "");
      setValue("designation.designationCode", auditStatusFormData.designation?.designationCode || "");
      setValue("designation.designationName", auditStatusFormData.designation?.designationName || "");
      setValue("location.locationCode", auditStatusFormData.location?.locationCode || "");
      setValue("location.locationName", auditStatusFormData.location?.locationName || "");
      setValue("skillLevel.skillLevelCode", auditStatusFormData.skillLevel?.skillLevelCode || "");
      setValue("skillLevel.skillLevelTitle", auditStatusFormData.skillLevel?.skillLevelTitle || "");
    } else if ((currentMode === "edit" || currentMode === "view") && formData) {
      console.log("Initializing from formData:", formData);
      setValue("employeeCategory.employeeCategoryCode", formData.employeeCategory?.employeeCategoryCode || "");
      setValue("employeeCategory.employeeCategoryTitle", formData.employeeCategory?.employeeCategoryTitle || "");
      setValue("grade.gradeCode", formData.grade?.gradeCode || "");
      setValue("grade.gradeTitle", formData.grade?.gradeTitle || "");
      setValue("designation.designationCode", formData.designation?.designationCode || "");
      setValue("designation.designationName", formData.designation?.designationName || "");
      setValue("location.locationCode", formData.location?.locationCode || "");
      setValue("location.locationName", formData.location?.locationName || "");
      setValue("skillLevel.skillLevelCode", formData.skillLevel?.skillLevelCode || "");
      setValue("skillLevel.skillLevelTitle", formData.skillLevel?.skillLevelTitle || "");
    }
  }, [currentMode, auditStatusFormData, formData, setValue]);

  // Update form when auditStatusFormData changes (for add mode)
  useEffect(() => {
    if (mode === "add" && auditStatusFormData) {
      console.log("auditStatusFormData changed in add mode:", auditStatusFormData);
      setValue("employeeCategory.employeeCategoryCode", auditStatusFormData.employeeCategory?.employeeCategoryCode || "");
      setValue("employeeCategory.employeeCategoryTitle", auditStatusFormData.employeeCategory?.employeeCategoryTitle || "");
      setValue("grade.gradeCode", auditStatusFormData.grade?.gradeCode || "");
      setValue("grade.gradeTitle", auditStatusFormData.grade?.gradeTitle || "");
      setValue("designation.designationCode", auditStatusFormData.designation?.designationCode || "");
      setValue("designation.designationName", auditStatusFormData.designation?.designationName || "");
      setValue("location.locationCode", auditStatusFormData.location?.locationCode || "");
      setValue("location.locationName", auditStatusFormData.location?.locationName || "");
      setValue("skillLevel.skillLevelCode", auditStatusFormData.skillLevel?.skillLevelCode || "");
      setValue("skillLevel.skillLevelTitle", auditStatusFormData.skillLevel?.skillLevelTitle || "");
    }
  }, [auditStatusFormData, mode, setValue]);

  // Force re-render when subOrganization data loads
  useEffect(() => {
    if (subOrganization && Object.keys(subOrganization).length > 0) {
      console.log("subOrganization loaded, forcing re-render");
      // Re-set current values to trigger re-render
      const currentValues = watch();
      setTimeout(() => {
        setValue("employeeCategory.employeeCategoryCode", currentValues.employeeCategory?.employeeCategoryCode || "");
        setValue("employeeCategory.employeeCategoryTitle", currentValues.employeeCategory?.employeeCategoryTitle || "");
        setValue("grade.gradeCode", currentValues.grade?.gradeCode || "");
        setValue("grade.gradeTitle", currentValues.grade?.gradeTitle || "");
        setValue("designation.designationCode", currentValues.designation?.designationCode || "");
        setValue("designation.designationName", currentValues.designation?.designationName || "");
        setValue("location.locationCode", currentValues.location?.locationCode || "");
        setValue("location.locationName", currentValues.location?.locationName || "");
        setValue("skillLevel.skillLevelCode", currentValues.skillLevel?.skillLevelCode || "");
        setValue("skillLevel.skillLevelTitle", currentValues.skillLevel?.skillLevelTitle || "");
      }, 100);
    }
  }, [subOrganization, setValue, watch]);

  // Get subsidiary and division from employee data for filtering
  const employeeSubsidiary = useMemo(() => {
    if (auditStatusFormData) {
      // In add mode, get from auditStatusFormData
      return auditStatusFormData.subsidiary?.subsidiaryCode || "";
    } else if (auditStatusFormData && auditStatusFormData.deployment) {
      // In edit/view mode, get from auditStatusFormData
      return auditStatusFormData.deployment.subsidiary?.subsidiaryCode || "";
    }
    return "";
  }, [mode, auditStatusFormData]);

  const employeeDivision = useMemo(() => {
    if (mode === "add" && auditStatusFormData) {
      // In add mode, get from auditStatusFormData
      return auditStatusFormData.division?.divisionCode || "";
    } else if (auditStatusFormData && auditStatusFormData.deployment) {
      // In edit/view mode, get from auditStatusFormData
      return auditStatusFormData.deployment.division?.divisionCode || "";
    }
    return "";
  }, [mode, auditStatusFormData]);

  // Computed filtered arrays based on employee's subsidiary and division
  const filteredDesignations = useMemo(() => {
    if (!employeeDivision || !subOrganization.designations) {
      return [];
    }
    return subOrganization.designations.filter((designation: any) => 
      designation.divisionCode === employeeDivision
    );
  }, [employeeDivision, subOrganization.designations]);

  const filteredGrades = useMemo(() => {
    if (!watchedValues.designation?.designationCode || !subOrganization.grades) {
      return [];
    }
    return subOrganization.grades.filter((grade: any) => 
      grade.designationCode === watchedValues.designation.designationCode
    );
  }, [watchedValues.designation?.designationCode, subOrganization.grades]);

  const filteredLocations = useMemo(() => {
    if (!employeeSubsidiary || !subOrganization.location) {
      return [];
    }
    return subOrganization.location.filter((location: any) => 
      location.subsidiaryCode === employeeSubsidiary || 
      !location.subsidiaryCode // Include locations that don't have subsidiary restriction
    );
  }, [employeeSubsidiary, subOrganization.location]);

  

  const handleCodeChange = (section: keyof DeploymentDetailsData, code: string) => {
    let name = ""
    
    // Find corresponding name based on selected code from API data
    if (subOrganization) {
      switch (section) {
        case "employeeCategory":
          const category = subOrganization.employeeCategories?.find((opt: any) => 
            (opt.code === code) || (opt.employeeCategoryCode === code)
          )
          name = category?.title || category?.employeeCategoryName || ""
          break
        case "grade":
          const grade = subOrganization.grades?.find((opt: any) => 
            (opt.code === code) || (opt.gradeCode === code)
          )
          name = grade?.title || grade?.gradeName || ""
          break
        case "designation":
          const designation = subOrganization.designations?.find((opt: any) => 
            (opt.code === code) || (opt.designationCode === code)
          )
          name = designation?.name || designation?.designationName || ""
          
          // Clear grade when designation changes
          setValue("grade.gradeCode", "")
          setValue("grade.gradeTitle", "")
          break
        case "location":
          const location = subOrganization.location?.find((opt: any) => 
            (opt.code === code) || (opt.locationCode === code)
          )
          name = location?.name || location?.locationName || ""
          break
        case "skillLevel":
          const skillLevel = subOrganization.skillLevels?.find((opt: any) => 
            (opt.code === code) || (opt.skillLevelCode === code)
          )
          name = skillLevel?.title || skillLevel?.skilledLevelTitle || ""
          break
      }
    }

    console.log(`handleCodeChange for ${section}:`, { code, name });

    // Update both code and name with proper field names
    switch (section) {
      case "employeeCategory":
        setValue("employeeCategory.employeeCategoryCode", code)
        setValue("employeeCategory.employeeCategoryTitle", name)
        break
      case "grade":
        setValue("grade.gradeCode", code)
        setValue("grade.gradeTitle", name)
        break
      case "designation":
        setValue("designation.designationCode", code)
        setValue("designation.designationName", name)
        break
      case "location":
        setValue("location.locationCode", code)
        setValue("location.locationName", name)
        break
      case "skillLevel":
        setValue("skillLevel.skillLevelCode", code)
        setValue("skillLevel.skillLevelTitle", name)
        break
    }
    
    // Update form data based on mode
    const currentValues = watch()
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...currentValues
      })
    } else {
      onFormDataChange(currentValues)
    }
  }

  const handleReset = () => {
    const clearedData = {
      employeeCategory: { employeeCategoryCode: "", employeeCategoryTitle: "" },
      grade: { gradeCode: "", gradeTitle: "" },
      designation: { designationCode: "", designationName: "" },
      location: { locationCode: "", locationName: "" },
      skillLevel: { skillLevelCode: "", skillLevelTitle: "" },
    }
    
    reset(clearedData)
    setShowErrors(false)
    
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...clearedData
      })
    } else {
      onFormDataChange(clearedData)
    }
  }

  const {
    post: postBasicInformation,
  } = usePostRequest<any>({
    url: "company_employee",
    onSuccess: (data) => {
      alert("✅ Deployment details information successfully stored in backend!");
    },
    onError: (error) => {
      alert("❌ Failed to store deployment details information in backend!");
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
          deploymentDetails: true
        })
        
        // Update audit status form data
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          deployment: {
            ...auditStatusFormData.deployment,
            ...formValues
          }
        })
      } else {
        // In edit mode, make API call
        if (auditStatusFormData ) {
          let json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "company_employee",
            data: {
              ...auditStatusFormData,
              deployment: {
                ...auditStatusFormData.deployment,
                ...formValues,
              },
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
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Deployment Details</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Employee category, grade, designation, and location details
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Employee Classification */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Employee Classification
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="employeeCategoryCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.employeeCategory?.employeeCategoryCode || ""} 
                  onValueChange={(value) => handleCodeChange("employeeCategory", value)}
                  disabled={isViewMode}
                  key={`employeeCategory-${watchedValues.employeeCategory?.employeeCategoryCode || 'empty'}`}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.employeeCategory?.employeeCategoryCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder="Select Category Code" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : subOrganization?.employeeCategories && subOrganization.employeeCategories.length > 0 ? (
                      subOrganization.employeeCategories.map((option: any) => {
                        console.log("EmployeeCategory option:", option);
                        const optionValue = option.code || option.employeeCategoryCode || "";
                        const optionName = option.title || option.employeeCategoryName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {subOrganization?.employeeCategories ? 'No employee categories available' : 'Loading employee categories...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.employeeCategory?.employeeCategoryCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.employeeCategory.employeeCategoryCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="employeeCategoryTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category Title <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.employeeCategory?.employeeCategoryTitle ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.employeeCategory.employeeCategoryTitle}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.employeeCategory?.employeeCategoryTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.employeeCategory.employeeCategoryTitle.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="gradeCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Grade Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.grade?.gradeCode || ""} 
                  onValueChange={(value) => handleCodeChange("grade", value)}
                  disabled={isViewMode || !watchedValues.designation?.designationCode}
                  key={`grade-${watchedValues.grade?.gradeCode || 'empty'}`}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !watchedValues.designation?.designationCode
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.grade?.gradeCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!watchedValues.designation?.designationCode ? "Select Designation first" : "Select Grade Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredGrades.length > 0 ? (
                      filteredGrades.map((option: any) => {
                        console.log("Grade option:", option);
                        const optionValue = option.code || option.gradeCode || "";
                        const optionName = option.title || option.gradeName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!watchedValues.designation?.designationCode ? 'Please select a designation first' : 'No grades available for selected designation'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.grade?.gradeCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.grade.gradeCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="gradeTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Grade Title <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.grade?.gradeTitle ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.grade.gradeTitle}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.grade?.gradeTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.grade.gradeTitle.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Position and Location */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Position and Location
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="designationCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Designation Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.designation?.designationCode || ""} 
                  onValueChange={(value) => handleCodeChange("designation", value)}
                  disabled={isViewMode || !employeeDivision}
                  key={`designation-${watchedValues.designation?.designationCode || 'empty'}`}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !employeeDivision
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.designation?.designationCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!employeeDivision ? "Employee division not set" : "Select Designation Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredDesignations.length > 0 ? (
                      filteredDesignations.map((option: any) => {
                        console.log("Designation option:", option);
                        const optionValue = option.code || option.designationCode || "";
                        const optionName = option.name || option.designationName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!employeeDivision ? 'Please set employee division first' : 'No designations available for selected division'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.designation?.designationCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.designation.designationCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="designationName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Designation Name <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.designation?.designationName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.designation.designationName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.designation?.designationName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.designation.designationName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="locationCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Location Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.location?.locationCode || ""} 
                  onValueChange={(value) => handleCodeChange("location", value)}
                  disabled={isViewMode || !employeeSubsidiary}
                  key={`location-${watchedValues.location?.locationCode || 'empty'}`}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !employeeSubsidiary
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.location?.locationCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!employeeSubsidiary ? "Employee subsidiary not set" : "Select Location Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredLocations.length > 0 ? (
                      filteredLocations.map((option: any) => {
                        console.log("Location option:", option);
                        const optionValue = option.code || option.locationCode || "";
                        const optionName = option.name || option.locationName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!employeeSubsidiary ? 'Please set employee subsidiary first' : 'No locations available for selected subsidiary'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.location?.locationCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.location.locationCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="locationName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Location Name <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.location?.locationName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.location.locationName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.location?.locationName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.location.locationName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Skill Level */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Skill Level
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="skillLevelCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Skill Level Code
                </Label>
                <Select 
                  value={watchedValues.skillLevel?.skillLevelCode || ""} 
                  onValueChange={(value) => handleCodeChange("skillLevel", value)}
                  disabled={isViewMode}
                  key={`skillLevel-${watchedValues.skillLevel?.skillLevelCode || 'empty'}`}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.skillLevel?.skillLevelCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder="Select Skill Level Code" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : subOrganization?.skillLevels && subOrganization.skillLevels.length > 0 ? (
                      subOrganization.skillLevels.map((option: any) => {
                        console.log("SkillLevel option:", option);
                        const optionValue = option.code || option.skillLevelCode || "";
                        const optionName = option.title || option.skilledLevelTitle || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {subOrganization?.skillLevels ? 'No skill levels available' : 'Loading skill levels...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.skillLevel?.skillLevelCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.skillLevel.skillLevelCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="skillLevelTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Skill Level Title
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.skillLevel?.skillLevelTitle ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.skillLevel.skillLevelTitle}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.skillLevel?.skillLevelTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.skillLevel.skillLevelTitle.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block"></Label>
                <div className="h-10"></div>
              </div>

              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block"></Label>
                <div className="h-10"></div>
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