"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Building2, MapPin, X, GitBranch, Settings, FolderOpen, Check, ChevronsUpDown } from "lucide-react"
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

interface SectionFormData {
  sectionCode?: string
  sectionName?: string
  sectionDescription?: string
  subsidiaryCode: string
  divisionCode: string
  departmentCode: string
  subDepartmentCode: string
  locationCode?: string[]
}

interface SectionFormModalProps {
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
    sectionCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Section code is required")
            .test('unique-section-code', 'Section code already exists in the organization', function(value) {
              if (!value) return true;
              const existingSections = organizationData.sections || [];
              const exists = existingSections.some((section: any) => {
                const sectionId = (section.id || section._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && sectionId === editId) return false;
                return section.sectionCode === value;
              });
              return !exists;
            })
      }),
    sectionName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Section name is required"),
        otherwise: schema =>
          schema
            .required("Section name is required")
            .test('unique-section-name', 'Section name already exists in the organization', function(value) {
              if (!value) return true;
              const existingSections = organizationData.sections || [];
              const exists = existingSections.some((section: any) => {
                const sectionId = (section.id || section._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && sectionId === editId) return false;
                return section.sectionName === value;
              });
              return !exists;
            })
      }),
    subsidiaryCode: yup.string().required("Subsidiary is required"),
    divisionCode: yup.string().required("Division is required"),
    departmentCode: yup.string().required("Department is required"),
    subDepartmentCode: yup.string().required("Sub Department is required"),
    sectionDescription: yup.string().optional(),
  })
}

export default function SectionAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: SectionFormModalProps) {
  
  const {
    post: postSection,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Section submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Section submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'sections' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('sections', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // State for selected values
  const [selectedLocationCodes, setSelectedLocationCodes] = useState<string[]>([])
  const [selectedSubsidiaryCode, setSelectedSubsidiaryCode] = useState<string>("") 
  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>("") 
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState<string>("") 
  const [selectedSubDepartmentCode, setSelectedSubDepartmentCode] = useState<string>("") 
  
  // State for dropdowns
  const [subsidiaryDropdownOpen, setSubsidiaryDropdownOpen] = useState(false)
  const [subsidiarySearchValue, setSubsidiarySearchValue] = useState("")
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState(false)
  const [divisionSearchValue, setDivisionSearchValue] = useState("")
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false)
  const [departmentSearchValue, setDepartmentSearchValue] = useState("")
  const [subDepartmentDropdownOpen, setSubDepartmentDropdownOpen] = useState(false)
  const [subDepartmentSearchValue, setSubDepartmentSearchValue] = useState("")
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearchValue, setLocationSearchValue] = useState("")
  
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
  
  // Get filtered department options based on selected division
  const getFilteredDepartmentOptions = () => {
    if (!selectedDivisionCode) return []
    
    return (organizationData.departments || [])
      .filter((department: any) => department.divisionCode === selectedDivisionCode)
      .map((department: any) => ({
        label: `${department.departmentName} (${department.departmentCode})`,
        value: department.departmentCode
      }))
  }
  
  // Get filtered sub department options based on selected department
  const getFilteredSubDepartmentOptions = () => {
    if (!selectedDepartmentCode) return []
    
    return (organizationData.subDepartments || [])
      .filter((subDept: any) => subDept.departmentCode === selectedDepartmentCode)
      .map((subDept: any) => ({
        label: `${subDept.subDepartmentName} (${subDept.subDepartmentCode})`,
        value: subDept.subDepartmentCode
      }))
  }
  
  // Get filtered location options based on selected sub department
  const getFilteredLocationOptions = () => {
    if (!selectedSubDepartmentCode) return []
    
    const selectedSubDepartment = organizationData.subDepartments?.find((subDept: any) => subDept.subDepartmentCode === selectedSubDepartmentCode)
    if (!selectedSubDepartment || !selectedSubDepartment.locationCode) return []
    
    const subDepartmentLocationCodes = Array.isArray(selectedSubDepartment.locationCode) 
      ? selectedSubDepartment.locationCode 
      : [selectedSubDepartment.locationCode]
    
    return (organizationData.location || [])
      .filter((location: any) => subDepartmentLocationCodes.includes(location.locationCode))
      .map((location: any) => ({
        label: `${location.locationName} (${location.locationCode})`,
        value: location.locationCode
      }))
  }
  
  const divisionOptions = getFilteredDivisionOptions()
  const departmentOptions = getFilteredDepartmentOptions()
  const subDepartmentOptions = getFilteredSubDepartmentOptions()
  const locationOptions = getFilteredLocationOptions()
  
  // Filter functions for search
  const filteredSubsidiaryOptions = subsidiaryOptions.filter((option: any) =>
    option.label.toLowerCase().includes(subsidiarySearchValue.toLowerCase())
  )
  
  const filteredDivisionOptions = divisionOptions.filter((option: any) =>
    option.label.toLowerCase().includes(divisionSearchValue.toLowerCase())
  )
  
  const filteredDepartmentOptions = departmentOptions.filter((option: any) =>
    option.label.toLowerCase().includes(departmentSearchValue.toLowerCase())
  )
  
  const filteredSubDepartmentOptions = subDepartmentOptions.filter((option: any) =>
    option.label.toLowerCase().includes(subDepartmentSearchValue.toLowerCase())
  )
  
  const filteredLocationOptions = locationOptions.filter((option: any) =>
    option.label.toLowerCase().includes(locationSearchValue.toLowerCase())
  )
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.sectionCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (sectionCode: string) => {
    try {
      console.log("Deleting section:", sectionCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(sectionCode, organizationData)
      
      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postSection(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Section deleted successfully:", sectionCode)
    } catch (error) {
      console.error("Error deleting section:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<SectionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      sectionCode: "",
      sectionName: "",
      sectionDescription: "",
      subsidiaryCode: "",
      divisionCode: "",
      departmentCode: "",
      subDepartmentCode: "",
      locationCode: [],
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("sectionCode", editData.sectionCode || "")
      setValue("sectionName", editData.sectionName || "")
      setValue("sectionDescription", editData.sectionDescription || "")
      setValue("subsidiaryCode", editData.subsidiaryCode || "")
      setSelectedSubsidiaryCode(editData.subsidiaryCode || "")
      setSelectedDivisionCode(editData.divisionCode || "")
      setSelectedDepartmentCode(editData.departmentCode || "")
      setSelectedSubDepartmentCode(editData.subDepartmentCode || "")
      setSelectedLocationCodes(editData.locationCode || [])
      setValue("locationCode", editData.locationCode || [])
    } else if (open && !isEditMode) {
      reset()
      setSelectedLocationCodes([])
      setSelectedSubsidiaryCode("")
      setSelectedDivisionCode("")
      setSelectedDepartmentCode("")
      setSelectedSubDepartmentCode("")
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
      setSelectedDepartmentCode(editData.departmentCode || "");
      setValue("departmentCode", editData.departmentCode || "")
    }
  }, [isEditMode, editData, selectedDivisionCode, setValue]);

  useEffect(() => {
    if (isEditMode && editData && selectedDepartmentCode) {
      setSelectedSubDepartmentCode(editData.subDepartmentCode || "");
      setValue("subDepartmentCode", editData.subDepartmentCode || "")
    }
  }, [isEditMode, editData, selectedDepartmentCode, setValue]);

  useEffect(() => {
    if (isEditMode && editData && selectedSubDepartmentCode) {
      setSelectedLocationCodes(editData.locationCode || []);
      setValue("locationCode", editData.locationCode || []);
    }
  }, [isEditMode, editData, selectedDepartmentCode, setValue]);


  const handleFormSubmit = async (data: SectionFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing section
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.sectionCode, data, organizationData)
      } else {
        // Add mode - add new section
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
      postSection(postData)

    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Section updated successfully:" : "Section added successfully:", data)
    } catch (error) {
      console.error("Error processing section:", error)
    }
  }

  // Handle subsidiary selection
  const handleSubsidiarySelect = (subsidiaryCode: string) => {
    setSelectedSubsidiaryCode(subsidiaryCode)
    setValue("subsidiaryCode", subsidiaryCode)
    setSubsidiarySearchValue("")
    setSubsidiaryDropdownOpen(false)
    // Clear division, department, sub department and location codes when subsidiary changes
    setSelectedDivisionCode("")
    setValue("divisionCode", "")
    setSelectedDepartmentCode("")
    setValue("departmentCode", "")
    setSelectedSubDepartmentCode("")
    setValue("subDepartmentCode", "")
    setSelectedLocationCodes([])
    setValue("locationCode", [])
  }

  // Handle division selection
  const handleDivisionSelect = (divisionCode: string) => {
    setSelectedDivisionCode(divisionCode)
    setValue("divisionCode", divisionCode)
    setDivisionSearchValue("")
    setDivisionDropdownOpen(false)
    // Clear department, sub department and location codes when division changes
    setSelectedDepartmentCode("")
    setValue("departmentCode", "")
    setSelectedSubDepartmentCode("")
    setValue("subDepartmentCode", "")
    setSelectedLocationCodes([])
    setValue("locationCode", [])
  }

  // Handle department selection
  const handleDepartmentSelect = (departmentCode: string) => {
    setSelectedDepartmentCode(departmentCode)
    setValue("departmentCode", departmentCode)
    // Clear sub department and location codes when department changes
    setSelectedSubDepartmentCode("")
    setValue("subDepartmentCode", "")
    setSelectedLocationCodes([])
    setValue("locationCode", [])
  }

  // Handle sub department selection
  const handleSubDepartmentSelect = (subDepartmentCode: string) => {
    setSelectedSubDepartmentCode(subDepartmentCode)
    setValue("subDepartmentCode", subDepartmentCode)
    // Clear location codes when sub department changes
    setSelectedLocationCodes([])
    setValue("locationCode", [])
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
    setSelectedDepartmentCode("")
    setSelectedSubDepartmentCode("")
    setOpen(false)
  }

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Section" : "Add New Section",
        description: "Create a new section entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <FolderOpen className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Section" : "Add New Section"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update section information" : "Create a new section entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<SectionFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionCode">Section Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="sectionCode"
                    {...register("sectionCode")}
                    placeholder="Enter section code"
                    className={errors.sectionCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.sectionCode?.message && <p className="text-sm text-red-500">{errors.sectionCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sectionName">Section Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="sectionName"
                    {...register("sectionName")}
                    placeholder="Enter section name"
                    className={errors.sectionName?.message ? 'border-red-500' : ''}
                  />
                  {errors.sectionName?.message && <p className="text-sm text-red-500">{errors.sectionName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionDescription">Description</Label>
                <Textarea
                  id="sectionDescription"
                  {...register("sectionDescription")}
                  placeholder="Enter section description"
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

              {/* Department and Sub Department Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department <span className="text-red-500">*</span></Label>
                  <Select onValueChange={handleDepartmentSelect} value={selectedDepartmentCode} disabled={!selectedDivisionCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDivisionCode ? "Select a department" : "First select a division"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.departmentCode?.message && <p className="text-sm text-red-500">{errors.departmentCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Sub Department <span className="text-red-500">*</span></Label>
                  <Select onValueChange={handleSubDepartmentSelect} value={selectedSubDepartmentCode} disabled={!selectedDepartmentCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDepartmentCode ? "Select a sub department" : "First select a department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subDepartmentOptions.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subDepartmentCode?.message && <p className="text-sm text-red-500">{errors.subDepartmentCode.message}</p>}
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Codes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Assignment</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Location Codes</Label>
                  <Select onValueChange={handleLocationCodeSelect} disabled={!selectedSubDepartmentCode}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedSubDepartmentCode ? "Select location codes" : "First select a sub department"} />
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