"use client"

import { Button } from "@repo/ui/components/ui/button"

interface FormActionsProps {
  isSubmitting: boolean
  onBack: () => void
  onSubmit: () => void
}

export function FormActions({ isSubmitting, onBack, onSubmit }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-6">
      <Button variant="outline" size="lg" onClick={onBack}>
        Back
      </Button>
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="min-w-[140px] bg-[#0061ff] hover:bg-[#0052d9] text-white"
      >
        {isSubmitting ? "Processing..." : "Save and Continue"}
      </Button>
    </div>
  )
}
