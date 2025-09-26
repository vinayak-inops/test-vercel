"use client";
import MiniPopupWrapper from "@repo/ui/components/popupwrapper/mini-popup-wrapper";
import React, { useEffect, useState } from "react";
import RequestType from "./RequestType";
import { Button } from "@repo/ui/components/ui/button";
import { LuFileUser } from "react-icons/lu";
import BigPopupWrapper from "./popup-big";
import { indivialfilter, stepcontractoremployee } from "@/json/contractor-employee/form-structure";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import { Check, FileText } from "lucide-react";
import {
  emailFilterOption,
  empIdFilterOption,
  namefilteroption,
} from "@/json/contractor-employee/check";
import LeadMapping from "./LeadMapping";
import { useOptionController } from "@/hooks/form-handler/useOptionController";

const requestType = [
  {
    key: "individual",
    title: "Generate Individual Report",
    description:
      "Select the button to generate individual report for each user.",
    icon: (
      <LuFileUser className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
    ),
  },
  {
    key: "group",
    title: "Generate Group Report",
    description: "Select the button to generate group report for each user.",
    icon: (
      <FileText className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
    ),
  },
];

function PopupReportFilter({ open, setOpen }: any) {
  const [activeTab, setActiveTab] = useState("simplefilter");
  const [selectedOption, setSelectedOption] = useState("");
  const [tabreport, setTabReport] = useState<string>("");
  const [requestTypes, setRequestTypes] = useState(requestType);
  const [formData, setFormData] = React.useState<any>(indivialfilter);
  const popupContent = {
    title: "Generate New Report",
    description:
      "Generate new report showing trends, insights, and updated key data.",
  };

  useEffect(() => {
    if (selectedOption == "individual") {
      // const update = requestType.filter((item) => {
      //   return item.key == "individual";
      // });
      setRequestTypes([]);
    } else {
      setRequestTypes(requestType);
    }
  }, [tabreport]);

  function emailfilter() {
    return emailFilterOption;
  }

  function namefilter() {
    return namefilteroption;
  }

  function empidfilter() {
    return empIdFilterOption;
  }
  

  const optionsMap = {
    emailfilter: () => emailFilterOption,
    namefilter: () => namefilteroption,
    empidfilter: () => empIdFilterOption,
  };
  
  const { updateOptions } = useOptionController({
    formStructure: indivialfilter,
    setFormData: setFormData, // assuming setFormData is in scope
    optionsMap,
  });
  
  useEffect(() => {
    if (indivialfilter?.subformstructure) {
      indivialfilter.subformstructure.forEach((subform: any) => {
        subform.fields?.forEach((field: any) => {
          field.onChange?.forEach((event: any) => {
            if (event.event === "updatechild") {
              event.function = updateOptions; // Directly assign the reusable function
            }
          });
        });
      });
    }
  }, [indivialfilter, updateOptions]);

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
      
      stepcontractoremployee.actions.map((action: any) => {
        if (action.action === "close") {
          // action.function = cancelform();
        }
      });
    }, []);

  return (
    <div>
      {(tabreport == "" || tabreport == "individual") && (
        <MiniPopupWrapper content={popupContent} setOpen={setOpen} open={open}>
          <div className="p-0">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md px-6 pb-6">
              <div className="flex rounded-lg bg-gray-100 p-1 max-w-md">
                <button
                  className={`flex-1 py-2 px-4 text-sm rounded-md transition-colors ${
                    activeTab === "simplefilter"
                      ? "bg-white text-gray-700 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("simplefilter")}
                >
                  Simple Filter
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm rounded-md transition-colors ${
                    activeTab === "leadList"
                      ? "bg-white text-gray-700 shadow-sm"
                      : "bg-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("complexfilter")}
                >
                  Complex Filter
                </button>
              </div>
              {activeTab === "simplefilter" && requestTypes.length > 0 && (
                <>
                  <RequestType
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    requestTypes={requestTypes}
                  />
                </>
              )}

              {selectedOption != "" && tabreport != "individual" && (
                <Button
                  onClick={() => {
                    setTabReport(selectedOption);
                  }}
                  size="sm"
                  className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800 p-2"
                >
                  Continue
                </Button>
              )}
              {tabreport == "individual" && (
                <DynamicForm department={indivialfilter} />
              )}

              {activeTab === "complexfilter" && (
                <>
                <DynamicForm department={stepcontractoremployee} />
                </>
                // <LeadMapping/>
              )}
            </div>
          </div>
        </MiniPopupWrapper>
      )}
      {tabreport == "group" && <BigPopupWrapper setOpen={setOpen} />}
    </div>
  );
}

export default PopupReportFilter;
