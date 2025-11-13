import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import { useGatePass } from '../../contexts/GatePassContext';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { generateAnalyticsReportPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { gatePasses } = useGatePass();
    const [dateRange, setDateRange] = useState('week');
    const [department, setDepartment] = useState('all');

    const departments = Array.from(new Set(gatePasses.map(pass => pass.department)));

    const getFilteredPasses = () => {
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate = new Date(0);
        }

        return gatePasses.filter(pass => {
            const passDate = new Date(pass.createdAt);
            const matchesDate = passDate >= startDate;
            const matchesDepartment = department === 'all' || pass.department === department;
            return matchesDate && matchesDepartment;
        });
    };

    const filteredPasses = getFilteredPasses();

    const totalPasses = filteredPasses.length;
    const approvedPasses = filteredPasses.filter(pass => pass.status === 'approved').length;
    const rejectedPasses = filteredPasses.filter(pass => pass.status === 'rejected').length;
    const pendingPasses = filteredPasses.filter(pass => pass.status === 'pending').length;

    const chartData = {
        labels: ['Approved', 'Rejected', 'Pending'],
        datasets: [
            {
                label: 'Gate Passes',
                data: [approvedPasses, rejectedPasses, pendingPasses],
                backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Gate Pass Status Distribution',
            },
        },
    };

    const downloadReport = async () => {
        try {
            const reportData = {
                approvedPasses,
                rejectedPasses,
                pendingPasses,
                departmentStats: calculateDepartmentStats()
            };

            await generateAnalyticsReportPDF(reportData);
            toast.success('Report generated successfully');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        }
    };

    const calculateDepartmentStats = () => {
        const stats: { [key: string]: { total: number, approved: number, rejected: number, pending: number } } = {};

        gatePasses.forEach(pass => {
            if (!stats[pass.department]) {
                stats[pass.department] = { total: 0, approved: 0, rejected: 0, pending: 0 };
            }

            stats[pass.department].total++;
            stats[pass.department][pass.status]++;
        });

        return stats;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role="admin" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Reports" />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="flex items-center text-[#4B0082] hover:text-[#6B238E] mb-4 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                    <h2 className="text-xl md:text-2xl font-semibold text-[#4B0082]">Gate Pass Analytics</h2>
                                    <button
                                        type="button"
                                        onClick={downloadReport}
                                        className="btn btn-outline flex items-center justify-center"
                                    >
                                        <Download size={16} className="mr-2" />
                                        Download Report
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        className="form-select flex-1"
                                    >
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="year">Last Year</option>
                                        <option value="all">All Time</option>
                                    </select>

                                    <select
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="form-select flex-1"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="h-64 md:h-80">
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-[#4B0082] mb-4">Summary</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs md:text-sm text-[#6B238E]">Total Gate Passes</p>
                                        <p className="text-xl md:text-2xl font-semibold text-[#4B0082]">{totalPasses}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-[#6B238E]">Approved</p>
                                        <p className="text-xl md:text-2xl font-semibold text-green-600">{approvedPasses}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-[#6B238E]">Rejected</p>
                                        <p className="text-xl md:text-2xl font-semibold text-red-600">{rejectedPasses}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-[#6B238E]">Pending</p>
                                        <p className="text-xl md:text-2xl font-semibold text-yellow-600">{pendingPasses}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-[#4B0082] mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button type="button" className="btn btn-outline w-full justify-start">
                                        <Filter size={16} className="mr-2" />
                                        Generate Custom Report
                                    </button>
                                    <button type="button" className="btn btn-outline w-full justify-start">
                                        <Download size={16} className="mr-2" />
                                        Export All Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports; 