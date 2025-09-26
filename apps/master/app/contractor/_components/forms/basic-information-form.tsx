"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Separator } from "@repo/ui/components/ui/separator"
import { Button } from "@repo/ui/components/ui/button"

import { User, Building2, Mail, Calendar, Globe, Clock, Camera, Upload, X, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"

// Zod Schema for validation
const basicInformationSchema = z.object({
  contractorName: z.string().min(1, "Contractor name is required"),
  contractorCode: z.string().min(1, "Contractor code is required"),
  aadharNumber: z.string()
    .min(1, "Aadhar number is required")
    .regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
  panNumber: z.string().optional(),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerContactNo: z.string()
    .min(1, "Owner contact number is required")
    .regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  ownerEmailId: z.string().email("Invalid email format"),
  fatherName: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonContactNo: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true; // Allow empty
      return /^\d{10}$/.test(val);
    }, "Contact number must be exactly 10 digits"),
  contactPersonEmailId: z.union([
    z.string().email("Invalid email format"),
    z.literal("")
  ]).optional(),
  birthDate: z.string().optional(),
  workLocation: z.string().optional(),
  contractorImage: z.string().optional().or(z.literal("")),
  serviceSince: z.string().min(1, "Service since date is required"),
})

type BasicInformationData = z.infer<typeof basicInformationSchema>

// Helper function to format Aadhar number
const formatAadharNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  // Limit to 12 digits
  const limitedDigits = digits.substring(0, 12);
  // Format as XXXX XXXX XXXX
  return limitedDigits.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3').trim();
};

// Helper function to get unformatted Aadhar number
const getUnformattedAadhar = (value: string) => {
  return value.replace(/\s/g, '');
};

// Helper function to format phone number
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  // Limit to 10 digits
  return digits.substring(0, 10);
};

interface BasicInformationFormProps {
  formData: any
  onFormDataChange: (data: Partial<BasicInformationData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function BasicInformationForm({ 
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
}: BasicInformationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>(formData?.contractorImage || "")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  
  // Get the "id" and "mode" values from the URL query parameters
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const modeParam = searchParams.get("mode");
  const currentMode = (modeParam === "add" || modeParam === "edit" || modeParam === "view") ? modeParam : "add";

  const isViewMode = currentMode === "view"



  // Helper function to convert dd-mm-yyyy to yyyy-mm-dd
  const convertDateFormat = (dateString: string) => {
    if (!dateString) return "";
    // Check if it's already in yyyy-mm-dd format
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      return dateString;
    }
    // Convert from dd-mm-yyyy to yyyy-mm-dd
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }

  const {
    register,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
    reset,
  } = useForm<BasicInformationData>({
    resolver: zodResolver(basicInformationSchema),
    defaultValues: {
      contractorName: "",
      contractorCode: "",
      ownerName: "",
      ownerContactNo: "",
      ownerEmailId: "",
      fatherName: "",
      contactPersonName: "",
      contactPersonContactNo: "",
      contactPersonEmailId: "",
      birthDate: "",
      workLocation: "",
      aadharNumber: "",
      panNumber: "",
      contractorImage: "",
      serviceSince: "",
    },
    mode: "onChange",
  })

  const {
    post: postBasicInformation,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contractor",
    onSuccess: (data) => {
      console.log("Basic information saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving basic information:", error)
    },
  });

  // Update form values based on mode
  useEffect(() => {
    
      // In add mode, get values from auditStatusFormData
      if (auditStatusFormData) {
        setValue("contractorName", auditStatusFormData.contractorName || "");
        setValue("contractorCode", auditStatusFormData.contractorCode || "");
        setValue("ownerName", auditStatusFormData.ownerName || "");
        setValue("ownerContactNo", auditStatusFormData.ownerContactNo || "");
        setValue("ownerEmailId", auditStatusFormData.ownerEmailId || "");
        setValue("fatherName", auditStatusFormData.fatherName || "");
        setValue("contactPersonName", auditStatusFormData.contactPersonName || "");
        setValue("contactPersonContactNo", auditStatusFormData.contactPersonContactNo || "");
        setValue("contactPersonEmailId", auditStatusFormData.contactPersonEmailId || "");
        setValue("birthDate", auditStatusFormData.birthDate || "");
        setValue("workLocation", auditStatusFormData.workLocation || "");
        setValue("aadharNumber", auditStatusFormData.aadharNumber || "");
        setValue("panNumber", auditStatusFormData.panNumber || "");
        setValue("contractorImage", auditStatusFormData.contractorImage || "");
        setValue("serviceSince", auditStatusFormData.serviceSince || "");
        
        // Update photo preview when photo changes
        if (auditStatusFormData.contractorImage) {
          setPhotoPreview(auditStatusFormData.contractorImage);
        }
      }
    
    // Trigger validation after setting all values
    setTimeout(() => {
      trigger();
    }, 100);
  }, [ auditStatusFormData, currentMode, setValue, trigger]);

  const handleInputChange = async (field: keyof BasicInformationData, value: string) => {
    setValue(field, value)
    await trigger(field)
    
    // Update form data for parent component with only the exact fields
    const currentValues = watch()
    const exactData = {
      contractorName: currentValues.contractorName || "",
      contractorCode: currentValues.contractorCode || "",
      ownerName: currentValues.ownerName || "",
      ownerContactNo: currentValues.ownerContactNo || "",
      ownerEmailId: currentValues.ownerEmailId || "",
      fatherName: currentValues.fatherName || "",
      contactPersonName: currentValues.contactPersonName || "",
      contactPersonContactNo: currentValues.contactPersonContactNo || "",
      contactPersonEmailId: currentValues.contactPersonEmailId || "",
      birthDate: currentValues.birthDate || "",
      workLocation: currentValues.workLocation || "",
      aadharNumber: currentValues.aadharNumber || "",
      panNumber: currentValues.panNumber || "",
      contractorImage: currentValues.contractorImage || "defaultImage.png",
      serviceSince: currentValues.serviceSince || "",
    }
    
    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }



  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        setValue("contractorImage", result)
        
        // Update form data for parent component with only the exact fields
        const currentValues = watch()
        const exactData = {
          contractorName: currentValues.contractorName || "",
          contractorCode: currentValues.contractorCode || "",
          ownerName: currentValues.ownerName || "",
          ownerContactNo: currentValues.ownerContactNo || "",
          ownerEmailId: currentValues.ownerEmailId || "",
          fatherName: currentValues.fatherName || "",
          contactPersonName: currentValues.contactPersonName || "",
          contactPersonContactNo: currentValues.contactPersonContactNo || "",
          contactPersonEmailId: currentValues.contactPersonEmailId || "",
          birthDate: currentValues.birthDate || "",
          workLocation: currentValues.workLocation || "",
          aadharNumber: currentValues.aadharNumber || "",
          contractorImage: result || "defaultImage.png",
          panNumber: currentValues.panNumber || "",
          serviceSince: currentValues.serviceSince || "",
        }
        
        // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
        if (currentMode === "add") {
          setAuditStatusFormData?.({
            ...auditStatusFormData,
            ...exactData
          })
        } else {
          onFormDataChange(exactData)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview("")
    setPhotoFile(null)
    setValue("contractorImage", "")
    
    // Update form data for parent component with only the exact fields
    const currentValues = watch()
    const exactData = {
      contractorName: currentValues.contractorName || "",
      contractorCode: currentValues.contractorCode || "",
      ownerName: currentValues.ownerName || "",
      ownerContactNo: currentValues.ownerContactNo || "",
      ownerEmailId: currentValues.ownerEmailId || "",
      fatherName: currentValues.fatherName || "",
      contactPersonName: currentValues.contactPersonName || "",
      contactPersonContactNo: currentValues.contactPersonContactNo || "",
      contactPersonEmailId: currentValues.contactPersonEmailId || "",
      birthDate: currentValues.birthDate || "",
      workLocation: currentValues.workLocation || "",
      aadharNumber: currentValues.aadharNumber || "",
      contractorImage: "defaultImage.png",
      panNumber: currentValues.panNumber || "",
      serviceSince: currentValues.serviceSince || "",
    }
    
    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...exactData
      })
    } else {
      onFormDataChange(exactData)
    }
  }

  const handleReset = () => {
    reset({
      contractorName: "",
      contractorCode: "",
      ownerName: "",
      ownerContactNo: "",
      ownerEmailId: "",
      fatherName: "",
      contactPersonName: "",
      contactPersonContactNo: "",
      contactPersonEmailId: "",
      birthDate: "",
      workLocation: "",
      aadharNumber: "",
      panNumber: "",
      contractorImage: "",
      serviceSince: "",
    })
    setPhotoPreview("")
    setPhotoFile(null)
    setShowErrors(false)
    
    // Clear only the exact fields that should be submitted
    const clearedData = {
      contractorName: "",
      contractorCode: "",
      ownerName: "",
      ownerContactNo: "",
      ownerEmailId: "",
      fatherName: "",
      contactPersonName: "",
      contactPersonContactNo: "",
      contactPersonEmailId: "",
      birthDate: "",
      workLocation: "",
      aadharNumber: "",
      panNumber: "",
      contractorImage: "defaultImage.png",
      serviceSince: "",
    }
    
    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
    if (currentMode === "add") {
      setAuditStatusFormData?.({
        ...auditStatusFormData,
        ...clearedData
      })
    } else {
      onFormDataChange(clearedData)
    }
  }

  const handleSaveAndContinue = async () => {
    setShowErrors(true)
    const isValid = await trigger()
    
    // Debug: Log all form values and errors
    const formValues = watch()
    // Check which specific fields are failing validation
    const requiredFields = [
      'contractorName', 'contractorCode', 'aadharNumber', 'ownerName', 'ownerContactNo', 
      'ownerEmailId', 'contactPersonName', 'contactPersonContactNo', 'serviceSince'
    ]
    
    const failingFields = requiredFields.filter(field => {
      const value = formValues[field as keyof BasicInformationData]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    
    if (failingFields.length > 0) {
      console.log("Failing required fields:", failingFields)
      console.log("Missing values:", failingFields.map(field => ({ field, value: formValues[field as keyof BasicInformationData] })))
    }

    if (isValid) {
      const formValues = watch()
      
      // Create the exact JSON structure as requested
      const exactData = {
        contractorName: formValues.contractorName || "",
        contractorCode: formValues.contractorCode || "",
        ownerName: formValues.ownerName || "",
        ownerContactNo: formValues.ownerContactNo || "",
        ownerEmailId: formValues.ownerEmailId || "",
        fatherName: formValues.fatherName || "",
        contactPersonName: formValues.contactPersonName || "",
        contactPersonContactNo: formValues.contactPersonContactNo || "",
        contactPersonEmailId: formValues.contactPersonEmailId || "",
        birthDate: formValues.birthDate || "",
        workLocation: formValues.workLocation || "",
        aadharNumber: formValues.aadharNumber || "",
        panNumber: formValues.panNumber || "",
        contractorImage: formValues.contractorImage || "defaultImage.png",
        serviceSince: formValues.serviceSince || "",
      }
      
             // Update form data based on mode
       if (currentMode === "add") {
         setAuditStatusFormData?.({
           ...auditStatusFormData,
           ...exactData,
         })
         setAuditStatus?.({
           ...auditStatus,
           basicInformation:true
         })
         // In add mode, also move to next tab after saving
         if (onNextTab) {
           onNextTab()
         }
       } else if (currentMode === "edit") {
         // In edit mode, update parent formData and save to backend
         onFormDataChange(exactData)
         let json = {
           tenant: "Midhani",
           action: "insert",
           id: auditStatusFormData._id || null,
           collectionName: "contractor",
           data: {
             ...auditStatusFormData,
             ...exactData,
           }
         }
         postBasicInformation(json)
       } else {
         // In view mode, just update parent formData
         onFormDataChange(exactData)
         if (onNextTab) {
           onNextTab()
         }
       }
    }
  }

  const watchedValues = watch()

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
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Basic Information</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Essential contractor details and identification
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Profile Photo and Contractor Details in One Row */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Profile Photo Section */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Contractor Photo
                </h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Contractor preview"
                          className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          disabled={isViewMode}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      {...register("contractorImage")}
                      id="contractorImage"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("contractorImage")?.click()}
                      disabled={isViewMode}
                      className={`w-full h-10 border-2 border-gray-200 hover:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all duration-300 ${
                        isViewMode ? "bg-gray-100 cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                    {photoFile && (
                      <p className="text-xs text-gray-600 mt-2 text-center truncate">
                        {photoFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contractor Details Section */}
              <div className="lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Contractor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="group">
                    <Label htmlFor="contractorName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contractor Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("contractorName")}
                      id="contractorName"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.contractorName) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contractor name"
                    />
                    {showErrors && errors.contractorName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contractorName.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="contractorCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Contractor Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("contractorCode")}
                      id="contractorCode"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.contractorCode) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter contractor code"
                    />
                    {showErrors && errors.contractorCode && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.contractorCode.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="aadharNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Aadhar Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formatAadharNumber(watchedValues.aadharNumber || '')}
                      onChange={(e) => {
                        const unformattedValue = getUnformattedAadhar(e.target.value);
                        setValue("aadharNumber", unformattedValue);
                        handleInputChange("aadharNumber", unformattedValue);
                      }}
                      id="aadharNumber"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.aadharNumber) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14} // 12 digits + 2 spaces
                    />
                    {showErrors && errors.aadharNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.aadharNumber.message}
                      </p>
                    )}
                    {!errors.aadharNumber && (
                      <p className="text-gray-500 text-xs mt-1">Enter 12-digit Aadhar number</p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="panNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                      PAN Number
                    </Label>
                    <Input
                      {...register("panNumber")}
                      id="panNumber"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.panNumber) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter PAN number"
                    />
                    {showErrors && errors.panNumber && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.panNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Owner Information */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Owner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="ownerName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Owner Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("ownerName")}
                  id="ownerName"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.ownerName) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter owner name"
                />
                {showErrors && errors.ownerName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.ownerName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="ownerContactNo" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Owner Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={watchedValues.ownerContactNo || ''}
                  onChange={(e) => {
                    const formattedValue = formatPhoneNumber(e.target.value);
                    setValue("ownerContactNo", formattedValue);
                    handleInputChange("ownerContactNo", formattedValue);
                  }}
                  id="ownerContactNo"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.ownerContactNo) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter 10-digit contact number"
                  maxLength={10}
                />
                {showErrors && errors.ownerContactNo && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.ownerContactNo.message}
                  </p>
                )}
                {!errors.ownerContactNo && (
                  <p className="text-gray-500 text-xs mt-1">Enter 10-digit phone number</p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="ownerEmailId" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Owner Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("ownerEmailId")}
                  id="ownerEmailId"
                  type="email"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.ownerEmailId) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter owner email"
                />
                {showErrors && errors.ownerEmailId && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.ownerEmailId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Contact Person Information */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Contact Person Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                                 <Label htmlFor="contactPersonName" className="text-sm font-semibold text-gray-700 mb-2 block">
                   Contact Person Name
                 </Label>
                <Input
                  {...register("contactPersonName")}
                  id="contactPersonName"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.contactPersonName) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter contact person name"
                />
                {showErrors && errors.contactPersonName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contactPersonName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="contactPersonContactNo" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Contact Person Number
                </Label>
                <Input
                  value={watchedValues.contactPersonContactNo || ''}
                  onChange={(e) => {
                    const formattedValue = formatPhoneNumber(e.target.value);
                    setValue("contactPersonContactNo", formattedValue);
                    handleInputChange("contactPersonContactNo", formattedValue);
                  }}
                  id="contactPersonContactNo"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.contactPersonContactNo) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter 10-digit contact number"
                  maxLength={10}
                />
                {showErrors && errors.contactPersonContactNo && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contactPersonContactNo.message}
                  </p>
                )}
                {!errors.contactPersonContactNo && (
                  <p className="text-gray-500 text-xs mt-1">Enter 10-digit phone number (optional)</p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="contactPersonEmailId" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Contact Person Email
                </Label>
                <Input
                  {...register("contactPersonEmailId")}
                  id="contactPersonEmailId"
                  type="email"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.contactPersonEmailId) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter contact person email"
                />
                {showErrors && errors.contactPersonEmailId && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.contactPersonEmailId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Additional Information */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group">
                <Label htmlFor="serviceSince" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Service Since <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("serviceSince")}
                  id="serviceSince"
                  type="date"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.serviceSince) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {showErrors && errors.serviceSince && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.serviceSince.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Birth Date
                </Label>
                <Input
                  {...register("birthDate")}
                  id="birthDate"
                  type="date"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.birthDate) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {showErrors && errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.birthDate.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="fatherName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Father Name
                </Label>
                <Input
                  {...register("fatherName")}
                  id="fatherName"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.fatherName) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter father name"
                />
                {showErrors && errors.fatherName && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="workLocation" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Work Location
                </Label>
                <Input
                  {...register("workLocation")}
                  id="workLocation"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.workLocation) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter work location"
                />
                {showErrors && errors.workLocation && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.workLocation.message}
                  </p>
                )}
              </div>


            </div>
          </div>

          
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
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
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isValid ? 'Form is valid and ready to continue' : 'Please complete all required fields'}
              </span>
              {!isValid && showErrors && Object.keys(errors).length > 0 && (
                <div className="text-xs text-red-600 ml-2">
                  Errors: {Object.keys(errors).join(', ')}
                </div>
              )}
            </div>
            
            {!isViewMode && (
              <Button
                type="button"
                onClick={handleSaveAndContinue}
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