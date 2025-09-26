"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useOTCrud } from '@/hooks/overTime/useCrudOvertime';
import { OTPolicyApplication } from './types';
import { FiInfo, FiSettings, FiClock, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";
import { toast } from "react-toastify";

interface RoundingRule {
  from: number;
  to: number;
  roundOffTo: number;
}

interface OTPolicyFormProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  otData?: OTPolicyApplication[];
  onSuccess?: (savedPolicy: OTPolicyApplication) => void;
  onServerUpdate?: () => Promise<any>;
  editData?: OTPolicyApplication | null;
  isEditMode?: boolean;
  deleteValue?: any;
  createdByUser?: string;
  initialValues?: Partial<OTPolicyApplication>;
  onSubmit?: (data: OTPolicyApplication) => void;
  onCancel?: () => void;
}

export default function OTPolicyForm({ 
  open = true,
  setOpen,
  otData = [],
  onSuccess,
  onServerUpdate,
  editData,
  isEditMode,
  deleteValue,
  createdByUser = "default-user",
  initialValues = {},
  onSubmit,
  onCancel 
}: OTPolicyFormProps) {
  const router = useRouter()
  
  // Fetch organization data for dropdowns
  const {
    data: orgData,
    loading: orgLoading,
    error: orgError,
  } = useRequest<any[]>({
    url: "map/organization/search?tenantCode=Midhani",
    onSuccess: (data) => {
      console.log("Organization data loaded for dropdowns:", data);
    },
    onError: (error) => {
      console.error("Error loading organization data:", error);
    },
  });

  // FIXED: Pass the actual OT data array to the hook
  const { 
    otPolicies, 
    otPolicy, 
    addOTPolicy, 
    updateOTPolicy, 
    deleteOTPolicy, 
    setOTPolicy, 
    resetOTPolicy 
  } = useOTCrud(otData);

  console.log("Hook initialized with OT data:", otData);
  console.log("Current OT policies in hook:", otPolicies);

  // API post request setup
  const {
    post: postOTPolicy,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "ot_policy",
    onSuccess: (data) => {
      console.log("API Success Response:", data);
      toast.success("OT Policy submitted successfully!");
    },
    onError: (error) => {
      toast.error("OT Policy submission failed!");
      console.error("POST error:", error);
    },
  });

  const [form, setForm] = useState<OTPolicyApplication>({
    organizationCode: initialValues.organizationCode || editData?.organizationCode || 'Midhani',
    tenantCode: initialValues.tenantCode || editData?.tenantCode || 'Midhani',
    subsidiary: initialValues.subsidiary || editData?.subsidiary || { subsidiaryCode: '', subsidiaryName: '' },
    location: initialValues.location || editData?.location || { locationCode: '', locationName: '' },
    employeeCategory: initialValues.employeeCategory || editData?.employeeCategory || [],
    otPolicy: {
      otPolicyCode: initialValues.otPolicy?.otPolicyCode || editData?.otPolicy?.otPolicyCode || '',
      otPolicyName: initialValues.otPolicy?.otPolicyName || editData?.otPolicy?.otPolicyName || '',
      calculateOnTheBasisOf: initialValues.otPolicy?.calculateOnTheBasisOf || editData?.otPolicy?.calculateOnTheBasisOf || { calculationBasis: '' },
      multiplierForWorkingDay: initialValues.otPolicy?.multiplierForWorkingDay || editData?.otPolicy?.multiplierForWorkingDay || 0,
      multiplierForNationalHoliday: initialValues.otPolicy?.multiplierForNationalHoliday || editData?.otPolicy?.multiplierForNationalHoliday || 0,
      multiplierForHoliday: initialValues.otPolicy?.multiplierForHoliday || editData?.otPolicy?.multiplierForHoliday || 0,
      multiplierForWeeklyOff: initialValues.otPolicy?.multiplierForWeeklyOff || editData?.otPolicy?.multiplierForWeeklyOff || 0,
      dailyMaximumAllowedHours: initialValues.otPolicy?.dailyMaximumAllowedHours || editData?.otPolicy?.dailyMaximumAllowedHours || 0,
      weeklyMaximumAllowedHours: initialValues.otPolicy?.weeklyMaximumAllowedHours || editData?.otPolicy?.weeklyMaximumAllowedHours || 0,
      monthlyMaximumAllowedHours: initialValues.otPolicy?.monthlyMaximumAllowedHours || editData?.otPolicy?.monthlyMaximumAllowedHours || 0,
      quaterlyMaximumAllowedHours: initialValues.otPolicy?.quaterlyMaximumAllowedHours || editData?.otPolicy?.quaterlyMaximumAllowedHours || 0,
      yearlyMaximumAllowedHours: initialValues.otPolicy?.yearlyMaximumAllowedHours || editData?.otPolicy?.yearlyMaximumAllowedHours || 0,
      maximumHoursOnHoliday: initialValues.otPolicy?.maximumHoursOnHoliday || editData?.otPolicy?.maximumHoursOnHoliday || 0,
      maximumHoursOnWeekend: initialValues.otPolicy?.maximumHoursOnWeekend || editData?.otPolicy?.maximumHoursOnWeekend || 0,
      maximumHoursOnWeekday: initialValues.otPolicy?.maximumHoursOnWeekday || editData?.otPolicy?.maximumHoursOnWeekday || 0,
      minimumExtraMinutesConsideredForOT: initialValues.otPolicy?.minimumExtraMinutesConsideredForOT || editData?.otPolicy?.minimumExtraMinutesConsideredForOT || 0,
      roundingEnabled: initialValues.otPolicy?.roundingEnabled || editData?.otPolicy?.roundingEnabled || false,
      afterRoundingOff: initialValues.otPolicy?.afterRoundingOff || editData?.otPolicy?.afterRoundingOff || false,
      beforeRoundingOff: initialValues.otPolicy?.beforeRoundingOff || editData?.otPolicy?.beforeRoundingOff || false,
      doThisWhenCrossedAllocatedLimit: initialValues.otPolicy?.doThisWhenCrossedAllocatedLimit || editData?.otPolicy?.doThisWhenCrossedAllocatedLimit || 'Restrict',
      approvalRequired: initialValues.otPolicy?.approvalRequired || editData?.otPolicy?.approvalRequired || false,
      minimumFixedMinutesToAllowOvertime: initialValues.otPolicy?.minimumFixedMinutesToAllowOvertime || editData?.otPolicy?.minimumFixedMinutesToAllowOvertime || 0,
      status: initialValues.otPolicy?.status || editData?.otPolicy?.status || 'active',
      rounding: initialValues.otPolicy?.rounding || editData?.otPolicy?.rounding || [],
      remark: initialValues.otPolicy?.remark || editData?.otPolicy?.remark || '',
      isConsideredForHoliday: initialValues.otPolicy?.isConsideredForHoliday || editData?.otPolicy?.isConsideredForHoliday || false,
      isConsideredForNationalHoliday: initialValues.otPolicy?.isConsideredForNationalHoliday || editData?.otPolicy?.isConsideredForNationalHoliday || false,
      isConsideredForWeeklyOff: initialValues.otPolicy?.isConsideredForWeeklyOff || editData?.otPolicy?.isConsideredForWeeklyOff || false,
      isConsideredForWorkingDay: initialValues.otPolicy?.isConsideredForWorkingDay || editData?.otPolicy?.isConsideredForWorkingDay || false,
      isConsideredBeforeShift: initialValues.otPolicy?.isConsideredBeforeShift || editData?.otPolicy?.isConsideredBeforeShift || false,
      isConsideredAfterShift: initialValues.otPolicy?.isConsideredAfterShift || editData?.otPolicy?.isConsideredAfterShift || false,
      perHourRate: initialValues.otPolicy?.perHourRate || editData?.otPolicy?.perHourRate || 0,
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newRoundingRule, setNewRoundingRule] = useState<RoundingRule>({ from: 0, to: 0, roundOffTo: 0 });
  const [subsidiarySearch, setSubsidiarySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showSubsidiaryDropdown, setShowSubsidiaryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showEmployeeCategoryDropdown, setShowEmployeeCategoryDropdown] = useState(false);
  const [employeeCategorySearch, setEmployeeCategorySearch] = useState('');
  const [showRoundingForm, setShowRoundingForm] = useState(false);
  const [roundingRuleError, setRoundingRuleError] = useState<{from?: string, to?: string, roundOffTo?: string}>({});
  const [selectedEmployeeCategories, setSelectedEmployeeCategories] = useState<string[]>(editData?.employeeCategory || []);

  const subsidiaryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const employeeCategoryDropdownRef = useRef<HTMLDivElement>(null);

  // Options for selects from organization data
  const subsidiaryOptions = (orgData?.[0]?.subsidiaries || []).map((sub: any) => ({
    label: `${sub.subsidiaryName || 'Unknown'} (${sub.subsidiaryCode || 'N/A'})`,
    value: sub.subsidiaryCode || '',
    subsidiaryName: sub.subsidiaryName || '',
  }));

  const locationOptions = (orgData?.[0]?.location || []).map((loc: any) => ({
    label: `${loc.locationName || 'Unknown'} (${loc.locationCode || 'N/A'})`,
    value: loc.locationCode || '',
    locationName: loc.locationName || '',
  }));

  const employeeCategoryOptions = (orgData?.[0]?.employeeCategories || []).map((cat: any) => ({
    label: cat.employeeCategoryName || cat.employeeCategoryCode || 'Unknown',
    value: cat.employeeCategoryCode || '',
    name: cat.employeeCategoryName || cat.employeeCategoryCode || 'Unknown',
  }));

  // Handle delete functionality
  useEffect(() => {
    if (deleteValue && deleteValue._id) {
      handleDeleteItem(deleteValue._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteValue]);

  const handleDeleteItem = async (policyId: string) => {
    try {
      console.log("Deleting OT policy with ID:", policyId);
      
      if (!deleteValue || !deleteValue._id) {
        toast.error("OT Policy not found for deletion");
        return;
      }

      const postData = {
        tenant: "Midhani",
        action: "delete",
        id: deleteValue._id,
        collectionName: "ot_policy",
        data: deleteValue,
      };

      console.log("Delete API payload:", postData);

      await postOTPolicy(postData);
      deleteOTPolicy(deleteValue._id);

      if (onSuccess) onSuccess(deleteValue);
      if (onServerUpdate) await onServerUpdate();

      toast.success("OT Policy deleted successfully");
      if (setOpen) setOpen(false);
    } catch (error) {
      console.error("Error deleting OT policy:", error);
      toast.error("Failed to delete OT policy");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subsidiaryDropdownRef.current &&
        !subsidiaryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubsidiaryDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        employeeCategoryDropdownRef.current &&
        !employeeCategoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowEmployeeCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form population logic in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      console.log("Populating form with edit data:", editData);
      
      setForm(editData);
      setSelectedEmployeeCategories(editData.employeeCategory || []);
      setSubsidiarySearch(editData.subsidiary?.subsidiaryName || '');
      setLocationSearch(editData.location?.locationName || '');
      setOTPolicy(editData);
    } else {
      // Reset for add mode
      setForm({
        organizationCode: 'Midhani',
        tenantCode: 'Midhani',
        subsidiary: { subsidiaryCode: '', subsidiaryName: '' },
        location: { locationCode: '', locationName: '' },
        employeeCategory: [],
        otPolicy: {
          otPolicyCode: '',
          otPolicyName: '',
          calculateOnTheBasisOf: { calculationBasis: '' },
          multiplierForWorkingDay: 0,
          multiplierForNationalHoliday: 0,
          multiplierForHoliday: 0,
          multiplierForWeeklyOff: 0,
          dailyMaximumAllowedHours: 0,
          weeklyMaximumAllowedHours: 0,
          monthlyMaximumAllowedHours: 0,
          quaterlyMaximumAllowedHours: 0,
          yearlyMaximumAllowedHours: 0,
          maximumHoursOnHoliday: 0,
          maximumHoursOnWeekend: 0,
          maximumHoursOnWeekday: 0,
          minimumExtraMinutesConsideredForOT: 0,
          roundingEnabled: false,
          afterRoundingOff: false,
          beforeRoundingOff: false,
          doThisWhenCrossedAllocatedLimit: 'Restrict',
          approvalRequired: false,
          minimumFixedMinutesToAllowOvertime: 0,
          status: 'active',
          rounding: [],
          remark: '',
          isConsideredForHoliday: false,
          isConsideredForNationalHoliday: false,
          isConsideredForWeeklyOff: false,
          isConsideredForWorkingDay: false,
          isConsideredBeforeShift: false,
          isConsideredAfterShift: false,
          perHourRate: 0,
        },
      });
      setSelectedEmployeeCategories([]);
      setSubsidiarySearch('');
      setLocationSearch('');
      resetOTPolicy();
    }
  }, [isEditMode, editData, setOTPolicy, resetOTPolicy]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.subsidiary.subsidiaryCode) errs.subsidiaryCode = 'Please select a subsidiary';
    if (!form.location.locationCode) errs.locationCode = 'Please select a location';
    if (!form.employeeCategory.length) errs.employeeCategory = 'Please select at least one employee category';
    if (!form.otPolicy.otPolicyCode) errs.otPolicyCode = 'Please enter a policy code';
    if (!form.otPolicy.otPolicyName) errs.otPolicyName = 'Please enter a policy name';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert string values to numbers for number inputs
    const processedValue = () => {
      if (type === 'number') {
        return value === '' ? 0 : Number(value);
      }
      if (type === 'checkbox') {
        return (e.target as HTMLInputElement).checked;
      }
      return value;
    };
  
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm((f: OTPolicyApplication) => {
        const parentObj = (f as any)[parent];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...f,
            [parent]: {
              ...parentObj,
              [child]: processedValue(),
            },
          };
        }
        return f;
      });
    } else {
      setForm((f: OTPolicyApplication) => ({
        ...f,
        [name]: processedValue(),
      }));
    }
  };
  

  const handleSubsidiarySelect = (subsidiary: any) => {
    setForm(f => ({
      ...f,
      subsidiary: {
        subsidiaryCode: subsidiary.value,
        subsidiaryName: subsidiary.subsidiaryName,
      },
    }));
    setSubsidiarySearch(subsidiary.subsidiaryName);
    setShowSubsidiaryDropdown(false);
  };

  const handleLocationSelect = (location: any) => {
    setForm(f => ({
      ...f,
      location: {
        locationCode: location.value,
        locationName: location.locationName,
      },
    }));
    setLocationSearch(location.locationName);
    setShowLocationDropdown(false);
  };

  const handleEmployeeCategorySelect = (category: any) => {
    const newCategories = selectedEmployeeCategories.includes(category.value)
      ? selectedEmployeeCategories.filter(c => c !== category.value)
      : [...selectedEmployeeCategories, category.value];
    
    setSelectedEmployeeCategories(newCategories);
    setForm(f => ({
      ...f,
      employeeCategory: newCategories,
    }));
  };

  const removeEmployeeCategory = (categoryCode: string) => {
    const newCategories = selectedEmployeeCategories.filter(c => c !== categoryCode);
    setSelectedEmployeeCategories(newCategories);
    setForm(f => ({
      ...f,
      employeeCategory: newCategories,
    }));
  };

  const handleRoundingRuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRoundingRule(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value), // Convert to number
    }));
  };
  

  const isRoundingRuleValid = newRoundingRule.from >= 0 && newRoundingRule.to > 0 && newRoundingRule.roundOffTo >= 0 && newRoundingRule.to > newRoundingRule.from;

  const addRoundingRule = () => {
    const errors: {from?: string, to?: string, roundOffTo?: string} = {};
    
    // Validation
    if (newRoundingRule.from < 0) errors.from = 'From value must be 0 or greater';
    if (newRoundingRule.to <= 0) errors.to = 'To value must be greater than 0';  
    if (newRoundingRule.roundOffTo < 0) errors.roundOffTo = 'Round off value must be 0 or greater';
    if (newRoundingRule.to <= newRoundingRule.from) errors.to = 'To value must be greater than From value';
    
    // Check for overlapping ranges
    const hasOverlap = form.otPolicy.rounding.some(rule => 
      (newRoundingRule.from >= rule.from && newRoundingRule.from <= rule.to) ||
      (newRoundingRule.to >= rule.from && newRoundingRule.to <= rule.to) ||
      (newRoundingRule.from <= rule.from && newRoundingRule.to >= rule.to)
    );
    
    if (hasOverlap) {
      errors.from = 'Range overlaps with existing rule';
    }
    
    setRoundingRuleError(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    // Add the rule to form state
    setForm(f => ({
      ...f,
      otPolicy: {
        ...f.otPolicy,
        rounding: [...f.otPolicy.rounding, { ...newRoundingRule }],
      },
    }));
    
    // Reset the form
    setNewRoundingRule({ from: 0, to: 0, roundOffTo: 0 });
    setRoundingRuleError({});
    
    console.log("Rounding rule added. Total rules:", form.otPolicy.rounding.length + 1);
  };
  

  const removeRoundingRule = (index: number) => {
    setForm(f => ({
      ...f,
      otPolicy: {
        ...f.otPolicy,
        rounding: f.otPolicy.rounding.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      try {
        console.log("Form submission started - Edit Mode:", isEditMode);
  
        const nowISO = new Date().toISOString();
  
        // Ensure all numeric fields are numbers, not strings
        const otPolicyItem: OTPolicyApplication = {
          _id: isEditMode && editData?._id ? editData._id : undefined,
          organizationCode: form.organizationCode,
          tenantCode: form.tenantCode,
          subsidiary: form.subsidiary,
          location: form.location,
          employeeCategory: form.employeeCategory,
          otPolicy: {
            ...form.otPolicy,
            // Explicitly convert to numbers to ensure they're not strings
            multiplierForWorkingDay: Number(form.otPolicy.multiplierForWorkingDay),
            multiplierForNationalHoliday: Number(form.otPolicy.multiplierForNationalHoliday),
            multiplierForHoliday: Number(form.otPolicy.multiplierForHoliday),
            multiplierForWeeklyOff: Number(form.otPolicy.multiplierForWeeklyOff),
            dailyMaximumAllowedHours: Number(form.otPolicy.dailyMaximumAllowedHours),
            weeklyMaximumAllowedHours: Number(form.otPolicy.weeklyMaximumAllowedHours),
            monthlyMaximumAllowedHours: Number(form.otPolicy.monthlyMaximumAllowedHours),
            quaterlyMaximumAllowedHours: Number(form.otPolicy.quaterlyMaximumAllowedHours),
            yearlyMaximumAllowedHours: Number(form.otPolicy.yearlyMaximumAllowedHours),
            maximumHoursOnHoliday: Number(form.otPolicy.maximumHoursOnHoliday),
            maximumHoursOnWeekend: Number(form.otPolicy.maximumHoursOnWeekend),
            maximumHoursOnWeekday: Number(form.otPolicy.maximumHoursOnWeekday),
            minimumExtraMinutesConsideredForOT: Number(form.otPolicy.minimumExtraMinutesConsideredForOT),
            minimumFixedMinutesToAllowOvertime: Number(form.otPolicy.minimumFixedMinutesToAllowOvertime),
            perHourRate: Number(form.otPolicy.perHourRate || 0),
            rounding: form.otPolicy.rounding.map(rule => ({
              from: Number(rule.from),
              to: Number(rule.to),
              roundOffTo: Number(rule.roundOffTo)
            }))
          },
          _class: "java.util.HashMap",
          createdOn: (isEditMode && editData?.createdOn) ? editData.createdOn : nowISO,
          createdBy: (isEditMode && editData?.createdBy) ? editData.createdBy : createdByUser,
        };
  
        console.log("OT Policy item to save:", otPolicyItem);
  
        // CREATE postData HERE:
        const postData = {
          tenant: "Midhani",
          action: "insert", // Always use insert as per holiday pattern
          id: otPolicyItem._id,
          collectionName: "ot_policy",
          data: otPolicyItem,
        };
  
        console.log("API payload:", postData);
  
        // Send to backend first
        await postOTPolicy(postData);
  
        // Update local hook state
        if (isEditMode && otPolicyItem._id) {
          console.log("Updating OT policy with ID:", otPolicyItem._id);
          updateOTPolicy(otPolicyItem._id, otPolicyItem);
        } else {
          console.log("Adding new OT policy");
          addOTPolicy(otPolicyItem);
        }
  
        // Call success callbacks
        if (onSuccess) onSuccess(otPolicyItem);
        if (onServerUpdate) await onServerUpdate();
  
        // Call onSubmit if provided, otherwise navigate back
        if (onSubmit) {
          onSubmit(otPolicyItem);
        } else {
          if (setOpen) setOpen(false);
          router.push('/policy/over-time');
        }
  
        console.log("OT Policy submission completed successfully");
  
      } catch (error) {
        console.error("Error processing OT policy:", error);
        toast.error("Failed to save OT policy.");
      }
    }
  };

  
  const handleCancel = () => {
    console.log('Cancel button clicked');
    resetOTPolicy();
    if (onCancel) {
      onCancel();
    } else {
      if (setOpen) setOpen(false);
      router.push('/policy/over-time');
    }
  };

  const handleBack = () => {
    console.log('Back button clicked');
    if (setOpen) setOpen(false);
    router.push('/policy/over-time');
  };

  // Filter functions for dropdowns
  const filteredSubsidiaries = subsidiaryOptions.filter((s: { label: string; value: string }) => 
    s.label.toLowerCase().includes(subsidiarySearch.toLowerCase())
  );

  const filteredLocations = locationOptions.filter((l: { label: string; value: string }) => 
    l.label.toLowerCase().includes(locationSearch.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <form className="w-full rounded-xl p-6" onSubmit={handleSubmit}>
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Overtime Policy" : "Add Overtime Policy"}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? "Update the overtime policy details." : "Enter the details for the overtime policy."}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={postLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {postLoading ? "Saving..." : isEditMode ? "Update Policy" : "Save Policy"}
              </button>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiInfo className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            {/* Subsidiary */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Subsidiary<span className="text-red-500">*</span></label>
              <div className="relative" ref={subsidiaryDropdownRef}>
                <input
                  type="text"
                  value={subsidiarySearch}
                  onChange={(e) => {
                    setSubsidiarySearch(e.target.value);
                    setShowSubsidiaryDropdown(true);
                  }}
                  onFocus={() => setShowSubsidiaryDropdown(true)}
                  placeholder="Search subsidiary..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                />
                {showSubsidiaryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow max-h-60 overflow-auto text-sm">
                    {filteredSubsidiaries.map((subsidiary: { label: string; value: string }) => (
                      <div
                        key={subsidiary.value}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSubsidiarySelect(subsidiary)}
                      >
                        {subsidiary.label}
                      </div>
                    ))}
                  </div>
                )}
                {errors.subsidiaryCode && <span className="text-red-500 text-xs mt-1">{errors.subsidiaryCode}</span>}
              </div>
            </div>
            
            {/* Location */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Location<span className="text-red-500">*</span></label>
              <div className="relative" ref={locationDropdownRef}>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="Search location..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                />
                {showLocationDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow max-h-60 overflow-auto text-sm">
                    {filteredLocations.map((location: { label: string; value: string }) => (
                      <div
                        key={location.value}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleLocationSelect(location)}
                      >
                        {location.label}
                      </div>
                    ))}
                  </div>
                )}
                {errors.locationCode && <span className="text-red-500 text-xs mt-1">{errors.locationCode}</span>}
              </div>
            </div>
            
            {/* Employee Categories */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Employee Categories<span className="text-red-500">*</span></label>
              <div className="relative" ref={employeeCategoryDropdownRef}>
                <div
                  className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[42px] flex flex-wrap gap-2 items-center`}
                  onClick={() => form.subsidiary.subsidiaryCode && form.location.locationCode && setShowEmployeeCategoryDropdown(true)}
                  style={{ cursor: (!form.subsidiary.subsidiaryCode || !form.location.locationCode) ? 'not-allowed' : 'pointer' }}
                >
                  {selectedEmployeeCategories.length > 0 ? (
                    <span className="flex flex-wrap gap-2">
                      {selectedEmployeeCategories.map(code => {
                        const category = employeeCategoryOptions.find((c: { value: string }) => c.value === code);
                        return (
                          <span key={code} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e6f0ff] text-[#0061ff] border border-[#b3d1ff]">
                            {category?.name || code}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmployeeCategory(code);
                              }}
                              className="ml-1 hover:text-red-500"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select employee categories...</span>
                  )}
                </div>
                {showEmployeeCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow max-h-60 overflow-auto text-sm">
                    <input
                      type="text"
                      value={employeeCategorySearch}
                      onChange={e => setEmployeeCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-sm"
                      onClick={e => e.stopPropagation()}
                      disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
                    />
                    {employeeCategoryOptions
                      .filter((cat: { name: string; value: string }) =>
                        cat.name.toLowerCase().includes(employeeCategorySearch.toLowerCase()) ||
                        cat.value.toLowerCase().includes(employeeCategorySearch.toLowerCase())
                      )
                      .map((category: { name: string; value: string }) => (
                        <div
                          key={category.value}
                          className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${selectedEmployeeCategories.includes(category.value) ? 'bg-blue-50' : ''}`}
                          onClick={() => handleEmployeeCategorySelect(category)}
                        >
                          <div className="font-medium text-sm">{category.name}</div>
                        </div>
                      ))}
                  </div>
                )}
                {errors.employeeCategory && <span className="text-red-500 text-xs mt-1">{errors.employeeCategory}</span>}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 2: Policy Details */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiSettings className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Policy Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Policy Code<span className="text-red-500">*</span></label>
              <input
                name="otPolicy.otPolicyCode"
                value={form.otPolicy.otPolicyCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              {errors.otPolicyCode && <span className="text-red-500 text-xs mt-1">{errors.otPolicyCode}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Policy Name<span className="text-red-500">*</span></label>
              <input
                name="otPolicy.otPolicyName"
                value={form.otPolicy.otPolicyName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              {errors.otPolicyName && <span className="text-red-500 text-xs mt-1">{errors.otPolicyName}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Calculation Basis</label>
              <input
                name="otPolicy.calculateOnTheBasisOf.calculationBasis"
                value={form.otPolicy.calculateOnTheBasisOf.calculationBasis}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 3: Multipliers */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Multipliers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Working Day Multiplier</label>
              <input
                type="number"
                name="otPolicy.multiplierForWorkingDay"
                value={form.otPolicy.multiplierForWorkingDay}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">National Holiday Multiplier</label>
              <input
                type="number"
                name="otPolicy.multiplierForNationalHoliday"
                value={form.otPolicy.multiplierForNationalHoliday}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Holiday Multiplier</label>
              <input
                type="number"
                name="otPolicy.multiplierForHoliday"
                value={form.otPolicy.multiplierForHoliday}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Weekly Off Multiplier</label>
              <input
                type="number"
                name="otPolicy.multiplierForWeeklyOff"
                value={form.otPolicy.multiplierForWeeklyOff}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 4: Maximum Allowed Hours */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Maximum Allowed Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Daily Maximum Hours</label>
              <input
                type="number"
                name="otPolicy.dailyMaximumAllowedHours"
                value={form.otPolicy.dailyMaximumAllowedHours}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Weekly Maximum Hours</label>
              <input
                type="number"
                name="otPolicy.weeklyMaximumAllowedHours"
                value={form.otPolicy.weeklyMaximumAllowedHours}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Monthly Maximum Hours</label>
              <input
                type="number"
                name="otPolicy.monthlyMaximumAllowedHours"
                value={form.otPolicy.monthlyMaximumAllowedHours}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Quarterly Maximum Hours</label>
              <input
                type="number"
                name="otPolicy.quaterlyMaximumAllowedHours"
                value={form.otPolicy.quaterlyMaximumAllowedHours}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Yearly Maximum Hours</label>
              <input
                type="number"
                name="otPolicy.yearlyMaximumAllowedHours"
                value={form.otPolicy.yearlyMaximumAllowedHours}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Maximum Hours On Holiday</label>
              <input
                type="number"
                name="otPolicy.maximumHoursOnHoliday"
                value={form.otPolicy.maximumHoursOnHoliday}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Maximum Hours On Weekend</label>
              <input
                type="number"
                name="otPolicy.maximumHoursOnWeekend"
                value={form.otPolicy.maximumHoursOnWeekend}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Maximum Hours On Weekday</label>
              <input
                type="number"
                name="otPolicy.maximumHoursOnWeekday"
                value={form.otPolicy.maximumHoursOnWeekday}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 5: Overtime Settings */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Overtime Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Minimum Extra Minutes Considered For OT</label>
              <input
                type="number"
                name="otPolicy.minimumExtraMinutesConsideredForOT"
                value={form.otPolicy.minimumExtraMinutesConsideredForOT}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Minimum Fixed Minutes To Allow Overtime</label>
              <input
                type="number"
                name="otPolicy.minimumFixedMinutesToAllowOvertime"
                value={form.otPolicy.minimumFixedMinutesToAllowOvertime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Do This When Crossed Allocated Limit</label>
              <select
                name="otPolicy.doThisWhenCrossedAllocatedLimit"
                value={form.otPolicy.doThisWhenCrossedAllocatedLimit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              >
                <option value="Restrict">Restrict</option>
                <option value="Allow">Allow</option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

{/* Section 6: Rounding */}
<div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
  <FiClock className="text-[#0061ff]" size={18} />
  <h3 className="text-base font-semibold">Rounding</h3>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      name="otPolicy.roundingEnabled"
      checked={form.otPolicy.roundingEnabled}
      onChange={handleChange}
      className="accent-[#0061ff]"
      disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
    />
    <label className="font-medium text-sm text-gray-700">Rounding Enabled</label>
  </div>
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      name="otPolicy.afterRoundingOff"
      checked={form.otPolicy.afterRoundingOff}
      onChange={handleChange}
      className="accent-[#0061ff]"
      disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
    />
    <label className="font-medium text-sm text-gray-700">After Rounding Off</label>
  </div>
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      name="otPolicy.beforeRoundingOff"
      checked={form.otPolicy.beforeRoundingOff}
      onChange={handleChange}
      className="accent-[#0061ff]"
      disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
    />
    <label className="font-medium text-sm text-gray-700">Before Rounding Off</label>
  </div>
</div>

{/* Rounding Rules Management */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-semibold text-gray-700">Rounding Rules</h4>
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 bg-[#0061ff] text-white rounded-lg font-bold shadow-md hover:bg-[#0052cc] hover:scale-105 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff] text-sm"
      onClick={() => setShowRoundingForm(!showRoundingForm)}
      disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
      aria-label={showRoundingForm ? "Close" : "Add Rounding Rule"}
    >
      {showRoundingForm ? "Close" : "Add Rounding Rule"}
    </button>
  </div>

  {/* Add New Rounding Rule Form */}
  {showRoundingForm && (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h5 className="text-sm font-medium text-gray-700 mb-3">Create New Rounding Rule</h5>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">From (minutes)</label>
          <input
            type="number"
            name="from"
            value={newRoundingRule.from}
            onChange={handleRoundingRuleChange}
            placeholder="0"
            min="0"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff]"
          />
          {roundingRuleError.from && <span className="text-xs text-red-500">{roundingRuleError.from}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">To (minutes)</label>
          <input
            type="number"
            name="to"
            value={newRoundingRule.to}
            onChange={handleRoundingRuleChange}
            placeholder="0"
            min="0"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff]"
          />
          {roundingRuleError.to && <span className="text-xs text-red-500">{roundingRuleError.to}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">Round Off To (minutes)</label>
          <input
            type="number"
            name="roundOffTo"
            value={newRoundingRule.roundOffTo}
            onChange={handleRoundingRuleChange}
            placeholder="0"
            min="0"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0061ff]"
          />
          {roundingRuleError.roundOffTo && <span className="text-xs text-red-500">{roundingRuleError.roundOffTo}</span>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addRoundingRule}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={!isRoundingRuleValid}
          >
            Add Rule
          </button>
          <button
            type="button"
            onClick={() => {
              setNewRoundingRule({ from: 0, to: 0, roundOffTo: 0 });
              setRoundingRuleError({});
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      {!isRoundingRuleValid && (
        <p className="text-xs text-red-500 mt-2">Please fill all fields with valid numbers greater than 0</p>
      )}
    </div>
  )}

  {/* Display Created Rounding Rules */}
  <div className="space-y-2">
    {form.otPolicy.rounding.length > 0 ? (
      <>
        <h5 className="text-sm font-medium text-gray-700">Created Rounding Rules ({form.otPolicy.rounding.length})</h5>
        <div className="grid gap-2">
          {form.otPolicy.rounding.map((rule, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">Rule {idx + 1}:</span>
                <span className="text-sm text-gray-700">
                  <strong>From:</strong> {rule.from} minutes
                </span>
                <span className="text-sm text-gray-700">
                  <strong>To:</strong> {rule.to} minutes
                </span>
                <span className="text-sm text-gray-700">
                  <strong>Round to:</strong> {rule.roundOffTo} minutes
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeRoundingRule(idx)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                aria-label={`Remove rule ${idx + 1}`}
                title={`Remove rule ${idx + 1}`}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FiClock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No rounding rules created yet</p>
        <p className="text-xs">Click "Add Rounding Rule" to create your first rule</p>
      </div>
    )}
  </div>
</div>
<div className="border-t border-gray-200 my-6"></div>


          {/* Section 7: Applicability */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Applicability</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredForHoliday"
                checked={form.otPolicy.isConsideredForHoliday}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered For Holiday</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredForNationalHoliday"
                checked={form.otPolicy.isConsideredForNationalHoliday}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered For National Holiday</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredForWeeklyOff"
                checked={form.otPolicy.isConsideredForWeeklyOff}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered For Weekly Off</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredForWorkingDay"
                checked={form.otPolicy.isConsideredForWorkingDay}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered For Working Day</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredBeforeShift"
                checked={form.otPolicy.isConsideredBeforeShift}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered Before Shift</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="otPolicy.isConsideredAfterShift"
                checked={form.otPolicy.isConsideredAfterShift}
                onChange={handleChange}
                className="accent-[#0061ff]"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
              <label className="font-medium text-sm text-gray-700">Considered After Shift</label>
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 8: Status & Approval */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Status & Approval</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Status</label>
              <select
                name="otPolicy.status"
                value={form.otPolicy.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Approval Required</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="otPolicy.approvalRequired"
                  checked={form.otPolicy.approvalRequired}
                  onChange={handleChange}
                  className="accent-[#0061ff]"
                  disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
                />
                <span className="text-sm">Yes</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-sm text-gray-700">Per Hour Rate</label>
              <input
                type="number"
                name="otPolicy.perHourRate"
                value={form.otPolicy.perHourRate || 0}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
                disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 my-6"></div>

          {/* Section 9: Remarks */}
          <div className="flex items-center gap-2 mb-2 border-l-4 border-[#e6f0ff] pl-2">
            <FiClock className="text-[#0061ff]" size={18} />
            <h3 className="text-base font-semibold">Remarks</h3>
          </div>
          <div className="mb-6">
            <textarea
              name="otPolicy.remark"
              value={form.otPolicy.remark}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder-gray-500"
              rows={3}
              disabled={!form.subsidiary.subsidiaryCode || !form.location.locationCode}
              aria-label="Remarks"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end mt-8 mb-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-1 border border-gray-300 bg-white text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 flex items-center gap-2 text-base"
              aria-label="Cancel"
              style={{ cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={postLoading}
              className="px-8 py-1 bg-[#0061ff] text-white rounded-lg font-bold shadow-md hover:bg-[#0052cc] hover:scale-105 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff] flex items-center gap-2 text-base disabled:opacity-50"
              aria-label="Save"
            >
              {postLoading ? "Saving..." : isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}