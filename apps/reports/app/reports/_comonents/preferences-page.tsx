"use client";

export default function PreferencesPage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <div className="flex h-full bg-[#f3f4f8] py-4">
      <div className="flex-1 overflow-y-scroll hide-scrollbar">
          {children}
      </div>
    </div>
  );
}
