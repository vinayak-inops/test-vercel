"use client";
import React, { useEffect, useState } from "react";
import PreferencesPage from "./preferences-page";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import {
  diarectcontractoremployee,
  selectfiltermode,
  stepcontractoremployee,
} from "@/json/contractor-employee/form-structure";
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper";


function ContacterEmpEditer() {
  const [form, setForm] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>(stepcontractoremployee);
  const createAddFormDataCaller = () => {
    return (form: any, data: any, id: string) => {
      setForm(data);
    };
  };

  const cancelform = () => {
    return (form: any, data: any, id: string) => {
      setForm(null);
    };
  };


  const eventcontroller = () => {
    // This function recursively clears options and resets values for a field and all its descendants
    function clearAllDescendantOptions(field: any, setValue: any, visited = new Set()) {
      // Prevent infinite recursion by tracking visited fields
      if (visited.has(field)) return;
      visited.add(field);
      
      // Clear options for this field
      field.options = [];
      
      // Reset the field value and trigger validation
      if (field.name) {
        field.value = "";
        // Use setTimeout to prevent immediate form submission
        setTimeout(() => {
          setValue(field.name, "", { 
            shouldValidate: true,
            shouldDirty: true 
          });
        }, 0);
      }
      
      // If this field has children, recursively clear their options too
      if (field.children && field.children.length > 0) {
        // First find the children fields by name
        const childFields: any[] = [];
        
        // Look through all subforms to find the child fields
        stepcontractoremployee.subformstructure?.forEach((subform: any) => {
          subform.fields?.forEach((subformField: any) => {
            if (field.children.includes(subformField.name)) {
              childFields.push(subformField);
            }
          });
        });
        
        // Now recursively clear options for each child field
        childFields.forEach((childField) => {
          clearAllDescendantOptions(childField, setValue, visited);
        });
      }
    }
  
    // Return a function that takes parentFieldNames and directly uses the setValue from DynamicForm
    return function(parentFieldNames: string[], setValue: any, selectedValue?: any) {
      // This is important - it no longer returns another function,
      // but directly operates with the setValue that's available from the component scope
      let isUpdated = false;
      
      stepcontractoremployee.subformstructure?.forEach((subform: any) => {
        subform.fields?.forEach((field: any) => {
          if (parentFieldNames.includes(field.name)) {
            // Set options for parent fields
            field.options = [
              { label: "Construction", value: "Construction" },
              { label: "IT Services", value: "IT Services" },
              { label: "Manufacturing", value: "Manufacturing" },
              { label: "Education", value: "Education" },
              { label: "Healthcare", value: "Healthcare" },
            ];
  
            // Use setTimeout to break the call stack
            setTimeout(() => {
              setValue(field.name, "", { 
                shouldValidate: true,
                shouldDirty: true 
              });
            }, 0);
            
            // Find and clear options for all descendant fields
            if (field.children && field.children.length > 0) {
              const childFields: any[] = [];
              
              // Locate all child fields
              stepcontractoremployee.subformstructure?.forEach((innerSubform: any) => {
                innerSubform.fields?.forEach((innerField: any) => {
                  if (field.children.includes(innerField.name)) {
                    childFields.push(innerField);
                  }
                });
              });
              
              // Clear options for each child and all their descendants
              childFields.forEach((childField) => {
                clearAllDescendantOptions(childField, setValue, new Set());
              });
            }
            
            isUpdated = true;
          }
        });
      });
      
      if (isUpdated) {
        // Use setTimeout to prevent state update during render
        setTimeout(() => {
          setFormData({ ...stepcontractoremployee });
        }, 0);
      }
    };
  };

  useEffect(() => {
     stepcontractoremployee.subformstructure?.forEach((subform: any) => {
      subform.fields?.forEach((field: any) => {
        field.onChange?.forEach((event: any) => {
          if (event.event === "updatechild") {
            event.function = eventcontroller();
          }
        });
      });
    });
    selectfiltermode.actions.map((action: any) => {
      if (action.action === "save") {
        action.function = createAddFormDataCaller();
      }
    });
    diarectcontractoremployee.actions.map((action: any) => {
      if (action.action === "close") {
        action.function = cancelform();
      }
    });
    stepcontractoremployee.actions.map((action: any) => {
      if (action.action === "close") {
        action.function = cancelform();
      }
    });
  }, []);
  return (
    <PreferencesPage>
      
      <DynamicForm department={selectfiltermode} />
      {form?.reportnumber == "one" && (
        <DynamicForm department={diarectcontractoremployee} />
      )}
      {form?.reportnumber == "more" && (
        <DynamicForm department={formData} />
      )}
    </PreferencesPage>
  );
}

export default ContacterEmpEditer;
