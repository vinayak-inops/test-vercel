import dynamic from 'next/dynamic';

const CompanyEmployeePage = dynamic(() => import("./_components/company-employee-page"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="w-full max-w-7xl">
        <CompanyEmployeePage />
      </div>
    </div>
  );
}
