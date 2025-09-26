import DashboardCards from "./_components/DashboardCards";
import MainHeader from "@repo/ui/components/header/main-header";
import { navItems } from "@/json/menu/menu";
export default function Home() {
    return <div className="">
        <MainHeader navItems={navItems}/>
        <DashboardCards />
    </div >
}