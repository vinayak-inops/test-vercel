"use client"
import { Input } from "@repo/ui/components/ui/input";
import React, { useEffect, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useDynamicQuery } from "@repo/ui/hooks/api/dynamic-graphql";

// Define the role options
const roleOptions = [
  { id: "Excel file upload", label: "Excel file upload" },
];

type Field = {
  tag: "input" | "selectlist" | "textarea";
  label: string;
  placeholder?: string;
  nameOfExcel?: string;
  setNameOfExcel?: React.Dispatch<React.SetStateAction<string>>;
};

const InputField = ({
  nameOfExcel,
  setNameOfExcel,
  elem,
}: {
  nameOfExcel: string;
  setNameOfExcel: React.Dispatch<React.SetStateAction<string>>;
  elem: Field;
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="emails"
        className="block text-sm font-medium text-gray-700"
      >
        {elem.label}
      </label>
      <Input
        id="emails"
        value={nameOfExcel}
        onChange={(e) => setNameOfExcel(e.target.value)}
        placeholder={elem.placeholder}
        className="border border-gray-300 rounded-md"
      />
    </div>
  );
};

const TextareaField = ({
  descriptionOfExcel,
  setDescriptionOfExcel,
  elem,
}: {
  descriptionOfExcel: string;
  setDescriptionOfExcel: React.Dispatch<React.SetStateAction<string>>;
  elem: Field;
}) => {
  return (
    <div className="space-y-2">
      <label
        htmlFor="textarea"
        className="block text-sm font-medium text-gray-700"
      >
        {elem.label}
      </label>
      <Textarea
        id="textarea"
        value={descriptionOfExcel}
        onChange={(e) => setDescriptionOfExcel(e.target.value)}
        placeholder={elem.placeholder}
        className="border border-gray-300 rounded-md h-[100px]"
      />
    </div>
  );
};

const SelectList = ({
  workFlowName,
  setWorkFlowName,
  elem,
}: {
  workFlowName: string;
  setWorkFlowName: React.Dispatch<React.SetStateAction<string>>;
  elem: Field;
}) => {
  const [search, setSearch] = useState("");
  const [workflows, setWorkflows] = useState<any[]>([]);

  const workflowFields = {
    fields: [
      '_id',
      'label: name',
      'value: name',
      'initialState',
      'states'
    ]
  };

  const { data, loading, error } = useDynamicQuery(
    workflowFields,
    'workflows',           // collection
    'FetchAllWorkflows',   // operationName
    'fetchAllWorkflows'    // operationType
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setWorkflows(data);
    }
  }, [data]);

  useEffect(() => {
    if (loading) {
      console.log("Loading workflows...");
    } else if (error) {
      console.error("Error fetching workflows:", error);
    } else if (workflows.length > 0) {
      console.log("Workflows Data:", workflows);
    }
  }, [loading, error, workflows]);

  const filteredWorkflows = workflows.filter((workflow) => 
    workflow.label?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
        {elem.label}
      </label>
      <div className="relative mb-2">
        <input
          type="text"
          placeholder="Search workflow..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      <div className="rounded-md max-h-[150px] overflow-y-auto border border-gray-200 bg-white">
        {loading ? (
          <div className="px-3 py-2 text-gray-400 text-sm">Loading workflows...</div>
        ) : error ? (
          <div className="px-3 py-2 text-red-400 text-sm">Error loading workflows</div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="px-3 py-2 text-gray-400 text-sm">No workflows found.</div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow._id}
              className={cn(
                "flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 rounded-lg transition",
                workFlowName === workflow.value && "bg-blue-100"
              )}
              onClick={() => setWorkFlowName(workflow.value)}
            >
              <span className={cn(
                "flex-1 text-sm",
                workFlowName === workflow.value ? "text-blue-700 font-semibold" : "text-gray-700"
              )}>
                {workflow.label}
              </span>
              {workFlowName === workflow.value && (
                <ChevronRight className="h-4 w-4 text-blue-500" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

function ExcelUploadForm({
  setOpen,
  nameOfExcel,
  setNameOfExcel,
  descriptionOfExcel,
  setDescriptionOfExcel,
  workFlowName,
  setWorkFlowName,
  handleSave,
  excelFileUpload,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nameOfExcel: string;
  setNameOfExcel: React.Dispatch<React.SetStateAction<string>>;
  descriptionOfExcel: string;
  setDescriptionOfExcel: React.Dispatch<React.SetStateAction<string>>;
  workFlowName: string;
  setWorkFlowName: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  excelFileUpload: any;
}) {
  const [validationError, setValidationError] = useState<string>("");

  const validateForm = () => {
    if (!workFlowName) {
      setValidationError("Please select a workflow");
      return false;
    }
    if (!descriptionOfExcel.trim()) {
      setValidationError("Please enter a description");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Inviting:", { nameOfExcel, role: workFlowName });
      setOpen(false);
      handleSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-0 pt-4">
      <div className="space-y-4">
        {excelFileUpload.field.map((elem:any, index:number) => {
          switch (elem.tag) {
            case "selectlist":
              return (
                <div key={index}>
                  <SelectList
                    elem={elem}
                    workFlowName={workFlowName}
                    setWorkFlowName={(value) => {
                      setWorkFlowName(value);
                      setValidationError(""); // Clear error when user selects a workflow
                    }}
                  />
                  {!workFlowName && validationError === "Please select a workflow" && (
                    <p className="text-red-500 text-sm mt-1">{validationError}</p>
                  )}
                </div>
              );
            case "textarea":
              return (
                <div key={index}>
                  <TextareaField
                    elem={elem}
                    descriptionOfExcel={descriptionOfExcel}
                    setDescriptionOfExcel={(value) => {
                      setDescriptionOfExcel(value);
                      setValidationError(""); // Clear error when user types in description
                    }}
                  />
                  {!descriptionOfExcel.trim() && validationError === "Please enter a description" && (
                    <p className="text-red-500 text-sm mt-1">{validationError}</p>
                  )}
                </div>
              );
            default:
              return null;
          }
        })}

        <div className="flex flex-col gap-2 pt-2">
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {validationError}
            </div>
          )}
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={!workFlowName || !descriptionOfExcel.trim()}
            className={cn(
              "w-full font-medium",
              (!workFlowName || !descriptionOfExcel.trim())
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0061ff] text-white hover:bg-[#0052d6]"
            )}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ExcelUploadForm;
