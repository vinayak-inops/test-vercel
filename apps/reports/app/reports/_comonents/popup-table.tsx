import Table from "@repo/ui/components/table-dynamic/data-table";
import { useState, useEffect } from "react";

export default function PopupTable({setOpen}:any) {
 const data= [
    {
      cadre_name: "Union",
      cadregroup: "Union",
      cadreid: 1,
      dept_name: "HR",
      deptid: 1,
      desigid: 1,
      design_name: "Manager",
      doj: "12-05-2000",
      empid: 1001,
      empname: "John Doe",
      end: "6.00pm",
      id: "row-1",
      locationid: 1,
      lunch_time: "1.00pm to 1.30pm",
      shiftid: "A1",
      shifttype: "F",
      start: "9.00am",
      wkoffid: 2,
      wkoffid2: 6,
    },
    {
      cadre_name: "Union",
      cadregroup: "Union",
      cadreid: 2,
      dept_name: "Finance",
      deptid: 2,
      desigid: 2,
      design_name: "Analyst",
      doj: "15-07-2005",
      empid: 1002,
      empname: "Jane Smith",
      end: "5.30pm",
      id: "row-2",
      locationid: 1,
      lunch_time: "12.30pm to 1.00pm",
      shiftid: "B1",
      shifttype: "F",
      start: "8.30am",
      wkoffid: 3,
      wkoffid2: 7,
    },
    {
      cadre_name: "Union",
      cadregroup: "Union",
      cadreid: 3,
      dept_name: "IT",
      deptid: 3,
      desigid: 3,
      design_name: "Software Engineer",
      doj: "20-09-2010",
      empid: 1003,
      empname: "Alice Brown",
      end: "7.00pm",
      id: "row-3",
      locationid: 2,
      lunch_time: "1.30pm to 2.00pm",
      shiftid: "C1",
      shifttype: "F",
      start: "10.00am",
      wkoffid: 4,
      wkoffid2: 1,
    },
    {
      cadre_name: "Union",
      cadregroup: "Union",
      cadreid: 4,
      dept_name: "Operations",
      deptid: 4,
      desigid: 4,
      design_name: "Supervisor",
      doj: "11-02-2012",
      empid: 1004,
      empname: "Mark Taylor",
      end: "4.30pm",
      id: "row-4",
      locationid: 3,
      lunch_time: "12.00pm to 12.30pm",
      shiftid: "D1",
      shifttype: "P",
      start: "7.00am",
      wkoffid: 5,
      wkoffid2: 2,
    },
  ];

  const [selectCheck, setSelectCheck] = useState<any[]>([]);

  useEffect(() => {
    // Add event listeners for selection events
    const handleSelectAll = (event: CustomEvent) => {
      setSelectCheck(event.detail);
    };

    const handleIndividualSelect = (event: CustomEvent) => {
      setSelectCheck((prev: any) => {
        const isSelected = prev.some((selected: any) => selected.id === event.detail.id);
        const newSelection = isSelected
          ? prev.filter((selected: any) => selected.id !== event.detail.id)
          : [...prev, event.detail];
        return newSelection;
      });
    };

    window.addEventListener('tableSelectAll', handleSelectAll as EventListener);
    window.addEventListener('tableIndividualSelect', handleIndividualSelect as EventListener);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('tableSelectAll', handleSelectAll as EventListener);
      window.removeEventListener('tableIndividualSelect', handleIndividualSelect as EventListener);
    };
  }, []);

  const handleSave = () => {
    // Here you can add your save logic
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectCheck([]);
    setOpen(false);
  };

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
        status: false,
      },
      selectCheck: {
        status: true,
        functions: ["handleSelectAll", "handleIndividualSelect"]
      },
      activeColumn: {
        status: false,
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
        status: false,
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
        status: true,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: handleSave,
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
        status: true,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: handleCancel,
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
        status: false,
        classvalue: {
          container: "col-span-12 mb-2",
          label: "text-gray-600",
          field: "p-1",
        },
        function: (item: any) => console.log("link", item),
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

  return (
    <div className="h-full">
      <div className="p-0">
        <Table
          data={data}
          functionalityList={functionalityList}
        />
      </div>
    </div>
  );
}
