"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Package, X } from "lucide-react"
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
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface AssetMasterFormData {
  assetCode?: string
  assetName?: string
  assetType?: string
}

interface AssetMasterFormModalProps {
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
    assetCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Asset code is required")
            .test('unique-asset-code', 'Asset code already exists in the organization', function(value) {
              if (!value) return true;
              const existingAssets = organizationData.assetMaster?.assets || [];
              const exists = existingAssets.some((asset: any) => {
                const assetId = (asset.id || asset._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && assetId === editId) return false;
                return asset.assetCode === value;
              });
              return !exists;
            })
      }),
    assetName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Asset name is required"),
        otherwise: schema =>
          schema
            .required("Asset name is required")
            .test('unique-asset-name', 'Asset name already exists in the organization', function(value) {
              if (!value) return true;
              const existingAssets = organizationData.assetMaster?.assets || [];
              const exists = existingAssets.some((asset: any) => {
                const assetId = (asset.id || asset._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && assetId === editId) return false;
                return asset.assetName === value;
              });
              return !exists;
            })
      }),
    assetType: yup.string().optional(),
  })
}

export default function AssetMasterAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: AssetMasterFormModalProps) {
  
  const {
    post: postAssetMaster,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      toast.success("Asset submitted successfully!");
      setOpen(false)
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error) => {
      console.error("Error submitting asset:", error)
      toast.error("Failed to submit asset. Please try again.")
    }
  })

  const { token } = useAuthToken()

  const schema = createSchema(organizationData, isEditMode || false, editData)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AssetMasterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      assetCode: "",
      assetName: "",
      assetType: "",
    }
  })

  // Watch form values
  const watchedValues = watch()

  // Get asset types from organization data
  const assetTypes = organizationData.assetMaster?.assetTypes || ["Returnable", "Non-Returnable"]

  // Custom functions to handle assetMaster nested structure
  const addAssetToOrganization = (assetData: AssetMasterFormData, orgData: any) => {
    const currentAssetMaster = orgData.assetMaster || { assets: [], assetTypes: ["Returnable", "Non-Returnable"] }
    const currentAssets = currentAssetMaster.assets || []
    
    const newAsset = {
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return {
      ...orgData,
      assetMaster: {
        ...currentAssetMaster,
        assets: [...currentAssets, newAsset]
      }
    }
  }

  const updateAssetInOrganization = (assetCode: string, assetData: AssetMasterFormData, orgData: any) => {
    const currentAssetMaster = orgData.assetMaster || { assets: [], assetTypes: ["Returnable", "Non-Returnable"] }
    const currentAssets = currentAssetMaster.assets || []
    
    const assetIndex = currentAssets.findIndex((asset: any) => asset.assetCode === assetCode)
    
    if (assetIndex === -1) {
      throw new Error(`Asset with code ${assetCode} not found`)
    }
    
    const updatedAssets = [...currentAssets]
    updatedAssets[assetIndex] = {
      ...updatedAssets[assetIndex],
      ...assetData,
      updatedAt: new Date().toISOString()
    }
    
    return {
      ...orgData,
      assetMaster: {
        ...currentAssetMaster,
        assets: updatedAssets
      }
    }
  }

  const deleteAssetFromOrganization = (assetCode: string, orgData: any) => {
    const currentAssetMaster = orgData.assetMaster || { assets: [], assetTypes: ["Returnable", "Non-Returnable"] }
    const currentAssets = currentAssetMaster.assets || []
    
    const updatedAssets = currentAssets.filter((asset: any) => asset.assetCode !== assetCode)
    
    return {
      ...orgData,
      assetMaster: {
        ...currentAssetMaster,
        assets: updatedAssets
      }
    }
  }

  // Handle form submission
  const handleFormSubmit: SubmitHandler<AssetMasterFormData> = async (data) => {
    try {
      console.log("Form data:", data)
      
      let updatedData
      if (isEditMode && editData) {
        // Update existing asset
        updatedData = updateAssetInOrganization(editData.assetCode, data, organizationData)
        console.log("Updated asset:", updatedData)
      } else {
        // Add new asset
        updatedData = addAssetToOrganization(data, organizationData)
        console.log("Added asset:", updatedData)
      }

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postAssetMaster(postData)
      
      if (onSuccess) {
        // For table display, return the assets array
        const tableData = {
          ...updatedData,
          assetMaster: updatedData.assetMaster?.assets || []
        }
        onSuccess(tableData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      reset()
      setOpen(false)
    } catch (error) {
      console.error("Error processing asset:", error)
      toast.error("Failed to process asset. Please try again.")
    }
  }

  // Handle delete item
  const handleDeleteItem = async (assetCode: string) => {
    try {
      console.log("Deleting asset:", assetCode)
      
      const updatedData = deleteAssetFromOrganization(assetCode, organizationData)
      console.log("Deleted asset:", updatedData)

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postAssetMaster(postData)
      
      if (onSuccess) {
        // For table display, return the assets array
        const tableData = {
          ...updatedData,
          assetMaster: updatedData.assetMaster?.assets || []
        }
        onSuccess(tableData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      console.log("Asset deleted successfully:", assetCode)
    } catch (error) {
      console.error("Error deleting asset:", error)
      toast.error("Failed to delete asset. Please try again.")
    }
  }

  // Handle cancel
  const handleCancel = () => {
    reset()
    setOpen(false)
  }

  // Reset form when edit data changes or popup opens/closes
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("assetCode", editData.assetCode || "")
      setValue("assetName", editData.assetName || "")
      setValue("assetType", editData.assetType || "")
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  // Handle delete button click
  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.assetCode)
    }
  }, [deleteValue])

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Asset" : "Add New Asset",
        description: "Create a new asset entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Package className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Asset" : "Add New Asset"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update asset information" : "Create a new asset entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetCode">Asset Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="assetCode"
                    placeholder="Enter asset code"
                    {...register("assetCode")}
                    className={errors.assetCode ? "border-red-500" : ""}
                    disabled={isEditMode}
                  />
                  {errors.assetCode && (
                    <p className="text-sm text-red-500">{errors.assetCode.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="assetName"
                    placeholder="Enter asset name"
                    {...register("assetName")}
                    className={errors.assetName ? "border-red-500" : ""}
                  />
                  {errors.assetName && (
                    <p className="text-sm text-red-500">{errors.assetName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assetType">Asset Type</Label>
                <Select onValueChange={(value) => setValue("assetType", value)} value={watchedValues.assetType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assetType && (
                  <p className="text-sm text-red-500">{errors.assetType.message}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={postLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={postLoading}
                style={{ backgroundColor: '#2d81ff' }}
                className="hover:opacity-90"
              >
                {postLoading ? "Saving..." : (isEditMode ? "Update" : "Save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SemiPopupWrapper>
  )
}
