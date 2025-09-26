"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@repo/ui/components/ui/sidebar"
import { CoworkerSidebar } from "./coworker-sidebar"
import { ChatInterface } from "./chat-interface"
import type { User, Message } from "@/types/chat"

// Mock data for coworkers
const mockCoworkers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    lastSeen: new Date(Date.now() - 300000),
  },
  {
    id: "3",
    name: "Carol Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastSeen: new Date(),
  },
  {
    id: "4",
    name: "David Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000),
  },
  {
    id: "5",
    name: "Emma Brown",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastSeen: new Date(),
  },
]

// Mock messages data
const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      receiverId: "current",
      content: "Hey! How are you doing?",
      timestamp: new Date(Date.now() - 3600000),
      type: "text",
    },
    {
      id: "2",
      senderId: "current",
      receiverId: "1",
      content: "Hi Alice! I'm doing great, thanks for asking!",
      timestamp: new Date(Date.now() - 3500000),
      type: "text",
    },
    {
      id: "3",
      senderId: "1",
      receiverId: "current",
      content: "That's wonderful to hear! Are you free for a quick call later?",
      timestamp: new Date(Date.now() - 3000000),
      type: "text",
    },
  ],
  "2": [
    {
      id: "4",
      senderId: "current",
      receiverId: "2",
      content: "Hi Bob, did you finish the project review?",
      timestamp: new Date(Date.now() - 7200000),
      type: "text",
    },
    {
      id: "5",
      senderId: "2",
      receiverId: "current",
      content: "Yes, I sent the feedback via email. Check it out!",
      timestamp: new Date(Date.now() - 7000000),
      type: "text",
    },
  ],
  "3": [
    {
      id: "6",
      senderId: "3",
      receiverId: "current",
      content: "Good morning! Ready for today's standup?",
      timestamp: new Date(Date.now() - 1800000),
      type: "text",
    },
  ],
}

export function ChatDashboard() {
  const [selectedCoworker, setSelectedCoworker] = useState<User | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages)
  const [coworkers, setCoworkers] = useState<User[]>(mockCoworkers)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update user statuses
      setCoworkers((prev) =>
        prev.map((user) => ({
          ...user,
          status: Math.random() > 0.8 ? (user.status === "online" ? "away" : "online") : user.status,
        })),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = (content: string) => {
    if (!selectedCoworker) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current",
      receiverId: selectedCoworker.id,
      content,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => ({
      ...prev,
      [selectedCoworker.id]: [...(prev[selectedCoworker.id] || []), newMessage],
    }))

    // Simulate receiving a response after a delay
    setTimeout(
      () => {
        const responses = [
          "Thanks for the message!",
          "Got it, will get back to you soon.",
          "Sounds good!",
          "Let me check on that.",
          "Perfect, thanks!",
        ]

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedCoworker.id,
          receiverId: "current",
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: "text",
        }

        setMessages((prev) => ({
          ...prev,
          [selectedCoworker.id]: [...(prev[selectedCoworker.id] || []), responseMessage],
        }))
      },
      1000 + Math.random() * 2000,
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <CoworkerSidebar
          coworkers={coworkers}
          selectedCoworker={selectedCoworker}
          onSelectCoworker={setSelectedCoworker}
          messages={messages}
        />
        <main className="flex-1 flex flex-col">
          <div className="border-b p-4 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Team Chat</h1>
          </div>
          <div className="flex-1">
            <ChatInterface
              selectedCoworker={selectedCoworker}
              messages={messages[selectedCoworker?.id || ""] || []}
              onSendMessage={handleSendMessage}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
