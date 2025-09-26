"use client"

import type React from "react"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Input } from "@repo/ui/components/ui/input"
import { Building2, X, Search } from "lucide-react"
import { useMemo, useState } from "react"

interface OrganizationalStructureFormProps {
  subOrganization: any
  orgLoading: boolean
  isViewMode: boolean
  showErrors: boolean
  errors: any
  handleCodeChange: (section: string, subsection: string, code: string) => void
  watchedValues: any
}

export function OrganizationalStructureForm({
  subOrganization,
  orgLoading,
  isViewMode,
  showErrors,
  errors,
  handleCodeChange,
  watchedValues
}: OrganizationalStructureFormProps) {
  const [contractorSearch, setContractorSearch] = useState("")

  // Enhanced handleCodeChange that clears dependent fields and auto-fills names
  const handleHierarchicalCodeChange = (section: string, subsection: string, code: string) => {
    console.log(`handleHierarchicalCodeChange called:`, { section, subsection, code, currentValues: watchedValues.deployment })
    
    // Clear dependent fields based on hierarchy
    if (subsection === "subsidiary" && code) {
      console.log("Clearing dependent fields for subsidiary change")
      // Clear all dependent fields when subsidiary changes
      handleCodeChange("deployment", "division", "")
      handleCodeChange("deployment", "department", "")
      handleCodeChange("deployment", "subDepartment", "")
      handleCodeChange("deployment", "section", "")
      // Don't clear location as it can be independent of subsidiary
      handleCodeChange("deployment", "designation", "")
      handleCodeChange("deployment", "grade", "")
    } else if (subsection === "division" && code) {
      console.log("Clearing dependent fields for division change")
      // Clear dependent fields when division changes
      handleCodeChange("deployment", "department", "")
      handleCodeChange("deployment", "subDepartment", "")
      handleCodeChange("deployment", "section", "")
      handleCodeChange("deployment", "designation", "")
      handleCodeChange("deployment", "grade", "")
    } else if (subsection === "department" && code) {
      console.log("Clearing dependent fields for department change")
      // Clear dependent fields when department changes
      handleCodeChange("deployment", "subDepartment", "")
      handleCodeChange("deployment", "section", "")
    } else if (subsection === "subDepartment" && code) {
      console.log("Clearing dependent fields for subDepartment change")
      // Clear dependent fields when subDepartment changes
      handleCodeChange("deployment", "section", "")
    } else if (subsection === "designation" && code) {
      console.log("Clearing dependent fields for designation change")
      // Clear grade when designation changes
      handleCodeChange("deployment", "grade", "")
    }
    
    // Set the selected value - the parent handleCodeChange will handle name auto-filling
    console.log(`Calling parent handleCodeChange with:`, { section, subsection, code })
    handleCodeChange(section, subsection, code)
  }
  
  // Computed filtered arrays based on selections
  const filteredDivisions = useMemo(() => {
    if (!watchedValues.deployment?.subsidiary?.subsidiaryCode || !subOrganization.divisions) {
      return [];
    }
    return subOrganization.divisions.filter((division: any) => 
      division.subsidiaryCode === watchedValues.deployment.subsidiary.subsidiaryCode
    );
  }, [watchedValues.deployment?.subsidiary?.subsidiaryCode, subOrganization.divisions]);

  const filteredDepartments = useMemo(() => {
    if (!watchedValues.deployment?.division?.divisionCode || !subOrganization.departments) {
      return [];
    }
    return subOrganization.departments.filter((department: any) => 
      department.divisionCode === watchedValues.deployment.division.divisionCode
    );
  }, [watchedValues.deployment?.division?.divisionCode, subOrganization.departments]);

  const filteredSubDepartments = useMemo(() => {
    if (!watchedValues.deployment?.department?.departmentCode || !subOrganization.subDepartments) {
      return [];
    }
    return subOrganization.subDepartments.filter((subDept: any) => 
      subDept.departmentCode === watchedValues.deployment.department.departmentCode
    );
  }, [watchedValues.deployment?.department?.departmentCode, subOrganization.subDepartments]);

  const filteredSections = useMemo(() => {
    if (!watchedValues.deployment?.subDepartment?.subDepartmentCode || !subOrganization.sections) {
      return [];
    }
    return subOrganization.sections.filter((section: any) => 
      section.subDepartmentCode === watchedValues.deployment.subDepartment.subDepartmentCode &&
      section.divisionCode === watchedValues.deployment?.division?.divisionCode &&
      section.subsidiaryCode === watchedValues.deployment?.subsidiary?.subsidiaryCode
    );
  }, [watchedValues.deployment?.subDepartment?.subDepartmentCode, watchedValues.deployment?.division?.divisionCode, watchedValues.deployment?.subsidiary?.subsidiaryCode, subOrganization.sections]);

  // Filtered locations based on subsidiary
  const filteredLocations = useMemo(() => {
    if (!subOrganization.location) {
      return [];
    }
    
    // If no subsidiary is selected, show all locations
    if (!watchedValues.deployment?.subsidiary?.subsidiaryCode) {
      return subOrganization.location;
    }
    
    return subOrganization.location.filter((location: any) => 
      location.subsidiaryCode === watchedValues.deployment.subsidiary.subsidiaryCode || 
      !location.subsidiaryCode // Include locations that don't have subsidiary restriction
    );
  }, [watchedValues.deployment?.subsidiary?.subsidiaryCode, subOrganization.location]);

  // Filtered designations based on division
  const filteredDesignations = useMemo(() => {
    if (!watchedValues.deployment?.division?.divisionCode || !subOrganization.designations) {
      return [];
    }
    return subOrganization.designations.filter((designation: any) => 
      designation.divisionCode === watchedValues.deployment.division.divisionCode
    );
  }, [watchedValues.deployment?.division?.divisionCode, subOrganization.designations]);

  // Filtered grades based on designation
  const filteredGrades = useMemo(() => {
    if (!watchedValues.deployment?.designation?.designationCode || !subOrganization.grades) {
      return [];
    }
    return subOrganization.grades.filter((grade: any) => 
      grade.designationCode === watchedValues.deployment.designation.designationCode
    );
  }, [watchedValues.deployment?.designation?.designationCode, subOrganization.grades]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" />
        Organizational Structure
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subsidiary */}
        <div className="group">
          <Label htmlFor="subsidiaryCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Subsidiary Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.subsidiary?.subsidiaryCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "subsidiary", value)}
            disabled={isViewMode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.subsidiary?.subsidiaryCode) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder="Select Subsidiary Code" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : subOrganization?.subsidiaries && subOrganization.subsidiaries.length > 0 ? (
                subOrganization.subsidiaries.map((option: any) => {
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
          {showErrors && errors.deployment?.subsidiary?.subsidiaryCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.subsidiary.subsidiaryCode.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="subsidiaryName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Subsidiary Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.subsidiary?.subsidiaryName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.subsidiary.subsidiaryName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.subsidiary?.subsidiaryName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.subsidiary.subsidiaryName.message}
            </p>
          )}
        </div>

        {/* Division */}
        <div className="group">
          <Label htmlFor="divisionCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Division Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.division?.divisionCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "division", value)}
            disabled={isViewMode || !watchedValues.deployment?.subsidiary?.subsidiaryCode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode || !watchedValues.deployment?.subsidiary?.subsidiaryCode
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.division?.divisionCode) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder={!watchedValues.deployment?.subsidiary?.subsidiaryCode ? "Select Subsidiary first" : "Select Division Code"} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : filteredDivisions.length > 0 ? (
                filteredDivisions.map((option: any) => {
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
                  {!watchedValues.deployment?.subsidiary?.subsidiaryCode ? 'Please select a subsidiary first' : 'No divisions available for selected subsidiary'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {showErrors && errors.deployment?.division?.divisionCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.division.divisionCode.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="divisionName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Division Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.division?.divisionName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.division.divisionName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.division?.divisionName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.division.divisionName.message}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="group">
          <Label htmlFor="departmentCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Department Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.department?.departmentCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "department", value)}
            disabled={isViewMode || !watchedValues.deployment?.division?.divisionCode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode || !watchedValues.deployment?.division?.divisionCode
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.department?.departmentCode) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder={!watchedValues.deployment?.division?.divisionCode ? "Select Division first" : "Select Department Code"} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : filteredDepartments.length > 0 ? (
                filteredDepartments.map((option: any) => {
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
                  {!watchedValues.deployment?.division?.divisionCode ? 'Please select a division first' : 'No departments available for selected division'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {showErrors && errors.deployment?.department?.departmentCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.department.departmentCode.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="departmentName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Department Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.department?.departmentName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.department.departmentName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.department?.departmentName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.department.departmentName.message}
            </p>
          )}
        </div>

        {/* Sub Department */}
        <div className="group">
          <Label htmlFor="subDepartmentCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Sub Department Code
          </Label>
          <Select 
            value={watchedValues.deployment?.subDepartment?.subDepartmentCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "subDepartment", value)}
            disabled={isViewMode || !watchedValues.deployment?.department?.departmentCode}
          >
            <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode || !watchedValues.deployment?.department?.departmentCode
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            }`}>
              <SelectValue placeholder={!watchedValues.deployment?.department?.departmentCode ? "Select Department first" : "Select Sub Department Code"} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : filteredSubDepartments.length > 0 ? (
                filteredSubDepartments.map((option: any) => {
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
                  {!watchedValues.deployment?.department?.departmentCode ? 'Please select a department first' : 'No sub departments available for selected department'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="group">
          <Label htmlFor="subDepartmentName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Sub Department Name
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.subDepartment?.subDepartmentName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.subDepartment.subDepartmentName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
        </div>

        {/* Section */}
        <div className="group">
          <Label htmlFor="sectionCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Section Code
          </Label>
                     <Select 
             value={watchedValues.deployment?.section?.sectionCode} 
             onValueChange={(value) => handleHierarchicalCodeChange("deployment", "section", value)}
             disabled={isViewMode || !watchedValues.deployment?.subDepartment?.subDepartmentCode}
           >
            <SelectTrigger className={`h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode || !watchedValues.deployment?.subDepartment?.subDepartmentCode
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            }`}>
              <SelectValue placeholder={!watchedValues.deployment?.subDepartment?.subDepartmentCode ? "Select Sub Department first" : "Select Section Code"} />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : filteredSections.length > 0 ? (
                filteredSections.map((option: any) => {
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
                  {!watchedValues.deployment?.subDepartment?.subDepartmentCode ? 'Please select a sub department first' : 'No sections available for selected sub department'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="group">
          <Label htmlFor="sectionName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Section Name
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.section?.sectionName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.section.sectionName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
        </div>

        {/* Employee Category */}
        <div className="group">
          <Label htmlFor="employeeCategoryCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Employee Category Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.employeeCategory?.employeeCategoryCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "employeeCategory", value)}
            disabled={isViewMode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.employeeCategory?.employeeCategoryCode) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder="Select Employee Category Code" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : subOrganization?.employeeCategories && subOrganization.employeeCategories.length > 0 ? (
                subOrganization.employeeCategories.map((option: any) => {
                  const optionValue = option.code || option.employeeCategoryCode || "";
                  const optionName = option.name || option.employeeCategoryName || option.employeeCategoryTitle || 'Unknown';
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
          {showErrors && errors.deployment?.employeeCategory?.employeeCategoryCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.employeeCategory.employeeCategoryCode.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="employeeCategoryName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Employee Category Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.employeeCategory?.employeeCategoryName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.employeeCategory.employeeCategoryName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.employeeCategory?.employeeCategoryName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.employeeCategory.employeeCategoryName.message}
            </p>
          )}
        </div>

        {/* Designation */}
        <div className="group">
          <Label htmlFor="designationCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Designation Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.designation?.designationCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "designation", value)}
            disabled={isViewMode || !watchedValues.deployment?.division?.divisionCode}
          >
             <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
               isViewMode || !watchedValues.deployment?.division?.divisionCode
                 ? "bg-gray-100 cursor-not-allowed" 
                 : ""
             } ${
               (showErrors && errors.deployment?.designation?.designationCode) 
                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                 : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
             }`}>
               <SelectValue placeholder={!watchedValues.deployment?.division?.divisionCode ? "Select Division first" : "Select Designation Code"} />
             </SelectTrigger>
             <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
               {orgLoading ? (
                 <SelectItem value="loading" disabled>Loading...</SelectItem>
               ) : filteredDesignations.length > 0 ? (
                 filteredDesignations.map((option: any) => {
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
                   {!watchedValues.deployment?.division?.divisionCode ? 'Please select a division first' : 'No designations available for selected division'}
                 </SelectItem>
               )}
             </SelectContent>
           </Select>
           {showErrors && errors.deployment?.designation?.designationCode && (
             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
               <X className="h-3 w-3" />
               {errors.deployment.designation.designationCode.message}
             </p>
           )}
         </div>

        <div className="group">
          <Label htmlFor="designationName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Designation Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.designation?.designationName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.designation.designationName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.designation?.designationName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.designation.designationName.message}
            </p>
          )}
        </div>

        {/* Grade */}
        <div className="group">
          <Label htmlFor="gradeCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Grade Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.grade?.gradeCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "grade", value)}
            disabled={isViewMode || !watchedValues.deployment?.designation?.designationCode}
          >
             <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
               isViewMode || !watchedValues.deployment?.designation?.designationCode
                 ? "bg-gray-100 cursor-not-allowed" 
                 : ""
             } ${
               (showErrors && errors.deployment?.grade?.gradeCode) 
                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                 : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
             }`}>
               <SelectValue placeholder={!watchedValues.deployment?.designation?.designationCode ? "Select Designation first" : "Select Grade Code"} />
             </SelectTrigger>
             <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
               {orgLoading ? (
                 <SelectItem value="loading" disabled>Loading...</SelectItem>
               ) : filteredGrades.length > 0 ? (
                                 filteredGrades.map((option: any) => {
                  const optionValue = option.code || option.gradeCode || "";
                  const optionName = option.name || option.gradeName || option.gradeTitle || 'Unknown';
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionValue} - {optionName}
                    </SelectItem>
                  );
                })
               ) : (
                 <SelectItem value="no-data" disabled>
                   {!watchedValues.deployment?.designation?.designationCode ? 'Please select a designation first' : 'No grades available for selected designation'}
                 </SelectItem>
               )}
             </SelectContent>
           </Select>
           {showErrors && errors.deployment?.grade?.gradeCode && (
             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
               <X className="h-3 w-3" />
               {errors.deployment.grade.gradeCode.message}
             </p>
           )}
         </div>

        <div className="group">
          <Label htmlFor="gradeName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Grade Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.grade?.gradeName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.grade.gradeName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.grade?.gradeName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.grade.gradeName.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="group">
          <Label htmlFor="locationCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Location Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.location?.locationCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "location", value)}
            disabled={isViewMode}
          >
             <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
               isViewMode
                 ? "bg-gray-100 cursor-not-allowed" 
                 : ""
             } ${
               (showErrors && errors.deployment?.location?.locationCode) 
                 ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                 : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
             }`}>
               <SelectValue placeholder="Select Location Code" />
             </SelectTrigger>
             <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
               {orgLoading ? (
                 <SelectItem value="loading" disabled>Loading...</SelectItem>
               ) : filteredLocations.length > 0 ? (
                 filteredLocations.map((option: any) => {
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
                   No locations available
                 </SelectItem>
               )}
             </SelectContent>
           </Select>
           {showErrors && errors.deployment?.location?.locationCode && (
             <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
               <X className="h-3 w-3" />
               {errors.deployment.location.locationCode.message}
             </p>
           )}
         </div>

        <div className="group">
          <Label htmlFor="locationName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Location Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.location?.locationName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.location.locationName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.location?.locationName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.location.locationName.message}
            </p>
          )}
        </div>

        {/* Skill Level */}
        <div className="group">
          <Label htmlFor="skilledLevelTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
            Skill Level <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.skillLevel?.skilledLevelTitle} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "skillLevel", value)}
            disabled={isViewMode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.skillLevel?.skilledLevelTitle) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder="Select Skill Level" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px]">
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : subOrganization?.skillLevels && subOrganization.skillLevels.length > 0 ? (
                subOrganization.skillLevels.map((option: any) => {
                  const optionValue = option.title || option.skilledLevelTitle || "";
                  const optionName = option.title || option.skilledLevelTitle || 'Unknown';
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionName}
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
          {showErrors && errors.deployment?.skillLevel?.skilledLevelTitle && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.skillLevel.skilledLevelTitle.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="skilledLevelDescription" className="text-sm font-semibold text-gray-700 mb-2 block">
            Skill Level Description
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.skillLevel?.skilledLevelDescription ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.skillLevel.skilledLevelDescription}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from selection</span>
            )}
          </div>
        </div>

        {/* Contractor */}
        <div className="group">
          <Label htmlFor="contractorCode" className="text-sm font-semibold text-gray-700 mb-2 block">
            Contractor Code <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={watchedValues.deployment?.contractor?.contractorCode} 
            onValueChange={(value) => handleHierarchicalCodeChange("deployment", "contractor", value)}
            disabled={isViewMode}
          >
            <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : ""
            } ${
              (showErrors && errors.deployment?.contractor?.contractorCode) 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}>
              <SelectValue placeholder="Search Contractor Code" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px]">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contractors..."
                    value={contractorSearch}
                    onChange={(e) => setContractorSearch(e.target.value)}
                    className="pl-10 h-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              
              {orgLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : subOrganization?.contractors && subOrganization.contractors.length > 0 ? (
                subOrganization.contractors
                  .filter((option: any) => {
                    if (!contractorSearch) return true;
                    const optionValue = option.code || option.contractorCode || "";
                    const optionName = option.name || option.contractorName || "";
                    const searchTerm = contractorSearch.toLowerCase();
                    return optionValue.toLowerCase().includes(searchTerm) || 
                           optionName.toLowerCase().includes(searchTerm);
                  })
                  .map((option: any) => {
                    const optionValue = option.code || option.contractorCode || "";
                    const optionName = option.name || option.contractorName || 'Unknown';
                    return (
                      <SelectItem key={optionValue} value={optionValue}>
                        {optionValue} - {optionName}
                      </SelectItem>
                    );
                  })
              ) : (
                <SelectItem value="no-data" disabled>
                  {subOrganization?.contractors ? 'No contractors available' : 'Loading contractors...'}
                </SelectItem>
              )}
              
              {subOrganization?.contractors && 
               subOrganization.contractors.filter((option: any) => {
                 if (!contractorSearch) return false;
                 const optionValue = option.code || option.contractorCode || "";
                 const optionName = option.name || option.contractorName || "";
                 const searchTerm = contractorSearch.toLowerCase();
                 return optionValue.toLowerCase().includes(searchTerm) || 
                        optionName.toLowerCase().includes(searchTerm);
               }).length === 0 && contractorSearch && (
                <SelectItem value="no-results" disabled>
                  No contractors found for "{contractorSearch}"
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {showErrors && errors.deployment?.contractor?.contractorCode && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.contractor.contractorCode.message}
            </p>
          )}
        </div>

        <div className="group">
          <Label htmlFor="contractorName" className="text-sm font-semibold text-gray-700 mb-2 block">
            Contractor Name <span className="text-red-500">*</span>
          </Label>
          <div className="h-10 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-blue-800 flex items-center font-medium shadow-sm">
            {watchedValues.deployment?.contractor?.contractorName ? (
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {watchedValues.deployment.contractor.contractorName}
              </span>
            ) : (
              <span className="text-blue-600 italic">Will auto-fill from code</span>
            )}
          </div>
          {showErrors && errors.deployment?.contractor?.contractorName && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <X className="h-3 w-3" />
              {errors.deployment.contractor.contractorName.message}
            </p>
          )}
        </div>


      </div>
    </div>
  )
} 