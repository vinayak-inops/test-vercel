"use client"

import type React from "react"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { X, Building2, Hash, FileText, MapPin, Mail, Phone, Globe, Edit3, AlertCircle } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import toast from "react-hot-toast"

// Types


// Validation Schema
const validationSchema = yup.object({
  organizationName: yup
    .string()
    .required("Organization name is required")
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must not exceed 100 characters"),

  organizationCode: yup.string(), // No validation for read-only field

  addressLine1: yup
    .string()
    .nullable()
    .max(200, "Address line 1 must not exceed 200 characters"),

  addressLine2: yup
    .string()
    .nullable()
    .max(200, "Address line 2 must not exceed 200 characters"),

  city: yup
    .string()
    .nullable()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),

  pinCode: yup
    .string()
    .nullable()
    .matches(/^\d{6}$/, "Pin code must be exactly 6 digits"),

  description: yup
    .string()
    .nullable()
    .max(500, "Description must not exceed 500 characters"),

  emailId: yup
    .string()
    .required("Email ID is required")
    .email("Please enter a valid email address"),

  contactPersonContactNumber: yup
    .string()
    .required("Contact number is required")
    .matches(/^\d{10,15}$/, "Contact number must be between 10-15 digits"),

  registrationNo: yup
    .string()
    .required("Registration number is required")
    .min(2, "Registration number must be at least 2 characters")
    .max(50, "Registration number must not exceed 50 characters"),

  tenantCode: yup.string(), // No validation for read-only field

  isActive: yup
    .number()
    .required("Active status is required")
    .oneOf([0, 1], "Active status must be either 0 or 1"),

  firstMonthOfFinancialYear: yup
    .number()
    .required("First month of financial year is required")
    .min(1, "First month must be at least 1")
    .max(12, "First month must not exceed 12"),
})

type FormData = yup.InferType<typeof validationSchema>

// Props interface
interface OrganizationEditFormProps {
  isOpen: boolean
  onClose: () => void
  initialValues?: Partial<any>
  onSubmit: (data: any) => void
}

// Main Component
export default function OrganizationEditForm({ isOpen, onClose, initialValues = {}, onSubmit }: OrganizationEditFormProps) {
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
    clearErrors,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      organizationName: initialValues.organizationName || "",
      organizationCode: initialValues.organizationCode || "",
      addressLine1: initialValues.addressLine1 || "",
      addressLine2: initialValues.addressLine2 || "",
      city: initialValues.city || "",
      pinCode: initialValues.pinCode || "",
      description: initialValues.description || "",
      emailId: initialValues.emailId || "",
      contactPersonContactNumber: initialValues.contactPersonContactNumber || "",
      registrationNo: initialValues.registrationNo || "",
      tenantCode: initialValues.tenantCode || "",
      isActive: initialValues.isActive ?? 1,
      firstMonthOfFinancialYear: initialValues.firstMonthOfFinancialYear ?? 1,
    },
    mode: "onChange", // Validate on change for real-time feedback
  })

  const {
    post: postOrganization,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      // Show alert on successful storage
      alert("✅ Organization information successfully stored in backend!");
      
      // Show toast on success
      toast.success("Organization information updated successfully!");
      onSubmit(data);
      onClose();
    },
    onError: (error) => {
      // Show error alert
      alert("❌ Failed to store organization information in backend!");
      
      // Show error toast
      toast.error("Failed to update organization information");
      console.error("POST error:", error);
    },
  });


  console.log("initialValues", initialValues);
  // Common field styles for consistent height
  const fieldStyles =
    "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400"

  const fieldErrorStyles =
    "w-full h-10 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg shadow-sm transition hover:border-red-400"

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      reset({
        organizationName: initialValues.organizationName || "",
        organizationCode: initialValues.organizationCode || "",
        addressLine1: initialValues.addressLine1 || "",
        addressLine2: initialValues.addressLine2 || "",
        city: initialValues.city || "",
        pinCode: initialValues.pinCode || "",
        description: initialValues.description || "",
        emailId: initialValues.emailId || "",
        contactPersonContactNumber: initialValues.contactPersonContactNumber || "",
        registrationNo: initialValues.registrationNo || "",
        tenantCode: initialValues.tenantCode || "",
        isActive: initialValues.isActive ?? 1,
        firstMonthOfFinancialYear: initialValues.firstMonthOfFinancialYear ?? 1,
      })
      clearErrors()
    }
  }, [initialValues, isOpen, reset, clearErrors])

  // Handle form submission
  const onFormSubmit = (data: FormData) => {
    // Show alert with form values
    const alertMessage = `
Organization Information:
- Organization Name: ${data.organizationName}
- Organization Code: ${data.organizationCode}
- Registration Number: ${data.registrationNo}
- Tenant Code: ${data.tenantCode}
- Description: ${data.description}
- Email ID: ${data.emailId}
- Contact Number: ${data.contactPersonContactNumber}
- Address Line 1: ${data.addressLine1 || 'Not provided'}
- Address Line 2: ${data.addressLine2 || 'Not provided'}
- City: ${data.city}
- Pin Code: ${data.pinCode}
- Active Status: ${data.isActive === 1 ? 'Active' : 'Inactive'}
- Financial Year Start: Month ${data.firstMonthOfFinancialYear}
    `.trim();
    console.log("data organization", data);
    // alert(data);

    const formattedData: any = {
        ...initialValues,
        ...data,
    };

    console.log("formattedData", formattedData);

    if (typeof window !== "undefined") {
      const json = {
        tenant: "Midhani",
        action: "insert",
        collectionName: "organization",
        id: initialValues._id,
        data: formattedData,
      }
      postOrganization(json);
    }
  }

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden" // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Error message component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </div>
    )
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 -mt-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Edit Organization Information
            </h2>
            <p className="text-blue-100 text-sm mt-1">Update the organization details</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Basic Information
                </div>

                {/* Organization Name and Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("organizationName")}
                      placeholder="Enter organization name"
                      className={errors.organizationName ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.organizationName?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Organization Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("organizationCode")}
                      placeholder="Enter organization code"
                      className={errors.organizationCode ? fieldErrorStyles : fieldStyles}
                      readOnly
                      disabled
                    />
                    <ErrorMessage error={errors.organizationCode?.message} />
                  </div>
                </div>

                {/* Registration Number and Tenant Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("registrationNo")}
                      placeholder="Enter registration number"
                      className={errors.registrationNo ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.registrationNo?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tenant Code <span className="text-red-500">*</span>
                    </label>
                                         <input
                       {...register("tenantCode")}
                       placeholder="Enter tenant code"
                       className={errors.tenantCode ? fieldErrorStyles : fieldStyles}
                       readOnly
                       disabled
                     />
                    <ErrorMessage error={errors.tenantCode?.message} />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Enter organization description (optional)"
                    rows={3}
                    className={`w-full rounded-lg border ${
                      errors.description ? "border-red-300" : "border-gray-200"
                    } bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.description
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    } focus:shadow-lg shadow-sm resize-none transition hover:border-blue-400`}
                  />
                  <ErrorMessage error={errors.description?.message} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Maximum 500 characters</span>
                    <span className="text-xs text-gray-500">{watch("description")?.length || 0}/500</span>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Information
                </div>

                {/* Email and Contact Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("emailId")}
                      type="email"
                      placeholder="Enter email address"
                      className={errors.emailId ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.emailId?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("contactPersonContactNumber")}
                      placeholder="Enter contact number"
                      className={errors.contactPersonContactNumber ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.contactPersonContactNumber?.message} />
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Address Information
                </div>

                {/* Address Lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Address Line 1
                    </label>
                    <input
                      {...register("addressLine1")}
                      placeholder="Enter address line 1"
                      className={errors.addressLine1 ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.addressLine1?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      {...register("addressLine2")}
                      placeholder="Enter address line 2"
                      className={errors.addressLine2 ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.addressLine2?.message} />
                  </div>
                </div>

                {/* City and Pin Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      {...register("city")}
                      placeholder="Enter city"
                      className={errors.city ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.city?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Pin Code
                    </label>
                    <input
                      {...register("pinCode")}
                      placeholder="Enter 6-digit pin code"
                      maxLength={6}
                      className={errors.pinCode ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.pinCode?.message} />
                  </div>
                </div>
              </div>

              {/* System Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Hash className="h-5 w-5 text-blue-600" />
                  System Information
                </div>

                {/* Active Status and Financial Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Active Status <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={errors.isActive ? fieldErrorStyles : fieldStyles}>
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      )}
                    />
                    <ErrorMessage error={errors.isActive?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Month of Financial Year <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="firstMonthOfFinancialYear"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={errors.firstMonthOfFinancialYear ? fieldErrorStyles : fieldStyles}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <option key={month} value={month}>
                              {new Date(2024, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage error={errors.firstMonthOfFinancialYear?.message} />
                  </div>
                </div>
              </div>

              {/* Form Status */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Please fix the following errors:
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>• {error?.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom padding for scroll */}
              <div className="pb-4"></div>
            </form>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 flex-shrink-0 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 h-10 rounded-md font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onFormSubmit)}
            disabled={isSubmitting || !isDirty}
            className="px-6 py-2 h-10 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating..." : "Update Organization"}
          </button>
        </div>
      </div>
    </div>
  )
} 