"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

import type { User, Message } from "@/types/chat"
import { Send, Phone, Video, MoreVertical } from "lucide-react"
import { ScrollArea } from "@radix-ui/react-scroll-area"

interface ChatInterfaceProps {
  selectedCoworker: User | null
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function ChatInterface({ selectedCoworker, messages, onSendMessage }: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && selectedCoworker) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatMessageDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (!selectedCoworker) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a coworker to start chatting</h3>
          <p className="text-gray-500">Choose someone from the sidebar to begin your conversation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedCoworker.avatar || "/placeholder.svg"} alt={selectedCoworker.name} />
            <AvatarFallback>
              {selectedCoworker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{selectedCoworker.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{selectedCoworker.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === "current"
            const showDate =
              index === 0 || formatMessageDate(message.timestamp) !== formatMessageDate(messages[index - 1].timestamp)

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatMessageDate(message.timestamp)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-end gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedCoworker.avatar || "/placeholder.svg"} alt={selectedCoworker.name} />
                        <AvatarFallback className="text-xs">
                          {selectedCoworker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedCoworker.name}...`}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
