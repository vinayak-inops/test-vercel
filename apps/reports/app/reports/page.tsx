"use client"
import {
  diarectcontractoremployee,
  selectfiltermode,
  stepcontractoremployee,
} from "@/json/contractor-employee/form-structure";
import DynamicForm from "@repo/ui/components/form-dynamic/dynamic-form";
import PreferencesPage from "./_comonents/preferences-page";
import ContacterEmpEditer from "./_comonents/contacter-emp-editer";
import ReportsEditer from "@/components/reports-editer";
import PDFViewer from "./_comonents/PDFViewer";
import ReportBanner from "./_comonents/ReportBanner";
import PopupSelecter from "./_comonents/popup-selecter";
import { useState, useEffect } from "react";
import { fetchReports } from "@repo/ui/api/api-connection";

export default function Home() {
  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;
  const [open, setOpen] = useState(false);

  return (
    <PreferencesPage>
      {open && <PopupSelecter open={open} setOpen={setOpen} />}
      {/* <div className="px-4">
      <ReportBanner/>
      </div> */}
      <ReportsEditer  open={open} setOpen={setOpen}/>
    </PreferencesPage>
    // <ContacterEmpEditer/>
  );
}
