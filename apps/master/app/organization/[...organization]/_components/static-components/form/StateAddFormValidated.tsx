"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { MapPin } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect, useState } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react"
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

interface StateFormData {
  countryCode: string
  countryName: string
  stateCode: string
  stateName: string
}

interface StateFormModalProps {
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
    countryCode: yup
      .string()
      .required("Country code is required"),
    countryName: yup
      .string()
      .required("Country name is required"),
    stateCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("State code is required"),
        otherwise: schema =>
          schema
            .required("State code is required")
            .test('unique-state-code', 'State code already exists in the organization', function(value) {
              if (!value) return true;
              const existingStates = organizationData.state || [];
              const exists = existingStates.some((state: any) => {
                const stateId = (state.id || state._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && stateId === editId) return false;
                return state.stateCode === value;
              });
              return !exists;
            })
      }),
    stateName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("State name is required"),
        otherwise: schema =>
          schema
            .required("State name is required")
            .test('unique-state-name', 'State name already exists in the organization', function(value) {
              if (!value) return true;
              const existingStates = organizationData.state || [];
              const exists = existingStates.some((state: any) => {
                const stateId = (state.id || state._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && stateId === editId) return false;
                return state.stateName === value;
              });
              return !exists;
            })
      }),
  })
}

export default function StateAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: StateFormModalProps) {
  
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [countrySearchValue, setCountrySearchValue] = useState("")
  
  const {
    post: postState,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
    },
    onError: (error) => {
      console.log("error", error)
    }
  })
  
  // Use the dynamic CRUD hook for 'state' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('state', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Get dropdown options from organization data
  const countryOptions = (organizationData.country || []).map((country: any) => ({
    label: `${country.countryName} (${country.countryCode})`,
    value: country.countryCode,
    name: country.countryName
  }))
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.stateCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (stateCode: string) => {
    try {
      console.log("Deleting state:", stateCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(stateCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postState(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("State deleted successfully:", stateCode)
    } catch (error) {
      console.error("Error deleting state:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<StateFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      countryCode: "",
      countryName: "",
      stateCode: "",
      stateName: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("countryCode", editData.countryCode || "")
      setValue("countryName", editData.countryName || "")
      setValue("stateCode", editData.stateCode || "")
      setValue("stateName", editData.stateName || "")
    } else {
      reset()
    }
  }, [isEditMode, editData, setValue, reset])

  // Handle country selection
  const handleCountrySelect = (value: string) => {
    const selectedCountry = countryOptions.find((country:any) => country.value === value);
    setValue("countryCode", value, { shouldValidate: true });
    setValue("countryName", selectedCountry?.name || "");
    setCountrySearchValue("")
    setCountryDropdownOpen(false)
  }

  const filteredCountryOptions = countryOptions.filter((option: any) =>
    option.label.toLowerCase().includes(countrySearchValue.toLowerCase())
  )

  const handleFormSubmit = async (data: StateFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing state
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.stateCode, data, organizationData)
      } else {
        // Add mode - add new state
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
    postState(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "State updated successfully:" : "State added successfully:", data)
    } catch (error) {
      console.error("Error processing state:", error)
    }
  }

  const handleCancel = () => {
    reset()
    setOpen(false)
  }

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit State" : "Add New State",
        description: "Create a new state entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <MapPin className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit State" : "Add New State"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {isEditMode ? "Update state information" : "Create a new state entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<StateFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Country Code Advanced Dropdown */}
                <div className="space-y-2 bg-white p-0 rounded-lg">
                  <Label className="text-sm font-medium text-gray-700">
                    Country Code <span className="text-red-500">*</span>
                  </Label>
                  {countryOptions.length === 0 ? (
                    <div className="w-full px-3 py-2 rounded-md border border-red-300 bg-red-50 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Please add Country Code in proper way
                    </div>
                  ) : (
                    <Popover open={countryDropdownOpen} onOpenChange={setCountryDropdownOpen}>
                      <PopoverTrigger className="w-full bg-white" asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryDropdownOpen}
                          className={`w-full justify-between h-10 ${
                            errors.countryCode
                              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          {watch("countryCode") ? (
                            countryOptions.find((opt: any) => opt.value === watch("countryCode"))?.label || watch("countryCode")
                          ) : (
                            <span className="text-gray-500">Select Country Code</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-white max-h-none">
                        <Command className="max-h-none">
                          <CommandInput 
                            placeholder="Search Country Code..."
                            value={countrySearchValue}
                            onValueChange={setCountrySearchValue}
                          />
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup className="max-h-none overflow-visible">
                            {filteredCountryOptions?.map((option: any) => (
                              <CommandItem
                                key={option.value}
                                onSelect={() => handleCountrySelect(option.value)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    watch("countryCode") === option.value
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
                  {errors.countryCode && (
                    <p className="text-sm text-red-600">{errors.countryCode.message}</p>
                  )}
                </div>

                {/* Country Name - Auto-populated, read-only */}
                <div className="space-y-2">
                  <Label htmlFor="countryName">Country Name</Label>
                  <Input
                    id="countryName"
                    value={watch("countryName") || ""}
                    placeholder="Auto-populated from country selection"
                    className="bg-gray-50"
                    readOnly
                  />
                  {errors.countryName?.message && <p className="text-sm text-red-500">{errors.countryName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Code - Input field */}
                <div className="space-y-2">
                  <Label htmlFor="stateCode">State Code</Label>
                  <Input
                    id="stateCode"
                    {...register("stateCode")}
                    placeholder="Enter state code (e.g., OR)"
                    className={errors.stateCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.stateCode?.message && <p className="text-sm text-red-500">{errors.stateCode.message}</p>}
                </div>

                {/* State Name */}
                <div className="space-y-2">
                  <Label htmlFor="stateName">State Name</Label>
                  <Input
                    id="stateName"
                    {...register("stateName")}
                    placeholder="Enter state name (e.g., Odisha)"
                    className={errors.stateName?.message ? 'border-red-500' : ''}
                  />
                  {errors.stateName?.message && <p className="text-sm text-red-500">{errors.stateName.message}</p>}
                </div>
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