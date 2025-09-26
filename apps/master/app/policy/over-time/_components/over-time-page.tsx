"use client"

import Table from "@repo/ui/components/table-dynamic/data-table";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react"
import { Clock } from "lucide-react";
import EnhancedHeader from "@/app/organization/[...organization]/_components/enhanced-header";
import OTPolicyForm from "./OTPolicyForm";

const transformToUnderscore = (param: string) => {
    return param
        .replace(/-/g, '_') // Replace all hyphens with underscores
        .replace(/([A-Z])/g, '_$1') // Add underscore before capital letters
        .toLowerCase() // Convert to lowercase
        .replace(/^_/, ''); // Remove leading underscore if exists
};

// Function to filter out object values and replace with empty strings
const filterObjectValues = (data: any[]): any[] => {
    return data.map(item => {
        const filteredItem: any = {};
        Object.keys(item).forEach(key => {
            const value = item[key];
            
            // Handle specific nested objects to extract their values
            if (key === 'subsidiary' && typeof value === 'object' && value !== null) {
                filteredItem[key] = value.subsidiaryCode || "";
            } else if (key === 'location' && typeof value === 'object' && value !== null) {
                filteredItem[key] = value.locationCode || "";
            } else if (key === 'otPolicy' && typeof value === 'object' && value !== null) {
                filteredItem['Policy Name'] = value.otPolicyName || "";
                filteredItem['Policy Code'] = value.otPolicyCode || "";
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // For other objects, still replace with empty string
                filteredItem[key] = "";
            } else {
                filteredItem[key] = value;
            }
        });
        return filteredItem;
    });
};

export default function OverTimePage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const [subOrganization, setSubOrganization] = useState<any[]>([])
    const [originalData, setOriginalData] = useState<any[]>([]) // Store original data
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editData, setEditData] = useState<any>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [deleteData, setDeleteData] = useState<any>(null)

    // Get the mode from URL search params
    const mode = searchParams.get('mode')
    const editId = searchParams.get('id')
    const isFormMode = mode === 'edit' || mode === 'add'

    const {
        data: otData,
        error,
        loading,
        refetch
    } = useRequest<any[]>({
        url: "map/ot_policy/search?tenantCode=Midhani",
        onSuccess: (data) => {
            console.log("Raw OT policy data from API:", data);
            // Store original data for edit functionality
            setOriginalData(data);
            // Filter out object values and replace with empty strings for table display
            const filteredData = filterObjectValues(data);
            console.log("Filtered data for table:", filteredData);
            setSubOrganization(filteredData);
        },
        onError: (error) => {
            console.error('Error loading OT policy data:', error);
        }
    });

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
                function: () => {
                    setIsEditMode(false)
                    setEditData(null)
                    setDeleteData(null)
                    setIsFormOpen(true)
                },
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
                    console.log("Delete clicked for item:", item);
                    // Find the original data item based on _id
                    const originalItem = originalData.find(orig => orig._id === item._id);
                    
                    if (originalItem) {
                        console.log("Original item found for delete:", originalItem);
                        setDeleteData(originalItem);
                        setIsEditMode(false); // Not edit mode for delete
                        setEditData(null);
                        setIsFormOpen(true);
                    } else {
                        console.error("Original data not found for delete:", item);
                    }
                },
            },
            actionLink: {
                label: "link",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: (item: any) => { router.push(`/excel-file-manager/upload-statues/${item?.like}`) },
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
                    // Find the original data item based on _id
                    const originalItem = originalData.find(orig => orig._id === item._id);
                    
                    console.log("Edit clicked - Table item:", item);
                    console.log("Edit clicked - Original item:", originalItem);
                    
                    if (originalItem) {
                        setIsEditMode(true)
                        setEditData(originalItem) // Use original data with nested objects
                        setDeleteData(null)
                        setIsFormOpen(true)
                    } else {
                        console.error("Original data not found for item:", item);
                        // Fallback: use the table item
                        setIsEditMode(true)
                        setEditData(item)
                        setDeleteData(null)
                        setIsFormOpen(true)
                    }
                },
            },
        },
    }

    // Handle form success
    const handleFormSuccess = (updatedData: any) => {
        // Refresh the data
        refetch()
        setIsFormOpen(false)
        setEditData(null)
        setIsEditMode(false)
        setDeleteData(null)
    }

    // Handle server update
    const handleServerUpdate = async () => {
        await refetch()
    }

    // Show the table view with form modal
    return (
        <div>
            <EnhancedHeader
                title={"Overtime Policy"}
                description={"Overtime Policy Management"}
                IconComponent={Clock}
                recordCount={otData && otData.length > 0 ? otData.length : 0}
                organizationType={"Overtime Policy"}
                lastSync={2}
                uptime={99.9}
            />
            {
               subOrganization && subOrganization.length > 0 && (<Table
                functionalityList={functionalityList}
                data={subOrganization}
            />)
            }
            
            {/* OT Policy Form Modal */}
            <OTPolicyForm
                open={isFormOpen}
                setOpen={setIsFormOpen}
                otData={originalData} // Pass actual OT policy data array
                onSuccess={handleFormSuccess}
                onServerUpdate={handleServerUpdate}
                editData={editData}
                isEditMode={isEditMode}
                deleteValue={deleteData}
            />
        </div>
    );
}