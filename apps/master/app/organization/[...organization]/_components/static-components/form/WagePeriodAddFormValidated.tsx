"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Calendar } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect, useState } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface WagePeriodFormData {
  employeeCategoryCode?: string
  employeeCategoryName: string
  from: number
  to: number
}

interface WagePeriodFormModalProps {
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
            .test('unique-wage-period', 'Wage period for this employee category already exists', function(value) {
              if (!value) return true;
              const existingWagePeriods = organizationData.wagePeriod || [];
              const exists = existingWagePeriods.some((period: any) => {
                const periodId = (period.id || period._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && periodId === editId) return false;
                return period.employeeCategory?.employeeCategoryCode === value;
              });
              return !exists;
            })
      }),
    employeeCategoryName: yup.string().required("Employee category name is required"),
    from: yup
      .number()
      .typeError("From must be a number")
      .required("From is required")
      .min(1, "From must be at least 1")
      .max(31, "From must be at most 31"),
    to: yup
      .number()
      .typeError("To must be a number")
      .required("To is required")
      .min(1, "To must be at least 1")
      .max(31, "To must be at most 31"),
  })
}

export default function WagePeriodAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: WagePeriodFormModalProps) {
  
  const {
    post: postWagePeriod,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      // Show toast on success
      toast.success("Wage period submitted successfully!");
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      toast.error("Wage period submission failed!");
      console.error("POST error:", error);
    },
  });

  // Use the dynamic CRUD hook for 'wagePeriod' category
  const { addCategoryItem, updateCategoryItem, organizationData: crudData, deleteCategoryItem } = useOrganizationCrud('wagePeriod', organizationData)
  
  const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
  
  // Get employee category options from organization data
  const employeeCategoryOptions = (organizationData.employeeCategories || []).map((category: any) => ({
    label: `${category.employeeCategoryName} (${category.employeeCategoryCode})`,
    value: category.employeeCategoryCode
  }))
  
  // Create dynamic schema based on current organization data
  const schema = createSchema(organizationData, isEditMode || false, editData)

  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.employeeCategoryCode)
    }
  }, [deleteValue])

  const handleDeleteItem = async (employeeCategoryCode: string) => {
    try {
      console.log("Deleting wage period:", employeeCategoryCode)
      
      // Delete from local state
      const updatedData = deleteCategoryItem(employeeCategoryCode, organizationData)
      
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }
      await postWagePeriod(postData)
      
      // Call success callback to update parent state
      if (onSuccess) {
        onSuccess(updatedData)
      }

      // Trigger server refresh
      if (onServerUpdate) {
        await onServerUpdate()
      }

      console.log("Wage period deleted successfully:", employeeCategoryCode)
    } catch (error) {
      console.error("Error deleting wage period:", error)
    }
  }
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<WagePeriodFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      employeeCategoryCode: "",
      employeeCategoryName: "",
      from: undefined,
      to: undefined,
    },
  })

  // Populate form with edit data when in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("employeeCategoryCode", editData.employeeCategoryCode || "")
      setValue("employeeCategoryName", editData.employeeCategoryName || "")
      setValue("from", editData.fromDay || undefined)
      setValue("to", editData.toDay || undefined)
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  // Handle employee category selection
  const handleEmployeeCategorySelect = (employeeCategoryCode: string) => {
    const selectedCategory = organizationData.employeeCategories?.find((cat: any) => cat.employeeCategoryCode === employeeCategoryCode)
    setValue("employeeCategoryCode", employeeCategoryCode)
    setValue("employeeCategoryName", selectedCategory?.employeeCategoryName || "")
  }

  const handleFormSubmit = async (data: WagePeriodFormData) => {
    console.log("data", data)
    try {
      console.log("Form data:", data)
      console.log("Mode:", isEditMode ? "Edit" : "Add")
      
      // Transform data to match the expected structure
      const transformedData = {
        employeeCategory: {
          employeeCategoryCode: data.employeeCategoryCode,
          employeeCategoryName: data.employeeCategoryName
        },
        wagePeriod: {
          from: data.from,
          to: data.to
        }
      }
      
      let updatedData;
      
      if (isEditMode && editData) {
        // Edit mode - update existing wage period
        console.log("editData", editData)
        updatedData = updateCategoryItem(editData.employeeCategoryCode, transformedData, organizationData)
      } else {
        // Add mode - add new wage period
        updatedData = addCategoryItem(transformedData, organizationData)
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
      await postWagePeriod(postData)
    
    if (onSuccess) {
      onSuccess(updatedData)
    }

    if (onServerUpdate) {
      await onServerUpdate()
    }
    
    reset()
    setOpen(false)
    
    console.log(isEditMode ? "Wage period updated successfully:" : "Wage period added successfully:", data)
    } catch (error) {
      console.error("Error processing wage period:", error)
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
        title: isEditMode ? "Edit Wage Period" : "Add New Wage Period",
        description: "Create a new wage period entry with detailed information"
      }}
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Header - Matching EnhancedHeader Design */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
          <div className="group cursor-default pl-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                  <Calendar className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  {isEditMode ? "Edit Wage Period" : "Add New Wage Period"}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {isEditMode ? "Update wage period information" : "Create a new wage period entry with detailed information"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(handleFormSubmit as SubmitHandler<WagePeriodFormData>)} className="space-y-6">
            {/* Employee Category Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Employee Category</h3>
              <div className="space-y-2">
                <Label>Employee Category</Label>
                <Select onValueChange={handleEmployeeCategorySelect} value={watch('employeeCategoryCode')} disabled={isEditMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee category" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeCategoryOptions.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeCategoryCode?.message && <p className="text-sm text-red-500">{errors.employeeCategoryCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCategoryName">Employee Category Name</Label>
                <Input
                  id="employeeCategoryName"
                  {...register("employeeCategoryName")}
                  placeholder="Employee category name"
                  className={errors.employeeCategoryName?.message ? 'border-red-500' : ''}
                  readOnly
                />
                {errors.employeeCategoryName?.message && <p className="text-sm text-red-500">{errors.employeeCategoryName.message}</p>}
              </div>
            </div>

            <Separator />

            {/* Wage Period Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Wage Period</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From (Day)</Label>
                  <Input
                    id="from"
                    type="number"
                    {...register("from", { valueAsNumber: true })}
                    placeholder="Enter from day (1-31)"
                    min="1"
                    max="31"
                    className={errors.from?.message ? 'border-red-500' : ''}
                  />
                  {errors.from?.message && <p className="text-sm text-red-500">{errors.from.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To (Day)</Label>
                  <Input
                    id="to"
                    type="number"
                    {...register("to", { valueAsNumber: true })}
                    placeholder="Enter to day (1-31)"
                    min="1"
                    max="31"
                    className={errors.to?.message ? 'border-red-500' : ''}
                  />
                  {errors.to?.message && <p className="text-sm text-red-500">{errors.to.message}</p>}
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