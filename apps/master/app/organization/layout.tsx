

export default function OrgLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex h-full">
    {/* <SidebarMini navigation={navContractorEmployee}/> */}
    <div className="flex-1 px-0 overflow-y-scroll px-0 py-4">{children}</div>
  </div>;
}