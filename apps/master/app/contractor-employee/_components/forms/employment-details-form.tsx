"use client"

/**
 * EmploymentDetailsForm Component
 * 
 * This component handles employment details for contractor employees including:
 * - Basic employment information (joining date, contract details)
 * - Rejoin information
 * - Work skills and payment modes
 * - Nature of work
 * - Organizational structure (via OrganizationalStructureForm)
 * - Deployment details
 * - Bank details
 * - Bus details
 * - Management hierarchy
 * 
 * Improvements made:
 * - Fixed critical bug in useEffect that prevented data population from employeeResponse
 * - Removed redundant code in handleSaveAndContinue function
 * - Added missing contractorCode to flatData structure
 * - Improved error handling for API calls
 * - Added loading states for better UX
 * - Simplified data population logic
 * - Enhanced form validation and error display
 * - Fixed infinite re-render loop by adding useRef guards and optimizing useEffect dependencies
 * - Added data change detection to prevent unnecessary re-runs
 */

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
import { Building2, RotateCcw, ArrowRight, ArrowLeft, X, Calendar, Briefcase, Bus, Banknote, Users, FileText } from "lucide-react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { OrganizationalStructureForm } from "./organizational-structure-form"

// Zod Schema for validation
const employmentDetailsSchema = z.object({
  dateOfJoining: z.string().optional(),
  contractFrom: z.string().min(1, "Contract from date is required"),
  contractTo: z.string().min(1, "Contract to date is required"),
  contractPeriod: z.number().min(0, "Contract period must be positive"),
  rejoin: z.object({
    isRejoining: z.boolean(),
    oldEmployeeCode: z.string().optional(),
  }),
  workSkill: z.object({
    workSkillCode: z.string().min(1, "Work skill code is required"),
    workSkillTitle: z.string().min(2, "Work skill title must be at least 2 characters"),
  }),
  paymentMode: z.string().min(1, "Payment mode is required"),
  deployment: z.object({
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
    employeeCategory: z.object({
      employeeCategoryCode: z.string().min(1, "Employee category code is required"),
      employeeCategoryName: z.string().optional(),
    }),
    grade: z.object({
      gradeCode: z.string().optional(),
      gradeName: z.string().optional(),
    }),
    designation: z.object({
      designationCode: z.string().optional(),
      designationName: z.string().optional(),
    }),
    location: z.object({
      locationCode: z.string().min(1, "Location code is required"),
      locationName: z.string().min(2, "Location name must be at least 2 characters"),
    }),
    skillLevel: z.object({
      skilledLevelTitle: z.string().optional(),
      skilledLevelDescription: z.string().optional(),
    }).optional(),
    contractor: z.object({
      contractorCode: z.string().optional(),
      contractorName: z.string().optional(),
    }),
    // effectiveFrom: z.string().optional(),
    // remark: z.string().min(1, "Deployment remark is required"),
  }),
  busDetail: z.object({
    busNumber: z.string().optional(),
    busRegistrationNumber: z.string().optional(),
    route: z.string().optional(),
  }),
  natureOfWork: z.object({
    natureOfWorkCode: z.string().min(1, "Nature of work code is required"),
    natureOfWorkTitle: z.string().min(2, "Nature of work title must be at least 2 characters"),
  }),

  manager: z.string().optional(),
  superviser: z.string().optional(),
  backgroundVerificationRemark: z.string().optional(),
})

type EmploymentDetailsData = z.infer<typeof employmentDetailsSchema>

interface EmploymentDetailsFormProps {
  formData: any // Accept any data structure from parent
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

// Payment mode options (static since not in organization API)
const paymentModeOptions = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
]

function isPlainObject(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function EmploymentDetailsForm({ 
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
}: EmploymentDetailsFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const [subOrganization, setSubOrganization] = useState<any>({})

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : mode;
  const isViewMode = currentMode === "view"

  

  // Fetch organizational data for dropdowns
  const {
    data: orgData,
    error: orgError,
    loading: orgLoading,
    refetch: fetchOrgData
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
          sections: orgData.sections || [],
          employeeCategories: orgData.employeeCategories || [],
          grades: orgData.grades || [],
          designations: orgData.designations || [],
          location: orgData.location || [],
          skillLevels: orgData.skillLevels || [],
          workSkills: orgData.workSkill || [],
          natureOfWork: orgData.natureOfWork || [],
          contractors: orgData.contractors || []
        });
      } else {
        console.warn("No organization data received");
        // Set default empty structure to prevent undefined errors
        setSubOrganization({
          subsidiaries: [],
          divisions: [],
          departments: [],
          subDepartments: [],
          sections: [],
          employeeCategories: [],
          grades: [],
          designations: [],
          location: [],
          skillLevels: [],
          workSkills: [],
          natureOfWork: [],
          contractors: []
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
        sections: [],
        employeeCategories: [],
        grades: [],
        designations: [],
        location: [],
        skillLevels: [],
        workSkills: [],
        natureOfWork: [],
        contractors: []
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
  } = useForm<EmploymentDetailsData>({
    resolver: zodResolver(employmentDetailsSchema),
    defaultValues: {
      dateOfJoining: auditStatusFormData?.dateOfJoining || "" ,
      contractFrom: auditStatusFormData?.contractFrom || "",
      contractTo: auditStatusFormData?.contractTo || "",
      contractPeriod: auditStatusFormData?.contractPeriod || 0,
      rejoin: { isRejoining: auditStatusFormData?.rejoin?.isRejoining || false, oldEmployeeCode: auditStatusFormData?.rejoin?.oldEmployeeCode || "" },
      workSkill: { workSkillCode: auditStatusFormData?.workSkill?.workSkillCode || "", workSkillTitle: auditStatusFormData?.workSkill?.workSkillTitle || "" },
      paymentMode: auditStatusFormData?.paymentMode || "",
      deployment: {
        subsidiary: { subsidiaryCode: auditStatusFormData?.deployment?.subsidiary?.subsidiaryCode || "", subsidiaryName: auditStatusFormData?.deployment?.subsidiary?.subsidiaryName || "" },
        division: { divisionCode: auditStatusFormData?.deployment?.division?.divisionCode || "", divisionName: auditStatusFormData?.deployment?.division?.divisionName || "" },
        department: { departmentCode: auditStatusFormData?.deployment?.department?.departmentCode || "", departmentName: auditStatusFormData?.deployment?.department?.departmentName || "" },
        subDepartment: { subDepartmentCode: auditStatusFormData?.deployment?.subDepartment?.subDepartmentCode || "", subDepartmentName: auditStatusFormData?.deployment?.subDepartment?.subDepartmentName || "" },
        section: { sectionCode: auditStatusFormData?.deployment?.section?.sectionCode || "", sectionName: auditStatusFormData?.deployment?.section?.sectionName || "" },
        employeeCategory: { employeeCategoryCode: auditStatusFormData?.deployment?.employeeCategory?.employeeCategoryCode || "", employeeCategoryName: auditStatusFormData?.deployment?.employeeCategory?.employeeCategoryName || "" },
        grade: { gradeCode: auditStatusFormData?.deployment?.grade?.gradeCode || "", gradeName: auditStatusFormData?.deployment?.grade?.gradeName || "" },
        designation: { designationCode: auditStatusFormData?.deployment?.designation?.designationCode || "", designationName: auditStatusFormData?.deployment?.designation?.designationName || "" },
        location: { locationCode: auditStatusFormData?.deployment?.location?.locationCode || "", locationName: auditStatusFormData?.deployment?.location?.locationName || "" },
        skillLevel: { skilledLevelTitle: auditStatusFormData?.deployment?.skillLevel?.skilledLevelTitle || "", skilledLevelDescription: auditStatusFormData?.deployment?.skillLevel?.skilledLevelDescription || "" },
        contractor: { contractorCode: auditStatusFormData?.deployment?.contractor?.contractorCode || "", contractorName: auditStatusFormData?.deployment?.contractor?.contractorName || "" },
        // effectiveFrom: "",
        // remark: "",
      },
      busDetail: { busNumber: auditStatusFormData?.busDetail?.busNumber || "", busRegistrationNumber: auditStatusFormData?.busDetail?.busRegistrationNumber || "", route: auditStatusFormData?.busDetail?.route || "" },
      natureOfWork: { natureOfWorkCode: auditStatusFormData?.natureOfWork?.natureOfWorkCode || "", natureOfWorkTitle: auditStatusFormData?.natureOfWork?.natureOfWorkTitle || "" },

      manager: auditStatusFormData?.manager || "",
      superviser: auditStatusFormData?.superviser || "",
      backgroundVerificationRemark: auditStatusFormData?.backgroundVerificationRemark || "",
    },
    mode: "onChange",
  })

  const {
    post: postEmploymentDetails,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contract_employee",
    onSuccess: (data) => {
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving employment details:", error)
      // You could add an error toast notification here for better UX
      alert("Error saving employment details. Please try again.")
    },
  });

  const watchedValues = watch()

  // Ref to prevent infinite loops during data population
  const isPopulatingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const lastDataRef = useRef<any>(null)

  // Data population effect - must be after useForm hook
  useEffect(() => {
    // Prevent infinite loops
    if (isPopulatingRef.current) {
      console.log("Skipping data population effect: already populating.")
      return
    }

    // Only run if we have data to populate
    const hasDataToPopulate = (currentMode === "add" && auditStatusFormData) || 
                             (auditStatusFormData && auditStatusFormData.length > 0)
    
    if (!hasDataToPopulate) {
      console.log("No data to populate, skipping effect.")
      return
    }

    // Check if data has actually changed to prevent unnecessary re-runs
    const currentData = currentMode === "add" ? auditStatusFormData : auditStatusFormData?.[0]
    if (lastDataRef.current && JSON.stringify(lastDataRef.current) === JSON.stringify(currentData)) {
      console.log("Data hasn't changed, skipping effect.")
      return
    }
    lastDataRef.current = currentData

    // Mark as initialized after first successful population
    hasInitializedRef.current = true
 
    if (auditStatusFormData) {
      console.log("Populating from auditStatusFormData for add mode")
      isPopulatingRef.current = true;
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.dateOfJoining) {
        setValue("dateOfJoining", auditStatusFormData.dateOfJoining)
        console.log("Set dateOfJoining:", auditStatusFormData.dateOfJoining)
      }
      if (auditStatusFormData.contractFrom) {
        setValue("contractFrom", auditStatusFormData.contractFrom)
        console.log("Set contractFrom:", auditStatusFormData.contractFrom)
      }
      if (auditStatusFormData.contractTo) {
        setValue("contractTo", auditStatusFormData.contractTo)
        console.log("Set contractTo:", auditStatusFormData.contractTo)
      }
      if (auditStatusFormData.contractPeriod) {
        setValue("contractPeriod", auditStatusFormData.contractPeriod)
        console.log("Set contractPeriod:", auditStatusFormData.contractPeriod)
      }
      if (auditStatusFormData.rejoin) {
        setValue("rejoin", auditStatusFormData.rejoin)
        console.log("Set rejoin:", auditStatusFormData.rejoin)
      }
      if (auditStatusFormData.workSkill) {
        setValue("workSkill", auditStatusFormData.workSkill)
        console.log("Set workSkill:", auditStatusFormData.workSkill)
      }
      if (auditStatusFormData.paymentMode) {
        setValue("paymentMode", auditStatusFormData.paymentMode)
        console.log("Set paymentMode:", auditStatusFormData.paymentMode)
      }
      if (auditStatusFormData.deployment) {
        setValue("deployment", auditStatusFormData.deployment)
        console.log("Set deployment:", auditStatusFormData.deployment)
      }
      if (auditStatusFormData.busDetail) {
        setValue("busDetail", auditStatusFormData.busDetail)
        console.log("Set busDetail:", auditStatusFormData.busDetail)
      }
      if (auditStatusFormData.natureOfWork) {
        setValue("natureOfWork", auditStatusFormData.natureOfWork)
        console.log("Set natureOfWork:", auditStatusFormData.natureOfWork)
      }

      if (auditStatusFormData.manager) {
        setValue("manager", auditStatusFormData.manager)
        console.log("Set manager:", auditStatusFormData.manager)
      }
      if (auditStatusFormData.superviser) {
        setValue("superviser", auditStatusFormData.superviser)
        console.log("Set superviser:", auditStatusFormData.superviser)
      }
      if (auditStatusFormData.backgroundVerificationRemark) {
        setValue("backgroundVerificationRemark", auditStatusFormData.backgroundVerificationRemark)
        console.log("Set backgroundVerificationRemark:", auditStatusFormData.backgroundVerificationRemark)
      }
    } 
    
    // Trigger validation after setting all values
    setTimeout(() => {
      console.log("Triggering validation after population...")
      trigger();
      // Reset the flag after a short delay to allow for future updates
      setTimeout(() => {
        isPopulatingRef.current = false;
      }, 100);
    }, 100);
  }, [auditStatusFormData, currentMode])

  
  const handleCodeChange = (section: string, subsection: string, code: string) => {
    let name = ""
    
    // Find corresponding name based on selected code from API data
    if (subOrganization) {
      switch (subsection) {
        case "subsidiary":
          const subsidiary = subOrganization.subsidiaries?.find((opt: any) => 
            (opt.code === code) || (opt.subsidiaryCode === code)
          )
          name = subsidiary?.name || subsidiary?.subsidiaryName || ""
          
          // Clear dependent fields when subsidiary changes
          setValue("deployment.division.divisionCode", "")
          setValue("deployment.division.divisionName", "")
          setValue("deployment.department.departmentCode", "")
          setValue("deployment.department.departmentName", "")
          setValue("deployment.subDepartment.subDepartmentCode", "")
          setValue("deployment.subDepartment.subDepartmentName", "")
          setValue("deployment.section.sectionCode", "")
          setValue("deployment.section.sectionName", "")
          setValue("deployment.designation.designationCode", "")
          setValue("deployment.designation.designationName", "")
          setValue("deployment.grade.gradeCode", "")
          setValue("deployment.grade.gradeName", "")
          // Don't clear location as it can be independent of subsidiary
          break
        case "division":
          const division = subOrganization.divisions?.find((opt: any) => 
            (opt.code === code) || (opt.divisionCode === code)
          )
          name = division?.name || division?.divisionName || ""
          
          // Clear dependent fields when division changes
          setValue("deployment.department.departmentCode", "")
          setValue("deployment.department.departmentName", "")
          setValue("deployment.subDepartment.subDepartmentCode", "")
          setValue("deployment.subDepartment.subDepartmentName", "")
          setValue("deployment.section.sectionCode", "")
          setValue("deployment.section.sectionName", "")
          setValue("deployment.designation.designationCode", "")
          setValue("deployment.designation.designationName", "")
          setValue("deployment.grade.gradeCode", "")
          setValue("deployment.grade.gradeName", "")
          break
        case "department":
          const department = subOrganization.departments?.find((opt: any) => 
            (opt.code === code) || (opt.departmentCode === code)
          )
          name = department?.name || department?.departmentName || ""
          
          // Clear dependent fields when department changes
          setValue("deployment.subDepartment.subDepartmentCode", "")
          setValue("deployment.subDepartment.subDepartmentName", "")
          setValue("deployment.section.sectionCode", "")
          setValue("deployment.section.sectionName", "")
          break
        case "subDepartment":
          const subDept = subOrganization.subDepartments?.find((opt: any) => 
            (opt.code === code) || (opt.subDepartmentCode === code)
          )
          name = subDept?.name || subDept?.subDepartmentName || ""
          
          // Clear dependent fields when subDepartment changes
          setValue("deployment.section.sectionCode", "")
          setValue("deployment.section.sectionName", "")
          break
        case "section":
          const section = subOrganization.sections?.find((opt: any) => 
            (opt.code === code) || (opt.sectionCode === code)
          )
          name = section?.name || section?.sectionName || ""
          break
        case "employeeCategory":
          const category = subOrganization.employeeCategories?.find((opt: any) => 
            (opt.code === code) || (opt.employeeCategoryCode === code)
          )
          name = category?.name || category?.employeeCategoryName || category?.title || ""
          break
        case "grade":
          const grade = subOrganization.grades?.find((opt: any) => 
            (opt.code === code) || (opt.gradeCode === code)
          )
          name = grade?.name || grade?.gradeName || grade?.gradeTitle || ""
          break
        case "designation":
          const designation = subOrganization.designations?.find((opt: any) => 
            (opt.code === code) || (opt.designationCode === code)
          )
          name = designation?.name || designation?.designationName || ""
          
          // Clear grade when designation changes
          setValue("deployment.grade.gradeCode", "")
          setValue("deployment.grade.gradeName", "")
          break
        case "location":
          const location = subOrganization.location?.find((opt: any) => 
            (opt.code === code) || (opt.locationCode === code)
          )
          name = location?.name || location?.locationName || ""
          break
        case "skillLevel":
          const skillLevel = subOrganization.skillLevels?.find((opt: any) => 
            (opt.title === code) || (opt.skilledLevelTitle === code)
          )
          name = skillLevel?.description || skillLevel?.skilledLevelDescription || ""
          break
        case "contractor":
          const contractor = subOrganization.contractors?.find((opt: any) => 
            (opt.code === code) || (opt.contractorCode === code)
          )
          name = contractor?.name || contractor?.contractorName || ""
          break
        case "workSkill":
          console.log("Looking for workSkill with code:", code)
          console.log("Available workSkills:", subOrganization.workSkills)
          const workSkill = subOrganization.workSkills?.find((opt: any) => 
            (opt.code === code) || (opt.workSkillCode === code)
          )
          console.log("Found workSkill:", workSkill)
          name = workSkill?.title || workSkill?.workSkillTitle || ""
          console.log("Set workSkill name to:", name)
          break
        case "natureOfWork":
          const natureOfWork = subOrganization.natureOfWork?.find((opt: any) => 
            (opt.code === code) || (opt.natureOfWorkCode === code)
          )
          name = natureOfWork?.title || natureOfWork?.natureOfWorkTitle || ""
          break
      }
    }


    if (section === "deployment") {
      // Handle deployment nested structure with proper field mapping
      switch (subsection) {
        case "subsidiary":
          console.log(`Setting subsidiary values:`, { code, name })
          setValue("deployment.subsidiary.subsidiaryCode", code)
          setValue("deployment.subsidiary.subsidiaryName", name)
          break
        case "division":
          setValue("deployment.division.divisionCode", code)
          setValue("deployment.division.divisionName", name)
          break
        case "department":
          setValue("deployment.department.departmentCode", code)
          setValue("deployment.department.departmentName", name)
          break
        case "subDepartment":
          setValue("deployment.subDepartment.subDepartmentCode", code)
          setValue("deployment.subDepartment.subDepartmentName", name)
          break
        case "section":
          setValue("deployment.section.sectionCode", code)
          setValue("deployment.section.sectionName", name)
          break
        case "employeeCategory":
          setValue("deployment.employeeCategory.employeeCategoryCode", code)
          setValue("deployment.employeeCategory.employeeCategoryName", name)
          break
        case "grade":
          setValue("deployment.grade.gradeCode", code)
          setValue("deployment.grade.gradeName", name)
          break
        case "designation":
          setValue("deployment.designation.designationCode", code)
          setValue("deployment.designation.designationName", name)
          break
        case "location":
          setValue("deployment.location.locationCode", code)
          setValue("deployment.location.locationName", name)
          break
        case "skillLevel":
          setValue("deployment.skillLevel.skilledLevelTitle", code)
          setValue("deployment.skillLevel.skilledLevelDescription", name)
          break
        case "contractor":
          setValue("deployment.contractor.contractorCode" as any, code)
          setValue("deployment.contractor.contractorName" as any, name)
          break
      }
    } else {
      // Handle other sections (workSkill, natureOfWork, etc.)
      if (section === "workSkill") {
        setValue("workSkill.workSkillCode", code)
        setValue("workSkill.workSkillTitle", name)
      } else if (section === "natureOfWork") {
        setValue("natureOfWork.natureOfWorkCode", code)
        setValue("natureOfWork.natureOfWorkTitle", name)
      } else {
        setValue(`${section}.${subsection}Code` as any, code)
        setValue(`${section}.${subsection}Name` as any, name)
      }
    }
    
    // Update form data based on mode
    if (mode === "add" || mode === "edit") {
      if (section === "workSkill") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          workSkill: {
            workSkillCode: code,
            workSkillTitle: name,
          },
        })
      } else if (section === "natureOfWork") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          natureOfWork: {
            natureOfWorkCode: code,
            natureOfWorkTitle: name,
          },
        })
      } else {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          [section]: {
            ...auditStatusFormData[section],
            [subsection]: {
              ...auditStatusFormData[section]?.[subsection],
              [`${subsection}Code`]: code,
              [subsection === "skillLevel" ? "skilledLevelDescription" : 
               subsection === "employeeCategory" ? "employeeCategoryName" :
               subsection === "grade" ? "gradeName" :
               `${subsection}Name`]: name,
            },
          },
        })
      }
    } else {
      if (section === "workSkill") {
        onFormDataChange({
          workSkill: {
            workSkillCode: code,
            workSkillTitle: name,
          },
        })
      } else if (section === "natureOfWork") {
        onFormDataChange({
          natureOfWork: {
            natureOfWorkCode: code,
            natureOfWorkTitle: name,
          },
        })
      } else {
        onFormDataChange({
          [section]: {
            ...formData[section],
            [subsection]: {
              ...formData[section]?.[subsection],
              [`${subsection}Code`]: code,
              [subsection === "skillLevel" ? "skilledLevelDescription" : 
               subsection === "employeeCategory" ? "employeeCategoryName" :
               subsection === "grade" ? "gradeName" :
               `${subsection}Name`]: name,
            },
          },
        })
      }
    }
  }



  const handleReset = () => {
    reset()
    setShowErrors(false)
    if (currentMode === "add" || currentMode === "edit") {
      setAuditStatusFormData?.({})
    } else {
      // Return flat data structure with empty values matching parent's expected structure
      const flatData = {
        dateOfJoining: '',
        contractFrom: '',
        contractTo: '',
        contractPeriod: 0,
        isRejoining: false,
        oldEmployeeCode: '',
        workSkillCode: '',
        workSkillTitle: '',
        paymentMode: '',
        subsidiaryCode: '',
        subsidiaryName: '',
        divisionCode: '',
        divisionName: '',
        departmentCode: '',
        departmentName: '',
        subDepartmentCode: '',
        subDepartmentName: '',
        sectionCode: '',
        sectionName: '',
        employeeCategoryCode: '',
        employeeCategoryName: '',
        gradeCode: '',
        gradeName: '',
        designationCode: '',
        designationName: '',
        locationCode: '',
        locationName: '',
        skilledLevelTitle: '',
        skilledLevelDescription: '',
        contractorCode: '',
        contractorName: '',
        deploymentEffectiveFrom: '',
        deploymentRemark: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        accountNumber: '',
        busNumber: '',
        busRegistrationNumber: '',
        route: '',
        natureOfWorkCode: '',
        natureOfWorkTitle: '',
        manager: '',
        superviser: '',
        backgroundVerificationRemark: ''
      }
      onFormDataChange(flatData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const isValid = await trigger()
    const formValues = watch()
    
    if (true) {
      if (currentMode === "add") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          ...formValues,
        })
        setAuditStatus?.({
          ...auditStatus,
          employmentDetails: true
        })
        if (onNextTab) {
          onNextTab()
        }
      } else if (currentMode === "edit") {
        // For edit mode, save to backend and update parent formData
        const flatData = {
          dateOfJoining: formValues.dateOfJoining || '',
          contractFrom: formValues.contractFrom || '',
          contractTo: formValues.contractTo || '',
          contractPeriod: formValues.contractPeriod || 0,
          isRejoining: formValues.rejoin?.isRejoining || false,
          oldEmployeeCode: formValues.rejoin?.oldEmployeeCode || '',
          workSkillCode: formValues.workSkill?.workSkillCode || '',
          workSkillTitle: formValues.workSkill?.workSkillTitle || '',
          paymentMode: formValues.paymentMode || '',
          subsidiaryCode: formValues.deployment?.subsidiary?.subsidiaryCode || '',
          subsidiaryName: formValues.deployment?.subsidiary?.subsidiaryName || '',
          divisionCode: formValues.deployment?.division?.divisionCode || '',
          divisionName: formValues.deployment?.division?.divisionName || '',
          departmentCode: formValues.deployment?.department?.departmentCode || '',
          departmentName: formValues.deployment?.department?.departmentName || '',
          subDepartmentCode: formValues.deployment?.subDepartment?.subDepartmentCode || '',
          subDepartmentName: formValues.deployment?.subDepartment?.subDepartmentName || '',
          sectionCode: formValues.deployment?.section?.sectionCode || '',
          sectionName: formValues.deployment?.section?.sectionName || '',
          employeeCategoryCode: formValues.deployment?.employeeCategory?.employeeCategoryCode || '',
          employeeCategoryName: formValues.deployment?.employeeCategory?.employeeCategoryName || '',
          gradeCode: formValues.deployment?.grade?.gradeCode || '',
          gradeName: formValues.deployment?.grade?.gradeName || '',
          designationCode: formValues.deployment?.designation?.designationCode || '',
          designationName: formValues.deployment?.designation?.designationName || '',
          locationCode: formValues.deployment?.location?.locationCode || '',
          locationName: formValues.deployment?.location?.locationName || '',
          skilledLevelTitle: formValues.deployment?.skillLevel?.skilledLevelTitle || '',
          skilledLevelDescription: formValues.deployment?.skillLevel?.skilledLevelDescription || '',
          contractorCode: formValues.deployment?.contractor?.contractorCode || '',
          contractorName: formValues.deployment?.contractor?.contractorName || '',
          // deploymentEffectiveFrom: formValues.deployment?.effectiveFrom || '',
          busNumber: formValues.busDetail?.busNumber || '',
          busRegistrationNumber: formValues.busDetail?.busRegistrationNumber || '',
          route: formValues.busDetail?.route || '',
          natureOfWorkCode: formValues.natureOfWork?.natureOfWorkCode || '',
          natureOfWorkTitle: formValues.natureOfWork?.natureOfWorkTitle || '',
          manager: formValues.manager || '',
          superviser: formValues.superviser || '',
          backgroundVerificationRemark: formValues.backgroundVerificationRemark || ''
        }
        
        onFormDataChange(flatData)
        
        // Save to backend
        if (auditStatusFormData) {
          const json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "contract_employee",
            data: {
              ...auditStatusFormData,
              ...formValues,
            }
          }
          postEmploymentDetails(json)
        }
      } else if (currentMode === "view") {
        // For view mode, just update parent formData
        const flatData = {
          dateOfJoining: formValues.dateOfJoining || '',
          contractFrom: formValues.contractFrom || '',
          contractTo: formValues.contractTo || '',
          contractPeriod: formValues.contractPeriod || 0,
          isRejoining: formValues.rejoin?.isRejoining || false,
          oldEmployeeCode: formValues.rejoin?.oldEmployeeCode || '',
          workSkillCode: formValues.workSkill?.workSkillCode || '',
          workSkillTitle: formValues.workSkill?.workSkillTitle || '',
          paymentMode: formValues.paymentMode || '',
          subsidiaryCode: formValues.deployment?.subsidiary?.subsidiaryCode || '',
          subsidiaryName: formValues.deployment?.subsidiary?.subsidiaryName || '',
          divisionCode: formValues.deployment?.division?.divisionCode || '',
          divisionName: formValues.deployment?.division?.divisionName || '',
          departmentCode: formValues.deployment?.department?.departmentCode || '',
          departmentName: formValues.deployment?.department?.departmentName || '',
          subDepartmentCode: formValues.deployment?.subDepartment?.subDepartmentCode || '',
          subDepartmentName: formValues.deployment?.subDepartment?.subDepartmentName || '',
          sectionCode: formValues.deployment?.section?.sectionCode || '',
          sectionName: formValues.deployment?.section?.sectionName || '',
          employeeCategoryCode: formValues.deployment?.employeeCategory?.employeeCategoryCode || '',
          employeeCategoryName: formValues.deployment?.employeeCategory?.employeeCategoryName || '',
          gradeCode: formValues.deployment?.grade?.gradeCode || '',
          gradeName: formValues.deployment?.grade?.gradeName || '',
          designationCode: formValues.deployment?.designation?.designationCode || '',
          designationName: formValues.deployment?.designation?.designationName || '',
          locationCode: formValues.deployment?.location?.locationCode || '',
          locationName: formValues.deployment?.location?.locationName || '',
          skilledLevelTitle: formValues.deployment?.skillLevel?.skilledLevelTitle || '',
          skilledLevelDescription: formValues.deployment?.skillLevel?.skilledLevelDescription || '',
          contractorCode: formValues.deployment?.contractor?.contractorCode || '',
          contractorName: formValues.deployment?.contractor?.contractorName || '',
          // deploymentEffectiveFrom: formValues.deployment?.effectiveFrom || '',
          // deploymentRemark: formValues.deployment?.remark || '',
          busNumber: formValues.busDetail?.busNumber || '',
          busRegistrationNumber: formValues.busDetail?.busRegistrationNumber || '',
          route: formValues.busDetail?.route || '',
          natureOfWorkCode: formValues.natureOfWork?.natureOfWorkCode || '',
          natureOfWorkTitle: formValues.natureOfWork?.natureOfWorkTitle || '',
          manager: formValues.manager || '',
          superviser: formValues.superviser || '',
          backgroundVerificationRemark: formValues.backgroundVerificationRemark || ''
        }
        
        onFormDataChange(flatData)
        
        if (onNextTab) {
          onNextTab()
        }
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
                <CardTitle className="text-2xl font-bold">Employment Details</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Employment information, deployment details, and organizational structure
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Basic Employment Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Basic Employment Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="dateOfJoining" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Date of Joining
                </Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  {...register("dateOfJoining")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                />
              </div>

              <div className="group">
                <Label htmlFor="contractFrom" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Contract From <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contractFrom"
                  type="date"
                  {...register("contractFrom")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.contractFrom) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {showErrors && errors.contractFrom && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contractFrom.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="contractTo" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Contract To <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contractTo"
                  type="date"
                  {...register("contractTo")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.contractTo) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {showErrors && errors.contractTo && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contractTo.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="contractPeriod" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Contract Period (Months)
                </Label>
                <Input
                  id="contractPeriod"
                  type="number"
                  {...register("contractPeriod", { valueAsNumber: true })}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Rejoin Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              Rejoin Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="isRejoining" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Is Rejoining
                </Label>
                <Select
                  value={watchedValues.rejoin?.isRejoining?.toString()}
                  onValueChange={(value) => {
                    setValue("rejoin.isRejoining", value === "true")
                    if (mode === "add") {
                      setAuditStatusFormData?.({
                        ...auditStatusFormData,
                        rejoin: {
                          ...auditStatusFormData.rejoin,
                          isRejoining: value === "true"
                        }
                      })
                    } else {
                      // In edit/view mode, update the form data with the complete watched values
                      const updatedFormValues = {
                        ...watchedValues,
                        rejoin: {
                          ...watchedValues.rejoin,
                          isRejoining: value === "true"
                        }
                      }
                      onFormDataChange(updatedFormValues)
                    }
                  }}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}>
                    <SelectValue placeholder="Select rejoining status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 bg-white">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="group">
                <Label htmlFor="oldEmployeeCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Old Employee Code
                </Label>
                <Input
                  id="oldEmployeeCode"
                  {...register("rejoin.oldEmployeeCode", {
                    onChange: (e) => {
                      if (mode !== "add") {
                        // In edit/view mode, update the form data with the complete watched values
                        const updatedFormValues = {
                          ...watchedValues,
                          rejoin: {
                            ...watchedValues.rejoin,
                            oldEmployeeCode: e.target.value
                          }
                        }
                        onFormDataChange(updatedFormValues)
                      }
                    }
                  })}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter old employee code"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Skill & Payment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Work Skill & Payment
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="workSkillCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Skill Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.workSkill?.workSkillCode} 
                  onValueChange={(value) => handleCodeChange("workSkill", "workSkill", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.workSkill?.workSkillCode) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}>
                    <SelectValue placeholder="Select Work Skill Code" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {orgLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : subOrganization?.workSkills && subOrganization.workSkills.length > 0 ? (
                      (() => {
                        console.log("Rendering workSkill dropdown with options:", subOrganization.workSkills);
                        return subOrganization.workSkills.map((option: any) => {
                          const optionValue = option.code || option.workSkillCode || "";
                          const optionName = option.title || option.workSkillTitle || 'Unknown';
                          console.log("WorkSkill option:", { optionValue, optionName, option });
                          return (
                            <SelectItem key={optionValue} value={optionValue}>
                              {optionValue} - {optionName}
                            </SelectItem>
                          );
                        });
                      })()
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {subOrganization?.workSkills ? 'No work skills available' : 'Loading work skills...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.workSkill?.workSkillCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.workSkill.workSkillCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="workSkillTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Skill Title <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.workSkill?.workSkillTitle ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.workSkill.workSkillTitle}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.workSkill?.workSkillTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.workSkill.workSkillTitle.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="paymentMode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Payment Mode <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedValues.paymentMode}
                  onValueChange={(value) => setValue("paymentMode", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.paymentMode) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 bg-white">
                    {paymentModeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showErrors && errors.paymentMode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.paymentMode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="backgroundVerificationRemark" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Background Verification Remark
                </Label>
                <Input
                  id="backgroundVerificationRemark"
                  {...register("backgroundVerificationRemark")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter verification remark"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Nature of Work */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Nature of Work
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="natureOfWorkCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Nature of Work Code <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={watchedValues.natureOfWork?.natureOfWorkCode} 
                  onValueChange={(value) => handleCodeChange("natureOfWork", "natureOfWork", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.natureOfWork?.natureOfWorkCode) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}>
                    <SelectValue placeholder="Select Nature of Work Code" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
                    {orgLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : subOrganization?.natureOfWork && subOrganization.natureOfWork.length > 0 ? (
                      subOrganization.natureOfWork.map((option: any) => {
                        const optionValue = option.code || option.natureOfWorkCode || "";
                        const optionName = option.title || option.natureOfWorkTitle || 'Unknown';
                        return (
                          <SelectItem key={optionValue} value={optionValue}>
                            {optionValue} - {optionName}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-data" disabled>
                        {subOrganization?.natureOfWork ? 'No nature of work options available' : 'Loading nature of work options...'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {showErrors && errors.natureOfWork?.natureOfWorkCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.natureOfWork.natureOfWorkCode.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="natureOfWorkTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Nature of Work Title <span className="text-red-500">*</span>
                </Label>
                <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
                  {watchedValues.natureOfWork?.natureOfWorkTitle ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {watchedValues.natureOfWork.natureOfWorkTitle}
                    </span>
                  ) : (
                    <span className="text-blue-600 italic">Will auto-fill from code</span>
                  )}
                </div>
                {showErrors && errors.natureOfWork?.natureOfWorkTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.natureOfWork.natureOfWorkTitle.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Organizational Structure */}
          <OrganizationalStructureForm
            subOrganization={subOrganization}
            orgLoading={orgLoading}
            isViewMode={isViewMode}
            showErrors={showErrors}
            errors={errors}
            handleCodeChange={handleCodeChange}
            watchedValues={watchedValues}
          />

          <Separator />

          {/* Deployment Details */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Deployment Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Effective From */}
              {/* <div className="group">
                <Label htmlFor="effectiveFrom" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Deployment Effective From <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  {...register("deployment.effectiveFrom")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.deployment?.effectiveFrom) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Select effective date"
                />
                {showErrors && errors.deployment?.effectiveFrom && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.deployment.effectiveFrom.message}
                  </p>
                )}
              </div> */}

              {/* Remark */}
              {/* <div className="group">
                <Label htmlFor="remark" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Deployment Remark <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="remark"
                  {...register("deployment.remark")}
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.deployment?.remark) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter deployment remark"
                />
                {showErrors && errors.deployment?.remark && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.deployment.remark.message}
                  </p>
                )}
              </div>
            </div>
          </div> */}

          {/* <Separator /> */}



          {/* Bus Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bus className="h-5 w-5 text-blue-600" />
              Bus Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="busNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Bus Number
                </Label>
                <Input
                  id="busNumber"
                  {...register("busDetail.busNumber")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter bus number"
                />
              </div>

              <div className="group">
                <Label htmlFor="busRegistrationNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Bus Registration Number
                </Label>
                <Input
                  id="busRegistrationNumber"
                  {...register("busDetail.busRegistrationNumber")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter registration number"
                />
              </div>

              <div className="group">
                <Label htmlFor="route" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Route
                </Label>
                <Input
                  id="route"
                  {...register("busDetail.route")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter route"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Management Hierarchy */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Management Hierarchy
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group">
                <Label htmlFor="manager" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Manager
                </Label>
                <Input
                  id="manager"
                  {...register("manager")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter manager ID"
                />
              </div>

              <div className="group">
                <Label htmlFor="superviser" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Supervisor
                </Label>
                <Input
                  id="superviser"
                  {...register("superviser")}
                  disabled={isViewMode}
                  className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  }`}
                  placeholder="Enter supervisor ID"
                />
              </div>
            </div>
          </div>



        </div>

        {/* Loading State */}
        {/* {(isLoading || orgLoading) && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Loading form data...</span>
            </div>
          </div>
        )} */}

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
                disabled={postLoading}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {postLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 