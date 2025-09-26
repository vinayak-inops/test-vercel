"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { FileText, Plus, Trash2, ArrowRight, ArrowLeft, RotateCcw, X, Upload, File } from "lucide-react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Validation schema for individual document
const documentSchema = z.object({
  documentCategory: z.object({
    documentCategoryCode: z.string().min(1, "Document category code is required"),
    documentCategoryTitle: z.string().min(1, "Document category title is required"),
  }),
  documentType: z.object({
    documentTypeCode: z.string().min(1, "Document type code is required"),
    documentTypeTitle: z.string().min(1, "Document type title is required"),
  }),
  documentPath: z.string().optional(),
  identificationNumber: z.string().min(1, "Identification number is required"),
})

type Document = z.infer<typeof documentSchema>

interface DocumentsComplianceFormProps {
  formData: any
  onFormDataChange: (data: any) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function DocumentsComplianceForm({ 
  formData, 
  onFormDataChange,
  onNextTab,
  onPreviousTab,
  mode = "add" ,
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: DocumentsComplianceFormProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File | null }>({})
  const [fileNames, setFileNames] = useState<{ [key: number]: string }>({})
  const [organizationData, setOrganizationData] = useState<any>({})
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"

  // Fetch organizational data for document categories and types
  const {
    data: orgData,
    error: orgError,
    loading: orgLoading,
    refetch: fetchOrgData
  } = useRequest<any[]>({
    url: 'map/organization/search?tenantCode=Midhani',
    onSuccess: (data: any) => {
      console.log("Organization data received for documents:", data)
      if (data && data.length > 0) {
        const orgData = data[0];
        console.log("Setting organization data for documents:", orgData);
        setOrganizationData(orgData);
      } else {
        console.warn("No organization data received for documents");
        setOrganizationData({});
      }
    },
    onError: (error: any) => {
      console.error('Error loading organization data for documents:', error);
      setOrganizationData({});
    }
  });

  

  // Populate documents from fetched data (primary source)
  useEffect(() => {
    if (auditStatusFormData && auditStatusFormData.uploadedDocuments) {
      setDocuments(auditStatusFormData.uploadedDocuments)
    }
  }, [auditStatusFormData])

  // Populate documents from formData (fallback)
  useEffect(() => {
    if (formData && formData.uploadedDocuments && !auditStatusFormData) {
      setDocuments(formData.uploadedDocuments)
    }
  }, [formData, auditStatusFormData])

  // API call for saving documents compliance
  const {
    post: postDocumentsCompliance,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Documents compliance saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving documents compliance:", error)
    },
  })

  const addDocument = () => {
    const newDocument = {
      documentCategory: {
        documentCategoryCode: "",
        documentCategoryTitle: "",
      },
      documentType: {
        documentTypeCode: "",
        documentTypeTitle: "",
      },
      documentPath: "",
      identificationNumber: "",
    }
    const updatedDocuments = [...documents, newDocument]
    setDocuments(updatedDocuments)
  }

  const removeDocument = (index: number) => {
    const updatedDocuments = documents.filter((_, i) => i !== index)
    setDocuments(updatedDocuments)
    
    // Clean up file states
    const newUploadedFiles = { ...uploadedFiles }
    const newFileNames = { ...fileNames }
    delete newUploadedFiles[index]
    delete newFileNames[index]
    
    // Reindex remaining files
    const reindexedFiles: { [key: number]: File | null } = {}
    const reindexedNames: { [key: number]: string } = {}
    
    Object.keys(newUploadedFiles).forEach((key) => {
      const oldIndex = parseInt(key)
      if (oldIndex > index) {
        reindexedFiles[oldIndex - 1] = newUploadedFiles[oldIndex]
        reindexedNames[oldIndex - 1] = newFileNames[oldIndex]
      } else {
        reindexedFiles[oldIndex] = newUploadedFiles[oldIndex]
        reindexedNames[oldIndex] = newFileNames[oldIndex]
      }
    })
    
    setUploadedFiles(reindexedFiles)
    setFileNames(reindexedNames)
  }

  const updateDocument = (index: number, field: string, value: string) => {
    const updated = [...documents]
    const fieldParts = field.split('.')
    
    if (fieldParts.length === 2) {
      // Handle nested fields like 'documentCategory.documentCategoryCode'
      const [parentField, childField] = fieldParts
      updated[index] = {
        ...updated[index],
        [parentField]: {
          ...(updated[index][parentField as keyof Document] as any),
          [childField]: value
        }
      }
    } else {
      // Handle top-level fields
      updated[index] = { ...updated[index], [field]: value }
    }
    setDocuments(updated)
  }

  const handleFileUpload = (index: number, file: File | null) => {
    if (file) {
      // Store the actual file
      setUploadedFiles(prev => ({ ...prev, [index]: file }))
      setFileNames(prev => ({ ...prev, [index]: file.name }))
      
      // Update the document path with file name or a generated path
      const filePath = `/documents/${file.name}`
      updateDocument(index, "documentPath", filePath)
    } else {
      // Clear file data
      setUploadedFiles(prev => {
        const newFiles = { ...prev }
        delete newFiles[index]
        return newFiles
      })
      setFileNames(prev => {
        const newNames = { ...prev }
        delete newNames[index]
        return newNames
      })
      updateDocument(index, "documentPath", "")
    }
  }

  // Handle document category change and update available document types
  const handleDocumentCategoryChange = (categoryCode: string, index: number) => {
    console.log("Document category changed:", categoryCode, "for index:", index)
    
    // Find the selected category from organization data
    const selectedCategory = organizationData?.documentMaster?.documentCategory?.find(
      (cat: any) => cat.documentCategoryCode === categoryCode
    )
    
    console.log("Selected category:", selectedCategory)
    
    if (selectedCategory) {
      // Update the documents array directly
      const updated = [...documents]
      updated[index] = {
        ...updated[index],
        documentCategory: {
          documentCategoryCode: categoryCode,
          documentCategoryTitle: selectedCategory.documentCategoryName
        },
        documentType: {
          documentTypeCode: "",
          documentTypeTitle: ""
        }
      }
      setDocuments(updated)
    }
  }

  // Handle document type change
  const handleDocumentTypeChange = (documentType: string, index: number) => {
    console.log("Document type changed:", documentType, "for index:", index)
    
    // Update the documents array directly
    const updated = [...documents]
    updated[index] = {
      ...updated[index],
      documentType: {
        documentTypeCode: documentType,
        documentTypeTitle: documentType
      }
    }
    setDocuments(updated)
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    // Check if at least one document is added
    if (documents.length === 0) {
      console.error("At least one document is required")
      return
    }
    
    // Validate all documents
    const validationResults = documents.map(doc => documentSchema.safeParse(doc))
    const hasErrors = validationResults.some(result => !result.success)
    
    if (hasErrors) {
      console.error("Validation errors:", validationResults.filter(r => !r.success))
      return
    }

    // Create the exact JSON structure as requested
    const exactData = {
      uploadedDocuments: documents.map(doc => ({
        documentCategory: {
          documentCategoryCode: doc.documentCategory?.documentCategoryCode || "",
          documentCategoryTitle: doc.documentCategory?.documentCategoryTitle || "",
        },
        documentType: {
          documentTypeCode: doc.documentType?.documentTypeCode || "",
          documentTypeTitle: doc.documentType?.documentTypeTitle || "",
        },
        documentPath: doc.documentPath || "",
        identificationNumber: doc.identificationNumber || "",
      }))
    }
    
    onFormDataChange(exactData)
    
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
      setAuditStatus?.({
        ...auditStatus,
        documentsCompliance:true
      })
      if (onNextTab) {
        onNextTab()
      }
    } else if (currentMode === "edit") {
      let json = {
        tenant: "Midhani",
        action: "insert",
        id: auditStatusFormData._id || null,
        collectionName: "contractor",
        data: {
          ...auditStatusFormData,
          ...exactData,
          documentsCompliance: true
        }
      }
      postDocumentsCompliance(json)
    } else {
      if (onNextTab) {
        onNextTab()
      }
    }
  }

  const handleReset = () => {
    setDocuments([])
    onFormDataChange({ uploadedDocuments: [] })
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Documents & Compliance</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Document management and compliance records
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Documents
              </h3>
              {!isViewMode && (
                <Button 
                  onClick={addDocument} 
                  className="px-4 py-2 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              )}
            </div>

            {documents.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents added yet</p>
                <p className="text-sm text-gray-400">Click "Add Document" to get started</p>
              </div>
            )}

            {documents.map((document, index) => {
              const validationResult = documentSchema.safeParse(document)
              const errors = validationResult.success ? {} : validationResult.error.flatten().fieldErrors
              
              // Helper function to get nested error
              const getNestedError = (path: string) => {
                if (!validationResult.success) {
                  const pathArray = path.split('.')
                  const errorPath = pathArray.join('.')
                  return validationResult.error.issues.find(issue => 
                    issue.path.join('.') === errorPath
                  )?.message
                }
                return null
              }

              return (
                <div key={index} className="group/item bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Document {index + 1}</h4>
                    </div>
                    {!isViewMode && (
                      <Button
                        onClick={() => removeDocument(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={document.documentCategory?.documentCategoryCode || ""}
                        disabled={isViewMode}
                        onValueChange={(value) => handleDocumentCategoryChange(value, index)}
                      >
                        <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          getNestedError('documentCategory.documentCategoryCode') 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}>
                          <SelectValue placeholder="Select document category" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgLoading ? (
                            <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                          ) : organizationData?.documentMaster?.documentCategory && organizationData.documentMaster.documentCategory.length > 0 ? (
                            organizationData.documentMaster.documentCategory.map((category: any) => (
                              <SelectItem key={category.documentCategoryCode} value={category.documentCategoryCode}>
                                {category.documentCategoryCode} - {category.documentCategoryName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled>
                              {organizationData?.documentMaster ? 'No document categories available' : 'Loading document categories...'}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {getNestedError('documentCategory.documentCategoryCode') && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {getNestedError('documentCategory.documentCategoryCode')}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Category Title <span className="text-red-500">*</span>
                      </Label>
                      <div className={`h-10 px-4 py-2 border-2 rounded-xl flex items-center font-medium transition-all duration-300 ${
                        document.documentCategory?.documentCategoryTitle 
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800" 
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}>
                        {document.documentCategory?.documentCategoryTitle || "Will auto-fill from category selection"}
                      </div>
                      {getNestedError('documentCategory.documentCategoryTitle') && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {getNestedError('documentCategory.documentCategoryTitle')}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={document.documentType?.documentTypeCode || ""}
                        disabled={isViewMode || !document.documentCategory?.documentCategoryCode}
                        onValueChange={(value) => handleDocumentTypeChange(value, index)}
                      >
                        <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          getNestedError('documentType.documentTypeCode') 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {!document.documentCategory?.documentCategoryCode ? (
                            <SelectItem value="no-category" disabled>Select document category first</SelectItem>
                          ) : (() => {
                            // Get document types for the selected category
                            const selectedCategory = organizationData?.documentMaster?.documentCategory?.find(
                              (cat: any) => cat.documentCategoryCode === document.documentCategory?.documentCategoryCode
                            )
                            const documentTypes = selectedCategory?.documentType || []
                            
                            return documentTypes.length > 0 ? (
                              documentTypes.map((docType: string, typeIndex: number) => (
                                <SelectItem key={`${document.documentCategory?.documentCategoryCode}-${typeIndex}`} value={docType}>
                                  {docType}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-types" disabled>No document types available for this category</SelectItem>
                            )
                          })()}
                        </SelectContent>
                      </Select>
                      {getNestedError('documentType.documentTypeCode') && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {getNestedError('documentType.documentTypeCode')}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Type Title <span className="text-red-500">*</span>
                      </Label>
                      <div className={`h-10 px-4 py-2 border-2 rounded-xl flex items-center font-medium transition-all duration-300 ${
                        document.documentType?.documentTypeTitle 
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800" 
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}>
                        {document.documentType?.documentTypeTitle || "Will auto-fill from type selection"}
                      </div>
                      {getNestedError('documentType.documentTypeTitle') && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {getNestedError('documentType.documentTypeTitle')}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Identification Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={document.identificationNumber || ""}
                        onChange={(e) => updateDocument(index, "identificationNumber", e.target.value)}
                        className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                          isViewMode 
                            ? "bg-gray-100 cursor-not-allowed" 
                            : ""
                        } ${
                          errors.identificationNumber 
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                        placeholder="Enter identification number"
                        disabled={isViewMode}
                      />
                      {errors.identificationNumber && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.identificationNumber[0]}
                        </p>
                      )}
                      {!errors.identificationNumber && (
                        <p className="text-gray-500 text-xs mt-1">Enter document identification number (required)</p>
                      )}
                    </div>
                    <div className="group md:col-span-3">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Document Upload
                      </Label>
                      {!isViewMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                              <input
                                type="file"
                                id={`file-upload-${index}`}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null
                                  handleFileUpload(index, file)
                                }}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                disabled={isViewMode}
                              />
                              <div className={`h-10 border-2 rounded-xl flex items-center px-3 transition-all duration-300 cursor-pointer ${
                                errors.documentPath 
                                  ? "border-red-500 bg-red-50" 
                                  : "border-gray-200 hover:border-blue-300 bg-white"
                              }`}>
                                <Upload className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600 flex-1">
                                  {fileNames[index] ? "Change file" : "Choose file to upload"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {fileNames[index] && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <File className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-800 flex-1">{fileNames[index]}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleFileUpload(index, null)}
                                className="h-6 w-6 p-0 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          {document.documentPath && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <strong>Path:</strong> {document.documentPath}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-10 border-2 border-gray-200 rounded-xl flex items-center px-3 bg-gray-100">
                          <File className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">
                            {document.documentPath || "No document uploaded"}
                          </span>
                        </div>
                      )}
                      
                      {errors.documentPath && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.documentPath[0]}
                        </p>
                      )}
                      {!errors.documentPath && !isViewMode && (
                        <p className="text-gray-500 text-xs mt-1">
                          Upload document file (PDF, DOC, DOCX, JPG, PNG - optional)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {onPreviousTab && (
              <Button
                type="button"
                variant="outline"
                onClick={onPreviousTab}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {!isViewMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Form
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${documents.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {documents.length > 0 ? `${documents.length} document(s) added` : 'At least one document is required'}
              </span>
              {showErrors && documents.length === 0 && (
                <div className="text-xs text-red-600 ml-2">
                  Please add at least one document
                </div>
              )}
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={postLoading}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Save & Continue
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 