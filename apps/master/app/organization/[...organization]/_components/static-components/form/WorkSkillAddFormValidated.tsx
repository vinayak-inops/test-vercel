"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Award } from "lucide-react"
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

interface WorkSkillFormData {
  workSkillCode?: string
  workSkillTitle?: string
  workSkillDescription?: string
}

interface WorkSkillFormModalProps {
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
    workSkillCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Work skill code is required")
            .test('unique-work-skill-code', 'Work skill code already exists in the organization', function(value) {
              if (!value) return true;
              const existingSkills = organizationData.workSkill || [];
              const exists = existingSkills.some((skill: any) => {
                const skillId = (skill.id || skill._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && skillId === editId) return false;
                return skill.workSkillCode === value;
              });
              return !exists;
            })
      }),
    workSkillTitle: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Work skill title is required"),
        otherwise: schema =>
          schema
            .required("Work skill title is required")
            .test('unique-work-skill-title', 'Work skill title already exists in the organization', function(value) {
              if (!value) return true;
              const existingSkills = organizationData.workSkill || [];
              const exists = existingSkills.some((skill: any) => {
                const skillId = (skill.id || skill._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && skillId === editId) return false;
                return skill.workSkillTitle === value;
              });
              return !exists;
            })
      }),
    workSkillDescription: yup.string().optional(),
  })
}

export default function WorkSkillAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: WorkSkillFormModalProps) {
  
  const {
    post: postWorkSkill,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Work Skill submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Grade submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'workSkill' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('workSkill', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.workSkillCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (workSkillCode: string) => {
    try {
      console.log("Deleting work skill:", workSkillCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(workSkillCode, organizationData)
      
      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postWorkSkill(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Work skill deleted successfully:", workSkillCode)
    } catch (error) {
      console.error("Error deleting work skill:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<WorkSkillFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      workSkillCode: "",
      workSkillTitle: "",
      workSkillDescription: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("workSkillCode", editData.workSkillCode || "")
      setValue("workSkillTitle", editData.workSkillTitle || "")
      setValue("workSkillDescription", editData.workSkillDescription || "")
    } else if (open && !isEditMode) {
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  const handleFormSubmit = async (data: WorkSkillFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing work skill
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.workSkillCode, data, organizationData)
      } else {
        // Add mode - add new work skill
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
      postWorkSkill(postData) 
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Work skill updated successfully:" : "Work skill added successfully:", data)
    } catch (error) {
      console.error("Error processing work skill:", error)
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
        title: isEditMode ? "Edit Work Skill" : "Add New Work Skill",
        description: "Create a new work skill entry with detailed information"
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
                  {isEditMode ? "Edit Work Skill" : "Add New Work Skill"}
                </h1>
                <p className="text-yellow-100 text-sm mt-1">
                  {isEditMode ? "Update work skill information" : "Create a new work skill entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<WorkSkillFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workSkillCode">Work Skill Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="workSkillCode"
                    {...register("workSkillCode")}
                    placeholder="Enter work skill code"
                    className={errors.workSkillCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.workSkillCode?.message && <p className="text-sm text-red-500">{errors.workSkillCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workSkillTitle">Work Skill Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="workSkillTitle"
                    {...register("workSkillTitle")}
                    placeholder="Enter work skill title"
                    className={errors.workSkillTitle?.message ? 'border-red-500' : ''}
                  />
                  {errors.workSkillTitle?.message && <p className="text-sm text-red-500">{errors.workSkillTitle.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workSkillDescription">Description</Label>
                <Textarea
                  id="workSkillDescription"
                  {...register("workSkillDescription")}
                  placeholder="Enter work skill description"
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