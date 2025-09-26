"use client";
import StatCardMain from "@/components/statcard";
import React, { useEffect, useState, useMemo } from "react";
import FileController from "./file-controller";
import { SheetData } from "@/type/excel-file-manager/excel-file-manager";
import { useRouter } from "next/navigation";
import { openDB } from "idb";
import Table from "@repo/ui/components/table-dynamic/data-table";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import { useDynamicQuery } from "@repo/ui/hooks/api/dynamic-graphql";

interface TransformedFileDetails {
  _id: string;
  fileName: string;
  fileSize: string;
  workflowName: string;
  status: string;
  description: string;
  uploadedBy: string;
  createdOn: string;
}

function FileTableManager({ excelData }: { excelData: any[] }) {
  const router = useRouter();

  const functionalityList = {
    tabletype: {
      type: "data",
      classvalue: {
        container: "col-span-12 mb-2",
        tableheder: {
          container: "bg-[#2461e8]",
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
      adduser: {
        label: "Add User",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => console.log("form"),
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
        status: false,
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
        function: (item: any) => {
          router.push(`/excel-file-manager/upload-statues/${item?._id}`)
        },
      },
      actionEdit: {
        label: "Edit",
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (id: string) => console.log("location-inops", id),
      },
    },
  }

  const fileDetailsFields = {
    fields: [
      '_id',
      'tenantCode',
      'fileName',
      'fileSize',
      'workflowName',
      'status',
      'description',
      'uploadedBy',
      'createdOn'
    ]
  };

  const { data, loading, error } = useDynamicQuery(
    fileDetailsFields,
    'files',              
    'FetchAllFileDetails', 
    'fetchAllFileDetails', 
    { 
      collection: "files",
      tenantCode: "Midhani"
    }
  );

  const transformedFileDetails = useMemo(() => {
    if (!data) return [];

    return data
      .filter((file: any) => file !== null && file !== undefined) // Filter out null/undefined files
      .map((file: any) => {
        // Format file size to KB/MB with null check
        const fileSize = file?.fileSize || 0;
        const fileSizeInKB = parseInt(fileSize.toString()) / 1024;
        const formattedFileSize = fileSizeInKB >= 1024 
          ? `${(fileSizeInKB / 1024).toFixed(2)} MB`
          : `${fileSizeInKB.toFixed(2)} KB`;

        // Format date to readable format with null check
        const createdOn = file?.createdOn || new Date();
        const date = new Date(createdOn);
        const formattedDate = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        // Remove __typename and transform the data
        const { __typename, ...rest } = file;
        return {
          ...rest,
          fileSize: formattedFileSize,
          createdOn: formattedDate
        } as TransformedFileDetails;
      });
  }, [data]);

  const reversedData = transformedFileDetails.reverse();

  return (
    <div className="pl-6 pr-2 mt-0 pt-4">
      <div className="mb-4">
        <TopTitleDescription
          titleValue={{
            title: "Uploaded Excel Files",
            description:
              "View the list of Excel files uploaded along with their processing status and workflow steps.",
          }}
        />
      </div>
      {transformedFileDetails.length > 0 && (
        <div>
          <Table
            data={reversedData}
            functionalityList={functionalityList}
          />
        </div>
      )}
    </div>
  );
}

export default FileTableManager;
