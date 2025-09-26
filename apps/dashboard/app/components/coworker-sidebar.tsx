"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Badge } from "@repo/ui/components/ui/badge"
import { Input } from "@repo/ui/components/ui/input"
import type { User, Message } from "@/types/chat"
import { Search, MessageCircle } from "lucide-react"
import { useState } from "react"

interface CoworkerSidebarProps {
  coworkers: User[]
  selectedCoworker: User | null
  onSelectCoworker: (coworker: User) => void
  messages: Record<string, Message[]>
}

export function CoworkerSidebar({ coworkers, selectedCoworker, onSelectCoworker, messages }: CoworkerSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCoworkers = coworkers.filter((coworker) =>
    coworker.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getLastMessage = (coworkerId: string) => {
    const userMessages = messages[coworkerId] || []
    return userMessages[userMessages.length - 1]
  }

  const getUnreadCount = (coworkerId: string) => {
    const userMessages = messages[coworkerId] || []
    return userMessages.filter(
      (msg) => msg.senderId === coworkerId && msg.timestamp > new Date(Date.now() - 3600000), // Messages from last hour
    ).length
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Team Members</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search coworkers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          {filteredCoworkers.map((coworker) => {
            const lastMessage = getLastMessage(coworker.id)
            const unreadCount = getUnreadCount(coworker.id)
            const isSelected = selectedCoworker?.id === coworker.id

            return (
              <button
                key={coworker.id}
                onClick={() => onSelectCoworker(coworker)}
                className={`w-full p-3 rounded-lg hover:bg-accent ${isSelected ? "bg-accent" : ""}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={coworker.avatar || "/placeholder.svg"} alt={coworker.name} />
                      <AvatarFallback>
                        {coworker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(coworker.status)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{coworker.name}</p>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">{formatTime(lastMessage.timestamp)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 capitalize">{coworker.status}</p>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {lastMessage.senderId === "current" ? "You: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
