"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Users } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect } from 'react'; 
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface EmployeeCategoryFormData {
  employeeCategoryCode?: string
  employeeCategoryName?: string
  employeeCategoryDescription?: string
}

interface EmployeeCategoryFormModalProps {
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
    employeeCategoryCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Employee category code is required")
            .test('unique-employee-category-code', 'Employee category code already exists in the organization', function(value) {
              if (!value) return true;
              const existingCategories = organizationData.employeeCategories || [];
              const exists = existingCategories.some((category: any) => {
                const categoryId = (category.id || category._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && categoryId === editId) return false;
                return category.employeeCategoryCode === value;
              });
              return !exists;
            })
      }),
    employeeCategoryName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Employee category name is required"),
        otherwise: schema =>
          schema
            .required("Employee category name is required")
            .test('unique-employee-category-name', 'Employee category name already exists in the organization', function(value) {
              if (!value) return true;
              const existingCategories = organizationData.employeeCategories || [];
              const exists = existingCategories.some((category: any) => {
                const categoryId = (category.id || category._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && categoryId === editId) return false;
                return category.employeeCategoryName === value;
              });
              return !exists;
            })
      }),
    employeeCategoryDescription: yup.string().optional(),
  })
}

export default function EmployeeCategoryAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: EmployeeCategoryFormModalProps) {
  
  const {
    post: postEmployeeCategory,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Employee category submitted successfully!");
      // onSubmit(data);
      // onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Employee category submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'employeeCategories' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('employeeCategories', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.employeeCategoryCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (employeeCategoryCode: string) => {
    try {
      console.log("Deleting employee category:", employeeCategoryCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(employeeCategoryCode, organizationData)
      
      // Call server to update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      postEmployeeCategory(postData)

      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Employee category deleted successfully:", employeeCategoryCode)
    } catch (error) {
      console.error("Error deleting employee category:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EmployeeCategoryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      employeeCategoryCode: "",
      employeeCategoryName: "",
      employeeCategoryDescription: "",
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("employeeCategoryCode", editData.employeeCategoryCode || "")
      setValue("employeeCategoryName", editData.employeeCategoryName || "")
      setValue("employeeCategoryDescription", editData.employeeCategoryDescription || "")
    } else if (open && !isEditMode) {
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  const handleFormSubmit = async (data: EmployeeCategoryFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing employee category
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.employeeCategoryCode, data, organizationData)
      } else {
        // Add mode - add new employee category
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
      postEmployeeCategory(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Employee category updated successfully:" : "Employee category added successfully:", data)
    } catch (error) {
      console.error("Error processing employee category:", error)
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
        title: isEditMode ? "Edit Employee Category" : "Add New Employee Category",
        description: "Create a new employee category entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Users className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Employee Category" : "Add New Employee Category"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  {isEditMode ? "Update employee category information" : "Create a new employee category entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<EmployeeCategoryFormData>)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCategoryCode">Employee Category Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="employeeCategoryCode"
                    {...register("employeeCategoryCode")}
                    placeholder="Enter employee category code"
                    className={errors.employeeCategoryCode?.message ? 'border-red-500' : ''}
                    disabled={isEditMode}
                  />
                  {errors.employeeCategoryCode?.message && <p className="text-sm text-red-500">{errors.employeeCategoryCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeCategoryName">Employee Category Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="employeeCategoryName"
                    {...register("employeeCategoryName")}
                    placeholder="Enter employee category name"
                    className={errors.employeeCategoryName?.message ? 'border-red-500' : ''}
                  />
                  {errors.employeeCategoryName?.message && <p className="text-sm text-red-500">{errors.employeeCategoryName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCategoryDescription">Description</Label>
                <Textarea
                  id="employeeCategoryDescription"
                  {...register("employeeCategoryDescription")}
                  placeholder="Enter employee category description"
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