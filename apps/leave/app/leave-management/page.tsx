"use client"

import React, { useEffect, useState } from "react"
import { Calendar, Clock, Plus, TrendingUp, User, Bell, Settings, LogOut, RefreshCw, CheckCircle, DollarSign, Wallet } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Badge } from "@repo/ui/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { NewRequestPage } from "./components/new-request-page"
import { TimeOffBalancePage } from "./components/time-off-balance-page"
import { EncashmentManagementPage } from "./components/encashment-management-page"
import ViewLeaveApplied from "./components/viewLeaveapplied"
import ViewLeaveOfAbsence from "./components/viewLeaveOfAbsence"
import ManagerApprovals from "./components/managerApprovals"
import { useLeaveBalances } from "../../hooks/useLeaveBalances"
import { useLeaveApplications } from "../../hooks/useLeaveApplications"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRequest } from "@repo/ui/hooks/api/useGetRequest";


export default function LeaveDashboard() {

    



    const [selectedTimeOffType, setSelectedTimeOffType] = useState("vacation")
    const [currentPage, setCurrentPage] = useState("dashboard")

    // Use the leave balances hook
    const { 
        balanceData: timeOffBalances, 
        loading, 
        error, 
        lastUpdated,
        updateBalanceData,
        setErrorState,
        setLoadingState
    } = useLeaveBalances()

    // API call for leave balance data
    const {
        data: leaveBalanceResponse,
        loading: isLoadingLeaveBalance,
        error: leaveBalanceError,
        refetch: fetchLeaveBalance
    } = useRequest<any>({
        url: 'leaveBalance/search',
        method: 'POST',
        data: [
            {
                field: "tenantCode",
                operator: "eq",
                value: "Midhani"
            },
        ],
        onSuccess: (data: any) => {
            console.log("Leave balance data:", data)
            updateBalanceData(data)
        },
        onError: (error: Error) => {
            console.error("Error fetching leave balance data:", error);
            setErrorState(error.message)
        },
        dependencies: []
    });

    useEffect(() => {
        setLoadingState(true)
        fetchLeaveBalance()
    }, [])

    // Update loading state based on API call
    useEffect(() => {
        setLoadingState(isLoadingLeaveBalance)
    }, [isLoadingLeaveBalance])
    
    // Use the leave applications hook
    const { 
        applicationsData: leaveApplications, 
        loading: applicationsLoading, 
        error: applicationsError, 
        lastUpdated: applicationsLastUpdated, 
        updateApplicationsData, 
        setLoadingState: setApplicationsLoadingState, 
        setErrorState: setApplicationsErrorState 
    } = useLeaveApplications()

    // API call for leave applications data
    const {
        data: leaveApplicationsResponse,
        loading: isLoadingLeaveApplications,
        error: leaveApplicationsError,
        refetch: fetchLeaveApplications
    } = useRequest<any>({
        url: 'leaveApplication/search',
        method: 'POST',
        data: [
            {
                field: "tenantCode",
                operator: "eq",
                value: "Midhani"
            },
        ],
        onSuccess: (data: any) => {
            console.log("Leave applications data:", data)
            updateApplicationsData(data)
        },
        onError: (error: Error) => {
            console.error("Error fetching leave applications data:", error);
            setApplicationsErrorState(error.message)
        },
        dependencies: []
    });

    useEffect(() => {
        setApplicationsLoadingState(true)
        fetchLeaveApplications()
    }, [])

    // Update loading state based on API call
    useEffect(() => {
        setApplicationsLoadingState(isLoadingLeaveApplications)
    }, [isLoadingLeaveApplications])

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        try {
            // Handle dd-mm-yyyy format (like "18-06-2025")
            if (dateString.includes('-') && dateString.split('-').length === 3) {
                const [day, month, year] = dateString.split('-')
                return `${day}/${month}/${year}`
            }
            
            // Handle ISO date strings or other formats
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return dateString
            }
            
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch {
            return dateString
        }
    }

    // Helper function to get leave summary
    const getLeaveSummary = (leaves: any[] | undefined) => {
        if (!leaves || leaves.length === 0) return 'No leaves';
        
        // Map leave codes to full names
        const leaveCodeMap: Record<string, string> = {
            'CL': 'Casual Leave',
            'SL': 'Sick Leave',
            'EL': 'Earned Leave',
            'PL': 'Privilege Leave',
            'ML': 'Maternity Leave',
            'AL': 'Annual Leave',
            'HL': 'Half Day Leave',
            'LOP': 'Loss of Pay'
        };
        
        const leaveTypes = leaves.reduce((acc: any, leave: any) => {
            const code = leave.leaveCode || 'Unknown';
            acc[code] = (acc[code] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return Object.entries(leaveTypes)
            .map(([code, count]) => {
                const leaveName = leaveCodeMap[code] || code;
                return `${count} ${leaveName}`;
            })
            .join(', ')
    }

    // Transform leave applications data for Recent Requests
    const recentRequests = leaveApplications.slice(0, 3).map((app, index) => ({
        id: app._id || index,
        type: getLeaveSummary(app.leaves),
        dates: `${formatDate(app.fromDate)} - ${formatDate(app.toDate)}`,
        status: app.workflowState || 'Unknown',
        days: app.leaves?.length || 0
    }))

    if (currentPage === "new-request") {
        return <NewRequestPage onBack={() => setCurrentPage("dashboard")} />
    }

    if (currentPage === "balances") {
        return <TimeOffBalancePage onBack={() => setCurrentPage("dashboard")} />
    }

    if (currentPage === "encashment") {
        return <EncashmentManagementPage onBack={() => setCurrentPage("dashboard")} />
    }

    if (currentPage === "view-requests") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ViewLeaveApplied onBack={() => setCurrentPage("dashboard")} />
                </main>
            </div>
        )
    }

    if (currentPage === "view-leave-of-absence") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ViewLeaveOfAbsence onBack={() => setCurrentPage("dashboard")} />
                </main>
            </div>
        )
    }

    if (currentPage === "manager-approvals") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ManagerApprovals onBack={() => setCurrentPage("dashboard")} />
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            {/* Header */}
            <header className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-900">Leave Management</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon">
                                <Bell className="h-5 w-5" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="" alt="User" />
                                            <AvatarFallback>PN</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">Prajwal N</p>
                                            <p className="text-xs leading-none text-muted-foreground">prajwal.n@company.com</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, Prajwal!</h2>
                    <p className="text-sm text-slate-600">Manage your time off and view your leave balances</p>
                </div>

                {/* Main Action Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    {/* Manage Absence Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col h-64">
                        <CardHeader className="pb-4 flex-shrink-0">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <CardTitle className="text-xl font-bold">Manage Absence</CardTitle>
                                    <Calendar className="h-7 w-7 text-blue-200" />
                                </div>
                                <CardDescription className="text-sm text-blue-100">
                                    Request time off, view pending requests, and manage your leave applications
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-blue-300 text-white hover:bg-blue-600 bg-transparent text-xs py-0 px-2 h-5 justify-start"
                                        onClick={() => setCurrentPage("view-requests")}
                                    >
                                        <Clock className="mr-1 h-1.5 w-1.5" />
                                        View Time Away Requests
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-blue-300 text-white hover:bg-blue-600 bg-transparent text-xs py-0 px-2 h-5 justify-start"
                                        onClick={() => setCurrentPage("view-leave-of-absence")}
                                    >
                                        <Calendar className="mr-1 h-1.5 w-1.5" />
                                        View Leave Absence Requests
                                    </Button>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                                    onClick={() => setCurrentPage("new-request")}
                                >
                                    New Request
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                    </Card>

                    {/* Time Off Balance Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex flex-col h-64">
                        <CardHeader className="pb-4 flex-shrink-0">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <CardTitle className="text-xl font-bold">Time Off Balance</CardTitle>
                                    <TrendingUp className="h-7 w-7 text-emerald-200" />
                                </div>
                                <CardDescription className="text-sm text-emerald-100">
                                    View your available leave balances and usage summary
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold flex-1"
                                    onClick={() => setCurrentPage("balances")}
                                >
                                    View Balances
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                    </Card>

                    {/* Encashment Management Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white flex flex-col h-64">
                        <CardHeader className="pb-4 flex-shrink-0">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <CardTitle className="text-xl font-bold">Leave Encashment</CardTitle>
                                    <Wallet className="h-7 w-7 text-purple-200" />
                                </div>
                                <CardDescription className="text-sm text-purple-100">
                                    Convert unused leave days to cash and manage encashment requests
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    className="bg-white text-purple-600 hover:bg-purple-50 font-semibold flex-1"
                                    onClick={() => setCurrentPage("encashment")}
                                >
                                    New Encashment
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                    </Card>

                    {/* Approval Request Card */}
                    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-600 to-orange-700 text-white flex flex-col h-64">
                        <CardHeader className="pb-4 flex-shrink-0">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <CardTitle className="text-xl font-bold">Approval Request</CardTitle>
                                    <CheckCircle className="h-7 w-7 text-orange-200" />
                                </div>
                                <CardDescription className="text-sm text-orange-100">
                                    Review and approve pending leave requests from your team members
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    size="lg"
                                    className="bg-white text-orange-600 hover:bg-orange-50 font-semibold flex-1"
                                    onClick={() => setCurrentPage("manager-approvals")}
                                >
                                    Awaiting Approvals
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                    </Card>
                </div>

                {/* Time Off Balances Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Balance Cards */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Your Leave Balances</h3>
                            <div className="flex items-center space-x-2">
                                {lastUpdated && (
                                    <span className="text-xs text-slate-500">
                                        Last updated: {lastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchLeaveBalance}
                                    disabled={loading}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                        
                        {error && (
                            <Card className="border-red-200 bg-red-50 mb-4">
                                <CardContent className="p-4">
                                    <p className="text-sm text-red-600">Error loading balances: {error}</p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((index) => (
                                    <Card key={index} className="border-0 shadow-md">
                                        <CardContent className="p-6">
                                            <div className="animate-pulse">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="h-5 bg-slate-200 rounded w-28"></div>
                                                    <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                                                        <div className="h-6 bg-slate-200 rounded w-16"></div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                                                        <div className="h-4 bg-slate-200 rounded w-14"></div>
                                                    </div>
                                                    <div className="pt-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="h-3 bg-slate-200 rounded w-16"></div>
                                                            <div className="h-3 bg-slate-200 rounded w-20"></div>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-3"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {timeOffBalances.map((balance, index) => (
                                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-base font-semibold text-slate-900">{balance.type}</h4>
                                                <div className={`w-4 h-4 rounded-full ${balance.color}`}></div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600 font-medium">Available</span>
                                                    <span className="text-lg font-bold text-slate-900">{balance.balance} days</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600 font-medium">Used</span>
                                                    <span className="text-sm font-semibold text-slate-700">{balance.used} days</span>
                                                </div>
                                                <div className="pt-2">
                                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                                        <span>Total: {balance.total} days</span>
                                                        <span>{Math.round((balance.balance / balance.total) * 100)}% remaining</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className={`h-3 rounded-full ${balance.color} transition-all duration-300`}
                                                            style={{ 
                                                                width: `${Math.min((balance.balance / balance.total) * 100, 100)}%`,
                                                                maxWidth: '100%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Requests */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Recent Requests</h3>
                            <div className="flex items-center space-x-2">
                                {applicationsLastUpdated && (
                                    <span className="text-xs text-slate-500">
                                        Last updated: {applicationsLastUpdated.toLocaleTimeString()}
                                    </span>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={fetchLeaveApplications}
                                    disabled={applicationsLoading}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                            <CardContent className="p-6">
                                {applicationsError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">Error loading requests: {applicationsError}</p>
                                    </div>
                                )}
                                
                                {applicationsLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((index) => (
                                            <div key={index} className="flex items-start justify-between p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100/50">
                                                <div className="flex-1 min-w-0">
                                                    <div className="animate-pulse">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                                                            <div className="h-4 bg-blue-200 rounded-lg w-24"></div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                                                                <div className="h-3 bg-blue-200 rounded-lg w-32"></div>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
                                                                <div className="h-3 bg-blue-200 rounded-lg w-16"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ml-4 animate-pulse">
                                                    <div className="h-7 bg-blue-200 rounded-full w-20"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentRequests.length > 0 ? (
                                            recentRequests.map((request, index) => (
                                                <div 
                                                    key={request.id} 
                                                    className="group flex items-start justify-between p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100/50 hover:bg-white/80 hover:border-blue-200/70 hover:shadow-md transition-all duration-300 cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.8) 100%)`,
                                                    }}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{request.type}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center text-xs text-slate-600">
                                                                <Calendar className="h-3 w-3 mr-2 text-blue-500 flex-shrink-0" />
                                                                <span className="truncate">{request.dates}</span>
                                                            </div>
                                                            <div className="flex items-center text-xs text-slate-500">
                                                                <Clock className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0" />
                                                                <span>{request.days} day{request.days > 1 ? "s" : ""}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                                                px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all duration-300 whitespace-nowrap
                                                                ${request.status === "APPROVED"
                                                                    ? "bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100 group-hover:border-green-300"
                                                                    : request.status === "INITIATED"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300"
                                                                    : request.status === "REJECTED"
                                                                    ? "bg-red-50 text-red-700 border-red-200 group-hover:bg-red-100 group-hover:border-red-300"
                                                                    : "bg-slate-50 text-slate-700 border-slate-200 group-hover:bg-slate-100 group-hover:border-slate-300"
                                                                }
                                                            `}
                                                        >
                                                            {request.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Calendar className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <p className="text-sm text-slate-500 mb-2">No recent requests found</p>
                                                <p className="text-xs text-slate-400">Your leave requests will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <Button 
                                    variant="outline" 
                                    className="w-full mt-6 bg-white/80 border-blue-200 text-blue-700 hover:bg-white hover:border-blue-300 hover:text-blue-800 transition-all duration-300 font-medium"
                                    onClick={() => setCurrentPage("view-requests")}
                                >
                                    <Clock className="mr-2 h-4 w-4" />
                                    View All Requests
                                </Button>
                            </CardContent>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full opacity-20 -translate-y-12 translate-x-12"></div>
                        </Card>
                    </div>
                </div>

           
            </main>
        </div>
    )
}
