"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Separator } from "@repo/ui/components/ui/separator"
import { DateRangeSection } from "./date-range-section"
import { ReportInformationSection } from "./report-information-section"
import { FormActions } from "./form-actions"
import { useFormValidation } from "@/hooks/form-handler/use-form-validation"
import { FileText } from "lucide-react"

interface FormData {
  dateRange: string
  fromDate: Date | undefined
  toDate: Date | undefined
  reportTitle: string
  extension: string
}

interface ReportFormProps {
  fromValue: any
  setFormValue: (value: any) => void
  setMessenger: (value: any) => void
  messenger: any
}

const steps = [
  { id: 1, name: "Select Report", completed: true },
  { id: 2, name: "Employee Filter", completed: true },
  { id: 3, name: "Basic Information", completed: false, current: true },
  { id: 4, name: "Preview", completed: false },
  { id: 5, name: "Report Status", completed: false },
]

export default function ReportForm({ fromValue, setFormValue, setMessenger, messenger }: ReportFormProps) {
  const [formData, setFormData] = useState<FormData>({
    dateRange: fromValue.dateRange || "custom",
    fromDate: fromValue.fromDate ? new Date(fromValue.fromDate) : undefined,
    toDate: fromValue.toDate ? new Date(fromValue.toDate) : undefined,
    reportTitle: fromValue.reportTitle || "",
    extension: fromValue.extension || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { errors, validateForm, clearError } = useFormValidation()

  // Update form data when fromValue changes
  useEffect(() => {
    console.log("ReportForm: fromValue updated", fromValue)
    setFormData({
      dateRange: fromValue.dateRange || "custom",
      fromDate: fromValue.fromDate ? new Date(fromValue.fromDate) : undefined,
      toDate: fromValue.toDate ? new Date(fromValue.toDate) : undefined,
      reportTitle: fromValue.reportTitle || "",
      extension: fromValue.extension || "",
    })
  }, [fromValue])

  const handleSubmit = async () => {
    console.log("ReportForm: handleSubmit called", formData)
    
    if (!validateForm(formData)) {
      console.log("ReportForm: Form validation failed", errors)
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare the data to be merged with existing fromValue
      const newFormData = {
        dateRange: formData.dateRange,
        fromDate: formData.fromDate?.toISOString(),
        toDate: formData.toDate?.toISOString(),
        reportTitle: formData.reportTitle,
        extension: formData.extension,
      }

      console.log("ReportForm: New form data to be merged", newFormData)

      // Update setFormValue - merge with existing values, update if same key exists
      setFormValue((prev: any) => {
        const updatedValue = {
          ...prev,
          ...newFormData
        }
        console.log("ReportForm: Updated fromValue", updatedValue)
        return updatedValue
      })

      // Update messenger to move to Preview
      setMessenger((prev: any) => {
        const updatedMessenger = {
          ...prev,
          progressbar: "Preview"
        }
        console.log("ReportForm: Updated messenger", updatedMessenger)
        return updatedMessenger
      })

      console.log("ReportForm: Form submitted successfully:", newFormData)
    } catch (error) {
      console.error("ReportForm: Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    // Go back to Employee Filter
    setMessenger((prev: any) => ({
      ...prev,
      progressbar: "Employee Filter"
    }))
  }

  const handleDateRangeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      dateRange: value,
      fromDate: value !== "custom" ? undefined : prev.fromDate,
      toDate: value !== "custom" ? undefined : prev.toDate,
    }))

    // Clear date errors when switching away from custom
    if (value !== "custom") {
      clearError("fromDate")
      clearError("toDate")
    }
  }

  const handleFromDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, fromDate: date }))
    clearError("fromDate")
  }

  const handleToDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, toDate: date }))
    clearError("toDate")
  }

  const handleReportTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, reportTitle: value }))
    clearError("reportTitle")
  }

  const handleExtensionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, extension: value }))
    clearError("extension")
  }

  return (
    <div className="w-full p-4">
      <div className="mx-auto max-w-4xl">

        <Card className="border-none">
        <CardHeader className="px-6 py-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0061ff] text-white">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900">Basic Information</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Configure your report settings and date range to generate your custom report
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-10 pt-4 ">
            <DateRangeSection
              dateRange={formData.dateRange}
              fromDate={formData.fromDate}
              toDate={formData.toDate}
              errors={{ fromDate: errors.fromDate, toDate: errors.toDate }}
              onDateRangeChange={handleDateRangeChange}
              onFromDateChange={handleFromDateChange}
              onToDateChange={handleToDateChange}
            />


            <ReportInformationSection
              reportTitle={formData.reportTitle}
              extension={formData.extension}
              errors={{ reportTitle: errors.reportTitle, extension: errors.extension }}
              onReportTitleChange={handleReportTitleChange}
              onExtensionChange={handleExtensionChange}
            />

            <FormActions isSubmitting={isSubmitting} onBack={handleBack} onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
