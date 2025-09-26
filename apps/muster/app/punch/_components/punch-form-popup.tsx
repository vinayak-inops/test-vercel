"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { X, Clock, User, MessageSquare, AlertCircle } from "lucide-react"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import toast from "react-hot-toast";

// Types
export type TypeOfMovement = string // Now regionCode
export type InOut = "In" | "Out"

export interface PunchApplication {
  employeeID: string
  attendanceDate: string
  typeOfMovement: TypeOfMovement
  punchedTime: string
  inOut: InOut
  transactionTime: string
  remarks: string
}

// No static options, will use attendanceResponse[0].region
const inOutOptions: InOut[] = ["In", "Out"]

// Validation Schema
const validationSchema = yup.object({
  employeeID: yup
    .string()
    .required("Employee ID is required")
    .matches(/^EMP\d{3}$/, "Employee ID must be in the format EMP001"),

  attendanceDate: yup
    .string()
    .required("Attendance date is required")
    .test("not-future", "Attendance date cannot be in the future", (value) => {
      if (!value) return true
      const selectedDate = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return selectedDate <= today
    })
    .test("not-too-old", "Attendance date cannot be more than 30 days old", (value) => {
      if (!value) return true
      const selectedDate = new Date(value)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return selectedDate >= thirtyDaysAgo
    }),

  typeOfMovement: yup
    .string()
    .required("Type of movement is required"),

  punchedTime: yup
    .string()
    .required("Punched time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)")
    .test("business-hours", "Punch time should be within business hours (6 AM - 10 PM)", (value) => {
      if (!value) return true
      const [hours] = value.split(":").map(Number)
      return hours >= 6 && hours <= 22
    }),

  inOut: yup.string().required("Swipe mode is required").oneOf(["In", "Out"], "Please select a valid swipe mode"),

  transactionTime: yup
    .string()
    .required("Transaction time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)")
    .test("business-hours", "Transaction time should be within business hours (6 AM - 10 PM)", (value) => {
      if (!value) return true
      const [hours] = value.split(":").map(Number)
      return hours >= 6 && hours <= 22
    }),

  remarks: yup
    .string()
    .required("Remarks are required")
    .min(10, "Remarks must be at least 10 characters")
    .max(500, "Remarks must not exceed 500 characters")
    .test("no-profanity", "Remarks contain inappropriate language", (value) => {
      if (!value) return true
      const profanityWords = ["spam", "inappropriate"] // Add your profanity list
      return !profanityWords.some((word) => value.toLowerCase().includes(word))
    }),
})

type FormData = yup.InferType<typeof validationSchema>

// Props interface
interface PunchFormPopupProps {
  isOpen: boolean
  onClose: () => void
  initialValues?: Partial<PunchApplication>
  onSubmit: (data: PunchApplication) => void
}

// Main Component
export default function PunchFormPopup({ isOpen, onClose, initialValues = {}, onSubmit }: PunchFormPopupProps) {
  const { data: session } = useSession();
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
      employeeID: initialValues.employeeID || "EMP001",
      attendanceDate: initialValues.attendanceDate || "", 
      typeOfMovement: initialValues.typeOfMovement || "",
      punchedTime: initialValues.punchedTime || "",
      inOut: initialValues.inOut || "In",
      transactionTime: initialValues.transactionTime || "",
      remarks: initialValues.remarks || "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  })

  const {
    post: postShiftZone,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "forgotPunchApplication",
    onSuccess: (data) => {
      // Show toast on success
      toast.success("Punch application submitted successfully!");
      onSubmit(data);
      onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      console.error("POST error:", error);
    },
  });

  // Common field styles for consistent height
  const fieldStyles =
    "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400"

  const fieldErrorStyles =
    "w-full h-10 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg shadow-sm transition hover:border-red-400"

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      reset({
        employeeID: initialValues.employeeID || "EMP001",
        attendanceDate: initialValues.attendanceDate || "",
        typeOfMovement: initialValues.typeOfMovement || "",
        punchedTime: initialValues.punchedTime || "",
        inOut: initialValues.inOut || "In",
        transactionTime: initialValues.transactionTime || "",
        remarks: initialValues.remarks || "",
      })
      clearErrors()
    }
  }, [initialValues, isOpen, reset, clearErrors])

  // Handle form submission
  const onFormSubmit = (data: FormData) => {
    // Helper functions for date formatting
    const pad = (n: number) => n < 10 ? `0${n}` : n;
    
    // Get current time in Indian Standard Time (IST)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const yyyy = istTime.getFullYear();
    const mm = pad(istTime.getMonth() + 1);
    const dd = pad(istTime.getDate());
    const hh = pad(istTime.getHours());
    const min = pad(istTime.getMinutes());
    const ss = pad(istTime.getSeconds());
    const ms = pad(istTime.getMilliseconds());
    
    // Convert time inputs to ISO format in Indian Standard Time (IST)
    const convertTimeToISO = (timeStr: string, dateStr: string) => {
      if (!timeStr || !dateStr) return '';
      const [hours, minutes] = timeStr.split(':');
      
      // Create date in IST timezone
      const date = new Date(dateStr + 'T' + timeStr + ':00+05:30');
      
      // Convert to ISO format but keep IST timezone
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hour = pad(date.getHours());
      const minute = pad(date.getMinutes());
      const second = pad(date.getSeconds());
      
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`; // Format: YYYY-MM-DDTHH:mm:ss
    };
    
    // Convert punched time and transaction time to ISO format
    const punchedTimeISO = convertTimeToISO(data.punchedTime, data.attendanceDate);
    const transactionTimeISO = convertTimeToISO(data.transactionTime, data.attendanceDate);
    
    // createdOn: 'YYYY-MM-DDTHH:mm:ss.sss+05:30' (IST timezone offset)
    const createdOn = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.${ms}+05:30`;
    // uploadTime: 'YYYY-MM-DDTHH:mm:ss'
    const uploadTime = `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
    // appliedDate: 'YYYY-MM-DD'
    const appliedDate = `${yyyy}-${mm}-${dd}`;
    // uploadedBy: get from token (placeholder for now)
    let uploadedBy = session?.user?.name || 'user';
    // If you have a token, extract username here
    // Example: uploadedBy = getUserFromToken();

    const formattedData: any = {
      ...data,
      punchedTime: punchedTimeISO,
      transactionTime: transactionTimeISO,
      typeOfMovement: data.typeOfMovement as TypeOfMovement,
      tenantCode: 'Midhani',
      workflowName: 'forgotPunch Application',
      stateEvent: 'NEXT',
      organizationCode: 'Midhani',
      isDeleted: false,
      workflowState: 'INITIATED',
      uploadedBy,
      createdOn,
      uploadTime,
      appliedDate,
    };
    if (typeof window !== "undefined") {
      const json = {
        tenant: "Midhani",
        action: "insert",
        id: null,
        event: "applicationtest",
        collectionName: "forgotPunchApplication",
        data: formattedData,
      }
      postShiftZone(json);
    }
    onSubmit(formattedData)
    onClose()
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

  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'organization/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ],
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: []
  });
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Extract reasonCodes from backend response
  const reasonCodes = Array.isArray(attendanceResponse) && attendanceResponse[0]?.reasonCodes
    ? attendanceResponse[0].reasonCodes
    : [];

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 -mt-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: "90vh" }}>{/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Punch Application Details
            </h2>
            <p className="text-blue-100 text-sm mt-1">Enter the details for the punch application</p>
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
              {/* Employee Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Employee Information
                </div>

                {/* Employee Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("employeeID")}
                    value={watch("employeeID")}
                    readOnly
                    className={errors.employeeID ? fieldErrorStyles : fieldStyles}
                  />
                  <ErrorMessage error={errors.employeeID?.message} />
                </div>

                {/* Row: Attendance Date, Reason Code, Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Attendance Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        {...register("attendanceDate")}
                        max={new Date().toISOString().split("T")[0]}
                        min={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                        className={errors.attendanceDate ? fieldErrorStyles : fieldStyles + " pr-10"}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                           <rect x="3" y="6" width="18" height="15" rx="2" fill="white" stroke="currentColor"/>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
                         </svg>
                       </span>
                    </div>
                    <ErrorMessage error={errors.attendanceDate?.message} />
                  </div>

                  {/* Type of Movement */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type of Movement <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="typeOfMovement"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={errors.typeOfMovement ? fieldErrorStyles : fieldStyles} disabled={isLoading || !!attendanceError}>
                          <option value="">{isLoading ? "Loading..." : attendanceError ? "Error loading reasons" : "Select a Reason"}</option>
                          {reasonCodes.map((reason: any) => (
                            <option key={reason.reasonCode} value={reason.reasonCode}>
                              {reason.reasonName}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage error={errors.typeOfMovement?.message} />
                  </div>
                </div>
              </div>

              {/* Punch Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Punch Details
                </div>

                {/* First Punch Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Punched Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("punchedTime")}
                      className={errors.punchedTime ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.punchedTime?.message} />
                    <p className="text-xs text-gray-500">Business hours: 6:00 AM - 10:00 PM</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Swipe Mode <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="inOut"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className={errors.inOut ? fieldErrorStyles : fieldStyles}>
                          <option value="">Select One</option>
                          {inOutOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    <ErrorMessage error={errors.inOut?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Transaction Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("transactionTime")}
                      className={errors.transactionTime ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.transactionTime?.message} />
                    <p className="text-xs text-gray-500">Time when transaction was processed</p>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Additional Information
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("remarks")}
                    placeholder="Enter remarks (minimum 10 characters)"
                    rows={4}
                    className={`w-full rounded-lg border ${
                      errors.remarks ? "border-red-300" : "border-gray-200"
                    } bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.remarks
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-blue-500 focus:border-blue-500"
                    } focus:shadow-lg shadow-sm resize-none transition hover:border-blue-400`}
                  />
                  <ErrorMessage error={errors.remarks?.message} />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Minimum 10 characters, maximum 500 characters</span>
                    <span className="text-xs text-gray-500">{watch("remarks")?.length || 0}/500</span>
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
            {isSubmitting ? "Saving..." : "Save Application"}
          </button>
        </div>
      </div>
    </div>
  )
}
