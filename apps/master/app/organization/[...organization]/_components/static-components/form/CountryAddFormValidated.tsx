"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Globe } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

interface CountryFormData {
  countryCode: string
  countryName: string
}

interface CountryFormModalProps {
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
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Country code is required"),
        otherwise: schema =>
          schema
            .required("Country code is required")
            .test('unique-country-code', 'Country code already exists in the organization', function(value) {
              if (!value) return true;
              const existingCountries = organizationData.country || [];
              const exists = existingCountries.some((country: any) => {
                const countryId = (country.id || country._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && countryId === editId) return false;
                return country.countryCode === value;
              });
              return !exists;
            })
      }),
    countryName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Country name is required"),
        otherwise: schema =>
          schema
            .required("Country name is required")
            .test('unique-country-name', 'Country name already exists in the organization', function(value) {
              if (!value) return true;
              const existingCountries = organizationData.country || [];
              const exists = existingCountries.some((country: any) => {
                const countryId = (country.id || country._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && countryId === editId) return false;
                return country.countryName === value;
              });
              return !exists;
            })
      }),
  })
}

export default function CountryAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: CountryFormModalProps) {
  
  const {
    post: postCountry,
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
  // Use the dynamic CRUD hook for 'country' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('country', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.countryCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (countryCode: string) => {
    try {
      console.log("Deleting country:", countryCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(countryCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postCountry(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Country deleted successfully:", countryCode)
    } catch (error) {
      console.error("Error deleting country:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CountryFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      countryCode: "",
      countryName: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("countryCode", editData.countryCode || "")
      setValue("countryName", editData.countryName || "")
    } else {
      reset()
    }
  }, [isEditMode, editData, setValue, reset])

  const handleFormSubmit = async (data: CountryFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing country
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.countryCode, data, organizationData)
      } else {
        // Add mode - add new country
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
    postCountry(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Country updated successfully:" : "Country added successfully:", data)
    } catch (error) {
      console.error("Error processing country:", error)
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
        title: isEditMode ? "Edit Country" : "Add New Country",
        description: "Create a new country entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Globe className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Country" : "Add New Country"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update country information" : "Create a new country entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<CountryFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="countryCode"
                    {...register("countryCode")}
                    placeholder="Enter country code (e.g., IN)"
                    className={errors.countryCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.countryCode?.message && <p className="text-sm text-red-500">{errors.countryCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryName">Country Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="countryName"
                    {...register("countryName")}
                    placeholder="Enter country name (e.g., India)"
                    className={errors.countryName?.message ? 'border-red-500' : ''}
                  />
                  {errors.countryName?.message && <p className="text-sm text-red-500">{errors.countryName.message}</p>}
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