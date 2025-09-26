"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, FileText, Users, Building2, MapPin, Plus, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Combobox } from "@headlessui/react";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";

// SectionHeader component for section dividers
function SectionHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        {icon}
        {children}
      </div>
      <div className="mt-1 border-b-2 border-blue-100" />
    </div>
  );
}

export type FormData = {
  shiftGroupCode: string;
  shiftGroupName: string;
  subsidiaryCode: string;
  subsidiaryName: string;
  locationCode: string;
  locationName: string;
  employeeCategory: string[];
};

interface ShiftZoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initialData?: Partial<FormData & { _id?: { $oid: string } }>;
  isEdit?: boolean;
  existingShiftGroupCodes: string[];
  existingShiftGroupNames: string[];
}

export default function ShiftZoneForm({ isOpen, onClose, onSubmit, initialData, isEdit, existingShiftGroupCodes = [], existingShiftGroupNames = [] }: ShiftZoneFormProps) {
  const [categoryInput, setCategoryInput] = useState("");

  // Validation Schema (moved inside component to access props directly)
  const schema = yup.object({
    shiftGroupCode: yup
      .string()
      .required("Shift Group Code is required")
      .test(
        "unique-code",
        "Shift Group Code already exists",
        function (value) {
          if (!value) return true;
          if (isEdit && value.toLowerCase() === ((initialData as any)?.shiftGroupCode || "").toLowerCase()) return true;
          return !existingShiftGroupCodes.includes(value.toLowerCase());
        }
      ),
    shiftGroupName: yup
      .string()
      .required("Shift Group Name is required")
      .test(
        "unique-name",
        "Shift Group Name already exists",
        function (value) {
          if (!value) return true;
          if (isEdit && value.toLowerCase() === ((initialData as any)?.shiftGroupName || "").toLowerCase()) return true;
          return !existingShiftGroupNames.includes(value.toLowerCase());
        }
      ),
    subsidiaryCode: yup.string().required("Subsidiary Code is required"),
    subsidiaryName: yup.string().required("Subsidiary Name is required"),
    locationCode: yup.string().required("Location Code is required"),
    locationName: yup.string().required("Location Name is required"),
    employeeCategory: yup.array().of(yup.string().required()).min(1, "At least one category required").default([]),
  }) as yup.ObjectSchema<FormData>;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      shiftGroupCode: (initialData as any)?.shiftGroupCode || "",
      shiftGroupName: (initialData as any)?.shiftGroupName || "",
      subsidiaryCode: (initialData as any)?.subsidiary?.subsidiaryCode || (initialData as any)?.subsidiaryCode || "",
      subsidiaryName: (initialData as any)?.subsidiary?.subsidiaryName || (initialData as any)?.subsidiaryName || "",
      locationCode: (initialData as any)?.location?.locationCode || (initialData as any)?.locationCode || "",
      locationName: (initialData as any)?.location?.locationName || (initialData as any)?.locationName || "",
      employeeCategory: (initialData as any)?.employeeCategory || [],
    },
    mode: "onChange",
  });


  const {
    data: attendanceResponse,
    loading: isLoading,
    error: attendanceError,
    refetch: fetchAttendance
  } = useRequest<any>({
    url: 'organization/search',
    method: 'POST',
    data: [
      {
        field: "tenantCode",
        operator: "eq",
        value: "Midhani"
      },
    ],
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.error("Error fetching attendance data:", error);
    },
    dependencies: []
  });
  useEffect(() => {
    fetchAttendance();
  }, []);

  // Subsidiary and Location: use object as value
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  // Employee Categories: array of selected objects
  const [selectedEmployeeCategories, setSelectedEmployeeCategories] = useState<any[]>([]);
  const [subsidiaryQuery, setSubsidiaryQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  console.log("initialData", initialData);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      reset(initialData || {});
      setCategoryInput("");
      setSelectedSubsidiary(null);
      setSelectedLocation(null);
      setSubsidiaryQuery("");
      setLocationQuery("");
      // Initialize selectedEmployeeCategories from initialData
      if ((initialData as any)?.employeeCategory && Array.isArray((initialData as any).employeeCategory)) {
        setSelectedEmployeeCategories(
          (initialData as any).employeeCategory
            .map((code: any) =>
              (attendanceResponse?.[0]?.employeeCategories || []).find(
                (cat: any) => cat.employeeCategoryCode === code
              ) || { employeeCategoryCode: code, employeeCategoryName: code }
            )
        );
      } else {
        setSelectedEmployeeCategories([]);
      }
    }
  }, [isOpen, initialData, reset, attendanceResponse]);

  // Set selectedSubsidiary and selectedLocation from initialData in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      if ((initialData as any)?.subsidiary || (initialData as any)?.subsidiaryCode) {
        setSelectedSubsidiary((initialData as any)?.subsidiary || {
          subsidiaryCode: (initialData as any)?.subsidiaryCode,
          subsidiaryName: (initialData as any)?.subsidiaryName,
        });
      }
      if ((initialData as any)?.location || (initialData as any)?.locationCode) {
        setSelectedLocation((initialData as any)?.location || {
          locationCode: (initialData as any)?.locationCode,
          locationName: (initialData as any)?.locationName,
        });
      }
      setValue("subsidiaryCode", (initialData as any)?.subsidiary?.subsidiaryCode || (initialData as any)?.subsidiaryCode || "");
      setValue("subsidiaryName", (initialData as any)?.subsidiary?.subsidiaryName || (initialData as any)?.subsidiaryName || "");
      setValue("locationCode", (initialData as any)?.location?.locationCode || (initialData as any)?.locationCode || "");
      setValue("locationName", (initialData as any)?.location?.locationName || (initialData as any)?.locationName || "");
    }
  }, [isEdit, initialData, setValue]);

  // Always keep form state in sync with selectedSubsidiary and selectedLocation
  useEffect(() => {
    if (selectedSubsidiary) {
      setValue("subsidiaryCode", selectedSubsidiary.subsidiaryCode || "", { shouldValidate: true });
      setValue("subsidiaryName", selectedSubsidiary.subsidiaryName || "", { shouldValidate: true });
    }
  }, [selectedSubsidiary, setValue]);
  useEffect(() => {
    if (selectedLocation) {
      setValue("locationCode", selectedLocation.locationCode || "", { shouldValidate: true });
      setValue("locationName", selectedLocation.locationName || "", { shouldValidate: true });
    }
  }, [selectedLocation, setValue, initialData]);
  // When employee categories change, update form
  useEffect(() => {
    setValue(
      "employeeCategory",
      selectedEmployeeCategories.filter(Boolean).map((cat) => cat.employeeCategoryCode),
      { shouldValidate: true }
    );
  }, [selectedEmployeeCategories, setValue]);

  // Add category
  const handleAddCategory = () => {
    const val = categoryInput.trim();
    const categories = getValues("employeeCategory") ?? [];
    if (val && !categories.includes(val)) {
      setValue("employeeCategory", [...categories, val], { shouldValidate: true });
      setCategoryInput("");
    }
  };
  // Remove category
  const handleRemoveCategory = (cat: string) => {
    const categories = getValues("employeeCategory") ?? [];
    setValue(
      "employeeCategory",
      categories.filter((c) => c !== cat),
      { shouldValidate: true }
    );
  };
  // Add on Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  // Extract backend data
  const subsidiariesList = attendanceResponse?.[0]?.subsidiaries || [];
  const locationsList = attendanceResponse?.[0]?.location || [];
  const employeeCategoriesList = attendanceResponse?.[0]?.employeeCategories || [];

  // Subsidiary options
  const filteredSubsidiaries = subsidiariesList.filter((s: any) =>
    s.subsidiaryCode.toLowerCase().includes(subsidiaryQuery.toLowerCase()) ||
    s.subsidiaryName.toLowerCase().includes(subsidiaryQuery.toLowerCase())
  );
  // Location options (filtered by selected subsidiary)
  const allowedLocationCodes = selectedSubsidiary?.locationCode || [];
  const filteredLocations = locationsList.filter((l: any) =>
    allowedLocationCodes.includes(l.locationCode) &&
    (l.locationCode.toLowerCase().includes(locationQuery.toLowerCase()) ||
      l.locationName.toLowerCase().includes(locationQuery.toLowerCase()))
  );
  // Filtered employee categories: only show unselected
  const filteredEmployeeCategories = employeeCategoriesList.filter((cat: any) =>
    (cat.employeeCategoryCode.toLowerCase().includes(categoryInput.toLowerCase()) ||
      cat.employeeCategoryName.toLowerCase().includes(categoryInput.toLowerCase())) &&
    !selectedEmployeeCategories.some((c) => c && c.employeeCategoryCode === cat.employeeCategoryCode)
  );

  // Employee categories multi-select handlers
  const handleAddEmployeeCategory = (cat: any) => {
    if (!cat) return; // Guard clause: do nothing if cat is null/undefined
    // Only allow adding if cat exists in employeeCategoriesList
    if (!employeeCategoriesList.some((c: any) => c.employeeCategoryCode === cat.employeeCategoryCode)) return;
    if (!selectedEmployeeCategories.filter(Boolean).some((c) => c.employeeCategoryCode === cat.employeeCategoryCode)) {
      setSelectedEmployeeCategories([...selectedEmployeeCategories.filter(Boolean), cat]);
      setCategoryInput("");
    }
  };
  const handleRemoveEmployeeCategory = (code: string) => {
    setSelectedEmployeeCategories(selectedEmployeeCategories.filter((c) => c && c.employeeCategoryCode !== code));
  };

  const {
    post: postShiftZone,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "shift",
    onSuccess: (data) => {
      onSubmit(data);
      onClose();
    },
    onError: (error) => {
      // Optionally handle error (e.g., show a toast)
      console.error("POST error:", error);
    },
  });
  console.log("initialData", initialData);

  // Custom submit handler to transform data
  const handleFormSubmit = async (data: FormData) => {
    const valid = await trigger();
    if (!valid) return;
    const json = {
      tenant: "Midhani",
      action: isEdit ? "insert" : "insert",
      id: isEdit && (initialData as any)?._id ? (initialData as any)._id : null,
      collectionName: "shift",
      data: {
        ...(initialData as any),
        organizationCode: "Midhani",
        tenantCode: "Midhani",
        shift: (initialData as any)?.shift || [],
        shiftGroupCode: (isEdit ? (initialData as any)?.shiftGroupCode : data.shiftGroupCode),
        shiftGroupName: data.shiftGroupName,
        subsidiary: {
          subsidiaryCode: data.subsidiaryCode,
          subsidiaryName: data.subsidiaryName,
        },
        location: {
          locationCode: data.locationCode,
          locationName: data.locationName,
        },
        employeeCategory: data.employeeCategory,
      }
    };
    await postShiftZone(json);
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Field styles
  const fieldStyles =
    "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg shadow-sm transition hover:border-blue-400";
  const fieldErrorStyles =
    "w-full h-10 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg shadow-sm transition hover:border-red-400";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEdit ? "Edit Shift Zone" : "Create Shift Zone"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">{isEdit ? "Edit shift zone details" : "Enter shift zone details"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            aria-label="Close popup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content (scrollable) */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-0 pt-4 space-y-6">
          {/* Shift Group Section */}
          <div className="p-6 pb-0 pt-0">
            <SectionHeader icon={<FileText className="w-4 h-4 text-blue-600" />}>Shift Group</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Shift Group Code</label>
                <input
                  {...register("shiftGroupCode")}
                  className={errors.shiftGroupCode ? fieldErrorStyles : fieldStyles}
                  placeholder="Enter shift group code"
                  readOnly={isEdit}
                  // Only set value from initialData if isEdit, otherwise let react-hook-form control it
                  value={isEdit ? (initialData as any)?.shiftGroupCode : undefined}
                />
                {errors.shiftGroupCode && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shiftGroupCode.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Shift Group Name</label>
                <input
                  {...register("shiftGroupName")}
                  className={errors.shiftGroupName ? fieldErrorStyles : fieldStyles}
                  placeholder="Enter shift group name"
                  // Remove value prop so react-hook-form controls it
                />
                {errors.shiftGroupName && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.shiftGroupName.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee Categories Section (already editable) */}
          <div className="p-6 pb-0 pt-0">
            <SectionHeader icon={<Users className="w-4 h-4 text-blue-600" />}>Employee Categories</SectionHeader>
            <div className="flex gap-2 mb-2">
              <Combobox value={null} onChange={handleAddEmployeeCategory} nullable>
                <div className="relative flex-1">
                  <Combobox.Input
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    displayValue={() => categoryInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoryInput(e.target.value)}
                    placeholder="Search and select category"
                  />
                  <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-auto">
                    {filteredEmployeeCategories.length === 0 && (
                      <div className="px-4 py-2 text-gray-500">No results</div>
                    )}
                    {filteredEmployeeCategories.map((cat: any) => (
                      <Combobox.Option key={cat.employeeCategoryCode} value={cat} className={({ active }: { active: boolean }) => `px-4 py-2 cursor-pointer flex items-center ${active ? "bg-blue-100" : ""}`}>
                        <span className="flex-1">{cat.employeeCategoryCode} - {cat.employeeCategoryName}</span>
                        {selectedEmployeeCategories.some((c) => c && c.employeeCategoryCode === cat.employeeCategoryCode) && (
                          <span className="ml-2 text-blue-600">&#10003;</span>
                        )}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEmployeeCategories.map((cat: any, idx: number) => (
                cat && (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cat.employeeCategoryCode} - {cat.employeeCategoryName}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployeeCategory(cat.employeeCategoryCode)}
                      className="ml-1 text-blue-600 hover:text-red-600"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </span>
                )
              ))}
            </div>
            {errors.employeeCategory && (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.employeeCategory.message as string}
              </div>
            )}
          </div>

          {/* Subsidiary & Location Section */}
          <div className="p-6 pb-0 pt-0">
            <SectionHeader icon={<Building2 className="w-4 h-4 text-blue-600" />}>Subsidiary & Location</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Subsidiary Code
                </label>
                {isEdit ? (
                  <input
                    {...register("subsidiaryCode")}
                    readOnly
                    className={errors.subsidiaryCode ? fieldErrorStyles : fieldStyles}
                    placeholder="Subsidiary code will auto-fill"
                  />
                ) : (
                  <Combobox
                    value={selectedSubsidiary}
                    onChange={(subsidiary) => {
                      setSelectedSubsidiary(subsidiary);
                      setValue("subsidiaryCode", subsidiary?.subsidiaryCode || "", { shouldValidate: true });
                      setValue("subsidiaryName", subsidiary?.subsidiaryName || "", { shouldValidate: true });
                      setSelectedLocation(null);
                      setValue("locationCode", "", { shouldValidate: true });
                      setValue("locationName", "", { shouldValidate: true });
                    }}
                    nullable
                  >
                    <div className="relative">
                      <Combobox.Input
                        className={errors.subsidiaryCode ? fieldErrorStyles : fieldStyles}
                        displayValue={(s: any) => s?.subsidiaryCode || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubsidiaryQuery(e.target.value)}
                        placeholder="Search or select subsidiary code"
                      />
                      <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-auto">
                        {filteredSubsidiaries.length === 0 && (
                          <div className="px-4 py-2 text-gray-500">No results</div>
                        )}
                        {filteredSubsidiaries.map((s: any) => (
                          <Combobox.Option key={s.subsidiaryCode} value={s} className={({ active }: { active: boolean }) => `px-4 py-2 cursor-pointer flex items-center ${active ? "bg-blue-100" : ""}`}>
                            <span className="flex-1">{s.subsidiaryCode} - {s.subsidiaryName}</span>
                            {selectedSubsidiary?.subsidiaryCode === s.subsidiaryCode && (
                              <span className="ml-2 text-blue-600">&#10003;</span>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                )}
                {errors.subsidiaryCode && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.subsidiaryCode.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Subsidiary Name
                </label>
                <input
                  {...register("subsidiaryName")}
                  readOnly
                  className={errors.subsidiaryName ? fieldErrorStyles : fieldStyles}
                  placeholder="Subsidiary name will auto-fill"
                />
                {errors.subsidiaryName && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.subsidiaryName.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Location Code
                </label>
                {isEdit ? (
                  <input
                    {...register("locationCode")}
                    readOnly
                    className={errors.locationCode ? fieldErrorStyles : fieldStyles}
                    placeholder="Location code will auto-fill"
                  />
                ) : (
                  <Combobox
                    value={selectedLocation}
                    onChange={(location) => {
                      setSelectedLocation(location);
                      setValue("locationCode", location?.locationCode || "", { shouldValidate: true });
                      setValue("locationName", location?.locationName || "", { shouldValidate: true });
                    }}
                    disabled={!selectedSubsidiary}
                    nullable
                  >
                    <div className="relative">
                      <Combobox.Input
                        className={errors.locationCode ? fieldErrorStyles : fieldStyles}
                        displayValue={(l: any) => l?.locationCode || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationQuery(e.target.value)}
                        placeholder={selectedSubsidiary ? "Search or select location code" : "Select subsidiary first"}
                        disabled={!selectedSubsidiary}
                      />
                      <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-auto">
                        {filteredLocations.length === 0 && (
                          <div className="px-4 py-2 text-gray-500">No results</div>
                        )}
                        {filteredLocations.map((l: any) => (
                          <Combobox.Option key={l.locationCode} value={l} className={({ active }: { active: boolean }) => `px-4 py-2 cursor-pointer flex items-center ${active ? "bg-blue-100" : ""}`}>
                            <span className="flex-1">{l.locationCode} - {l.locationName}</span>
                            {selectedLocation?.locationCode === l.locationCode && (
                              <span className="ml-2 text-blue-600">&#10003;</span>
                            )}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                )}
                {errors.locationCode && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.locationCode.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  Location Name
                </label>
                <input
                  {...register("locationName")}
                  readOnly
                  className={errors.locationName ? fieldErrorStyles : fieldStyles}
                  placeholder="Location name will auto-fill"
                />
                {errors.locationName && (
                  <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.locationName.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || postLoading}>
              {isSubmitting || postLoading ? (isEdit ? "Saving..." : "Saving...") : (isEdit ? "Update Shift Zone" : "Save Shift Zone")}
            </Button>
          </div>
        </form>
        {postError && (
          <div className="px-6 pb-2 text-red-600 text-sm">{postError.message}</div>
        )}
      </div>
    </div>
  );
} 