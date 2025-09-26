import CashFlowChart from "./_components/cash-flow-chart";
import Component from "./_components/dashboard-metrics";
import PunchSystem from "./_components/punch-system";
import TaskManagerActions from "./_components/task-manager-actions";


export default function Home() {
  return (
    <div className="flex pr-12 pl-7 h-full bg-gray-50">
      {/* Main Content Area - Left Side */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Top Section - Dashboard Metrics */}
        <div className="mb-0">
          <Component itemsPerView={3} />
        </div>
        {/* Bottom Section - Cash Flow Chart */}
        <div className="px-5 mb-6 mt-2">
          <CashFlowChart />
        </div>
        {/* <div className="px-5 mb-6">
          <TaskManagerActions />
        </div> */}
      </div>
      {/* Sidebar Area - Right Side */}
      <div className="w-[28%]  overflow-y-auto scrollbar-hide pb-6">
      <PunchSystem />
      </div>
    </div>
  );
}
