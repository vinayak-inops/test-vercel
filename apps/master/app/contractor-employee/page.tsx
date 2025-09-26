"use client";
import { contractoremployee } from "@/json/contractor-employee/form-structure";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import ContractEmployeePage from "./_components/contract-employee-page";
import { useState, Suspense } from "react";
import { EmployeeManagementForm } from "./_components/employee-management-form";

function ContractEmployeePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractEmployeePage />
    </Suspense>
  );
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'contractor' | 'deployment'>('contractor');
  const [contractorData, setContractorData] = useState<any>(null);
  const [deploymentData, setDeploymentData] = useState<any>(null);

  const handleContractorSubmit = (data: any) => {
    console.log("Contractor form submitted:", data);
    setContractorData(data);
    setCurrentStep('deployment');
  };

  const handleDeploymentSubmit = (data: any) => {
    console.log("Deployment form submitted:", data);
    setDeploymentData(data);
    
    // Combine both forms data
    const combinedData = {
      contractor: contractorData,
      deployment: data
    };
    
    console.log("Combined form data:", combinedData);
    // Handle final submission here
  };

  const handleBackToContractor = () => {
    setCurrentStep('contractor');
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full max-w-7xl">
        <ContractEmployeePageWrapper />
      </div>
    </div>
  );
}
