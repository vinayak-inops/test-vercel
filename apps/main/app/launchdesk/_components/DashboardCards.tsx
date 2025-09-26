"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { motion } from "framer-motion";
import { useAuthToken } from '@repo/ui/hooks/auth/useAuthToken';

// Define session type with accessToken
interface CustomSession {
    accessToken?: string;
    [key: string]: any;
}

const cards = [
    // {
    //     icon: "📈",
    //     image: "/images/dashboard.png",
    //     title: "Dashboard",
    //     description: "View key metrics, performance indicators, and system status",
    //     link: "/dashboard",
    // },  
    {
        icon: "��",
        title: "Master",
        image: "/images/form.png",
        description: "Effortlessly create, complete, and manage forms for all your data needs.",
        link: `/master/organization`,
    },
    {
        icon: "📤",
        title: "Excel Upload",
        image: "/images/excel-upload.png",
        description: "Upload and process Excel files, bulk data import, and validation",
        link: `/master/excel-file-manager`,
    },
    // {
    //     icon: "🔄",
    //     image: "/images/workflow.jpg",
    //     title: "Workflow",
    //     description: "View and manage application workflows, track progress, and handle approvals",
    //     badge: 0,
    //     link: `/workflow/create-work-flow`,
    // },
    {
        icon: "🏖️",
        title: "Muster",
        image: "/images/muster.png",
        description: "Fill and submit forms, update values, and manage data entries",
        link: `/muster/punch`,
    },
    {
        icon: "📊",
        title: "Reports",
        image: "/images/report.png",
        description: "Generate and download reports, analytics, and data insights",
        link: `/reports/reports`,
    },
    {
        icon: "🏖️",
        title: "Leave Application",
        image: "/images/leave-application.jpg",
        description: "Apply for leaves, track balances, and manage time-off requests",
        link: `/leave/leave-management`,
    },
];

const DashboardCards: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-base font-semibold text-gray-800 mb-4"
            >
                Application LaunchDesk
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {cards.map((card:any, idx): any => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                        <Link href={card.link} className="block h-full shadow-lg">
                            <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 relative">
                                <div className="absolute inset-0 bg-white rounded-[30px] z-0" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-[30px] z-10" 
                                     style={{
                                         clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 15px 0%, 15px 15px, calc(100% - 15px) 15px, calc(100% - 15px) 0%, 100% 0%, 100% 100%, calc(100% - 15px) 100%, calc(100% - 15px) calc(100% - 15px), 15px calc(100% - 15px), 15px 100%, 0% 100%)"
                                     }}
                                />
                                <CardContent className="p-0 relative z-20">
                                    <div className="relative aspect-[7/5] overflow-hidden">
                                        <Image
                                            src={card.image}
                                            alt={card.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {card?.badge !== undefined && (
                                            <motion.span 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-lg"
                                            >
                                                {card.badge}
                                            </motion.span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {card.description}
                                        </p>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DashboardCards; 