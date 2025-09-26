import type React from "react"
import { Bell, Cake, Glasses, UserMinus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ShoppingCart, CheckCircle, BarChart3, MessageSquare, AlertCircle } from "lucide-react"

export default function NotificationDropdown() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full border-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
            4
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="rounded-md shadow-lg">
          <div className="p-4 space-y-4">
            <NotificationItem
              icon={<UserPlus className="h-5 w-5 text-gray-600" />}
              title="New employees"
              description="You have 3 new orders."
              onClick={() => console.log("Navigate to orders")}
            />
            <NotificationItem
              icon={<UserMinus className="h-5 w-5 text-gray-600" />}
              title="Left employees"
              description="Funds are on their way."
              onClick={() => console.log("Navigate to orders")}
            />
            <NotificationItem
              icon={<Cake className="h-5 w-5 text-gray-600" />}
              title="Birthday employees"
              description="New reports are ready."
              onClick={() => console.log("Navigate to orders")}
            />
            <NotificationItem
              icon={<Glasses className="h-5 w-5 text-gray-600" />}
              title="Retirement employees"
              description="2 new comments."
              onClick={() => console.log("Navigate to orders")}
            />
          
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface NotificationItemProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick?: () => void
  }
  
  function NotificationItem({ icon, title, description, onClick }: NotificationItemProps) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start p-2 h-auto hover:bg-gray-50 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start space-x-4 w-full">
          <div className="mt-0.5">{icon}</div>
          <div className="text-left">
            <h4 className="font-medium text-gray-800">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </Button>
    )
  }
  
