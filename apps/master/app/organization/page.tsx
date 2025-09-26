"use client";
import React from "react";
import OrganizationPage from "./_components/organization-page-simple";
import OrganizationInfo from "./_components/organization-info";

export default function Home() {
  const [formData, setFormData] = React.useState<any>(null);
  

  return (
    <div className="w-full overflow-y-auto">
      <OrganizationInfo/>
      {/* <OrganizationPage /> */}
      {/* <LocationManagement/> */}
      {/* {formData !== null ? <DynamicForm department={formData} /> : null} */}
    </div>
  );
}
