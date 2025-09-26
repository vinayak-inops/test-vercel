"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { FileText } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect, useState } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface ReasonCodeFormData {
  reasonCode?: string
  reasonName?: string
  reasonDescription?: string
}

interface ReasonCodeFormModalProps {
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
    reasonCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Reason code is required")
            .test('unique-reason-code', 'Reason code already exists in the organization', function(value) {
              if (!value) return true;
              const existingReasonCodes = organizationData.reasonCodes || [];
              const exists = existingReasonCodes.some((reason: any) => {
                const reasonId = (reason.id || reason._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && reasonId === editId) return false;
                return reason.reasonCode === value;
              });
              return !exists;
            })
      }),
    reasonName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Reason name is required"),
        otherwise: schema =>
          schema
            .required("Reason name is required")
            .test('unique-reason-name', 'Reason name already exists in the organization', function(value) {
              if (!value) return true;
              const existingReasonCodes = organizationData.reasonCodes || [];
              const exists = existingReasonCodes.some((reason: any) => {
                const reasonId = (reason.id || reason._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && reasonId === editId) return false;
                return reason.reasonName === value;
              });
              return !exists;
            })
      }),
    reasonDescription: yup.string().optional(),
  })
}

export default function ReasonCodeAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: ReasonCodeFormModalProps) {
  
  const {
    post: postReasonCode,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Reason code submitted successfully!");
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Reason code submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'reasonCodes' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('reasonCodes', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.reasonCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (reasonCode: string) => {
    try {
      console.log("Deleting reason code:", reasonCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(reasonCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postReasonCode(postData)      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Reason code deleted successfully:", reasonCode)
    } catch (error) {
      console.error("Error deleting reason code:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ReasonCodeFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      reasonCode: "",
      reasonName: "",
      reasonDescription: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("reasonCode", editData.reasonCode || "")
      setValue("reasonName", editData.reasonName || "")
      setValue("reasonDescription", editData.reasonDescription || "")
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  const handleFormSubmit = async (data: ReasonCodeFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing reason code
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.reasonCode, data, organizationData)
      } else {
        // Add mode - add new reason code
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
      postReasonCode(postData)    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Reason code updated successfully:" : "Reason code added successfully:", data)
    } catch (error) {
      console.error("Error processing reason code:", error)
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
        title: isEditMode ? "Edit Reason Code" : "Add New Reason Code",
        description: "Create a new reason code entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <FileText className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Reason Code" : "Add New Reason Code"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {isEditMode ? "Update reason code information" : "Create a new reason code entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<ReasonCodeFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reasonCode">Reason Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="reasonCode"
                    {...register("reasonCode")}
                    placeholder="Enter reason code"
                    className={errors.reasonCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.reasonCode?.message && <p className="text-sm text-red-500">{errors.reasonCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reasonName">Reason Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="reasonName"
                    {...register("reasonName")}
                    placeholder="Enter reason name"
                    className={errors.reasonName?.message ? 'border-red-500' : ''}
                  />
                  {errors.reasonName?.message && <p className="text-sm text-red-500">{errors.reasonName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonDescription">Description</Label>
                <Textarea
                  id="reasonDescription"
                  {...register("reasonDescription")}
                  placeholder="Enter reason description"
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