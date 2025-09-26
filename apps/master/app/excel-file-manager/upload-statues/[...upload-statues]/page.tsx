"use client"
import { useState, useEffect } from "react";
import AutoStutuesUpdate from "../../_components/auto-stutues-update";
import FilesAndAssets from "../../_components/common/files-and-assets";
import PayrollRuns from "../../_components/common/payroll-runs";
import StatuesUpdate from "../../_components/statues-update";
import DashboardComponent from "../../excel-edit/[...excel-file-edit]/_componets/common/DashboardComponent";
import TableEditManager from "../../excel-edit/[...excel-file-edit]/_componets/table-edit-manager";
import { useParams } from "next/navigation";
import { useWorkflowSSE } from "@repo/ui/hooks/workflow-management/useWorkflowSSE";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  UserCircle,
  Clock,
  X,
} from "lucide-react";
import TopTitleDescription from "@repo/ui/components/titleline/top-title-discription";
import { Button } from "@repo/ui/components/ui/button";

// Timeline Item Component for SSE Data
const SSEStatusTimelineItem = ({ item, isLast }: any) => {
  const isSuccess = item.isSuccess === true || item.isSuccess === "true";

  return (
    <div className="mb-6 relative pl-8">
      <div className="absolute left-0 top-2">
        <div
          className={`${isSuccess ? "bg-green-500" : "bg-amber-400 pulse-animation"} rounded-full p-1 z-10 shadow-sm`}
        >
          {isSuccess ? (
            <CheckCircle size={16} color="white" strokeWidth={2.5} />
          ) : (
            <Clock size={16} color="white" strokeWidth={2.5} />
          )}
        </div>
      </div>

      {!isLast && (
        <div className="absolute left-3 top-8 h-full border-l-2 border-blue-100 z-0"></div>
      )}

      <div
        className={`bg-white p-3 rounded-md w-full shadow-sm hover:shadow transition-shadow border ${!isSuccess ? "border-amber-100" : "border-gray-100"}`}
      >
        <div className="flex items-center text-sm border-b-2 border-gray-100 pb-1">
          <div className="flex items-center">
            <UserCircle size={14} className="text-blue-600 mr-2" />
            <span className="font-medium mr-1">{item.stateName}</span>
          </div>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(item.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center mt-1 text-sm text-gray-700">
          <div className="flex items-center">
            <FileText size={14} className={`mr-2 ${!isSuccess ? "text-amber-500" : "text-gray-600"}`} />
            <p className={!isSuccess ? "font-medium text-amber-700" : ""}>{item.eventName}</p>
            <span className="text-xs text-gray-500">• {item.performedBy}</span>
          </div>
        </div>

        {item.eventMessage && (
          <p className="text-xs mt-2 text-gray-600">{item.eventMessage}</p>
        )}
      </div>
    </div>
  );
};

// SSE Status Update Component
const SSEStatusUpdate = ({ fileId, setOpen, sseData }: { fileId: string, setOpen: (open: boolean) => void, sseData: any }) => {
  const statusUpdates = sseData[fileId] || [];

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl overflow-y-scroll scroll-hidden border border-gray-100 h-full">
      <div className="p-4 relative">
        <Button onClick={() => setOpen(false)} variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full absolute top-2 right-2">
          <X size={18} />
        </Button>
        <div className="flex justify-between items-start mb-4">
          <TopTitleDescription
            titleValue={{
              title: "Status Updates",
              description: "Real-time status updates for your file processing.",
            }}
          />
        </div>

        {statusUpdates.length === 0 && (
          <div className="text-gray-400 text-center py-8">No status updates found.</div>
        )}
        {statusUpdates.map((item: any, idx: number) => (
          <SSEStatusTimelineItem key={item._id} item={item} isLast={idx === statusUpdates.length - 1} />
        ))}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
          }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const fileId = params?.["upload-statues"];
  const { workflows } = useWorkflowSSE();
  return (
    <div className="h-full flex relative">
      <div className="flex-1 overflow-y-scroll scroll-hidden">
        {/* <PayrollRuns/> */}

        <TableEditManager paramsValue={"upload-statues"} setOpen={setOpen} />
      </div>
      {open && workflows[fileId as string] && (
        <div className="w-[360px] px-0 absolute right-0 top-0 h-full pl-4 border-gray-200 z-50">
          <SSEStatusUpdate
            fileId={fileId as string}
            setOpen={setOpen}
            sseData={workflows}
          />
        </div>
      )}
      {open && !workflows[fileId as string] && (
        <div className="w-[360px] px-0 absolute  right-0 top-0 h-full pl-4 border-gray-200 z-50">
          {/* <StatuesUpdate /> */}
          <AutoStutuesUpdate fileId={fileId as string} setOpen={setOpen} />
          {/* <FilesAndAssets /> */}
        </div>
      )}
    </div>
  );
}
