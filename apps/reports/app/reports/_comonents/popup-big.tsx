
"use client"

import { useState } from "react"
import { ChevronDown, MoreHorizontal, Plus, Star } from "lucide-react"
import PopupTable from "./popup-table"

export default function BigPopupWrapper({setOpen}:any) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open Popup
        </button>
      </div>
    )
  }

  return (
    <div className="fixed z-[100] h-full inset-0 flex items-center justify-center bg-black/20 ">
      <div className="w-[1000px] h-[80%] relative rounded-lg bg-white shadow-xl ">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-2">
          <div className="flex items-center gap-2">
            {/* <button className="rounded p-1 hover:bg-gray-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button> */}
            <div className="flex items-center gap-1 text-sm">
              {/* <span className="text-gray-500">Add to</span> */}
              <div className="flex items-center font-medium">
                <span>Select In Group</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded px-2 py-1 text-sm hover:bg-gray-100">Share</button>
            <button className="rounded p-1 hover:bg-gray-100">
              <Star className="h-4 w-4 text-gray-500" />
            </button>
            <button className="rounded p-1 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <PopupTable setOpen={setOpen}/>
      </div>

      {/* Close button (outside modal) */}
      {/* <button
        onClick={() => setIsOpen(false)}
        className="absolute right-4 top-4 rounded-full bg-white p-2 text-gray-500 shadow-md hover:bg-gray-100"
      >
        &times;
      </button> */}
    </div>
  )
}
