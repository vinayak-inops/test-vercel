"use client";

import { Dispatch, SetStateAction } from "react";
import { Check, FileText } from "lucide-react";
import { LuFileUser } from "react-icons/lu";

export default function RequestType({
  selectedOption,
  setSelectedOption,
  requestTypes,
}: {
  selectedOption: string;
  setSelectedOption: Dispatch<SetStateAction<string>>;
  requestTypes: any;
}) {
  return (
    <div className="max-w-md pt-3">
      <h3 className="text-md font-medium text-gray-800 mb-3">Request type</h3>

      <div className="space-y-3">
        {requestTypes.map(
          ({
            key,
            title,
            description,
            icon,
          }: {
            key: any;
            title: any;
            description: any;
            icon: any;
          }) => (
            <label
              key={key}
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                selectedOption === key ? "border-gray-800" : "border-gray-200"
              }`}
              onClick={() => setSelectedOption(key)}
            >
              {icon}
              <div className="flex-1">
                <div className="font-medium text-gray-800">{title}</div>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>

              <div className="ml-4 flex-shrink-0">
                {selectedOption === key ? (
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-900">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                )}
              </div>
            </label>
          )
        )}
      </div>
    </div>
  );
}
