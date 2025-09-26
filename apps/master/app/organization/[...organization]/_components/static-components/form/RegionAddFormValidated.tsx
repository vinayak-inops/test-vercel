"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Globe } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

interface RegionFormData {
  regionCode?: string
  regionName?: string
  regionDescription?: string
}

interface RegionFormModalProps {
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
    regionCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Region code is required")
            .test('unique-region-code', 'Region code already exists in the organization', function(value) {
              if (!value) return true;
              const existingRegions = organizationData.region || [];
              const exists = existingRegions.some((region: any) => {
                const regionId = (region.id || region._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && regionId === editId) return false;
                return region.regionCode === value;
              });
              return !exists;
            })
      }),
    regionName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Region name is required"),
        otherwise: schema =>
          schema
            .required("Region name is required")
            .test('unique-region-name', 'Region name already exists in the organization', function(value) {
              if (!value) return true;
              const existingRegions = organizationData.region || [];
              const exists = existingRegions.some((region: any) => {
                const regionId = (region.id || region._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && regionId === editId) return false;
                return region.regionName === value;
              });
              return !exists;
            })
      }),
    regionDescription: yup.string().optional(),
  })
}

export default function RegionAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: RegionFormModalProps) {
  
  // Use the dynamic CRUD hook for 'region' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('region', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  const {
    post: postRegion,
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

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.regionCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (regionCode: string) => {
    try {
      console.log("Deleting region:", regionCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(regionCode, organizationData)
      
      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      } 

      postRegion(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Region deleted successfully:", regionCode)
    } catch (error) {
      console.error("Error deleting region:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<RegionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      regionCode: "",
      regionName: "",
      regionDescription: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("regionCode", editData.regionCode || "")
      setValue("regionName", editData.regionName || "")
      setValue("regionDescription", editData.regionDescription || "")
    } else {
      reset()
    }
  }, [isEditMode, editData, setValue, reset])

  const handleFormSubmit = async (data: RegionFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing region
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.regionCode, data, organizationData)
      } else {
        // Add mode - add new region
        updatedData = addCategoryItem(data, organizationData)
      }

      console.log("updatedData", updatedData)
      console.log("updatedData._id", updatedData._id)

      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      } 

      postRegion(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Region updated successfully:" : "Region added successfully:", data)
    } catch (error) {
      console.error("Error processing region:", error)
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
        title: isEditMode ? "Edit Region" : "Add New Region",
        description: "Create a new region entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
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
                  {isEditMode ? "Edit Region" : "Add New Region"}
                </h1>
                <p className="text-cyan-100 text-sm mt-1">
                  {isEditMode ? "Update region information" : "Create a new region entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<RegionFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regionCode">Region Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="regionCode"
                    {...register("regionCode")}
                    placeholder="Enter region code (e.g., NE)"
                    className={errors.regionCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.regionCode?.message && <p className="text-sm text-red-500">{errors.regionCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionName">Region Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="regionName"
                    {...register("regionName")}
                    placeholder="Enter region name (e.g., North-Eastern India)"
                    className={errors.regionName?.message ? 'border-red-500' : ''}
                  />
                  {errors.regionName?.message && <p className="text-sm text-red-500">{errors.regionName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regionDescription">Description</Label>
                <Textarea
                  id="regionDescription"
                  {...register("regionDescription")}
                  placeholder="Enter region description"
                  rows={3}
                />
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