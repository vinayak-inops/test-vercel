"use client"

import { cn } from "@repo/ui/lib/utils"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"

interface ReportInformationSectionProps {
  reportTitle: string
  extension: string
  errors: {
    reportTitle?: string
    extension?: string
  }
  onReportTitleChange: (value: string) => void
  onExtensionChange: (value: string) => void
}

const extensionOptions = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (XLSX)" },
  { value: "csv", label: "CSV" },
  { value: "docx", label: "Word (DOCX)" },
]

export function ReportInformationSection({
  reportTitle,
  extension,
  errors,
  onReportTitleChange,
  onExtensionChange,
}: ReportInformationSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-title" className="text-sm font-medium">
              Report Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="report-title"
              placeholder="Enter report title"
              value={reportTitle}
              onChange={(e) => onReportTitleChange(e.target.value)}
              className={cn(errors.reportTitle && "border-red-500")}
            />
            {errors.reportTitle && <p className="text-sm text-red-500">{errors.reportTitle}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="extension" className="text-sm font-medium">
              File Format <span className="text-red-500">*</span>
            </Label>
            <Select value={extension} onValueChange={onExtensionChange}>
              <SelectTrigger className={cn(errors.extension && "border-red-500")}>
                <SelectValue placeholder="Select file format" />
              </SelectTrigger>
              <SelectContent>
                {extensionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.extension && <p className="text-sm text-red-500">{errors.extension}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
