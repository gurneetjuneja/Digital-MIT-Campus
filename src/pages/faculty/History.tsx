import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import Header from '../../components/common/Header';
import GatePassTable from '../../components/common/GatePassTable';
import { useGatePass } from '../../contexts/GatePassContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const FacultyHistory: React.FC = () => {
    const { currentUser } = useAuth();
    const { gatePasses } = useGatePass();
    const navigate = useNavigate();

    // Show all gate passes without department filtering
    const [filteredPasses, setFilteredPasses] = useState(gatePasses);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    useEffect(() => {
        let filtered = [...gatePasses];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(pass =>
                pass.passNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pass.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pass.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pass.submittedBy.purpose.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply department filter
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(pass => pass.department === departmentFilter);
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(pass => {
                if (statusFilter === 'pending') {
                    return pass.currentStage === 'facultyApproval' &&
                        (!pass.approvalStages?.facultyApproval?.status ||
                            pass.approvalStages.facultyApproval.status === 'pending');
                }
                if (statusFilter === 'approved') {
                    return pass.approvalStages?.facultyApproval?.status === 'approved';
                }
                if (statusFilter === 'rejected') {
                    return pass.approvalStages?.facultyApproval?.status === 'rejected';
                }
                return true;
            });
        }

        // Apply date filter
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        switch (dateFilter) {
            case 'today':
                filtered = filtered.filter(pass =>
                    format(new Date(pass.createdAt), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                );
                break;
            case 'yesterday':
                filtered = filtered.filter(pass =>
                    format(new Date(pass.createdAt), 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
                );
                break;
            case 'week':
                filtered = filtered.filter(pass =>
                    new Date(pass.createdAt) >= lastWeek
                );
                break;
            case 'month':
                filtered = filtered.filter(pass =>
                    new Date(pass.createdAt) >= lastMonth
                );
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc'
                    ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === 'status') {
                return sortOrder === 'desc'
                    ? b.status.localeCompare(a.status)
                    : a.status.localeCompare(b.status);
            }
            return 0;
        });

        setFilteredPasses(filtered);
    }, [gatePasses, searchTerm, statusFilter, dateFilter, sortBy, sortOrder, departmentFilter]);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role="faculty" />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Gate Pass History" />

                <main className="flex-1 overflow-y-auto p-4">
                    <button
                        onClick={() => navigate('/faculty')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Dashboard
                    </button>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            {/* Search */}
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search gate passes..."
                                    className="form-input pl-10 w-full"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Departments</option>
                                    {Array.from(new Set(gatePasses.map(pass => pass.department))).map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="week">Last 7 Days</option>
                                    <option value="month">Last 30 Days</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="date">Sort by Date</option>
                                    <option value="status">Sort by Status</option>
                                </select>

                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="btn btn-outline flex items-center"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>

                        <GatePassTable gatePasses={filteredPasses} userRole="faculty" />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FacultyHistory; 