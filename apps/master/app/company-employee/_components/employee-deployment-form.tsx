"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Save, ArrowLeft, User, Building2, MapPin, Settings, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation";

import {
  BasicInformationForm,
  OrganizationalStructureForm,
  DeploymentDetailsForm,
  ManagementHierarchyForm,
  SettingsRemarksForm,
} from "./forms"
import type { EmployeeDeploymentData } from "./types/employee-deployment.types"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

export function EmployeeDeploymentForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [formData, setFormData] = useState<any>({
    // Basic Employee Information
    employeeID: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    bloodGroup: "",
    nationality: "",
    maritalStatus: "",
    joiningDate: "",
    emailID: "",
    manager: "",
    photo: "",

    // Deployment Structure
    deployment: {
      subsidiary: {
        subsidiaryCode: "",
        subsidiaryName: "",
      },
      division: {
        divisionCode: "",
        divisionName: "",
      },
      department: {
        departmentCode: "",
        departmentName: "",
      },
      subDepartment: {
        subDepartmentCode: "",
        subDepartmentName: "",
      },
      section: {
        sectionCode: "",
        sectionName: "",
      },
      employeeCategory: {
        employeeCategoryCode: "",
        employeeCategoryTitle: "",
      },
      grade: {
        gradeCode: "",
        gradeTitle: "",
      },
      designation: {
        designationCode: "",
        designationName: "",
      },
      location: {
        locationCode: "",
        locationName: "",
      },
      skillLevel: {
        skillLevelCode: "",
        skillLevelTitle: "",
      },
      effectiveFrom: "",
      remark: "",
    },
  })

  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const mode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  // Add audit status state for local tab control
  const [auditStatus, setAuditStatus] = useState<any>({})
  const [auditStatusFormData, setAuditStatusFormData] = useState<any>({})

  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'company_employee/search',
    method: 'POST',
    data: [
      {
        field: "_id",
        value: id,
        operator: "eq",
      }
    ],
    onSuccess: (data) => { 
      setAuditStatusFormData(data[0])
    },
    onError: (error) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: [id]
  });

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      setFormData(auditStatusFormData)
    }
  }, [auditStatusFormData, mode])

  const [value, setValue] = useState<any>(attendanceResponse?.[0])

  useEffect(() => {
    setValue(attendanceResponse?.[0])
  }, [attendanceResponse])

  // Populate form data when API response is received
  useEffect(() => {
    if (attendanceResponse && attendanceResponse[0] && (mode === "edit" || mode === "view")) {
      const employeeData = attendanceResponse[0];
      
      // Normalize the data to match form expectations
      const normalizedData = {
        ...employeeData,
        gender: employeeData.gender ? employeeData.gender.toLowerCase() : "",
        // Add other field normalizations if needed
      };
      
      setFormData(normalizedData);
    }
  }, [attendanceResponse, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate back to company-employee page after successful submission
    router.push('/company-employee')
  }

  const handleCancel = () => {
    router.push('/company-employee')
  }

  const handleBack = () => {
    router.push('/company-employee')
  }

  const updateBasicInformation = (data: Partial<EmployeeDeploymentData>) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev:any) => ({ ...prev, ...data }))
  }

  const updateOrganizationalStructure = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev:any) => ({
      ...prev,
      deployment: { ...prev.deployment, ...data },
    }))
  }

  const updateDeploymentDetails = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev:any) => ({
      ...prev,
      deployment: { ...prev.deployment, ...data },
    }))
  }

  const updateManagementHierarchy = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev:any) => ({ ...prev, ...data }))
  }

  const updateSettingsRemarks = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev:any) => ({ ...prev, ...data }))
  }

  // Function to check if a tab is accessible based on audit status (like ContractorManagementForm)
  const isTabAccessible = (tabValue: string) => {
    // In edit and view modes, all tabs are accessible
    if (mode === "edit" || mode === "view") return true
    
    // In add mode, enforce step-by-step progression
    const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
    const currentIndex = tabOrder.indexOf(tabValue)
    
    // First tab is always accessible
    if (currentIndex === 0) return true
    
    // Check if all previous tabs are completed based on audit status
    for (let i = 0; i < currentIndex; i++) {
      const previousTab = tabOrder[i]
      if (!isTabCompleted(previousTab)) {
        return false
      }
    }
    
    return true
  }

  // Function to check if a specific tab is completed based on audit status
  const isTabCompleted = (tabValue: string) => {
    switch (tabValue) {
      case "basic":
        return auditStatus.basicInformation === true
      case "organizational":
        return auditStatus.organizationalStructure === true
      case "deployment":
        return auditStatus.deploymentDetails === true
      case "hierarchy":
        return auditStatus.managementHierarchy === true
      case "settings":
        return auditStatus.settingsRemarks === true
      default:
        return false
    }
  }

  // Function to get the next accessible tab
  const getNextAccessibleTab = () => {
    const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
    const currentIndex = tabOrder.indexOf(activeTab)
    
    for (let i = currentIndex + 1; i < tabOrder.length; i++) {
      const nextTab = tabOrder[i]
      if (isTabAccessible(nextTab)) {
        return nextTab
      }
    }
    
    return null
  }

  // Function to get the previous accessible tab
  const getPreviousAccessibleTab = () => {
    const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
    const currentIndex = tabOrder.indexOf(activeTab)
    
    for (let i = currentIndex - 1; i >= 0; i--) {
      const previousTab = tabOrder[i]
      if (isTabAccessible(previousTab)) {
        return previousTab
      }
    }
    
    return null
  }

  const handleNextTab = () => {
    // In edit and view modes, allow free navigation
    if (mode === "edit" || mode === "view") {
      const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
      const currentIndex = tabOrder.indexOf(activeTab)
      const nextIndex = currentIndex + 1
      
      if (nextIndex < tabOrder.length) {
        setActiveTab(tabOrder[nextIndex])
      }
      return
    }
    
    // In add mode, enforce step-by-step progression
    const nextTab = getNextAccessibleTab()
    if (nextTab) {
      setActiveTab(nextTab)
    } else {
      // Show alert that all tabs are completed or no next tab is accessible
      alert("All tabs have been completed or no next tab is accessible.")
    }
  }

  const handlePreviousTab = () => {
    // In edit and view modes, allow free navigation
    if (mode === "edit" || mode === "view") {
      const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
      const currentIndex = tabOrder.indexOf(activeTab)
      const previousIndex = currentIndex - 1
      
      if (previousIndex >= 0) {
        setActiveTab(tabOrder[previousIndex])
      }
      return
    }
    
    // In add mode, enforce step-by-step progression
    const previousTab = getPreviousAccessibleTab()
    if (previousTab) {
      setActiveTab(previousTab)
    } else {
      // Show alert that no previous tab is accessible
      // alert("No previous tab is accessible.")
    }
  }

  // Function to handle tab click with accessibility check
  const handleTabClick = (tabValue: string) => {
    // In edit and view modes, allow free navigation
    if (mode === "edit" || mode === "view") {
      setActiveTab(tabValue)
      return
    }
    
    // In add mode, enforce step-by-step progression
    if (isTabAccessible(tabValue)) {
      setActiveTab(tabValue)
    } else {
      // Find the first incomplete tab that needs to be completed
      const tabOrder = ["basic", "organizational", "deployment", "hierarchy", "settings"]
      const targetIndex = tabOrder.indexOf(tabValue)
      
      for (let i = 0; i < targetIndex; i++) {
        const previousTab = tabOrder[i]
        if (!isTabCompleted(previousTab)) {
          const tabLabels = {
            basic: "Basic Information",
            organizational: "Organizational Structure", 
            deployment: "Deployment Details",
            hierarchy: "Management Hierarchy",
            settings: "Settings & Remarks"
          }
          setActiveTab(previousTab)
          return
        }
      }
    }
  }

  const organizationalStructureData = {
    subsidiary: formData?.deployment?.subsidiary,
    division: formData?.deployment?.division,
    department: formData?.deployment?.department,
    subDepartment: formData?.deployment?.subDepartment,
    section: formData?.deployment?.section,
  }

  const deploymentDetailsData = {
    employeeCategory: formData?.deployment?.employeeCategory,
    grade: formData?.deployment?.grade,
    designation: formData?.deployment?.designation,
    location: formData?.deployment?.location,
    skillLevel: formData?.deployment?.skillLevel,
  }

  const managementHierarchyData = {
    manager: formData.manager,
    managerName: "", // Will be auto-filled based on manager selection
  }

  const settingsRemarksData = {
    deployment: {
      effectiveFrom: formData?.deployment?.effectiveFrom,
      remark: formData?.deployment?.remark,
    },
    status: "active" as "active" | "pending" | "inactive", // Default status
  }

  // Get page title based on mode
  const getPageTitle = () => {
    switch (mode) {
      case "add":
        return "Add New Employee Deployment"
      case "edit":
        return "Edit Employee Deployment"
      case "view":
        return "View Employee Deployment"
      default:
        return "Employee Deployment Management"
    }
  }

  // Get page description based on mode
  const getPageDescription = () => {
    switch (mode) {
      case "add":
        return "Add new employee deployment and organizational structure"
      case "edit":
        return "Edit existing employee deployment and organizational structure"
      case "view":
        return "View employee deployment details (read-only)"
      default:
        return "Manage employee deployment and organizational structure"
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>HR Management</span>
        <span>/</span>
        <span>Employee Management</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">Employee Deployment</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 hover:bg-blue-50"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
            <p className="text-gray-600">{getPageDescription()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            className="border-gray-300 hover:bg-gray-50 bg-transparent"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          {mode !== "view" && (
            <Button 
              className="bg-gradient-to-r text-white from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === "add" ? "Save Deployment" : "Update Deployment"}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
          {/* Clean Horizontal Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
            <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none p-0 h-auto">
              {[
                { value: "basic", label: "Basic Information", icon: User },
                { value: "organizational", label: "Organizational Structure", icon: Building2 },
                { value: "deployment", label: "Deployment Details", icon: MapPin },
                { value: "hierarchy", label: "Management Hierarchy", icon: Users },
                { value: "settings", label: "Settings & Remarks", icon: Settings },
              ].map((tab) => {
                const IconComponent = tab.icon
                const isAccessible = isTabAccessible(tab.value)
                const isCompleted = isTabCompleted(tab.value)
                const isActive = activeTab === tab.value
                
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    disabled={mode === "add" && !isAccessible}
                    className={`flex items-center space-x-3 px-4 py-4 border-b-2 border-transparent rounded-none font-medium transition-colors duration-200 text-sm cursor-pointer relative ${
                      isActive 
                        ? 'border-blue-600 text-blue-600' 
                        : isCompleted 
                          ? 'text-green-600 hover:text-green-700' 
                          : isAccessible 
                            ? 'text-gray-500 hover:text-gray-700' 
                            : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <BasicInformationForm
              key={`basic-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateBasicInformation}
              onNextTab={handleNextTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
            />
          </TabsContent>

          {/* Organizational Structure Tab */}
          <TabsContent value="organizational" className="space-y-6">
            <OrganizationalStructureForm
              formData={organizationalStructureData}
              onFormDataChange={updateOrganizationalStructure}
              onNextTab={handleNextTab}
              onPreviousTab={handlePreviousTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
            />
          </TabsContent>

          {/* Deployment Details Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <DeploymentDetailsForm
              formData={deploymentDetailsData}
              onFormDataChange={updateDeploymentDetails}
              onNextTab={handleNextTab}
              onPreviousTab={handlePreviousTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
            />
          </TabsContent>

          {/* Management Hierarchy Tab */}
          <TabsContent value="hierarchy" className="space-y-6">
            <ManagementHierarchyForm
              formData={managementHierarchyData}
              onFormDataChange={updateManagementHierarchy}
              onNextTab={handleNextTab}
              onPreviousTab={handlePreviousTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
            />
          </TabsContent>

          {/* Settings & Remarks Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsRemarksForm
              formData={settingsRemarksData}
              onFormDataChange={updateSettingsRemarks}
              onPreviousTab={handlePreviousTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
              onSubmit={(data) => {
                // Handle form submission here
                router.push('/company-employee')
              }}
            />
          </TabsContent>
        </Tabs>

        
      </form>
    </div>
  )
}
