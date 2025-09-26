"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
// import { Switch } from "@repo/ui/components/ui/switch"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Separator } from "@repo/ui/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { FileText, Plus, Trash2, Upload, Calendar, /* CreditCard, */ Shield, FileCheck, X } from "lucide-react"
import { useState, useEffect } from "react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Zod Schema for validation
const documentsVerificationSchema = z.object({
  passport: z.object({
    passportNumber: z.string().optional(),
    passportExpiryDate: z.string().optional(),
    passportPath: z.string().optional(),
  }),
  // cards: z.array(z.object({
  //   cardNumber: z.string().optional(),
  //   effectiveFrom: z.string().optional(),
  //   effectiveTo: z.string().optional(),
  //   isPrimaryCard: z.boolean(),
  // })).optional(),
  // documents: z.array(z.object({
  //   documentTypeCode: z.string().optional(),
  //   documentTypeTitle: z.string().optional(),
  //   identificationNumber: z.string().optional(),
  //   documentPath: z.string().optional(),
  // })).optional(),
  insuranceNumber: z.string().optional(),
  mediclaimPolicyNumber: z.string().optional(),
  WCPolicyNumber: z.string().optional(),
  accidentPolicyNumber: z.string().optional(),
  uploadedDocuments: z.array(z.object({
    documentCategory: z.object({
      documentCategoryCode: z.string().optional(),
      documentCategoryTitle: z.string().optional(),
    }),
    documentType: z.object({
      documentTypeCode: z.string().optional(),
      documentTypeTitle: z.string().optional(),
    }),
    documentPath: z.string().optional(),
    identificationNumber: z.string().min(1, "Identification number is required"),
  })).optional(),
  workPermit: z.object({
    workpermitNumber: z.string().optional(),
    workpermitExpiryDate: z.string().optional(),
    workPermitPath: z.string().optional(),
  }),
  labourCard: z.object({
    labourCardNumber: z.string().optional(),
    labourcardExpiryDate: z.string().optional(),
    labourCardPath: z.string().optional(),
  }),
})

type DocumentsVerificationData = z.infer<typeof documentsVerificationSchema>

interface DocumentsVerificationFormProps {
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

// Note: Document categories and types are now loaded dynamically from organization API
// via org.documentMaster.documentCategory array structure

export function DocumentsVerificationForm({ 
  formData, 
  onFormDataChange, 
  onNextTab, 
  onPreviousTab,
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: DocumentsVerificationFormProps) {
  const [showErrors, setShowErrors] = useState(false)
  const [organizationData, setOrganizationData] = useState<any>({})
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const currentMode = mode || searchParams.get("mode") || "add";
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

  const {
    post: postDocumentsVerification,
    loading: isSaving,
  } = usePostRequest<any>({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Documents verification saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving documents verification:", error)
    },
  });

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<DocumentsVerificationData>({
    resolver: zodResolver(documentsVerificationSchema),
    defaultValues: {
      passport: {
        passportNumber: "",
        passportExpiryDate: "",
        passportPath: "",
      },
      // cards: [{
      //   cardNumber: "",
      //   effectiveFrom: "",
      //   effectiveTo: "",
      //   isPrimaryCard: false,
      // }],
      // documents: [{
      //   documentTypeCode: "",
      //   documentTypeTitle: "",
      //   identificationNumber: "",
      //   documentPath: "",
      // }],
      insuranceNumber: "",
      mediclaimPolicyNumber: "",
      WCPolicyNumber: "",
      accidentPolicyNumber: "",
      uploadedDocuments: [],
      workPermit: {
        workpermitNumber: "",
        workpermitExpiryDate: "",
        workPermitPath: "",
      },
      labourCard: {
        labourCardNumber: "",
        labourcardExpiryDate: "",
        labourCardPath: "",
      },
    },
    mode: "onChange",
  })

  // Update form values based on mode
  useEffect(() => {
    if (auditStatusFormData) {
      // Populate from auditStatusFormData for add mode
      if (auditStatusFormData.passport?.passportNumber) {
        setValue("passport.passportNumber", auditStatusFormData.passport.passportNumber)
      }
      if (auditStatusFormData.passport?.passportExpiryDate) {
        setValue("passport.passportExpiryDate", auditStatusFormData.passport.passportExpiryDate)
      }
      if (auditStatusFormData.passport?.passportPath) {
        setValue("passport.passportPath", auditStatusFormData.passport.passportPath)
      }
      if (auditStatusFormData.workPermit?.workpermitNumber) {
        setValue("workPermit.workpermitNumber", auditStatusFormData.workPermit.workpermitNumber)
      }
      if (auditStatusFormData.workPermit?.workpermitExpiryDate) {
        setValue("workPermit.workpermitExpiryDate", auditStatusFormData.workPermit.workpermitExpiryDate)
      }
      if (auditStatusFormData.workPermit?.workPermitPath) {
        setValue("workPermit.workPermitPath", auditStatusFormData.workPermit.workPermitPath)
      }
      if (auditStatusFormData.labourCard?.labourCardNumber) {
        setValue("labourCard.labourCardNumber", auditStatusFormData.labourCard.labourCardNumber)
      }
      if (auditStatusFormData.labourCard?.labourcardExpiryDate) {
        setValue("labourCard.labourcardExpiryDate", auditStatusFormData.labourCard.labourcardExpiryDate)
      }
      if (auditStatusFormData.labourCard?.labourCardPath) {
        setValue("labourCard.labourCardPath", auditStatusFormData.labourCard.labourCardPath)
      }
      if (auditStatusFormData.insuranceNumber) {
        setValue("insuranceNumber", auditStatusFormData.insuranceNumber)
      }
      if (auditStatusFormData.mediclaimPolicyNumber) {
        setValue("mediclaimPolicyNumber", auditStatusFormData.mediclaimPolicyNumber)
      }
      if (auditStatusFormData.WCPolicyNumber) {
        setValue("WCPolicyNumber", auditStatusFormData.WCPolicyNumber)
      }
      if (auditStatusFormData.accidentPolicyNumber) {
        setValue("accidentPolicyNumber", auditStatusFormData.accidentPolicyNumber)
      }
      
      // Handle arrays
      // if (auditStatusFormData.cards) {
      //   setValue("cards", auditStatusFormData.cards)
      // }
      // if (auditStatusFormData.documents) {
      //   setValue("documents", auditStatusFormData.documents)
      // }
      if (auditStatusFormData.uploadedDocuments && auditStatusFormData.uploadedDocuments.length > 0) {
        setValue("uploadedDocuments", auditStatusFormData.uploadedDocuments)
      }
    }
  }, [auditStatusFormData, currentMode, setValue])

  const watchedValues = watch()

  const handleReset = () => {
    reset()
    setShowErrors(false)
    
    // Create nested data structure for parent
    const nestedData = {
      passport: {
        passportNumber: "",
        passportExpiryDate: "",
        passportPath: "",
      },
      workPermit: {
        workpermitNumber: "",
        workpermitExpiryDate: "",
        workPermitPath: "",
      },
      labourCard: {
        labourCardNumber: "",
        labourcardExpiryDate: "",
        labourCardPath: "",
      },
      insuranceNumber: "",
      mediclaimPolicyNumber: "",
      WCPolicyNumber: "",
      accidentPolicyNumber: "",
      // cards: [],
      // documents: [],
      uploadedDocuments: [],
    }
    
    if (currentMode === "add") {
      // Clear auditStatusFormData in add mode
      onFormDataChange(nestedData)
    } else {
      // Clear formData in edit/view mode
      onFormDataChange(nestedData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    
    try {
      // Validate the form
      const valid = await trigger()
      
      if (valid) {
        const formValues = watch()
        
        // Convert nested form values to nested data structure for parent
        const nestedData = {
          passport: {
            passportNumber: formValues.passport?.passportNumber || "",
            passportExpiryDate: formValues.passport?.passportExpiryDate || "",
            passportPath: formValues.passport?.passportPath || "",
          },
          workPermit: {
            workpermitNumber: formValues.workPermit?.workpermitNumber || "",
            workpermitExpiryDate: formValues.workPermit?.workpermitExpiryDate || "",
            workPermitPath: formValues.workPermit?.workPermitPath || "",
          },
          labourCard: {
            labourCardNumber: formValues.labourCard?.labourCardNumber || "",
            labourcardExpiryDate: formValues.labourCard?.labourcardExpiryDate || "",
            labourCardPath: formValues.labourCard?.labourCardPath || "",
          },
          insuranceNumber: formValues.insuranceNumber || "",
          mediclaimPolicyNumber: formValues.mediclaimPolicyNumber || "",
          WCPolicyNumber: formValues.WCPolicyNumber || "",
          accidentPolicyNumber: formValues.accidentPolicyNumber || "",
          // cards: formValues.cards || [],
          // documents: formValues.documents || [],
          uploadedDocuments: formValues.uploadedDocuments || [],
        }

        if (currentMode === 'add') {
          // Update auditStatusFormData for add mode
          setAuditStatusFormData?.({
            ...auditStatusFormData,
            ...nestedData,
          })
          setAuditStatus?.({
            ...auditStatus,
            documentsVerification: true
          })
          if (onNextTab) {
            onNextTab()
          }
          if (onNextTab) onNextTab()
        } else {
          // Save to backend for edit mode
          const json = {
            tenant: "Midhani",
            action: "insert",
            id: auditStatusFormData._id || null,
            collectionName: "contract_employee",
            data: {
              ...auditStatusFormData,
              ...formValues,
            }
          }
          await postDocumentsVerification(json)
        }
      } else {
        console.log("Form validation failed")
      }
    } catch (error) {
      console.error("Error saving form:", error)
    }
  }

  // const addCard = () => {
  //   const newCards = [...(watchedValues.cards || []), {
  //     cardNumber: "",
  //     effectiveFrom: "",
  //     effectiveTo: "",
  //     isPrimaryCard: false,
  //   }]
  //   setValue("cards", newCards)
  //   onFormDataChange({ cards: newCards })
  // }

  // const removeCard = (index: number) => {
  //   const newCards = watchedValues.cards?.filter((_, i) => i !== index) || []
  //   setValue("cards", newCards)
  //   onFormDataChange({ cards: newCards })
  // }

  // const addDocument = () => {
  //   const newDocuments = [...(watchedValues.documents || []), {
  //     documentTypeCode: "",
  //     documentTypeTitle: "",
  //     identificationNumber: "",
  //     documentPath: "",
  //   }]
  //   setValue("documents", newDocuments)
  //   onFormDataChange({ documents: newDocuments })
  // }

  // const removeDocument = (index: number) => {
  //   const newDocuments = watchedValues.documents?.filter((_, i) => i !== index) || []
  //   setValue("documents", newDocuments)
  //   onFormDataChange({ documents: newDocuments })
  // }

  const addUploadedDocument = () => {
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
    const newUploadedDocuments = [...(watchedValues.uploadedDocuments || []), newDocument]
    setValue("uploadedDocuments", newUploadedDocuments)
    onFormDataChange({ uploadedDocuments: newUploadedDocuments })
  }

  const removeUploadedDocument = (index: number) => {
    const newUploadedDocuments = watchedValues.uploadedDocuments?.filter((_, i) => i !== index) || []
    setValue("uploadedDocuments", newUploadedDocuments)
    onFormDataChange({ uploadedDocuments: newUploadedDocuments })
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
      // Update form values
      setValue(`uploadedDocuments.${index}.documentCategory.documentCategoryCode`, categoryCode)
      setValue(`uploadedDocuments.${index}.documentCategory.documentCategoryTitle`, selectedCategory.documentCategoryName)
      
      // Clear document type when category changes
      setValue(`uploadedDocuments.${index}.documentType.documentTypeCode`, "")
      setValue(`uploadedDocuments.${index}.documentType.documentTypeTitle`, "")
      
      // Update form data
      onFormDataChange({
        uploadedDocuments: watchedValues.uploadedDocuments?.map((d, i) => 
          i === index ? { 
            ...d, 
            documentCategory: { 
              documentCategoryCode: categoryCode, 
              documentCategoryTitle: selectedCategory.documentCategoryName 
            },
            documentType: {
              documentTypeCode: "",
              documentTypeTitle: ""
            }
          } : d
        )
      })
      
      // Document types are now handled inline in the render logic
    }
  }

  // Handle document type change
  const handleDocumentTypeChange = (documentType: string, index: number) => {
    console.log("Document type changed:", documentType, "for index:", index)
    
    // Update form values
    setValue(`uploadedDocuments.${index}.documentType.documentTypeCode`, documentType)
    setValue(`uploadedDocuments.${index}.documentType.documentTypeTitle`, documentType)
    
    // Update form data
    onFormDataChange({
      uploadedDocuments: watchedValues.uploadedDocuments?.map((d, i) => 
        i === index ? { 
          ...d, 
          documentType: { 
            documentTypeCode: documentType, 
            documentTypeTitle: documentType 
          }
        } : d
      )
    })
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
                <CardTitle className="text-2xl font-bold">Documents & Verification</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Identity documents, work permits, and verification details
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">

        
        <div className="space-y-8">
          {/* Passport Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Passport Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="passportNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Passport Number
                </Label>
                <Input
                  id="passportNumber"
                  {...register("passport.passportNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter passport number"
                />

              </div>

              <div className="group">
                <Label htmlFor="passportExpiryDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Passport Expiry Date
                </Label>
                <Input
                  id="passportExpiryDate"
                  type="date"
                  {...register("passport.passportExpiryDate")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                />

              </div>

              <div className="group">
                <Label htmlFor="passportPath" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Passport Document
                </Label>
                <div className="relative">
                  <Input
                    id="passportPath"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("passport.passportPath", file.name)
                        onFormDataChange({
                          passport: { ...watchedValues.passport, passportPath: file.name }
                        })
                      }
                    }}
                    className="hidden"
                  />
                  {watchedValues.passport?.passportPath ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Passport Document</p>
                        <p className="text-xs text-green-600">File uploaded successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("passport.passportPath", "")
                          onFormDataChange({
                            passport: { ...watchedValues.passport, passportPath: "" }
                          })
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => document.getElementById('passportPath')?.click()}
                      disabled={isViewMode}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Passport Document</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Permit */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Work Permit
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="workpermitNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Permit Number
                </Label>
                <Input
                  id="workpermitNumber"
                  {...register("workPermit.workpermitNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter work permit number"
                />

              </div>

              <div className="group">
                <Label htmlFor="workpermitExpiryDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Permit Expiry Date
                </Label>
                <Input
                  id="workpermitExpiryDate"
                  type="date"
                  {...register("workPermit.workpermitExpiryDate")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                />

              </div>

              <div className="group">
                <Label htmlFor="workPermitPath" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Work Permit Document
                </Label>
                <div className="relative">
                  <Input
                    id="workPermitPath"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("workPermit.workPermitPath", file.name)
                        onFormDataChange({
                          workPermit: { ...watchedValues.workPermit, workPermitPath: file.name }
                        })
                      }
                    }}
                    className="hidden"
                  />
                  {watchedValues.workPermit?.workPermitPath ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Work Permit Document</p>
                        <p className="text-xs text-green-600">File uploaded successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("workPermit.workPermitPath", "")
                          onFormDataChange({
                            workPermit: { ...watchedValues.workPermit, workPermitPath: "" }
                          })
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => document.getElementById('workPermitPath')?.click()}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Work Permit Document</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Labour Card */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Labour Card
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="labourCardNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Labour Card Number
                </Label>
                <Input
                  id="labourCardNumber"
                  {...register("labourCard.labourCardNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter labour card number"
                />

              </div>

              <div className="group">
                <Label htmlFor="labourcardExpiryDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Labour Card Expiry Date
                </Label>
                <Input
                  id="labourcardExpiryDate"
                  type="date"
                  {...register("labourCard.labourcardExpiryDate")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                />

              </div>

              <div className="group">
                <Label htmlFor="labourCardPath" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Labour Card Document
                </Label>
                <div className="relative">
                  <Input
                    id="labourCardPath"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setValue("labourCard.labourCardPath", file.name)
                        onFormDataChange({
                          labourCard: { ...watchedValues.labourCard, labourCardPath: file.name }
                        })
                      }
                    }}
                    className="hidden"
                  />
                  {watchedValues.labourCard?.labourCardPath ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileCheck className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Labour Card Document</p>
                        <p className="text-xs text-green-600">File uploaded successfully</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setValue("labourCard.labourCardPath", "")
                          onFormDataChange({
                            labourCard: { ...watchedValues.labourCard, labourCardPath: "" }
                          })
                        }}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => document.getElementById('labourCardPath')?.click()}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                    >
                      <Upload className="h-6 w-6 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Upload Labour Card Document</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* <Separator />

          {/* Employee Cards */}
          {/* <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Employee Cards
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={addCard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Card
              </Button>
            </div>
            
            <div className="space-y-4">
              {watchedValues.cards?.map((card, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">Card - {card.cardNumber || `CARD${index + 1}`}</h4>
                    <div className="flex items-center gap-2">
                      {card.isPrimaryCard && (
                        <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                      )}
                      {watchedValues.cards && watchedValues.cards.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCard(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Card Number</Label>
                      <Input
                        {...register(`cards.${index}.cardNumber`)}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300"
                        placeholder="Enter card number"
                      />

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Effective From</Label>
                      <Input
                        type="date"
                        {...register(`cards.${index}.effectiveFrom`)}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300"
                      />

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Effective To</Label>
                      <Input
                        type="date"
                        {...register(`cards.${index}.effectiveTo`)}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300"
                      />

                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <Switch
                        checked={card.isPrimaryCard}
                        onCheckedChange={(checked) => {
                          setValue(`cards.${index}.isPrimaryCard`, checked)
                          onFormDataChange({
                            cards: watchedValues.cards?.map((c, i) => 
                              i === index ? { ...c, isPrimaryCard: checked } : c
                            )
                          })
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
                      />
                      <Label className="text-sm text-gray-700 font-medium cursor-pointer">
                        {card.isPrimaryCard ? (
                          <span className="text-blue-600">Primary Card</span>
                        ) : (
                          <span className="text-gray-500">Set as Primary</span>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* <Separator />

          {/* Document Categories */}
          {/* <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Document Categories
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={addDocument}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Document
              </Button>
            </div>

            <div className="space-y-4">
              {watchedValues.documents?.map((doc, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">{doc.documentTypeTitle || `Document ${index + 1}`}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Document</Badge>
                      {watchedValues.documents && watchedValues.documents.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Document Type Code</Label>
                      <Select
                        value={doc.documentTypeCode}
                        onValueChange={(value) => {
                          const option = documentTypeOptions.find(opt => opt.code === value)
                          setValue(`documents.${index}.documentTypeCode`, value)
                          setValue(`documents.${index}.documentTypeTitle`, option?.title || "")
                          onFormDataChange({
                            documents: watchedValues.documents?.map((d, i) => 
                              i === index ? { ...d, documentTypeCode: value, documentTypeTitle: option?.title || "" } : d
                            )
                          })
                        }}
                      >
                        <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypeOptions.map((option) => (
                            <SelectItem key={option.code} value={option.code}>
                              {option.code} - {option.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Document Type Title</Label>
                                              <div className="h-10 px-4 py-2 border-2 rounded-lg flex items-center font-medium transition-all duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800">
                        {doc.documentTypeTitle || "Will auto-fill from code"}
                      </div>

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Identification Number</Label>
                      <Input
                        {...register(`documents.${index}.identificationNumber`)}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                        placeholder="Enter identification number"
                      />
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Upload Document</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setValue(`documents.${index}.documentPath`, file.name)
                              onFormDataChange({
                                documents: watchedValues.documents?.map((d, i) => 
                                  i === index ? { ...d, documentPath: file.name } : d
                                )
                              })
                            }
                          }}
                          className="hidden"
                        />
                        {doc.documentPath ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <FileCheck className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800">{doc.documentTypeTitle}</p>
                              <p className="text-xs text-green-600">File uploaded successfully</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setValue(`documents.${index}.documentPath`, "")
                                onFormDataChange({
                                  documents: watchedValues.documents?.map((d, i) => 
                                    i === index ? { ...d, documentPath: "" } : d
                                  )
                                })
                              }}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
                              if (input) input.click()
                            }}
                            className="w-full flex items-center justify-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                          >
                            <Upload className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Upload {doc.documentTypeTitle}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          <Separator />

          {/* Insurance Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Insurance Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="group">
                <Label htmlFor="insuranceNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Insurance Number
                </Label>
                <Input
                  id="insuranceNumber"
                  {...register("insuranceNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter insurance number"
                />
              </div>

              <div className="group">
                <Label htmlFor="mediclaimPolicyNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Mediclaim Policy Number
                </Label>
                <Input
                  id="mediclaimPolicyNumber"
                  {...register("mediclaimPolicyNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter mediclaim policy number"
                />
              </div>

              <div className="group">
                <Label htmlFor="WCPolicyNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  WC Policy Number
                </Label>
                <Input
                  id="WCPolicyNumber"
                  {...register("WCPolicyNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter WC policy number"
                />
              </div>

              <div className="group">
                <Label htmlFor="accidentPolicyNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Accident Policy Number
                </Label>
                <Input
                  id="accidentPolicyNumber"
                  {...register("accidentPolicyNumber")}
                  disabled={isViewMode}
                  className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white"
                  placeholder="Enter accident policy number"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Uploaded Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Uploaded Documents
              </h3>
              <Button
                type="button"
                disabled={isViewMode}
                onClick={addUploadedDocument}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Document
              </Button>
            </div>

            <div className="space-y-4">
              {(watchedValues.uploadedDocuments && watchedValues.uploadedDocuments.length > 0) ? watchedValues.uploadedDocuments.map((doc, index) => (
                <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800">
                      {doc.documentCategory?.documentCategoryTitle || "Document Category"} - {doc.documentType?.documentTypeTitle || "Document Type"}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">Uploaded</Badge>
                      {(watchedValues.uploadedDocuments?.length || 0) > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeUploadedDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Document Category</Label>
                      <Select
                        value={doc.documentCategory?.documentCategoryCode || ""}
                        disabled={isViewMode}
                        onValueChange={(value) => handleDocumentCategoryChange(value, index)}
                      >
                        <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300">
                          <SelectValue placeholder="Select category" />
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

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Document Type</Label>
                      <Select
                        value={doc.documentType?.documentTypeCode || ""}
                        disabled={isViewMode || !doc.documentCategory?.documentCategoryCode}
                        onValueChange={(value) => handleDocumentTypeChange(value, index)}
                      >
                        <SelectTrigger className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {!doc.documentCategory?.documentCategoryCode ? (
                            <SelectItem value="no-category" disabled>Select document category first</SelectItem>
                          ) : (() => {
                            // Get document types for the selected category
                            const selectedCategory = organizationData?.documentMaster?.documentCategory?.find(
                              (cat: any) => cat.documentCategoryCode === doc.documentCategory?.documentCategoryCode
                            )
                            const documentTypes = selectedCategory?.documentType || []
                            
                            return documentTypes.length > 0 ? (
                              documentTypes.map((docType: string, typeIndex: number) => (
                                <SelectItem key={`${doc.documentCategory?.documentCategoryCode}-${typeIndex}`} value={docType}>
                                  {docType}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-types" disabled>No document types available for this category</SelectItem>
                            )
                          })()}
                        </SelectContent>
                      </Select>

                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Identification Number</Label>
                      <Input
                        {...register(`uploadedDocuments.${index}.identificationNumber`)}
                        disabled={isViewMode}
                        className="h-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 rounded-lg transition-all duration-300 group-hover:border-gray-300 bg-white"
                        placeholder="Enter identification number"
                        onChange={(e) => {
                          setValue(`uploadedDocuments.${index}.identificationNumber`, e.target.value)
                          onFormDataChange({
                            uploadedDocuments: watchedValues.uploadedDocuments?.map((d, i) => 
                              i === index ? { ...d, identificationNumber: e.target.value } : d
                            )
                          })
                        }}
                      />
                      {showErrors && errors.uploadedDocuments?.[index]?.identificationNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.uploadedDocuments[index]?.identificationNumber?.message}
                        </p>
                      )}
                    </div>
                    <div className="group">
                      <Label className="text-sm font-medium text-gray-700">Upload Document</Label>
                      <div className="relative">
                        <Input
                          id={`uploadedDocument-${index}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          disabled={isViewMode}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setValue(`uploadedDocuments.${index}.documentPath`, file.name)
                              onFormDataChange({
                                uploadedDocuments: watchedValues.uploadedDocuments?.map((d, i) => 
                                  i === index ? { ...d, documentPath: file.name } : d
                                )
                              })
                            }
                          }}
                          className="hidden"
                        />
                        {doc.documentPath ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <FileCheck className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800">{doc.documentType?.documentTypeTitle || "Document"}</p>
                              <p className="text-xs text-green-600">File uploaded successfully</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isViewMode}
                              onClick={() => {
                                setValue(`uploadedDocuments.${index}.documentPath`, "")
                                onFormDataChange({
                                  uploadedDocuments: watchedValues.uploadedDocuments?.map((d, i) => 
                                    i === index ? { ...d, documentPath: "" } : d
                                  )
                                })
                              }}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            disabled={isViewMode}
                            onClick={() => {
                              const input = document.getElementById(`uploadedDocument-${index}`) as HTMLInputElement
                              if (input) input.click()
                            }}
                            className="w-full flex items-center justify-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50/50"
                          >
                            <Upload className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Upload {doc.documentType?.documentTypeTitle || "Document"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No documents uploaded yet</p>
                  <p className="text-sm">Click "Add Document" to start uploading documents</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isViewMode && (
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {onPreviousTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPreviousTab}
                  className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Back
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent text-gray-700 hover:text-gray-900 transition-colors"
              >
                Reset Form
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : showErrors ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                <span className={`text-sm font-medium ${isValid ? 'text-green-700' : showErrors ? 'text-red-700' : 'text-gray-700'}`}>
                  {isValid ? 'Form is valid and ready to continue' : showErrors ? 'Please fix validation errors' : 'Please complete all required fields'}
                </span>
              </div>
              
              <Button
                type="button"
                onClick={handleSaveAndContinue}
                className="px-6 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg text-white font-medium transition-all duration-300"
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 