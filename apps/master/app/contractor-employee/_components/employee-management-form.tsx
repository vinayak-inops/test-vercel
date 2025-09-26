"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Save, ArrowLeft, User, Phone, Building2, FileText, Users, GraduationCap, Briefcase, Heart, Settings, ChevronLeft, ChevronRight, Banknote } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { PersonalInformationForm } from "./forms/personal-information-form"
import { ContactEmergencyForm } from "./forms/contact-emergency-form"
import { EmploymentDetailsForm } from "./forms/employment-details-form"
import { BankDetailsForm } from "./forms/bank-details-form"
import { DocumentsVerificationForm } from "./forms/documents-verification-form"
import { FamilyDependentsForm } from "./forms/family-dependents-form"
import { EducationExperienceForm } from "./forms/education-experience-form"
import { TrainingAssetsForm } from "./forms/training-assets-form"
import { MedicalSafetyForm } from "./forms/medical-safety-form"
import { ActionsStatusForm } from "./forms/actions-status-form"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"



export function EmployeeManagementForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)


  const [formData, setFormData] = useState<any>({
    // Personal Information
    organizationCode: "",
    contractorCode: "",
    firstName: "",
    middleName: "",
    lastName: "",
    fatherHusbandName: "",
    gender: "Male",
    birthDate: "",
    bloodGroup: "O+",
    nationality: "",
    maritalStatus: "Unmarried",
    marriageDate: "",
    referenceBy: "",
    employeeID: "",
    tenantCode: "",
    manager: "",
    superviser: "",
    personalRemark: "",
    isRejoining: false,
    oldEmployeeCode: "",
    permanentAddressLine1: "",
    permanentAddressLine2: "",
    permanentCountry: "",
    permanentState: "",
    permanentCity: "",
    permanentPinCode: "",
    permanentTaluka: "",
    permanentIsVerified: false,
    temporaryAddressLine1: "",
    temporaryAddressLine2: "",
    temporaryCountry: "",
    temporaryState: "",
    temporaryCity: "",
    temporaryPinCode: "",
    temporaryTaluka: "",
    temporaryIsVerified: false,

    // Contact & Emergency
    primaryEmailID: "",
    secondaryEmailID: "",
    primaryContactNo: "",
    secondaryContactNumber: "",
    emergencyContactPerson1: "",
    emergencyContactNo1: "",
    emergencyContactPerson2: "",
    emergencyContactNo2: "",

    // Employment Details
    dateOfJoining: "",
    contractFrom: "",
    contractTo: "",
    contractPeriod: 0,
    workSkillCode: "",
    workSkillTitle: "",
    paymentMode: "",
    subsidiaryCode: "",
    subsidiaryName: "",
    divisionCode: "",
    divisionName: "",
    departmentCode: "",
    departmentName: "",
    subDepartmentCode: "",
    subDepartmentName: "",
    sectionCode: "",
    sectionName: "",
    employeeCategoryCode: "",
    employeeCategoryTitle: "",
    gradeCode: "",
    gradeTitle: "",
    designationCode: "",
    designationName: "",
    locationCode: "",
    locationName: "",
    skilledLevelTitle: "",
    skilledLevelDescription: "",
    contractorName: "",
    deploymentEffectiveFrom: "",
    deploymentRemark: "",
    bankName: "",
    ifscCode: "",
    branchName: "",
    accountNumber: "",
    busNumber: "",
    busRegistrationNumber: "",
    route: "",
    natureOfWorkCode: "",
    natureOfWorkTitle: "",

    // Documents & Verification
    passport: {
      passportNumber: "",
      passportExpiryDate: "",
      passportPath: "",
    },
    cards: [],
    documents: [],
    insuranceNumber: "",
    mediclaimPolicyNumber: "",
    WCPolicyNumber: "",
    accidentPolicyNumber: "",
    uploadedDocuments: [],
    workPermit: {
      workpermitNumber: "",
      workpermitExpiryDate: "",
      workPermitPath: "",
    },
    labourCard: {
      labourCardNumber: "",
      labourcardExpiryDate: "",
      labourCardPath: "",
    },

    // Family & Dependents - Updated Structure
    familyMember: [],
    pfNominee: [],
    gratuityNominee: [],

    // Education & Experience - Updated Structure
    highestEducation: {
      educationTitle: "",
      courseTitle: "",
      stream: "",
      college: "",
      yearOfPassing: "",
      monthOfPassing: 1,
      percentage: "",
      isVerified: false,
    },
    experience: {
      companyName: "",
      fromDate: "",
      toDate: "",
      designation: "",
      filePath: "",
    },

    // Training & Assets
    trainings: [],
    assetAllocated: [],
    workOrder: [],

    // Medical & Safety - Updated Structure
    medicalVerificationRemark: "",
    covidVaccine: {
      vaccine1: false,
      vaccine2: false,
      vaccine3: false,
      vaccine1Certificate: "",
      vaccine2Certificate: "",
      vaccine3Certificate: "",
    },
    policeVerification: [],
    medicalCheckup: [],
    accidentRegister: [],

    // Actions & Status - Updated Structure
    remark: "",
    status: {
      currentStatus: "Active",
      resignationDate: "",
      relievingDate: "",
      notToReHire: false,
    },
    auditTrail: {
      createdBy: "",
      createdOn: "",
      updatedBy: "",
      updatedOn: "",
    },
    penalty: [],
    disciplinaryAction: [],
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
    data: employeeResponse,
    loading: isLoading,
    error: employeeError,
    refetch: fetchEmployee
  } = useRequest<any>({
    url: 'contract_employee/search',
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
      console.error("Error fetching employee data:", error);
    },
    dependencies: [id]
  });

  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      fetchEmployee()
    }
  }, [mode, activeTab])

  const [value, setValue] = useState<any>(employeeResponse?.[0])

  useEffect(() => {
    setValue(employeeResponse?.[0])
  }, [employeeResponse])

  // Populate form data when API response is received
  useEffect(() => {
    if (employeeResponse && employeeResponse[0] && (mode === "edit" || mode === "view")) {
      const employeeData = employeeResponse[0];
      
      // Normalize the data to match form expectations
      const normalizedData = {
        ...employeeData,
        gender: employeeData.gender ? employeeData.gender.toLowerCase() : "",
        // Add other field normalizations if needed
      };
      
      setFormData(normalizedData);
    }
  }, [employeeResponse, mode]);

  // Function to check if a tab is accessible based on audit status
  const isTabAccessible = (tabValue: string) => {
    // In edit and view modes, all tabs are accessible
    if (mode === "edit" || mode === "view") return true
    
    // In add mode, enforce step-by-step progression
    const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
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
      case "personal":
        return auditStatus.personalInformation === true
      case "contact":
        return auditStatus.contactEmergency === true
      case "employment":
        return auditStatus.employmentDetails === true
      case "bank":
        return auditStatus.bankDetails === true
      case "documents":
        return auditStatus.documentsVerification === true
      case "family":
        return auditStatus.familyDependents === true
      case "education":
        return auditStatus.educationExperience === true
      case "training":
        return auditStatus.trainingAssets === true
      case "medical":
        return auditStatus.medicalSafety === true
      case "status":
        return auditStatus.actionsStatus === true
      default:
        return false
    }
  }

  // Function to get the next accessible tab
  const getNextAccessibleTab = () => {
    const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
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
    const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
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
      const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
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
      const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
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
      const tabOrder = ["personal", "employment", "bank", "documents", "family", "education", "training", "medical", "status", "contact"]
      const targetIndex = tabOrder.indexOf(tabValue)
      
      for (let i = 0; i < targetIndex; i++) {
        const previousTab = tabOrder[i]
        if (!isTabCompleted(previousTab)) {
          const tabLabels = {
            personal: "Personal Information",
            contact: "Contact & Emergency", 
            employment: "Employment Details",
            bank: "Bank & Identity",
            documents: "Documents & Verification",
            family: "Family & Dependents",
            education: "Education & Experience",
            training: "Training & Assets",
            medical: "Medical & Safety",
            status: "Actions & Status"
          }
          setActiveTab(previousTab)
          return
        }
      }
    }
  }

  // Scroll functions for tabs
  const scrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Check scroll buttons on mount and when tabs change
  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab])

  const updatePersonalInformation = (data: Partial<any>) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateContactEmergency = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateEmploymentDetails = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateBankDetails = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateDocumentsVerification = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateFamilyDependents = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateEducationExperience = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateTrainingAssets = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateMedicalSafety = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  const updateActionsStatus = (data: any) => {
    if (mode === "view") return; // Don't allow updates in view mode
    setFormData((prev: any) => ({ ...prev, ...data }))
  }

  // Get page title based on mode
  const getPageTitle = () => {
    switch (mode) {
      case "add":
        return "Add New Employee"
      case "edit":
        return "Edit Employee"
      case "view":
        return "View Employee"
      default:
        return "Employee Management"
    }
  }

  // Get page description based on mode
  const getPageDescription = () => {
    switch (mode) {
      case "add":
        return "Add new employee and comprehensive profile"
      case "edit":
        return "Edit existing employee and comprehensive profile"
      case "view":
        return "View employee details (read-only)"
      default:
        return "Manage employee and comprehensive profile"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Employee form submitted:", formData)
    // Navigate back to contractor-employee page after successful submission
    // router.push('/contractor-employee')
  }

  const handleCancel = () => {
    router.push('/contractor-employee')
  }

  const handleBack = () => {
    router.push('/contractor-employee')
  }

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>HR Management</span>
        <span>/</span>
        <span>Employee Management</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">New Employee</span>
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
          {/* {mode !== "view" && (
            <Button 
              className="bg-gradient-to-r text-white from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === "add" ? "Save Employee" : "Update Employee"}
            </Button>
          )} */}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={handleTabClick} className="w-full">
          {/* Clean Horizontal Tab Navigation with Scroll */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm relative">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Right Scroll Button */}
            {canScrollRight && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50 shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            
            <div 
              ref={tabsContainerRef}
              className="overflow-x-auto hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
              onScroll={checkScrollButtons}
            >
              <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none p-0 h-auto min-w-max">
                {[
                  { value: "personal", label: "Personal Information", icon: User },
                  { value: "employment", label: "Employment Details", icon: Building2 },
                  { value: "bank", label: "Bank & Identity", icon: Banknote },
                  { value: "documents", label: "Documents & Verification", icon: FileText },
                  { value: "family", label: "Family & Dependents", icon: Users },
                  { value: "education", label: "Education & Experience", icon: GraduationCap },
                  { value: "training", label: "Training & Assets", icon: Briefcase },
                  { value: "medical", label: "Medical & Safety", icon: Heart },
                  { value: "status", label: "Actions & Status", icon: Settings },
                  { value: "contact", label: "Contact & Emergency", icon: Phone },
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
                      className={`flex items-center space-x-3 px-4 py-4 border-b-2 border-transparent rounded-none font-medium transition-colors duration-200 text-sm cursor-pointer relative whitespace-nowrap ${
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
          </div>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <PersonalInformationForm
              key={`personal-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updatePersonalInformation}
              onNextTab={handleNextTab}
              mode={mode as "add" | "edit" | "view"}
              auditStatus={auditStatus}
              auditStatusFormData={auditStatusFormData}
              setAuditStatus={setAuditStatus}
              setAuditStatusFormData={setAuditStatusFormData}
              activeTab={activeTab}
            />
          </TabsContent>

          {/* Employment Details Tab */}
          <TabsContent value="employment" className="space-y-6">
            <EmploymentDetailsForm
              key={`employment-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateEmploymentDetails}
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

          {/* Bank & Identity Tab */}
          <TabsContent value="bank" className="space-y-6">
            <BankDetailsForm
              key={`bank-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateBankDetails}
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

          {/* Documents & Verification Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentsVerificationForm
              key={`documents-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateDocumentsVerification}
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

          {/* Family & Dependents Tab */}
          <TabsContent value="family" className="space-y-6">
            <FamilyDependentsForm
              key={`family-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateFamilyDependents}
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

          {/* Education & Experience Tab */}
          <TabsContent value="education" className="space-y-6">
            <EducationExperienceForm
              key={`education-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateEducationExperience}
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

          {/* Training & Assets Tab */}
          <TabsContent value="training" className="space-y-6">
            <TrainingAssetsForm
              key={`training-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateTrainingAssets}
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

          {/* Medical & Safety Tab */}
          <TabsContent value="medical" className="space-y-6">
            <MedicalSafetyForm
              key={`medical-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateMedicalSafety}
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

          {/* Actions & Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <ActionsStatusForm
              key={`status-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateActionsStatus}
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

          {/* Contact & Emergency Tab */}
          <TabsContent value="contact" className="space-y-6">
            <ContactEmergencyForm
              key={`contact-${value?._id || 'new'}-${mode}`}
              formData={formData}
              onFormDataChange={updateContactEmergency}
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
        </Tabs>

      </form>
    </div>
    </>
  )
}

