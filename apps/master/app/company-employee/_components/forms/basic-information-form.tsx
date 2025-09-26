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
import { User, Building2, Mail, Calendar, Globe, Clock, Camera, Upload, X, RotateCcw, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"
import { useSearchParams } from "next/navigation"

// Zod Schema for validation
const basicInformationSchema = z.object({
  employeeID: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be less than 50 characters"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select a gender",
  }),
  birthDate: z.string().optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  photo: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.enum(["Unmarried", "Married", "Divorced", "Widowed"]).optional(),
  joiningDate: z.string().min(1, "Joining date is required").refine((date) => {
    const joiningDate = new Date(date)
    const today = new Date()
    return joiningDate <= today
  }, "Joining date cannot be in the future"),
  emailID: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits").regex(/^\d{12}$/, "Aadhar number must contain only digits"),
})

type BasicInformationData = z.infer<typeof basicInformationSchema>

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
  mode = "add",
  auditStatus,
  auditStatusFormData,
  setAuditStatus,
  setAuditStatusFormData,
  activeTab
}: BasicInformationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>(formData?.photo || "")
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
      employeeID: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      birthDate: "",
      bloodGroup: undefined,
      photo: "",
      nationality: "",
      maritalStatus: undefined,
      joiningDate: "",
      emailID: "",
      aadharNumber: "",
    },
    mode: "onChange",
  })

  const {
    post: postBasicInformation,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "company_employee",
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

  // Component mount initialization - set default values based on mode
  useEffect(() => {
    console.log("Component mount initialization - currentMode:", currentMode);
    if (currentMode === "add" && auditStatusFormData) {
      console.log("Initializing from auditStatusFormData:", auditStatusFormData);
      setValue("employeeID", auditStatusFormData.employeeID || "");
      setValue("firstName", auditStatusFormData.firstName || "");
      setValue("middleName", auditStatusFormData.middleName || "");
      setValue("lastName", auditStatusFormData.lastName || "");
      setValue("gender", auditStatusFormData.gender || undefined);
      setValue("birthDate", auditStatusFormData.birthDate || "");
      setValue("bloodGroup", auditStatusFormData.bloodGroup || undefined);
      setValue("photo", auditStatusFormData.photo || "");
      setValue("nationality", auditStatusFormData.nationality || "");
      setValue("maritalStatus", auditStatusFormData.maritalStatus || undefined);
      setValue("joiningDate", auditStatusFormData.joiningDate || "");
      setValue("emailID", auditStatusFormData.emailID || "");
      setValue("aadharNumber", auditStatusFormData.aadharNumber || "");
      
      // Update photo preview when photo changes
      if (auditStatusFormData.photo) {
        setPhotoPreview(auditStatusFormData.photo);
      }
    } else if ((currentMode === "edit" || currentMode === "view") && formData) {
      console.log("Initializing from formData:", formData);
      setValue("employeeID", formData.employeeID || "");
      setValue("firstName", formData.firstName || "");
      setValue("middleName", formData.middleName || "");
      setValue("lastName", formData.lastName || "");
      setValue("gender", formData.gender || undefined);
      setValue("birthDate", formData.birthDate || "");
      setValue("bloodGroup", formData.bloodGroup || undefined);
      setValue("photo", formData.photo || "");
      setValue("nationality", formData.nationality || "");
      setValue("maritalStatus", formData.maritalStatus || undefined);
      setValue("joiningDate", formData.joiningDate || "");
      setValue("emailID", formData.emailID || "");
      setValue("aadharNumber", formData.aadharNumber || "");
      
      // Update photo preview when photo changes
      if (formData.photo) {
        setPhotoPreview(formData.photo);
      }
    }
  }, [currentMode, auditStatusFormData, formData, setValue]);

  // Force re-render when auditStatusFormData changes in add mode
  useEffect(() => {
    if (currentMode === "add" && auditStatusFormData) {
      console.log("auditStatusFormData changed in add mode, forcing re-render");
      // Re-set current values to trigger re-render
      const currentValues = watch();
      setTimeout(() => {
        setValue("employeeID", currentValues.employeeID || "");
        setValue("firstName", currentValues.firstName || "");
        setValue("middleName", currentValues.middleName || "");
        setValue("lastName", currentValues.lastName || "");
        setValue("gender", currentValues.gender || undefined);
        setValue("birthDate", currentValues.birthDate || "");
        setValue("bloodGroup", currentValues.bloodGroup || undefined);
        setValue("photo", currentValues.photo || "");
        setValue("nationality", currentValues.nationality || "");
        setValue("maritalStatus", currentValues.maritalStatus || undefined);
        setValue("joiningDate", currentValues.joiningDate || "");
        setValue("emailID", currentValues.emailID || "");
        setValue("aadharNumber", currentValues.aadharNumber || "");
      }, 100);
    }
  }, [auditStatusFormData, currentMode, setValue, watch]);

  // Update form values based on mode
  useEffect(() => {
      if (auditStatusFormData) {
        setValue("employeeID", auditStatusFormData.employeeID || "");
        setValue("firstName", auditStatusFormData.firstName || "");
        setValue("middleName", auditStatusFormData.middleName || "");
        setValue("lastName", auditStatusFormData.lastName || "");
        setValue("gender", auditStatusFormData.gender || undefined);
        setValue("birthDate", auditStatusFormData.birthDate || "");
        setValue("bloodGroup", auditStatusFormData.bloodGroup || undefined);
        setValue("photo", auditStatusFormData.photo || "");
        setValue("nationality", auditStatusFormData.nationality || "");
        setValue("maritalStatus", auditStatusFormData.maritalStatus || undefined);
        setValue("joiningDate", auditStatusFormData.joiningDate || "");
        setValue("emailID", auditStatusFormData.emailID || "");
        setValue("aadharNumber", auditStatusFormData.aadharNumber || "");
        
        // Update photo preview when photo changes
        if (auditStatusFormData.photo) {
          setPhotoPreview(auditStatusFormData.photo);
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
      employeeID: currentValues.employeeID || "",
      firstName: currentValues.firstName || "",
      middleName: currentValues.middleName || "",
      lastName: currentValues.lastName || "",
      gender: currentValues.gender || undefined,
      birthDate: currentValues.birthDate || "",
      bloodGroup: currentValues.bloodGroup || undefined,
      photo: currentValues.photo || "",
      nationality: currentValues.nationality || "",
      maritalStatus: currentValues.maritalStatus || undefined,
      joiningDate: currentValues.joiningDate || "",
      emailID: currentValues.emailID || "",
      aadharNumber: currentValues.aadharNumber || "",
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
        setValue("photo", result)
        
        // Update form data for parent component with only the exact fields
        const currentValues = watch()
        const exactData = {
          employeeID: currentValues.employeeID || "",
          firstName: currentValues.firstName || "",
          middleName: currentValues.middleName || "",
          lastName: currentValues.lastName || "",
          gender: currentValues.gender || undefined,
          birthDate: currentValues.birthDate || "",
          bloodGroup: currentValues.bloodGroup || undefined,
          photo: result || "",
          nationality: currentValues.nationality || "",
          maritalStatus: currentValues.maritalStatus || undefined,
          joiningDate: currentValues.joiningDate || "",
          emailID: currentValues.emailID || "",
          aadharNumber: currentValues.aadharNumber || "",
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
    setValue("photo", "")
    
    // Update form data for parent component with only the exact fields
    const currentValues = watch()
    const exactData = {
      employeeID: currentValues.employeeID || "",
      firstName: currentValues.firstName || "",
      middleName: currentValues.middleName || "",
      lastName: currentValues.lastName || "",
      gender: currentValues.gender || undefined,
      birthDate: currentValues.birthDate || "",
      bloodGroup: currentValues.bloodGroup || undefined,
      photo: "",
      nationality: currentValues.nationality || "",
      maritalStatus: currentValues.maritalStatus || undefined,
      joiningDate: currentValues.joiningDate || "",
      emailID: currentValues.emailID || "",
      aadharNumber: currentValues.aadharNumber || "",
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
      employeeID: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      birthDate: "",
      bloodGroup: undefined,
      photo: "",
      nationality: "",
      maritalStatus: undefined,
      joiningDate: "",
      emailID: "",
      aadharNumber: "",
    })
    setPhotoPreview("")
    setPhotoFile(null)
    setShowErrors(false)
    
    // Clear only the exact fields that should be submitted
    const clearedData = {
      employeeID: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: undefined,
      birthDate: "",
      bloodGroup: undefined,
      photo: "",
      nationality: "",
      maritalStatus: undefined,
      joiningDate: "",
      emailID: "",
      aadharNumber: "",
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
      'employeeID', 'firstName', 'lastName', 'gender', 'joiningDate', 'aadharNumber'
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
        employeeID: formValues.employeeID || "",
        firstName: formValues.firstName || "",
        middleName: formValues.middleName || "",
        lastName: formValues.lastName || "",
        gender: formValues.gender || undefined,
        birthDate: formValues.birthDate || "",
        bloodGroup: formValues.bloodGroup || undefined,
        photo: formValues.photo || "",
        nationality: formValues.nationality || "",
        maritalStatus: formValues.maritalStatus || undefined,
        joiningDate: formValues.joiningDate || "",
        emailID: formValues.emailID || "",
        aadharNumber: formValues.aadharNumber || "",
      }
      
      // Update form data based on mode
      if (currentMode === "add") {
        setAuditStatusFormData?.({
          ...auditStatusFormData,
          ...exactData,
        })
        setAuditStatus?.({
          ...auditStatus,
          basicInformation: true
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
          id: auditStatusFormData?._id || null,
          collectionName: "company_employee",
          data: {
            ...auditStatusFormData,
            ...exactData,
            basicInformation: true
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
                <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Essential personal details and identification
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Profile Photo and Employee Details in One Row */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Profile Photo Section */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Profile Photo
                </h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Profile preview"
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
                      {...register("photo")}
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("photo")?.click()}
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

              {/* Employee Details Section */}
              <div className="lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Employee Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="group">
                    <Label htmlFor="employeeID" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Employee ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("employeeID")}
                      id="employeeID"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.employeeID) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter employee ID (e.g., EMP001)"
                    />
                    {showErrors && errors.employeeID && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.employeeID.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("firstName")}
                      id="firstName"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.firstName) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter first name"
                    />
                    {showErrors && errors.firstName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="middleName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Middle Name
                    </Label>
                    <Input
                      {...register("middleName")}
                      id="middleName"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.middleName) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter middle name"
                    />
                    {showErrors && errors.middleName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.middleName.message}
                      </p>
                    )}
                  </div>
                  <div className="group">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("lastName")}
                      id="lastName"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.lastName) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter last name"
                    />
                    {showErrors && errors.lastName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Additional Personal Information */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className="group">
                 <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 mb-2 block">
                   Gender <span className="text-red-500">*</span>
                 </Label>
                 <Select 
                   value={watchedValues.gender || ""} 
                   onValueChange={(value) => handleInputChange("gender", value)}
                   disabled={isViewMode}
                   key={`gender-${watchedValues.gender || 'empty'}`}
                 >
                   <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                     isViewMode 
                       ? "bg-gray-100 cursor-not-allowed" 
                       : ""
                   } ${
                     (showErrors && errors.gender) 
                       ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                       : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                   }`}>
                     <SelectValue placeholder="Select Gender" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-2 bg-white">
                     <SelectItem value="male">Male</SelectItem>
                     <SelectItem value="female">Female</SelectItem>
                     <SelectItem value="other">Other</SelectItem>
                     <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                   </SelectContent>
                 </Select>
                 {showErrors && errors.gender && (
                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                     <X className="h-3 w-3" />
                     {errors.gender.message}
                   </p>
                 )}
               </div>

              <div className="group">
                <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Nationality
                </Label>
                <Input
                  {...register("nationality")}
                  id="nationality"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.nationality) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter nationality"
                />
                {showErrors && errors.nationality && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.nationality.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="emailID" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </Label>
                <Input
                  {...register("emailID")}
                  id="emailID"
                  type="email"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.emailID) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="Enter email address"
                />
                {showErrors && errors.emailID && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.emailID.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="birthDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date of Birth
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
                 <Label htmlFor="bloodGroup" className="text-sm font-semibold text-gray-700 mb-2 block">
                   Blood Group
                 </Label>
                 <Select 
                   value={watchedValues.bloodGroup || ""} 
                   onValueChange={(value) => handleInputChange("bloodGroup", value)}
                   disabled={isViewMode}
                   key={`bloodGroup-${watchedValues.bloodGroup || 'empty'}`}
                 >
                   <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                     isViewMode 
                       ? "bg-gray-100 cursor-not-allowed" 
                       : ""
                   } ${
                     (showErrors && errors.bloodGroup) 
                       ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                       : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                   }`}>
                     <SelectValue placeholder="Select Blood Group" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-2 bg-white">
                     <SelectItem value="A+">A+</SelectItem>
                     <SelectItem value="A-">A-</SelectItem>
                     <SelectItem value="B+">B+</SelectItem>
                     <SelectItem value="B-">B-</SelectItem>
                     <SelectItem value="AB+">AB+</SelectItem>
                     <SelectItem value="AB-">AB-</SelectItem>
                     <SelectItem value="O+">O+</SelectItem>
                     <SelectItem value="O-">O-</SelectItem>
                   </SelectContent>
                 </Select>
                 {showErrors && errors.bloodGroup && (
                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                     <X className="h-3 w-3" />
                     {errors.bloodGroup.message}
                   </p>
                 )}
               </div>

                             <div className="group">
                 <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-700 mb-2 block">
                   Marital Status
                 </Label>
                 <Select 
                   value={watchedValues.maritalStatus || ""} 
                   onValueChange={(value) => handleInputChange("maritalStatus", value)}
                   disabled={isViewMode}
                   key={`maritalStatus-${watchedValues.maritalStatus || 'empty'}`}
                 >
                   <SelectTrigger className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 bg-white ${
                     isViewMode 
                       ? "bg-gray-100 cursor-not-allowed" 
                       : ""
                   } ${
                     (showErrors && errors.maritalStatus) 
                       ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                       : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                   }`}>
                     <SelectValue placeholder="Select Marital Status" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-2 bg-white">
                     <SelectItem value="Unmarried">Unmarried</SelectItem>
                     <SelectItem value="Married">Married</SelectItem>
                     <SelectItem value="Divorced">Divorced</SelectItem>
                     <SelectItem value="Widowed">Widowed</SelectItem>
                   </SelectContent>
                 </Select>
                 {showErrors && errors.maritalStatus && (
                   <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                     <X className="h-3 w-3" />
                     {errors.maritalStatus.message}
                   </p>
                 )}
               </div>

              <div className="group">
                <Label htmlFor="joiningDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Joining Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("joiningDate")}
                  id="joiningDate"
                  type="date"
                  disabled={isViewMode}
                  className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                    isViewMode 
                      ? "bg-gray-100 cursor-not-allowed" 
                      : ""
                  } ${
                    (showErrors && errors.joiningDate) 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {showErrors && errors.joiningDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.joiningDate.message}
                  </p>
                )}
              </div>

              <div className="group">
                <Label htmlFor="aadharNumber" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <User className="h-4 w-4 inline mr-1" />
                  Aadhar Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("aadharNumber")}
                  id="aadharNumber"
                  type="text"
                  maxLength={12}
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
                  placeholder="Enter 12-digit Aadhar number"
                />
                {showErrors && errors.aadharNumber && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.aadharNumber.message}
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