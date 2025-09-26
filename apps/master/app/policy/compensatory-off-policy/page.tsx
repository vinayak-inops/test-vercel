
import CompOffPolicyPage from './_components/compoff-policy-page';
import { Suspense } from "react";

function CompOffPolicyPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompOffPolicyPage />
    </Suspense>
  );
}

export default function Home() {
  return <div className="w-full flex justify-center py-6">
  <div className="w-full max-w-7xl">
  <CompOffPolicyPageWrapper />
  </div>
</div>;
}