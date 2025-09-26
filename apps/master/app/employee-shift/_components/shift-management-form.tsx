"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Badge } from "@repo/ui/components/ui/badge"
import { Separator } from "@repo/ui/components/ui/separator"
import { Clock, Calendar, RotateCcw, Users, Save, ArrowLeft, Plus, Trash2, Search, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchDynamicQuery } from '@repo/ui/hooks/api/dynamic-graphql'
import { useEmployeeShiftCrud, EmployeeShiftItem, ShiftData, GraceSettings, WeekOff, RotationItem } from '@/hooks/employeeShift/useCrudEmployeeShift'
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest"
import { toast } from "react-toastify"

// Interface definitions remain the same...
interface Employee {
  _id: string
  organizationCode: string
  contractorCode: string
  tenantCode: string
  employeeID: string
  firstName: string
  middleName?: string
  lastName: string
}

interface ShiftGroup {
  _id: string;
  organizationCode: string;
  tenantCode: string;
  shiftGroupCode: string;
  shiftGroupName: string;
  shift: ShiftData[];
}

interface ShiftManagementFormProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  employeeShiftData?: EmployeeShiftItem[];
  onSuccess?: (savedShift: EmployeeShiftItem) => void;
  onServerUpdate?: () => Promise<any>;
  editData?: EmployeeShiftItem | null;
  isEditMode?: boolean;
  deleteValue?: any;
  createdByUser?: string;
}

// Custom Switch component
const CustomSwitch = ({ 
  id, 
  checked, 
  onCheckedChange, 
  disabled = false 
}: { 
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
};

export function ShiftManagementForm({ 
  open = true,
  setOpen,
  employeeShiftData = [],
  onSuccess,
  onServerUpdate,
  editData,
  isEditMode = false,
  deleteValue,
  createdByUser = "default-user",
}: ShiftManagementFormProps) {
  const router = useRouter()
  
  // CRUD Hook Integration
  const { 
    employeeShifts,
    employeeShift,
    addEmployeeShift, 
    updateEmployeeShift, 
    deleteEmployeeShift, 
    setEmployeeShift, 
    resetEmployeeShift 
  } = useEmployeeShiftCrud(employeeShiftData);

  // API post request setup
  const {
    post: postEmployeeShift,
    loading: postLoading,
    error: postError,
    data: postData,
  } = usePostRequest<any>({
    url: "employee_shift", // FIXED: Updated API URL to match the pattern used in other parts
    onSuccess: () => {
      toast.success("Employee Shift submitted successfully!");
    },
    onError: (error) => {
      toast.error("Employee Shift submission failed!");
      console.error("POST error:", error);
    },
  });

  // All state variables
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const [employeeError, setEmployeeError] = useState<string | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [employeeSearchResults, setEmployeeSearchResults] = useState<Employee[]>([])
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)

  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([])
  const [shiftGroupLoading, setShiftGroupLoading] = useState(false)
  const [shiftGroupError, setShiftGroupError] = useState<string | null>(null)
  const [shiftGroupSearch, setShiftGroupSearch] = useState("")
  const [shiftGroupSearchResults, setShiftGroupSearchResults] = useState<ShiftGroup[]>([])
  const [showShiftGroupDropdown, setShowShiftGroupDropdown] = useState(false)
  const [selectedShiftGroup, setSelectedShiftGroup] = useState<ShiftGroup | null>(null)

  const [availableShifts, setAvailableShifts] = useState<ShiftData[]>([])
  const [shiftSearch, setShiftSearch] = useState("")
  const [showShiftDropdown, setShowShiftDropdown] = useState(false)

  // Initialize form data with proper defaults
  const getInitialFormData = useCallback((): EmployeeShiftItem => ({
    organizationCode: "Midhani",
    tenantCode: "Midhani",
    shiftGroupCode: "",
    shift: {},
    grace: {},
    isAutomatic: false,
    shiftGroupName: "",
    weekOffs: [
      { week: 1, weekOff: [1, 2] },
      { week: 2, weekOff: [1, 2] },
      { week: 3, weekOff: [1, 2] },
      { week: 4, weekOff: [1, 2] },
      { week: 5, weekOff: [1, 2] },
    ],
    isActive: true,
    employeeID: "",
    fromDate: "2000-01-01",
    toDate: "2026-12-31",
    isRotational: false,
    rotation: [
      { days: 5, priority: 1, shiftGroupCode: "", shiftCode: "" },
      { days: 10, priority: 1, shiftGroupCode: "", shiftCode: "" },
      { days: 15, priority: 1, shiftGroupCode: "", shiftCode: "" },
    ],
  }), []);

  // Form data state
  const [formData, setFormData] = useState<EmployeeShiftItem>(getInitialFormData);

  // Add a flag to prevent form reset during edit population
  const [isPopulatingEdit, setIsPopulatingEdit] = useState(false);

  const weekDays = useMemo(() => [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
  ], []);

  // Fetch functions (keeping the same)
  const fetchEmployees = useCallback(async (searchTerm: string) => {
    if (employeeLoading) return;
    
    try {
      setEmployeeLoading(true)
      setEmployeeError(null)
      
      const employeeFields = {
        fields: [
          '_id', 'organizationCode', 'contractorCode', 'tenantCode',
          'firstName', 'employeeID', 'middleName', 'lastName'
        ]
      };

      const result = await fetchDynamicQuery(
        employeeFields,
        'contract_employee',
        'FetchAllEmployees',
        'fetchAllEmployees',
        { collection: 'contract_employee', tenantCode: 'Midhani' }
      )

      if (result?.data && Array.isArray(result.data)) {
        const fetchedEmployees = result.data
        setEmployees(fetchedEmployees)
        
        const filteredEmployees = fetchedEmployees.filter((emp: Employee) => {
          const fullName = `${emp.firstName} ${emp.middleName || ''} ${emp.lastName}`.toLowerCase()
          const employeeId = (emp.employeeID || '').toLowerCase()
          const searchTermLower = searchTerm.toLowerCase()
          
          return fullName.includes(searchTermLower) || employeeId.includes(searchTermLower)
        })
        
        setEmployeeSearchResults(filteredEmployees)
      } else {
        setEmployeeError("No employee data found")
      }
    } catch (err) {
      setEmployeeError("Failed to fetch employees")
    } finally {
      setEmployeeLoading(false)
    }
  }, [])

  const fetchShiftGroups = useCallback(async (searchTerm: string) => {
    if (shiftGroupLoading) return;
    
    try {
      setShiftGroupLoading(true)
      setShiftGroupError(null)
      
      const shiftFields = {
        fields: ['_id', 'organizationCode', 'tenantCode', 'shiftGroupCode', 'shiftGroupName', 'shift']
      };

      const result = await fetchDynamicQuery(
        shiftFields,
        'shift',
        'FetchAllShifts',
        'fetchAllShifts',
        { collection: 'shift', tenantCode: 'Midhani' }
      )

      if (result?.data && Array.isArray(result.data)) {
        const fetchedShiftGroups = result.data
        setShiftGroups(fetchedShiftGroups)
        
        const filteredShiftGroups = fetchedShiftGroups.filter((sg: ShiftGroup) => {
          const shiftGroupCode = (sg.shiftGroupCode || '').toLowerCase()
          const shiftGroupName = (sg.shiftGroupName || '').toLowerCase()
          const searchTermLower = searchTerm.toLowerCase()
          
          return shiftGroupCode.includes(searchTermLower) || shiftGroupName.includes(searchTermLower)
        })
        
        setShiftGroupSearchResults(filteredShiftGroups)
      } else {
        setShiftGroupError("No shift group data found")
      }
    } catch (err) {
      setShiftGroupError("Failed to fetch shift groups")
    } finally {
      setShiftGroupLoading(false)
    }
  }, [])

  useEffect(() => {
    if (deleteValue && deleteValue._id) {
      handleDeleteItem(deleteValue._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteValue]);
  
  // Enhanced delete functionality with detailed alerts
  const handleDeleteItem = useCallback(async (shiftId: string) => {
    if (!deleteValue?._id) {
      toast.error("Employee Shift not found for deletion");
      return;
    }

    // Add confirmation dialog
    // const confirmed = confirm(`Are you sure you want to delete this employee shift?\n\nEmployee ID: ${deleteValue.employeeID}\nShift Group: ${deleteValue.shiftGroupCode || 'N/A'}`);
    // if (!confirmed) {
    //   return;
    // }

    try {
      const postDataPayload = {
        tenant: "Midhani",
        action: "delete",
        id: deleteValue._id,
        collectionName: "employee_shift",
        data: deleteValue,
      };

      await postEmployeeShift(postDataPayload);
      
      deleteEmployeeShift(deleteValue._id);

      if (onSuccess) {
        onSuccess(deleteValue);
      }
      
      if (onServerUpdate) {
        await onServerUpdate();
      }

      toast.success("Employee Shift deleted successfully");
      
      // Close the modal
      if (setOpen) {
        setOpen(false);
      }
    } catch (error) {
      toast.error("Failed to delete employee shift");
    }
  }, [deleteValue, postEmployeeShift, deleteEmployeeShift, onSuccess, onServerUpdate, setOpen])

  // Delete effect
  useEffect(() => {
    if (deleteValue?._id) {
      handleDeleteItem(deleteValue._id);
    }
  }, [deleteValue?._id, handleDeleteItem]);

  // FIXED: Form population for edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setIsPopulatingEdit(true);
      
      // Set form data with complete edit data
      setFormData({
        _id: editData._id,
        organizationCode: editData.organizationCode || "Midhani",
        tenantCode: editData.tenantCode || "Midhani",
        shiftGroupCode: editData.shiftGroupCode || "",
        shiftGroupName: editData.shiftGroupName || "",
        employeeID: editData.employeeID || "",
        shift: editData.shift || {},
        grace: editData.grace || {},
        // FIXED: Preserve existing weekOffs data
        weekOffs: editData.weekOffs && editData.weekOffs.length > 0 ? editData.weekOffs : [
          { week: 1, weekOff: [1, 2] },
          { week: 2, weekOff: [1, 2] },
          { week: 3, weekOff: [1, 2] },
          { week: 4, weekOff: [1, 2] },
          { week: 5, weekOff: [1, 2] },
        ],
        // FIXED: Preserve existing rotation data
        rotation: editData.rotation && editData.rotation.length > 0 ? editData.rotation : [
          { days: 5, priority: 1, shiftGroupCode: "", shiftCode: "" },
          { days: 10, priority: 1, shiftGroupCode: "", shiftCode: "" },
          { days: 15, priority: 1, shiftGroupCode: "", shiftCode: "" },
        ],
        isActive: editData.isActive ?? true,
        isAutomatic: editData.isAutomatic ?? false,
        isRotational: editData.isRotational ?? false,
        fromDate: editData.fromDate || "2000-01-01",
        toDate: editData.toDate || "2026-12-31",
      });
      
      // Set search fields for display
      if (editData.employeeID) {
        setEmployeeSearch(editData.employeeID);
      }
      
      if (editData.shiftGroupCode && editData.shiftGroupName) {
        setShiftGroupSearch(`${editData.shiftGroupCode} : ${editData.shiftGroupName}`);
        setSelectedShiftGroup({
          _id: editData._id || '',
          organizationCode: editData.organizationCode,
          tenantCode: editData.tenantCode,
          shiftGroupCode: editData.shiftGroupCode,
          shiftGroupName: editData.shiftGroupName,
          shift: []
        });
      }
      
      if (editData.shift && typeof editData.shift === 'object' && Object.keys(editData.shift).length > 0 && 'shiftCode' in editData.shift) {
        const shift = editData.shift as ShiftData;
        setShiftSearch(`${shift.shiftCode} : ${shift.shiftName}`);
        setAvailableShifts([shift]);
      }
      
      setEmployeeShift(editData);
      
      // Reset the populating flag after a short delay to ensure data is set
      setTimeout(() => setIsPopulatingEdit(false), 100);
      
    } else if (!isEditMode && !isPopulatingEdit) {
      // Reset for add mode only if not populating edit data
      const initialData = getInitialFormData();
      setFormData(initialData);
      setEmployeeSearch("");
      setShiftGroupSearch("");
      setShiftSearch("");
      setSelectedShiftGroup(null);
      setAvailableShifts([]);
      resetEmployeeShift();
    }
  }, [isEditMode, editData?._id, getInitialFormData, setEmployeeShift, resetEmployeeShift, isPopulatingEdit]);

  // Search effects with debouncing
  useEffect(() => {
    if (isPopulatingEdit) return; // Don't trigger search during edit population
    
    const timeoutId = setTimeout(() => {
      // Search for employees when user types at least 3 characters
      if (employeeSearch.length >= 3) {
        fetchEmployees(employeeSearch)
        setShowEmployeeDropdown(true)
      } else {
        setEmployeeSearchResults([])
        setShowEmployeeDropdown(false)
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [employeeSearch, fetchEmployees, isPopulatingEdit])

  useEffect(() => {
    if (isPopulatingEdit) return; // Don't trigger search during edit population
    
    const timeoutId = setTimeout(() => {
      if (shiftGroupSearch.length >= 1 && !shiftGroupSearch.includes(" : ")) {
        fetchShiftGroups(shiftGroupSearch)
        setShowShiftGroupDropdown(true)
      } else {
        setShiftGroupSearchResults([])
        setShowShiftGroupDropdown(false)
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [shiftGroupSearch, fetchShiftGroups, isPopulatingEdit])

  // Handler functions (keeping the same implementation)
  const handleEmployeeSelect = useCallback((employee: Employee) => {
    setFormData(prev => ({ ...prev, employeeID: employee.employeeID }))
    setEmployeeSearch(employee.employeeID)
    setShowEmployeeDropdown(false)
  }, [])

  const handleShiftGroupSelect = useCallback((shiftGroup: ShiftGroup) => {
    setFormData(prev => ({ 
      ...prev, 
      shiftGroupCode: shiftGroup.shiftGroupCode,
      shiftGroupName: shiftGroup.shiftGroupName,
      shift: {},
      grace: {}
    }))
    setShiftGroupSearch(`${shiftGroup.shiftGroupCode} : ${shiftGroup.shiftGroupName}`)
    setSelectedShiftGroup(shiftGroup)
    setAvailableShifts(shiftGroup.shift || [])
    setShowShiftGroupDropdown(false)
    setShiftSearch("")
  }, [])

  const handleShiftSelect = useCallback((shift: ShiftData) => {
    const graceSettings: GraceSettings = {
      inAheadMargin: (shift as any).inAheadMargin || 0,
      inAboveMargin: (shift as any).inAboveMargin || 0,
      outAheadMargin: (shift as any).outAheadMargin || 0,
      outAboveMargin: (shift as any).outAboveMargin || 0,
      lateInAllowedTime: (shift as any).lateInAllowedTime || 0,
      earlyOutAllowedTime: (shift as any).earlyOutAllowedTime || 0,
      graceIn: (shift as any).graceIn || 0,
      graceOut: (shift as any).graceOut || 0,
      minimumDurationForPresent: 240,
      allowNormalComputation: true,
    }

    const cleanShiftData: ShiftData = {
      shiftCode: shift.shiftCode,
      shiftName: shift.shiftName,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      firstHalfStart: shift.firstHalfStart,
      firstHalfEnd: shift.firstHalfEnd,
      secondHalfStart: shift.secondHalfStart,
      secondHalfEnd: shift.secondHalfEnd,
      lunchStart: shift.lunchStart,
      lunchEnd: shift.lunchEnd,
      duration: shift.duration,
      crossDay: shift.crossDay,
      flexible: shift.flexible,
      flexiFullDayDuration: shift.flexiFullDayDuration,
      flexiHalfDayDuration: shift.flexiHalfDayDuration,
      minimumDurationForFullDay: shift.minimumDurationForFullDay,
      minimumDurationForHalfDay: shift.minimumDurationForHalfDay,
    }

    setFormData(prev => ({ 
      ...prev, 
      shift: cleanShiftData,
      grace: graceSettings
    }))
    setShiftSearch(`${shift.shiftCode} : ${shift.shiftName}`)
    setShowShiftDropdown(false)
  }, [])

  const handleEmployeeSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmployeeSearch(value)
    
    // Clear employeeID if search is empty
    if (value.length === 0) {
      setFormData(prev => ({ ...prev, employeeID: "" }))
    }
  }, [])

  const handleShiftGroupSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setShiftGroupSearch(value)
    
    if (value.length < 1) {
      setFormData(prev => ({ 
        ...prev, 
        shiftGroupCode: "", 
        shiftGroupName: "", 
        shift: {},
        grace: {}
      }))
      setSelectedShiftGroup(null)
      setAvailableShifts([])
    }
  }, [])

  const handleShiftSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setShiftSearch(value)
    setShowShiftDropdown(true)
    
    if (value.length < 1) {
      setFormData(prev => ({ 
        ...prev, 
        shift: {},
        grace: {}
      }))
    }
  }, [])

  const filteredShifts = useMemo(() => 
    availableShifts.filter(shift => {
      const shiftCode = (shift.shiftCode || '').toLowerCase()
      const shiftName = (shift.shiftName || '').toLowerCase()
      const searchTermLower = shiftSearch.toLowerCase()
      
      return shiftCode.includes(searchTermLower) || shiftName.includes(searchTermLower)
    }), [availableShifts, shiftSearch]
  );

  const updateBasicField = useCallback((field: keyof EmployeeShiftItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Week off handlers
  const addWeekOff = useCallback(() => {
    setFormData(prev => {
      const nextWeek = Math.max(...prev.weekOffs.map(w => w.week)) + 1
      return {
        ...prev,
        weekOffs: [...prev.weekOffs, { week: nextWeek, weekOff: [] }]
      }
    })
  }, [])

  const removeWeekOff = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      weekOffs: prev.weekOffs.filter((_, i) => i !== index)
    }))
  }, [])

  const updateWeekOff = useCallback((index: number, weekOff: number[]) => {
    setFormData(prev => ({
      ...prev,
      weekOffs: prev.weekOffs.map((item, i) => (i === index ? { ...item, weekOff } : item))
    }))
  }, [])

  // Rotation handlers
  const addRotationItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      rotation: [...prev.rotation, { days: 0, priority: 1, shiftGroupCode: "", shiftCode: "" }]
    }))
  }, [])

  const removeRotationItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      rotation: prev.rotation.filter((_, i) => i !== index)
    }))
  }, [])

  const updateRotationItem = useCallback((index: number, field: keyof RotationItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      rotation: prev.rotation.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    }))
  }, [])

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Form validation with detailed alerts - REMOVED shiftGroupCode validation
      const errors: string[] = [];
      
      if (!formData.employeeID || formData.employeeID.trim() === '') {
        errors.push("Employee ID is required");
      }
      
      // REMOVED: shiftGroupCode validation - now optional
      // if (!formData.shiftGroupCode || formData.shiftGroupCode.trim() === '') {
      //   errors.push("Shift Group is required");
      // }
      
      if (!formData.fromDate) {
        errors.push("From Date is required");
      }
      
      if (!formData.toDate) {
        errors.push("To Date is required");
      }
      
      if (errors.length > 0) {
        const errorMessage = `Form validation failed. Please fix the following errors:\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
        
        toast.error(errorMessage);
        return;
      }
      
      const nowISO = new Date().toISOString();

      const employeeShiftItem: EmployeeShiftItem = {
        _id: isEditMode && editData?._id ? editData._id : undefined,
        organizationCode: formData.organizationCode,
        tenantCode: formData.tenantCode,
        shiftGroupCode: formData.shiftGroupCode || "", // Pass empty string if not filled
        shift: formData.shift && Object.keys(formData.shift).length > 0 ? formData.shift : {}, // Pass empty object if not filled
        grace: formData.grace && Object.keys(formData.grace).length > 0 ? formData.grace : {}, // Pass empty object if not filled
        isAutomatic: formData.isAutomatic,
        shiftGroupName: formData.shiftGroupName || "",
        weekOffs: formData.weekOffs,
        isActive: formData.isActive,
        employeeID: formData.employeeID,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        isRotational: formData.isRotational,
        rotation: formData.rotation,
        _class: "java.util.HashMap",
        createdOn: (isEditMode && editData?.createdOn) ? editData.createdOn : nowISO,
        createdBy: (isEditMode && editData?.createdBy) ? editData.createdBy : createdByUser,
      };

      const postDataPayload = {
        tenant: "Midhani",
        action: "insert", // Always use insert as per OT pattern
        id: employeeShiftItem._id,
        collectionName: "employee_shift",
        data: employeeShiftItem,
      };

      await postEmployeeShift(postDataPayload);

      // Update local state with detailed logging
      if (isEditMode && employeeShiftItem._id) {
        updateEmployeeShift(employeeShiftItem._id, employeeShiftItem);
      } else {
        addEmployeeShift(employeeShiftItem);
      }

      // Call success callbacks with detailed logging
      if (onSuccess) {
        onSuccess(employeeShiftItem);
      }
      
      if (onServerUpdate) {
        await onServerUpdate();
      }

      // Show only one success alert
      toast.success(`Employee Shift ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      // Close the form
      if (setOpen) {
        setOpen(false);
      }

    } catch (error) {
      toast.error("Failed to save employee shift. Please try again.");
    }
  }, [formData, isEditMode, editData, createdByUser, postEmployeeShift, updateEmployeeShift, addEmployeeShift, onSuccess, onServerUpdate, setOpen])

  // Enhanced cancel and back handlers with detailed alerts
  const handleCancel = useCallback(() => {
    resetEmployeeShift();
    
    // Force close the modal
    if (setOpen) {
      setOpen(false);
    }
    
    // Also try router navigation as backup
    setTimeout(() => {
      router.push('/employee-shift');
    }, 100);
  }, [resetEmployeeShift, setOpen, router])

  const handleBack = useCallback(() => {
    // Force close the modal
    if (setOpen) {
      setOpen(false);
    }
    
    // Also try router navigation as backup
    setTimeout(() => {
      router.push('/employee-shift');
    }, 100);
  }, [setOpen, router])

  // Switch change handlers
  const handleIsActiveChange = useCallback((checked: boolean) => {
    updateBasicField("isActive", checked);
  }, [updateBasicField]);

  const handleIsAutomaticChange = useCallback((checked: boolean) => {
    updateBasicField("isAutomatic", checked);
  }, [updateBasicField]);

  const handleIsRotationalChange = useCallback((checked: boolean) => {
    updateBasicField("isRotational", checked);
  }, [updateBasicField]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="w-full rounded-xl p-6">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? "Edit Employee Shift" : "Add Employee Shift"}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? "Update the employee shift details." : "Enter the details for the employee shift."}
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
              <TabsList className="w-full justify-start bg-transparent border-b border-gray-100 rounded-none p-0 h-auto">
                {[
                  { value: "basic", label: "Basic Information", icon: Users },
                  { value: "weekoffs", label: "Week Offs", icon: Calendar },
                  { value: "rotation", label: "Rotation Settings", icon: RotateCcw },
                ].map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center space-x-3 px-4 py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 text-gray-500 hover:text-gray-700 rounded-none font-medium transition-colors duration-200 text-sm"
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Core shift group details and employee assignment information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Organization Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Organization Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="organizationCode" className="text-sm font-medium text-gray-700">
                          Organization Code *
                        </Label>
                        <Input
                          id="organizationCode"
                          value={formData.organizationCode}
                          onChange={(e) => updateBasicField("organizationCode", e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                          placeholder="Enter organization code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantCode" className="text-sm font-medium text-gray-700">
                          Tenant Code *
                        </Label>
                        <Input
                          id="tenantCode"
                          value={formData.tenantCode}
                          onChange={(e) => updateBasicField("tenantCode", e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                          placeholder="Enter tenant code"
                        />
                      </div>
                      
                      {/* Employee Search Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="employeeSearch" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          Employee ID *
                        </Label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <Input
                              id="employeeSearch"
                              type="text"
                              value={employeeSearch}
                              onChange={handleEmployeeSearchChange}
                              placeholder={employeeLoading ? "Loading employees..." : "Type at least 3 characters to search"}
                              disabled={employeeLoading}
                              className={`h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-10 ${employeeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                              tabIndex={-1}
                            >
                              {employeeLoading ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          
                          {/* Employee Dropdown results */}
                          {showEmployeeDropdown && employeeSearchResults.length > 0 && !employeeLoading && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {employeeSearchResults.map(emp => (
                                <div
                                  key={emp._id}
                                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleEmployeeSelect(emp)}
                                >
                                  <div className="font-medium text-gray-900">
                                    {emp.employeeID}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {emp.firstName} {emp.middleName || ''} {emp.lastName} | Org: {emp.organizationCode}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Employee error message */}
                          {employeeError && (
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {employeeError}
                            </div>
                          )}
                          
                          {/* Selected employee indicator */}
                          {formData.employeeID && (
                            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Selected Employee ID: {formData.employeeID}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Shift Group Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Shift Group Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Shift Group Search Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="shiftGroupSearch" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Shift Group
                        </Label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <Input
                              id="shiftGroupSearch"
                              type="text"
                              value={shiftGroupSearch}
                              onChange={handleShiftGroupSearchChange}
                              placeholder={shiftGroupLoading ? "Loading shift groups..." : "Search shift groups"}
                              disabled={shiftGroupLoading}
                              className={`h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-10 ${shiftGroupLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                              tabIndex={-1}
                            >
                              {shiftGroupLoading ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          
                          {/* Shift Group Dropdown results */}
                          {showShiftGroupDropdown && shiftGroupSearchResults.length > 0 && !shiftGroupLoading && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {shiftGroupSearchResults.map(sg => (
                                <div
                                  key={sg._id}
                                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleShiftGroupSelect(sg)}
                                >
                                  <div className="font-medium text-gray-900">
                                    {sg.shiftGroupCode} : {sg.shiftGroupName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {sg.shift?.length || 0} shifts available
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Shift group error message */}
                          {shiftGroupError && (
                            <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {shiftGroupError}
                            </div>
                          )}
                          
                          {/* Selected shift group indicator */}
                          {formData.shiftGroupCode && (
                            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Selected: {formData.shiftGroupCode} : {formData.shiftGroupName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shift Search Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="shiftSearch" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          Shift (Optional)
                        </Label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <Input
                              id="shiftSearch"
                              type="text"
                              value={shiftSearch}
                              onChange={handleShiftSearchChange}
                              onFocus={() => availableShifts.length > 0 && setShowShiftDropdown(true)}
                              placeholder={selectedShiftGroup ? "Search available shifts (optional)" : "Select shift group first"}
                              disabled={!selectedShiftGroup}
                              className={`h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-10 ${!selectedShiftGroup ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                              tabIndex={-1}
                            >
                              <Search className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Shift Dropdown results */}
                          {showShiftDropdown && filteredShifts.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                              {filteredShifts.map(shift => (
                                <div
                                  key={shift.shiftCode}
                                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                                  onClick={() => handleShiftSelect(shift)}
                                >
                                  <div className="font-medium text-gray-900">
                                    {shift.shiftCode} : {shift.shiftName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {shift.shiftStart} - {shift.shiftEnd} ({shift.duration} min)
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Selected shift indicator */}
                          {formData.shift && typeof formData.shift === 'object' && Object.keys(formData.shift).length > 0 && 'shiftCode' in formData.shift && (
                            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Selected: {(formData.shift as ShiftData).shiftCode} : {(formData.shift as ShiftData).shiftName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Date Range */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Effective Period
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fromDate" className="text-sm font-medium text-gray-700">
                          From Date *
                        </Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={formData.fromDate}
                          onChange={(e) => updateBasicField("fromDate", e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="toDate" className="text-sm font-medium text-gray-700">
                          To Date *
                        </Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={formData.toDate}
                          onChange={(e) => updateBasicField("toDate", e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Status Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Configuration Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                        <div className="space-y-1">
                          <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                            Active Status
                          </Label>
                          <p className="text-xs text-blue-700">Enable this shift configuration</p>
                        </div>
                        <CustomSwitch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={handleIsActiveChange}
                        />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                        <div className="space-y-1">
                          <Label htmlFor="isAutomatic" className="text-sm font-semibold text-gray-900">
                            Is Automatic
                          </Label>
                          <p className="text-xs text-blue-700">Enable automatic processing</p>
                        </div>
                        <CustomSwitch
                          id="isAutomatic"
                          checked={formData.isAutomatic}
                          onCheckedChange={handleIsAutomaticChange}
                        />
                      </div>
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                        <div className="space-y-1">
                          <Label htmlFor="isRotational" className="text-sm font-semibold text-gray-900">
                            Is Rotational
                          </Label>
                          <p className="text-xs text-blue-700">Enable rotational scheduling</p>
                        </div>
                        <CustomSwitch
                          id="isRotational"
                          checked={formData.isRotational}
                          onCheckedChange={handleIsRotationalChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Grace Settings Display */}
                  {formData.shift && typeof formData.shift === 'object' && Object.keys(formData.shift).length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Grace Settings (Auto-populated from selected shift)
                        </h3>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          {formData.grace && typeof formData.grace === 'object' && Object.keys(formData.grace).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><span className="font-medium">Grace In:</span> {(formData.grace as GraceSettings).graceIn} minutes</p>
                                <p><span className="font-medium">Grace Out:</span> {(formData.grace as GraceSettings).graceOut} minutes</p>
                                <p><span className="font-medium">Late In Allowed:</span> {(formData.grace as GraceSettings).lateInAllowedTime} minutes</p>
                                <p><span className="font-medium">Early Out Allowed:</span> {(formData.grace as GraceSettings).earlyOutAllowedTime} minutes</p>
                              </div>
                              <div>
                                <p><span className="font-medium">In Ahead Margin:</span> {(formData.grace as GraceSettings).inAheadMargin} minutes</p>
                                <p><span className="font-medium">In Above Margin:</span> {(formData.grace as GraceSettings).inAboveMargin} minutes</p>
                                <p><span className="font-medium">Out Ahead Margin:</span> {(formData.grace as GraceSettings).outAheadMargin} minutes</p>
                                <p><span className="font-medium">Out Above Margin:</span> {(formData.grace as GraceSettings).outAboveMargin} minutes</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Week Offs Tab - FIXED to show actual data */}
            <TabsContent value="weekoffs" className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#6BB6FF] to-[#4A90E2] text-white rounded-t-2xl">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <span>Week Off Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Configure weekly off days for different weeks in the rotation cycle
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Week Off Schedule</h3>
                    <Button type="button" onClick={addWeekOff} className="bg-[#007AFF] hover:bg-[#0056CC]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Week
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.weekOffs.map((weekOff, index) => (
                      <div key={index} className="p-6 border border-gray-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Week {weekOff.week}</h4>
                          {formData.weekOffs.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeWeekOff(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          {weekDays.map((day) => (
                            <label
                              key={day.value}
                              className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-blue-50"
                            >
                              <input
                                type="checkbox"
                                checked={weekOff.weekOff.includes(day.value)}
                                onChange={(e) => {
                                  const newWeekOff = e.target.checked
                                    ? [...weekOff.weekOff, day.value]
                                    : weekOff.weekOff.filter((d) => d !== day.value)
                                  updateWeekOff(index, newWeekOff.sort())
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{day.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {weekOff.weekOff.map((dayNum) => {
                            const dayName = weekDays.find((d) => d.value === dayNum)?.label
                            return (
                              <Badge key={dayNum} className="bg-[#B3D9FF] text-[#0056CC]">
                                {dayName}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rotation Settings Tab - FIXED to show actual data */}
            <TabsContent value="rotation" className="space-y-6">
              <Card className="rounded-2xl border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white rounded-t-2xl">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <span>Rotation Configuration</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Configure rotation schedules with priority-based shift assignments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Rotation Schedule</h3>
                    <Button type="button" onClick={addRotationItem} className="bg-[#007AFF] hover:bg-[#0056CC]">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rotation
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.rotation.map((item, index) => (
                      <div key={index} className="p-6 border border-gray-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-gray-800">Rotation {index + 1}</h4>
                          {formData.rotation.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRotationItem(index)}
                              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Days</Label>
                            <Input
                              type="number"
                              value={item.days}
                              onChange={(e) => updateRotationItem(index, "days", Number.parseInt(e.target.value) || 0)}
                              className="h-12 border-2 border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]/20 rounded-xl"
                              placeholder="Enter days"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Priority</Label>
                            <Input
                              type="number"
                              value={item.priority}
                              onChange={(e) =>
                                updateRotationItem(index, "priority", Number.parseInt(e.target.value) || 1)
                              }
                              className="h-12 border-2 border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]/20 rounded-xl"
                              placeholder="Enter priority"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Shift Group Code</Label>
                            <Input
                              value={item.shiftGroupCode}
                              onChange={(e) => updateRotationItem(index, "shiftGroupCode", e.target.value)}
                              className="h-12 border-2 border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]/20 rounded-xl"
                              placeholder="Enter group code"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Shift Code</Label>
                            <Input
                              value={item.shiftCode}
                              onChange={(e) => updateRotationItem(index, "shiftCode", e.target.value)}
                              className="h-12 border-2 border-gray-200 focus:border-[#007AFF] focus:ring-[#007AFF]/20 rounded-xl"
                              placeholder="Enter shift code"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Rotation Summary</h4>
                    <div className="space-y-2">
                      {formData.rotation.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              Priority {item.priority}
                            </Badge>
                            <span className="text-sm text-gray-700">
                              {item.days} days - {item.shiftCode || "No shift"} ({item.shiftGroupCode || "No group"})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 mt-3">
                      Total rotation cycle: {formData.rotation.reduce((sum, item) => sum + item.days, 0)} days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              className="px-8 py-3 h-12 rounded-xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={postLoading}
              className="px-8 py-3 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {postLoading ? "Saving..." : isEditMode ? "Update" : "Save Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}