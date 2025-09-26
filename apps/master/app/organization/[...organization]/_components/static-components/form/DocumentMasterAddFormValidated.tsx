"use client"

import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Package, X } from "lucide-react"
import SemiPopupWrapper from "@repo/ui/components/popupwrapper/semi-popup-wrapper"
import { Separator } from "@repo/ui/components/ui/separator"
import { useOrganizationCrud } from "@/hooks/organization/useCurdOrganization"
import { useAuthToken } from "@repo/ui/hooks/auth/useAuthToken"
import { useEffect, useState } from "react"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

interface DocumentMasterFormData {
  documentCategoryCode?: string
  documentCategoryName?: string
  documentType?: string[]
}

interface DocumentMasterFormModalProps {
  open: boolean
  setOpen: any
  organizationData?: any
  onSuccess?: (updatedOrganizationData: any) => void
  onServerUpdate?: () => Promise<any>
  editData?: any
  isEditMode?: boolean
  deleteValue?: any
}

// Custom validation schema with duplicate checks
const createSchema = (organizationData: any, isEditMode: boolean, editData?: any) => {
  return yup.object().shape({
    documentCategoryCode: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema,
        otherwise: schema =>
          schema
            .required("Document category code is required")
            .test('unique-document-category-code', 'Document category code already exists in the organization', function(value) {
              if (!value) return true;
              const existingCategories = organizationData.documentMaster?.documentCategory || [];
              const exists = existingCategories.some((category: any) => {
                const categoryId = (category.id || category._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && categoryId === editId) return false;
                return category.documentCategoryCode === value;
              });
              return !exists;
            })
      }),
    documentCategoryName: yup
      .string()
      .when([], {
        is: () => isEditMode,
        then: schema => schema.required("Document category name is required"),
        otherwise: schema =>
          schema
            .required("Document category name is required")
            .test('unique-document-category-name', 'Document category name already exists in the organization', function(value) {
              if (!value) return true;
              const existingCategories = organizationData.documentMaster?.documentCategory || [];
              const exists = existingCategories.some((category: any) => {
                const categoryId = (category.id || category._id || '').toString();
                const editId = (editData?.id || editData?._id || '').toString();
                if (isEditMode && editId && categoryId === editId) return false;
                return category.documentCategoryName === value;
              });
              return !exists;
            })
      }),
    documentType: yup.array().of(yup.string().required()).optional(),
  })
}

export default function DocumentMasterAddFormValidated({ open, setOpen, organizationData = {}, onSuccess, onServerUpdate, editData, isEditMode, deleteValue }: DocumentMasterFormModalProps) {
  
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [newDocumentType, setNewDocumentType] = useState("")
  
  const {
    post: postDocumentMaster,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "organization",
    onSuccess: (data) => {
      console.log("data", data)
      setOpen(false)
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (error) => {
      console.error("Error submitting document category:", error)
      toast.error("Failed to submit document category. Please try again.")
    }
  })

  const { token } = useAuthToken()

  const schema = createSchema(organizationData, isEditMode || false, editData)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DocumentMasterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      documentCategoryCode: "",
      documentCategoryName: "",
      documentType: [],
    }
  })

  // Watch form values
  const watchedValues = watch()

  // Get document types from organization data
  const documentTypes = organizationData.documentMaster?.documentType || ["Pan Card", "Ration Card", "Bank Passbook"]

  // Custom functions to handle documentMaster nested structure
  const addDocumentCategoryToOrganization = (documentData: DocumentMasterFormData, orgData: any) => {
    const currentDocumentMaster = orgData.documentMaster || { documentCategory: [], documentType: ["Pan Card", "Ration Card", "Bank Passbook"] }
    const currentCategories = currentDocumentMaster.documentCategory || []
    
    const newCategory = {
      ...documentData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      status: 'active',
      type: 'documentMaster',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return {
      ...orgData,
      documentMaster: {
        ...currentDocumentMaster,
        documentCategory: [...currentCategories, newCategory]
      }
    }
  }

  const updateDocumentCategoryInOrganization = (documentCategoryCode: string, documentData: DocumentMasterFormData, orgData: any) => {
    const currentDocumentMaster = orgData.documentMaster || { documentCategory: [], documentType: ["Pan Card", "Ration Card", "Bank Passbook"] }
    const currentCategories = currentDocumentMaster.documentCategory || []
    
    const categoryIndex = currentCategories.findIndex((category: any) => category.documentCategoryCode === documentCategoryCode)
    
    if (categoryIndex === -1) {
      throw new Error(`Document category with code ${documentCategoryCode} not found`)
    }
    
    const updatedCategories = [...currentCategories]
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      ...documentData,
      updatedAt: new Date().toISOString()
    }
    
    return {
      ...orgData,
      documentMaster: {
        ...currentDocumentMaster,
        documentCategory: updatedCategories
      }
    }
  }

  const deleteDocumentCategoryFromOrganization = (documentCategoryCode: string, orgData: any) => {
    const currentDocumentMaster = orgData.documentMaster || { documentCategory: [], documentType: ["Pan Card", "Ration Card", "Bank Passbook"] }
    const currentCategories = currentDocumentMaster.documentCategory || []
    
    const updatedCategories = currentCategories.filter((category: any) => category.documentCategoryCode !== documentCategoryCode)
    
    return {
      ...orgData,
      documentMaster: {
        ...currentDocumentMaster,
        documentCategory: updatedCategories
      }
    }
  }

  // Handle form submission
  const handleFormSubmit: SubmitHandler<DocumentMasterFormData> = async (data) => {
    try {
      console.log("Form data:", data)
      
      let updatedData
      if (isEditMode && editData) {
        // Update existing document category
        updatedData = updateDocumentCategoryInOrganization(editData.documentCategoryCode, data, organizationData)
        console.log("Updated document category:", updatedData)
      } else {
        // Add new document category
        updatedData = addDocumentCategoryToOrganization(data, organizationData)
        console.log("Added document category:", updatedData)
      }

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postDocumentMaster(postData)
      
      // Show success toast
      toast.success(isEditMode ? "Document category updated successfully!" : "Document category added successfully!")
      
      if (onSuccess) {
        // For table display, return the documentCategory array
        const tableData = {
          ...updatedData,
          documentMaster: updatedData.documentMaster?.documentCategory || []
        }
        onSuccess(tableData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      reset()
      setOpen(false)
    } catch (error) {
      console.error("Error processing document category:", error)
      toast.error("Failed to process document category. Please try again.")
    }
  }

  // Handle delete item
  const handleDeleteItem = async (documentCategoryCode: string) => {
    try {
      console.log("Deleting document category:", documentCategoryCode)
      
      const updatedData = deleteDocumentCategoryFromOrganization(documentCategoryCode, organizationData)
      console.log("Deleted document category:", updatedData)

      // Prepare data for server update
      const postData = {
        tenant: "Midhani",
        action: "insert",
        id: updatedData._id,
        collectionName: "organization",
        data: updatedData
      }

      await postDocumentMaster(postData)
      
      // Show success toast
      toast.success("Document category deleted successfully!")
      
      if (onSuccess) {
        // For table display, return the documentCategory array
        const tableData = {
          ...updatedData,
          documentMaster: updatedData.documentMaster?.documentCategory || []
        }
        onSuccess(tableData)
      }

      if (onServerUpdate) {
        await onServerUpdate()
      }
      
      console.log("Document category deleted successfully:", documentCategoryCode)
    } catch (error) {
      console.error("Error deleting document category:", error)
      toast.error("Failed to delete document category. Please try again.")
    }
  }

  // Handle cancel
  const handleCancel = () => {
    reset()
    setOpen(false)
  }

  // Reset form when edit data changes or popup opens/closes
  useEffect(() => {
    if (isEditMode && editData) {
      setValue("documentCategoryCode", editData.documentCategoryCode || "")
      setValue("documentCategoryName", editData.documentCategoryName || "")
      setValue("documentType", Array.isArray(editData.documentType) ? editData.documentType : [])
    } else if (open && !isEditMode) {
      // Reset form when opening in add mode
      reset()
    }
  }, [isEditMode, editData, setValue, reset, open])

  // Handle delete button click
  useEffect(() => {
    if (deleteValue) {
      handleDeleteItem(deleteValue.documentCategoryCode)
    }
  }, [deleteValue])

  return (
    <>
      <SemiPopupWrapper
        open={open}
        setOpen={setOpen}
        content={{
          title: isEditMode ? "Edit Document Category" : "Add New Document Category",
          description: "Create a new document category entry with detailed information"
        }}
      >
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header - Matching EnhancedHeader Design */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-lg -mx-6 pt-4 mb-4">
            <div className="group cursor-default pl-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                    <Package className="w-5 h-5 text-gray-700 transition-colors duration-300 group-hover:text-gray-900" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm animate-pulse"></div>
                </div>
                <div className="transform transition-all duration-300 group-hover:translate-x-1">
                  <h1 className="text-lg font-bold flex items-center gap-2">
                    {isEditMode ? "Edit Document Category" : "Add New Document Category"}
                  </h1>
                  <p className="text-purple-100 text-sm mt-1">
                    {isEditMode ? "Update document category information" : "Create a new document category entry with detailed information"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentCategoryCode">Document Category Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="documentCategoryCode"
                      placeholder="Enter document category code"
                      {...register("documentCategoryCode")}
                      className={errors.documentCategoryCode ? "border-red-500" : ""}
                      disabled={isEditMode}
                    />
                    {errors.documentCategoryCode && (
                      <p className="text-sm text-red-500">{errors.documentCategoryCode.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentCategoryName">Document Category Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="documentCategoryName"
                      placeholder="Enter document category name"
                      {...register("documentCategoryName")}
                      className={errors.documentCategoryName ? "border-red-500" : ""}
                    />
                    {errors.documentCategoryName && (
                      <p className="text-sm text-red-500">{errors.documentCategoryName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Types</Label>
                  <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                    {documentTypes.map((type: string) => (
                      <div key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={type}
                          value={type}
                          checked={watchedValues.documentType?.includes(type) || false}
                          onChange={(e) => {
                            const currentTypes = watchedValues.documentType || []
                            if (e.target.checked) {
                              setValue("documentType", [...currentTypes, type])
                            } else {
                              setValue("documentType", currentTypes.filter(t => t !== type))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={type} className="text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.documentType && (
                    <p className="text-sm text-red-500">{errors.documentType.message}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddTypeModal(true)
                  }}
                  disabled={postLoading}
                  style={{ backgroundColor: '#2d81ff' }}
                  className="hover:opacity-90 text-white border-blue-600"
                >
                  Add Type
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={postLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={postLoading}
                    style={{ backgroundColor: '#2d81ff' }}
                    className="hover:opacity-90"
                  >
                    {postLoading ? "Saving..." : (isEditMode ? "Update" : "Save")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </SemiPopupWrapper>
      
      {/* Add Document Type Modal */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Document Type</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newDocumentType">Document Type Name</Label>
                <Input
                  id="newDocumentType"
                  value={newDocumentType}
                  onChange={(e) => {
                    console.log("Input changed:", e.target.value)
                    setNewDocumentType(e.target.value)
                  }}
                  placeholder="Enter document type name"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("Cancel clicked")
                    setShowAddTypeModal(false)
                    setNewDocumentType("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.log("Add clicked, newDocumentType:", newDocumentType)
                    if (newDocumentType && newDocumentType.trim()) {
                      const updatedTypes = [...documentTypes, newDocumentType.trim()]
                      console.log("Updated types:", updatedTypes)
                      // Update the organization data with new document type
                      const updatedData = {
                        ...organizationData,
                        documentMaster: {
                          ...organizationData.documentMaster,
                          documentType: updatedTypes
                        }
                      }
                      console.log("Updated data:", updatedData)
                      // Call onSuccess to update the parent component
                      if (onSuccess) {
                        onSuccess(updatedData)
                      }
                      setShowAddTypeModal(false)
                      setNewDocumentType("")
                    } else {
                      console.log("No document type entered")
                    }
                  }}
                  style={{ backgroundColor: '#2d81ff' }}
                  className="hover:opacity-90"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 