import LeavePolicyPage from "./_components/leave-policy-page";
import { Suspense } from "react";

function LeavePolicyPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeavePolicyPage />
    </Suspense>
  );
}

export default function Home() {
    return (
        <div className="w-full flex justify-center py-6">
      <div className="w-full max-w-7xl">
      <LeavePolicyPageWrapper />
      </div>
    </div>
        
    )
}