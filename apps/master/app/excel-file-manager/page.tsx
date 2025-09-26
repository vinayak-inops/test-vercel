import StatCardMain from "@/components/statcard";
import FileManager from "./_components/file-manager";
import StatuesUpdate from "./_components/statues-update";
import UploadPage from "./_components/common/upload-page";
import DownloadExcel from "./_components/download-excel";
import PayrollRuns from "./_components/common/payroll-runs";
import TableEditManager from "./excel-edit/[...excel-file-edit]/_componets/table-edit-manager";
import FilesAndAssets from "./_components/common/files-and-assets";
import FileTableManager from "./_components/file-table-manager";
import PageControler from "./_components/page-controler";
import ContractEmployeePage from "../contractor-employee/_components/contract-employee-page";

export default function Home() {
  return (
    <div className="h-full flex relative px-6 pr-10">
      {/* <div className="flex flex-wrap">
        <div className="flex-1 min-w-0">
          <DownloadExcel />
          <UploadPage/>
          <FileManager />
        </div>
        <div className="w-[280px] ">
          <StatuesUpdate />
        </div>
      </div> */}
      {/* <div className="flex-1 overflow-y-scroll scroll-hidden">
        <PayrollRuns/>
        <FileTableManager/>
        <TableEditManager paramsValue={"upload-statues"} />
      </div>
      <div className="w-[360px] px-0  right-0 top-0 h-full pl-4 border-gray-200 z-50">
        <StatuesUpdate />
        <AutoStutuesUpdate/>
        <FilesAndAssets />
      </div> */}
      <PageControler/>
    </div>
  );
}
