"use client";
import React, { useEffect, useState, useMemo, SetStateAction, Dispatch } from "react";
import { useRouter } from "next/navigation";
import { useDynamicQuery } from "@repo/ui/hooks/api/dynamic-graphql";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import Table from "@repo/ui/components/table-dynamic/data-table";

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

function FileTableManager({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) {
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
      addnew: {
        label: "192.168.88.204",
        status: true,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: () => setOpen(true),
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
    'files',              // collection
    'GetAllFileDetails',  // operationName
    'fetchAllFileDetails' // operationType
  );

  const transformedFileDetails = useMemo(() => {
    if (!data) return [];

    return data.map((file: any) => {
      // Format file size to KB/MB
      const fileSizeInKB = parseInt(file.fileSize) / 1024;
      const formattedFileSize = fileSizeInKB >= 1024 
        ? `${(fileSizeInKB / 1024).toFixed(2)} MB`
        : `${fileSizeInKB.toFixed(2)} KB`;

      // Format date to readable format
      const date = new Date(file.createdOn);
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

  return (
    <div className="pl-0 pr-0 mt-0 pt-4">
      <div className="mb-4">
        <TopTitleDescription
          titleValue={{
            title: "Report List & Generate New Report",
            description:
              "Browse the list of generated reports and create a new report as needed. View details, statuses, and manage your reports from here.",
          }}
        />
      </div>
        <div>
          <Table
            data={transformedFileDetails}
            functionalityList={functionalityList}
          />
        </div>
    </div>
  );
}

export default FileTableManager;
