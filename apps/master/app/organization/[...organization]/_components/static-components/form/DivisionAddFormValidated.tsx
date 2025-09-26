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

interface DivisionFormData {
  divisionCode?: string
  divisionName?: string
  divisionDescription?: string
  subsidiaryCode: string // required
  locationCode?: string[]
}

interface DivisionFormModalProps {
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
    divisionCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Division code is required")
            .test('unique-division-code', 'Division code already exists in the organization', function(value) {
              if (!value) return true;
              const existingDivisions = organizationData.divisions || [];
              const exists = existingDivisions.some((div: any) => {
                const divId = (div.id || div._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && divId === editId) return false;
                return div.divisionCode === value;
              });
              return !exists;
            })
      }),
    divisionName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Division name is required"),
        otherwise: schema =>
          schema
            .required("Division name is required")
            .test('unique-division-name', 'Division name already exists in the organization', function(value) {
              if (!value) return true;
              const existingDivisions = organizationData.divisions || [];
              const exists = existingDivisions.some((div: any) => {
                const divId = (div.id || div._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && divId === editId) return false;
                return div.divisionName === value;
              });
              return !exists;
            })
      }),
    subsidiaryCode: yup.string().required("Subsidiary is required"),
    divisionDescription: yup.string().optional(),
  })
}

export default function DivisionAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: DivisionFormModalProps) {
  
  const {
    post: postDivision,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Division submitted successfully!");
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Division submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'divisions' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('divisions', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // State for selected location codes and subsidiary
  const [selectedLocationCodes, setSelectedLocationCodes] = useState<string[]>([])
  const [selectedSubsidiaryCode, setSelectedSubsidiaryCode] = useState<string>("")
  
  // State for dropdowns
  const [subsidiaryDropdownOpen, setSubsidiaryDropdownOpen] = useState(false)
  const [subsidiarySearchValue, setSubsidiarySearchValue] = useState("")
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearchValue, setLocationSearchValue] = useState("")
  
  // Get subsidiary options from organization data
  const subsidiaryOptions = (organizationData.subsidiaries || []).map((subsidiary: any) => ({
    label: `${subsidiary.subsidiaryName} (${subsidiary.subsidiaryCode})`,
    value: subsidiary.subsidiaryCode
  }))
  
  // Get filtered location options based on selected subsidiary
  const getFilteredLocationOptions = () => {
    if (!selectedSubsidiaryCode) return []
    
    const selectedSubsidiary = organizationData.subsidiaries?.find((sub: any) => sub.subsidiaryCode === selectedSubsidiaryCode)
    if (!selectedSubsidiary || !selectedSubsidiary.locationCode) return []
    
    const subsidiaryLocationCodes = Array.isArray(selectedSubsidiary.locationCode) 
      ? selectedSubsidiary.locationCode 
      : [selectedSubsidiary.locationCode]
    
    return (organizationData.location || [])
      .filter((location: any) => subsidiaryLocationCodes.includes(location.locationCode))
      .map((location: any) => ({
        label: `${location.locationName} (${location.locationCode})`,
        value: location.locationCode
      }))
  }
  
  const locationOptions = getFilteredLocationOptions()
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.divisionCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (divisionCode: string) => {
    try {
      console.log("Deleting division:", divisionCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(divisionCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postDivision(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Division deleted successfully:", divisionCode)
    } catch (error) {
      console.error("Error deleting division:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<DivisionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      divisionCode: "",
      divisionName: "",
      divisionDescription: "",
      subsidiaryCode: "",
      locationCode: [],
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("divisionCode", editData.divisionCode || "")
      setValue("divisionName", editData.divisionName || "")
      setValue("divisionDescription", editData.divisionDescription || "")
      setValue("subsidiaryCode", editData.subsidiaryCode || "")
      setSelectedSubsidiaryCode(editData.subsidiaryCode || "")
      setSelectedLocationCodes(editData.locationCode || [])
      setValue("locationCode", editData.locationCode || [])
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
      setSelectedLocationCodes([])
      setSelectedSubsidiaryCode("")
    }
  }, [isEditMode, editData, setValue, reset, open])

  const handleFormSubmit = async (data: DivisionFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing division
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.divisionCode, data, organizationData)
      } else {
        // Add mode - add new division
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
      postDivision(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Division updated successfully:" : "Division added successfully:", data)
    } catch (error) {
      console.error("Error processing division:", error)
    }
  }

  // Handle subsidiary selection
  const handleSubsidiarySelect = (subsidiaryCode: string) => {
    setSelectedSubsidiaryCode(subsidiaryCode)
    setValue("subsidiaryCode", subsidiaryCode)
    // Clear location codes when subsidiary changes
    setSelectedLocationCodes([])
    setValue("locationCode", [])
    setSubsidiarySearchValue("")
    setSubsidiaryDropdownOpen(false)
  }

  // Handle location code selection
  const handleLocationCodeSelect = (locationCode: string) => {
    if (!selectedLocationCodes.includes(locationCode)) {
      const updatedCodes = [...selectedLocationCodes, locationCode]
      setSelectedLocationCodes(updatedCodes)
      setValue("locationCode", updatedCodes)
    }
    setLocationSearchValue("")
    setLocationDropdownOpen(false)
  }

  // Filter subsidiary options based on search
  const filteredSubsidiaryOptions = subsidiaryOptions.filter((option: any) =>
    option.label.toLowerCase().includes(subsidiarySearchValue.toLowerCase())
  )

  // Filter location options based on search
  const filteredLocationOptions = locationOptions.filter((option: any) =>
    option.label.toLowerCase().includes(locationSearchValue.toLowerCase())
  )

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
    setOpen(false)
  }

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Division" : "Add New Division",
        description: "Create a new division entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <GitBranch className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Division" : "Add New Division"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update division information" : "Create a new division entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<DivisionFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="divisionCode">Division Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="divisionCode"
                    {...register("divisionCode")}
                    placeholder="Enter division code"
                    className={errors.divisionCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.divisionCode?.message && <p className="text-sm text-red-500">{errors.divisionCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="divisionName">Division Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="divisionName"
                    {...register("divisionName")}
                    placeholder="Enter division name"
                    className={errors.divisionName?.message ? 'border-red-500' : ''}
                  />
                  {errors.divisionName?.message && <p className="text-sm text-red-500">{errors.divisionName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="divisionDescription">Description</Label>
                <Textarea
                  id="divisionDescription"
                  {...register("divisionDescription")}
                  placeholder="Enter division description"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Subsidiary Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Subsidiary Assignment</h3>
              <div className="space-y-2">
                <Label>Subsidiary <span className="text-red-500">*</span></Label>
                {subsidiaryOptions.length === 0 ? (
                  <div className="w-full px-3 py-2 rounded-md border border-red-300 bg-red-50 text-sm text-red-600 flex items-center">
                    No subsidiaries available
                  </div>
                ) : (
                  <Popover open={subsidiaryDropdownOpen} onOpenChange={setSubsidiaryDropdownOpen}>
                    <PopoverTrigger className="w-full bg-white" asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={subsidiaryDropdownOpen}
                        className={`w-full justify-between h-10 ${
                          errors.subsidiaryCode?.message
                            ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        {selectedSubsidiaryCode ? (
                          subsidiaryOptions.find((opt: any) => opt.value === selectedSubsidiaryCode)?.label || selectedSubsidiaryCode
                        ) : (
                          <span className="text-gray-500">Select a subsidiary</span>
                        )}
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
                        <CommandEmpty>No subsidiaries found.</CommandEmpty>
                        <CommandGroup className="h-[150px] overflow-y-auto">
                          {filteredSubsidiaryOptions.map((option: any) => (
                            <CommandItem
                              key={option.value}
                              onSelect={() => handleSubsidiarySelect(option.value)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSubsidiaryCode === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
                {errors.subsidiaryCode?.message && <p className="text-sm text-red-500">{errors.subsidiaryCode.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Location Codes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Assignment</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Location Codes</Label>
                  {!selectedSubsidiaryCode ? (
                    <div className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-500 flex items-center">
                      First select a subsidiary
                    </div>
                  ) : locationOptions.length === 0 ? (
                    <div className="w-full px-3 py-2 rounded-md border border-red-300 bg-red-50 text-sm text-red-600 flex items-center">
                      No locations available for selected subsidiary
                    </div>
                  ) : (
                    <Popover open={locationDropdownOpen} onOpenChange={setLocationDropdownOpen}>
                      <PopoverTrigger className="w-full bg-white" asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={locationDropdownOpen}
                          className="w-full justify-between h-10 border-gray-300 bg-white hover:border-gray-400"
                          disabled={!selectedSubsidiaryCode}
                        >
                          <span className="text-gray-500">Select location codes</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white">
                        <Command>
                          <CommandInput 
                            placeholder="Search location codes..."
                            value={locationSearchValue}
                            onValueChange={setLocationSearchValue}
                          />
                          <CommandEmpty>No locations found.</CommandEmpty>
                          <CommandGroup className="max-h-48 w-full overflow-y-auto">
                            {filteredLocationOptions.slice(0, 6).map((option: any) => (
                              <CommandItem
                                key={option.value}
                                onSelect={() => handleLocationCodeSelect(option.value)}
                                disabled={selectedLocationCodes.includes(option.value)}
                                className={selectedLocationCodes.includes(option.value) ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLocationCodes.includes(option.value)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
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