"use client";
import React from "react";
import { motion } from "framer-motion";
import { Building2, Users, Phone, Mail, Hash, MapPin, AlertCircle } from "lucide-react";
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";

const LoadingSkeleton: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export default function OrganizationPage() {
    const { data: organizationData, loading, error } = useRequest<any[]>({
        url: "organization",
        onSuccess: (data) => {
            console.log('Organization data:', data);
        },
        onError: (error) => {
            console.error('Error loading organization data:', error);
        }
    });

    if (loading) return <LoadingSkeleton />;
    
    if (error) return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-red-600 space-y-4"
        >
            <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">Error loading organization data</p>
            <p className="text-sm text-gray-500">{error.message}</p>
        </motion.div>
    );
    
    if (!organizationData?.[0]) return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-4"
        >
            <div className="p-4 bg-gray-100 rounded-full">
                <Building2 className="h-8 w-8" />
            </div>
            <p className="text-lg font-medium">No organization data found</p>
            <p className="text-sm">Please check your connection and try again</p>
        </motion.div>
    );

    const org = organizationData[0];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-blue-900 mb-2"
                >
                    Organization Overview
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-blue-600 text-lg"
                >
                    Essential Information Dashboard
                </motion.p>
            </div>

            {/* Main Organization Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100"
            >
                {/* Organization Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">{org.organizationName || 'Ashok Leyland Limited'}</h2>
                                <p className="text-blue-100 text-lg">{org.description || 'Ashok Leyland'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                <span className="text-sm font-medium">Status</span>
                                <div className="text-xl font-bold">
                                    {org.isActive === 1 ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization Details Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* Employee Statistics */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Employee Count</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Company Employees</span>
                                    <span className="font-bold text-blue-900">{org.totalCompanyEmployees || 5}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Contract Employees</span>
                                    <span className="font-bold text-blue-900">{org.totalContractEmployees || 2000}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700">Contractors</span>
                                    <span className="font-bold text-blue-900">{org.totalContractors || 1}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Organization Details */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Organization Info</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-blue-700 text-sm">Organization Code</span>
                                    <div className="font-bold text-blue-900">{org.organizationCode || 'Midhani'}</div>
                                </div>
                                <div>
                                    <span className="text-blue-700 text-sm">Tenant Code</span>
                                    <div className="font-bold text-blue-900">{org.tenantCode || 'Midhani'}</div>
                                </div>
                                <div>
                                    <span className="text-blue-700 text-sm">Registration No</span>
                                    <div className="font-bold text-blue-900">{org.registrationNo || '3534646457457'}</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Contact Details</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-900 font-medium">{org.emailId || 'd@d.com'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-900 font-medium">{org.contactPersonContactNumber || '3456564'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Financial Information */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Financial Year</h3>
                            </div>
                            <div>
                                <span className="text-blue-700 text-sm">First Month</span>
                                <div className="font-bold text-blue-900 text-2xl">{org.firstMonthOfFinancialYear || 1}</div>
                                <span className="text-blue-600 text-sm">January</span>
                            </div>
                        </motion.div>

                        {/* Address Information */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Address</h3>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-blue-700 text-sm">Address Line 1</span>
                                    <div className="font-medium text-blue-900">{org.addressLine1 || 'Not specified'}</div>
                                </div>
                                <div>
                                    <span className="text-blue-700 text-sm">Address Line 2</span>
                                    <div className="font-medium text-blue-900">{org.addressLine2 || 'Not specified'}</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Logo Information */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-blue-900">Brand Assets</h3>
                            </div>
                            <div>
                                <span className="text-blue-700 text-sm">Logo File</span>
                                <div className="font-medium text-blue-900 text-xs break-all">
                                    {org.logoFileName || 'bb31b165-26ec-4ff0-8580-dfb7520beb37.png'}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
