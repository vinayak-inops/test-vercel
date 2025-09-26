import ContractorManagementPage from "./_components/contracter-management-page";
import { ContractorManagementForm } from "./_components/contractor-management-form";
import { Suspense } from "react";

function ContractorManagementPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractorManagementPage />
    </Suspense>
  );
}

export default function FormPage1() {
    return (
        <div className="w-full flex justify-center py-6">
      <div className="w-full px-12">
        <ContractorManagementPageWrapper />
      </div>
    </div>
    )
}