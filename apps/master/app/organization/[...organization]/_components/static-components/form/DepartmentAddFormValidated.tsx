"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Building2, MapPin, X, GitBranch, Check, ChevronsUpDown } from "lucide-react"
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

interface DepartmentFormData {
  departmentCode?: string
  departmentName?: string
  departmentDescription?: string
  subsidiaryCode: string // required
  divisionCode: string   // required
  locationCode?: string[]
}

interface DepartmentFormModalProps {
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
    departmentCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Department code is required")
            .test('unique-department-code', 'Department code already exists in the organization', function(value) {
              if (!value) return true;
              const existingDepartments = organizationData.departments || [];
              const exists = existingDepartments.some((dept: any) => {
                const deptId = (dept.id || dept._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && deptId === editId) return false;
                return dept.departmentCode === value;
              });
              return !exists;
            })
      }),
    departmentName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Department name is required"),
        otherwise: schema =>
          schema
            .required("Department name is required")
            .test('unique-department-name', 'Department name already exists in the organization', function(value) {
              if (!value) return true;
              const existingDepartments = organizationData.departments || [];
              const exists = existingDepartments.some((dept: any) => {
                const deptId = (dept.id || dept._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && deptId === editId) return false;
                return dept.departmentName === value;
              });
              return !exists;
            })
      }),
    subsidiaryCode: yup.string().required("Subsidiary is required"),
    divisionCode: yup.string().required("Division is required"),
    departmentDescription: yup.string().optional(),
  })
}

export default function DepartmentAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: DepartmentFormModalProps) {
  
  const {
    post: postDepartment,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Department submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Department submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'departments' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('departments', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // State for selected values
  const [selectedLocationCodes, setSelectedLocationCodes] = useState<string[]>([])
  const [selectedSubsidiaryCode, setSelectedSubsidiaryCode] = useState<string>("")  
  const [selectedDivisionCode, setSelectedDivisionCode] = useState<string>("")
  
  // State for dropdowns
  const [subsidiaryDropdownOpen, setSubsidiaryDropdownOpen] = useState(false)
  const [subsidiarySearchValue, setSubsidiarySearchValue] = useState("")
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState(false)
  const [divisionSearchValue, setDivisionSearchValue] = useState("")
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
  
  // Get filtered location options based on selected division
  const getFilteredLocationOptions = () => {
    if (!selectedDivisionCode) return []
    
    const selectedDivision = organizationData.divisions?.find((div: any) => div.divisionCode === selectedDivisionCode)
    if (!selectedDivision || !selectedDivision.locationCode) return []
    
    const divisionLocationCodes = Array.isArray(selectedDivision.locationCode) 
      ? selectedDivision.locationCode 
      : [selectedDivision.locationCode]
    
    return (organizationData.location || [])
      .filter((location: any) => divisionLocationCodes.includes(location.locationCode))
      .map((location: any) => ({
        label: `${location.locationName} (${location.locationCode})`,
        value: location.locationCode
      }))
  }
  
  const divisionOptions = getFilteredDivisionOptions()
  const locationOptions = getFilteredLocationOptions()
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.departmentCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (departmentCode: string) => {
    try {
      console.log("Deleting department:", departmentCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(departmentCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postDepartment(postData)
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Department deleted successfully:", departmentCode)
    } catch (error) {
      console.error("Error deleting department:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      departmentCode: "",
      departmentName: "",
      departmentDescription: "",
      subsidiaryCode: "", // ensure string, not undefined
      divisionCode: "",   // ensure string, not undefined
      locationCode: [],
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("departmentCode", editData.departmentCode || "")
      setValue("departmentName", editData.departmentName || "")
      setValue("departmentDescription", editData.departmentDescription || "")
      setValue("subsidiaryCode", editData.subsidiaryCode || "")
      setSelectedSubsidiaryCode(editData.subsidiaryCode || "")
      setSelectedDivisionCode(editData.divisionCode || "")
      setSelectedLocationCodes(editData.locationCode || [])
      setValue("locationCode", editData.locationCode || [])
    } else {
      reset()
      setSelectedLocationCodes([])
      setSelectedSubsidiaryCode("")
      setSelectedDivisionCode("")
    }
  }, [isEditMode, editData, setValue, reset])

  const handleFormSubmit = async (data: DepartmentFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing department
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.departmentCode, data, organizationData)
      } else {
        // Add mode - add new department
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
      postDepartment(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Department updated successfully:" : "Department added successfully:", data)
    } catch (error) {
      console.error("Error processing department:", error)
    }
  }

  // Filter functions for search
  const filteredSubsidiaryOptions = subsidiaryOptions.filter((option: any) =>
    option.label.toLowerCase().includes(subsidiarySearchValue.toLowerCase())
  )
  
  const filteredDivisionOptions = divisionOptions.filter((option: any) =>
    option.label.toLowerCase().includes(divisionSearchValue.toLowerCase())
  )
  
  const filteredLocationOptions = locationOptions.filter((option: any) =>
    option.label.toLowerCase().includes(locationSearchValue.toLowerCase())
  )

  // Handle subsidiary selection
  const handleSubsidiarySelect = (subsidiaryCode: string) => {
    setSelectedSubsidiaryCode(subsidiaryCode)
    setValue("subsidiaryCode", subsidiaryCode)
    setSubsidiarySearchValue("")
    setSubsidiaryDropdownOpen(false)
    // Clear division and location codes when subsidiary changes
    setSelectedDivisionCode("")
    setValue("divisionCode", "")
    setSelectedLocationCodes([])
    setValue("locationCode", [])
  }

  // Handle division selection
  const handleDivisionSelect = (divisionCode: string) => {
    setSelectedDivisionCode(divisionCode)
    setValue("divisionCode", divisionCode)
    setDivisionSearchValue("")
    setDivisionDropdownOpen(false)
    // Clear location codes when division changes
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
    setOpen(false)
  }

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Department" : "Add New Department",
        description: "Create a new department entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Building2 className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Department" : "Add New Department"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update department information" : "Create a new department entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<DepartmentFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentCode">Department Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="departmentCode"
                    {...register("departmentCode")}
                    placeholder="Enter department code"
                    className={errors.departmentCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.departmentCode?.message && <p className="text-sm text-red-500">{errors.departmentCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="departmentName"
                    {...register("departmentName")}
                    placeholder="Enter department name"
                    className={errors.departmentName?.message ? 'border-red-500' : ''}
                  />
                  {errors.departmentName?.message && <p className="text-sm text-red-500">{errors.departmentName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentDescription">Description</Label>
                <Textarea
                  id="departmentDescription"
                  {...register("departmentDescription")}
                  placeholder="Enter department description"
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
                  <Popover open={subsidiaryDropdownOpen} onOpenChange={setSubsidiaryDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={subsidiaryDropdownOpen}
                        className="w-full justify-between"
                      >
                        {selectedSubsidiaryCode
                          ? subsidiaryOptions.find((option: any) => option.value === selectedSubsidiaryCode)?.label
                          : "Select a subsidiary"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
                      <Command>
                        <CommandInput
                          placeholder="Search subsidiaries..."
                          value={subsidiarySearchValue}
                          onValueChange={setSubsidiarySearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No subsidiary found.</CommandEmpty>
                          <CommandGroup className="h-[150px] overflow-y-auto">
                            {filteredSubsidiaryOptions.map((option: any) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => handleSubsidiarySelect(option.value)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedSubsidiaryCode === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.subsidiaryCode?.message && <p className="text-sm text-red-500">{errors.subsidiaryCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Division <span className="text-red-500">*</span></Label>
                  <Popover open={divisionDropdownOpen} onOpenChange={setDivisionDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={divisionDropdownOpen}
                        className="w-full justify-between"
                        disabled={!selectedSubsidiaryCode}
                      >
                        {selectedDivisionCode
                          ? divisionOptions.find((option: any) => option.value === selectedDivisionCode)?.label
                          : selectedSubsidiaryCode ? "Select a division" : "First select a subsidiary"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
                      <Command>
                        <CommandInput
                          placeholder="Search divisions..."
                          value={divisionSearchValue}
                          onValueChange={setDivisionSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No division found.</CommandEmpty>
                          <CommandGroup className="h-[150px] overflow-y-auto">
                            {filteredDivisionOptions.map((option: any) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => handleDivisionSelect(option.value)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedDivisionCode === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.divisionCode?.message && <p className="text-sm text-red-500">{errors.divisionCode.message}</p>}
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
                  <Popover open={locationDropdownOpen} onOpenChange={setLocationDropdownOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationDropdownOpen}
                        className="w-full justify-between"
                        disabled={!selectedDivisionCode}
                      >
                        {selectedLocationCodes.length > 0
                          ? `${selectedLocationCodes.length} location(s) selected`
                          : selectedDivisionCode ? "Select location codes" : "First select a division"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
                      <Command>
                        <CommandInput
                          placeholder="Search locations..."
                          value={locationSearchValue}
                          onValueChange={setLocationSearchValue}
                        />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup className="h-[150px] overflow-y-auto">
                            {filteredLocationOptions.map((option: any) => (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={() => {
                                  handleLocationCodeSelect(option.value)
                                  setLocationSearchValue("")
                                }}
                                disabled={selectedLocationCodes.includes(option.value)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLocationCodes.includes(option.value) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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