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
import { Building2, RotateCcw, ArrowRight, ArrowLeft, X } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

// Zod Schema for validation
const organizationalStructureSchema = z.object({
  subsidiary: z.object({
    subsidiaryCode: z.string().min(1, "Subsidiary code is required"),
    subsidiaryName: z.string().min(2, "Subsidiary name must be at least 2 characters"),
  }),
  division: z.object({
    divisionCode: z.string().min(1, "Division code is required"),
    divisionName: z.string().min(2, "Division name must be at least 2 characters"),
  }),
  department: z.object({
    departmentCode: z.string().min(1, "Department code is required"),
    departmentName: z.string().min(2, "Department name must be at least 2 characters"),
  }),
  subDepartment: z.object({
    subDepartmentCode: z.string().optional(),
    subDepartmentName: z.string().optional(),
  }),
  section: z.object({
    sectionCode: z.string().optional(),
    sectionName: z.string().optional(),
  }),
})

type OrganizationalStructureData = z.infer<typeof organizationalStructureSchema>

interface OrganizationalStructureFormProps {
  formData: OrganizationalStructureData
  onFormDataChange: (data: Partial<OrganizationalStructureData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (status: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function OrganizationalStructureForm({ 
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
}: OrganizationalStructureFormProps) {

  // State for organization data from API
  const [subOrganization, setSubOrganization] = useState<any>({})

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  // Only create the useRequest hook when we need to fetch data
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
                subsidiaries: orgData.subsidiaries || [],
                divisions: orgData.divisions || [],
                departments: orgData.departments || [],
                subDepartments: orgData.subDepartments || [],
                sections: orgData.sections || []
            });
        } else {
            console.warn("No organization data received");
            // Set default empty structure to prevent undefined errors
            setSubOrganization({
                subsidiaries: [],
                divisions: [],
                departments: [],
                subDepartments: [],
                sections: []
            });
        }
    },
    onError: (error: any) => {
        console.error('Error loading organization data:', error);
        // Set default empty structure on error
        setSubOrganization({
            subsidiaries: [],
            divisions: [],
            departments: [],
            subDepartments: [],
            sections: []
        });
    }
});
  const [showErrors, setShowErrors] = useState(false)

  const isViewMode = currentMode === "view"

  // Determine which form data to use based on mode
  const currentFormData = mode === "add" ? auditStatusFormData : formData;

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<OrganizationalStructureData>({
    resolver: zodResolver(organizationalStructureSchema),
    defaultValues: {
      subsidiary: currentFormData?.subsidiary || { subsidiaryCode: auditStatusFormData?.deployment?.subsidiary?.subsidiaryCode || "", subsidiaryName: auditStatusFormData?.deployment?.subsidiary?.subsidiaryName || "" },
      division: currentFormData?.division || { divisionCode: auditStatusFormData?.deployment?.division?.divisionCode || "", divisionName: auditStatusFormData?.deployment?.division?.divisionName || "" },
      department: currentFormData?.department || { departmentCode: auditStatusFormData?.deployment?.department?.departmentCode || "", departmentName: auditStatusFormData?.deployment?.department?.departmentName || "" },
      subDepartment: currentFormData?.subDepartment || { subDepartmentCode: auditStatusFormData?.deployment?.subDepartment?.subDepartmentCode || null, subDepartmentName: auditStatusFormData?.deployment?.subDepartment?.subDepartmentName || "" },
      section: currentFormData?.section || { sectionCode: auditStatusFormData?.deployment?.section?.sectionCode || "", sectionName: auditStatusFormData?.deployment?.section?.sectionName ||   "" },
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  // Debug: Log current form values
  useEffect(() => {
    console.log("Current watched values:", watchedValues);
    console.log("Division code value:", watchedValues.division?.divisionCode);
    console.log("Section code value:", watchedValues.section?.sectionCode);
  }, [watchedValues]);

 

  // Update form when auditStatusFormData changes (for add mode)
  useEffect(() => {
    if (auditStatusFormData) {
      setValue("subsidiary.subsidiaryCode", auditStatusFormData.deployment?.subsidiary?.subsidiaryCode || "");
      setValue("subsidiary.subsidiaryName", auditStatusFormData.deployment?.subsidiary?.subsidiaryName || "");
      setValue("division.divisionCode", auditStatusFormData.deployment?.division?.divisionCode || "");
      setValue("division.divisionName", auditStatusFormData.deployment?.division?.divisionName || "");
      setValue("department.departmentCode", auditStatusFormData.deployment?.department?.departmentCode || "");
      setValue("department.departmentName", auditStatusFormData.deployment?.department?.departmentName || "");
      setValue("subDepartment.subDepartmentCode", auditStatusFormData.deployment?.subDepartment?.subDepartmentCode || "");
      setValue("subDepartment.subDepartmentName", auditStatusFormData.deployment?.subDepartment?.subDepartmentName || "");
      setValue("section.sectionCode", auditStatusFormData.deployment?.section?.sectionCode || "");
      setValue("section.sectionName", auditStatusFormData.deployment?.section?.sectionName || "");
    }
  }, [auditStatusFormData, mode, setValue]);

  // Computed filtered arrays based on selections
  const filteredDivisions = useMemo(() => {
    if (!watchedValues.subsidiary?.subsidiaryCode || !subOrganization.divisions) {
      return [];
    }
    return subOrganization.divisions.filter((division: any) => 
      division.subsidiaryCode === watchedValues.subsidiary.subsidiaryCode
    );
  }, [watchedValues.subsidiary?.subsidiaryCode, subOrganization.divisions]);

  const filteredDepartments = useMemo(() => {
    if (!watchedValues.division?.divisionCode || !subOrganization.departments) {
      return [];
    }
    return subOrganization.departments.filter((department: any) => 
      department.divisionCode === watchedValues.division.divisionCode
    );
  }, [watchedValues.division?.divisionCode, subOrganization.departments]);

  const filteredSubDepartments = useMemo(() => {
    if (!watchedValues.department?.departmentCode || !subOrganization.subDepartments) {
      return [];
    }
    return subOrganization.subDepartments.filter((subDept: any) => 
      subDept.departmentCode === watchedValues.department.departmentCode
    );
  }, [watchedValues.department?.departmentCode, subOrganization.subDepartments]);

  const filteredSections = useMemo(() => {
    if (!watchedValues.subDepartment?.subDepartmentCode || !subOrganization.sections) {
      return [];
    }
    return subOrganization.sections.filter((section: any) => 
      section.subDepartmentCode === watchedValues.subDepartment.subDepartmentCode &&
      section.divisionCode === watchedValues.division?.divisionCode &&
      section.subsidiaryCode === watchedValues.subsidiary?.subsidiaryCode
    );
  }, [watchedValues.subDepartment?.subDepartmentCode, watchedValues.division?.divisionCode, watchedValues.subsidiary?.subsidiaryCode, subOrganization.sections]);

  // Update form values when attendanceResponse changes (only for edit/view modes)
  useEffect(() => {
    console.log("useEffect triggered - currentMode:", currentMode, "mode prop:", mode, "attendanceResponse:", );
    
    // Only proceed if we're in edit/view mode and have valid data
    if ((currentMode === "edit" || currentMode === "view") && auditStatusFormData) {
      const employeeData = auditStatusFormData;
      const deploymentData = employeeData.deployment || {};

      console.log("Setting form values from attendanceResponse:", deploymentData);
      
      // Set form values with a small delay to ensure proper synchronization
      setTimeout(() => {
        setValue("subsidiary.subsidiaryCode", deploymentData.subsidiary?.subsidiaryCode || "");
        setValue("subsidiary.subsidiaryName", deploymentData.subsidiary?.subsidiaryName || "");
        setValue("division.divisionCode", deploymentData.division?.divisionCode || "");
        setValue("division.divisionName", deploymentData.division?.divisionName || "");
        setValue("department.departmentCode", deploymentData.department?.departmentCode || "");
        setValue("department.departmentName", deploymentData.department?.departmentName || "");
        setValue("subDepartment.subDepartmentCode", deploymentData.subDepartment?.subDepartmentCode || "");
        setValue("subDepartment.subDepartmentName", deploymentData.subDepartment?.subDepartmentName || "");
        setValue("section.sectionCode", deploymentData.section?.sectionCode || "");
        setValue("section.sectionName", deploymentData.section?.sectionName || "");
        
        console.log("Form values set successfully");
      }, 100);
    } else if (currentMode === "add") {
      console.log("In add mode - not setting form values from attendanceResponse");
    } else {
      console.log("useEffect conditions not met:", {
        currentMode,
        modeProp: mode,
        hasAttendanceResponse: !!auditStatusFormData,
        attendanceResponseLength: auditStatusFormData?.length,
        firstItem: auditStatusFormData?.[0]
      });
    }
  }, [auditStatusFormData, setValue, currentMode, mode]);

  // Sync form values with auditStatusFormData in add mode
  useEffect(() => {
    if (currentMode === "add" && auditStatusFormData) {
      console.log("Syncing form values with auditStatusFormData in add mode:", auditStatusFormData);
      
      setValue("subsidiary.subsidiaryCode", auditStatusFormData.subsidiary?.subsidiaryCode || "");
      setValue("subsidiary.subsidiaryName", auditStatusFormData.subsidiary?.subsidiaryName || "");
      setValue("division.divisionCode", auditStatusFormData.division?.divisionCode || "");
      setValue("division.divisionName", auditStatusFormData.division?.divisionName || "");
      setValue("department.departmentCode", auditStatusFormData.department?.departmentCode || "");
      setValue("department.departmentName", auditStatusFormData.department?.departmentName || "");
      setValue("subDepartment.subDepartmentCode", auditStatusFormData.subDepartment?.subDepartmentCode || "");
      setValue("subDepartment.subDepartmentName", auditStatusFormData.subDepartment?.subDepartmentName || "");
      setValue("section.sectionCode", auditStatusFormData.section?.sectionCode || "");
      setValue("section.sectionName", auditStatusFormData.section?.sectionName || "");
    }
  }, [auditStatusFormData, setValue, currentMode]);

  // Force re-render when organization data is loaded to ensure proper display
  useEffect(() => {
    if (subOrganization && Object.keys(subOrganization).length > 0) {
      console.log("Organization data loaded, current form values:", watchedValues);
      // Trigger a re-render by updating the form values
      const currentValues = watch();
      Object.keys(currentValues).forEach((key) => {
        const section = key as keyof OrganizationalStructureData;
        const sectionData = currentValues[section] as any;
        if (sectionData && sectionData[`${section}Code`]) {
          setValue(`${section}.${section}Code` as any, sectionData[`${section}Code`]);
        }
      });
    }
  }, [subOrganization, setValue, watch]);

  const handleCodeChange = (section: keyof OrganizationalStructureData, code: string) => {
    let name = ""
    
    // Find corresponding name based on selected code from API data
    if (subOrganization) {
      switch (section) {
        case "subsidiary":
          const subsidiary = subOrganization.subsidiaries?.find((opt: any) => 
            (opt.code === code) || (opt.subsidiaryCode === code)
          )
          name = subsidiary?.name || subsidiary?.subsidiaryName || ""
          
          // Clear dependent fields when subsidiary changes
          setValue("division.divisionCode", "")
          setValue("division.divisionName", "")
          setValue("department.departmentCode", "")
          setValue("department.departmentName", "")
          setValue("subDepartment.subDepartmentCode", "")
          setValue("subDepartment.subDepartmentName", "")
          setValue("section.sectionCode", "")
          setValue("section.sectionName", "")
          break
        case "division":
          const division = subOrganization.divisions?.find((opt: any) => 
            (opt.code === code) || (opt.divisionCode === code)
          )
          name = division?.name || division?.divisionName || ""
          
          // Clear dependent fields when division changes
          setValue("department.departmentCode", "")
          setValue("department.departmentName", "")
          setValue("subDepartment.subDepartmentCode", "")
          setValue("subDepartment.subDepartmentName", "")
          setValue("section.sectionCode", "")
          setValue("section.sectionName", "")
          break
        case "department":
          const department = subOrganization.departments?.find((opt: any) => 
            (opt.code === code) || (opt.departmentCode === code)
          )
          name = department?.name || department?.departmentName || ""
          
          // Clear dependent fields when department changes
          setValue("subDepartment.subDepartmentCode", "")
          setValue("subDepartment.subDepartmentName", "")
          setValue("section.sectionCode", "")
          setValue("section.sectionName", "")
          break
        case "subDepartment":
          const subDept = subOrganization.subDepartments?.find((opt: any) => 
            (opt.code === code) || (opt.subDepartmentCode === code)
          )
          name = subDept?.name || subDept?.subDepartmentName || ""
          
          // Clear dependent fields when subDepartment changes
          setValue("section.sectionCode", "")
          setValue("section.sectionName", "")
          break
        case "section":
          const section = subOrganization.sections?.find((opt: any) => 
            (opt.code === code) || (opt.sectionCode === code)
          )
          name = section?.name || section?.sectionName || ""
          break
      }
    }

    // Update both code and name with proper type casting
    setValue(`${section}.${section}Code` as any, code)
    setValue(`${section}.${section}Name` as any, name)
    
    // Update form data based on mode
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        [section]: {
          ...auditStatusFormData[section],
          [`${section}Code`]: code,
          [`${section}Name`]: name,
        },
      })
    } else {
      onFormDataChange({
        [section]: {
          ...formData[section],
          [`${section}Code`]: code,
          [`${section}Name`]: name,
        },
      })
    }
  }

  const handleReset = () => {
    reset({
      subsidiary: { subsidiaryCode: "", subsidiaryName: "" },
      division: { divisionCode: "", divisionName: "" },
      department: { departmentCode: "", departmentName: "" },
      subDepartment: { subDepartmentCode: "", subDepartmentName: "" },
      section: { sectionCode: "", sectionName: "" },
    })
    setShowErrors(false)
    
    if (mode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        subsidiary: { subsidiaryCode: "", subsidiaryName: "" },
        division: { divisionCode: "", divisionName: "" },
        department: { departmentCode: "", departmentName: "" },
        subDepartment: { subDepartmentCode: "", subDepartmentName: "" },
        section: { sectionCode: "", sectionName: "" },
      })
    } else {
      onFormDataChange({
        subsidiary: { subsidiaryCode: "", subsidiaryName: "" },
        division: { divisionCode: "", divisionName: "" },
        department: { departmentCode: "", departmentName: "" },
        subDepartment: { subDepartmentCode: "", subDepartmentName: "" },
        section: { sectionCode: "", sectionName: "" },
      })
    }
  }

  const {
    post: postBasicInformation,
  } = usePostRequest<any>({
    url: "company_employee",
    onSuccess: (data) => {
      alert("✅ Organizational structure information successfully stored in backend!");
    },
    onError: (error) => {
      alert("❌ Failed to store organizational structure information in backend!");
      console.error("POST error:", error);
    },
  });

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const isValid = await trigger()
    const formValues = watch()

    if (isValid) {
      if (mode === "add") {
        // Update audit status to mark this tab as completed
        setAuditStatus?.({
          ...auditStatus,
          organizationalStructure: true
        })
        const deployment = {
          ...auditStatusFormData,
          deployment: {
            ...auditStatusFormData.deployment,
            formValues
          }
        }

      
        
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
        let json = {
          tenant: "Midhani",
          action: "insert",
          id: auditStatusFormData._id || null,
          collectionName: "company_employee",
          data: {
            ...auditStatusFormData,
            deployment: {
              ...auditStatusFormData.deployment,
              ...formValues
            },
          }
        }
        postBasicInformation(json)
      }
      
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
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Organizational Structure</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Define the organizational hierarchy and structure
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Primary Structure */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Primary Structure
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="subsidiaryCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Subsidiary Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.subsidiary?.subsidiaryCode} 
                  onValueChange={(value) => handleCodeChange("subsidiary", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.subsidiary?.subsidiaryCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder="Select Subsidiary Code" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : subOrganization?.subsidiaries && subOrganization.subsidiaries.length > 0 ? (
                      subOrganization.subsidiaries.map((option: any) => {
                        console.log("Subsidiary option:", option);
                        const optionValue = option.code || option.subsidiaryCode || "";
                        const optionName = option.name || option.subsidiaryName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {subOrganization?.subsidiaries ? 'No subsidiaries available' : 'Loading subsidiaries...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.subsidiary?.subsidiaryCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.subsidiary.subsidiaryCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="subsidiaryName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Subsidiary Name <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.subsidiary?.subsidiaryName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.subsidiary.subsidiaryName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.subsidiary?.subsidiaryName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.subsidiary.subsidiaryName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="divisionCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Division Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  key={`division-${watchedValues.division?.divisionCode || 'empty'}`}
                  value={watchedValues.division?.divisionCode || ""} 
                  onValueChange={(value) => handleCodeChange("division", value)}
                  disabled={isViewMode || !watchedValues.subsidiary?.subsidiaryCode}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !watchedValues.subsidiary?.subsidiaryCode
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.division?.divisionCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!watchedValues.subsidiary?.subsidiaryCode ? "Select Subsidiary first" : "Select Division Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredDivisions.length > 0 ? (
                      filteredDivisions.map((option: any) => {
                        console.log("Division option:", option);
                        const optionValue = option.code || option.divisionCode || "";
                        const optionName = option.name || option.divisionName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!watchedValues.subsidiary?.subsidiaryCode ? 'Please select a subsidiary first' : 'No divisions available for selected subsidiary'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.division?.divisionCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.division.divisionCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="divisionName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Division Name <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.division?.divisionName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.division.divisionName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.division?.divisionName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.division.divisionName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Department Structure */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Department Structure
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="departmentCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Department Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.department?.departmentCode} 
                  onValueChange={(value) => handleCodeChange("department", value)}
                  disabled={isViewMode || !watchedValues.division?.divisionCode}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !watchedValues.division?.divisionCode
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.department?.departmentCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!watchedValues.division?.divisionCode ? "Select Division first" : "Select Department Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredDepartments.length > 0 ? (
                      filteredDepartments.map((option: any) => {
                        console.log("Department option:", option);
                        const optionValue = option.code || option.departmentCode || "";
                        const optionName = option.name || option.departmentName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!watchedValues.division?.divisionCode ? 'Please select a division first' : 'No departments available for selected division'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.department?.departmentCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.department.departmentCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="departmentName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Department Name <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.department?.departmentName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.department.departmentName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.department?.departmentName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.department.departmentName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="subDepartmentCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Sub Department Code
                </Label>
                <Select 
                  value={watchedValues.subDepartment?.subDepartmentCode} 
                  onValueChange={(value) => handleCodeChange("subDepartment", value)}
                  disabled={isViewMode || !watchedValues.department?.departmentCode}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !watchedValues.department?.departmentCode
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.subDepartment?.subDepartmentCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!watchedValues.department?.departmentCode ? "Select Department first" : "Select Sub Department Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredSubDepartments.length > 0 ? (
                      filteredSubDepartments.map((option: any) => {
                        console.log("SubDepartment option:", option);
                        const optionValue = option.code || option.subDepartmentCode || "";
                        const optionName = option.name || option.subDepartmentName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!watchedValues.department?.departmentCode ? 'Please select a department first' : 'No sub departments available for selected department'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.subDepartment?.subDepartmentCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.subDepartment.subDepartmentCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="subDepartmentName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Sub Department Name
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.subDepartment?.subDepartmentName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.subDepartment.subDepartmentName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.subDepartment?.subDepartmentName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.subDepartment.subDepartmentName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Section Details */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Section Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="sectionCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Section Code
                </Label>
                <Select 
                  key={`section-${watchedValues.section?.sectionCode || 'empty'}`}
                  value={watchedValues.section?.sectionCode || ""} 
                  onValueChange={(value) => handleCodeChange("section", value)}
                  disabled={isViewMode || !watchedValues.subDepartment?.subDepartmentCode}
                >
                  <SelectTrigger className={`h-10 border-2 rounded-xl bg-white ${
                    isViewMode || !watchedValues.subDepartment?.subDepartmentCode
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.section?.sectionCode) 
                      ? "border-red-500" 
                      : "border-gray-200"
                  }`}>
                    <SelectValue placeholder={!watchedValues.subDepartment?.subDepartmentCode ? "Select Sub Department first" : "Select Section Code"} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : filteredSections.length > 0 ? (
                      filteredSections.map((option: any) => {
                        console.log("Section option:", option);
                        const optionValue = option.code || option.sectionCode || "";
                        const optionName = option.name || option.sectionName || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {!watchedValues.subDepartment?.subDepartmentCode ? 'Please select a sub department first' : 'No sections available for selected sub department'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.section?.sectionCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.section.sectionCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="sectionName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Section Name
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.section?.sectionName ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.section.sectionName}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.section?.sectionName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.section.sectionName.message}
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
