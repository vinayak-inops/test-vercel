"use client"

import Table from "@repo/ui/components/table-dynamic/data-table";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react"
import { Shield } from "lucide-react";
import EnhancedHeader from "@/app/organization/[...organization]/_components/enhanced-header";
import { LeaveManagementForm } from "./leave-policy-form";

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
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                filteredItem[key] = "";
            } else {
                filteredItem[key] = value;
            }
        });
        return filteredItem;
    });
};

export default function LeavePolicyPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const [subOrganization, setSubOrganization] = useState<any[]>([])

    // Get the mode from URL search params
    const mode = searchParams.get('mode')
    const isFormMode = mode === 'edit' || mode === 'add'

    // const transformedParam = transformToUnderscore(params["contractor-employee"][0])

    const {
        data,
        error,
        loading,
        refetch
    } = useRequest<any[]>({
        url: "map/leave_policy/search?tenantCode=Midhani",
        onSuccess: (data) => {
            // Filter out object values and replace with empty strings
            const filteredData = filterObjectValues(data);
            setSubOrganization(filteredData);
        },
        onError: (error) => {
            console.error('Error loading organization data:', error);
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
                function: () => router.push("/leave-policy?mode=add"),
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
                function: (id: string) => console.log("location-inops", id),
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
                function: (id: string) => router.push(`/leave-policy?mode=edit&id=${id}`),
            },
        },
    }

    // If in form mode, show the LeaveManagementForm
    if (isFormMode) {
        return (
            <div className="px-12 py-4">
                <LeaveManagementForm />
            </div>
        );
    }

    // Otherwise show the table view
    return (
        <div>
            <EnhancedHeader
                title={"Leave Policy"}
                description={"Leave Policy Management"}
                IconComponent={Shield}
                recordCount={data && data.length > 0 ? data.length : 0}
                organizationType={"Leave Policy"}
                lastSync={2}
                uptime={99.9}
            />
            {
               subOrganization && subOrganization.length > 0 && (<Table
                functionalityList={functionalityList}
                data={subOrganization}
            />)
            }
        </div>
    );
}