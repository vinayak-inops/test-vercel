"use client"

import type React from "react"

import { useState, useRef, Dispatch, SetStateAction } from "react"
import { Search, Upload, X, ChevronDown, FileText, ImageIcon, Video, FileIcon } from "lucide-react"

import { Button } from "@repo/ui/components/ui/button"
import { Progress } from "@repo/ui/components/ui/progress"

export default function FileDashboard({setOpen}:{setOpen:Dispatch<SetStateAction<boolean>>}) {
  const [uploadProgress, setUploadProgress] = useState(40)
  const [showUploadProgress, setShowUploadProgress] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setShowUploadProgress(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 500)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      setShowUploadProgress(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 500)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      {/* <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="text-muted-foreground hover:text-foreground cursor-pointer">Projects</div>
        <div className="text-muted-foreground hover:text-foreground cursor-pointer">Dashboard 2.0</div>
        <div className="font-medium">File and assets</div>
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {/* <h1 className="text-2xl font-semibold mb-1">Files and assets</h1>
          <p className="text-muted-foreground text-sm">
            Documents and attachments that have been uploaded as part of this project.
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 px-3 text-sm font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </Button> */}
          <Button
          onClick={()=>{
            setOpen(true)
          }}
            size="sm"
            className="flex items-center gap-2 h-9 px-3 text-sm font-medium bg-black text-white hover:bg-black/90"
          >
            <span className="text-sm font-bold">+</span> Upload New File
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      {/* <div
        className="border border-dashed rounded-lg p-10 mb-6 flex flex-col items-center justify-center text-center cursor-pointer"
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} multiple />
        <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center mb-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm mb-1">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground">Maximum file size 50 MB</p>


        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Dashboard prototype recording 01.mp4
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Dashboard prototype recording 02.mp4
          </div>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Dashboard prototype recording 03.mp4
          </div>
        </div>
      </div> */}

      {/* Upload Progress */}
      {/* {showUploadProgress && (
        <div className="border rounded-lg p-4 mb-6 relative">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Dashboard prototype recording 01.mp4</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
          <button className="absolute right-3 top-3" onClick={() => setShowUploadProgress(false)}>
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )} */}

      {/* Attached Files Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-1">Attached files</h2>
        <p className="text-sm text-muted-foreground mb-4">Files and assets that have been attached to this project.</p>

        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "all" ? "border-b-2 border-black" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("all")}
            >
              View all
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "your" ? "border-b-2 border-black" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("your")}
            >
              Your files
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${activeTab === "shared" ? "border-b-2 border-black" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("shared")}
            >
              Shared files
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="border rounded-md px-3 py-1.5 text-sm flex items-center gap-1 cursor-pointer">
              Jan 1 - Jan 30 <ChevronDown className="h-3 w-3 ml-1" />
            </div>
            <div className="border rounded-md px-3 py-1.5 text-sm flex items-center gap-1 cursor-pointer">
              Dashboard 2.0 <ChevronDown className="h-3 w-3 ml-1" />
            </div>
            <Button variant="outline" size="sm" className="h-9 px-3 text-sm font-medium">
              <span className="text-sm font-bold mr-1">+</span> Add filter
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="pl-9 h-9 w-full md:w-60 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Files Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20 text-sm">
              <tr>
                <th className="text-left font-medium p-3 pl-4">File name</th>
                <th className="text-left font-medium p-3">Date uploaded</th>
                <th className="text-left font-medium p-3">Last updated</th>
                <th className="text-left font-medium p-3">Uploaded by</th>
                <th className="text-right font-medium p-3 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Tech requirements.pdf</div>
                      <div className="text-xs text-muted-foreground">200 KB</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">Jan 4, 2022</td>
                <td className="p-3 text-sm">Jan 4, 2022</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
                      OR
                    </div>
                    <div>
                      <div className="text-sm">Olivia Rhye</div>
                      <div className="text-xs text-muted-foreground">olivia@untitledui.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <button className="text-sm text-muted-foreground hover:text-foreground">Delete</button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dashboard screenshot.jpg</div>
                      <div className="text-xs text-muted-foreground">720 KB</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">Jan 4, 2022</td>
                <td className="p-3 text-sm">Jan 4, 2022</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      PB
                    </div>
                    <div>
                      <div className="text-sm">Phoenix Baker</div>
                      <div className="text-xs text-muted-foreground">phoenix@untitledui.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <button className="text-sm text-muted-foreground hover:text-foreground">Delete</button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dashboard prototype.mp4</div>
                      <div className="text-xs text-muted-foreground">16 MB</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">Jan 2, 2022</td>
                <td className="p-3 text-sm">Jan 2, 2022</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">
                      LS
                    </div>
                    <div>
                      <div className="text-sm">Lana Steiner</div>
                      <div className="text-xs text-muted-foreground">lana@untitledui.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <button className="text-sm text-muted-foreground hover:text-foreground">Delete</button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Dashboard prototype FINAL.fig</div>
                      <div className="text-xs text-muted-foreground">4.2 MB</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm">Jan 6, 2022</td>
                <td className="p-3 text-sm">Jan 6, 2022</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">
                      DW
                    </div>
                    <div>
                      <div className="text-sm">Demi Wilkinson</div>
                      <div className="text-xs text-muted-foreground">demi@untitledui.com</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-right pr-4">
                  <div className="flex justify-end gap-2">
                    <button className="text-sm text-muted-foreground hover:text-foreground">Delete</button>
                    <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

