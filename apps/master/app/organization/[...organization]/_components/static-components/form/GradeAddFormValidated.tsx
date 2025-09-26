"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Building2, MapPin, X, GitBranch, UserCheck, GraduationCap, Check, ChevronsUpDown } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect, useState } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { cn } from "@repo/ui/utils/shadcnui/cn"
import { Badge } from "@repo/ui/components/ui/badge"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface GradeFormData {
  gradeCode?: string
  gradeName?: string
  gradeDescription?: string
  subsidiaryCode: string
  divisionCode: string
  designationCode: string
  locationCode?: string[]
}

interface GradeFormModalProps {
  open: boolean
  setOpen: any
  organizationData?: any
  onSuccess?: (updatedOrganizationData: any) => void
  onServerUpdate?: () => Promise<any>
  editData?: any
  isEditMode?: boolean
  deleteValue?: any
}

// Custom validation schema with duplicate checks
const createSchema = (organizationData: any, isEditMode: boolean, editData?: any) => {
  return yup.object().shape({
    gradeCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Grade code is required")
            .test('unique-grade-code', 'Grade code already exists in the organization', function(value) {
              if (!value) return true;
              const existingGrades = organizationData.grades || [];
              const exists = existingGrades.some((grade: any) => {
                const gradeId = (grade.id || grade._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && gradeId === editId) return false;
                return grade.gradeCode === value;
              });
              return !exists;
            })
      }),
    gradeName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Grade name is required"),
        otherwise: schema =>
          schema
            .required("Grade name is required")
            .test('unique-grade-name', 'Grade name already exists in the organization', function(value) {
              if (!value) return true;
              const existingGrades = organizationData.grades || [];
              const exists = existingGrades.some((grade: any) => {
                const gradeId = (grade.id || grade._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && gradeId === editId) return false;
                return grade.gradeName === value;
              });
              return !exists;
            })
      }),
    subsidiaryCode: yup.string().required("Subsidiary is required"),
    divisionCode: yup.string().required("Division is required"),
    designationCode: yup.string().required("Designation is required"),
    gradeDescription: yup.string().optional(),
  })
}

export default function GradeAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: GradeFormModalProps) {
  
  const {
    post: postGrade,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Grade submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Grade submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'grades' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('grades', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // State for selected values
  const [selectedLocationCodes, setSelectedLocationCodes] = useState<string[]>([])
  const [selectedSubsidiaryCode, setSelectedSubsidiaryCode] = useState<string>("")
  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>("")
  const [selectedDesignationCode, setSelectedDesignationCode] = useState<string>("")
  
  // Get subsidiary options from organization data
  const subsidiaryOptions = (organizationData.subsidiaries || []).map((subsidiary: any) => ({
    label: `${subsidiary.subsidiaryName} (${subsidiary.subsidiaryCode})`,
    value: subsidiary.subsidiaryCode
  }))
  
  // Get filtered division options based on selected subsidiary
  const getFilteredDivisionOptions = () => {
    if (!selectedSubsidiaryCode) return []
    
    return (organizationData.divisions || [])
      .filter((division: any) => division.subsidiaryCode === selectedSubsidiaryCode)
      .map((division: any) => ({
        label: `${division.divisionName} (${division.divisionCode})`,
        value: division.divisionCode
      }))
  }
  
  // Get filtered designation options based on selected division
  const getFilteredDesignationOptions = () => {
    if (!selectedDivisionCode) return []
    
    return (organizationData.designations || [])
      .filter((designation: any) => designation.divisionCode === selectedDivisionCode)
      .map((designation: any) => ({
        label: `${designation.designationName} (${designation.designationCode})`,
        value: designation.designationCode
      }))
  }
  
  // Get filtered location options based on selected designation
  const getFilteredLocationOptions = () => {
    if (!selectedDesignationCode) return []
    
    const selectedDesignation = organizationData.designations?.find((des: any) => des.designationCode === selectedDesignationCode)
    if (!selectedDesignation || !selectedDesignation.locationCode) return []
    
    const designationLocationCodes = Array.isArray(selectedDesignation.locationCode) 
      ? selectedDesignation.locationCode 
      : [selectedDesignation.locationCode]
    
    return (organizationData.location || [])
      .filter((location: any) => designationLocationCodes.includes(location.locationCode))
      .map((location: any) => ({
        label: `${location.locationName} (${location.locationCode})`,
        value: location.locationCode
      }))
  }
  
  const divisionOptions = getFilteredDivisionOptions()
  const designationOptions = getFilteredDesignationOptions()
  const locationOptions = getFilteredLocationOptions()
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.gradeCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (gradeCode: string) => {
    try {
      console.log("Deleting grade:", gradeCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(gradeCode, organizationData)
      
      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postGrade(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Grade deleted successfully:", gradeCode)
    } catch (error) {
      console.error("Error deleting grade:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<GradeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      gradeCode: "",
      gradeName: "",
      gradeDescription: "",
      subsidiaryCode: "",
      divisionCode: "",
      designationCode: "",
      locationCode: [],
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("gradeCode", editData.gradeCode || "")
      setValue("gradeName", editData.gradeName || "")
      setValue("gradeDescription", editData.gradeDescription || "")
      setValue("subsidiaryCode", editData.subsidiaryCode || "")
      setValue("designationCode", editData.designationCode || "")
      setSelectedSubsidiaryCode(editData.subsidiaryCode || "")
      setSelectedDesignationCode(editData.designationCode || "")
      setSelectedLocationCodes(editData.locationCode || [])
      setValue("locationCode", editData.locationCode || [])
    } else if (open && !isEditMode) {
      reset()
      setSelectedLocationCodes([])
      setSelectedSubsidiaryCode("")
      setSelectedDivisionCode("")
      setSelectedDesignationCode("")
    }
  }, [isEditMode, editData, setValue, reset, open])


  useEffect(() => {
    if (isEditMode && editData && selectedSubsidiaryCode) {
      setSelectedDivisionCode(editData.divisionCode || "");
      setValue("divisionCode", editData.divisionCode || "");
    }
  }, [isEditMode, editData, selectedSubsidiaryCode, setValue]);

  useEffect(() => {
    if (isEditMode && editData && selectedDivisionCode) {
      setSelectedDesignationCode(editData.designationCode || "");
      setValue("designationCode", editData.designationCode || "")
    }
  }, [isEditMode, editData, selectedDivisionCode, setValue]);

  useEffect(() => {
    if (isEditMode && editData && selectedDesignationCode) {
      setSelectedLocationCodes(editData.locationCode || []);
      setValue("locationCode", editData.locationCode || []);
    }
  }, [isEditMode, editData, selectedDesignationCode, setValue]);

  const handleFormSubmit = async (data: GradeFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing grade
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.gradeCode, data, organizationData)
      } else {
        // Add mode - add new grade
        updatedData = addCategoryItem(data, organizationData)
      }

      console.log("updatedData", updatedData)
      console.log("updatedData._id", updatedData._id)

      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postGrade(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Grade updated successfully:" : "Grade added successfully:", data)
    } catch (error) {
      console.error("Error processing grade:", error)
    }
  }

  // Handle subsidiary selection
  const handleSubsidiarySelect = (subsidiaryCode: string) => {
    setSelectedSubsidiaryCode(subsidiaryCode)
    setValue("subsidiaryCode", subsidiaryCode)
    // Clear division, designation and location codes when subsidiary changes
    setSelectedDivisionCode("")
    setValue("divisionCode", "")
    setSelectedDesignationCode("")
    setValue("designationCode", "")
    setSelectedLocationCodes([])
    setValue("locationCode", [])
  }

  // Handle division selection
  const handleDivisionSelect = (divisionCode: string) => {
    setSelectedDivisionCode(divisionCode)
    setValue("divisionCode", divisionCode)
    // Clear designation when division changes
    setSelectedDesignationCode("")
    setValue("designationCode", "")
  }

  // Handle designation selection
  const handleDesignationSelect = (designationCode: string) => {
    setSelectedDesignationCode(designationCode)
    setValue("designationCode", designationCode)
  }

  // Handle location code selection
  const handleLocationCodeSelect = (locationCode: string) => {
    if (!selectedLocationCodes.includes(locationCode)) {
      const updatedCodes = [...selectedLocationCodes, locationCode]
      setSelectedLocationCodes(updatedCodes)
      setValue("locationCode", updatedCodes)
    }
  }

  // Handle location code removal
  const handleLocationCodeRemove = (locationCode: string) => {
    const updatedCodes = selectedLocationCodes.filter(code => code !== locationCode)
    setSelectedLocationCodes(updatedCodes)
    setValue("locationCode", updatedCodes)
  }

  const handleCancel = () => {
    reset()
    setSelectedLocationCodes([])
    setSelectedSubsidiaryCode("")
    setSelectedDivisionCode("")
    setSelectedDesignationCode("")
    setOpen(false)
  }

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Grade" : "Add New Grade",
        description: "Create a new grade entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <GraduationCap className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Grade" : "Add New Grade"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update grade information" : "Create a new grade entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<GradeFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradeCode">Grade Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="gradeCode"
                    {...register("gradeCode")}
                    placeholder="Enter grade code"
                    className={errors.gradeCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.gradeCode?.message && <p className="text-sm text-red-500">{errors.gradeCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradeName">Grade Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="gradeName"
                    {...register("gradeName")}
                    placeholder="Enter grade name"
                    className={errors.gradeName?.message ? 'border-red-500' : ''}
                  />
                  {errors.gradeName?.message && <p className="text-sm text-red-500">{errors.gradeName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradeDescription">Description</Label>
                <Textarea
                  id="gradeDescription"
                  {...register("gradeDescription")}
                  placeholder="Enter grade description"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Parent Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Parent Hierarchy</h3>
              
              {/* Subsidiary and Division Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subsidiary <span className="text-red-500">*</span></Label>
                  <Select onValueChange={handleSubsidiarySelect} value={selectedSubsidiaryCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subsidiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {subsidiaryOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subsidiaryCode?.message && <p className="text-sm text-red-500">{errors.subsidiaryCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Division <span className="text-red-500">*</span></Label>
                  <Select onValueChange={handleDivisionSelect} value={selectedDivisionCode} disabled={!selectedSubsidiaryCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedSubsidiaryCode ? "Select a division" : "First select a subsidiary"} />
                    </SelectTrigger>
                    <SelectContent>
                      {divisionOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.divisionCode?.message && <p className="text-sm text-red-500">{errors.divisionCode.message}</p>}
                </div>
              </div>

              {/* Designation Selection */}
              <div className="space-y-2">
                <Label>Designation <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleDesignationSelect} value={selectedDesignationCode} disabled={!selectedDivisionCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedDivisionCode ? "Select a designation" : "First select a division"} />
                  </SelectTrigger>
                  <SelectContent>
                    {designationOptions.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.designationCode?.message && <p className="text-sm text-red-500">{errors.designationCode.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Location Codes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Assignment</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Location Codes</Label>
                  <Select onValueChange={handleLocationCodeSelect} disabled={!selectedDesignationCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDesignationCode ? "Select location codes" : "First select a designation"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((option: any) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          disabled={selectedLocationCodes.includes(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Location Codes */}
                {selectedLocationCodes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Locations:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocationCodes.map((code) => {
                        const location = organizationData.location?.find((loc: any) => loc.locationCode === code)
                        return (
                          <Badge 
                            key={code} 
                            variant="secondary" 
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            <MapPin className="w-3 h-3" />
                            {location ? `${location.locationName} (${code})` : code}
                            <button
                              type="button"
                              onClick={() => handleLocationCodeRemove(code)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#2d81ff' }}
                className="hover:opacity-90"
              >
                {isSubmitting ? "Saving..." : (isEditMode ? "Update" : "Save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SemiPopupWrapper>
  )
} 