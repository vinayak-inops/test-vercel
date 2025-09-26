"use client";

import { Button } from "@repo/ui/components/ui/button";

export default function ReportBanner() {
  return (
    <div className="w-full h-52 bg-gradient-to-r from-sky-900 via-blue-800 to-indigo-900 text-white rounded-lg flex items-center px-8 relative overflow-hidden">
      {/* Animated Squares */}
      <div className="absolute right-8 top-6 flex space-x-2 z-0">
        <div className="w-4 h-4 bg-white/30 animate-bounce rounded"></div>
        <div className="w-4 h-4 bg-white/50 animate-bounce rounded delay-150"></div>
        <div className="w-4 h-4 bg-white/70 animate-bounce rounded delay-300"></div>
      </div>

      {/* Stacked PDFs with Animation */}
      <div className="absolute inset-0 flex justify-center items-center z-0">
        <div className="flex -space-x-10">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={`w-28 h-36 bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-2xl border border-gray-300 relative z-${index} animate-float-${index}`}
            >
              {/* Folded corner on all PDFs */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 absolute top-0 right-0 rounded-bl-md shadow-md"></div>
              {/* Inner text design on all PDFs */}
              <div className="flex flex-col items-center justify-center h-full px-4 py-5">
                <div className="w-16 h-1.5 bg-gray-400 mb-2 rounded"></div>
                <div className="w-12 h-1.5 bg-gray-300 mb-2 rounded"></div>
                <div className="w-20 h-1.5 bg-gray-400 mb-2 rounded"></div>
                <div className="w-14 h-1.5 bg-gray-300 mb-2 rounded"></div>
                <div className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-md mt-2">
                  PDF
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div className="z-20">
        <h1 className="text-3xl font-bold primary">Report Generator</h1>
        <p className="text-sm text-white/80 mt-1 primary description">Create, stack, and export reports effortlessly</p>
      </div>

      {/* Floating Animations for Each PDF */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float5 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .animate-float-0 { animation: float1 3s ease-in-out infinite; }
        .animate-float-1 { animation: float2 4s ease-in-out infinite; }
        .animate-float-2 { animation: float3 5s ease-in-out infinite; }
        .animate-float-3 { animation: float4 3.5s ease-in-out infinite; }
        .animate-float-4 { animation: float5 4.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
