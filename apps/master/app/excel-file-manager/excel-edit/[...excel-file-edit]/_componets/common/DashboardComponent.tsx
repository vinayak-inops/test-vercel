// DashboardComponent.jsx
import React from "react";
import {
  AlertCircle,
  Users,
  Briefcase,
  CheckSquare,
  BarChart2,
} from "lucide-react";

const DashboardComponent = () => {
  return (
    <div className="rounded-lg pl-0 pr-0 py-4 max-w-5xl mx-auto">
      {/* Alert Banner */}
      <div className="bg-red-50 border border-red-100 rounded-lg p-4  mb-0 flex items-center">
        <AlertCircle
          className="text-red-500 mr-3 flex-shrink-0 mt-0.5 pr-2"
          size={20}
        />
        <div>
          <h3 className="font-medium text-gray-900">Issues Found in Excel File</h3>
          <p className="text-gray-600">
          Please review the listed errors and re-upload a corrected Excel file to continue processing.
          </p>
        </div>
        <button className="ml-auto bg-blue-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          View Detail
        </button>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Active Employees</h3>
            <Users className="text-blue-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">547</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Number of Projects</h3>
            <Briefcase className="text-indigo-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">339</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Number of Tasks</h3>
            <CheckSquare className="text-green-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">147</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Target Percentage Completed</h3>
            <BarChart2 className="text-purple-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-gray-900">89.75%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '89.75%' }}></div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default DashboardComponent;
