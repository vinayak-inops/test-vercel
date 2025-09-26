"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Award, X } from "lucide-react"
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

interface SkillLevelsFormData {
  skilledLevelTitle?: string
  skilledLevelDescription?: string
}

interface SkillLevelsFormModalProps {
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
    skilledLevelTitle: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Skill level title is required"),
        otherwise: schema =>
          schema
            .required("Skill level title is required")
            .test('unique-skill-level-title', 'Skill level title already exists in the organization', function(value) {
              if (!value) return true;
              const existingSkillLevels = organizationData.skillLevels || [];
              const exists = existingSkillLevels.some((skill: any) => {
                const skillId = (skill.id || skill._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && skillId === editId) return false;
                return skill.skilledLevelTitle === value;
              });
              return !exists;
            })
      }),
    skilledLevelDescription: yup.string().optional(),
  })
}

export default function SkillLevelsAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: SkillLevelsFormModalProps) {
  
  const {
    post: postSkillLevels,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Skill level submitted successfully!");
      setOpen(false)
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error) => {
      console.error("Error submitting skill level:", error)
      toast.error("Failed to submit skill level. Please try again.")
    }
  })

  const { addCategoryItem, updateCategoryItem, deleteCategoryItem } = useOrganizationCrud('skillLevels', organizationData)
  const { token } = useAuthToken()

  const schema = createSchema(organizationData, isEditMode || false, editData)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SkillLevelsFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      skilledLevelTitle: "",
      skilledLevelDescription: "",
    }
  })

  // Watch form values
  const watchedValues = watch()

  // Handle form submission
  const handleFormSubmit: SubmitHandler<SkillLevelsFormData> = async (data) => {
    try {
      console.log("Form data:", data)
      
      let updatedData
      if (isEditMode && editData) {
        // Update existing skill level
        updatedData = updateCategoryItem(editData.skilledLevelTitle, data, organizationData)
        console.log("Updated skill level:", updatedData)
      } else {
        // Add new skill level
        updatedData = addCategoryItem(data, organizationData)
        console.log("Added skill level:", updatedData)
      }

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postSkillLevels(postData)
      
      if (onSuccess) {
        onSuccess(updatedData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      reset()
      setOpen(false)
    } catch (error) {
      console.error("Error processing skill level:", error)
      toast.error("Failed to process skill level. Please try again.")
    }
  }

  // Handle delete item
  const handleDeleteItem = async (skilledLevelTitle: string) => {
    try {
      console.log("Deleting skill level:", skilledLevelTitle)
      
      const updatedData = deleteCategoryItem(skilledLevelTitle, organizationData)
      console.log("Deleted skill level:", updatedData)

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postSkillLevels(postData)
      
      if (onSuccess) {
        onSuccess(updatedData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      console.log("Skill level deleted successfully:", skilledLevelTitle)
    } catch (error) {
      console.error("Error deleting skill level:", error)
      toast.error("Failed to delete skill level. Please try again.")
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
      setValue("skilledLevelTitle", editData.skilledLevelTitle || "")
      setValue("skilledLevelDescription", editData.skilledLevelDescription || "")
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  // Handle delete button click
  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.skilledLevelTitle)
    }
  }, [deleteValue])

  return (
    <SemiPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: isEditMode ? "Edit Skill Level" : "Add New Skill Level",
        description: "Create a new skill level entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Award className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Skill Level" : "Add New Skill Level"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update skill level information" : "Create a new skill level entry with detailed information"}
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skilledLevelTitle">Skill Level Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="skilledLevelTitle"
                    placeholder="Enter skill level title"
                    {...register("skilledLevelTitle")}
                    className={errors.skilledLevelTitle ? "border-red-500" : ""}
                  />
                  {errors.skilledLevelTitle && (
                    <p className="text-sm text-red-500">{errors.skilledLevelTitle.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skilledLevelDescription">Description</Label>
                  <Textarea
                    id="skilledLevelDescription"
                    placeholder="Enter skill level description"
                    rows={3}
                    {...register("skilledLevelDescription")}
                    className={errors.skilledLevelDescription ? "border-red-500" : ""}
                  />
                  {errors.skilledLevelDescription && (
                    <p className="text-sm text-red-500">{errors.skilledLevelDescription.message}</p>
                  )}
                </div>
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