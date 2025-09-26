"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Table from "@repo/ui/components/table-dynamic/data-table";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import {
  headData,
} from "@/json/organization/location/form-structure";
import { addFormData, updateFormValues } from "@/utils/table/curd-operations";
import { useTableFunctionality } from "@/hooks/organization/location/useTableFunctionality";

// Create a custom event name for localStorage updates
const LOCAL_STORAGE_UPDATE_EVENT = "localStorageUpdated";

// This is the inner component that uses hooks requiring client-side data
function TabControler({pagename,dynamicFormName}: { pagename: string;dynamicFormName:any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "table";
  const [data, setData] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(dynamicFormName);
  const [isClient, setIsClient] = useState(false);

  let localStorageName=`${pagename}-inops`


  // Setup localStorage event handling only on the client side
  useEffect(() => {
    setIsClient(true);

    // Function to dispatch the custom event when localStorage is updated
    const triggerLocalStorageUpdate = (key: any) => {
      const event = new CustomEvent(LOCAL_STORAGE_UPDATE_EVENT, {
        detail: { key },
      });
      window.dispatchEvent(event);
    };

    // Override the original setItem method to trigger our custom event
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      triggerLocalStorageUpdate(key);
    };

    // Restore original method on cleanup
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const handleTabChange = (newTab: any) => {
    router.push(`/organization/${pagename}?tab=${newTab}`);
  };

  const createAddFormDataCaller = () => {
    return (form: any, data: any, id: string) => {
      addFormData(localStorageName, form, data);
      handleTabChange("table");
    };
  };

  const updateFormDataCaller = () => {
    return (form: any, data: any, id: string) => {
      updateFormValues(localStorageName, id, data);
      handleTabChange("table");
    };
  };

  // Delete form by ID
  function deleteFormDataById(storageKey: string, id: string) {
    if (typeof window !== "undefined") {
      const data = getFormData(storageKey);
      const updated = data.filter((item) => item.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      updateData();
    }
  }

  // Retrieve a specific form data by ID
  function getFormDataById(storageKey: string, id: string): any | null {
    if (typeof window !== "undefined") {
      const data = getFormData(storageKey); // Get all stored forms
      const updatingValue = data.find((item) => item.id === id) || null;

      if (updatingValue) {
        updatingValue.form.actions.map((action: any) => {
          if (action.action === "close") {
            action.function = handleTabChange.bind(null, "table");
          } else if (action.action === "save") {
            action.function = updateFormDataCaller();
          }
        });
        setFormData(updatingValue);
        handleTabChange("edit");
      }
    }
  }

  const functionalityList = useTableFunctionality(
    handleTabChange,
    deleteFormDataById,
    getFormDataById
  );

  // Retrieve all form data
  function getFormData(storageKey: string): any[] {
    if (typeof window === "undefined") {
      return [];
    }

    const data = localStorage.getItem(storageKey);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to parse form data:", e);
      return [];
    }
  }

  // Function to update the data state from localStorage
  const updateData = () => {
    if (typeof window !== "undefined") {
      const formData = getFormData(localStorageName);
      let result: any = [];
      formData.forEach((e: any) => {
        const { values, id } = e;
        result.push({ ...values, functioncallingid: id });
      });
      setData(result);
    }
  };

  useEffect(() => {
    if (!isClient) return;
    // update location action button
    dynamicFormName.actions?.map((action: any) => {
      if (action.action === "close") {
        action.function = handleTabChange.bind(null, "table");
      } else if (action.action === "save") {
        action.function = createAddFormDataCaller();
      }
    });

    // Initial data load
    updateData();

    // Listener for localStorage changes from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === localStorageName) {
        updateData();
      }
    };

    // Listener for our custom event for same-tab updates
    const handleLocalUpdate = (event: CustomEvent) => {
      if (event.detail.key === localStorageName) {
        updateData();
      }
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      LOCAL_STORAGE_UPDATE_EVENT,
      handleLocalUpdate as EventListener
    );

    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        LOCAL_STORAGE_UPDATE_EVENT,
        handleLocalUpdate as EventListener
      );
    };
  }, [isClient]);


  return (
    <div className="p-4">
      {tab == "table" && (
        <Table
          data={data}
          functionalityList={functionalityList}
          headData={headData}
        />
      )}
      {tab == "form" && (
        <DynamicForm department={dynamicFormName} storageName={localStorageName} />
      )}
      {pagename}
      {tab == "edit" && (
        <DynamicForm
          department={formData.form}
          storageName={"location-inops"}
          id={formData.id}
          workingMode={"edit"}
        />
      )}
    </div>
  );
}

export default TabControler;
