"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';

import SidebarCombine from "@repo/ui/components/sidebar/sidebar-combine";
import { RootState } from "@inops/store/src/store";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { navItems } from "@/json/menu/menu";
import Header from "@repo/ui/components/header/header";
import MainHeader from "@repo/ui/components/header/main-header";

function DashboardWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarSubMain = useSelector(
    (state: RootState) => state.sidebar.sidebarSubMain
  );
  const pathname = usePathname();
  

  return (
    <div className=" bg-white overflow-y-hidden">
      <div className="w-20"></div>
      <div className="flex flex-wrap">
        {/* <div className="z-10 shadow-md">
          <SidebarCombine navigation={navigation} />
        </div> */}
        <motion.div
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={` w-full pt-0 flex-wrap h-screen   ${sidebarSubMain ? "pl-[0px]" : "pl-[67px]"}`}
        >
          <div className="flex flex-col bg-[#f3f4f8] h-full relative  shadow-[0_48px_100px_0_rgba(17,12,46,0.15)]">
            {navItems?.length > 0 && (
              <MainHeader navItems={navItems}/>
            )}
            <div className="h-full px-12 py-4 overflow-y-auto">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardWrapper;
