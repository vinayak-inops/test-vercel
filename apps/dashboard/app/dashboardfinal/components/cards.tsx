import React, { useEffect, useState } from 'react';
import { MetricCard } from './metricCard';
import { CheckCircle, XCircle, Clock, LogOut, Users, UserX } from 'lucide-react';
import GoalCard from './GoalCard';
import { useRequest } from '@repo/ui/hooks/api/useGetRequest';


interface MetricItem {
    icon: any;
    title: string;
    value: number;
    change: number;
    chartColor: string;
    attendanceType?: 'present' | 'absent' | 'lateIn' | 'earlyOut';
}

export const Cards: React.FC = () => {

    const [organizationData, setOrganizationData] = useState<any>(null);
    let [orgempcount, setOrgempcount] = useState<number>(0);
    let [insidePremisesData, setInsidePremisesData] = useState<number>(0);
    let [presentData, setPresentData] = useState<number>(0);
    let [absentData, setAbsentData] = useState<number>(0);
    let [lateInData, setLateInData] = useState<number>(0);
    let [earlyOutData, setEarlyOutData] = useState<number>(0);

    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-GB').split('/').join('-'); // "26-07-2025"

    const {
        data: organizationResponse,
        loading: organizationLoading,
        error: organizationError,
        refetch: fetchOrganization
    } = useRequest<any>({
        url: 'contract_employee/count',
        method: 'POST',
        data: [
            {
                "field": "organizationCode",
                "operator": "eq",
                "value": "Midhani"
            },
        ],
        onSuccess: (data) => {
            console.log('Organization API Response:', data);
            setOrgempcount(data);
        },
        onError: (error) => {
            console.error("Error fetching organization data:", error);
        },
        dependencies: []
    });

    const {
        data: attendanceResponse,
        loading: attendanceLoading,
        error: attendanceError,
        refetch: fetchAttendance
    } = useRequest<any>({
        url: 'muster/liveAttendance/search',
        method: 'POST',
        data: [
            {
                "field": "attendanceDate",
                "operator": "eq",
                "value": "23-07-2025"
            },
        ],
        onSuccess: (data) => {
            console.log('Attendance API Response:', data);
            setInsidePremisesData(data.filter((item: { insidePremises: boolean; }) => item.insidePremises === true).length);
            setPresentData(data.filter((item: { present: boolean; }) => item.present === true).length);
            setAbsentData(data.filter((item: { absent: boolean; }) => item.absent === true).length);
            setLateInData(data.filter((item: { lateIn: boolean; }) => item.lateIn === true).length);
            setEarlyOutData(data.filter((item: { earlyOut: boolean; }) => item.earlyOut === true).length);
        },

        onError: (error) => {
            console.error("Error fetching attendance data:", error);
        },

        dependencies: []
    });

    const metrics: MetricItem[] = [
        {
            icon: Users,
            title: 'Total Employees inside the premises',
            value: insidePremisesData,
            change: orgempcount,
            chartColor: 'bg-blue-400',
            attendanceType: undefined, // No attendance type for total employees
        },
        {
            icon: CheckCircle,
            title: 'Present',
            value: presentData,
            change: orgempcount,
            chartColor: 'bg-blue-400',
            attendanceType: 'present',
        },
        {
            icon: UserX,
            title: 'Absent',
            value: absentData,
            change: orgempcount,
            chartColor: 'bg-blue-400',
            attendanceType: 'absent',
        },
        {
            icon: Clock,
            title: 'Late In',
            value: lateInData,
            change: orgempcount,
            chartColor: 'bg-blue-400',
            attendanceType: 'lateIn',
        },
        {
            icon: LogOut,
            title: 'Early Out',
            value: earlyOutData,
            change: orgempcount,
            chartColor: 'bg-blue-400',
            attendanceType: 'earlyOut',
        },

    ];




    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Organisation Key Metrics</h2>
                    <p className="text-gray-600 text-lg">Monitor your key metrics </p>
                </div>

                {/* Main Metrics Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 ">

                    {metrics.slice(0, 5).map((metric, index) => (
                        <MetricCard
                            key={index}
                            icon={metric.icon}
                            title={metric.title}
                            value={metric.value}
                            change={metric.change}
                            chartColor={metric.chartColor}
                            cardType={index === 0 ? 'employee-table' : 'chart-data'}
                            attendanceType={metric.attendanceType}
                        />
                    ))}
                </div>

                {/* Secondary Metrics Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.slice(4, 8).map((metric, index) => (
                        <MetricCard
                            key={index + 4}
                            icon={metric.icon}
                            title={metric.title}
                            value={metric.value}
                            change={metric.change}

                        />
                    ))}
                </div> */}

                {/* Additional Info Section */}
                <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {orgempcount > 0 ? Math.round((presentData / orgempcount) * 100) : 0}%
                            </div>
                            <div className="text-gray-600">Attendance Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {orgempcount > 0 ? Math.round(((presentData - lateInData) / orgempcount) * 100) : 0}%
                            </div>
                            <div className="text-gray-600">Punctuality Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {orgempcount > 0 ? Math.round((insidePremisesData / orgempcount) * 100) : 0}%
                            </div>
                            <div className="text-gray-600">On-Premises Rate</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};