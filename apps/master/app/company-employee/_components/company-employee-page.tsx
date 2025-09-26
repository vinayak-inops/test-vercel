"use client";

import Table from "@repo/ui/components/table-dynamic/data-table";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react"
import { UserCog } from "lucide-react";
import EnhancedHeader from "@/app/organization/[...organization]/_components/enhanced-header";
import { EmployeeDeploymentForm } from "./employee-deployment-form";
import { usePostRequest } from "@repo/ui/hooks/api/usePostRequest";
import { toast } from "react-toastify";

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

export default function CompanyEmployeePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [subOrganization, setSubOrganization] = useState<any[]>([])
    const [action, setAction] = useState([]);

    // Get the mode from URL search params
    const mode = searchParams.get('mode')
    const isFormMode = mode === 'edit' || mode === 'add' || mode === 'view'


    const {
        post: postDelete,
        loading: postLoading,
        error: postError,
        data: postData,
      } = usePostRequest<any>({
        url: "company_employee",
        onSuccess: (data) => {
          console.log("API Success Response:", data);
          toast.success("Company Employee deleted successfully!");
        },
        onError: (error) => {
          toast.error("Company Employee submission failed!");
          console.error("POST error:", error);
        },
      });

    const {
        data,
        error,
        loading,
        refetch
    } = useRequest<any[]>({
        url: "map/company_employee/search?tenantCode=Midhani",
        onSuccess: (data) => {
            // Filter out object values and replace with empty strings
            const filteredData = filterObjectValues(data);
            setSubOrganization(filteredData);
        },
        onError: (error) => {
            console.error('Error loading organization data:', error);
        }
    });

    useEffect(() => {
        if (action) {
            refetch()
        }
    }, [action,mode])

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
            addnew: {
                label: "Add New",
                status: true,
                classvalue: {
                    container: "col-span-12 mb-2",
                    label: "text-gray-600",
                    field: "p-1",
                },
                function: () => router.push("/company-employee?mode=add"),
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
                    const postData = {
                        tenant: "Midhani",
                        action: "delete",
                        id: deleteValue._id,
                        collectionName: "company_employee",
                        data: deleteValue,
                      };
                      setAction(deleteValue._id)
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
                function: (data: any) => {
                    router.push(`/company-employee?mode=view&id=${data._id}`)
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
                function: (data: any) => {
                    router.push(`/company-employee?mode=edit&id=${data._id}`)
                },
            },
        },
    }

    // If in form mode, show the EmployeeDeploymentForm
    if (isFormMode) {
        return (
            <div className="px-12 py-4">
                <EmployeeDeploymentForm />
            </div>
        );
    }

    // Otherwise show the table view
    return (
        <div>
            <EnhancedHeader
                title={"Company Employee"}
                description={"Company Employee Management"}
                IconComponent={UserCog}
                recordCount={data?.length || 0}
                organizationType={"Company Employee"}
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
