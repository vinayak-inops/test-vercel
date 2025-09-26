"use client";

import Table from "@repo/ui/components/table-dynamic/data-table";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react"
import { useAuthToken } from '@repo/ui/hooks/auth/useAuthToken';
import EnhancedHeader from "@/app/organization/[...organization]/_components/enhanced-header";
    import { UserCog } from "lucide-react";
    import { ContractorManagementForm } from "./contractor-management-form";
import { toast } from "react-toastify";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";

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

export default function ContractorManagementPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [subOrganization, setSubOrganization] = useState<any[]>([])
    const { token, loading: tokenLoading, error: tokenError } = useAuthToken();
    const [action, setAction] = useState([]);

    // Get the mode from URL search params
    const mode = searchParams.get('mode')
    const isFormMode = mode === 'edit' || mode === 'add' || mode === 'view'

    // const transformedParam = transformToUnderscore(params["contractor-employee"][0])

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
        url: 'map/contractor/search?tenantCode=Midhani',
        onSuccess: (data: any) => {
            // Filter out object values and replace with empty strings
            const filteredData = filterObjectValues(data);
            setSubOrganization(filteredData);
        },
        onError: (error: any) => {
            console.error('Error loading organization data:', error);
        }
    });

    useEffect(() => {
        if (action) {
            refetch()
        }
    }, [action,mode])

    const {
        post: postDelete,
        loading: postLoading,
        error: postError,
        data: postData,
      } = usePostRequest<any>({
        url: "contractor",
        onSuccess: (data) => {
          console.log("API Success Response:", data);
          toast.success("Contractor deleted successfully!");
        },
        onError: (error) => {
          toast.error("Contractor submission failed!");
          console.error("POST error:", error);
        },
      });


    // Handle back/cancel navigation
    const handleBackNavigation = () => {
        router.push('/contractor-employee')
    }

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
                function: () => router.push("/contractor?mode=add"),
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
                function: (deleteValue: any) => {
                    setAction(deleteValue._id)
                    const postData = {
                        tenant: "Midhani",
                        action: "delete",
                        id: deleteValue._id,
                        collectionName: "contractor",
                        data: deleteValue,
                      };
                      postDelete(postData)
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
                function: (data: any) => router.push(`/contractor?mode=view&id=${data._id}`),
            },
            actionEdit: {
                label: "Edit",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: (data: any) => router.push(`/contractor?mode=edit&id=${data._id}`),
            },
        },
    }

    // If in form mode, show the EmployeeManagementForm
    if (isFormMode) {
        return (
            <div className="px-12 py-4">
                <ContractorManagementForm />
            </div>
        );
    }

    // Otherwise show the table view
    return (
        <div>
            <EnhancedHeader
                title={"Manage Contractor"}
                description={"Manage Contractor"}
                IconComponent={UserCog}
                recordCount={data?.length || 0}
                organizationType={"Midhani"}
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
