"use client"

import { useTableFunctionality } from "@/hooks/organization/location/useTableFunctionality";
import Table from "@repo/ui/components/table-dynamic/data-table"
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Building2, Users, Briefcase, Award, Layers, FolderOpen, UserCheck, GraduationCap, Settings, Plus, Eye, Edit, Trash2, Building, Globe, Hash, FileText, Calendar, Package } from "lucide-react";
import EnhancedHeader from "./enhanced-header";
import DynamicDetailPopup from "./dynamic-detail-popup";
import LocationAddFormValidated from "./static-components/form/LocationAddFormValidated";
import SubsidiaryAddFormValidated from "./static-components/form/SubsidiaryAddFormValidated";
import DivisionAddFormValidated from "./static-components/form/DivisionAddFormValidated";
import DesignationAddFormValidated from "./static-components/form/DesignationAddFormValidated";
import GradeAddFormValidated from "./static-components/form/GradeAddFormValidated";
import DepartmentAddFormValidated from "./static-components/form/DepartmentAddFormValidated";
import SubDepartmentAddFormValidated from "./static-components/form/SubDepartmentAddFormValidated";
import SectionAddFormValidated from "./static-components/form/SectionAddFormValidated";
import EmployeeCategoryAddFormValidated from "./static-components/form/EmployeeCategoryAddFormValidated";
import WorkSkillAddFormValidated from "./static-components/form/WorkSkillAddFormValidated";
import NatureOfWorkAddFormValidated from "./static-components/form/NatureOfWorkAddFormValidated";
import RegionAddFormValidated from "./static-components/form/RegionAddFormValidated";
import ReasonCodeAddFormValidated from "./static-components/form/ReasonCodeAddFormValidated";
import WagePeriodAddFormValidated from "./static-components/form/WagePeriodAddFormValidated";
import SkillLevelsAddFormValidated from "./static-components/form/SkillLevelsAddFormValidated";
import AssetMasterAddFormValidated from "./static-components/form/AssetMasterAddFormValidated";
import DocumentMasterAddFormValidated from "./static-components/form/DocumentMasterAddFormValidated";
import StateAddFormValidated from "./static-components/form/StateAddFormValidated";
import CountryAddFormValidated from "./static-components/form/CountryAddFormValidated";

// Transform camelCase to hyphenated lowercase
const transformToHyphenated = (param: string) => {
    return param
        .replace(/([A-Z])/g, '-$1') // Add hyphen before capital letters
        .toLowerCase() // Convert to lowercase
        .replace(/^-/, ''); // Remove leading hyphen if exists
};

// Transform hyphenated lowercase back to camelCase
const transformToCamelCase = (param: string) => {
    return param
        .split('-') // Split by hyphen
        .map((word, index) => {
            // Capitalize first letter of each word except the first word
            return index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(''); // Join words back together
};

const nestedEntityMappings: Record<string, string> = {
    assetMaster: "assetMaster.assets",
    documentMaster: "documentMaster.documentCategory",
    wagePeriod: "wagePeriod", 
    // add more mappings as needed
  };

  const getNestedArray = (data: any, path: string): any[] => {
    return path.split('.').reduce((obj, key) => obj?.[key], data) || [];
  };

  // Function to flatten nested data for table display
  const flattenDataForTable = (data: any[], type: string): any[] => {
    if (type === 'wagePeriod') {
      return data.map(item => ({
        employeeCategoryCode: item.employeeCategory?.employeeCategoryCode || '',
        employeeCategoryName: item.employeeCategory?.employeeCategoryName || '',
        fromDay: item.wagePeriod?.from || '',
        toDay: item.wagePeriod?.to || ''
      }));
    }
    return data;
  };

  // Function to reconstruct original nested structure for edit operations
  const reconstructNestedData = (flattenedItem: any, type: string): any => {
    if (type === 'wagePeriod') {
      return {
        ...flattenedItem,
        employeeCategory: {
          employeeCategoryCode: flattenedItem.employeeCategoryCode,
          employeeCategoryName: flattenedItem.employeeCategoryName
        },
        wagePeriod: {
          from: flattenedItem.fromDay,
          to: flattenedItem.toDay
        }
      };
    }
    return flattenedItem;
  };

// Dynamic header configuration based on organization type and mode
const getHeaderConfig = (organizationType: string, mode: string | null) => {
    const typeConfigs = {
        location: {
            icon: MapPin,
            title: "Location Management",
            color: "from-blue-500 to-indigo-600",
            bgColor: "from-blue-50 to-indigo-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700"
        },
        subsidiaries: {
            icon: Building2,
            title: "Subsidiary Management",
            color: "from-purple-500 to-pink-600",
            bgColor: "from-purple-50 to-pink-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-700"
        },
        divisions: {
            icon: Layers,
            title: "Division Management",
            color: "from-green-500 to-emerald-600",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200",
            textColor: "text-green-700"
        },
        natureOfWork: {
            icon: Briefcase,
            title: "Nature of Work Management",
            color: "from-orange-500 to-red-600",
            bgColor: "from-orange-50 to-red-50",
            borderColor: "border-orange-200",
            textColor: "text-orange-700"
        },
        workSkill: {
            icon: Award,
            title: "Work Skill Management",
            color: "from-yellow-500 to-amber-600",
            bgColor: "from-yellow-50 to-amber-50",
            borderColor: "border-yellow-200",
            textColor: "text-yellow-700"
        },
        employeeCategories: {
            icon: Users,
            title: "Employee Category Management",
            color: "from-indigo-500 to-purple-600",
            bgColor: "from-indigo-50 to-purple-50",
            borderColor: "border-indigo-200",
            textColor: "text-indigo-700"
        },
        grades: {
            icon: GraduationCap,
            title: "Grade Management",
            color: "from-teal-500 to-cyan-600",
            bgColor: "from-teal-50 to-cyan-50",
            borderColor: "border-teal-200",
            textColor: "text-teal-700"
        },
        sections: {
            icon: FolderOpen,
            title: "Section Management",
            color: "from-pink-500 to-rose-600",
            bgColor: "from-pink-50 to-rose-50",
            borderColor: "border-pink-200",
            textColor: "text-pink-700"
        },
        subDepartments: {
            icon: Settings,
            title: "Sub Department Management",
            color: "from-gray-500 to-slate-600",
            bgColor: "from-gray-50 to-slate-50",
            borderColor: "border-gray-200",
            textColor: "text-gray-700"
        },
        departments: {
            icon: Building2,
            title: "Department Management",
            color: "from-blue-500 to-cyan-600",
            bgColor: "from-blue-50 to-cyan-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700"
        },
        designations: {
            icon: UserCheck,
            title: "Designation Management",
            color: "from-violet-500 to-purple-600",
            bgColor: "from-violet-50 to-purple-50",
            borderColor: "border-violet-200",
            textColor: "text-violet-700"
        },
        region: {
            icon: Globe,
            title: "Region Management",
            color: "from-cyan-500 to-blue-600",
            bgColor: "from-cyan-50 to-blue-50",
            borderColor: "border-cyan-200",
            textColor: "text-cyan-700"
        },
        reasonCodes: {
            icon: FileText,
            title: "Reason Code Management",
            color: "from-emerald-500 to-teal-600",
            bgColor: "from-emerald-50 to-teal-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700"
        },
        wagePeriod: {
            icon: FileText,
            title: "Wage Period Management",
            color: "from-emerald-500 to-teal-600",
            bgColor: "from-emerald-50 to-teal-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700"
        },
        skillLevels: {
            icon: Award,
            title: "Skill Level Management",
            color: "from-purple-500 to-pink-600",
            bgColor: "from-purple-50 to-pink-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-700"
        },
        assetMaster: {
            icon: FolderOpen,
            title: "Asset Master Management",
            color: "from-blue-500 to-indigo-600",
            bgColor: "from-blue-50 to-indigo-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700"
        },
        documentMaster: {
            icon: FileText,
            title: "Document Master Management",
            color: "from-green-500 to-emerald-600",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200",
            textColor: "text-green-700"
        },
        state: {
            icon: FileText,
            title: "State Management",
            color: "from-emerald-500 to-teal-600",
            bgColor: "from-emerald-50 to-teal-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700"
        },
        country: {
            icon: FileText,
            title: "Country Management",
            color: "from-emerald-500 to-teal-600",
            bgColor: "from-emerald-50 to-teal-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-700"
        },
    };

    const modeConfigs = {
        read: {
            title: "View Mode",
            description: "Click on any row to see detailed information",
            icon: Eye,
            actionText: "View Details"
        },
        view: {
            title: "View Mode",
            description: "Click on any row to see detailed information",
            icon: Eye,      
            actionText: "View Details"
        },
        edit: {
            title: "Edit Mode",
            description: "Modify existing records and save changes",
            icon: Edit,
            actionText: "Edit Records"
        },
        delete: {
            title: "Delete Mode",
            description: "Select records to remove from the system",
            icon: Trash2,
            actionText: "Delete Records"
        },
        add: {
            title: "Add New",
            description: "Create new records in the system",
            icon: Plus,
            actionText: "Add New Record"
        },
        "": {
            title: "Dashboard",
            description: "Manage organization data and records",
            icon: Building,
            actionText: "Manage Records"
        }
    };

    const typeConfig = typeConfigs[organizationType as keyof typeof typeConfigs] || typeConfigs.location;
    const modeConfig = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs[""];

    return {
        ...typeConfig,
        ...modeConfig,
        fullTitle: `${typeConfig.title} - ${modeConfig.title}`
    };
};

// Popup config for each entity type
const popupConfigs: Record<string, any> = {
    location: {
        title: "Location Details",
        description: "Comprehensive location information and management",
        fields: [
            { label: "Location Name", key: "locationName", icon: <MapPin className="w-4 h-4 text-blue-500" /> },
            { label: "Location Code", key: "locationCode", icon: <Hash className="w-4 h-4 text-green-500" /> },
            { label: "Region Code", key: "regionCode", icon: <Globe className="w-4 h-4 text-blue-500" /> },
            { label: "Country Code", key: "countryCode", icon: <Globe className="w-4 h-4 text-green-500" /> },
            { label: "State Code", key: "stateCode", icon: <MapPin className="w-4 h-4 text-purple-500" /> },
            { label: "City", key: "city", icon: <Building2 className="w-4 h-4 text-orange-500" /> },
            { label: "Pincode", key: "pincode", icon: <Hash className="w-4 h-4 text-pink-500" /> },
            { label: "Description", key: "locationDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    subsidiaries: {
        title: "Subsidiary Details",
        description: "Comprehensive subsidiary information and management",
        fields: [
            { label: "Subsidiary Name", key: "subsidiaryName", icon: <Building2 className="w-4 h-4 text-blue-500" /> },
            { label: "Subsidiary Code", key: "subsidiaryCode", icon: <Hash className="w-4 h-4 text-green-500" /> },
            { label: "Description", key: "subsidiaryDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    divisions: {
        title: "Division Details",
        description: "Comprehensive division information and management",
        fields: [
            { label: "Division Name", key: "divisionName", icon: <Layers className="w-4 h-4 text-green-500" /> },
            { label: "Division Code", key: "divisionCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Subsidiary Code", key: "subsidiaryCode", icon: <Building2 className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "divisionDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    designations: {
        title: "Designation Details",
        description: "Comprehensive designation information and management",
        fields: [
            { label: "Designation Name", key: "designationName", icon: <UserCheck className="w-4 h-4 text-violet-500" /> },
            { label: "Designation Code", key: "designationCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Division Code", key: "divisionCode", icon: <Hash className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "designationDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    departments: {
        title: "Department Details",
        description: "Comprehensive department information and management",
        fields: [
            { label: "Department Name", key: "departmentName", icon: <Building2 className="w-4 h-4 text-blue-500" /> },
            { label: "Department Code", key: "departmentCode", icon: <Hash className="w-4 h-4 text-green-500" /> },
            { label: "Division Code", key: "divisionCode", icon: <Hash className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "departmentDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    subDepartments: {
        title: "Sub Department Details",
        description: "Comprehensive sub department information and management",
        fields: [
            { label: "Sub Department Name", key: "subDepartmentName", icon: <Settings className="w-4 h-4 text-gray-500" /> },
            { label: "Sub Department Code", key: "subDepartmentCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Department Code", key: "departmentCode", icon: <Hash className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "subDepartmentDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    sections: {
        title: "Section Details",
        description: "Comprehensive section information and management",
        fields: [
            { label: "Section Name", key: "sectionName", icon: <FolderOpen className="w-4 h-4 text-pink-500" /> },
            { label: "Section Code", key: "sectionCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Sub Department Code", key: "subDepartmentCode", icon: <Hash className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "sectionDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    grades: {
        title: "Grade Details",
        description: "Comprehensive grade information and management",
        fields: [
            { label: "Grade Name", key: "gradeName", icon: <GraduationCap className="w-4 h-4 text-teal-500" /> },
            { label: "Grade Code", key: "gradeCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Description", key: "gradeDescription", isDescription: true },
            { label: "Designation Code", key: "designationCode", icon: <UserCheck className="w-4 h-4 text-purple-500" /> },
        ],
        statusKey: "status"
    },
    employeeCategories: {
        title: "Employee Category Details",
        description: "Comprehensive employee category information and management",
        fields: [
            { label: "Employee Category Name", key: "employeeCategoryName", icon: <Users className="w-4 h-4 text-indigo-500" /> },
            { label: "Employee Category Code", key: "employeeCategoryCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Description", key: "employeeCategoryDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    natureOfWork: {
        title: "Nature Of Work Details",
        description: "Comprehensive nature of work information and management",
        fields: [
            { label: "Nature Of Work Title", key: "natureOfWorkTitle", icon: <Briefcase className="w-4 h-4 text-orange-500" /> },
            { label: "Nature Of Work Code", key: "natureOfWorkCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Description", key: "natureOfWorkDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    workSkill: {
        title: "Work Skill Details",
        description: "Comprehensive work skill information and management",
        fields: [
            { label: "Work Skill Title", key: "workSkillTitle", icon: <Award className="w-4 h-4 text-yellow-500" /> },
            { label: "Work Skill Code", key: "workSkillCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Description", key: "workSkillDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    region: {
        title: "Region Details",
        description: "Comprehensive region information and management",
        fields: [
            { label: "Region Name", key: "regionName", icon: <Globe className="w-4 h-4 text-cyan-500" /> },
            { label: "Region Code", key: "regionCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Description", key: "regionDescription", isDescription: true },
        ],
        statusKey: "status"
    },
    reasonCodes: {
        title: "Reason Code Details",
        description: "Comprehensive reason code information and management",
        statusKey: "status",
        fields: [
            { label: "Reason Code", key: "reasonCode", icon: <FileText className="w-4 h-4 text-emerald-500" /> },
            { label: "Reason Name", key: "reasonName", icon: <FileText className="w-4 h-4 text-teal-500" /> },
            { label: "Description", key: "reasonDescription", icon: <FileText className="w-4 h-4 text-blue-500" /> }
        ]
    },
    wagePeriod: {
        title: "Wage Period Details",
        description: "Comprehensive wage period information and management",
        statusKey: "status",
        fields: [
            { label: "Employee Category Code", key: "employeeCategory.employeeCategoryCode", icon: <FileText className="w-4 h-4 text-emerald-500" /> },
            { label: "Employee Category Name", key: "employeeCategory.employeeCategoryName", icon: <FileText className="w-4 h-4 text-teal-500" /> },
            { label: "From Day", key: "wagePeriod.from", icon: <FileText className="w-4 h-4 text-blue-500" /> },
            { label: "To Day", key: "wagePeriod.to", icon: <FileText className="w-4 h-4 text-purple-500" /> }
        ]
    },
    skillLevels: {
        title: "Skill Level Details",
        description: "Comprehensive skill level information and management",
        statusKey: "status",
        fields: [
            { label: "Skill Level Title", key: "skilledLevelTitle", icon: <Award className="w-4 h-4 text-purple-500" /> },
            { label: "Description", key: "skilledLevelDescription", isDescription: true },
        ]
    },
    assetMaster: {
        title: "Asset Master Details",
        description: "Comprehensive asset master information and management",
        statusKey: "status",
        fields: [
            { label: "Asset Code", key: "assetCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Asset Name", key: "assetName", icon: <FolderOpen className="w-4 h-4 text-green-500" /> },
            { label: "Asset Type", key: "assetType", icon: <Package className="w-4 h-4 text-purple-500" /> },
        ]
    },
    documentMaster: {
        title: "Document Master Details",
        description: "Comprehensive document master information and management",
        statusKey: "status",
        fields: [
            { label: "Document Category Code", key: "documentCategoryCode", icon: <Hash className="w-4 h-4 text-blue-500" /> },
            { label: "Document Category Name", key: "documentCategoryName", icon: <FileText className="w-4 h-4 text-green-500" /> },
            { label: "Document Type", key: "documentType", icon: <FileText className="w-4 h-4 text-purple-500" /> },
        ]
    },
    state: {
        title: "State Details",
        description: "Comprehensive state information and management",
        statusKey: "status",
        fields: [
            { label: "State Name", key: "stateName", icon: <FileText className="w-4 h-4 text-blue-500" /> },
            { label: "State Code", key: "stateCode", icon: <Hash className="w-4 h-4 text-green-500" /> },
            { label: "Country Code", key: "countryCode", icon: <Hash className="w-4 h-4 text-purple-500" /> },
        ]
    },
    country: {
        title: "Country Details",
        description: "Comprehensive country information and management",
        statusKey: "status",
        fields: [
            { label: "Country Name", key: "countryName", icon: <FileText className="w-4 h-4 text-blue-500" /> },
            { label: "Country Code", key: "countryCode", icon: <Hash className="w-4 h-4 text-green-500" /> },
        ]
    }
};

export default function SubOrganizationPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const [subOrganization, setSubOrganization] = useState<any[]>([])
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState<any>(null)
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
    const [localOrganizationData, setLocalOrganizationData] = useState<any>({})
    const [editData, setEditData] = useState<any>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [deleteValue, setDeleteValue] = useState<any>(null)
    

    // If the param contains hyphens, convert to camelCase, otherwise convert to hyphenated
    const param = params.organization[0];
    const transformedParam = transformToCamelCase(param)

    // Check if we're in view mode
    const mode = searchParams.get('mode')
    const isViewMode = mode === 'read' || mode === 'view'

    const {
        data,
        error,
        loading,
        refetch
    }: {
        data: any;
        error: any;
        loading: any;
        refetch: any;
    } = useRequest<any[]>({
        url: 'map/organization/search?tenantCode=Midhani',
        onSuccess: (data: any) => {
            console.log("organizationData", data)
            console.log("transformedParam", transformedParam)
            // setSubOrganization(data[0][transformedParam]);
            
            const nestedPath = nestedEntityMappings[transformedParam];

            let normalizedData = nestedPath
                ? getNestedArray(data[0], nestedPath)
                : data[0]?.[transformedParam] || [];

            // Flatten data for table display if needed
            normalizedData = flattenDataForTable(normalizedData, transformedParam);

            setSubOrganization(normalizedData);
            setLocalOrganizationData(data[0] || {});
        },
        onError: (error: any) => {
            console.error('Error loading organization data:', error);
        }
    });

    // Handle row click for view mode
    const handleRowClick = () => {
        if (isViewMode && selectedValue) {
            setIsPopupOpen(true);
        }
    };

    // Handle edit operation
    const handleEdit = (id: string) => {
        // Find the item to edit
        const itemToEdit = subOrganization.find(item => item.id === id || item._id === id)
        if (itemToEdit) {
            setEditData(itemToEdit)
            setIsEditMode(true)
            setIsAddDrawerOpen(true)
        }
    };

    const functionalityList = {
        tabletype: {
            type: "data",
            classvalue: {
                container: "col-span-12 mb-2",
                tableheder: {
                    container: "bg-[#f8fafc]",
                },
                label: "text-gray-600",
                field: "p-1",
            },
        },
        columnfunctionality: {
            draggable: {
                status: true,
            },
            handleRenameColumn: {
                status: true,
            },
            slNumber: {
                status: true,
            },
            selectCheck: {
                status: false,
            },
            activeColumn: {
                status: true,
            },
        },
        textfunctionality: {
            expandedCells: {
                status: true,
            },
        },
        filterfunctionality: {
            handleSortAsc: {
                status: true,
            },
            handleSortDesc: {
                status: true,
            },
            search: {
                status: true,
            },
        },
        outsidetablefunctionality: {
            paginationControls: {
                status: true,
                start: "",
                end: "",
            },
            entriesPerPageSelector: {
                status: false,
            },
        },
        buttons: {
            save: {
                label: "Save",
                status: false,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: () => console.log("form"),
            },
            submit: {
                label: "Submit",
                status: false,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: () => console.log("form"),
            },
            addnew: {
                label: "Add New",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: () => setIsAddDrawerOpen(true),
            },
            cancel: {
                label: "Cancel",
                status: false,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: () => console.log("form"),
            },
            actionDelete: {
                label: "Delete",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: (item: any) => {
                    setDeleteValue(item)
                },
            },
            actionLink: {
                label: "link",
                status: false,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: (item: any) => {
                    setSelectedValue(item);
                    setIsPopupOpen(true);
                },
            },
            actionEdit: {
                label: "Edit",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: (item: any) => {
                    console.log("Edit button clicked for item:", item);
                    // Reconstruct the original nested structure for edit operations
                    // const reconstructedItem = reconstructNestedData(item, transformedParam);
                    // console.log("Reconstructed item for edit:", reconstructedItem);
                    // Set the reconstructed item data for editing
                    setEditData(item);
                    // Enable edit mode
                    setIsEditMode(true);
                    // Open the form
                    setIsAddDrawerOpen(true);
                },
            },
        },
    }

    const headerConfig = getHeaderConfig(transformedParam, mode);
    const IconComponent = headerConfig.icon;

    // Function to get the appropriate form component based on organization type
    const getFormComponent = (organizationType: string) => {
      switch (organizationType) {
        case 'location':
          return LocationAddFormValidated;
        case 'subsidiaries':
          return SubsidiaryAddFormValidated;
        case 'divisions':
          return DivisionAddFormValidated;
        case 'designations':
          return DesignationAddFormValidated;
        case 'grades':
          return GradeAddFormValidated;
        case 'departments':
          return DepartmentAddFormValidated;
        case 'subDepartments':
          return SubDepartmentAddFormValidated;
        case 'sections':
          return SectionAddFormValidated;
        case 'employeeCategories':
          return EmployeeCategoryAddFormValidated;
        case 'workSkill':
          return WorkSkillAddFormValidated;
        case 'natureOfWork':
          return NatureOfWorkAddFormValidated;
        case 'region':
          return RegionAddFormValidated;
        case 'reasonCodes':
          return ReasonCodeAddFormValidated;
        case 'wagePeriod':
          return WagePeriodAddFormValidated;
        case 'skillLevels':
          return SkillLevelsAddFormValidated;
        case 'assetMaster':
          return AssetMasterAddFormValidated;
        case 'documentMaster':
          return DocumentMasterAddFormValidated;
        case 'state':
          return StateAddFormValidated;
        case 'country':
          return CountryAddFormValidated;
        case 'region':
          return RegionAddFormValidated;
        default:
          return LocationAddFormValidated; // fallback
      }
    };

    const FormComponent = getFormComponent(transformedParam);

    const locationFields = selectedValue
        ? [
            { label: "Region Code", value: selectedValue.regionCode, icon: <Globe className="w-4 h-4 text-blue-500" /> },
            { label: "Country Code", value: selectedValue.countryCode, icon: <Globe className="w-4 h-4 text-green-500" /> },
            { label: "State Code", value: selectedValue.stateCode, icon: <MapPin className="w-4 h-4 text-purple-500" /> },
            { label: "City", value: selectedValue.city, icon: <Building2 className="w-4 h-4 text-orange-500" /> },
            { label: "Pincode", value: selectedValue.pincode, icon: <Hash className="w-4 h-4 text-pink-500" /> },
        ]
        : [];

    return (
        <div className="px-12 py-4">
            {/* Dynamic Linear.app-inspired Header */}
            {console.log("Current subOrganization state:", subOrganization)}
            <EnhancedHeader
                title={headerConfig.fullTitle}
                description={headerConfig.description}
                IconComponent={headerConfig.icon}
                recordCount={subOrganization?.length || 0}
                organizationType={transformedParam}
                lastSync={2}
                uptime={99.9}
            />

            <Table functionalityList={functionalityList} data={subOrganization} />

            {isPopupOpen && popupConfigs[transformedParam] && (
                <DynamicDetailPopup
                    open={isPopupOpen}
                    setOpen={setIsPopupOpen}
                    title={popupConfigs[transformedParam].title}
                    description={popupConfigs[transformedParam].description}
                    data={selectedValue || {}}
                    fields={popupConfigs[transformedParam].fields}
                    status={selectedValue ? selectedValue[popupConfigs[transformedParam].statusKey] : undefined}
                />
            )}

            <FormComponent
                open={isAddDrawerOpen}
                deleteValue={deleteValue}
                setOpen={(open: boolean) => {
                    setIsAddDrawerOpen(open)
                    if (!open) {
                        setIsEditMode(false)
                        setEditData(null)
                    }
                }}
                organizationData={localOrganizationData}
                editData={editData}
                isEditMode={isEditMode}
                onSuccess={(updatedOrganizationData:any) => {
                    console.log("Form submitted with updated data:", updatedOrganizationData);
                    console.log("transformedParam in onSuccess:", transformedParam);
                    console.log("updatedOrganizationData[transformedParam]:", updatedOrganizationData[transformedParam]);
                    
                    if (updatedOrganizationData && typeof updatedOrganizationData === 'object') {
                        
                        setLocalOrganizationData(updatedOrganizationData);
                        
                        if (updatedOrganizationData[transformedParam]) {
                            setSubOrganization(updatedOrganizationData[transformedParam]);
                        }
                    }
                    setIsEditMode(false)
                    setEditData(null)
                }}
                onServerUpdate={async () => {
                    console.log("Refreshing data from server...");
                    try {
                        const freshData = await refetch();
                        console.log("Fresh data received:", freshData);
                        
                        if (freshData && freshData[0]) {
                            setLocalOrganizationData(freshData[0]);
                            if (freshData[0][transformedParam]) {
                                setSubOrganization(freshData[0][transformedParam]);
                            }
                        }
                        
                        return freshData;
                    } catch (error) {
                        console.error("Error refreshing data from server:", error);
                        throw error;
                    }
                }}
            />
            {/* {transformedParam === "location" && <LocationManagement />} */}
            {/* {transformedParam === "location" && <LocationManagement />}
            {transformedParam === "subsidiaries" && <SubsidiariesManagement/>}
            {transformedParam === "divisions" && <DivisionManagement />}
            {transformedParam === "natureOfWork" && <NatureOfWorkManagement/>}
            {transformedParam === "workSkill" && <WorkSkillManagement/>}
            {transformedParam === "employeeCategories" && <CategoryManagement/>}
            {transformedParam === "grades" && <GradeManagement/>}
            {transformedParam === "sections" && <SectionManagement/>}
            {transformedParam === "subDepartments" && <SubDepartmentManagement/>}
            {transformedParam === "departments" && <DepartmentManagement/>}
            {transformedParam === "designations" && <DesignationManagement/>} */}
        </div>
    )
} 