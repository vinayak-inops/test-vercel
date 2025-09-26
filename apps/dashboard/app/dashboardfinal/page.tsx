"use client";

import dynamic from "next/dynamic";
import { Cards } from "./components/cards";
import LocationWiseGraph from "./components/locationwisegraph";

const MyComponent = dynamic(() => import('./components/livedatagraph'), { ssr: false })

export default function DashboardPage() {
    return (
        <div>
            <Cards />
            <MyComponent />
            <div>
                <p className="mt-2 text-gray-600 text-2xl font-bold" >
                    Location Live Data
                </p>
                <LocationWiseGraph />
            </div>
        </div>
    )
}

