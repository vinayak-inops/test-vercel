'use client';

import { useState, useEffect } from 'react';
import { Button } from "@repo/ui/components/ui/button";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import { ChevronRight, ChevronDown, Filter, X, Search, Building2, Users, Briefcase, Layers, Network, MapPin, GraduationCap, Award } from 'lucide-react';
import organizationData from '@/json/report/sample-organization';

type FieldName = 'subsidiaries' | 'divisions' | 'departments' | 'subDepartments' | 'sections' | 'designations' | 'location' | 'grades';

interface HierarchyFilterProps {
    onFilterChange: (filters: Record<FieldName, any[]>) => void;
    initialFilters?: Record<FieldName, any[]>;
}

const parentFieldMap: Record<FieldName, FieldName | null> = {
    subsidiaries: null,
    divisions: "subsidiaries",
    departments: "divisions",
    subDepartments: "departments",
    sections: "subDepartments",
    designations: "divisions",
    location: "subsidiaries",
    grades: "designations"
};

const childFieldMap: Record<FieldName, FieldName[]> = {
    subsidiaries: ["divisions", "departments", "subDepartments", "sections", "designations", "grades", "location"],
    divisions: ["departments", "subDepartments", "sections", "designations", "grades"],
    departments: ["subDepartments", "sections"],
    subDepartments: ["sections"],
    designations: ["grades"],
    sections: [],
    location: [],
    grades: []
};

const fieldLabels: Record<FieldName, string> = {
    subsidiaries: "Subsidiaries",
    divisions: "Divisions",
    departments: "Departments",
    subDepartments: "Sub Departments",
    sections: "Sections",
    designations: "Designations",
    location: "Locations",
    grades: "Grades"
};

const fieldIcons: Record<FieldName, React.ReactNode> = {
    subsidiaries: <Building2 className="w-5 h-5" />,
    divisions: <Network className="w-5 h-5" />,
    departments: <Layers className="w-5 h-5" />,
    subDepartments: <Layers className="w-5 h-5" />,
    sections: <Briefcase className="w-5 h-5" />,
    designations: <Users className="w-5 h-5" />,
    location: <MapPin className="w-5 h-5" />,
    grades: <GraduationCap className="w-5 h-5" />
};

export function EmployeeHierarchyFilter({ onFilterChange, initialFilters }: HierarchyFilterProps) {
    const [selectedPath, setSelectedPath] = useState<FieldName[]>([]);
    const [expandedFields, setExpandedFields] = useState<Record<FieldName, boolean>>({
        subsidiaries: false,
        divisions: false,
        departments: false,
        subDepartments: false,
        sections: false,
        designations: false,
        location: false,
        grades: false
    });
    const [selectedFilters, setSelectedFilters] = useState<Record<FieldName, any[]>>({
        subsidiaries: [],
        divisions: [],
        departments: [],
        subDepartments: [],
        sections: [],
        designations: [],
        location: [],
        grades: []
    });

    const [availableOptions, setAvailableOptions] = useState<Record<FieldName, any[]>>({
        subsidiaries: organizationData.subsidiaries,
        divisions: [],
        departments: [],
        subDepartments: [],
        sections: [],
        designations: [],
        location: organizationData.location,
        grades: []
    });

    useEffect(() => {
        updateAvailableOptions();
    }, [selectedFilters]);

    const updateAvailableOptions = () => {
        const newOptions = { ...availableOptions };

        // Reset all child options when parent changes
        selectedPath.forEach(field => {
            childFieldMap[field].forEach(childField => {
                newOptions[childField] = [];
            });
        });

        // Update options based on selected filters
        Object.entries(selectedFilters).forEach(([field, selected]) => {
            if (selected.length > 0) {
                const parentField = parentFieldMap[field as FieldName];
                if (parentField) {
                    const parentSelections = selectedFilters[parentField];
                    if (parentSelections.length > 0) {
                        // Filter options based on parent selection
                        const fieldData = organizationData?.[field as keyof typeof organizationData];
                        if (Array.isArray(fieldData)) {
                            const filteredOptions = fieldData.filter((item: any) => {
                                return parentSelections.some((parent: any) => {
                                    const parentKey = `${parentField}Code`;
                                    return item[parentKey] === parent[`${parentField}Code`];
                                });
                            });
                            newOptions[field as FieldName] = filteredOptions;
                        }
                    }
                }
            }
        });

        setAvailableOptions(newOptions);
    };

    const handleFieldSelect = (field: FieldName) => {
        if (!selectedPath.includes(field)) {
            setSelectedPath([...selectedPath, field]);
            setExpandedFields(prev => ({ ...prev, [field]: true }));
        }
    };

    const handleFieldDeselect = (field: FieldName) => {
        setSelectedPath(selectedPath.filter(f => f !== field));
        setExpandedFields(prev => ({ ...prev, [field]: false }));
        
        // Clear all child selections
        const newFilters = { ...selectedFilters };
        childFieldMap[field].forEach(childField => {
            newFilters[childField] = [];
        });
        setSelectedFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleOptionSelect = (field: FieldName, option: any) => {
        const newFilters = { ...selectedFilters };
        const currentSelections = newFilters[field];
        
        if (currentSelections.some(item => item[`${field}Code`] === option[`${field}Code`])) {
            newFilters[field] = currentSelections.filter(item => item[`${field}Code`] !== option[`${field}Code`]);
        } else {
            newFilters[field] = [...currentSelections, option];
        }

        // Clear child selections when parent changes
        childFieldMap[field].forEach(childField => {
            newFilters[childField] = [];
        });

        setSelectedFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <TopTitleDescription
                    titleValue={{
                        title: "Employee Organization Structure",
                        description: "First select your filtration path, then choose values for each level"
                    }}
                />
            </div>

            {/* Filtration Path Selection */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Filtration Path</h3>
                <div className="w-full flex justify-center">
                    <div className="flex bg-white rounded-xl border border-gray-200 w-fit mx-auto overflow-x-auto">
                        {Object.entries(fieldLabels).map(([field, label], idx) => {
                            const fieldName = field as FieldName;
                            const isSelected = selectedPath.includes(fieldName);
                            const selectedCount = selectedFilters[fieldName].length;
                            const totalTabs = Object.keys(fieldLabels).length;

                            return (
                                <button
                                    key={field}
                                    onClick={() => handleFieldSelect(fieldName)}
                                    disabled={isSelected}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-1.5 transition-all duration-150
                                        border-0 border-r last:border-r-0
                                        text-sm
                                        ${isSelected
                                            ? 'bg-white text-blue-700 font-semibold'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                                        ${isSelected ? 'z-10' : ''}
                                    `}
                                    style={{
                                        borderRadius: idx === 0
                                            ? '9999px 0 0 9999px'
                                            : idx === totalTabs - 1
                                            ? '0 9999px 9999px 0'
                                            : '0',
                                        borderBottom: isSelected ? '3px solid #6366f1' : '3px solid transparent', // indigo-500
                                        minWidth: 80,
                                        fontSize: '0.95rem',
                                        cursor: isSelected ? 'default' : 'pointer',
                                        transition: 'border-bottom 0.2s',
                                    }}
                                >
                                    <span className={`text-base ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`}>{fieldIcons[fieldName]}</span>
                                    <span className={`${isSelected ? 'font-bold' : 'font-medium'}`}>{label}</span>
                                    {selectedCount > 0 && (
                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                                            ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {selectedCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex min-h-[500px]">
                {/* Left Side - Selected Path and Options */}
                <div className="w-1/3 border-r border-gray-100">
                    {/* Selected Path Display */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Selected Path</h3>
                        <div className="space-y-2">
                            {selectedPath.map((field, index) => (
                                <div key={field} className="flex items-center space-x-2">
                                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200 flex-1">
                                        <div className="text-blue-600">{fieldIcons[field]}</div>
                                        <span className="text-sm font-medium text-gray-700">{fieldLabels[field]}</span>
                                        <button
                                            onClick={() => handleFieldDeselect(field)}
                                            className="ml-auto text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {selectedPath.length === 0 && (
                                <div className="text-sm text-gray-500 italic flex items-center bg-white p-3 rounded-lg border border-gray-200">
                                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                                    Select a filter to begin building your path
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options for Selected Field */}
                    {selectedPath.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {fieldLabels[selectedPath[selectedPath.length - 1]]} Options
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search options..."
                                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                {availableOptions[selectedPath[selectedPath.length - 1]]?.map((option: any) => {
                                    const fieldName = selectedPath[selectedPath.length - 1];
                                    const isOptionSelected = selectedFilters[fieldName].some(
                                        (item: any) => item[`${fieldName}Code`] === option[`${fieldName}Code`]
                                    );
                                    return (
                                        <label
                                            key={option[`${fieldName}Code`]}
                                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isOptionSelected}
                                                onChange={() => handleOptionSelect(fieldName, option)}
                                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {option[`${fieldName}Name`] || option.label || option.value}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Selected Values Summary */}
                <div className="flex-1 p-6">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                            <Filter className="w-4 h-4 mr-2 text-blue-600" />
                            Selected Values
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(selectedFilters).map(([field, values]) => {
                                if (values.length === 0) return null;
                                return (
                                    <div key={field} className="bg-white rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="text-blue-600">{fieldIcons[field as FieldName]}</div>
                                            <span className="font-medium text-gray-900">{fieldLabels[field as FieldName]}</span>
                                            <span className="text-xs text-gray-500">({values.length} selected)</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {values.map((v: any) => (
                                                <div key={v[`${field}Code`]} className="bg-blue-50 px-2 py-1 rounded text-sm text-blue-700">
                                                    {v[`${field}Name`] || v.label || v.value}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {!Object.entries(selectedFilters).some(([_, values]) => values.length > 0) && (
                                <div className="text-sm text-gray-500 italic text-center py-4">
                                    No values selected yet. Select a path and choose values to see them here.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 