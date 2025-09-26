"use client"

import type React from "react"
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper"
import { GraduationCap, Hash, Edit3, Copy, ExternalLink, X, UserCheck } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"

interface GradeDetailPopupProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  gradeData?: any
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div className="group flex items-center justify-between py-3 px-4 rounded-lg hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-gray-100 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 group-hover:from-white group-hover:to-cyan-50 group-hover:border-cyan-300/50 transition-all duration-200">
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900 font-mono font-semibold tracking-wide">{value}</span>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all duration-200"
          onClick={handleCopy}
          title="Copy"
        >
          {copied ? (
            <span className="text-xs text-green-600 font-bold">Copied!</span>
          ) : (
            <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
    </div>
  )
}

export default function GradeDetailPopup({ open, setOpen, gradeData }: GradeDetailPopupProps) {
  const data = {
    gradeName: "Manager",
    gradeCode: "D001",
    gradeDescription: "Highest Grade",
    designationCode: "Des01",
    status: "Active",
    ...gradeData,
  }

  return (
    <MiniPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: "Grade Details",
        description: "Comprehensive grade information and management",
      }}
    >
      <div className="space-y-8">
        {/* Header with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-2xl"></div>
          <div className="relative flex items-start gap-4 p-6 rounded-2xl border border-teal-100/50 backdrop-blur-sm">
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-md font-semibold text-gray-900 truncate mb-1">{data.gradeName}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full border border-teal-200/50 shadow-sm">
                  {data.gradeCode}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full border border-green-200/50 shadow-sm">
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Information with enhanced cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Grade Information</h2>
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <ExternalLink className="w-3 h-3" />
              View Details
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white rounded-2xl"></div>
            <div className="relative border border-gray-200/50 rounded-2xl p-2 backdrop-blur-sm shadow-sm">
              <div className="space-y-1">
                <InfoRow
                  label="Grade Name"
                  value={data.gradeName}
                  icon={<GraduationCap className="w-4 h-4 text-teal-500" />}
                />
                <InfoRow
                  label="Grade Code"
                  value={data.gradeCode}
                  icon={<Hash className="w-4 h-4 text-blue-500" />}
                />
                {/* Description Row - updated layout */}
                <div className="group flex flex-col items-start py-3 px-4 rounded-lg hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-gray-100 hover:shadow-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 group-hover:from-white group-hover:to-gray-50 group-hover:border-gray-300/50 transition-all duration-200">
                      <Edit3 className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Description</span>
                  </div>
                  <span className="text-sm text-gray-900 font-mono font-semibold tracking-wide break-words whitespace-pre-line ml-11">
                    {data.gradeDescription}
                  </span>
                </div>
                <InfoRow
                  label="Designation Code"
                  value={data.designationCode}
                  icon={<UserCheck className="w-4 h-4 text-purple-500" />}
                />
                <InfoRow
                  label="Status"
                  value={data.status}
                  icon={<GraduationCap className="w-4 h-4 text-green-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => {setOpen(false)}}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0061ff] rounded-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
            <Edit3 className="w-4 h-4" />
            Edit Grade
          </button>
        </div>
      </div>
    </MiniPopupWrapper>
  )
} 