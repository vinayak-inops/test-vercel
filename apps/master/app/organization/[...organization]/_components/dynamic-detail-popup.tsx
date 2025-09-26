"use client"

import React from "react"
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper"
import { Edit3, Copy, ExternalLink, X } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"

interface FieldConfig {
  label: string
  key: string
  icon?: React.ReactNode
  isDescription?: boolean
}

interface DynamicDetailPopupProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  title: string
  description?: string
  data: Record<string, any>
  fields: FieldConfig[]
  status?: string
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {label}
            </h3>
            <p className="text-xs text-gray-500">
              Field
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            onClick={handleCopy}
            title="Copy"
          >
            {copied ? (
              <span className="text-xs text-green-600 font-medium">Copied!</span>
            ) : (
              <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Value:</span>
          <span className="truncate font-medium">{value}</span>
        </div>
      </div>
    </div>
  )
}

function DescriptionCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow col-span-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            {icon || <Edit3 className="w-4 h-4 text-purple-600" />}
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {label}
            </h3>
            <p className="text-xs text-gray-500">
              Description
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600">
        <div className="bg-gray-50 rounded p-3">
          <span className="break-words whitespace-pre-line">{value}</span>
        </div>
      </div>
    </div>
  )
}

const getFieldKeys = (fields: FieldConfig[]) => fields.map(f => f.key)

export default function DynamicDetailPopup({ open, setOpen, title, description, data, fields, status }: DynamicDetailPopupProps) {
  // Find extra fields in data not in fields config
  const fieldKeys = getFieldKeys(fields)
  const extraFields = Object.keys(data || {})
    .filter(
      (key) =>
        !fieldKeys.includes(key) &&
        typeof data[key] !== "object" &&
        data[key] !== null &&
        data[key] !== undefined &&
        key !== "status"
    )
    .map((key) => ({ label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), value: data[key] }))

  // Get the main entity name and code for the header
  const mainNameField = fields.find(f => f.key.toLowerCase().includes('name') || f.key.toLowerCase().includes('title'))
  const mainCodeField = fields.find(f => f.key.toLowerCase().includes('code'))
  const entityName = (mainNameField && data[mainNameField.key]) ? String(data[mainNameField.key]) : title
  const entityCode = mainCodeField ? data[mainCodeField.key] : ''

  // Get the main icon for the header
  const mainIcon = fields.find(f => !f.isDescription)?.icon || <Edit3 className="w-4 h-4 text-blue-600" />;

  return (
    <MiniPopupWrapper
      open={open}
      setOpen={setOpen}
      content={{
        title,
        description: description || "",
      }}
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {React.isValidElement(mainIcon)
                  ? React.cloneElement(mainIcon as React.ReactElement<any>, { className: "w-4 h-4 text-blue-600" })
                  : mainIcon}
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900 truncate">
                  {entityName}
                </h3>
                <p className="text-xs text-gray-500">
                  {title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {entityCode && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {entityCode}
                </span>
              )}
              {status && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : status === 'Inactive'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Information Cards Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            {title.replace(' Details', '')} Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Regular info cards */}
            {fields.filter(f => !f.isDescription).map((field) => (
              <InfoCard
                key={field.key}
                label={field.label}
                value={data[field.key] || '—'}
                icon={field.icon || <Edit3 className="w-4 h-4 text-gray-400" />}
              />
            ))}

            {/* Status card if not already shown */}
            {status && !fields.find(f => f.key === 'status') && (
              <InfoCard
                label="Status"
                value={status}
                icon={<Edit3 className="w-4 h-4 text-green-500" />}
              />
            )}
          </div>

          {/* Description cards - full width */}
          {fields.filter(f => f.isDescription).map((field) => (
            <DescriptionCard
              key={field.key}
              label={field.label}
              value={data[field.key] || 'No description available'}
              icon={field.icon}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>
    </MiniPopupWrapper>
  )
} 