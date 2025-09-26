"use client"

import type React from "react"
import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { X, Clock, Settings, AlertCircle, Users, Calendar } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"

// Types
export interface ShiftData {
  id?: string
  shiftCode: string
  shiftName: string
  shiftStart: string
  shiftEnd: string
  firstHalfStart: string
  firstHalfEnd: string
  secondHalfStart: string
  secondHalfEnd: string
  lunchStart: string
  lunchEnd: string
  duration: number
  crossDay: boolean
  flexible: boolean
  flexiFullDayDuration: number
  flexiHalfDayDuration: number
  inAheadMargin: number
  inAboveMargin: number
  outAheadMargin: number
  outAboveMargin: number
  lateInAllowedTime: number
  earlyOutAllowedTime: number
  graceIn: number
  graceOut: number
  earlyOutTime: number
  minimumDurationForFullDay: number
  minimumDurationForHalfDay: number
  minimumExtraMinutesForExtraHours: number
}

type FormData = yup.InferType<yup.ObjectSchema<any>>

// Props interface
interface ShiftFormProps {
  isOpen: boolean
  onClose: () => void
  initialValues?: Partial<ShiftData>
  onSubmit: (data: ShiftData) => void
  shiftData?: { shift: ShiftData[] }
}

// Main Component
export default function ShiftForm({ isOpen, onClose, initialValues = {}, onSubmit, shiftData }: ShiftFormProps) {
  // Create validation schema with shiftData
  const createValidationSchema = () => yup.object({
    shiftCode: yup
      .string()
      .required("Shift code is required")
      .matches(/^[A-Z0-9]+$/, "Shift code must contain only uppercase letters and numbers")
      .min(3, "Shift code must be at least 3 characters")
      .max(10, "Shift code must not exceed 10 characters")
      .test("unique-shift-code", "Shift code already exists", function(value) {
        if (!value || !shiftData?.shift) return true;
        // Allow the current value in edit mode
        if (initialValues && value === initialValues.shiftCode) return true;
        const existingShiftCodes = shiftData.shift.map((s: ShiftData) => s.shiftCode);
        return !existingShiftCodes.includes(value);
      }),

    shiftName: yup
      .string()
      .required("Shift name is required")
      .min(2, "Shift name must be at least 2 characters")
      .max(50, "Shift name must not exceed 50 characters"),

    shiftStart: yup
      .string()
      .required("Shift start time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    shiftEnd: yup
      .string()
      .required("Shift end time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)")
      .test("end-after-start", "End time must be after start time", function(value) {
        const { shiftStart } = this.parent
        if (!shiftStart || !value) return true
        return value > shiftStart
      }),

    firstHalfStart: yup
      .string()
      .required("First half start time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    firstHalfEnd: yup
      .string()
      .required("First half end time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    secondHalfStart: yup
      .string()
      .required("Second half start time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    secondHalfEnd: yup
      .string()
      .required("Second half end time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    lunchStart: yup
      .string()
      .required("Lunch start time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)"),

    lunchEnd: yup
      .string()
      .required("Lunch end time is required")
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time (HH:MM)")
      .test("lunch-end-after-start", "Lunch end time must be after lunch start time", function(value) {
        const { lunchStart } = this.parent
        if (!lunchStart || !value) return true
        return value > lunchStart
      }),

    duration: yup
      .number()
      .required("Duration is required")
      .min(60, "Duration must be at least 60 minutes")
      .max(1440, "Duration cannot exceed 24 hours"),

    crossDay: yup.boolean().required("Cross day setting is required"),
    flexible: yup.boolean().required("Flexible setting is required"),

    flexiFullDayDuration: yup
      .number()
      .min(0, "Flexi full day duration cannot be negative")
      .max(1440, "Flexi full day duration cannot exceed 24 hours"),

    flexiHalfDayDuration: yup
      .number()
      .min(0, "Flexi half day duration cannot be negative")
      .max(720, "Flexi half day duration cannot exceed 12 hours"),

    inAheadMargin: yup
      .number()
      .min(0, "In ahead margin cannot be negative")
      .max(120, "In ahead margin cannot exceed 120 minutes"),

    inAboveMargin: yup
      .number()
      .min(0, "In above margin cannot be negative")
      .max(120, "In above margin cannot exceed 120 minutes"),

    outAheadMargin: yup
      .number()
      .min(0, "Out ahead margin cannot be negative")
      .max(120, "Out ahead margin cannot exceed 120 minutes"),

    outAboveMargin: yup
      .number()
      .min(0, "Out above margin cannot be negative")
      .max(120, "Out above margin cannot exceed 120 minutes"),

    lateInAllowedTime: yup
      .number()
      .min(0, "Late in allowed time cannot be negative")
      .max(120, "Late in allowed time cannot exceed 120 minutes"),

    earlyOutAllowedTime: yup
      .number()
      .min(0, "Early out allowed time cannot be negative")
      .max(120, "Early out allowed time cannot exceed 120 minutes"),

    graceIn: yup
      .number()
      .min(0, "Grace in cannot be negative")
      .max(30, "Grace in cannot exceed 30 minutes"),

    graceOut: yup
      .number()
      .min(0, "Grace out cannot be negative")
      .max(30, "Grace out cannot exceed 30 minutes"),

    earlyOutTime: yup
      .number()
      .min(0, "Early out time cannot be negative")
      .max(120, "Early out time cannot exceed 120 minutes"),

    minimumDurationForFullDay: yup
      .number()
      .min(240, "Minimum duration for full day must be at least 4 hours")
      .max(1440, "Minimum duration for full day cannot exceed 24 hours"),

    minimumDurationForHalfDay: yup
      .number()
      .min(120, "Minimum duration for half day must be at least 2 hours")
      .max(720, "Minimum duration for half day cannot exceed 12 hours"),

    minimumExtraMinutesForExtraHours: yup
      .number()
      .min(15, "Minimum extra minutes must be at least 15 minutes")
      .max(120, "Minimum extra minutes cannot exceed 120 minutes"),
  })


  

  const validationSchema = createValidationSchema()

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
      shiftCode: initialValues.shiftCode || "",
      shiftName: initialValues.shiftName || "",
      shiftStart: initialValues.shiftStart || "",
      shiftEnd: initialValues.shiftEnd || "",
      firstHalfStart: initialValues.firstHalfStart || "",
      firstHalfEnd: initialValues.firstHalfEnd || "",
      secondHalfStart: initialValues.secondHalfStart || "",
      secondHalfEnd: initialValues.secondHalfEnd || "",
      lunchStart: initialValues.lunchStart || "",
      lunchEnd: initialValues.lunchEnd || "",
      duration: initialValues.duration || 0,
      crossDay: initialValues.crossDay ?? false,
      flexible: initialValues.flexible ?? false,
      flexiFullDayDuration: initialValues.flexiFullDayDuration || 0,
      flexiHalfDayDuration: initialValues.flexiHalfDayDuration || 0,
      inAheadMargin: initialValues.inAheadMargin || 0,
      inAboveMargin: initialValues.inAboveMargin || 0,
      outAheadMargin: initialValues.outAheadMargin || 0,
      outAboveMargin: initialValues.outAboveMargin || 0,
      lateInAllowedTime: initialValues.lateInAllowedTime || 0,
      earlyOutAllowedTime: initialValues.earlyOutAllowedTime || 0,
      graceIn: initialValues.graceIn || 0,
      graceOut: initialValues.graceOut || 0,
      earlyOutTime: initialValues.earlyOutTime || 0,
      minimumDurationForFullDay: initialValues.minimumDurationForFullDay || 0,
      minimumDurationForHalfDay: initialValues.minimumDurationForHalfDay || 0,
      minimumExtraMinutesForExtraHours: initialValues.minimumExtraMinutesForExtraHours || 0,
    },
    mode: "onChange",
  })

  // Common field styles
  const fieldStyles =
    "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400"

  const fieldErrorStyles =
    "w-full h-10 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg shadow-sm transition hover:border-red-400"

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      reset({
        shiftCode: initialValues.shiftCode || "",
        shiftName: initialValues.shiftName || "",
        shiftStart: initialValues.shiftStart || "",
        shiftEnd: initialValues.shiftEnd || "",
        firstHalfStart: initialValues.firstHalfStart || "",
        firstHalfEnd: initialValues.firstHalfEnd || "",
        secondHalfStart: initialValues.secondHalfStart || "",
        secondHalfEnd: initialValues.secondHalfEnd || "",
        lunchStart: initialValues.lunchStart || "",
        lunchEnd: initialValues.lunchEnd || "",
        duration: initialValues.duration || 0,
        crossDay: initialValues.crossDay ?? false,
        flexible: initialValues.flexible ?? false,
        flexiFullDayDuration: initialValues.flexiFullDayDuration || 0,
        flexiHalfDayDuration: initialValues.flexiHalfDayDuration || 0,
        inAheadMargin: initialValues.inAheadMargin || 0,
        inAboveMargin: initialValues.inAboveMargin || 0,
        outAheadMargin: initialValues.outAheadMargin || 0,
        outAboveMargin: initialValues.outAboveMargin || 0,
        lateInAllowedTime: initialValues.lateInAllowedTime || 0,
        earlyOutAllowedTime: initialValues.earlyOutAllowedTime || 0,
        graceIn: initialValues.graceIn || 0,
        graceOut: initialValues.graceOut || 0,
        earlyOutTime: initialValues.earlyOutTime || 0,
        minimumDurationForFullDay: initialValues.minimumDurationForFullDay || 0,
        minimumDurationForHalfDay: initialValues.minimumDurationForHalfDay || 0,
        minimumExtraMinutesForExtraHours: initialValues.minimumExtraMinutesForExtraHours || 0,
      })
      clearErrors()
    }
  }, [initialValues, isOpen, reset, clearErrors])

  // Handle form submission
  const onFormSubmit = (data: FormData) => {
    const formattedData: ShiftData = {
      ...data,
      id: initialValues.id || crypto.randomUUID(),
      flexiFullDayDuration: data.flexiFullDayDuration || 0,
      flexiHalfDayDuration: data.flexiHalfDayDuration || 0,
      inAheadMargin: data.inAheadMargin || 0,
      inAboveMargin: data.inAboveMargin || 0,
      outAheadMargin: data.outAheadMargin || 0,
      outAboveMargin: data.outAboveMargin || 0,
      lateInAllowedTime: data.lateInAllowedTime || 0,
      earlyOutAllowedTime: data.earlyOutAllowedTime || 0,
      graceIn: data.graceIn || 0,
      graceOut: data.graceOut || 0,
      earlyOutTime: data.earlyOutTime || 0,
      minimumDurationForFullDay: data.minimumDurationForFullDay || 0,
      minimumDurationForHalfDay: data.minimumDurationForHalfDay || 0,
      minimumExtraMinutesForExtraHours: data.minimumExtraMinutesForExtraHours || 0,
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
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Error message component
  const ErrorMessage = ({ error }: { error?: any }) => {
    if (!error?.message) return null
    return (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle className="h-3 w-3" />
        {error.message}
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Shift Configuration
            </h2>
            <p className="text-blue-100 text-sm mt-1">Configure shift timing and attendance rules</p>
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
                  <Users className="h-5 w-5 text-blue-600" />
                  Basic Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Shift Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("shiftCode")}
                      placeholder="e.g., A001, B002"
                      className={errors.shiftCode ? fieldErrorStyles : fieldStyles}
                      readOnly={initialValues.id !== undefined} // Only read-only in edit mode
                    />
                    <ErrorMessage error={errors.shiftCode?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Shift Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("shiftName")}
                      placeholder="e.g., Morning Shift, Night Shift"
                      className={errors.shiftName ? fieldErrorStyles : fieldStyles}
                      readOnly={initialValues.id !== undefined} // Only read-only in edit mode
                    />
                    <ErrorMessage error={errors.shiftName?.message} />
                  </div>
                </div>
              </div>

              {/* Main Shift Timing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Main Shift Timing
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Shift Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("shiftStart")}
                      className={errors.shiftStart ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.shiftStart?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Shift End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("shiftEnd")}
                      className={errors.shiftEnd ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.shiftEnd?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("duration", { valueAsNumber: true })}
                      placeholder="540"
                      className={errors.duration ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.duration?.message} />
                  </div>
                </div>
              </div>

              {/* Half Day Timing Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Half Day Timing
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Half Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("firstHalfStart")}
                      className={errors.firstHalfStart ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.firstHalfStart?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Half End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("firstHalfEnd")}
                      className={errors.firstHalfEnd ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.firstHalfEnd?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Second Half Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("secondHalfStart")}
                      className={errors.secondHalfStart ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.secondHalfStart?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Second Half End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("secondHalfEnd")}
                      className={errors.secondHalfEnd ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.secondHalfEnd?.message} />
                  </div>
                </div>
              </div>

              {/* Lunch Break Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Lunch Break
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lunch Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("lunchStart")}
                      className={errors.lunchStart ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.lunchStart?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lunch End <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...register("lunchEnd")}
                      className={errors.lunchEnd ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.lunchEnd?.message} />
                  </div>
                </div>
              </div>

              {/* Shift Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Shift Settings
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Cross Day Shift</label>
                    <Controller
                      name="crossDay"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-4 h-10 items-center">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="false"
                              checked={!field.value}
                              onChange={() => field.onChange(false)}
                              className="accent-blue-600"
                            />
                            No
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="true"
                              checked={field.value}
                              onChange={() => field.onChange(true)}
                              className="accent-blue-600"
                            />
                            Yes
                          </label>
                        </div>
                      )}
                    />
                    <ErrorMessage error={errors.crossDay?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Flexible Shift</label>
                    <Controller
                      name="flexible"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-4 h-10 items-center">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="false"
                              checked={!field.value}
                              onChange={() => field.onChange(false)}
                              className="accent-blue-600"
                            />
                            No
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              value="true"
                              checked={field.value}
                              onChange={() => field.onChange(true)}
                              className="accent-blue-600"
                            />
                            Yes
                          </label>
                        </div>
                      )}
                    />
                    <ErrorMessage error={errors.flexible?.message} />
                  </div>
                </div>

                {/* Flexible Duration Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Flexi Full Day Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("flexiFullDayDuration", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.flexiFullDayDuration ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.flexiFullDayDuration?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Flexi Half Day Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register("flexiHalfDayDuration", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.flexiHalfDayDuration ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.flexiHalfDayDuration?.message} />
                  </div>
                </div>
              </div>

              {/* Margin Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Margin Settings (minutes)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">In Ahead Margin</label>
                    <input
                      type="number"
                      {...register("inAheadMargin", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.inAheadMargin ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.inAheadMargin?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">In Above Margin</label>
                    <input
                      type="number"
                      {...register("inAboveMargin", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.inAboveMargin ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.inAboveMargin?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Out Ahead Margin</label>
                    <input
                      type="number"
                      {...register("outAheadMargin", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.outAheadMargin ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.outAheadMargin?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Out Above Margin</label>
                    <input
                      type="number"
                      {...register("outAboveMargin", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.outAboveMargin ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.outAboveMargin?.message} />
                  </div>
                </div>
              </div>

              {/* Time Allowances Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Time Allowances (minutes)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Late In Allowed</label>
                    <input
                      type="number"
                      {...register("lateInAllowedTime", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.lateInAllowedTime ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.lateInAllowedTime?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Early Out Allowed</label>
                    <input
                      type="number"
                      {...register("earlyOutAllowedTime", { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.earlyOutAllowedTime ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.earlyOutAllowedTime?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Grace In</label>
                    <input
                      type="number"
                      {...register("graceIn", { valueAsNumber: true })}
                      placeholder="5"
                      className={errors.graceIn ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.graceIn?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Grace Out</label>
                    <input
                      type="number"
                      {...register("graceOut", { valueAsNumber: true })}
                      placeholder="5"
                      className={errors.graceOut ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.graceOut?.message} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Early Out Time</label>
                    <input
                      type="number"
                      {...register("earlyOutTime", { valueAsNumber: true })}
                      placeholder="10"
                      className={errors.earlyOutTime ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.earlyOutTime?.message} />
                  </div>
                </div>
              </div>

              {/* Duration Requirements Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 border-b border-blue-200 pb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Duration Requirements (minutes)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Min Duration for Full Day</label>
                    <input
                      type="number"
                      {...register("minimumDurationForFullDay", { valueAsNumber: true })}
                      placeholder="360"
                      className={errors.minimumDurationForFullDay ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.minimumDurationForFullDay?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Min Duration for Half Day</label>
                    <input
                      type="number"
                      {...register("minimumDurationForHalfDay", { valueAsNumber: true })}
                      placeholder="180"
                      className={errors.minimumDurationForHalfDay ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.minimumDurationForHalfDay?.message} />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Min Extra Minutes for Extra Hours</label>
                    <input
                      type="number"
                      {...register("minimumExtraMinutesForExtraHours", { valueAsNumber: true })}
                      placeholder="30"
                      className={errors.minimumExtraMinutesForExtraHours ? fieldErrorStyles : fieldStyles}
                    />
                    <ErrorMessage error={errors.minimumExtraMinutesForExtraHours?.message} />
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
                      <li key={field}>• {(error as any)?.message || 'Invalid field'}</li>
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
            {isSubmitting ? "Saving..." : "Save Shift"}
          </button>
        </div>
      </div>
    </div>
  )
} 