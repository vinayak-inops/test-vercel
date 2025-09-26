"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Briefcase } from "lucide-react"
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
import { toast } from "react-toastify"

interface NatureOfWorkFormData {
  natureOfWorkCode?: string
  natureOfWorkTitle?: string
  natureOfWorkDescription?: string
}

interface NatureOfWorkFormModalProps {
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
    natureOfWorkCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Nature of work code is required")
            .test('unique-nature-of-work-code', 'Nature of work code already exists in the organization', function(value) {
              if (!value) return true;
              const existingWork = organizationData.natureOfWork || [];
              const exists = existingWork.some((work: any) => {
                const workId = (work.id || work._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && workId === editId) return false;
                return work.natureOfWorkCode === value;
              });
              return !exists;
            })
      }),
    natureOfWorkTitle: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Nature of work title is required"),
        otherwise: schema =>
          schema
            .required("Nature of work title is required")
            .test('unique-nature-of-work-title', 'Nature of work title already exists in the organization', function(value) {
              if (!value) return true;
              const existingWork = organizationData.natureOfWork || [];
              const exists = existingWork.some((work: any) => {
                const workId = (work.id || work._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && workId === editId) return false;
                return work.natureOfWorkTitle === value;
              });
              return !exists;
            })
      }),
    natureOfWorkDescription: yup.string().optional(),
  })
}

export default function NatureOfWorkAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: NatureOfWorkFormModalProps) {
  
  const {
    post: postNatureOfWork,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Nature of work submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Nature of work submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'natureOfWork' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('natureOfWork', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.natureOfWorkCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (natureOfWorkCode: string) => {
    try {
      console.log("Deleting nature of work:", natureOfWorkCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(natureOfWorkCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postNatureOfWork(postData)

      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Nature of work deleted successfully:", natureOfWorkCode)
    } catch (error) {
      console.error("Error deleting nature of work:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<NatureOfWorkFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      natureOfWorkCode: "",
      natureOfWorkTitle: "",
      natureOfWorkDescription: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("natureOfWorkCode", editData.natureOfWorkCode || "")
      setValue("natureOfWorkTitle", editData.natureOfWorkTitle || "")
      setValue("natureOfWorkDescription", editData.natureOfWorkDescription || "")
    } else if (open && !isEditMode) {
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  const handleFormSubmit = async (data: NatureOfWorkFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing nature of work
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.natureOfWorkCode, data, organizationData)
      } else {
        // Add mode - add new nature of work
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
      postNatureOfWork(postData)

    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Nature of work updated successfully:" : "Nature of work added successfully:", data)
    } catch (error) {
      console.error("Error processing nature of work:", error)
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
        title: isEditMode ? "Edit Nature of Work" : "Add New Nature of Work",
        description: "Create a new nature of work entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Briefcase className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Nature of Work" : "Add New Nature of Work"}
                </h1>
                <p className="text-orange-100 text-sm mt-1">
                  {isEditMode ? "Update nature of work information" : "Create a new nature of work entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<NatureOfWorkFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="natureOfWorkCode">Nature of Work Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="natureOfWorkCode"
                    {...register("natureOfWorkCode")}
                    placeholder="Enter nature of work code"
                    className={errors.natureOfWorkCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.natureOfWorkCode?.message && <p className="text-sm text-red-500">{errors.natureOfWorkCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="natureOfWorkTitle">Nature of Work Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="natureOfWorkTitle"
                    {...register("natureOfWorkTitle")}
                    placeholder="Enter nature of work title"
                    className={errors.natureOfWorkTitle?.message ? 'border-red-500' : ''}
                  />
                  {errors.natureOfWorkTitle?.message && <p className="text-sm text-red-500">{errors.natureOfWorkTitle.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="natureOfWorkDescription">Description</Label>
                <Textarea
                  id="natureOfWorkDescription"
                  {...register("natureOfWorkDescription")}
                  placeholder="Enter nature of work description"
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