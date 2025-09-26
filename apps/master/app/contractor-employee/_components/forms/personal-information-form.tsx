"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import * as yup from "yup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select"
import { Separator } from "@repo/ui/components/ui/separator"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { User, Building2, Camera, Upload, X, RotateCcw, ArrowRight, Home, MapPin, Globe, Calendar, Heart, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest"

// Zod Schema for validation
const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.string().optional().refine((val) => {
    if (!val) return true; // Allow empty pin code
    return /^[0-9]{6}$/.test(val);
  }, "Pin Code must be 6 digits"),
  taluka: z.string().optional(),
  isVerified: z.boolean().optional(),
})

const temporaryAddressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional().refine((val) => {
    if (!val) return true; // Allow empty pin code
    return /^[0-9]{6}$/.test(val);
  }, "Pin Code must be 6 digits"),
  taluka: z.string().optional(),
  isVerified: z.boolean().optional(),
})

const personalInformationSchema = z.object({
  photo: z.string().optional(),
  employeeID: z.string().min(1, "Employee ID is required").max(20, "Employee ID must be less than 20 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name must be at least 1 character").max(50, "Last name must be less than 50 characters"),
  fatherHusbandName: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender" }),
  birthDate: z.string().optional().refine((date) => {
    if (!date) return true; // Allow empty date
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18 && age <= 100
  }, "Age must be between 18 and 100 years"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  nationality: z.string().min(2, "Nationality must be at least 2 characters").max(50, "Nationality must be less than 50 characters"),
  maritalStatus: z.enum(["Married", "Unmarried", "Divorced", "Widowed"]).optional(),
  address: z.object({
    permanentAddress: addressSchema,
    temporaryAddress: temporaryAddressSchema.optional(),
  }),
})

type PersonalInformationData = z.infer<typeof personalInformationSchema>

interface PersonalInformationFormProps {
  formData: any
  onFormDataChange: (data: Partial<PersonalInformationData>) => void
  onNextTab?: () => void
  onPreviousTab?: () => void
  mode?: "add" | "edit" | "view"
  auditStatus?: any
  auditStatusFormData?: any
  setAuditStatus?: (data: any) => void
  setAuditStatusFormData?: (data: any) => void
  activeTab?: string
}

export function PersonalInformationForm({ 
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
}: PersonalInformationFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>(formData?.photo || "")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [sameAsPermanentAddress, setSameAsPermanentAddress] = useState(false)
  
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
  } = useForm<PersonalInformationData>({
    resolver: zodResolver(personalInformationSchema),
    defaultValues: {
      photo: auditStatusFormData?.photo || "" ,
      employeeID: auditStatusFormData?.employeeID || "",
      firstName: auditStatusFormData?.firstName || "",
      middleName: auditStatusFormData?.middleName || "",
      lastName: auditStatusFormData?.lastName || "",
      fatherHusbandName: auditStatusFormData?.fatherHusbandName || "",
      gender: auditStatusFormData?.gender || undefined,
      birthDate: auditStatusFormData?.birthDate || "",
      bloodGroup: auditStatusFormData?.bloodGroup || undefined,
      nationality: auditStatusFormData?.nationality || "",
      maritalStatus: auditStatusFormData?.maritalStatus || undefined,
      address: {
        permanentAddress: {
          addressLine1: auditStatusFormData?.address?.permanentAddress?.addressLine1 || "",
          addressLine2: auditStatusFormData?.address?.permanentAddress?.addressLine2 || "",
          country: auditStatusFormData?.address?.permanentAddress?.country || "",
          state: auditStatusFormData?.address?.permanentAddress?.state || "",
          city: auditStatusFormData?.address?.permanentAddress?.city || "",
          pinCode: auditStatusFormData?.address?.permanentAddress?.pinCode || "",
          taluka: auditStatusFormData?.address?.permanentAddress?.taluka || "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: auditStatusFormData?.address?.temporaryAddress?.addressLine1 || "",
          addressLine2: auditStatusFormData?.address?.temporaryAddress?.addressLine2 || "",
          country: auditStatusFormData?.address?.temporaryAddress?.country || "",
          state: auditStatusFormData?.address?.temporaryAddress?.state || "",
          city: auditStatusFormData?.address?.temporaryAddress?.city || "",
          pinCode: auditStatusFormData?.address?.temporaryAddress?.pinCode || "",
          taluka: auditStatusFormData?.address?.temporaryAddress?.taluka || "",
          isVerified: false,
        },
      },
    },
    mode: "onChange",
  })

  const {
    post: postPersonalInformation,
    loading: postLoading,
  } = usePostRequest<any>({
    url: "contract_employee",
    onSuccess: (data) => {
      console.log("Personal information saved successfully:", data)
      if (onNextTab) {
        onNextTab()
      }
    },
    onError: (error) => {
      console.error("Error saving personal information:", error)
    },
  });

  // Update form values based on mode
  useEffect(() => {
      if (auditStatusFormData) {
        setValue("photo", auditStatusFormData.photo || "");
        setValue("employeeID", auditStatusFormData.employeeID || "");
        setValue("firstName", auditStatusFormData.firstName || "");
        setValue("middleName", auditStatusFormData.middleName || "");
        setValue("lastName", auditStatusFormData.lastName || "");
        setValue("fatherHusbandName", auditStatusFormData.fatherHusbandName || "");
        setValue("gender", auditStatusFormData.gender || undefined);
        setValue("birthDate", auditStatusFormData.birthDate || "");
        setValue("bloodGroup", auditStatusFormData.bloodGroup || undefined);
        setValue("nationality", auditStatusFormData.nationality || "");
        setValue("maritalStatus", auditStatusFormData.maritalStatus || undefined);
        
        // Handle address data
        if (auditStatusFormData.address) {
          setValue("address.permanentAddress.addressLine1", auditStatusFormData.address.permanentAddress?.addressLine1 || "");
          setValue("address.permanentAddress.addressLine2", auditStatusFormData.address.permanentAddress?.addressLine2 || "");
          setValue("address.permanentAddress.country", auditStatusFormData.address.permanentAddress?.country || "");
          setValue("address.permanentAddress.state", auditStatusFormData.address.permanentAddress?.state || "");
          setValue("address.permanentAddress.city", auditStatusFormData.address.permanentAddress?.city || "");
          setValue("address.permanentAddress.pinCode", auditStatusFormData.address.permanentAddress?.pinCode || "");
          setValue("address.permanentAddress.taluka", auditStatusFormData.address.permanentAddress?.taluka || "");
          setValue("address.permanentAddress.isVerified", auditStatusFormData.address.permanentAddress?.isVerified || false);
          
          setValue("address.temporaryAddress.addressLine1", auditStatusFormData.address.temporaryAddress?.addressLine1 || "");
          setValue("address.temporaryAddress.addressLine2", auditStatusFormData.address.temporaryAddress?.addressLine2 || "");
          setValue("address.temporaryAddress.country", auditStatusFormData.address.temporaryAddress?.country || "");
          setValue("address.temporaryAddress.state", auditStatusFormData.address.temporaryAddress?.state || "");
          setValue("address.temporaryAddress.city", auditStatusFormData.address.temporaryAddress?.city || "");
          setValue("address.temporaryAddress.pinCode", auditStatusFormData.address.temporaryAddress?.pinCode || "");
          setValue("address.temporaryAddress.taluka", auditStatusFormData.address.temporaryAddress?.taluka || "");
          setValue("address.temporaryAddress.isVerified", auditStatusFormData.address.temporaryAddress?.isVerified || false);
        }
        
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

  const watchedValues = watch()



  const handleInputChange = async (field: keyof PersonalInformationData, value: any) => {
    setValue(field, value)
    await trigger(field)
    
    // Update form data for parent component
    const currentValues = watch()
    const exactData = {
      photo: currentValues.photo || "",
      employeeID: currentValues.employeeID || "",
      firstName: currentValues.firstName || "",
      middleName: currentValues.middleName || "",
      lastName: currentValues.lastName || "",
      fatherHusbandName: currentValues.fatherHusbandName || "",
      gender: currentValues.gender || undefined,
      birthDate: currentValues.birthDate || "",
      bloodGroup: currentValues.bloodGroup || undefined,
      nationality: currentValues.nationality || "",
      maritalStatus: currentValues.maritalStatus || undefined,
      address: currentValues.address || {
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
      },
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

  // Special handler for Select components to ensure proper data flow
  const handleSelectChange = async (field: keyof PersonalInformationData, value: any) => {
    setValue(field, value)
    await trigger(field)
    
    // Get the updated values after setting the new value
    const updatedValues = watch()
    
    // Create the exact data structure with the updated value
    const exactData = {
      photo: updatedValues.photo || "",
      employeeID: updatedValues.employeeID || "",
      firstName: updatedValues.firstName || "",
      middleName: updatedValues.middleName || "",
      lastName: updatedValues.lastName || "",
      fatherHusbandName: updatedValues.fatherHusbandName || "",
      gender: field === "gender" ? value : updatedValues.gender || undefined,
      birthDate: updatedValues.birthDate || "",
      bloodGroup: field === "bloodGroup" ? value : updatedValues.bloodGroup || undefined,
      nationality: updatedValues.nationality || "",
      maritalStatus: field === "maritalStatus" ? value : updatedValues.maritalStatus || undefined,
      address: updatedValues.address || {
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
      },
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

  const handleAddressChange = async (
    addressType: "permanentAddress" | "temporaryAddress",
    field: keyof z.infer<typeof addressSchema>,
    value: any
  ) => {
    const updatedAddress = {
      ...watchedValues.address[addressType],
      [field]: value,
    }
    setValue(`address.${addressType}.${field}` as any, value)
    await trigger(`address.${addressType}.${field}` as any)
    
    const currentValues = watch()
    const exactData = {
      photo: currentValues.photo || "",
      employeeID: currentValues.employeeID || "",
      firstName: currentValues.firstName || "",
      middleName: currentValues.middleName || "",
      lastName: currentValues.lastName || "",
      fatherHusbandName: currentValues.fatherHusbandName || "",
      gender: currentValues.gender || undefined,
      birthDate: currentValues.birthDate || "",
      bloodGroup: currentValues.bloodGroup || undefined,
      nationality: currentValues.nationality || "",
      maritalStatus: currentValues.maritalStatus || undefined,
      address: {
        ...currentValues.address,
        [addressType]: updatedAddress,
      },
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
        
        const currentValues = watch()
        const exactData = {
          photo: result || "",
          employeeID: currentValues.employeeID || "",
          firstName: currentValues.firstName || "",
          middleName: currentValues.middleName || "",
          lastName: currentValues.lastName || "",
          fatherHusbandName: currentValues.fatherHusbandName || "",
          gender: currentValues.gender || undefined,
          birthDate: currentValues.birthDate || "",
          bloodGroup: currentValues.bloodGroup || undefined,
          nationality: currentValues.nationality || "",
          maritalStatus: currentValues.maritalStatus || undefined,
          address: currentValues.address || {
            permanentAddress: {
              addressLine1: "",
              addressLine2: "",
              country: "",
              state: "",
              city: "",
              pinCode: "",
              taluka: "",
              isVerified: false,
            },
            temporaryAddress: {
              addressLine1: "",
              addressLine2: "",
              country: "",
              state: "",
              city: "",
              pinCode: "",
              taluka: "",
              isVerified: false,
            },
          },
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
    
    const currentValues = watch()
    const exactData = {
      photo: "",
      employeeID: currentValues.employeeID || "",
      firstName: currentValues.firstName || "",
      middleName: currentValues.middleName || "",
      lastName: currentValues.lastName || "",
      fatherHusbandName: currentValues.fatherHusbandName || "",
      gender: currentValues.gender || undefined,
      birthDate: currentValues.birthDate || "",
      bloodGroup: currentValues.bloodGroup || undefined,
      nationality: currentValues.nationality || "",
      maritalStatus: currentValues.maritalStatus || undefined,
      address: currentValues.address || {
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
      },
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
      photo: "",
      employeeID: "",
      firstName: "",
      middleName: "",
      lastName: "",
      fatherHusbandName: "",
      gender: undefined,
      birthDate: "",
      bloodGroup: undefined,
      nationality: "",
      maritalStatus: undefined,
      address: {
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
      },
    })
    setPhotoPreview("")
    setPhotoFile(null)
    setShowErrors(false)
    
    const clearedData = {
      photo: "",
      employeeID: "",
      firstName: "",
      middleName: "",
      lastName: "",
      fatherHusbandName: "",
      gender: undefined,
      birthDate: "",
      bloodGroup: undefined,
      nationality: "",
      maritalStatus: undefined,
      address: {
        permanentAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
        temporaryAddress: {
          addressLine1: "",
          addressLine2: "",
          country: "",
          state: "",
          city: "",
          pinCode: "",
          taluka: "",
          isVerified: false,
        },
      },
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
    
    if (isValid) {
      const formValues = watch()
      
      const exactData = {
        photo: formValues.photo || "",
        employeeID: formValues.employeeID || "",
        firstName: formValues.firstName || "",
        middleName: formValues.middleName || "",
        lastName: formValues.lastName || "",
        fatherHusbandName: formValues.fatherHusbandName || "",
        gender: formValues.gender || undefined,
        birthDate: formValues.birthDate || "",
        bloodGroup: formValues.bloodGroup || undefined,
        nationality: formValues.nationality || "",
        maritalStatus: formValues.maritalStatus || undefined,
        address: formValues.address || {
          permanentAddress: {
            addressLine1: "",
            addressLine2: "",
            country: "",
            state: "",
            city: "",
            pinCode: "",
            taluka: "",
            isVerified: false,
          },
          temporaryAddress: {
            addressLine1: "",
            addressLine2: "",
            country: "",
            state: "",
            city: "",
            pinCode: "",
            taluka: "",
            isVerified: false,
          },
        },
      }
      
      // Update form data based on mode
      if (currentMode === "add") {
        // Ensure we're updating with the latest form values
        const updatedAuditStatusFormData = {
          ...auditStatusFormData,
          ...exactData,
        }
        setAuditStatusFormData?.(updatedAuditStatusFormData)
        setAuditStatus?.({
          ...auditStatus,
          personalInformation: true
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
          collectionName: "contract_employee",
          data: {
            ...auditStatusFormData,
            ...exactData,
          }
        }
        postPersonalInformation(json)
      } else {
        // In view mode, just update parent formData
        onFormDataChange(exactData)
        if (onNextTab) {
          onNextTab()
        }
      }
    }
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
                      placeholder="Enter employee ID"
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
                  <div className="group">
                    <Label htmlFor="fatherHusbandName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Father/Husband Name
                    </Label>
                    <Input
                      {...register("fatherHusbandName")}
                      id="fatherHusbandName"
                      disabled={isViewMode}
                      className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : ""
                      } ${
                        (showErrors && errors.fatherHusbandName) 
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" 
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      }`}
                      placeholder="Enter father/husband name"
                    />
                    {showErrors && errors.fatherHusbandName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        {errors.fatherHusbandName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="lg:col-span-3 my-2" />

          {/* Additional Personal Information */}
          <div className="lg:col-span-3 pb-6">
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
                  value={watchedValues.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  disabled={isViewMode}
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
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                  value={watchedValues.bloodGroup}
                  onValueChange={(value) => handleSelectChange("bloodGroup", value)}
                  disabled={isViewMode}
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
                <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700 mb-2 block">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Nationality <span className="text-red-500">*</span>
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
                <Label htmlFor="maritalStatus" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Marital Status
                </Label>
                <Select
                  value={watchedValues.maritalStatus}
                  onValueChange={(value) => handleSelectChange("maritalStatus", value)}
                  disabled={isViewMode}
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
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Unmarried">Unmarried</SelectItem>
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

            </div>
          </div>
        </div>

        <Separator className="lg:col-span-3 my-2 " />

        {/* Address Information */}
        <div className="lg:col-span-3 mt-4 mb-4 py-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            Permanent Address
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="group col-span-6">
              <Label htmlFor="permanentAddressLine1" className="text-sm font-semibold text-gray-700 mb-2 block">
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="permanentAddressLine1"
                value={watchedValues.address.permanentAddress.addressLine1}
                onChange={(e) => handleAddressChange("permanentAddress", "addressLine1", e.target.value)}
                disabled={isViewMode}
                className={`min-h-[40px] border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 resize-none ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.addressLine1)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter address line 1"
                rows={2}
              />
              {showErrors && errors.address?.permanentAddress?.addressLine1 && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.addressLine1?.message}
                </p>
              )}
            </div>
            <div className="group col-span-6">
              <Label htmlFor="permanentAddressLine2" className="text-sm font-semibold text-gray-700 mb-2 block">
                Address Line 2
              </Label>
              <Textarea
                id="permanentAddressLine2"
                value={watchedValues.address.permanentAddress.addressLine2}
                onChange={(e) => handleAddressChange("permanentAddress", "addressLine2", e.target.value)}
                disabled={isViewMode}
                className={`min-h-[40px] border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 resize-none ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.addressLine2)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter address line 2"
                rows={2}
              />
              {showErrors && errors.address?.permanentAddress?.addressLine2 && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.addressLine2?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="permanentCountry" className="text-sm font-semibold text-gray-700 mb-2 block">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="permanentCountry"
                value={watchedValues.address.permanentAddress.country}
                onChange={(e) => handleAddressChange("permanentAddress", "country", e.target.value)}
                disabled={isViewMode}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.country)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter country"
              />
              {showErrors && errors.address?.permanentAddress?.country && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.country?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="permanentState" className="text-sm font-semibold text-gray-700 mb-2 block">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="permanentState"
                value={watchedValues.address.permanentAddress.state}
                onChange={(e) => handleAddressChange("permanentAddress", "state", e.target.value)}
                disabled={isViewMode}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.state)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter state"
              />
              {showErrors && errors.address?.permanentAddress?.state && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.state?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="permanentCity" className="text-sm font-semibold text-gray-700 mb-2 block">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="permanentCity"
                value={watchedValues.address.permanentAddress.city}
                onChange={(e) => handleAddressChange("permanentAddress", "city", e.target.value)}
                disabled={isViewMode}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.city)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter city"
              />
              {showErrors && errors.address?.permanentAddress?.city && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.city?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="permanentPinCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                Pin Code
              </Label>
              <Input
                id="permanentPinCode"
                value={watchedValues.address.permanentAddress.pinCode}
                onChange={(e) => handleAddressChange("permanentAddress", "pinCode", e.target.value)}
                disabled={isViewMode}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.pinCode)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter pin code"
              />
              {showErrors && errors.address?.permanentAddress?.pinCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.pinCode?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="permanentTaluka" className="text-sm font-semibold text-gray-700 mb-2 block">
                Taluka
              </Label>
              <Input
                id="permanentTaluka"
                value={watchedValues.address.permanentAddress.taluka}
                onChange={(e) => handleAddressChange("permanentAddress", "taluka", e.target.value)}
                disabled={isViewMode}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode 
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.permanentAddress?.taluka)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter taluka"
              />
              {showErrors && errors.address?.permanentAddress?.taluka && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.permanentAddress.taluka?.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2 col-span-2">
              <input
                type="checkbox"
                id="permanentIsVerified"
                checked={watchedValues.address.permanentAddress.isVerified || false}
                onChange={(e) => handleAddressChange("permanentAddress", "isVerified", e.target.checked)}
                disabled={isViewMode}
                className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                  isViewMode ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <Label htmlFor="permanentIsVerified" className="text-sm text-gray-700">
                Address Verified
              </Label>
            </div>
          </div>
        </div>

        <Separator className="lg:col-span-3 my-2" />

        {/* Temporary Address */}
        <div className="lg:col-span-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Temporary Address
          </h3>
          
          {/* Same as Permanent Address Checkbox */}
          {!isViewMode && (
            <div className="mb-4 flex items-center space-x-2">
              <Checkbox
                id="sameAsPermanentAddress"
                checked={sameAsPermanentAddress}
                onCheckedChange={(checked) => {
                  setSameAsPermanentAddress(checked as boolean);
                  
                  if (checked) {
                    // Get current permanent address values
                    const currentValues = watch();
                    const permanentAddress = currentValues.address.permanentAddress;
                    
                    // Copy all permanent address fields to temporary address
                    setValue("address.temporaryAddress.addressLine1", permanentAddress.addressLine1 || "");
                    setValue("address.temporaryAddress.addressLine2", permanentAddress.addressLine2 || "");
                    setValue("address.temporaryAddress.country", permanentAddress.country || "");
                    setValue("address.temporaryAddress.state", permanentAddress.state || "");
                    setValue("address.temporaryAddress.city", permanentAddress.city || "");
                    setValue("address.temporaryAddress.pinCode", permanentAddress.pinCode || "");
                    setValue("address.temporaryAddress.taluka", permanentAddress.taluka || "");
                    setValue("address.temporaryAddress.isVerified", permanentAddress.isVerified || false);
                    
                    // Trigger validation for all temporary address fields
                    trigger([
                      "address.temporaryAddress.addressLine1",
                      "address.temporaryAddress.addressLine2",
                      "address.temporaryAddress.country",
                      "address.temporaryAddress.state",
                      "address.temporaryAddress.city",
                      "address.temporaryAddress.pinCode",
                      "address.temporaryAddress.taluka",
                      "address.temporaryAddress.isVerified"
                    ]);
                    
                    // Update the form data with copied values
                    const exactData = {
                      photo: currentValues.photo || "",
                      employeeID: currentValues.employeeID || "",
                      firstName: currentValues.firstName || "",
                      middleName: currentValues.middleName || "",
                      lastName: currentValues.lastName || "",
                      fatherHusbandName: currentValues.fatherHusbandName || "",
                      gender: currentValues.gender || undefined,
                      birthDate: currentValues.birthDate || "",
                      bloodGroup: currentValues.bloodGroup || undefined,
                      nationality: currentValues.nationality || "",
                      maritalStatus: currentValues.maritalStatus || undefined,
                      address: {
                        ...currentValues.address,
                        temporaryAddress: {
                          addressLine1: permanentAddress.addressLine1 || "",
                          addressLine2: permanentAddress.addressLine2 || "",
                          country: permanentAddress.country || "",
                          state: permanentAddress.state || "",
                          city: permanentAddress.city || "",
                          pinCode: permanentAddress.pinCode || "",
                          taluka: permanentAddress.taluka || "",
                          isVerified: permanentAddress.isVerified || false,
                        },
                      },
                    };
                    
                    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
                    if (currentMode === "add") {
                      setAuditStatusFormData?.({
                        ...auditStatusFormData,
                        ...exactData
                      });
                    } else {
                      onFormDataChange(exactData);
                    }
                  } else {
                    // Clear temporary address fields when unchecked
                    setValue("address.temporaryAddress.addressLine1", "");
                    setValue("address.temporaryAddress.addressLine2", "");
                    setValue("address.temporaryAddress.country", "");
                    setValue("address.temporaryAddress.state", "");
                    setValue("address.temporaryAddress.city", "");
                    setValue("address.temporaryAddress.pinCode", "");
                    setValue("address.temporaryAddress.taluka", "");
                    setValue("address.temporaryAddress.isVerified", false);
                    
                    // Update the form data
                    const currentValues = watch();
                    const exactData = {
                      photo: currentValues.photo || "",
                      employeeID: currentValues.employeeID || "",
                      firstName: currentValues.firstName || "",
                      middleName: currentValues.middleName || "",
                      lastName: currentValues.lastName || "",
                      fatherHusbandName: currentValues.fatherHusbandName || "",
                      gender: currentValues.gender || undefined,
                      birthDate: currentValues.birthDate || "",
                      bloodGroup: currentValues.bloodGroup || undefined,
                      nationality: currentValues.nationality || "",
                      maritalStatus: currentValues.maritalStatus || undefined,
                      address: {
                        ...currentValues.address,
                        temporaryAddress: {
                          addressLine1: "",
                          addressLine2: "",
                          country: "",
                          state: "",
                          city: "",
                          pinCode: "",
                          taluka: "",
                          isVerified: false,
                        },
                      },
                    };
                    
                    // In add mode, update auditStatusFormData; in edit/view mode, update parent formData
                    if (currentMode === "add") {
                      setAuditStatusFormData?.({
                        ...auditStatusFormData,
                        ...exactData
                      });
                    } else {
                      onFormDataChange(exactData);
                    }
                  }
                }}
              />
              <Label
                htmlFor="sameAsPermanentAddress"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Is Permanent Address same as Temporary Address?
              </Label>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="group col-span-6">
              <Label htmlFor="temporaryAddressLine1" className="text-sm font-semibold text-gray-700 mb-2 block">
                Address Line 1
              </Label>
              <Textarea
                id="temporaryAddressLine1"
                value={watchedValues.address.temporaryAddress?.addressLine1 || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "addressLine1", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={` min-h-[40px] border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 resize-none ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.addressLine1)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter address line 1"
                rows={2}
              />
              {showErrors && errors.address?.temporaryAddress?.addressLine1 && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.addressLine1?.message}
                </p>
              )}
            </div>
            <div className="group col-span-6">
              <Label htmlFor="temporaryAddressLine2" className="text-sm font-semibold text-gray-700 mb-2 block">
                Address Line 2
              </Label>
              <Textarea
                id="temporaryAddressLine2"
                value={watchedValues.address.temporaryAddress?.addressLine2 || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "addressLine2", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`min-h-[40px] border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 resize-none ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.addressLine2)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter address line 2"
                rows={2}
              />
              {showErrors && errors.address?.temporaryAddress?.addressLine2 && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.addressLine2?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="temporaryCountry" className="text-sm font-semibold text-gray-700 mb-2 block">
                Country
              </Label>
              <Input
                id="temporaryCountry"
                value={watchedValues.address.temporaryAddress?.country || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "country", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.country)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter country"
              />
              {showErrors && errors.address?.temporaryAddress?.country && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.country?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="temporaryState" className="text-sm font-semibold text-gray-700 mb-2 block">
                State
              </Label>
              <Input
                id="temporaryState"
                value={watchedValues.address.temporaryAddress?.state || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "state", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.state)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter state"
              />
              {showErrors && errors.address?.temporaryAddress?.state && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.state?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="temporaryCity" className="text-sm font-semibold text-gray-700 mb-2 block">
                City
              </Label>
              <Input
                id="temporaryCity"
                value={watchedValues.address.temporaryAddress?.city || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "city", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.city)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter city"
              />
              {showErrors && errors.address?.temporaryAddress?.city && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.city?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="temporaryPinCode" className="text-sm font-semibold text-gray-700 mb-2 block">
                Pin Code
              </Label>
              <Input
                id="temporaryPinCode"
                value={watchedValues.address.temporaryAddress?.pinCode || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "pinCode", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.pinCode)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter pin code"
              />
              {showErrors && errors.address?.temporaryAddress?.pinCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.pinCode?.message}
                </p>
              )}
            </div>
            <div className="group col-span-2">
              <Label htmlFor="temporaryTaluka" className="text-sm font-semibold text-gray-700 mb-2 block">
                Taluka
              </Label>
              <Input
                id="temporaryTaluka"
                value={watchedValues.address.temporaryAddress?.taluka || ""}
                onChange={(e) => handleAddressChange("temporaryAddress", "taluka", e.target.value)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-10 border-2 focus:ring-4 rounded-xl transition-all duration-300 group-hover:border-gray-300 ${
                  isViewMode || sameAsPermanentAddress
                    ? "bg-gray-100 cursor-not-allowed" 
                    : ""
                } ${
                  (showErrors && errors.address?.temporaryAddress?.taluka)
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                placeholder="Enter taluka"
              />
              {showErrors && errors.address?.temporaryAddress?.taluka && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.address.temporaryAddress.taluka?.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-2 col-span-2">
              <input
                type="checkbox"
                id="temporaryIsVerified"
                checked={watchedValues.address.temporaryAddress?.isVerified || false}
                onChange={(e) => handleAddressChange("temporaryAddress", "isVerified", e.target.checked)}
                disabled={isViewMode || sameAsPermanentAddress}
                className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                  isViewMode || sameAsPermanentAddress ? "opacity-50 cursor-not-allowed" : ""
                }`}
              />
              <Label htmlFor="temporaryIsVerified" className="text-sm text-gray-700">
                Address Verified
              </Label>
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