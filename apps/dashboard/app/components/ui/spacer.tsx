import { cn } from "@repo/ui/lib/utils"

interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Spacer({ size = "md", className }: SpacerProps) {
  const sizeClasses = {
    xs: "h-2",
    sm: "h-4",
    md: "h-6",
    lg: "h-8",
    xl: "h-12",
  }

  return <div className={cn(sizeClasses[size], className)} />
}
