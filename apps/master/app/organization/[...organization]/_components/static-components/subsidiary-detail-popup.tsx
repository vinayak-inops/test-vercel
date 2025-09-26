"use client"

import type React from "react"
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper"
import { Building2, Hash, Edit3, Copy, ExternalLink, X, MapPin } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface SubsidiaryDetailPopupProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  subsidiaryData?: any
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
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 group-hover:from-white group-hover:to-gray-50 group-hover:border-gray-300/50 transition-all duration-200">
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

export default function SubsidiaryDetailPopup({ open, setOpen, subsidiaryData }: SubsidiaryDetailPopupProps) {
  const router = useRouter()
  const params = useParams()
  
  const data = {
    subsidiaryName: "Subsidiary 1",
    subsidiaryCode: "SUB001",
    subsidiaryDescription: "Description of Subsidiary-1. This is a detailed description that should wrap and display properly in the popup for better readability.",
    status: "Active",
    ...subsidiaryData,
  }

  return (
    <MiniPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title: "Subsidiary Details",
        description: "Comprehensive subsidiary information and management",
      }}
    >
      <div className="space-y-8">
        {/* Header with enhanced styling */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl"></div>
          <div className="relative flex items-start gap-4 p-6 rounded-2xl border border-gray-100/50 backdrop-blur-sm">
            <div className="relative">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-md font-semibold text-gray-900 truncate mb-1">{data.subsidiaryName}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-200/50 shadow-sm">
                  {data.subsidiaryCode}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full border border-green-200/50 shadow-sm">
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subsidiary Information with enhanced cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Subsidiary Information</h2>
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
                  label="Subsidiary Name"
                  value={data.subsidiaryName}
                  icon={<Building2 className="w-4 h-4 text-blue-500" />}
                />
                <InfoRow
                  label="Subsidiary Code"
                  value={data.subsidiaryCode}
                  icon={<Hash className="w-4 h-4 text-green-500" />}
                />
                <div className="group flex flex-col items-start py-3 px-4 rounded-lg hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-gray-100 hover:shadow-sm">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 group-hover:from-white group-hover:to-gray-50 group-hover:border-gray-300/50 transition-all duration-200">
                      <Edit3 className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Description</span>
                  </div>
                  <span className="text-sm text-gray-900 font-mono font-semibold tracking-wide break-words whitespace-pre-line ml-11">
                    {data.subsidiaryDescription}
                  </span>
                </div>
                <InfoRow
                  label="Status"
                  value={data.status}
                  icon={<Building2 className="w-4 h-4 text-green-500" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/organization/${params.organization[0]}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0061ff] rounded-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
            <Edit3 className="w-4 h-4" />
            Edit Subsidiary
          </button>
        </div>
      </div>
    </MiniPopupWrapper>
  )
} 